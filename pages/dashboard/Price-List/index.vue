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
              📋 كشف الأسعار
            </h1>
            <p class="text-gray-500 text-sm">
              قائمة بجميع المنتجات والأسعار - تحديث {{ lastUpdated }}
            </p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              @click="openInvoiceModal"
              :disabled="selectedProductsDetails.length === 0 && newInvoiceItems.length === 0"
              class="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-indigo-700 transition flex items-center gap-2 disabled:opacity-50"
            >
              <span>🧾</span> إنشاء فاتورة ({{ selectedProductsDetails.length + newInvoiceItems.length }})
            </button>
            <button
              @click="generatePDF"
              class="bg-green-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-green-700 transition flex items-center gap-2"
            >
              <span>📄</span> PDF
            </button>
            <button
              @click="printPriceList"
              class="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-purple-700 transition flex items-center gap-2"
            >
              <span>🖨️</span> طباعة
            </button>
          </div>
        </div>
      </div>

      <!-- Search & Filters -->
      <div class="bg-white rounded-2xl shadow p-4 mb-6">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="🔍 بحث عن منتج..."
              class="w-full p-3 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div class="flex flex-wrap gap-2">
            <select
              v-model="filterMainCategory"
              class="p-3 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">📂 جميع الأقسام</option>
              <option value="electrical">⚡ الأجهزة الكهربائية</option>
              <option value="home">🏠 الأدوات المنزلية</option>
              <option value="plastic">🪑 البلاستيك والتخزين</option>
            </select>
            <select
              v-model="filterSubCategory"
              class="p-3 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none min-w-[120px]"
            >
              <option value="all">📋 جميع الأصناف</option>
              <option
                v-for="sub in filteredSubCategories"
                :key="sub.value"
                :value="sub.value"
              >
                {{ sub.icon }} {{ sub.name }}
              </option>
            </select>
            <select
              v-model="sortBy"
              class="p-3 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="name">ترتيب حسب الاسم</option>
              <option value="price">ترتيب حسب السعر (تصاعدي)</option>
              <option value="price-desc">ترتيب حسب السعر (تنازلي)</option>
            </select>
          </div>
        </div>
        <div class="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
          <span>📦 عدد المنتجات: <strong class="text-gray-700">{{ filteredProducts.length }}</strong></span>
          <span>💰 متوسط السعر: <strong class="text-gray-700">{{ formatNumber(averagePrice) }} ج</strong></span>
          <span>📊 إجمالي قيمة المخزون: <strong class="text-gray-700">{{ formatNumber(totalStockValue) }} ج</strong></span>
          <span v-if="selectedProductsDetails.length + newInvoiceItems.length > 0" class="text-indigo-600 font-bold">
            🛒 مختار: {{ selectedProductsDetails.length + newInvoiceItems.length }} منتج
          </span>
        </div>
      </div>

      <!-- Products Table -->
      <div class="bg-white rounded-2xl shadow overflow-hidden">
        <!-- Mobile Cards View -->
        <div class="block md:hidden divide-y">
          <div
            v-for="product in filteredProducts"
            :key="product.id"
            class="p-4 hover:bg-gray-50"
          >
            <div class="flex justify-between items-start mb-2">
              <div class="flex-1">
                <h3 class="font-bold text-base">{{ product.name }}</h3>
                <span v-if="product.brand" class="text-xs text-gray-500">{{ product.brand }}</span>
                <div class="flex flex-wrap gap-2 mt-1">
                  <span class="text-xs bg-gray-100 px-2 py-1 rounded-full">
                    {{ getCategoryName(product.category) }}
                  </span>
                  <span v-if="product.sub_category" class="text-xs bg-gray-100 px-2 py-1 rounded-full">
                    {{ getSubCategoryName(product.category, product.sub_category) }}
                  </span>
                </div>
              </div>
              <div class="flex gap-1">
                <button
                  @click="toggleSelectProduct(product)"
                  class="p-1 text-sm"
                  :class="isProductSelected(product) ? 'text-green-600' : 'text-gray-400'"
                >
                  {{ isProductSelected(product) ? '✅' : '⬜' }}
                </button>
                <button
                  v-if="userStore?.canEdit"
                  @click="editProduct(product)"
                  class="text-blue-500 hover:text-blue-700 p-1"
                >
                  ✏️
                </button>
                <button
                  v-if="userStore?.canEdit"
                  @click="deleteProduct(product.id)"
                  class="text-red-500 hover:text-red-700 p-1"
                >
                  🗑️
                </button>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2 text-sm mt-2">
              <div>
                <span class="text-gray-500">سعر البيع:</span>
                <span class="font-bold text-green-600 block">{{ formatNumber(product.price) }} ج</span>
              </div>
              <div>
                <span class="text-gray-500">المخزون:</span>
                <span class="font-bold" :class="getStockClass(product.stock)">
                  {{ product.stock || 0 }}
                </span>
              </div>
            </div>
          </div>
          <div v-if="filteredProducts.length === 0" class="text-center py-12 text-gray-400">
            لا توجد منتجات مطابقة للبحث
          </div>
        </div>

        <!-- Desktop Table View -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full min-w-[800px]">
            <thead class="bg-gray-100">
              <tr>
                <th class="p-3 text-center text-sm w-10">
                  <input
                    type="checkbox"
                    :checked="allSelected"
                    @change="toggleSelectAll"
                    class="w-4 h-4 cursor-pointer"
                  />
                </th>
                <th class="p-3 text-right text-sm">#</th>
                <th class="p-3 text-right text-sm">اسم المنتج</th>
                <th class="p-3 text-right text-sm hidden lg:table-cell">القسم</th>
                <th class="p-3 text-right text-sm hidden xl:table-cell">التصنيف الفرعي</th>
                <th class="p-3 text-right text-sm">سعر البيع</th>
                <th class="p-3 text-right text-sm">المخزون</th>
                <th class="p-3 text-right text-sm">تحديد</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(product, index) in filteredProducts"
                :key="product.id"
                class="border-t hover:bg-gray-50"
              >
                <td class="p-3 text-center">
                  <input
                    type="checkbox"
                    :checked="isProductSelected(product)"
                    @change="toggleSelectProduct(product)"
                    class="w-4 h-4 cursor-pointer"
                  />
                </td>
                <td class="p-3 text-sm text-gray-400">{{ index + 1 }}</td>
                <td class="p-3 font-medium text-sm">
                  {{ product.name }}
                  <span v-if="product.brand" class="text-xs text-gray-400 block">{{ product.brand }}</span>
                </td>
                <td class="p-3 text-sm hidden lg:table-cell">
                  <span class="bg-gray-100 px-2 py-1 rounded-full text-xs">
                    {{ getCategoryName(product.category) }}
                  </span>
                </td>
                <td class="p-3 text-sm hidden xl:table-cell">
                  <span class="text-xs text-gray-500">
                    {{ getSubCategoryName(product.category, product.sub_category) || "-" }}
                  </span>
                </td>
                <td class="p-3 font-bold text-green-600 whitespace-nowrap">
                  {{ formatNumber(product.price) }} ج
                </td>
                <td class="p-3">
                  <span :class="getStockClass(product.stock)">
                    {{ product.stock || 0 }}
                  </span>
                </td>
                <td class="p-3 text-center">
                  <button
                    @click="toggleSelectProduct(product)"
                    class="text-sm"
                    :class="isProductSelected(product) ? 'text-green-600' : 'text-gray-400'"
                  >
                    {{ isProductSelected(product) ? '✅' : '⬜' }}
                  </button>
                </td>
              </tr>
              <tr v-if="filteredProducts.length === 0">
                <td colspan="8" class="text-center py-12 text-gray-400">
                  لا توجد منتجات مطابقة للبحث
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ✅ Modal: Create Invoice -->
      <div
        v-if="showInvoiceModal"
        class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        @click.self="closeInvoiceModal"
      >
        <div class="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div class="p-4 sm:p-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl sm:text-2xl font-bold">🧾 إنشاء فاتورة</h2>
              <button
                @click="closeInvoiceModal"
                class="text-gray-400 hover:text-gray-600 text-2xl"
              >
                &times;
              </button>
            </div>

            <form @submit.prevent="createInvoice">
              <!-- Customer Info -->
              <div class="bg-gray-50 p-4 rounded-xl mb-4">
                <h3 class="font-bold text-base mb-3">👤 بيانات العميل</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-sm font-medium mb-1">اسم العميل *</label>
                    <input
                      v-model="invoiceData.customer_name"
                      type="text"
                      required
                      class="w-full p-2.5 border rounded-xl text-sm"
                      placeholder="أدخل اسم العميل"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-1">رقم الهاتف</label>
                    <input
                      v-model="invoiceData.customer_phone"
                      type="text"
                      class="w-full p-2.5 border rounded-xl text-sm"
                      placeholder="رقم الهاتف"
                    />
                  </div>
                  <div class="sm:col-span-2">
                    <label class="block text-sm font-medium mb-1">العنوان</label>
                    <input
                      v-model="invoiceData.customer_address"
                      type="text"
                      class="w-full p-2.5 border rounded-xl text-sm"
                      placeholder="العنوان"
                    />
                  </div>
                </div>
              </div>

              <!-- Selected Products from Database -->
              <div class="bg-gray-50 p-4 rounded-xl mb-4" v-if="selectedProductsDetails.length > 0">
                <h3 class="font-bold text-base mb-3">🛒 المنتجات المختارة من المخزن</h3>
                <div class="space-y-2 max-h-40 overflow-y-auto">
                  <div
                    v-for="(product, index) in selectedProductsDetails"
                    :key="product.id"
                    class="flex flex-wrap items-center gap-2 bg-white p-2 rounded-lg border"
                  >
                    <span class="flex-1 text-sm font-medium">{{ product.name }}</span>
                    <span class="text-xs text-gray-500">{{ getCategoryName(product.category) }}</span>
                    <input
                      v-model.number="product.invoice_price"
                      type="number"
                      min="0"
                      step="0.01"
                      class="w-24 p-1 border rounded text-sm text-center"
                      placeholder="السعر"
                    />
                    <input
                      v-model.number="product.invoice_quantity"
                      type="number"
                      min="1"
                      class="w-16 p-1 border rounded text-sm text-center"
                      placeholder="الكمية"
                    />
                    <span class="text-xs text-green-600 font-bold whitespace-nowrap">
                      {{ formatNumber((product.invoice_price || product.price) * (product.invoice_quantity || 1)) }} ج
                    </span>
                    <button
                      type="button"
                      @click="removeFromInvoice(index)"
                      class="text-red-500 hover:text-red-700"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>

              <!-- ✅ New Products (Not in Database) -->
              <div class="bg-orange-50 p-4 rounded-xl mb-4 border-2 border-orange-200">
                <div class="flex justify-between items-center mb-3">
                  <h3 class="font-bold text-base text-orange-700">📦 منتجات خارجية (غير مسجلة)</h3>
                  <button
                    type="button"
                    @click="addNewInvoiceItem"
                    class="bg-orange-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-orange-700 transition"
                  >
                    ➕ إضافة منتج جديد
                  </button>
                </div>
                
                <div class="space-y-2 max-h-60 overflow-y-auto">
                  <div
                    v-for="(item, index) in newInvoiceItems"
                    :key="'new_' + index"
                    class="flex flex-wrap items-center gap-2 bg-white p-2 rounded-lg border border-orange-200"
                  >
                    <input
                      v-model="item.name"
                      type="text"
                      class="flex-1 min-w-[100px] p-1.5 border rounded text-sm"
                      placeholder="اسم المنتج *"
                    />
                    <select
                      v-model="item.category"
                      class="p-1.5 border rounded text-sm bg-white"
                    >
                      <option value="electrical">⚡ كهرباء</option>
                      <option value="home">🏠 منزلي</option>
                      <option value="plastic">🪑 بلاستيك</option>
                    </select>
                    <input
                      v-model.number="item.price"
                      type="number"
                      min="0"
                      step="0.01"
                      class="w-24 p-1.5 border rounded text-sm text-center"
                      placeholder="السعر *"
                    />
                    <input
                      v-model.number="item.quantity"
                      type="number"
                      min="1"
                      class="w-16 p-1.5 border rounded text-sm text-center"
                      placeholder="الكمية"
                    />
                    <span class="text-xs text-green-600 font-bold whitespace-nowrap">
                      {{ formatNumber((item.price || 0) * (item.quantity || 1)) }} ج
                    </span>
                    <button
                      type="button"
                      @click="removeNewInvoiceItem(index)"
                      class="text-red-500 hover:text-red-700"
                    >
                      🗑️
                    </button>
                  </div>
                  <div v-if="newInvoiceItems.length === 0" class="text-center py-3 text-gray-400 text-sm">
                    لا توجد منتجات خارجية مضافة
                  </div>
                </div>
              </div>

              <!-- Invoice Summary -->
              <div class="bg-gray-50 p-4 rounded-xl mb-4">
                <h3 class="font-bold text-base mb-3">📊 ملخص الفاتورة</h3>
                <div class="flex justify-between text-sm">
                  <span>عدد المنتجات:</span>
                  <span class="font-bold">{{ invoiceTotalItems }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span>منتجات من المخزن:</span>
                  <span class="font-bold">{{ selectedProductsDetails.length }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span>منتجات خارجية:</span>
                  <span class="font-bold text-orange-600">{{ newInvoiceItems.length }}</span>
                </div>
                <div class="flex justify-between text-base font-bold mt-2 border-t pt-2">
                  <span>الإجمالي الكلي:</span>
                  <span class="text-indigo-600">{{ formatNumber(invoiceTotalPrice) }} ج</span>
                </div>
              </div>

              <div class="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  :disabled="creatingInvoice || (selectedProductsDetails.length === 0 && newInvoiceItems.length === 0)"
                  class="flex-1 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {{ creatingInvoice ? '⏳ جاري الإنشاء...' : '💾 إنشاء الفاتورة' }}
                </button>
                <button
                  type="button"
                  @click="closeInvoiceModal"
                  class="flex-1 bg-gray-200 py-3 rounded-xl hover:bg-gray-300 transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
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
  </div>
</template>

<script setup>
definePageMeta({
  layout: "dashboard",
  middleware: "admin-only",
});

import { supabase } from '~/lib/supabase';
const userStore = useUserStore();

// ============================================================
// ✅ جميع الأصناف الفرعية - محدثة بالكامل
// ============================================================
const subCategories = {
  electrical: [
    { name: "الكل", value: "all", icon: "📋" },
    { name: "ثلاجة", value: "refrigerator", icon: "🧊" },
    { name: "ديب فريزر (رأسي / أفقي)", value: "freezer", icon: "❄️" },
    { name: "غسالة ملابس (أوتوماتيك / فوق أوتوماتيك / عادية)", value: "washing_machine", icon: "🧺" },
    { name: "مجفف ملابس (دراير)", value: "dryer", icon: "👕" },
    { name: "غسالة أطباق", value: "dishwasher", icon: "🍽️" },
    { name: "بوتاجاز (مستقل / بلت إن)", value: "cooker", icon: "🔥" },
    { name: "فرن كهربائي / فرن بلت إن", value: "oven", icon: "🔥" },
    { name: "شفاط مطبخ", value: "hood", icon: "💨" },
    { name: "ميكروويف", value: "microwave", icon: "📡" },
    { name: "مبرد مياه (كولر)", value: "water_cooler", icon: "💧" },
    { name: "تكييف", value: "air_conditioner", icon: "❄️" },
    { name: "مروحة (سقف / عمود / حائط)", value: "fan", icon: "🌀" },
    { name: "دفاية", value: "heater", icon: "🔥" },
    { name: "شاشة تلفزيون", value: "tv", icon: "📺" },
    { name: "مكواة (بخار / عادية / عمودية)", value: "iron", icon: "👔" },
    { name: "مكنسة كهربائية", value: "vacuum_cleaner", icon: "🧹" },
    { name: "خلاط", value: "blender", icon: "🥤" },
    { name: "كبة طعام", value: "food_grinder", icon: "🍖" },
    { name: "مضرب بيض / عجان", value: "mixer", icon: "🥚" },
    { name: "هاند بلندر", value: "hand_blender", icon: "🥤" },
    { name: "محضر طعام (فود بروسيسور)", value: "food_processor", icon: "🍳" },
    { name: "قلاية بدون زيت (أير فراير)", value: "air_fryer", icon: "🍟" },
    { name: "غلاية مياه (كاتل)", value: "kettle", icon: "☕" },
    { name: "صانع ساندوتشات / توستر", value: "sandwich_maker", icon: "🥪" },
    { name: "مفرمة لحوم", value: "meat_grinder", icon: "🥩" },
  ],
  
  home: [
    { name: "الكل", value: "all", icon: "📋" },
    { name: "طقم صيني", value: "china_set", icon: "🍽️" },
    { name: "طقم أركوبال / أركوبيركس", value: "arcopal_set", icon: "🍽️" },
    { name: "طقم ملامين", value: "melamine_set", icon: "🍽️" },
    { name: "طقم أرشوفال", value: "archovale_set", icon: "🍽️" },
    { name: "طقم عشاء بايركس", value: "pyrex_set", icon: "🍽️" },
    { name: "طقم حلل (جرانيت / إستانلس / تيفال / ألومنيوم / سيراميك)", value: "pot_set", icon: "🍳" },
    { name: "طقم طاسات / مقالي", value: "pan_set", icon: "🍳" },
    { name: "طقم صواني فرن", value: "oven_trays", icon: "🧊" },
    { name: "حلة ضغط", value: "pressure_cooker", icon: "🍲" },
    { name: "طواجن (فخار / بايركس)", value: "casserole", icon: "🍲" },
    { name: "طقم معالق وشوك وسكاكين (شنطة معالق)", value: "cutlery_set", icon: "🍴" },
    { name: "طقم توزيع (سيليكون / إستانلس / خشب)", value: "serving_set", icon: "🥄" },
    { name: "طقم كاسات", value: "glass_set", icon: "🥤" },
    { name: "طقم كوبايات (مياه / عصير / شاي)", value: "cup_set", icon: "☕" },
    { name: "طقم شاي وقهوة", value: "tea_coffee_set", icon: "☕" },
    { name: "ترمس مياه وشاي", value: "thermos", icon: "🧴" },
    { name: "صواني تقديم", value: "serving_trays", icon: "🧊" },
    { name: "طقم توابل", value: "spice_set", icon: "🧂" },
    { name: "صفاية أطباق", value: "dish_drainer", icon: "🧺" },
  ],
  
  plastic: [
    { name: "الكل", value: "all", icon: "📋" },
    { name: "ترابيزة بلاستيك", value: "plastic_table", icon: "🪑" },
    { name: "كرسي بلاستيك", value: "plastic_chair", icon: "🪑" },
    { name: "دولاب بلاستيك (جزامة / منظم)", value: "plastic_cabinet", icon: "🗄️" },
    { name: "تربو مطبخ / حمام (أدراج بلاستيك)", value: "plastic_drawers", icon: "🗄️" },
    { name: "سبت غسيل (مغلق / مخرم)", value: "laundry_basket", icon: "🧺" },
    { name: "طبق غسيل (بانيو غسيل)", value: "wash_basin", icon: "🛁" },
    { name: "جردل غسيل", value: "washing_bucket", icon: "🪣" },
    { name: "جردل بممسحة (جردل الهلال/الموب)", value: "mop_bucket", icon: "🧹" },
    { name: "سلة مهملات (باكت قمامة بأحجامها)", value: "trash_bin", icon: "🗑️" },
    { name: "علب حفظ طعام (أطقم علب ثلاجة)", value: "food_container", icon: "📦" },
    { name: "شفشق بلاستيك", value: "plastic_bottle", icon: "🧴" },
    { name: "زجاجة مياه بلاستيك", value: "water_bottle", icon: "💧" },
    { name: "لانش بوكس", value: "lunch_box", icon: "🥪" },
    { name: "سبت خضار", value: "vegetable_basket", icon: "🥬" },
    { name: "بلانشة تقطيع", value: "cutting_board", icon: "🔪" },
    { name: "صفاية معالق", value: "spoon_drainer", icon: "🍴" },
    { name: "جاروف ومقشة", value: "broom_dustpan", icon: "🧹" },
    { name: "بانيو أطفال بلاستيك", value: "baby_bath", icon: "🛁" },
    { name: "بوله بلاستيك", value: "baby_bath2", icon: "🍳" },
    { name: "كرسي أطفال بلاستيك", value: "baby_chair", icon: "🪑" },
    { name: "مقعد أطفال بلاستيك", value: "baby_seat", icon: "🪑" },
    { name: "سلة ألعاب أطفال", value: "baby_toy_basket", icon: "🧸" },
    { name:"مج بلاستيك للأطفال", value: "baby_cup", icon: "🥤" },
    { name:"مغرفة بلاستيك", value: "plastic_ladle", icon: "🥄" },
    { name:"مصفاة بلاستيك", value: "plastic_strainer", icon: "🧊" },
    { name:"حوض بلاستيك", value: "plastic_basin", icon: "🛁" },
    { name:"سلة غسيل بلاستيك", value: "plastic_laundry_basket", icon: "🧺" },
    { name:"علبة أدوات بلاستيك", value: "plastic_tool_box", icon: "🧰" },
    { name:"بستله بلاستيك", value: "plastic_storage_box", icon: "📦" },
    {name: "اطباق بلاستيك", value: "plastic_plate", icon: "🍽️" },
  ],
};

// رقم المعرض
const STORE_PHONE = "01030537692";
const STORE_NAME = "جولدن للأجهزة الكهربائية والأدوات المنزلية";
const STORE_ADDRESS = "طنطا - سبرباي - امام المدينه الجامعيه";

// Toast state
const toast = ref({ show: false, message: "", type: "success", icon: "✅" });

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

// ============================================
// STATE
// ============================================
const products = ref([]);
const searchQuery = ref("");
const filterMainCategory = ref("all");
const filterSubCategory = ref("all");
const sortBy = ref("name");
const loading = ref(false);
const saving = ref(false);
const creatingInvoice = ref(false);
const lastUpdated = ref("");
const html2pdf = ref(null);

// Selection state
const selectedProductIds = ref([]);

// ✅ منتجات جديدة في الفاتورة (غير موجودة في قاعدة البيانات)
const newInvoiceItems = ref([]);

// Modal states
const showInvoiceModal = ref(false);
const editingProduct = ref(null);

// Product form (للتعديل)
const productForm = ref({
  name: "",
  category: "electrical",
  sub_category: "all",
  brand: "",
  price: 0,
  stock: 0,
  description: "",
});

// Invoice data
const invoiceData = ref({
  customer_name: "",
  customer_phone: "",
  customer_address: "",
});

// ============================================
// COMPUTED
// ============================================
const filteredSubCategories = computed(() => {
  if (filterMainCategory.value === "all") {
    const all = [];
    Object.keys(subCategories).forEach(key => {
      subCategories[key].forEach(sub => {
        if (sub.value !== "all") {
          all.push({ ...sub, category: key });
        }
      });
    });
    return all;
  }
  return subCategories[filterMainCategory.value] || [];
});

const filteredProducts = computed(() => {
  let result = [...products.value];

  if (filterMainCategory.value !== "all") {
    result = result.filter(p => p.category === filterMainCategory.value);
  }

  if (filterSubCategory.value !== "all") {
    result = result.filter(p => p.sub_category === filterSubCategory.value);
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  }

  switch (sortBy.value) {
    case 'name':
      result.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'price':
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
      break;
    case 'price-desc':
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
      break;
    default:
      break;
  }

  return result;
});

const selectedProductsDetails = computed(() => {
  return products.value
    .filter(p => selectedProductIds.value.includes(p.id))
    .map(p => ({
      ...p,
      invoice_price: p.price,
      invoice_quantity: 1,
    }));
});

// ✅ كل المنتجات في الفاتورة (من المخزن + الجديدة)
const allInvoiceItems = computed(() => {
  const items = [];
  
  // منتجات من المخزن
  selectedProductsDetails.value.forEach(p => {
    items.push({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.invoice_price || p.price,
      quantity: p.invoice_quantity || 1,
      isNew: false,
    });
  });
  
  // منتجات جديدة
  newInvoiceItems.value.forEach(item => {
    items.push({
      id: 'new_' + Date.now() + Math.random(),
      name: item.name || 'منتج جديد',
      category: item.category || 'electrical',
      price: item.price || 0,
      quantity: item.quantity || 1,
      isNew: true,
    });
  });
  
  return items;
});

const allSelected = computed(() => {
  return filteredProducts.value.length > 0 &&
    filteredProducts.value.every(p => selectedProductIds.value.includes(p.id));
});

const invoiceTotalItems = computed(() => {
  return allInvoiceItems.value.reduce((sum, item) => sum + (item.quantity || 1), 0);
});

const invoiceTotalPrice = computed(() => {
  return allInvoiceItems.value.reduce(
    (sum, item) => sum + ((item.price || 0) * (item.quantity || 1)),
    0
  );
});

const averagePrice = computed(() => {
  if (filteredProducts.value.length === 0) return 0;
  const total = filteredProducts.value.reduce((sum, p) => sum + (p.price || 0), 0);
  return Math.round(total / filteredProducts.value.length);
});

const totalStockValue = computed(() => {
  return Math.round(
    filteredProducts.value.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0)
  );
});

// ============================================
// METHODS - HELPERS
// ============================================
const formatNumber = (num) => {
  if (!num && num !== 0) return "0";
  return Number(num).toLocaleString("ar-EG");
};

const getCategoryName = (cat) => {
  const names = {
    electrical: "⚡ الأجهزة الكهربائية",
    home: "🏠 الأدوات المنزلية",
    plastic: "🪑 البلاستيك والتخزين",
  };
  return names[cat] || cat;
};

const getSubCategoryName = (category, value) => {
  if (!category || !value) return "-";
  const subs = subCategories[category] || [];
  const found = subs.find(s => s.value === value);
  return found ? found.icon + " " + found.name : value;
};

const getSubCategoriesForForm = (category) => {
  return subCategories[category] || [];
};

const getStockClass = (stock) => {
  if (!stock || stock === 0) return "text-red-600 font-bold";
  if (stock < 10) return "text-yellow-600 font-bold";
  return "text-green-600";
};

const escapeHtml = (text) => {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

// ============================================
// METHODS - SELECTION
// ============================================
const isProductSelected = (product) => {
  return selectedProductIds.value.includes(product.id);
};

const toggleSelectProduct = (product) => {
  const index = selectedProductIds.value.indexOf(product.id);
  if (index > -1) {
    selectedProductIds.value.splice(index, 1);
  } else {
    selectedProductIds.value.push(product.id);
  }
  selectedProductIds.value = [...selectedProductIds.value];
};

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedProductIds.value = [];
  } else {
    selectedProductIds.value = filteredProducts.value.map(p => p.id);
  }
};

