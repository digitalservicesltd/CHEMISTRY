const CACHE_NAME = 'pfa-study-v2';
const CORE_ASSETS = [
  '/CHEMISTRY/',
  '/CHEMISTRY/index.html',
  '/CHEMISTRY/css/style.css',
  '/CHEMISTRY/js/main.js',
  '/CHEMISTRY/engine/platform.js',
  '/CHEMISTRY/engine/progress.js',
  '/CHEMISTRY/engine/search.js',
  '/CHEMISTRY/engine/components.js',
  '/CHEMISTRY/chapters.json'
];

// Install — cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CORE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch — network-first for HTML, cache-first for assets
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // HTML pages — network first, fall back to cache
  if (event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, clone);
            });
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // CSS, JS, JSON — cache first, fall back to network
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        // Update cache in background
        fetch(event.request).then(response => {
          if (response.ok) {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, response);
            });
          }
        }).catch(() => {});
        return cached;
      }
      return fetch(event.request).then(response => {
        if (response.ok && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clone);
          });
        }
        return response;
      });
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(
      'https://digitalservicesltd.github.io/CHEMISTRY/'
    )
  );
});