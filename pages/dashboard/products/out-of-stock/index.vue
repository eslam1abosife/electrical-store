<template>
  <div class="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen" dir="rtl">
    <!-- ================= HEADER ================= -->
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"
    >
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
          📦 منتجات غير متوفرة
        </h1>
        <p class="text-sm text-gray-500">
          إدارة المنتجات التي نفذت من المخزون أو للطلب المسبق
          <span class="text-xs text-gray-400"
            >(لا تؤثر على المخزون والإحصائيات)</span
          >
        </p>
      </div>

      <div class="flex gap-2 flex-wrap">
        <!-- ✅ زر إضافة منتج للطلب المسبق -->
        <button
          v-if="userStore?.canEdit"
          @click="showAddModal = true"
          class="bg-orange-600 text-white px-4 py-2 rounded-xl hover:bg-orange-700 transition text-sm flex items-center gap-2"
        >
          <span>➕</span> إضافة منتج للطلب المسبق
        </button>

        <button
          @click="refreshProducts"
          class="bg-gray-600 text-white px-4 py-2 rounded-xl hover:bg-gray-700 transition text-sm flex items-center gap-2"
          :disabled="isRefreshing"
        >
          <span :class="isRefreshing ? 'animate-spin' : ''">🔄</span>
          {{ isRefreshing ? "جاري التحديث..." : "تحديث" }}
        </button>
      </div>
    </div>

    <!-- ================= MAIN CATEGORIES ================= -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-5">
      <div
        v-for="cat in mainCategories"
        :key="cat.value"
        @click="setCategory(cat.value)"
        class="cursor-pointer p-3 sm:p-4 rounded-2xl shadow-sm border transition hover:shadow-md text-center"
        :class="
          activeCategory === cat.value ? 'bg-orange-600 text-white' : 'bg-white'
        "
      >
        <h3 class="font-bold text-sm sm:text-base md:text-lg">
          {{ cat.name }}
        </h3>
        <span class="text-xs opacity-75">
          ({{ getOutOfStockCount(cat.value) }} منتج)
        </span>
      </div>
    </div>

    <!-- ================= SUB CATEGORIES ================= -->
    <div class="flex gap-2 flex-wrap mb-6">
      <button
        v-for="sub in subCategories[activeCategory]"
        :key="sub.value"
        @click="activeSub = sub.value"
        class="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm transition whitespace-nowrap"
        :class="
          activeSub === sub.value
            ? 'bg-orange-600 text-white shadow'
            : 'bg-white border hover:bg-gray-100'
        "
      >
        {{ sub.name }}
      </button>
    </div>

    <!-- ================= إحصائيات ================= -->
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
      <div
        class="bg-orange-50 p-3 sm:p-4 rounded-2xl shadow text-center border border-orange-200"
      >
        <p class="text-xs sm:text-sm text-orange-600">
          📦 إجمالي المنتجات غير المتوفرة
        </p>
        <p class="text-2xl sm:text-3xl font-bold text-orange-700">
          {{ outOfStockProducts.length }}
        </p>
      </div>
      <div
        class="bg-red-50 p-3 sm:p-4 rounded-2xl shadow text-center border border-red-200"
      >
        <p class="text-xs sm:text-sm text-red-600">❌ نفذ من المخزون</p>
        <p class="text-2xl sm:text-3xl font-bold text-red-700">
          {{ outOfStockCount }}
        </p>
      </div>
      <div
        class="bg-purple-50 p-3 sm:p-4 rounded-2xl shadow text-center border border-purple-200"
      >
        <p class="text-xs sm:text-sm text-purple-600">📩 للطلب المسبق</p>
        <p class="text-2xl sm:text-3xl font-bold text-purple-700">
          {{ preOrderCount }}
        </p>
      </div>
      <div
        class="bg-blue-50 p-3 sm:p-4 rounded-2xl shadow text-center border border-blue-200"
      >
        <p class="text-xs sm:text-sm text-blue-600">💰 إجمالي القيمة</p>
        <p class="text-2xl sm:text-3xl font-bold text-blue-700">
          {{ formatNumber(totalOutOfStockValue) }} ج
        </p>
      </div>
    </div>

    <!-- ================= PRODUCTS GRID ================= -->
    <div
      v-if="filteredOutOfStock.length > 0"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      <div
        v-for="product in filteredOutOfStock"
        :key="product.id"
        class="bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden border border-gray-200"
      >
        <!-- Product Image -->
        <div class="relative h-48 bg-gray-100">
          <img
            v-if="product.images && product.images.length > 0"
            :src="product.images[0]"
            class="w-full h-full object-cover"
            :alt="product.name"
          />
          <img
            v-else-if="product.image_url"
            :src="product.image_url"
            class="w-full h-full object-cover"
            :alt="product.name"
          />
          <div
            v-else
            class="w-full h-full flex items-center justify-center text-6xl text-gray-300"
          >
            📷
          </div>

          <!-- Badge حسب النوع -->
          <div
            v-if="product.product_type === 'pre_order'"
            class="absolute top-2 right-2 bg-purple-600 text-white px-2 py-1 rounded-lg text-xs font-bold"
          >
            📩 للطلب المسبق
          </div>
          <div
            v-else-if="product.stock === 0"
            class="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-lg text-xs font-bold"
          >
            ❌ غير متوفر
          </div>

          <!-- عدد الصور -->
          <div
            v-if="product.images && product.images.length > 1"
            class="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full"
          >
            📷 {{ product.images.length }}
          </div>

          <!-- زر حذف (للأدمن) -->
          <button
            v-if="userStore?.canEdit"
            @click="deleteProduct(product.id)"
            class="absolute top-2 left-2 bg-red-500 text-white p-1.5 rounded-lg hover:bg-red-600 transition text-xs"
            title="حذف المنتج"
          >
            🗑️
          </button>
        </div>

        <!-- Product Info -->
        <div class="p-4">
          <h3 class="font-bold text-base text-gray-800 mb-1 line-clamp-2">
            {{ product.name }}
          </h3>

          <div class="flex justify-between items-center mb-2">
            <span class="text-sm text-gray-500">{{
              product.brand || "بدون ماركة"
            }}</span>
            <span
              class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
            >
              {{ product.sub_category || "عام" }}
            </span>
          </div>

          <div class="flex justify-between items-center border-t pt-2 mt-2">
            <div>
              <span class="text-xs text-gray-500">السعر:</span>
              <span class="font-bold text-lg text-gray-800"
                >{{ formatNumber(product.price) }} ج</span
              >
            </div>
            <div class="text-right">
              <span class="text-xs text-gray-500">المخزون:</span>
              <span class="font-bold text-red-600 block"
                >{{ product.stock }} قطعة</span
              >
            </div>
          </div>

          <!-- زر طلب المنتج -->
          <button
            @click="requestProduct(product)"
            class="w-full mt-3 bg-orange-600 text-white py-2 rounded-xl hover:bg-orange-700 transition text-sm font-medium flex items-center justify-center gap-2"
          >
            <span>📩</span> طلب المنتج
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-16 bg-white rounded-2xl shadow">
      <div class="text-6xl mb-4">🎉</div>
      <h3 class="text-xl font-bold text-gray-700">جميع المنتجات متوفرة!</h3>
      <p class="text-gray-500 mt-2">لا توجد منتجات غير متوفرة في هذا القسم</p>
      <button
        v-if="userStore?.canEdit"
        @click="showAddModal = true"
        class="mt-4 bg-orange-600 text-white px-6 py-2 rounded-xl hover:bg-orange-700 transition"
      >
        ➕ إضافة منتج للطلب المسبق
      </button>
    </div>

    <!-- ================= MODAL ADD PRODUCT ================= -->
    <div
      v-if="showAddModal"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      @click.self="showAddModal = false"
    >
      <div
        class="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
      >
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg sm:text-xl font-bold">
            ➕ إضافة منتج للطلب المسبق
          </h2>
          <button
            @click="showAddModal = false"
            class="text-gray-400 hover:text-gray-600 text-2xl"
          >
            &times;
          </button>
        </div>

        <form @submit.prevent="saveProduct" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">اسم المنتج *</label>
            <input
              v-model="formData.name"
              placeholder="اسم المنتج"
              required
              class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium mb-1">سعر البيع *</label>
              <input
                v-model="formData.price"
                type="number"
                placeholder="سعر البيع"
                required
                class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">سعر الشراء</label>
              <input
                v-model="formData.purchase_price"
                type="number"
                placeholder="سعر الشراء"
                class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium mb-1">المخزون</label>
              <input
                v-model="formData.stock"
                type="number"
                placeholder="المخزون (اترك 0)"
                class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
              />
              <p class="text-xs text-gray-400 mt-1">
                اترك 0 إذا كان المنتج غير متوفر
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">الماركة</label>
              <input
                v-model="formData.brand"
                placeholder="الماركة"
                class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium mb-1"
                >القسم الرئيسي *</label
              >
              <select
                v-model="formData.category"
                class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
                required
              >
                <option value="">اختر القسم</option>
                <option value="electrical">الأجهزة الكهربائية</option>
                <option value="home">الأدوات المنزلية</option>
                <option value="plastic">البلاستيك والتخزين</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">النوع</label>
              <select
                v-model="formData.sub_category"
                class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
                :disabled="!formData.category"
              >
                <option value="">اختر النوع</option>
                <option
                  v-for="sub in subCategories[formData.category]"
                  :key="sub.value"
                  :value="sub.value"
                >
                  {{ sub.name }}
                </option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">الوصف</label>
            <textarea
              v-model="formData.description"
              placeholder="الوصف"
              rows="3"
              class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
            ></textarea>
          </div>

          <!-- رفع الصور -->
          <div class="border-2 border-dashed rounded-xl p-3 sm:p-4">
            <div class="text-center mb-3">
              <div class="text-3xl sm:text-4xl mb-2">🖼️</div>
              <p class="text-gray-600 text-sm">صور المنتج</p>
              <p class="text-xs text-gray-400">
                يمكنك رفع عدة صور (أقصى 10 صور)
              </p>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-3">
              <div
                v-for="(img, index) in formData.images"
                :key="index"
                class="relative group"
              >
                <img
                  :src="img"
                  class="w-full h-20 sm:h-24 object-cover rounded-lg"
                />
                <button
                  type="button"
                  @click="removeImage(index)"
                  class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>
              <div
                v-if="formData.images.length < 10"
                @click="$refs.multiFileInput.click()"
                class="border-2 border-dashed rounded-lg flex items-center justify-center h-20 sm:h-24 cursor-pointer hover:bg-gray-50 transition"
              >
                <div class="text-center">
                  <div class="text-xl sm:text-2xl">➕</div>
                  <div class="text-xs text-gray-500">إضافة</div>
                </div>
              </div>
            </div>

            <input
              type="file"
              ref="multiFileInput"
              @change="uploadMultipleImages"
              class="hidden"
              accept="image/*"
              multiple
            />
          </div>

          <div class="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              class="flex-1 bg-orange-600 text-white py-2.5 rounded-xl hover:bg-orange-700 transition text-sm"
            >
              ➕ إضافة للطلب المسبق
            </button>
            <button
              type="button"
              @click="showAddModal = false"
              class="flex-1 bg-gray-200 py-2.5 rounded-xl hover:bg-gray-300 transition text-sm"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Toast Notification -->
    <ToastNotification v-model:toast="toast" />
  </div>
