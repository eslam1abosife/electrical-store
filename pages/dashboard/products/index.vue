<template>
  <div class="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen" dir="rtl">
    <!-- ================= HEADER ================= -->
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6"
    >
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
          إدارة المنتجات
        </h1>
        <p class="text-sm text-gray-500">
          نظام إدارة المخزون والمشتريات
          <span class="text-xs text-gray-400"
            >(آخر تحديث: {{ lastUpdated }})</span
          >
        </p>
      </div>

      <div class="flex gap-2 w-full sm:w-auto flex-wrap">
        <!-- ✅ زر المنتجات غير المتوفرة -->
        <NuxtLink
          to="/dashboard/products/out-of-stock"
          class="bg-orange-600 text-white px-4 py-2 rounded-xl hover:bg-orange-700 transition text-sm flex items-center gap-2"
        >
          <span>📦</span> المنتجات غير المتوفرة
          <span class="bg-white/20 px-2 py-0.5 rounded-full text-xs">{{
            outOfStockCount
          }}</span>
        </NuxtLink>
        <NuxtLink
          to="/dashboard/products/requests"
          class="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition text-sm flex items-center gap-2"
        >
          <span>📩</span> طلبات المنتجات
          <span class="bg-white/20 px-2 py-0.5 rounded-full text-xs">{{
            productRequestsCount
          }}</span>
        </NuxtLink>
        <button
          @click="refreshProducts"
          class="bg-gray-600 text-white px-4 py-2 rounded-xl hover:bg-gray-700 transition text-sm flex items-center gap-2"
          :disabled="isRefreshing"
        >
          <span :class="isRefreshing ? 'animate-spin' : ''">🔄</span>
          {{ isRefreshing ? "جاري التحديث..." : "تحديث المخزون" }}
        </button>

        <button
          v-if="userStore?.canEdit"
          @click="showAddModal = true"
          class="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl shadow hover:shadow-lg transition text-sm sm:text-base"
        >
          + إضافة منتج
        </button>
      </div>
    </div>

    <!-- ================= MAIN CATEGORIES (CARDS) ================= -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-5">
      <div
        v-for="cat in mainCategories"
        :key="cat.value"
        @click="setCategory(cat.value)"
        class="cursor-pointer p-3 sm:p-4 rounded-2xl shadow-sm border transition hover:shadow-md text-center"
        :class="
          activeCategory === cat.value ? 'bg-blue-600 text-white' : 'bg-white'
        "
      >
        <h3 class="font-bold text-sm sm:text-base md:text-lg">
          {{ cat.name }}
        </h3>
      </div>
    </div>

    <!-- ================= SUB CATEGORIES (CHIPS) ================= -->
    <div class="flex gap-2 flex-wrap mb-6">
      <button
        v-for="sub in subCategories[activeCategory]"
        :key="sub.value"
        @click="activeSub = sub.value"
        class="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm transition whitespace-nowrap"
        :class="
          activeSub === sub.value
            ? 'bg-green-600 text-white shadow'
            : 'bg-white border hover:bg-gray-100'
        "
      >
        {{ sub.name }}
      </button>
    </div>

    <!-- ================= PRODUCTS TABLE / CARDS ================= -->
    <div class="bg-white rounded-2xl shadow overflow-hidden">
      <!-- Mobile Cards View -->
      <div class="block md:hidden divide-y">
        <div
          v-for="product in filteredProducts"
          :key="product.id"
          class="p-4 hover:bg-gray-50"
        >
          <div class="flex gap-3">
            <!-- Product Image -->
            <div class="relative shrink-0">
              <img
                v-if="product.images && product.images.length > 0"
                :src="product.images[0]"
                class="w-16 h-16 object-cover rounded-lg"
                :alt="product.name"
              />
              <img
                v-else-if="product.image_url"
                :src="product.image_url"
                class="w-16 h-16 object-cover rounded-lg"
                :alt="product.name"
              />
              <div
                v-else
                class="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-2xl"
              >
                📷
              </div>
              <div
                v-if="product.images && product.images.length > 1"
                class="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
              >
                {{ product.images.length }}
              </div>
              <!-- ✅ Badge للطلب المسبق -->
              <div
                v-if="product.product_type === 'pre_order'"
                class="absolute top-2 right-2 bg-orange-600 text-white px-1.5 py-0.5 rounded text-[10px] font-bold"
              >
                📩 طلب مسبق
              </div>
            </div>

            <!-- Product Info -->
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-start">
                <h3 class="font-medium text-sm truncate">{{ product.name }}</h3>
                <div class="flex gap-2 shrink-0">
                  <button
                    v-if="userStore?.canEdit"
                    @click="editProduct(product)"
                    class="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    تعديل
                  </button>
                  <button
                    v-if="userStore?.canEdit"
                    @click="moveToOutOfStock(product.id)"
                    class="text-orange-600 hover:text-orange-800 text-sm"
                  >
                    📦 نقل
                  </button>
                  <button
                    v-if="userStore?.canEdit"
                    @click="deleteProduct(product.id)"
                    class="text-red-600 hover:text-red-800 text-sm"
                  >
                    حذف
                  </button>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-2 mt-2 text-sm">
                <div>
                  <span class="text-gray-500">سعر البيع:</span>
                  <span class="font-medium mr-1">{{ product.price }} ج</span>
                </div>
                <div>
                  <span class="text-gray-500">سعر الشراء:</span>
                  <span class="font-medium mr-1"
                    >{{ product.purchase_price || "-" }} ج</span
                  >
                </div>
                <div>
                  <span class="text-gray-500">المخزون:</span>
                  <span
                    :class="
                      product.stock === 0
                        ? 'text-red-600 font-bold'
                        : product.stock < 10
                          ? 'text-yellow-600 font-bold'
                          : 'text-green-600 font-bold'
                    "
                  >
                    {{ product.stock }}
                  </span>
                </div>
                <div>
                  <span class="text-gray-500">الربح:</span>
                  <span class="text-emerald-600 font-semibold"
                    >{{
                      (
                        (product.price || 0) - (product.purchase_price || 0)
                      ).toFixed(2)
                    }}
                    ج</span
                  >
                </div>
              </div>
              <div class="mt-2 flex gap-2 flex-wrap">
                <span
                  class="px-2 py-1 rounded-full text-xs"
                  :class="
                    product.stock === 0
                      ? 'bg-red-100 text-red-700'
                      : product.stock < 10
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                  "
                >
                  {{
                    product.stock === 0
                      ? "❌ نفذ من المخزون"
                      : product.stock < 10
                        ? "⚠️ كمية محدودة"
                        : "✅ متوفر"
                  }}
                </span>
                <span
                  v-if="product.product_type === 'pre_order'"
                  class="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-700"
                >
                  📩 للطلب المسبق
                </span>
              </div>
            </div>
          </div>
        </div>
        <div
          v-if="filteredProducts.length === 0"
          class="text-center py-12 text-gray-400"
        >
          لا يوجد منتجات في هذا القسم
        </div>
      </div>

      <!-- Desktop Table View -->
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full min-w-[900px]">
          <thead class="bg-gray-100 text-gray-600">
            <tr>
              <th class="p-4 text-right text-sm">الصورة</th>
              <th class="p-4 text-right text-sm">الاسم</th>
              <th class="p-4 text-right text-sm hidden lg:table-cell">
                سعر البيع
              </th>
              <th class="p-4 text-right text-sm hidden xl:table-cell">
                سعر الشراء
              </th>
              <th class="p-4 text-right text-sm">المخزون</th>
              <th class="p-4 text-right text-sm hidden lg:table-cell">الربح</th>
              <th class="p-4 text-right text-sm hidden sm:table-cell">النوع</th>
              <th class="p-4 text-right text-sm hidden sm:table-cell">
                الحالة
              </th>
              <th class="p-4 text-right text-sm">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="product in filteredProducts"
              :key="product.id"
              class="border-t hover:bg-gray-50 transition"
            >
              <td class="p-4">
                <div class="relative group">
                  <img
                    v-if="product.images && product.images.length > 0"
                    :src="product.images[0]"
                    class="w-12 h-12 object-cover rounded-lg"
                    :alt="product.name"
                  />
                  <img
                    v-else-if="product.image_url"
                    :src="product.image_url"
                    class="w-12 h-12 object-cover rounded-lg"
                    :alt="product.name"
                  />
                  <div
                    v-else
                    class="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-xl"
                  >
                    📷
                  </div>
                  <div
                    v-if="product.images && product.images.length > 1"
                    class="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    {{ product.images.length }}
                  </div>
                  <!-- ✅ Badge للطلب المسبق -->
                  <div
                    v-if="product.product_type === 'pre_order'"
                    class="absolute top-2 right-2 bg-orange-600 text-white px-1.5 py-0.5 rounded text-[10px] font-bold"
                  >
                    📩
                  </div>
                </div>
              </td>
              <td class="p-4 font-medium text-sm max-w-[150px] truncate">
                {{ product.name }}
              </td>
              <td
                class="p-4 text-gray-700 text-sm hidden lg:table-cell whitespace-nowrap"
              >
                {{ product.price }} ج
              </td>
              <td
                class="p-4 text-gray-500 text-sm hidden xl:table-cell whitespace-nowrap"
              >
                {{ product.purchase_price || "-" }} ج
              </td>
              <td class="p-4">
                <span
                  :class="
                    product.stock === 0
                      ? 'text-red-600 font-bold'
                      : product.stock < 10
                        ? 'text-yellow-600 font-bold'
                        : 'text-green-600 font-bold'
                  "
                  class="text-sm"
                >
                  {{ product.stock }}
                </span>
              </td>
              <td
                class="p-4 text-emerald-600 font-semibold text-sm hidden lg:table-cell whitespace-nowrap"
              >
                {{
                  (
                    (product.price || 0) - (product.purchase_price || 0)
                  ).toFixed(2)
                }}
                ج
              </td>
              <td class="p-4 hidden sm:table-cell">
                <span
                  class="px-2 py-1 rounded-full text-xs whitespace-nowrap"
                  :class="
                    product.product_type === 'pre_order'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-blue-100 text-blue-700'
                  "
                >
                  {{
                    product.product_type === "pre_order"
                      ? "📩 طلب مسبق"
                      : "📦 متوفر"
                  }}
                </span>
              </td>
              <td class="p-4 hidden sm:table-cell">
                <span
                  class="px-2 py-1 rounded-full text-xs whitespace-nowrap"
                  :class="
                    product.stock === 0
                      ? 'bg-red-100 text-red-700'
                      : product.stock < 10
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                  "
                >
                  {{
                    product.stock === 0
                      ? "❌ نفذ"
                      : product.stock < 10
                        ? "⚠️ منخفض"
                        : "✅ متوفر"
                  }}
                </span>
              </td>
              <td class="p-4">
                <div class="flex gap-2 sm:gap-3">
                  <button
                    v-if="userStore?.canEdit"
                    @click="editProduct(product)"
                    class="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    تعديل
                  </button>
                  <button
                    v-if="userStore?.canEdit"
                    @click="moveToOutOfStock(product.id)"
                    class="text-orange-600 hover:text-orange-800 text-sm"
                    title="نقل إلى غير متوفرة"
                  >
                    📦
                  </button>
                  <button
                    v-if="userStore?.canEdit"
                    @click="deleteProduct(product.id)"
                    class="text-red-600 hover:text-red-800 text-sm"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="filteredProducts.length === 0">
              <td colspan="9" class="text-center p-10 text-gray-400">
                لا يوجد منتجات في هذا القسم
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ================= MODAL ADD/EDIT ================= -->
    <div
      v-if="showAddModal"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      @click.self="showAddModal = false"
    >
      <div
        class="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
      >
        <div class="flex justify-between items-center mb-4 sm:mb-5">
          <h2 class="text-lg sm:text-xl font-bold">
            {{ editingProduct ? "تعديل منتج" : "إضافة منتج جديد" }}
          </h2>
          <button
            @click="closeModal"
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
              class="w-full p-2.5 sm:p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-sm sm:text-base"
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
                step="any"
                class="w-full p-2.5 sm:p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">سعر الشراء</label>
              <input
                v-model="formData.purchase_price"
                type="number"
                step="any"
                placeholder="سعر الشراء"
                class="w-full p-2.5 sm:p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-sm"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium mb-1">المخزون *</label>
              <input
                v-model="formData.stock"
                type="number"
                placeholder="المخزون"
                required
                step="any"
                class="w-full p-2.5 sm:p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">الماركة</label>
              <input
                v-model="formData.brand"
                placeholder="الماركة"
                class="w-full p-2.5 sm:p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-sm"
              />
            </div>
          </div>

          <!-- ✅ نوع المنتج -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium mb-1">نوع المنتج *</label>
              <select
                v-model="formData.product_type"
                class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
                required
              >
                <option value="in_stock">📦 متوفر في المخزون</option>
                <option value="pre_order">📩 للطلب المسبق</option>
              </select>
              <p class="text-xs text-gray-400 mt-1">
                اختر "للطلب المسبق" إذا كان المنتج غير متوفر حالياً
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1"
                >القسم الرئيسي *</label
              >
              <select
                v-model="formData.category"
                class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
                required
              >
                <option value="">اختر القسم الرئيسي</option>
                <option value="electrical">الأجهزة الكهربائية</option>
                <option value="home">الأدوات المنزلية</option>
                <option value="plastic">البلاستيك والتخزين</option>
              </select>
            </div>
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

          <div>
            <label class="block text-sm font-medium mb-1">الوصف</label>
            <textarea
              v-model="formData.description"
              placeholder="الوصف"
              rows="3"
              class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
            ></textarea>
          </div>

          <!-- ================= رفع صور متعددة ================= -->
          <div class="border-2 border-dashed rounded-xl p-3 sm:p-4">
            <div class="text-center mb-3">
              <div class="text-3xl sm:text-4xl mb-2">🖼️</div>
              <p class="text-gray-600 text-sm">صور المنتج</p>
              <p class="text-xs text-gray-400">
                يمكنك رفع عدة صور (أقصى 10 صور)
              </p>
            </div>

            <!-- معرض الصور المرفوعة -->
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
                  v-if="userStore?.canEdit"
                  type="button"
                  @click="removeImage(index)"
                  class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs"
                >
                  ✕
                </button>
                <div
                  v-if="index === 0"
                  class="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-1 rounded"
                >
                  رئيسية
                </div>
              </div>

              <!-- زر إضافة صورة -->
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

            <!-- مؤشر الرفع -->
            <div v-if="uploadingImages.length > 0" class="mt-2">
              <div
                v-for="(item, idx) in uploadingImages"
                :key="idx"
                class="text-xs text-blue-600 mb-1"
              >
                جاري رفع: {{ item.name }}...
              </div>
            </div>
          </div>

          <!-- عرض رسائل الخطأ -->
          <div
            v-if="uploadError"
            class="bg-red-50 text-red-600 p-2 sm:p-3 rounded-xl text-xs sm:text-sm"
          >
            {{ uploadError }}
          </div>

          <div class="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              v-if="userStore?.canEdit"
              type="submit"
              class="flex-1 bg-blue-600 text-white py-2.5 sm:py-3 rounded-xl hover:bg-blue-700 transition text-sm sm:text-base"
            >
              {{ editingProduct ? "تحديث" : "حفظ" }}
            </button>
            <button
              v-if="userStore?.canEdit"
              type="button"
              @click="closeModal"
              class="flex-1 bg-gray-200 py-2.5 sm:py-3 rounded-xl hover:bg-gray-300 transition text-sm sm:text-base"
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

