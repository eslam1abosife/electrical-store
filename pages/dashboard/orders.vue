<template>
  <div class="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen" dir="rtl">
    <div class="mb-4 sm:mb-6">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
        📋 إدارة الطلبات
      </h1>
      <p class="text-sm sm:text-base text-gray-500">
        متابعة طلبات العملاء (من الموقع ومن المعرض)
      </p>
    </div>

    <!-- فلتر الحالة -->
    <div class="flex gap-2 flex-wrap mb-4">
      <button
        v-for="status in statuses"
        :key="status.value"
        @click="filterStatus = status.value"
        class="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm transition whitespace-nowrap"
        :class="
          filterStatus === status.value
            ? 'bg-blue-600 text-white'
            : 'bg-white border hover:bg-gray-100'
        "
      >
        {{ status.name }}
      </button>
    </div>

    <!-- فلتر نوع البيع -->
    <div class="flex flex-wrap items-center gap-2 sm:gap-4 mb-6">
      <span class="text-xs sm:text-sm text-gray-500">نوع البيع:</span>
      <div class="flex gap-2 flex-wrap">
        <button
          v-for="type in saleTypes"
          :key="type.value"
          @click="filterSaleType = type.value"
          class="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm transition whitespace-nowrap"
          :class="
            filterSaleType === type.value
              ? 'bg-green-600 text-white'
              : 'bg-white border hover:bg-gray-100'
          "
        >
          {{ type.name }}
        </button>
      </div>
    </div>

    <!-- جدول الطلبات - Responsive -->
    <div class="bg-white rounded-2xl shadow overflow-hidden">
      <!-- Mobile Cards View -->
      <div class="block md:hidden divide-y">
        <div
          v-for="order in filteredOrders"
          :key="order.id"
          class="p-4 hover:bg-gray-50"
        >
          <div class="flex justify-between items-start mb-3">
            <div class="flex flex-col gap-1">
              <span
                :class="
                  order.sale_type === 'online'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-purple-100 text-purple-700'
                "
                class="px-2 py-1 rounded-full text-xs font-medium self-start"
              >
                {{ order.sale_type === "online" ? "🖥️ موقع" : "🏪 معرض" }}
              </span>
              <span class="text-xs font-mono text-gray-500"
                >{{ order.id.slice(0, 8) }}...</span
              >
            </div>
            <div class="flex gap-2">
              <button
                @click="printInvoice(order)"
                class="text-blue-500 hover:text-blue-700 p-1"
                title="طباعة"
              >
                🖨️
              </button>
              <button
                v-if="userStore?.canEdit"
                @click="deleteOrder(order.id)"
                class="text-red-500 hover:text-red-700 p-1"
                title="حذف"
              >
                🗑️
              </button>
            </div>
          </div>

          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">العميل:</span>
              <span class="font-medium">{{
                order.customer_name || "زائر"
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">الهاتف:</span>
              <span class="dir-ltr">{{ order.customer_phone || "-" }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">الإجمالي:</span>
              <span class="font-bold text-green-600"
                >{{ formatNumber(order.total_price) }} ج</span
              >
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">الحالة:</span>
              <select
                :value="order.status"
                @change="updateStatus(order.id, $event.target.value)"
                class="px-2 py-1 rounded-full text-xs border cursor-pointer"
                :class="getStatusClass(order.status)"
              >
                <option value="pending">⏳ قيد الانتظار</option>
                <option value="processing">🔄 قيد التجهيز</option>
                <option value="shipped">🚚 تم الشحن</option>
                <option value="delivered">✅ تم التسليم</option>
                <option value="cancelled">❌ ملغي</option>
              </select>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">التاريخ:</span>
              <span class="text-xs">{{
                formatDateTime(order.order_date)
              }}</span>
            </div>
            <div class="mt-2">
              <details class="text-xs">
                <summary class="cursor-pointer text-gray-500">
                  المنتجات ({{ getOrderItems(order).length || 0 }})
                </summary>
                <div class="mt-2 space-y-1 pr-2">
                  <div
                    v-for="(item, idx) in getOrderItems(order)"
                    :key="idx"
                    class="border-b last:border-0 py-1 flex justify-between items-center"
                  >
                    <span>{{ item.name }} (x{{ item.quantity }})</span>
                    <!-- ✅ حالة التوفر لكل منتج في الموبايل -->
                    <span v-if="item.product_id" class="text-xs">
                      <span
                        v-if="getProductStock(item.product_id) === null"
                        class="text-gray-400"
                        >⏳</span
                      >
                      <span
                        v-else-if="getProductStock(item.product_id) === 0"
                        class="text-red-500"
                        >❌</span
                      >
                      <span
                        v-else-if="getProductStock(item.product_id) < 10"
                        class="text-yellow-500"
                        >⚠️</span
                      >
                      <span v-else class="text-green-500">✅</span>
                    </span>
                  </div>
                </div>
              </details>
            </div>
          </div>
        </div>
        <div
          v-if="filteredOrders.length === 0"
          class="text-center py-12 text-gray-400"
        >
          لا توجد طلبات
        </div>
      </div>

      <!-- Desktop Table View -->
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full min-w-[900px]">
          <thead class="bg-gray-100">
            <tr>
              <th class="p-3 text-right text-sm">نوع البيع</th>
              <th class="p-3 text-right text-sm">رقم الطلب</th>
              <th class="p-3 text-right text-sm">العميل</th>
              <th class="p-3 text-right text-sm hidden lg:table-cell">الهاتف</th>
              <th class="p-3 text-right text-sm">المنتجات</th>
              <th class="p-3 text-right text-sm">التوفر</th>
              <th class="p-3 text-right text-sm">الإجمالي</th>
              <th class="p-3 text-right text-sm hidden sm:table-cell">الحالة</th>
              <th class="p-3 text-right text-sm hidden xl:table-cell">
                التاريخ
              </th>
              <th class="p-3 text-right text-sm">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="order in filteredOrders"
              :key="order.id"
              class="border-t hover:bg-gray-50"
            >
              <td class="p-3">
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
              <td class="p-3 text-xs font-mono">
                {{ order.id.slice(0, 8) }}...
              </td>
              <td class="p-3 text-sm font-medium max-w-[150px] truncate">
                {{ order.customer_name || "زائر" }}
              </td>
              <td class="p-3 dir-ltr text-xs hidden lg:table-cell">
                {{ order.customer_phone || "-" }}
              </td>
              <td class="p-3">
                <div class="text-xs max-w-[200px]">
                  <div
                    v-for="(item, idx) in getOrderItems(order).slice(0, 2)"
                    :key="idx"
                    class="py-0.5"
                  >
                    {{ item.name }} (x{{ item.quantity }})
                  </div>
                  <div
                    v-if="getOrderItems(order).length > 2"
                    class="text-gray-400 text-xs"
                  >
                    +{{ getOrderItems(order).length - 2 }} منتجات
                  </div>
                </div>
              </td>
              <!-- ✅ عمود التوفر -->
              <td class="p-3">
                <div class="flex flex-col gap-1 text-xs">
                  <div
                    v-for="item in getOrderItems(order).slice(0, 3)"
                    :key="item.id"
                    class="flex items-center gap-1"
                  >
                    <span v-if="item.product_id">
                      <span
                        v-if="getProductStock(item.product_id) === null"
                        class="text-gray-400"
                        >⏳ جاري التحميل</span
                      >
                      <span
                        v-else-if="getProductStock(item.product_id) === 0"
                        class="text-red-500 font-bold"
                        >❌ غير متوفر</span
                      >
                      <span
                        v-else-if="getProductStock(item.product_id) < 10"
                        class="text-yellow-500 font-bold"
                        >⚠️ {{ getProductStock(item.product_id) }} قطعة</span
                      >
                      <span v-else class="text-green-500 font-bold"
                        >✅ {{ getProductStock(item.product_id) }} قطعة</span
                      >
                    </span>
                    <span v-else class="text-gray-400">-</span>
                  </div>
                  <div
                    v-if="getOrderItems(order).length > 3"
                    class="text-gray-400 text-[10px]"
                  >
                    +{{ getOrderItems(order).length - 3 }} منتجات أخرى
                  </div>
                </div>
              </td>
              <td
                class="p-3 font-bold text-green-600 text-sm whitespace-nowrap"
              >
                {{ formatNumber(order.total_price) }} ج
              </td>
              <td class="p-3 hidden sm:table-cell">
                <select
                  v-if="userStore?.canEdit"
                  :value="order.status"
                  @change="updateStatus(order.id, $event.target.value)"
                  class="px-2 py-1 rounded-full text-xs border cursor-pointer"
                  :class="getStatusClass(order.status)"
                >
                  <option value="pending">⏳ قيد الانتظار</option>
                  <option value="processing">🔄 قيد التجهيز</option>
                  <option value="shipped">🚚 تم الشحن</option>
                  <option value="delivered">✅ تم التسليم</option>
                  <option value="cancelled">❌ ملغي</option>
                </select>
              </td>
              <td class="p-3 text-xs hidden xl:table-cell whitespace-nowrap">
                {{ formatDateTime(order.order_date) }}
              </td>
              <td class="p-3">
                <div class="flex gap-2">
                  <button
                    @click="printInvoice(order)"
                    class="text-blue-500 hover:text-blue-700"
                    title="طباعة"
                  >
                    🖨️
                  </button>
                  <button
                    v-if="userStore?.canEdit"
                    @click="deleteOrder(order.id)"
                    class="text-red-500 hover:text-red-700"
                    title="حذف"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredOrders.length === 0">
              <td colspan="10" class="text-center py-12 text-gray-400">
                لا توجد طلبات
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- إحصائيات سريعة -->
    <div
      class="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3 md:gap-4 mt-6"
    >
      <div
        v-for="status in statuses"
        :key="status.value"
        class="bg-white p-2 sm:p-3 rounded-xl shadow text-center"
      >
        <p class="text-xs sm:text-sm text-gray-500 truncate">
          {{ status.name.replace(/[⏳🔄🚚✅❌]/g, "").trim() }}
        </p>
        <p class="text-lg sm:text-xl font-bold" :class="status.color">
          {{ getStatusCount(status.value) }}
        </p>
      </div>
    </div>

    <!-- إحصائيات حسب نوع البيع -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
      <div class="bg-blue-50 p-3 sm:p-4 rounded-2xl shadow text-center">
        <p class="text-xs sm:text-sm text-blue-600">🖥️ طلبات الموقع</p>
        <p class="text-xl sm:text-2xl font-bold text-blue-700">
          {{ getSaleTypeCount("online") }}
        </p>
        <p class="text-xs text-gray-500">
          إجمالي: {{ formatNumber(getSaleTypeTotal("online")) }} ج
        </p>
      </div>
      <div class="bg-purple-50 p-3 sm:p-4 rounded-2xl shadow text-center">
        <p class="text-xs sm:text-sm text-purple-600">🏪 طلبات المعرض</p>
        <p class="text-xl sm:text-2xl font-bold text-purple-700">
          {{ getSaleTypeCount("offline") }}
        </p>
        <p class="text-xs text-gray-500">
          إجمالي: {{ formatNumber(getSaleTypeTotal("offline")) }} ج
        </p>
      </div>
    </div>

    <!-- Modal عرض الفاتورة -->
    <div
      v-if="showInvoiceModal"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      @click.self="showInvoiceModal = false"
    >
      <div
        class="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div class="p-4 sm:p-6" id="invoiceContent">
          <div class="text-center border-b pb-4 mb-4">
            <h2 class="text-xl sm:text-2xl font-bold">
              معرض الأجهزة الكهربائية
            </h2>
            <p class="text-sm text-gray-500">
              فاتورة بيع رقم: {{ currentInvoice?.id?.slice(0, 8) }}
            </p>
            <p class="text-xs sm:text-sm mt-1">
              <span
                :class="
                  currentInvoice?.sale_type === 'online'
                    ? 'text-blue-600'
                    : 'text-purple-600'
                "
              >
                {{
                  currentInvoice?.sale_type === "online"
                    ? "🖥️ طلب عبر الموقع"
                    : "🏪 بيع من المعرض"
                }}
              </span>
            </p>
          </div>

          <div class="mb-4 space-y-1 text-sm sm:text-base">
            <p><strong>العميل:</strong> {{ currentInvoice?.customer_name }}</p>
            <p><strong>الهاتف:</strong> {{ currentInvoice?.customer_phone }}</p>
            <p>
              <strong>العنوان:</strong>
              {{ currentInvoice?.customer_address || "-" }}
            </p>
            <p v-if="currentInvoice?.cashier_name">
              <strong>البائع:</strong> {{ currentInvoice?.cashier_name }}
            </p>
          </div>

          <div class="overflow-x-auto mb-4">
            <table class="w-full border text-sm sm:text-base">
              <thead class="bg-gray-100">
                <tr>
                  <th class="p-2 text-right">المنتج</th>
                  <th class="p-2 text-right">الكمية</th>
                  <th class="p-2 text-right">السعر</th>
                  <th class="p-2 text-right">الإجمالي</th>
                  <th class="p-2 text-right">التوفر</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, idx) in getOrderItems(currentInvoice)"
                  :key="idx"
                  class="border-t"
                >
                  <td class="p-2">{{ item.name }}</td>
                  <td class="p-2 whitespace-nowrap">{{ item.quantity }}</td>
                  <td class="p-2 whitespace-nowrap">
                    {{ formatNumber(item.price) }} ج
                  </td>
                  <td class="p-2 whitespace-nowrap">
                    {{ formatNumber(item.price * item.quantity) }} ج
                  </td>
                  <td class="p-2 whitespace-nowrap">
                    <span v-if="item.product_id">
                      <span
                        v-if="getProductStock(item.product_id) === null"
                        class="text-gray-400"
                        >⏳</span
                      >
                      <span
                        v-else-if="getProductStock(item.product_id) === 0"
                        class="text-red-500 font-bold"
                        >❌ غير متوفر</span
                      >
                      <span
                        v-else-if="getProductStock(item.product_id) < 10"
                        class="text-yellow-500 font-bold"
                        >⚠️ {{ getProductStock(item.product_id) }}</span
                      >
                      <span v-else class="text-green-500 font-bold"
                        >✅ {{ getProductStock(item.product_id) }}</span
                      >
                    </span>
                    <span v-else class="text-gray-400">-</span>
                  </td>
                </tr>
              </tbody>
              <tfoot class="bg-gray-50">
                <tr>
                  <td colspan="3" class="p-2 font-bold text-right">الإجمالي</td>
                  <td class="p-2 font-bold text-green-600 whitespace-nowrap">
                    {{ formatNumber(currentInvoice?.total_price) }} ج
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div
            class="text-center text-gray-400 text-xs sm:text-sm pt-4 border-t"
          >
            <p>شكراً لتسوقكم معنا</p>
            <p>{{ new Date().toLocaleDateString("ar-EG") }}</p>
          </div>
        </div>

        <div class="p-4 sm:p-6 border-t flex flex-col sm:flex-row gap-3">
          <button
            @click="printCurrentInvoice"
            class="flex-1 bg-blue-600 text-white py-2.5 sm:py-3 rounded-xl hover:bg-blue-700 text-sm sm:text-base"
          >
            🖨️ طباعة
          </button>
          <button
            @click="showInvoiceModal = false"
            class="flex-1 bg-gray-200 py-2.5 sm:py-3 rounded-xl hover:bg-gray-300 text-sm sm:text-base"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: "dashboard" });

