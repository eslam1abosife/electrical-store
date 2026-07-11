// server/api/chat.post.ts - شات العميل (آمن)
export default defineEventHandler(async (event) => {
  try {
    const { message } = await readBody(event)
    
    if (!message || message.trim() === '') {
      return { reply: '⚠️ من فضلك اكتب سؤالك أولاً' }
    }

    // ============================================
    // جيب بيانات المنتجات من قاعدة البيانات
    // ============================================
    async function getProductsData() {
      try {
        const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.NUXT_PUBLIC_SUPABASE_KEY
        
        const response = await fetch(`${supabaseUrl}/rest/v1/products?select=*&limit=50`, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        })
        
        if (!response.ok) return []
        const products = await response.json()
        
        return products.map((p: any) => ({
          name: p.name,
          price: p.price,
          category: p.category,
          brand: p.brand,
          discount: p.discount || 0,
          inStock: p.in_stock !== false
        }))
      } catch {
        return []
      }
    }

    const products = await getProductsData()
    
    let productsInfo = ''
    if (products.length > 0) {
      productsInfo = products.map(p => 
        `- ${p.name} | السعر: ${p.price} جنيه | القسم: ${p.category} | ${p.discount > 0 ? `خصم ${p.discount}%` : 'بدون خصم'}`
      ).join('\n')
    } else {
      productsInfo = 'المنتجات متوفرة في المتجر'
    }

    // ============================================
    // السياق الآمن - ممنوع الكود أو الداشبورد
    // ============================================
    const context = `
      أنت مساعد خدمة عملاء لمتجر "ElectroStore" لبيع الأجهزة الكهربائية.
      
      📌 معلومات المتجر للعميل:
      - اسم المتجر: ElectroStore
      - الأقسام: أجهزة كهربائية (electrical)، أدوات منزلية (home)، بلاستيك وتخزين (plastic)
      - التوصيل: خلال 48 ساعة
      - الضمان: سنة كاملة على جميع المنتجات
      - الدفع: آمن 100%
      
      📦 المنتجات المتوفرة (${products.length} منتج):
      ${productsInfo}
      
      🚫 قواعد أمنية صارمة:
      1. ممنوع تماماً تتكلم عن الكود أو البرمجة
      2. ممنوع تتكلم عن الداشبورد أو لوحة التحكم
      3. ممنوع تتكلم عن قاعدة البيانات أو الهيكل التقني
      4. ممنوع تتكلم عن المطورين أو نظام المتجر الداخلي
      
      🎯 دورك: إجابة أسئلة العملاء عن المنتجات والعروض فقط.
      
      ⚠️ إذا سأل عن أي شيء تقني، رد: "عذراً، أنا هنا لمساعدتك في المنتجات والعروض فقط 😊"
      
      🎨 جاوب بالعربية، كن ودوداً، واختصر قد ما تقدر.
    `

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: context },
          { role: 'user', content: message }
        ],
        temperature: 0.5,
        max_tokens: 500,
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('DeepSeek Error:', errorData)
      return { reply: '❌ عذراً، حدث خطأ. حاول مرة أخرى.' }
    }

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content || '❌ عذراً، لم أستطع الرد'

    return { reply }

  } catch (error) {
    console.error('Chat Error:', error)
    return { reply: '❌ حدث خطأ، حاول مرة أخرى' }
  }
})