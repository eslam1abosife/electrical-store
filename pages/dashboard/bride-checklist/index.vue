<template>
  <div class="min-h-screen bg-gray-50" dir="rtl">
    <div class="p-3 sm:p-4 md:p-6">
      <!-- Header -->
      <div class="mb-6">
        <div
          class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
              📋 كشوفات العرائس
            </h1>
            <p class="text-gray-500 text-sm">
              إنشاء كشف كامل للعروسة - كهرباء - منزلي - بلاستيك
            </p>
          </div>
          <div class="flex gap-2">
            <button
              @click="showSavedChecklists = !showSavedChecklists"
              class="bg-gray-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-gray-700"
            >
              📋 الكشوفات السابقة
            </button>
            <button
              v-if="userStore?.canEdit"
              @click="startNewChecklist"
              class="bg-pink-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-pink-700"
            >
              ➕ كشف جديد
            </button>
          </div>
        </div>
      </div>

      <!-- Saved Checklists Modal -->
      <div
        v-if="showSavedChecklists"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        @click.self="showSavedChecklists = false"
      >
        <div
          class="bg-white rounded-2xl w-full max-w-4xl max-h-[80vh] overflow-y-auto"
        >
          <div
            class="p-4 border-b flex justify-between items-center sticky top-0 bg-white"
          >
            <h2 class="text-xl font-bold">📋 الكشوفات السابقة</h2>
            <button
              @click="showSavedChecklists = false"
              class="text-2xl hover:text-gray-600"
            >
              &times;
            </button>
          </div>
          <div class="p-4">
            <div class="overflow-x-auto">
              <table class="w-full min-w-[500px]">
                <thead class="bg-gray-100">
                  <tr>
                    <th class="p-3 text-right text-sm">اسم العروسة</th>
                    <th class="p-3 text-right text-sm">التاريخ</th>
                    <th class="p-3 text-right text-sm">عدد المنتجات</th>
                    <th class="p-3 text-right text-sm">الإجمالي</th>
                    <th class="p-3 text-right text-sm">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="checklist in savedChecklists"
                    :key="checklist.id"
                    class="border-t hover:bg-gray-50"
                  >
                    <td class="p-3 font-medium text-sm">
                      {{ checklist.bride_name }}
                    </td>
                    <td class="p-3 text-sm">
                      {{ formatDate(checklist.checklist_date) }}
                    </td>
                    <td class="p-3 text-sm">
                      {{ checklist.total_items }} قطعة
                    </td>
                    <td class="p-3 text-green-600 font-bold text-sm">
                      {{ formatNumber(checklist.total_amount) }} ج
                    </td>
                    <td class="p-3">
                      <div class="flex gap-2">
                        <button
                          @click="loadChecklist(checklist.id)"
                          class="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          👁️ عرض
                        </button>
                        <button
                          v-if="userStore?.canEdit"
                          @click="deleteChecklist(checklist.id)"
                          class="text-red-600 hover:text-red-800 text-sm"
                        >
                          🗑️ حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="savedChecklists.length === 0">
                    <td colspan="5" class="text-center py-8 text-gray-400">
                      لا توجد كشوفات سابقة
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Bride Info Card -->
      <div class="bg-white rounded-2xl shadow p-4 sm:p-6 mb-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >اسم العروسة *</label
            >
            <input
              v-model="brideInfo.name"
              type="text"
              placeholder="مثال: أسماء محمد"
              class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-pink-500 text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >رقم الهاتف</label
            >
            <input
              v-model="brideInfo.phone"
              type="tel"
              placeholder="٠١٠٠٠٠٠٠٠٠"
              class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-pink-500 text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >تاريخ الكشف</label
            >
            <input
              v-model="brideInfo.date"
              type="date"
              class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-pink-500 text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >اسم البائع</label
            >
            <input
              v-model="brideInfo.seller"
              type="text"
              placeholder="اسم الموظف"
              class="w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-pink-500 text-sm"
            />
          </div>
        </div>

        <!-- طريقة الدفع -->
        <div class="mt-4 pt-4 border-t">
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >طريقة الدفع</label
          >
          <div class="flex flex-wrap gap-4">
            <label class="flex items-center gap-2">
              <input
                type="radio"
                value="cash"
                v-model="brideInfo.payment_method"
                class="w-4 h-4"
              />
              <span>💰 كاش</span>
            </label>
            <label class="flex items-center gap-2">
              <input
                type="radio"
                value="card"
                v-model="brideInfo.payment_method"
                class="w-4 h-4"
              />
              <span>💳 بطاقة</span>
            </label>
            <label class="flex items-center gap-2">
              <input
                type="radio"
                value="installments"
                v-model="brideInfo.payment_method"
                class="w-4 h-4"
              />
              <span>📅 تقسيط</span>
            </label>
          </div>
        </div>

        <!-- بيانات التقسيط -->
        <div
          v-if="brideInfo.payment_method === 'installments'"
          class="mt-4 pt-4 border-t"
        >
          <h3 class="font-bold text-base mb-3 text-purple-600">
            📅 بيانات التقسيط
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">دفعة مقدمة</label>
              <input
                v-model.number="installmentData.down_payment"
                type="number"
                min="0"
                class="w-full p-2.5 border rounded-xl text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">عدد الأقساط</label>
              <input
                v-model.number="installmentData.installment_count"
                type="number"
                min="1"
                max="24"
                class="w-full p-2.5 border rounded-xl text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1"
                >قيمة القسط الشهري</label
              >
              <input
                :value="installmentData.installment_amount"
                type="text"
                readonly
                class="w-full p-2.5 border rounded-xl bg-gray-100 text-sm"
              />
            </div>
          </div>
          <p class="text-xs text-gray-500 mt-2">
            💡 سيتم إنشاء عقد تقسيط تلقائياً عند تأكيد البيع
          </p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-2 flex-wrap mb-6 border-b">
        <button
          @click="activeTab = 'electrical'"
          class="px-4 sm:px-6 py-2 sm:py-3 font-medium transition text-sm sm:text-base"
          :class="
            activeTab === 'electrical'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500'
          "
        >
          ⚡ الأجهزة الكهربائية
        </button>
        <button
          @click="activeTab = 'home'"
          class="px-4 sm:px-6 py-2 sm:py-3 font-medium transition text-sm sm:text-base"
          :class="
            activeTab === 'home'
              ? 'border-b-2 border-green-600 text-green-600'
              : 'text-gray-500'
          "
        >
          🏠 الأدوات المنزلية
        </button>
        <button
          @click="activeTab = 'plastic'"
          class="px-4 sm:px-6 py-2 sm:py-3 font-medium transition text-sm sm:text-base"
          :class="
            activeTab === 'plastic'
              ? 'border-b-2 border-purple-600 text-purple-600'
              : 'text-gray-500'
          "
        >
          🪑 البلاستيك والتخزين
        </button>
        <button
          @click="activeTab = 'external'"
          class="px-4 sm:px-6 py-2 sm:py-3 font-medium transition text-sm sm:text-base"
          :class="
            activeTab === 'external'
              ? 'border-b-2 border-orange-600 text-orange-600'
              : 'text-gray-500'
          "
        >
          📦 منتجات خارجية
        </button>
      </div>

      <!-- Products Section -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Products List -->
        <div class="lg:col-span-2 bg-white rounded-2xl shadow overflow-hidden">
          <div class="p-4 border-b bg-gray-50">
            <div class="flex justify-between items-center flex-wrap gap-3">
              <h2 class="font-bold text-lg">{{ getTabTitle() }}</h2>
              <div class="relative">
                <input
                  type="text"
                  v-model="searchProduct"
                  placeholder="🔍 بحث..."
                  class="p-2 border rounded-xl text-sm w-48 sm:w-64"
                />
              </div>
            </div>
          </div>

          <div class="max-h-[500px] overflow-y-auto">
            <!-- Products from Database -->
            <div v-if="activeTab !== 'external'">
              <div
                v-for="product in filteredProducts"
                :key="product.id"
                class="border-b p-4 hover:bg-gray-50 transition"
              >
                <div
                  class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                >
                  <div class="flex-1">
                    <h3
                      class="font-semibold text-gray-800 text-sm sm:text-base"
                    >
                      {{ product.name }}
                    </h3>
                    <p class="text-xs sm:text-sm text-gray-500">
                      {{ product.brand || "بدون ماركة" }}
                    </p>
                    <p
                      class="text-blue-600 font-bold mt-1 text-sm sm:text-base"
                    >
                      {{ formatNumber(product.price) }} ج
                    </p>
                    <p
                      v-if="product.stock !== undefined"
                      class="text-xs text-gray-400"
                    >
                      المخزون: {{ product.stock }} قطعة
                    </p>
                  </div>
                  <div class="flex flex-wrap items-center gap-2">
                    <div class="flex items-center border rounded-lg">
                      <button
                        v-if="userStore?.canEdit"
                        @click="
                          product.selectedQuantity = Math.max(
                            1,
                            (product.selectedQuantity || 1) - 1,
                          )
                        "
                        class="px-2 py-1 hover:bg-gray-100 text-sm"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        v-model.number="product.selectedQuantity"
                        min="1"
                        class="w-12 text-center border-x py-1 text-sm"
                      />
                      <button
                        v-if="userStore?.canEdit"
                        @click="
                          product.selectedQuantity =
                            (product.selectedQuantity || 1) + 1
                        "
                        class="px-2 py-1 hover:bg-gray-100 text-sm"
                      >
                        +
                      </button>
                    </div>
                    <input
                      type="number"
                      v-model.number="product.customPrice"
                      placeholder="سعر خاص"
                      class="w-24 p-2 border rounded-lg text-center text-sm"
                    />
                    <button
                      v-if="userStore?.canEdit"
                      @click="addToBrideList(product)"
                      class="bg-pink-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-pink-700 transition"
                    >
                      ➕ إضافة
                    </button>
                  </div>
                </div>
              </div>
              <div
                v-if="filteredProducts.length === 0"
                class="text-center py-12 text-gray-400"
              >
                لا توجد منتجات في هذا القسم
              </div>
            </div>

            <!-- External Products -->
            <div v-else>
              <div class="p-4">
                <button
                  v-if="userStore?.canEdit"
                  @click="addExternalProduct"
                  class="w-full bg-orange-600 text-white py-3 rounded-xl hover:bg-orange-700 transition text-sm"
                >
                  + إضافة منتج خارجي
                </button>
              </div>
              <div
                v-for="(item, index) in externalProducts"
                :key="index"
                class="border-b p-4 hover:bg-gray-50"
              >
                <div
                  class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                >
                  <div class="flex-1 w-full">
                    <input
                      v-model="item.name"
                      placeholder="اسم المنتج"
                      class="w-full p-2 border rounded-lg text-sm"
                    />
                  </div>
                  
                  <!-- ✅ قائمة منسدلة لاختيار التصنيف -->
                  <div class="w-32">
                    <select
                      v-model="item.category"
                      class="w-full p-2 border rounded-lg text-sm bg-white"
                    >
                      <option value="electrical">⚡ كهرباء</option>
                      <option value="home">🏠 منزلي</option>
                      <option value="plastic">🪑 بلاستيك</option>
                    </select>
                  </div>
                  
                  <div class="flex items-center gap-2">
                    <div class="flex items-center border rounded-lg">
                      <button
                        v-if="userStore?.canEdit"
                        @click="
                          item.quantity = Math.max(1, (item.quantity || 1) - 1)
                        "
                        class="px-2 py-1 hover:bg-gray-100 text-sm"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        v-model.number="item.quantity"
                        min="1"
                        class="w-12 text-center border-x py-1 text-sm"
                      />
                      <button
                        v-if="userStore?.canEdit"
                        @click="item.quantity = (item.quantity || 1) + 1"
                        class="px-2 py-1 hover:bg-gray-100 text-sm"
                      >
                        +
                      </button>
                    </div>
                    <input
                      type="number"
                      v-model.number="item.price"
                      placeholder="السعر"
                      class="w-24 p-2 border rounded-lg text-center text-sm"
                    />
                    <button
                      v-if="userStore?.canEdit"
                      @click="addExternalToBrideItem(item, index)"
                      class="bg-pink-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-pink-700"
                    >
                      ➕ إضافة
                    </button>
                    <button
                      v-if="userStore?.canEdit"
                      @click="removeExternalProduct(index)"
                      class="text-red-500 hover:text-red-700 text-lg"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bride List Summary -->
        <div class="bg-white rounded-2xl shadow h-fit sticky top-28">
          <div class="p-4 border-b bg-gradient-to-r from-pink-50 to-rose-50">
            <h2 class="font-bold text-base sm:text-lg flex items-center gap-2">
              🎁 كشف العروسة
              <span class="text-pink-600">{{
                brideInfo.name || "جاري الإدخال"
              }}</span>
            </h2>
            <p class="text-xs sm:text-sm text-gray-500">
              {{ brideList.length }} منتج
            </p>
          </div>

          <div class="max-h-96 overflow-y-auto p-4 space-y-3">
            <div
              v-for="(item, idx) in brideList"
              :key="idx"
              class="border rounded-xl p-3 hover:shadow-md transition"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <p class="font-semibold text-sm">{{ item.name }}</p>
                  <p class="text-xs text-gray-500">{{ item.categoryName }}</p>
                  <div class="flex flex-wrap gap-3 mt-1 text-xs">
                    <span>الكمية: {{ item.quantity }}</span>
                    <span class="text-blue-600"
                      >{{ formatNumber(item.price) }} ج</span
                    >
                    <span v-if="item.total" class="text-green-600"
                      >الإجمالي: {{ formatNumber(item.total) }} ج</span
                    >
                  </div>
                </div>
                <div class="flex gap-2">
                  <button
                    v-if="userStore?.canEdit"
                    @click="editBrideItem(idx)"
                    class="text-blue-500 hover:text-blue-700 text-sm"
                  >
                    ✏️
                  </button>
                  <button
                    v-if="userStore?.canEdit"
                    @click="removeFromBrideList(idx)"
                    class="text-red-500 hover:text-red-700 text-sm"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
            <div
              v-if="brideList.length === 0"
              class="text-center py-8 text-gray-400 text-sm"
            >
              لم يتم إضافة أي منتجات بعد
            </div>
          </div>

          <div class="border-t p-4 bg-gray-50">
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span>إجمالي المنتجات:</span>
                <span class="font-bold">{{ totalItems }} قطعة</span>
              </div>
              <div class="flex justify-between text-base sm:text-lg font-bold">
                <span>الإجمالي الكلي:</span>
                <span class="text-pink-600"
                  >{{ formatNumber(totalPrice) }} ج</span
                >
              </div>
            </div>
            <div class="flex flex-wrap gap-2 mt-4">
              <button
                v-if="userStore?.canEdit"
                @click="convertToSale"
                :disabled="brideList.length === 0 || !brideInfo.name"
                class="flex-1 bg-purple-600 text-white py-2.5 rounded-xl hover:bg-purple-700 transition text-sm disabled:opacity-50"
              >
                💰 تحويل إلى بيع
              </button>

              <button
                v-if="userStore?.canEdit"
                @click="addToSalesCart"
                :disabled="brideList.length === 0"
                class="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl hover:bg-indigo-700 transition text-sm disabled:opacity-50"
              >
                🛒 إضافة للسلة
              </button>

              <button
                @click="generatePDF"
                class="flex-1 bg-green-600 text-white py-2.5 rounded-xl hover:bg-green-700 transition text-sm"
              >
                📄 PDF
              </button>
              <button
                @click="printInvoice"
                class="flex-1 bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 transition text-sm"
              >
                🖨️ طباعة
              </button>
              <button
                v-if="userStore?.canEdit"
                @click="clearAll"
                class="px-4 bg-gray-200 text-gray-700 py-2.5 rounded-xl hover:bg-gray-300 transition text-sm"
              >
                مسح
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      @click.self="showEditModal = false"
    >
      <div class="bg-white rounded-2xl p-6 w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">✏️ تعديل المنتج</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">الاسم</label>
            <input
              v-model="editItem.name"
              class="w-full p-3 border rounded-xl text-sm"
            />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium mb-1">الكمية</label>
              <input
                v-model.number="editItem.quantity"
                type="number"
                min="1"
                class="w-full p-3 border rounded-xl text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">السعر</label>
              <input
                v-model.number="editItem.price"
                type="number"
                min="0"
                class="w-full p-3 border rounded-xl text-sm"
              />
            </div>
          </div>
          <div class="flex gap-3 pt-4">
            <button
              v-if="userStore?.canEdit"
              @click="saveEdit"
              class="flex-1 bg-blue-600 text-white py-3 rounded-xl text-sm"
            >
              حفظ
            </button>
            <button
              v-if="userStore?.canEdit"
              @click="showEditModal = false"
              class="flex-1 bg-gray-200 py-3 rounded-xl text-sm"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div
      v-if="toast.show"
      class="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-50 animate-slide-up sm:max-w-sm"
    >
      <div
        class="bg-gray-800 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2"
      >
        <span>{{ toast.icon }}</span>
        <span class="text-sm">{{ toast.message }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "dashboard",
  middleware: "admin-only",
});

