// stores/user.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    session: null,
    initialized: false
  }),

  // ✅ أضف persist عشان نحتفظ بالبيانات
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'user-store',
        storage: process.client ? localStorage : undefined,
        paths: ['user', 'session']
      }
    ]
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
      console.log('🗑️ تم مسح الجلسة')
    },
    
    async logout() {
      const supabase = useSupabaseClient()
      await supabase.auth.signOut()
      this.clearAuth()
      await navigateTo('/login')
    },
    
    async initialize() {
      try {
        const supabase = useSupabaseClient()
        
        if (!supabase) {
          console.warn('⚠️ Supabase client not available')
          this.initialized = true
          return
        }
        
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Error getting session:', error.message)
          this.initialized = true
          return
        }
        
        if (session) {
          this.setSession(session)
          
          try {
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('role')
              .eq('email', session.user.email)
              .maybeSingle()
            
            if (profile?.role) {
              this.updateUserRole(profile.role)
              console.log('✅ تم تحديث الدور:', profile.role)
            }
          } catch (err) {
            console.warn('⚠️ Could not fetch profile:', err.message)
          }
        }
        
        supabase.auth.onAuthStateChange(async (event, newSession) => {
          console.log('🔄 onAuthStateChange:', event)
          
          if (event === 'SIGNED_IN' && newSession) {
            this.setSession(newSession)
            
            try {
              const { data: profile } = await supabase
                .from('user_profiles')
                .select('role')
                .eq('email', newSession.user.email)
                .maybeSingle()
              
              if (profile?.role) {
                this.updateUserRole(profile.role)
              }
            } catch (err) {
              console.warn('⚠️ Could not fetch profile on sign in:', err.message)
            }
            
          } else if (event === 'SIGNED_OUT') {
            this.clearAuth()
          } else if (event === 'TOKEN_REFRESHED' && newSession) {
            this.session = newSession
          }
        })
        
        this.initialized = true
        
      } catch (error) {
        console.error('❌ Initialize error:', error?.message || error)
        this.initialized = true
      }
    }
  }
})