var CACHE_NAME = 'burn-v3';

self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(names.map(function(n) { return caches.delete(n); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  return;
});

// Web Push Handler
self.addEventListener('push', function(e) {
  var data = { title: 'BURN Terminal', body: 'Alert triggered', tag: 'burn-alert' };
  try {
    if (e.data) data = e.data.json();
  } catch (err) {
    try { data.body = e.data.text(); } catch (e2) {}
  }
  var options = {
    body: data.body || '',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    tag: data.tag || 'burn-alert',
    vibrate: [200, 100, 200],
    requireInteraction: true,
    data: { url: data.url || './' }
  };
  e.waitUntil(self.registration.showNotification(data.title || 'BURN Terminal', options));
});

self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  var url = e.notification.data && e.notification.data.url ? e.notification.data.url : './';
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(function(list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].url.indexOf('burn-analyst') !== -1 && 'focus' in list[i]) return list[i].focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
