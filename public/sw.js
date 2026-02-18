const CACHE_NAME = 'easy-messenger-v1';


self.addEventListener('install', (event) => {
    self.skipWaiting()
});

self.addEventListener('activate', (event) => {
    console.log('[SW] Service Worker активирован');
});

self.addEventListener('fetch', (event) => {
    event.respondWith(fetch(event.request));
});