// ============================================
// METHODS - NEW INVOICE ITEMS
// ============================================
const addNewInvoiceItem = () => {
  newInvoiceItems.value.push({
    name: "",
    category: "electrical",
    price: 0,
    quantity: 1,
  });
};

const removeNewInvoiceItem = (index) => {
  newInvoiceItems.value.splice(index, 1);
};

// ============================================
// METHODS - PRODUCT CRUD
// ============================================
const loadProducts = async () => {
  loading.value = true;
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    products.value = data || [];
    lastUpdated.value = new Date().toLocaleString("ar-EG");
  } catch (error) {
    console.error("❌ خطأ في تحميل المنتجات:", error);
    showToast("❌ حدث خطأ في تحميل المنتجات", "error");
  } finally {
    loading.value = false;
  }
};

const editProduct = (product) => {
  if (!userStore?.canEdit) {
    showToast("⚠️ ليس لديك صلاحية لتعديل المنتجات", "warning");
    return;
  }
  editingProduct.value = product;
  productForm.value = {
    name: product.name || "",
    category: product.category || "electrical",
    sub_category: product.sub_category || "all",
    brand: product.brand || "",
    price: product.price || 0,
    stock: product.stock || 0,
    description: product.description || "",
  };
  // يمكنك استخدام مودال التعديل هنا
  showToast("✏️ تعديل المنتج: " + product.name, "info");
};

