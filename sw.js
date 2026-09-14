// Cache-first service worker: after the first online visit the game plays
// offline. Bump VERSION on every deploy so phones pick up the new files.
const VERSION = 'pal-v6';

const ASSETS = [
  '.',
  'index.html',
  'css/style.css',
  'js/app.js',
  'js/i18n.js',
  'js/audio.js',
  'js/progress.js',
  'js/engine/maze-engine.js',
  'js/engine/maze-levels.js',
  'js/engine/rounds.js',
  'js/modules/maze.js',
  'js/modules/counting.js',
  'js/modules/colors.js',
  'js/modules/letters.js',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
];

self.addEventListener('install', e => {
  // no-cache: never re-cache files the browser's HTTP cache holds stale
  e.waitUntil(caches.open(VERSION).then(c =>
    c.addAll(ASSETS.map(u => new Request(u, { cache: 'no-cache' })))));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      // cache voice clips as they are first played
      if (e.request.url.includes('/audio/') && res.ok) {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put(e.request, copy));
      }
      return res;
    }))
  );
});
