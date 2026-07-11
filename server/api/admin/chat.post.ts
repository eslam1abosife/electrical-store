// server/api/admin/chat.post.ts - شات الأدمن (كامل الصلاحيات)
import { readFileSync } from "fs";
import { join } from "path";

export default defineEventHandler(async (event) => {
  try {
    const { message } = await readBody(event);

    if (!message || message.trim() === "") {
      return { reply: "⚠️ من فضلك اكتب سؤالك أولاً" };
    }

    // ============================================
    // جيب كل الملفات
    // ============================================
    function getFileContent(filePath: string, maxLength: number = 3000) {
      try {
        const fullPath = join(process.cwd(), filePath);
        const content = readFileSync(fullPath, "utf-8");
        return content.slice(0, maxLength);
      } catch {
        return `الملف ${filePath} مش موجود`;
      }
    }

    const mainPageCode = getFileContent("pages/index.vue", 4000);
    const nuxtConfig = getFileContent("nuxt.config.ts", 1500);
    const chatButtonCode = getFileContent("components/ChatButton.vue", 1500);
    const productCardCode = getFileContent("components/ProductCard.vue", 1500);
    const storeCode = getFileContent("stores/user.js", 2000);
    const apiCode = getFileContent("server/api/chat.post.ts", 2000);
    const adminApiCode = getFileContent("server/api/admin/chat.post.ts", 2000);

    // ============================================
    // السياق التقني (كل الكود)
    // ============================================
    const context = `
      أنت مساعد تقني للمطورين في مشروع "ElectroStore".
      
      📌 معلومات المشروع:
      - التقنية: Nuxt 3 + Vue.js + TypeScript + Tailwind CSS
      - قاعدة البيانات: Supabase (PostgreSQL)
      - State Management: Pinia
      - جدول المنتجات: products
      - الأقسام: electrical, home, plastic
      
      📁 الكود الكامل للمشروع:
      
      1. إعدادات Nuxt (nuxt.config.ts):
      ${nuxtConfig}
      
      2. الصفحة الرئيسية (pages/index.vue):
      ${mainPageCode}
      
      3. مكون الشات (components/ChatButton.vue):
      ${chatButtonCode}
      
      4. مكون المنتج (components/ProductCard.vue):
      ${productCardCode}
      
      5. User Store (stores/user.js):
      ${storeCode}
      
      6. API شات العميل (server/api/chat.post.ts):
      ${apiCode}
      
      7. API شات الأدمن (server/api/admin/chat.post.ts):
      ${adminApiCode}
      
      🎯 دورك: مساعدة المطورين في فهم الكود، شرح آلية العمل، اقتراح تحسينات.
      
      🎨 جاوب بالعربية، استخدم أمثلة من الكود، واختصر قد ما تقدر.
    `;

    const response = await fetch(
      "https://api.deepseek.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-coder",
          messages: [
            { role: "system", content: context },
            { role: "user", content: message },
          ],
          temperature: 0.5,
          max_tokens: 2000,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("DeepSeek Error:", errorData);
      return { reply: "❌ عذراً، حدث خطأ. حاول مرة أخرى." };
    }

    const data = await response.json();
    const reply =
      data.choices?.[0]?.message?.content || "❌ عذراً، لم أستطع الرد";

    return { reply };
  } catch (error) {
    console.error("Admin Chat Error:", error);
    return { reply: "❌ حدث خطأ في الخادم، حاول مرة أخرى" };
  }
});
