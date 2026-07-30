<template>
  <ClientOnly>
    <div dir="rtl" class="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <HeaderComponent v-model:searchQuery="searchQuery" />

      <!-- Hero Slider -->
      <HeroSlider v-if="!loading" />
      <HeroSkeleton v-else />

      <div
        class="container mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-16 sm:pb-24 space-y-12 sm:space-y-24"
      >
        <!-- Trust Bar -->
        <div
          class="flex flex-wrap justify-center items-center gap-x-8 gap-x-12 gap-y-3 sm:gap-y-4 text-xs sm:text-sm text-gray-600 py-4 sm:py-5 border-b border-gray-200"
        >
          <div class="flex items-center gap-2 sm:gap-3 bg-gray-50 px-3 sm:px-4 py-2 rounded-full">
            <span class="text-2xl sm:text-3xl">🛡️</span>
            <span class="hidden sm:inline font-medium">ضمان سنة كاملة</span>
            <span class="sm:hidden">ضمان سنة</span>
          </div>
          <div class="flex items-center gap-2 sm:gap-3 bg-gray-50 px-3 sm:px-4 py-2 rounded-full">
            <span class="text-2xl sm:text-3xl">🚚</span>
            <span class="hidden sm:inline font-medium">توصيل خلال 48 ساعة</span>
            <span class="sm:hidden">توصيل 48 س</span>
          </div>
          <div class="flex items-center gap-2 sm:gap-3 bg-gray-50 px-3 sm:px-4 py-2 rounded-full">
            <span class="text-2xl sm:text-3xl">💳</span>
            <span class="hidden sm:inline font-medium">دفع آمن 100%</span>
            <span class="sm:hidden">دفع آمن</span>
          </div>
          <div class="flex items-center gap-2 sm:gap-3 bg-gray-50 px-3 sm:px-4 py-2 rounded-full">
            <span class="text-2xl sm:text-3xl">⭐</span>
            <span class="hidden sm:inline font-medium">خدمة عملاء ممتازة</span>
            <span class="sm:hidden">خدمة عملاء</span>
          </div>
        </div>

        <!-- Main Categories -->
        <div>
          <div class="text-center mb-8 sm:mb-12">
            <h2 class="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              تسوق حسب التصنيف
            </h2>
            <p class="text-gray-500 mt-2">اختر القسم المناسب لتبدأ رحلة التسوق</p>
          </div>
          
          <CategoriesSkeleton v-if="loading" />
          <div
            v-else
            class="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6"
          >
            <button
              v-for="cat in mainCategories"
              :key="cat.value"
              @click="setCategory(cat.value)"
              :class="[
                'group relative bg-white p-6 sm:p-8 rounded-3xl text-center transition-all duration-500 border-2 overflow-hidden',
                activeCategory === cat.value
                  ? 'border-blue-500 shadow-2xl shadow-blue-100 scale-105'
                  : 'border-gray-100 hover:border-blue-200 hover:shadow-xl hover:-translate-y-2'
              ]"
            >
              <div 
                class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                :class="activeCategory === cat.value ? 'opacity-100' : ''"
                style="background: linear-gradient(135deg, rgba(59,130,246,0.05) 0%, rgba(147,51,234,0.05) 100%)"
              ></div>
              
              <div class="relative z-10">
                <div
                  class="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 inline-block"
                >
                  {{ getCategoryEmoji(cat.value) }}
                </div>
                <h3 class="font-bold text-sm sm:text-base md:text-lg text-gray-800">
                  {{ cat.name }}
                </h3>
                <p class="text-xs text-gray-400 mt-1">
                  {{ getProductCountByCategory(cat.value) }} منتج
                </p>
              
              </div>
            </button>
          </div>
        </div>

        <!-- Subcategories Infinite Marquee Slider -->
        <div v-if="!loading && dynamicSubCategories.length > 0" class="relative">
          <div class="bg-white rounded-3xl shadow-xl shadow-gray-100/50 p-6 border border-gray-100 overflow-hidden">
            <div class="flex items-center gap-4 mb-4">
              <div class="flex items-center gap-2">
                <span class="text-2xl">🏷️</span>
                <span class="text-gray-700 font-bold text-lg">جميع الأصناف الفرعية</span>
              </div>
              <div class="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
              <span class="text-xs text-gray-400">{{ dynamicSubCategories.length }} صنف</span>
            </div>

            <!-- Carousel Area -->
            <div class="relative overflow-x-auto no-scrollbar py-2">
              <div class="marquee-track flex items-center gap-3">
                
                <!-- المجموعة الأولى -->
                <div class="flex items-center gap-3 shrink-0">
                  <button
                    v-for="item in sliderBaseItems"
                    :key="'sub-1-' + item"
                    @click="handleSubClick(item)"
                    class="shrink-0 group relative px-5 sm:px-8 py-3 sm:py-4 rounded-2xl text-sm font-medium transition-all duration-300"
                    :class="[
                      isItemActive(item)
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200 scale-105'
                        : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 hover:scale-105 hover:shadow-md hover:from-blue-50 hover:to-blue-100'
                    ]"
                  >
                    <span class="flex items-center gap-2 whitespace-nowrap">
                      <span class="text-lg sm:text-xl">{{ item === 'all' ? '📋' : getSubCategoryIcon(item) }}</span>
                      <span class="font-medium">{{ item === 'all' ? 'الكل' : getSubCategoryName(item) }}</span>
                    </span>
                    <span 
                      v-if="isItemActive(item)"
                      class="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-white"
                    ></span>
                  </button>
                </div>

                <!-- المجموعة الثانية للربط اللانهائي -->
                <div class="flex items-center gap-3 shrink-0">
                  <button
                    v-for="item in sliderBaseItems"
                    :key="'sub-2-' + item"
                    @click="handleSubClick(item)"
                    class="shrink-0 group relative px-5 sm:px-8 py-3 sm:py-4 rounded-2xl text-sm font-medium transition-all duration-300"
                    :class="[
                      isItemActive(item)
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200 scale-105'
                        : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 hover:scale-105 hover:shadow-md hover:from-blue-50 hover:to-blue-100'
                    ]"
                  >
                    <span class="flex items-center gap-2 whitespace-nowrap">
                      <span class="text-lg sm:text-xl">{{ item === 'all' ? '📋' : getSubCategoryIcon(item) }}</span>
                      <span class="font-medium">{{ item === 'all' ? 'الكل' : getSubCategoryName(item) }}</span>
                    </span>
                    <span 
                      v-if="isItemActive(item)"
                      class="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-white"
                    ></span>
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>

        <!-- All Products Section -->
        <div class="flex flex-col lg:flex-row gap-6 lg:gap-10">
          <div class="flex-1">
            <div
              class="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6 sm:mb-10"
            >
              <div>
                <div class="flex items-center gap-3 flex-wrap">
                  <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">
                    {{ getCategoryTitle() }}
                  </h2>
                  <span v-if="activeSubCategory" class="text-blue-600 text-lg sm:text-xl font-medium bg-blue-50 px-3 py-1 rounded-full flex items-center gap-2">
                    <span>{{ getSubCategoryIcon(activeSubCategory) }}</span>
                    {{ getSubCategoryName(activeSubCategory) }}
                  </span>
                </div>
                <p class="text-gray-500 mt-1 text-sm sm:text-base">
                  🛍️ {{ filteredProducts.length }} منتج
                </p>
              </div>

              <NuxtLink
                :to="`/all-products`"
                class="group text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 text-sm sm:text-base bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 transition-all duration-300"
              >
                عرض الكل
                <span class="group-hover:-translate-x-1 transition-transform">←</span>
              </NuxtLink>
            </div>

            <div
              v-if="loading"
              class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8"
            >
              <ProductCardSkeleton v-for="n in 8" :key="n" />
            </div>

            <div
              v-else
              class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8"
            >
              <ProductCard
                v-for="product in filteredProducts"
                :key="product.id"
                :product="product"
                @show-details="showProductDetails"
                @add-to-cart="addToCart"
              />
            </div>

            <div
              v-if="!loading && filteredProducts.length === 0"
              class="text-center py-16"
            >
              <div class="text-7xl mb-4 animate-bounce">🔍</div>
              <h3 class="text-2xl font-bold mb-2 text-gray-800">لا توجد منتجات</h3>
              <p class="text-gray-500">لم نجد منتجات تطابق معايير البحث</p>
              <button
                @click="resetAllFilters"
                class="mt-4 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
              >
                عرض جميع المنتجات
              </button>
            </div>
          </div>
        </div>

        <!-- Special Offers -->
        <SpecialOffers
          v-if="!loading"
          :products="flashProducts"
          @show-details="showProductDetails"
        />
        <SectionSkeleton v-else title="عروض خاصة" />

        <!-- Best Sellers -->
        <ProductSection
          v-if="!loading"
          title="الأكثر مبيعاً 🔥"
          :products="bestSellers"
          viewAllLink="/best-sellers"
          @show-details="showProductDetails"
          @add-to-cart="addToCart"
        />
        <SectionSkeleton v-else title="الأكثر مبيعاً 🔥" />

        <!-- New Arrivals -->
        <ProductSection
          v-if="!loading"
          title="وصل حديثاً ✨"
          :products="newArrivals"
          viewAllLink="/new-arrivals"
          @show-details="showProductDetails"
          @add-to-cart="addToCart"
        />
        <SectionSkeleton v-else title="وصل حديثاً ✨" />
      </div>

      <FooterComponent />

      <ToastNotification :toast="toast" @close="toast.show = false" />
      <ProductModal
        v-if="selectedProduct"
        :product="selectedProduct"
        @close="selectedProduct = null"
        @add-to-cart="addToCart"
      />
    </div>
    <ChatButton />
  </ClientOnly>
