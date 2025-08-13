const CACHE = 'ludo6-shell-v1';
const ASSETS = [
  '/LudoProEvolution/',
  '/LudoProEvolution/index.html',
  '/LudoProEvolution/game.html',
  '/LudoProEvolution/lobby.html',
  '/LudoProEvolution/rules.html',
  '/LudoProEvolution/style.css',
  '/LudoProEvolution/manifest.webmanifest'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).catch(()=>caches.match('/LudoProEvolution/game.html')))
  );
});
