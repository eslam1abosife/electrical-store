<template>
  <div dir="rtl" class="min-h-screen bg-gray-50 flex">
    <!-- Mobile Menu Button -->
    <button
      @click="sidebarOpen = !sidebarOpen"
      class="lg:hidden fixed top-4 right-4 z-50 p-2 bg-blue-600 text-white rounded-lg shadow-lg"
    >
      <svg
        v-if="!sidebarOpen"
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>

    <!-- Overlay for mobile -->
    <div
      v-if="sidebarOpen && isMobile"
      @click="sidebarOpen = false"
      class="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity duration-300"
    ></div>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed top-0 right-0 lg:right-auto lg:left-0 h-full bg-white shadow-lg z-40 transition-transform duration-300 ease-in-out',
        'w-72 lg:w-64',
        sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0',
      ]"
    >
      <div class="flex flex-col h-full">
        <!-- Sidebar Header -->
        <div class="p-4 sm:p-6 border-b">
          <NuxtLink to="/">
            <h1 class="text-xl sm:text-2xl font-bold text-blue-600">جولدن</h1>
          </NuxtLink>
          <p class="text-xs sm:text-sm text-gray-500">لوحة التحكم</p>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 overflow-y-auto p-3 sm:p-4">
          <div class="space-y-1">
            <NuxtLink
              to="/dashboard"
              @click="sidebarOpen = false"
              class="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm sm:text-base"
              active-class="bg-blue-50 text-blue-600"
            >
              <span class="text-xl sm:text-2xl">📊</span>
              <span>الرئيسية</span>
            </NuxtLink>

            <NuxtLink
              to="/dashboard/products"
              @click="sidebarOpen = false"
              class="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm sm:text-base"
              active-class="bg-blue-50 text-blue-600"
            >
              <span class="text-xl sm:text-2xl">📦</span>
              <span>المنتجات</span>
            </NuxtLink>

            <NuxtLink
              to="/dashboard/orders"
              @click="sidebarOpen = false"
              class="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm sm:text-base"
              active-class="bg-blue-50 text-blue-600"
            >
              <span class="text-xl sm:text-2xl">📋</span>
              <span>الطلبات</span>
            </NuxtLink>

            <NuxtLink
              to="/dashboard/sales"
              @click="sidebarOpen = false"
              class="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm sm:text-base"
              active-class="bg-blue-50 text-blue-600"
            >
              <span class="text-xl sm:text-2xl">💰</span>
              <span>المبيعات</span>
            </NuxtLink>

            <NuxtLink
              to="/dashboard/purchases"
              @click="sidebarOpen = false"
              class="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm sm:text-base"
              active-class="bg-blue-50 text-blue-600"
            >
              <span class="text-xl sm:text-2xl">📥</span>
              <span>المشتريات</span>
            </NuxtLink>

            <NuxtLink
              to="/dashboard/reports"
              @click="sidebarOpen = false"
              class="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm sm:text-base"
              active-class="bg-blue-50 text-blue-600"
            >
              <span class="text-xl sm:text-2xl">📊</span>
              <span>التقارير</span>
            </NuxtLink>

            <NuxtLink
              to="/dashboard/offline-sale"
              @click="sidebarOpen = false"
              class="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm sm:text-base"
              active-class="bg-blue-50 text-blue-600"
            >
              <span class="text-xl sm:text-2xl">🏪</span>
              <span>بيع من المعرض</span>
            </NuxtLink>

            <NuxtLink
              to="/dashboard/installments"
              @click="sidebarOpen = false"
              class="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm sm:text-base"
              active-class="bg-blue-50 text-blue-600"
            >
              <span class="text-xl sm:text-2xl">🏦</span>
              <span>التقسيط</span>
            </NuxtLink>

            <NuxtLink
              to="/dashboard/debts"
              @click="sidebarOpen = false"
              class="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm sm:text-base"
              active-class="bg-blue-50 text-blue-600"
            >
              <span class="text-xl sm:text-2xl">📋</span>
              <span>الديون والمستحقات</span>
            </NuxtLink>

            <NuxtLink
              to="/dashboard/project-debts"
              @click="sidebarOpen = false"
              class="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm sm:text-base"
              active-class="bg-blue-50 text-blue-600"
            >
              <span class="text-xl sm:text-2xl">🏦</span>
              <span>ديون المشروع</span>
            </NuxtLink>

            <NuxtLink
              to="/dashboard/collector-fans"
              @click="sidebarOpen = false"
              class="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm sm:text-base"
              active-class="bg-blue-50 text-blue-600"
            >
              <span class="text-xl sm:text-2xl">🔄</span>
              <span>نظام مراوح المحصلين</span>
            </NuxtLink>

            <NuxtLink
              to="/dashboard/offers"
              @click="sidebarOpen = false"
              class="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm sm:text-base"
              active-class="bg-red-50 text-red-600"
            >
              <span class="text-xl sm:text-2xl">🎁</span>
              <span>العروض والخصومات</span>
            </NuxtLink>
            <!-- بعد رابط العروض والخصومات -->
            <NuxtLink
              to="/dashboard/bride-checklist"
              @click="sidebarOpen = false"
              class="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm sm:text-base"
              active-class="bg-pink-50 text-pink-600"
            >
              <span class="text-xl sm:text-2xl">👰</span>
              <span>كشوفات العرائس</span>
            </NuxtLink>
          </div>
        </nav>

        <!-- Logout Button -->
        <div class="p-4 sm:p-6 border-t mt-auto">
          <button
            @click="logout"
            class="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 py-2.5 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base"
          >
            <span>🚪</span>
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 w-full lg:ml-64">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b sticky top-0 z-20">
        <div
          class="flex items-center justify-between px-4 sm:px-6 md:px-8 h-14 sm:h-16"
        >
          <div class="flex-1 min-w-0">
            <h2
              class="text-base sm:text-lg md:text-xl font-semibold text-gray-800 truncate"
            >
              <slot name="title">لوحة التحكم</slot>
            </h2>
          </div>
          <div class="flex items-center gap-3 sm:gap-4">
            <div
              class="text-xs sm:text-sm text-gray-600 truncate max-w-[120px] sm:max-w-none"
            >
              مرحباً، {{ userStore.user?.email }}
            </div>
            <div
              class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0"
            >
              {{ getUserInitial() }}
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="p-3 sm:p-4 md:p-6 lg:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const userStore = useUserStore();
const sidebarOpen = ref(false);
const isMobile = ref(false);

