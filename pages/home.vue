<template>
  <div dir="rtl" class="min-h-screen bg-gray-50">
    <HeaderComponent v-model:searchQuery="searchQuery" />

    <div class="container mx-auto px-4 py-6 sm:py-8 md:py-10">
      <div class="text-center sm:text-right">
        <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
          🏠 الأدوات المنزلية
        </h1>
        <p class="text-gray-500 text-sm sm:text-base mb-6 sm:mb-8 md:mb-10">
          أطقم سفرة - كاسات - علب حفظ طعام - حلل وطاسات - أدوات تنظيف - مفارش
        </p>
      </div>

      <!-- Loading State -->
      <div
        v-if="loading"
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8"
      >
        <ProductCardSkeleton v-for="n in 8" :key="n" />
      </div>

      <!-- Products Grid -->
      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8"
      >
        <ProductCard
          v-for="product in homeProducts"
          :key="product.id"
          :product="product"
          @show-details="showProductDetails"
          @add-to-cart="addToCart"
        />
      </div>

      <!-- Empty State -->
      <div
        v-if="!loading && homeProducts.length === 0"
        class="text-center py-16 sm:py-20"
      >
        <p class="text-5xl sm:text-6xl mb-4 sm:mb-6">🏠</p>
        <p class="text-xl sm:text-2xl text-gray-500">
          لا توجد منتجات في هذا القسم حالياً
        </p>
        <NuxtLink
          to="/"
          class="inline-block mt-4 sm:mt-6 text-blue-600 hover:text-blue-700 text-sm sm:text-base"
        >
          العودة إلى الرئيسية
        </NuxtLink>
      </div>
    </div>

    <ProductModal
      v-if="selectedProduct"
      :product="selectedProduct"
      @close="selectedProduct = null"
      @add-to-cart="addToCart"
    />
  </div>
</template>

<script setup>
import { useCartStore } from "~/stores/cart";

const supabase = useSupabaseClient();
const cartStore = useCartStore();

const products = ref([]);
const selectedProduct = ref(null);
const searchQuery = ref("");
const loading = ref(true);

const loadProducts = async () => {
  loading.value = true;
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category", "home")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading home products:", error);
  } else {
    products.value = data || [];
  }
  loading.value = false;
};

const homeProducts = computed(() => products.value);

const showProductDetails = (product) => (selectedProduct.value = product);
const addToCart = (product) => cartStore.addItem(product);

onMounted(loadProducts);
</script>

<style scoped>
/* Mobile optimizations */
@media (max-width: 640px) {
  button,
  [role="button"] {
    min-height: 44px;
  }
}

/* Better touch targets */
.product-card {
  touch-action: manipulation;
}

/* Fix for RTL */
.text-center {
  text-align: center;
}

@media (min-width: 640px) {
  .text-center {
    text-align: right;
  }
}
</style>
