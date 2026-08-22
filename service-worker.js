importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyAFgqvySiMAs1TtvC1r_nBZZvZIwg1g4u0',
  authDomain: 'babyjourney-b1168.firebaseapp.com',
  databaseURL: 'https://babyjourney-b1168-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'babyjourney-b1168',
  storageBucket: 'babyjourney-b1168.firebasestorage.app',
  messagingSenderId: '617703916263',
  appId: '1:617703916263:web:3cc28f9f845f1c56679842'
});

const messaging = firebase.messaging();
messaging.onBackgroundMessage(payload => {
  const data = payload.data || {};
  self.registration.showNotification(data.title || 'Toddler\'s Day', {
    body: data.body || 'Jangan lupa kemas kini perkembangan anak hari ini.',
    icon: './assets/icons/toddler-day-icon.svg',
    badge: './assets/icons/toddler-day-maskable.svg',
    tag: data.tag || 'toddlers-day-daily',
    data: { url: data.url || './' }
  });
});

const CACHE_NAME = 'toddlers-day-shell-v4';
const APP_SHELL = [
  './',
  './index.html',
  './firebase-messaging-sw.js',
  './manifest.webmanifest',
  './assets/fonts/Skynight.otf',
  './assets/icons/toddler-day-icon.svg',
  './assets/icons/toddler-day-maskable.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.allSettled(APP_SHELL.map(url => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(async () =>
          (await caches.match(request)) ||
          (await caches.match('./index.html')) ||
          (await caches.match('./'))
        )
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      const fresh = fetch(request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      }).catch(() => cached);
      return cached || fresh;
    })
  );
});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || './', self.location.origin).href;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const existing = list.find(client => client.url.startsWith(self.location.origin));
      return existing ? existing.focus().then(() => existing.navigate(target)) : clients.openWindow(target);
    })
  );
});
