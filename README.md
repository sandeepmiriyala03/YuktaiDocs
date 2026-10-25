# YuktaiDocs

Documentation and live demos for **YuktAI** ([`@yuktishaalaa/yuktai`](https://www.npmjs.com/package/@yuktishaalaa/yuktai)): plain HTML, CSS and JavaScript. There is no build step, and it is ready for Netlify.

Every page runs the real YuktAI from jsDelivr (unpkg is the backup) and shows code for both **Next.js / React** and **Vanilla JS**. Each visitor's choice of stack is remembered across pages.

| Page | What visitors can do |
| --- | --- |
| `index.html` | Install, two-minute quick start, feature map, live status (version, latest on npm, WebAssembly, speech) |
| `accessibility.html` | Change this page's settings from code; builder for `YUKTAI_CONFIG` / `YuktAIWrapper` with "Try it on this site" |
| `grid.html` | Grid playground: data (staff, Telugu, or any number of rows), engine, view, theme, language, features; matching code is generated; grid API buttons |
| `agents.html` | Question bar and assistant (Telugu rules), standalone agent, grid tools and phrase agent, WebMCP status, multi-step tasks |
| `ask.html` | Page RAG on the visitor's own pasted text, TypeScript vs Rust parity, `askAboutPage`, the Ask panel |
| `page-tools.html` | Practice area with real problems: QA audit, form and design review, Copilot fix and undo, Markdown report, the six-tab panel, voice commands, every QA rule (read live) |
| `nextjs.html` | Tick the buttons (✨ launcher, ♿, 💬, 🤖, ⚡) and get `YuktaiClient.tsx` and `layout.tsx`, with a preview and troubleshooting |
| `icons.html` | Icon studio: every icon read live from YuktAI, **any size 8–1024 px**, slider and presets, colour with a contrast check, outline/filled, line weight, React and HTML code, PNG/SVG download, several PNG sizes at once |
| `playground.html` | 16 core functions on your own input, with the call to copy |
| `rust.html` | TypeScript vs Rust benchmarks on a row or passage count you type, with a result-parity check |

The site is a PWA: it can be installed, works offline after the first visit, and shows a Wi-Fi status chip, a go-to-top button with reading progress, and light and dark themes. It meets WCAG 2.2 AAA colour contrast and passes axe with no violations.

## Put it on GitHub (Windows PowerShell)

```powershell
cd $HOME\Downloads
Expand-Archive -Path .\YuktaiDocs.zip -DestinationPath . -Force
cd .\YuktaiDocs
git init -b main
git add .
git commit -m "YuktaiDocs: YuktAI documentation site"
# create an empty repo named YuktaiDocs on github.com first (no README), then:
git remote add origin https://github.com/sandeepmiriyala03/YuktaiDocs.git
git push -u origin main
```

## Deploy on Netlify

1. Go to app.netlify.com, then **Add new site → Import an existing project → GitHub**, and pick **YuktaiDocs**.
2. Leave **Build command** empty and set **Publish directory** to `.` (both are already set in `netlify.toml`).
3. Click **Deploy**. Every `git push` to `main` redeploys in under a minute.
4. Optional: in **Domain management**, add a domain such as `docs.aksharatantra.miriyala.in`.

`netlify.toml` also sets the security headers: a Content-Security-Policy that allows YuktAI's CDN and WebAssembly (`'wasm-unsafe-eval'`), nosniff, the referrer policy and no framing.

## A new YuktAI release

1. **Try it first, with no changes:** open any page with `?v=5.3.10` (any version) added to the address. It lasts for that browser tab; `?v=default` goes back. The site also shows a note when npm has a newer version.
2. **Switch the site:** in `assets/js/config.js` set `version: "5.3.10"`, and in `sw.js` change `CACHE` to the next number (`"yuktaidocs-v2"`).
3. `git commit -am "YuktAI 5.3.10" ; git push`

The icon studio, QA rules and status read their data from the loaded YuktAI script, so new icons and rules appear automatically.

## Edit content

- Each page is a plain `.html` file. The menu is repeated in each page, so a new page needs its link added to every file and its name added to `CORE` in `sw.js`.
- Shared look: `assets/css/site.css` (colours are the `--d-*` tokens at the top). Shared behaviour: `assets/js/site.js`. Each page's demo: `assets/js/pages/<page>.js`. Sample data: `assets/js/data.js`.
- Icons used by the site itself: `assets/icons.svg` (YuktAI icon paths).
- After any change, bump `CACHE` in `sw.js` so returning visitors get it.

## Run it locally

A page opened as a file (`file://`) can't use the service worker. Use any static server:

```powershell
npx serve .
```

License: GPL-3.0, same as YuktAI.
