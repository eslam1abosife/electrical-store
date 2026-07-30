// server/api/send-notification.post.js
import admin from 'firebase-admin';
import serviceAccount from '~/lib/service-account.json' assert { type: 'json' };

// تهيئة Firebase Admin (مرة واحدة فقط)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'electrical-store-535f3'
  });
}

const messaging = admin.messaging();

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { tokens, title, body: messageBody, data } = body;

    if (!tokens || tokens.length === 0) {
      return { success: false, message: 'لا توجد توكنات' };
    }

    // إرسال الإشعارات
    const response = await messaging.sendEachForMulticast({
      notification: {
        title: title || '📦 طلب جديد',
        body: messageBody || 'تم استلام طلب جديد'
      },
      data: data || {},
      tokens: tokens,
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          vibrate: [200, 100, 200]
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default'
          }
        }
      }
    });

    return {
      success: true,
      response: response
    };
  } catch (error) {
    console.error('❌ خطأ في إرسال الإشعار:', error);
    return {
      success: false,
      error: error.message
    };
  }
});