const supabase = useSupabaseClient();
const userStore = useUserStore();
const orders = ref([]);
const products = ref([]); // ✅ لإضافة المنتجات وحالة التوفر
const filterStatus = ref("all");
const filterSaleType = ref("all");
const showInvoiceModal = ref(false);
const currentInvoice = ref(null);

const statuses = [
  { name: "الكل", value: "all", color: "text-gray-600" },
  { name: "⏳ قيد الانتظار", value: "pending", color: "text-yellow-600" },
  { name: "🔄 قيد التجهيز", value: "processing", color: "text-blue-600" },
  { name: "🚚 تم الشحن", value: "shipped", color: "text-purple-600" },
  { name: "✅ تم التسليم", value: "delivered", color: "text-green-600" },
  { name: "❌ ملغي", value: "cancelled", color: "text-red-600" },
];

const saleTypes = [
  { name: "🖥️ الكل", value: "all" },
  { name: "🖥️ من الموقع", value: "online" },
  { name: "🏪 من المعرض", value: "offline" },
];

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

const getStatusCount = (status) => {
  if (status === "all") return orders.value.length;
  return orders.value.filter((o) => o.status === status).length;
};

const getSaleTypeCount = (type) => {
  return orders.value.filter((o) => o.sale_type === type).length;
};

