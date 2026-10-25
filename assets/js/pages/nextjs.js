/* Next.js setup builder: YuktAIWrapper props → files + a preview of the buttons. */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var f = {
    launcher: $("nx-launcher"), a11y: $("nx-a11y"), rag: $("nx-rag"), agent: $("nx-agent"), vibe: $("nx-vibe"),
    pos: $("nx-pos"), engine: $("nx-engine"), src: $("nx-src"), autofix: $("nx-autofix")
  };
  var BUTTONS = [
    ["launcher", "spark", "Launcher", "shows or hides the others"],
    ["a11y", "accessibility", "Accessibility", "settings dialog"],
    ["rag", "chat", "Ask page", "questions about the page"],
    ["agent", "robot", "Agent", "page agent"],
    ["vibe", "wand", "Vibe Coder", "developer tool"]
  ];

  function render() {
    var c = {};
    Object.keys(f).forEach(function (k) { c[k] = f[k].type === "checkbox" ? f[k].checked : f[k].value; });

    /* props (always opt-in mode, so the buttons are exactly the ones ticked) */
    var p = ['      position="' + c.pos + '"'];
    if (c.launcher) p.push("      launcher");
    if (c.a11y) p.push("      showAccessibility");
    if (c.rag) p.push("      showRag");
    if (c.agent) p.push("      showAgent");
    if (c.vibe) p.push("      showVibeCoder");
    if (!c.launcher && !c.a11y && !c.vibe) p.push("      showAccessibility={false}   // keeps every button opt-in");
    if (c.engine && c.rag) p.push('      engine="' + c.engine + '"');
    if (c.autofix) p.push("      config={{ autoFix: true }}");

    var dir = c.src;
    Docs.setCode("nx-code", "next",
      '"use client"\n// YuktAI uses browser APIs, so it runs in a client component.\n' +
      'import { YuktAIWrapper } from "@yuktishaalaa/yuktai"\nimport type { ReactNode } from "react"\n\n' +
      "export default function YuktaiClient({ children }: { children: ReactNode }) {\n  return (\n    <YuktAIWrapper\n" +
      p.join("\n") + "\n    >\n      {children}\n    </YuktAIWrapper>\n  )\n}", 0, dir + "/YuktaiClient.tsx");
    Docs.setCode("nx-code", "next",
      'import type { Metadata } from "next"\nimport type { ReactNode } from "react"\nimport YuktaiClient from "./YuktaiClient"\n\n' +
      'export const metadata: Metadata = { title: "My app" }\n\n' +
      "export default function RootLayout({ children }: { children: ReactNode }) {\n  return (\n    <html lang=\"en\">\n      <body>\n" +
      "        <YuktaiClient>{children}</YuktaiClient>\n      </body>\n    </html>\n  )\n}", 1, dir + "/layout.tsx");

    /* vanilla equivalent */
    var tools = c.rag || c.agent;
    var lines = ['    position: "' + c.pos + '",'];
    if (tools) lines.push("    showPageTools: true,          // 🛠: Copilot, QA, Forms, Design, Ask page, Voice", '    defaultTab: "' + (c.rag ? "ask" : "copilot") + '",');
    lines.push("    config: { autoFix: " + c.autofix + " }");
    var notes = [];
    if (!c.a11y) notes.push("<!-- The vanilla build always shows ♿. To show no floating buttons, set autoInit: false. -->");
    if (c.launcher) notes.push("<!-- The ✨ launcher is React only; in plain HTML the buttons are always visible. -->");
    if (c.vibe) notes.push("<!-- ⚡ Vibe Coder is React only. -->");
    if (c.rag && c.engine) notes.push('<!-- For the Rust Ask page inline: yuktai.mountAgenticPanel("#ask", { defaultTab: "ask", engine: "' + c.engine + '" }) -->');
    Docs.setCode("nx-code", "vanilla",
      (notes.length ? notes.join("\n") + "\n" : "") +
      "<script>\n  window.YUKTAI_CONFIG = {\n" + lines.join("\n") + "\n  }\n</script>\n" +
      '<script src="https://cdn.jsdelivr.net/npm/@yuktishaalaa/yuktai@' + Docs.version + '/vanilla/index.min.js"></script>');

    /* preview */
    var shown = BUTTONS.filter(function (b) { return c[b[0]]; });
    var prev = $("nx-preview");
    prev.innerHTML = shown.length
      ? '<ul style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px;align-items:' + (c.pos === "left" ? "flex-start" : "flex-end") + '">' +
        shown.map(function (b, i) {
          var hiddenByLauncher = c.launcher && b[0] !== "launcher";
          return '<li style="display:flex;align-items:center;gap:10px;flex-direction:' + (c.pos === "left" ? "row" : "row-reverse") + '">' +
            '<span style="display:grid;place-items:center;width:48px;height:48px;border-radius:50%;background:var(--d-btn-bg);color:var(--d-btn-text)' +
            (hiddenByLauncher ? ";outline:2px dashed var(--d-line);outline-offset:3px" : "") + '">' + Docs.icon(b[1]) + "</span>" +
            "<span><strong>" + b[2] + "</strong><br><span class=\"muted\" style=\"font-size:.9rem\">" + b[3] + (hiddenByLauncher ? " · after ✨" : "") + "</span></span></li>";
        }).join("") + "</ul>"
      : '<p class="muted" style="margin:0">No floating buttons. Your app renders as usual.</p>';
    $("nx-mode").textContent = c.launcher
      ? "Visitors first see only ✨; it opens the other buttons and remembers the choice."
      : shown.length ? "These buttons are always visible at the " + c.pos + " side." : "Tick at least one button to add YuktAI's floating tools.";
    f.engine.disabled = !c.rag;
  }
  Object.keys(f).forEach(function (k) { f[k].addEventListener("change", render); });
  render();
})();
