// lib/email.js
export const sendEmailNotification = async (data, type = 'order') => {
  try {
    console.log(`📧 Sending ${type} email notification...`);

    const endpoint = '/api/email';
    const payload = {};

    if (type === 'installment_contract') {
      payload.installmentData = { type: 'new_contract', contract: data };
    } else if (type === 'installment_payment') {
      payload.installmentData = { type: 'payment', contract: data.contract, payment: data.payment };
    } else if (type === 'late_payments') {
      payload.latePayments = data;
    } else if (type === 'purchase') {
      payload.purchaseData = data;
    } else {
      payload.orderData = data;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log(`📧 ${type} email result:`, result);
    
    return result;
  } catch (error) {
    console.error('❌ Email error:', error);
    return { success: false, error: error.message };
  }
};