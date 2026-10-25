/* Accessibility page: live settings + YUKTAI_CONFIG / YuktAIWrapper builder. */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var out = $("a11y-out");

  /* ── 1. settings from code ── */
  Docs.ready(function (Y) {
    function show(note) {
      out.textContent = (note ? note + "\n\n" : "") + JSON.stringify(Y.getSettings(), null, 2);
    }
    document.querySelectorAll("[data-a11y]").forEach(function (b) {
      b.addEventListener("click", function () {
        var s = JSON.parse(b.getAttribute("data-a11y"));
        Promise.resolve(Y.apply(s)).then(function () { show("yuktai.apply(" + JSON.stringify(s) + ")"); });
      });
    });
    $("a11y-cb").addEventListener("change", function (e) {
      var s = { colorBlindMode: e.target.value };
      Promise.resolve(Y.apply(s)).then(function () { show("yuktai.apply(" + JSON.stringify(s) + ")"); });
    });
    $("a11y-open").addEventListener("click", function () { Y.open(); });
    $("a11y-tools").addEventListener("click", function () { Y.openTools("qa"); });
    $("a11y-reset").addEventListener("click", function () {
      Promise.resolve(Y.reset()).then(function () { $("a11y-cb").value = "none"; show("yuktai.reset()"); });
    });
    var cur = Y.getSettings();
    if (cur && cur.colorBlindMode) $("a11y-cb").value = cur.colorBlindMode;
    show();
  });

  /* ── 2. builder ── */
  var cfg = window.YUKTAI_CONFIG || {};
  var f = {
    position: $("cfg-position"), color: $("cfg-color"), title: $("cfg-title"), tab: $("cfg-tab"),
    voice: $("cfg-voice"), tools: $("cfg-tools"), autofix: $("cfg-autofix"), skip: $("cfg-skip")
  };
  f.position.value = cfg.position === "right" ? "right" : "left";
  if (/^#[0-9a-f]{6}$/i.test(cfg.primaryColor || "")) f.color.value = cfg.primaryColor;
  f.title.value = cfg.title || "Accessibility";
  if (cfg.defaultTab) f.tab.value = cfg.defaultTab;
  if (cfg.voiceLang) f.voice.value = cfg.voiceLang;
  f.tools.checked = cfg.showPageTools !== false;
  f.autofix.checked = !!(cfg.config && cfg.config.autoFix);
  f.skip.checked = !!(cfg.config && cfg.config.showSkipLinks);

  function lum(hex) {
    var c = [1, 3, 5].map(function (i) {
      var v = parseInt(hex.substr(i, 2), 16) / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function ratioWhite(hex) { return 1.05 / (lum(hex) + 0.05); }
  function q(s) { return JSON.stringify(s); }

  function current() {
    return {
      position: f.position.value,
      primaryColor: f.color.value,
      title: f.title.value.trim() || "Accessibility",
      showPageTools: f.tools.checked,
      defaultTab: f.tab.value,
      voiceLang: f.voice.value,
      config: { autoFix: f.autofix.checked, showSkipLinks: f.skip.checked }
    };
  }

  function render() {
    var c = current(), r = ratioWhite(c.primaryColor);
    var note = $("cfg-color-note");
    note.textContent = "White icon on this colour: " + r.toFixed(1) + ":1" + (r >= 4.5 ? " (passes)" : " (below 4.5:1, choose a darker colour)");
    note.style.color = r >= 4.5 ? "" : "var(--d-rust)";
    note.style.fontWeight = r >= 4.5 ? "" : "700";

    var cdn = "https://cdn.jsdelivr.net/npm/@yuktishaalaa/yuktai@" + Docs.version + "/vanilla/index.min.js";
    var lines = [
      "  position: " + q(c.position) + ",",
      "  primaryColor: " + q(c.primaryColor) + ",",
      "  title: " + q(c.title) + ","
    ];
    if (c.showPageTools) lines.push("  showPageTools: true,", "  defaultTab: " + q(c.defaultTab) + ",", "  voiceLang: " + q(c.voiceLang) + ",");
    lines.push("  config: { autoFix: " + c.config.autoFix + ", showSkipLinks: " + c.config.showSkipLinks + " }");
    Docs.setCode("cfg-code", "vanilla",
      "<!-- before </body>, on every page -->\n<script>\n  window.YUKTAI_CONFIG = {\n" +
      lines.map(function (l) { return "  " + l; }).join("\n") + "\n  }\n</script>\n<script src=\"" + cdn + "\"></script>");

    var props = ['      position="' + c.position + '"', "      showAccessibility"];
    if (c.showPageTools) {
      props.push("      showRag            // 💬 Ask page (the page tools' Ask tab)");
      props.push('      engine="rust"');
    }
    props.push("      config={{ autoFix: " + c.config.autoFix + ", showSkipLinks: " + c.config.showSkipLinks + " }}");
    Docs.setCode("cfg-code", "next",
      '"use client"\nimport { YuktAIWrapper } from "@yuktishaalaa/yuktai"\nimport type { ReactNode } from "react"\n\n' +
      "export default function YuktaiClient({ children }: { children: ReactNode }) {\n  return (\n    <YuktAIWrapper\n" +
      props.join("\n") + "\n    >\n      {children}\n    </YuktAIWrapper>\n  )\n}\n\n// app/layout.tsx: <body><YuktaiClient>{children}</YuktaiClient></body>");
  }
  Object.keys(f).forEach(function (k) { f[k].addEventListener("input", render); f[k].addEventListener("change", render); });
  render();

  $("cfg-state").textContent = window.DOCS_CONFIG.customWidget
    ? "This tab is using your setup. “Back to the site default” undoes it."
    : "The site default is in use.";
  $("cfg-try").addEventListener("click", function () {
    try { sessionStorage.setItem("docs-yuktai-config", JSON.stringify(current())); } catch (e) {}
    location.reload();
  });
  $("cfg-default").addEventListener("click", function () {
    try { sessionStorage.removeItem("docs-yuktai-config"); } catch (e) {}
    location.reload();
  });
})();
