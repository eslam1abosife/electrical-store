<!-- components/fans/FansTypeTable.vue -->
<template>
  <div dir="rtl" class="bg-white rounded-2xl shadow p-4 sm:p-6 mb-6">
    <h2 class="text-lg sm:text-xl font-bold mb-4 text-gray-800">
      📊 تفاصيل المراوح حسب النوع
    </h2>
    <div class="overflow-x-auto">
      <table class="w-full min-w-[700px] text-sm">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-3 text-right">نوع المروحة</th>
            <th class="p-3 text-right">المشتراة</th>
            <th class="p-3 text-right">مسلمة للمحصلين</th>
            <th class="p-3 text-right">المتبقية في المخزن</th>
            <th class="p-3 text-right">سعر القطعة</th>
            <th class="p-3 text-right">قيمة المخزون</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-t hover:bg-gray-50">
            <td class="p-3 font-bold text-blue-600">🔄 عمود</td>
            <td class="p-3">{{ fanStats.standing.purchased }}</td>
            <td class="p-3">{{ fanStats.standing.delivered }}</td>
            <td class="p-3 font-bold text-blue-600">
              {{ fanStats.standing.inStock }}
            </td>
            <td class="p-3">{{ formatNumber(1600) }} ج</td>
            <td class="p-3 text-green-600 font-bold">
              {{ formatNumber(fanStats.standing.inStock * 1600) }} ج
            </td>
          </tr>
          <tr class="border-t hover:bg-gray-50">
            <td class="p-3 font-bold text-green-600">📌 حائط</td>
            <td class="p-3">{{ fanStats.wall.purchased }}</td>
            <td class="p-3">{{ fanStats.wall.delivered }}</td>
            <td class="p-3 font-bold text-green-600">
              {{ fanStats.wall.inStock }}
            </td>
            <td class="p-3">{{ formatNumber(1400) }} ج</td>
            <td class="p-3 text-green-600 font-bold">
              {{ formatNumber(fanStats.wall.inStock * 1400) }} ج
            </td>
          </tr>
          <tr class="border-t hover:bg-gray-50">
            <td class="p-3 font-bold text-purple-600">🌀 سقف</td>
            <td class="p-3">{{ fanStats.ceiling.purchased }}</td>
            <td class="p-3">{{ fanStats.ceiling.delivered }}</td>
            <td class="p-3 font-bold text-purple-600">
              {{ fanStats.ceiling.inStock }}
            </td>
            <td class="p-3">{{ formatNumber(1600) }} ج</td>
            <td class="p-3 text-green-600 font-bold">
              {{ formatNumber(fanStats.ceiling.inStock * 1600) }} ج
            </td>
          </tr>
        </tbody>
        <tfoot class="bg-gray-50 font-bold">
          <tr class="border-t-2">
            <td class="p-3 text-lg">📌 الإجمالي</td>
            <td class="p-3 text-lg">{{ fanStats.total.purchased }}</td>
            <td class="p-3 text-lg">{{ fanStats.total.delivered }}</td>
            <td class="p-3 text-lg text-blue-600">
              {{ fanStats.total.inStock }}
            </td>
            <td class="p-3"></td>
            <td class="p-3 text-lg text-green-600">
              {{ formatNumber(fanStats.total.stockValue) }} ج
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script setup>
defineProps({
  fanStats: {
    type: Object,
    required: true,
    default: () => ({
      standing: { purchased: 0, delivered: 0, inStock: 0 },
      wall: { purchased: 0, delivered: 0, inStock: 0 },
      ceiling: { purchased: 0, delivered: 0, inStock: 0 },
      total: { purchased: 0, delivered: 0, inStock: 0, stockValue: 0 },
    }),
  },
});

const formatNumber = (num) => {
  if (!num && num !== 0) return "0";
  return num.toLocaleString("ar-EG");
};
</script>
