/* Function playground: pick a core function, change the input, run it, copy the call. */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var D = window.DocsData, rows = D.staff(120), inr = D.inr, Y = null, cols = null;
  function q(s) { return JSON.stringify(s); }

  // [name, about, input label, default input, run(input), code(input) → [npm call, vanilla call]]
  var FNS = [
    ["parseAmount", "Indian and short amounts → numbers", "Amount text", "1.5 lakh",
      function (x) { return Y.parseAmount(x); },
      function (x) { return ["parseAmount(" + q(x) + ")"]; }],
    ["parseGridQuery", "A question → filters, sort and limit (nothing is run yet)", "Question", "salary over 1 lakh in Hyderabad",
      function (x) { var p = Y.parseGridQuery(x, cols, { data: rows }); return { filters: p.filters, sort: p.sort, limit: p.limit, explanation: p.explanation, notes: p.notes }; },
      function (x) { return ["parseGridQuery(" + q(x) + ", toGridToolColumns(columns), { data: rows })"]; }],
    ["runGridQuery", "Parse and run a question on the rows", "Question", "top 3 by salary",
      function (x) { var r = Y.runGridQuery(x, { data: rows, columns: cols, rowKey: "id" }); return { explanation: r.parsed && r.parsed.explanation, matched: (r.rows || []).length, first: (r.rows || []).slice(0, 5).map(function (row) { return row.name + " · " + row.city + " · " + inr(row.salary); }) }; },
      function (x) { return ["runGridQuery(" + q(x) + ", { data: rows, columns: toGridToolColumns(columns), rowKey: \"id\" })"]; }],
    ["answerGridQuestion", "A question → an answer sentence plus the rows", "Question", "how many in Pune",
      function (x) { var r = Y.answerGridQuestion(x, { data: rows, columns: cols, rowKey: "id" }); return { kind: r.kind, message: r.message, rows: (r.rows || []).length, ids: (r.ids || []).slice(0, 8) }; },
      function (x) { return ["answerGridQuestion(" + q(x) + ", { data: rows, columns: toGridToolColumns(columns), rowKey: \"id\" })"]; }],
    ["askInsight", "BI questions: totals, averages, groups, trends", "Question", "average salary by department",
      function (x) { var a = Y.askInsight(x, rows, cols); return { kind: a.kind, answer: a.answer, table: (a.table || []).slice(0, 6) }; },
      function (x) { return ["askInsight(" + q(x) + ", rows, toGridToolColumns(columns))"]; }],
    ["groupBy", "Group rows and aggregate a number column (column names: city, department, status…)", "Group by column", "city",
      function (x) { return Y.groupBy(rows, x, "salary", "avg"); },
      function (x) { return ["groupBy(rows, " + q(x) + ", \"salary\", \"avg\")"]; }],
    ["trend", "A number over time (period: day, week, month, quarter, year)", "Period", "year",
      function (x) { return Y.trend(rows, "joined", "salary", x, "sum").map(function (p) { return { start: new Date(p.start).toISOString().slice(0, 10), value: p.value }; }); },
      function (x) { return ["trend(rows, \"joined\", \"salary\", " + q(x) + ", \"sum\")"]; }],
    ["detectAnomalies", "Unusual values (row 1078 has a very high salary)", "Rows to check", "120",
      function (x) { var n = Math.max(1, Math.min(120, Number(x) || 120)); return Y.detectAnomalies(rows.slice(0, n), cols, { rowKey: "id" }).slice(0, 5); },
      function () { return ["detectAnomalies(rows, toGridToolColumns(columns), { rowKey: \"id\" })"]; }],
    ["summarizeRows", "A short summary of the rows", "Rows to summarise", "120",
      function (x) { var n = Math.max(1, Math.min(120, Number(x) || 120)); return Y.summarizeRows(rows.slice(0, n), cols); },
      function () { return ["summarizeRows(rows, toGridToolColumns(columns))"]; }],
    ["planTasks", "Split an instruction into steps", "Instruction", "show salary over 1 lakh, then sort by joined, then summarize",
      function (x) { return Y.planTasks(x); },
      function (x) { return ["planTasks(" + q(x) + ")"]; }],
    ["parseVoiceA11yCommand", "A spoken accessibility command → a setting", "Command", "make text bigger",
      function (x) { return Y.parseVoiceA11yCommand(x, { fontSizeMultiplier: 1 }); },
      function (x) { return ["parseVoiceA11yCommand(" + q(x) + ", { fontSizeMultiplier: 1 })"]; }],
    ["parseGridIntent", "Phrase → grid tool, in English or Telugu", "Phrase", "ఉగాది వెతుకు",
      function (x) { return Y.parseGridIntent(x, { columns: cols }); },
      function (x) { return ["parseGridIntent(" + q(x) + ", { columns: toGridToolColumns(columns) })"]; }],
    ["tokenize", "The search tokens used by the RAG index (Telugu-aware)", "Text", "తెలుగు పద్యాలు and Hyderabad Engineering",
      function (x) { return Y.tokenize(x); },
      function (x) { return ["tokenize(" + q(x) + ")"]; }],
    ["contrastRatio", "Contrast between two colours (WCAG)", "Two colours", "#475569, #ffffff",
      function (x) { var p = x.split(/\s*,\s*/); var r = Y.contrastRatio(Y.parseColor(p[0]), Y.parseColor(p[1] || "#ffffff")); return r.toFixed(2) + ":1 · " + (r >= 7 ? "AAA" : r >= 4.5 ? "AA" : r >= 3 ? "AA large text / UI only" : "fails"); },
      function (x) { var p = x.split(/\s*,\s*/); return ["contrastRatio(parseColor(" + q(p[0]) + "), parseColor(" + q(p[1] || "#ffffff") + "))"]; }],
    ["pickGlyphColor", "White or dark glyph for a filled icon of this colour", "Background colour", "#0a4a85",
      function (x) { var g = Y.pickGlyphColor(x); return { glyph: g, contrast: (Y.iconContrast(g, x) || 0).toFixed(2) + ":1" }; },
      function (x) { return ["pickGlyphColor(" + q(x) + ")"]; }],
    ["analyzePage", "The outline of this page", "(no input)", "",
      function () { var o = Y.analyzePage(); return { title: o.title, language: o.language, counts: o.counts, landmarks: o.landmarks, purpose: o.purpose }; },
      function () { return ["analyzePage()"]; }]
  ];
  var IMPORTS = { parseGridQuery: ["toGridToolColumns"], runGridQuery: ["toGridToolColumns"], answerGridQuestion: ["toGridToolColumns"], askInsight: ["toGridToolColumns"], detectAnomalies: ["toGridToolColumns"], summarizeRows: ["toGridToolColumns"], parseGridIntent: ["toGridToolColumns"], contrastRatio: ["parseColor"] };

  var sel = $("pl-fn");
  sel.innerHTML = FNS.map(function (f, i) { return '<option value="' + i + '">' + f[0] + " — " + f[1] + "</option>"; }).join("");
  function current() { return FNS[Number(sel.value)]; }
  function choose() {
    var f = current();
    $("pl-in-label").textContent = f[2];
    $("pl-in").value = f[3];
    $("pl-in").disabled = f[3] === "" && f[2] === "(no input)";
    $("pl-about").textContent = f[1];
    code();
  }
  function code() {
    var f = current(), call = f[5]($("pl-in").value)[0];
    var names = [f[0]].concat(IMPORTS[f[0]] || []);
    var needsRows = /rows|columns/.test(call);
    var data = needsRows ? "\n// rows: your data · columns: [{ key, label, type }]\n" : "\n";
    Docs.setCode("pl-code", "next", "import { " + names.join(", ") + ' } from "@yuktishaalaa/yuktai"\n' + data + "const result = " + call);
    Docs.setCode("pl-code", "vanilla", data.replace(/^\n/, "") + "const result = yuktai." + call.replace(/\b(toGridToolColumns|parseColor)\(/g, "yuktai.$1("));
  }
  function run() {
    var f = current(), out = $("pl-out");
    if (!Y) { out.textContent = "YuktAI is still loading…"; return; }
    try {
      Promise.resolve(f[4]($("pl-in").value)).then(function (r) {
        out.textContent = f[0] + "\n\n" + (typeof r === "string" ? r : JSON.stringify(r, null, 2));
      }, function (e) { out.textContent = f[0] + " failed: " + e.message; });
    } catch (e) { out.textContent = f[0] + " failed: " + e.message; }
  }
  sel.addEventListener("change", function () { choose(); run(); });
  $("pl-in").addEventListener("input", code);
  $("pl-form").addEventListener("submit", function (e) { e.preventDefault(); run(); });
  choose();
  Docs.ready(function (yk) { Y = yk; cols = Y.toGridToolColumns(D.staffColumns); $("pl-out").textContent = ""; run(); });
})();
