/* Rust engines: TypeScript vs Rust on the visitor's chosen sizes. */
Docs.ready(function (Y) {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var D = window.DocsData;
  var wasm = typeof WebAssembly === "object" && typeof WebAssembly.compile === "function";
  $("rs-support").innerHTML = "<li>" + Docs.icon(wasm ? "check" : "info") +
    (wasm ? "WebAssembly is available: the Rust engines can run here." : "No WebAssembly in this browser: both columns will use TypeScript.") + "</li>";

  function median(a) { var s = a.slice().sort(function (x, y) { return x - y; }); return s[Math.floor(s.length / 2)]; }
  function clamp(v, lo, hi, d) { var n = Math.round(Number(v)); return isFinite(n) ? Math.max(lo, Math.min(hi, n)) : d; }
  function fmt(ms) { return ms < 0.1 ? ms.toFixed(3) : ms < 10 ? ms.toFixed(2) : ms.toFixed(1); }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function table(head, rows) {
    return '<table class="ref"><thead><tr>' + head.map(function (h) { return '<th scope="col">' + h + "</th>"; }).join("") + "</tr></thead><tbody>" +
      rows.map(function (r) { return "<tr>" + r.map(function (c) { return "<td>" + c + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table>";
  }
  var grids = {};

  /* timed call: the grid's own search time when it has one, else wall time */
  function timed(grid, fn) {
    var t0 = performance.now();
    fn();
    var wall = performance.now() - t0, t = grid.getSearchTime ? grid.getSearchTime() : null;
    return t && typeof t.ms === "number" ? t.ms : wall;
  }

  $("rs-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var n = clamp($("rs-rows").value, 1000, 300000, 50000), q = $("rs-q").value.trim() || "hyderabad";
    $("rs-rows").value = n;
    var res = $("rs-result");
    res.innerHTML = '<p class="hint">Building ' + n.toLocaleString("en-IN") + " rows and loading the engines…</p>";
    var rows = D.staff(n);
    ["ts", "rs"].forEach(function (k) {
      if (grids[k] && grids[k].destroy) grids[k].destroy();
      $("rs-" + k).innerHTML = "";
      grids[k] = Y.renderGrid("#rs-" + k, {
        data: rows, columns: D.staffColumns, rowKey: "id", label: (k === "ts" ? "TypeScript" : "Rust") + " benchmark grid",
        engine: k === "ts" ? "ts" : "rust", showSearchTime: true, view: "table", pagination: { pageSize: 5, sizeOptions: [5, 10] }
      });
    });
    var rsReady = grids.rs.whenEngineReady ? grids.rs.whenEngineReady() : Promise.resolve("ts");
    rsReady.then(function (engine) { return wait(30).then(function () { return engine; }); }).then(function (engine) {
      var out = {};
      ["ts", "rs"].forEach(function (k) {
        var g = grids[k], s = [], o = [];
        for (var i = 0; i < 5; i++) {
          g.search("");
          s.push(timed(g, function () { g.search(q); }));
        }
        var matched = g.getRows().length;
        g.search("");
        for (var j = 0; j < 5; j++) o.push(timed(g, function () { g.sortBy("salary", j % 2 ? "asc" : "desc"); }));
        g.sortBy("salary", "desc");
        g.search(q);
        out[k] = { search: median(s), sort: median(o), matched: matched, first: g.getPageRows().map(function (r) { return r.id; }).join(",") };
      });
      var same = out.ts.first === out.rs.first && out.ts.matched === out.rs.matched;
      var label = engine === "rust" ? "Rust" : "Rust requested (TypeScript ran: no WebAssembly)";
      res.innerHTML = table(["Engine", "Search “" + Docs.esc(q) + "”", "Sort " + n.toLocaleString("en-IN") + " salaries", "Rows found"], [
        ["TypeScript", fmt(out.ts.search) + " ms", fmt(out.ts.sort) + " ms", out.ts.matched.toLocaleString("en-IN")],
        [label, fmt(out.rs.search) + " ms", fmt(out.rs.sort) + " ms", out.rs.matched.toLocaleString("en-IN")]
      ]) + '<p class="live-line">' + (same ? "Same rows in the same order: yes." : "Results differ: please report this.") +
        (engine === "rust" && out.rs.search > 0 ? " Search " + (out.ts.search / out.rs.search).toFixed(1) + "× and sort " + (out.ts.sort / Math.max(out.rs.sort, 0.001)).toFixed(1) + "× the TypeScript speed." : "") + "</p>" +
        '<p class="hint">Middle of 5 runs. Times vary by device; small data is fast with either engine, which is why "auto" uses Rust only from 10,000 rows.</p>';
    });
  });

  $("rr-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var n = clamp($("rr-n").value, 100, 100000, 10000), q = $("rr-q").value.trim() || "security engineer";
    $("rr-n").value = n;
    var res = $("rr-result");
    res.innerHTML = '<p class="hint">Indexing ' + n.toLocaleString("en-IN") + " passages…</p>";
    var rows = D.staff(n), cols = Y.toGridToolColumns(D.staffColumns);
    var ts = Y.createContextIndex({ includePage: false, rows: rows, columns: cols, rowKey: "id", engine: "ts" });
    var rs = Y.createContextIndex({ includePage: false, rows: rows, columns: cols, rowKey: "id", engine: "rust" });
    Promise.all([ts.ask(q), rs.ask(q)]).then(function () { return wait(30); }).then(function () {
      function run(ix) {
        var t = [], hits;
        for (var i = 0; i < 20; i++) { var t0 = performance.now(); hits = ix.search(q, 5); t.push(performance.now() - t0); }
        return { ms: median(t), top: hits.map(function (h) { return h.ref || h.id; }), scores: hits.map(function (h) { return h.score.toFixed(6); }) };
      }
      var a = run(ts), b = run(rs);
      var same = a.top.join() === b.top.join() && a.scores.join() === b.scores.join();
      res.innerHTML = table(["Engine", "Search time", "Top 5 passages"], [
        ["TypeScript", fmt(a.ms) + " ms", Docs.esc(a.top.join(", "))],
        [wasm ? "Rust" : "Rust requested (TypeScript ran)", fmt(b.ms) + " ms", Docs.esc(b.top.join(", "))]
      ]) + '<p class="live-line">' + (same ? "Same passages, same order, same scores: yes." : "Results differ: please report this.") +
        (wasm && b.ms > 0 ? " Rust is " + (a.ms / b.ms).toFixed(1) + "× the TypeScript speed here." : "") + "</p>";
    }, function (err) { res.innerHTML = '<p class="loading-note">Failed: ' + Docs.esc(err.message) + "</p>"; });
  });
});
