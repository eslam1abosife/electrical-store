<!-- components/fans/FansInstallmentSystem.vue -->
<template>
  <div dir="rtl" class="bg-blue-50 rounded-xl p-3 sm:p-4 mb-6 overflow-x-auto">
    <h3 class="font-bold text-sm sm:text-base mb-2">
      📋 نظام الأقساط الشهرية (5 أقساط)
    </h3>
    <div
      class="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm"
    >
      <div class="border rounded-lg p-2 text-center bg-white">
        <p class="font-bold text-blue-600">🔄 عمود / سقف</p>
        <p>سعر: 1600 ج</p>
        <p>مقدم: 100 ج</p>
        <p>الأقساط: 300 × 5 = 1500 ج</p>
      </div>
      <div class="border rounded-lg p-2 text-center bg-white">
        <p class="font-bold text-green-600">📌 حائط</p>
        <p>سعر: 1400 ج</p>
        <p>مقدم: 100 ج</p>
        <p>الأقساط: 300 × 4 + 100 = 1300 ج</p>
      </div>
      <div class="border rounded-lg p-2 text-center bg-white">
        <p class="font-bold text-purple-600">📊 ملخص</p>
        <p>المقدم: 100 ج لكل مروحة</p>
        <p>القسط الشهري: 300 × العدد (أول 4 شهور)</p>
        <p>القسط الأخير: (300 × عمود/سقف) + (100 × حائط)</p>
      </div>
    </div>
  </div>
</template>
<script setup>
// لا يوجد logic إضافي
</script>