// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            'AIzaSyCgfZVcwwyP-z3g7U4qfLQwv-NJmj3immM',
  authDomain:        'sevalink-79536.firebaseapp.com',
  projectId:         'sevalink-79536',
  storageBucket:     'sevalink-79536.firebasestorage.app',
  messagingSenderId: '218533318260',
  appId:             '1:218533318260:web:bc76c18b400f1b8cb9cb21',
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received:', payload);
  const { title, body, icon } = payload.notification || {};
  self.registration.showNotification(title || 'SevaLink', {
    body:    body  || 'You have a new notification',
    icon:    icon  || '/favicon.svg',
    badge:   '/favicon.svg',
    data:    payload.data || {},
    actions: [
      { action: 'open',    title: 'Open App' },
      { action: 'dismiss', title: 'Dismiss'  },
    ],
  });
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      if (list.length > 0) return list[0].focus();
      return clients.openWindow('/');
    })
  );
});

// Signal token refresh to the app
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    if (data?.data?.type === 'token_refresh') {
      self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage({ type: 'FCM_TOKEN_REFRESH' }));
      });
    }
  }
});