</template>

<script setup>
definePageMeta({
  layout: "dashboard",
  middleware: "admin-only",
});

import { supabase } from '~/lib/supabase';
const userStore = useUserStore();

const toast = ref({ show: false, message: "", type: "success", icon: "✅" });
const showToast = (message, type = "success") => {
  const icons = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" };
  toast.value = { show: true, message, type, icon: icons[type] || "✅" };
  setTimeout(() => {
    toast.value.show = false;
  }, 3000);
};

// State
const products = ref([]);
const isRefreshing = ref(false);
const showAddModal = ref(false);
const activeCategory = ref("electrical");
const activeSub = ref("all");
const multiFileInput = ref(null);
const uploadingImages = ref([]);

const mainCategories = [
  { name: "الأجهزة الكهربائية", value: "electrical" },
  { name: "الأدوات المنزلية", value: "home" },
  { name: "البلاستيك والتخزين", value: "plastic" },
];

const subCategories = {
  electrical: [
    { name: "الكل", value: "all" },
    { name: "ثلاجات", value: "refrigerators" },
    { name: "ديب فريزر", value: "freezers" },
    { name: "تكييفات", value: "air_conditioners" },
    { name: "مبردات مياه", value: "water_coolers" },
    { name: "مراوح", value: "fans" },
    { name: "غسالات", value: "washing_machines" },
    { name: "مجففات", value: "dryers" },
    { name: "مكانس كهربائية", value: "vacuum_cleaners" },
    { name: "بوتاجازات", value: "cookers" },
    { name: "أفران كهرباء", value: "ovens" },
    { name: "ميكروويف", value: "microwaves" },
    { name: "خلاطات", value: "blenders" },
    { name: "ماكينات قهوة", value: "coffee_makers" },
    { name: "كاتيل كهرباء", value: "kettles" },
    { name: "سشوار", value: "hair_dryers" },
  ],
  home: [
    { name: "الكل", value: "all" },
    { name: "أطقم سفرة", value: "dinner_sets" },
    { name: "كاسات", value: "cups" },
    { name: "علب حفظ طعام", value: "food_storage" },
    { name: "حلل وطاسات", value: "pots_pans" },
    { name: "أدوات تنظيف", value: "cleaning_tools" },
    { name: "مفارش", value: "table_cloths" },
  ],
  plastic: [
    { name: "الكل", value: "all" },
    { name: "علب حفظ طعام", value: "food_containers" },
    { name: "كراسي", value: "chairs" },
    { name: "ترابيزات", value: "tables" },
    { name: "سلات قمامة", value: "trash_bins" },
    { name: "جراكن مياه", value: "water_jerrycans" },
  ],
};