const getSaleTypeTotal = (type) => {
  return orders.value
    .filter((o) => o.sale_type === type)
    .reduce((sum, o) => sum + (o.total_price || 0), 0);
};

const formatNumber = (num) => {
  if (!num && num !== 0) return "0";
  return num.toLocaleString("ar-EG");
};

const formatDateTime = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleString("ar-EG");
};

// ✅ دالة لجلب items من الطلب
const getOrderItems = (order) => {
  if (!order) return [];
  if (Array.isArray(order.items)) return order.items;
  if (typeof order.items === "string") {
    try {
      return JSON.parse(order.items);
    } catch (e) {
      console.error("❌ خطأ في تحويل items:", e);
      return [];
    }
  }
  return [];
};

// ✅ دالة جلب المخزون الحالي لمنتج (مع التعامل مع الأخطاء)
const getProductStock = (productId) => {
  if (!productId) return null;

  // البحث عن المنتج في قائمة المنتجات المحملة
  const product = products.value.find((p) => p.id === productId);

  // ✅ لو المنتج مش موجود، نرجع null عشان نعرض "منتج محذوف"
  if (!product) return null;

  return product.stock;
};

// ✅ تحميل المنتجات (لحالة التوفر)
const loadProducts = async () => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("id, stock, name");

    if (error) {
      console.error("❌ خطأ في تحميل المنتجات:", error);
      return;
    }

    products.value = data || [];
    console.log("📦 تم تحميل المنتجات:", products.value.length);
  } catch (error) {
    console.error("❌ خطأ في تحميل المنتجات:", error);
  }
};

