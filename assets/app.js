"use strict";

const SPEED_OF_LIGHT_ANGSTROM_PER_SECOND = 2.99792458e18;
const AB_ZERO_POINT_JY = 3630.780548;
const GROUP_ORDER = ["ESO", "ING", "IRAF"];
const THEME_STORAGE_KEY = "spectroscopic-standards-theme-v2";
const OBSERVATORIES = [
  ["Roque de los Muchachos Observatory (La Palma, Spain)", -17.8816, 28.7606, 2326], ["Teide Observatory (Tenerife, Spain)", -16.4967, 28.2917, 2395], ["Georgian National Astrophysical Observatory (Abastumani, Georgia)", 42.819, 41.75, 1700], ["Abruzzo Astronomical Observatory - TNT (INAF-OA Abruzzo, Italy)", 13.5586, 42.442, 2150], ["Apache Point Observatory (New Mexico, USA)", -105.8203, 32.7804, 2788], ["Aras de los Olmos Observatory (Spain)", -1.1337, 39.645, 1300], ["Asiago Astrophysical Observatory (Italy)", 11.57, 45.843, 1045], ["Assy-Turgen Observatory (Kazakhstan)", 77.878, 43.17, 2750], ["Bohyunsan Optical Astronomy Observatory (Korea)", 128.9766, 36.1648, 1124], ["Brorfelde Observatory (Denmark)", 11.385, 55.625, 90], ["Byurakan Observatory (Armenia)", 44.2737, 40.33, 1500], ["Calar Alto Observatory (Almeria, Spain)", -2.546, 37.2236, 2168], ["Campo Imperatore Observatory (INAF-OA Abruzzo, Italy)", 13.5539, 42.443, 2150], ["Cerro Pachon Observatory (Chile)", -70.7366, -30.2446, 2722], ["Cerro Paranal Observatory (Chile)", -70.4028, -24.6253, 2635], ["Cerro Tololo Observatory (Chile)", -70.806, -30.169, 2200], ["Dominion Astrophysical Observatory (Canada)", -123.417, 48.5217, 229], ["El Leoncito Observatory (Argentina)", -69.295, -31.7992, 2552], ["Fred Lawrence Whipple Observatory (Arizona, USA)", -110.8783, 31.6811, 2606], ["Guillermo Haro Astrophysical Observatory (Sonora, Mexico)", -110.3847, 31.0528, 2486], ["Haute-Provence Observatory (France)", 5.7122, 43.9317, 650], ["Helmos Observatory (Greece)", 22.1961, 37.9844, 2340], ["Iranian National Observatory, Mt. Gargash (Iran)", 51.31, 33.74, 3600], ["Javalambre Astronomical Observatory (Teruel, Spain)", -1.0163, 40.0418, 1956], ["Kitt Peak Observatory (Arizona, USA)", -111.6, 31.9633, 2096], ["Kryoneri Observatory (Greece)", 22.62, 38.137, 930], ["La Luz Observatory (Mexico)", -100.9394, 21.006, 2435], ["La Silla Observatory (Chile)", -70.7345, -29.2567, 2347], ["Large Millimeter Telescope (Mexico)", -97.314, 18.985, 4580], ["Las Campanas Observatory (Chile)", -70.6926, -29.6146, 2386], ["Lick Observatory (California, USA)", -121.6453, 37.3404, 1283], ["Lijiang Observatory (China)", 100.036, 26.6951, 3206], ["Loiano Observatory (Italy)", 11.338, 44.26, 780], ["Lulin Observatory (Taiwan)", 120.8736, 23.4686, 2862], ["Mauna Kea Observatory (Hawaii, USA)", -155.4683, 19.8256, 4215], ["McDonald Observatory (Texas, USA)", -104.0226, 30.671, 2070], ["Montsec Astronomical Observatory (Lleida, Spain)", 0.727, 42.05, 1570], ["Mount Graham International Observatory (Arizona, USA)", -109.892, 32.7013, 3191], ["Mount John Observatory (Tekapo, New Zeland)", 170.4651, -43.984, 1029], ["Mount Kent Observatory (Queensland, Australia)", 151.855, -27.797, 682], ["Mount Lemon Optical Astronomy Observatory (Arizona, USA)", -110.7886, 32.4422, 2776], ["Nanshan Station, Xinjiang Astronomical Observatory (China)", 87.178, 43.47, 2080], ["National Astronomical Observatory Rozhen (Bulgaria)", 24.742, 41.693, 1759], ["Observatoire de la Cote dAzur (France)", 6.9228, 43.7538, 1270], ["Ondrejov Observatory", 14.783, 49.91, 530], ["Palomar Observatory (California, USA)", -116.8648, 33.3563, 1712], ["Pearl Station (Canada)", -68.4, 81.6, 20], ["Pico dos Dias Observatory (Brazil)", -45.58, -22.534, 1864], ["Pine Mountain Observatory (Oregon, USA)", -120.948, 43.79, 1570], ["Piszkesteto Observatory (Hungary)", 19.894, 47.918, 966], ["Rosemary Hill Observatory (Florida, USA)", -82.198, 29.4, 30], ["San Pedro Martir Observatory (Mexico)", -115.462, 31.0442, 2830], ["Santa Martina Observatory (Chile)", -70.534, -33.2696, 1456], ["Seimei Telescope (Japan)", 133.5968, 34.5769, 435], ["Sertao de Itaparica Observatory (Brazil)", -38.6885, -8.7922, 390], ["Siding Spring Observatory (Australia)", 149.0617, -31.2733, 1145], ["Astronomical Observatory of the University of Siena (Italy)", 11.337, 43.313, 306], ["Serra La Nave Observatory (INAF - OA Catania, Italy)", 14.973, 37.7, 1725], ["Sierra Nevada Observatory (Granada, Spain)", -3.3847, 37.0642, 2896], ["Skinakas Observatory (Crete, Greece)", 24.895, 35.213, 1750], ["Sobaeksan Optical Astronomy Observatory (Korea)", 128.4569, 36.9342, 1369], ["Special Astrophysical Observatory (Russia)", 41.4404, 43.6468, 2076], ["Sutherland Observatory (South Africa)", 20.81, -32.38, 1798], ["Tian Shan Observatory (Kazakhstan)", 76.9766, 43.0573, 2730], ["Thai National Observatory, NARI (Thailand)", 98.482, 18.573, 2457], ["Thueringer Landessternwarte Tautenburg (Germany)", 11.711, 50.98, 331], ["Tubitak National Observatory (Turkey)", 30.335, 36.825, 2500], ["Vidojevica Astronomical Station (Serbia)", 21.5557, 43.1462, 1150], ["Virgin Island Robotic Telescope (US Virgin Islands)", -64.354, 18.3506, 420], ["Wendelstein Observatory (Germany)", 12.011, 47.703, 1838], ["Wise Observatory (Israel)", 34.766, 30.595, 875], ["Xinglong Observatory (China)", 117.575, 40.3933, 950], ["Zimmerwald Observatory (Bern, Switzerland)", 7.465, 46.878, 950],
];

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
  visibility: null,
  visibilityRequest: 0,
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
  libraryTarget: document.getElementById("library-target-select"),
  libraryTargetMenu: document.getElementById("library-target-menu"),
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
  visibilitySection: document.getElementById("visibility-section"),
  visibilityTarget: document.getElementById("visibility-target"),
  visibilityObservatory: document.getElementById("visibility-observatory"),
  visibilityDate: document.getElementById("visibility-date"),
  visibilityToday: document.getElementById("visibility-today"),
  visibilityLongitude: document.getElementById("visibility-longitude"),
  visibilityLatitude: document.getElementById("visibility-latitude"),
  visibilityElevation: document.getElementById("visibility-elevation"),
  visibilityRun: document.getElementById("visibility-run"),
  visibilityMoon: document.getElementById("visibility-moon"),
  visibilityStatus: document.getElementById("visibility-status"),
  visibilityChart: document.getElementById("visibility-chart"),
  aladinSurvey: document.getElementById("aladin-survey"),
  themeSelect: document.getElementById("theme-select"),
  sidebar: document.getElementById("app-sidebar"),
  sidebarToggle: document.getElementById("sidebar-toggle"),
  sidebarClose: document.getElementById("sidebar-close"),
  sidebarBackdrop: document.getElementById("sidebar-backdrop"),
};

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[character]);
}