</template>

<script setup>
import { useCartStore } from "~/stores/cart";
import { supabase } from '~/lib/supabase';

const cartStore = useCartStore();

// State
const products = ref([]);
const searchQuery = ref("");
const activeCategory = ref("electrical");
const activeSubCategory = ref(null);
const sortBy = ref("newest");
const selectedProduct = ref(null);
const minPrice = ref(null);
const maxPrice = ref(null);
const loading = ref(true);

// Toast
const toast = ref({ show: false, message: "", type: "success" });

// Main Categories
const mainCategories = [
  { name: "الأجهزة الكهربائية", value: "electrical", emoji: "⚡" },
  { name: "الأدوات المنزلية", value: "home", emoji: "🏠" },
  { name: "البلاستيك والتخزين", value: "plastic", emoji: "🪑" },
];

// Subcategory Map
const subCategoryMap = {
  refrigerator: { name: "ثلاجة", icon: "🧊" },
  freezer: { name: "ديب فريزر", icon: "❄️" },
  washing_machine: { name: "غسالة ملابس", icon: "🧺" },
  dryer: { name: "مجفف ملابس", icon: "👕" },
  dishwasher: { name: "غسالة أطباق", icon: "🍽️" },
  cooker: { name: "بوتاجاز", icon: "🔥" },
  oven: { name: "فرن كهربائي", icon: "🔥" },
  hood: { name: "شفاط مطبخ", icon: "💨" },
  microwave: { name: "ميكروويف", icon: "📡" },
  water_cooler: { name: "مبرد مياه", icon: "💧" },
  air_conditioner: { name: "تكييف", icon: "❄️" },
  fan: { name: "مروحة", icon: "🌀" },
  heater: { name: "دفاية", icon: "🔥" },
  tv: { name: "شاشة تلفزيون", icon: "📺" },
  iron: { name: "مكواة", icon: "👔" },
  vacuum_cleaner: { name: "مكنسة كهربائية", icon: "🧹" },
  blender: { name: "خلاط", icon: "🥤" },
  food_grinder: { name: "كبة طعام", icon: "🍖" },
  mixer: { name: "مضرب بيض / عجان", icon: "🥚" },
  hand_blender: { name: "هاند بلندر", icon: "🥤" },
  food_processor: { name: "محضر طعام", icon: "🍳" },
  air_fryer: { name: "قلاية بدون زيت", icon: "🍟" },
  kettle: { name: "غلاية مياه", icon: "☕" },
  sandwich_maker: { name: "صانع ساندوتشات", icon: "🥪" },
  meat_grinder: { name: "مفرمة لحوم", icon: "🥩" },
  china_set: { name: "طقم صيني", icon: "🍽️" },
  arcopal_set: { name: "طقم أركوبال", icon: "🍽️" },
  melamine_set: { name: "طقم ملامين", icon: "🍽️" },
  archovale_set: { name: "طقم أرشوفال", icon: "🍽️" },
  pyrex_set: { name: "طقم عشاء بايركس", icon: "🍽️" },
  pot_set: { name: "طقم حلل", icon: "🍳" },
  pan_set: { name: "طقم طاسات", icon: "🍳" },
  oven_trays: { name: "طقم صواني فرن", icon: "🧊" },
  pressure_cooker: { name: "حلة ضغط", icon: "🍲" },
  casserole: { name: "طواجن", icon: "🍲" },
  cutlery_set: { name: "طقم معالق وشوك", icon: "🍴" },
  serving_set: { name: "طقم توزيع", icon: "🥄" },
  glass_set: { name: "طقم كاسات", icon: "🥤" },
  cup_set: { name: "طقم كوبايات", icon: "☕" },
  tea_coffee_set: { name: "طقم شاي وقهوة", icon: "☕" },
  thermos: { name: "ترمس مياه وشاي", icon: "🧴" },
  serving_trays: { name: "صواني تقديم", icon: "🧊" },
  spice_set: { name: "طقم توابل", icon: "🧂" },
  dish_drainer: { name: "صفاية أطباق", icon: "🧺" },
  plastic_table: { name: "ترابيزة بلاستيك", icon: "🪑" },
  plastic_chair: { name: "كرسي بلاستيك", icon: "🪑" },
  plastic_cabinet: { name: "دولاب بلاستيك", icon: "🗄️" },
  plastic_drawers: { name: "تربو مطبخ", icon: "🗄️" },
  laundry_basket: { name: "سبت غسيل", icon: "🧺" },
  wash_basin: { name: "طبق غسيل", icon: "🛁" },
  washing_bucket: { name: "جردل غسيل", icon: "🪣" },
  mop_bucket: { name: "جردل بممسحة", icon: "🧹" },
  trash_bin: { name: "سلة مهملات", icon: "🗑️" },
  food_container: { name: "علب حفظ طعام", icon: "📦" },
  plastic_bottle: { name: "شفشق بلاستيك", icon: "🧴" },
  water_bottle: { name: "زجاجة مياه بلاستيك", icon: "💧" },
  lunch_box: { name: "لانش بوكس", icon: "🥪" },
  vegetable_basket: { name: "سبت خضار", icon: "🥬" },
  cutting_board: { name: "بلانشة تقطيع", icon: "🔪" },
  spoon_drainer: { name: "صفاية معالق", icon: "🍴" },
  broom_dustpan: { name: "جاروف ومقشة", icon: "🧹" },
  baby_bath: { name: "بانيو أطفال بلاستيك", icon: "🛁" },
  plastic_plate: { name: "اطباق بلاستيك", icon: "🍽️" },
  plastic_basin: { name: "حوض بلاستيك", icon: "🛁" },
  plastic_laundry_basket: { name: "سلة غسيل بلاستيك", icon: "🧺" },
  plastic_tool_box: { name: "علبة أدوات بلاستيك", icon: "🧰" },
  plastic_storage_box: { name: "بستله بلاستيك", icon: "📦" },
  plastic_ladle: { name: "مغرفة بلاستيك", icon: "🥄" },
  plastic_strainer: { name: "مصفاة بلاستيك", icon: "🧊" },
  baby_cup: { name: "مج بلاستيك للأطفال", icon: "🥤" },
  baby_toy_basket: { name: "سلة ألعاب أطفال", icon: "🧸" },
  baby_seat: { name: "مقعد أطفال بلاستيك", icon: "🪑" },
  baby_chair: { name: "كرسي أطفال بلاستيك", icon: "🪑" },
  baby_bath2: { name: "بوله بلاستيك", icon: "🍳" },
};

