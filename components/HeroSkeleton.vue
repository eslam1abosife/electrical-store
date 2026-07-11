<template>
  <div
    class="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gray-200 animate-pulse
           h-[220px] sm:h-[320px] md:h-[420px] lg:h-[520px]"
  >
    <!-- Background -->
    <div
      class="absolute inset-0 bg-gradient-to-r from-gray-300 via-gray-200 to-gray-300"
    ></div>

    <!-- Content -->
    <div
      class="absolute bottom-6 sm:bottom-10 lg:bottom-16 left-4 sm:left-8 lg:left-16 right-4"
    >
      <!-- Title -->
      <div
        class="h-6 sm:h-8 lg:h-12 bg-gray-300 rounded-xl sm:rounded-2xl
               w-48 sm:w-72 lg:w-96"
      ></div>

      <!-- Subtitle -->
      <div
        class="mt-3 h-4 sm:h-5 lg:h-6 bg-gray-300 rounded-xl
               w-32 sm:w-48 lg:w-64"
      ></div>

      <!-- Button -->
      <div
        class="mt-5 h-10 sm:h-12 bg-gray-300 rounded-xl
               w-28 sm:w-36"
      ></div>
    </div>
  </div>
</template>