#!/usr/bin/env python3
"""Download STScI standard-star archives and prepare browser-readable spectra."""

from __future__ import annotations

import argparse
import concurrent.futures
import gzip
import html
import json
import re
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests
from astropy.io import fits
from astropy.coordinates import SkyCoord
from astropy import units as u
from bs4 import BeautifulSoup
from numpy import isfinite


ROOT = Path(__file__).resolve().parent.parent
ARCHIVES = {
    "stsci-calobs": "https://archive.stsci.edu/hlsps/reference-atlases/cdbs/calobs/",
    "stsci-calspec": "https://archive.stsci.edu/hlsps/reference-atlases/cdbs/current_calspec/",
}
IUE_ARCHIVES = {
    "stsci-iue-normal": "https://archive.stsci.edu/prepds/iuesass_web/iweb/sp.html",
    "stsci-iue-subluminous": "https://archive.stsci.edu/prepds/iuesass_web/iweb/sp_t4.html",
}
LABELS = {
    "stsci-calobs": "CALOBS calibration observations",
    "stsci-calspec": "Current CALSPEC standards",
    "stsci-iue-normal": "IUE NEWSIPS normal-star atlas",
    "stsci-iue-subluminous": "IUE NEWSIPS subluminous-star atlas",
}


def fetch(session: requests.Session, url: str) -> bytes:
    response = session.get(url, timeout=120)
    response.raise_for_status()
    return response.content


def filename_from_url(url: str) -> str:
    filename = Path(urlparse(url).path).name
    if not filename or filename != Path(filename).name:
        raise ValueError(f"Unsafe archive filename: {url}")
    return filename


def download(session: requests.Session, url: str, destination: Path) -> None:
    if destination.exists() and destination.stat().st_size:
        return
    temporary = destination.with_suffix(f"{destination.suffix}.part")
    temporary.write_bytes(fetch(session, url))
    temporary.replace(destination)


def download_gzip(session: requests.Session, url: str, destination: Path) -> None:
    if destination.exists() and destination.stat().st_size:
        return
    temporary = destination.with_suffix(f"{destination.suffix}.part")
    temporary.write_bytes(gzip.compress(fetch(session, url), compresslevel=9, mtime=0))
    temporary.replace(destination)


def fits_records(session: requests.Session, library: str, index_url: str) -> list[dict]:
    archive_html = fetch(session, index_url).decode("utf-8")
    urls = sorted(
        urljoin(index_url, anchor["href"])
        for anchor in BeautifulSoup(archive_html, "html.parser").find_all("a", href=True)
        if anchor["href"].lower().endswith(".fits")
    )
    if not urls:
        raise RuntimeError(f"No FITS files found in {index_url}")
    directory = ROOT / library
    directory.mkdir(exist_ok=True)

    def retrieve(url: str) -> str:
        filename = filename_from_url(url)
        with requests.Session() as worker_session:
            download(worker_session, url, directory / filename)
        return filename

    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
        filenames = list(executor.map(retrieve, urls))

    return [
        {
            "filename": filename,
            "file": f"{library}/{Path(filename).with_suffix('.dat').name}",
            "raw_file": f"{library}/{Path(filename).with_suffix('.dat.gz').name}",
            "aliases": aliases_from_fits_filename(Path(filename).stem),
            "coordinate": None,
            "kind": "flux-density",
        }
        for filename in filenames
    ]


def aliases_from_fits_filename(stem: str) -> list[str]:
    aliases = [stem]
    without_version = re.sub(r"_\d{3}$", "", stem)
    aliases.append(without_version)
    aliases.append(re.sub(r"_(?:mod|stis(?:wfc)?(?:nic)?|nic|wfc).*$", "", without_version))
    return sorted({normalise(alias) for alias in aliases if normalise(alias)})


def normalise(value: str) -> str:
    return re.sub(r"\s+", "", value).lower()


def iue_records(session: requests.Session, library: str, index_url: str) -> tuple[list[dict], list[dict]]:
    atlas_html = fetch(session, index_url).decode("utf-8")
    target_urls = sorted(
        urljoin(index_url, anchor["href"])
        for anchor in BeautifulSoup(atlas_html, "html.parser").find_all("a", href=True)
        if re.fullmatch(r"(?:[A-Z]|T4)/[^/]+\.html", anchor["href"])
    )
    if not target_urls:
        raise RuntimeError(f"No target pages found in {index_url}")

    directory = ROOT / library
    directory.mkdir(exist_ok=True)

    def target_records(url: str) -> tuple[list[dict], list[dict]]:
        try:
            target_html = fetch(session, url).decode("utf-8")
        except requests.RequestException as error:
            return [], [{
                "library": library,
                "target": normalise(Path(urlparse(url).path).stem),
                "url": url,
                "error": str(error),
            }]
        soup = BeautifulSoup(target_html, "html.parser")
        target = normalise(soup.title.get_text(strip=True) if soup.title else Path(urlparse(url).path).stem)
        text = soup.get_text(" ", strip=True)
        coordinate = coordinate_from_iue_page(text)
        records = []
        errors = []
        for anchor in soup.find_all("a", href=True):
            if not anchor["href"].lower().endswith(".dat"):
                continue
            data_url = urljoin(url, anchor["href"])
            data_filename = filename_from_url(data_url)
            local_filename = f"{target}__{data_filename}"
            try:
                with requests.Session() as worker_session:
                    download_gzip(worker_session, data_url, directory / f"{local_filename}.gz")
            except requests.RequestException as error:
                errors.append({"library": library, "target": target, "url": data_url, "error": str(error)})
                continue
            records.append(
                {
                    "filename": local_filename,
                    "file": f"{library}/{local_filename}",
                    "raw_file": f"{library}/{local_filename}.gz",
                    "aliases": [target],
                    "coordinate": coordinate,
                    "kind": "flux-density",
                }
            )
        return records, errors

    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
        results = list(executor.map(target_records, target_urls))
    return (
        [record for records, _ in results for record in records],
        [error for _, errors in results for error in errors],
    )