import { supabase } from '~/lib/supabase';
const userStore = useUserStore();

// رقم المعرض
const STORE_PHONE = "01034003002";

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
const activeTab = ref("electrical");
const searchProduct = ref("");
const products = ref([]);
const brideList = ref([]);
const externalProducts = ref([]);
const showEditModal = ref(false);
const showSavedChecklists = ref(false);
const editItem = ref({});
const editIndex = ref(-1);
const saving = ref(false);
const savedChecklists = ref([]);
const html2pdf = ref(null);

const brideInfo = ref({
  name: "",
  phone: "",
  date: new Date().toISOString().split("T")[0],
  seller: "",
  payment_method: "cash",
});

// بيانات التقسيط
const installmentData = ref({
  down_payment: 0,
  installment_count: 6,
  installment_amount: 0,
});

// Computed
const totalItems = computed(() => {
  return brideList.value.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0),
    0,
  );
});

const totalPrice = computed(() => {
  return brideList.value.reduce(
    (sum, item) =>
      sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0,
  );
});

// حساب قيمة القسط
const calculateInstallmentAmount = () => {
  const remaining =
    totalPrice.value - (installmentData.value.down_payment || 0);
  const count = installmentData.value.installment_count || 1;
  installmentData.value.installment_amount = Math.ceil(remaining / count);
};

