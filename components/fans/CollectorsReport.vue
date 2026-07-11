<!-- components/fans/CollectorsReport.vue -->
<template>
  <div dir="rtl" class="space-y-4 sm:space-y-6">
    <div
      v-for="collector in collectors"
      :key="collector.id"
      class="bg-white rounded-2xl shadow overflow-hidden"
    >
      <div
        class="bg-gradient-to-r from-gray-50 to-gray-100 p-3 sm:p-4 border-b"
      >
        <div
          class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
        >
          <div>
            <h2 class="text-lg sm:text-xl font-bold text-gray-800">
              {{ collector.name }}
            </h2>
            <p class="text-xs sm:text-sm text-gray-500">
              {{ collector.phone }}
            </p>
          </div>
          <div>
            <p class="text-xs sm:text-sm text-gray-500">
              المتبقي:
              <span class="text-red-600 font-bold"
                >{{
                  formatNumber(getCollectorTotalRemainingAll(collector.id))
                }}
                ج</span
              >
            </p>
          </div>
        </div>
      </div>
      <div class="p-3 sm:p-4">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div class="text-center p-2 sm:p-3 bg-blue-50 rounded-xl">
            <p class="text-xs text-gray-500">إجمالي المراوح</p>
            <p class="text-base sm:text-xl font-bold text-blue-600">
              {{ getCollectorTotalFans(collector.id) }} قطعة
            </p>
          </div>
          <div class="text-center p-2 sm:p-3 bg-green-50 rounded-xl">
            <p class="text-xs text-gray-500">إجمالي المدفوعات</p>
            <p class="text-sm sm:text-xl font-bold text-green-600 break-words">
              {{ formatNumber(getCollectorTotalPaidAll(collector.id)) }} ج
            </p>
          </div>
          <div class="text-center p-2 sm:p-3 bg-red-50 rounded-xl">
            <p class="text-xs text-gray-500">المتبقي</p>
            <p class="text-sm sm:text-xl font-bold text-red-600 break-words">
              {{ formatNumber(getCollectorTotalRemainingAll(collector.id)) }} ج
            </p>
          </div>
          <div class="text-center p-2 sm:p-3 bg-orange-50 rounded-xl">
            <p class="text-xs text-gray-500">المستحق هذا الشهر</p>
            <p class="text-sm sm:text-xl font-bold text-orange-600 break-words">
              {{ formatNumber(getCollectorDueThisMonth(collector.id)) }} ج
            </p>
          </div>
        </div>

        <h3 class="font-bold text-base sm:text-lg mb-3">💵 الورديات اليومية</h3>
        <div class="overflow-x-auto mb-6">
          <table class="w-full min-w-[400px] text-sm">
            <thead class="bg-gray-100">
              <tr>
                <th class="p-2 text-right">التاريخ</th>
                <th class="p-2 text-right">المبلغ</th>
                <th class="p-2 text-right hidden sm:table-cell">طريقة الدفع</th>
                <th class="p-2 text-right hidden md:table-cell">ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="pay in getCollectorDailyPayments(collector.id)"
                :key="pay.id"
                class="border-t"
              >
                <td class="p-2">{{ formatDate(pay.payment_date) }}</td>
                <td class="p-2 text-green-600 font-bold whitespace-nowrap">
                  {{ formatNumber(pay.amount) }} ج
                </td>
                <td class="p-2 hidden sm:table-cell">
                  {{ pay.payment_method === "cash" ? "💰 كاش" : "🏦 تحويل" }}
                </td>
                <td class="p-2 hidden md:table-cell">{{ pay.notes || "-" }}</td>
              </tr>
              <tr v-if="getCollectorDailyPayments(collector.id).length === 0">
                <td colspan="4" class="text-center py-4 text-gray-400">
                  لا توجد ورديات مسجلة
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 class="font-bold text-base sm:text-lg mb-3">📋 الأقساط الشهرية</h3>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[700px] text-sm">
            <thead class="bg-gray-100">
              <tr>
                <th class="p-2 text-right">الشهر</th>
                <th class="p-2 text-right">تاريخ الاستحقاق</th>
                <th class="p-2 text-right">المستحق</th>
                <th class="p-2 text-right">المدفوع</th>
                <th class="p-2 text-right">المتبقي</th>
                <th class="p-2 text-right hidden lg:table-cell">الحالة</th>
           
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="inst in getCollectorMonthlyInstallments(collector.id)"
                :key="inst.month_key"
                class="border-t hover:bg-gray-50"
              >
                <td class="p-2 font-bold">
                  {{ inst.month_name }} {{ inst.year }}
                </td>
                <td class="p-2 whitespace-nowrap">
                  {{ formatDate(inst.due_date) }}
                </td>
                <td class="p-2 text-blue-600 font-bold whitespace-nowrap">
                  {{ formatNumber(inst.total_amount) }} ج
                </td>
                <td class="p-2 text-green-600 whitespace-nowrap">
                  {{ formatNumber(inst.total_paid) }} ج
                </td>
                <td class="p-2 text-orange-600 font-bold whitespace-nowrap">
                  {{ formatNumber(inst.total_remaining) }} ج
                </td>
                <td class="p-2 hidden lg:table-cell">
                  <span
                    :class="
                      inst.total_remaining <= 0
                        ? 'bg-green-100 text-green-700'
                        : inst.is_late
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                    "
                    class="px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                  >
                    {{
                      inst.total_remaining <= 0
                        ? "✅ مدفوع"
                        : inst.is_late
                          ? "⚠️ متأخر"
                          : "⏳ مستحق"
                    }}
                  </span>
                </td>
             
              </tr>
              <tr
                v-if="
                  getCollectorMonthlyInstallments(collector.id).length === 0
                "
              >
                <td colspan="7" class="text-center py-4 text-gray-400">
                  لا توجد أقساط
                </td>
              </tr>
            </tbody>
            <tfoot class="bg-gray-50 font-bold">
              <tr class="border-t">
                <td colspan="2" class="p-2">📌 الإجمالي الكلي</td>
                <td class="p-2 text-blue-600 whitespace-nowrap">
                  {{ formatNumber(totalMonthlyAmount(collector.id)) }} ج
                </td>
                <td class="p-2 text-green-600 whitespace-nowrap">
                  {{ formatNumber(totalMonthlyPaid(collector.id)) }} ج
                </td>
                <td class="p-2 text-orange-600 whitespace-nowrap">
                  {{ formatNumber(totalMonthlyRemaining(collector.id)) }} ج
                </td>
               
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  collectors: { type: Array, required: true },
  userStore: { type: Object, required: true },
  getCollectorTotalFans: { type: Function, required: true },
  getCollectorTotalPaidAll: { type: Function, required: true },
  getCollectorTotalRemainingAll: { type: Function, required: true },
  getCollectorDueThisMonth: { type: Function, required: true },
  getCollectorDailyPayments: { type: Function, required: true },
  getCollectorMonthlyInstallments: { type: Function, required: true },
  totalMonthlyAmount: { type: Function, required: true },
  totalMonthlyPaid: { type: Function, required: true },
  totalMonthlyRemaining: { type: Function, required: true },
});

defineEmits(["pay-installment"]);

const formatNumber = (num) => {
  if (!num && num !== 0) return "0";
  return num.toLocaleString("ar-EG");
};

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("ar-EG");
};
</script>
