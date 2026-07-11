<template>
  <div class="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen" dir="rtl">
    <!-- Header -->
    <div class="mb-4 sm:mb-6">
      <div
        class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
            🏪 بيع من المعرض
          </h1>
          <p class="text-sm sm:text-base text-gray-500">
            تسجيل مبيعات تتم داخل المعرض مباشرة - كاش أو تقسيط
          </p>
        </div>
        <div class="flex gap-2 flex-wrap">
          <button
            v-if="userStore?.canEdit"
            @click="openBrideChecklistModal"
            class="bg-pink-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-pink-700 transition flex items-center gap-2"
          >
            <span>👰</span> تحميل كشف عروسة
          </button>
          <button
            v-if="userStore?.canEdit"
            @click="clearAllCart"
            class="bg-gray-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-gray-700 transition"
          >
            مسح الكل
          </button>
        </div>
      </div>
    </div>

    <!-- Modal اختيار كشف العروسة -->
    <div
      v-if="showBrideModal"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      @click.self="showBrideModal = false"
    >
      <div
        class="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto"
      >
        <div
          class="p-4 border-b flex justify-between items-center sticky top-0 bg-white"
        >
          <h2 class="text-lg sm:text-xl font-bold">👰 اختيار كشف عروسة</h2>
          <button
            @click="showBrideModal = false"
            class="text-2xl hover:text-gray-600"
          >
            &times;
          </button>
        </div>
        <div class="p-4">
          <div
            v-if="savedChecklists.length === 0"
            class="text-center py-8 text-gray-400"
          >
            لا توجد كشوفات محفوظة
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="checklist in savedChecklists"
              :key="checklist.id"
              class="border rounded-xl p-3 hover:bg-gray-50 cursor-pointer transition"
              @click="loadChecklistToCart(checklist.id)"
            >
              <div class="flex justify-between items-center">
                <div>
                  <p class="font-semibold">{{ checklist.bride_name }}</p>
                  <p class="text-xs text-gray-500">
                    {{ formatDate(checklist.checklist_date) }} -
                    {{ checklist.total_items }} منتج
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-green-600 font-bold">
                    {{ formatNumber(checklist.total_amount) }} ج
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
      <!-- المنتجات -->
      <div class="bg-white rounded-2xl shadow p-4 sm:p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg sm:text-xl font-bold">📦 إضافة منتجات</h2>
          <div
            v-if="cart.length > 0"
            class="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full"
          >
            {{ cart.length }} منتج
          </div>
        </div>

        <!-- شريط البحث -->
        <div class="mb-4">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="🔍 بحث عن منتج..."
              class="w-full p-2.5 sm:p-3 border rounded-xl text-sm focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>
        </div>

        <!-- تبويبات الأقسام -->
        <div class="flex gap-2 flex-wrap mb-4 border-b">
          <button
            v-for="cat in categories"
            :key="cat.value"
            @click="
              activeCategory = cat.value;
              searchQuery = '';
            "
            class="px-3 sm:px-4 py-1.5 sm:py-2 font-medium transition text-sm sm:text-base"
            :class="
              activeCategory === cat.value
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500'
            "
          >
            {{ cat.icon }} {{ cat.name }}
          </button>
        </div>

        <!-- اختيار المنتج حسب القسم -->
        <div class="flex flex-col sm:flex-row gap-2 mb-4">
          <select
            v-model="selectedProductId"
            class="flex-1 p-2.5 sm:p-3 border rounded-xl text-sm"
          >
            <option value="">-- اختر منتج --</option>
            <option
              v-for="p in filteredProductsByCategory"
              :key="p.id"
              :value="p.id"
              :disabled="p.stock <= 0"
            >
              {{ p.name }} - {{ formatNumber(p.price) }} ج (المتبقي:
              {{ p.stock }} قطعة)
              {{ p.stock <= 0 ? " - ❌ غير متوفر" : "" }}
            </option>
          </select>
          <div class="flex gap-2">
            <input
              v-model.number="productQuantity"
              type="number"
              min="1"
              :max="maxAvailableQuantity"
              placeholder="الكمية"
              class="w-20 sm:w-24 p-2.5 sm:p-3 border rounded-xl text-sm"
            />
            <button
              v-if="userStore?.canEdit"
              @click="addToCart"
              :disabled="!selectedProductId || selectedProductStock <= 0"
              class="bg-blue-600 text-white px-4 sm:px-6 rounded-xl hover:bg-blue-700 text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              إضافة
            </button>
          </div>
        </div>

        <!-- عرض المخزون المتبقي -->
        <div
          v-if="selectedProductId && selectedProductStock !== null"
          class="mb-4 p-3 bg-gray-50 rounded-xl"
        >
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">📦 المخزون المتبقي:</span>
            <span
              :class="
                selectedProductStock < 10
                  ? 'text-red-600 font-bold'
                  : 'text-green-600 font-bold'
              "
              class="text-lg"
            >
              {{ selectedProductStock }} قطعة
            </span>
          </div>
        </div>

        <!-- سلة المنتجات -->
        <div class="border rounded-xl overflow-hidden">
          <div class="block md:hidden divide-y">
            <div v-for="(item, index) in cart" :key="index" class="p-4">
              <div class="flex justify-between items-start mb-2">
                <span class="font-medium text-sm">{{ item.name }}</span>
                <button
                  v-if="userStore?.canEdit"
                  @click="removeFromCart(index)"
                  class="text-red-500 text-lg"
                >
                  🗑️
                </button>
              </div>
              <div class="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span class="text-gray-500">الكمية:</span>
                  <div class="flex items-center gap-1 mt-1">
                    <button
                      @click="
                        item.quantity = Math.max(1, item.quantity - 1);
                        updateCart();
                      "
                      class="w-6 h-6 border rounded hover:bg-gray-100"
                    >
                      -
                    </button>
                    <input
                      v-model.number="item.quantity"
                      @change="validateCartItemQuantity(item, index)"
                      type="number"
                      min="1"
                      :max="item.stock"
                      class="w-14 text-center p-1 border rounded"
                    />
                    <button
                      @click="
                        item.quantity = Math.min(item.stock, item.quantity + 1);
                        updateCart();
                      "
                      class="w-6 h-6 border rounded hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div>
                  <span class="text-gray-500">السعر:</span>
                  <span class="font-medium mr-1"
                    >{{ formatNumber(item.price) }} ج</span
                  >
                </div>
                <div class="col-span-2">
                  <span class="text-gray-500">الإجمالي:</span>
                  <span class="font-bold text-green-600 mr-1"
                    >{{ formatNumber(item.price * item.quantity) }} ج</span
                  >
                </div>
              </div>
            </div>
            <div
              v-if="cart.length === 0"
              class="text-center py-8 text-gray-400"
            >
              لا توجد منتجات مضافة
            </div>
          </div>

          <div class="hidden md:block overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="p-3 text-right text-sm">المنتج</th>
                  <th class="p-3 text-right text-sm">الكمية</th>
                  <th class="p-3 text-right text-sm">السعر</th>
                  <th class="p-3 text-right text-sm">الإجمالي</th>
                  <th class="p-3 text-right text-sm"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in cart" :key="index" class="border-t">
                  <td class="p-3 text-sm">{{ item.name }}</td>
                  <td class="p-3">
                    <div class="flex items-center gap-1">
                      <button
                        @click="
                          item.quantity = Math.max(1, item.quantity - 1);
                          updateCart();
                        "
                        class="w-6 h-6 border rounded hover:bg-gray-100"
                      >
                        -
                      </button>
                      <input
                        v-model.number="item.quantity"
                        @change="validateCartItemQuantity(item, index)"
                        type="number"
                        min="1"
                        :max="item.stock"
                        class="w-16 text-center p-1 border rounded text-sm"
                      />
                      <button
                        @click="
                          item.quantity = Math.min(
                            item.stock,
                            item.quantity + 1,
                          );
                          updateCart();
                        "
                        class="w-6 h-6 border rounded hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td class="p-3 text-sm">{{ formatNumber(item.price) }} ج</td>
                  <td class="p-3 text-sm font-semibold">
                    {{ formatNumber(item.price * item.quantity) }} ج
                  </td>
                  <td class="p-3">
                    <button
                      v-if="userStore?.canEdit"
                      @click="removeFromCart(index)"
                      class="text-red-500 text-lg"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
                <tr v-if="cart.length === 0">
                  <td colspan="5" class="text-center py-8 text-gray-400">
                    لا توجد منتجات مضافة
                  </td>
                </tr>
              </tbody>
              <tfoot class="bg-gray-50">
                <tr>
                  <td colspan="3" class="p-3 font-bold">الإجمالي الكلي</td>
                  <td class="p-3 font-bold text-green-600 text-lg">
                    {{ formatNumber(totalPrice) }} ج
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- معلومات الكشف المحمل -->
        <div
          v-if="loadedBrideInfo"
          class="mt-4 p-3 bg-pink-50 rounded-xl border border-pink-200"
        >
          <div class="flex justify-between items-center">
            <div>
              <p class="text-xs text-pink-600">📋 كشف عروسة محمل</p>
              <p class="font-semibold text-sm">{{ loadedBrideInfo.name }}</p>
            </div>
            <button
              v-if="userStore?.canEdit"
              @click="clearLoadedBride"
              class="text-red-500 text-sm"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>

      <!-- بيانات العميل والدفع -->
      <div class="bg-white rounded-2xl shadow p-4 sm:p-6">
        <h2 class="text-lg sm:text-xl font-bold mb-4">👤 بيانات العميل</h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">اسم العميل *</label>
            <input
              v-model="customer.name"
              type="text"
              required
              class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
              placeholder="أدخل اسم العميل"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">رقم الهاتف</label>
            <input
              v-model="customer.phone"
              type="tel"
              class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
              placeholder="رقم الهاتف"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">اسم البائع</label>
            <input
              v-model="customer.cashier_name"
              type="text"
              placeholder="اسم الموظف"
              class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">طريقة الدفع</label>
            <select
              v-model="customer.payment_method"
              @change="onPaymentMethodChange"
              class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
            >
              <option value="cash">💰 كاش</option>
              <option value="card">💳 بطاقة</option>
              <option value="installments">📅 تقسيط</option>
            </select>
          </div>

          <!-- حقول التقسيط -->
          <div
            v-if="customer.payment_method === 'installments'"
            class="border-t pt-4 mt-2"
          >
            <h3 class="font-semibold text-md mb-3 text-purple-700">
              📋 تفاصيل التقسيط
            </h3>
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium mb-1"
                  >الدفعة المقدمة (المقدم) *</label
                >
                <input
                  v-model.number="installments.down_payment"
                  type="number"
                  min="0"
                  :max="totalPrice"
                  @input="calculateInstallment"
                  class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
                  placeholder="المبلغ المدفوع مقدماً"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1"
                  >عدد الشهور *</label
                >
                <input
                  v-model.number="installments.months"
                  type="number"
                  min="1"
                  max="36"
                  @input="calculateInstallment"
                  class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
                  placeholder="عدد شهور التقسيط"
                />
              </div>
              <div class="bg-purple-50 p-3 rounded-xl">
                <div class="flex justify-between mb-2">
                  <span class="text-sm text-gray-600">إجمالي المبلغ:</span>
                  <span class="font-bold"
                    >{{ formatNumber(totalPrice) }} ج</span
                  >
                </div>
                <div class="flex justify-between mb-2">
                  <span class="text-sm text-gray-600">المدفوع مقدماً:</span>
                  <span class="font-bold text-green-600"
                    >{{ formatNumber(installments.down_payment || 0) }} ج</span
                  >
                </div>
                <div class="flex justify-between mb-2">
                  <span class="text-sm text-gray-600">المتبقي:</span>
                  <span class="font-bold text-orange-600"
                    >{{ formatNumber(remainingAmount) }} ج</span
                  >
                </div>
                <div
                  class="flex justify-between pt-2 border-t border-purple-200"
                >
                  <span class="text-sm font-semibold">القسط الشهري:</span>
                  <span class="font-bold text-purple-700 text-lg"
                    >{{ formatNumber(installments.monthly_payment) }} ج</span
                  >
                </div>
                <div class="text-xs text-gray-500 mt-2 text-center">
                  على {{ installments.months || 0 }} شهر
                </div>
              </div>
            </div>
          </div>

          <button
            v-if="userStore?.canEdit"
            @click="completeSale"
            :disabled="cart.length === 0 || !customer.name"
            class="w-full bg-green-600 text-white py-2.5 sm:py-3 rounded-xl hover:bg-green-700 disabled:opacity-50 text-sm sm:text-base"
          >
            ✅ تأكيد البيع وطباعة الفاتورة
          </button>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <ToastNotification v-model:toast="toast" />

    <!-- نافذة الفاتورة المنبثقة - الجزء المعدل -->
    <div
      v-if="showInvoiceModal"
      class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto"
      @click.self="closeInvoiceModal"
    >
      <div
        class="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <!-- رأس النافذة -->
        <div
          class="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10 rounded-t-2xl"
        >
          <h2 class="text-xl font-bold text-gray-800">🧾 فاتورة البيع</h2>
          <div class="flex gap-2">
            <button
              @click="printInvoiceFromModal"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition flex items-center gap-2"
            >
              <span>🖨️</span> طباعة
            </button>
            <button
              @click="closeInvoiceModal"
              class="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300 transition"
            >
              ✕ إغلاق
            </button>
          </div>
        </div>

        <!-- محتوى الفاتورة -->
        <div
          id="invoice-content"
          class="p-6"
          style="direction: rtl; font-family: Cairo, Tahoma, sans-serif"
        >
          <!-- الهيدر -->
          <div class="text-center border-b-2 border-gray-200 pb-4 mb-4">
            <h1 class="text-2xl font-bold text-blue-700">🏪 جولدن</h1>
            <h2 class="text-base font-semibold text-gray-600">
              للأجهزة الكهربائية والأدوات المنزلية
            </h2>
            <p class="text-sm text-gray-500 mt-1">
              📍 طنطا - سبرباي - أمام المدينه الجامعيه
            </p>
            <p class="text-sm text-gray-500">📞 للتواصل: 01034003002</p>
            <div
              class="flex justify-between items-center mt-3 pt-2 border-t border-gray-200"
            >
              <span class="text-xs text-gray-500"
                >رقم الفاتورة: #{{ invoiceNumber }}</span
              >
              <span class="text-xs text-gray-500"
                >التاريخ: {{ currentDate }}</span
              >
            </div>
          </div>

          <!-- بيانات العميل -->
          <div
            class="bg-gradient-to-r from-blue-50 to-white p-4 rounded-xl mb-5 border-r-4 border-blue-500"
          >
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span class="text-gray-500">👤 العميل:</span>
                <span class="font-semibold">{{ customer.name }}</span>
              </div>
              <div>
                <span class="text-gray-500">📱 الهاتف:</span>
                <span>{{ customer.phone || "---" }}</span>
              </div>
              <div>
                <span class="text-gray-500">👨‍💼 البائع:</span>
                <span>{{
                  customer.cashier_name || userStore?.user?.email || "---"
                }}</span>
              </div>
              <div>
                <span class="text-gray-500">💰 الدفع:</span>
                <span
                  v-if="customer.payment_method === 'cash'"
                  class="text-green-600 font-semibold"
                  >كاش</span
                >
                <span
                  v-else-if="customer.payment_method === 'card'"
                  class="text-blue-600 font-semibold"
                  >بطاقة</span
                >
                <span
                  v-else-if="customer.payment_method === 'installments'"
                  class="text-purple-600 font-semibold"
                  >تقسيط</span
                >
              </div>
            </div>
          </div>

          <!-- جدول المنتجات -->
          <table class="w-full text-sm mb-4 border-collapse">
            <thead>
              <tr class="bg-gray-100 border-b-2 border-gray-300">
                <th class="p-2 text-center w-10">#</th>
                <th class="p-2 text-right">المنتج</th>
                <th class="p-2 text-center w-16">الكمية</th>
                <th class="p-2 text-right w-28">السعر</th>
                <th class="p-2 text-right w-32">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, idx) in cart"
                :key="idx"
                class="border-b border-gray-200 hover:bg-gray-50"
              >
                <td class="p-2 text-center">{{ idx + 1 }}</td>
                <td class="p-2">{{ item.name }}</td>
                <td class="p-2 text-center">{{ item.quantity }}</td>
                <td class="p-2 text-right">{{ formatNumber(item.price) }} ج</td>
                <td class="p-2 text-right font-semibold">
                  {{ formatNumber(item.price * item.quantity) }} ج
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="border-t-2 border-gray-400 bg-gray-50">
                <td colspan="4" class="p-2 font-bold text-right text-base">
                  الإجمالي الكلي
                </td>
                <td class="p-2 font-bold text-right text-green-600 text-lg">
                  {{ formatNumber(totalPrice) }} ج
                </td>
              </tr>
            </tfoot>
          </table>

          <!-- تفاصيل التقسيط -->
          <div
            v-if="customer.payment_method === 'installments'"
            class="bg-purple-50 p-4 rounded-xl mb-4 border-r-4 border-purple-500"
          >
            <h4 class="font-bold text-purple-700 mb-2 text-sm">
              📅 تفاصيل التقسيط
            </h4>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span class="text-gray-600">المقدم:</span>
                <strong class="text-green-600"
                  >{{ formatNumber(installments.down_payment) }} ج</strong
                >
              </div>
              <div>
                <span class="text-gray-600">المتبقي:</span>
                <strong class="text-orange-600"
                  >{{ formatNumber(remainingAmount) }} ج</strong
                >
              </div>
              <div>
                <span class="text-gray-600">القسط الشهري:</span>
                <strong class="text-purple-700"
                  >{{ formatNumber(installments.monthly_payment) }} ج</strong
                >
              </div>
              <div>
                <span class="text-gray-600">عدد الشهور:</span>
                <strong>{{ installments.months }} شهر</strong>
              </div>
            </div>
          </div>

          <!-- ملاحظة كشف العروسة -->
          <div
            v-if="loadedBrideInfo"
            class="bg-pink-50 p-3 rounded-lg mb-4 text-sm text-pink-700 border-r-4 border-pink-400"
          >
            📋 ملاحظة: هذا البيع مستند على كشف عروسة مسجل مسبقاً
          </div>

          <!-- التوقيعات -->
          <div
            class="grid grid-cols-2 gap-4 mb-4 mt-4 pt-4 border-t border-gray-200"
          >
            <div class="text-right">
              <p class="text-sm font-semibold">
                توقيع العميل: _________________
              </p>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold">
                توقيع البائع: _________________
              </p>
            </div>
          </div>

          <!-- التذييل -->
          <div
            class="text-center bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl"
          >
            <p class="text-base font-semibold text-gray-700">
              ✨ شكراً لتسوقكم من جولدن ✨
            </p>
            <p class="text-xs text-gray-500 mt-1">
              🛡️ ضمان سنة كاملة | 🚚 توصيل سريع | 🔒 دفع آمن
            </p>
            <p class="text-xs text-gray-500 mt-1">
              📞 للتواصل والاستفسار: 01034003002
            </p>
          </div>
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

