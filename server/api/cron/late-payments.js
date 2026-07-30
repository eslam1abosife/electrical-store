// server/api/cron/late-payments.js
import { Resend } from 'resend';

export default defineEventHandler(async (event) => {
  try {
    console.log('⏰ Running late payments check...');

    // جلب العملاء المتأخرين
    const latePayments = await getLatePaymentsFromDB();

    if (latePayments.length === 0) {
      console.log('✅ No late payments found');
      return { success: true, message: 'No late payments found' };
    }

    // إرسال إيميل التنبيه
    const resend = new Resend(process.env.RESEND_API_KEY);

    let latePaymentsHtml = '';
    let totalLateAmount = 0;

    latePayments.forEach((item, index) => {
      const daysLate = Math.ceil((new Date() - new Date(item.due_date)) / (1000 * 60 * 60 * 24));
      totalLateAmount += item.amount;
      latePaymentsHtml += `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 10px 8px; text-align: right;">${index + 1}</td>
          <td style="padding: 10px 8px; text-align: right; font-weight: bold;">${item.customer_name}</td>
          <td style="padding: 10px 8px; text-align: center;">${item.phone || '---'}</td>
          <td style="padding: 10px 8px; text-align: center;">${item.installment_number}</td>
          <td style="padding: 10px 8px; text-align: right; color: #dc2626; font-weight: bold;">${(item.amount || 0).toLocaleString('ar-EG')} ج</td>
          <td style="padding: 10px 8px; text-align: center; color: #dc2626; font-weight: bold;">${daysLate} يوم</td>
        </tr>
      `;
    });

    const emailHtml = `
      <div dir="rtl" style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; background: #f9fafb; border-radius: 12px;">
        <div style="background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 25px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 700;">⚠️ تنبيه أقساط متأخرة</h1>
          <p style="margin: 5px 0 0; opacity: 0.9; font-size: 16px;">تقرير يومي للعملاء المتأخرين عن السداد</p>
          <p style="margin: 3px 0 0; opacity: 0.7; font-size: 13px;">${new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        
        <div style="background: white; padding: 25px; border-radius: 0 0 12px 12px;">
          <div style="background: #fef2f2; padding: 15px; border-radius: 8px; border-right: 4px solid #dc2626; margin-bottom: 20px;">
            <p style="margin: 0; color: #991b1b; font-weight: bold;">⚠️ عدد العملاء المتأخرين: ${latePayments.length}</p>
            <p style="margin: 5px 0 0; color: #991b1b; font-weight: bold;">💰 إجمالي المبالغ المتأخرة: ${totalLateAmount.toLocaleString('ar-EG')} ج</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <thead>
              <tr style="background: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
                <th style="padding: 10px 8px; text-align: center; width: 30px;">#</th>
                <th style="padding: 10px 8px; text-align: right;">العميل</th>
                <th style="padding: 10px 8px; text-align: center;">الهاتف</th>
                <th style="padding: 10px 8px; text-align: center;">القسط</th>
                <th style="padding: 10px 8px; text-align: right;">المبلغ</th>
                <th style="padding: 10px 8px; text-align: center;">متأخر</th>
              </tr>
            </thead>
            <tbody>
              ${latePaymentsHtml}
            </tbody>
          </table>

          <div style="background: #fef2f2; padding: 15px; border-radius: 8px; border-right: 4px solid #dc2626; margin-top: 20px;">
            <p style="margin: 0; color: #991b1b; font-size: 14px;">
              <strong>📌 إجراء مطلوب:</strong> يرجى التواصل مع العملاء المتأخرين لمتابعة السداد
            </p>
            <p style="margin: 5px 0 0; color: #991b1b; font-size: 13px;">
              📞 يمكن التواصل عبر الهاتف أو إرسال رسائل تذكير
            </p>
          </div>

          <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
            <p style="font-weight: bold; color: #dc2626;">🏦 معرض جولدن - نظام المتابعة اليومي</p>
            <p style="margin-top: 5px;">📞 للتواصل: 01034003002</p>
          </div>
        </div>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: 'معرض جولدن <onboarding@resend.dev>',
      to: ['eslamabosife69@gmail.com'],
      subject: `⚠️ تنبيه أقساط متأخرة - ${new Date().toLocaleDateString('ar-EG')}`,
      html: emailHtml,
    });

    if (error) throw error;

    console.log(`✅ Late payments alert sent for ${latePayments.length} customers`);
    return { success: true, message: 'Late payments alert sent', count: latePayments.length, data };
  } catch (error) {
    console.error('❌ Error:', error);
    return { success: false, message: 'Error sending alert', error: error.message };
  }
});

// دالة جلب المتأخرين من قاعدة البيانات
async function getLatePaymentsFromDB() {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('installment_payments')
      .select(`
        *,
        installment_contracts (
          customer_name,
          customer_phone
        )
      `)
      .eq('status', 'pending')
      .lt('due_date', today.toISOString().split('T')[0]);

    if (error) {
      console.error('Error fetching late payments:', error);
      return [];
    }

    if (!data) return [];

    return data.map(p => ({
      id: p.id,
      customer_name: p.installment_contracts?.customer_name || 'غير محدد',
      phone: p.installment_contracts?.customer_phone || '',
      installment_number: p.installment_number,
      amount: p.amount,
      due_date: p.due_date,
      contract_id: p.contract_id
    }));
  } catch (error) {
    console.error('Error in getLatePaymentsFromDB:', error);
    return [];
  }
}