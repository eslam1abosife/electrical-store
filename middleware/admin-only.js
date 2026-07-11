// middleware/admin-only.js
import { supabase } from '~/lib/supabase' // ✅ نقلت الـ import بره الدالة

export default defineNuxtRouteMiddleware(async (to, from) => {
  const userStore = useUserStore()
  
  console.log('========== AUTH MIDDLEWARE ==========')
  console.log('to.path:', to.path)
  
  // ✅ جلب الجلسة مباشرة من Supabase (الطريقة الآمنة)
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  if (sessionError) {
    console.error('❌ خطأ في جلب الجلسة:', sessionError)
  }
  
  console.log('📧 Email من الجلسة:', session?.user?.email)
  
  // ✅ إذا لم توجد جلسة، روح تسجيل دخول
  if (!session) {
    console.log('❌ غير مسجل دخول → /login')
    return navigateTo('/login')
  }
  
  // ✅ تحديث الـ store بالجلسة
  if (session && !userStore.session) {
    userStore.setSession(session)
  }
  
  // ✅ جلب الدور مباشرة من جدول user_profiles (هذا هو الحل)
  let userRole = null
  
  try {
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('email', session.user.email)
      .maybeSingle()
    
    if (profileError) {
      console.error('❌ خطأ في جلب البروفايل:', profileError)
    }
    
    if (profile) {
      userRole = profile.role
      console.log('✅ الدور من قاعدة البيانات:', userRole)
    } else {
      console.log('⚠️ مفيش بروفايل للمستخدم:', session.user.email)
    }
  } catch (err) {
    console.error('❌ استثناء في جلب البروفايل:', err)
  }
  
  // ✅ إذا مفيش دور، اعتبره customer
  if (!userRole) {
    userRole = 'customer'
  }
  
  // ✅ تحديث الـ store بالدور
  if (userStore.user) {
    userStore.user.role = userRole
  }
  
  console.log('🎯 الدور النهائي:', userRole)
  
  // ✅ السماح للمدير والشريك فقط بدخول الداشبورد
  if (userRole !== 'admin' && userRole !== 'partner') {
    console.log(`❌ الدور ${userRole} مش مسموح له بالدخول → /`)
    return navigateTo('/')
  }
  
  console.log(`✅ مرحباً ${userRole === 'admin' ? 'مدير' : 'شريك'} - مسموح بالدخول`)
})