# SpectroscopicStandards

Choosing a spectroscopic standard star is a routine procedure in spectroscopic observations. Some of these stars were adopted well before the digital age when the sharing, comparing and visulising information were not trieval tasks. In this webpage, we provide a minimally interative web tool for visualising all the standard stars available from [ESO](https://eso.org/sci/observing/tools/standards.html), [ING](https://www.ing.iac.es//Astronomy/observing/manuals/html_manuals/tech_notes/tn065-100/workflux.html) and [iraf](https://github.com/iraf-community/iraf/tree/main/noao/lib/onedstds).

The webpage generated from the scripts in this repository can be found at:
<https://cylammarco.github.io/SpectroscopicStandards/>

![alt text](https://github.com/cylammarco/SpectroscopicStandards/blob/main/screenshot-preview.png?raw=true)

If you have made use of this tool, we would appreciate if you could reference <https://zenodo.org/record/7978970>.

## Web data

The viewer uses `spectra-index.json` for designation, provider, coordinate, and
download metadata. It is built directly from each file's aliases, so multiple
spectra in one provider folder are retained for comparison.

Run the following from the repository root after adding or changing spectra:

```bash
node scripts/build-web-data.mjs
```

This writes a compressed index and `.gz` copy of every plain-text spectrum. The
browser loads these gzip assets where `DecompressionStream` is available and
falls back to the original text file otherwise. Original files remain in place
for the download links in the interface.
