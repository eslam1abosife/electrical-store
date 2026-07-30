// lib/firebase-admin.js
import { supabase } from './supabase';

// ✅ دالة إرسال إشعار عبر الـ API
export const sendFCMNotification = async (token, payload) => {
  try {
    const response = await fetch('/api/send-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tokens: [token],
        title: payload.title,
        body: payload.body,
        data: payload.data || {}
      })
    });

    const result = await response.json();
    
    if (!result.success) {
      console.error('❌ فشل إرسال الإشعار:', result.error);
      throw new Error(result.error);
    }
    
    console.log('✅ تم إرسال الإشعار:', result.response);
    return result;
  } catch (error) {
    console.error('❌ خطأ في إرسال الإشعار:', error);
    throw error;
  }
};

// ✅ دالة إرسال إشعارات لعدة مستخدمين
export const sendMulticastNotification = async (tokens, payload) => {
  if (!tokens || tokens.length === 0) {
    console.log('⚠️ مفيش توكنات للإرسال');
    return;
  }

  try {
    const response = await fetch('/api/send-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tokens: tokens,
        title: payload.title,
        body: payload.body,
        data: payload.data || {}
      })
    });

    const result = await response.json();
    
    if (!result.success) {
      console.error('❌ فشل إرسال الإشعارات:', result.error);
      throw new Error(result.error);
    }
    
    console.log('✅ تم إرسال الإشعارات:', result.response);
    return result;
  } catch (error) {
    console.error('❌ خطأ في إرسال الإشعارات:', error);
    throw error;
  }
};

// ✅ دالة إرسال إشعار عند طلب جديد
export const sendNewOrderNotification = async (orderData) => {
  try {
    // جلب توكنات المستخدمين المسؤولين
    const { data: tokens, error } = await supabase
      .from('user_tokens')
      .select('fcm_token');
    
    if (error) {
      console.error('❌ خطأ في جلب التوكنات:', error);
      return;
    }
    
    if (!tokens || tokens.length === 0) {
      console.log('⚠️ مفيش توكنات مسجلة');
      return;
    }
    
    const tokenList = tokens.map(t => t.fcm_token);
    
    // إرسال الإشعار
    await sendMulticastNotification(tokenList, {
      title: `📦 طلب جديد #${orderData.id.slice(0, 8)}`,
      body: `من: ${orderData.customer_name || 'عميل'} - ${formatNumber(orderData.total_price)} ج`,
      data: {
        order_id: orderData.id,
        type: 'new_order',
        sale_type: orderData.sale_type || 'offline',
        click_action: '/dashboard/orders'
      }
    });
    
    console.log('✅ تم إرسال الإشعارات للمدراء');
  } catch (error) {
    console.error('❌ خطأ في إرسال إشعار الطلب الجديد:', error);
  }
};

// ✅ دالة مساعدة لتنسيق الأرقام
const formatNumber = (num) => {
  if (!num && num !== 0) return '0';
  return num.toLocaleString('ar-EG');
};