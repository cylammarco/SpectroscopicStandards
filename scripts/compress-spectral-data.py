#!/usr/bin/env python3
"""Keep a single gzip-compressed payload for every hosted spectrum."""

from __future__ import annotations

import gzip
import hashlib
import json
import os
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
TEXT_EXTENSIONS = {".dat", ".fg", ".mas", ".og", ".oke", ".sto"}


def same_contents(left: Path, right: Path) -> bool:
    digest = hashlib.sha256()
    with left.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    left_digest = digest.digest()
    digest = hashlib.sha256()
    with gzip.open(right, "rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return left_digest == digest.digest()


def write_gzip(source: Path, destination: Path) -> None:
    temporary = destination.with_suffix(f"{destination.suffix}.part")
    with source.open("rb") as input_file, temporary.open("wb") as compressed_file:
        with gzip.GzipFile(fileobj=compressed_file, mode="wb", compresslevel=9, mtime=0) as output_file:
            for chunk in iter(lambda: input_file.read(1024 * 1024), b""):
                output_file.write(chunk)
    if not same_contents(source, temporary):
        temporary.unlink(missing_ok=True)
        raise RuntimeError(f"Compression verification failed for {source}")
    temporary.replace(destination)


def main() -> None:
    removed = 0
    compressed = 0
    for source in sorted(ROOT.rglob("*")):
        if not source.is_file() or source.suffix not in TEXT_EXTENSIONS | {".fits"}:
            continue
        gzip_path = source.with_suffix(f"{source.suffix}.gz")
        rendered_gzip = source.with_suffix(".dat.gz") if source.suffix == ".fits" else None
        if rendered_gzip and rendered_gzip.exists():
            source.unlink()
            removed += 1
            continue
        if gzip_path.exists():
            if not same_contents(source, gzip_path):
                raise RuntimeError(f"Existing gzip does not match {source}")
            source.unlink()
            removed += 1
            continue
        write_gzip(source, gzip_path)
        source.unlink()
        compressed += 1
    metadata_path = ROOT / "stsci-library-metadata.json"
    if metadata_path.exists():
        metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
        for library in metadata["libraries"].values():
            for spectrum in library["spectra"]:
                compressed_rendered_file = ROOT / f"{spectrum['file']}.gz"
                if compressed_rendered_file.exists():
                    spectrum["raw_file"] = f"{spectrum['file']}.gz"
        metadata_path.write_text(f"{json.dumps(metadata)}\n", encoding="utf-8")
    print(f"Compressed {compressed} files and removed {removed} duplicate uncompressed files.")


if __name__ == "__main__":
    main()
