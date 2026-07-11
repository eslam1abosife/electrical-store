// plugins/supabase-auth.client.js
export default defineNuxtPlugin(() => {
  console.log('🔄 Supabase auth plugin loaded')
  
  onNuxtReady(async () => {
    try {
      const userStore = useUserStore()
      if (!userStore.initialized) {
        await userStore.initialize()
      }
      console.log('✅ Auth plugin ready')
    } catch (error) {
      console.error('❌ Auth plugin error:', error?.message || error)
    }
  })
})