const formData = ref({
  name: "",
  price: null,
  purchase_price: null,
  stock: 0,
  category: "",
  sub_category: "",
  brand: "",
  description: "",
  images: [],
  product_type: "pre_order",
});

// ✅ المنتجات غير المتوفرة (نسخة موسعة)
const outOfStockProducts = computed(() => {
  console.log('📦 جميع المنتجات:', products.value);
  
  const result = products.value.filter((p) => {
    // المنتج غير متوفر إذا:
    // 1. نوعه pre_order (للطلب المسبق)
    // 2. المخزون 0 (نفذ)
    // 3. المخزون أقل من 1
    const isOutOfStock = p.product_type === 'pre_order' || p.stock <= 0;
    
    if (isOutOfStock) {
      console.log(`📦 منتج غير متوفر: ${p.name} - stock: ${p.stock} - type: ${p.product_type}`);
    }
    
    return isOutOfStock;
  });
  
  console.log('📦 المنتجات غير المتوفرة:', result);
  return result;
});

// ✅ عدد المنتجات اللي خلصت (stock = 0)
const outOfStockCount = computed(() => {
  return products.value.filter(
    (p) => p.stock === 0 && p.product_type !== "pre_order",
  ).length;
});

// ✅ عدد منتجات الطلب المسبق
const preOrderCount = computed(() => {
  return products.value.filter((p) => p.product_type === "pre_order").length;
});

