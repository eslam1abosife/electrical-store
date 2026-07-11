<!-- components/fans/modals/SupplierPaymentModal.vue -->
<template>
  <div dir="rtl"
    class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-md">
      <h2 class="text-lg sm:text-xl font-bold mb-4">💰 سداد قسط للمورد</h2>
      <div class="space-y-4">
        <div class="bg-gray-50 p-3 rounded-lg text-sm">
          <p>
            المتبقي:
            <strong class="text-orange-600"
              >{{ formatNumber(selectedSupplierPurchase?.remaining) }} ج</strong
            >
          </p>
          <p>النوع: {{ getFanTypeName(selectedSupplierPurchase?.fan_type) }}</p>
          <p>
            التاريخ: {{ formatDate(selectedSupplierPurchase?.purchase_date) }}
          </p>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">المبلغ المسدد *</label>
          <input
            :value="supplierPaymentAmount"
            @input="$emit('update:amount', Number($event.target.value))"
            type="number"
            min="1"
            :max="selectedSupplierPurchase?.remaining"
            required
            class="w-full p-2.5 sm:p-3 border rounded-xl text-lg font-bold"
          />
          <p class="text-xs text-gray-500 mt-1">
            الحد الأقصى:
            {{ formatNumber(selectedSupplierPurchase?.remaining) }} ج
          </p>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">تاريخ السداد</label>
          <input
            :value="supplierPaymentDate"
            @input="$emit('update:date', $event.target.value)"
            type="date"
            class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
          />
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
  selectedSupplierPurchase: { type: Object, default: null },
  supplierPaymentAmount: { type: Number, default: 0 },
  supplierPaymentDate: { type: String, default: "" },
});
defineEmits(["close", "pay", "update:amount", "update:date"]);

const formatNumber = (num) => {
  if (!num && num !== 0) return "0";
  return num.toLocaleString("ar-EG");
};

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("ar-EG");
};

const getFanTypeName = (type) => {
  const types = {
    standing: "🔄 عمود",
    wall: "📌 حائط",
    ceiling: "🌀 سقف",
  };
  return types[type] || type;
};
</script>
