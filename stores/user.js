// stores/user.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    session: null,
    initialized: false
  }),

  // ✅ تفعيل persistence
  persist: {
    key: 'user-store',
    storage: process.client ? localStorage : undefined,
    paths: ['user', 'session']
  },

  getters: {
    isLoggedIn: (state) => !!state.session && !!state.user,
    
    userRole: (state) => {
      if (state.user?.role) return state.user.role
      if (state.user?.user_metadata?.role) return state.user.user_metadata.role
      if (state.user?.app_metadata?.role) return state.user.app_metadata.role
      return null
    },
    
    isAdmin: (state) => {
      const role = state.user?.role || state.user?.user_metadata?.role
      return role === 'admin'
    },
    
    isPartner: (state) => {
      const role = state.user?.role || state.user?.user_metadata?.role
      return role === 'partner'
    },
    
    isCollector: (state) => {
      const role = state.user?.role || state.user?.user_metadata?.role
      return role === 'collector'
    },
    
    canViewDashboard: (state) => {
      const role = state.user?.role || state.user?.user_metadata?.role
      return role === 'admin' || role === 'partner'
    },
    
    canEdit: (state) => {
      const role = state.user?.role || state.user?.user_metadata?.role
      return role === 'admin'
    }
  },

  actions: {
    setSession(session) {
      this.session = session
      if (session?.user) {
        this.user = session.user
        console.log('📌 Session set:', session.user.email)
      }
      this.initialized = true
    },

    setUser(user) {
      this.user = user
      console.log('📌 User set:', user?.email)
      this.initialized = true
    },
    
    updateUserRole(role) {
      if (this.user) {
        this.user = {
          ...this.user,
          role: role
        }
        console.log('✅ تم تحديث دور المستخدم:', role)
      }
    },

    clearAuth() {
      this.user = null
      this.session = null
      this.initialized = false
      if (process.client) {
        localStorage.removeItem('user-store')
      }
      console.log('🗑️ تم مسح الجلسة')
    },
    
    async logout() {
      try {
        const { supabase } = await import('~/lib/supabase')
        await supabase.auth.signOut()
      } catch (e) {
        console.warn('Logout error:', e.message)
      }
      this.clearAuth()
      await navigateTo('/login')
    },
    
    async initialize() {
      // ✅ منع التهيئة أكثر من مرة
      if (this.initialized) {
        console.log('✅ Store already initialized')
        return
      }

      // ✅ لو في session محفوظ في localStorage، استخدمه
      if (process.client) {
        const saved = localStorage.getItem('user-store')
        if (saved) {
          try {
            const parsed = JSON.parse(saved)
            if (parsed?.user) {
              this.user = parsed.user
              this.session = parsed.session
              console.log('📌 Restored from localStorage:', parsed.user.email)
            }
          } catch (e) {
            console.warn('Could not parse saved session')
          }
        }
      }
      
      try {
        const { supabase, getSession, getUserProfile } = await import('~/lib/supabase')
        
        const session = await getSession()
        
        if (session) {
          this.setSession(session)
          
          const profile = await getUserProfile(session.user.email)
          if (profile?.role) {
            this.updateUserRole(profile.role)
            console.log('✅ تم تحديث الدور:', profile.role)
          }
        }
        
        // استماع لتغيرات المصادقة
        supabase.auth.onAuthStateChange(async (event, newSession) => {
          console.log('🔄 onAuthStateChange:', event)
          
          if (event === 'SIGNED_IN' && newSession) {
            this.setSession(newSession)
            
            const profile = await getUserProfile(newSession.user.email)
            if (profile?.role) {
              this.updateUserRole(profile.role)
            }
            
          } else if (event === 'SIGNED_OUT') {
            this.clearAuth()
          } else if (event === 'TOKEN_REFRESHED' && newSession) {
            this.session = newSession
          }
        })
        
        this.initialized = true
        console.log('✅ Auth store initialized successfully')
        
      } catch (error) {
        console.error('❌ Initialize error:', error?.message || error)
        this.initialized = true
      }
    }
  }
})