<template>
  <div class="mb-16">
    <div class="flex items-end justify-between mb-8">
      <h2 class="text-3xl font-bold text-gray-900">{{ title }}</h2>
      
      <!-- زرار عرض الكل الديناميكي -->
      <NuxtLink 
        :to="viewAllLink"
        class="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 group"
      >
        عرض الكل 
        <span class="group-hover:translate-x-1 transition">→</span>
      </NuxtLink>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-7">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
        @show-details="$emit('show-details', product)"
        @add-to-cart="$emit('add-to-cart', product)"
      />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  products: Array,
  viewAllLink: { 
    type: String, 
    default: "/products" 
  }
})

defineEmits(['show-details', 'add-to-cart'])
</script>