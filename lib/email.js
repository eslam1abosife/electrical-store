// lib/email.js
export const sendEmailNotification = async (orderData) => {
  try {
    console.log('📧 Sending email notification...');

    // إضافة بيانات التقسيط للإيميل
    const emailData = {
      ...orderData,
      down_payment: orderData.down_payment || 0,
      remaining_amount: orderData.remaining_amount || 0,
      monthly_payment: orderData.monthly_payment || 0,
      months: orderData.months || 0
    };

    const response = await fetch('/api/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ orderData: emailData })
    });

    const result = await response.json();
    console.log('📧 Email result:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Email error:', error);
    return { success: false, error: error.message };
  }
};