// ✅ تحميل الطلبات من الجدولين
const loadOrders = async () => {
  try {
    // ✅ 1. جلب الطلبات من orders (طلبات المعرض)
    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .order("order_date", { ascending: false });

    if (ordersError) {
      console.error("❌ خطأ في جلب طلبات المعرض:", ordersError);
    }

    // ✅ 2. جلب الطلبات من customer_orders (طلبات الموقع)
    const { data: customerOrdersData, error: customerOrdersError } =
      await supabase
        .from("customer_orders")
        .select("*")
        .order("order_date", { ascending: false });

    if (customerOrdersError) {
      console.error("❌ خطأ في جلب طلبات الموقع:", customerOrdersError);
    }

    // ✅ 3. دمج الطلبات
    const allOrders = [];

    // إضافة طلبات المعرض
    if (ordersData) {
      allOrders.push(...ordersData);
    }

    // إضافة طلبات الموقع
    if (customerOrdersData) {
      allOrders.push(...customerOrdersData);
    }

    // ✅ 4. ترتيب الطلبات حسب التاريخ (الأحدث أولاً)
    allOrders.sort((a, b) => {
      return new Date(b.order_date) - new Date(a.order_date);
    });

    orders.value = allOrders.map((order) => ({
      ...order,
      items: getOrderItems(order),
    }));

    console.log(
      `📦 تم تحميل ${orders.value.length} طلب (${ordersData?.length || 0} من المعرض + ${customerOrdersData?.length || 0} من الموقع)`,
    );
  } catch (error) {
    console.error("❌ خطأ:", error);
    alert("❌ حدث خطأ: " + error.message);
  }
};

