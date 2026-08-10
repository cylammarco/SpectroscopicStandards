"use strict";

const SPEED_OF_LIGHT_ANGSTROM_PER_SECOND = 2.99792458e18;
const AB_ZERO_POINT_JY = 3630.780548;
const GROUP_ORDER = ["ESO", "ING", "IRAF"];
const THEME_STORAGE_KEY = "spectroscopic-standards-theme-v2";

const state = {
  index: null,
  mode: "global",
  selectedDesignation: null,
  selectedSpectrum: null,
  designations: [],
  showRelated: false,
  spectrumCache: new Map(),
  requestId: 0,
  aladin: null,
};

const elements = {
  breadcrumbMode: document.getElementById("breadcrumb-mode"),
  modeIntro: document.getElementById("mode-intro"),
  selectionStatus: document.getElementById("selection-status"),
  catalogueCount: document.getElementById("catalogue-count"),
  explorerTitle: document.getElementById("explorer-title"),
  globalControls: document.getElementById("global-mode-controls"),
  libraryControls: document.getElementById("library-mode-controls"),
  citationsPanel: document.getElementById("citations-panel"),
  viewerLayout: document.getElementById("viewer-layout"),
  plotSection: document.getElementById("plot-section"),
  globalTarget: document.getElementById("global-target-select"),
  globalTargetMenu: document.getElementById("global-target-menu"),
  globalTargetButton: document.getElementById("global-target-button"),
  librarySelect: document.getElementById("library-select"),
  spectrumSelect: document.getElementById("spectrum-select"),
  spectrumHelp: document.getElementById("spectrum-help"),
  targetTitle: document.getElementById("target-info-title"),
  targetInfo: document.getElementById("target-info"),
  relatedToggle: document.getElementById("related-toggle"),
  relatedNote: document.getElementById("related-note"),
  xUnit: document.getElementById("x-unit"),
  yUnit: document.getElementById("y-unit"),
  xLog: document.getElementById("x-log"),
  yLog: document.getElementById("y-log"),
  resetView: document.getElementById("reset-view"),
  chart: document.getElementById("plotly-chart"),
  chartState: document.getElementById("chart-state"),
  axisWarning: document.getElementById("axis-warning"),
  aladinSurvey: document.getElementById("aladin-survey"),
  themeSelect: document.getElementById("theme-select"),
};

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[character]);
}

function normaliseDesignation(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, "");
}

function compactCount(value) {
  return new Intl.NumberFormat("en-GB").format(value);
}

function currentSpectrum() {
  return state.selectedSpectrum ? state.index.spectra[state.selectedSpectrum] : null;
}

function selectedTarget() {
  const spectrum = currentSpectrum();
  return state.selectedDesignation || spectrum?.target || spectrum?.aliases?.[0] || null;
}

function selectedCoordinate() {
  const target = selectedTarget();
  return state.index.designations[target]?.coordinate || currentSpectrum()?.coordinate || null;
}

function showChartState(title, message, loading = false) {
  elements.chartState.hidden = false;
  elements.chartState.classList.toggle("loading", loading);
  elements.chartState.innerHTML = `<div class="chart-state-panel"><div class="chart-orbit"></div><h3 class="h5">${escapeHtml(title)}</h3><p class="muted-copy mb-0">${escapeHtml(message)}</p></div>`;
}

function hideChartState() {
  elements.chartState.hidden = true;
  elements.chartState.classList.remove("loading");
}

function showAxisWarning(message = "") {
  elements.axisWarning.textContent = message;
  elements.axisWarning.classList.toggle("visible", Boolean(message));
}

