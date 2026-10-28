// YuktaiDocs service worker: the whole site works offline after the first visit.
//   • this site's files: cached at install, served from cache, refreshed in the background
//   • the YuktAI script (jsDelivr or unpkg, any version): cached on first use
// Bump CACHE whenever you publish a change, so visitors get the new files.
const CACHE = "yuktaidocs-v6"
const CORE = [
  "./",
  "index.html",
  "accessibility.html",
  "grid.html",
  "agents.html",
  "ask.html",
  "page-tools.html",
  "nextjs.html",
  "icons.html",
  "playground.html",
  "rust.html",
  "python.html",
  "php.html",
  "404.html",
  "manifest.webmanifest",
  "assets/css/site.css",
  "assets/icons.svg",
  "assets/js/theme.js",
  "assets/js/analytics.js",
  "assets/js/config.js",
  "assets/js/site.js",
  "assets/js/data.js",
  "assets/js/pages/home.js",
  "assets/js/pages/accessibility.js",
  "assets/js/pages/grid.js",
  "assets/js/pages/agents.js",
  "assets/js/pages/ask.js",
  "assets/js/pages/page-tools.js",
  "assets/js/pages/nextjs.js",
  "assets/js/pages/icons.js",
  "assets/js/pages/playground.js",
  "assets/js/pages/rust.js",
  "icons/favicon.svg",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/maskable-512.png",
  "icons/apple-touch-icon.png"
]

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting()))
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("yuktaidocs-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

const isYuktai = (url) =>
  url.startsWith("https://cdn.jsdelivr.net/npm/@yuktishaalaa/yuktai@") || url.startsWith("https://unpkg.com/@yuktishaalaa/yuktai@")

self.addEventListener("fetch", (event) => {
  const request = event.request
  if (request.method !== "GET") return
  const url = new URL(request.url)
  const sameOrigin = url.origin === self.location.origin
  if (!sameOrigin && !isYuktai(request.url)) return // npm, GitHub, version check: network only

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request, { ignoreSearch: sameOrigin })
      const network = fetch(request)
        .then((response) => {
          if (response && response.ok) cache.put(request, response.clone())
          return response
        })
        .catch(() => null)
      if (cached) {
        event.waitUntil(network)
        return cached
      }
      const fresh = await network
      if (fresh) return fresh
      if (request.mode === "navigate") return (await cache.match("404.html")) || (await cache.match("./")) || Response.error()
      return Response.error()
    })
  )
})
