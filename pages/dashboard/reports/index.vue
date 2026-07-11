<template>
  <div class="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen " dir="rtl">
    <!-- Header -->
    <div class="mb-4 sm:mb-6">
      <div
        class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
            📊 التقارير اليومية
          </h1>
          <p class="text-sm sm:text-base text-gray-500">
            إحصائيات المبيعات والمشتريات والأرباح
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
          <div class="bg-purple-100 rounded-xl px-3 py-2 text-center">
            <p class="text-xs text-purple-600">عدد الكشوفات</p>
            <p class="text-lg font-bold text-purple-600">
              {{ brideChecklistSales.count }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Card: اختيار التاريخ والفترة -->
    <div class="bg-white rounded-2xl shadow p-4 sm:p-6 mb-6">
      <div class="flex flex-col gap-4">
        <!-- أزرار الفترات -->
        <div>
          <label class="block text-sm font-medium mb-2">الفترة</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="period in periods"
              :key="period.value"
              @click="selectPeriod(period.value)"
              class="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition text-sm sm:text-base whitespace-nowrap"
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

        <!-- تاريخ مخصص -->
        <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          <div>
            <label class="block text-sm font-medium mb-1">من تاريخ</label>
            <input
              type="date"
              v-model="customStartDate"
              class="p-2 border rounded-lg text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">إلى تاريخ</label>
            <input
              type="date"
              v-model="customEndDate"
              class="p-2 border rounded-lg text-sm"
            />
          </div>
          <button
            @click="applyCustomDate"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            عرض
          </button>
        </div>

        <!-- فلتر نوع المبيعات -->
        <div>
          <label class="block text-sm font-medium mb-1">نوع المبيعات</label>
          <select
            v-model="filterSaleType"
            @change="loadReport"
            class="px-3 py-2 border rounded-lg text-sm bg-white w-full sm:w-48"
          >
            <option value="all">جميع المبيعات</option>
            <option value="normal">مبيعات عادية</option>
            <option value="bride">كشوفات عرائس</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 4 Cards رئيسية -->
    <div
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8"
    >
      <!-- المبيعات -->
      <div
        class="bg-white rounded-xl sm:rounded-2xl shadow p-4 sm:p-6 border-r-4 border-green-500"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1 min-w-0">
            <p class="text-gray-500 text-xs sm:text-sm">إجمالي المبيعات</p>
            <p class="text-xl sm:text-2xl font-bold text-green-600 break-words">
              {{ formatNumber(report.sales.total) }} ج
            </p>
            <p class="text-xs text-gray-400 mt-1">
              {{ report.sales.count }} طلب
            </p>
          </div>
          <div
            class="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center text-xl sm:text-2xl shrink-0"
          >
            🛒
          </div>
        </div>
      </div>

      <!-- المشتريات -->
      <div
        class="bg-white rounded-xl sm:rounded-2xl shadow p-4 sm:p-6 border-r-4 border-orange-500"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1 min-w-0">
            <p class="text-gray-500 text-xs sm:text-sm">إجمالي المشتريات</p>
            <p
              class="text-xl sm:text-2xl font-bold text-orange-600 break-words"
            >
              {{ formatNumber(report.purchases.total) }} ج
            </p>
            <p class="text-xs text-gray-400 mt-1">
              {{ report.purchases.count }} فاتورة
            </p>
          </div>
          <div
            class="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-full flex items-center justify-center text-xl sm:text-2xl shrink-0"
          >
            📦
          </div>
        </div>
      </div>

      <!-- صافي الربح -->
      <div
        class="bg-white rounded-xl sm:rounded-2xl shadow p-4 sm:p-6 border-r-4 border-blue-500"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1 min-w-0">
            <p class="text-gray-500 text-xs sm:text-sm">صافي الربح</p>
            <p
              class="text-xl sm:text-2xl font-bold break-words"
              :class="report.profit >= 0 ? 'text-blue-600' : 'text-red-600'"
            >
              {{ formatNumber(report.profit) }} ج
            </p>
            <p class="text-xs text-gray-400 mt-1">مبيعات - مشتريات</p>
          </div>
          <div
            class="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center text-xl sm:text-2xl shrink-0"
          >
            💰
          </div>
        </div>
      </div>

      <!-- هامش الربح -->
      <div
        class="bg-white rounded-xl sm:rounded-2xl shadow p-4 sm:p-6 border-r-4 border-purple-500"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1 min-w-0">
            <p class="text-gray-500 text-xs sm:text-sm">هامش الربح</p>
            <p
              class="text-xl sm:text-2xl font-bold text-purple-600 break-words"
            >
              {{ report.profitMargin }}%
            </p>
            <p class="text-xs text-gray-400 mt-1">نسبة الربح</p>
          </div>
          <div
            class="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center text-xl sm:text-2xl shrink-0"
          >
            📈
          </div>
        </div>
      </div>
    </div>

    <!-- تفاصيل المبيعات والمشتريات -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
      <!-- المبيعات -->
      <div class="bg-white rounded-2xl shadow overflow-hidden">
        <div class="bg-green-50 p-3 sm:p-4 border-b">
          <div class="flex justify-between items-center">
            <h2 class="text-lg sm:text-xl font-bold text-green-700">
              🛍️ تفاصيل المبيعات
            </h2>
            <span class="text-xs text-gray-500">{{ dateRangeText }}</span>
          </div>
        </div>

        <!-- Mobile Cards for Sales -->
        <div class="block md:hidden divide-y max-h-96 overflow-y-auto">
          <div
            v-for="order in report.sales.orders"
            :key="order.id"
            class="p-4 hover:bg-gray-50"
          >
            <div class="flex justify-between items-start mb-2">
              <div>
                <span class="font-medium text-sm">{{
                  order.customer_name || "زائر"
                }}</span>
                <span
                  v-if="order.notes && order.notes.includes('كشف عروسة')"
                  class="mr-2 text-pink-600 text-xs bg-pink-50 px-2 py-0.5 rounded-full"
                >
                  👰 كشف
                </span>
              </div>
              <span class="text-xs text-gray-500">{{
                formatTime(order.order_date)
              }}</span>
            </div>
            <div class="flex justify-between items-center mt-2">
              <span class="text-sm text-gray-500"
                >{{ getOrderItemsCount(order.items) }} منتج</span
              >
              <span class="font-bold text-green-600"
                >{{ formatNumber(order.total_price) }} ج</span
              >
            </div>
          </div>
          <div
            v-if="report.sales.orders?.length === 0"
            class="text-center py-8 text-gray-400"
          >
            لا توجد مبيعات في هذه الفترة
          </div>
        </div>

        <!-- Desktop Table for Sales -->
        <div class="hidden md:block max-h-96 overflow-y-auto">
          <table class="w-full min-w-[600px]">
            <thead class="bg-gray-50 sticky top-0">
              <tr>
                <th class="p-3 text-right text-sm">العميل</th>
                <th class="p-3 text-right text-sm hidden sm:table-cell">
                  المصدر
                </th>
                <th class="p-3 text-right text-sm">المنتجات</th>
                <th class="p-3 text-right text-sm">الإجمالي</th>
                <th class="p-3 text-right text-sm hidden lg:table-cell">
                  الوقت
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="order in report.sales.orders"
                :key="order.id"
                class="border-t"
              >
                <td class="p-3 text-sm">{{ order.customer_name || "زائر" }}</td>
                <td class="p-3 text-sm hidden sm:table-cell">
                  <span
                    v-if="order.notes && order.notes.includes('كشف عروسة')"
                    class="bg-pink-100 text-pink-700 px-2 py-1 rounded-full text-xs whitespace-nowrap"
                  >
                    👰 كشف عروسة
                  </span>
                  <span v-else class="text-gray-500 text-xs">بيع مباشر</span>
                </td>
                <td class="p-3 text-sm">
                  {{ getOrderItemsCount(order.items) }} منتج
                </td>
                <td
                  class="p-3 font-semibold text-green-600 text-sm whitespace-nowrap"
                >
                  {{ formatNumber(order.total_price) }} ج
                </td>
                <td class="p-3 text-xs text-gray-500 hidden lg:table-cell">
                  {{ formatTime(order.order_date) }}
                </td>
              </tr>
              <tr v-if="report.sales.orders?.length === 0">
                <td colspan="5" class="text-center py-8 text-gray-400">
                  لا توجد مبيعات في هذه الفترة
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- المشتريات -->
      <div class="bg-white rounded-2xl shadow overflow-hidden">
        <div class="bg-orange-50 p-3 sm:p-4 border-b">
          <div class="flex justify-between items-center">
            <h2 class="text-lg sm:text-xl font-bold text-orange-700">
              📥 تفاصيل المشتريات
            </h2>
            <span class="text-xs text-gray-500">{{ dateRangeText }}</span>
          </div>
        </div>

        <!-- Mobile Cards for Purchases -->
        <div class="block md:hidden divide-y max-h-96 overflow-y-auto">
          <div
            v-for="purchase in report.purchases.items"
            :key="purchase.id"
            class="p-4 hover:bg-gray-50"
          >
            <div class="flex justify-between items-start mb-2">
              <span class="font-medium text-sm">{{
                getProductName(purchase.product_id)
              }}</span>
              <span class="text-xs text-gray-500"
                >{{ purchase.quantity }} قطعة</span
              >
            </div>
            <div class="flex justify-between items-center mt-2">
              <span class="text-sm text-gray-500"
                >{{ formatNumber(purchase.unit_price) }} ج/قطعة</span
              >
              <span class="font-bold text-orange-600"
                >{{ formatNumber(purchase.total_price) }} ج</span
              >
            </div>
          </div>
          <div
            v-if="report.purchases.items?.length === 0"
            class="text-center py-8 text-gray-400"
          >
            لا توجد مشتريات في هذه الفترة
          </div>
        </div>

        <!-- Desktop Table for Purchases -->
        <div class="hidden md:block max-h-96 overflow-y-auto">
          <table class="w-full min-w-[500px]">
            <thead class="bg-gray-50 sticky top-0">
              <tr>
                <th class="p-3 text-right text-sm">المنتج</th>
                <th class="p-3 text-right text-sm hidden sm:table-cell">
                  الكمية
                </th>
                <th class="p-3 text-right text-sm hidden lg:table-cell">
                  سعر الشراء
                </th>
                <th class="p-3 text-right text-sm">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="purchase in report.purchases.items"
                :key="purchase.id"
                class="border-t"
              >
                <td class="p-3 text-sm">
                  {{ getProductName(purchase.product_id) }}
                </td>
                <td class="p-3 text-sm hidden sm:table-cell">
                  {{ purchase.quantity }}
                </td>
                <td class="p-3 text-sm hidden lg:table-cell">
                  {{ formatNumber(purchase.unit_price) }} ج
                </td>
                <td
                  class="p-3 font-semibold text-orange-600 text-sm whitespace-nowrap"
                >
                  {{ formatNumber(purchase.total_price) }} ج
                </td>
              </tr>
              <tr v-if="report.purchases.items?.length === 0">
                <td colspan="4" class="text-center py-8 text-gray-400">
                  لا توجد مشتريات في هذه الفترة
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- حركة المخزون -->
    <div class="bg-white rounded-2xl shadow overflow-hidden">
      <div class="bg-blue-50 p-3 sm:p-4 border-b">
        <div class="flex justify-between items-center">
          <h2 class="text-lg sm:text-xl font-bold text-blue-700">
            📦 حركة المخزون (المنتجات الأكثر مبيعاً)
          </h2>
          <span class="text-xs text-gray-500">{{ dateRangeText }}</span>
        </div>
      </div>

      <!-- Mobile Cards for Stock Movements -->
      <div class="block md:hidden divide-y max-h-96 overflow-y-auto">
        <div
          v-for="item in report.stockMovements"
          :key="item.product_id"
          class="p-4 hover:bg-gray-50"
        >
          <div class="flex justify-between items-start mb-2">
            <span class="font-medium text-sm">{{ item.product_name }}</span>
            <span
              :class="
                item.current_stock < 10
                  ? 'text-red-600 font-bold'
                  : 'text-gray-700'
              "
              class="text-sm"
            >
              مخزون: {{ item.current_stock }}
            </span>
          </div>
          <div class="grid grid-cols-2 gap-2 mt-2 text-sm">
            <div>
              <span class="text-gray-500">مباع:</span>
              <span class="font-medium mr-1">{{
                item.sold_quantity || 0
              }}</span>
            </div>
            <div>
              <span class="text-gray-500">إيرادات:</span>
              <span class="text-green-600 font-medium mr-1"
                >{{ formatNumber(item.sales_revenue || 0) }} ج</span
              >
            </div>
            <div>
              <span class="text-gray-500">تكلفة:</span>
              <span class="text-orange-600 font-medium mr-1"
                >{{ formatNumber(item.purchase_cost || 0) }} ج</span
              >
            </div>
            <div>
              <span class="text-gray-500">صافي ربح:</span>
              <span class="text-blue-600 font-medium mr-1"
                >{{
                  formatNumber(
                    (item.sales_revenue || 0) - (item.purchase_cost || 0),
                  )
                }}
                ج</span
              >
            </div>
          </div>
        </div>
        <div
          v-if="report.stockMovements?.length === 0"
          class="text-center py-8 text-gray-400"
        >
          لا توجد بيانات
        </div>
      </div>

      <!-- Desktop Table for Stock Movements -->
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full min-w-[800px]">
          <thead class="bg-gray-50">
            <tr>
              <th class="p-3 text-right text-sm">المنتج</th>
              <th class="p-3 text-right text-sm">المخزون الحالي</th>
              <th class="p-3 text-right text-sm hidden sm:table-cell">
                الكمية المباعة
              </th>
              <th class="p-3 text-right text-sm hidden lg:table-cell">
                إيرادات المبيعات
              </th>
              <th class="p-3 text-right text-sm hidden lg:table-cell">
                تكلفة المشتريات
              </th>
              <th class="p-3 text-right text-sm">صافي الربح</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in report.stockMovements"
              :key="item.product_id"
              class="border-t"
            >
              <td class="p-3 font-medium text-sm">{{ item.product_name }}</td>
              <td class="p-3 text-sm">
                <span
                  :class="
                    item.current_stock < 10
                      ? 'text-red-600 font-bold'
                      : 'text-gray-700'
                  "
                >
                  {{ item.current_stock }}
                </span>
              </td>
              <td class="p-3 text-sm hidden sm:table-cell">
                {{ item.sold_quantity || 0 }}
              </td>
              <td
                class="p-3 text-green-600 text-sm hidden lg:table-cell whitespace-nowrap"
              >
                {{ formatNumber(item.sales_revenue || 0) }} ج
              </td>
              <td
                class="p-3 text-orange-600 text-sm hidden lg:table-cell whitespace-nowrap"
              >
                {{ formatNumber(item.purchase_cost || 0) }} ج
              </td>
              <td class="p-3 text-blue-600 text-sm whitespace-nowrap">
                {{
                  formatNumber(
                    (item.sales_revenue || 0) - (item.purchase_cost || 0),
                  )
                }}
                ج
              </td>
            </tr>
            <tr v-if="report.stockMovements?.length === 0">
              <td colspan="6" class="text-center py-8 text-gray-400">
                لا توجد بيانات
              </td>
            </tr>
          </tbody>
        </table>
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
const selectedPeriod = ref("thisMonth");
const filterSaleType = ref("all");
const customStartDate = ref("");
const customEndDate = ref("");
const products = ref([]);
const earliestDate = ref(null);

const report = ref({
  sales: { total: 0, count: 0, orders: [] },
  purchases: { total: 0, count: 0, items: [] },
  profit: 0,
  profitMargin: 0,
  stockMovements: [],
});

const brideChecklistSales = ref({
  total: 0,
  count: 0,
});

// الفترات المتاحة
const periods = [
  { name: "اليوم", value: "today" },
  { name: "أمس", value: "yesterday" },
  { name: "آخر 7 أيام", value: "week" },
  { name: "آخر 30 يوم", value: "month" },
  { name: "هذا الشهر", value: "thisMonth" },
  { name: "هذه السنة", value: "thisYear" },
  { name: "منذ البداية", value: "sinceBeginning" },
  { name: "آخر سنة", value: "year" },
];

// نص الفترة المحددة
const dateRangeText = computed(() => {
  if (selectedPeriod.value === "custom") {
    return `${formatDateShort(customStartDate.value)} → ${formatDateShort(customEndDate.value)}`;
  }
  const period = periods.find((p) => p.value === selectedPeriod.value);
  return period?.name || "";
});

// Helper functions
const formatNumber = (num) => {
  if (!num && num !== 0) return "0";
  return num.toLocaleString("ar-EG");
};

const formatDateShort = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("ar-EG");
};

