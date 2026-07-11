// plugins/supabase-auth.client.js
export default defineNuxtPlugin(() => {
  console.log('🔄 Auth plugin loaded')
  
  // تأخير بسيط
  setTimeout(async () => {
    try {
      const userStore = useUserStore()
      await userStore.initialize()
      console.log('✅ Auth plugin ready')
    } catch (error) {
      console.error('❌ Auth plugin error:', error?.message)
    }
  }, 1000)
})