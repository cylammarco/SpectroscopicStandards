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
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
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
};

const sourceUrls = {
  ESO: "https://eso.org/sci/observing/tools/standards.html",
  ING: "https://www.ing.iac.es//Astronomy/observing/manuals/html_manuals/tech_notes/tn065-100/workflux.html",
  IRAF: "https://github.com/iraf-community/iraf/tree/main/noao/lib/onedstds",
};

const ingExtensions = {
  ingfg: "fg",
  ingmas: "mas",
  ingog: "og",
  ingoke: "oke",
  ingsto: "sto",
};

const textExtensions = new Set([".dat", ".fg", ".mas", ".og", ".oke", ".sto"]);

function sourcePath(library, filename) {
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

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const output = [];
  for (const entry of entries) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) output.push(...(await filesBelow(fullPath)));
    if (entry.isFile() && textExtensions.has(entry.name.slice(entry.name.lastIndexOf(".")).toLowerCase())) {
      output.push(fullPath);
    }
  }
  return output;
}

async function gzipFile(filename) {
  const output = `${filename}.gz`;
  const inputStat = await stat(filename);
  if (existsSync(output) && (await stat(output)).mtimeMs >= inputStat.mtimeMs) return false;
  const contents = await readFile(filename);
  await writeFile(output, gzipSync(contents, { level: 9 }));
  return true;
}

const [libraryToFilenames, filenameMetadata] = await Promise.all([
  readJson("lib_to_filename.json"),
  readJson("lib_filename_to_designation_position.json"),
]);

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
    const file = sourcePath(library, filename);
    if (!existsSync(join(root, file))) {
      missingSources.push(`${id} (${file})`);
      continue;
    }
    const matches = filenameMetadata[id] || [];
    spectra[id] = {
      id,
      library,
      group,
      filename,
      file,
      aliases: [...new Set(matches.map(([name]) => name))],
      coordinate: matches.length ? matches[0].slice(1) : null,
      kind: library === "irafblackbody" ? "relative-response" : "flux-density",
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

const directories = Object.keys(libraryToFilenames).map((library) => join(root, library));
const textFiles = (await Promise.all(directories.map(filesBelow))).flat();
let compressed = 0;
for (const filename of textFiles) if (await gzipFile(filename)) compressed += 1;

console.log(
  `Wrote spectra-index.json (${Object.keys(spectra).length} spectra, ${Object.keys(designations).length} designations); compressed ${compressed}/${textFiles.length} text spectra.`,
);
if (missingSources.length) console.warn(`Skipped missing catalogued source files: ${missingSources.join(", ")}`);
