<!-- components/SpecialOffers.vue -->
<template>
  <div class="bg-gradient-to-r from-red-600 to-rose-600 text-white py-12 rounded-3xl my-12">
    <div class="container mx-auto px-4">
      <div class="flex flex-col md:flex-row items-center justify-between mb-8">
        <div>
          <h2 class="text-4xl font-bold">عروض خاصة محدودة الوقت 🔥</h2>
          <p class="text-xl mt-2">تسارع قبل نفاذ الكمية</p>
        </div>
        <div class="text-2xl font-mono font-bold mt-4 md:mt-0">
          تنتهي خلال: <span class="text-amber-300">02:14:35</span>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ProductCard
          v-for="product in products"
          :key="product.id"
          :product="product"
          is-offer
          @show-details="$emit('show-details', product)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  products: Array
})
defineEmits(['show-details'])
</script>