import { supabase } from "~/lib/supabase";
const userStore = useUserStore();

// ✅ Toast state
const toast = ref({ show: false, message: "", type: "success", icon: "✅" });

// ✅ دالة عرض Toast
const showToast = (message, type = "success") => {
  const icons = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
  };
  toast.value = {
    show: true,
    message,
    type,
    icon: icons[type] || "✅",
  };
  setTimeout(() => {
    toast.value.show = false;
  }, 3000);
};

// State
const products = ref([]);
const showAddModal = ref(false);
const editingProduct = ref(null);
const uploadingImages = ref([]);
const uploadError = ref("");
const multiFileInput = ref(null);
const isRefreshing = ref(false);
const lastUpdated = ref("");

const activeCategory = ref("electrical");
const activeSub = ref("all");

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

// ✅ formData مع product_type
const formData = ref({
  name: "",
  price: null,
  purchase_price: null,
  stock: null,
  category: "",
  sub_category: "",
  brand: "",
  description: "",
  images: [],
  product_type: "in_stock",
});

// ✅ حساب عدد المنتجات غير المتوفرة
const outOfStockCount = computed(() => {
  return products.value.filter(
    (p) => p.stock === 0 || p.product_type === "pre_order",
  ).length;
});

// ✅ حساب عدد طلبات المنتجات
const productRequestsCount = ref(0);

