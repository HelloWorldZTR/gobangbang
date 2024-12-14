const CACHE_NAME = 'v1';
const urlsToCache = [
    'index.html',
    'css/style.css',
    'js/ui.js',
    'js/game.js',
    'js/replay.js',
    'includes/bootstrap.min.css',
    'includes/bootstrap.min.js',
    'includes/jquery.min.js',
    'includes/popper.min.js',
    'assests/bg.jpg',
    'assests/web_bg.png',
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});