const deleteProduct = async (id) => {
  if (!userStore?.canEdit) {
    showToast("⚠️ ليس لديك صلاحية لحذف المنتجات", "warning");
    return;
  }
  if (!confirm("⚠️ هل أنت متأكد من حذف هذا المنتج؟")) return;

  try {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) throw error;

    const index = selectedProductIds.value.indexOf(id);
    if (index > -1) {
      selectedProductIds.value.splice(index, 1);
    }
    showToast("✅ تم حذف المنتج بنجاح", "success");
    await loadProducts();
  } catch (error) {
    console.error("❌ خطأ في حذف المنتج:", error);
    showToast("❌ حدث خطأ في حذف المنتج", "error");
  }
};

// ============================================
// METHODS - INVOICE
// ============================================
const openInvoiceModal = () => {
  // Reset new items
  newInvoiceItems.value = [];
  invoiceData.value = {
    customer_name: "",
    customer_phone: "",
    customer_address: "",
  };
  showInvoiceModal.value = true;
};

const closeInvoiceModal = () => {
  showInvoiceModal.value = false;
  newInvoiceItems.value = [];
  invoiceData.value = {
    customer_name: "",
    customer_phone: "",
    customer_address: "",
  };
};

const removeFromInvoice = (index) => {
  const product = selectedProductsDetails.value[index];
  if (product) {
    const idx = selectedProductIds.value.indexOf(product.id);
    if (idx > -1) {
      selectedProductIds.value.splice(idx, 1);
      selectedProductIds.value = [...selectedProductIds.value];
    }
  }
};