const loadProductRequestsCount = async () => {
  try {
    const { count, error } = await supabase
      .from("product_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    if (!error) {
      productRequestsCount.value = count || 0;
    }
  } catch (error) {
    console.error("Error loading requests count:", error);
  }
};

// ✅ دالة تحديث يدوي
const refreshProducts = async () => {
  isRefreshing.value = true;
  await loadProducts();
  lastUpdated.value = new Date().toLocaleTimeString("ar-EG");
  isRefreshing.value = false;
  showToast("🔄 تم تحديث المخزون بنجاح", "success");
};

// Load products
const loadProducts = async () => {
  try {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    products.value = (data || []).map((p) => ({
      ...p,
      images: p.images || (p.image_url ? [p.image_url] : []),
    }));
  } catch (error) {
    console.error("Error loading products:", error);
    showToast("❌ حدث خطأ في تحميل المنتجات", "error");
  }
};

// ✅ Filter products - عرض المنتجات المتوفرة فقط للإدارة
const filteredProducts = computed(() => {
  let result = products.value.filter((p) => {
    // ✅ عرض المنتجات المتوفرة فقط (stock > 0 و product_type = 'in_stock')
    if (p.product_type === "pre_order") return false;
    if (p.stock === 0) return false;
    if (p.category !== activeCategory.value) return false;
    if (activeSub.value === "all") return true;
    return p.sub_category === activeSub.value;
  });
  return result;
});

