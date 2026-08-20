/* Firebase's default web-push worker path.
 * This file is intentionally separate from the main PWA service worker so
 * Android browsers can register Firebase Messaging without receiving a 404.
 */
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
  self.registration.showNotification(data.title || "Toddler's Day", {
    body: data.body || 'Jangan lupa kemas kini perkembangan anak hari ini.',
    icon: '/assets/icons/toddler-day-icon.svg',
    badge: '/assets/icons/toddler-day-maskable.svg',
    tag: data.tag || 'toddlers-day-reminder',
    data: { url: data.url || '/' }
  });
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || '/', self.location.origin).href;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const existing = list.find(client => client.url.startsWith(self.location.origin));
      return existing ? existing.focus().then(() => existing.navigate(target)) : clients.openWindow(target);
    })
  );
});
