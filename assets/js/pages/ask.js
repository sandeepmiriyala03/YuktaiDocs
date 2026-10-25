/* Ask page: RAG over your own text, TS vs Rust, askAboutPage, the panel. */
Docs.ready(function (Y) {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var esc = Docs.esc;

  function documents() {
    return $("rag-docs").value.split(/\n\s*\n/).map(function (t) { return t.trim(); }).filter(Boolean)
      .map(function (t, i) { return { id: "passage-" + (i + 1), text: t }; });
  }
  function makeIndex(engine) {
    return Y.createContextIndex({ documents: documents(), includePage: $("rag-page").checked, engine: engine });
  }

  var answerBox = $("rag-answer");
  answerBox.innerHTML = '<p class="hint">Ask a question to see the answer and the passages it came from.</p>';

  function ask(question) {
    var engine = $("rag-engine").value, k = Number($("rag-k").value);
    answerBox.innerHTML = '<p class="hint">Searching…</p>';
    var t0 = performance.now(), index = makeIndex(engine);
    Promise.resolve(index.ask(question, { k: k })).then(function (r) {
      var ms = performance.now() - t0;
      var hits = (r.hits || []).map(function (h) {
        return "<li><strong>" + esc(h.ref || h.id) + "</strong> · score " + h.score.toFixed(3) + " · " + esc(h.source) +
          "<br>" + esc(h.text.length > 320 ? h.text.slice(0, 320) + "…" : h.text) + "</li>";
      }).join("");
      answerBox.innerHTML =
        '<h3 style="margin-top:8px">Answer</h3><p class="callout" style="margin:6px 0 12px">' + esc(r.answer) + "</p>" +
        '<p class="hint">' + (r.hits || []).length + " passage(s) · " + ms.toFixed(1) + " ms including index build · engine setting: " + esc(engine) +
        (r.generated ? " · written by a model" : " · quoted from your text, nothing invented") + "</p>" +
        (hits ? '<h3>Passages used</h3><ol class="steps">' + hits + "</ol>" : "");
    }, function (e) { answerBox.innerHTML = '<p class="loading-note">Failed: ' + esc(e.message) + "</p>"; });
  }
  $("rag-form").addEventListener("submit", function (e) { e.preventDefault(); var q = $("rag-q").value.trim(); if (q) ask(q); });
  ["How many leave days do I get?", "Can I work from home?", "When is salary paid?", "Hyderabad office hours", "screen reader support", "సెలవు"].forEach(function (ex) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "btn"; b.textContent = ex;
    b.addEventListener("click", function () { $("rag-q").value = ex; ask(ex); });
    $("rag-examples").appendChild(b);
  });

  /* TypeScript vs Rust on the same passages */
  $("rag-compare").addEventListener("click", function () {
    var q = $("rag-q").value.trim() || "leave days", out = $("rag-compare-out");
    out.textContent = "Loading the Rust engine and timing both…";
    var ts = makeIndex("ts"), rs = makeIndex("rust"), RUNS = 200;
    Promise.all([ts.ask(q), rs.ask(q)]).then(function () {
      function time(ix) {
        var hits, t0 = performance.now();
        for (var i = 0; i < RUNS; i++) hits = ix.search(q, 5);
        return { ms: (performance.now() - t0) / RUNS, ids: hits.map(function (h) { return h.id; }), scores: hits.map(function (h) { return h.score.toFixed(6); }) };
      }
      var a = time(ts), b = time(rs);
      var same = a.ids.join() === b.ids.join() && a.scores.join() === b.scores.join();
      out.textContent =
        "Question: " + q + "\nPassages: " + documents().length + ($("rag-page").checked ? " + this page" : "") + "\n\n" +
        "TypeScript: " + a.ms.toFixed(4) + " ms per search\n" +
        "Rust:       " + b.ms.toFixed(4) + " ms per search" + (typeof WebAssembly !== "object" ? " (no WebAssembly here, so TypeScript ran)" : "") + "\n\n" +
        "Same passages, same order, same scores: " + (same ? "yes" : "no") + "\nTop: " + (a.ids.join(", ") || "none") +
        "\n\nWith a few passages both are instant; try the Rust engines page for 10,000+ passages.";
    }, function (e) { out.textContent = "Failed: " + e.message; });
  });

  /* askAboutPage */
  ["What is this page about?", "How many headings are there?", "Which fields are missing labels?", "What links are on this page?", "What can I do here?"].forEach(function (q) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "btn"; b.textContent = q;
    b.addEventListener("click", function () {
      $("pg-out").textContent = "Thinking…";
      Promise.resolve(Y.askAboutPage(q)).then(function (r) {
        var tips = (r.suggestions || []).length ? "\n\nSuggestions:\n• " + r.suggestions.join("\n• ") : "";
        $("pg-out").textContent = 'askAboutPage("' + q + '")\nintent: ' + r.intent + "\n\n" + r.answer + tips;
      }, function (e) { $("pg-out").textContent = "Failed: " + e.message; });
    });
    $("pg-buttons").appendChild(b);
  });

  /* the panel */
  $("rag-panel").innerHTML = "";
  Y.mountAgenticPanel("#rag-panel", { defaultTab: "ask", engine: "rust", voiceLang: "en-IN" });
});
