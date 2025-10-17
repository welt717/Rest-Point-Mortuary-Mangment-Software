const CACHE_NAME = 'restpoint-cache-v2'; // Bump the version to force a Service Worker update
const ASSETS_TO_CACHE = [
  // CRITICAL ASSETS: These must be cached on installation
  '/', 
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/rest.png', // Assuming 'rest.png' is the correct icon name based on your manifest
];
// NOTE: DO NOT include dynamically named JS/CSS files in this list, 
// as they change every build. We handle them via a runtime caching strategy.


// Install event - Cache the App Shell
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching App Shell assets...');
      // Use addAll, but handle failures gracefully if some optional assets are missing
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
          console.warn('[Service Worker] Some assets failed to cache:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  event.waitUntil(clients.claim());
});

// Fetch event (Network-or-Cache with App Shell Fallback)
self.addEventListener('fetch', (event) => {
  
  // 1. Handle Navigation Requests (Crucial for React Routing)
  // If the request is for an HTML document (navigation), try the network first.
  if (event.request.mode === 'navigate' || 
      (event.request.method === 'GET' && event.request.headers.get('accept').includes('text/html'))) {
    
    event.respondWith(
      fetch(event.request).catch(() => {
        // If the network request for any page fails (e.g., offline or 404),
        // we serve the cached index.html (App Shell)
        console.log('[Service Worker] Navigation failed, serving App Shell.');
        return caches.match('/index.html');
      })
    );
    return;
  }

  // 2. Handle API/Dynamic Asset Requests (Cache-First)
  // For all other assets (JS, CSS, images, data), use the cache-first strategy.
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; // Return cached asset immediately
      }

      // If not in cache, fetch from the network
      return fetch(event.request).catch(() => {
        // Fallback for *dynamic assets* is usually a generic asset or just let it fail, 
        // but for a Service Worker-based app, the critical asset is index.html.
        // However, since we handled navigation above, this part typically covers dynamic JS/CSS
        // that fail to load on a Network Error. 
        // We ensure a hard-coded fallback for the primary index.html is available.
        if (event.request.url.includes('.js') || event.request.url.includes('.css')) {
            console.log('[Service Worker] Asset not found, cannot respond.');
            // Do not return index.html here, as it will corrupt the JS/CSS context.
        }
      });
    })
  );
});