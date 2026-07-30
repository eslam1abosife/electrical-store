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

      <!-- ==================================================== -->
      <!-- Subcategories Bar - All Categories                   -->
      <!-- ==================================================== -->
      <div v-if="!loading && dynamicSubCategories.length > 0" class="relative mb-6 sm:mb-8">
        <div class="bg-white rounded-3xl shadow-xl shadow-gray-100/50 p-4 sm:p-6 border border-gray-100">
          <div class="flex items-center gap-4 mb-3 sm:mb-4">
            <div class="flex items-center gap-2">
              <span class="text-2xl">🏷️</span>
              <span class="text-gray-700 font-bold text-base sm:text-lg">الأصناف الفرعية</span>
            </div>
            <div class="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
            <span class="text-xs text-gray-400">{{ dynamicSubCategories.length }} صنف</span>
          </div>

          <div class="flex flex-wrap items-center gap-2 sm:gap-3">
            <!-- زر الكل -->
            <button
              @click="clearSubCategory"
              :class="[
                'group relative px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300',
                !activeSubCategory
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200 scale-105'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:scale-105 hover:shadow-md'
              ]"
            >
              <span class="flex items-center gap-1 sm:gap-2">
                <span class="text-base sm:text-lg">📋</span>
                الكل
              </span>
              <span 
                v-if="!activeSubCategory"
                class="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse border-2 border-white"
              ></span>
            </button>

            <!-- الأصناف الفرعية -->
            <button
              v-for="sub in dynamicSubCategories"
              :key="sub"
              @click="setSubCategory(sub)"
              :class="[
                'group relative px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300',
                activeSubCategory === sub
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200 scale-105'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:scale-105 hover:shadow-md'
              ]"
            >
              <span class="flex items-center gap-1 sm:gap-2">
                <span class="text-base sm:text-lg">{{ getSubCategoryIcon(sub) }}</span>
                {{ getSubCategoryName(sub) }}
              </span>
              <span 
                v-if="activeSubCategory === sub"
                class="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse border-2 border-white"
              ></span>
            </button>
          </div>
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
import { supabase } from '~/lib/supabase'

const cartStore = useCartStore()

// State
const products = ref([])
const searchQuery = ref("")
const sortBy = ref("newest")
const minPrice = ref(null)
const maxPrice = ref(null)
const selectedProduct = ref(null)
const mobileFiltersOpen = ref(false)
const activeSubCategory = ref(null)
const loading = ref(true)

const toast = ref({ show: false, message: "", type: "success" })

