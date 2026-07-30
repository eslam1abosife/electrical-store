// lib/firebase.js
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyDa3OSesqamiRUExJU2cuYqbqUiNApDcCA",
  authDomain: "electrical-store-535f3.firebaseapp.com",
  projectId: "electrical-store-535f3",
  storageBucket: "electrical-store-535f3.firebasestorage.app",
  messagingSenderId: "220136532058",
  appId: "1:220136532058:web:6ab41711ad9a547bde9063"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

const VAPID_KEY = "BDs9fHYo5nfxRVqVnhjzjJfYteWoxca41DRO0hocUcOp6fMI_QMzPidNBzwahGjAHrOjq7UryREFANvBc15eyxg";

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      console.log('📱 Token:', token);
      return token;
    }
    return null;
  } catch (error) {
    console.error('❌ Error:', error);
    return null;
  }
};

export const setupNotificationListener = () => {
  onMessage(messaging, (payload) => {
    console.log('🔔 Notification:', payload);
    if (Notification.permission === 'granted') {
      new Notification(payload.notification?.title || '📦 طلب جديد', {
        body: payload.notification?.body || 'تم استلام طلب جديد',
        icon: '/favicon.ico'
      });
    }
  });
};