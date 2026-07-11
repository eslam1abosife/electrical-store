<template>
  <div dir="rtl" class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4 sm:p-6 md:p-8">
    <div class="relative w-full max-w-md sm:max-w-lg md:max-w-md">
      <!-- Animated Background -->
      <div class="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-3xl -z-10 animate-pulse"></div>
      
      <!-- Main Card -->
      <div class="relative bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-white/20">
        <!-- Header -->
        <div class="bg-gradient-to-r from-blue-600 to-purple-600 p-6 sm:p-8 text-white text-center">
          <div class="text-5xl sm:text-6xl mb-2 sm:mb-3 animate-bounce">🔐</div>
          <h1 class="text-2xl sm:text-3xl font-bold">نسيت كلمة المرور؟</h1>
          <p class="text-blue-100 text-sm sm:text-base mt-1 sm:mt-2">لا تقلق، سنرسل لك رابط إعادة التعيين</p>
        </div>

        <div class="p-6 sm:p-8">
          <!-- Success Message -->
          <transition name="slide-fade">
            <div v-if="success" class="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-xl sm:rounded-2xl text-green-300 text-center">
              <div class="text-xl sm:text-2xl mb-1 sm:mb-2">✅</div>
              <p class="font-semibold text-sm sm:text-base">تم إرسال رابط إعادة التعيين!</p>
              <p class="text-xs sm:text-sm mt-1">يرجى التحقق من بريدك الإلكتروني</p>
            </div>
          </transition>

          <!-- Error Message -->
          <transition name="slide-fade">
            <div v-if="error" class="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl sm:rounded-2xl text-red-300 text-center">
              <div class="text-xl sm:text-2xl mb-1 sm:mb-2">❌</div>
              <p class="font-semibold text-sm sm:text-base">{{ error }}</p>
            </div>
          </transition>

          <form @submit.prevent="handleForgotPassword" class="space-y-4 sm:space-y-5">
            <!-- Email -->
            <div>
              <label class="block text-sm font-semibold text-white mb-1 sm:mb-2">البريد الإلكتروني</label>
              <div class="relative">
                <span class="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 text-base sm:text-lg">📧</span>
                <input 
                  v-model="email" 
                  type="email" 
                  required 
                  :disabled="loading || success"
                  class="w-full p-2.5 sm:p-3 pr-10 sm:pr-12 bg-white/10 border border-white/20 rounded-xl sm:rounded-2xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  placeholder="example@email.com"
                />
              </div>
              <p class="text-[10px] sm:text-xs text-gray-400 mt-1">سنرسل رابط إعادة تعيين كلمة المرور إلى هذا البريد</p>
            </div>

            <!-- Submit Button -->
            <button 
              type="submit" 
              :disabled="loading || success || !email" 
              class="relative w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg overflow-hidden group transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span class="relative z-10 flex items-center justify-center gap-2">
                <span v-if="loading" class="animate-spin text-sm sm:text-base">⏳</span>
                <span v-else class="text-sm sm:text-base">📧</span>
                <span class="text-sm sm:text-base">{{ loading ? 'جاري الإرسال...' : 'إرسال رابط إعادة التعيين' }}</span>
              </span>
              <div class="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition"></div>
            </button>
          </form>

          <!-- Resend Button (after success) -->
          <div v-if="success" class="mt-5 sm:mt-6 text-center">
            <button 
              @click="resetForm"
              class="text-blue-400 hover:text-blue-300 transition text-xs sm:text-sm"
            >
              لم تصلك الرسالة؟ إعادة إرسال
            </button>
          </div>
          
          <!-- Back to Login Link -->
          <div class="mt-5 sm:mt-6 text-center">
            <p class="text-gray-300 text-xs sm:text-sm">
              تذكرت كلمة المرور؟
              <NuxtLink to="/login" class="text-blue-400 font-semibold hover:underline hover:text-blue-300 transition">
                العودة إلى تسجيل الدخول
              </NuxtLink>
            </p>
          </div>

          <!-- Help Section -->
          <div class="mt-5 sm:mt-6 p-3 sm:p-4 bg-white/5 rounded-xl sm:rounded-2xl">
            <div class="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-400">
              <span class="text-xl sm:text-2xl">💡</span>
              <div>
                <p class="font-semibold text-white text-sm sm:text-base">لم تصلك الرسالة؟</p>
                <p class="text-[10px] sm:text-xs mt-0.5 sm:mt-1">تحقق من مجلد البريد العشوائي (Spam) أو جرب مرة أخرى بعد دقيقة</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Security Tips -->
      <div class="grid grid-cols-1 gap-3 sm:gap-4 mt-6 sm:mt-8">
        <div class="text-center group cursor-pointer">
          <div class="text-2xl sm:text-3xl mb-0.5 sm:mb-1 group-hover:scale-110 transition">🛡️</div>
          <div class="text-[10px] sm:text-xs text-gray-400">كلمة مرور قوية</div>
        </div>
        <div class="text-center group cursor-pointer">
          <div class="text-2xl sm:text-3xl mb-0.5 sm:mb-1 group-hover:scale-110 transition">🔒</div>
          <div class="text-[10px] sm:text-xs text-gray-400">حماية حسابك</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const supabase = useSupabaseClient();
const router = useRouter();

const email = ref('');
const loading = ref(false);
const success = ref(false);
const error = ref('');

const handleForgotPassword = async () => {
  if (!email.value) {
    error.value = 'الرجاء إدخال البريد الإلكتروني';
    setTimeout(() => { error.value = ''; }, 3000);
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.value,
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    );

    if (resetError) throw resetError;

    success.value = true;
    
  } catch (err) {
    console.error('❌ خطأ:', err);
    error.value = err.message || 'حدث خطأ، يرجى المحاولة مرة أخرى';
    setTimeout(() => { error.value = ''; }, 3000);
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  success.value = false;
  email.value = '';
};
</script>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.relative {
  animation: fadeInUp 0.6s ease-out;
}

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
</style>