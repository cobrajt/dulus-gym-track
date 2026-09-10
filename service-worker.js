const CACHE = 'dulus-gym-track-v4';
const ASSETS = ['./', './index.html', './styles.css', './library.css', './storage.js', './exercises.js', './app.js', './library.js', './workouts.js', './manifest.webmanifest', './icons/icon-192.svg', './icons/icon-512.svg'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('fetch', event => event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request))));
