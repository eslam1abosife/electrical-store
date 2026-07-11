<!-- components/fans/CollectorsList.vue -->
<template>
  <div dir="rtl" class="bg-white rounded-2xl shadow overflow-hidden">
    <div
      class="p-3 sm:p-4 border-b bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
    >
      <h2 class="text-lg sm:text-xl font-bold">👥 قائمة المحصلين</h2>
      <button
        v-if="userStore?.canEdit"
        @click="$emit('show-collector-modal')"
        class="bg-green-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm w-full sm:w-auto"
      >
        ➕ إضافة محصل
      </button>
    </div>

    <!-- Mobile Cards -->
    <div class="block md:hidden divide-y">
      <div
        v-for="collector in collectors"
        :key="collector.id"
        class="p-4 hover:bg-gray-50"
      >
        <div class="flex justify-between items-start mb-2">
          <p class="font-medium text-sm">{{ collector.name }}</p>
          <p class="text-xs text-gray-500">{{ collector.phone || "-" }}</p>
        </div>
        <div class="grid grid-cols-2 gap-2 text-xs mb-3">
          <div>
            <span class="text-gray-500">المراوح:</span
            ><span class="font-bold mr-1"
              >{{ getCollectorTotalFans(collector.id) }} قطعة</span
            >
          </div>
          <div>
            <span class="text-gray-500">المدفوعات:</span
            ><span class="text-green-600 font-bold mr-1"
              >{{
                formatNumber(getCollectorTotalPaidAll(collector.id))
              }}
              ج</span
            >
          </div>
          <div>
            <span class="text-gray-500">المتبقي:</span
            ><span class="text-red-600 font-bold mr-1"
              >{{
                formatNumber(getCollectorTotalRemainingAll(collector.id))
              }}
              ج</span
            >
          </div>
          <div>
            <span class="text-gray-500">المستحق هذا الشهر:</span
            ><span class="text-orange-600 font-bold mr-1"
              >{{
                formatNumber(getCollectorDueThisMonth(collector.id))
              }}
              ج</span
            >
          </div>
        </div>
        <div class="flex gap-2">
          <button
            @click="$emit('view-collector', collector.id)"
            class="flex-1 bg-green-50 text-green-600 py-1.5 rounded-lg text-xs"
          >
            👁️ عرض
          </button>
          <button
            v-if="userStore?.canEdit"
            @click="$emit('edit-collector', collector)"
            class="flex-1 bg-blue-50 text-blue-600 py-1.5 rounded-lg text-xs"
          >
            ✏️ تعديل
          </button>
          <button
            v-if="userStore?.canEdit"
            @click="$emit('delete-collector', collector.id)"
            class="flex-1 bg-red-50 text-red-600 py-1.5 rounded-lg text-xs"
          >
            🗑️ حذف
          </button>
        </div>
      </div>
    </div>

    <!-- Desktop Table -->
    <div class="hidden md:block overflow-x-auto">
      <table class="w-full min-w-[800px]">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-3 text-right text-sm">الاسم</th>
            <th class="p-3 text-right text-sm">الهاتف</th>
            <th class="p-3 text-right text-sm">إجمالي المراوح</th>
            <th class="p-3 text-right text-sm">إجمالي المدفوعات</th>
            <th class="p-3 text-right text-sm">المتبقي</th>
            <th class="p-3 text-right text-sm hidden lg:table-cell">
              المستحق هذا الشهر
            </th>
            <th class="p-3 text-right text-sm">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="collector in collectors"
            :key="collector.id"
            class="border-t"
          >
            <td class="p-3 font-medium text-sm">{{ collector.name }}</td>
            <td class="p-3 text-sm">{{ collector.phone || "-" }}</td>
            <td class="p-3 text-sm">
              {{ getCollectorTotalFans(collector.id) }} قطعة
            </td>
            <td class="p-3 text-green-600 text-sm whitespace-nowrap">
              {{ formatNumber(getCollectorTotalPaidAll(collector.id)) }} ج
            </td>
            <td class="p-3 text-red-600 font-bold text-sm whitespace-nowrap">
              {{ formatNumber(getCollectorTotalRemainingAll(collector.id)) }} ج
            </td>
            <td
              class="p-3 text-orange-600 text-sm hidden lg:table-cell whitespace-nowrap"
            >
              {{ formatNumber(getCollectorDueThisMonth(collector.id)) }} ج
            </td>
            <td class="p-3">
              <div class="flex gap-2">
                <button
                  @click="$emit('view-collector', collector.id)"
                  class="text-green-600 hover:text-green-800"
                  title="لوحة المحصل"
                >
                  👁️
                </button>
                <button
                  v-if="userStore?.canEdit"
                  @click="$emit('edit-collector', collector)"
                  class="text-blue-600 hover:text-blue-800 ml-2"
                >
                  ✏️
                </button>
                <button
                  v-if="userStore?.canEdit"
                  @click="$emit('delete-collector', collector.id)"
                  class="text-red-600 hover:text-red-800"
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
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
});

defineEmits([
  "show-collector-modal",
  "edit-collector",
  "delete-collector",
  "view-collector",
]);

const formatNumber = (num) => {
  if (!num && num !== 0) return "0";
  return num.toLocaleString("ar-EG");
};
</script>
