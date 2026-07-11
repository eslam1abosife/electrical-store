<!-- components/fans/DailyPaymentForm.vue -->
<template>
  <div dir="rtl" class="bg-white rounded-2xl shadow p-4 sm:p-6">
    <h2 class="text-lg sm:text-xl font-bold mb-6">💵 تسجيل وردية يومية</h2>
    <form
      @submit.prevent="$emit('save-daily-payment')"
      class="space-y-4 sm:space-y-6"
    >
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">اختر المحصل *</label>
          <select
            v-model="dailyPayment.collector_id"
            required
            class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
          >
            <option value="">-- اختر المحصل --</option>
            <option v-for="c in collectors" :key="c.id" :value="c.id">
              {{ c.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">تاريخ الوردية</label>
          <input
            v-model="dailyPayment.payment_date"
            type="date"
            class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
          />
        </div>
      </div>

      <div
        v-if="dailyPayment.collector_id"
        class="bg-yellow-50 rounded-xl p-3 sm:p-4"
      >
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <p class="text-xs sm:text-sm text-gray-600">إجمالي المستحق عليه</p>
            <p class="text-base sm:text-xl font-bold text-red-600 break-words">
              {{ formatNumber(calculateTotalRemaining(dailyPayment.collector_id)) }} ج
            </p>
          </div>
          <div>
            <p class="text-xs sm:text-sm text-gray-600">المدفوع حتى الآن</p>
            <p
              class="text-base sm:text-xl font-bold text-green-600 break-words"
            >
              {{ formatNumber(calculateTotalPaid(dailyPayment.collector_id)) }} ج
            </p>
          </div>
          <div>
            <p class="text-xs sm:text-sm text-gray-600">المتبقي</p>
            <p
              class="text-base sm:text-xl font-bold text-orange-600 break-words"
            >
              {{
                formatNumber(
                  calculateTotalRemaining(dailyPayment.collector_id) -
                    calculateTotalPaid(dailyPayment.collector_id)
                )
              }}
              ج
            </p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1"
            >المبلغ المورد اليوم *</label
          >
          <input
            v-model.number="dailyPayment.amount"
            type="number"
            min="1"
            required
            class="w-full p-2.5 sm:p-3 border rounded-xl text-lg font-bold"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">طريقة الدفع</label>
          <select
            v-model="dailyPayment.payment_method"
            class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
          >
            <option value="cash">💰 كاش</option>
            <option value="transfer">🏦 تحويل بنكي</option>
          </select>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">ملاحظات</label>
        <textarea
          v-model="dailyPayment.notes"
          rows="2"
          class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
        ></textarea>
      </div>

      <button
        v-if="userStore?.canEdit"
        type="submit"
        :disabled="dailyPaymentLoading"
        class="bg-teal-600 text-white px-4 sm:px-8 py-2.5 sm:py-3 rounded-xl hover:bg-teal-700 w-full text-sm sm:text-base"
      >
        {{ dailyPaymentLoading ? "جاري الحفظ..." : "✅ تسجيل الوردية اليومية" }}
      </button>
    </form>

    <div v-if="selectedCollectorDailyPayments.length > 0" class="mt-8">
      <h3 class="font-bold text-base sm:text-lg mb-3">
        📋 سجل الورديات السابقة
      </h3>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[500px] text-sm">
          <thead class="bg-gray-100">
            <tr>
              <th class="p-2 text-right">التاريخ</th>
              <th class="p-2 text-right">المبلغ</th>
              <th class="p-2 text-right hidden sm:table-cell">طريقة الدفع</th>
              <th class="p-2 text-right hidden md:table-cell">ملاحظات</th>
              <th class="p-2 text-right">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="pay in selectedCollectorDailyPayments"
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
              <td class="p-2">
                <button
                  v-if="userStore?.canEdit"
                  @click="$emit('edit-daily-payment', pay)"
                  class="text-blue-600 hover:text-blue-800 ml-2"
                >
                  ✏️
                </button>
                <button
                  v-if="userStore?.canEdit"
                  @click="$emit('delete-daily-payment', pay.id)"
                  class="text-red-600 hover:text-red-800"
                >
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  collectors: { type: Array, required: true },
  dailyPayment: { type: Object, required: true },
  dailyPaymentLoading: { type: Boolean, default: false },
  selectedCollectorDailyPayments: { type: Array, default: () => [] },
  userStore: { type: Object, required: true },
  deliveries: { type: Array, default: () => [] },
  dailyPayments: { type: Array, default: () => [] },
  installments: { type: Array, default: () => [] },
});

const emit = defineEmits([
  "save-daily-payment",
  "edit-daily-payment",
  "delete-daily-payment",
]);

const formatNumber = (num) => {
  if (!num && num !== 0) return "0";
  return num.toLocaleString("ar-EG");
};

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("ar-EG");
};

// ✅ حساب إجمالي المستحق للمحصل
const calculateTotalRemaining = (collectorId) => {
  if (!collectorId) return 0;
  
  // جلب تسليمات المحصل
  const collectorDeliveries = props.deliveries.filter(
    d => d.collector_id === collectorId
  );
  
  // حساب إجمالي قيمة المراوح المسلمة
  return collectorDeliveries.reduce((sum, d) => sum + (d.total_delivery || 0), 0);
};

// ✅ حساب إجمالي المدفوع للمحصل
const calculateTotalPaid = (collectorId) => {
  if (!collectorId) return 0;
  
  // جلب تسليمات المحصل
  const collectorDeliveries = props.deliveries.filter(
    d => d.collector_id === collectorId
  );
  
  // جلب الورديات اليومية للمحصل
  const collectorDailyPayments = props.dailyPayments.filter(
    d => d.collector_id === collectorId
  );
  
  // جلب الأقساط المدفوعة للمحصل
  const collectorInstallments = props.installments.filter(
    i => i.collector_id === collectorId && i.status === 'paid'
  );
  
  // حساب إجمالي المدفوع
  const deliveryPaid = collectorDeliveries.reduce((sum, d) => sum + (d.paid_amount || 0), 0);
  const dailyPaid = collectorDailyPayments.reduce((sum, d) => sum + d.amount, 0);
  const installmentPaid = collectorInstallments.reduce((sum, i) => sum + (i.paid_amount || 0), 0);
  
  return deliveryPaid + dailyPaid + installmentPaid;
};
</script>