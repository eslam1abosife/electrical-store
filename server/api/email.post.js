// server/api/email.post.js
import { Resend } from 'resend';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { orderData, purchaseData, installmentData, latePayments } = body;

    console.log('📧 Preparing email...');

    // تهيئة Resend
    const resend = new Resend(process.env.RESEND_API_KEY);

    // ==========================================
    // 1️⃣ إيميل فاتورة بيع من المعرض
    // ==========================================
    if (orderData && !purchaseData && !installmentData) {
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

      const isInstallment = orderData.payment_method === 'installments';

      const emailHtml = `
        <div dir="rtl" style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; background: #f9fafb; border-radius: 12px;">
          <div style="background: linear-gradient(135deg, #1e3a5f, #2d5a8a); color: white; padding: 25px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 700;">🏪 معرض جولدن</h1>
            <p style="margin: 5px 0 0; opacity: 0.9; font-size: 16px;">فاتورة بيع جديدة</p>
            <p style="margin: 3px 0 0; opacity: 0.7; font-size: 13px;">${new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          
          <div style="background: white; padding: 25px; border-radius: 0 0 12px 12px;">
            <h2 style="color: #1e3a5f; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 15px; font-size: 18px;">👤 بيانات العميل</h2>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <div><strong>👤 العميل:</strong> ${orderData.customer_name || 'غير محدد'}</div>
              <div><strong>📱 الهاتف:</strong> ${orderData.customer_phone || 'غير محدد'}</div>
              <div><strong>👨‍💼 البائع:</strong> ${orderData.cashier_name || 'غير محدد'}</div>
              <div><strong>💰 طريقة الدفع:</strong> ${isInstallment ? '📅 تقسيط' : orderData.payment_method === 'cash' ? '💰 كاش' : '💳 بطاقة'}</div>
            </div>

            <h2 style="color: #1e3a5f; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px; margin-top: 20px; font-size: 18px;">🛒 المنتجات</h2>
            
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
                  <td colspan="2" style="padding: 12px 8px; text-align: left; font-weight: bold; font-size: 20px; color: #16a34a;">
                    الإجمالي الكلي: ${(orderData.total_price || 0).toLocaleString('ar-EG')} ج
                  </td>
                </tr>
              </tfoot>
            </table>

            ${isInstallment ? `
              <div style="background: #f3e8ff; padding: 18px; border-radius: 10px; border-right: 4px solid #7c3aed; margin: 15px 0;">
                <h4 style="margin: 0 0 12px 0; color: #5b21b6; font-size: 16px;">📅 تفاصيل التقسيط</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px;">
                  <div style="background: white; padding: 10px; border-radius: 8px;"><strong>المقدم:</strong> <span style="color: #16a34a;">${(orderData.down_payment || 0).toLocaleString('ar-EG')} ج</span></div>
                  <div style="background: white; padding: 10px; border-radius: 8px;"><strong>المتبقي:</strong> <span style="color: #d97706;">${(orderData.remaining_amount || 0).toLocaleString('ar-EG')} ج</span></div>
                  <div style="background: white; padding: 10px; border-radius: 8px;"><strong>القسط الشهري:</strong> <span style="color: #7c3aed;">${(orderData.monthly_payment || 0).toLocaleString('ar-EG')} ج</span></div>
                  <div style="background: white; padding: 10px; border-radius: 8px;"><strong>عدد الشهور:</strong> ${orderData.months || 0} شهر</div>
                </div>
              </div>
            ` : ''}

            ${orderData.notes ? `
              <div style="background: #fefce8; padding: 15px; border-radius: 8px; border-right: 4px solid #eab308; margin: 15px 0;">
                <p style="margin: 0; color: #854d0e; font-size: 14px;"><strong>📝 ملاحظات:</strong> ${orderData.notes}</p>
              </div>
            ` : ''}

            <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border-right: 4px solid #22c55e; margin: 15px 0;">
              <p style="margin: 0; color: #166534; font-weight: bold;">✅ تم تسجيل الطلب بنجاح</p>
            </div>

            <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
              <p style="font-weight: bold; color: #1e3a5f;">✨ شكراً لتسوقكم من جولدن ✨</p>
              <p style="margin-top: 5px;">📞 للتواصل: 01034003002</p>
              <p style="margin-top: 2px;">📍 طنطا - سبرباي - أمام المدينه الجامعيه</p>
            </div>
          </div>
        </div>
      `;

      const { data: emailResult, error } = await resend.emails.send({
        from: 'معرض جولدن <onboarding@resend.dev>',
        to: ['eslamabosife69@gmail.com'],
        subject: `📦 طلب جديد من المعرض - ${orderData.customer_name || 'عميل'}`,
        html: emailHtml,
      });

      if (error) throw error;
      return { success: true, message: 'Order email sent', data: emailResult };
    }

    // ==========================================
    // 2️⃣ إيميل فاتورة شراء
    // ==========================================
    if (purchaseData) {
      let productsHtml = '';
      let totalItems = 0;

      if (purchaseData.items && Array.isArray(purchaseData.items)) {
        purchaseData.items.forEach((item, index) => {
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

      const emailHtml = `
        <div dir="rtl" style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; background: #f9fafb; border-radius: 12px;">
          <div style="background: linear-gradient(135deg, #2563eb, #3b82f6); color: white; padding: 25px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 700;">📥 فاتورة شراء جديدة</h1>
            <p style="margin: 5px 0 0; opacity: 0.9; font-size: 16px;">تم إضافة مشتريات جديدة للمخزون</p>
            <p style="margin: 3px 0 0; opacity: 0.7; font-size: 13px;">${new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          
          <div style="background: white; padding: 25px; border-radius: 0 0 12px 12px;">
            <h2 style="color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 15px; font-size: 18px;">👤 بيانات المورد</h2>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <div><strong>📋 المورد:</strong> ${purchaseData.supplier_name || 'غير محدد'}</div>
              <div><strong>🔢 رقم الفاتورة:</strong> ${purchaseData.invoice_number || 'غير محدد'}</div>
              <div><strong>👨‍💼 البائع:</strong> ${purchaseData.cashier_name || 'غير محدد'}</div>
            </div>

            <h2 style="color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px; margin-top: 20px; font-size: 18px;">🛒 المنتجات</h2>
            
            <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 14px;">
              <thead>
                <tr style="background: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
                  <th style="padding: 10px 8px; text-align: center; width: 40px;">#</th>
                  <th style="padding: 10px 8px; text-align: right;">المنتج</th>
                  <th style="padding: 10px 8px; text-align: center; width: 70px;">الكمية</th>
                  <th style="padding: 10px 8px; text-align: right; width: 100px;">سعر الشراء</th>
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
                  <td colspan="2" style="padding: 12px 8px; text-align: left; font-weight: bold; font-size: 20px; color: #16a34a;">
                    الإجمالي الكلي: ${(purchaseData.total_price || 0).toLocaleString('ar-EG')} ج
                  </td>
                </tr>
              </tfoot>
            </table>

            ${purchaseData.notes ? `
              <div style="background: #fefce8; padding: 15px; border-radius: 8px; border-right: 4px solid #eab308; margin: 15px 0;">
                <p style="margin: 0; color: #854d0e; font-size: 14px;"><strong>📝 ملاحظات:</strong> ${purchaseData.notes}</p>
              </div>
            ` : ''}

            <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border-right: 4px solid #22c55e; margin: 15px 0;">
              <p style="margin: 0; color: #166534; font-weight: bold;">✅ تم تسجيل المشتريات بنجاح</p>
            </div>

            <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
              <p style="font-weight: bold; color: #2563eb;">🏪 معرض جولدن - نظام المخزون</p>
              <p style="margin-top: 5px;">📞 للتواصل: 01034003002</p>
            </div>
          </div>
        </div>
      `;

      const { data: emailResult, error } = await resend.emails.send({
        from: 'معرض جولدن <onboarding@resend.dev>',
        to: ['eslamabosife69@gmail.com'],
        subject: `📥 فاتورة شراء جديدة - ${purchaseData.supplier_name || 'مورد'}`,
        html: emailHtml,
      });

      if (error) throw error;
      return { success: true, message: 'Purchase email sent', data: emailResult };
    }

    // ==========================================
    // 3️⃣ إيميل عقد تقسيط جديد
    // ==========================================
    if (installmentData && installmentData.type === 'new_contract') {
      const contract = installmentData.contract;
      
      const emailHtml = `
        <div dir="rtl" style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; background: #f9fafb; border-radius: 12px;">
          <div style="background: linear-gradient(135deg, #7c3aed, #8b5cf6); color: white; padding: 25px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 700;">🏦 عقد تقسيط جديد</h1>
            <p style="margin: 5px 0 0; opacity: 0.9; font-size: 16px;">تم إنشاء عقد تقسيط جديد في معرض جولدن</p>
            <p style="margin: 3px 0 0; opacity: 0.7; font-size: 13px;">${new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          
          <div style="background: white; padding: 25px; border-radius: 0 0 12px 12px;">
            <h2 style="color: #5b21b6; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 15px; font-size: 18px;">👤 بيانات العميل</h2>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <div><strong>👤 العميل:</strong> ${contract.customer_name}</div>
              <div><strong>📱 الهاتف:</strong> ${contract.customer_phone || 'غير محدد'}</div>
              <div><strong>📍 العنوان:</strong> ${contract.customer_address || 'غير محدد'}</div>
              <div><strong>👨‍💼 البائع:</strong> ${contract.cashier_name || 'غير محدد'}</div>
              <div><strong>📅 تاريخ البدء:</strong> ${new Date(contract.start_date).toLocaleDateString('ar-EG')}</div>
              <div><strong>📅 تاريخ الانتهاء:</strong> ${new Date(contract.end_date).toLocaleDateString('ar-EG')}</div>
            </div>

            <h2 style="color: #5b21b6; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px; margin-top: 20px; font-size: 18px;">💰 تفاصيل العقد</h2>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #f3e8ff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <div><strong>💰 إجمالي المبلغ:</strong> <span style="color: #5b21b6; font-weight: bold;">${(contract.total_amount || 0).toLocaleString('ar-EG')} ج</span></div>
              <div><strong>💵 دفعة مقدمة:</strong> <span style="color: #16a34a; font-weight: bold;">${(contract.down_payment || 0).toLocaleString('ar-EG')} ج</span></div>
              <div><strong>📊 المتبقي:</strong> <span style="color: #d97706; font-weight: bold;">${(contract.remaining_amount || 0).toLocaleString('ar-EG')} ج</span></div>
              <div><strong>📅 عدد الأقساط:</strong> ${contract.installment_count} شهر</div>
              <div style="grid-column: span 2;"><strong>💳 القسط الشهري:</strong> <span style="color: #7c3aed; font-weight: bold; font-size: 20px;">${(contract.installment_amount || 0).toLocaleString('ar-EG')} ج</span></div>
            </div>

            ${contract.notes ? `
              <div style="background: #fefce8; padding: 15px; border-radius: 8px; border-right: 4px solid #eab308; margin: 15px 0;">
                <p style="margin: 0; color: #854d0e; font-size: 14px;"><strong>📝 ملاحظات:</strong> ${contract.notes}</p>
              </div>
            ` : ''}

            <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border-right: 4px solid #22c55e; margin: 15px 0;">
              <p style="margin: 0; color: #166534; font-weight: bold;">✅ تم تسجيل عقد التقسيط بنجاح</p>
            </div>

            <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
              <p style="font-weight: bold; color: #5b21b6;">🏦 معرض جولدن - نظام التقسيط</p>
              <p style="margin-top: 5px;">📞 للتواصل: 01034003002</p>
            </div>
          </div>
        </div>
      `;

      const { data: emailResult, error } = await resend.emails.send({
        from: 'معرض جولدن <onboarding@resend.dev>',
        to: ['eslamabosife69@gmail.com'],
        subject: `🏦 عقد تقسيط جديد - ${contract.customer_name}`,
        html: emailHtml,
      });

      if (error) throw error;
      return { success: true, message: 'Contract email sent', data: emailResult };
    }

    // ==========================================
    // 4️⃣ إيميل سداد قسط
    // ==========================================
    if (installmentData && installmentData.type === 'payment') {
      const { contract, payment } = installmentData;

      const emailHtml = `
        <div dir="rtl" style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; background: #f9fafb; border-radius: 12px;">
          <div style="background: linear-gradient(135deg, #16a34a, #22c55e); color: white; padding: 25px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 700;">💰 سداد قسط</h1>
            <p style="margin: 5px 0 0; opacity: 0.9; font-size: 16px;">تم سداد قسط جديد في معرض جولدن</p>
            <p style="margin: 3px 0 0; opacity: 0.7; font-size: 13px;">${new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          
          <div style="background: white; padding: 25px; border-radius: 0 0 12px 12px;">
            <h2 style="color: #16a34a; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 15px; font-size: 18px;">👤 بيانات العميل</h2>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <div><strong>👤 العميل:</strong> ${contract.customer_name}</div>
              <div><strong>📱 الهاتف:</strong> ${contract.customer_phone || 'غير محدد'}</div>
              <div><strong>💳 القسط رقم:</strong> ${payment.installment_number}</div>
              <div><strong>💰 طريقة الدفع:</strong> ${payment.payment_method === 'cash' ? 'كاش' : payment.payment_method === 'card' ? 'بطاقة' : 'تحويل بنكي'}</div>
            </div>

            <h2 style="color: #16a34a; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px; margin-top: 20px; font-size: 18px;">📊 تفاصيل السداد</h2>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #f0fdf4; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <div><strong>💰 قيمة القسط:</strong> <span style="color: #16a34a; font-weight: bold;">${(payment.amount || 0).toLocaleString('ar-EG')} ج</span></div>
              <div><strong>📅 تاريخ السداد:</strong> ${new Date(payment.paid_date).toLocaleDateString('ar-EG')}</div>
              <div style="grid-column: span 2;"><strong>📊 المتبقي من العقد:</strong> <span style="color: #d97706; font-weight: bold; font-size: 18px;">${(contract.remaining_amount || 0).toLocaleString('ar-EG')} ج</span></div>
            </div>

            ${payment.notes ? `
              <div style="background: #fefce8; padding: 15px; border-radius: 8px; border-right: 4px solid #eab308; margin: 15px 0;">
                <p style="margin: 0; color: #854d0e; font-size: 14px;"><strong>📝 ملاحظات:</strong> ${payment.notes}</p>
              </div>
            ` : ''}

            <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border-right: 4px solid #22c55e; margin: 15px 0;">
              <p style="margin: 0; color: #166534; font-weight: bold;">✅ تم تسجيل السداد بنجاح</p>
            </div>

            <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
              <p style="font-weight: bold; color: #16a34a;">🏦 معرض جولدن - نظام التقسيط</p>
              <p style="margin-top: 5px;">📞 للتواصل: 01034003002</p>
            </div>
          </div>
        </div>
      `;

      const { data: emailResult, error } = await resend.emails.send({
        from: 'معرض جولدن <onboarding@resend.dev>',
        to: ['eslamabosife69@gmail.com'],
        subject: `💰 سداد قسط - ${contract.customer_name} - قسط ${payment.installment_number}`,
        html: emailHtml,
      });

      if (error) throw error;
      return { success: true, message: 'Payment email sent', data: emailResult };
    }

    // ==========================================
    // 5️⃣ إيميل العملاء المتأخرين (تنبيه يومي)
    // ==========================================
    if (latePayments) {
      if (!latePayments || latePayments.length === 0) {
        return { success: true, message: 'No late payments found' };
      }

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

      const { data: emailResult, error } = await resend.emails.send({
        from: 'معرض جولدن <onboarding@resend.dev>',
        to: ['eslamabosife69@gmail.com'],
        subject: `⚠️ تنبيه أقساط متأخرة - ${new Date().toLocaleDateString('ar-EG')}`,
        html: emailHtml,
      });

      if (error) throw error;
      return { success: true, message: 'Late payments email sent', data: emailResult };
    }

    return { success: false, message: 'Unknown email type' };
  } catch (error) {
    console.error('❌ Error:', error);
    return { success: false, message: 'Error sending email', error: error.message };
  }
});