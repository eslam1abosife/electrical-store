// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

// المتغيرات
const supabaseUrl = 'https://jfyyfenoxacnethzbfdh.supabase.co'
const supabaseKey = 'sb_publishable_-xRL9fKXa8AeJWNz-aRYDA_9JaP6DIG'

// إنشاء عميل Supabase
export const supabase = createClient(supabaseUrl, supabaseKey)

// دالة لجلب الجلسة
export const getSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.error('❌ Session error:', error.message)
      return null
    }
    return data.session
  } catch (e) {
    console.error('❌ Session exception:', e.message)
    return null
  }
}

// دالة لجلب البروفايل
export const getUserProfile = async (email) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('email', email)
      .maybeSingle()
    
    if (error) {
      console.error('❌ Profile error:', error.message)
      return null
    }
    return data
  } catch (e) {
    console.error('❌ Profile exception:', e.message)
    return null
  }
}