// Watch
watch(
  [
    totalPrice,
    () => installmentData.value.down_payment,
    () => installmentData.value.installment_count,
  ],
  () => {
    if (
      brideInfo.value.payment_method === "installments" &&
      totalPrice.value > 0
    ) {
      calculateInstallmentAmount();
    }
  },
);

// تحميل مكتبة html2pdf
onMounted(async () => {
  await loadProducts();
  await loadSavedChecklists();

  if (process.client) {
    const module = await import("html2pdf.js");
    html2pdf.value = module.default;
  }
});

// Load products from database
const loadProducts = async () => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("name");
    if (error) throw error;
    if (data) {
      products.value = data.map((p) => ({
        ...p,
        selectedQuantity: 1,
        customPrice: p.price,
      }));
    }
  } catch (error) {
    console.error("Error loading products:", error);
    showToast("❌ حدث خطأ في تحميل المنتجات", "error");
  }
};

// Load saved checklists
const loadSavedChecklists = async () => {
  try {
    const { data, error } = await supabase
      .from("bride_checklists")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    savedChecklists.value = data || [];
  } catch (error) {
    console.error("Error loading saved checklists:", error);
  }
};

// Save checklist to database
const saveChecklist = async () => {
  if (!brideInfo.value.name || brideInfo.value.name.trim() === "") {
    showToast("⚠️ يرجى إدخال اسم العروسة أولاً", "warning");
    return;
  }

  if (brideList.value.length === 0) {
    showToast("⚠️ لا توجد منتجات في الكشف. يرجى إضافة منتجات أولاً", "warning");
    return;
  }

  saving.value = true;

  try {
    const { data: checklist, error: checklistError } = await supabase
      .from("bride_checklists")
      .insert([
        {
          bride_name: brideInfo.value.name.trim(),
          bride_phone: brideInfo.value.phone || null,
          checklist_date: brideInfo.value.date,
          seller_name: brideInfo.value.seller || null,
          total_amount: totalPrice.value,
          total_items: totalItems.value,
          created_by: userStore.user?.id,
        },
      ])
      .select();

    if (checklistError) throw checklistError;

    const itemsToSave = brideList.value.map((item) => ({
      checklist_id: checklist[0].id,
      product_id:
        item.id && !String(item.id).startsWith("ext_") ? item.id : null,
      product_name: item.name,
      product_brand: item.brand || null,
      shop_name: null,
      category: item.category || "external",
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity,
      is_external: item.type === "external",
    }));

    const { error: itemsError } = await supabase
      .from("bride_checklist_items")
      .insert(itemsToSave);
    if (itemsError) throw itemsError;

    showToast("✅ تم حفظ الكشف بنجاح", "success");
    await loadSavedChecklists();
  } catch (error) {
    console.error("Save error:", error);
    showToast("❌ حدث خطأ أثناء الحفظ", "error");
  } finally {
    saving.value = false;
  }
};

