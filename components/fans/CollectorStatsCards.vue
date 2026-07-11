<!-- components/fans/CollectorStatsCards.vue -->
<template>
  <div dir="rtl"
    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8"
  >
    <div
      class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl shadow p-3 sm:p-5 text-white"
    >
      <div class="flex justify-between items-start">
        <div class="flex-1 min-w-0">
          <p class="text-xs sm:text-sm opacity-90">👥 عدد المحصلين</p>
          <p class="text-2xl sm:text-3xl font-bold mt-1">
            {{ collectorsCount }}
          </p>
        </div>
        <div
          class="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center text-xl sm:text-2xl shrink-0"
        >
          👥
        </div>
      </div>
    </div>
    <div
      class="bg-gradient-to-r from-green-500 to-green-600 rounded-xl sm:rounded-2xl shadow p-3 sm:p-5 text-white"
    >
      <div class="flex justify-between items-start">
        <div class="flex-1 min-w-0">
          <p class="text-xs sm:text-sm opacity-90">📦 إجمالي المراوح</p>
          <p class="text-2xl sm:text-3xl font-bold mt-1 break-words">
            {{ totalFansDelivered }} قطعة
          </p>
        </div>
        <div
          class="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center text-xl sm:text-2xl shrink-0"
        >
          📦
        </div>
      </div>
    </div>
    <div
      class="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl sm:rounded-2xl shadow p-3 sm:p-5 text-white"
    >
      <div class="flex justify-between items-start">
        <div class="flex-1 min-w-0">
          <p class="text-xs sm:text-sm opacity-90">💰 إجمالي المدفوعات</p>
          <p class="text-xl sm:text-2xl md:text-3xl font-bold mt-1 break-words">
            {{ formatNumber(totalAllPayments) }} ج
          </p>
        </div>
        <div
          class="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center text-xl sm:text-2xl shrink-0"
        >
          💰
        </div>
      </div>
    </div>
    <div
      class="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl sm:rounded-2xl shadow p-3 sm:p-5 text-white"
    >
      <div class="flex justify-between items-start">
        <div class="flex-1 min-w-0">
          <p class="text-xs sm:text-sm opacity-90">📅 المستحق هذا الشهر</p>
          <p class="text-xl sm:text-2xl md:text-3xl font-bold mt-1 break-words">
            {{ formatNumber(totalDueThisMonth) }} ج
          </p>
        </div>
        <div
          class="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center text-xl sm:text-2xl shrink-0"
        >
          📅
        </div>
      </div>
    </div>
    <div
      class="bg-gradient-to-r from-red-500 to-red-600 rounded-xl sm:rounded-2xl shadow p-3 sm:p-5 text-white"
    >
      <div class="flex justify-between items-start">
        <div class="flex-1 min-w-0">
          <p class="text-xs sm:text-sm opacity-90">⚠️ المتبقي الكلي</p>
          <p class="text-xl sm:text-2xl md:text-3xl font-bold mt-1 break-words">
            {{ formatNumber(totalRemaining) }} ج
          </p>
        </div>
        <div
          class="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center text-xl sm:text-2xl shrink-0"
        >
          ⚠️
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  collectorsCount: { type: Number, default: 0 },
  totalFansDelivered: { type: Number, default: 0 },
  totalAllPayments: { type: Number, default: 0 },
  totalDueThisMonth: { type: Number, default: 0 },
  totalRemaining: { type: Number, default: 0 },
});

const formatNumber = (num) => {
  if (!num && num !== 0) return "0";
  return num.toLocaleString("ar-EG");
};
</script>
