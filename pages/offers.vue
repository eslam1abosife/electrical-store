<template>
  <div dir="rtl" class="min-h-screen bg-gradient-to-b from-gray-50 to-white">
    <HeaderComponent v-model:searchQuery="searchQuery" />

    <!-- Hero Section -->
    <div
      class="relative bg-gradient-to-r from-red-600 to-orange-500 text-white overflow-hidden"
    >
      <div class="absolute inset-0 bg-black/20"></div>
      <div class="container mx-auto px-4 py-10 sm:py-16 relative z-10">
        <div class="text-center">
          <div class="inline-block animate-bounce mb-2 sm:mb-4">
            <span class="text-5xl sm:text-7xl">🎉</span>
          </div>
          <h1 class="text-3xl sm:text-4xl md:text-6xl font-bold mb-2 sm:mb-4">عروض حصرية</h1>
          <p class="text-lg sm:text-xl md:text-2xl opacity-90">خصومات تصل إلى 70%</p>
          <p class="text-base sm:text-lg mt-1 sm:mt-2">لفترة محدودة - الكمية محدودة</p>

          <!-- Countdown Timer -->
          <div class="flex justify-center gap-2 sm:gap-4 mt-6 sm:mt-8">
            <div class="bg-white/20 backdrop-blur rounded-lg sm:rounded-xl p-2 sm:p-4 min-w-[60px] sm:min-w-[80px]">
              <div class="text-xl sm:text-3xl font-bold">{{ days }}</div>
              <div class="text-[10px] sm:text-sm">يوم</div>
            </div>
            <div class="bg-white/20 backdrop-blur rounded-lg sm:rounded-xl p-2 sm:p-4 min-w-[60px] sm:min-w-[80px]">
              <div class="text-xl sm:text-3xl font-bold">{{ hours }}</div>
              <div class="text-[10px] sm:text-sm">ساعة</div>
            </div>
            <div class="bg-white/20 backdrop-blur rounded-lg sm:rounded-xl p-2 sm:p-4 min-w-[60px] sm:min-w-[80px]">
              <div class="text-xl sm:text-3xl font-bold">{{ minutes }}</div>
              <div class="text-[10px] sm:text-sm">دقيقة</div>
            </div>
            <div class="bg-white/20 backdrop-blur rounded-lg sm:rounded-xl p-2 sm:p-4 min-w-[60px] sm:min-w-[80px]">
              <div class="text-xl sm:text-3xl font-bold">{{ seconds }}</div>
              <div class="text-[10px] sm:text-sm">ثانية</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Decorative elements -->
      <div
        class="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-50 to-transparent"
      ></div>
    </div>

    <div class="container mx-auto px-4 py-8 sm:py-12">
      <!-- Flash Sale Banner -->
      <div
        class="bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 rounded-2xl sm:rounded-3xl p-5 sm:p-8 mb-8 sm:mb-12 text-white relative overflow-hidden"
      >
        <div class="absolute right-0 top-0 opacity-10 hidden sm:block">
          <svg class="w-48 h-48 sm:w-64 sm:h-64" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 3l3.293 3.293-7 7 1.414 1.414 7-7L21 11V3z" />
          </svg>
        </div>
        <div class="relative z-10">
          <div class="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-between">
            <div class="text-center sm:text-right">
              <div class="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">⚡ Flash Sale ⚡</div>
              <p class="text-sm sm:text-base md:text-lg">عروض سريعة لمدة 24 ساعة فقط!</p>
            </div>
            <div
              class="bg-white text-red-600 px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold text-sm sm:text-base md:text-lg"
            >
              خصم إضافي 10% على كل المنتجات
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div class="flex gap-2 sm:gap-3 flex-wrap w-full sm:w-auto">
          <button
            @click="selectedCategory = 'all'"
            class="px-3 sm:px-6 py-1.5 sm:py-2 rounded-full transition text-sm sm:text-base"
            :class="
              selectedCategory === 'all'
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            "
          >
            الكل 🎁
          </button>
          <button
            v-for="cat in categories"
            :key="cat.value"
            @click="selectedCategory = cat.value"
            class="px-3 sm:px-6 py-1.5 sm:py-2 rounded-full transition text-sm sm:text-base whitespace-nowrap"
            :class="
              selectedCategory === cat.value
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            "
          >
            {{ cat.emoji }} {{ cat.name }}
          </button>
        </div>

        <div class="w-full sm:w-auto">
          <select v-model="sortBy" class="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 border rounded-xl bg-white text-sm sm:text-base">
            <option value="discount">أعلى خصم</option>
            <option value="price-low">السعر: من الأقل للأعلى</option>
            <option value="price-high">السعر: من الأعلى للأقل</option>
          </select>
        </div>
      </div>

      <!-- Products Grid -->
      <div
        v-if="loading"
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8"
      >
        <div v-for="n in 8" :key="n" class="animate-pulse">
          <div class="bg-gray-200 rounded-xl sm:rounded-2xl h-64 sm:h-80"></div>
        </div>
      </div>

      <div
        v-else-if="filteredOffers.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8"
      >
        <div
          v-for="product in filteredOffers"
          :key="product.id"
          class="group relative bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
        >
          <!-- Discount Badge -->
          <div class="absolute top-2 sm:top-4 left-2 sm:left-4 z-10">
            <div
              class="bg-gradient-to-r from-red-600 to-orange-500 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-sm font-bold shadow-lg"
            >
              -{{ product.discount }}% 🔥
            </div>
          </div>

          <!-- Save Amount Badge - Hidden on mobile -->
          <div class="absolute top-2 sm:top-4 right-2 sm:right-4 z-10 hidden sm:block">
            <div
              class="bg-green-500 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-sm font-bold shadow-lg"
            >
              وفر {{ formatPrice(product.old_price - product.price) }} ج
            </div>
          </div>

          <!-- Product Image -->
          <div
            class="relative overflow-hidden h-40 sm:h-48 md:h-56 lg:h-64 bg-gray-100 cursor-pointer"
            @click="goToProduct(product.id)"
          >
            <img
              :src="getProductImage(product)"
              :alt="product.name"
              class="w-full h-full object-contain p-2 sm:p-4 group-hover:scale-110 transition duration-500"
            />
            <!-- Quick View Overlay - Hidden on mobile -->
            <div
              class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition items-center justify-center hidden sm:flex"
            >
              <button
                class="bg-white text-gray-900 px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold transform translate-y-4 group-hover:translate-y-0 transition text-sm"
              >
                عرض سريع 👁️
              </button>
            </div>
          </div>

          <!-- Product Info -->
          <div class="p-3 sm:p-5">
            <div class="mb-1 sm:mb-2">
              <span
                class="text-[10px] sm:text-xs text-gray-500 bg-gray-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full"
              >
                {{ getCategoryName(product.category) }}
              </span>
            </div>

            <h3
              class="font-bold text-sm sm:text-base md:text-lg mb-1 sm:mb-2 line-clamp-2 group-hover:text-red-600 transition cursor-pointer"
              @click="goToProduct(product.id)"
            >
              {{ product.name }}
            </h3>

            <!-- Rating -->
            <div class="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3">
              <div class="flex items-center gap-0.5">
                <span v-for="i in 5" :key="i" class="text-yellow-400 text-xs sm:text-base">
                  {{ i <= (product.rating || 4.5) ? "★" : "☆" }}
                </span>
              </div>
              <span class="text-[10px] sm:text-xs text-gray-500"
                >({{ product.reviews_count || 0 }})</span
              >
            </div>

            <!-- Price -->
            <div class="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-4">
              <span class="text-base sm:text-xl md:text-2xl font-bold text-red-600"
                >{{ formatPrice(product.price) }} ج</span
              >
              <span class="text-[10px] sm:text-xs text-gray-400 line-through"
                >{{ formatPrice(product.old_price) }} ج</span
              >
            </div>

            <!-- Progress Bar for Limited Stock -->
            <div v-if="product.stock && product.stock < 20" class="mb-3 sm:mb-4">
              <div class="flex justify-between text-[10px] sm:text-xs mb-1">
                <span class="text-red-600">🔥 باقي كمية محدودة</span>
                <span>{{ product.stock }} قطعة فقط</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                <div
                  class="bg-red-600 h-1.5 sm:h-2 rounded-full transition-all duration-500"
                  :style="{ width: `${(product.stock / 20) * 100}%` }"
                ></div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-1 sm:gap-2">
              <button
                @click="addToCart(product)"
                class="flex-1 bg-gradient-to-r from-red-600 to-orange-500 text-white py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl hover:shadow-lg transition font-medium text-xs sm:text-sm"
              >
                🛒 أضف للسلة
              </button>
              <button
                @click="toggleWishlist(product)"
                class="px-2 sm:px-4 py-1.5 sm:py-2.5 border-2 border-gray-300 rounded-lg sm:rounded-xl hover:border-red-500 hover:text-red-500 transition text-sm sm:text-base"
                :class="
                  isInWishlist(product.id)
                    ? 'text-red-500 border-red-500 bg-red-50'
                    : ''
                "
              >
                {{ isInWishlist(product.id) ? "❤️" : "🤍" }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div v-else class="text-center py-16 sm:py-20">
        <div class="text-7xl sm:text-9xl mb-3 sm:mb-4">🎯</div>
        <h2 class="text-2xl sm:text-3xl font-bold mb-2">لا توجد عروض حالياً</h2>
        <p class="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">ترقبوا عروضنا القادمة!</p>
        <NuxtLink
          to="/"
          class="inline-block bg-red-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl hover:bg-red-700 text-sm sm:text-base"
        >
          تسوق الآن
        </NuxtLink>
      </div>
    </div>

    <FooterComponent />
    <ToastNotification :toast="toast" @close="toast.show = false" />
  </div>
</template>

<script setup>
import { useCartStore } from "~/stores/cart";
import { useWishlistStore } from "~/stores/wishlist";

import { supabase } from '~/lib/supabase';
const cartStore = useCartStore();
const wishlistStore = useWishlistStore();

// State
const products = ref([]);
const loading = ref(true);
const searchQuery = ref("");
const selectedCategory = ref("all");
const sortBy = ref("discount");
const toast = ref({ show: false, message: "", type: "success" });

// Countdown Timer
const days = ref(0);
const hours = ref(0);
const minutes = ref(0);
const seconds = ref(0);

const categories = [
  { name: "الأجهزة الكهربائية", value: "electrical", emoji: "⚡" },
  { name: "الأدوات المنزلية", value: "home", emoji: "🏠" },
  { name: "البلاستيك", value: "plastic", emoji: "🪑" },
];

// Computed
const offers = computed(() => {
  return products.value.filter((p) => p.discount && p.discount > 0);
});

const filteredOffers = computed(() => {
  let list = [...offers.value];

  // Filter by category
  if (selectedCategory.value !== "all") {
    list = list.filter((p) => p.category === selectedCategory.value);
  }

  // Sort
  if (sortBy.value === "discount") {
    list.sort((a, b) => (b.discount || 0) - (a.discount || 0));
  } else if (sortBy.value === "price-low") {
    list.sort((a, b) => a.price - b.price);
  } else if (sortBy.value === "price-high") {
    list.sort((a, b) => b.price - a.price);
  }

  return list;
});

// Methods
const formatPrice = (price) => {
  if (!price) return "0";
  return new Intl.NumberFormat("ar-EG").format(price);
};

const getCategoryName = (categoryValue) => {
  const categories = {
    electrical: "أجهزة كهربائية",
    home: "أدوات منزلية",
    plastic: "بلاستيك",
  };
  return categories[categoryValue] || categoryValue;
};

const getProductImage = (product) => {
  if (product.images && product.images.length > 0) {
    return product.images[0];
  }
  return product.image_url || "/images/placeholder.jpg";
};

const goToProduct = (id) => {
  navigateTo(`/products/${id}`);
};

const isInWishlist = (productId) => {
  return wishlistStore.items.some((item) => item.id === productId);
};

const toggleWishlist = (product) => {
  if (isInWishlist(product.id)) {
    wishlistStore.removeItem(product.id);
    showToast("❌ تم إزالة من المفضلة", "info");
  } else {
    wishlistStore.addItem(product);
    showToast("❤️ تم إضافة للمفضلة", "success");
  }
};

const addToCart = (product) => {
  cartStore.addItem(product);
  showToast(`✅ تم إضافة ${product.name} إلى السلة`);
};

const showToast = (message, type = "success") => {
  toast.value = { show: true, message, type };
  setTimeout(() => {
    toast.value.show = false;
  }, 3000);
};

// Countdown Timer Function
const startCountdown = () => {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 7); // العروض تنتهي بعد 7 أيام

  const timer = setInterval(() => {
    const now = new Date().getTime();
    const distance = endDate.getTime() - now;

    days.value = Math.floor(distance / (1000 * 60 * 60 * 24));
    hours.value = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    minutes.value = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    seconds.value = Math.floor((distance % (1000 * 60)) / 1000);

    if (distance < 0) {
      clearInterval(timer);
      days.value = 0;
      hours.value = 0;
      minutes.value = 0;
      seconds.value = 0;
    }
  }, 1000);
};

// Load Products
const loadProducts = async () => {
  loading.value = true;
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (!error) {
    products.value = data || [];
  }

  setTimeout(() => {
    loading.value = false;
  }, 500);
};

onMounted(() => {
  loadProducts();
  startCountdown();
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* تنسيق شريط التمرير */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: #f43f5e;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #e11d48;
}

/* منع zoom التلقائي على iOS */
@media (max-width: 640px) {
  button, select {
    font-size: 16px !important;
  }
}

/* تحسين الـ touch targets */
button, 
[role="button"] {
  min-height: 44px;
}
</style>