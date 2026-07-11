<!-- components/ProductModal.vue -->
<template>
  <div dir="rtl" class="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4" @click.self="$emit('close')">
    <div class="bg-white w-full max-w-5xl rounded-3xl max-h-[95vh] overflow-hidden flex flex-col">
      
      <!-- Header -->
      <div class="flex justify-between items-center border-b p-6 sticky top-0 bg-white z-10">
        <h2 class="text-2xl font-bold text-gray-900">{{ product.name }}</h2>
        <button @click="$emit('close')" class="text-4xl leading-none text-gray-400 hover:text-gray-600">×</button>
      </div>

      <div class="flex-1 overflow-auto p-6 md:p-8 grid md:grid-cols-2 gap-10">
        
        <!-- Image Gallery -->
        <div>
          <div class="relative rounded-3xl overflow-hidden shadow-lg mb-4">
            <img 
              :src="mainImage" 
              class="w-full h-[380px] object-cover"
              alt="main product"
            >
          </div>

          <!-- Thumbnails -->
          <div class="grid grid-cols-5 gap-3">
            <img 
              v-for="(img, i) in allImages" 
              :key="i"
              :src="img"
              @click="mainImage = img"
              class="rounded-2xl cursor-pointer border-2 transition hover:border-blue-500 h-20 object-cover"
              :class="{ 'border-blue-500 ring-2 ring-blue-200': mainImage === img }"
            >
          </div>
        </div>

        <!-- Product Info -->
        <div class="flex flex-col">
          <div class="flex items-center gap-3 mb-6">
            <div class="text-4xl font-bold text-blue-600">{{ product.price?.toLocaleString() }} ج.م</div>
            <div v-if="product.old_price" class="text-gray-400 line-through">
              {{ product.old_price.toLocaleString() }} ج.م
            </div>
          </div>

          <!-- Rating -->
          <div class="flex items-center gap-2 mb-6">
            <span class="text-yellow-400 text-2xl">★★★★☆</span>
            <span class="text-gray-500">(128 تقييم)</span>
          </div>

          <!-- Description -->
          <div class="prose prose-sm text-gray-600 mb-8" v-html="product.description || 'وصف المنتج غير متوفر حالياً.'"></div>

          <!-- Specifications -->
          <div v-if="product.specs" class="mb-8">
            <h4 class="font-semibold mb-4 text-lg">المواصفات الفنية</h4>
            <div class="space-y-3">
              <div v-for="(value, key) in product.specs" :key="key" 
                class="flex justify-between py-2 border-b">
                <span class="text-gray-600">{{ key }}</span>
                <span class="font-medium text-right">{{ value }}</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="mt-auto pt-6 border-t">
            <button 
              @click="addToCart"
              class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-5 rounded-3xl text-xl transition-all active:scale-95">
              🛒 أضف إلى السلة
            </button>
            
            <button class="w-full mt-4 border border-gray-300 py-4 rounded-3xl font-medium hover:bg-gray-50 transition">
              ❤️ أضف إلى المفضلة
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  product: { type: Object, required: true }
})

const emit = defineEmits(['close', 'add-to-cart'])

const mainImage = ref(props.product.image_url)

const allImages = computed(() => {
  if (props.product.images && Array.isArray(props.product.images)) {
    return [props.product.image_url, ...props.product.images]
  }
  return [props.product.image_url]
})

const addToCart = () => {
  emit('add-to-cart', props.product)
}
</script>