const createInvoice = async () => {
  if (!invoiceData.value.customer_name) {
    showToast("⚠️ الرجاء إدخال اسم العميل", "warning");
    return;
  }

  const allItems = [...selectedProductsDetails.value, ...newInvoiceItems.value];
  
  if (allItems.length === 0) {
    showToast("⚠️ لا توجد منتجات محددة", "warning");
    return;
  }

  // التحقق من المنتجات الجديدة
  for (const item of newInvoiceItems.value) {
    if (!item.name || item.name.trim() === "") {
      showToast("⚠️ الرجاء إدخال اسم لكل منتج جديد", "warning");
      return;
    }
    if (!item.price || item.price <= 0) {
      showToast(`⚠️ الرجاء إدخال سعر صحيح للمنتج: ${item.name}`, "warning");
      return;
    }
  }

  creatingInvoice.value = true;

  try {
    const items = allItems.map(item => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity || 1,
      product_id: item.id && !String(item.id).startsWith('new_') ? item.id : null,
      is_new: String(item.id).startsWith('new_'),
    }));

    const orderData = {
      customer_name: invoiceData.value.customer_name,
      customer_phone: invoiceData.value.customer_phone || null,
      customer_address: invoiceData.value.customer_address || null,
      items: items,
      total_price: invoiceTotalPrice.value,
      status: "pending",
      payment_method: "cash",
      sale_type: "offline",
      cashier_name: userStore.user?.email || "محصل",
      order_date: new Date().toISOString(),
      notes: `تم إنشاؤه من كشف الأسعار - ${newInvoiceItems.value.length > 0 ? `(${newInvoiceItems.value.length} منتج خارجي)` : ''}`,
    };

    const { error } = await supabase
      .from("orders")
      .insert([orderData]);

    if (error) throw error;

    showToast(`✅ تم إنشاء الفاتورة بنجاح! الإجمالي: ${formatNumber(invoiceTotalPrice.value)} ج`, "success");

    // Clear selection
    selectedProductIds.value = [];
    newInvoiceItems.value = [];
    closeInvoiceModal();

    if (confirm("هل تريد طباعة الفاتورة؟")) {
      await generateInvoicePDF(orderData);
    }

  } catch (error) {
    console.error("❌ خطأ في إنشاء الفاتورة:", error);
    showToast("❌ حدث خطأ في إنشاء الفاتورة: " + error.message, "error");
  } finally {
    creatingInvoice.value = false;
  }
};

