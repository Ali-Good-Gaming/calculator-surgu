const CACHE_NAME = 'studcalc-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  // Добавьте сюда пути ко всем необходимым файлам
  '/img/emojis/party.gif',
  '/img/emojis/happy.gif',
  '/img/emojis/neutral.gif',
  '/img/emojis/sad.gif'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
