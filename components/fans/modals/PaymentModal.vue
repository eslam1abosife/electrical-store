<!-- components/fans/modals/PaymentModal.vue -->
<template>
  <div dir="rtl"
    class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-md">
      <h2 class="text-lg sm:text-xl font-bold mb-4">💰 سداد القسط</h2>
      <div class="space-y-4">
        <div class="bg-gray-50 p-3 rounded-lg text-sm">
          <p>
            قيمة القسط:
            <strong class="text-blue-600"
              >{{ formatNumber(selectedInstallment?.amount) }} ج</strong
            >
          </p>
          <p>
            تاريخ الاستحقاق: {{ formatDate(selectedInstallment?.due_date) }}
          </p>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">طريقة الدفع</label>
          <select
            :value="paymentMethod"
            @input="$emit('update:paymentMethod', $event.target.value)"
            class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
          >
            <option value="cash">💰 كاش</option>
            <option value="transfer">🏦 تحويل بنكي</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">ملاحظات</label>
          <textarea
            :value="paymentNotes"
            @input="$emit('update:paymentNotes', $event.target.value)"
            class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
            rows="2"
          ></textarea>
        </div>
        <div class="flex flex-col sm:flex-row gap-3">
          <button
            @click="$emit('pay')"
            class="flex-1 bg-green-600 text-white py-2.5 sm:py-3 rounded-xl hover:bg-green-700 text-sm sm:text-base"
          >
            تأكيد السداد
          </button>
          <button
            @click="$emit('close')"
            class="flex-1 bg-gray-200 py-2.5 sm:py-3 rounded-xl hover:bg-gray-300 text-sm sm:text-base"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  selectedInstallment: { type: Object, default: null },
  paymentMethod: { type: String, default: "cash" },
  paymentNotes: { type: String, default: "" },
});
defineEmits(["close", "pay", "update:paymentMethod", "update:paymentNotes"]);

const formatNumber = (num) => {
  if (!num && num !== 0) return "0";
  return num.toLocaleString("ar-EG");
};

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("ar-EG");
};
</script>
