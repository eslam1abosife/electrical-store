// stores/user.js
import { defineStore } from 'pinia'
import { supabase, getSession, getUserProfile } from '~/lib/supabase'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    session: null,
    initialized: false
  }),

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
      console.log('🗑️ تم مسح الجلسة')
    },
    
    async logout() {
      await supabase.auth.signOut()
      this.clearAuth()
      await navigateTo('/login')
    },
    
    async initialize() {
      if (this.initialized) {
        console.log('✅ Store already initialized')
        return
      }
      
      try {
        // ✅ استخدام الدالة المساعدة
        const session = await getSession()
        
        if (session) {
          this.setSession(session)
          
          // ✅ جلب البروفايل
          const profile = await getUserProfile(session.user.email)
          if (profile?.role) {
            this.updateUserRole(profile.role)
            console.log('✅ تم تحديث الدور:', profile.role)
          }
        }
        
        // ✅ استماع لتغيرات المصادقة
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