// ✅ تأكد من الفلتر
const filteredOrders = computed(() => {
  let result = orders.value;

  if (filterStatus.value !== "all") {
    result = result.filter((o) => o.status === filterStatus.value);
  }

  if (filterSaleType.value !== "all") {
    result = result.filter((o) => o.sale_type === filterSaleType.value);
  }

  return result;
});

// ✅ دالة لإعادة المنتجات للمخزون
const restoreProductsToStock = async (order) => {
  const items = getOrderItems(order);

  if (!items || items.length === 0) {
    console.log("⚠️ لا توجد منتجات في هذا الطلب");
    return;
  }

  console.log(`🔄 جاري إعادة ${items.length} منتج للمخزون للطلب:`, order.id);

  let successCount = 0;
  let errorCount = 0;
  let deletedCount = 0;

  for (const item of items) {
    try {
      const productId = item.product_id || item.id;
      if (!productId) {
        console.warn(`⚠️ لا يوجد product_id للمنتج:`, item);
        errorCount++;
        continue;
      }

      // ✅ استخدم maybeSingle بدلاً من single
      const { data: product, error: fetchError } = await supabase
        .from("products")
        .select("stock, name")
        .eq("id", productId)
        .maybeSingle();

      if (fetchError) {
        console.error(`❌ خطأ في جلب المنتج ${productId}:`, fetchError);
        errorCount++;
        continue;
      }

      if (!product) {
        console.warn(`⚠️ المنتج ${productId} غير موجود في قاعدة البيانات (تم حذفه سابقاً)`);
        deletedCount++;
        continue;
      }

      const currentStock = product.stock || 0;
      const quantityToAdd = item.quantity || 0;
      const newStock = currentStock + quantityToAdd;

      const { error: updateError } = await supabase
        .from("products")
        .update({ stock: newStock, updated_at: new Date().toISOString() })
        .eq("id", productId);

      if (updateError) {
        console.error(`❌ خطأ في تحديث المخزون للمنتج ${productId}:`, updateError);
        errorCount++;
      } else {
        console.log(
          `✅ تم إعادة ${quantityToAdd} قطعة من "${product.name}" (المخزون: ${currentStock} → ${newStock})`,
        );
        successCount++;
      }
    } catch (error) {
      console.error(`❌ خطأ في معالجة المنتج:`, error);
      errorCount++;
    }
  }

  console.log(`📊 نتيجة إعادة المخزون: ${successCount} نجح, ${errorCount} فشل, ${deletedCount} منتج محذوف`);
  return { successCount, errorCount, deletedCount };
};

