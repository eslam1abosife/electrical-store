<!-- components/fans/FansTabs.vue -->
<template>
  <div class="flex gap-1 sm:gap-2 flex-wrap mb-4 sm:mb-6 border-b">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      @click="$emit('update:activeTab', tab.value)"
      class="px-3 sm:px-6 py-2 sm:py-3 font-medium transition text-sm sm:text-base"
      :class="
        activeTab === tab.value
          ? 'border-b-2 border-blue-600 text-blue-600'
          : 'text-gray-500'
      "
    >
      {{ tab.icon }} {{ tab.name }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  activeTab: { type: String, required: true },
  tabs: {
    type: Array,
    default: () => [
      { name: "تسليم مراوح", value: "delivery", icon: "📦" },
      { name: "وردية يومية", value: "daily_payment", icon: "💵" },
      { name: "المحصلين", value: "collectors", icon: "👥" },
      { name: "الأقساط الشهرية", value: "installments", icon: "📋" },
      { name: "تقارير المحصلين", value: "report", icon: "📊" },
      { name: "مورد المراوح", value: "supplier", icon: "🏭" },
      { name: "مصاريف المراوح", value: "expenses", icon: "💰" },
    ],
  },
});

defineEmits(["update:activeTab"]);
</script>