// إعدادات المعرض
const shopSettings = ref({
  name: "جولدن",
  phone: "01034003002",
  address: "طنطا - سبرباي - أمام المدينه الجامعيه",
});

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

// الأقسام
const categories = [
  { name: "الكهرباء", value: "electrical", icon: "⚡" },
  { name: "المنزلي", value: "home", icon: "🏠" },
  { name: "البلاستيك", value: "plastic", icon: "🪑" },
];

const activeCategory = ref("electrical");
const searchQuery = ref("");
const products = ref([]);
const selectedProductId = ref("");
const productQuantity = ref(1);
const cart = ref([]);
const savedChecklists = ref([]);
const showBrideModal = ref(false);
const showInvoiceModal = ref(false);
const loadedBrideInfo = ref(null);

// بيانات التقسيط
const installments = ref({
  down_payment: 0,
  months: 0,
  monthly_payment: 0,
});

const customer = ref({
  name: "",
  phone: "",
  cashier_name: "",
  payment_method: "cash",
});

// المبلغ المتبقي بعد المقدم
const remainingAmount = computed(() => {
  return Math.max(0, totalPrice.value - (installments.value.down_payment || 0));
});

// حساب القسط الشهري
const calculateInstallment = () => {
  if (installments.value.months > 0 && remainingAmount.value > 0) {
    installments.value.monthly_payment = Math.ceil(
      remainingAmount.value / installments.value.months,
    );
  } else {
    installments.value.monthly_payment = 0;
  }
};

