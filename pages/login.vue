<template>
  <div dir="rtl" class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4 sm:p-6 md:p-8">
    <div class="relative w-full max-w-md sm:max-w-lg md:max-w-md">
      <!-- Animated Background -->
      <div class="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-3xl -z-10 animate-pulse"></div>
      
      <!-- Main Card -->
      <div class="relative bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-white/20">
        <!-- Header -->
        <div class="bg-gradient-to-r from-blue-600 to-purple-600 p-6 sm:p-8 text-white text-center">
          <div class="text-5xl sm:text-6xl mb-2 sm:mb-3 animate-bounce">🏬</div>
          <h1 class="text-2xl sm:text-3xl font-bold">مرحباً بعودتك</h1>
          <p class="text-blue-100 text-sm sm:text-base mt-1 sm:mt-2">سجل الدخول إلى حسابك</p>
        </div>

        <div class="p-6 sm:p-8">
          <form @submit.prevent="handleLogin" class="space-y-4 sm:space-y-5">
            <!-- Email -->
            <div>
              <label class="block text-sm font-semibold text-white mb-1 sm:mb-2">البريد الإلكتروني</label>
              <div class="relative">
                <span class="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 text-base sm:text-lg">📧</span>
                <input 
                  v-model="email" 
                  type="email" 
                  required 
                  class="w-full p-2.5 sm:p-3 pr-10 sm:pr-12 bg-white/10 border border-white/20 rounded-xl sm:rounded-2xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition text-sm sm:text-base"
                  placeholder="example@email.com"
                />
              </div>
            </div>

            <!-- Password -->
            <div>
              <label class="block text-sm font-semibold text-white mb-1 sm:mb-2">كلمة المرور</label>
              <div class="relative">
                <span class="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 text-base sm:text-lg">🔒</span>
                <input 
                  v-model="password" 
                  :type="showPassword ? 'text' : 'password'" 
                  required 
                  class="w-full p-2.5 sm:p-3 pr-10 sm:pr-12 bg-white/10 border border-white/20 rounded-xl sm:rounded-2xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition text-sm sm:text-base"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition text-base sm:text-lg"
                >
                  {{ showPassword ? '🙈' : '👁️' }}
                </button>
              </div>
            </div>

            <!-- Forgot Password -->
            <div class="text-right">
              <NuxtLink to="/forgot-password" class="text-xs sm:text-sm text-blue-400 hover:text-blue-300 transition">
                نسيت كلمة المرور؟
              </NuxtLink>
            </div>

            <!-- Submit Button -->
            <button 
              type="submit" 
              :disabled="loading" 
              class="relative w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg overflow-hidden group transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span class="relative z-10 flex items-center justify-center gap-2">
                <span v-if="loading" class="animate-spin text-sm sm:text-base">⏳</span>
                <span v-else class="text-sm sm:text-base">🚀</span>
                <span class="text-sm sm:text-base">{{ loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول' }}</span>
              </span>
              <div class="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition"></div>
            </button>
          </form>
          
          <!-- Register Link -->
          <div class="mt-5 sm:mt-6 text-center">
            <p class="text-gray-300 text-xs sm:text-sm">
              ليس لديك حساب؟
              <NuxtLink to="/register" class="text-blue-400 font-semibold hover:underline hover:text-blue-300 transition">
                إنشاء حساب جديد
              </NuxtLink>
            </p>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-3 gap-2 sm:gap-4 mt-6 sm:mt-8">
        <div class="text-center group cursor-pointer">
          <div class="text-2xl sm:text-3xl mb-0.5 sm:mb-1 group-hover:scale-110 transition">⭐</div>
          <div class="text-[10px] sm:text-xs text-gray-400">تقييم عالي</div>
        </div>
        <div class="text-center group cursor-pointer">
          <div class="text-2xl sm:text-3xl mb-0.5 sm:mb-1 group-hover:scale-110 transition">👥</div>
          <div class="text-[10px] sm:text-xs text-gray-400">عملاء سعداء</div>
        </div>
        <div class="text-center group cursor-pointer">
          <div class="text-2xl sm:text-3xl mb-0.5 sm:mb-1 group-hover:scale-110 transition">🎁</div>
          <div class="text-[10px] sm:text-xs text-gray-400">عروض حصرية</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { supabase } from '~/lib/supabase';

const router = useRouter();
const userStore = useUserStore();

const email = ref("");
const password = ref("");
const loading = ref(false);
const showPassword = ref(false);

const handleLogin = async () => {
  loading.value = true;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });

    if (error) throw error;

    // جلب الدور من user_profiles
    let role = "customer";

    const { data: profileData } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("email", data.user.email)
      .maybeSingle();

    if (profileData) {
      role = profileData.role;
    }

    // ✅ تخزين في userStore
    userStore.setUser({
      id: data.user.id,
      email: data.user.email,
      role: role,
      isAdmin: role === "admin",
    });

    userStore.setSession(data.session);
    
    // ✅ تأكد من التوجيه بعد التخزين
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // التوجيه حسب الدور
    if (role === "admin" || role === "partner") {
      await router.push("/dashboard");
    } else {
      await router.push("/");
    }
    
    console.log('✅ تم تسجيل الدخول بنجاح!');
    
  } catch (error) {
    console.error("❌ خطأ:", error);
    alert("❌ خطأ في تسجيل الدخول: " + error.message);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* منع zoom التلقائي على iOS */
@media (max-width: 640px) {
  input, button {
    font-size: 16px !important;
  }
}

/* تحسين الـ touch targets */
button, 
[role="button"] {
  min-height: 44px;
}

/* تحسين الـ animations على الموبايل */
@media (max-width: 640px) {
  .animate-bounce {
    animation: bounce 1s ease infinite;
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

/* Smooth transitions */
.transition {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}
</style>