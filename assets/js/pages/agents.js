/* Agents page: question bar + assistant, standalone agent, grid tools, tasks. */
Docs.ready(function (Y) {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var D = window.DocsData, rows = D.staff(1000), columns = D.staffColumns, inr = D.inr;
  function json(v) { try { return typeof v === "string" ? v : JSON.stringify(v, null, 2); } catch (e) { return String(v); } }
  function strip(v) {
    // drop DOM elements and long arrays before printing
    return JSON.parse(JSON.stringify(v, function (k, x) {
      if (x && typeof x === "object" && x.nodeType) return undefined;
      if (Array.isArray(x) && x.length > 8) return x.slice(0, 8).concat(["… " + (x.length - 8) + " more"]);
      return x;
    }));
  }

  /* 1. grid with question bar, assistant, Telugu custom rules, WebMCP */
  var host = $("ag-grid");
  host.innerHTML = "";
  var grid = Y.renderGrid(host, {
    data: rows, columns: columns, rowKey: "id", label: "Staff directory (agents demo)", locale: "en-IN",
    view: "table",
    pagination: { pageSize: 10, showSizeChanger: true, sizeOptions: [10, 25, 50] },
    agentic: {
      title: "Ask about the staff data",
      examples: ["salary over 1 lakh", "Engineering in Hyderabad", "anything unusual?", "average salary by department", "top 3 by salary", "show salary over 80k, then sort by salary, then summarize"]
    },
    ai: true,
    inputLanguage: "en-IN",
    assistantExamples: ["how many", "sort by salary desc", "high earners", "ఎక్కువ జీతం", "help", "clear filters"],
    webmcp: true,
    toolName: "staff_grid",
    engine: "auto",
    customRules: [
      { name: "high-earners", phrases: ["high earners", "top people", "ఎక్కువ జీతం", "ज़्यादा वेतन"], description: "Salary over 1 lakh",
        execute: async function (ctx) { var r = await ctx.executeTool("filter", { key: "salary", operator: "greaterThan", value: 100000 }); return r.message; } },
      { name: "help", phrases: ["help", "what can i ask", "సహాయం"],
        execute: function () { return "You can ask: how many · search <word> · sort by <column> [desc] · high earners · ఎక్కువ జీతం · clear filters · clear sort."; } }
    ],
    onAgentResult: function (r) { $("ag-line").textContent = (r.success ? "✓ " : "✗ ") + r.message + (r.tool ? " (" + r.tool + ")" : ""); },
    onWebMCPStatusChange: function (s) { webmcp(s); }
  });
  function webmcp(s) {
    if (!s) return;
    $("ag-webmcp").textContent = s.state === "unsupported"
      ? "WebMCP: not available in this browser (document.modelContext was not found), so no tools were registered. The grid works the same."
      : "WebMCP: " + s.state + ". Registered tools: " + ((s.registered || []).join(", ") || "none") + ".";
  }
  webmcp(grid.webmcpStatus);

  /* 2. standalone agent */
  var standalone = Y.createAgenticGrid({ data: rows.slice(0, 40), columns: columns, rowKey: "id" });
  $("ag-bar").innerHTML = "";
  Y.mountAgenticGridBar("#ag-bar", standalone, { title: "Ask the first 40 rows", examples: ["salary under 60k", "total salary by city", "highest salary first", "name starts with R"] });
  standalone.subscribe(function (s) {
    $("ag-rows").textContent = s.gridData.length + " row(s) in gridData (first 8):\n" +
      s.gridData.slice(0, 8).map(function (r) { return "• " + r.id + " " + r.name + " · " + r.city + " · " + inr(r.salary); }).join("\n") +
      (s.highlightIds.length ? "\nHighlighted: " + s.highlightIds.join(", ") : "");
  });
  $("ag-rows").textContent = "Ask a question above. The rows the agent picked are listed here: this is what you would draw in your own table.";

  /* 3. grid tools + phrase agent */
  var state = { filters: [], sort: null };
  var tools = Y.createGridTools({
    data: rows, columns: Y.toGridToolColumns(columns), rowKey: "id",
    onFiltersChange: function (x) { state.filters = x; }, onSortChange: function (x) { state.sort = x; }
  }, { name: "staff_grid" });
  var agent = Y.createGridAgent({
    tools: tools, columns: Y.toGridToolColumns(columns), data: rows, rowKey: "id",
    customRules: [{ name: "high-earners", phrases: ["high earners", "ఎక్కువ జీతం"],
      execute: async function (ctx) { return (await ctx.executeTool("filter", { key: "salary", operator: "greaterThan", value: 100000 })).message; } }]
  });
  function runAgent(text) {
    $("ag3-out").textContent = "Working…";
    Promise.resolve(agent.ask(text)).then(function (r) {
      $("ag3-out").textContent = 'agent.ask("' + text + '")\n\n' + json(strip(r));
    }, function (e) { $("ag3-out").textContent = "Failed: " + e.message; });
  }
  $("ag3-form").addEventListener("submit", function (e) { e.preventDefault(); runAgent($("ag3-q").value.trim() || "how many"); });
  ["how many", "sort by salary desc", "search Pune", "high earners", "ఎక్కువ జీతం", "columns", "clear filters"].forEach(function (ex) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "btn"; b.textContent = ex;
    b.addEventListener("click", function () { $("ag3-q").value = ex; runAgent(ex); });
    $("ag3-examples").appendChild(b);
  });
  $("ag3-out").textContent = tools.length + " tools: " + tools.map(function (t) { return t.name; }).join(", ");

  /* 4. tasks */
  $("ag4-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var text = $("ag4-q").value.trim();
    if (!text) return;
    var plan = Y.planTasks(text);
    $("ag4-out").textContent = "Plan:\n" + json(strip(plan)) + "\n\nRunning…";
    Promise.resolve(Y.runTasks(text, { data: rows, columns: Y.toGridToolColumns(columns), rowKey: "id" })).then(function (r) {
      $("ag4-out").textContent = "Plan:\n" + json(strip(plan)) + "\n\nResult:\n" + json(strip(r));
    }, function (err) { $("ag4-out").textContent = "Failed: " + err.message; });
  });
});