// Load existing checklist
const loadChecklist = async (id) => {
  try {
    const { data: checklist, error: checklistError } = await supabase
      .from("bride_checklists")
      .select("*")
      .eq("id", id)
      .single();

    if (checklistError) throw checklistError;

    const { data: items, error: itemsError } = await supabase
      .from("bride_checklist_items")
      .select("*")
      .eq("checklist_id", id);

    if (itemsError) throw itemsError;

    if (checklist) {
      brideInfo.value = {
        name: checklist.bride_name,
        phone: checklist.bride_phone || "",
        date: checklist.checklist_date,
        seller: checklist.seller_name || "",
        payment_method: "cash",
      };

      brideList.value = (items || []).map((item) => ({
        id: item.product_id || "ext_" + item.id,
        name: item.product_name,
        brand: item.product_brand,
        shop: null,
        category: item.category,
        categoryName: getCategoryName(item.category),
        quantity: item.quantity,
        price: item.price,
        total: item.total,
        type: item.is_external ? "external" : "internal",
      }));
    }

    showSavedChecklists.value = false;
    showToast("✅ تم تحميل الكشف بنجاح", "success");
  } catch (error) {
    console.error("Load error:", error);
    showToast("❌ حدث خطأ أثناء التحميل", "error");
  }
};

