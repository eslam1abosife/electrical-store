<!-- components/fans/modals/DailyPaymentModal.vue -->
<template>
  <div dir="rtl" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-md">
      <h2 class="text-lg sm:text-xl font-bold mb-4">✏️ تعديل الوردية</h2>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">التاريخ</label>
          <input 
            :value="dailyPaymentForm.payment_date" 
            @input="$emit('update:dailyPaymentForm', { ...dailyPaymentForm, payment_date: $event.target.value })" 
            type="date" 
            class="w-full p-2.5 sm:p-3 border rounded-xl text-sm" 
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">المبلغ</label>
          <input 
            :value="dailyPaymentForm.amount" 
            @input="$emit('update:dailyPaymentForm', { ...dailyPaymentForm, amount: Number($event.target.value) })" 
            type="number" 
            class="w-full p-2.5 sm:p-3 border rounded-xl text-sm" 
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">طريقة الدفع</label>
          <select 
            :value="dailyPaymentForm.payment_method" 
            @input="$emit('update:dailyPaymentForm', { ...dailyPaymentForm, payment_method: $event.target.value })" 
            class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
          >
            <option value="cash">💰 كاش</option>
            <option value="transfer">🏦 تحويل بنكي</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">ملاحظات</label>
          <textarea 
            :value="dailyPaymentForm.notes" 
            @input="$emit('update:dailyPaymentForm', { ...dailyPaymentForm, notes: $event.target.value })" 
            class="w-full p-2.5 sm:p-3 border rounded-xl text-sm" 
            rows="2"
          ></textarea>
        </div>
        <div class="bg-yellow-50 p-2 sm:p-3 rounded-lg text-xs sm:text-sm">
          ⚠️ ملاحظة: تغيير المبلغ سيؤدي إلى تحديث الأقساط تلقائياً
        </div>
        <div class="flex flex-col sm:flex-row gap-3">
          <button 
            @click="$emit('update')" 
            class="flex-1 bg-blue-600 text-white py-2.5 sm:py-3 rounded-xl hover:bg-blue-700 text-sm sm:text-base"
          >
            💾 تحديث
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
  dailyPaymentForm: { type: Object, required: true },
});
defineEmits(['close', 'update', 'update:dailyPaymentForm']);
</script>