<template>
  <div class="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen" dir="rtl">
    <!-- Header -->
    <div class="mb-4 sm:mb-6">
      <div
        class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
            💰 المبيعات
          </h1>
          <p class="text-sm sm:text-base text-gray-500">
            متابعة وتحليل المبيعات اليومية
          </p>
        </div>
        <!-- إحصائيات سريعة للكشوفات -->
        <div class="flex gap-2">
          <div class="bg-pink-100 rounded-xl px-3 py-2 text-center">
            <p class="text-xs text-pink-600">مبيعات كشوفات</p>
            <p class="text-lg font-bold text-pink-600">
              {{ formatNumber(brideChecklistSales.total) }} ج
            </p>
          </div>
          <div class="bg-blue-100 rounded-xl px-3 py-2 text-center">
            <p class="text-xs text-blue-600">عدد الكشوفات</p>
            <p class="text-lg font-bold text-blue-600">
              {{ brideChecklistSales.count }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl shadow p-3 sm:p-4 mb-6">
      <div class="flex flex-col gap-4">
        <!-- Period Buttons -->
        <div>
          <label class="block text-sm font-medium mb-1">الفترة</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="period in periods"
              :key="period.value"
              @click="
                selectedPeriod = period.value;
                loadSales();
              "
              class="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition text-xs sm:text-sm whitespace-nowrap"
              :class="
                selectedPeriod === period.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              "
            >
              {{ period.name }}
            </button>
          </div>
        </div>

        <!-- Custom Date Range -->
        <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          <div class="flex-1 w-full">
            <label class="block text-sm font-medium mb-1">تاريخ مخصص</label>
            <div class="flex flex-col sm:flex-row gap-2">
              <input
                type="date"
                v-model="customStartDate"
                class="flex-1 p-2 border rounded-lg text-sm"
              />
              <span class="py-2 text-center sm:text-center">إلى</span>
              <input
                type="date"
                v-model="customEndDate"
                class="flex-1 p-2 border rounded-lg text-sm"
              />
              <button
              v-if="userStore?.canEdit"
                @click="loadSalesWithCustomDate"
                class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm whitespace-nowrap"
              >
                عرض
              </button>
            </div>
          </div>

          <!-- Payment Method Filter -->
          <div class="w-full sm:w-48">
            <label class="block text-sm font-medium mb-1">طريقة الدفع</label>
            <select
              v-model="filterPayment"
              @change="loadSales"
              class="w-full p-2 border rounded-lg text-sm"
            >
              <option value="all">الكل</option>
              <option value="cash">كاش</option>
              <option value="card">بطاقة</option>
              <option value="installments">تقسيط</option>
            </select>
          </div>

          <!-- فلتر نوع المبيعات -->
          <div class="w-full sm:w-48">
            <label class="block text-sm font-medium mb-1">نوع المبيعات</label>
            <select
              v-model="filterSaleType"
              @change="loadSales"
              class="w-full p-2 border rounded-lg text-sm"
            >
              <option value="all">الكل</option>
              <option value="normal">مبيعات عادية</option>
              <option value="bride_checklist">كشوفات عرائس</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- 4 Cards إحصائيات -->
    <div
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8"
    >
      <div
        class="bg-gradient-to-r from-green-500 to-green-600 rounded-xl sm:rounded-2xl shadow p-3 sm:p-5 text-white"
      >
        <p class="text-xs sm:text-sm opacity-90">إجمالي المبيعات</p>
        <p class="text-xl sm:text-3xl font-bold break-words">
          {{ formatNumber(stats.totalSales) }} ج
        </p>
        <p class="text-xs opacity-80 mt-1">{{ stats.ordersCount }} طلب</p>
      </div>

      <div
        class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl shadow p-3 sm:p-5 text-white"
      >
        <p class="text-xs sm:text-sm opacity-90">متوسط قيمة الطلب</p>
        <p class="text-xl sm:text-3xl font-bold break-words">
          {{ formatNumber(stats.averageOrderValue) }} ج
        </p>
      </div>

      <div
        class="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl sm:rounded-2xl shadow p-3 sm:p-5 text-white"
      >
        <p class="text-xs sm:text-sm opacity-90">أعلى طلب</p>
        <p class="text-xl sm:text-3xl font-bold break-words">
          {{ formatNumber(stats.maxOrderValue) }} ج
        </p>
      </div>

      <div
        class="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl sm:rounded-2xl shadow p-3 sm:p-5 text-white"
      >
        <p class="text-xs sm:text-sm opacity-90">المبيعات النقدية</p>
        <p class="text-xl sm:text-3xl font-bold break-words">
          {{ formatNumber(stats.cashSales) }} ج
        </p>
      </div>
    </div>

    <!-- رسم بياني للمبيعات -->
    <div class="bg-white rounded-2xl shadow p-4 sm:p-6 mb-6 sm:mb-8">
      <h2 class="text-lg sm:text-xl font-bold mb-4">📈 اتجاه المبيعات</h2>
      <div class="h-64 sm:h-72">
        <canvas id="salesChart"></canvas>
      </div>
    </div>

    <!-- توزيع طرق الدفع -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
      <div class="bg-white rounded-2xl shadow p-4 sm:p-6">
        <h2 class="text-base sm:text-lg font-bold mb-4">💳 توزيع طرق الدفع</h2>
        <div class="h-40 sm:h-48">
          <canvas id="paymentChart"></canvas>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow p-4 sm:p-6 lg:col-span-2">
        <h2 class="text-base sm:text-lg font-bold mb-4">
          🏷️ المبيعات حسب الفئة
        </h2>
        <div class="space-y-2 sm:space-y-3">
          <div
            v-for="cat in categorySales"
            :key="cat.name"
            class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3"
          >
            <div class="w-full sm:w-32 text-sm">{{ cat.name }}</div>
            <div class="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
              <div
                class="bg-blue-500 h-full rounded-full flex items-center justify-end px-2 text-white text-xs"
                :style="{ width: `${Math.min(cat.percentage, 100)}%` }"
              >
                {{ cat.percentage > 15 ? cat.percentage.toFixed(0) + "%" : "" }}
              </div>
            </div>
            <div class="text-right font-bold text-sm sm:text-base">
              {{ formatNumber(cat.total) }} ج
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- جدول المبيعات -->
    <div class="bg-white rounded-2xl shadow overflow-hidden">
      <div
        class="px-3 sm:px-6 py-3 sm:py-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
      >
        <h2 class="text-base sm:text-xl font-bold">📋 قائمة المبيعات</h2>
        <button
        v-if="userStore?.canEdit"
          @click="exportSales"
          class="px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs sm:text-sm whitespace-nowrap"
        >
          📥 تصدير Excel
        </button>
      </div>

      <!-- Mobile Cards View -->
      <div class="block md:hidden divide-y">
        <div
          v-for="(order, index) in orders"
          :key="order.id"
          class="p-4 hover:bg-gray-50"
        >
          <div class="flex justify-between items-start mb-3">
            <div>
              <p class="font-medium text-sm">
                {{ order.customer_name || "زائر" }}
              </p>
              <p class="text-xs text-gray-500 dir-ltr">
                {{ order.customer_phone || "-" }}
              </p>
            </div>
            <div class="flex flex-col items-end gap-1">
              <span
                :class="getPaymentMethodClass(order.payment_method)"
                class="px-2 py-1 rounded-full text-xs"
              >
                {{ getPaymentMethodName(order.payment_method) }}
              </span>
              <!-- علامة كشف عروسة -->
              <span
                v-if="order.notes && order.notes.includes('كشف عروسة')"
                class="text-pink-600 text-xs bg-pink-50 px-2 py-0.5 rounded-full"
              >
                👰 كشف عروسة
              </span>
            </div>
          </div>

          <div class="space-y-2 text-sm">
            <div>
              <span class="text-gray-500">المنتجات:</span>
              <div class="text-xs mt-1">
                <div
                  v-for="item in order.items?.slice(0, 2)"
                  :key="item.product_id"
                  class="py-0.5"
                >
                  {{ item.name }} (x{{ item.quantity }})
                </div>
                <div v-if="order.items?.length > 2" class="text-gray-400">
                  +{{ order.items.length - 2 }} منتجات
                </div>
              </div>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">الإجمالي:</span>
              <span class="font-bold text-green-600"
                >{{ formatNumber(order.total_price) }} ج</span
              >
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">الحالة:</span>
              <span
                class="px-2 py-1 rounded-full text-xs"
                :class="getStatusClass(order.status)"
              >
                {{ getStatusName(order.status) }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">التاريخ:</span>
              <span class="text-xs">{{
                formatDateTime(order.order_date)
              }}</span>
            </div>
            <div class="flex justify-end pt-2">
              <button
              v-if="userStore?.canEdit"
                @click="printInvoice(order)"
                class="text-blue-600 hover:text-blue-800 text-sm"
              >
                🖨️ طباعة الفاتورة
              </button>
            </div>
          </div>
        </div>
        <div v-if="orders.length === 0" class="text-center py-12 text-gray-400">
          لا توجد مبيعات في هذه الفترة
        </div>
      </div>

      <!-- Desktop Table View -->
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full min-w-[900px]">
          <thead class="bg-gray-50">
            <tr>
              <th class="p-3 text-right text-sm">#</th>
              <th class="p-3 text-right text-sm">العميل</th>
              <th class="p-3 text-right text-sm hidden lg:table-cell">الهاتف</th>
              <th class="p-3 text-right text-sm">المنتجات</th>
              <th class="p-3 text-right text-sm">الإجمالي</th>
              <th class="p-3 text-right text-sm hidden sm:table-cell">
                طريقة الدفع
              </th>
              <th class="p-3 text-right text-sm hidden xl:table-cell">الحالة</th>
              <th class="p-3 text-right text-sm hidden lg:table-cell">
                التاريخ
              </th>
              <th class="p-3 text-right text-sm">المصدر</th>
              <th class="p-3 text-right text-sm">فاتورة</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(order, index) in orders"
              :key="order.id"
              class="border-t hover:bg-gray-50"
            >
              <td class="p-3 text-sm">{{ index + 1 }}</td>
              <td class="p-3 text-sm font-medium max-w-[150px] truncate">
                {{ order.customer_name || "زائر" }}
              </td>
              <td class="p-3 text-sm dir-ltr hidden lg:table-cell">
                {{ order.customer_phone || "-" }}
              </td>
              <td class="p-3">
                <div class="text-xs max-w-[200px]">
                  <div
                    v-for="item in order.items?.slice(0, 2)"
                    :key="item.product_id"
                    class="py-0.5"
                  >
                    {{ item.name }} (x{{ item.quantity }})
                  </div>
                  <div v-if="order.items?.length > 2" class="text-gray-400">
                    +{{ order.items.length - 2 }} منتجات
                  </div>
                </div>
              </td>
              <td
                class="p-3 font-bold text-green-600 text-sm whitespace-nowrap"
              >
                {{ formatNumber(order.total_price) }} ج
              </td>
              <td class="p-3 hidden sm:table-cell">
                <span
                  :class="getPaymentMethodClass(order.payment_method)"
                  class="px-2 py-1 rounded-full text-xs whitespace-nowrap"
                >
                  {{ getPaymentMethodName(order.payment_method) }}
                </span>
              </td>
              <td class="p-3 hidden xl:table-cell">
                <span
                  class="px-2 py-1 rounded-full text-xs"
                  :class="getStatusClass(order.status)"
                >
                  {{ getStatusName(order.status) }}
                </span>
              </td>
              <td class="p-3 text-xs hidden lg:table-cell whitespace-nowrap">
                {{ formatDateTime(order.order_date) }}
              </td>
              <td class="p-3">
                <!-- عرض مصدر البيع -->
                <span
                  v-if="order.notes && order.notes.includes('كشف عروسة')"
                  class="bg-pink-100 text-pink-700 px-2 py-1 rounded-full text-xs whitespace-nowrap"
                >
                  👰 كشف عروسة
                </span>
                <span
                  v-else
                  class="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs whitespace-nowrap"
                >
                  🏪 بيع مباشر
                </span>
              </td>
              <td class="p-3">
                <button
                  @click="printInvoice(order)"
                  v-if="userStore?.canEdit"
                  class="text-blue-600 hover:text-blue-800 text-lg sm:text-base"
                >
                  🖨️
                </button>
              </td>
            </tr>
            <tr v-if="orders.length === 0">
              <td colspan="10" class="text-center py-12 text-gray-400">
                لا توجد مبيعات في هذه الفترة
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal عرض الفاتورة - نسخة العميل المنسقة -->
    <div
      v-if="showInvoiceModal"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      @click.self="showInvoiceModal = false"
    >
      <div
        class="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <!-- محتوى الفاتورة -->
        <div id="invoiceContent" class="p-6 sm:p-8">
          <!-- ==================== الهيدر ==================== -->
          <div class="relative mb-8">
            <!-- خلفية مزخرفة -->
            <div
              class="absolute top-0 left-0 w-32 h-32 bg-blue-100 rounded-full opacity-20 -translate-x-10 -translate-y-10"
            ></div>
            <div
              class="absolute bottom-0 right-0 w-32 h-32 bg-pink-100 rounded-full opacity-20 translate-x-10 translate-y-10"
            ></div>

            <div class="text-center relative">
              <!-- الشعار -->
              <div class="flex justify-center mb-4">
                <div
                  class="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-2xl shadow-lg"
                >
                  <span class="text-4xl">⭐</span>
                </div>
              </div>

              <h1
                class="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              >
                جولدن
              </h1>
              <p class="text-gray-500 text-sm mt-2">
                الأجهزة الكهربائية - الأدوات المنزلية - البلاستيك والتخزين
              </p>

              <div class="flex flex-wrap justify-center gap-4 mt-3 text-xs">
                <span class="inline-flex items-center gap-1 text-gray-500"
                  >📍 طنطا - سبرباي - أمام المدينة الجامعية</span
                >
                <span class="inline-flex items-center gap-1 text-gray-500"
                  >📞 01034003002</span
                >
              </div>
            </div>
          </div>

          <!-- خط فاصل مزخرف -->
          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-200"></div>
            </div>
            <div class="relative flex justify-center">
              <span class="bg-white px-3 text-gray-300 text-sm">❖ ❖ ❖</span>
            </div>
          </div>

          <!-- ==================== بيانات العميل ==================== -->
          <div
            class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-5 mb-6"
          >
            <div class="flex items-center gap-2 mb-4">
              <div
                class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"
              >
                <span class="text-sm">👤</span>
              </div>
              <h3 class="font-bold text-gray-700">بيانات العميل</h3>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-gray-400">اسم العميل</p>
                <p class="font-semibold text-gray-800 text-lg">
                  {{ currentInvoice?.customer_name || "زائر" }}
                </p>
              </div>
              <div>
                <p class="text-xs text-gray-400">رقم الهاتف</p>
                <p class="font-semibold text-gray-800 text-lg dir-ltr">
                  {{ currentInvoice?.customer_phone || "-" }}
                </p>
              </div>
            
            </div>
          </div>

          <!-- ==================== جدول المنتجات ==================== -->
          <div class="mb-6">
            <div class="flex items-center gap-2 mb-4">
              <div
                class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center"
              >
                <span class="text-sm">📦</span>
              </div>
              <h3 class="font-bold text-gray-700">المنتجات المطلوبة</h3>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="bg-gray-100">
                    <th
                      class="p-3 text-right rounded-tr-2xl text-sm font-bold text-gray-700"
                    >
                      #
                    </th>
                    <th class="p-3 text-right text-sm font-bold text-gray-700">
                      المنتج
                    </th>
                    <th class="p-3 text-right text-sm font-bold text-gray-700">
                      الكمية
                    </th>
                    <th class="p-3 text-right text-sm font-bold text-gray-700">
                      السعر
                    </th>
                    <th
                      class="p-3 text-right rounded-tl-2xl text-sm font-bold text-gray-700"
                    >
                      الإجمالي
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(item, idx) in currentInvoice?.items"
                    :key="item.product_id"
                    class="border-b border-gray-100"
                  >
                    <td class="p-3 text-sm text-gray-500">{{ idx + 1 }}</td>
                    <td class="p-3 text-sm font-medium text-gray-800">
                      {{ item.name }}
                    </td>
                    <td class="p-3 text-sm text-gray-600">
                      {{ item.quantity }}
                    </td>
                    <td class="p-3 text-sm text-gray-600">
                      {{ formatNumber(item.price) }} ج
                    </td>
                    <td class="p-3 text-sm font-bold text-green-600">
                      {{ formatNumber(item.price * item.quantity) }} ج
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- ==================== الإجمالي ==================== -->
          <div
            class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-5 mb-6"
          >
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-2">
                <span class="text-xl">💰</span>
                <span class="font-bold text-gray-700">إجمالي الفاتورة</span>
              </div>
              <div>
                <span class="text-2xl font-bold text-green-700">{{
                  formatNumber(currentInvoice?.total_price)
                }}</span>
                <span class="text-sm text-green-600 mr-1">ج.م</span>
              </div>
            </div>
          </div>

          <!-- ==================== طريقة الدفع والتاريخ ==================== -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div class="bg-blue-50 rounded-2xl p-4 text-center">
              <div
                class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2"
              >
                <span class="text-lg">💳</span>
              </div>
              <p class="text-xs text-gray-500">طريقة الدفع</p>
              <p class="font-bold text-gray-800 text-lg">
                {{ getPaymentMethodName(currentInvoice?.payment_method) }}
              </p>
            </div>
            <div class="bg-purple-50 rounded-2xl p-4 text-center">
              <div
                class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2"
              >
                <span class="text-lg">📅</span>
              </div>
              <p class="text-xs text-gray-500">تاريخ الفاتورة</p>
              <p class="font-bold text-gray-800 text-lg">
                {{ formatDateTime(currentInvoice?.order_date) }}
              </p>
            </div>
          </div>

          <!-- ==================== جدول الأقساط (في حالة التقسيط) ==================== -->
          <div
            v-if="
              currentInvoice?.payment_method === 'installments' &&
              installmentPayments.length > 0
            "
            class="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-5 mb-6"
          >
            <div class="flex items-center gap-2 mb-4">
              <div
                class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center"
              >
                <span class="text-sm">📅</span>
              </div>
              <h3 class="font-bold text-orange-700">جدول سداد الأقساط</h3>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              <div
                v-for="payment in installmentPayments"
                :key="payment.id"
                class="bg-white rounded-xl p-3 text-center shadow-sm border border-orange-100"
              >
                <div class="text-xl mb-1">
                  {{ getInstallmentIcon(payment.installment_number) }}
                </div>
                <p class="text-xs text-gray-500">
                  القسط {{ payment.installment_number }}
                </p>
                <p class="text-sm font-bold text-orange-600">
                  {{ formatNumber(payment.amount) }} ج
                </p>
                <p class="text-[10px] text-gray-400 mt-1">
                  {{ formatDate(payment.due_date) }}
                </p>
              </div>
            </div>

            <div class="mt-4 p-3 bg-orange-100 rounded-xl text-center">
              <p class="text-xs text-orange-700">
                📌 يتم دفع القسط الأول مع الاستلام، والأقساط التالية شهرياً
              </p>
            </div>
          </div>

          <!-- ==================== التوقيعات ==================== -->
          <div
            class="grid grid-cols-2 gap-6 mt-6 pt-4 border-t border-gray-200"
          >
            <div class="text-center">
              <p class="text-xs text-gray-400 mb-2">توقيع المستلم</p>
              <div class="border-b border-gray-300 pb-1 mx-4">
                <span class="text-gray-400 text-sm">_________________</span>
              </div>
            </div>
            <div class="text-center">
              <p class="text-xs text-gray-400 mb-2">توقيع البائع</p>
              <div class="border-b border-gray-300 pb-1 mx-4">
                <span class="text-gray-400 text-sm">_________________</span>
              </div>
            </div>
          </div>

          <!-- ==================== الفوتر ==================== -->
          <div class="text-center mt-8 pt-4 border-t border-gray-200">
            <div class="flex justify-center gap-6 mb-4">
              <div class="text-center">
                <div
                  class="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-1"
                >
                  <span>🛡️</span>
                </div>
                <p class="text-xs text-gray-500">ضمان سنة كاملة</p>
              </div>
              <div class="text-center">
                <div
                  class="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-1"
                >
                  <span>🚚</span>
                </div>
                <p class="text-xs text-gray-500">توصيل سريع</p>
              </div>
              <div class="text-center">
                <div
                  class="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-1"
                >
                  <span>💳</span>
                </div>
                <p class="text-xs text-gray-500">دفع آمن</p>
              </div>
            </div>
            <p class="text-gray-600 text-sm">شكراً لتسوقكم مع جولدن</p>
            <p class="text-gray-400 text-xs mt-1">نتمنى لكم تجربة تسوق سعيدة</p>
          </div>
        </div>

        <!-- ==================== أزرار التحكم ==================== -->
        <div
          class="border-t p-4 sm:p-6 flex flex-col sm:flex-row gap-3 bg-gray-50 rounded-b-3xl"
        >
          <button
          v-if="userStore?.canEdit"
            @click="printCurrentInvoice"
            class="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-all duration-300 text-sm font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            <span>🖨️</span> طباعة الفاتورة
          </button>
          <button
          v-if="userStore?.canEdit"
            @click="downloadInvoicePDF"
            class="flex-1 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition-all duration-300 text-sm font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            <span>📄</span> تحميل PDF
          </button>
          <button
            @click="showInvoiceModal = false"
            class="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 transition-all duration-300 text-sm font-medium"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
    <!-- iframe مخفي للطباعة -->
    <iframe id="printFrame" style="display: none"></iframe>
  </div>
</template>

<script setup>
import { useCartStore } from "~/stores/cart";
definePageMeta({
  layout: "dashboard",
  middleware: "admin-only",
});

const supabase = useSupabaseClient();

// State
const orders = ref([]);
const selectedPeriod = ref("week");
const filterPayment = ref("all");
const filterSaleType = ref("all");
const customStartDate = ref("");
const customEndDate = ref("");
const showInvoiceModal = ref(false);
const currentInvoice = ref(null);
// جلب الأقساط للفاتورة (في حالة التقسيط)
const installmentPayments = ref([]);
// في بداية الـ script، بعد الـ state
const html2pdfLib = ref(null);
// أيقونة لكل قسط
const getInstallmentIcon = (number) => {
  const icons = ["🥇", "🥈", "🥉", "📅", "📅", "📅", "📅", "📅", "📅", "📅"];
  return icons[number - 1] || "📅";
};

// جلب الأقساط
const loadInstallmentPayments = async (customerName) => {
  try {
    // البحث عن عقد التقسيط
    const { data: contract } = await supabase
      .from("installment_contracts")
      .select("id")
      .eq("customer_name", customerName)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (contract) {
      const { data: payments } = await supabase
        .from("installment_payments")
        .select("*")
        .eq("contract_id", contract.id)
        .order("installment_number");
      installmentPayments.value = payments || [];
    } else {
      installmentPayments.value = [];
    }
  } catch (error) {
    console.error("Error loading installment payments:", error);
    installmentPayments.value = [];
  }
};

// تعديل دالة printInvoice
const printInvoice = async (order) => {
  currentInvoice.value = order;
  installmentPayments.value = [];

  // إذا كانت طريقة الدفع تقسيط، نجيب الأقساط
  if (order.payment_method === "installments") {
    await loadInstallmentPayments(order.customer_name);
  }

  showInvoiceModal.value = true;
};

// دالة تنسيق التاريخ
const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("ar-EG");
};
// إحصائيات كشوفات العرائس
const brideChecklistSales = ref({
  total: 0,
  count: 0,
});

const periods = [
  { name: "اليوم", value: "today" },
  { name: "آخر 7 أيام", value: "week" },
  { name: "آخر 30 يوم", value: "month" },
  { name: "هذا الشهر", value: "thisMonth" },
  { name: "السنة", value: "year" },
];

const stats = ref({
  totalSales: 0,
  ordersCount: 0,
  averageOrderValue: 0,
  maxOrderValue: 0,
  cashSales: 0,
});

const categorySales = ref([]);

// Helper functions
const formatNumber = (num) => {
  if (!num && num !== 0) return "0";
  return num.toLocaleString("ar-EG");
};

const formatDateTime = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleString("ar-EG");
};

