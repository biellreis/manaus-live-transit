// API data must always come from the network. Remove legacy caches.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('manaus-transit-')).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
