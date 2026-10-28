#!/usr/bin/env node

/**
 * Create browser lookup data and gzip copies of text spectra.
 *
 * Run from repository root:
 *   node scripts/build-web-data.mjs
 *
 * The viewer fetches the gzip files where the browser supports
 * DecompressionStream, and transparently falls back to the plain-text source.
 */
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const root = process.cwd();

const libraryGroups = {
  ESO: ["esoxshooter", "esowdstan", "esohststan", "esookestan", "esoctiostan"],
  ING: ["ingoke", "ingmas", "ingog", "ingsto", "ingfg"],
  IRAF: [
    "irafctionewcal",
    "irafspec16cal",
    "irafctiocal",
    "irafiidscal",
    "irafredcal",
    "irafbstdscal",
    "irafirscal",
    "irafspec50cal",
    "irafoke1990",
    "irafspechayescal",
    "irafblackbody",
  ],
  STScI: ["stsci-calobs", "stsci-calspec", "stsci-iue-normal", "stsci-iue-subluminous"],
};

const libraryLabels = {
  esoxshooter: "X-shooter standards",
  esowdstan: "White dwarf standards",
  esohststan: "HST standards",
  esookestan: "Oke standards",
  esoctiostan: "CTIO standards",
  ingoke: "Oke standards",
  ingmas: "Massey standards",
  ingog: "Oke-Gunn standards",
  ingsto: "Stone standards",
  ingfg: "Filippenko-Gunn standards",
  irafctionewcal: "CTIO new calibration",
  irafspec16cal: "Spectrophotometric standards",
  irafctiocal: "CTIO calibration",
  irafiidscal: "IID standards",
  irafredcal: "Red calibration",
  irafbstdscal: "B-star calibration",
  irafirscal: "IR standards",
  irafspec50cal: "50 Å standards",
  irafoke1990: "Oke 1990 standards",
  irafspechayescal: "Hayes standards",
  irafblackbody: "Blackbody band responses",
  "stsci-calobs": "CALOBS calibration observations",
  "stsci-calspec": "Current CALSPEC standards",
  "stsci-iue-normal": "IUE NEWSIPS normal-star atlas",
  "stsci-iue-subluminous": "IUE NEWSIPS subluminous-star atlas",
};

const sourceUrls = {
  ESO: "https://eso.org/sci/observing/tools/standards.html",
  ING: "https://www.ing.iac.es//Astronomy/observing/manuals/html_manuals/tech_notes/tn065-100/workflux.html",
  IRAF: "https://github.com/iraf-community/iraf/tree/main/noao/lib/onedstds",
  STScI: "https://archive.stsci.edu/",
};

const ingExtensions = {
  ingfg: "fg",
  ingmas: "mas",
  ingog: "og",
  ingoke: "oke",
  ingsto: "sto",
};

function sourcePath(library, filename) {
  if (library.startsWith("stsci-")) return `${library}/${filename}`;
  if (library === "esoxshooter") return `${library}/f${filename}.dat`;
  if (library.startsWith("eso")) return `${library}/f${filename}.dat`;
  if (library === "irafblackbody") return `${library}/${filename.toLowerCase()}.dat`;
  if (library.startsWith("iraf")) return `${library}/${filename}.dat`;

  const correctedName = ["h102", "g157", "g24"].includes(filename)
    ? `${filename}a`
    : filename;
  return `${library}/${correctedName}.${ingExtensions[library]}`;
}

async function readJson(filename) {
  return JSON.parse(await readFile(join(root, filename), "utf8"));
}

const [localLibraryToFilenames, filenameMetadata, stsciMetadata] = await Promise.all([
  readJson("lib_to_filename.json"),
  readJson("lib_filename_to_designation_position.json"),
  readJson("stsci-library-metadata.json"),
]);
const libraryToFilenames = {
  ...localLibraryToFilenames,
  ...Object.fromEntries(
    Object.entries(stsciMetadata.libraries).map(([library, details]) => [
      library,
      details.spectra.map((spectrum) => spectrum.filename),
    ]),
  ),
};

const groupForLibrary = Object.fromEntries(
  Object.entries(libraryGroups).flatMap(([group, libraries]) =>
    libraries.map((library) => [library, group]),
  ),
);

const spectra = {};
const missingSources = [];
for (const [library, filenames] of Object.entries(libraryToFilenames)) {
  const group = groupForLibrary[library];
  if (!group) throw new Error(`No provider group set for ${library}`);

  for (const filename of filenames) {
    const id = `${library}/${filename}`;
    const externalSpectrum = stsciMetadata.libraries[library]?.spectra.find((spectrum) => spectrum.filename === filename);
    const file = externalSpectrum?.file || sourcePath(library, filename);
    if (!existsSync(join(root, `${file}.gz`))) {
      missingSources.push(`${id} (${file}.gz)`);
      continue;
    }
    const matches = externalSpectrum
      ? externalSpectrum.aliases.map((alias) => [alias, ...(externalSpectrum.coordinate || [])])
      : filenameMetadata[id] || [];
    spectra[id] = {
      id,
      library,
      group,
      filename,
      file,
      rawFile: externalSpectrum?.raw_file || `${file}.gz`,
      aliases: [...new Set(matches.map(([name]) => name))],
      coordinate: externalSpectrum ? externalSpectrum.coordinate : (matches.length ? matches[0].slice(1) : null),
      kind: externalSpectrum?.kind || (library === "irafblackbody" ? "relative-response" : "flux-density"),
    };
  }
}

// Build this reverse index from every source-file alias, rather than the legacy
// designation-to-library map. The latter has one filename slot per library and
// silently drops valid blue/red or repeated spectra for the same target.
const designations = {};
for (const spectrum of Object.values(spectra)) {
  for (const designation of spectrum.aliases) {
    if (!designations[designation]) {
      designations[designation] = { spectra: [], coordinate: spectrum.coordinate };
    }
    designations[designation].spectra.push(spectrum.id);
    const coordinate = designations[designation].coordinate;
    if ((!coordinate || (coordinate[0] === 0 && coordinate[1] === 0)) && spectrum.coordinate) {
      designations[designation].coordinate = spectrum.coordinate;
    }
  }
}

for (const spectrum of Object.values(spectra)) {
  spectrum.target = spectrum.aliases
    .filter((alias) => designations[alias])
    .sort((a, b) => designations[b].spectra.length - designations[a].spectra.length)[0] || null;
}

const index = {
  version: 2,
  groups: Object.fromEntries(
    Object.entries(libraryGroups).map(([group, libraries]) => [
      group,
      { source: sourceUrls[group], libraries },
    ]),
  ),
  libraries: Object.fromEntries(
    Object.keys(libraryToFilenames).map((library) => [
      library,
      {
        group: groupForLibrary[library],
        label: libraryLabels[library] || library,
        spectra: libraryToFilenames[library].map((filename) => `${library}/${filename}`),
      },
    ]),
  ),
  spectra,
  designations,
};

const indexText = `${JSON.stringify(index)}\n`;
await writeFile(join(root, "spectra-index.json"), indexText);
await writeFile(join(root, "spectra-index.json.gz"), gzipSync(indexText, { level: 9 }));

console.log(
  `Wrote spectra-index.json (${Object.keys(spectra).length} spectra, ${Object.keys(designations).length} designations).`,
);
if (missingSources.length) console.warn(`Skipped missing catalogued source files: ${missingSources.join(", ")}`);