// ✅ تحديث حالة الطلب (مع دعم الجدولين)
const updateStatus = async (orderId, newStatus) => {
  if (!userStore?.canEdit) {
    alert("⚠️ ليس لديك صلاحية لتغيير حالة الطلب");
    return;
  }

  try {
    // ✅ 1. البحث عن الطلب في orders
    let { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .maybeSingle(); // ✅ استخدم maybeSingle بدلاً من single

    let tableName = "orders";

    // ✅ 2. لو مش موجود في orders، جرب customer_orders
    if (!order) {
      const { data: customerOrder, error: customerError } = await supabase
        .from("customer_orders")
        .select("*")
        .eq("id", orderId)
        .maybeSingle();

      if (customerError) {
        console.error("❌ خطأ في جلب الطلب من customer_orders:", customerError);
      }

      if (customerOrder) {
        order = customerOrder;
        tableName = "customer_orders";
      }
    }

    if (fetchError) {
      console.error("❌ خطأ في جلب الطلب:", fetchError);
    }

    if (!order) {
      alert("❌ الطلب غير موجود");
      return;
    }

    const oldStatus = order.status;
    const items = getOrderItems(order);

    // ✅ تحديد إذا كان يجب إعادة المخزون
    const shouldRestoreStock =
      newStatus === "cancelled" &&
      ["pending", "processing", "shipped", "delivered"].includes(oldStatus);

    if (shouldRestoreStock && items.length > 0) {
      console.log(
        `🔄 تغيير الحالة من "${oldStatus}" إلى "ملغي" - جاري إعادة المخزون...`,
      );
      await restoreProductsToStock(order);
    }

    // ✅ تحديث الحالة في الجدول المناسب
    const { error: updateError } = await supabase
      .from(tableName)
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateError) {
      alert("❌ خطأ في تحديث الحالة: " + updateError.message);
      return;
    }

    await loadOrders();

    const statusMessages = {
      pending: "⏳ قيد الانتظار",
      processing: "🔄 قيد التجهيز",
      shipped: "🚚 تم الشحن",
      delivered: "✅ تم التسليم",
      cancelled: "❌ ملغي",
    };

    const message = `✅ تم تحديث الحالة إلى: ${statusMessages[newStatus] || newStatus}`;
    alert(message);
  } catch (error) {
    console.error("❌ خطأ في تحديث الحالة:", error);
    alert("❌ حدث خطأ: " + error.message);
  }
};