const formatTime = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getProductName = (id) => {
  const product = products.value.find((p) => p.id === id);
  return product?.name || "منتج غير معروف";
};

const getOrderItemsCount = (items) => {
  if (!items) return 0;
  if (Array.isArray(items)) return items.length;
  if (typeof items === "object") return Object.keys(items).length;
  return 0;
};

// جلب أول تاريخ في النظام
const getEarliestDate = async () => {
  try {
    const { data } = await supabase
      .from("orders")
      .select("order_date")
      .order("order_date", { ascending: true })
      .limit(1);

    if (data && data.length > 0) {
      return new Date(data[0].order_date);
    }
    return new Date(2024, 0, 1);
  } catch (error) {
    console.error("Error getting earliest date:", error);
    return new Date(2024, 0, 1);
  }
};

// جلب كل المنتجات
const loadProducts = async () => {
  try {
    const { data } = await supabase
      .from("products")
      .select("id, name, stock, purchase_price");
    products.value = data || [];
  } catch (error) {
    console.error("Error loading products:", error);
    showToast("❌ حدث خطأ في تحميل المنتجات", "error");
  }
};

// حساب تاريخ البدء والانتهاء
const getDateRange = () => {
  const now = new Date();
  let startDate = new Date();
  let endDate = new Date();

  endDate.setHours(23, 59, 59, 999);

  if (
    selectedPeriod.value === "custom" &&
    customStartDate.value &&
    customEndDate.value
  ) {
    startDate = new Date(customStartDate.value);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(customEndDate.value);
    endDate.setHours(23, 59, 59, 999);
    return { startDate, endDate };
  }

  switch (selectedPeriod.value) {
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

    case "sinceBeginning":
      if (earliestDate.value) {
        startDate = new Date(earliestDate.value);
      } else {
        startDate = new Date(2024, 0, 1);
      }
      startDate.setHours(0, 0, 0, 0);
      break;

    case "year":
      startDate.setFullYear(now.getFullYear() - 1);
      startDate.setHours(0, 0, 0, 0);
      break;

    default:
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
  }

  return { startDate, endDate };
};

