<template>
  <div dir="rtl" v-if="toast.show" 
    class="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[10000] transition-all duration-300">
    <div :class="toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'" 
      class="text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-3">
      <span class="text-2xl">{{ toast.type === 'success' ? '✅' : '❌' }}</span>
      <p class="font-medium">{{ toast.message }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  toast: Object
})
defineEmits(['close'])
</script>