// ✅ التصفية حسب القسم والنوع
const filteredOutOfStock = computed(() => {
  let result = outOfStockProducts.value.filter((p) => {
    if (p.category !== activeCategory.value) return false;
    if (activeSub.value === "all") return true;
    return p.sub_category === activeSub.value;
  });
  return result;
});

const totalOutOfStockValue = computed(() => {
  return outOfStockProducts.value.reduce((sum, p) => sum + (p.price || 0), 0);
});

const getOutOfStockCount = (category) => {
  return outOfStockProducts.value.filter((p) => p.category === category).length;
};

const formatNumber = (num) => {
  if (!num && num !== 0) return "0";
  return num.toLocaleString("ar-EG") || "0";
};

// ============================================================
// ✅ تحميل المنتجات مع تحديث تلقائي للمنتجات اللي خلصت
// ============================================================
const loadProducts = async () => {
  try {
    // ✅ 1. جلب جميع المنتجات
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // ✅ 2. تحديث المنتجات اللي وصلت لصفر في قاعدة البيانات
    const zeroStockProducts = data.filter(
      (p) => p.stock === 0 && p.product_type !== "pre_order"
    );

    if (zeroStockProducts.length > 0) {
      console.log(`🔄 جاري تحديث ${zeroStockProducts.length} منتج وصل لصفر`);
      
      for (const product of zeroStockProducts) {
        // تحديث في قاعدة البيانات
        const { error: updateError } = await supabase
          .from("products")
          .update({
            product_type: "pre_order",
            updated_at: new Date().toISOString()
          })
          .eq("id", product.id);
        
        if (updateError) {
          console.error(`❌ خطأ في تحديث المنتج ${product.name}:`, updateError);
        } else {
          console.log(`✅ تم تغيير نوع المنتج "${product.name}" إلى pre_order`);
        }
      }
      
      // ✅ 3. إعادة جلب البيانات بعد التحديث
      const { data: updatedData, error: refreshError } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (refreshError) throw refreshError;
      
      products.value = (updatedData || []).map((p) => ({
        ...p,
        images: p.images || (p.image_url ? [p.image_url] : []),
      }));
      
      showToast(`🔄 تم تحديث ${zeroStockProducts.length} منتج إلى الطلب المسبق`, "info");
    } else {
      // ✅ 4. لو مفيش تحديثات، استخدم البيانات اللي جبتها
      products.value = (data || []).map((p) => ({
        ...p,
        images: p.images || (p.image_url ? [p.image_url] : []),
      }));
    }
    
    console.log('📦 المنتجات بعد التحديث:', products.value);
    
  } catch (error) {
    console.error("❌ Error loading products:", error);
    showToast("❌ حدث خطأ في تحميل المنتجات", "error");
  }
};

