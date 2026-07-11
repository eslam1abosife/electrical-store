<template>
  <div dir="rtl" class="min-h-screen bg-gray-50">
    <HeaderComponent v-model:searchQuery="searchQuery" />
    
    <div class="container mx-auto px-4 py-8 sm:py-12">
      <!-- Header -->
      <div class="mb-6 sm:mb-8">
        <h1 class="text-2xl sm:text-3xl font-bold mb-2">نتائج البحث</h1>
        <p class="text-gray-600 text-sm sm:text-base">
          عرض <span class="font-semibold text-blue-600">{{ products.length }}</span> نتيجة 
          لـ "<span class="font-semibold">{{ searchQuery }}</span>"
        </p>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
        <ProductCardSkeleton v-for="n in 8" :key="n" />
      </div>
      
      <!-- Results Grid -->
      <div v-else-if="products.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
        <ProductCard
          v-for="product in products"
          :key="product.id"
          :product="product"
          @show-details="showProductDetails"
          @add-to-cart="addToCart"
        />
      </div>
      
      <!-- Empty State -->
      <div v-else class="text-center py-16 sm:py-20 md:py-24">
        <div class="text-7xl sm:text-8xl md:text-9xl mb-3 sm:mb-4">🔍</div>
        <h2 class="text-xl sm:text-2xl md:text-3xl font-bold mb-2">لا توجد نتائج</h2>
        <p class="text-gray-600 text-sm sm:text-base max-w-md mx-auto px-4">
          لم نتمكن من العثور على منتجات تطابق "<span class="font-semibold">{{ searchQuery }}</span>"
        </p>
        <p class="text-gray-500 text-xs sm:text-sm mt-2">جرب استخدام كلمات بحث مختلفة أو تحقق من الإملاء</p>
        <NuxtLink to="/" class="inline-block mt-6 sm:mt-8 bg-blue-600 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:bg-blue-700 transition text-sm sm:text-base">
          العودة للرئيسية
        </NuxtLink>
      </div>
    </div>
    
    <FooterComponent />
  </div>
</template>

<script setup>
import { useCartStore } from "~/stores/cart";

const route = useRoute();
import { supabase } from '~/lib/supabase';
const cartStore = useCartStore();

const searchQuery = ref(route.query.q || '');
const products = ref([]);
const loading = ref(true);
const selectedProduct = ref(null);

const showProductDetails = (product) => {
  navigateTo(`/products/${product.id}`);
};

const addToCart = (product) => {
  cartStore.addItem(product);
  // يمكن إضافة toast notification هنا لو حابب
};

const loadSearchResults = async () => {
  loading.value = true;
  const query = route.query.q;
  
  if (!query || query.trim() === '') {
    products.value = [];
    loading.value = false;
    return;
  }
  
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .or(`name.ilike.%${query}%,brand.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false });
    
    if (!error) {
      products.value = data || [];
    } else {
      console.error("Search error:", error);
      products.value = [];
    }
  } catch (err) {
    console.error("Search error:", err);
    products.value = [];
  }
  
  loading.value = false;
};

// Watch for query changes
watch(() => route.query.q, (newQuery) => {
  searchQuery.value = newQuery || '';
  loadSearchResults();
}, { immediate: true });
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

/* Smooth transitions */
.transition {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}
</style>