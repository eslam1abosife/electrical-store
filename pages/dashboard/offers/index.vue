<template>
  <div class="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen" dir="rtl">
    <!-- ================= HEADER ================= -->
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6"
    >
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
          إدارة العروض
        </h1>
        <p class="text-sm text-gray-500">التحكم في العروض والخصومات</p>
      </div>

      <button
        v-if="userStore?.canEdit"
        @click="showAddModal = true"
        class="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl shadow hover:shadow-lg transition flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto"
      >
        <span class="text-lg sm:text-xl">🎁</span>
        إضافة عرض جديد
      </button>
    </div>

    <!-- ================= STATS CARDS ================= -->
    <div
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8"
    >
      <div
        class="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-4 sm:p-6 text-white"
      >
        <div class="flex justify-between items-start">
          <div>
            <p class="text-xs sm:text-sm opacity-90">إجمالي العروض</p>
            <p class="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2">
              {{ totalOffers }}
            </p>
          </div>
          <div class="text-3xl sm:text-4xl">🎁</div>
        </div>
      </div>

      <div
        class="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-4 sm:p-6 text-white"
      >
        <div class="flex justify-between items-start">
          <div>
            <p class="text-xs sm:text-sm opacity-90">أعلى خصم</p>
            <p class="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2">
              {{ maxDiscount }}%
            </p>
          </div>
          <div class="text-3xl sm:text-4xl">⚡</div>
        </div>
      </div>

      <div
        class="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-4 sm:p-6 text-white"
      >
        <div class="flex justify-between items-start">
          <div>
            <p class="text-xs sm:text-sm opacity-90">متوسط الخصم</p>
            <p class="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2">
              {{ avgDiscount }}%
            </p>
          </div>
          <div class="text-3xl sm:text-4xl">📊</div>
        </div>
      </div>

      <div
        class="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 sm:p-6 text-white"
      >
        <div class="flex justify-between items-start">
          <div>
            <p class="text-xs sm:text-sm opacity-90">منتجات مفعلة</p>
            <p class="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2">
              {{ activeOffers }}
            </p>
          </div>
          <div class="text-3xl sm:text-4xl">✅</div>
        </div>
      </div>
    </div>

    <!-- ================= FILTERS ================= -->
    <div class="bg-white rounded-2xl shadow-sm p-3 sm:p-4 mb-6">
      <div
        class="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between"
      >
        <div class="flex gap-2 sm:gap-3 flex-wrap">
          <button
            v-for="filter in filters"
            :key="filter.value"
            @click="currentFilter = filter.value"
            class="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition text-xs sm:text-sm whitespace-nowrap"
            :class="
              currentFilter === filter.value
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            "
          >
            {{ filter.name }}
          </button>
        </div>

        <div class="flex flex-col sm:flex-row gap-3">
          <select
            v-model="sortBy"
            class="px-3 sm:px-4 py-1.5 sm:py-2 border rounded-lg text-sm"
          >
            <option value="discount_desc">أعلى خصم</option>
            <option value="discount_asc">أقل خصم</option>
            <option value="newest">الأحدث</option>
            <option value="oldest">الأقدم</option>
          </select>

          <input
            v-model="searchQuery"
            type="text"
            placeholder="🔍 بحث عن منتج..."
            class="px-3 sm:px-4 py-1.5 sm:py-2 border rounded-lg text-sm w-full sm:w-64"
          />
        </div>
      </div>
    </div>

    <!-- ================= OFFERS TABLE / CARDS ================= -->
    <div class="bg-white rounded-2xl shadow overflow-hidden">
      <!-- Mobile Cards View -->
      <div class="block md:hidden divide-y">
        <div
          v-for="(product, index) in filteredProducts"
          :key="product.id"
          class="p-4 hover:bg-gray-50"
        >
          <!-- Product Header -->
          <div class="flex gap-3 mb-3">
            <img
              :src="getProductImage(product)"
              class="w-14 h-14 object-cover rounded-lg shrink-0"
              :alt="product.name"
            />
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-start">
                <div>
                  <p class="font-semibold text-sm truncate">
                    {{ product.name }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ product.brand || "بدون ماركة" }}
                  </p>
                </div>
                <span
                  class="px-2 py-1 bg-gray-100 rounded-lg text-xs whitespace-nowrap"
                >
                  {{ getCategoryName(product.category) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Product Details -->
          <div class="grid grid-cols-2 gap-3 text-sm mb-3">
            <div>
              <span class="text-gray-500">السعر الأصلي:</span>
              <span class="text-gray-500 line-through mr-1"
                >{{ formatPrice(product.old_price || product.price) }} ج</span
              >
            </div>
            <div>
              <span class="text-gray-500">سعر العرض:</span>
              <span class="text-red-600 font-bold mr-1"
                >{{ formatPrice(product.price) }} ج</span
              >
            </div>
            <div>
              <span class="text-gray-500">الخصم:</span>
              <span class="text-red-600 font-bold mr-1"
                >{{ product.discount }}%</span
              >
            </div>
            <div>
              <span class="text-gray-500">المدة:</span>
              <span
                class="text-sm"
                :class="isExpired(product) ? 'text-red-600' : 'text-green-600'"
              >
                {{ getRemainingDays(product.offer_end_date) }}
              </span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-2 pt-2">
            <button
              v-if="userStore?.canEdit"
              @click="toggleOfferStatus(product)"
              class="flex-1 px-3 py-2 rounded-lg text-xs transition"
              :class="
                product.discount && product.discount > 0
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              "
            >
              {{
                product.discount && product.discount > 0
                  ? "✅ مفعل"
                  : "⭕ غير مفعل"
              }}
            </button>
            <button
              v-if="userStore?.canEdit"
              @click="editOffer(product)"
              class="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs"
            >
              ✏️ تعديل
            </button>
            <button
              v-if="userStore?.canEdit"
              @click="removeOffer(product.id)"
              class="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-xs"
            >
              🗑️ حذف
            </button>
          </div>
        </div>

        <div
          v-if="filteredProducts.length === 0"
          class="text-center p-10 text-gray-400"
        >
          <div class="text-5xl mb-3">🎯</div>
          <p>لا توجد عروض حالياً</p>
          <button
            v-if="userStore?.canEdit"
            @click="showAddModal = true"
            class="block mx-auto mt-3 text-red-600 hover:text-red-700 text-sm"
          >
            أضف عرض جديد +
          </button>
        </div>
      </div>

      <!-- Desktop Table View -->
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full min-w-[1000px]">
          <thead class="bg-gray-100 text-gray-600">
            <tr>
              <th class="p-4 text-right text-sm">#</th>
              <th class="p-4 text-right text-sm">المنتج</th>
              <th class="p-4 text-right text-sm hidden lg:table-cell">القسم</th>
              <th class="p-4 text-right text-sm hidden sm:table-cell">
                السعر الأصلي
              </th>
              <th class="p-4 text-right text-sm">سعر العرض</th>
              <th class="p-4 text-right text-sm">نسبة الخصم</th>
              <th class="p-4 text-right text-sm hidden xl:table-cell">
                المدة المتبقية
              </th>
              <th class="p-4 text-right text-sm hidden lg:table-cell">
                الحالة
              </th>
              <th class="p-4 text-right text-sm">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(product, index) in filteredProducts"
              :key="product.id"
              class="border-t hover:bg-gray-50 transition"
            >
              <td class="p-4 text-gray-500 text-sm">{{ index + 1 }}</td>
              <td class="p-4">
                <div class="flex items-center gap-3">
                  <img
                    :src="getProductImage(product)"
                    class="w-12 h-12 object-cover rounded-lg"
                    :alt="product.name"
                  />
                  <div>
                    <p class="font-semibold text-sm">{{ product.name }}</p>
                    <p class="text-xs text-gray-500">
                      {{ product.brand || "-" }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="p-4 hidden lg:table-cell">
                <span
                  class="px-2 py-1 bg-gray-100 rounded-lg text-xs whitespace-nowrap"
                >
                  {{ getCategoryName(product.category) }}
                </span>
              </td>
              <td class="p-4 hidden sm:table-cell">
                <span
                  class="text-gray-500 line-through text-sm whitespace-nowrap"
                >
                  {{ formatPrice(product.old_price || product.price) }} ج
                </span>
              </td>
              <td class="p-4">
                <span class="text-red-600 font-bold text-sm whitespace-nowrap">
                  {{ formatPrice(product.price) }} ج
                </span>
              </td>
              <td class="p-4">
                <div class="flex items-center gap-2">
                  <span class="text-red-600 font-bold text-sm"
                    >{{ product.discount }}%</span
                  >
                  <div
                    class="w-12 bg-gray-200 rounded-full h-1.5 hidden lg:block"
                  >
                    <div
                      class="bg-red-600 h-1.5 rounded-full"
                      :style="{ width: `${Math.min(product.discount, 100)}%` }"
                    ></div>
                  </div>
                </div>
              </td>
              <td class="p-4 hidden xl:table-cell">
                <span
                  class="text-sm"
                  :class="
                    isExpired(product) ? 'text-red-600' : 'text-green-600'
                  "
                >
                  {{ getRemainingDays(product.offer_end_date) }}
                </span>
              </td>
              <td class="p-4 hidden lg:table-cell">
                <button
                  @click="toggleOfferStatus(product)"
                  class="px-3 py-1 rounded-full text-xs transition whitespace-nowrap"
                  :class="
                    product.discount && product.discount > 0
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  "
                >
                  {{
                    product.discount && product.discount > 0
                      ? "✅ مفعل"
                      : "⭕ غير مفعل"
                  }}
                </button>
              </td>
              <td class="p-4">
                <div class="flex gap-2">
                  <button
                    v-if="userStore?.canEdit"
                    @click="editOffer(product)"
                    class="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition"
                    title="تعديل العرض"
                  >
                    ✏️
                  </button>
                  <button
                    v-if="userStore?.canEdit"
                    @click="removeOffer(product.id)"
                    class="text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                    title="إزالة العرض"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="filteredProducts.length === 0">
              <td colspan="9" class="text-center p-10 text-gray-400">
                <div class="text-5xl mb-3">🎯</div>
                لا توجد عروض حالياً
                <button
                  v-if="userStore?.canEdit"
                  @click="showAddModal = true"
                  class="block mx-auto mt-3 text-red-600 hover:text-red-700"
                >
                  أضف عرض جديد +
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ================= MODAL ADD/EDIT OFFER ================= -->
    <div
      v-if="showAddModal"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      @click.self="showAddModal = false"
    >
      <div
        class="bg-white w-full max-w-lg rounded-2xl shadow-xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
      >
        <div class="flex justify-between items-center mb-4 sm:mb-5">
          <h2 class="text-lg sm:text-xl font-bold">
            {{ editingOffer ? "تعديل العرض" : "إضافة عرض جديد" }}
          </h2>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-gray-600 text-2xl"
          >
            &times;
          </button>
        </div>

        <form @submit.prevent="saveOffer" class="space-y-4">
          <!-- اختيار المنتج -->
          <div v-if="!editingOffer">
            <label class="block text-sm font-semibold mb-2">اختر المنتج</label>
            <select
              v-model="selectedProductId"
              class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
              required
            >
              <option value="">-- اختر منتج --</option>
              <option
                v-for="product in availableProducts"
                :key="product.id"
                :value="product.id"
              >
                {{ product.name }} - {{ formatPrice(product.price) }} ج
              </option>
            </select>
          </div>

          <!-- نسبة الخصم -->
          <div>
            <label class="block text-sm font-semibold mb-2"
              >نسبة الخصم (%)</label
            >
            <div class="flex flex-col sm:flex-row items-center gap-3">
              <input
                v-model.number="offerData.discount"
                type="range"
                min="0"
                max="90"
                step="5"
                class="flex-1 w-full"
              />
              <div class="flex items-center gap-2">
                <input
                  v-model.number="offerData.discount"
                  type="number"
                  min="0"
                  max="90"
                  class="w-20 p-2 sm:p-3 border rounded-xl text-center text-sm"
                />
                <span class="text-gray-600">%</span>
              </div>
            </div>
            <p class="text-sm text-gray-500 mt-2">
              السعر بعد الخصم:
              <span class="text-red-600 font-bold"
                >{{ formatPrice(calculatedPrice) }} ج</span
              >
            </p>
          </div>

          <!-- تاريخ الانتهاء -->
          <div>
            <label class="block text-sm font-semibold mb-2"
              >تاريخ انتهاء العرض (اختياري)</label
            >
            <input
              v-model="offerData.end_date"
              type="datetime-local"
              class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
            />
          </div>

          <!-- تفعيل العرض فوراً -->
          <div class="flex items-center gap-3">
            <input
              v-model="offerData.active"
              type="checkbox"
              id="active"
              class="w-5 h-5"
            />
            <label for="active" class="text-sm font-semibold"
              >تفعيل العرض فوراً</label
            >
          </div>

          <!-- رسالة الخطأ -->
          <div
            v-if="offerError"
            class="bg-red-50 text-red-600 p-2 sm:p-3 rounded-xl text-xs sm:text-sm"
          >
            {{ offerError }}
          </div>

          <div class="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              class="flex-1 bg-red-600 text-white py-2.5 sm:py-3 rounded-xl hover:bg-red-700 transition text-sm sm:text-base"
            >
              {{ editingOffer ? "تحديث العرض" : "إضافة العرض" }}
            </button>
            <button
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

    <!-- ================= BULK OFFER MODAL ================= -->
    <div
      v-if="showBulkModal"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      @click.self="showBulkModal = false"
    >
      <div class="bg-white w-full max-w-lg rounded-2xl shadow-xl p-4 sm:p-6">
        <div class="flex justify-between items-center mb-4 sm:mb-5">
          <h2 class="text-lg sm:text-xl font-bold">عرض جماعي</h2>
          <button
            @click="showBulkModal = false"
            class="text-gray-400 hover:text-gray-600 text-2xl"
          >
            &times;
          </button>
        </div>

        <form @submit.prevent="applyBulkOffer" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold mb-2">اختر القسم</label>
            <select
              v-model="bulkData.category"
              class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
            >
              <option value="all">جميع الأقسام</option>
              <option value="electrical">الأجهزة الكهربائية</option>
              <option value="home">الأدوات المنزلية</option>
              <option value="plastic">البلاستيك</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold mb-2"
              >نسبة الخصم (%)</label
            >
            <input
              v-model.number="bulkData.discount"
              type="number"
              min="0"
              max="90"
              class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
              required
            />
          </div>

          <div class="bg-blue-50 p-3 sm:p-4 rounded-xl">
            <p class="text-xs sm:text-sm text-blue-800">
              ℹ️ سيتم تطبيق خصم {{ bulkData.discount }}% على
              {{ getProductsCount }} منتج
            </p>
          </div>

          <div class="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              class="flex-1 bg-red-600 text-white py-2.5 sm:py-3 rounded-xl hover:bg-red-700 text-sm sm:text-base"
            >
              تطبيق العرض
            </button>
            <button
              type="button"
              @click="showBulkModal = false"
              class="flex-1 bg-gray-200 py-2.5 sm:py-3 rounded-xl hover:bg-gray-300 text-sm sm:text-base"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Floating Action Button for Bulk Offer -->
    <button
      v-if="userStore?.canEdit"
      @click="showBulkModal = true"
      class="fixed bottom-6 sm:bottom-8 left-4 sm:left-8 bg-red-600 text-white p-3 sm:p-4 rounded-full shadow-lg hover:bg-red-700 transition hover:scale-110 z-30"
      title="عرض جماعي"
    >
      <span class="text-xl sm:text-2xl">🎯</span>
    </button>

    <!-- Toast Notification -->
    <ToastNotification v-model:toast="toast" />
  </div>
</template>

<script setup>
definePageMeta({
  layout: "dashboard",
  middleware: "admin-only",
});

const supabase = useSupabaseClient();
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
const showBulkModal = ref(false);
const editingOffer = ref(null);
const selectedProductId = ref("");
const searchQuery = ref("");
const currentFilter = ref("all");
const sortBy = ref("discount_desc");
const offerError = ref("");

const filters = [
  { name: "الكل", value: "all" },
  { name: "عروض نشطة", value: "active" },
  { name: "عروض منتهية", value: "expired" },
  { name: "بدون عروض", value: "no_offer" },
];

const offerData = ref({
  discount: 0,
  end_date: "",
  active: true,
});

const bulkData = ref({
  category: "all",
  discount: 0,
});

// Computed
const totalOffers = computed(() => {
  return products.value.filter((p) => p.discount && p.discount > 0).length;
});

const maxDiscount = computed(() => {
  const discounts = products.value
    .filter((p) => p.discount)
    .map((p) => p.discount);
  return discounts.length ? Math.max(...discounts) : 0;
});

const avgDiscount = computed(() => {
  const discounts = products.value
    .filter((p) => p.discount)
    .map((p) => p.discount);
  return discounts.length
    ? Math.round(discounts.reduce((a, b) => a + b, 0) / discounts.length)
    : 0;
});

const activeOffers = computed(() => {
  return products.value.filter((p) => p.discount && p.discount > 0).length;
});

const availableProducts = computed(() => {
  return products.value.filter((p) => !p.discount || p.discount === 0);
});

const calculatedPrice = computed(() => {
  const product = products.value.find((p) => p.id === selectedProductId.value);
  if (!product || !offerData.value.discount) return 0;
  return product.price * (1 - offerData.value.discount / 100);
});

const getProductsCount = computed(() => {
  let filtered = [...products.value];
  if (bulkData.value.category !== "all") {
    filtered = filtered.filter((p) => p.category === bulkData.value.category);
  }
  return filtered.filter((p) => !p.discount || p.discount === 0).length;
});

const filteredProducts = computed(() => {
  let list = [...products.value];

  if (searchQuery.value) {
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchQuery.value.toLowerCase()),
    );
  }

  if (currentFilter.value === "active") {
    list = list.filter((p) => p.discount && p.discount > 0);
  } else if (currentFilter.value === "expired") {
    list = list.filter((p) => {
      if (!p.discount || p.discount === 0) return false;
      if (!p.offer_end_date) return false;
      return new Date(p.offer_end_date) < new Date();
    });
  } else if (currentFilter.value === "no_offer") {
    list = list.filter((p) => !p.discount || p.discount === 0);
  }

  if (sortBy.value === "discount_desc") {
    list.sort((a, b) => (b.discount || 0) - (a.discount || 0));
  } else if (sortBy.value === "discount_asc") {
    list.sort((a, b) => (a.discount || 0) - (b.discount || 0));
  } else if (sortBy.value === "newest") {
    list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } else if (sortBy.value === "oldest") {
    list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }

  return list;
});

// Helper Functions
const isExpired = (product) => {
  if (!product.offer_end_date) return false;
  return new Date(product.offer_end_date) < new Date();
};

const formatPrice = (price) => {
  if (!price) return "0";
  return new Intl.NumberFormat("ar-EG").format(price);
};

const getCategoryName = (categoryValue) => {
  const categories = {
    electrical: "أجهزة كهربائية",
    home: "أدوات منزلية",
    plastic: "بلاستيك",
  };
  return categories[categoryValue] || categoryValue;
};

const getProductImage = (product) => {
  if (product.images && product.images.length > 0) {
    return product.images[0];
  }
  return product.image_url || "/images/placeholder.jpg";
};

const getRemainingDays = (endDate) => {
  if (!endDate) return "غير محدد";
  const end = new Date(endDate);
  const now = new Date();
  const diff = end - now;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return "انتهى العرض";
  if (days === 0) return "ينتهي اليوم";
  if (days === 1) return "ينتهي غداً";
  return `${days} أيام`;
};

const loadProducts = async () => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;

    products.value = (data || []).map((p) => ({
      ...p,
      discount: p.discount || 0,
      old_price: p.old_price || null,
      images: p.images || (p.image_url ? [p.image_url] : []),
      sold_count: p.sold_count || 0,
      rating: p.rating || 0,
      reviews_count: p.reviews_count || 0,
    }));
  } catch (error) {
    console.error("Error loading products:", error);
    showToast("❌ حدث خطأ في تحميل المنتجات", "error");
  }
};