const refreshProducts = async () => {
  isRefreshing.value = true;
  await loadProducts();
  isRefreshing.value = false;
  showToast("🔄 تم تحديث المنتجات", "success");
};

const setCategory = (cat) => {
  activeCategory.value = cat;
  activeSub.value = "all";
};

// ============================================================
// ✅ رفع الصور
// ============================================================
const uploadMultipleImages = async (event) => {
  const files = Array.from(event.target.files);
  if (!files.length) return;

  if (formData.value.images.length + files.length > 10) {
    showToast("⚠️ لا يمكن إضافة أكثر من 10 صور", "warning");
    return;
  }

  for (const file of files) {
    if (file.size > 5 * 1024 * 1024) {
      showToast(`⚠️ الصورة ${file.name} حجمها كبير جداً`, "warning");
      continue;
    }

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error } = await supabase.storage
        .from("product-images")
        .upload(filePath, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      formData.value.images.push(urlData.publicUrl);
    } catch (error) {
      console.error("Upload error:", error);
      showToast(`❌ فشل رفع الصورة ${file.name}`, "error");
    }
  }

  if (multiFileInput.value) {
    multiFileInput.value.value = "";
  }
};

const removeImage = (index) => {
  formData.value.images.splice(index, 1);
};

// ============================================================
// ✅ حفظ منتج جديد (للطلب المسبق)
// ============================================================
const saveProduct = async () => {
  if (!userStore.canEdit) {
    showToast("⚠️ ليس لديك صلاحية", "warning");
    return;
  }

  if (!formData.value.name || !formData.value.price) {
    showToast("⚠️ الاسم وسعر البيع مطلوبين", "warning");
    return;
  }

  if (formData.value.images.length === 0) {
    showToast("⚠️ الرجاء إضافة صورة واحدة على الأقل", "warning");
    return;
  }

  const productData = {
    name: formData.value.name,
    price: formData.value.price,
    purchase_price: formData.value.purchase_price || null,
    stock: 0, // ✅ دايمن صفر عشان متحسبش
    category: formData.value.category,
    sub_category: formData.value.sub_category || null,
    brand: formData.value.brand || null,
    description: formData.value.description || null,
    images: formData.value.images,
    image_url: formData.value.images[0],
    product_type: "pre_order", // ✅ نوع الطلب المسبق
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("products")
    .insert([{ ...productData, created_at: new Date().toISOString() }]);

  if (error) {
    showToast(`❌ خطأ: ${error.message}`, "error");
  } else {
    showToast("✅ تم إضافة المنتج للطلب المسبق بنجاح", "success");
    showAddModal.value = false;
    formData.value = {
      name: "",
      price: null,
      purchase_price: null,
      stock: 0,
      category: "",
      sub_category: "",
      brand: "",
      description: "",
      images: [],
      product_type: "pre_order",
    };
    await loadProducts();
  }
};

// ============================================================
// ✅ حذف منتج
// ============================================================
const deleteProduct = async (id) => {
  if (!userStore.canEdit) {
    showToast("⚠️ ليس لديك صلاحية", "warning");
    return;
  }

  if (!confirm("⚠️ هل أنت متأكد من حذف هذا المنتج؟")) return;

  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    showToast(`❌ خطأ: ${error.message}`, "error");
  } else {
    await loadProducts();
    showToast("✅ تم حذف المنتج", "success");
  }
};