const getPaymentMethodName = (method) => {
  const names = { cash: "كاش", card: "بطاقة", installments: "تقسيط" };
  return names[method] || method;
};

const getPaymentMethodClass = (method) => {
  const classes = {
    cash: "bg-green-100 text-green-700",
    card: "bg-blue-100 text-blue-700",
    installments: "bg-purple-100 text-purple-700",
  };
  return classes[method] || "bg-gray-100 text-gray-700";
};

const getStatusName = (status) => {
  const names = {
    pending: "قيد الانتظار",
    processing: "قيد التجهيز",
    shipped: "تم الشحن",
    delivered: "تم التسليم",
    cancelled: "ملغي",
  };
  return names[status] || status;
};

const getStatusClass = (status) => {
  const classes = {
    pending: "bg-yellow-100 text-yellow-700",
    processing: "bg-blue-100 text-blue-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };
  return classes[status] || "bg-gray-100";
};

// حساب تاريخ البدء
const getDateRange = () => {
  const now = new Date();
  let startDate = new Date();
  let endDate = new Date();

  if (customStartDate.value && customEndDate.value) {
    startDate = new Date(customStartDate.value);
    endDate = new Date(customEndDate.value);
    endDate.setHours(23, 59, 59, 999);
    return { startDate, endDate };
  }

  endDate.setHours(23, 59, 59, 999);

  if (selectedPeriod.value === "today") {
    startDate.setHours(0, 0, 0, 0);
  } else if (selectedPeriod.value === "week") {
    startDate.setDate(now.getDate() - 7);
    startDate.setHours(0, 0, 0, 0);
  } else if (selectedPeriod.value === "month") {
    startDate.setMonth(now.getMonth() - 1);
    startDate.setHours(0, 0, 0, 0);
  } else if (selectedPeriod.value === "thisMonth") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    startDate.setHours(0, 0, 0, 0);
  } else if (selectedPeriod.value === "year") {
    startDate.setFullYear(now.getFullYear() - 1);
    startDate.setHours(0, 0, 0, 0);
  }

  return { startDate, endDate };
};

