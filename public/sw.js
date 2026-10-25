// Makes Luna Drawing work offline once it has been opened.
// Build files with a hash in their name, the Skia wasm and images: cache first.
// Everything else (the page, dev-server bundles): network first, cache when offline.
const CACHE = 'luna-drawing-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(['./', 'canvaskit.wasm', 'manifest.json'])),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

function save(request, response) {
  if (response.ok) {
    const copy = response.clone();
    caches.open(CACHE).then((cache) => cache.put(request, copy));
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  const immutable = url.pathname.includes('/_expo/static/') || /\.(wasm|png|ico)$/.test(url.pathname);
  if (immutable) {
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((r) => save(request, r))));
    return;
  }

  const key = request.mode === 'navigate' ? './' : request;
  event.respondWith(
    fetch(request)
      .then((r) => save(key, r))
      .catch(() => caches.match(key)),
  );
});