async function gzipText(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: ${response.status}`);
  if (response.headers.get("content-encoding")) return response.text();
  if (!("DecompressionStream" in window) || !response.body) throw new Error("Gzip decompression is unavailable");
  const stream = response.body.pipeThrough(new DecompressionStream("gzip"));
  return new Response(stream).text();
}

async function fetchText(path) {
  if ("DecompressionStream" in window) {
    try {
      return await gzipText(`${path}.gz`);
    } catch (error) {
      console.info(`Using plain-text fallback for ${path}`, error);
    }
  }
  const response = await fetch(path);
  if (!response.ok) throw new Error(`${path}: ${response.status}`);
  return response.text();
}

async function loadIndex() {
  const text = await fetchText("spectra-index.json");
  state.index = JSON.parse(text);
}

function populateDesignations() {
  state.designations = Object.keys(state.index.designations).sort((first, second) => first.localeCompare(second, "en-GB", {
    numeric: true,
    sensitivity: "base",
    ignorePunctuation: true,
  }));
  elements.catalogueCount.textContent = `${compactCount(state.designations.length)} designations`;
}

function populateCatalogueMenu(menu) {
  if (menu.dataset.populated) return;
  const current = document.createElement("button");
  current.type = "button";
  current.className = "catalogue-current";
  current.dataset.currentDesignation = "";
  const divider = document.createElement("div");
  divider.className = "dropdown-divider";
  const list = document.createDocumentFragment();
  for (const designation of state.designations) {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "catalogue-option";
    option.dataset.designation = designation;
    option.textContent = designation;
    list.append(option);
  }
  menu.replaceChildren(current, divider, list);
  menu.dataset.populated = "true";
}

function openCatalogueMenu(input, menu) {
  if (!state.index) return;
  populateCatalogueMenu(menu);
  const entered = normaliseDesignation(input.value);
  const currentDesignation = state.index.designations[entered] ? entered : state.selectedDesignation;
  const current = menu.querySelector(".catalogue-current");
  if (currentDesignation) {
    current.textContent = `Current object: ${currentDesignation}`;
    current.disabled = false;
    current.dataset.designation = currentDesignation;
  } else {
    current.textContent = "Current object: none selected";
    current.disabled = true;
    delete current.dataset.designation;
  }
  menu.classList.add("show");
  input.setAttribute("aria-expanded", "true");
}

function closeCatalogueMenus() {
  elements.globalTargetMenu.classList.remove("show");
  elements.globalTarget.setAttribute("aria-expanded", "false");
}

function refreshOpenCatalogueMenus() {
  if (elements.globalTargetMenu.classList.contains("show")) openCatalogueMenu(elements.globalTarget, elements.globalTargetMenu);
}

function initAladin() {
  if (!window.A?.init) return;
  window.A.init.then(() => {
    state.aladin = window.A.aladin("#aladin-lite-div", {
      survey: elements.aladinSurvey.value,
      fov: 0.05,
      projection: "TAN",
      showProjectionControl: false,
      target: "0.0, 0.0",
    });
  }).catch((error) => console.warn("Aladin Lite was not initialised", error));
}

function setAladinSurvey(survey) {
  if (state.aladin?.setImageSurvey) state.aladin.setImageSurvey(survey);
}

function updateAladin() {
  const coordinate = selectedCoordinate();
  if (!state.aladin || !coordinate || (coordinate[0] === 0 && coordinate[1] === 0)) return;
  state.aladin.gotoRaDec(coordinate[0], coordinate[1]);
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  elements.themeSelect.value = theme;
  try { localStorage.setItem(THEME_STORAGE_KEY, theme); } catch (_) { /* Storage can be disabled. */ }
}

function restoreTheme() {
  let theme = "midnight";
  try { theme = localStorage.getItem(THEME_STORAGE_KEY) || theme; } catch (_) { /* Storage can be disabled. */ }
  setTheme(theme);
}

function updateModeUi() {
  const citationMode = state.mode === "citations";
  const libraryMode = !citationMode && state.mode !== "global";
  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === state.mode);
  });
  elements.globalControls.classList.toggle("d-none", libraryMode || citationMode);
  elements.libraryControls.classList.toggle("d-none", !libraryMode);
  elements.citationsPanel.classList.toggle("d-none", !citationMode);
  elements.viewerLayout.classList.toggle("d-none", citationMode);
  elements.plotSection.classList.toggle("d-none", citationMode);
  elements.breadcrumbMode.textContent = citationMode ? "Sources & citations" : libraryMode ? `${state.mode} library` : "Global search";
  elements.explorerTitle.textContent = libraryMode ? `${state.mode}: browse folders` : "Global catalogue search";
  elements.modeIntro.textContent = citationMode
    ? "Folder-by-folder publication references for the ESO, ING, and IRAF catalogues."
    : libraryMode
      ? `Choose a ${state.mode} subfolder, then select one contained spectrum.`
      : "Find a target by any known designation, then compare available spectra.";
}

function resetSelection(message = "Choose a target or spectrum to display it.") {
  state.requestId += 1;
  state.selectedDesignation = null;
  state.selectedSpectrum = null;
  state.showRelated = false;
  elements.relatedToggle.checked = false;
  elements.relatedToggle.disabled = true;
  elements.relatedNote.textContent = "Select a target first.";
  elements.targetTitle.textContent = "No target selected";
  elements.targetInfo.innerHTML = `<p class="muted-copy mb-0">${escapeHtml(message)}</p>`;
  elements.selectionStatus.textContent = "No spectrum selected";
  showAxisWarning();
  if (window.Plotly) window.Plotly.purge(elements.chart);
  showChartState("Spectrum will appear here", message);
}

function clearLibraryControls() {
  elements.librarySelect.innerHTML = '<option value="">Choose a subfolder</option>';
  elements.spectrumSelect.innerHTML = '<option value="">Choose a spectrum</option>';
  elements.spectrumSelect.disabled = true;
  elements.spectrumHelp.textContent = "Choose a subfolder first.";
}

function populateLibraryFolders() {
  clearLibraryControls();
  const libraries = state.index.groups[state.mode].libraries;
  const fragment = document.createDocumentFragment();
  for (const library of libraries) {
    const metadata = state.index.libraries[library];
    const option = document.createElement("option");
    option.value = library;
    option.textContent = `${metadata.label} (${metadata.spectra.length})`;
    fragment.append(option);
  }
  elements.librarySelect.append(fragment);
}

function populateSpectrumSelect(library) {
  elements.spectrumSelect.innerHTML = '<option value="">Choose a spectrum</option>';
  if (!library) {
    elements.spectrumSelect.disabled = true;
    elements.spectrumHelp.textContent = "Choose a subfolder first.";
    return;
  }
  const spectra = state.index.libraries[library].spectra;
  const fragment = document.createDocumentFragment();
  for (const spectrumId of spectra) {
    const spectrum = state.index.spectra[spectrumId];
    const option = document.createElement("option");
    option.value = spectrumId;
    option.textContent = spectrum.filename;
    fragment.append(option);
  }
  elements.spectrumSelect.append(fragment);
  elements.spectrumSelect.disabled = false;
  elements.spectrumHelp.textContent = `${compactCount(spectra.length)} spectra in this subfolder.`;
}

function setMode(mode) {
  if (!state.index || !["global", ...GROUP_ORDER, "citations"].includes(mode)) return;
  state.mode = mode;
  updateModeUi();
  if (mode === "citations") {
    elements.selectionStatus.textContent = "ESO · ING · IRAF references";
    return;
  }
  resetSelection(mode === "global" ? "Choose a target with global search to display its spectrum." : "Choose a subfolder and spectrum to display it.");
  if (mode === "global") {
    elements.globalTarget.focus();
  } else {
    populateLibraryFolders();
  }
}

function relatedSpectrumIds() {
  const target = selectedTarget();
  const related = state.index.designations[target]?.spectra || [];
  return related.includes(state.selectedSpectrum)
    ? related
    : [state.selectedSpectrum, ...related].filter(Boolean);
}

function updateRelatedToggle() {
  const related = relatedSpectrumIds();
  const available = related.length > 1;
  elements.relatedToggle.disabled = !available;
  if (!available) {
    state.showRelated = false;
    elements.relatedToggle.checked = false;
    elements.relatedNote.textContent = "This is the only spectrum for this target.";
  } else {
    elements.relatedNote.textContent = `${related.length} spectra available; default shows selected file only.`;
  }
}

function coordinateText(coordinate) {
  if (!coordinate) return "Coordinates unavailable";
  return `RA ${coordinate[0].toFixed(6)}°, Dec ${coordinate[1].toFixed(6)}°`;
}

function sourceNameLink(spectrum, isCurrent) {
  const library = state.index.libraries[spectrum.library];
  return `<div class="source-name-row${isCurrent ? " is-current" : ""}">
    <a class="source-name" href="#plotly-chart" data-spectrum-id="${escapeHtml(spectrum.id)}" title="Display ${escapeHtml(spectrum.file)}">${escapeHtml(spectrum.filename)}</a>
    <span class="source-library">${escapeHtml(spectrum.group)} · ${escapeHtml(library.label)}</span>
    <a class="source-download" href="${escapeHtml(spectrum.file)}" download title="Download ${escapeHtml(spectrum.file)}">download ↓</a>
  </div>`;
}

function renderTargetInfo() {
  const spectrum = currentSpectrum();
  if (!spectrum) return;
  const target = selectedTarget();
  const coordinate = selectedCoordinate();
  const related = relatedSpectrumIds().map((id) => state.index.spectra[id]).filter(Boolean);
  const orderedRelated = [spectrum, ...related.filter((item) => item.id !== spectrum.id)];
  const providerGroups = [...new Set(related.map((item) => item.group))].sort((a, b) => GROUP_ORDER.indexOf(a) - GROUP_ORDER.indexOf(b));
  const title = state.selectedDesignation || spectrum.filename;
  const coordinateCopy = coordinate ? `${coordinate[0]}, ${coordinate[1]}` : "";

  elements.targetTitle.textContent = title;
  elements.targetInfo.innerHTML = `
    <div class="row g-4">
      <div class="col-md-5">
        <div class="card-kicker">Equatorial coordinates (J2000)</div>
        <div class="coordinate-value mb-2">${escapeHtml(coordinateText(coordinate))}</div>
        ${coordinate ? `<button class="btn btn-sm btn-outline-secondary" type="button" data-copy-coordinate="${escapeHtml(coordinateCopy)}">Copy coordinates</button>` : ""}
        <p class="muted-copy mt-3 mb-0">Selected target: <strong>${escapeHtml(target || spectrum.filename)}</strong></p>
      </div>
      <div class="col-md-7">
        <div class="card-kicker">Available source names and libraries</div>
        <div class="source-name-list">${orderedRelated.map((item) => sourceNameLink(item, item.id === spectrum.id)).join("")}</div>
        <p class="muted-copy mt-3 mb-0">${related.length} file${related.length === 1 ? "" : "s"} across ${providerGroups.join(", ") || spectrum.group}. Select a name to display it; download links preserve original source files.</p>
      </div>
    </div>`;
  updateAladin();
}

function updateAxisControlAvailability() {
  const spectrum = currentSpectrum();
  const relative = spectrum?.kind === "relative-response" && !state.showRelated;
  elements.yUnit.disabled = relative;
  if (relative) elements.yUnit.value = "wavelength";
}

function selectDesignation(value) {
  const designation = normaliseDesignation(value);
  const record = state.index.designations[designation];
  if (!record) {
    elements.globalTarget.classList.add("is-invalid");
    elements.selectionStatus.textContent = `No exact designation found for “${value.trim()}”`;
    return;
  }
  elements.globalTarget.classList.remove("is-invalid");
  state.selectedDesignation = designation;
  state.selectedSpectrum = record.spectra[0];
  state.showRelated = false;
  elements.relatedToggle.checked = false;
  elements.globalTarget.value = designation;
  refreshOpenCatalogueMenus();
  finalizeSelection();
}

function selectSpectrum(spectrumId) {
  if (!state.index.spectra[spectrumId]) return;
  state.selectedDesignation = null;
  state.selectedSpectrum = spectrumId;
  state.showRelated = false;
  elements.relatedToggle.checked = false;
  finalizeSelection();
}

function finalizeSelection() {
  updateRelatedToggle();
  updateAxisControlAvailability();
  renderTargetInfo();
  const spectrum = currentSpectrum();
  elements.selectionStatus.innerHTML = `<strong>${escapeHtml(spectrum.filename)}</strong> · ${escapeHtml(state.index.libraries[spectrum.library].label)}`;
  renderPlot();
}

function dataFileName(spectrum) {
  return spectrum.file.split("/").at(-1).replace(/\.[^.]+$/, "");
}

function janskyToFluxPerAngstrom(wavelength, jansky) {
  return (jansky * 2.99792458e-5) / (wavelength ** 2);
}

function magnitudeToFluxPerAngstrom(wavelength, magnitude) {
  return janskyToFluxPerAngstrom(wavelength, (10 ** (-magnitude / 2.5)) * AB_ZERO_POINT_JY);
}

function sourceFluxToFluxPerAngstrom(spectrum, wavelength, value) {
  if (spectrum.group === "ESO") return spectrum.library === "esoxshooter" ? value : value * 1e-16;
  if (spectrum.group === "IRAF") return magnitudeToFluxPerAngstrom(wavelength, value);

  const filename = dataFileName(spectrum);
  if (spectrum.library === "ingmas") return magnitudeToFluxPerAngstrom(wavelength, value);
  if (spectrum.library === "ingfg") {
    if (filename.endsWith("a")) return magnitudeToFluxPerAngstrom(wavelength, value);
    return janskyToFluxPerAngstrom(wavelength, value * (filename === "gd248" ? 1e-3 : 1e-6));
  }
  if (spectrum.library === "ingog") {
    if (filename.endsWith("a")) return magnitudeToFluxPerAngstrom(wavelength, value);
    return janskyToFluxPerAngstrom(wavelength, value * (["bd17", "hd194"].includes(filename) ? 1e-3 : 1e-6));
  }
  if (spectrum.library === "ingsto") {
    if (filename.endsWith("a")) return magnitudeToFluxPerAngstrom(wavelength, value);
    return janskyToFluxPerAngstrom(wavelength, value * 1e-3);
  }
  if (spectrum.library === "ingoke") {
    if (filename.endsWith("a") || filename.endsWith("aold") || filename.endsWith("anew")) {
      return magnitudeToFluxPerAngstrom(wavelength, value);
    }
    const milliJansky = new Set([
      "erib", "f24", "g47", "g99", "g191old", "gd140", "grw73", "grw705old", "grw708", "he3", "hz2", "hz7", "hz14", "hz29", "hz43", "hz44old", "l745", "lb227", "lb1240", "lds235", "l870", "l930", "l970", "l1363", "l1512", "sa29", "t573", "w485", "w1346", "r627", "r640",
    ]).has(filename);
    return janskyToFluxPerAngstrom(wavelength, value * (milliJansky ? 1e-3 : 1e-6));
  }
  return value;
}

function parseSpectrum(text, spectrum) {
  const points = [];
  let discarded = 0;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || /^(#|\*|SET\b)/i.test(line)) continue;
    const [first, second] = line.split(/\s+/, 2).map(Number);
    if (!Number.isFinite(first) || !Number.isFinite(second)) {
      discarded += 1;
      continue;
    }
    const wavelength = spectrum.kind === "relative-response" ? first * 1e4 : first;
    const flux = spectrum.kind === "relative-response" ? second : sourceFluxToFluxPerAngstrom(spectrum, wavelength, second);
    if (!Number.isFinite(wavelength) || !Number.isFinite(flux)) {
      discarded += 1;
      continue;
    }
    points.push([wavelength, flux]);
  }
  return { points, discarded };
}

async function loadSpectrum(spectrum) {
  if (state.spectrumCache.has(spectrum.id)) return state.spectrumCache.get(spectrum.id);
  const promise = fetchText(spectrum.file).then((text) => parseSpectrum(text, spectrum));
  state.spectrumCache.set(spectrum.id, promise);
  try {
    return await promise;
  } catch (error) {
    state.spectrumCache.delete(spectrum.id);
    throw error;
  }
}

function xAxisDetails() {
  if (elements.xUnit.value === "nanometre") return { label: "Wavelength [nm]", value: (wavelength) => wavelength / 10 };
  if (elements.xUnit.value === "frequency") return { label: "Frequency [Hz]", value: (wavelength) => SPEED_OF_LIGHT_ANGSTROM_PER_SECOND / wavelength };
  return { label: "Wavelength [Å]", value: (wavelength) => wavelength };
}

function yAxisDetails(relative) {
  if (relative) return { label: "Relative response", value: (flux) => flux };
  if (elements.yUnit.value === "frequency") return {
    label: "Flux density [erg s⁻¹ cm⁻² Hz⁻¹]",
    value: (flux, wavelength) => flux * (wavelength ** 2) / SPEED_OF_LIGHT_ANGSTROM_PER_SECOND,
  };
  return { label: "Flux density [erg s⁻¹ cm⁻² Å⁻¹]", value: (flux) => flux };
}

function transformTrace(spectrum, parsed) {
  const xDetails = xAxisDetails();
  const yDetails = yAxisDetails(spectrum.kind === "relative-response" && !state.showRelated);
  const x = [];
  const y = [];
  let discarded = parsed.discarded;
  for (const [wavelength, flux] of parsed.points) {
    const xValue = xDetails.value(wavelength);
    const yValue = yDetails.value(flux, wavelength);
    const invalidForLog = (elements.xLog.checked && xValue <= 0) || (elements.yLog.checked && yValue <= 0);
    if (!Number.isFinite(xValue) || !Number.isFinite(yValue) || invalidForLog) {
      discarded += 1;
      continue;
    }
    x.push(xValue);
    y.push(yValue);
  }
  return {
    trace: {
      x,
      y,
      type: "scatter",
      mode: "lines",
      name: `${spectrum.group} · ${spectrum.filename}`,
      hovertemplate: `%{x:.6g}<br>%{y:.6g}<extra>${escapeHtml(spectrum.filename)}</extra>`,
      line: { width: 1.35 },
    },
    discarded,
    xLabel: xDetails.label,
    yLabel: yDetails.label,
  };
}

async function renderPlot() {
  const requestId = ++state.requestId;
  const selected = currentSpectrum();
  if (!selected) return;
  const spectrumIds = state.showRelated ? relatedSpectrumIds() : [selected.id];
  const spectra = spectrumIds.map((id) => state.index.spectra[id]).filter(Boolean);
  showChartState("Loading spectrum…", `Reading ${spectra.length} selected file${spectra.length === 1 ? "" : "s"}.`, true);
  showAxisWarning();

  try {
    const parsed = await Promise.all(spectra.map(loadSpectrum));
    if (requestId !== state.requestId) return;
    const transformed = spectra.map((spectrum, index) => transformTrace(spectrum, parsed[index]));
    const usable = transformed.filter(({ trace }) => trace.x.length);
    const discarded = transformed.reduce((sum, item) => sum + item.discarded, 0);
    if (!usable.length) {
      showChartState("No plottable values", "Current transforms or logarithmic axes exclude every finite data point.");
      showAxisWarning("No finite values remained after unit conversion and logarithmic-axis filtering.");
      if (window.Plotly) window.Plotly.purge(elements.chart);
      return;
    }

    const first = usable[0];
    const layout = {
      autosize: true,
      margin: { l: 75, r: 28, t: 24, b: 72 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      font: { color: getComputedStyle(document.documentElement).getPropertyValue("--ss-text").trim() },
      xaxis: { title: first.xLabel, type: elements.xLog.checked ? "log" : "linear", gridcolor: "rgba(118,129,146,.22)", zerolinecolor: "rgba(118,129,146,.26)" },
      yaxis: { title: first.yLabel, type: elements.yLog.checked ? "log" : "linear", tickformat: ".3e", gridcolor: "rgba(118,129,146,.22)", zerolinecolor: "rgba(118,129,146,.26)" },
      legend: { orientation: "h", yanchor: "bottom", y: 1.02, xanchor: "left", x: 0 },
      hovermode: "closest",
      showlegend: usable.length > 1,
    };
    await window.Plotly.react(elements.chart, usable.map(({ trace }) => trace), layout, {
      responsive: true,
      displaylogo: false,
      modeBarButtonsToRemove: ["lasso2d", "select2d"],
    });
    if (requestId !== state.requestId) return;
    hideChartState();
    if (discarded) {
      const reason = elements.xLog.checked || elements.yLog.checked
        ? "invalid, non-finite, or non-positive values for logarithmic axes"
        : "invalid or non-finite values";
      showAxisWarning(`Omitted ${compactCount(discarded)} ${reason}.`);
    }
  } catch (error) {
    if (requestId !== state.requestId) return;
    console.error("Unable to draw spectrum", error);
    showChartState("Spectrum could not load", "Try again, or use the download link to inspect the original source file.");
    showAxisWarning(`Loading failed: ${error.message}`);
  }
}

function runGlobalSearch(value) {
  const query = value ?? elements.globalTarget.value;
  const valueToSearch = String(query).trim();
  elements.globalTarget.value = valueToSearch;
  selectDesignation(valueToSearch);
  closeCatalogueMenus();
}

function bindEvents() {
  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => setMode(button.dataset.mode));
  });
  elements.globalTargetButton.addEventListener("click", () => runGlobalSearch(elements.globalTarget.value));
  elements.globalTarget.addEventListener("change", (event) => runGlobalSearch(event.target.value));
  elements.globalTarget.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      runGlobalSearch(event.currentTarget.value);
    }
  });
  [[elements.globalTarget, elements.globalTargetMenu]].forEach(([input, menu]) => {
    input.addEventListener("focus", () => openCatalogueMenu(input, menu));
    input.addEventListener("click", () => openCatalogueMenu(input, menu));
    input.addEventListener("input", () => openCatalogueMenu(input, menu));
    menu.addEventListener("click", (event) => {
      const option = event.target.closest("[data-designation]");
      if (!option || option.disabled) return;
      if (state.mode !== "global") setMode("global");
      runGlobalSearch(option.dataset.designation);
    });
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".catalogue-combobox")) closeCatalogueMenus();
  });
  elements.librarySelect.addEventListener("change", () => {
    populateSpectrumSelect(elements.librarySelect.value);
    resetSelection("Choose a spectrum from this subfolder to display it.");
  });
  elements.spectrumSelect.addEventListener("change", () => selectSpectrum(elements.spectrumSelect.value));
  elements.relatedToggle.addEventListener("change", () => {
    state.showRelated = elements.relatedToggle.checked;
    updateAxisControlAvailability();
    renderTargetInfo();
    renderPlot();
  });
  [elements.xUnit, elements.yUnit, elements.xLog, elements.yLog].forEach((control) => control.addEventListener("change", renderPlot));
  elements.resetView.addEventListener("click", () => {
    if (state.selectedSpectrum) renderPlot();
  });
  elements.themeSelect.addEventListener("change", () => {
    setTheme(elements.themeSelect.value);
    if (state.selectedSpectrum) renderPlot();
  });
  elements.aladinSurvey.addEventListener("change", () => setAladinSurvey(elements.aladinSurvey.value));
  elements.targetInfo.addEventListener("click", async (event) => {
    const spectrumLink = event.target.closest("[data-spectrum-id]");
    if (spectrumLink) {
      event.preventDefault();
      selectSpectrum(spectrumLink.dataset.spectrumId);
      return;
    }
    const button = event.target.closest("[data-copy-coordinate]");
    if (!button) return;
    const value = button.dataset.copyCoordinate;
    try {
      await navigator.clipboard.writeText(value);
      button.textContent = "Copied";
      setTimeout(() => { button.textContent = "Copy coordinates"; }, 1500);
    } catch (_) {
      button.textContent = value;
    }
  });
}

async function initialise() {
  restoreTheme();
  bindEvents();
  initAladin();
  try {
    await loadIndex();
    populateDesignations();
    updateModeUi();
    elements.selectionStatus.textContent = `${compactCount(Object.keys(state.index.spectra).length)} spectra ready`;
    elements.globalTarget.disabled = false;
  } catch (error) {
    console.error("Catalogue failed to load", error);
    elements.selectionStatus.textContent = "Catalogue unavailable";
    elements.catalogueCount.textContent = "Load failed";
    showChartState("Catalogue could not load", "Reload page after checking the network connection.");
  }
}

initialise();
