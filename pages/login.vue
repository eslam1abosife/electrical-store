<template>
  <div
    dir="rtl"
    class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4 sm:p-6 md:p-8"
  >
    <div class="relative w-full max-w-md sm:max-w-lg md:max-w-md">
      <!-- Animated Background -->
      <div
        class="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-3xl -z-10 animate-pulse"
      ></div>

      <!-- Main Card -->
      <div
        class="relative bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-white/20"
      >
        <!-- Header -->
        <div
          class="bg-gradient-to-r from-blue-600 to-purple-600 p-6 sm:p-8 text-white text-center"
        >
          <div class="text-5xl sm:text-6xl mb-2 sm:mb-3 animate-bounce">🏬</div>
          <h1 class="text-2xl sm:text-3xl font-bold">مرحباً بعودتك</h1>
          <p class="text-blue-100 text-sm sm:text-base mt-1 sm:mt-2">
            سجل الدخول إلى حسابك
          </p>
        </div>

        <div class="p-6 sm:p-8">
          <!-- Social Login Buttons -->
          <div class="space-y-3 mb-6">
            <button
              @click="loginWithGoogle"
              :disabled="loading"
              class="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-800 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-medium text-sm sm:text-base transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 48 48">
                <path
                  fill="#FFC107"
                  d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                />
                <path
                  fill="#4CAF50"
                  d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                />
              </svg>
              <span>تسجيل الدخول بـ Google</span>
            </button>

            <button
              @click="loginWithFacebook"
              :disabled="loading"
              class="w-full flex items-center justify-center gap-3 bg-[#1877f2] hover:bg-[#166fe5] text-white py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-medium text-sm sm:text-base transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                class="w-5 h-5 sm:w-6 sm:h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                />
              </svg>
              <span>تسجيل الدخول بـ Facebook</span>
            </button>

            <!-- Divider -->
            <div class="relative my-4">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-white/20"></div>
              </div>
              <div class="relative flex justify-center text-xs sm:text-sm">
                <span class="px-3 bg-gray-800/50 text-gray-400 backdrop-blur-sm"
                  >أو</span
                >
              </div>
            </div>
          </div>

          <!-- Login Form -->
          <form @submit.prevent="handleLogin" class="space-y-4 sm:space-y-5">
            <!-- Email -->
            <div>
              <label class="block text-sm font-semibold text-white mb-1 sm:mb-2"
                >البريد الإلكتروني</label
              >
              <div class="relative">
                <span
                  class="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 text-base sm:text-lg"
                  >📧</span
                >
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
              <label class="block text-sm font-semibold text-white mb-1 sm:mb-2"
                >كلمة المرور</label
              >
              <div class="relative">
                <span
                  class="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 text-base sm:text-lg"
                  >🔒</span
                >
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
                  {{ showPassword ? "🙈" : "👁️" }}
                </button>
              </div>
            </div>

            <!-- Forgot Password -->
            <div class="text-right">
              <NuxtLink
                to="/forgot-password"
                class="text-xs sm:text-sm text-blue-400 hover:text-blue-300 transition"
              >
                نسيت كلمة المرور؟
              </NuxtLink>
            </div>

            <!-- Terms & Conditions -->
            <div class="flex items-start gap-2 sm:gap-3">
              <input
                type="checkbox"
                id="terms"
                v-model="agreeTerms"
                class="w-4 h-4 mt-0.5 rounded border-white/20 bg-white/10 checked:bg-blue-600 shrink-0"
              />
              <label
                for="terms"
                class="text-[10px] sm:text-xs text-gray-300 leading-relaxed"
              >
                أوافق على
                <a href="/terms" class="text-blue-400 hover:underline"
                  >الشروط والأحكام</a
                >
                و
                <a href="/privacy" class="text-blue-400 hover:underline"
                  >سياسة الخصوصية</a
                >
              </label>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="loading || !agreeTerms"
              class="relative w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg overflow-hidden group transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span
                class="relative z-10 flex items-center justify-center gap-2"
              >
                <span v-if="loading" class="animate-spin text-sm sm:text-base"
                  >⏳</span
                >
                <span v-else class="text-sm sm:text-base">🚀</span>
                <span class="text-sm sm:text-base">{{
                  loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"
                }}</span>
              </span>
              <div
                class="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition"
              ></div>
            </button>
          </form>

          <!-- Register Link -->
          <div class="mt-5 sm:mt-6 text-center">
            <p class="text-gray-300 text-xs sm:text-sm">
              ليس لديك حساب؟
              <NuxtLink
                to="/register"
                class="text-blue-400 font-semibold hover:underline hover:text-blue-300 transition"
              >
                إنشاء حساب جديد
              </NuxtLink>
            </p>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-3 gap-2 sm:gap-4 mt-6 sm:mt-8">
        <div class="text-center group cursor-pointer">
          <div
            class="text-2xl sm:text-3xl mb-0.5 sm:mb-1 group-hover:scale-110 transition"
          >
            ⭐
          </div>
          <div class="text-[10px] sm:text-xs text-gray-400">تقييم عالي</div>
        </div>
        <div class="text-center group cursor-pointer">
          <div
            class="text-2xl sm:text-3xl mb-0.5 sm:mb-1 group-hover:scale-110 transition"
          >
            👥
          </div>
          <div class="text-[10px] sm:text-xs text-gray-400">عملاء سعداء</div>
        </div>
        <div class="text-center group cursor-pointer">
          <div
            class="text-2xl sm:text-3xl mb-0.5 sm:mb-1 group-hover:scale-110 transition"
          >
            🎁
          </div>
          <div class="text-[10px] sm:text-xs text-gray-400">عروض حصرية</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { supabase } from "~/lib/supabase";

