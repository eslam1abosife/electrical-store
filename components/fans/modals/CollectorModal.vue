<!-- components/fans/modals/CollectorModal.vue -->
<template>
  <div dir="rtl"
    class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
    @click.self="$emit('close')"
  >
    <div
      class="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
    >
      <h2 class="text-lg sm:text-xl font-bold mb-4">
        {{ isEditing ? "✏️ تعديل محصل" : "➕ إضافة محصل جديد" }}
      </h2>
      <div class="space-y-4">
        <input
          v-model="collectorForm.name"
          placeholder="الاسم"
          class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
        />
        <input
          v-model="collectorForm.phone"
          placeholder="رقم الهاتف"
          class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
        />
        <input
          v-model="collectorForm.address"
          placeholder="العنوان"
          class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
        />
        <textarea
          v-model="collectorForm.notes"
          placeholder="ملاحظات"
          rows="2"
          class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
        ></textarea>
        <div class="flex flex-col sm:flex-row gap-3">
          <button
            @click="$emit('save')"
            class="flex-1 bg-green-600 text-white py-2.5 sm:py-3 rounded-xl hover:bg-green-700 text-sm sm:text-base"
          >
            حفظ
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
  isEditing: { type: Boolean, default: false },
  collectorForm: { type: Object, required: true },
});
defineEmits(["close", "save"]);
</script>
