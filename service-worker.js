const CACHE_NAME = '82-and-77-pwa-v5';
const APP_SHELL = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './our-song.m4a', './images/rovan-collage.png', './images/memory-1.jpg', './images/memory-2.jpg', './images/memory-3.jpg', './images/memory-4.jpg'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  const url = new URL(event.request.url);
  const isHtml = event.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('.webmanifest');
  if (isHtml) {
    event.respondWith(fetch(event.request).then(response => {
      if (response && response.status === 200) caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
      return response;
    }).catch(() => caches.match(event.request).then(cached => cached || caches.match('./index.html'))));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response && response.status === 200) { const copy = response.clone(); caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)); }
    return response;
  }).catch(() => caches.match('./index.html'))));
});
