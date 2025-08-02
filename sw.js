// Уникальное имя кэша
const CACHE_NAME = 'studcalc-pwa-v3';

// Файлы для предварительного кэширования
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  'favicon.ico',
  'icon-192x192.png',
  'icon-512x512.png',
  // Добавьте сюда пути к другим важным ресурсам
];

// Установка Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Кэш открыт');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Активация Service Worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Удаляем старые кэши
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => self.clients.claim())
  );
});

// Перехват сетевых запросов
self.addEventListener('fetch', event => {
  // Пропускаем POST-запросы и запросы chrome-extension
  if (event.request.method !== 'GET' || 
      event.request.url.startsWith('chrome-extension')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Возвращаем кэшированный ресурс, если он есть
        if (response) {
          return response;
        }

        // Иначе загружаем из сети
        return fetch(event.request)
          .then(response => {
            // Проверяем, получили ли мы корректный ответ
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Клонируем ответ
            const responseToCache = response.clone();

            // Добавляем в кэш
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(error => {
            console.error('Ошибка при загрузке:', error);
          });
      })
  );
});
