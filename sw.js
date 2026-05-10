const CACHE = 'ascora-v1';

const STATIC = [
  '/index.html',
  '/dashboard-coach.html',
  '/dashboard-client.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Install: pre-cache les fichiers statiques
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(STATIC);
    })
  );
  self.skipWaiting();
});

// Activate: purge les anciens caches
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; }).map(function(k) {
          return caches.delete(k);
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: network-first pour Supabase/CDN, cache-first pour assets locaux
self.addEventListener('fetch', function(e) {
  var url = e.request.url;

  // Network-first : API Supabase, fonts, CDN libs
  if (url.includes('supabase.co') ||
      url.includes('googleapis.com') ||
      url.includes('gstatic.com') ||
      url.includes('jsdelivr.net')) {
    e.respondWith(
      fetch(e.request).catch(function() {
        return caches.match(e.request);
      })
    );
    return;
  }

  // Cache-first : fichiers locaux (HTML, icons, manifest)
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(response) {
        if (response && response.status === 200 && response.type === 'basic') {
          var clone = response.clone();
          caches.open(CACHE).then(function(cache) { cache.put(e.request, clone); });
        }
        return response;
      });
    })
  );
});
