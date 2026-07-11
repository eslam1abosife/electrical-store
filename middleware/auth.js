// middleware/auth.js
export default defineNuxtRouteMiddleware(async (to, from) => {
  const supabase = useSupabaseClient()
  const userStore = useUserStore()
  
  console.log('========== AUTH MIDDLEWARE (Frontend) ==========')
  console.log('to.path:', to.path)
  
  // ✅ جلب الجلسة مباشرة من Supabase
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  if (sessionError) {
    console.error('❌ خطأ في جلب الجلسة:', sessionError)
  }
  
  console.log('📧 Email من الجلسة:', session?.user?.email)
  
  // ✅ إذا لم توجد جلسة، روح تسجيل دخول مع حفظ الصفحة الحالية
  if (!session) {
    console.log('❌ غير مسجل دخول → /login')
    // حفظ الصفحة الحالية للتوجيه بعد تسجيل الدخول
    return navigateTo(`/login?redirect=${to.path}`)
  }
  
  // ✅ تحديث الـ store بالجلسة
  if (session && !userStore.session) {
    userStore.setSession(session)
  }
  
  console.log('✅ مسجل دخول - مسموح بالدخول')
  return
})