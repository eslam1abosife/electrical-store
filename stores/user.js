// stores/user.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    session: null,
    initialized: false
  }),

  getters: {
    isLoggedIn: (state) => !!state.session && !!state.user,
    userRole: (state) => state.user?.role || null,
    isAdmin: (state) => state.user?.role === 'admin',
    isPartner: (state) => state.user?.role === 'partner',
    isCollector: (state) => state.user?.role === 'collector',
    canViewDashboard: (state) => state.user?.role === 'admin' || state.user?.role === 'partner',
    canEdit: (state) => state.user?.role === 'admin'
  },

  actions: {
    setUser(user) {
      this.user = user
      console.log('📌 User set:', user?.email, 'Role:', user?.role)
      this.initialized = true
    },

    setSession(session) {
      this.session = session
      if (session?.user) {
        this.user = session.user
        console.log('📌 Session set:', session.user.email)
      }
      this.initialized = true
    },

    updateUserRole(role) {
      if (this.user) {
        this.user = { ...this.user, role: role }
        console.log('✅ تم تحديث الدور:', role)
      }
    },

    clearAuth() {
      this.user = null
      this.session = null
      this.initialized = false
      console.log('🗑️ Auth cleared')
    },
    
    // ✅ دالة logout محدثة
    async logout() {
      try {
        // طريقة مباشرة باستخدام supabase من lib
        const { supabase } = await import('~/lib/supabase')
        if (supabase) {
          await supabase.auth.signOut()
          console.log('✅ Logged out from Supabase')
        }
      } catch (error) {
        console.error('❌ Logout error:', error?.message || error)
      }
      
      // مسح البيانات
      this.clearAuth()
      
      // التوجيه للصفحة الرئيسية
      if (process.client) {
        window.location.href = '/'
      }
    },
    
    async initialize() {
      if (this.initialized) return
      
      try {
        const { getSession, getUserProfile } = await import('~/lib/supabase')
        const session = await getSession()
        
        if (session) {
          this.setSession(session)
          const profile = await getUserProfile(session.user.email)
          if (profile?.role) {
            this.updateUserRole(profile.role)
          }
        }
        
        this.initialized = true
        console.log('✅ Auth store initialized')
      } catch (error) {
        console.error('❌ Initialize error:', error?.message)
        this.initialized = true
      }
    }
  }
})