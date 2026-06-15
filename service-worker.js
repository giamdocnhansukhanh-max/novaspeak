// NovaSpeak Service Worker
// Version: 1.0.0
// Date: 2026-06-15

const CACHE_NAME = 'novaspeak-v1';
const STATIC_ASSETS = [
  '/novaspeak/',
  '/novaspeak/index.html',
  '/novaspeak/styles.css',
  '/novaspeak/app.js',
  '/novaspeak/manifest.json',
  '/novaspeak/icons/icon-192x192.png',
  '/novaspeak/icons/icon-512x512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing NovaSpeak Service Worker...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((err) => {
        console.error('[SW] Cache failed:', err);
      })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating NovaSpeak Service Worker...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle requests within our scope
  if (!url.pathname.startsWith('/novaspeak/')) {
    return;
  }

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        // Cache successful responses
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(request, responseClone);
            });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache when offline
        console.log('[SW] Network failed, serving from cache:', request.url);
        return caches.match(request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // If not in cache, return index.html for SPA routing
            if (request.mode === 'navigate') {
              return caches.match('/novaspeak/');
            }
            return new Response('Offline - Content not available', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Message handler for skipWaiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync for form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-forms') {
    event.waitUntil(syncFormData());
  }
});

async function syncFormData() {
  // Implement form sync logic here
  console.log('[SW] Background sync triggered');
}

// Push notification handler
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'NovaSpeak notification',
    icon: '/novaspeak/icons/icon-192x192.png',
    badge: '/novaspeak/icons/icon-72x72.png',
    tag: 'novaspeak-notification',
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification('NovaSpeak', options)
  );
});
