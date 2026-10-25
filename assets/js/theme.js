document.documentElement.classList.add("js");
/* Apply a saved theme before first paint (no flash). Loaded in <head>. */
try {
  var t = localStorage.getItem("docs-theme");
  if (t === "light" || t === "dark") document.documentElement.setAttribute("data-theme", t);
} catch (e) {}