// ============================================================
// ✅ خريطة الأصناف الفرعية - جميع الأصناف (مطابقة للداشبورد)
// ============================================================
const subCategoryMap = {
  // ============ الأجهزة الكهربائية (26 صنف) ============
  refrigerator: { name: "ثلاجة", icon: "🧊" },
  freezer: { name: "ديب فريزر (رأسي / أفقي)", icon: "❄️" },
  washing_machine: { name: "غسالة ملابس (أوتوماتيك / فوق أوتوماتيك / عادية)", icon: "🧺" },
  dryer: { name: "مجفف ملابس (دراير)", icon: "👕" },
  dishwasher: { name: "غسالة أطباق", icon: "🍽️" },
  cooker: { name: "بوتاجاز (مستقل / بلت إن)", icon: "🔥" },
  oven: { name: "فرن كهربائي / فرن بلت إن", icon: "🔥" },
  hood: { name: "شفاط مطبخ", icon: "💨" },
  microwave: { name: "ميكروويف", icon: "📡" },
  water_cooler: { name: "مبرد مياه (كولر)", icon: "💧" },
  air_conditioner: { name: "تكييف", icon: "❄️" },
  fan: { name: "مروحة (سقف / عمود / حائط)", icon: "🌀" },
  heater: { name: "دفاية", icon: "🔥" },
  tv: { name: "شاشة تلفزيون", icon: "📺" },
  iron: { name: "مكواة (بخار / عادية / عمودية)", icon: "👔" },
  vacuum_cleaner: { name: "مكنسة كهربائية", icon: "🧹" },
  blender: { name: "خلاط", icon: "🥤" },
  food_grinder: { name: "كبة طعام", icon: "🍖" },
  mixer: { name: "مضرب بيض / عجان", icon: "🥚" },
  hand_blender: { name: "هاند بلندر", icon: "🥤" },
  food_processor: { name: "محضر طعام (فود بروسيسور)", icon: "🍳" },
  air_fryer: { name: "قلاية بدون زيت (أير فراير)", icon: "🍟" },
  kettle: { name: "غلاية مياه (كاتل)", icon: "☕" },
  sandwich_maker: { name: "صانع ساندوتشات / توستر", icon: "🥪" },
  meat_grinder: { name: "مفرمة لحوم", icon: "🥩" },
  
  // ============ الأدوات المنزلية (20 صنف) ============
  china_set: { name: "طقم صيني", icon: "🍽️" },
  arcopal_set: { name: "طقم أركوبال / أركوبيركس", icon: "🍽️" },
  melamine_set: { name: "طقم ملامين", icon: "🍽️" },
  archovale_set: { name: "طقم أرشوفال", icon: "🍽️" },
  pyrex_set: { name: "طقم عشاء بايركس", icon: "🍽️" },
  pot_set: { name: "طقم حلل (جرانيت / إستانلس / تيفال / ألومنيوم / سيراميك)", icon: "🍳" },
  pan_set: { name: "طقم طاسات / مقالي", icon: "🍳" },
  oven_trays: { name: "طقم صواني فرن", icon: "🧊" },
  pressure_cooker: { name: "حلة ضغط", icon: "🍲" },
  casserole: { name: "طواجن (فخار / بايركس)", icon: "🍲" },
  cutlery_set: { name: "طقم معالق وشوك وسكاكين (شنطة معالق)", icon: "🍴" },
  serving_set: { name: "طقم توزيع (سيليكون / إستانلس / خشب)", icon: "🥄" },
  glass_set: { name: "طقم كاسات", icon: "🥤" },
  cup_set: { name: "طقم كوبايات (مياه / عصير / شاي)", icon: "☕" },
  tea_coffee_set: { name: "طقم شاي وقهوة", icon: "☕" },
  thermos: { name: "ترمس مياه وشاي", icon: "🧴" },
  serving_trays: { name: "صواني تقديم", icon: "🧊" },
  spice_set: { name: "طقم توابل", icon: "🧂" },
  dish_drainer: { name: "صفاية أطباق", icon: "🧺" },
  
  // ============ البلاستيكيات والمنظمات (19 صنف) ============
  plastic_table: { name: "ترابيزة بلاستيك", icon: "🪑" },
  plastic_chair: { name: "كرسي بلاستيك", icon: "🪑" },
  plastic_cabinet: { name: "دولاب بلاستيك (جزامة / منظم)", icon: "🗄️" },
  plastic_drawers: { name: "تربو مطبخ / حمام (أدراج بلاستيك)", icon: "🗄️" },
  laundry_basket: { name: "سبت غسيل (مغلق / مخرم)", icon: "🧺" },
  wash_basin: { name: "طبق غسيل (بانيو غسيل)", icon: "🛁" },
  washing_bucket: { name: "جردل غسيل", icon: "🪣" },
  mop_bucket: { name: "جردل بممسحة (جردل الهلال/الموب)", icon: "🧹" },
  trash_bin: { name: "سلة مهملات (باكت قمامة بأحجامها)", icon: "🗑️" },
  food_container: { name: "علب حفظ طعام (أطقم علب ثلاجة)", icon: "📦" },
  plastic_bottle: { name: "شفشق بلاستيك", icon: "🧴" },
  water_bottle: { name: "زجاجة مياه بلاستيك", icon: "💧" },
  lunch_box: { name: "لانش بوكس", icon: "🥪" },
  vegetable_basket: { name: "سبت خضار", icon: "🥬" },
  cutting_board: { name: "بلانشة تقطيع", icon: "🔪" },
  spoon_drainer: { name: "صفاية معالق", icon: "🍴" },
  broom_dustpan: { name: "جاروف ومقشة", icon: "🧹" },
  baby_bath: { name: "بانيو أطفال بلاستيك", icon: "🛁" },
    baby_bath2: { name: "بوله بلاستيك", icon: "🍳" },
    baby_chair: { name: "كرسي أطفال بلاستيك", icon: "🪑" },
    baby_seat: { name: "مقعد أطفال بلاستيك", icon: "🪑" },
    baby_toy_basket: { name: "سلة ألعاب أطفال", icon: "🧸" },
    baby_cup: { name: "مج بلاستيك للأطفال", icon: "🥤" },
    plastic_ladle: { name: "مغرفة بلاستيك", icon: "🥄" },
    plastic_strainer: { name: "مصفاة بلاستيك", icon: "🧊" },
    plastic_basin: { name: "حوض بلاستيك", icon: "🛁" },
    plastic_laundry_basket: { name: "سلة غسيل بلاستيك", icon: "🧺" },
    plastic_tool_box: { name: "علبة أدوات بلاستيك", icon: "🧰" },
    plastic_storage_box: { name: "بستله بلاستيك", icon: "📦" },
    plastic_plate: { name: "اطباق بلاستيك", icon: "🍽️" }
};

