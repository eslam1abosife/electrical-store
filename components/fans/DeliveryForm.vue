<!-- components/fans/DeliveryForm.vue -->
<template>
  <div dir="rtl" class="bg-white rounded-2xl shadow p-4 sm:p-6">
    <h2 class="text-lg sm:text-xl font-bold mb-6">📦 تسليم مراوح لمحصل</h2>
    <form
      @submit.prevent="$emit('save-delivery')"
      class="space-y-4 sm:space-y-6"
    >
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">اختر المحصل *</label>
          <select
            v-model="delivery.collector_id"
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
          <label class="block text-sm font-medium mb-1">تاريخ التسليم</label>
          <input
            v-model="delivery.delivery_date"
            type="date"
            class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
          />
        </div>
      </div>

      <div class="border rounded-xl p-3 sm:p-4 bg-blue-50">
        <h3 class="font-bold text-base sm:text-lg mb-3 text-blue-600">
          🔄 مراوح عمود (سعر: 1600 ج - مقدم: 100 ج - قسط: 300 ج × 5)
        </h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">الكمية</label>
            <input
              v-model.number="delivery.standing_fans_quantity"
              type="number"
              min="0"
              @input="$emit('calculate-totals')"
              class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">الإجمالي</label>
            <input
              :value="formatNumber(delivery.standing_fans_total)"
              readonly
              class="w-full p-2.5 sm:p-3 border rounded-xl bg-gray-100 text-sm"
            />
          </div>
        </div>
      </div>

      <div class="border rounded-xl p-3 sm:p-4 bg-green-50">
        <h3 class="font-bold text-base sm:text-lg mb-3 text-green-600">
          📌 مراوح حائط (سعر: 1400 ج - مقدم: 100 ج - قسط: 300 ج × 4 + 100 ج)
        </h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">الكمية</label>
            <input
              v-model.number="delivery.wall_fans_quantity"
              type="number"
              min="0"
              @input="$emit('calculate-totals')"
              class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">الإجمالي</label>
            <input
              :value="formatNumber(delivery.wall_fans_total)"
              readonly
              class="w-full p-2.5 sm:p-3 border rounded-xl bg-gray-100 text-sm"
            />
          </div>
        </div>
      </div>

      <div class="border rounded-xl p-3 sm:p-4 bg-purple-50">
        <h3 class="font-bold text-base sm:text-lg mb-3 text-purple-600">
          🌀 مراوح سقف (سعر: 1600 ج - مقدم: 100 ج - قسط: 300 ج × 5)
        </h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">الكمية</label>
            <input
              v-model.number="delivery.ceiling_fans_quantity"
              type="number"
              min="0"
              @input="$emit('calculate-totals')"
              class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">الإجمالي</label>
            <input
              :value="formatNumber(delivery.ceiling_fans_total)"
              readonly
              class="w-full p-2.5 sm:p-3 border rounded-xl bg-gray-100 text-sm"
            />
          </div>
        </div>
      </div>

      <div class="bg-gray-100 rounded-xl p-3 sm:p-4">
        <h3 class="font-bold text-base sm:text-lg mb-3">📊 ملخص التسليم</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div>
            <p class="text-xs sm:text-sm text-gray-600">إجمالي المراوح</p>
            <p class="text-lg sm:text-2xl font-bold text-blue-600">
              {{ totalFansToday }} قطعة
            </p>
          </div>
          <div>
            <p class="text-xs sm:text-sm text-gray-600">إجمالي قيمة المراوح</p>
            <p
              class="text-base sm:text-xl md:text-2xl font-bold text-green-600 break-words"
            >
              {{ formatNumber(delivery.total_delivery) }} ج
            </p>
          </div>
          <div>
            <p class="text-xs sm:text-sm text-gray-600">
              المبلغ المدفوع (مقدم)
            </p>
            <input
              v-model.number="delivery.paid_amount"
              type="number"
              @input="$emit('calculate-totals')"
              class="w-full p-1.5 sm:p-2 border rounded-lg text-sm font-bold text-green-600"
            />
            <p class="text-xs text-gray-500">المقدم: 100 ج لكل مروحة</p>
          </div>
          <div>
            <p class="text-xs sm:text-sm text-gray-600">المتبقي للتقسيط</p>
            <p
              class="text-base sm:text-xl md:text-2xl font-bold text-orange-600 break-words"
            >
              {{ formatNumber(delivery.remaining_amount) }} ج
            </p>
            <p class="text-xs text-gray-500">
              قسط 300 × العدد (أول 4 شهور) + قسط أخير مختلف
            </p>
          </div>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">ملاحظات</label>
        <textarea
          v-model="delivery.notes"
          rows="2"
          class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
        ></textarea>
      </div>

      <button
        v-if="userStore?.canEdit"
        type="submit"
        :disabled="deliveryLoading"
        class="bg-blue-600 text-white px-4 sm:px-8 py-2.5 sm:py-3 rounded-xl hover:bg-blue-700 w-full text-sm sm:text-base"
      >
        {{
          deliveryLoading ? "جاري الحفظ..." : "✅ تسليم المراوح وإنشاء الأقساط"
        }}
      </button>
    </form>
  </div>
</template>

<script setup>
defineProps({
  collectors: { type: Array, required: true },
  delivery: { type: Object, required: true },
  deliveryLoading: { type: Boolean, default: false },
  totalFansToday: { type: Number, default: 0 },
  userStore: { type: Object, required: true },
});

defineEmits(["save-delivery", "calculate-totals"]);

const formatNumber = (num) => {
  if (!num && num !== 0) return "0";
  return num.toLocaleString("ar-EG");
};
</script>
