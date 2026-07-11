// plugins/supabase-auth.client.js
export default defineNuxtPlugin(async () => {
  console.log('🔄 Supabase auth plugin loading...')
  
  try {
    const userStore = useUserStore()
    
    // ✅ استخدم الـ initialize من الـ store مباشرة
    await userStore.initialize()
    
    console.log('✅ Supabase auth plugin initialized successfully')
    
  } catch (error) {
    console.error('❌ Error initializing auth plugin:', error?.message || error)
    
    // ✅ لو فشل، حاول تاني بعد شوية
    setTimeout(async () => {
      try {
        const userStore = useUserStore()
        if (!userStore.initialized) {
          await userStore.initialize()
          console.log('✅ Supabase auth plugin initialized on retry')
        }
      } catch (retryError) {
        console.error('❌ Retry failed:', retryError?.message || retryError)
      }
    }, 2000)
  }
})