const saveOffer = async () => {
  if (!userStore.canEdit) {
    showToast("⚠️ ليس لديك صلاحية لإضافة أو تعديل العروض", "warning");
    return;
  }

  offerError.value = "";

  if (!editingOffer.value && !selectedProductId.value) {
    offerError.value = "الرجاء اختيار منتج";
    return;
  }

  if (!offerData.value.discount || offerData.value.discount < 0) {
    offerError.value = "نسبة الخصم غير صالحة";
    return;
  }

  const productId = editingOffer.value
    ? editingOffer.value.id
    : selectedProductId.value;
  const product = products.value.find((p) => p.id === productId);

  if (!product) {
    offerError.value = "المنتج غير موجود";
    return;
  }

  const originalPrice = product.old_price || product.price;
  const newPrice = originalPrice * (1 - offerData.value.discount / 100);

  const updateData = {
    discount: offerData.value.discount,
    old_price: originalPrice,
    price: Math.round(newPrice),
    updated_at: new Date().toISOString(),
  };

  if (offerData.value.end_date) {
    updateData.offer_end_date = offerData.value.end_date;
  }

  try {
    const { error } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", productId);
    if (error) throw error;

    closeModal();
    await loadProducts();
    showToast(
      editingOffer.value
        ? "✅ تم تحديث العرض بنجاح"
        : "✅ تم إضافة العرض بنجاح",
      "success",
    );
  } catch (error) {
    console.error("Save error:", error);
    offerError.value = error.message || "حدث خطأ أثناء حفظ العرض";
    showToast("❌ " + (error.message || "حدث خطأ أثناء حفظ العرض"), "error");
  }
};

