# SpectroscopicStandards

SpectroscopicStandards is a browser-based viewer for spectrophotometric standard-star spectra from the ESO, ING, IRAF, and STScI catalogues. Search by designation, browse each provider folder, compare available spectra, inspect a finder chart, and download the original data files (only the compressed ones are retained in this repository).

The **Target visibility** plot is adjusted for the timezone and daylight saving automatically from selected location and date, Although, please be careful with the time on the night of daylight saving.

The webpage generated from the scripts in this repository can be found at:
<https://cylammarco.github.io/SpectroscopicStandards/>

![Sources and citations view, showing one citation row for every ESO, ING, and IRAF data folder](screenshot-preview.png)

If you have made use of this tool, we would appreciate if you could reference <https://zenodo.org/record/7978970>.

In version 0.2 (10 August 2026), we have made use of ChatGPT 5.6 Terra.

## Web data

The viewer uses `spectra-index.json` for designation, provider, coordinate, and
download metadata. It is built directly from each file's aliases, so multiple
spectra in one provider folder are retained for comparison.

The browser starts catalogue loading before the optional Plotly and Aladin
third-party scripts finish downloading, so catalogue search is not delayed by
those visualisation services.

When changing source files or aliases, first regenerate the two committed metadata inputs:

```bash
python generate_dictionary.py
```

Then rebuild the browser index and compressed spectrum assets:

```bash
node scripts/build-web-data.mjs
```