const dynamicSubCategories = ref([]);

const sliderBaseItems = computed(() => {
  return ['all', ...dynamicSubCategories.value];
});

const isItemActive = (item) => {
  if (item === 'all') return !activeSubCategory.value;
  return activeSubCategory.value === item;
};

const getSubCategoryName = (value) => {
  if (!value) return "غير محدد";
  if (value === 'all' || value === 'NULL') return null;
  return subCategoryMap[value]?.name || value.replace(/_/g, " ");
};

const getSubCategoryIcon = (value) => {
  if (!value) return "📂";
  if (value === 'all' || value === 'NULL') return "📂";
  return subCategoryMap[value]?.icon || "📂";
};

const loadDynamicSubCategories = (category) => {
  if (!category) {
    dynamicSubCategories.value = [];
    return;
  }

  const subCategories = new Set();
  const excludedValues = ['all', 'NULL', null, undefined, ''];
  
  products.value.forEach(p => {
    if (p.category === category && p.sub_category) {
      const sub = p.sub_category.trim();
      if (!excludedValues.includes(sub) && sub.length > 0) {
        subCategories.add(sub);
      }
    }
  });

  dynamicSubCategories.value = Array.from(subCategories).sort((a, b) => {
    const nameA = getSubCategoryName(a) || a;
    const nameB = getSubCategoryName(b) || b;
    return nameA.localeCompare(nameB);
  });
};

