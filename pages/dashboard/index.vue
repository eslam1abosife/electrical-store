<template>
  <div class="p-4 sm:p-6 bg-gray-50 min-h-screen" dir="rtl">
    <!-- Header -->
    <div class="mb-6">
      <div
        class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
            🏠 لوحة التحكم الرئيسية
          </h1>
          <p class="text-sm sm:text-base text-gray-500">
            مرحباً بك في نظام إدارة معرض الأجهزة الكهربائية
          </p>
        </div>
        <div class="flex gap-2">
          <div class="bg-pink-100 rounded-xl px-3 py-2 text-center">
            <p class="text-xs text-pink-600">مبيعات كشوفات</p>
            <p class="text-lg font-bold text-pink-600">
              {{ formatNumber(brideChecklistSales.total) }} ج
            </p>
          </div>
          <div class="bg-purple-100 rounded-xl px-3 py-2 text-center">
            <p class="text-xs text-purple-600">عدد الكشوفات</p>
            <p class="text-lg font-bold text-purple-600">
              {{ brideChecklistSales.count }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- أزرار الفترات -->
    <div class="bg-white rounded-2xl shadow p-4 mb-6">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="range in dateRanges"
          :key="range.value"
          @click="
            selectedDateRange = range.value;
            loadPeriodDetails();
          "
          class="px-4 py-2 rounded-xl text-sm font-medium transition-all"
          :class="
            selectedDateRange === range.value
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          "
        >
          {{ range.name }}
        </button>
      </div>
      <p class="text-xs text-gray-400 mt-3 text-center">
        📅 الفترة المحددة:
        <span class="font-bold text-blue-600">{{ getDateRangeText() }}</span>
      </p>
    </div>

    <!-- بطاقات الملخص الرئيسي -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div
        class="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow p-5 text-white"
      >
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm opacity-90">💰 إجمالي المبيعات</p>
            <p class="text-2xl font-bold mt-1 break-words">
              {{ formatNumber(periodStats.totalSales) }} ج
            </p>
            <p class="text-xs opacity-80 mt-1">
              {{ periodStats.ordersCount }} طلب
            </p>
          </div>
          <div
            class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl"
          >
            💰
          </div>
        </div>
      </div>

      <div
        class="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow p-5 text-white"
      >
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm opacity-90">📦 إجمالي المشتريات</p>
            <p class="text-2xl font-bold mt-1 break-words">
              {{ formatNumber(periodStats.totalPurchases) }} ج
            </p>
            <p class="text-xs opacity-80 mt-1">
              {{ periodStats.purchasesCount }} فاتورة
            </p>
          </div>
          <div
            class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl"
          >
            📦
          </div>
        </div>
      </div>

      <div
        class="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl shadow p-5 text-white"
      >
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm opacity-90">📈 صافي الربح</p>
            <p class="text-2xl font-bold mt-1 break-words">
              {{ formatNumber(periodStats.profit) }} ج
            </p>
            <p class="text-xs opacity-80 mt-1">
              هامش الربح: {{ periodStats.profitMargin }}%
            </p>
          </div>
          <div
            class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl"
          >
            📈
          </div>
        </div>
      </div>

      <div
        class="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl shadow p-5 text-white"
      >
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm opacity-90">📋 إجمالي المصروفات</p>
            <p class="text-2xl font-bold mt-1 break-words">
              {{ formatNumber(periodStats.totalExpenses) }} ج
            </p>
            <p class="text-xs opacity-80 mt-1">
              {{ periodStats.expensesCount }} عملية صرف
            </p>
          </div>
          <div
            class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl"
          >
            📋
          </div>
        </div>
      </div>
    </div>

    <!-- تفاصيل المبيعات حسب النوع -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div class="bg-white rounded-2xl shadow p-4">
        <div class="flex items-center gap-3 mb-2">
          <span class="text-2xl">🖥️</span>
          <h3 class="font-bold text-gray-700">مبيعات الموقع</h3>
        </div>
        <p class="text-2xl font-bold text-blue-600">
          {{ formatNumber(periodStats.onlineSales) }} ج
        </p>
        <p class="text-xs text-gray-500">{{ periodStats.onlineCount }} طلب</p>
        <div class="mt-2 pt-2 border-t">
          <p class="text-xs text-gray-400">
            متوسط الطلب: {{ formatNumber(periodStats.avgOnlineOrder) }} ج
          </p>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow p-4">
        <div class="flex items-center gap-3 mb-2">
          <span class="text-2xl">🏪</span>
          <h3 class="font-bold text-gray-700">مبيعات المعرض</h3>
        </div>
        <p class="text-2xl font-bold text-purple-600">
          {{ formatNumber(periodStats.offlineSales) }} ج
        </p>
        <p class="text-xs text-gray-500">{{ periodStats.offlineCount }} طلب</p>
        <div class="mt-2 pt-2 border-t">
          <p class="text-xs text-gray-400">
            متوسط الطلب: {{ formatNumber(periodStats.avgOfflineOrder) }} ج
          </p>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow p-4">
        <div class="flex items-center gap-3 mb-2">
          <span class="text-2xl">👰</span>
          <h3 class="font-bold text-gray-700">مبيعات كشوفات العرائس</h3>
        </div>
        <p class="text-2xl font-bold text-pink-600">
          {{ formatNumber(periodStats.brideSales) }} ج
        </p>
        <p class="text-xs text-gray-500">{{ periodStats.brideCount }} كشف</p>
        <div class="mt-2 pt-2 border-t">
          <p class="text-xs text-gray-400">
            متوسط الكشف: {{ formatNumber(periodStats.avgBrideValue) }} ج
          </p>
        </div>
      </div>
    </div>

    <!-- تفاصيل إضافية -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div
        class="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl shadow p-4 text-white"
      >
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm opacity-90">👥 عدد العملاء</p>
            <p class="text-3xl font-bold mt-1">
              {{ periodStats.customersCount }}
            </p>
            <p class="text-xs opacity-80 mt-1">عميل فريد</p>
          </div>
          <div
            class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl"
          >
            👥
          </div>
        </div>
      </div>

      <div
        class="bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl shadow p-4 text-white"
      >
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm opacity-90">📦 إجمالي القطع المباعة</p>
            <p class="text-3xl font-bold mt-1">
              {{ periodStats.totalItemsSold }}
            </p>
            <p class="text-xs opacity-80 mt-1">قطعة منتج</p>
          </div>
          <div
            class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl"
          >
            📦
          </div>
        </div>
      </div>

      <div
        class="bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl shadow p-4 text-white"
      >
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm opacity-90">💰 متوسط قيمة الطلب</p>
            <p class="text-3xl font-bold mt-1">
              {{ formatNumber(periodStats.averageOrderValue) }} ج
            </p>
            <p class="text-xs opacity-80 mt-1">لكل طلب</p>
          </div>
          <div
            class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl"
          >
            📊
          </div>
        </div>
      </div>

      <div
        class="bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl shadow p-4 text-white"
      >
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm opacity-90">💸 الديون المستحقة</p>
            <p class="text-3xl font-bold mt-1">
              {{ formatNumber(periodStats.debtsDue) }} ج
            </p>
            <p class="text-xs opacity-80 mt-1">مستحق الدفع</p>
          </div>
          <div
            class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl"
          >
            💸
          </div>
        </div>
      </div>
    </div>

    <!-- رصيد الخزينة والمخزون -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div
        class="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl shadow p-5 text-white"
      >
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm opacity-90">💰 رصيد الخزينة الحالي</p>
            <p class="text-3xl font-bold mt-1 break-words">
              {{ formatNumber(cashBalance) }} ج
            </p>
            <p class="text-xs opacity-80 mt-1">المبلغ الفعلي المتوفر</p>
          </div>
          <div
            class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl"
          >
            💰
          </div>
        </div>
      </div>

      <div
        class="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl shadow p-5 text-white"
      >
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm opacity-90">📦 إجمالي البضاعة (سعر الشراء)</p>
            <p class="text-3xl font-bold mt-1 break-words">
              {{ formatNumber(totalStockPurchaseValue) }} ج
            </p>
            <p class="text-xs opacity-80 mt-1">قيمة المخزون بما دفعته فيه</p>
          </div>
          <div
            class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl"
          >
            📦
          </div>
        </div>
      </div>

      <div
        class="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow p-5 text-white"
      >
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm opacity-90">🏷️ إجمالي البضاعة (سعر البيع)</p>
            <p class="text-3xl font-bold mt-1 break-words">
              {{ formatNumber(totalStockSaleValue) }} ج
            </p>
            <p class="text-xs opacity-80 mt-1">القيمة السوقية للمخزون</p>
          </div>
          <div
            class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl"
          >
            🏷️
          </div>
        </div>
      </div>

      <div
        class="bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl shadow p-5 text-white"
      >
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm opacity-90">💸 إجمالي ديون المشروع</p>
            <p class="text-3xl font-bold mt-1 break-words">
              {{ formatNumber(projectDebts.total) }} ج
            </p>
            <p class="text-xs opacity-80 mt-1">{{ projectDebts.count }} دين</p>
          </div>
          <div
            class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl"
          >
            💸
          </div>
        </div>
      </div>
    </div>

    <!-- جدول المصروفات اليومية -->
    <div class="bg-white rounded-2xl shadow mb-8 overflow-hidden">
      <div
        class="bg-gray-50 p-4 border-b flex justify-between items-center flex-wrap gap-3"
      >
        <h2
          class="text-lg sm:text-xl font-bold text-gray-700 flex items-center gap-2"
        >
          <span>📝</span> المصروفات اليومية
        </h2>
        <button
          v-if="userStore?.canEdit"
          @click="openExpenseModal"
          class="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-blue-700 transition"
        >
          ➕ إضافة مصروف
        </button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[600px]">
          <thead class="bg-gray-50">
            <tr>
              <th class="p-3 text-right text-sm">التاريخ</th>
              <th class="p-3 text-right text-sm">نوع المصروف</th>
              <th class="p-3 text-right text-sm">المبلغ</th>
              <th class="p-3 text-right text-sm">البيان</th>
              <th class="p-3 text-right text-sm">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="expense in expensesList"
              :key="expense.id"
              class="border-t hover:bg-gray-50"
            >
              <td class="p-3 text-sm">
                {{ formatDate(expense.expense_date) }}
              </td>
              <td class="p-3 text-sm">
                <span
                  class="px-2 py-1 rounded-full text-xs"
                  :class="getExpenseTypeClass(expense.expense_type)"
                >
                  {{ getExpenseTypeName(expense.expense_type) }}
                </span>
              </td>
              <td class="p-3 text-sm text-red-600 font-bold">
                {{ formatNumber(expense.amount) }} ج
              </td>
              <td class="p-3 text-sm max-w-[200px] truncate">
                {{ expense.notes || "-" }}
              </td>
              <td class="p-3">
                <button
                  v-if="userStore?.canEdit"
                  @click="confirmDeleteExpense(expense.id)"
                  class="text-red-500 hover:text-red-700"
                >
                  🗑️ حذف
                </button>
              </td>
            </tr>
            <tr v-if="expensesList.length === 0">
              <td colspan="5" class="text-center py-8 text-gray-400">
                لا توجد مصروفات مسجلة
              </td>
            </tr>
          </tbody>
          <tfoot class="bg-gray-50 font-bold">
            <tr class="border-t">
              <td colspan="2" class="p-3 text-right">الإجمالي</td>
              <td class="p-3 text-red-600">
                {{ formatNumber(totalExpenses) }} ج
              </td>
              <td colspan="2"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- أعلى المنتجات مبيعاً والديون -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8">
      <div class="bg-white rounded-2xl shadow overflow-hidden">
        <div class="bg-green-50 p-3 sm:p-4 border-b">
          <h2 class="text-lg sm:text-xl font-bold text-green-700">
            🏆 أعلى المنتجات مبيعاً
          </h2>
        </div>
        <div class="divide-y max-h-80 overflow-y-auto">
          <div
            v-for="(product, index) in topProducts"
            :key="product.product_id"
            class="p-3 sm:p-4 flex items-center gap-3 sm:gap-4"
          >
            <div
              class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-600 text-sm sm:text-base shrink-0"
            >
              {{ index + 1 }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-sm sm:text-base truncate">
                {{ product.product_name }}
              </p>
              <p class="text-xs sm:text-sm text-gray-500">
                تم بيع {{ product.total_quantity }} قطعة
              </p>
            </div>
            <div class="text-right shrink-0">
              <p class="font-bold text-green-600 text-sm sm:text-base">
                {{ formatNumber(product.total_revenue) }} ج
              </p>
            </div>
          </div>
          <div
            v-if="topProducts.length === 0"
            class="p-8 text-center text-gray-400"
          >
            لا توجد مبيعات حتى الآن
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow overflow-hidden">
        <div class="bg-orange-50 p-3 sm:p-4 border-b">
          <h2 class="text-lg sm:text-xl font-bold text-orange-700">
            📅 ديون مستحقة قريباً
          </h2>
        </div>
        <div class="divide-y max-h-80 overflow-y-auto">
          <div v-for="debt in upcomingDebts" :key="debt.id" class="p-3 sm:p-4">
            <div class="flex justify-between items-start gap-2 mb-2">
              <div class="min-w-0 flex-1">
                <p class="font-medium text-sm sm:text-base truncate">
                  {{ debt.creditor_name }}
                </p>
                <p class="text-xs text-gray-500">
                  {{ getDebtTypeName(debt.debt_type) }}
                </p>
              </div>
              <span
                :class="getDueDateClass(debt.due_date)"
                class="text-xs font-bold whitespace-nowrap shrink-0"
              >
                {{ getDueDateText(debt.due_date) }}
              </span>
            </div>
            <div class="flex justify-between items-center gap-3">
              <span class="text-red-600 font-bold text-sm sm:text-base"
                >{{ formatNumber(debt.remaining_amount) }} ج</span
              >
              <button
                v-if="userStore?.canEdit"
                @click="navigateTo('/dashboard/project-debts')"
                class="text-blue-600 text-sm hover:underline whitespace-nowrap shrink-0"
              >
                تسديد
              </button>
            </div>
          </div>
          <div
            v-if="upcomingDebts.length === 0"
            class="p-8 text-center text-gray-400"
          >
            ✅ لا توجد ديون مستحقة قريباً
          </div>
        </div>
      </div>
    </div>

    <!-- جدول آخر الطلبات -->
    <div class="bg-white rounded-2xl shadow mt-4 overflow-hidden">
      <div
        class="bg-gray-50 p-3 sm:p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
      >
        <h2 class="text-lg sm:text-xl font-bold text-gray-700">
          📋 آخر 10 طلبات
        </h2>
        <NuxtLink
          to="/dashboard/orders"
          class="text-blue-600 text-sm hover:underline shrink-0"
          >عرض الكل ←</NuxtLink
        >
      </div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[700px]">
          <thead class="bg-gray-50">
            <tr>
              <th class="p-2 sm:p-3 text-right text-xs sm:text-sm">نوع البيع</th>
              <th class="p-2 sm:p-3 text-right text-xs sm:text-sm">المصدر</th>
              <th class="p-2 sm:p-3 text-right text-xs sm:text-sm">العميل</th>
              <th class="p-2 sm:p-3 text-right text-xs sm:text-sm">المنتجات</th>
              <th class="p-2 sm:p-3 text-right text-xs sm:text-sm">الإجمالي</th>
              <th
                class="p-2 sm:p-3 text-right text-xs sm:text-sm hidden md:table-cell"
              >
                الحالة
              </th>
              <th
                class="p-2 sm:p-3 text-right text-xs sm:text-sm hidden lg:table-cell"
              >
                التاريخ
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="order in recentOrders"
              :key="order.id"
              class="border-t hover:bg-gray-50"
            >
              <td class="p-2 sm:p-3">
                <span
                  :class="
                    order.sale_type === 'online'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-purple-100 text-purple-700'
                  "
                  class="px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                >
                  {{ order.sale_type === "online" ? "🖥️ موقع" : "🏪 معرض" }}
                </span>
              </td>
              <td class="p-2 sm:p-3">
                <span
                  v-if="order.notes && order.notes.includes('كشف عروسة')"
                  class="bg-pink-100 text-pink-700 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                >
                  👰 كشف عروسة
                </span>
                <span v-else class="text-gray-500 text-xs">بيع مباشر</span>
              </td>
              <td
                class="p-2 sm:p-3 font-medium text-sm sm:text-base truncate max-w-[120px] sm:max-w-none"
              >
                {{ order.customer_name || "زائر" }}
              </td>
              <td class="p-2 sm:p-3 text-xs sm:text-sm whitespace-nowrap">
                {{ getOrderItemsCount(order.items) }} منتج
              </td>
              <td
                class="p-2 sm:p-3 font-bold text-green-600 text-sm sm:text-base whitespace-nowrap"
              >
                {{ formatNumber(order.total_price) }} ج
              </td>
              <td class="p-2 sm:p-3 hidden md:table-cell">
                <span
                  class="px-2 py-1 rounded-full text-xs whitespace-nowrap"
                  :class="getStatusClass(order.status)"
                >
                  {{ getStatusName(order.status) }}
                </span>
              </td>
              <td
                class="p-2 sm:p-3 text-xs sm:text-sm hidden lg:table-cell whitespace-nowrap"
              >
                {{ formatDateTime(order.order_date) }}
              </td>
            </tr>
            <tr v-if="recentOrders.length === 0">
              <td colspan="7" class="text-center py-8 text-gray-400">
                لا توجد طلبات
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Toast Notification -->
    <ToastNotification v-model:toast="toast" />

    <!-- مودال إضافة مصروف -->
    <div
      v-if="showExpenseModal"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      @click.self="closeExpenseModal"
    >
      <div class="bg-white rounded-2xl w-full max-w-md">
        <div class="p-4 border-b flex justify-between items-center">
          <h2 class="text-lg font-bold">➕ إضافة مصروف</h2>
          <button
            @click="closeExpenseModal"
            class="text-2xl hover:text-gray-600"
          >
            &times;
          </button>
        </div>
        <form @submit.prevent="addExpense" class="p-4 space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">نوع المصروف *</label>
            <select
              v-model="newExpense.expense_type"
              required
              class="w-full p-2.5 border rounded-xl text-sm"
            >
              <option value="">-- اختر نوع المصروف --</option>
              <option value="rent">🏢 إيجار</option>
              <option value="salary">👥 رواتب</option>
              <option value="electricity">💡 كهرباء</option>
              <option value="water">💧 مياه</option>
              <option value="internet">🌐 إنترنت</option>
              <option value="maintenance">🔧 صيانة</option>
              <option value="marketing">📢 دعاية وإعلان</option>
              <option value="transport">🚚 نقل ومواصلات</option>
              <option value="other">📦 أخرى</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">المبلغ *</label>
            <input
              v-model.number="newExpense.amount"
              type="number"
              required
              min="1"
              placeholder="المبلغ بالجنيه"
              class="w-full p-2.5 border rounded-xl text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">التاريخ</label>
            <input
              v-model="newExpense.expense_date"
              type="date"
              class="w-full p-2.5 border rounded-xl text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1"
              >البيان (اختياري)</label
            >
            <textarea
              v-model="newExpense.notes"
              rows="2"
              placeholder="وصف المصروف..."
              class="w-full p-2.5 border rounded-xl text-sm"
            ></textarea>
          </div>
          <div class="flex gap-3 pt-4">
            <button
              v-if="userStore?.canEdit"
              type="submit"
              :disabled="savingExpense"
              class="flex-1 bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700"
            >
              {{ savingExpense ? "جاري الحفظ..." : "💾 حفظ المصروف" }}
            </button>
            <button
              v-if="userStore?.canEdit"
              type="button"
              @click="closeExpenseModal"
              class="flex-1 bg-gray-200 py-2.5 rounded-xl hover:bg-gray-300"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
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
const selectedPeriod = ref("week");
const selectedDateRange = ref("today");
const filterSaleType = ref("all");
let salesChart = null;

// تفاصيل الفترة
const periodStats = ref({
  totalSales: 0,
  totalPurchases: 0,
  profit: 0,
  profitMargin: 0,
  ordersCount: 0,
  purchasesCount: 0,
  onlineSales: 0,
  onlineCount: 0,
  avgOnlineOrder: 0,
  offlineSales: 0,
  offlineCount: 0,
  avgOfflineOrder: 0,
  brideSales: 0,
  brideCount: 0,
  avgBrideValue: 0,
  totalExpenses: 0,
  expensesCount: 0,
  customersCount: 0,
  totalItemsSold: 0,
  averageOrderValue: 0,
  debtsDue: 0,
});

const dateRanges = [
  { name: "اليوم", value: "today" },
  { name: "أمس", value: "yesterday" },
  { name: "آخر 7 أيام", value: "week" },
  { name: "آخر 30 يوم", value: "month" },
  { name: "هذا الشهر", value: "thisMonth" },
  { name: "هذه السنة", value: "thisYear" },
  { name: "آخر سنة", value: "year" },
  { name: "منذ البداية", value: "sinceBeginning" },
];

// مصروفات
const expensesList = ref([]);
const showExpenseModal = ref(false);
const savingExpense = ref(false);
const newExpense = ref({
  expense_type: "",
  amount: 0,
  expense_date: new Date().toISOString().split("T")[0],
  notes: "",
});

// إجمالي قيمة المخزون
const totalStockPurchaseValue = ref(0);
const totalStockSaleValue = ref(0);

const stats = ref({
  totalSales: 0,
  totalPurchases: 0,
  ordersCount: 0,
  purchasesCount: 0,
  profit: 0,
  profitMargin: 0,
  onlineSales: 0,
  onlineCount: 0,
  offlineSales: 0,
  offlineCount: 0,
});

const projectDebts = ref({ total: 0, late: 0, count: 0 });
const brideChecklistSales = ref({ total: 0, count: 0 });
const dailySales = ref([]);
const topProducts = ref([]);
const recentOrders = ref([]);
const upcomingDebts = ref([]);

// Computed
const cashBalance = computed(
  () =>
    stats.value.totalSales - stats.value.totalPurchases - totalExpenses.value,
);
const totalExpenses = computed(() =>
  expensesList.value.reduce((sum, exp) => sum + (exp.amount || 0), 0),
);

// ✅ دوال المصروفات مع Toast
const openExpenseModal = () => {
  if (!userStore.canEdit) {
    showToast("⚠️ ليس لديك صلاحية لإضافة مصروفات", "warning");
    return;
  }
  showExpenseModal.value = true;
};

const closeExpenseModal = () => {
  showExpenseModal.value = false;
  newExpense.value = {
    expense_type: "",
    amount: 0,
    expense_date: new Date().toISOString().split("T")[0],
    notes: "",
  };
};

const addExpense = async () => {
  if (!userStore.canEdit) {
    showToast("⚠️ ليس لديك صلاحية لإضافة مصروفات", "warning");
    return;
  }

  if (!newExpense.value.expense_type) {
    showToast("⚠️ الرجاء اختيار نوع المصروف", "warning");
    return;
  }
  if (!newExpense.value.amount || newExpense.value.amount <= 0) {
    showToast("⚠️ الرجاء إدخال مبلغ صحيح", "warning");
    return;
  }

  savingExpense.value = true;
  try {
    const { error } = await supabase.from("expenses").insert([
      {
        expense_type: newExpense.value.expense_type,
        amount: newExpense.value.amount,
        expense_date: newExpense.value.expense_date,
        notes: newExpense.value.notes || null,
        created_by: userStore.user?.id,
      },
    ]);
    if (error) throw error;

    showToast("✅ تم إضافة المصروف بنجاح", "success");
    closeExpenseModal();
    await loadExpenses();
    await loadDashboardData();
  } catch (error) {
    console.error("Error adding expense:", error);
    showToast("❌ حدث خطأ أثناء إضافة المصروف", "error");
  } finally {
    savingExpense.value = false;
  }
};

const confirmDeleteExpense = async (id) => {
  if (!userStore.canEdit) {
    showToast("⚠️ ليس لديك صلاحية لحذف المصروفات", "warning");
    return;
  }

  if (confirm("هل أنت متأكد من حذف هذا المصروف؟")) {
    await deleteExpense(id);
  }
};

const deleteExpense = async (id) => {
  try {
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) throw error;
    showToast("✅ تم حذف المصروف بنجاح", "success");
    await loadExpenses();
    await loadDashboardData();
  } catch (error) {
    console.error("Error deleting expense:", error);
    showToast("❌ حدث خطأ أثناء حذف المصروف", "error");
  }
};

// Helper functions
const formatNumber = (num) => {
  if (!num && num !== 0) return "0";
  return num.toLocaleString("ar-EG");
};
const formatDateTime = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleString("ar-EG");
};
const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("ar-EG");
};
const getOrderItemsCount = (items) => {
  if (!items) return 0;
  if (Array.isArray(items)) return items.length;
  if (typeof items === "object") return Object.keys(items).length;
  return 0;
};
const getStatusName = (status) => {
  const names = {
    pending: "⏳ قيد الانتظار",
    processing: "🔄 قيد التجهيز",
    shipped: "🚚 تم الشحن",
    delivered: "✅ تم التسليم",
    cancelled: "❌ ملغي",
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
const getDebtTypeName = (type) => {
  const types = {
    bank_loan: "قرض بنكي",
    rent: "إيجار",
    salary: "رواتب",
    personal_loan: "قرض شخصي",
    bills: "فواتير",
    other: "أخرى",
  };
  return types[type] || type;
};
const getDueDateClass = (dueDate) => {
  if (!dueDate) return "text-gray-500";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "text-red-600 font-bold";
  if (diffDays <= 7) return "text-orange-600 font-bold";
  return "text-green-600";
};
const getDueDateText = (dueDate) => {
  if (!dueDate) return "-";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "متأخر";
  if (diffDays === 0) return "اليوم";
  if (diffDays === 1) return "غداً";
  if (diffDays <= 7) return `بعد ${diffDays} أيام`;
  return formatDate(dueDate);
};
const getExpenseTypeName = (type) => {
  const types = {
    rent: "🏢 إيجار",
    salary: "👥 رواتب",
    electricity: "💡 كهرباء",
    water: "💧 مياه",
    internet: "🌐 إنترنت",
    maintenance: "🔧 صيانة",
    marketing: "📢 دعاية",
    transport: "🚚 نقل",
    other: "📦 أخرى",
  };
  return types[type] || type;
};
const getExpenseTypeClass = (type) => {
  const classes = {
    rent: "bg-orange-100 text-orange-700",
    salary: "bg-purple-100 text-purple-700",
    electricity: "bg-yellow-100 text-yellow-700",
    water: "bg-blue-100 text-blue-700",
    internet: "bg-green-100 text-green-700",
    maintenance: "bg-gray-100 text-gray-700",
    marketing: "bg-pink-100 text-pink-700",
    transport: "bg-cyan-100 text-cyan-700",
    other: "bg-gray-100 text-gray-700",
  };
  return classes[type] || "bg-gray-100 text-gray-700";
};

// ✅ دوال جلب البيانات
const loadExpenses = async () => {
  try {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .order("expense_date", { ascending: false });
    if (error) throw error;
    expensesList.value = data || [];
  } catch (error) {
    console.error("Error loading expenses:", error);
  }
};

const loadInventoryValue = async () => {
  try {
    const { data: products, error } = await supabase
      .from("products")
      .select("stock, price, purchase_price");
    if (error) throw error;
    let purchaseValue = 0,
      saleValue = 0;
    products.forEach((product) => {
      const stock = product.stock || 0;
      if (stock > 0) {
        purchaseValue += stock * (product.purchase_price || 0);
        saleValue += stock * (product.price || 0);
      }
    });
    totalStockPurchaseValue.value = purchaseValue;
    totalStockSaleValue.value = saleValue;
  } catch (error) {
    console.error("Error loading inventory value:", error);
  }
};

const loadProjectDebts = async () => {
  const { data: debts } = await supabase
    .from("project_debts")
    .select("*")
    .eq("status", "active");
  if (!debts) return;
  let totalRemaining = 0,
    lateAmount = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = [];
  debts.forEach((debt) => {
    totalRemaining += debt.remaining_amount || 0;
    const dueDate = new Date(debt.due_date);
    const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    if (dueDate < today) lateAmount += debt.remaining_amount;
    if (diffDays <= 7 && diffDays >= 0 && debt.remaining_amount > 0)
      upcoming.push(debt);
  });
  upcoming.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
  upcomingDebts.value = upcoming.slice(0, 5);
  projectDebts.value = {
    total: totalRemaining,
    late: lateAmount,
    count: debts.length,
  };
};

// دوال الرسم البياني والفترات (بنفس الكود السابق)
const getDateRangeForPeriod = () => {
  const now = new Date();
  let startDate = new Date();
  let endDate = new Date();
  endDate.setHours(23, 59, 59, 999);
  switch (selectedDateRange.value) {
    case "today":
      startDate.setHours(0, 0, 0, 0);
      break;
    case "yesterday":
      startDate.setDate(now.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setDate(now.getDate() - 1);
      endDate.setHours(23, 59, 59, 999);
      break;
    case "week":
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "month":
      startDate.setMonth(now.getMonth() - 1);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "thisMonth":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "thisYear":
      startDate = new Date(now.getFullYear(), 0, 1);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "year":
      startDate.setFullYear(now.getFullYear() - 1);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "sinceBeginning":
      startDate = new Date(2024, 0, 1);
      startDate.setHours(0, 0, 0, 0);
      break;
    default:
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
  }
  return { startDate, endDate };
};

const getDateRangeText = () => {
  const { startDate, endDate } = getDateRangeForPeriod();
  const start = new Date(startDate).toLocaleDateString("ar-EG");
  const end = new Date(endDate).toLocaleDateString("ar-EG");
  if (start === end) return start;
  return `${start} → ${end}`;
};

const loadPeriodDetails = async () => {
  const { startDate, endDate } = getDateRangeForPeriod();

  // ✅ 1. جلب طلبات المعرض من orders
  const { data: ordersData } = await supabase
    .from("orders")
    .select("*")
    .gte("order_date", startDate.toISOString())
    .lte("order_date", endDate.toISOString());

  // ✅ 2. جلب طلبات الموقع من customer_orders
  const { data: customerOrdersData } = await supabase
    .from("customer_orders")
    .select("*")
    .gte("order_date", startDate.toISOString())
    .lte("order_date", endDate.toISOString());

  // ✅ 3. دمج الطلبات
  const orders = [...(ordersData || []), ...(customerOrdersData || [])];

  // ✅ 4. باقي الكود بنفس الشكل
  const { data: purchases } = await supabase
    .from("purchases")
    .select("*")
    .gte("purchase_date", startDate.toISOString().split("T")[0])
    .lte("purchase_date", endDate.toISOString().split("T")[0]);

  const { data: expenses } = await supabase
    .from("expenses")
    .select("*")
    .gte("expense_date", startDate.toISOString().split("T")[0])
    .lte("expense_date", endDate.toISOString().split("T")[0]);

  const { data: debts } = await supabase
    .from("project_debts")
    .select("*")
    .eq("status", "active");

  const onlineOrders = orders?.filter((o) => o.sale_type === "online") || [];
  const offlineOrders = orders?.filter((o) => o.sale_type === "offline") || [];
  const brideOrders =
    orders?.filter((o) => o.notes && o.notes.includes("كشف عروسة")) || [];

  const onlineSales = onlineOrders.reduce(
    (sum, o) => sum + (o.total_price || 0),
    0,
  );
  const offlineSales = offlineOrders.reduce(
    (sum, o) => sum + (o.total_price || 0),
    0,
  );
  const brideSales = brideOrders.reduce(
    (sum, o) => sum + (o.total_price || 0),
    0,
  );
  const totalSales = onlineSales + offlineSales;
  const totalPurchases =
    purchases?.reduce((sum, p) => sum + (p.total_price || 0), 0) || 0;
  const totalExpensesPeriod =
    expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
  const profit = totalSales - totalPurchases - totalExpensesPeriod;
  const profitMargin =
    totalSales > 0 ? ((profit / totalSales) * 100).toFixed(1) : 0;

  // ✅ حساب عدد العملاء الفريدين بشكل صحيح
  const uniqueCustomers = new Set();
  orders?.forEach((order) => {
    // الأولوية: البريد الإلكتروني
    if (order.customer_email) {
      uniqueCustomers.add(order.customer_email);
    }
    // ثانياً: رقم الهاتف
    else if (order.customer_phone) {
      uniqueCustomers.add(order.customer_phone);
    }
    // أخيراً: الاسم (ما عدا "زائر")
    else if (order.customer_name && order.customer_name !== "زائر") {
      uniqueCustomers.add(order.customer_name);
    }
  });

  let totalItemsSold = 0;
  orders?.forEach((order) => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach((item) => {
        totalItemsSold += item.quantity || 1;
      });
    }
  });

  const avgOrder = orders?.length > 0 ? totalSales / orders.length : 0;
  const debtsDue =
    debts?.reduce((sum, d) => sum + (d.remaining_amount || 0), 0) || 0;

  periodStats.value = {
    totalSales,
    totalPurchases,
    profit,
    profitMargin,
    ordersCount: orders?.length || 0,
    purchasesCount: purchases?.length || 0,
    onlineSales,
    onlineCount: onlineOrders.length,
    avgOnlineOrder:
      onlineOrders.length > 0 ? onlineSales / onlineOrders.length : 0,
    offlineSales,
    offlineCount: offlineOrders.length,
    avgOfflineOrder:
      offlineOrders.length > 0 ? offlineSales / offlineOrders.length : 0,
    brideSales,
    brideCount: brideOrders.length,
    avgBrideValue: brideOrders.length > 0 ? brideSales / brideOrders.length : 0,
    totalExpenses: totalExpensesPeriod,
    expensesCount: expenses?.length || 0,
    customersCount: uniqueCustomers.size,
    totalItemsSold,
    averageOrderValue: parseFloat(avgOrder.toFixed(0)),
    debtsDue,
  };
};

const loadDashboardData = async () => {
  const now = new Date();
  let startDate = new Date();
  if (selectedPeriod.value === "week") startDate.setDate(now.getDate() - 7);
  else if (selectedPeriod.value === "month")
    startDate.setMonth(now.getMonth() - 1);
  else startDate.setFullYear(now.getFullYear() - 1);
  startDate.setHours(0, 0, 0, 0);

  // ✅ 1. جلب طلبات المعرض من orders
  const { data: ordersData } = await supabase
    .from("orders")
    .select("*")
    .gte("order_date", startDate.toISOString())
    .order("order_date", { ascending: false });

  // ✅ 2. جلب طلبات الموقع من customer_orders
  const { data: customerOrdersData } = await supabase
    .from("customer_orders")
    .select("*")
    .gte("order_date", startDate.toISOString())
    .order("order_date", { ascending: false });

  // ✅ 3. دمج الطلبات
  const allOrders = [...(ordersData || []), ...(customerOrdersData || [])];

  // ترتيب حسب التاريخ
  allOrders.sort((a, b) => new Date(b.order_date) - new Date(a.order_date));

  // ✅ 4. باقي الكود بنفس الشكل بس باستخدام allOrders بدل orders
  let orders = allOrders || [];
  if (filterSaleType.value === "normal")
    orders = orders.filter((o) => !o.notes || !o.notes.includes("كشف عروسة"));
  else if (filterSaleType.value === "bride")
    orders = orders.filter((o) => o.notes && o.notes.includes("كشف عروسة"));

  // ✅ 5. جلب المشتريات (نفسها)
  const { data: purchases } = await supabase
    .from("purchases")
    .select("*")
    .gte("purchase_date", startDate.toISOString());

  // ✅ 6. باقي الحسابات بنفس الشكل
  const brideOrders = allOrders.filter(
    (o) => o.notes && o.notes.includes("كشف عروسة"),
  );
  brideChecklistSales.value = {
    total: brideOrders.reduce((sum, o) => sum + (o.total_price || 0), 0),
    count: brideOrders.length,
  };

  const totalSales = orders.reduce((sum, o) => sum + (o.total_price || 0), 0);
  const totalPurchases =
    purchases?.reduce((sum, p) => sum + (p.total_price || 0), 0) || 0;
  const profit = totalSales - totalPurchases;
  const profitMargin =
    totalSales > 0 ? ((profit / totalSales) * 100).toFixed(1) : 0;

  const onlineOrders = orders.filter((o) => o.sale_type === "online");
  const offlineOrders = orders.filter((o) => o.sale_type === "offline");

  const onlineSales = onlineOrders.reduce(
    (sum, o) => sum + (o.total_price || 0),
    0,
  );
  const offlineSales = offlineOrders.reduce(
    (sum, o) => sum + (o.total_price || 0),
    0,
  );

  stats.value = {
    totalSales,
    totalPurchases,
    ordersCount: orders.length,
    purchasesCount: purchases?.length || 0,
    profit,
    profitMargin,
    onlineSales,
    onlineCount: onlineOrders.length,
    offlineSales,
    offlineCount: offlineOrders.length,
  };

  // ✅ 7. المبيعات اليومية (آخر 7 أيام)
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const dateStr = date.toISOString().split("T")[0];

    const dayOrders = allOrders.filter((o) =>
      o.order_date?.startsWith(dateStr),
    );

    const onlineTotal = dayOrders
      .filter((o) => o.sale_type === "online")
      .reduce((sum, o) => sum + (o.total_price || 0), 0);
    const offlineNormalTotal = dayOrders
      .filter(
        (o) =>
          o.sale_type === "offline" &&
          (!o.notes || !o.notes.includes("كشف عروسة")),
      )
      .reduce((sum, o) => sum + (o.total_price || 0), 0);
    const offlineBrideTotal = dayOrders
      .filter(
        (o) =>
          o.sale_type === "offline" && o.notes && o.notes.includes("كشف عروسة"),
      )
      .reduce((sum, o) => sum + (o.total_price || 0), 0);

    last7Days.push({
      date: dateStr,
      label: date.toLocaleDateString("ar-EG", { weekday: "short" }),
      online: onlineTotal,
      offlineNormal: offlineNormalTotal,
      offlineBride: offlineBrideTotal,
      offline: offlineNormalTotal + offlineBrideTotal,
      total: onlineTotal + offlineNormalTotal + offlineBrideTotal,
    });
  }
  dailySales.value = last7Days;

  // ✅ 8. أعلى المنتجات مبيعاً
  const productSales = new Map();
  orders.forEach((order) => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach((item) => {
        if (!productSales.has(item.product_id))
          productSales.set(item.product_id, {
            total_quantity: 0,
            total_revenue: 0,
            product_name: item.name,
          });
        const data = productSales.get(item.product_id);
        data.total_quantity += item.quantity || 1;
        data.total_revenue += (item.price || 0) * (item.quantity || 1);
        data.product_name = item.name;
      });
    }
  });

  topProducts.value = Array.from(productSales.entries())
    .map(([product_id, data]) => ({ product_id, ...data }))
    .sort((a, b) => b.total_quantity - a.total_quantity)
    .slice(0, 5);

  recentOrders.value = orders.slice(0, 10);

  await loadProjectDebts();
  await loadInventoryValue();
  await nextTick();
  drawChart();
};