// ✅ الأصناف الفرعية الديناميكية
const dynamicSubCategories = ref([]);

// ✅ دالة جلب اسم الصنف الفرعي بالعربي
const getSubCategoryName = (value) => {
  if (!value) return "غير محدد";
  if (value === 'all' || value === 'NULL') return null;
  return subCategoryMap[value]?.name || value.replace(/_/g, " ");
};

// ✅ دالة جلب أيقونة الصنف الفرعي
const getSubCategoryIcon = (value) => {
  if (!value) return "📂";
  if (value === 'all' || value === 'NULL') return "📂";
  return subCategoryMap[value]?.icon || "📂";
};

// ✅ دالة جلب جميع الأصناف الفرعية من قاعدة البيانات
const loadDynamicSubCategories = () => {
  // جلب الأصناف الفرعية الفريدة من جميع المنتجات
  const subCategories = new Set();
  const excludedValues = ['all', 'NULL', null, undefined, ''];
  
  products.value.forEach(p => {
    if (p.sub_category) {
      const sub = p.sub_category.trim();
      if (!excludedValues.includes(sub) && sub.length > 0) {
        subCategories.add(sub);
      }
    }
  });

  // ترتيب الأصناف حسب الاسم العربي
  dynamicSubCategories.value = Array.from(subCategories).sort((a, b) => {
    const nameA = getSubCategoryName(a) || a;
    const nameB = getSubCategoryName(b) || b;
    return nameA.localeCompare(nameB);
  });

  console.log('📊 جميع الأصناف الفرعية:', dynamicSubCategories.value);
};

// Load products
const loadProducts = async () => {
  loading.value = true;
  try {
    const { data } = await supabase.from('products').select('*')
    products.value = data || []
    loadDynamicSubCategories()
  } catch (error) {
    console.error('Error loading products:', error)
    products.value = []
  } finally {
    loading.value = false
  }
}

// Computed
const filteredProducts = computed(() => {
  let list = products.value.filter(p => {
    // Filter by subcategory
    if (activeSubCategory.value && p.sub_category !== activeSubCategory.value) return false;
    if (minPrice.value && p.price < minPrice.value) return false
    if (maxPrice.value && p.price > maxPrice.value) return false
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      return p.name?.toLowerCase().includes(q) || 
             p.brand?.toLowerCase().includes(q) ||
             p.sub_category?.toLowerCase().includes(q)
    }
    return true
  })

  if (sortBy.value === "price-low") list.sort((a,b) => a.price - b.price)
  if (sortBy.value === "price-high") list.sort((a,b) => b.price - a.price)

  return list
})

// Methods
const showProductDetails = (product) => selectedProduct.value = product

const addToCart = (product) => {
  cartStore.addItem(product)
  toast.value = { 
    show: true, 
    message: `✅ تم إضافة ${product.name} إلى السلة`, 
    type: "success" 
  }
  setTimeout(() => toast.value.show = false, 2500)
}

const setSubCategory = (sub) => {
  activeSubCategory.value = sub
}

const clearSubCategory = () => {
  activeSubCategory.value = null
}

const resetFilters = () => {
  searchQuery.value = ""
  minPrice.value = null
  maxPrice.value = null
  sortBy.value = "newest"
  activeSubCategory.value = null
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

/* Animation */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Subcategories scroll on mobile */
@media (max-width: 640px) {
  .flex-wrap {
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 8px;
    -webkit-overflow-scrolling: touch;
  }
  .flex-wrap::-webkit-scrollbar {
    height: 4px;
  }
  .flex-wrap::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 10px;
  }
  .flex-wrap::-webkit-scrollbar-track {
    background: transparent;
  }
}
</style>