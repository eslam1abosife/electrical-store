<!-- pages/collector-login.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4" dir="rtl">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="bg-white w-20 h-20 rounded-3xl shadow-lg flex items-center justify-center mx-auto mb-4">
          <span class="text-4xl">👤</span>
        </div>
        <h1 class="text-3xl font-bold text-gray-800">نظام المحصلين</h1>
        <p class="text-gray-500 mt-1">تسجيل الدخول إلى لوحة التحكم</p>
      </div>

      <!-- Login Card -->
      <div class="bg-white rounded-3xl shadow-2xl p-8">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              📧 البريد الإلكتروني
            </label>
            <input
              v-model="loginForm.email"
              type="email"
              required
              placeholder="أدخل البريد الإلكتروني"
              class="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 dir-ltr"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              🔒 كلمة المرور
            </label>
            <div class="relative">
              <input
                v-model="loginForm.password"
                :type="showPassword ? 'text' : 'password'"
                required
                placeholder="أدخل كلمة المرور"
                class="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 dir-ltr"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-bold text-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg v-if="!loading" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
            </svg>
            <svg v-else class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            {{ loading ? 'جاري تسجيل الدخول...' : '🚪 تسجيل الدخول' }}
          </button>
        </form>

        <div class="mt-6 text-center text-sm text-gray-500">
          <p>© 2026 معرض جولدن - نظام المحصلين</p>
          <p class="mt-1 text-xs">للتواصل: 01034003002</p>
        </div>
      </div>
    </div>

    <ToastNotification v-model:toast="toast" />
  </div>
</template>

<script setup>
definePageMeta({ layout: false });

import { supabase } from '~/lib/supabase';

const toast = ref({ show: false, message: "", type: "success", icon: "✅" });
const loading = ref(false);
const showPassword = ref(false);

const loginForm = ref({
  email: "",
  password: "",
});

const showToast = (message, type = "success") => {
  const icons = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" };
  toast.value = { show: true, message, type, icon: icons[type] || "✅" };
  setTimeout(() => { toast.value.show = false; }, 3000);
};

const handleLogin = async () => {
  if (!loginForm.value.email || !loginForm.value.password) {
    showToast("⚠️ الرجاء إدخال البريد الإلكتروني وكلمة المرور", "warning");
    return;
  }

  loading.value = true;

  try {
    const { data: collector, error } = await supabase
      .from('collectors')
      .select('*')
      .eq('email', loginForm.value.email)
      .single();

    if (error || !collector) {
      showToast("❌ البريد الإلكتروني غير مسجل", "error");
      loading.value = false;
      return;
    }

    if (collector.password !== loginForm.value.password) {
      showToast("❌ كلمة المرور غير صحيحة", "error");
      loading.value = false;
      return;
    }

    if (collector.status !== 'active') {
      showToast("⚠️ الحساب غير نشط، يرجى التواصل مع الإدارة", "warning");
      loading.value = false;
      return;
    }

    const collectorData = {
      id: collector.id,
      name: collector.name,
      phone: collector.phone,
      address: collector.address,
      area: collector.area,
      email: collector.email,
      isCollector: true
    };

    localStorage.setItem('collector_session', JSON.stringify(collectorData));

    showToast("✅ تم تسجيل الدخول بنجاح", "success");

    setTimeout(() => {
      navigateTo('/collector-dashboard');
    }, 1000);

  } catch (error) {
    console.error('❌ خطأ:', error);
    showToast("❌ حدث خطأ أثناء تسجيل الدخول", "error");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  const session = localStorage.getItem('collector_session');
  if (session) {
    try {
      const data = JSON.parse(session);
      if (data.isCollector) {
        navigateTo('/collector-dashboard');
      }
    } catch (e) {
      console.error('Error parsing session:', e);
    }
  }
});
</script>

<style scoped>
.dir-ltr {
  direction: ltr;
  display: inline-block;
}
</style>