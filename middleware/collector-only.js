// middleware/collector-only.js
export default defineNuxtRouteMiddleware((to, from) => {
  const userStore = useUserStore()
  
  console.log('========== COLLECTOR MIDDLEWARE ==========')
  console.log('to.path:', to.path)
  console.log('userStore.userRole:', userStore.userRole)
  console.log('userStore.isLoggedIn:', userStore.isLoggedIn)
  console.log('userStore.isCollector:', userStore.isCollector)
  console.log('===========================================')
  
  // إذا لم يكن مسجل دخول
  if (!userStore.isLoggedIn) {
    console.log('❌ غير مسجل دخول → /login')
    return navigateTo('/login')
  }
  
  // إذا لم يكن محصلاً
  if (userStore.userRole !== 'collector') {
    console.log(`❌ الدور ${userStore.userRole} مش collector → /`)
    return navigateTo('/')
  }
  
  console.log('✅ مسموح بالدخول للمحصل')
  return
})