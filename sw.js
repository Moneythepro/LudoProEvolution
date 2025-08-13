/* global self, caches, fetch */
const CACHE = "ludo6-v1";
const OFFLINE_URLS = [
  "/LudoProEvolution/",
  "/LudoProEvolution/index.html",
  "/LudoProEvolution/style.css",
  "/LudoProEvolution/js/app.js",
  "/LudoProEvolution/js/board-2d.js",
  "/LudoProEvolution/js/rules.js",
  "/LudoProEvolution/js/ai.js",
  "/LudoProEvolution/js/net-webrtc.js",
  "/LudoProEvolution/js/util-seed.js",
  "/LudoProEvolution/js/pwa-install.js",
  "/LudoProEvolution/manifest.webmanifest",
  "/LudoProEvolution/icons/icon-192.png",
  "/LudoProEvolution/icons/icon-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(OFFLINE_URLS);
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    self.clients.claim();
  })());
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (url.origin === location.origin) {
    // App shell: network first for HTML, cache first for assets
    if (e.request.mode === "navigate") {
      e.respondWith((async () => {
        try {
          const res = await fetch(e.request);
          const cache = await caches.open(CACHE);
          cache.put("/LudoProEvolution/index.html", res.clone());
          return res;
        } catch {
          const cache = await caches.open(CACHE);
          return cache.match("/LudoProEvolution/index.html");
        }
      })());
      return;
    }
    e.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(e.request);
      if (cached) return cached;
      try {
        const res = await fetch(e.request);
        cache.put(e.request, res.clone());
        return res;
      } catch {
        return cached || Response.error();
      }
    })());
  }
});
