<template>
  <div dir="rtl" class="min-h-screen bg-gray-50">
    <HeaderComponent v-model:searchQuery="searchQuery" />

    <div class="container mx-auto px-4 py-6 sm:py-10">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 sm:mb-10">
        <div>
          <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold">جميع المنتجات</h1>
          <p class="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-base">{{ filteredProducts.length }} منتج متاح</p>
        </div>
        
        <div class="flex gap-3 sm:gap-4 w-full md:w-auto">
          <select v-model="sortBy" class="border border-gray-300 rounded-full px-4 sm:px-6 py-2 sm:py-3 bg-white text-sm sm:text-base flex-1 md:flex-none">
            <option value="newest">الأحدث أولاً</option>
            <option value="price-low">السعر: منخفض → عالي</option>
            <option value="price-high">السعر: عالي → منخفض</option>
          </select>
          
          <!-- Mobile Filter Button -->
          <button 
            @click="mobileFiltersOpen = true"
            class="lg:hidden border border-gray-300 rounded-full px-4 sm:px-6 py-2 sm:py-3 bg-white flex items-center gap-2"
          >
            <span class="text-lg">🔍</span>
            <span class="text-sm">فلتر</span>
          </button>
        </div>
      </div>

      <!-- Sidebar + Products -->
      <div class="flex gap-6 lg:gap-10">
        <!-- Filters Sidebar - Desktop -->
        <div class="hidden lg:block w-72 flex-shrink-0">
          <div class="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 sticky top-28 shadow">
            <h3 class="font-bold text-xl sm:text-2xl mb-5 sm:mb-8">فلاتر</h3>
            
            <div class="mb-6 sm:mb-10">
              <h4 class="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">نطاق السعر</h4>
              <div class="flex gap-3 sm:gap-4">
                <div class="flex-1">
                  <label class="text-xs text-gray-500 mb-1 block">من</label>
                  <input v-model="minPrice" type="number" placeholder="0" class="border rounded-xl px-3 sm:px-5 py-2.5 sm:py-4 w-full text-sm" />
                </div>
                <div class="flex-1">
                  <label class="text-xs text-gray-500 mb-1 block">إلى</label>
                  <input v-model="maxPrice" type="number" placeholder="10000" class="border rounded-xl px-3 sm:px-5 py-2.5 sm:py-4 w-full text-sm" />
                </div>
              </div>
            </div>

            <button @click="resetFilters" class="w-full py-3 sm:py-4 text-red-600 border border-red-200 rounded-xl sm:rounded-2xl hover:bg-red-50 transition text-sm sm:text-base">
              مسح الفلاتر
            </button>
          </div>
        </div>

        <!-- Products Grid -->
        <div class="flex-1">
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            <ProductCard
              v-for="product in filteredProducts"
              :key="product.id"
              :product="product"
              @show-details="showProductDetails"
              @add-to-cart="addToCart"
            />
          </div>

          <div v-if="filteredProducts.length === 0" class="text-center py-16 sm:py-20">
            <p class="text-5xl sm:text-6xl mb-4 sm:mb-6">😕</p>
            <p class="text-xl sm:text-2xl text-gray-600">لا توجد منتجات مطابقة</p>
            <button @click="resetFilters" class="mt-4 sm:mt-6 text-blue-600 hover:text-blue-700 text-sm sm:text-base">
              مسح جميع الفلاتر
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Filters Drawer -->
    <Transition name="drawer">
      <div v-if="mobileFiltersOpen" class="fixed inset-0 z-50 lg:hidden">
        <!-- Overlay -->
        <div class="fixed inset-0 bg-black/50" @click="mobileFiltersOpen = false"></div>
        
        <!-- Drawer Content -->
        <div class="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl overflow-y-auto">
          <div class="p-4 sm:p-6">
            <div class="flex justify-between items-center mb-6">
              <h3 class="font-bold text-xl">الفلاتر</h3>
              <button @click="mobileFiltersOpen = false" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            
            <div class="mb-6">
              <h4 class="font-semibold mb-3">نطاق السعر</h4>
              <div class="flex gap-3">
                <input v-model="minPrice" type="number" placeholder="من" class="border rounded-xl px-4 py-3 w-full text-sm" />
                <input v-model="maxPrice" type="number" placeholder="إلى" class="border rounded-xl px-4 py-3 w-full text-sm" />
              </div>
            </div>

            <button @click="resetFiltersMobile" class="w-full py-3 text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition text-sm">
              مسح الفلاتر
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <ToastNotification :toast="toast" @close="toast.show = false" />
    <ProductModal
      v-if="selectedProduct"
      :product="selectedProduct"
      @close="selectedProduct = null"
      @add-to-cart="addToCart"
    />
  </div>
</template>

<script setup>
import { useCartStore } from "~/stores/cart"

const supabase = useSupabaseClient()
const cartStore = useCartStore()

const products = ref([])
const searchQuery = ref("")
const sortBy = ref("newest")
const minPrice = ref(null)
const maxPrice = ref(null)
const selectedProduct = ref(null)
const mobileFiltersOpen = ref(false)
const toast = ref({ show: false, message: "", type: "success" })

const loadProducts = async () => {
  const { data } = await supabase.from('products').select('*')
  products.value = data || []
}

const filteredProducts = computed(() => {
  let list = products.value.filter(p => {
    if (minPrice.value && p.price < minPrice.value) return false
    if (maxPrice.value && p.price > maxPrice.value) return false
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      return p.name?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q)
    }
    return true
  })

  if (sortBy.value === "price-low") list.sort((a,b) => a.price - b.price)
  if (sortBy.value === "price-high") list.sort((a,b) => b.price - a.price)

  return list
})

const showProductDetails = (product) => selectedProduct.value = product

const addToCart = (product) => {
  cartStore.addItem(product)
  toast.value = { show: true, message: `✅ تم إضافة ${product.name} إلى السلة`, type: "success" }
  setTimeout(() => toast.value.show = false, 2500)
}

const resetFilters = () => {
  searchQuery.value = ""
  minPrice.value = null
  maxPrice.value = null
  sortBy.value = "newest"
}

const resetFiltersMobile = () => {
  resetFilters()
  mobileFiltersOpen.value = false
}

onMounted(loadProducts)
</script>

<style scoped>
/* Drawer Animation */
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.3s ease;
}

.drawer-enter-active .fixed.right-0,
.drawer-leave-active .fixed.right-0 {
  transition: transform 0.3s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from .fixed.right-0,
.drawer-leave-to .fixed.right-0 {
  transform: translateX(100%);
}

.drawer-enter-to .fixed.right-0,
.drawer-leave-from .fixed.right-0 {
  transform: translateX(0);
}

/* Remove number input arrows */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  opacity: 0.5;
}

/* Mobile optimizations */
@media (max-width: 640px) {
  select, input, button {
    font-size: 16px !important;
  }
}
</style>