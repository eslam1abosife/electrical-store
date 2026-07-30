// server/api/email.post.js
import { Resend } from 'resend';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { orderData } = body;

    console.log('📧 Preparing email for order:', orderData);

    if (!orderData) {
      return { success: false, message: 'No orderData provided' };
    }

    // تهيئة Resend
    const resend = new Resend(process.env.RESEND_API_KEY);

    // بناء جدول المنتجات
    let productsHtml = '';
    let totalItems = 0;

    if (orderData.items && Array.isArray(orderData.items)) {
      orderData.items.forEach((item, index) => {
        totalItems += item.quantity || 0;
        productsHtml += `
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 10px 8px; text-align: right;">${index + 1}</td>
            <td style="padding: 10px 8px; text-align: right;">${item.name || 'منتج'}</td>
            <td style="padding: 10px 8px; text-align: center;">${item.quantity || 0}</td>
            <td style="padding: 10px 8px; text-align: right;">${(item.price || 0).toLocaleString('ar-EG')} ج</td>
            <td style="padding: 10px 8px; text-align: right; font-weight: bold; color: #16a34a;">${((item.price || 0) * (item.quantity || 0)).toLocaleString('ar-EG')} ج</td>
          </tr>
        `;
      });
    }

    // بناء الإيميل
    const emailHtml = `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; background: #f9fafb; border-radius: 10px;">
        <div style="background: #1e3a5f; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🏪 معرض جولدن</h1>
          <p style="margin: 5px 0 0; opacity: 0.9;">تأكيد طلب جديد</p>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1e3a5f; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">👤 بيانات العميل</h2>
          
          <div style="margin: 15px 0; display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div><strong>👤 العميل:</strong> ${orderData.customer_name || 'غير محدد'}</div>
            <div><strong>📱 الهاتف:</strong> ${orderData.customer_phone || 'غير محدد'}</div>
            <div><strong>👨‍💼 البائع:</strong> ${orderData.cashier_name || 'غير محدد'}</div>
            <div><strong>💰 طريقة الدفع:</strong> ${orderData.payment_method === 'cash' ? 'كاش' : orderData.payment_method === 'card' ? 'بطاقة' : 'تقسيط'}</div>
          </div>

          <h2 style="color: #1e3a5f; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-top: 20px;">🛒 المنتجات</h2>
          
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 14px;">
            <thead>
              <tr style="background: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
                <th style="padding: 10px 8px; text-align: center; width: 40px;">#</th>
                <th style="padding: 10px 8px; text-align: right;">المنتج</th>
                <th style="padding: 10px 8px; text-align: center; width: 70px;">الكمية</th>
                <th style="padding: 10px 8px; text-align: right; width: 100px;">السعر</th>
                <th style="padding: 10px 8px; text-align: right; width: 120px;">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              ${productsHtml || `
                <tr>
                  <td colspan="5" style="padding: 20px; text-align: center; color: #9ca3af;">لا توجد منتجات</td>
                </tr>
              `}
            </tbody>
            <tfoot>
              <tr style="border-top: 2px solid #e5e7eb; background: #f9fafb;">
                <td colspan="3" style="padding: 12px 8px; text-align: left; font-weight: bold; font-size: 16px;">
                  إجمالي القطع: ${totalItems}
                </td>
                <td colspan="2" style="padding: 12px 8px; text-align: left; font-weight: bold; font-size: 18px; color: #16a34a;">
                  الإجمالي الكلي: ${(orderData.total_price || 0).toLocaleString('ar-EG')} ج
                </td>
              </tr>
            </tfoot>
          </table>

          ${orderData.payment_method === 'installments' ? `
            <div style="background: #f3e8ff; padding: 15px; border-radius: 8px; border-right: 4px solid #7c3aed; margin: 15px 0;">
              <h4 style="margin: 0 0 10px 0; color: #5b21b6;">📅 تفاصيل التقسيط</h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 14px;">
                <div><strong>المقدم:</strong> ${(orderData.down_payment || 0).toLocaleString('ar-EG')} ج</div>
                <div><strong>المتبقي:</strong> ${(orderData.remaining_amount || 0).toLocaleString('ar-EG')} ج</div>
                <div><strong>القسط الشهري:</strong> ${(orderData.monthly_payment || 0).toLocaleString('ar-EG')} ج</div>
                <div><strong>عدد الشهور:</strong> ${orderData.months || 0} شهر</div>
              </div>
            </div>
          ` : ''}

          ${orderData.notes ? `
            <div style="background: #fefce8; padding: 15px; border-radius: 8px; border-right: 4px solid #eab308; margin: 15px 0;">
              <p style="margin: 0; color: #854d0e; font-size: 14px;"><strong>📝 ملاحظات:</strong> ${orderData.notes}</p>
            </div>
          ` : ''}

          <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border-right: 4px solid #22c55e; margin: 15px 0;">
            <p style="margin: 0; color: #166534; font-weight: bold;">✅ تم استلام الطلب بنجاح</p>
          </div>

          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
            <p>📞 للتواصل: 01034003002</p>
            <p style="margin-top: 5px;">📍 طنطا - سبرباي - أمام المدينه الجامعيه</p>
          </div>
        </div>
      </div>
    `;

    // إرسال الإيميل
    const { data, error } = await resend.emails.send({
      from: 'معرض جولدن <onboarding@resend.dev>',
      to: ['eslamabosife69@gmail.com'],
      subject: `📦 طلب جديد من المعرض - ${orderData.customer_name || 'عميل'}`,
      html: emailHtml,
    });

    if (error) {
      console.error('❌ Resend Error:', error);
      return { success: false, message: 'Email sending failed', error };
    }

    console.log('✅ Email sent:', data);
    return { success: true, message: 'Email sent successfully', data };
  } catch (error) {
    console.error('❌ Error:', error);
    return { success: false, message: 'Error sending email', error: error.message };
  }
});