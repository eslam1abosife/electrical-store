<template>
  <div dir="rtl" class="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm">
    <!-- Image Skeleton -->
    <div class="h-40 sm:h-52 lg:h-64 bg-gray-200 animate-pulse"></div>

    <!-- Content -->
    <div class="p-3 sm:p-4 lg:p-5">
      <!-- Title -->
      <div
        class="h-4 sm:h-5 bg-gray-200 rounded w-3/4 animate-pulse mb-3"
      ></div>

      <div class="h-4 bg-gray-200 rounded w-1/2 animate-pulse mb-4"></div>

      <!-- Rating -->
      <div class="flex items-center gap-2 mb-4">
        <div class="h-3 w-12 bg-gray-200 rounded animate-pulse"></div>

        <div class="h-3 w-8 bg-gray-200 rounded animate-pulse"></div>
      </div>

      <!-- Price -->
      <div class="mb-4">
        <div class="h-6 sm:h-7 w-24 bg-gray-200 rounded animate-pulse"></div>
      </div>

      <!-- Buttons -->
      <div class="flex gap-2">
        <div
          class="flex-1 h-10 sm:h-11 bg-gray-200 rounded-xl animate-pulse"
        ></div>

        <div
          class="w-10 sm:w-12 h-10 sm:h-11 bg-gray-200 rounded-xl animate-pulse"
        ></div>
      </div>
    </div>
  </div>
</template>
