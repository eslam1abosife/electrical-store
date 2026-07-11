<!-- components/fans/FansStatsCards.vue -->
<template>
  <div dir="rtl"
    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6"
  >
    <div
      class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl shadow p-3 sm:p-5 text-white"
    >
      <div class="flex justify-between items-start">
        <div class="flex-1 min-w-0">
          <p class="text-xs sm:text-sm opacity-90">
            📦 إجمالي المراوح المشتراة
          </p>
          <p class="text-2xl sm:text-3xl font-bold mt-1">
            {{ totalFansPurchased }} قطعة
          </p>
          <p class="text-xs opacity-80 mt-1">
            {{ formatNumber(totalFansPurchaseValue) }} ج
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
      class="bg-gradient-to-r from-green-500 to-green-600 rounded-xl sm:rounded-2xl shadow p-3 sm:p-5 text-white"
    >
      <div class="flex justify-between items-start">
        <div class="flex-1 min-w-0">
          <p class="text-xs sm:text-sm opacity-90">
            📤 المراوح المسلمة للمحصلين
          </p>
          <p class="text-2xl sm:text-3xl font-bold mt-1">
            {{ totalFansDeliveredToCollectors }} قطعة
          </p>
          <p class="text-xs opacity-80 mt-1">
            {{ formatNumber(totalFansDeliveredValue) }} ج
          </p>
        </div>
        <div
          class="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center text-xl sm:text-2xl shrink-0"
        >
          📤
        </div>
      </div>
    </div>

    <div
      class="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl sm:rounded-2xl shadow p-3 sm:p-5 text-white"
    >
      <div class="flex justify-between items-start">
        <div class="flex-1 min-w-0">
          <p class="text-xs sm:text-sm opacity-90">
            🏪 المراوح المتبقية في المخزن
          </p>
          <p class="text-2xl sm:text-3xl font-bold mt-1">
            {{ totalFansInStock }} قطعة
          </p>
          <p class="text-xs opacity-80 mt-1">
            {{ formatNumber(totalFansStockValue) }} ج
          </p>
        </div>
        <div
          class="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center text-xl sm:text-2xl shrink-0"
        >
          🏪
        </div>
      </div>
    </div>

    <div
      class="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl sm:rounded-2xl shadow p-3 sm:p-5 text-white"
    >
      <div class="flex justify-between items-start">
        <div class="flex-1 min-w-0">
          <p class="text-xs sm:text-sm opacity-90">💰 إجمالي المصاريف</p>
          <p class="text-2xl sm:text-3xl font-bold mt-1">
            {{ formatNumber(totalExpenses) }} ج
          </p>
          <p class="text-xs opacity-80 mt-1">موصلات + هالك</p>
        </div>
        <div
          class="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center text-xl sm:text-2xl shrink-0"
        >
          💰
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  totalFansPurchased: { type: Number, default: 0 },
  totalFansPurchaseValue: { type: Number, default: 0 },
  totalFansDeliveredToCollectors: { type: Number, default: 0 },
  totalFansDeliveredValue: { type: Number, default: 0 },
  totalFansInStock: { type: Number, default: 0 },
  totalFansStockValue: { type: Number, default: 0 },
  totalExpenses: { type: Number, default: 0 },
});

const formatNumber = (num) => {
  if (!num && num !== 0) return "0";
  return num.toLocaleString("ar-EG");
};
</script>
