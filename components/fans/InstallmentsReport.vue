<template>
  <div class="bg-white rounded-2xl shadow p-4 sm:p-6">
    <h2 class="text-lg sm:text-xl font-bold mb-6">📅 تقرير الأقساط الشهرية</h2>
    <div class="mb-6">
      <label class="block text-sm font-medium mb-1">اختر المحصل</label>
      <select
        :value="selectedCollectorId"
        @change="$emit('select-collector', $event.target.value)"
        class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
      >
        <option value="">-- اختر المحصل --</option>
        <option v-for="c in collectors" :key="c.id" :value="c.id">
          {{ c.name }}
        </option>
      </select>
    </div>

    <div
      v-if="!selectedCollectorId"
      class="text-center py-12 text-gray-400 bg-gray-50 rounded-xl"
    >
      👈 من فضلك اختر محصل من القائمة لعرض التقرير الشهري
    </div>
    <div v-else-if="processedMonthlyReport.length > 0" class="overflow-x-auto">
      <table class="w-full min-w-[800px] border rounded-lg text-sm">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-3 text-right">📅 الشهر</th>
            <th class="p-3 text-right">🔄 عمود</th>
            <th class="p-3 text-right hidden sm:table-cell">📌 حائط</th>
            <th class="p-3 text-right hidden sm:table-cell">🌀 سقف</th>
            <th class="p-3 text-right">📊 الإجمالي</th>
            <th class="p-3 text-right">💰 المستحق</th>
            <th class="p-3 text-right hidden lg:table-cell">💵 المدفوع</th>
            <th class="p-3 text-right">⚠️ المتبقي</th>
            <th class="p-3 text-right hidden md:table-cell">✅ الحالة</th>
            <th class="p-3 text-right">🛠️ إجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(month, index) in processedMonthlyReport"
            :key="index"
            class="border-t hover:bg-gray-50"
          >
            <td class="p-3 font-bold whitespace-nowrap">
              {{ month.month_name }} {{ month.year }}
            </td>
            <td class="p-3">{{ month.standing_fans }}</td>
            <td class="p-3 hidden sm:table-cell">{{ month.wall_fans }}</td>
            <td class="p-3 hidden sm:table-cell">{{ month.ceiling_fans }}</td>
            <td class="p-3 font-bold">{{ month.total_fans }}</td>
            <td class="p-3 text-blue-600 font-bold whitespace-nowrap">
              {{ formatNumber(month.amount_due) }}
            </td>
            <td
              class="p-3 text-green-600 hidden lg:table-cell whitespace-nowrap"
            >
              {{ formatNumber(month.amount_paid) }}
            </td>
            <td class="p-3 text-orange-600 font-bold whitespace-nowrap">
              {{ formatNumber(month.amount_remaining) }}
            </td>
            <td class="p-3 hidden md:table-cell">
              <span
                :class="
                  month.status === 'paid'
                    ? 'bg-green-100 text-green-700'
                    : month.is_late
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                "
                class="px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
              >
                {{
                  month.status === "paid"
                    ? "✅ مدفوع"
                    : month.is_late
                      ? "⚠️ متأخر"
                      : "⏳ مستحق"
                }}
              </span>
            </td>
            <td class="p-3">
              <div class="flex gap-1 sm:gap-2 flex-wrap">
                <button
                  v-if="month.status !== 'paid' && userStore?.canEdit"
                  @click="$emit('pay-installment', month)"
                  class="bg-green-600 text-white px-2 sm:px-3 py-1 rounded-lg text-xs hover:bg-green-700"
                >
                  💰 سداد
                </button>
                <button
                  v-if="userStore?.canEdit && month.installment_id"
                  @click="$emit('edit-installment', month)"
                  class="bg-blue-600 text-white px-2 sm:px-3 py-1 rounded-lg text-xs hover:bg-blue-700"
                >
                  ✏️ تعديل
                </button>
                <button
                  v-if="userStore?.canEdit && month.installment_id"
                  @click="$emit('delete-installment', month)"
                  class="bg-red-600 text-white px-2 sm:px-3 py-1 rounded-lg text-xs hover:bg-red-700"
                >
                  🗑️ حذف
                </button>
              </div>
            </td>
          </tr>
        </tbody>
        <tfoot class="bg-gray-50 font-bold">
          <tr class="border-t">
            <td class="p-3">📌 الإجمالي</td>
            <td class="p-3">{{ totalMonthlyReport.standing_fans }}</td>
            <td class="p-3 hidden sm:table-cell">
              {{ totalMonthlyReport.wall_fans }}
            </td>
            <td class="p-3 hidden sm:table-cell">
              {{ totalMonthlyReport.ceiling_fans }}
            </td>
            <td class="p-3">{{ totalMonthlyReport.total_fans }}</td>
            <td class="p-3 text-blue-600 whitespace-nowrap">
              {{ formatNumber(totalMonthlyReport.amount_due) }}
            </td>
            <td
              class="p-3 text-green-600 hidden lg:table-cell whitespace-nowrap"
            >
              {{ formatNumber(totalMonthlyReport.amount_paid) }}
            </td>
            <td class="p-3 text-orange-600 whitespace-nowrap">
              {{ formatNumber(totalMonthlyReport.amount_remaining) }}
            </td>
            <td colspan="2"></td>
          </tr>
        </tfoot>
      </table>
    </div>
    <div
      v-else-if="selectedCollectorId"
      class="text-center py-12 text-gray-400 bg-gray-50 rounded-xl"
    >
      📭 لا توجد أقساط لهذا المحصل<br /><span class="text-xs"
        >يرجى تسليم مراوح للمحصل أولاً</span
      >
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  collectors: { type: Array, required: true },
  selectedCollectorId: { type: String, required: true },
  monthlyReport: { type: Array, required: true },
  totalMonthlyReport: { type: Object, required: true },
  userStore: { type: Object, required: true },
});

const emit = defineEmits([
  "select-collector",
  "pay-installment",
  "edit-installment",
  "delete-installment",
]);

const formatNumber = (num) => {
  if (!num && num !== 0) return "0";
  return num.toLocaleString("ar-EG");
};

// ✅ معالجة البيانات للتأكد من وجود installment_id
const processedMonthlyReport = computed(() => {
  return props.monthlyReport.map((month) => ({
    ...month,
    // ✅ التأكد من وجود installment_id
    installment_id:
      month.installment_id ||
      (month.installment_ids && month.installment_ids[0]) ||
      null,
    installment_ids: month.installment_ids || [],
  }));
});
</script>