function normaliseDesignation(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, "");
}

function setMobileSidebar(open) {
  const isMobile = window.matchMedia("(max-width: 991.98px)").matches;
  const isOpen = Boolean(open && isMobile);
  document.body.classList.toggle("sidebar-open", isOpen);
  elements.sidebarToggle?.setAttribute("aria-expanded", String(isOpen));
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
  const empty = document.createElement("p");
  empty.className = "catalogue-empty";
  empty.hidden = true;
  empty.textContent = "No matching targets";
  menu.replaceChildren(current, divider, list, empty);
  menu.dataset.populated = "true";
}

function filterCatalogueMenu(menu, query) {
  const normalisedQuery = normaliseDesignation(query);
  let matches = 0;
  menu.querySelectorAll(".catalogue-option").forEach((option) => {
    const searchable = option.dataset.search || option.textContent;
    const visible = !normalisedQuery || normaliseDesignation(searchable).includes(normalisedQuery);
    option.hidden = !visible;
    if (visible) matches += 1;
  });
  const empty = menu.querySelector(".catalogue-empty");
  if (empty) empty.hidden = matches > 0;
}

function selectDisplayedTarget(input, selectedValue) {
  if (document.activeElement !== input || !selectedValue) return;
  if (normaliseDesignation(input.value) === normaliseDesignation(selectedValue)) input.select();
}