// Change category
const setCategory = (cat) => {
  activeCategory.value = cat;
  activeSub.value = "all";
};

// Upload multiple images
const uploadMultipleImages = async (event) => {
  const files = Array.from(event.target.files);
  if (!files.length) return;

  if (formData.value.images.length + files.length > 10) {
    uploadError.value = "لا يمكن إضافة أكثر من 10 صور للمنتج الواحد";
    return;
  }

  const uploading = files.map((f) => ({ name: f.name, progress: 0 }));
  uploadingImages.value.push(...uploading);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    if (file.size > 5 * 1024 * 1024) {
      uploadError.value = `الصورة ${file.name} حجمها كبير جداً (الحد الأقصى 5 ميجابايت)`;
      continue;
    }

    if (!file.type.startsWith("image/")) {
      uploadError.value = `الملف ${file.name} ليس صورة`;
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

      uploadingImages.value = uploadingImages.value.filter(
        (u) => u.name !== file.name,
      );
    } catch (error) {
      console.error("Upload error:", error);
      uploadError.value = `فشل رفع الصورة ${file.name}: ${error.message}`;
      uploadingImages.value = uploadingImages.value.filter(
        (u) => u.name !== file.name,
      );
    }
  }

  if (multiFileInput.value) {
    multiFileInput.value.value = "";
  }

  if (uploadingImages.value.length === 0 && uploadError.value) {
    setTimeout(() => {
      uploadError.value = "";
    }, 3000);
  }
};

