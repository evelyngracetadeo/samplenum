/* MathTibay Service Worker */
const CACHE_VERSION = 'mt-v1.0.0';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/index_bright.html',
  '/manifest.json',
  // sessions (update if filenames differ)
  '/session1.html','/session2.html','/session3.html',
  '/session4.html','/session5.html','/session6.html',
  '/session7.html','/session8.html','/session9.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(CORE_ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => k !== STATIC_CACHE).map((k) => caches.delete(k))
    ))
  );
});

// Cache-first for navigations and same-origin GET requests
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return; // ignore non-GET
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // ignore cross-origin

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        const resClone = res.clone();
        caches.open(STATIC_CACHE).then((cache) => cache.put(req, resClone));
        return res;
      }).catch(() => {
        // offline fallback: if navigation, try index
        if (req.mode === 'navigate') return caches.match('/index.html');
      });
    })
  );
});
