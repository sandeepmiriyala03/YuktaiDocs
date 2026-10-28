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
    syncWhich(shown);
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
  function pngBlob(px, name) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () {
        var cv = document.createElement("canvas"); cv.width = px; cv.height = px;
        cv.getContext("2d").drawImage(img, 0, 0, px, px);
        cv.toBlob(function (b) { if (b) resolve(b); else reject(new Error("toBlob")); }, "image/png");
      };
      img.onerror = function () { reject(new Error("image")); };
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg(name || state.sel, px));
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


  /* ── Download all: one picture (PNG), ZIP of SVG / PNG files, SVG sprite ──
     Everything is made in the browser with the choices above, so it also works offline. */
  var allStatus = $("st-all-status"), working = false;
  function allSay(t, warn) { allStatus.textContent = t; allStatus.className = "st-all-status" + (warn ? " warn" : ""); }
  function shownNames() { return tiles.filter(function (t) { return !t.parentNode.hidden; }).map(function (t) { return t.getAttribute("data-icon"); }); }
  function syncWhich(shown) {
    var filtered = shown < NAMES.length;
    $("st-which-all").textContent = "All (" + NAMES.length + ")";
    $("st-which-shown").textContent = filtered ? "Search results (" + shown + ")" : "Search results";
    var sr = document.querySelector('input[name="st-which"][value="shown"]');
    sr.disabled = !filtered || shown === 0;
    if (sr.disabled && sr.checked) document.querySelector('input[name="st-which"][value="all"]').checked = true;
  }
  function chosenNames() {
    var r = document.querySelector('input[name="st-which"]:checked');
    return r && r.value === "shown" ? shownNames() : NAMES.slice();
  }
  function baseName(px) {
    return "yuktai-icons-" + state.variant + (state.variant === "filled" && state.shape === "circle" ? "-circle" : "") + "-" + state.color.replace("#", "") + (px ? "-" + px + "px" : "");
  }
  /* run one job at a time; the button shows it is busy */
  function job(btn, fn) {
    if (working) return;
    working = true; btn.setAttribute("aria-busy", "true");
    Promise.resolve().then(fn).then(function (msg) { if (msg && typeof msg === "object") allSay(msg.text, msg.warn); else allSay(msg); }, function (e) {
      allSay("Sorry, that did not work in this browser (" + (e && e.message ? e.message : "error") + ").", true);
    }).then(function () { working = false; btn.removeAttribute("aria-busy"); });
  }

  /* one picture */
  var BG = {
    white: { fill: "#ffffff", text: "#38445a", head: "#0b1220", line: "#d5dbe5", ref: "#ffffff" },
    dark: { fill: "#0b1220", text: "#c8d2e2", head: "#f5f7fb", line: "#33415c", ref: "#0b1220" },
    none: { fill: null, text: "#38445a", head: "#0b1220", line: null, ref: "#ffffff" }
  };
  function loadImg(markup) {
    return new Promise(function (res, rej) {
      var img = new Image();
      img.onload = function () { res(img); };
      img.onerror = function () { rej(new Error("image")); };
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(markup);
    });
  }
  function roundRect(c, x, y, w, h, r) {
    c.beginPath(); c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r);
    c.lineTo(x + w, y + h - r); c.quadraticCurveTo(x + w, y + h, x + w - r, y + h); c.lineTo(x + r, y + h);
    c.quadraticCurveTo(x, y + h, x, y + h - r); c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y); c.closePath();
  }
  function fit(c, text, max) {
    if (c.measureText(text).width <= max) return text;
    while (text.length > 1 && c.measureText(text + "…").width > max) text = text.slice(0, -1);
    return text + "…";
  }
  function bgKey() { var r = document.querySelector('input[name="st-bg"]:checked'); return r ? r.value : "white"; }
  function contrastNote(bg) {
    var edge = ratio(state.color, bg.ref);
    return edge < 3 ? " Note: this colour has only " + edge.toFixed(1) + ":1 contrast on the " + (bg.ref === "#ffffff" ? "white" : "dark") + " background; try the other background." : "";
  }
  function makeSheet(names) {
    var bg = BG[bgKey()], showNames = $("st-names").checked, scale = $("st-hd").checked ? 2 : 1;
    var px = Math.max(16, Math.min(128, state.size));
    var cellW = Math.max(px + 32, showNames ? 112 : 0), cellH = px + 28 + (showNames ? 20 : 0);
    var cols = Math.max(1, Math.min(names.length, Math.floor(1600 / cellW) || 1));
    var rows = Math.ceil(names.length / cols), pad = 24, headH = 64;
    var W = pad * 2 + cols * cellW, H = pad * 2 + headH + rows * cellH;
    return Promise.all(names.map(function (n) { return loadImg(svg(n, px * scale)); })).then(function (imgs) {
      var cv = document.createElement("canvas");
      cv.width = W * scale; cv.height = H * scale;
      var c = cv.getContext("2d");
      c.scale(scale, scale);
      if (bg.fill) { c.fillStyle = bg.fill; c.fillRect(0, 0, W, H); }
      c.textBaseline = "top";
      c.fillStyle = bg.head; c.font = "700 22px system-ui, -apple-system, Segoe UI, sans-serif";
      c.fillText("YuktAI icons", pad, pad);
      c.fillStyle = bg.text; c.font = "14px system-ui, -apple-system, Segoe UI, sans-serif";
      c.fillText(names.length + " icons · " + state.variant + (state.variant === "filled" ? " " + state.shape : "") + " · " + state.color + " · " + px + " px · YuktAI " + Docs.version, pad, pad + 32);
      imgs.forEach(function (img, i) {
        var x = pad + (i % cols) * cellW, y = pad + headH + Math.floor(i / cols) * cellH;
        if (bg.line) { c.strokeStyle = bg.line; c.lineWidth = 1; roundRect(c, x + 4.5, y + 4.5, cellW - 9, cellH - 9, 10); c.stroke(); }
        c.drawImage(img, x + (cellW - px) / 2, y + 14, px, px);
        if (showNames) {
          c.fillStyle = bg.text; c.font = "12px ui-monospace, SFMono-Regular, Consolas, monospace"; c.textAlign = "center";
          c.fillText(fit(c, names[i], cellW - 14), x + cellW / 2, y + 14 + px + 8);
          c.textAlign = "left";
        }
      });
      return new Promise(function (res, rej) { cv.toBlob(function (b) { b ? res({ blob: b, w: cv.width, h: cv.height }) : rej(new Error("toBlob")); }, "image/png"); });
    });
  }
  $("st-sheet").addEventListener("click", function () {
    var btn = this;
    job(btn, function () {
      var names = chosenNames(), bg = BG[bgKey()];
      allSay("Drawing " + names.length + " icons…");
      return makeSheet(names).then(function (r) {
        var name = baseName(Math.max(16, Math.min(128, state.size))) + "-sheet.png";
        saveBlob(r.blob, name);
        var note = contrastNote(bg);
        return { text: name + " downloaded (" + r.w + " × " + r.h + " px)." + note, warn: !!note };
      });
    });
  });

  /* ZIP (stored, no compression: small code, works offline) */
  var CRC = (function () {
    var t = new Uint32Array(256);
    for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
    return t;
  })();
  function crc32(u8) { var c = 0xffffffff; for (var i = 0; i < u8.length; i++) c = CRC[(c ^ u8[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
  function makeZip(files) {
    var enc = new TextEncoder(), parts = [], central = [], offset = 0, d = new Date();
    var dosTime = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
    var dosDate = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    files.forEach(function (f) {
      var name = enc.encode(f.name), data = typeof f.data === "string" ? enc.encode(f.data) : f.data, crc = crc32(data), size = data.length;
      var h = new DataView(new ArrayBuffer(30));
      h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true);
      h.setUint16(10, dosTime, true); h.setUint16(12, dosDate, true); h.setUint32(14, crc, true);
      h.setUint32(18, size, true); h.setUint32(22, size, true); h.setUint16(26, name.length, true); h.setUint16(28, 0, true);
      parts.push(new Uint8Array(h.buffer), name, data);
      var cd = new DataView(new ArrayBuffer(46));
      cd.setUint32(0, 0x02014b50, true); cd.setUint16(4, 20, true); cd.setUint16(6, 20, true); cd.setUint16(8, 0x0800, true);
      cd.setUint16(10, 0, true); cd.setUint16(12, dosTime, true); cd.setUint16(14, dosDate, true); cd.setUint32(16, crc, true);
      cd.setUint32(20, size, true); cd.setUint32(24, size, true); cd.setUint16(28, name.length, true);
      cd.setUint32(42, offset, true);
      central.push(new Uint8Array(cd.buffer), name);
      offset += 30 + name.length + size;
    });
    var cdSize = central.reduce(function (n, p) { return n + p.length; }, 0);
    var end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true);
    end.setUint32(12, cdSize, true); end.setUint32(16, offset, true);
    return new Blob(parts.concat(central, [new Uint8Array(end.buffer)]), { type: "application/zip" });
  }
  function readme(kind, n) {
    return "YuktAI icons (" + n + ", " + kind + ")\r\n" +
      "Style: " + state.variant + (state.variant === "filled" ? " " + state.shape : "") + "  Colour: " + state.color + "  Size: " + state.size + " px\r\n" +
      "Made with YuktaiDocs Icon studio, YuktAI " + Docs.version + "\r\n\r\n" +
      "Original YuktAI designs, free to use under GPL-3.0.\r\n" +
      "Tip: icons without a label are decorative. Give meaningful icons an alt text (img) or aria-label.\r\n" +
      "npm: @yuktishaalaa/yuktai   Docs: https://yuktaidocs.netlify.app/\r\n";
  }
  $("st-zip-svg").addEventListener("click", function () {
    var btn = this;
    job(btn, function () {
      var names = chosenNames();
      var files = names.map(function (n) { return { name: n + ".svg", data: svg(n, state.size) }; });
      files.push({ name: "README.txt", data: readme("SVG", names.length) });
      var name = baseName(state.size) + "-svg.zip";
      saveBlob(makeZip(files), name);
      return name + " downloaded: " + names.length + " SVG files.";
    });
  });
  $("st-zip-png").addEventListener("click", function () {
    var btn = this;
    job(btn, function () {
      var names = chosenNames(), files = [], i = 0;
      function next() {
        if (i >= names.length) {
          files.push({ name: "README.txt", data: readme("PNG " + state.size + " px", names.length) });
          var name = baseName(state.size) + "-png.zip";
          saveBlob(makeZip(files), name);
          return name + " downloaded: " + names.length + " PNG files at " + state.size + " px.";
        }
        var n = names[i++];
        if (i % 10 === 1 || i === names.length) allSay("Making PNG " + i + " of " + names.length + "…");
        return pngBlob(state.size, n).then(function (b) { return b.arrayBuffer(); }).then(function (buf) {
          files.push({ name: n + ".png", data: new Uint8Array(buf) });
          return next();
        });
      }
      return next();
    });
  });

  /* SVG sprite: one file, every icon as a <symbol> */
  $("st-sprite").addEventListener("click", function () {
    var btn = this;
    job(btn, function () {
      var names = chosenNames(), filled = state.variant === "filled";
      var symbols = names.map(function (n) {
        var inner = svg(n, 24).replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "").replace(/<style>.*?<\/style>/, "");
        return '  <symbol id="yi-' + n + '" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round">' + inner + "</symbol>";
      }).join("\n");
      var file = '<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n' +
        "<!-- YuktAI icons sprite (" + names.length + "), " + state.variant + " " + state.color + ". Original YuktAI designs, GPL-3.0.\n" +
        '     Use: <svg width="24" height="24" role="img" aria-label="Search"><use href="yuktai-icons.svg#yi-search"/></svg> -->\n' +
        (filled ? "  <defs><style>" + FORCED + "</style></defs>\n" : "") + symbols + "\n</svg>\n";
      var name = baseName(0) + "-sprite.svg";
      saveBlob(new Blob([file], { type: "image/svg+xml" }), name);
      return name + " downloaded: " + names.length + " symbols. Use them with <use href=\"" + name + "#yi-search\">.";
    });
  });

  /* start */
  tiles.forEach(function (t) { t.tabIndex = t.getAttribute("data-icon") === state.sel ? 0 : -1; });
  render();
  window.__iconStudio = { state: state, svg: svg, ratio: ratio, reactCode: reactCode, htmlCode: htmlCode, names: NAMES };
});
