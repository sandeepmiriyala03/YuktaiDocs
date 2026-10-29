/* YuktaiDocs settings — the only file to change for a new YuktAI release.
 *
 *   1. Set `version` to the new release (for example "5.3.10").
 *   2. Bump CACHE in sw.js (for example "yuktaidocs-v2") so visitors get it.
 *   3. Commit and push: Netlify redeploys the site.
 *
 * Try a release without changing anything: add ?v=5.3.10 to any page URL
 * (kept for this browser tab; ?v=default goes back).
 */
window.DOCS_CONFIG = {
  version: "5.3.12",
  // Used only if `version` cannot be loaded (for example, not published yet).
  fallbackVersion: "5.3.11",
  // Tried in order; the second one is used only if the first fails.
  cdns: [
    "https://cdn.jsdelivr.net/npm/@yuktishaalaa/yuktai@{v}/vanilla/index.min.js",
    "https://unpkg.com/@yuktishaalaa/yuktai@{v}/vanilla/index.min.js"
  ],
  npm: "https://www.npmjs.com/package/@yuktishaalaa/yuktai",
  repo: "https://github.com/sandeepmiriyala03/yuktai",
  site: "https://aksharatantra.miriyala.in"
};

(function () {
  var KEY_V = "docs-yuktai-version", KEY_C = "docs-yuktai-config";
  var cfg = window.DOCS_CONFIG;
  cfg.pinned = cfg.version;
  try {
    var q = new URLSearchParams(location.search).get("v");
    if (q === "default") sessionStorage.removeItem(KEY_V);
    else if (q && /^\d+\.\d+\.\d+(-[0-9A-Za-z.]+)?$/.test(q)) sessionStorage.setItem(KEY_V, q);
    var v = sessionStorage.getItem(KEY_V);
    if (v && v !== cfg.version) { cfg.version = v; cfg.override = true; }
  } catch (e) {}

  var hasPrefs = false;
  try { hasPrefs = !!localStorage.getItem("yuktai-a11y-prefs"); } catch (e) {}

  /* Floating ♿ and 🛠 buttons for every page of this site. */
  var base = {
    position: "left",
    primaryColor: "#0a4a85",
    title: "Accessibility",
    showPageTools: true,
    defaultTab: "ask",
    voiceLang: "en-IN",
    // This site has its own skip link; auto-fix stays off so the
    // practice areas keep their problems for the page tools to find.
    config: { showSkipLinks: false, autoFix: false },
    // Restore saved settings on load; first-time visitors get no toast.
    applyOnLoad: hasPrefs
  };

  /* The Accessibility page can try a different widget setup on this site
     ("Try it on this site"); it is kept for this browser tab only. */
  try {
    var custom = JSON.parse(sessionStorage.getItem(KEY_C) || "null");
    if (custom && typeof custom === "object") {
      ["position", "primaryColor", "title", "showPageTools", "defaultTab", "voiceLang"].forEach(function (k) {
        if (k in custom) base[k] = custom[k];
      });
      if (custom.config && typeof custom.config === "object") {
        base.config = Object.assign({}, base.config, custom.config);
      }
      cfg.customWidget = true;
    }
  } catch (e) {}

  window.YUKTAI_CONFIG = base;
})();
