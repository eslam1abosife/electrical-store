// middleware/collector-auth.js
export default defineNuxtRouteMiddleware((to, from) => {
  if (process.client) {
    const session = localStorage.getItem('collector_session');
    if (!session) {
      return navigateTo('/collector-login');
    }

    try {
      const data = JSON.parse(session);
      if (!data.isCollector) {
        return navigateTo('/collector-login');
      }
    } catch (e) {
      return navigateTo('/collector-login');
    }
  }
});