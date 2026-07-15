const CACHE_NAME = 'rafidain-v1';
const FILES_TO_CACHE = [
  '/rafidain-sales-app/',
  '/rafidain-sales-app/index.html',
  '/rafidain-sales-app/manifest.json',
  '/rafidain-sales-app/icon-192.png',
  '/rafidain-sales-app/icon-512.png',
  
  // كل الـ 22 صفحة
  '/rafidain-sales-app/dashboard.html',
  '/rafidain-sales-app/sales.html',
  '/rafidain-sales-app/add-product.html',
  '/rafidain-sales-app/products.html',
  '/rafidain-sales-app/new-invoice.html',
  '/rafidain-sales-app/invoices.html',
  '/rafidain-sales-app/customers.html',
  '/rafidain-sales-app/suppliers.html',
  '/rafidain-sales-app/reports.html',
  '/rafidain-sales-app/reports-sales.html',
  '/rafidain-sales-app/reports-stock.html',
  '/rafidain-sales-app/reports-debt.html',
  '/rafidain-sales-app/stock.html',
  '/rafidain-sales-app/offers.html',
  '/rafidain-sales-app/returns.html',
  '/rafidain-sales-app/expenses.html',
  '/rafidain-sales-app/users.html',
  '/rafidain-sales-app/admin.html',
  '/rafidain-sales-app/backup.html',
  '/rafidain-sales-app/notifications.html',
  '/rafidain-sales-app/help.html',
  '/rafidain-sales-app/about.html'
];

// تثبيت الـ Service Worker وتخزين الملفات
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// تفعيل ومسح الكاش القديم
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

// جلب الملفات من الكاش او من النت
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