// Delete checklist
const deleteChecklist = async (id) => {
  if (!confirm("هل أنت متأكد من حذف هذا الكشف؟")) return;

  try {
    const { error } = await supabase
      .from("bride_checklists")
      .delete()
      .eq("id", id);
    if (error) throw error;
    showToast("✅ تم حذف الكشف بنجاح", "success");
    await loadSavedChecklists();
  } catch (error) {
    console.error("Delete error:", error);
    showToast("❌ حدث خطأ أثناء الحذف", "error");
  }
};

// Start new checklist
const startNewChecklist = () => {
  if (
    brideList.value.length > 0 &&
    !confirm("هل تريد مسح الكشف الحالي وإنشاء كشف جديد؟")
  )
    return;

  brideInfo.value = {
    name: "",
    phone: "",
    date: new Date().toISOString().split("T")[0],
    seller: "",
    payment_method: "cash",
  };
  installmentData.value = {
    down_payment: 0,
    installment_count: 6,
    installment_amount: 0,
  };
  brideList.value = [];
  externalProducts.value = [];
  showToast("✨ بدأت كشف جديد", "success");
};

// Filtered products
const filteredProducts = computed(() => {
  let list = products.value.filter((p) => p.category === activeTab.value);
  if (searchProduct.value) {
    const q = searchProduct.value.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q),
    );
  }
  return list;
});

// Get tab title
const getTabTitle = () => {
  const titles = {
    electrical: "⚡ الأجهزة الكهربائية",
    home: "🏠 الأدوات المنزلية",
    plastic: "🪑 البلاستيك والتخزين",
    external: "📦 منتجات خارجية",
  };
  return titles[activeTab.value];
};

const getCategoryName = (cat) => {
  const names = {
    electrical: "⚡ الأجهزة الكهربائية",
    home: "🏠 الأدوات المنزلية",
    plastic: "🪑 البلاستيك والتخزين",
    external: "📦 منتجات خارجية",
  };
  return names[cat] || cat;
};

// Add product to bride list
const addToBrideList = (product) => {
  if (!userStore.canEdit) {
    showToast("⚠️ ليس لديك صلاحية لإضافة منتجات", "warning");
    return;
  }
  if (!product || !product.name) {
    showToast("⚠️ بيانات المنتج غير مكتملة", "warning");
    return;
  }

  const quantity = Number(product.selectedQuantity) || 1;
  const price = Number(product.customPrice) || Number(product.price) || 0;

  const existingIndex = brideList.value.findIndex(
    (item) => item.id === product.id && item.type === "internal",
  );

  const newItem = {
    id: product.id,
    name: String(product.name),
    brand: product.brand || "",
    category: product.category || activeTab.value,
    categoryName: getTabTitle(),
    quantity: quantity,
    price: price,
    total: price * quantity,
    type: "internal",
  };

  if (existingIndex !== -1) {
    brideList.value[existingIndex].quantity += newItem.quantity;
    brideList.value[existingIndex].total =
      brideList.value[existingIndex].quantity *
      brideList.value[existingIndex].price;
    showToast(`✅ تم تحديث كمية ${product.name}`, "success");
  } else {
    brideList.value.push(newItem);
    showToast(`✅ تم إضافة ${product.name} إلى الكشف`, "success");
  }

  product.selectedQuantity = 1;
  product.customPrice = product.price;
};

// Add external product to bride list
const addExternalToBrideItem = (item, index) => {
  if (!userStore.canEdit) {
    showToast("⚠️ ليس لديك صلاحية لإضافة منتجات", "warning");
    return;
  }
  if (!item.name || item.name.trim() === "") {
    showToast("⚠️ يرجى إدخال اسم المنتج", "warning");
    return;
  }
  const price = Number(item.price) || 0;
  if (price <= 0) {
    showToast("⚠️ يرجى إدخال سعر صحيح للمنتج", "warning");
    return;
  }
  const quantity = Number(item.quantity) || 1;

  // ✅ استخدام التصنيف المختار من المستخدم
  const category = item.category || "electrical";

  brideList.value.push({
    id: "ext_" + Date.now() + Math.random(),
    name: String(item.name).trim(),
    shop: null,
    quantity: quantity,
    price: price,
    total: price * quantity,
    type: "external",
    category: category,
    categoryName: getCategoryName(category),
  });

  showToast(`✅ تم إضافة ${item.name} إلى الكشف`, "success");
  externalProducts.value.splice(index, 1);
};

// Add external product
const addExternalProduct = () => {
  externalProducts.value.push({ 
    name: "", 
    quantity: 1, 
    price: 0,
    category: "electrical" // التصنيف الافتراضي
  });
};

// Remove external product
const removeExternalProduct = (index) => {
  externalProducts.value.splice(index, 1);
};

// Remove from bride list
const removeFromBrideList = (index) => {
  const item = brideList.value[index];
  brideList.value.splice(index, 1);
  showToast(`❌ تم إزالة ${item.name} من الكشف`, "info");
};

// Edit bride item
const editBrideItem = (index) => {
  editIndex.value = index;
  editItem.value = { ...brideList.value[index] };
  showEditModal.value = true;
};

