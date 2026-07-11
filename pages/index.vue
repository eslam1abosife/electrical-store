<template>
  <div dir="rtl" class="min-h-screen bg-gray-50">
    <HeaderComponent v-model:searchQuery="searchQuery" />

    <!-- Hero Slider -->
    <HeroSlider v-if="!loading" />
    <HeroSkeleton v-else />

    <div
      class="container mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-16 sm:pb-24 space-y-12 sm:space-y-24"
    >
      <!-- Trust Bar - Responsive -->
      <div
        class="flex flex-wrap justify-center items-center gap-x-8 gap-x-12 gap-y-3 sm:gap-y-4 text-xs sm:text-sm text-gray-600 py-4 sm:py-5 border-b"
      >
        <div class="flex items-center gap-2 sm:gap-3">
          <span class="text-2xl sm:text-3xl">🛡️</span>
          <span class="hidden sm:inline">ضمان سنة كاملة</span>
          <span class="sm:hidden">ضمان سنة</span>
        </div>
        <div class="flex items-center gap-2 sm:gap-3">
          <span class="text-2xl sm:text-3xl">🚚</span>
          <span class="hidden sm:inline">توصيل خلال 48 ساعة</span>
          <span class="sm:hidden">توصيل 48 س</span>
        </div>
        <div class="flex items-center gap-2 sm:gap-3">
          <span class="text-2xl sm:text-3xl">💳</span>
          <span class="hidden sm:inline">دفع آمن 100%</span>
          <span class="sm:hidden">دفع آمن</span>
        </div>
        <div class="flex items-center gap-2 sm:gap-3">
          <span class="text-2xl sm:text-3xl">⭐</span>
          <span class="hidden sm:inline">خدمة عملاء ممتازة</span>
          <span class="sm:hidden">خدمة عملاء</span>
        </div>
      </div>

      <!-- Main Categories -->
      <div>
        <h2 class="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">
          تسوق حسب التصنيف
        </h2>
        <CategoriesSkeleton v-if="loading" />
        <div
          v-else
          class="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4"
        >
          <button
            v-for="cat in mainCategories"
            :key="cat.value"
            @click="setCategory(cat.value)"
            :class="
              activeCategory === cat.value
                ? 'ring-4 ring-blue-500 bg-blue-50 scale-105'
                : 'hover:shadow-xl hover:-translate-y-1'
            "
            class="group bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl text-center transition-all duration-300 border border-gray-100 hover:border-blue-200"
          >
            <div
              class="text-3xl sm:text-4xl md:text-5xl mb-2 sm:mb-4 group-hover:scale-110 transition"
            >
              {{ getCategoryEmoji(cat.value) }}
            </div>
            <h3 class="font-bold text-sm sm:text-base md:text-lg">
              {{ cat.name }}
            </h3>
          </button>
        </div>
      </div>

      <!-- All Products (Dynamic by Category) -->
      <div class="flex flex-col lg:flex-row gap-6 lg:gap-10">
        <!-- Products Area -->
        <div class="flex-1">
          <div
            class="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6 sm:mb-10"
          >
            <div>
              <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold">
                {{ getCategoryTitle() }}
              </h2>
              <p class="text-gray-500 mt-1 text-sm sm:text-base">
                {{ filteredProducts.length }} منتج
              </p>
            </div>

            <NuxtLink
              :to="`${activeCategory}`"
              class="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 text-sm sm:text-base"
            >
              عرض الكل
              <span
                class="transform transition-transform group-hover:translate-x-1"
                >←</span
              >
            </NuxtLink>
          </div>

          <div
            v-if="loading"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8"
          >
            <ProductCardSkeleton v-for="n in 8" :key="n" />
          </div>

          <div
            v-else
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8"
          >
            <ProductCard
              v-for="product in filteredProducts"
              :key="product.id"
              :product="product"
              @show-details="showProductDetails"
              @add-to-cart="addToCart"
            />
          </div>

          <!-- Empty State -->
          <div
            v-if="!loading && filteredProducts.length === 0"
            class="text-center py-12"
          >
            <div class="text-6xl mb-4">🔍</div>
            <h3 class="text-xl font-bold mb-2">لا توجد منتجات</h3>
            <p class="text-gray-500">لم نجد منتجات تطابق معايير البحث</p>
          </div>
        </div>
      </div>

      <!-- Special Offers -->
      <SpecialOffers
        v-if="!loading"
        :products="flashProducts"
        @show-details="showProductDetails"
      />
      <SectionSkeleton v-else title="عروض خاصة" />

      <!-- Best Sellers -->
      <ProductSection
        v-if="!loading"
        title="الأكثر مبيعاً 🔥"
        :products="bestSellers"
        viewAllLink="/best-sellers"
        @show-details="showProductDetails"
        @add-to-cart="addToCart"
      />
      <SectionSkeleton v-else title="الأكثر مبيعاً 🔥" />

      <!-- New Arrivals -->
      <ProductSection
        v-if="!loading"
        title="وصل حديثاً ✨"
        :products="newArrivals"
        viewAllLink="/new-arrivals"
        @show-details="showProductDetails"
        @add-to-cart="addToCart"
      />
      <SectionSkeleton v-else title="وصل حديثاً ✨" />
    </div>

    <FooterComponent />

    <ToastNotification :toast="toast" @close="toast.show = false" />
    <ProductModal
      v-if="selectedProduct"
      :product="selectedProduct"
      @close="selectedProduct = null"
      @add-to-cart="addToCart"
    />
  </div>
  <ChatButton />
