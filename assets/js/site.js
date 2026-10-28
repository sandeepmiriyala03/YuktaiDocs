/* YuktaiDocs — shared behaviour for every page:
 *   loads YuktAI (jsDelivr, unpkg as backup) and tells the page when it is ready,
 *   code tabs (Next.js / Vanilla JS, remembered), copy buttons, theme,
 *   network status, go to top, install as an app, offline service worker,
 *   and a note when a newer YuktAI release is on npm.
 * Page scripts use:  Docs.ready(function (yuktai) { … })
 */
(function () {
  "use strict";
  var cfg = window.DOCS_CONFIG;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var SPRITE = "assets/icons.svg";

  function useIcon(name, cls) {
    return '<svg class="i' + (cls ? " " + cls : "") + '" aria-hidden="true" focusable="false"><use href="' + SPRITE + "#i-" + name + '"/></svg>';
  }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* ── one polite live region for the whole site ── */
  var live = document.createElement("p");
  live.className = "sr-only"; live.id = "docs-live";
  live.setAttribute("role", "status"); live.setAttribute("aria-live", "polite");
  document.body.appendChild(live);
  function say(text) { live.textContent = ""; setTimeout(function () { live.textContent = text; }, 40); }

  /* ── load YuktAI ── */
  var state = "loading", waiting = [], failing = [];
  function flush() {
    var list = state === "ready" ? waiting : failing;
    waiting = []; failing = [];
    list.forEach(function (fn) {
      try { fn(window.yuktai); } catch (e) { console.error("[YuktaiDocs]", e); }
    });
  }
  /* Try every CDN with the chosen version, then with the fallback version. */
  var tries = [];
  [cfg.version, cfg.fallbackVersion].forEach(function (v, k) {
    if (!v || (k && v === cfg.version)) return;
    cfg.cdns.forEach(function (u) { tries.push({ url: u.replace("{v}", v), version: v }); });
  });
  function load(i) {
    if (i >= tries.length) {
      state = "failed";
      $$("[data-needs-yuktai]").forEach(function (el) {
        el.innerHTML = '<p class="loading-note">' + useIcon("wifiOff") + " YuktAI " + esc(cfg.version) +
          " could not load (offline on the first visit, or the CDN is blocked). Reload when you are online.</p>";
      });
      flush();
      return;
    }
    var s = document.createElement("script");
    s.src = tries[i].url;
    s.crossOrigin = "anonymous";
    s.onload = function () {
      if (window.yuktai && typeof window.yuktai.renderGrid === "function") {
        state = "ready"; Docs.source = s.src;
        if (tries[i].version !== cfg.version) {
          // The chosen version is not on the CDN yet: the fallback is running.
          var wanted = cfg.version;
          cfg.version = Docs.version = tries[i].version;
          $$(".ver-text").forEach(function (el) { el.textContent = cfg.version; });
          $$("pre code").forEach(function (c) { c.textContent = c.textContent.split("@" + wanted).join("@" + cfg.version); });
        }
        document.documentElement.setAttribute("data-yuktai", "ready");
        flush();
      } else load(i + 1);
    };
    s.onerror = function () { s.remove(); load(i + 1); };
    document.head.appendChild(s);
  }

  var Docs = (window.Docs = {
    version: cfg.version,
    ready: function (fn, onFail) {
      if (state === "ready") { try { fn(window.yuktai); } catch (e) { console.error("[YuktaiDocs]", e); } return; }
      if (state === "failed") { if (onFail) onFail(); return; }
      waiting.push(fn);
      if (onFail) failing.push(onFail);
    },
    icon: useIcon,
    esc: esc,
    say: say,
    copy: copy,
    /* Replace the code in a code block, e.g. Docs.setCode("grid-code", "next", src) */
    setCode: function (id, fw, src, part, fileName) {
      var cid = id + "-" + fw + "-code" + (part ? "-" + part : "");
      var el = document.getElementById(cid);
      if (el) el.textContent = src;
      var nm = document.getElementById(cid + "-name");
      if (nm && fileName) nm.textContent = fileName;
    },
    /* "Next.js" or "Vanilla" — the visitor's choice for code blocks */
    framework: function () { return currentFw; }
  });
  load(0);

  /* ── copy to clipboard (with a fallback for http and old browsers) ── */
  function copy(text, what) {
    function done() { say((what || "Code") + " copied"); }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); done(); } catch (e) { say("Copy failed. Select the code and copy it."); }
      ta.remove();
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fallback);
    else fallback();
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest(".copy-btn");
    if (!b) return;
    var box = b.closest(".codefile, .snippet");
    var code = box && box.querySelector("pre code");
    if (code) copy(code.textContent, b.getAttribute("data-what"));
    var lbl = b.querySelector(".copy-label");
    if (lbl) { lbl.textContent = "Copied"; setTimeout(function () { lbl.textContent = "Copy"; }, 1600); }
  });

  /* ── code tabs: Next.js / React and Vanilla JS, one choice for the whole site ── */
  var currentFw = "next";
  try { if (localStorage.getItem("docs-fw") === "vanilla") currentFw = "vanilla"; } catch (e) {}
  function showFw(fw, focusTab) {
    currentFw = fw;
    $$("[data-codetabs]").forEach(function (box) {
      var tabs = $$("[role=tab]", box);
      if (!tabs.some(function (t) { return t.getAttribute("data-fw") === fw; })) return;
      tabs.forEach(function (t) {
        var on = t.getAttribute("data-fw") === fw;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
        if (on && focusTab === box) t.focus();
      });
    });
  }
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-codetabs] [role=tab]");
    if (!t) return;
    var fw = t.getAttribute("data-fw");
    try { localStorage.setItem("docs-fw", fw); } catch (err) {}
    showFw(fw);
  });
  document.addEventListener("keydown", function (e) {
    var t = e.target.closest && e.target.closest("[data-codetabs] [role=tab]");
    if (!t) return;
    var box = t.closest("[data-codetabs]"), tabs = $$("[role=tab]", box), i = tabs.indexOf(t);
    var n = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
    if (n === undefined) return;
    e.preventDefault();
    n = (n + tabs.length) % tabs.length;
    var fw = tabs[n].getAttribute("data-fw");
    try { localStorage.setItem("docs-fw", fw); } catch (err) {}
    showFw(fw, box);
  });
  showFw(currentFw);

  /* ── the version on this page ── */
  $$(".ver-text").forEach(function (el) { el.textContent = cfg.version; });
  if (cfg.version !== "5.3.9") {
    $$("pre code").forEach(function (c) { c.textContent = c.textContent.split("@5.3.9").join("@" + cfg.version); });
  }
  var banner = $("#docs-banner");
  function showBanner(html) {
    if (!banner) return;
    banner.innerHTML = "<p>" + useIcon("info") + "<span>" + html + "</span></p>";
    banner.hidden = false;
  }
  if (cfg.override) {
    showBanner("You are trying YuktAI <strong>" + esc(cfg.version) + "</strong> (this tab only). The site is set to " +
      esc(cfg.pinned) + '. <a href="?v=default">Go back to ' + esc(cfg.pinned) + "</a>.");
  }
  function newer(a, b) {
    var x = a.split(/[.-]/).map(Number), y = b.split(/[.-]/).map(Number);
    for (var i = 0; i < 3; i++) { if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0); }
    return false;
  }
  function latestNote(latest) {
    $$(".latest-text").forEach(function (el) { el.textContent = latest; });
    if (!cfg.override && newer(latest, cfg.version)) {
      showBanner("YuktAI <strong>" + esc(latest) + "</strong> is out on npm. These pages run " + esc(cfg.version) +
        '. <a href="?v=' + esc(latest) + '">Try ' + esc(latest) + " here</a>.");
    }
  }
  try {
    var cached = sessionStorage.getItem("docs-latest");
    if (cached) latestNote(cached);
    else if (navigator.onLine !== false && window.fetch) {
      fetch("https://data.jsdelivr.com/v1/packages/npm/@yuktishaalaa/yuktai/resolved?specifier=latest")
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) {
          if (j && typeof j.version === "string" && /^\d+\.\d+\.\d+/.test(j.version)) {
            try { sessionStorage.setItem("docs-latest", j.version); } catch (e) {}
            latestNote(j.version);
          }
        })
        .catch(function () {});
    }
  } catch (e) {}

  /* ── theme ── */
  var root = document.documentElement, themeBtn = $("#theme-btn");
  var mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  function theme() { return root.getAttribute("data-theme") || (mq && mq.matches ? "dark" : "light"); }
  function syncTheme() {
    var dark = theme() === "dark";
    themeBtn.setAttribute("aria-pressed", String(dark));
    themeBtn.title = dark ? "Dark theme is on" : "Dark theme is off";
    $("#theme-icon").innerHTML = useIcon(dark ? "sun" : "moon");
  }
  themeBtn.addEventListener("click", function () {
    var next = theme() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("docs-theme", next); } catch (e) {}
    syncTheme();
    document.dispatchEvent(new CustomEvent("docs:theme", { detail: next }));
  });
  if (mq && mq.addEventListener) mq.addEventListener("change", syncTheme);
  syncTheme();

  /* ── network status ── */
  var net = $("#net"), chip = $("#net-chip"), hideTimer;
  function showNet(online, announce) {
    chip.innerHTML = useIcon(online ? "wifi" : "wifiOff") + '<span class="sr-only">' + (online ? "Online" : "Offline") + "</span>";
    chip.title = online ? "Online" : "Offline: this site still works";
    chip.classList.toggle("is-offline", !online);
    if (!announce) return;
    clearTimeout(hideTimer);
    net.className = "net " + (online ? "online" : "offline");
    net.innerHTML = useIcon(online ? "wifi" : "wifiOff") + "<span>" + (online ? "Back online." : "You're offline. This site still works.") + "</span>" +
      '<button type="button" class="net-close" aria-label="Dismiss">' + useIcon("close") + "</button>";
    net.hidden = false;
    net.querySelector(".net-close").onclick = function () { net.hidden = true; };
    hideTimer = setTimeout(function () { net.hidden = true; }, online ? 4000 : 8000);
  }
  showNet(navigator.onLine !== false, navigator.onLine === false);
  window.addEventListener("online", function () { showNet(true, true); });
  window.addEventListener("offline", function () { showNet(false, true); });

  /* ── go to top, with reading progress ── */
  var top = $("#to-top"), bar = $("#to-top-bar"), C = 2 * Math.PI * 26, ticking = false;
  function onScroll() {
    ticking = false;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var y = window.scrollY || document.documentElement.scrollTop;
    var p = max > 0 ? Math.min(1, y / max) : 0;
    top.hidden = y < 600;
    bar.style.strokeDashoffset = String(C * (1 - p));
    top.setAttribute("aria-label", "Back to top (" + Math.round(p * 100) + "% read)");
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  top.addEventListener("click", function () {
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    $(".brand").focus({ preventScroll: true });
  });
  onScroll();

  /* ── install as an app ── */
  var installBtn = $("#install-btn"), deferred = null;
  window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); deferred = e; installBtn.hidden = false; });
  installBtn.addEventListener("click", function () {
    if (!deferred) return;
    deferred.prompt();
    deferred.userChoice.finally(function () { deferred = null; installBtn.hidden = true; });
  });
  window.addEventListener("appinstalled", function () { installBtn.hidden = true; });

  /* ── offline support ── */
  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
  }

  /* ── phone menu ── */
  var navBtn = $("#nav-toggle");
  if (navBtn) navBtn.addEventListener("click", function () {
    var open = navBtn.getAttribute("aria-expanded") !== "true";
    navBtn.setAttribute("aria-expanded", String(open));
    navBtn.parentNode.classList.toggle("open", open);
  });

  var y = $("#year");
  if (y) y.textContent = new Date().getFullYear();
})();
