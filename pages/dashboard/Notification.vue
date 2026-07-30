<template>
  <div class="p-6">
    <div class="bg-white rounded-2xl shadow p-6 max-w-md mx-auto">
      <h2 class="text-2xl font-bold mb-4">🔔 إعدادات الإشعارات</h2>
      
      <div class="bg-gray-50 p-4 rounded-xl">
        <p class="text-sm text-gray-600 mb-3">
          فعّل الإشعارات عشان توصلك تنبيهات عند استلام طلبات جديدة
        </p>
        
        <div v-if="notificationStatus" class="bg-green-50 p-3 rounded-lg mb-3">
          <p class="text-green-700 font-bold">✅ الإشعارات مفعلة</p>
          <p class="text-xs text-gray-500">هتوصلك إشعارات لكل طلب جديد</p>
        </div>
        
        <div v-if="!notificationStatus" class="bg-yellow-50 p-3 rounded-lg mb-3">
          <p class="text-yellow-700 font-bold">⚠️ الإشعارات غير مفعلة</p>
          <p class="text-xs text-gray-500">اضغط على الزر عشان تفعلها</p>
        </div>
        
        <button
          @click="enableNotifications"
          :disabled="loading"
          class="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
        >
          {{ loading ? '⏳ جاري التفعيل...' : '🔔 تفعيل الإشعارات' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { requestNotificationPermission, setupNotificationListener } from '~/lib/firebase';

const notificationStatus = ref(false);
const loading = ref(false);

const enableNotifications = async () => {
  loading.value = true;
  try {
    const token = await requestNotificationPermission();
    if (token) {
      notificationStatus.value = true;
      alert('✅ تم تفعيل الإشعارات بنجاح');
    } else {
      alert('⚠️ لم يتم تفعيل الإشعارات. تأكد من منح الإذن');
    }
  } catch (error) {
    console.error('❌ خطأ:', error);
    alert('❌ حدث خطأ في تفعيل الإشعارات');
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
.animate-slide-down {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    transform: translateY(-100px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>