// Remove image
const removeImage = (index) => {
  formData.value.images.splice(index, 1);
};

// ✅ Save product - مع product_type
// ✅ Save product - مع product_type
const saveProduct = async () => {
  if (!userStore.canEdit) {
    showToast("⚠️ ليس لديك صلاحية لإضافة أو تعديل المنتجات", "warning");
    return;
  }

  if (!formData.value.name || !formData.value.price) {
    showToast("⚠️ الاسم وسعر البيع مطلوبين", "warning");
    return;
  }

  if (formData.value.images.length === 0) {
    showToast("⚠️ الرجاء إضافة صورة واحدة على الأقل للمنتج", "warning");
    return;
  }

  const productData = {
    name: formData.value.name,
    price: formData.value.price,
    purchase_price: formData.value.purchase_price || null,
    stock: formData.value.stock || 0,
    category: formData.value.category,
    sub_category: formData.value.sub_category || null,
    brand: formData.value.brand || null,
    description: formData.value.description || null,
    images: formData.value.images,
    image_url: formData.value.images[0],
    product_type: formData.value.product_type || "in_stock",
    updated_at: new Date().toISOString(),
  };

  let error;

  if (editingProduct.value) {
    // ✅ حفظ المنتج القديم قبل التعديل
    const oldProduct = products.value.find(p => p.id === editingProduct.value.id);
    
    // ✅ تحديث المنتج
    const { error: updateError } = await supabase
      .from("products")
      .update(productData)
      .eq("id", editingProduct.value.id);
    error = updateError;

    // ✅ لو تغيرت البيانات، حدّث المشتريات
    if (!error && oldProduct) {
      const priceChanged = oldProduct.purchase_price !== formData.value.purchase_price;
      const nameChanged = oldProduct.name !== formData.value.name;
      const stockChanged = oldProduct.stock !== formData.value.stock;

      if (priceChanged || nameChanged || stockChanged) {
        // ✅ جلب المشتريات المرتبطة بهذا المنتج
        const { data: purchasesData, error: fetchError } = await supabase
          .from("purchases")
          .select("*")
          .eq("product_id", editingProduct.value.id);

        if (!fetchError && purchasesData && purchasesData.length > 0) {
          // ✅ تحديث كل فواتير هذا المنتج
          for (const purchase of purchasesData) {
            const updateData = {};
            
            // ✅ تحديث سعر الشراء لو تغير
            if (priceChanged) {
              updateData.unit_price = formData.value.purchase_price || purchase.unit_price;
              updateData.total_price = updateData.unit_price * purchase.quantity;
            }
            
            // ✅ تحديث اسم المنتج لو تغير
            if (nameChanged) {
              updateData.product_name = formData.value.name;
            }

            // ✅ تحديث الكمية لو تغيرت
            if (stockChanged) {
              // ✅ الفرق بين الكمية القديمة والجديدة
              const quantityDiff = formData.value.stock - oldProduct.stock;
              // ✅ الكمية الجديدة في الفاتورة = الكمية القديمة + الفرق
              const newQuantity = Math.max(0, purchase.quantity + quantityDiff);
              updateData.quantity = newQuantity;
              // ✅ تحديث الإجمالي مع السعر الجديد
              updateData.total_price = (updateData.unit_price || purchase.unit_price) * newQuantity;
            }

            if (Object.keys(updateData).length > 0) {
              const { error: updatePurchaseError } = await supabase
                .from("purchases")
                .update(updateData)
                .eq("id", purchase.id);

              if (updatePurchaseError) {
                console.error("Error updating purchase:", updatePurchaseError);
              }
            }
          }

          showToast("✅ تم تحديث المنتج والمشتريات المرتبطة به", "success");
        }
      }
    }
  } else {
    // ✅ إضافة منتج جديد
    const { error: insertError } = await supabase
      .from("products")
      .insert([{ ...productData, created_at: new Date().toISOString() }]);
    error = insertError;
  }

  if (error) {
    showToast(`❌ خطأ: ${error.message}`, "error");
  } else {
    showToast(
      editingProduct.value ? "✅ تم التحديث بنجاح" : "✅ تمت الإضافة بنجاح",
      "success",
    );
    closeModal();
    await loadProducts();
    lastUpdated.value = new Date().toLocaleTimeString("ar-EG");
  }
};

