// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

// المتغيرات من البيئة
const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL || 'https://jfyyfenoxacnethzbfdh.supabase.co'
const supabaseKey = process.env.NUXT_PUBLIC_SUPABASE_KEY || 'sb_publishable_-xRL9fKXa8AeJWNz-aRYDA_9JaP6DIG'

// إنشاء عميل Supabase واحد
export const supabase = createClient(supabaseUrl, supabaseKey)

// دالة مساعدة للتحقق من الجلسة
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) {
    console.error('❌ Error getting session:', error.message)
    return null
  }
  return session
}

// دالة مساعدة لجلب البروفايل
export const getUserProfile = async (email) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('email', email)
    .maybeSingle()
  
  if (error) {
    console.error('❌ Error fetching profile:', error.message)
    return null
  }
  return data
}