// ============================================
// METHODS - PDF & PRINT
// ============================================
const getPriceListHTML = () => {
  const items = filteredProducts.value;

  return `<!DOCTYPE html>
    <html dir="rtl">
    <head>
      <title>كشف الأسعار - ${STORE_NAME}</title>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', 'Tahoma', sans-serif; padding: 20px; background: white; direction: rtl; }
        .header { text-align: center; margin-bottom: 25px; border-bottom: 3px solid #2563eb; padding-bottom: 15px; }
        .header h1 { color: #2563eb; font-size: 28px; }
        .header p { color: #666; margin: 5px 0 0; }
        .store-info { font-size: 14px; color: #2563eb; margin-top: 8px; }
        .store-phone { font-size: 14px; color: #2563eb; margin-top: 4px; font-weight: bold; }
        .summary { background: #f8f9fa; padding: 15px; border-radius: 10px; margin-bottom: 20px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; border: 1px solid #e5e7eb; }
        .summary-item { text-align: center; }
        .summary-item .label { font-size: 12px; color: #666; }
        .summary-item .value { font-size: 18px; font-weight: bold; color: #2563eb; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
        th { background: #f1f1f1; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
        .footer .phone { color: #2563eb; font-weight: bold; font-size: 14px; margin-top: 5px; }
        @media print { body { padding: 0; } }
        @media (max-width: 600px) { .summary { grid-template-columns: repeat(2, 1fr); } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📋 كشف الأسعار</h1>
        <p>${STORE_NAME}</p>
        <div class="store-info">📍 ${STORE_ADDRESS}</div>
        <div class="store-phone">📞 للتواصل: ${STORE_PHONE}</div>
      </div>

      <div class="summary">
        <div class="summary-item">
          <div class="label">📦 عدد المنتجات</div>
          <div class="value">${items.length}</div>
        </div>
        <div class="summary-item">
          <div class="label">💰 متوسط السعر</div>
          <div class="value">${formatNumber(averagePrice.value)} ج</div>
        </div>
        <div class="summary-item">
          <div class="label">📦 قيمة المخزون</div>
          <div class="value">${formatNumber(totalStockValue.value)} ج</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>المنتج</th>
            <th>القسم</th>
            <th>السعر</th>
            <th>المخزون</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((p, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td>${escapeHtml(p.name)}${p.brand ? `<br><small style="color:#666">${escapeHtml(p.brand)}</small>` : ""}</td>
              <td>${getCategoryName(p.category)}</td>
              <td style="color:#16a34a; font-weight:bold;">${formatNumber(p.price)} ج</td>
              <td>${p.stock || 0}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <div style="margin-top:20px; padding:15px; background:#f0fdf4; border-radius:10px; border:1px solid #dcfce7;">
        <div style="display:flex; justify-content:space-between; font-size:16px;">
          <span><strong>📊 إجمالي المنتجات:</strong> ${items.length} منتج</span>
          <span><strong>💰 متوسط السعر:</strong> ${formatNumber(averagePrice.value)} ج</span>
        </div>
      </div>

      <div class="footer">
        <p>📍 ${STORE_NAME}</p>
        <p>🛡️ ضمان سنة كاملة | 🚚 توصيل سريع | 💳 دفع آمن</p>
        <p class="phone">📞 للتواصل والاستفسار: ${STORE_PHONE}</p>
        <p style="font-size: 10px; margin-top:5px;">تم تحديث القائمة بتاريخ ${new Date().toLocaleDateString("ar-EG")}</p>
      </div>
    </body>
    </html>`;
};

