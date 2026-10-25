/* Grid page: options → live grid + matching Next.js and vanilla code. */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var D = window.DocsData;
  var cache = {};
  var grid = null, Y = null;

  var f = {
    data: $("g-data"), rows: $("g-rows"), engine: $("g-engine"), view: $("g-view"), theme: $("g-theme"),
    locale: $("g-locale"), size: $("g-size"), search: $("g-search"), time: $("g-time"), select: $("g-select"),
    exp: $("g-export"), agentic: $("g-agentic"), ai: $("g-ai")
  };

  function rowCount() {
    var n = Math.round(Number(f.rows.value));
    if (!isFinite(n)) n = 20000;
    return Math.max(10, Math.min(300000, n));
  }
  function opts() {
    return {
      data: f.data.value, rows: rowCount(), engine: f.engine.value, view: f.view.value, theme: f.theme.value,
      locale: f.locale.value, size: Number(f.size.value), search: f.search.checked, time: f.time.checked,
      select: f.select.checked, exp: f.exp.checked, agentic: f.agentic.checked, ai: f.ai.checked
    };
  }
  function dataset(o) {
    if (o.data === "poems") return { rows: D.poems, columns: D.poemColumns, label: "రంగురంగుల రత్నదీపాలు గేయాలు", num: "lines", word: "పాట", examples: ["పంక్తులు 16 కంటే ఎక్కువ"] };
    var n = o.data === "big" ? o.rows : 1000;
    if (!cache[n]) cache[n] = D.staff(n);
    return { rows: cache[n], columns: D.staffColumns, label: "Staff directory", num: "salary", word: "Pune",
      examples: ["salary over 1 lakh", "Engineering in Hyderabad", "average salary by department", "anything unusual?"] };
  }

  /* ── live grid ── */
  var timeLine = $("g-time-line"), lastKey = "";
  function render() {
    if (!Y) return;
    var o = opts(), d = dataset(o);
    // redraw only when an option really changed (a second "change" event must not reset the search)
    var key = JSON.stringify(o.data === "big" ? o : Object.assign({}, o, { rows: 0 }));
    if (key === lastKey) return;
    lastKey = key;
    if (grid && grid.destroy) { try { grid.destroy(); } catch (e) {} }
    var host = $("g-grid");
    host.innerHTML = "";
    var options = {
      data: d.rows, columns: d.columns, rowKey: "id", label: d.label,
      engine: o.engine, showSearchTime: o.time, view: o.view, theme: o.theme, locale: o.locale,
      pagination: o.size ? { pageSize: o.size, showSizeChanger: true, sizeOptions: [5, 10, 25, 50] } : false,
      search: o.search, selectable: o.select, exportable: o.exp,
      onSearchTime: function (t) {
        timeLine.textContent = (t.query ? "Search “" + t.query + "”" : "Sort") + ": " + t.ms.toFixed(2) + " ms · " +
          (t.engine === "rust" ? "Rust" : "TypeScript") + " · " + t.rows.toLocaleString("en-IN") + " rows";
      }
    };
    if (o.agentic) options.agentic = { title: o.data === "poems" ? "Ask about the poems" : "Ask about the staff data", examples: d.examples };
    if (o.ai) { options.ai = true; options.inputLanguage = o.locale === "te-IN" ? "te-IN" : "en-IN"; }
    var t0 = performance.now();
    try {
      grid = Y.renderGrid(host, options);
    } catch (e) {
      host.innerHTML = '<p class="loading-note">The grid could not be drawn: ' + Docs.esc(e.message) + "</p>";
      return;
    }
    var ms = performance.now() - t0;
    timeLine.textContent = d.rows.length.toLocaleString("en-IN") + " rows drawn in " + ms.toFixed(0) + " ms. Type in the search box to time a search.";
    if (grid.whenEngineReady) {
      grid.whenEngineReady().then(function (engine) {
        timeLine.textContent += " Engine: " + (engine === "rust" ? "Rust (the first search also builds its index once; later searches show the real speed)" : "TypeScript") + ".";
      });
    }
    buildApi(d);
  }

  /* ── code for the chosen options ── */
  function code() {
    var o = opts(), poems = o.data === "poems", ver = Docs.version;
    var rowsJs = poems
      ? '[\n  { id: 1, title: "ఆలోచన", page: 9, lines: 12, stanzas: 3 },\n  { id: 2, title: "ఎవరమ్మా", page: 10, lines: 12, stanzas: 3 },\n  // … your rows\n]'
      : '[\n  { id: 1001, name: "Aarav Rao", department: "Engineering", city: "Hyderabad", salary: 120000, joined: "2023-04-10", status: "Active" },\n  { id: 1002, name: "Asha Iyer", department: "Design", city: "Pune", salary: 85000, joined: "2022-11-01", status: "On leave" },\n  // … your rows (from an API, a file or a database)\n]';
    var colsJs = poems
      ? '[\n  { key: "id", label: "క్రమ సంఖ్య", type: "number", align: "left" },\n  { key: "title", label: "శీర్షిక" },\n  { key: "page", label: "పుట", type: "number" },\n  { key: "lines", label: "పంక్తులు", type: "number" },\n  { key: "stanzas", label: "చరణాలు", type: "number" },\n]'
      : '[\n  { key: "name", label: "Name" },\n  { key: "department", label: "Department" },\n  { key: "city", label: "City" },\n  { key: "salary", label: "Salary", type: "number" },\n  { key: "joined", label: "Joined", type: "date" },\n  { key: "status", label: "Status", type: "badge" },\n]';
    var examples = poems ? '["పంక్తులు 16 కంటే ఎక్కువ"]' : '["salary over 1 lakh", "Engineering in Hyderabad", "average salary by department"]';
    var note = o.data === "big" ? "  // " + o.rows.toLocaleString("en-IN") + " rows: engine \"auto\" or \"rust\" keeps search fast\n" : "";
    var inputLang = o.locale === "te-IN" ? "te-IN" : "en-IN";
    var pag = o.size ? "{ pageSize: " + o.size + ", showSizeChanger: true }" : "false";

    /* Next.js */
    var p = [];
    p.push(o.agentic ? "        data={agent.gridData}\n        highlightIds={agent.highlightIds}" : "        data={rows}");
    p.push("        columns={columns}", '        rowKey="id"', '        engine="' + o.engine + '"');
    if (o.time) p.push("        showSearchTime");
    p.push('        view="' + o.view + '"');
    if (o.theme !== "default") p.push('        theme="' + o.theme + '"');
    p.push('        locale="' + o.locale + '"', "        pagination={" + pag + "}");
    if (!o.search) p.push("        search={false}");
    p.push("        selectable={" + o.select + "}");
    if (o.ai) p.push("        ai", '        inputLanguage="' + inputLang + '"');
    var next = '"use client"\n' +
      "import { YuktaiGrid" + (o.agentic ? ", useAgenticGrid, AgenticGridBar" : "") + ' } from "@yuktishaalaa/yuktai"\n' +
      'import type { GridColumn } from "@yuktishaalaa/yuktai"\n\n' +
      "const rows = " + rowsJs + "\n\nconst columns: GridColumn<(typeof rows)[number]>[] = " + colsJs + "\n\n" +
      (note ? note.replace(/^  /, "") : "") +
      "export default function Page() {\n" +
      (o.agentic ? '  const agent = useAgenticGrid({ data: rows, columns, rowKey: "id" })\n' : "") +
      "  return (\n    <main>\n      <h1>" + (poems ? "గేయాలు" : "Staff") + "</h1>\n" +
      (o.agentic ? "      <AgenticGridBar grid={agent} examples={" + examples + "} />\n" : "") +
      "      <YuktaiGrid\n" + p.join("\n") + "\n      />\n    </main>\n  )\n}" +
      (o.exp ? "" : "\n// CSV export button: vanilla option exportable");
    Docs.setCode("g-code", "next", next, 0, poems ? "app/poems/page.tsx" : "app/staff/page.tsx");

    /* Vanilla */
    var v = [];
    v.push("    data: rows,", "    columns,", '    rowKey: "id",', '    label: ' + JSON.stringify(poems ? "గేయాలు" : "Staff directory") + ",");
    v.push('    engine: "' + o.engine + '",');
    if (o.time) v.push("    showSearchTime: true,");
    v.push('    view: "' + o.view + '",');
    if (o.theme !== "default") v.push('    theme: "' + o.theme + '",');
    v.push('    locale: "' + o.locale + '",', "    pagination: " + pag + ",");
    if (!o.search) v.push("    search: false,");
    if (!o.select) v.push("    selectable: false,");
    if (!o.exp) v.push("    exportable: false,");
    if (o.agentic) v.push("    agentic: { examples: " + examples + " },");
    if (o.ai) v.push("    ai: true,", '    inputLanguage: "' + inputLang + '",');
    if (o.time) v.push("    onSearchTime: (t) => console.log(t.ms.toFixed(2) + \" ms\", t.engine),");
    v[v.length - 1] = v[v.length - 1].replace(/,$/, "");
    var vanilla = '<div id="grid"></div>\n\n<script src="https://cdn.jsdelivr.net/npm/@yuktishaalaa/yuktai@' + ver + '/vanilla/index.min.js"></script>\n<script>\n' +
      "  const rows = " + rowsJs.replace(/\n/g, "\n  ") + "\n\n  const columns = " + colsJs.replace(/\n/g, "\n  ").replace(/,\n  \]$/, "\n  ]") + "\n\n" +
      (note ? note : "") +
      '  const grid = yuktai.renderGrid("#grid", {\n' + v.join("\n") + "\n  })\n</script>";
    Docs.setCode("g-code", "vanilla", vanilla, 0, poems ? "poems.html" : "staff.html");
  }

  /* ── API buttons ── */
  var apiBox = $("g-api"), apiOut = $("g-api-out");
  function show(label, value) {
    var text;
    try { text = typeof value === "string" ? value : JSON.stringify(value, null, 2); } catch (e) { text = String(value); }
    if (text && text.length > 2500) text = text.slice(0, 2500) + "\n…";
    apiOut.textContent = label + "\n\n" + (text === undefined ? "done" : text);
  }
  function buildApi(d) {
    var id1 = String(d.rows[0].id), id2 = String(d.rows[1].id), id3 = String(d.rows[2].id);
    var calls = [
      ['grid.search("' + d.word + '")', function () { grid.search(d.word); return { rows: grid.getRows().length, searchTime: grid.getSearchTime && grid.getSearchTime() }; }],
      ['grid.sortBy("' + d.num + '", "desc")', function () { grid.sortBy(d.num, "desc"); return grid.getPageRows().slice(0, 3); }],
      ['grid.highlight(["' + id1 + '", "' + id2 + '"])', function () { grid.highlight([id1, id2]); return "Rows " + id1 + " and " + id2 + " highlighted"; }],
      ['grid.select(["' + id3 + '"])', function () { grid.select([id3]); return grid.getSelectedRows(); }],
      ["grid.nextPage()", function () { grid.nextPage(); return grid.getPage(); }],
      ["grid.setLoading(true)", function () { grid.setLoading(true); setTimeout(function () { grid.setLoading(false); }, 1500); return "Loading for 1.5 s"; }],
      ["grid.biSummary()", function () { return grid.biSummary(); }],
      ["grid.anomalies()", function () { var a = grid.anomalies(); return Array.isArray(a) ? a.slice(0, 5) : a; }],
      ["grid.engine", function () { return grid.engine; }],
      ["grid.exportCSV()", function () { grid.exportCSV(); return "CSV downloaded"; }],
      ["grid.reset()", function () { grid.reset(); if (grid.clearSort) grid.clearSort(); return "Search, filters and sort cleared"; }]
    ];
    apiBox.innerHTML = "";
    calls.forEach(function (c) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "btn"; b.textContent = c[0];
      b.addEventListener("click", function () {
        try { Promise.resolve(c[1]()).then(function (r) { show(c[0], r); }); } catch (e) { show(c[0], "Failed: " + e.message); }
      });
      apiBox.appendChild(b);
    });
  }

  /* ── wiring ── */
  function sync() {
    $("g-rows-field").hidden = f.data.value !== "big";
    if (f.data.value === "poems" && f.locale.value !== "te-IN" && !f.data.dataset.touched) f.locale.value = "te-IN";
    if (f.data.value !== "poems" && f.locale.value === "te-IN" && !f.data.dataset.touched) f.locale.value = "en-IN";
  }
  f.locale.addEventListener("change", function () { f.data.dataset.touched = "1"; });
  Object.keys(f).forEach(function (k) {
    f[k].addEventListener("change", function () { sync(); code(); render(); });
  });
  f.rows.addEventListener("input", code);
  sync();
  code();
  Docs.ready(function (yk) { Y = yk; render(); });
})();