// جلب المبيعات
const loadSales = async () => {
  const { startDate, endDate } = getDateRange();

  let query = supabase
    .from("orders")
    .select("*")
    .gte("order_date", startDate.toISOString())
    .lte("order_date", endDate.toISOString())
    .order("order_date", { ascending: false });

  if (filterPayment.value !== "all") {
    query = query.eq("payment_method", filterPayment.value);
  }

  const { data } = await query;
  let filteredData = data || [];

  // فلتر حسب نوع المبيعات (كشوفات عرائس / عادي)
  if (filterSaleType.value === "bride_checklist") {
    filteredData = filteredData.filter(
      (order) => order.notes && order.notes.includes("كشف عروسة"),
    );
  } else if (filterSaleType.value === "normal") {
    filteredData = filteredData.filter(
      (order) => !order.notes || !order.notes.includes("كشف عروسة"),
    );
  }

  orders.value = filteredData;

  // حساب إحصائيات كشوفات العرائس
  const brideOrders = filteredData.filter(
    (order) => order.notes && order.notes.includes("كشف عروسة"),
  );
  brideChecklistSales.value = {
    total: brideOrders.reduce((sum, o) => sum + (o.total_price || 0), 0),
    count: brideOrders.length,
  };

  // حساب الإحصائيات العامة
  const totalSales = orders.value.reduce(
    (sum, o) => sum + (o.total_price || 0),
    0,
  );
  const cashSales = orders.value
    .filter((o) => o.payment_method === "cash")
    .reduce((sum, o) => sum + (o.total_price || 0), 0);
  const maxOrderValue = Math.max(
    ...orders.value.map((o) => o.total_price || 0),
    0,
  );
  const averageOrderValue =
    orders.value.length > 0 ? totalSales / orders.value.length : 0;

  stats.value = {
    totalSales,
    ordersCount: orders.value.length,
    averageOrderValue,
    maxOrderValue,
    cashSales,
  };

  // حساب المبيعات حسب الفئة
  const categoryMap = new Map();
  orders.value.forEach((order) => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach((item) => {
        let category = "أخرى";
        if (
          item.name.includes("ثلاجة") ||
          item.name.includes("غسالة") ||
          item.name.includes("تكييف")
        ) {
          category = "أجهزة كهربائية";
        } else if (item.name.includes("طقم") || item.name.includes("أواني")) {
          category = "أدوات منزلية";
        } else if (item.name.includes("علب") || item.name.includes("بلاستيك")) {
          category = "بلاستيك";
        }

        const revenue = (item.price || 0) * (item.quantity || 1);
        categoryMap.set(category, (categoryMap.get(category) || 0) + revenue);
      });
    }
  });

  const categoryArray = Array.from(categoryMap.entries()).map(
    ([name, total]) => ({ name, total }),
  );
  const maxCategory = Math.max(...categoryArray.map((c) => c.total), 1);
  categorySales.value = categoryArray.map((cat) => ({
    ...cat,
    percentage: (cat.total / maxCategory) * 100,
  }));

  await nextTick();
  drawCharts();
};