// ✅ حذف الطلب (مع دعم الجدولين)
const deleteOrder = async (orderId) => {
  if (!userStore?.canEdit) {
    alert("⚠️ ليس لديك صلاحية لحذف الطلبات");
    return;
  }

  if (
    !confirm(
      "⚠️ هل أنت متأكد من حذف هذا الطلب؟\nسيتم إعادة المنتجات للمخزون تلقائياً.",
    )
  ) {
    return;
  }

  try {
    // ✅ 1. البحث عن الطلب في orders
    let { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .maybeSingle();

    let tableName = "orders";

    // ✅ 2. لو مش موجود في orders، جرب customer_orders
    if (!order) {
      const { data: customerOrder, error: customerError } = await supabase
        .from("customer_orders")
        .select("*")
        .eq("id", orderId)
        .maybeSingle();

      if (customerError) {
        console.error("❌ خطأ في جلب الطلب من customer_orders:", customerError);
      }

      if (customerOrder) {
        order = customerOrder;
        tableName = "customer_orders";
      }
    }

    if (fetchError) {
      console.error("❌ خطأ في جلب الطلب:", fetchError);
    }

    if (!order) {
      alert("❌ الطلب غير موجود");
      return;
    }

    const items = getOrderItems(order);

    if (items.length > 0) {
      console.log(`🔄 جاري إعادة ${items.length} منتج للمخزون قبل الحذف...`);
      await restoreProductsToStock(order);
    }

    // ✅ حذف الطلب من الجدول المناسب
    const { error: deleteError } = await supabase
      .from(tableName)
      .delete()
      .eq("id", orderId);

    if (deleteError) {
      alert("❌ خطأ في حذف الطلب: " + deleteError.message);
      return;
    }

    await loadOrders();
    alert("✅ تم حذف الطلب وإعادة المنتجات للمخزون");
  } catch (error) {
    console.error("❌ خطأ في حذف الطلب:", error);
    alert("❌ حدث خطأ: " + error.message);
  }
};

// ✅ دالة طباعة الفاتورة
const printInvoice = (order) => {
  currentInvoice.value = order;
  showInvoiceModal.value = true;
};

const printCurrentInvoice = () => {
  const printContent = document.getElementById("invoiceContent").innerHTML;
  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <html dir="rtl">
      <head>
        <title>فاتورة بيع</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; margin: 0; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
          th { background: #f3f4f6; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>${printContent}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
};

onMounted(async () => {
  await loadProducts();
  await loadOrders();
});
</script>

<style scoped>
details > summary {
  list-style: none;
}
details > summary::-webkit-details-marker {
  display: none;
}

.dir-ltr {
  direction: ltr;
  text-align: left;
}
</style>