const handleSubClick = (item) => {
  if (item === 'all') {
    clearSubCategory();
  } else {
    setSubCategory(item);
  }
};

const getProductCountByCategory = (category) => {
  return products.value.filter(p => 
    p.category === category && 
    p.stock > 0 && 
    p.product_type !== 'pre_order'
  ).length;
};

// Computed
const filteredProducts = computed(() => {
  let list = products.value.filter((p) => {
    if (p.category !== activeCategory.value) return false;
    if (activeSubCategory.value && p.sub_category !== activeSubCategory.value) return false;
    if (minPrice.value && p.price < minPrice.value) return false;
    if (maxPrice.value && p.price > maxPrice.value) return false;
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      return (
        p.name?.toLowerCase().includes(q) || 
        p.brand?.toLowerCase().includes(q) ||
        p.sub_category?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (sortBy.value === "price-low")
    list.sort((a, b) => (a.price || 0) - (b.price || 0));
  if (sortBy.value === "price-high")
    list.sort((a, b) => (b.price || 0) - (a.price || 0));

  return list;
});

const flashProducts = computed(() =>
  products.value.filter((p) => p.discount && p.discount > 0).slice(0, 4),
);
const bestSellers = computed(() => products.value.slice(0, 8));
const newArrivals = computed(() => products.value.slice(0, 8));

// Methods
const getCategoryTitle = () => {
  return (
    mainCategories.find((c) => c.value === activeCategory.value)?.name ||
    "جميع المنتجات"
  );
};

const getCategoryEmoji = (value) => {
  const cat = mainCategories.find(c => c.value === value);
  return cat?.emoji || "🛍️";
};

const setCategory = (cat) => {
  activeCategory.value = cat;
  activeSubCategory.value = null;
  loadDynamicSubCategories(cat);
};

const setSubCategory = (sub) => {
  activeSubCategory.value = sub;
};

const clearSubCategory = () => {
  activeSubCategory.value = null;
};

const showProductDetails = (product) => {
  navigateTo(`/products/${product.id}`);
};

const showToast = (message, type = "success") => {
  toast.value = { show: true, message, type };
  setTimeout(() => {
    toast.value.show = false;
  }, 3000);
};

const addToCart = (product) => {
  cartStore.addItem(product);
  showToast(`✅ تم إضافة ${product.name} إلى السلة`);
};

const resetAllFilters = () => {
  searchQuery.value = "";
  minPrice.value = null;
  maxPrice.value = null;
  sortBy.value = "newest";
  activeSubCategory.value = null;
};

// Fetch Products
const loadProducts = async () => {
  loading.value = true;
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    products.value = data || [];
    
    loadDynamicSubCategories(activeCategory.value);
  } catch (error) {
    console.error('Error loading products:', error);
    products.value = [];
  } finally {
    setTimeout(() => {
      loading.value = false;
    }, 600);
  }
};

onMounted(() => {
  loadProducts();
});
</script>

<style scoped>
/* إخفاء شريط التمرير الافتراضي */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* حركة الشريط السلسة مع حساب المسافة بدقة */
.marquee-track {
  width: max-content;
  animation: scroll-marquee 30s linear infinite;
}

/* إيقاف الحركة عند وقوف الماوس للتحكم */
.marquee-track:hover {
  animation-play-state: paused;
}

@keyframes scroll-marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(50%);
  }
}

/* Keyframe animations */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.animate-bounce {
  animation: bounce 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>