function openCatalogueMenu(input, menu, selectCurrentText = false) {
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
  // A selected designation is display state, not a search filter.  Reopening
  // the menu must therefore show the full catalogue so a different target can
  // be picked on the first attempt.
  const query = normaliseDesignation(input.value) === state.selectedDesignation ? "" : input.value;
  filterCatalogueMenu(menu, query);
  menu.classList.add("show");
  input.setAttribute("aria-expanded", "true");
  if (selectCurrentText) selectDisplayedTarget(input, state.selectedDesignation);
}

function closeCatalogueMenus() {
  elements.globalTargetMenu.classList.remove("show");
  elements.globalTarget.setAttribute("aria-expanded", "false");
  elements.libraryTargetMenu.classList.remove("show");
  elements.libraryTarget.setAttribute("aria-expanded", "false");
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
  elements.visibilitySection.classList.toggle("d-none", citationMode);
  elements.breadcrumbMode.textContent = citationMode ? "Sources & citations" : libraryMode ? `${state.mode} library` : "Global search";
  elements.explorerTitle.textContent = libraryMode ? `${state.mode}: browse folders` : "Global catalogue search";
  elements.modeIntro.textContent = citationMode
    ? "Folder-by-folder publication references for the ESO, ING, and IRAF catalogues."
    : libraryMode
      ? `Choose a ${state.mode} subfolder, then select one contained spectrum.`
      : "Find a target by any known designation, then compare available spectra.";
}

function clearVisibility() {
  state.visibility = null;
  state.visibilityRequest += 1;
  elements.visibilityTarget.textContent = "No target selected";
  elements.visibilityStatus.textContent = "Select a target, then update visibility.";
}

function resetSelection(message = "Choose a target or spectrum to display it.") {
  state.requestId += 1;
  state.selectedDesignation = null;
  state.selectedSpectrum = null;
  state.showRelated = false;
  clearVisibility();
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
  elements.libraryTarget.value = "";
  delete elements.libraryTarget.dataset.selectedSpectrumId;
  elements.libraryTarget.placeholder = "Choose a subfolder first";
  elements.libraryTarget.disabled = true;
  elements.libraryTargetMenu.replaceChildren();
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
  elements.libraryTarget.value = "";
  delete elements.libraryTarget.dataset.selectedSpectrumId;
  elements.libraryTargetMenu.replaceChildren();
  if (!library) {
    elements.libraryTarget.disabled = true;
    elements.libraryTarget.placeholder = "Choose a subfolder first";
    elements.spectrumHelp.textContent = "Choose a subfolder first.";
    return;
  }
  const spectra = state.index.libraries[library].spectra;
  const fragment = document.createDocumentFragment();
  for (const spectrumId of spectra) {
    const spectrum = state.index.spectra[spectrumId];
    const option = document.createElement("button");
    option.type = "button";
    option.className = "catalogue-option";
    option.dataset.spectrumId = spectrumId;
    option.dataset.search = [spectrum.filename, ...spectrum.aliases].join(" ");
    option.textContent = spectrum.aliases[0] ? `${spectrum.filename} · ${spectrum.aliases[0]}` : spectrum.filename;
    fragment.append(option);
  }
  const empty = document.createElement("p");
  empty.className = "catalogue-empty";
  empty.hidden = true;
  empty.textContent = "No matching targets";
  elements.libraryTargetMenu.replaceChildren(fragment, empty);
  elements.libraryTarget.disabled = false;
  elements.libraryTarget.placeholder = "Search this subfolder";
  elements.spectrumHelp.textContent = `Search ${compactCount(spectra.length)} targets in this subfolder.`;
}

