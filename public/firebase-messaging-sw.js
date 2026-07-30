// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyDa3OSesqamiRUExJU2cuYqbqUiNApDcCA",
  authDomain: "electrical-store-535f3.firebaseapp.com",
  projectId: "electrical-store-535f3",
  storageBucket: "electrical-store-535f3.firebasestorage.app",
  messagingSenderId: "220136532058",
  appId: "1:220136532058:web:6ab41711ad9a547bde9063"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('📩 إشعار خلفية:', payload);
  
  const notificationTitle = payload.notification?.title || '📦 طلب جديد';
  const notificationOptions = {
    body: payload.notification?.body || 'تم استلام طلب جديد',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    data: payload.data || {}
  };
  
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// التعامل مع الضغط على الإشعار
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const url = event.notification.data?.click_action || '/dashboard/orders';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});