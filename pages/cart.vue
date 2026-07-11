<template>
  <div dir="rtl" class="min-h-screen bg-gray-50">
    <!-- Header -->
    <HeaderComponent v-model:searchQuery="searchQuery" />

    <div class="container mx-auto px-4 py-6 sm:py-8 md:py-10 max-w-6xl">
      <div
        class="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 sm:mb-10"
      >
        <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold">
          🛒 عربة التسوق
        </h1>
        <NuxtLink
          to="/"
          class="text-blue-600 hover:underline flex items-center gap-2 text-sm sm:text-base"
        >
          ← العودة للتسوق
        </NuxtLink>
      </div>

      <!-- Empty Cart -->
      <div
        v-if="cartStore.items.length === 0"
        class="text-center py-16 sm:py-24"
      >
        <div class="text-6xl sm:text-7xl mb-4 sm:mb-6">🛍️</div>
        <h2
          class="text-2xl sm:text-3xl font-semibold text-gray-600 mb-2 sm:mb-3"
        >
          سلتك فارغة
        </h2>
        <p class="text-gray-500 mb-6 sm:mb-8 text-sm sm:text-base">
          لم تقم بإضافة أي منتجات بعد
        </p>
        <NuxtLink
          to="/"
          class="bg-blue-600 text-white px-6 sm:px-10 py-3 sm:py-4 rounded-2xl sm:rounded-3xl text-base sm:text-lg font-medium hover:bg-blue-700 transition inline-block"
        >
          ابدأ التسوق الآن
        </NuxtLink>
      </div>

      <!-- Cart Content -->
      <div v-else class="grid lg:grid-cols-12 gap-6 sm:gap-10">
        <!-- Cart Items -->
        <div class="lg:col-span-8 space-y-4 sm:space-y-6">
          <div
            v-for="item in cartStore.items"
            :key="item.id"
            class="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-center shadow-sm hover:shadow-md transition"
          >
            <!-- Product Image -->
            <img
              :src="item.image_url || '/images/placeholder.png'"
              class="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-cover rounded-xl sm:rounded-2xl flex-shrink-0"
              @error="(e) => (e.target.src = '/images/placeholder.png')"
            />

            <!-- Product Info -->
            <div class="flex-1 min-w-0 text-center sm:text-right">
              <h3 class="font-bold text-base sm:text-lg line-clamp-2">
                {{ item.name }}
              </h3>
              <p class="text-gray-500 text-xs sm:text-sm">
                {{ item.brand || "بدون ماركة" }}
              </p>
              <p
                class="text-xl sm:text-2xl font-bold text-blue-600 mt-1 sm:mt-2"
              >
                {{ formatPrice(item.price) }} ج.م
              </p>
            </div>

            <!-- Quantity Controls -->
            <div class="flex items-center gap-3 sm:gap-4">
              <button
                @click="cartStore.decreaseQuantity(item.id)"
                class="w-8 h-8 sm:w-10 sm:h-10 border border-gray-300 rounded-xl sm:rounded-2xl hover:bg-gray-100 transition flex items-center justify-center text-lg sm:text-xl font-bold"
              >
                −
              </button>
              <span
                class="font-semibold text-lg sm:text-xl w-6 sm:w-8 text-center"
                >{{ item.quantity }}</span
              >
              <button
                @click="cartStore.increaseQuantity(item.id)"
                class="w-8 h-8 sm:w-10 sm:h-10 border border-gray-300 rounded-xl sm:rounded-2xl hover:bg-gray-100 transition flex items-center justify-center text-lg sm:text-xl font-bold"
              >
                +
              </button>
            </div>

            <!-- Remove Button -->
            <button
              @click="cartStore.removeItem(item.id)"
              class="text-red-500 hover:text-red-600 text-xl sm:text-2xl p-1 sm:p-2 transition"
              title="إزالة المنتج"
            >
              🗑️
            </button>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="lg:col-span-4">
          <div
            class="bg-white rounded-2xl sm:rounded-3xl shadow p-5 sm:p-6 md:p-8 sticky top-28"
          >
            <h2 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
              ملخص الطلب
            </h2>

            <div class="space-y-3 sm:space-y-4">
              <div class="flex justify-between text-base sm:text-lg">
                <span class="text-gray-600">عدد المنتجات</span>
                <span class="font-medium">{{ cartStore.totalItems }}</span>
              </div>

              <div class="flex justify-between text-base sm:text-lg">
                <span class="text-gray-600">إجمالي المنتجات</span>
                <span class="font-medium"
                  >{{ formatPrice(cartStore.totalPrice) }} ج.م</span
                >
              </div>

              <div class="flex justify-between text-base sm:text-lg">
                <span class="text-gray-600">الشحن</span>
                <span class="font-medium text-green-600">مجاني</span>
              </div>

              <div
                class="flex justify-between text-2xl sm:text-3xl font-bold border-t pt-4 sm:pt-6 mt-2 sm:mt-4"
              >
                <span>الإجمالي</span>
                <span class="text-blue-600"
                  >{{ formatPrice(cartStore.totalPrice) }} ج.م</span
                >
              </div>
            </div>

            <button
              @click="proceedToCheckout"
              class="w-full mt-6 sm:mt-8 md:mt-10 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 sm:py-4 md:py-5 rounded-2xl sm:rounded-3xl text-base sm:text-lg md:text-xl font-bold hover:from-green-700 transition-all active:scale-95"
            >
              إتمام الشراء
            </button>

            <p
              class="text-center text-[10px] sm:text-xs text-gray-500 mt-4 sm:mt-6"
            >
              ✓ ضمان المنتجات ✓ توصيل سريع ✓ دفع آمن
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <ToastNotification :toast="toast" @close="toast.show = false" />
  </div>
</template>

<script setup>
import { useCartStore } from "~/stores/cart";
import { useUserStore } from "~/stores/user";

const supabase = useSupabaseClient();
const cartStore = useCartStore();
const userStore = useUserStore();

const toast = ref({ show: false, message: "", type: "success" });
const searchQuery = ref("");
const isProcessing = ref(false);

const formatPrice = (price) => {
  return price?.toLocaleString("ar-EG") || "0";
};

const showToast = (message, type = "success") => {
  toast.value = { show: true, message, type };
  setTimeout(() => (toast.value.show = false), 3000);
};

const proceedToCheckout = () => {
  if (!userStore.isLoggedIn) {
    showToast("⚠️ يرجى تسجيل الدخول أولاً", "warning");
    navigateTo("/login");
    return;
  }
  navigateTo("/checkout");
};

// Load cart on mount
onMounted(() => {
  cartStore.loadFromLocalStorage();
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  opacity: 0.5;
}

@media (max-width: 640px) {
  button,
  [role="button"] {
    min-height: 44px;
  }
}

button:active {
  transform: scale(0.98);
}
</style>