const generatePDF = async () => {
  if (filteredProducts.value.length === 0) {
    showToast("⚠️ لا توجد منتجات لطباعتها", "warning");
    return;
  }

  if (!html2pdf.value) {
    showToast("⏳ جاري تجهيز المكتبة...", "info");
    const module = await import("html2pdf.js");
    html2pdf.value = module.default;
  }

  const element = document.createElement("div");
  element.innerHTML = getPriceListHTML();

  const opt = {
    margin: [0.5, 0.5, 0.5, 0.5],
    filename: `كشف_الاسعار_${new Date().toISOString().split("T")[0]}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
  };

  html2pdf.value().set(opt).from(element).save();
  showToast("📄 جاري إنشاء PDF...", "info");
};

const printPriceList = () => {
  if (filteredProducts.value.length === 0) {
    showToast("⚠️ لا توجد منتجات للطباعة", "warning");
    return;
  }

  const printWindow = window.open("", "_blank");
  printWindow.document.write(getPriceListHTML());
  printWindow.document.close();
  printWindow.print();
  showToast("🖨️ جاري فتح الطباعة...", "info");
};

const generateInvoicePDF = async (order) => {
  if (!html2pdf.value) {
    const module = await import("html2pdf.js");
    html2pdf.value = module.default;
  }

  const invoiceHTML = `
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <title>فاتورة</title>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', 'Tahoma', sans-serif; padding: 20px; background: white; direction: rtl; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 3px solid #4f46e5; padding-bottom: 15px; }
        .header h1 { color: #4f46e5; }
        .info { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 10px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: right; }
        th { background: #f1f1f1; }
        .total { font-size: 20px; font-weight: bold; color: #4f46e5; text-align: center; padding: 15px; background: #f0fdf4; border-radius: 10px; margin-top: 15px; }
        .footer { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
        .new-item { background: #fff7ed; }
        .new-item td { border-color: #fdba74; }
        .new-badge { background: #f97316; color: white; padding: 2px 8px; border-radius: 10px; font-size: 10px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🧾 فاتورة بيع</h1>
        <p>${STORE_NAME}</p>
        <p>📞 ${STORE_PHONE}</p>
      </div>
      <div class="info">
        <div><strong>العميل:</strong> ${escapeHtml(order.customer_name)}</div>
        <div><strong>الهاتف:</strong> ${escapeHtml(order.customer_phone || "-")}</div>
        <div><strong>العنوان:</strong> ${escapeHtml(order.customer_address || "-")}</div>
        <div><strong>التاريخ:</strong> ${new Date().toLocaleDateString("ar-EG")}</div>
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>المنتج</th>
            <th>النوع</th>
            <th>الكمية</th>
            <th>السعر</th>
            <th>الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map((item, idx) => `
            <tr class="${item.is_new ? 'new-item' : ''}">
              <td>${idx + 1}</td>
              <td>${escapeHtml(item.name)}</td>
              <td>${item.is_new ? '<span class="new-badge">خارجي</span>' : 'مخزن'}</td>
              <td>${item.quantity}</td>
              <td>${formatNumber(item.price)} ج</td>
              <td>${formatNumber(item.price * item.quantity)} ج</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      <div class="total">💰 الإجمالي: ${formatNumber(order.total_price)} جنيه</div>
      <div class="footer">
        <p>📍 ${STORE_NAME}</p>
        <p>🛡️ ضمان سنة كاملة | 🚚 توصيل سريع</p>
        <p style="font-size: 10px; margin-top:5px;">${order.notes || ''}</p>
      </div>
    </body>
    </html>
  `;

  const element = document.createElement("div");
  element.innerHTML = invoiceHTML;

  const opt = {
    margin: [0.5, 0.5, 0.5, 0.5],
    filename: `فاتورة_${order.customer_name}_${new Date().toISOString().split("T")[0]}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
  };

  html2pdf.value().set(opt).from(element).save();
};

// ============================================
// LIFECYCLE
// ============================================
onMounted(async () => {
  await loadProducts();

  if (process.client) {
    const module = await import("html2pdf.js");
    html2pdf.value = module.default;
  }
});
</script>

<style scoped>
.max-h-600::-webkit-scrollbar {
  width: 6px;
}
.max-h-600::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}
.max-h-600::-webkit-scrollbar-thumb {
  background: #2563eb;
  border-radius: 10px;
}

@media (max-width: 640px) {
  input,
  button,
  select {
    font-size: 16px !important;
  }
}

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