function openLibraryTargetMenu(selectCurrentText = false) {
  if (elements.libraryTarget.disabled) return;
  const selected = state.index.spectra[elements.libraryTarget.dataset.selectedSpectrumId];
  const query = selected?.filename === elements.libraryTarget.value ? "" : elements.libraryTarget.value;
  filterCatalogueMenu(elements.libraryTargetMenu, query);
  elements.libraryTargetMenu.classList.add("show");
  elements.libraryTarget.setAttribute("aria-expanded", "true");
  if (selectCurrentText) selectDisplayedTarget(elements.libraryTarget, selected?.filename);
}

function selectLibraryTarget(spectrumId) {
  const spectrum = state.index.spectra[spectrumId];
  if (!spectrum) return;
  elements.libraryTarget.classList.remove("is-invalid");
  elements.libraryTarget.value = spectrum.filename;
  elements.libraryTarget.dataset.selectedSpectrumId = spectrumId;
  closeCatalogueMenus();
  selectSpectrum(spectrumId);
}

function runLibraryTargetSearch(value) {
  const query = normaliseDesignation(value ?? elements.libraryTarget.value);
  const exact = [...elements.libraryTargetMenu.querySelectorAll("[data-spectrum-id]")]
    .find((option) => {
      const spectrum = state.index.spectra[option.dataset.spectrumId];
      return [spectrum.filename, ...spectrum.aliases].some((name) => normaliseDesignation(name) === query);
    });
  if (exact) {
    selectLibraryTarget(exact.dataset.spectrumId);
    return;
  }
  elements.libraryTarget.classList.add("is-invalid");
  elements.spectrumHelp.textContent = "Choose a target from the filtered list.";
  openLibraryTargetMenu();
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

function simbadUrl(identifier) {
  return `https://simbad.u-strasbg.fr/simbad/sim-basic?Ident=${encodeURIComponent(identifier)}&submit=SIMBAD+search`;
}

function sourceNameLink(spectrum, isCurrent, target) {
  const library = state.index.libraries[spectrum.library];
  const objectName = target || spectrum.target || spectrum.aliases?.[0] || spectrum.filename;
  return `<div class="source-name-row${isCurrent ? " is-current" : ""}">
    <a class="source-name" href="#plotly-chart" data-spectrum-id="${escapeHtml(spectrum.id)}" title="Display ${escapeHtml(spectrum.file)}">${escapeHtml(spectrum.filename)}</a>
    <span class="source-library">${escapeHtml(spectrum.group)} · ${escapeHtml(library.label)}</span>
    <a class="source-simbad" href="${escapeHtml(simbadUrl(objectName))}" target="_blank" rel="noopener noreferrer" title="Open ${escapeHtml(objectName)} in SIMBAD">SIMBAD ↗</a>
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
        <div class="d-flex flex-wrap gap-2">
          ${coordinate ? `<button class="btn btn-sm btn-outline-secondary" type="button" data-copy-coordinate="${escapeHtml(coordinateCopy)}">Copy coordinates</button>` : ""}
        </div>
        <p class="muted-copy mt-3 mb-0">Selected target: <strong>${escapeHtml(target || spectrum.filename)}</strong></p>
      </div>
      <div class="col-md-7">
        <div class="card-kicker">Available source names and libraries</div>
        <div class="source-name-list">${orderedRelated.map((item) => sourceNameLink(item, item.id === spectrum.id, target)).join("")}</div>
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
  clearVisibility();
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
  clearVisibility();
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

function localDateValue(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function initialiseVisibilityControls() {
  elements.visibilityDate.value = localDateValue();
  const options = document.createDocumentFragment();
  for (const [name] of [...OBSERVATORIES].sort(([left], [right]) => left.localeCompare(right))) {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    options.append(option);
  }
  elements.visibilityObservatory.append(options);
}

function visibilitySettings() {
  const [year, month, day] = elements.visibilityDate.value.split("-").map(Number);
  const longitude = Number(elements.visibilityLongitude.value);
  const latitude = Number(elements.visibilityLatitude.value);
  const elevation = Number(elements.visibilityElevation.value);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) throw new Error("Choose an observing date.");
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) throw new Error("Longitude must be between −180° and +180°.");
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) throw new Error("Latitude must be between −90° and +90°.");
  if (!Number.isFinite(elevation) || elevation < -500 || elevation > 10000) throw new Error("Altitude must be between −500 m and 10,000 m.");
  return {
    date: elements.visibilityDate.value,
    year,
    month,
    day,
    longitude,
    latitude,
    elevation,
  };
}

function renderVisibilityChart(data) {
  if (!Visibility.renderChart(elements.visibilityChart, data, elements.visibilityMoon.checked)) {
    elements.visibilityStatus.textContent = "Plotting library is still loading. Try Update visibility again.";
  }
}

async function runVisibility() {
  const request = ++state.visibilityRequest;
  try {
    const rawSettings = visibilitySettings();
    elements.visibilityStatus.textContent = "Resolving timezone from location…";
    const timeZone = await Visibility.resolveTimeZone(rawSettings);
    if (request !== state.visibilityRequest) return;
    const targetName = selectedTarget() || currentSpectrum()?.filename || "Target";
    const observatoryName = elements.visibilityObservatory.value || "Custom location";
    const data = Visibility.buildData(Visibility.withTimeZone(rawSettings, timeZone), selectedCoordinate(), targetName, observatoryName);
    state.visibility = data;
    elements.visibilityTarget.textContent = data.targetName;
    renderVisibilityChart(data);
    const offset = `UTC${data.settings.utcOffset >= 0 ? "+" : ""}${data.settings.utcOffset}`;
    elements.visibilityStatus.textContent = `${data.settings.timeZone} · ${offset} · derived from location and date.`;
  } catch (error) {
    if (request !== state.visibilityRequest) return;
    elements.visibilityStatus.textContent = error.message;
  }
}

function markVisibilityStale() {
  state.visibilityRequest += 1;
  if (state.visibility) elements.visibilityStatus.textContent = "Location or date changed. Select Update visibility to recalculate.";
}

function selectVisibilityObservatory() {
  const observatory = OBSERVATORIES.find(([name]) => name === elements.visibilityObservatory.value);
  if (!observatory) return;
  const [, longitude, latitude, elevation] = observatory;
  elements.visibilityLongitude.value = longitude;
  elements.visibilityLatitude.value = latitude;
  elements.visibilityElevation.value = elevation;
  markVisibilityStale();
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
    button.addEventListener("click", () => {
      setMode(button.dataset.mode);
      setMobileSidebar(false);
    });
  });
  elements.sidebarToggle?.addEventListener("click", () => setMobileSidebar(!document.body.classList.contains("sidebar-open")));
  elements.sidebarClose?.addEventListener("click", () => setMobileSidebar(false));
  elements.sidebarBackdrop?.addEventListener("click", () => setMobileSidebar(false));
  window.addEventListener("resize", () => {
    if (!window.matchMedia("(max-width: 991.98px)").matches) setMobileSidebar(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMobileSidebar(false);
  });
  elements.globalTargetButton.addEventListener("click", () => runGlobalSearch(elements.globalTarget.value));
  elements.globalTarget.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      runGlobalSearch(event.currentTarget.value);
    }
  });
  [[elements.globalTarget, elements.globalTargetMenu]].forEach(([input, menu]) => {
    input.addEventListener("focus", () => openCatalogueMenu(input, menu, true));
    input.addEventListener("click", () => openCatalogueMenu(input, menu, true));
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
  elements.libraryTarget.addEventListener("focus", () => openLibraryTargetMenu(true));
  elements.libraryTarget.addEventListener("click", () => openLibraryTargetMenu(true));
  elements.libraryTarget.addEventListener("input", () => {
    elements.libraryTarget.classList.remove("is-invalid");
    delete elements.libraryTarget.dataset.selectedSpectrumId;
    openLibraryTargetMenu();
  });
  elements.libraryTarget.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    runLibraryTargetSearch(event.currentTarget.value);
  });
  elements.libraryTargetMenu.addEventListener("click", (event) => {
    const option = event.target.closest("[data-spectrum-id]");
    if (option) selectLibraryTarget(option.dataset.spectrumId);
  });
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
  elements.visibilityRun.addEventListener("click", () => runVisibility());
  elements.visibilityMoon.addEventListener("change", () => {
    if (state.visibility) renderVisibilityChart(state.visibility);
  });
  elements.visibilityObservatory.addEventListener("change", selectVisibilityObservatory);
  elements.visibilityDate.addEventListener("input", markVisibilityStale);
  elements.visibilityToday.addEventListener("click", () => {
    elements.visibilityDate.value = localDateValue();
    markVisibilityStale();
  });
  [elements.visibilityLongitude, elements.visibilityLatitude, elements.visibilityElevation].forEach((control) => {
    control.addEventListener("input", () => {
      elements.visibilityObservatory.value = "";
      markVisibilityStale();
    });
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
  initialiseVisibilityControls();
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
