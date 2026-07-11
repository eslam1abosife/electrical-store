<template>
  <div dir="rtl" class="min-h-screen bg-gray-50">
    <HeaderComponent v-model:searchQuery="searchQuery" />
    
    <div class="container mx-auto px-4 py-6 sm:py-8 md:py-10">
      <div class="text-center sm:text-right">
        <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">✨ وصل حديثاً</h1>
        <p class="text-gray-500 text-sm sm:text-base mb-6 sm:mb-8 md:mb-10">أحدث المنتجات المضافة إلى المتجر</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
        <ProductCardSkeleton v-for="n in 8" :key="n" />
      </div>

      <!-- Products Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
        <ProductCard
          v-for="product in newArrivals"
          :key="product.id"
          :product="product"
          @show-details="showProductDetails"
          @add-to-cart="addToCart"
        />
      </div>

      <!-- Empty State -->
      <div v-if="!loading && newArrivals.length === 0" class="text-center py-16 sm:py-20">
        <p class="text-5xl sm:text-6xl mb-4 sm:mb-6">✨</p>
        <p class="text-xl sm:text-2xl text-gray-500">لا توجد منتجات جديدة حالياً</p>
        <p class="text-gray-400 text-sm sm:text-base mt-2">ترقبوا المنتجات الجديدة قريباً</p>
        <NuxtLink to="/" class="inline-block mt-4 sm:mt-6 text-blue-600 hover:text-blue-700 text-sm sm:text-base">
          العودة إلى الرئيسية
        </NuxtLink>
      </div>

      <!-- Show More Button (Optional) -->
      <div v-if="!loading && newArrivals.length > 0 && newArrivals.length >= 20" class="text-center mt-10 sm:mt-12">
        <button 
          @click="loadMore" 
          v-if="!loadingMore"
          class="px-6 sm:px-8 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-xl sm:rounded-2xl text-gray-700 hover:bg-gray-50 transition text-sm sm:text-base"
        >
          عرض المزيد 📦
        </button>
        <div v-else class="text-gray-400 text-sm">جاري التحميل...</div>
      </div>
    </div>

    <ProductModal v-if="selectedProduct" :product="selectedProduct" @close="selectedProduct = null" @add-to-cart="addToCart" />
  </div>
</template>

<script setup>
import { useCartStore } from "~/stores/cart"

import { supabase } from '~/lib/supabase'
const cartStore = useCartStore()

const products = ref([])
const selectedProduct = ref(null)
const searchQuery = ref("")
const loading = ref(true)
const loadingMore = ref(false)
const currentLimit = ref(20)

const loadProducts = async () => {
  loading.value = true
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(currentLimit.value)
  
  if (error) {
    console.error("Error loading new arrivals:", error)
  } else {
    products.value = data || []
  }
  loading.value = false
}

const loadMore = async () => {
  loadingMore.value = true
  currentLimit.value += 20
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(currentLimit.value)
  
  if (error) {
    console.error("Error loading more products:", error)
  } else {
    products.value = data || []
  }
  loadingMore.value = false
}

const newArrivals = computed(() => products.value)

const showProductDetails = (product) => selectedProduct.value = product
const addToCart = (product) => cartStore.addItem(product)

onMounted(loadProducts)
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