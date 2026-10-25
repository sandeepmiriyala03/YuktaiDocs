/* Icon studio. The icon list and drawings come from the YuktAI script that is
   loaded (yuktai.iconNames / yuktai.icon), so a new release's icons appear
   here without changing this file. Rendering mirrors YuktAI's IconBase
   (outline 2.5; filled = rounded square or circle, glyph at 70 %, white or
   ink picked for contrast), so downloads match the React components. */
Docs.ready(function (Y) {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var NAMES = (Y.iconNames || []).slice();
  var PATHS = {};
  NAMES.forEach(function (n) {
    var m = /<g [^>]*>([\s\S]*)<\/g><\/svg>\s*$/.exec(Y.icon(n, { size: 24, color: "#000000", strokeWidth: 2.5 }));
    if (m) PATHS[n] = m[1];
  });
  NAMES = NAMES.filter(function (n) { return PATHS[n]; });
  var SPECIAL = { left: "ChevronLeftIcon", right: "ChevronRightIcon" };
  function comp(n) { return SPECIAL[n] || n.charAt(0).toUpperCase() + n.slice(1) + "Icon"; }

  var WHITE = "#ffffff", INK = "#111827", MIN = 8, MAX = 1024;
  var FORCED = "@media (forced-colors: active){.yi-bg{fill:CanvasText}.yi-glyph{stroke:Canvas;color:Canvas}}";
  var state = { q: "", variant: "outline", shape: "rounded", color: "#084d31", size: 24, stroke: "auto", sel: PATHS.accessibility ? "accessibility" : NAMES[0] };
  try {
    var saved = JSON.parse(localStorage.getItem("docs-icon-studio") || "null");
    if (saved) {
      state.variant = saved.variant === "filled" ? "filled" : "outline";
      state.shape = saved.shape === "circle" ? "circle" : "rounded";
      if (/^#[0-9a-f]{6}$/i.test(saved.color)) state.color = saved.color;
      if (saved.size >= MIN && saved.size <= MAX) state.size = Math.round(saved.size);
      if (["auto", "1.5", "2", "3"].indexOf(saved.stroke) >= 0) state.stroke = saved.stroke;
      if (PATHS[saved.sel]) state.sel = saved.sel;
    }
  } catch (e) {}
  function save() {
    try { localStorage.setItem("docs-icon-studio", JSON.stringify({ variant: state.variant, shape: state.shape, color: state.color, size: state.size, stroke: state.stroke, sel: state.sel })); } catch (e) {}
  }

  function lum(hex) {
    var c = [1, 3, 5].map(function (i) { var v = parseInt(hex.substr(i, 2), 16) / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function ratio(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  function glyphFor(bg) { return ratio(WHITE, bg) >= ratio(INK, bg) ? WHITE : INK; }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;"); }
  function strokeW() { return state.stroke === "auto" ? (state.variant === "filled" ? 2.6 : 2.5) : Number(state.stroke); }

  function svg(name, size, label) {
    var p = PATHS[name], c = state.color, sw = strokeW();
    var a11y = label ? 'role="img" aria-label="' + esc(label) + '"' : 'aria-hidden="true"';
    var open = '<svg xmlns="http://www.w3.org/2000/svg" ' + a11y + ' focusable="false" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round" data-variant="' + state.variant + '">';
    if (state.variant !== "filled") return open + '<g color="' + c + '" stroke="' + c + '" stroke-width="' + sw + '">' + p + "</g></svg>";
    var g = glyphFor(c);
    var bg = state.shape === "circle" ? '<circle class="yi-bg" cx="12" cy="12" r="12" fill="' + c + '"/>' : '<rect class="yi-bg" width="24" height="24" rx="6" fill="' + c + '"/>';
    return open + "<style>" + FORCED + "</style>" + bg + '<g class="yi-glyph" color="' + g + '" stroke="' + g + '" stroke-width="' + sw + '" transform="translate(3.6 3.6) scale(0.7)">' + p + "</g></svg>";
  }
  function reactCode(n) {
    var extra = state.variant === "filled" ? ' variant="filled"' + (state.shape === "circle" ? ' shape="circle"' : "") : "";
    if (state.stroke !== "auto") extra += " strokeWidth={" + state.stroke + "}";
    return "import { " + comp(n) + ' } from "@yuktishaalaa/yuktai/icons"\n\n<' + comp(n) + " size={" + state.size + '} color="' + state.color + '"' + extra + " />";
  }
  function htmlCode(n) {
    var extra = state.variant === "filled" ? ', variant: "filled"' + (state.shape === "circle" ? ', shape: "circle"' : "") : "";
    return '<span id="icon-' + n + '"></span>\n<script>\n  document.getElementById("icon-' + n + '").innerHTML =\n    yuktai.icon("' + n + '", { size: ' + state.size + ', color: "' + state.color + '", strokeWidth: ' + strokeW() + extra + " })\n</scr" + "ipt>";
  }

  /* tiles */
  var grid = $("st-grid");
  grid.innerHTML = NAMES.map(function (n) {
    return '<li><button type="button" class="st-tile" data-icon="' + n + '" aria-pressed="false" tabindex="-1"><span class="st-ico"></span><span class="st-label">' + n + "</span></button></li>";
  }).join("");
  var tiles = Array.prototype.slice.call(grid.querySelectorAll(".st-tile"));
  var live = $("st-live"), statusEl = $("st-status");
  function say(t) { live.textContent = ""; setTimeout(function () { live.textContent = t; }, 30); }

  function contrastText() {
    if (state.variant === "filled") {
      var g = glyphFor(state.color), r = ratio(g, state.color), edge = ratio(state.color, WHITE);
      return { text: "Glyph " + (g === WHITE ? "white" : "dark") + " on this colour: " + r.toFixed(1) + ":1" + (r >= 3 ? " (passes WCAG 3:1)" : " (below WCAG 3:1, pick a darker or lighter colour)") + " · shape on white: " + edge.toFixed(1) + ":1", ok: r >= 3 };
    }
    var r2 = ratio(state.color, WHITE);
    return { text: "This colour on white: " + r2.toFixed(1) + ":1" + (r2 >= 3 ? " (passes WCAG 3:1 for icons)" : " (below WCAG 3:1, too light for icons on white)"), ok: r2 >= 3 };
  }
  function renderTiles() {
    var q = state.q.trim().toLowerCase(), shown = 0, disp = Math.min(state.size, 64);
    tiles.forEach(function (t) {
      var n = t.getAttribute("data-icon"), match = !q || n.toLowerCase().indexOf(q) >= 0 || comp(n).toLowerCase().indexOf(q) >= 0;
      t.parentNode.hidden = !match;
      if (match) shown++;
      t.querySelector(".st-ico").innerHTML = svg(n, disp);
    });
    $("st-empty").hidden = shown > 0;
    statusEl.textContent = shown + " of " + NAMES.length + " icons in YuktAI " + Docs.version + " · " + contrastText().text;
    return shown;
  }
  function renderDetail() {
    var n = state.sel, c = contrastText(), shownAt = Math.min(state.size, 112);
    $("st-preview").innerHTML = svg(n, shownAt);
    $("st-name").textContent = n + "  ·  " + comp(n);
    var ce = $("st-contrast");
    ce.textContent = c.text + (state.size > 112 ? " · preview scaled to 112 of " + state.size + " px" : " · shown at " + state.size + " px");
    ce.className = "st-contrast" + (c.ok ? "" : " warn");
    $("st-react").textContent = reactCode(n);
    $("st-html").textContent = htmlCode(n);
    $("st-png-label").textContent = "Download PNG · " + state.size + "px";
    tiles.forEach(function (t) { t.setAttribute("aria-pressed", t.getAttribute("data-icon") === n ? "true" : "false"); });
  }
  function syncSize() {
    $("st-size").value = state.size;
    $("st-range").value = Math.min(512, state.size);
    Array.prototype.forEach.call(document.querySelectorAll(".st-chip"), function (b) {
      b.setAttribute("aria-pressed", Number(b.getAttribute("data-size")) === state.size ? "true" : "false");
    });
  }
  function render() { renderTiles(); renderDetail(); syncSize(); save(); }

  /* controls */
  $("st-q").addEventListener("input", function (e) { state.q = e.target.value; say(renderTiles() + " icons"); });
  function bindRadios(name, init, set) {
    Array.prototype.forEach.call(document.querySelectorAll('input[name="' + name + '"]'), function (r) {
      if (init(r)) r.checked = true;
      r.addEventListener("change", function () { if (r.checked) { set(r.value); render(); } });
    });
  }
  var custom = $("st-custom");
  bindRadios("st-variant", function (r) { return r.value === state.variant; }, function (v) { state.variant = v; $("st-shape-field").hidden = v !== "filled"; });
  bindRadios("st-shape", function (r) { return r.value === state.shape; }, function (v) { state.shape = v; });
  var anySwatch = false;
  bindRadios("st-color", function (r) { var on = r.value.toLowerCase() === state.color.toLowerCase(); if (on) anySwatch = true; return on; },
    function (v) { state.color = v; custom.parentNode.classList.remove("is-on"); });
  if (!anySwatch) {
    Array.prototype.forEach.call(document.querySelectorAll('input[name="st-color"]'), function (r) { r.checked = false; });
    custom.value = state.color; custom.parentNode.classList.add("is-on");
  }
  custom.addEventListener("input", function () {
    state.color = custom.value;
    Array.prototype.forEach.call(document.querySelectorAll('input[name="st-color"]'), function (r) { r.checked = false; });
    custom.parentNode.classList.add("is-on");
    render();
  });
  $("st-shape-field").hidden = state.variant !== "filled";

  /* size: type any number, drag the slider, or pick a common size */
  function setSize(v, announce) {
    var n = Math.round(Number(v));
    if (!isFinite(n) || n <= 0) return false;
    n = Math.max(MIN, Math.min(MAX, n));
    state.size = n;
    renderTiles(); renderDetail(); save();
    if (announce) say(n + " pixels");
    return true;
  }
  var sizeIn = $("st-size");
  sizeIn.addEventListener("input", function () {
    var n = Number(sizeIn.value);
    if (n >= MIN && n <= MAX) { setSize(n); $("st-range").value = Math.min(512, state.size); syncChips(); }
  });
  sizeIn.addEventListener("change", function () { if (!setSize(sizeIn.value, true)) sizeIn.value = state.size; syncSize(); });
  $("st-range").addEventListener("input", function (e) { setSize(e.target.value); sizeIn.value = state.size; syncChips(); });
  function syncChips() {
    Array.prototype.forEach.call(document.querySelectorAll(".st-chip"), function (b) {
      b.setAttribute("aria-pressed", Number(b.getAttribute("data-size")) === state.size ? "true" : "false");
    });
  }
  Array.prototype.forEach.call(document.querySelectorAll(".st-chip"), function (b) {
    b.addEventListener("click", function () { setSize(b.getAttribute("data-size"), true); syncSize(); });
  });
  $("st-stroke").value = state.stroke;
  $("st-stroke").addEventListener("change", function (e) { state.stroke = e.target.value; render(); });

  /* select: click, Enter/Space; roving focus with arrow keys */
  function select(n) {
    state.sel = n;
    tiles.forEach(function (t) { t.tabIndex = t.getAttribute("data-icon") === n ? 0 : -1; });
    renderDetail(); save();
    say(n + " selected");
  }
  grid.addEventListener("click", function (e) { var t = e.target.closest(".st-tile"); if (t) select(t.getAttribute("data-icon")); });
  grid.addEventListener("keydown", function (e) {
    var t = e.target.closest(".st-tile"); if (!t) return;
    var vis = tiles.filter(function (x) { return !x.parentNode.hidden; });
    var i = vis.indexOf(t); if (i < 0) return;
    var cols = Math.max(1, Math.round(grid.clientWidth / (t.parentNode.getBoundingClientRect().width + 10)));
    var next = { ArrowRight: i + 1, ArrowLeft: i - 1, ArrowDown: i + cols, ArrowUp: i - cols, Home: 0, End: vis.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    next = Math.max(0, Math.min(vis.length - 1, next));
    vis.forEach(function (x) { x.tabIndex = -1; });
    vis[next].tabIndex = 0; vis[next].focus();
  });

  /* copy */
  Array.prototype.forEach.call(document.querySelectorAll("[data-copy]"), function (b) {
    b.addEventListener("click", function () {
      var k = b.getAttribute("data-copy"), n = state.sel;
      if (k === "react") Docs.copy(reactCode(n), "React code");
      else if (k === "html") Docs.copy(htmlCode(n), "HTML code");
      else Docs.copy(svg(n, state.size), "SVG");
    });
  });

  /* downloads */
  function fileName(ext, px) {
    return "yuktai-" + state.sel + "-" + state.variant + (state.variant === "filled" && state.shape === "circle" ? "-circle" : "") + "-" + state.color.replace("#", "") + "-" + px + "px." + ext;
  }
  function saveBlob(blob, name) {
    var url = URL.createObjectURL(blob), a = document.createElement("a");
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }
  function pngBlob(px) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () {
        var cv = document.createElement("canvas"); cv.width = px; cv.height = px;
        cv.getContext("2d").drawImage(img, 0, 0, px, px);
        cv.toBlob(function (b) { if (b) resolve(b); else reject(new Error("toBlob")); }, "image/png");
      };
      img.onerror = function () { reject(new Error("image")); };
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg(state.sel, px));
    });
  }
  function downloadPng(px) {
    return pngBlob(px).then(function (b) { var name = fileName("png", px); saveBlob(b, name); return name; });
  }
  $("st-png").addEventListener("click", function () {
    downloadPng(state.size).then(function (name) { say(name + " downloaded"); }, function () { say("PNG could not be created in this browser."); });
  });
  $("st-svg").addEventListener("click", function () {
    var name = fileName("svg", state.size);
    saveBlob(new Blob([svg(state.sel, state.size)], { type: "image/svg+xml" }), name);
    say(name + " downloaded");
  });
  $("st-multi").addEventListener("submit", function (e) {
    e.preventDefault();
    var sizes = $("st-sizes").value.split(/[\s,;]+/).map(Number).filter(function (n) { return n >= MIN && n <= MAX; })
      .map(Math.round).filter(function (n, i, a) { return a.indexOf(n) === i; }).slice(0, 12);
    if (!sizes.length) { say("Type sizes between 8 and 1024, separated by commas."); return; }
    var chain = Promise.resolve(), done = [];
    sizes.forEach(function (px) {
      chain = chain.then(function () { return downloadPng(px); }).then(function (n) { done.push(n); return new Promise(function (r) { setTimeout(r, 250); }); });
    });
    chain.then(function () { say(done.length + " PNG files downloaded: " + sizes.join(", ") + " px"); }, function () { say("Some PNGs could not be created."); });
  });

  /* start */
  tiles.forEach(function (t) { t.tabIndex = t.getAttribute("data-icon") === state.sel ? 0 : -1; });
  render();
  window.__iconStudio = { state: state, svg: svg, ratio: ratio, reactCode: reactCode, htmlCode: htmlCode, names: NAMES };
});