// Get user initial for avatar
const getUserInitial = () => {
  const email = userStore.user?.email || "";
  return email.charAt(0).toUpperCase() || "م";
};

// Check if screen is mobile
const checkMobile = () => {
  isMobile.value = window.innerWidth < 1024;
  if (!isMobile.value) {
    sidebarOpen.value = false;
  }
};

// ✅ دالة logout محدثة
const logout = async () => {
  console.log('🚪 Logging out...')
  try {
    await userStore.logout()
    // التوجيه بعد تسجيل الخروج
    await navigateTo('/login')
  } catch (error) {
    console.error('❌ Logout error:', error)
    // حتى لو فيه خطأ، نروح للـ login
    await navigateTo('/login')
  }
};

// Handle resize
onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkMobile);
});
</script>

<style scoped>
/* Smooth transitions for sidebar */
.transition-transform {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

/* Custom scrollbar for sidebar */
aside ::-webkit-scrollbar {
  width: 4px;
}

aside ::-webkit-scrollbar-track {
  background: #f1f1f1;
}

aside ::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

aside ::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Active link styling */
.router-link-active {
  background-color: #eff6ff;
  color: #2563eb;
}

/* Mobile optimizations */
@media (max-width: 640px) {
  main {
    padding-bottom: 80px;
  }
}
</style>