const router = useRouter();
const userStore = useUserStore();

const email = ref("");
const password = ref("");
const loading = ref(false);
const showPassword = ref(false);
const agreeTerms = ref(false);

// دالة مساعدة لتحديد دور المستخدم
const getUserRole = async (userEmail) => {
  try {
    const { data: profileData } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("email", userEmail)
      .maybeSingle();

    return profileData?.role || "customer";
  } catch (error) {
    console.error("❌ Error fetching user role:", error);
    return "customer";
  }
};

// دالة مساعدة لإعداد جلسة المستخدم
const setupUserSession = async (user, session) => {
  const role = await getUserRole(user.email);

  userStore.setUser({
    id: user.id,
    email: user.email,
    role: role,
    isAdmin: role === "admin",
  });

  userStore.setSession(session);

  // تأكد من التخزين
  await new Promise((resolve) => setTimeout(resolve, 100));

  // التوجيه حسب الدور
  if (role === "admin" || role === "partner") {
    await router.push("/dashboard");
  } else {
    await router.push("/");
  }

  console.log("✅ تم تسجيل الدخول بنجاح!");
};

// تسجيل الدخول بالبريد الإلكتروني وكلمة المرور
const handleLogin = async () => {
  // التحقق من الموافقة على الشروط
  if (!agreeTerms.value) {
    alert("⚠️ يرجى الموافقة على الشروط والأحكام");
    return;
  }

  loading.value = true;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });

    if (error) throw error;

    await setupUserSession(data.user, data.session);
  } catch (error) {
    console.error("❌ خطأ:", error);
    alert("❌ خطأ في تسجيل الدخول: " + error.message);
  } finally {
    loading.value = false;
  }
};

// تسجيل الدخول بـ Google
const loginWithGoogle = async () => {
 

  loading.value = true;

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) throw error;

    console.log("🔄 جاري التوجيه إلى Google...");
  } catch (error) {
    console.error("❌ خطأ في تسجيل الدخول بـ Google:", error);
    alert("❌ حدث خطأ أثناء تسجيل الدخول بـ Google: " + error.message);
    loading.value = false;
  }
};

// تسجيل الدخول بـ Facebook
const loginWithFacebook = async () => {
  

  loading.value = true;

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: "public_profile,email",
      },
    });

    if (error) throw error;

    console.log("🔄 جاري التوجيه إلى Facebook...");
  } catch (error) {
    console.error("❌ خطأ في تسجيل الدخول بـ Facebook:", error);
    alert("❌ حدث خطأ أثناء تسجيل الدخول بـ Facebook: " + error.message);
    loading.value = false;
  }
};
</script>

<style scoped>
/* منع zoom التلقائي على iOS */
@media (max-width: 640px) {
  input,
  button {
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
  0%,
  100% {
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

/* تحسين مظهر أزرار السوشيال ميديا */
button svg {
  flex-shrink: 0;
}
</style>