</template>

<script setup>
import { useCartStore } from "~/stores/cart";

import { supabase } from '~/lib/supabase';
const cartStore = useCartStore();

// State
const products = ref([]);
const searchQuery = ref("");
const activeCategory = ref("electrical");
const sortBy = ref("newest");
const selectedProduct = ref(null);
const minPrice = ref(null);
const maxPrice = ref(null);
const loading = ref(true);

// Toast
const toast = ref({ show: false, message: "", type: "success" });

const mainCategories = [
  { name: "الأجهزة الكهربائية", value: "electrical" },
  { name: "الأدوات المنزلية", value: "home" },
  { name: "البلاستيك والتخزين", value: "plastic" },
];

// Computed
const filteredProducts = computed(() => {
  let list = products.value.filter((p) => {
    if (p.category !== activeCategory.value) return false;
    if (minPrice.value && p.price < minPrice.value) return false;
    if (maxPrice.value && p.price > maxPrice.value) return false;
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      return (
        p.name?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (sortBy.value === "price-low")
    list.sort((a, b) => (a.price || 0) - (b.price || 0));
  if (sortBy.value === "price-high")
    list.sort((a, b) => (b.price || 0) - (a.price || 0));

  return list;
});

const flashProducts = computed(() =>
  products.value.filter((p) => p.discount && p.discount > 0).slice(0, 4),
);
const bestSellers = computed(() => products.value.slice(0, 8));
const newArrivals = computed(() => products.value.slice(0, 8));

// Methods
const getCategoryTitle = () => {
  return (
    mainCategories.find((c) => c.value === activeCategory.value)?.name ||
    "جميع المنتجات"
  );
};

const getCategoryEmoji = (value) => {
  if (value === "electrical") return "⚡";
  if (value === "home") return "🏠";
  if (value === "plastic") return "🪑";
  return "🛍️";
};

const setCategory = (cat) => {
  activeCategory.value = cat;
};

const showProductDetails = (product) => {
  navigateTo(`/products/${product.id}`);
};

const showToast = (message, type = "success") => {
  toast.value = { show: true, message, type };
  setTimeout(() => {
    toast.value.show = false;
  }, 3000);
};

const addToCart = (product) => {
  cartStore.addItem(product);
  showToast(`✅ تم إضافة ${product.name} إلى السلة`);
};

const resetAllFilters = () => {
  searchQuery.value = "";
  minPrice.value = null;
  maxPrice.value = null;
  sortBy.value = "newest";
};

// Load Products
const loadProducts = async () => {
  loading.value = true;
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) console.error(error);
  else products.value = data || [];

  setTimeout(() => {
    loading.value = false;
  }, 850);
};

onMounted(() => {
  loadProducts();
});
</script>

<style scoped>
/* Smooth responsive transitions */
.container {
  width: 100%;
}

@media (min-width: 640px) {
  .container {
    max-width: 640px;
  }
}

@media (min-width: 768px) {
  .container {
    max-width: 768px;
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 1024px;
  }
}

@media (min-width: 1280px) {
  .container {
    max-width: 1280px;
  }
}

/* Improve touch targets on mobile */
@media (max-width: 768px) {
  button,
  [role="button"],
  .cursor-pointer {
    min-height: 44px;
  }
}
</style>
