const CACHE_NAME = 'pdfmaster-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response('<html><body style="text-align:center;padding:50px;font-family:sans-serif;"><h1>Offline</h1><p>Please check your internet connection.</p></body></html>', {
        headers: { 'Content-Type': 'text/html' }
      });
    })
  );
});