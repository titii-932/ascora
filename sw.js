const CACHE = 'ascora-v50';

const STATIC = [
  '/ascora/index.html',
  '/ascora/dashboard-coach.html',
  '/ascora/dashboard-client.html',
  '/ascora/manifest.json',
  '/ascora/icons/icon-192.png',
  '/ascora/icons/icon-512.png'
];

// Install: pre-cache les fichiers statiques.
// On ajoute chaque fichier separement (pas cache.addAll) car un seul fichier
// manquant (ex: icone pas encore uploadee) ferait echouer TOUT le preload
// avec addAll, empechant la nouvelle version de s'installer et bloquant
// les visiteurs sur une ancienne version indefiniment.
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return Promise.all(STATIC.map(function(url) {
        // cache: 'reload' : on telecharge la version du serveur, jamais une copie perimee du navigateur.
        return cache.add(new Request(url, { cache: 'reload' })).catch(function() { /* fichier absent, on continue */ });
      }));
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

// Push notifications
self.addEventListener('push', function(e) {
  var data = e.data ? e.data.json() : {};
  var title = data.title || 'Ascora';
  var options = {
    body: data.body || '',
    icon: '/ascora/icons/icon-192.png',
    badge: '/ascora/icons/icon-192.png',
    data: { url: data.url || '/' }
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  var target = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].url.includes(target) && 'focus' in list[i]) return list[i].focus();
      }
      if (clients.openWindow) return clients.openWindow(target);
    })
  );
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

  // Network-first : pages HTML (toujours la derniere version, la copie ne sert que hors connexion)
  if (e.request.mode === 'navigate' || /\.html(\?|#|$)/.test(url)) {
    e.respondWith(
      fetch(e.request, { cache: 'no-cache' }).then(function(response) {
        if (response && response.status === 200 && response.type === 'basic') {
          var copy = response.clone();
          caches.open(CACHE).then(function(cache) { cache.put(e.request, copy); });
        }
        return response;
      }).catch(function() {
        return caches.match(e.request, { ignoreSearch: true });
      })
    );
    return;
  }

  // Cache-first : fichiers locaux (icons, manifest)
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