// ============================================================
// ✅ طلب المنتج (لعملاء الموقع)
// ============================================================
const requestProduct = async (product) => {
  if (!userStore?.isLoggedIn) {
    showToast("⚠️ الرجاء تسجيل الدخول لطلب المنتج", "warning");
    return;
  }

  try {
    // ✅ التحقق من عدم تكرار الطلب
    const { data: existing, error: checkError } = await supabase
      .from("product_requests")
      .select("id, status")
      .eq("product_id", product.id)
      .eq("customer_email", userStore.user?.email)
      .neq("status", "cancelled")
      .maybeSingle();

    if (existing) {
      showToast(
        `⚠️ لقد طلبت هذا المنتج مسبقاً (الحالة: ${existing.status})`,
        "warning",
      );
      return;
    }

    // ✅ إضافة طلب جديد
    const { error } = await supabase.from("product_requests").insert([
      {
        product_id: product.id,
        product_name: product.name,
        customer_email: userStore.user?.email,
        customer_name: userStore.user?.user_metadata?.full_name || "عميل",
        request_date: new Date().toISOString(),
        status: "pending",
      },
    ]);

    if (error) {
      showToast("❌ حدث خطأ في طلب المنتج", "error");
    } else {
      showToast(`✅ تم طلب المنتج "${product.name}" بنجاح`, "success");
    }
  } catch (error) {
    console.error("❌ خطأ:", error);
    showToast("❌ حدث خطأ", "error");
  }
};

// ============================================================
// ✅ Mounted
// ============================================================
onMounted(() => {
  loadProducts();
});
</script>

<style scoped>
@media (max-width: 640px) {
  select,
  input {
    font-size: 16px !important;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
