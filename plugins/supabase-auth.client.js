// plugins/supabase-auth.client.js
export default defineNuxtPlugin(() => {
  console.log('🔄 Supabase auth plugin loaded')
  
  // ✅ انتظر حتى يكون التطبيق جاهز
  onNuxtReady(() => {
    // ✅ تأخير بسيط عشان نتأكد من تحميل كل شيء
    setTimeout(async () => {
      try {
        const userStore = useUserStore()
        if (!userStore.initialized) {
          await userStore.initialize()
        }
        console.log('✅ Auth plugin ready')
      } catch (error) {
        console.error('❌ Auth plugin error:', error?.message || error)
      }
    }, 500)
  })
})