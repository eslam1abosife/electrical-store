<template>
  <div dir="rtl" class="min-h-screen bg-gray-50 py-6 sm:py-8 lg:py-10">
    <div class="container mx-auto px-4 max-w-7xl">

      <!-- Header -->
      <div
        class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 lg:mb-10"
      >
        <h1
          class="text-2xl sm:text-3xl lg:text-4xl font-bold flex flex-wrap items-center gap-2"
        >
          ❤️ قائمة المفضلة
          <span class="text-lg sm:text-xl text-gray-400">
            ({{ wishlistStore.totalItems }})
          </span>
        </h1>

        <button
          v-if="wishlistStore.items.length > 0"
          @click="wishlistStore.clearWishlist"
          class="text-red-500 hover:text-red-600 font-medium text-sm sm:text-base self-start sm:self-auto"
        >
          مسح الكل
        </button>
      </div>

      <!-- Empty Wishlist -->
      <div
        v-if="wishlistStore.items.length === 0"
        class="text-center py-16 sm:py-20"
      >
        <p class="text-5xl sm:text-6xl lg:text-7xl mb-4 sm:mb-6">
          ♡
        </p>

        <p
          class="text-lg sm:text-xl lg:text-2xl text-gray-500 mb-6"
        >
          قائمة المفضلة فارغة
        </p>

        <NuxtLink
          to="/"
          class="bg-blue-600 hover:bg-blue-700 transition text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl sm:rounded-3xl inline-block text-sm sm:text-base"
        >
          تصفح المنتجات
        </NuxtLink>
      </div>

      <!-- Products -->
      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
      >
        <ProductCard
          v-for="product in wishlistStore.items"
          :key="product.id"
          :product="product"
          @show-details="showProductDetails"
          @add-to-cart="addToCart"
          is-wishlist
        />
      </div>
    </div>

    <!-- Product Modal -->
    <ProductModal
      v-if="selectedProduct"
      :product="selectedProduct"
      @close="selectedProduct = null"
      @add-to-cart="addToCart"
    />
  </div>
</template>

<script setup>
import { useWishlistStore } from '~/stores/wishlist'
import { useCartStore } from '~/stores/cart'

const wishlistStore = useWishlistStore()
const cartStore = useCartStore()

const selectedProduct = ref(null)

const showProductDetails = (product) => {
  selectedProduct.value = product
}

const addToCart = (product) => {
  cartStore.addItem(product)
  alert(`✅ تم إضافة ${product.name} إلى السلة`)
}
</script>