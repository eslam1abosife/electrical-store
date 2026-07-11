<template>
  <div
    class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6"
  >
    <div
      v-for="n in 6"
      :key="n"
      class="bg-white rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden animate-pulse"
    >
      <!-- Image Skeleton -->
      <div class="h-24 sm:h-32 lg:h-40 bg-gray-200"></div>

      <!-- Content Skeleton -->
      <div class="p-3 sm:p-4 lg:p-5 space-y-3">
        <div class="h-4 bg-gray-200 rounded w-3/4"></div>

        <div class="h-4 bg-gray-200 rounded w-1/2"></div>

        <div class="h-8 bg-gray-200 rounded-xl w-full"></div>
      </div>
    </div>
  </div>
</template>