// اختيار فترة
const selectPeriod = async (period) => {
  selectedPeriod.value = period;
  if (period === "sinceBeginning" && !earliestDate.value) {
    earliestDate.value = await getEarliestDate();
  }
  await loadReport();
};

// تطبيق تاريخ مخصص
const applyCustomDate = () => {
  if (customStartDate.value && customEndDate.value) {
    selectedPeriod.value = "custom";
    loadReport();
  } else {
    showToast("⚠️ الرجاء اختيار تاريخ البداية والنهاية", "warning");
  }
};

// جلب التقرير
const loadReport = async () => {
  try {
    const { startDate, endDate } = getDateRange();

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
    const allOrders = [...(ordersData || []), ...(customerOrdersData || [])];
    let orders = allOrders || [];

    if (filterSaleType.value === "normal") {
      orders = orders.filter((o) => !o.notes || !o.notes.includes("كشف عروسة"));
    } else if (filterSaleType.value === "bride") {
      orders = orders.filter((o) => o.notes && o.notes.includes("كشف عروسة"));
    }

    const brideOrders = allOrders.filter(
      (o) => o.notes && o.notes.includes("كشف عروسة"),
    );
    brideChecklistSales.value = {
      total: brideOrders.reduce((sum, o) => sum + (o.total_price || 0), 0),
      count: brideOrders.length,
    };

    // ✅ 4. جلب المشتريات
    const { data: purchasesData } = await supabase
      .from("purchases")
      .select("*")
      .gte("purchase_date", startDate.toISOString().split("T")[0])
      .lte("purchase_date", endDate.toISOString().split("T")[0]);

    // ✅ 5. جلب المنتجات مع أسعار الشراء
    const { data: productsWithPrice } = await supabase
      .from("products")
      .select("id, name, stock, purchase_price");

    const productsMap = new Map();
    productsWithPrice?.forEach((p) => {
      productsMap.set(p.id, p);
    });

    const salesTotal =
      orders.reduce((sum, o) => sum + (o.total_price || 0), 0) || 0;
    const purchasesTotal =
      purchasesData?.reduce((sum, p) => sum + (p.total_price || 0), 0) || 0;
    const profit = salesTotal - purchasesTotal;
    const profitMargin =
      salesTotal > 0 ? ((profit / salesTotal) * 100).toFixed(1) : 0;

    // ✅ 6. حركة المخزون - تشمل كل المنتجات
    const stockMap = new Map();

    // ✅ أولاً: أضف كل المنتجات من products (حتى اللي متباعتش)
    productsWithPrice?.forEach((product) => {
      if (!stockMap.has(product.id)) {
        stockMap.set(product.id, {
          sold_quantity: 0,
          sales_revenue: 0,
          purchase_cost: 0,
        });
      }
    });

    // ✅ ثانياً: أضف المبيعات
    orders.forEach((order) => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item) => {
          if (!stockMap.has(item.product_id)) {
            stockMap.set(item.product_id, {
              sold_quantity: 0,
              sales_revenue: 0,
              purchase_cost: 0,
            });
          }
          const data = stockMap.get(item.product_id);
          data.sold_quantity += item.quantity || 1;
          data.sales_revenue += (item.price || 0) * (item.quantity || 1);
        });
      }
    });

    // ✅ ثالثاً: أضف تكلفة المشتريات من جدول المشتريات
    purchasesData?.forEach((purchase) => {
      if (!stockMap.has(purchase.product_id)) {
        stockMap.set(purchase.product_id, {
          sold_quantity: 0,
          sales_revenue: 0,
          purchase_cost: 0,
        });
      }
      const data = stockMap.get(purchase.product_id);
      data.purchase_cost += purchase.total_price || 0;
    });

    // ✅ رابعاً: للمنتجات اللي مش في المشتريات، استخدم purchase_price من products
    stockMap.forEach((data, productId) => {
      if (data.purchase_cost === 0) {
        const product = productsMap.get(productId);
        if (product && product.purchase_price) {
          const totalQuantity = (product.stock || 0) + (data.sold_quantity || 0);
          if (totalQuantity > 0) {
            data.purchase_cost = product.purchase_price * totalQuantity;
          }
        }
      }
    });

    // ✅ خامساً: الترتيب (الأكثر مبيعاً أولاً)
    const stockMovements = Array.from(stockMap.entries())
      .map(([product_id, data]) => {
        const product = productsMap.get(product_id);
        return {
          product_id,
          product_name: product?.name || "منتج غير معروف",
          current_stock: product?.stock || 0,
          ...data,
        };
      })
      .filter((item) => item.current_stock > 0 || item.sold_quantity > 0)
      .sort((a, b) => (b.sold_quantity || 0) - (a.sold_quantity || 0));

    report.value = {
      sales: {
        total: salesTotal,
        count: orders.length,
        orders: orders,
      },
      purchases: {
        total: purchasesTotal,
        count: purchasesData?.length || 0,
        items: purchasesData || [],
      },
      profit: profit,
      profitMargin: profitMargin,
      stockMovements: stockMovements,
    };
  } catch (error) {
    console.error("Error loading report:", error);
    showToast("❌ حدث خطأ في تحميل التقرير", "error");
  }
};

onMounted(async () => {
  await loadProducts();
  earliestDate.value = await getEarliestDate();
  await loadReport();
});
</script>

<style scoped>
/* Custom styles for better mobile experience */
@media (max-width: 640px) {
  input,
  select,
  button {
    font-size: 16px !important;
  }
}

/* Scrollbar styling */
.max-h-96::-webkit-scrollbar {
  width: 6px;
}
.max-h-96::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}
.max-h-96::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
</style>