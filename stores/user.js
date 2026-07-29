// stores/user.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    session: null,
    initialized: false,
    isAdmin: false,
    isPartner: false,
    isLoggedIn: false
  }),

  getters: {
    userRole: (state) => state.user?.role || null,
    isCollector: (state) => state.user?.role === 'collector',
    canViewDashboard: (state) => state.user?.role === 'admin' || state.user?.role === 'partner',
    canEdit: (state) => state.user?.role === 'admin'
  },

  actions: {
    setUser(user) {
      this.user = user
      this.isLoggedIn = !!user
      // تحديث الأدوار
      this.isAdmin = user?.role === 'admin'
      this.isPartner = user?.role === 'partner'
      console.log('📌 User set:', user?.email, 'Role:', user?.role)
      this.initialized = true
    },

    setSession(session) {
      this.session = session
      if (session?.user) {
        this.user = session.user
        this.isLoggedIn = true
        console.log('📌 Session set:', session.user.email)
      }
      this.initialized = true
    },

    updateUserRole(role) {
      if (this.user) {
        this.user = { ...this.user, role: role }
        this.isAdmin = role === 'admin'
        this.isPartner = role === 'partner'
        console.log('✅ تم تحديث الدور:', role)
      }
    },

    clearAuth() {
      this.user = null
      this.session = null
      this.initialized = false
      this.isLoggedIn = false
      this.isAdmin = false
      this.isPartner = false
      console.log('🗑️ Auth cleared')
    },
    
    async logout() {
      try {
        const { supabase } = await import('~/lib/supabase')
        if (supabase) {
          await supabase.auth.signOut()
          console.log('✅ Logged out from Supabase')
        }
      } catch (error) {
        console.error('❌ Logout error:', error?.message || error)
      }
      
      this.clearAuth()
      
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
        } else {
          this.initialized = true
          this.isLoggedIn = false
        }
        
        console.log('✅ Auth store initialized')
      } catch (error) {
        console.error('❌ Initialize error:', error?.message)
        this.initialized = true
        this.isLoggedIn = false
      }
    }
  }
})