// تاريخ مخصص
const loadSalesWithCustomDate = () => {
  if (customStartDate.value && customEndDate.value) {
    selectedPeriod.value = "custom";
    loadSales();
  } else {
    alert("الرجاء اختيار تاريخ البداية والنهاية");
  }
};

// رسم الرسوم البيانية
let salesChart = null;
let paymentChart = null;

const drawCharts = () => {
  const dailyMap = new Map();
  orders.value.forEach((order) => {
    const date = new Date(order.order_date).toLocaleDateString("ar-EG");
    dailyMap.set(date, (dailyMap.get(date) || 0) + (order.total_price || 0));
  });

  const sortedDates = Array.from(dailyMap.keys()).sort();
  const dailyTotals = sortedDates.map((d) => dailyMap.get(d));

  const ctx1 = document.getElementById("salesChart")?.getContext("2d");
  if (ctx1) {
    if (salesChart) salesChart.destroy();
    salesChart = new Chart(ctx1, {
      type: "line",
      data: {
        labels: sortedDates,
        datasets: [
          {
            label: "المبيعات (ج)",
            data: dailyTotals,
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            labels: { font: { size: window.innerWidth < 640 ? 10 : 12 } },
          },
        },
      },
    });
  }

  const paymentMethods = { cash: 0, card: 0, installments: 0 };
  orders.value.forEach((order) => {
    if (order.payment_method === "cash")
      paymentMethods.cash += order.total_price;
    else if (order.payment_method === "card")
      paymentMethods.card += order.total_price;
    else if (order.payment_method === "installments")
      paymentMethods.installments += order.total_price;
  });

  const ctx2 = document.getElementById("paymentChart")?.getContext("2d");
  if (ctx2) {
    if (paymentChart) paymentChart.destroy();
    paymentChart = new Chart(ctx2, {
      type: "doughnut",
      data: {
        labels: ["كاش", "بطاقة", "تقسيط"],
        datasets: [
          {
            data: [
              paymentMethods.cash,
              paymentMethods.card,
              paymentMethods.installments,
            ],
            backgroundColor: ["#22c55e", "#3b82f6", "#a855f7"],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { font: { size: window.innerWidth < 640 ? 10 : 12 } },
          },
        },
      },
    });
  }
};

