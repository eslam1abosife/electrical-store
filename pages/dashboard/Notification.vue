<template>
  <div class="p-4 sm:p-6 bg-gray-50 min-h-screen" dir="rtl">
    <div class="bg-white rounded-2xl shadow p-6 max-w-md mx-auto">
      <h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
        🔔 إعدادات الإشعارات
      </h2>
      
      <div class="bg-gray-50 p-4 rounded-xl">
        <p class="text-sm text-gray-600 mb-3">
          فعّل الإشعارات عشان توصلك تنبيهات عند استلام طلبات جديدة من العملاء
        </p>
        
        <div v-if="notificationStatus" class="bg-green-50 p-3 rounded-lg mb-3 border border-green-200">
          <p class="text-green-700 font-bold">✅ الإشعارات مفعلة</p>
          <p class="text-xs text-gray-500">هتوصلك إشعارات لكل طلب جديد</p>
        </div>
        
        <div v-if="!notificationStatus && !loading" class="bg-yellow-50 p-3 rounded-lg mb-3 border border-yellow-200">
          <p class="text-yellow-700 font-bold">⚠️ الإشعارات غير مفعلة</p>
          <p class="text-xs text-gray-500">اضغط على الزر عشان تفعلها</p>
        </div>
        
        <button
          @click="enableNotifications"
          :disabled="loading"
          class="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <span v-if="loading" class="animate-spin">⏳</span>
          <span v-else>🔔</span>
          {{ loading ? 'جاري التفعيل...' : 'تفعيل الإشعارات' }}
        </button>
        
        <div v-if="errorMessage" class="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
          <p class="text-red-600 text-sm">{{ errorMessage }}</p>
        </div>
      </div>
      
      <div class="mt-4 text-xs text-gray-400 text-center">
        <p>الإشعارات تصلك حتى لو التطبيق مقفول</p>
        <p class="mt-1">📱 تأكد من منح الإذن في المتصفح</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { supabase } from '~/lib/supabase';
import { requestNotificationPermission, setupNotificationListener } from '~/lib/firebase';

definePageMeta({
  layout: 'dashboard',
  middleware: 'admin-only'
});

const userStore = useUserStore();

const notificationStatus = ref(false);
const loading = ref(false);
const errorMessage = ref('');

const enableNotifications = async () => {
  loading.value = true;
  errorMessage.value = '';
  
  try {
    // 1. طلب الإذن من المتصفح
    const token = await requestNotificationPermission();
    
    if (token) {
      // 2. جلب المستخدم من user_profiles باستخدام الـ email
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('id, email, full_name')
        .eq('email', userStore.user?.email)
        .single();
      
      if (userError) {
        console.error('❌ خطأ في جلب المستخدم:', userError);
        errorMessage.value = 'حدث خطأ في جلب بيانات المستخدم: ' + userError.message;
        return;
      }
      
      if (!userData) {
        errorMessage.value = 'المستخدم غير موجود في قاعدة البيانات';
        return;
      }
      
      console.log('👤 User Data:', userData);
      console.log('📱 Token:', token);
      
      // 3. حفظ التوكن في Supabase
      const { error } = await supabase
        .from('user_tokens')
        .upsert({
          user_id: userData.id,  // استخدم الـ ID من user_profiles
          fcm_token: token,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });
      
      if (error) {
        console.error('❌ خطأ في حفظ التوكن:', error);
        errorMessage.value = 'حدث خطأ في حفظ التوكن: ' + error.message;
        return;
      }
      
      notificationStatus.value = true;
      alert('✅ تم تفعيل الإشعارات بنجاح');
    } else {
      errorMessage.value = 'لم يتم منح الإذن. تأكد من السماح للإشعارات في المتصفح';
    }
  } catch (error) {
    console.error('❌ خطأ:', error);
    errorMessage.value = 'حدث خطأ في تفعيل الإشعارات: ' + error.message;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  // إعداد المستمع للإشعارات
  setupNotificationListener();
  
  // التحقق من حالة الإذن
  if (Notification.permission === 'granted') {
    notificationStatus.value = true;
  }
});
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>