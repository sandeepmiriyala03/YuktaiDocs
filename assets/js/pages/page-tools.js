/* Page tools: practice area checks, the six-tab panel, voice commands, QA rules. */
Docs.ready(function (Y) {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var slot = $("pt-slot"), out = $("pt-out"), copilot = null;

  // Deliberate mistakes for the checks to find. Inserted only on request.
  var PRACTICE =
    '<div class="card" style="margin-top:12px">' +
    '<h4>Contact us</h4>' +
    '<form><input name="email" type="text" placeholder="Your email"> ' +
    '<button type="submit"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button></form>' +
    '<img src="icons/icon-192.png" width="48" height="48">' +
    '<p style="color:#a3acb9">Light grey text that is hard to read.</p>' +
    '<a href="#"></a>' +
    "</div>";

  $("pt-insert").addEventListener("click", function () {
    slot.innerHTML = PRACTICE;
    slot.querySelector("form").addEventListener("submit", function (e) { e.preventDefault(); });
    slot.querySelector("a").addEventListener("click", function (e) { e.preventDefault(); });
    copilot = null;
    Docs.say("Practice snippet inserted");
  });
  $("pt-remove").addEventListener("click", function () {
    if (copilot) { try { copilot.undoAll(); copilot.stop && copilot.stop(); } catch (e) {} copilot = null; }
    slot.innerHTML = '<p class="hint">Nothing inserted yet. The checks below then run on an empty area.</p>';
    Docs.say("Practice snippet removed");
  });

  function plain(v) {
    return JSON.stringify(v, function (k, x) {
      if (k === "element" || (x && typeof x === "object" && x.nodeType)) return undefined;
      return x;
    }, 2);
  }
  var runs = {
    qa: function () {
      var r = Y.runQaAudit({ root: slot });
      return "runQaAudit({ root })\nScore " + r.score + " · " + (r.passed ? "passed" : "needs work") + "\n" + r.summary + "\n\n" +
        r.issues.map(function (i) { return "• [" + i.severity + "] " + i.message + " (WCAG " + i.wcag + ")\n  Fix: " + i.fix; }).join("\n");
    },
    forms: function () { return "reviewForms({ root })\n\n" + plain(Y.reviewForms({ root: slot })); },
    design: function () {
      var d = Y.reviewDesign({ root: slot });
      return "reviewDesign({ root })\nScore " + d.score + "\n" + d.summary + "\n\n" + plain(d.findings.slice(0, 8));
    },
    copilot: function () {
      copilot = copilot || Y.createA11yCopilot({ root: slot });
      var before = copilot.scan();
      var fixed = copilot.applyAllFixes();
      var after = copilot.scan();
      return "createA11yCopilot({ root }).applyAllFixes()\n\nIssues before: " + before.issues.length + " · after: " + after.issues.length + "\n\n" +
        fixed.map(function (f) { return "• " + (f.message || f.description || plain(f)); }).join("\n") +
        "\n\nOnly safe fixes are applied (for example names for unnamed buttons). “Copilot: undo” reverts them.";
    },
    undo: function () {
      if (!copilot) return "Nothing to undo yet. Run “Copilot: fix all” first.";
      return "copilot.undoAll()\n\n" + copilot.undoAll() + " change(s) reverted.";
    },
    md: function () { return Y.auditToMarkdown(Y.runQaAudit({ root: slot })); }
  };
  document.querySelectorAll("#pt-run [data-run]").forEach(function (b) {
    b.addEventListener("click", function () {
      try { out.textContent = runs[b.getAttribute("data-run")](); } catch (e) { out.textContent = "Failed: " + e.message; }
    });
  });

  /* the six-tab panel */
  $("pt-panel").innerHTML = "";
  Y.mountAgenticPanel("#pt-panel", { defaultTab: "qa", voiceLang: "en-IN", engine: "rust", applySettings: function (c) { return Y.apply(c); }, getSettings: Y.getSettings });

  /* voice commands (typed) */
  function understand(text) {
    var cur = Y.getSettings ? Y.getSettings() : { fontSizeMultiplier: 1 };
    var r = Y.parseVoiceA11yCommand(text, cur);
    $("vc-out").textContent = 'parseVoiceA11yCommand("' + text + '")\n\n' + (r ? JSON.stringify(r, null, 2) : "null (not a command)");
  }
  $("vc-form").addEventListener("submit", function (e) { e.preventDefault(); understand($("vc-q").value.trim()); });
  ["make text bigger", "high contrast on", "dark mode", "reduce motion", "reset", "next row", "పెద్ద అక్షరాలు"].forEach(function (ex) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "btn"; b.textContent = ex;
    b.addEventListener("click", function () { $("vc-q").value = ex; understand(ex); });
    $("vc-examples").appendChild(b);
  });

  /* every QA rule, read from this YuktAI version */
  var rules = Y.AUDIT_RULES || {};
  var ids = Object.keys(rules);
  $("pt-rules").innerHTML = '<table class="ref"><caption>' + ids.length + " checks in YuktAI " + Docs.esc(Docs.version) +
    '</caption><thead><tr><th scope="col">Rule</th><th scope="col">Check</th><th scope="col">WCAG</th></tr></thead><tbody>' +
    ids.map(function (id) {
      var r = rules[id];
      return "<tr><td>" + Docs.esc(id) + "</td><td>" + Docs.esc(r.title || "") + "</td><td>" + Docs.esc(r.wcag || "") + "</td></tr>";
    }).join("") + "</tbody></table>";
});
