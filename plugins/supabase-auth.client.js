// plugins/supabase-auth.client.js
export default defineNuxtPlugin(async () => {
  const supabase = useSupabaseClient()
  const userStore = useUserStore()
  
  // استعادة الجلسة عند تحميل الصفحة
  const { data: { session } } = await supabase.auth.getSession()
  
  if (session) {
    console.log('🔄 استعادة الجلسة:', session.user.email)
    userStore.setSession(session)
    
    // جلب الدور من user_profiles
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('email', session.user.email)
      .maybeSingle()
    
    if (profile) {
      // تحديث المستخدم مع الدور باستخدام action من الـ store
      userStore.updateUserRole(profile.role)
      console.log('✅ تم استعادة الدور:', profile.role)
    }
  }
  
  // مراقبة تغييرات الجلسة
  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('🔄 تغيير حالة auth:', event)
    
    if (event === 'SIGNED_IN' && session) {
      userStore.setSession(session)
      
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('email', session.user.email)
        .maybeSingle()
      
      if (profile) {
        userStore.updateUserRole(profile.role)
        console.log('✅ تم تحديث الدور:', profile.role)
      }
      
      // إعادة تحميل الصفحة الحالية لتحديث UI (حل سريع)
      // يمكنك إزالة هذا السطر إذا كان الكود يعمل بدون ريفريش
      // window.location.reload()
      
    } else if (event === 'SIGNED_OUT') {
      userStore.clearAuth()
    }
  })
})