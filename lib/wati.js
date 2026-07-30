// lib/wati.js
export const sendWhatsAppNotification = async (orderData) => {
  try {
    console.log('📤 إرسال إشعار واتساب عبر Wati...');

    const response = await fetch('/api/whatsapp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ orderData })
    });

    const result = await response.json();
    console.log('✅ تم إرسال إشعار واتساب:', result);
    
    return result;
  } catch (error) {
    console.error('❌ خطأ في إرسال إشعار واتساب:', error);
    return { success: false, error: error.message };
  }
};