const saveEdit = () => {
  if (editIndex.value !== -1) {
    const quantity = Number(editItem.value.quantity) || 1;
    const price = Number(editItem.value.price) || 0;
    brideList.value[editIndex.value] = {
      ...editItem.value,
      quantity: quantity,
      price: price,
      total: price * quantity,
    };
    showToast(`✅ تم تحديث المنتج`, "success");
  }
  showEditModal.value = false;
};

const clearAll = () => {
  if (confirm("هل أنت متأكد من مسح كل المنتجات من الكشف؟")) {
    brideList.value = [];
    externalProducts.value = [];
    showToast("🗑️ تم مسح الكشف", "success");
  }
};

// Format number
const formatNumber = (num) => {
  if (num === undefined || num === null) return "0";
  return Number(num).toLocaleString("ar-EG");
};

// Escape HTML
function escapeHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Get Invoice HTML
const getInvoiceHTML = () => {
  // ✅ تجميع المنتجات حسب التصنيف (بما في ذلك الخارجية)
  const electricalItems = brideList.value.filter(
    (i) => i.category === "electrical",
  );
  const homeItems = brideList.value.filter(
    (i) => i.category === "home",
  );
  const plasticItems = brideList.value.filter(
    (i) => i.category === "plastic",
  );
  
  const totalItemsCount = brideList.value.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0),
    0,
  );
  const totalPriceSum = brideList.value.reduce(
    (sum, item) =>
      sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0,
  );

  return `<!DOCTYPE html>
    <html dir="rtl">
    <head>
      <title>كشف عروسة - ${escapeHtml(brideInfo.value.name) || "غير محدد"}</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', 'Tahoma', sans-serif; padding: 20px; margin: 0; background: white; direction: rtl; }
        .header { text-align: center; margin-bottom: 25px; border-bottom: 3px solid #f43f5e; padding-bottom: 15px; }
        .header h1 { color: #f43f5e; margin: 0; font-size: 28px; }
        .header p { color: #666; margin: 5px 0 0; }
        .store-phone { font-size: 14px; color: #f43f5e; margin-top: 8px; font-weight: bold; }
        .bride-info { background: #f8f9fa; padding: 15px; border-radius: 10px; margin-bottom: 20px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; border: 1px solid #e5e7eb; }
        .section { margin-bottom: 25px; page-break-inside: avoid; }
        .section-title { background: linear-gradient(135deg, #f43f5e, #ec4899); color: white; padding: 10px 15px; border-radius: 10px; margin-bottom: 10px; font-size: 18px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: right; }
        th { background: #f1f1f1; font-weight: bold; }
        .total-row { background: #f0fdf4; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
        .footer .phone { color: #f43f5e; font-weight: bold; font-size: 14px; margin-top: 5px; }
        .signature { display: flex; justify-content: space-between; margin-top: 30px; padding-top: 20px; }
        @media print { body { padding: 0; } }
        @media (max-width: 600px) { body { padding: 10px; } .bride-info { grid-template-columns: 1fr; } th, td { padding: 6px; font-size: 12px; } .section-title { font-size: 14px; } .header h1 { font-size: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📋 كشف عروسة</h1>
        <p>جولدن للأجهزة الكهربائية والأدوات المنزلية</p>
        <div class="store-phone">📞 للتواصل: ${STORE_PHONE}</div>
      </div>
      <div class="bride-info">
        <div><strong>👰 اسم العروسة:</strong> ${escapeHtml(brideInfo.value.name) || "غير محدد"}</div>
        <div><strong>📞 رقم الهاتف:</strong> ${escapeHtml(brideInfo.value.phone) || "غير محدد"}</div>
        <div><strong>📅 تاريخ الكشف:</strong> ${brideInfo.value.date || new Date().toLocaleDateString("ar-EG")}</div>
        <div><strong>👨‍💼 البائع:</strong> ${escapeHtml(brideInfo.value.seller) || "غير محدد"}</div>
      </div>
      ${
        electricalItems.length > 0
          ? `
      <div class="section">
        <div class="section-title">⚡ الأجهزة الكهربائية</div>
        <table>
          <thead><tr><th>#</th><th>المنتج</th><th>الكمية</th><th>سعر الوحدة</th><th>الإجمالي</th></tr></thead>
          <tbody>${electricalItems.map((item, idx) => `<tr><td>${idx + 1}</td><td>${escapeHtml(item.name)}${item.brand ? `<br><small style="color:#666">${escapeHtml(item.brand)}</small>` : ""}</td><td>${Number(item.quantity) || 0}</td><td>${formatNumber(Number(item.price))} ج</td><td>${formatNumber(Number(item.price) * Number(item.quantity))} ج</td></tr>`).join("")}</tbody>
        </table>
      </div>`
          : ""
      }
      ${
        homeItems.length > 0
          ? `
      <div class="section">
        <div class="section-title">🏠 الأدوات المنزلية</div>
        <table>
          <thead><tr><th>#</th><th>المنتج</th><th>الكمية</th><th>سعر الوحدة</th><th>الإجمالي</th></tr></thead>
          <tbody>${homeItems.map((item, idx) => `<tr><td>${idx + 1}</td><td>${escapeHtml(item.name)}</td><td>${Number(item.quantity) || 0}</td><td>${formatNumber(Number(item.price))} ج</td><td>${formatNumber(Number(item.price) * Number(item.quantity))} ج</td></tr>`).join("")}</tbody>
        </table>
      </div>`
          : ""
      }
      ${
        plasticItems.length > 0
          ? `
      <div class="section">
        <div class="section-title">🪑 البلاستيك والتخزين</div>
        <table>
          <thead><tr><th>#</th><th>المنتج</th><th>الكمية</th><th>سعر الوحدة</th><th>الإجمالي</th></tr></thead>
          <tbody>${plasticItems.map((item, idx) => `<tr><td>${idx + 1}</td><td>${escapeHtml(item.name)}</td><td>${Number(item.quantity) || 0}</td><td>${formatNumber(Number(item.price))} ج</td><td>${formatNumber(Number(item.price) * Number(item.quantity))} ج</td></tr>`).join("")}</tbody>
        </table>
      </div>`
          : ""
      }
      <!-- ✅ تم حذف قسم المنتجات الخارجية المنفصل -->
      <div class="total-row" style="background:#f0fdf4; padding:15px; border-radius:10px; margin-top:20px; border:1px solid #dcfce7;">
        <div style="display:flex; justify-content:space-between; font-size:18px; margin-bottom:8px;"><span><strong>💰 إجمالي الكشف:</strong></span><span><strong style="color:#f43f5e; font-size:22px;">${formatNumber(totalPriceSum)} جنيه</strong></span></div>
        <div style="display:flex; justify-content:space-between;"><span>📦 عدد المنتجات:</span><span>${totalItemsCount} قطعة</span></div>
      </div>
      <div class="signature"><div>_________________ : توقيع العميل</div><div>_________________ : توقيع البائع</div></div>
      <div class="footer">
        <p>📍 جولدن - شكراً لتسوقكم معنا</p>
        <p>🛡️ ضمان سنة كاملة | 🚚 توصيل سريع | 💳 دفع آمن</p>
        <p class="phone">📞 للتواصل والاستفسار: ${STORE_PHONE}</p>
        <p style="font-size: 10px; margin-top:5px;">هذا الكشف قابل للتعديل حتى تاريخ استلام المنتجات</p>
      </div>
    </body>
    </html>`;
};