// Edit product - مع product_type
const editProduct = (product) => {
  if (!userStore.canEdit) {
    showToast("⚠️ ليس لديك صلاحية لتعديل المنتجات", "warning");
    return;
  }

  editingProduct.value = product;
  formData.value = {
    name: product.name || "",
    price: product.price || null,
    purchase_price: product.purchase_price || null,
    stock: product.stock || 0,
    category: product.category || "",
    sub_category: product.sub_category || "",
    brand: product.brand || "",
    description: product.description || "",
    images: product.images || (product.image_url ? [product.image_url] : []),
    product_type: product.product_type || "in_stock",
  };
  showAddModal.value = true;
  uploadError.value = "";
};

// ✅ دالة نقل المنتج إلى غير متوفرة (بدلاً من حذفه)
const moveToOutOfStock = async (id) => {
  if (!userStore.canEdit) {
    showToast("⚠️ ليس لديك صلاحية", "warning");
    return;
  }

  if (
    !confirm(
      "⚠️ هل أنت متأكد من نقل هذا المنتج إلى 'غير متوفرة'؟\nسيظل المنتج موجوداً للطلب المسبق",
    )
  ) {
    return;
  }

  try {
    const { error } = await supabase
      .from("products")
      .update({
        product_type: "pre_order",
        stock: 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      showToast(`❌ خطأ: ${error.message}`, "error");
    } else {
      await loadProducts();
      await loadProductRequestsCount();
      showToast("✅ تم نقل المنتج إلى المنتجات غير المتوفرة", "success");
    }
  } catch (error) {
    console.error("❌ خطأ:", error);
    showToast("❌ حدث خطأ", "error");
  }
};

// ✅ حذف المنتج (حذف نهائي)
const deleteProduct = async (id) => {
  if (!userStore.canEdit) {
    showToast("⚠️ ليس لديك صلاحية لحذف المنتجات", "warning");
    return;
  }

  if (
    !confirm(
      "⚠️ هل أنت متأكد من حذف هذا المنتج نهائياً؟\nلا يمكن استرجاعه بعد الحذف",
    )
  )
    return;

  const product = products.value.find((p) => p.id === id);

  if (product?.images && product.images.length > 0) {
    for (const imageUrl of product.images) {
      try {
        const fileName = imageUrl.split("/").pop();
        await supabase.storage
          .from("product-images")
          .remove([`products/${fileName}`]);
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    }
  }

  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    showToast(`❌ خطأ: ${error.message}`, "error");
  } else {
    await loadProducts();
    lastUpdated.value = new Date().toLocaleTimeString("ar-EG");
    showToast("✅ تم حذف المنتج نهائياً", "success");
  }
};
// في صفحة المنتجات (products/index.vue)
watch(
  () => formData.value.purchase_price,
  async (newPrice, oldPrice) => {
    if (editingProduct.value && newPrice !== oldPrice) {
      // لو تغير سعر الشراء، حدّث المشتريات
      const { error } = await supabase
        .from("purchases")
        .update({
          unit_price: newPrice,
          total_price: newPrice * editingProduct.value.stock,
        })
        .eq("product_id", editingProduct.value.id);

      if (error) {
        console.error("Error updating purchases:", error);
      }
    }
  },
);
// Close modal
const closeModal = () => {
  showAddModal.value = false;
  editingProduct.value = null;
  uploadError.value = "";
  uploadingImages.value = [];
  formData.value = {
    name: "",
    price: null,
    purchase_price: null,
    stock: null,
    category: "",
    sub_category: "",
    brand: "",
    description: "",
    images: [],
    product_type: "in_stock",
  };
};

onMounted(async () => {
  await loadProducts();
  await loadProductRequestsCount();
  lastUpdated.value = new Date().toLocaleTimeString("ar-EG");
});
</script>

<style scoped>
/* تحسين مظهر الـ select والمودال على الموبايل */
@media (max-width: 640px) {
  select,
  input,
  textarea {
    font-size: 16px !important;
  }
}

/* دوران زر التحديث */
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
</style>