// تحميل PDF - نسخة مطورة
const downloadInvoicePDF = async () => {
  if (!currentInvoice.value) return;

  // التحقق من تحميل المكتبة
  if (!html2pdfLib.value) {
    showToast("⏳ جاري تجهيز المكتبة...", "⏳");
    try {
      const module = await import("html2pdf.js");
      html2pdfLib.value = module.default;
    } catch (error) {
      console.error("Error loading html2pdf:", error);
      showToast("❌ حدث خطأ في تحميل المكتبة", "❌");
      return;
    }
  }

  const currentOrder = currentInvoice.value;
  const isInstallment = currentOrder?.payment_method === "installments";
  const totalAmount = currentOrder?.total_price || 0;
  const items = currentOrder?.items || [];

  // إنشاء عنصر مؤقت للـ PDF
  const element = document.createElement("div");
  element.innerHTML = `
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <title>فاتورة بيع - جولدن</title>
      <meta charset="UTF-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Tajawal', 'Arial', sans-serif;
          background: white;
          padding: 20px;
        }
        
        .invoice-card {
          max-width: 800px;
          width: 100%;
          margin: 0 auto;
          background: white;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0,0,0,0.05);
          page-break-inside: avoid;
          break-inside: avoid;
        }
        
        /* الهيدر */
        .invoice-header {
          background: linear-gradient(135deg, #1e293b, #0f172a);
          padding: 25px;
          text-align: center;
        }
        
        .logo-wrapper {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-bottom: 15px;
        }
        
        .logo-circle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        
        .logo-blue { background: linear-gradient(135deg, #3b82f6, #2563eb); }
        .logo-purple { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
        
        .invoice-header h1 {
          font-size: 26px;
          font-weight: 800;
          color: white;
          margin-bottom: 5px;
        }
        
        .invoice-header p {
          color: #94a3b8;
          font-size: 13px;
          margin-bottom: 12px;
        }
        
        .store-details {
          display: flex;
          justify-content: center;
          gap: 20px;
          flex-wrap: wrap;
        }
        
        .store-details span {
          font-size: 11px;
          color: #64748b;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }
        
        /* المحتوى */
        .invoice-body {
          padding: 25px;
        }
        
        /* معلومات العميل */
          .customer-simple {
          background: #f8fafc;
          border-radius: 16px;
          padding: 15px 20px;
          margin-bottom: 25px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
        }
        
        .customer-info {
          display: flex;
          gap: 30px;
          flex-wrap: wrap;
        }
        
        .customer-item {
          display: flex;
          flex-direction: column;
        }
        
        .customer-label {
          font-size: 10px;
          color: #94a3b8;
        }
        
        .customer-value {
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
        }
        
        /* الجدول */
        .products-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        
        .products-table th {
          background: #f1f5f9;
          padding: 12px 10px;
          text-align: center;
          font-size: 12px;
          font-weight: 700;
          color: #475569;
        }
        
        .products-table td {
          padding: 10px;
          text-align: center;
          border-bottom: 1px solid #e2e8f0;
          font-size: 13px;
          color: #334155;
        }
        
        .product-name {
          font-weight: 600;
          color: #0f172a;
          text-align: right;
        }
        
        /* الإجمالي */
        .total-card {
          background: linear-gradient(135deg, #f0fdf4, #dcfce7);
          border-radius: 16px;
          padding: 15px 20px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .total-label {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .total-label span:first-child { font-size: 20px; }
        .total-label span:last-child { font-size: 16px; font-weight: 700; color: #166534; }
        .total-amount { font-size: 24px; font-weight: 800; color: #16a34a; }
        
        /* طريقة الدفع والتاريخ */
        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f8fafc;
          border-radius: 16px;
          padding: 12px 20px;
          margin-bottom: 20px;
        }
        
        .info-row-item {
          text-align: center;
          flex: 1;
        }
        
        .info-row-label {
          font-size: 10px;
          color: #94a3b8;
        }
        
        .info-row-value {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
        }
        
        /* الأقساط */
        .installments-section {
          background: #fff7ed;
          border-radius: 16px;
          padding: 15px;
          margin-bottom: 20px;
        }
        
        .installments-title {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }
        
        .installments-icon {
          width: 35px;
          height: 35px;
          background: #f97316;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 16px;
        }
        
        .installments-title h3 {
          font-size: 14px;
          font-weight: 700;
          color: #9a3412;
        }
        
        .installments-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }
        
        .installment-card {
          background: white;
          border-radius: 10px;
          padding: 10px;
          text-align: center;
        }
        
        .installment-emoji {
          font-size: 20px;
        }
        
        .installment-number {
          font-size: 10px;
          color: #9ca3af;
        }
        
        .installment-amount {
          font-size: 13px;
          font-weight: bold;
          color: #ea580c;
        }
        
        .installment-date {
          font-size: 9px;
          color: #9ca3af;
        }
        
        /* التوقيعات */
        .signatures {
          display: flex;
          justify-content: space-between;
          gap: 30px;
          margin: 20px 0;
          padding-top: 15px;
        }
        
        .signature-item {
          flex: 1;
          text-align: center;
        }
        
        .signature-label {
          font-size: 10px;
          color: #64748b;
          margin-bottom: 8px;
        }
        
        .signature-line {
          border-bottom: 1px dashed #cbd5e1;
          padding-bottom: 5px;
          color: #94a3b8;
          font-size: 11px;
        }
        
        /* الفوتر */
        .invoice-footer {
          background: #f8fafc;
          padding: 20px 25px;
          text-align: center;
        }
        
        .footer-icons {
          display: flex;
          justify-content: center;
          gap: 30px;
          margin-bottom: 15px;
          flex-wrap: wrap;
        }
        
        .footer-icon {
          text-align: center;
        }
        
        .footer-icon .icon-circle {
          width: 40px;
          height: 40px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 5px;
          font-size: 20px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
        
        .footer-icon span {
          font-size: 10px;
          color: #64748b;
        }
        
        .footer-thanks {
          font-size: 13px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 4px;
        }
        
        .footer-wish {
          font-size: 11px;
          color: #94a3b8;
        }
        
        .dir-ltr { direction: ltr; }
      </style>
    </head>
    <body>
      <div class="invoice-card">
        <!-- الهيدر -->
        <div class="invoice-header">
          <div class="logo-wrapper">
            <div class="logo-circle logo-blue">⭐</div>
            <div class="logo-circle logo-purple">🛒</div>
          </div>
          <h1>جولدن</h1>
          <p>الأجهزة الكهربائية · الأدوات المنزلية · البلاستيك والتخزين</p>
          <div class="store-details">
            <span>📍 طنطا - سبرباي - أمام المدينة الجامعية</span>
            <span>📞 01034003002</span>
          </div>
        </div>
        
        <div class="invoice-body">
          <!-- معلومات العميل -->
          <div class="customer-simple">
            <div class="customer-info">
              <div class="customer-item">
                <div class="customer-label">اسم العميل</div>
                <div class="customer-value">${currentOrder?.customer_name || "زائر"}</div>
              </div>
              <div class="customer-item">
                <div class="customer-label">رقم الهاتف</div>
                <div class="customer-value dir-ltr">${currentOrder?.customer_phone || "-"}</div>
              </div>
            </div>
          </div>
          
          <!-- المنتجات -->
          <table class="products-table">
            <thead>
              <tr>
                <th>#</th>
                <th>المنتج</th>
                <th>الكمية</th>
                <th>سعر الوحدة</th>
                <th>الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              ${items
                .map(
                  (item, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td class="product-name">${item.name.replace(/</g, "&lt;").replace(/>/g, "&gt;")}<\/td>
                  <td>${item.quantity}<\/td>
                  <td>${formatNumber(item.price)} ج<\/td>
                  <td><strong style="color:#16a34a;">${formatNumber(item.price * item.quantity)} ج<\/strong><\/td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
          
          <!-- الإجمالي -->
          <div class="total-card">
            <div class="total-label">
              <span>💰</span>
              <span>إجمالي الفاتورة</span>
            </div>
            <div class="total-amount">${formatNumber(totalAmount)} ج.م</div>
          </div>
          
          <!-- طريقة الدفع والتاريخ -->
          <div class="info-row">
            <div class="info-row-item">
              <div class="info-row-label">💳 طريقة الدفع</div>
              <div class="info-row-value">${getPaymentMethodName(currentOrder?.payment_method)}</div>
            </div>
            <div class="info-row-item">
              <div class="info-row-label">📅 تاريخ الفاتورة</div>
              <div class="info-row-value">${formatDateTime(currentOrder?.order_date)}</div>
            </div>
          </div>
          
          ${
            isInstallment
              ? `
          <div class="installments-section">
            <div class="installments-title">
              <div class="installments-icon">📅</div>
              <h3>جدول الأقساط</h3>
            </div>
            <div class="installments-grid">
              ${installmentPayments.value
                .map(
                  (payment, i) => `
                <div class="installment-card">
                  <div class="installment-emoji">${getInstallmentIcon(i + 1)}</div>
                  <div class="installment-number">القسط ${i + 1}</div>
                  <div class="installment-amount">${formatNumber(payment.amount)} ج</div>
                  <div class="installment-date">${formatDate(payment.due_date)}</div>
                </div>
              `,
                )
                .join("")}
            </div>
          </div>
          `
              : ""
          }
          
          <!-- التوقيعات -->
          <div class="signatures">
            <div class="signature-item">
              <div class="signature-label">توقيع المستلم</div>
              <div class="signature-line">_________________</div>
            </div>
            <div class="signature-item">
              <div class="signature-label">توقيع البائع</div>
              <div class="signature-line">_________________</div>
            </div>
          </div>
        </div>
        
        <!-- الفوتر -->
        <div class="invoice-footer">
          <div class="footer-icons">
            <div class="footer-icon"><div class="icon-circle">🛡️</div><span>ضمان سنة كاملة</span></div>
            <div class="footer-icon"><div class="icon-circle">🚚</div><span>توصيل سريع</span></div>
            <div class="footer-icon"><div class="icon-circle">💳</div><span>دفع آمن</span></div>
          </div>
          <div class="footer-thanks">شكراً لتسوقكم مع جولدن</div>
          <div class="footer-wish">نتمنى لكم تجربة تسوق سعيدة</div>
        </div>
      </div>
    </body>
    </html>
  `;

  // إعدادات الـ PDF
  const opt = {
    margin: [0.5, 0.5, 0.5, 0.5],
    filename: `فاتورة_${currentOrder.customer_name || "عميل"}_${new Date().toISOString().split("T")[0]}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
    jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
  };

  // استخدام المكتبة لإنشاء PDF
  html2pdfLib.value().set(opt).from(element).save();
  showToast("📄 جاري تحميل PDF...", "📄");
};
// طباعة الفاتورة - صفحة واحدة حتى مع التقسيط
const printCurrentInvoice = () => {
  const currentOrder = currentInvoice.value
  const isInstallment = currentOrder?.payment_method === 'installments'
  
  const totalAmount = currentOrder?.total_price || 0
  const items = currentOrder?.items || []
  
  // حساب عدد الأقساط لتحديد المسافات
  const installmentsCount = installmentPayments.value?.length || 0
  
  const printContent = `
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <title>فاتورة بيع - جولدن</title>
      <meta charset="UTF-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Tajawal', 'Arial', sans-serif;
          background: white;
          padding: 15px;
        }
        
        /* منع تكسر الصفحات */
        .invoice-card {
          max-width: 800px;
          width: 100%;
          margin: 0 auto;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          page-break-inside: avoid;
          break-inside: avoid;
          box-shadow: none;
        }
        
        /* منع تكسر العناصر الداخلية */
        .invoice-header, 
        .customer-simple, 
        .products-table,
        .total-card,
        .info-row,
        .installments-section,
        .signatures,
        .invoice-footer {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        
        /* الهيدر - مسافات أقل */
        .invoice-header {
          background: linear-gradient(135deg, #1e293b, #0f172a);
          padding: 18px;
          text-align: center;
        }
        
        .logo-wrapper {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-bottom: 10px;
        }
        
        .logo-circle {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }
        
        .logo-blue { background: linear-gradient(135deg, #3b82f6, #2563eb); }
        .logo-purple { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
        
        .invoice-header h1 {
          font-size: 22px;
          font-weight: 800;
          color: white;
          margin-bottom: 3px;
        }
        
        .invoice-header p {
          color: #94a3b8;
          font-size: 11px;
          margin-bottom: 8px;
        }
        
        .store-details {
          display: flex;
          justify-content: center;
          gap: 15px;
          flex-wrap: wrap;
        }
        
        .store-details span {
          font-size: 10px;
          color: #64748b;
        }
        
        /* المحتوى - مسافات أقل */
        .invoice-body {
          padding: 18px;
        }
        
        /* معلومات العميل - مسافات أقل */
        .customer-simple {
          background: #f8fafc;
          border-radius: 12px;
          padding: 10px 15px;
          margin-bottom: 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }
        
        .customer-info {
          display: flex;
          gap: 25px;
          flex-wrap: wrap;
        }
        
        .customer-item {
          display: flex;
          flex-direction: column;
        }
        
        .customer-label {
          font-size: 9px;
          color: #94a3b8;
        }
        
        .customer-value {
          font-size: 13px;
          font-weight: 700;
          color: #0f172a;
        }
        
        /* الجدول - مسافات أقل */
        .products-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 12px;
          font-size: 12px;
        }
        
        .products-table th {
          background: #f1f5f9;
          padding: 8px 6px;
          text-align: center;
          font-size: 11px;
          font-weight: 700;
          color: #475569;
        }
        
        .products-table td {
          padding: 6px;
          text-align: center;
          border-bottom: 1px solid #e2e8f0;
          font-size: 12px;
          color: #334155;
        }
        
        .product-name {
          font-weight: 600;
          color: #0f172a;
          text-align: right;
        }
        
        /* الإجمالي - مسافات أقل */
        .total-card {
          background: linear-gradient(135deg, #f0fdf4, #dcfce7);
          border-radius: 12px;
          padding: 10px 15px;
          margin-bottom: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .total-label {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .total-label span:first-child { font-size: 18px; }
        .total-label span:last-child { font-size: 14px; font-weight: 700; color: #166534; }
        .total-amount { font-size: 20px; font-weight: 800; color: #16a34a; }
        
        /* طريقة الدفع والتاريخ - مسافات أقل */
        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f8fafc;
          border-radius: 12px;
          padding: 8px 15px;
          margin-bottom: 12px;
        }
        
        .info-row-item {
          text-align: center;
          flex: 1;
        }
        
        .info-row-label {
          font-size: 9px;
          color: #94a3b8;
        }
        
        .info-row-value {
          font-size: 12px;
          font-weight: 700;
          color: #0f172a;
        }
        
        /* الأقساط - تصميم مضغوط لصفحة واحدة */
        .installments-section {
          background: #fff7ed;
          border-radius: 12px;
          padding: 10px;
          margin-bottom: 12px;
        }
        
        .installments-title {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 8px;
        }
        
        .installments-icon {
          width: 28px;
          height: 28px;
          background: #f97316;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
        }
        
        .installments-title h3 {
          font-size: 12px;
          font-weight: 700;
          color: #9a3412;
        }
        
        .installments-grid {
          display: grid;
          grid-template-columns: repeat(${Math.min(installmentsCount, 4)}, 1fr);
          gap: 6px;
        }
        
        .installment-card {
          background: white;
          border-radius: 8px;
          padding: 6px;
          text-align: center;
        }
        
        .installment-emoji {
          font-size: 16px;
        }
        
        .installment-number {
          font-size: 9px;
          color: #9ca3af;
        }
        
        .installment-amount {
          font-size: 11px;
          font-weight: bold;
          color: #ea580c;
        }
        
        .installment-date {
          font-size: 8px;
          color: #9ca3af;
        }
        
        /* التوقيعات - مسافات أقل */
        .signatures {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          margin: 12px 0;
          padding-top: 10px;
        }
        
        .signature-item {
          flex: 1;
          text-align: center;
        }
        
        .signature-label {
          font-size: 9px;
          color: #64748b;
          margin-bottom: 5px;
        }
        
        .signature-line {
          border-bottom: 1px dashed #cbd5e1;
          padding-bottom: 3px;
          color: #94a3b8;
          font-size: 10px;
        }
        
        /* الفوتر - مسافات أقل */
        .invoice-footer {
          background: #f8fafc;
          padding: 12px 20px;
          text-align: center;
        }
        
        .footer-icons {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-bottom: 8px;
          flex-wrap: wrap;
        }
        
        .footer-icon {
          text-align: center;
        }
        
        .footer-icon .icon-circle {
          width: 32px;
          height: 32px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 3px;
          font-size: 16px;
        }
        
        .footer-icon span {
          font-size: 9px;
          color: #64748b;
        }
        
        .footer-thanks {
          font-size: 11px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 2px;
        }
        
        .footer-wish {
          font-size: 10px;
          color: #94a3b8;
        }
        
        /* منع تكسر الصفحات أثناء الطباعة */
        @media print {
          body {
            padding: 0;
            margin: 0;
          }
          .invoice-card {
            box-shadow: none;
            border-radius: 0;
            max-width: 100%;
          }
          .products-table tr {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
        
        .dir-ltr { direction: ltr; }
      </style>
    </head>
    <body>
      <div class="invoice-card">
        <!-- الهيدر -->
        <div class="invoice-header">
          <div class="logo-wrapper">
            <div class="logo-circle logo-blue">⭐</div>
            <div class="logo-circle logo-purple">🛒</div>
          </div>
          <h1>جولدن</h1>
          <p>الأجهزة الكهربائية · الأدوات المنزلية · البلاستيك والتخزين</p>
          <div class="store-details">
            <span>📍 طنطا - سبرباي - أمام المدينة الجامعية</span>
            <span>📞 01034003002</span>
          </div>
        </div>
        
        <div class="invoice-body">
          <!-- معلومات العميل -->
          <div class="customer-simple">
            <div class="customer-info">
              <div class="customer-item">
                <div class="customer-label">اسم العميل</div>
                <div class="customer-value">${currentOrder?.customer_name || 'زائر'}</div>
              </div>
              <div class="customer-item">
                <div class="customer-label">رقم الهاتف</div>
                <div class="customer-value dir-ltr">${currentOrder?.customer_phone || '-'}</div>
              </div>
            </div>
          </div>
          
          <!-- المنتجات -->
          <table class="products-table">
            <thead>
              <tr>
                <th>#</th>
                <th>المنتج</th>
                <th>الكمية</th>
                <th>سعر الوحدة</th>
                <th>الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((item, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td class="product-name">${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>${formatNumber(item.price)} ج</td>
                  <td><strong style="color:#16a34a;">${formatNumber(item.price * item.quantity)} ج</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <!-- الإجمالي -->
          <div class="total-card">
            <div class="total-label">
              <span>💰</span>
              <span>إجمالي الفاتورة</span>
            </div>
            <div class="total-amount">${formatNumber(totalAmount)} ج.م</div>
          </div>
          
          <!-- طريقة الدفع والتاريخ -->
          <div class="info-row">
            <div class="info-row-item">
              <div class="info-row-label">💳 طريقة الدفع</div>
              <div class="info-row-value">${getPaymentMethodName(currentOrder?.payment_method)}</div>
            </div>
            <div class="info-row-item">
              <div class="info-row-label">📅 تاريخ الفاتورة</div>
              <div class="info-row-value">${formatDateTime(currentOrder?.order_date)}</div>
            </div>
          </div>
          
          ${isInstallment && installmentPayments.value.length > 0 ? `
          <div class="installments-section">
            <div class="installments-title">
              <div class="installments-icon">📅</div>
              <h3>جدول سداد الأقساط</h3>
            </div>
            <div class="installments-grid">
              ${installmentPayments.value.map((payment, i) => `
                <div class="installment-card">
                  <div class="installment-emoji">${getInstallmentIcon(i+1)}</div>
                  <div class="installment-number">القسط ${i+1}</div>
                  <div class="installment-amount">${formatNumber(payment.amount)} ج</div>
                  <div class="installment-date">${formatDate(payment.due_date)}</div>
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}
          
          <!-- التوقيعات -->
          <div class="signatures">
            <div class="signature-item">
              <div class="signature-label">توقيع المستلم</div>
              <div class="signature-line">_________________</div>
            </div>
            <div class="signature-item">
              <div class="signature-label">توقيع البائع</div>
              <div class="signature-line">_________________</div>
            </div>
          </div>
        </div>
        
        <!-- الفوتر -->
        <div class="invoice-footer">
          <div class="footer-icons">
            <div class="footer-icon"><div class="icon-circle">🛡️</div><span>ضمان سنة كاملة</span></div>
            <div class="footer-icon"><div class="icon-circle">🚚</div><span>توصيل سريع</span></div>
            <div class="footer-icon"><div class="icon-circle">💳</div><span>دفع آمن</span></div>
          </div>
          <div class="footer-thanks">شكراً لتسوقكم مع جولدن</div>
          <div class="footer-wish">نتمنى لكم تجربة تسوق سعيدة</div>
        </div>
      </div>
    </body>
    </html>
  `
  
  const iframe = document.getElementById('printFrame')
  if (iframe) {
    iframe.srcdoc = printContent
    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow.print()
      }, 500)
    }
  }
}

// تصدير Excel
const exportSales = () => {
  const headers = [
    "العميل",
    "الهاتف",
    "المنتجات",
    "الإجمالي",
    "طريقة الدفع",
    "الحالة",
    "التاريخ",
    "المصدر",
  ];
  const rows = orders.value.map((order) => [
    order.customer_name || "زائر",
    order.customer_phone || "-",
    order.items?.map((i) => `${i.name} (x${i.quantity})`).join(", ") || "-",
    order.total_price,
    getPaymentMethodName(order.payment_method),
    getStatusName(order.status),
    formatDateTime(order.order_date),
    order.notes && order.notes.includes("كشف عروسة")
      ? "كشف عروسة"
      : "بيع مباشر",
  ]);

  let csv = headers.join(",") + "n";
  rows.forEach((row) => {
    csv += row.map((cell) => `"${cell}"`).join(",") + "n";
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.setAttribute(
    "download",
    `sales_${new Date().toISOString().split("T")[0]}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// تحميل Chart.js
onMounted(() => {
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/chart.js";
  script.onload = () => {
    loadSales();
  };
  document.head.appendChild(script);

  // Handle window resize
  window.addEventListener("resize", () => {
    if (salesChart) {
      salesChart.options.plugins.legend.labels.font.size =
        window.innerWidth < 640 ? 10 : 12;
      salesChart.update();
    }
    if (paymentChart) {
      paymentChart.options.plugins.legend.labels.font.size =
        window.innerWidth < 640 ? 10 : 12;
      paymentChart.update();
    }
  });
});
onMounted(async () => {
  await loadSales();

  // تحميل مكتبة html2pdf على client side فقط
  if (process.client) {
    try {
      const module = await import("html2pdf.js");
      html2pdfLib.value = module.default;
    } catch (error) {
      console.error("Error loading html2pdf:", error);
    }
  }

  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/chart.js";
  script.onload = () => {
    drawCharts();
  };
  document.head.appendChild(script);

  // Handle window resize for chart
  window.addEventListener("resize", () => {
    if (salesChart) {
      salesChart.options.plugins.legend.labels.font.size =
        window.innerWidth < 640 ? 10 : 12;
      salesChart.update();
    }
    if (paymentChart) {
      paymentChart.options.plugins.legend.labels.font.size =
        window.innerWidth < 640 ? 10 : 12;
      paymentChart.update();
    }
  });
});
</script>

<style scoped>
.dir-ltr {
  direction: ltr;
  display: inline-block;
}
</style>
