/* Home: what is running on this page. */
Docs.ready(function (Y) {
  var caps = Y.getCapabilities ? Y.getCapabilities() : {};
  var list = document.getElementById("home-status");
  function item(ok, text) {
    var li = document.createElement("li");
    li.innerHTML = Docs.icon(ok ? "check" : "info") + Docs.esc(text);
    list.appendChild(li);
  }
  item(true, (Y.iconNames || []).length + " icons");
  item(true, "Grid, agents, page tools");
  item(typeof WebAssembly === "object", typeof WebAssembly === "object" ? "WebAssembly: Rust engines available" : "No WebAssembly: TypeScript engines");
  item(!!caps.voice, caps.voice ? "Speech recognition available" : "No speech recognition (typed commands work)");
  item(!!caps.speech, caps.speech ? "Speech output available" : "No speech output");
  item(!!caps.webMCP, caps.webMCP ? "WebMCP available" : "WebMCP not in this browser");
  var host = "";
  try { host = new URL(Docs.source).host; } catch (e) {}
  document.getElementById("home-source").textContent = "Loaded from " + host + ". Everything below runs on your device.";
}, function () {
  document.getElementById("home-source").textContent = "YuktAI could not load. Check your connection and reload.";
});
