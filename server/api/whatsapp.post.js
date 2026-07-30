// server/api/whatsapp.post.js
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { orderData } = body;

    if (!orderData) {
      return { success: false, message: 'No orderData provided' };
    }

    const WATI_API_TOKEN = process.env.WATI_API_TOKEN;
    const ADMIN_PHONE = process.env.ADMIN_PHONE_NUMBER;
    const WATI_INSTANCE_ID = process.env.WATI_INSTANCE_ID; // أضف Instance ID

    if (!WATI_API_TOKEN) {
      return { success: false, message: 'WATI_API_TOKEN not configured' };
    }

    if (!WATI_INSTANCE_ID) {
      console.error('❌ WATI_INSTANCE_ID not found, trying without it...');
    }

    const messageText = `
📦 طلب جديد من المعرض!

👤 العميل: ${orderData.customer_name || 'عميل'}
💰 المبلغ: ${orderData.total_price} ج
🆔 رقم الطلب: #${orderData.id?.slice(0, 8) || 'NEW'}
📅 التاريخ: ${new Date().toLocaleDateString('ar-EG')}

✅ تم استلام الطلب بنجاح
    `.trim();

    console.log('📤 Sending message...');

    // جرب الرابط مع Instance ID
    let url = 'https://api.wati.io/api/v1/sendMessage';
    if (WATI_INSTANCE_ID) {
      url = `https://api.wati.io/api/v1/instances/${WATI_INSTANCE_ID}/sendMessage`;
    }

    console.log('📤 URL:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WATI_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phoneNumber: ADMIN_PHONE,
        message: messageText
      })
    });

    const status = response.status;
    const responseText = await response.text();
    console.log('📩 Status:', status);
    console.log('📩 Response:', responseText);

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      result = { raw: responseText };
    }

    if (status === 200 || status === 201) {
      return { success: true, message: '✅ WhatsApp sent', result };
    } else {
      return { success: false, message: `⚠️ Failed (${status})`, result };
    }
  } catch (error) {
    console.error('❌ Error:', error);
    return { success: false, message: 'Error', error: error.message };
  }
});