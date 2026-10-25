const CACHE = 'nightfall-ops-shell-v1';
const SHELL = ['./','./manifest.webmanifest','./icons/nightfall.svg'];
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(caches.match(req).then(hit => hit || fetch(req).then(response => {
    if (response.ok && (req.destination === 'image' || req.destination === 'audio' || req.destination === 'font' || req.url.endsWith('.js') || req.url.endsWith('.css'))) {
      const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(req, copy));
    }
    return response;
  }).catch(() => req.mode === 'navigate' ? caches.match('./') : Promise.reject(new Error('Offline resource unavailable')))));
});
