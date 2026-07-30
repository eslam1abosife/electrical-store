// lib/firebase.js
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// 🔥 بيانات Firebase بتاعتك
const firebaseConfig = {
  apiKey: "AIzaSyDa3OSesqamiRUExJU2cuYqbqUiNApDcCA",
  authDomain: "electrical-store-535f3.firebaseapp.com",
  projectId: "electrical-store-535f3",
  storageBucket: "electrical-store-535f3.firebasestorage.app",
  messagingSenderId: "220136532058",
  appId: "1:220136532058:web:6ab41711ad9a547bde9063"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// ✅ VAPID Key بتاعك
const VAPID_KEY = "BDs9fHYo5nfxRVqVnhjzjJfYteWoxca41DRO0hocUcOp6fMI_QMzPidNBzwahGjAHrOjq7UryREFANvBc15eyxg";

// ✅ دالة طلب الإذن وجلب التوكن
export const requestNotificationPermission = async () => {
  try {
    // طلب إذن الإشعارات من المتصفح
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('✅ تم منح إذن الإشعارات');
      
      // جلب التوكن (مفتاح الجهاز)
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY
      });
      
      console.log('📱 Firebase Token:', token);
      
      // حفظ التوكن في Supabase
      await saveTokenToSupabase(token);
      
      return token;
    } else {
      console.log('❌ لم يتم منح الإذن');
      return null;
    }
  } catch (error) {
    console.error('❌ خطأ في طلب الإذن:', error);
    return null;
  }
};

// ✅ حفظ التوكن في Supabase
const saveTokenToSupabase = async (token) => {
  try {
    const { supabase } = await import('~/lib/supabase');
    const userStore = useUserStore();
    
    if (!userStore.user?.id) {
      console.log('⚠️ مفيش مستخدم مسجل');
      return;
    }
    
    const { error } = await supabase
      .from('user_tokens')
      .upsert({
        user_id: userStore.user.id,
        fcm_token: token,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });
    
    if (error) {
      console.error('❌ خطأ في حفظ التوكن:', error);
    } else {
      console.log('✅ تم حفظ التوكن في Supabase');
    }
  } catch (error) {
    console.error('❌ خطأ في حفظ التوكن:', error);
  }
};

// ✅ استقبال الإشعارات (لما التطبيق مفتوح)
export const setupNotificationListener = () => {
  try {
    onMessage(messaging, (payload) => {
      console.log('🔔 إشعار ورد:', payload);
      
      // عرض Toast في المتصفح
      showBrowserNotification(
        payload.notification?.title || '📦 طلب جديد',
        payload.notification?.body || 'تم استلام طلب جديد'
      );
      
      // عرض Toast داخل التطبيق
      showAppToast(payload.notification?.title, payload.notification?.body);
    });
  } catch (error) {
    console.error('❌ خطأ في إعداد المستمع:', error);
  }
};

// ✅ عرض إشعار في المتصفح
const showBrowserNotification = (title, body) => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body: body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [200, 100, 200]
    });
  }
};

// ✅ عرض Toast داخل التطبيق (إشعار منبثق)
const showAppToast = (title, body) => {
  const toast = document.createElement('div');
  toast.className = 'fixed top-4 left-4 right-4 sm:left-auto sm:right-4 bg-blue-600 text-white p-4 rounded-2xl shadow-2xl z-50 max-w-md animate-slide-down';
  toast.innerHTML = `
    <div class="flex items-center gap-3">
      <span class="text-2xl">🔔</span>
      <div>
        <div class="font-bold">${title || 'طلب جديد'}</div>
        <div class="text-sm opacity-90">${body || 'تم استلام طلب جديد'}</div>
      </div>
    </div>
  `;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 5000);
};

// ✅ دالة إرسال الإشعار (تستخدم بعد إنشاء الطلب)
export const sendNewOrderNotification = async (orderData) => {
  try {
    // جلب توكنات المستخدمين المسؤولين
    const { supabase } = await import('~/lib/supabase');
    
    const { data: tokens, error } = await supabase
      .from('user_tokens')
      .select('fcm_token, users!inner(role)')
      .eq('users.role', 'admin');
    
    if (error) {
      console.error('❌ خطأ في جلب التوكنات:', error);
      return;
    }
    
    if (!tokens || tokens.length === 0) {
      console.log('⚠️ مفيش مستخدمين مسجلين للإشعارات');
      return;
    }
    
    console.log(`📤 إرسال إشعار لـ ${tokens.length} مستخدم`);
    
    // إرسال الإشعار لكل توكن
    for (const tokenData of tokens) {
      await sendFCMNotification(tokenData.fcm_token, {
        title: `📦 طلب جديد #${orderData.id.slice(0, 8)}`,
        body: `من: ${orderData.customer_name || 'عميل'} - ${formatNumber(orderData.total_price)} ج`,
        data: {
          order_id: orderData.id,
          type: 'new_order',
          sale_type: orderData.sale_type || 'offline'
        }
      });
    }
  } catch (error) {
    console.error('❌ خطأ في إرسال الإشعار:', error);
  }
};

// ✅ دالة إرسال الإشعار باستخدام FCM
const sendFCMNotification = async (token, payload) => {
  try {
    // ⚠️ هات الـ Server Key من Firebase Console
    const SERVER_KEY = "YOUR_SERVER_KEY_FROM_FIREBASE_CONSOLE";
    
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `key=${SERVER_KEY}`
      },
      body: JSON.stringify({
        to: token,
        notification: {
          title: payload.title,
          body: payload.body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          vibrate: [200, 100, 200],
          sound: 'default'
        },
        data: payload.data || {},
        priority: 'high'
      })
    });
    
    const result = await response.json();
    console.log('✅ تم إرسال الإشعار:', result);
    return result;
  } catch (error) {
    console.error('❌ خطأ في إرسال الإشعار:', error);
    throw error;
  }
};

// ✅ دالة مساعدة لتنسيق الأرقام
const formatNumber = (num) => {
  if (!num && num !== 0) return '0';
  return num.toLocaleString('ar-EG');
};