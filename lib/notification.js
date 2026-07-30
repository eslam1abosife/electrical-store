// lib/notification.js
import { supabase } from './supabase';

export const sendNewOrderNotification = async (orderData) => {
  try {
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
    console.log(`📤 إرسال إشعار لـ ${tokenList.length} مستخدم`);

    const response = await fetch('/api/notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tokens: tokenList,
        title: `📦 طلب جديد #${orderData.id?.slice(0, 8) || 'NEW'}`,
        body: `من: ${orderData.customer_name || 'عميل'} - ${orderData.total_price} ج`,
        data: {
          order_id: orderData.id,
          type: 'new_order',
          click_action: '/dashboard/orders'
        }
      })
    });

    const result = await response.json();
    console.log('✅ تم إرسال الإشعارات:', result);
    return result;
  } catch (error) {
    console.error('❌ خطأ في إرسال الإشعار:', error);
  }
};