const applyBulkOffer = async () => {
  if (!userStore.canEdit) {
    showToast("⚠️ ليس لديك صلاحية لتطبيق العروض الجماعية", "warning");
    return;
  }

  if (!bulkData.value.discount || bulkData.value.discount < 0) {
    showToast("⚠️ الرجاء إدخال نسبة خصم صالحة", "warning");
    return;
  }

  let filtered = [...products.value];
  if (bulkData.value.category !== "all") {
    filtered = filtered.filter((p) => p.category === bulkData.value.category);
  }

  filtered = filtered.filter((p) => !p.discount || p.discount === 0);

  if (filtered.length === 0) {
    showToast("⚠️ لا توجد منتجات متاحة لعمل عرض عليها", "warning");
    return;
  }

  if (
    !confirm(
      `هل أنت متأكد من تطبيق خصم ${bulkData.value.discount}% على ${filtered.length} منتج؟`,
    )
  ) {
    return;
  }

  let successCount = 0;
  for (const product of filtered) {
    const originalPrice = product.old_price || product.price;
    const newPrice = originalPrice * (1 - bulkData.value.discount / 100);

    const { error } = await supabase
      .from("products")
      .update({
        discount: bulkData.value.discount,
        old_price: originalPrice,
        price: Math.round(newPrice),
        updated_at: new Date().toISOString(),
      })
      .eq("id", product.id);

    if (!error) successCount++;
  }

  showToast(`✅ تم تطبيق العرض على ${successCount} منتج`, "success");
  showBulkModal.value = false;
  bulkData.value = { category: "all", discount: 0 };
  await loadProducts();
};

