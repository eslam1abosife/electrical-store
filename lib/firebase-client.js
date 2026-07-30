// lib/firebase-client.js
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

// ✅ طلب الإذن
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      console.log('📱 Token:', token);
      
      // حفظ التوكن في Supabase
      await saveToken(token);
      return token;
    }
    return null;
  } catch (error) {
    console.error('❌ خطأ:', error);
    return null;
  }
};

// ✅ حفظ التوكن
const saveToken = async (token) => {
  try {
    const { supabase } = await import('~/lib/supabase');
    const userStore = useUserStore();
    
    if (!userStore.user?.id) return;
    
    await supabase
      .from('user_tokens')
      .upsert({
        user_id: userStore.user.id,
        fcm_token: token,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
      
    console.log('✅ تم حفظ التوكن');
  } catch (error) {
    console.error('❌ خطأ في حفظ التوكن:', error);
  }
};

// ✅ استقبال الإشعارات
export const setupNotificationListener = () => {
  try {
    onMessage(messaging, (payload) => {
      console.log('🔔 إشعار:', payload);
      
      if (Notification.permission === 'granted') {
        new Notification(
          payload.notification?.title || '📦 طلب جديد',
          {
            body: payload.notification?.body || 'تم استلام طلب جديد',
            icon: '/favicon.ico',
            vibrate: [200, 100, 200]
          }
        );
      }
    });
  } catch (error) {
    console.error('❌ خطأ:', error);
  }
};