// Generate PDF
const generatePDF = async () => {
  if (!brideInfo.value.name || brideInfo.value.name.trim() === "") {
    showToast("⚠️ يرجى إدخال اسم العروسة أولاً", "warning");
    return;
  }
  if (brideList.value.length === 0) {
    showToast("⚠️ لا توجد منتجات في الكشف. يرجى إضافة منتجات أولاً", "warning");
    return;
  }
  if (!html2pdf.value) {
    showToast("⏳ جاري تجهيز المكتبة...", "info");
    const module = await import("html2pdf.js");
    html2pdf.value = module.default;
  }
  const element = document.createElement("div");
  element.innerHTML = getInvoiceHTML();
  const opt = {
    margin: [0.5, 0.5, 0.5, 0.5],
    filename: `كشف_${brideInfo.value.name || "عروسة"}_${new Date().toISOString().split("T")[0]}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
  };
  html2pdf.value().set(opt).from(element).save();
  showToast("📄 جاري إنشاء PDF...", "info");
};

// Print invoice
const printInvoice = () => {
  if (!brideInfo.value.name || brideInfo.value.name.trim() === "") {
    showToast("⚠️ يرجى إدخال اسم العروسة أولاً", "warning");
    return;
  }
  if (brideList.value.length === 0) {
    showToast("⚠️ لا توجد منتجات في الكشف. يرجى إضافة منتجات أولاً", "warning");
    return;
  }
  const printWindow = window.open("", "_blank");
  printWindow.document.write(getInvoiceHTML());
  printWindow.document.close();
  printWindow.print();
  showToast("🖨️ جاري فتح الطباعة...", "info");
};

// تحويل الكشف إلى بيع (مع دعم التقسيط)
const convertToSale = async () => {
  if (!userStore.canEdit) {
    showToast("⚠️ ليس لديك صلاحية لتحويل الكشف إلى بيع", "warning");
    return;
  }
  if (!brideInfo.value.name || brideInfo.value.name.trim() === "") {
    showToast("⚠️ يرجى إدخال اسم العروسة أولاً", "warning");
    return;
  }
  if (brideList.value.length === 0) {
    showToast("⚠️ لا توجد منتجات للبيع", "warning");
    return;
  }

  const isInstallment = brideInfo.value.payment_method === "installments";

  let confirmMessage = `هل تريد تأكيد بيع منتجات كشف "${brideInfo.value.name}"؟\n\nعدد المنتجات: ${totalItems.value} قطعة\nالإجمالي: ${formatNumber(totalPrice.value)} ج`;

  if (isInstallment) {
    const remainingAfterDown =
      totalPrice.value - (installmentData.value.down_payment || 0);
    confirmMessage += `\n\n📅 طريقة الدفع: تقسيط\nدفعة مقدمة: ${formatNumber(installmentData.value.down_payment || 0)} ج\nالمتبقي للتقسيط: ${formatNumber(remainingAfterDown)} ج\nعدد الأقساط: ${installmentData.value.installment_count} قسط\nقيمة القسط الشهري: ${formatNumber(installmentData.value.installment_amount)} ج`;
  }

  if (!confirm(confirmMessage)) return;

  try {
    // 1. التحقق من المخزون
    const outOfStock = [];
    for (const item of brideList.value) {
      if (item.type === "internal") {
        const { data: product } = await supabase
          .from("products")
          .select("stock, name")
          .eq("id", item.id)
          .single();
        if (product && product.stock < item.quantity) {
          outOfStock.push(`${item.name} (المتاح: ${product.stock})`);
        }
      }
    }
    if (outOfStock.length > 0) {
      showToast(
        `⚠️ المنتجات التالية غير متوفرة:\n${outOfStock.join("\n")}`,
        "warning",
      );
      return;
    }

    // 2. تحديث المخزون
    for (const item of brideList.value) {
      if (item.type === "internal") {
        const { data: product } = await supabase
          .from("products")
          .select("stock")
          .eq("id", item.id)
          .single();
        const newStock = Math.max(0, (product?.stock || 0) - item.quantity);
        await supabase
          .from("products")
          .update({ stock: newStock })
          .eq("id", item.id);
      }
    }

    // 3. إنشاء الطلب
    const orderItems = brideList.value.map((item) => ({
      product_id: item.type === "internal" ? item.id : null,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }));

    const orderData = {
      customer_name: brideInfo.value.name,
      customer_phone: brideInfo.value.phone || null,
      customer_address: `كشف عروسة - تاريخ ${brideInfo.value.date}`,
      items: orderItems,
      total_price: totalPrice.value,
      status: "completed",
      payment_method: brideInfo.value.payment_method,
      sale_type: "offline",
      cashier_name: brideInfo.value.seller || userStore.user?.email || "محصل",
      order_date: new Date(),
      notes: `كشف عروسة - ${brideInfo.value.date} - طريقة الدفع: ${isInstallment ? "تقسيط" : "كاش"}`,
    };

    const { error: orderError } = await supabase
      .from("orders")
      .insert([orderData]);
    if (orderError) throw orderError;

    // 4. إذا كانت طريقة الدفع تقسيط، أنشئ عقد تقسيط
    if (isInstallment) {
      const remainingAmount =
        totalPrice.value - (installmentData.value.down_payment || 0);
      const installmentAmount = Math.ceil(
        remainingAmount / installmentData.value.installment_count,
      );

      const { data: contract, error: contractError } = await supabase
        .from("installment_contracts")
        .insert([
          {
            customer_name: brideInfo.value.name,
            customer_phone: brideInfo.value.phone || null,
            customer_address: `كشف عروسة - ${brideInfo.value.date}`,
            total_amount: totalPrice.value,
            down_payment: installmentData.value.down_payment || 0,
            remaining_amount: remainingAmount,
            installment_count: installmentData.value.installment_count,
            installment_amount: installmentAmount,
            start_date: new Date().toISOString().split("T")[0],
            end_date: new Date(
              new Date().setMonth(
                new Date().getMonth() + installmentData.value.installment_count,
              ),
            )
              .toISOString()
              .split("T")[0],
            status: "active",
            sale_type: "offline",
            cashier_name: brideInfo.value.seller || userStore.user?.email,
            notes: `تم إنشاؤه من كشف عروسة - ${brideInfo.value.date}`,
          },
        ])
        .select();

      if (contractError) throw contractError;

      const payments = [];
      const startDate = new Date();
      for (let i = 1; i <= installmentData.value.installment_count; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(startDate.getMonth() + i);
        payments.push({
          contract_id: contract[0].id,
          installment_number: i,
          due_date: dueDate.toISOString().split("T")[0],
          amount: installmentAmount,
          status: "pending",
        });
      }

      const { error: paymentsError } = await supabase
        .from("installment_payments")
        .insert(payments);
      if (paymentsError) throw paymentsError;

      showToast(
        `✅ تم تحويل الكشف إلى بيع وإنشاء عقد تقسيط بنجاح!\nالمبلغ المتبقي: ${formatNumber(remainingAmount)} ج\nالقسط الشهري: ${formatNumber(installmentAmount)} ج`,
        "success",
      );
    } else {
      showToast("✅ تم تحويل الكشف إلى بيع وتحديث المخزون بنجاح", "success");
    }

    // 5. حفظ الكشف كمنجز
    await saveChecklist();

    // 6. عرض خيار طباعة الفاتورة
    if (confirm("هل تريد طباعة الفاتورة؟")) {
      printInvoice();
    }

    // 7. تنظيف الكشف الحالي
    startNewChecklist();
  } catch (error) {
    console.error("Sale error:", error);
    showToast("❌ حدث خطأ أثناء تحويل البيع", "error");
  }
};

// إضافة المنتجات إلى سلة مبيعات المعرض
const addToSalesCart = () => {
  if (!userStore.canEdit) {
    showToast("⚠️ ليس لديك صلاحية لإضافة المنتجات للسلة", "warning");
    return;
  }
  if (brideList.value.length === 0) {
    showToast("⚠️ لا توجد منتجات للإضافة", "warning");
    return;
  }

  const salesCart = JSON.parse(
    localStorage.getItem("offline_sales_cart") || "[]",
  );

  brideList.value.forEach((item) => {
    const existingIndex = salesCart.findIndex(
      (cartItem) => cartItem.id === item.id,
    );
    if (existingIndex !== -1) {
      salesCart[existingIndex].quantity += item.quantity;
    } else {
      salesCart.push({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        type: item.type,
      });
    }
  });

  localStorage.setItem("offline_sales_cart", JSON.stringify(salesCart));
  showToast("✅ تم إضافة المنتجات إلى سلة البيع", "success");

  if (confirm("تمت الإضافة! هل تريد التوجه لصفحة بيع المعرض الآن؟")) {
    navigateTo("/dashboard/offline-sale");
  }
};

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("ar-EG");
};
</script>

<style scoped>
/* Custom scrollbar */
.max-h-96::-webkit-scrollbar,
.max-h-500::-webkit-scrollbar {
  width: 6px;
}
.max-h-96::-webkit-scrollbar-track,
.max-h-500::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}
.max-h-96::-webkit-scrollbar-thumb,
.max-h-500::-webkit-scrollbar-thumb {
  background: #f43f5e;
  border-radius: 10px;
}

/* Mobile optimizations */
@media (max-width: 640px) {
  input,
  button,
  select {
    font-size: 16px !important;
  }
}

/* Toast animation */
@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}

.sticky {
  position: sticky;
  z-index: 10;
}
</style>