const removeOffer = async (id) => {
  if (!userStore.canEdit) {
    showToast("⚠️ ليس لديك صلاحية لإزالة العروض", "warning");
    return;
  }

  if (!confirm("هل أنت متأكد من إزالة العرض عن هذا المنتج؟")) return;

  const product = products.value.find((p) => p.id === id);
  if (!product) return;

  try {
    const { error } = await supabase
      .from("products")
      .update({
        discount: 0,
        price: product.old_price || product.price,
        old_price: null,
        offer_end_date: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (!error) {
      await loadProducts();
      showToast("✅ تم إزالة العرض بنجاح", "success");
    }
  } catch (error) {
    console.error("Remove error:", error);
    showToast("❌ حدث خطأ أثناء إزالة العرض", "error");
  }
};

const editOffer = (product) => {
  if (!userStore.canEdit) {
    showToast("⚠️ ليس لديك صلاحية لتعديل العروض", "warning");
    return;
  }

  editingOffer.value = product;
  selectedProductId.value = product.id;
  offerData.value = {
    discount: product.discount || 0,
    end_date: product.offer_end_date || "",
    active: product.discount > 0,
  };
  showAddModal.value = true;
};

const toggleOfferStatus = async (product) => {
  if (!userStore.canEdit) {
    showToast("⚠️ ليس لديك صلاحية لتغيير حالة العرض", "warning");
    return;
  }

  if (product.discount && product.discount > 0) {
    await removeOffer(product.id);
  } else {
    editOffer(product);
  }
};

const closeModal = () => {
  showAddModal.value = false;
  editingOffer.value = null;
  selectedProductId.value = "";
  offerError.value = "";
  offerData.value = {
    discount: 0,
    end_date: "",
    active: true,
  };
};

onMounted(loadProducts);
</script>

<style scoped>
/* تحسين مظهر الـ range input */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  background: #dc2626;
  border-radius: 50%;
  cursor: pointer;
}

/* منع zoom على iOS */
@media (max-width: 640px) {
  select,
  input,
  button {
    font-size: 16px !important;
  }
}

/* Floating button responsive */
@media (max-width: 640px) {
  .fixed.bottom-6 {
    bottom: 70px;
  }
}
</style>
