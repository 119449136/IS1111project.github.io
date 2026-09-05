/**
 * Offline support.
 *
 * The app is entirely static and holds all its data locally, so once the shell
 * is cached it works with no connection at all. Assets are revalidated in the
 * background so a deployed update is picked up on the next launch.
 */

const VERSION = 'poker-trainer-v5-obsidian';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './styles/app.css',
  './styles/premium.css',
  './styles/cinematic.css',
  './styles/obsidian.css',
  './src/ui/motion.js',
  './assets/poker-room.webp',
  './assets/poker-felt.webp',
  './assets/poker-study.webp',
  './src/ui/icons.js',
  './icons/icon.svg',
  './src/main.js',
  './src/cards.js',
  './src/evaluator.js',
  './src/equity.js',
  './src/ranges.js',
  './src/engine.js',
  './src/bots.js',
  './src/coach.js',
  './src/stats.js',
  './src/storage.js',
  './src/training.js',
  './src/ui/training.js',
  './src/ui/dom.js',
  './src/ui/game.js',
  './src/ui/views.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('poker-trainer-') && k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(VERSION).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
