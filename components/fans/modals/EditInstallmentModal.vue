<template>
  <div dir="rtl"
    class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
    @click.self="$emit('close')"
  >
    <div
      class="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
    >
      <h2 class="text-lg sm:text-xl font-bold mb-4">
        ✏️ تعديل قسط شهر {{ editInstallmentForm.month_name }}
        {{ editInstallmentForm.year }}
      </h2>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">تاريخ الاستحقاق</label>
          <input
            :value="editInstallmentForm.due_date"
            @input="
              $emit('update:editInstallmentForm', {
                ...editInstallmentForm,
                due_date: $event.target.value,
              })
            "
            type="date"
            class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">قيمة القسط</label>
          <input
            :value="editInstallmentForm.amount"
            @input="
              $emit('update:editInstallmentForm', {
                ...editInstallmentForm,
                amount: Number($event.target.value),
              })
            "
            type="number"
            min="0"
            class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
          />
          <p class="text-xs text-gray-500 mt-1">
            أدخل قيمة القسط (يجب أن تكون أكبر من 0)
          </p>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">المبلغ المدفوع</label>
          <input
            :value="editInstallmentForm.paid_amount"
            @input="
              $emit('update:editInstallmentForm', {
                ...editInstallmentForm,
                paid_amount: Number($event.target.value),
              })
            "
            type="number"
            min="0"
            :max="editInstallmentForm.amount"
            class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
          />
          <p class="text-xs text-gray-500 mt-1">
            الحد الأقصى: {{ formatNumber(editInstallmentForm.amount) }} ج
          </p>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">عدد المراوح</label>
          <input
            :value="editInstallmentForm.fan_quantity"
            @input="
              $emit('update:editInstallmentForm', {
                ...editInstallmentForm,
                fan_quantity: Number($event.target.value),
              })
            "
            type="number"
            min="0"
            class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
          />
        </div>
        <div class="bg-gray-50 p-3 rounded-lg text-sm">
          <div class="flex justify-between">
            <span>المتبقي:</span>
            <span
              class="font-bold"
              :class="
                editInstallmentForm.amount - editInstallmentForm.paid_amount < 0
                  ? 'text-red-600'
                  : 'text-green-600'
              "
            >
              {{
                formatNumber(
                  editInstallmentForm.amount - editInstallmentForm.paid_amount,
                )
              }}
              ج
            </span>
          </div>
          <div
            v-if="editInstallmentForm.paid_amount > editInstallmentForm.amount"
            class="text-red-600 text-xs mt-1"
          >
            ⚠️ المبلغ المدفوع أكبر من قيمة القسط!
          </div>
        </div>
        <div class="bg-yellow-50 p-3 rounded-lg text-xs sm:text-sm">
          ⚠️ ملاحظة: تعديل القسط سيؤثر على حسابات المحصل
        </div>
        <div class="flex flex-col sm:flex-row gap-3">
          <button
            @click="handleUpdate"
            :disabled="
              editInstallmentForm.paid_amount > editInstallmentForm.amount ||
              editInstallmentForm.amount <= 0
            "
            class="flex-1 bg-blue-600 text-white py-2.5 sm:py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            💾 حفظ التعديلات
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
// ✅ تعريف props بشكل صحيح
const props = defineProps({
  editInstallmentForm: { type: Object, required: true },
});

const emit = defineEmits(["close", "update", "update:editInstallmentForm"]);

const formatNumber = (num) => {
  if (!num && num !== 0) return "0";
  return num.toLocaleString("ar-EG");
};

// ✅ دالة وسيطة للتأكد من أن الـ emit بيشتغل
const handleUpdate = () => {
  console.log("🔄 تم الضغط على حفظ التعديلات");
  console.log("📦 editInstallmentForm:", props.editInstallmentForm);

  // ✅ التأكد من وجود installment_id
  if (
    !props.editInstallmentForm.installment_id &&
    !props.editInstallmentForm.id
  ) {
    console.error("❌ لا يوجد installment_id في الفورم");
    alert("⚠️ لا يوجد قسط محدد للتعديل");
    return;
  }

  emit("update");
};
</script>