// عند تغيير طريقة الدفع
const onPaymentMethodChange = () => {
  if (customer.value.payment_method !== "installments") {
    installments.value = {
      down_payment: 0,
      months: 0,
      monthly_payment: 0,
    };
  }
};

// رقم الفاتورة العشوائي
const invoiceNumber = computed(() => {
  return Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0");
});

// التاريخ الحالي
const currentDate = computed(() => {
  const now = new Date();
  return now.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

const selectedProduct = computed(() => {
  return products.value.find((p) => p.id === selectedProductId.value);
});

const selectedProductStock = computed(() => {
  return selectedProduct.value?.stock || 0;
});

const maxAvailableQuantity = computed(() => {
  return selectedProductStock.value;
});

const filteredProductsByCategory = computed(() => {
  let filtered = products.value.filter(
    (p) => p.category === activeCategory.value,
  );
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.brand?.toLowerCase().includes(query),
    );
  }
  return filtered;
});

// إغلاق نافذة الفاتورة
const closeInvoiceModal = () => {
  showInvoiceModal.value = false;
};

// طباعة الفاتورة من المودال (في نفس التبويب)
const printInvoiceFromModal = () => {
  const printContent = document.getElementById("invoice-content");
  if (!printContent) return;

  const originalTitle = document.title;
  document.title = `فاتورة_${customer.value.name}_${invoiceNumber.value}`;

  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <title>فاتورة بيع - ${shopSettings.value.name}</title>
      <meta charset="UTF-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Cairo', 'Tahoma', sans-serif;
          margin: 0;
          padding: 20px;
          background: white;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 8px;
          border-bottom: 1px solid #e5e7eb;
        }
        @media print {
          body {
            padding: 0;
          }
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      ${printContent.outerHTML}
      <div class="no-print" style="text-align: center; margin-top: 20px; direction: ltr;">
        <button onclick="window.print()" style="padding: 10px 20px; margin: 10px; cursor: pointer; border: none; background: #3b82f6; color: white; border-radius: 10px;">🖨️ طباعة</button>
        <button onclick="window.close()" style="padding: 10px 20px; margin: 10px; cursor: pointer; border: none; background: #ef4444; color: white; border-radius: 10px;">❌ إغلاق</button>
      </div>
      <script>
        setTimeout(() => {
          window.print();
        }, 500);
      <\/script>
    </body>
    </html>
  `);
  printWindow.document.close();

  document.title = originalTitle;
};

const loadProducts = async () => {
  try {
    const { data } = await supabase.from("products").select("*").order("name");
    products.value = data || [];
  } catch (error) {
    console.error("Error loading products:", error);
    showToast("❌ حدث خطأ في تحميل المنتجات", "error");
  }
};

const loadSavedChecklists = async () => {
  try {
    const { data } = await supabase
      .from("bride_checklists")
      .select("*")
      .order("created_at", { ascending: false });
    savedChecklists.value = data || [];
  } catch (error) {
    console.error("Error loading saved checklists:", error);
  }
};

const openBrideChecklistModal = async () => {
  if (!userStore.canEdit) {
    showToast("⚠️ ليس لديك صلاحية لتحميل كشوفات العرائس", "warning");
    return;
  }
  await loadSavedChecklists();
  showBrideModal.value = true;
};

const loadChecklistToCart = async (checklistId) => {
  if (!userStore.canEdit) {
    showToast("⚠️ ليس لديك صلاحية لتحميل كشوفات العرائس", "warning");
    return;
  }

  try {
    const { data: checklist } = await supabase
      .from("bride_checklists")
      .select("*")
      .eq("id", checklistId)
      .single();

    const { data: items } = await supabase
      .from("bride_checklist_items")
      .select("*")
      .eq("checklist_id", checklistId);

    if (!items || items.length === 0) {
      showToast("⚠️ لا توجد منتجات في هذا الكشف", "warning");
      return;
    }

    loadedBrideInfo.value = {
      id: checklist.id,
      name: checklist.bride_name,
      phone: checklist.bride_phone,
      date: checklist.checklist_date,
      seller: checklist.seller_name,
    };

    const newCartItems = [];
    for (const item of items) {
      const product = products.value.find((p) => p.id === item.product_id);
      const stock = product?.stock || 0;

      if (stock < item.quantity) {
        showToast(
          `⚠️ المنتج "${item.product_name}" غير متوفر بالكمية المطلوبة (المتاح: ${stock})`,
          "warning",
        );
        continue;
      }

      newCartItems.push({
        id: item.product_id || item.id,
        name: item.product_name,
        price: product?.price || item.price,
        quantity: item.quantity,
        stock: stock,
        isFromBrideChecklist: true,
      });
    }

    cart.value = newCartItems;

    if (checklist.bride_name) {
      customer.value.name = checklist.bride_name;
    }
    if (checklist.bride_phone) {
      customer.value.phone = checklist.bride_phone;
    }

    showBrideModal.value = false;
    showToast(`✅ تم تحميل كشف "${checklist.bride_name}" بنجاح`, "success");
  } catch (error) {
    console.error("Error loading checklist:", error);
    showToast("❌ حدث خطأ أثناء تحميل الكشف", "error");
  }
};

const clearLoadedBride = () => {
  if (!userStore.canEdit) {
    showToast("⚠️ ليس لديك صلاحية لمسح الكشف", "warning");
    return;
  }
  loadedBrideInfo.value = null;
  cart.value = [];
  customer.value = {
    name: "",
    phone: "",
    cashier_name: "",
    payment_method: "cash",
  };
  showToast("🗑️ تم إلغاء الكشف المحمل", "info");
};

const clearAllCart = () => {
  if (!userStore.canEdit) {
    showToast("⚠️ ليس لديك صلاحية لمسح السلة", "warning");
    return;
  }
  if (cart.value.length === 0) return;
  if (confirm("هل تريد مسح جميع المنتجات من السلة؟")) {
    cart.value = [];
    loadedBrideInfo.value = null;
    customer.value = {
      name: "",
      phone: "",
      cashier_name: "",
      payment_method: "cash",
    };
    installments.value = { down_payment: 0, months: 0, monthly_payment: 0 };
    showToast("🗑️ تم مسح السلة", "info");
  }
};

const validateCartItemQuantity = (item, index) => {
  if (item.quantity > item.stock) {
    item.quantity = item.stock;
    showToast(
      `⚠️ الكمية المطلوبة أكبر من المخزون المتاح (المتاح: ${item.stock})`,
      "warning",
    );
  }
  if (item.quantity < 1) {
    item.quantity = 1;
  }
  updateCart();
};

const formatNumber = (num) => {
  if (!num && num !== 0) return "0";
  return num.toLocaleString("ar-EG") || "0";
};

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("ar-EG");
};

const totalPrice = computed(() => {
  return cart.value.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

const addToCart = () => {
  if (!userStore.canEdit) {
    showToast("⚠️ ليس لديك صلاحية لإضافة منتجات", "warning");
    return;
  }

  if (!selectedProductId.value) {
    showToast("⚠️ اختر منتج أولاً", "warning");
    return;
  }

  if (productQuantity.value < 1) {
    showToast("⚠️ الكمية غير صحيحة", "warning");
    return;
  }

  const product = products.value.find((p) => p.id === selectedProductId.value);
  if (!product) return;

  if (product.stock < productQuantity.value) {
    showToast(
      `⚠️ المخزون غير كافٍ. المتوفر: ${product.stock} قطعة فقط`,
      "warning",
    );
    return;
  }

  const existing = cart.value.find((i) => i.id === product.id);
  if (existing) {
    const newQuantity = existing.quantity + productQuantity.value;
    if (product.stock < newQuantity) {
      showToast(
        `⚠️ المخزون غير كافٍ. المتوفر: ${product.stock} قطعة فقط`,
        "warning",
      );
      return;
    }
    existing.quantity = newQuantity;
    showToast(`✅ تم تحديث كمية ${product.name} إلى ${newQuantity}`, "success");
  } else {
    cart.value.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: productQuantity.value,
      stock: product.stock,
    });
    showToast(`✅ تم إضافة ${product.name} إلى السلة`, "success");
  }

  selectedProductId.value = "";
  productQuantity.value = 1;
};

const updateCart = () => {
  cart.value = [...cart.value];
};

const removeFromCart = (index) => {
  if (!userStore.canEdit) {
    showToast("⚠️ ليس لديك صلاحية لحذف المنتجات", "warning");
    return;
  }
  const item = cart.value[index];
  cart.value.splice(index, 1);
  showToast(`❌ تم إزالة ${item.name} من السلة`, "info");
};

const completeSale = async () => {
  if (!userStore.canEdit) {
    showToast("⚠️ ليس لديك صلاحية لإتمام عملية البيع", "warning");
    return;
  }

  if (cart.value.length === 0) {
    showToast("⚠️ لا توجد منتجات", "warning");
    return;
  }
  if (!customer.value.name) {
    showToast("⚠️ الرجاء إدخال اسم العميل", "warning");
    return;
  }

  // التحقق من صحة بيانات التقسيط
  if (customer.value.payment_method === "installments") {
    if (
      !installments.value.down_payment &&
      installments.value.down_payment !== 0
    ) {
      showToast("⚠️ الرجاء إدخال قيمة الدفعة المقدمة", "warning");
      return;
    }
    if (!installments.value.months || installments.value.months < 1) {
      showToast("⚠️ الرجاء إدخال عدد الشهور", "warning");
      return;
    }
    if (installments.value.down_payment > totalPrice.value) {
      showToast(
        "⚠️ الدفعة المقدمة لا يمكن أن تزيد عن إجمالي المبلغ",
        "warning",
      );
      return;
    }
  }

  let outOfStock = false;
  for (const item of cart.value) {
    const currentProduct = products.value.find((p) => p.id === item.id);
    if (currentProduct && currentProduct.stock < item.quantity) {
      showToast(
        `⚠️ المنتج "${item.name}" غير متوفر بالكمية المطلوبة (المتاح: ${currentProduct.stock})`,
        "warning",
      );
      outOfStock = true;
    }
  }
  if (outOfStock) return;

  // إنشاء نص الملاحظات مع تفاصيل التقسيط
  let notes = loadedBrideInfo.value
    ? `كشف عروسة ID: ${loadedBrideInfo.value.id}`
    : "";

  if (customer.value.payment_method === "installments") {
    const installmentDetails = `\n【تفاصيل التقسيط】
- الدفعة المقدمة: ${installments.value.down_payment} ج
- عدد الشهور: ${installments.value.months} شهر
- القسط الشهري: ${installments.value.monthly_payment} ج
- المتبقي: ${remainingAmount.value} ج`;

    notes = notes ? notes + installmentDetails : installmentDetails;
  }

  const orderData = {
    customer_name: customer.value.name,
    customer_phone: customer.value.phone || null,
    customer_address: loadedBrideInfo.value
      ? `كشف عروسة - ${loadedBrideInfo.value.name}`
      : "بيع من المعرض",
    items: cart.value.map((item) => ({
      product_id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
    total_price: totalPrice.value,
    status: "delivered",
    payment_method: customer.value.payment_method,
    sale_type: "offline",
    cashier_name: customer.value.cashier_name || userStore.user?.email,
    order_date: new Date(),
    notes: notes.trim() || null,
  };

  const { error: orderError } = await supabase
    .from("orders")
    .insert([orderData]);

  if (orderError) {
    showToast(`❌ خطأ: ${orderError.message}`, "error");
    return;
  }

  // تحديث المخزون
  for (const item of cart.value) {
    const product = products.value.find((p) => p.id === item.id);
    const newStock = Math.max(0, (product.stock || 0) - item.quantity);
    await supabase
      .from("products")
      .update({ stock: newStock })
      .eq("id", item.id);
    product.stock = newStock;
  }

  showToast("✅ تم تسجيل البيع بنجاح", "success");

  // عرض الفاتورة للمعاينة قبل الطباعة
  showInvoiceModal.value = true;

  // تفريغ البيانات (بعد إغلاق الفاتورة أو بشكل منفصل)
  // ملاحظة: لا نمسح البيانات فوراً حتى تظهر في الفاتورة
};

// تحديث المنتجات عند الإغلاق
const refreshAfterSale = async () => {
  cart.value = [];
  loadedBrideInfo.value = null;
  customer.value = {
    name: "",
    phone: "",
    cashier_name: "",
    payment_method: "cash",
  };
  installments.value = { down_payment: 0, months: 0, monthly_payment: 0 };
  await loadProducts();
};

// مراقبة إغلاق المودال لمسح البيانات
watch(showInvoiceModal, (newVal) => {
  if (!newVal) {
    refreshAfterSale();
  }
});

onMounted(() => {
  loadProducts();
  loadSavedChecklists();
});
</script>

<style scoped>
@media (max-width: 640px) {
  select,
  input {
    font-size: 16px !important;
  }
}

button:active {
  transform: scale(0.98);
}

.fixed .overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}
.fixed .overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}
.fixed .overflow-y-auto::-webkit-scrollbar-thumb {
  background: #f43f5e;
  border-radius: 10px;
}

select option:disabled {
  color: #9ca3af;
  background-color: #f3f4f6;
}
</style>
