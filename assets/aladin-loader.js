const sources = [
  "https://cdn.jsdelivr.net/npm/aladin-lite@3.8.2/dist/aladin.js",
  "https://unpkg.com/aladin-lite@3.8.2/dist/aladin.js",
];

let lastError;
for (const source of sources) {
  try {
    const { default: Aladin } = await import(source);
    window.A = Aladin;
    window.dispatchEvent(new Event("aladinready"));
    break;
  } catch (error) {
    lastError = error;
  }
}

if (!window.A) console.warn("Aladin Lite could not be loaded", lastError);
