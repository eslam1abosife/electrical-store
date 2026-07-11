<template>
  <div dir="rtl" class="mb-16">
    <div class="h-10 w-80 bg-gray-200 rounded-2xl animate-pulse mb-8"></div>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
      <ProductCardSkeleton v-for="n in 4" :key="n" />
    </div>
  </div>
</template>