def coordinate_from_iue_page(text: str) -> list[float] | None:
    match = re.search(r"\b(\d{1,2}):(\d{2}):(\d{2}(?:\.\d+)?)\s+([+-]?\d{1,2}):(\d{2}):(\d{2})", text)
    if not match:
        return None
    hour, minute, second, degree, arcminute, arcsecond = match.groups()
    right_ascension = 15 * (float(hour) + float(minute) / 60 + float(second) / 3600)
    sign = -1 if degree.startswith("-") else 1
    declination = sign * (abs(float(degree)) + float(arcminute) / 60 + float(arcsecond) / 3600)
    coordinate = SkyCoord(
        ra=right_ascension * u.deg,
        dec=declination * u.deg,
        frame="fk4",
        equinox="B1950",
    ).fk5
    return [coordinate.ra.deg, coordinate.dec.deg]


def convert_fits(record: dict) -> str | None:
    raw_path = ROOT / record["raw_file"].replace(".dat.gz", ".fits")
    output_path = ROOT / f"{record['file']}.gz"
    if output_path.exists() and output_path.stat().st_mtime >= raw_path.stat().st_mtime:
        return None
    with fits.open(raw_path, memmap=True) as hdus:
        for hdu in hdus:
            columns = getattr(hdu, "columns", None)
            names = {name.upper(): name for name in columns.names} if columns else {}
            wavelength = names.get("WAVELENGTH") or names.get("WAVE")
            flux = names.get("FLUX") or names.get("FLAM")
            if wavelength and flux:
                data = hdu.data
                break
        else:
            return f"No wavelength/flux table in {raw_path}"
        values = zip(data[wavelength], data[flux])
        temporary = output_path.with_suffix(".gz.part")
        with temporary.open("wb") as compressed_file:
            with gzip.GzipFile(fileobj=compressed_file, mode="wb", compresslevel=9, mtime=0) as binary_output:
                for value_wavelength, value_flux in values:
                    if isfinite(value_wavelength) and isfinite(value_flux):
                        binary_output.write(f"{value_wavelength:.9g} {value_flux:.9g}\n".encode("ascii"))
        temporary.replace(output_path)
    raw_path.unlink()
    return None


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--skip-download", action="store_true", help="Reuse existing archive files.")
    arguments = parser.parse_args()
    with requests.Session() as session:
        if arguments.skip_download:
            records = {}
            for library in ARCHIVES:
                records[library] = [
                    {
                        "filename": path.name,
                        "file": f"{library}/{path.with_suffix('').with_suffix('.dat').name}",
                        "raw_file": f"{library}/{path.name}",
                        "aliases": aliases_from_fits_filename(path.stem),
                        "coordinate": None,
                        "kind": "flux-density",
                    }
                    for path in sorted((ROOT / library).glob("*.fits.gz"))
                ]
            for library in IUE_ARCHIVES:
                records[library] = [
                    {
                        "filename": path.name,
                        "file": f"{library}/{path.with_suffix('').name}",
                        "raw_file": f"{library}/{path.name}",
                        "aliases": [normalise(path.name.split("__", 1)[0])],
                        "coordinate": None,
                        "kind": "flux-density",
                    }
                    for path in sorted((ROOT / library).glob("*.dat.gz"))
                ]
            download_errors = []
        else:
            records = {
                **{library: fits_records(session, library, url) for library, url in ARCHIVES.items()},
            }
            iue_results = {
                library: iue_records(session, library, url) for library, url in IUE_ARCHIVES.items()
            }
            records.update({library: entries for library, (entries, _) in iue_results.items()})
            download_errors = [error for _, (_, errors) in iue_results.items() for error in errors]

    fits_to_convert = [
        record for library in ARCHIVES for record in records[library]
    ]
    conversion_errors = []
    for record in fits_to_convert:
        error = convert_fits(record)
        if error:
            conversion_errors.append({"library": record["raw_file"].split("/", 1)[0], "raw_file": record["raw_file"], "error": error})
    for error in conversion_errors:
        records[error["library"]] = [
            record for record in records[error["library"]] if record["raw_file"] != error["raw_file"]
        ]
    metadata = {
        "group": "STScI",
        "source": "https://archive.stsci.edu/",
        "libraries": {
            library: {"label": LABELS[library], "spectra": entries}
            for library, entries in records.items()
        },
    }
    (ROOT / "stsci-library-metadata.json").write_text(f"{json.dumps(metadata)}\n", encoding="utf-8")
    all_errors = download_errors + conversion_errors
    (ROOT / "stsci-download-errors.json").write_text(f"{json.dumps(all_errors, indent=2)}\n", encoding="utf-8")
    print(
        "Downloaded and indexed "
        + ", ".join(f"{library}: {len(entries)} spectra" for library, entries in records.items())
    )
    if all_errors:
        raise RuntimeError(f"{len(all_errors)} STScI resources were unavailable or non-plottable; see stsci-download-errors.json")


if __name__ == "__main__":
    main()
