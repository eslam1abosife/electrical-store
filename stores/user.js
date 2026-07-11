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
    
    userRole: (state) => {
      // الأولوية: role المخزنة في user object
      if (state.user?.role) return state.user.role
      // ثم من user_metadata
      if (state.user?.user_metadata?.role) return state.user.user_metadata.role
      // ثم من app_metadata
      if (state.user?.app_metadata?.role) return state.user.app_metadata.role
      return null
    },
    
    // ✅ مدير - صلاحية كاملة
    isAdmin: (state) => {
      const role = state.user?.role || state.user?.user_metadata?.role
      return role === 'admin'
    },
    
    // ✅ شريك - مشاهدة فقط
    isPartner: (state) => {
      const role = state.user?.role || state.user?.user_metadata?.role
      return role === 'partner'
    },
    
    // ✅ محصل (لو احتاجناه بعدين)
    isCollector: (state) => {
      const role = state.user?.role || state.user?.user_metadata?.role
      return role === 'collector'
    },
    
    // ✅ هل هو مدير أو شريك (بيشوف كل حاجة)
    canViewDashboard: (state) => {
      const role = state.user?.role || state.user?.user_metadata?.role
      return role === 'admin' || role === 'partner'
    },
    
    // ✅ هل عنده صلاحية التعديل (مدير بس)
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
        console.log('📌 Session set:', session.user.email, 'Role from session:', this.user?.role)
      }
      this.initialized = true
    },

    setUser(user) {
      this.user = user
      console.log('📌 User set:', user?.email, 'Role:', user?.role)
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
      const supabase = useSupabaseClient()
      
      // جلب الجلسة الحالية
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        this.setSession(session)
        
        // ✅ جلب الدور من جدول user_profiles
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('email', session.user.email)
          .maybeSingle()
        
        if (error) {
          console.error('❌ خطأ في جلب البروفايل:', error)
        }
        
        if (profile?.role) {
          this.updateUserRole(profile.role)
          console.log('✅ تم تحديث الدور من initialize:', profile.role)
        } else {
          console.log('⚠️ مفيش بروفايل للمستخدم:', session.user.email)
        }
      }
      
      // ✅ استماع لتغيرات المصادقة
      supabase.auth.onAuthStateChange(async (event, newSession) => {
        console.log('🔄 onAuthStateChange:', event)
        
        if (event === 'SIGNED_IN' && newSession) {
          this.setSession(newSession)
          
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('email', newSession.user.email)
            .maybeSingle()
          
          if (profile?.role) {
            this.updateUserRole(profile.role)
          }
        } else if (event === 'SIGNED_OUT') {
          this.clearAuth()
        } else if (event === 'TOKEN_REFRESHED') {
          // تحديث الجلسة
          if (newSession) {
            this.session = newSession
          }
        }
      })
    }
  }
})