const drawChart = () => {
  const ctx = document.getElementById("salesChart")?.getContext("2d");
  if (!ctx) return;
  if (salesChart) salesChart.destroy();
  salesChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: dailySales.value.map((d) => d.label),
      datasets: [
        {
          label: "🖥️ مبيعات الموقع",
          data: dailySales.value.map((d) => d.online),
          backgroundColor: "rgba(59, 130, 246, 0.7)",
          borderRadius: 8,
        },
        {
          label: "🏪 مبيعات المعرض العادية",
          data: dailySales.value.map((d) => d.offlineNormal || 0),
          backgroundColor: "rgba(168, 85, 247, 0.7)",
          borderRadius: 8,
        },
        {
          label: "👰 مبيعات كشوفات العرائس",
          data: dailySales.value.map((d) => d.offlineBride || 0),
          backgroundColor: "rgba(236, 72, 153, 0.7)",
          borderRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: { font: { size: window.innerWidth < 640 ? 8 : 12 } },
        },
        tooltip: {
          callbacks: {
            label: (ctx) =>
              `${ctx.dataset.label}: ${ctx.raw.toLocaleString("ar-EG")} ج`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "المبيعات (ج)",
            font: { size: window.innerWidth < 640 ? 10 : 12 },
          },
          grid: { color: "#e5e7eb" },
        },
        x: {
          title: {
            display: true,
            text: "الأيام",
            font: { size: window.innerWidth < 640 ? 10 : 12 },
          },
          grid: { display: false },
        },
      },
    },
  });
};

// Watchers & Mounted
watch(
  selectedDateRange,
  () => {
    loadPeriodDetails();
  },
  { immediate: true },
);

onMounted(() => {
  loadExpenses();
  loadDashboardData();
  loadPeriodDetails();
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/chart.js";
  script.onload = () => {
    loadDashboardData();
  };
  document.head.appendChild(script);
  window.addEventListener("resize", () => {
    if (salesChart) {
      salesChart.options.plugins.legend.labels.font.size =
        window.innerWidth < 640 ? 8 : 12;
      salesChart.options.scales.y.title.font.size =
        window.innerWidth < 640 ? 10 : 12;
      salesChart.options.scales.x.title.font.size =
        window.innerWidth < 640 ? 10 : 12;
      salesChart.update();
    }
  });
});
</script>
