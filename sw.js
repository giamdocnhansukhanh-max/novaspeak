const CACHE_NAME = 'novaspeak-v2-brand-cache-v1';
const urlsToCache = [
  '/novaspeak/',
  '/novaspeak/index.html',
  '/novaspeak/manifest.json',
  '/novaspeak/icon-192x192.png',
  '/novaspeak/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .catch((err) => console.log('Cache failed:', err))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) return caches.delete(cacheName);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) return response;
        const fetchRequest = event.request.clone();
        return fetch(fetchRequest).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') return response;
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          return response;
        }).catch(() => {
          if (event.request.mode === 'navigate') return caches.match('/novaspeak/');
        });
      })
  );
});
