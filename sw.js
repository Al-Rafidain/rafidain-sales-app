    const CACHE_NAME = 'rafidain-v1';
    const FILES = [
      '/rafidain-sales-app/',
      '/rafidain-sales-app/index.html',
      '/rafidain-sales-app/manifest.json',
      '/rafidain-sales-app/icon-192.png',
      '/rafidain-sales-app/icon-512.png'
    ];
    self.addEventListener('install', e => e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(FILES))));
    self.addEventListener('fetch', e => e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))));
