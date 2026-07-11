<template>
  <div dir="rtl" class="min-h-screen bg-gray-50">
    <HeaderComponent v-model:searchQuery="searchQuery" />

    <div class="container mx-auto px-4 py-8 sm:py-12">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">📋 طلباتي</h1>
          <p class="text-sm text-gray-500 mt-1">عرض جميع طلباتك السابقة</p>
        </div>
        <NuxtLink
          to="/"
          class="text-blue-600 hover:text-blue-700 flex items-center gap-2 text-sm"
        >
          ← العودة للتسوق
        </NuxtLink>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="space-y-4">
        <div v-for="n in 3" :key="n" class="bg-white rounded-2xl shadow p-6 animate-pulse">
          <div class="flex flex-wrap justify-between gap-4">
            <div class="space-y-2">
              <div class="h-4 bg-gray-200 rounded w-32"></div>
              <div class="h-3 bg-gray-200 rounded w-24"></div>
            </div>
            <div class="h-6 bg-gray-200 rounded-full w-20"></div>
          </div>
          <div class="mt-4 flex gap-4">
            <div class="h-16 w-16 bg-gray-200 rounded"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-gray-200 rounded w-3/4"></div>
              <div class="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Orders List -->
      <div v-else-if="orders.length > 0" class="space-y-4 sm:space-y-6">
        <div
          v-for="order in orders"
          :key="order.id"
          class="bg-white rounded-2xl shadow overflow-hidden hover:shadow-lg transition"
        >
          <!-- Order Header -->
          <div class="flex flex-wrap justify-between items-center p-4 sm:p-6 bg-gray-50 border-b">
            <div class="flex flex-wrap items-center gap-3 sm:gap-6 text-sm">
              <span class="text-gray-500">
                رقم الطلب: 
                <span class="font-mono font-medium text-gray-800">{{ order.id.slice(0, 8) }}...</span>
              </span>
              <span class="text-gray-500">
                التاريخ: 
                <span class="font-medium text-gray-800">{{ formatDate(order.order_date) }}</span>
              </span>
              <span class="text-gray-500">
                الإجمالي: 
                <span class="font-bold text-green-600">{{ formatPrice(order.total_price) }} ج</span>
              </span>
            </div>
            <div class="flex items-center gap-3">
              <span
                class="px-3 py-1 rounded-full text-xs font-medium"
                :class="getStatusClass(order.status)"
              >
                {{ getStatusText(order.status) }}
              </span>
            </div>
          </div>

          <!-- Order Items -->
          <div class="p-4 sm:p-6">
            <div class="space-y-3">
              <div
                v-for="(item, idx) in getOrderItems(order).slice(0, 3)"
                :key="idx"
                class="flex items-center gap-4 border-b last:border-0 pb-3 last:pb-0"
              >
                <img
                  :src="item.image_url || '/images/placeholder.png'"
                  class="w-16 h-16 object-cover rounded-lg"
                  @error="(e) => e.target.src = '/images/placeholder.png'"
                  :alt="item.name"
                />
                <div class="flex-1">
                  <p class="font-medium text-sm">{{ item.name }}</p>
                  <p class="text-xs text-gray-500">الكمية: {{ item.quantity }}</p>
                  <p class="text-sm font-semibold text-blue-600">{{ formatPrice(item.price) }} ج</p>
                </div>
                <div class="text-right">
                  <span class="text-sm font-bold text-gray-800">{{ formatPrice(item.price * item.quantity) }} ج</span>
                </div>
              </div>

              <!-- Show more button -->
              <div v-if="getOrderItems(order).length > 3" class="text-center pt-2">
                <button
                  @click="toggleShowAll(order.id)"
                  class="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  {{ expandedOrders.includes(order.id) ? 'عرض أقل' : `عرض ${getOrderItems(order).length - 3} منتجات أخرى` }}
                </button>
              </div>

              <!-- All items (expanded) -->
              <div v-if="expandedOrders.includes(order.id)">
                <div
                  v-for="(item, idx) in getOrderItems(order).slice(3)"
                  :key="idx"
                  class="flex items-center gap-4 border-b last:border-0 pb-3 last:pb-0 pt-3"
                >
                  <img
                    :src="item.image_url || '/images/placeholder.png'"
                    class="w-16 h-16 object-cover rounded-lg"
                    @error="(e) => e.target.src = '/images/placeholder.png'"
                    :alt="item.name"
                  />
                  <div class="flex-1">
                    <p class="font-medium text-sm">{{ item.name }}</p>
                    <p class="text-xs text-gray-500">الكمية: {{ item.quantity }}</p>
                    <p class="text-sm font-semibold text-blue-600">{{ formatPrice(item.price) }} ج</p>
                  </div>
                  <div class="text-right">
                    <span class="text-sm font-bold text-gray-800">{{ formatPrice(item.price * item.quantity) }} ج</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Order Footer -->
            <div class="mt-4 pt-4 border-t flex flex-wrap justify-between items-center gap-3">
              <div class="text-sm text-gray-500">
                طريقة الدفع: 
                <span class="font-medium text-gray-700">
                  {{ getPaymentMethod(order.payment_method) }}
                </span>
              </div>
              <div class="flex gap-2">
                <button
                  @click="printInvoice(order)"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
                >
                  🖨️ طباعة الفاتورة
                </button>
                <button
                  v-if="order.status === 'delivered'"
                  @click="reorder(order)"
                  class="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition"
                >
                  🔄 طلب مرة أخرى
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16 sm:py-24 bg-white rounded-2xl shadow">
        <div class="text-6xl mb-4">📭</div>
        <h2 class="text-xl sm:text-2xl font-bold text-gray-700 mb-2">لا توجد طلبات</h2>
        <p class="text-gray-500 mb-6">لم تقم بشراء أي منتجات حتى الآن</p>
        <NuxtLink
          to="/"
          class="bg-blue-600 text-white px-6 sm:px-8 py-3 rounded-xl hover:bg-blue-700 transition inline-block"
        >
          🛒 ابدأ التسوق الآن
        </NuxtLink>
      </div>
    </div>

    <FooterComponent />
    <ToastNotification :toast="toast" @close="toast.show = false" />
  </div>
</template>

<script setup>
import { useCartStore } from "~/stores/cart";
import { useUserStore } from "~/stores/user";

definePageMeta({
  middleware: 'auth',
});

import { supabase } from '~/lib/supabase';
const userStore = useUserStore();
const cartStore = useCartStore();
const router = useRouter();

// State
const orders = ref([]);
const loading = ref(true);
const searchQuery = ref("");
const expandedOrders = ref([]);
const toast = ref({ show: false, message: "", type: "success" });

// دالة لجلب items من الطلب
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

const formatPrice = (price) => {
  return new Intl.NumberFormat('ar-EG').format(price || 0);
};

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getStatusText = (status) => {
  const texts = {
    pending: '⏳ قيد الانتظار',
    processing: '🔄 قيد التجهيز',
    shipped: '🚚 تم الشحن',
    delivered: '✅ تم التسليم',
    cancelled: '❌ ملغي',
  };
  return texts[status] || status;
};

const getStatusClass = (status) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  return classes[status] || 'bg-gray-100 text-gray-700';
};

const getPaymentMethod = (method) => {
  const methods = {
    cash: '💰 كاش',
    card: '💳 بطاقة ائتمان',
    installments: '📅 تقسيط',
  };
  return methods[method] || method;
};

const toggleShowAll = (orderId) => {
  if (expandedOrders.value.includes(orderId)) {
    expandedOrders.value = expandedOrders.value.filter(id => id !== orderId);
  } else {
    expandedOrders.value.push(orderId);
  }
};

// ✅ Load orders from customer_orders table
const loadOrders = async () => {
  if (!userStore.isLoggedIn) {
    router.push('/login');
    return;
  }

  loading.value = true;

  try {
    const { data, error } = await supabase
      .from('customer_orders')
      .select('*')
      .eq('customer_email', userStore.user?.email)
      .order('order_date', { ascending: false });

    if (error) {
      console.error('❌ خطأ في جلب الطلبات:', error);
      showToast('❌ حدث خطأ في جلب الطلبات', 'error');
      return;
    }

    orders.value = (data || []).map((order) => ({
      ...order,
      items: getOrderItems(order),
    }));

  } catch (error) {
    console.error('❌ خطأ:', error);
    showToast('❌ حدث خطأ', 'error');
  } finally {
    loading.value = false;
  }
};

// Print invoice
const printInvoice = (order) => {
  const printWindow = window.open('', '_blank');
  const orderItems = getOrderItems(order);
  
  let itemsHtml = '';
  orderItems.forEach((item, idx) => {
    itemsHtml += `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${idx + 1}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: left;">${formatPrice(item.price)} ج</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: left;">${formatPrice(item.price * item.quantity)} ج</td>
      </tr>
    `;
  });

  printWindow.document.write(`
    <html dir="rtl">
      <head>
        <title>فاتورة طلب رقم ${order.id.slice(0, 8)}</title>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Cairo', sans-serif; padding: 40px; margin: 0; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
          .header h1 { font-size: 24px; margin: 0; }
          .header p { color: #666; margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #f5f5f5; padding: 10px; text-align: right; border-bottom: 2px solid #ddd; }
          td { padding: 8px; border-bottom: 1px solid #ddd; }
          .total { font-size: 20px; font-weight: bold; text-align: left; padding: 15px; border-top: 2px solid #333; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #888; font-size: 12px; }
          .info { margin: 10px 0; }
          .info span { font-weight: bold; }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏪 جولدن</h1>
          <p>للأجهزة الكهربائية والأدوات المنزلية</p>
          <p>طنطا - سبرباي - أمام المدينه الجامعيه</p>
          <p>📞 01034003002</p>
          <p>رقم الفاتورة: #${order.id.slice(0, 8)}</p>
          <p>التاريخ: ${formatDate(order.order_date)}</p>
        </div>

        <div class="info">
          <p><span>العميل:</span> ${order.customer_name}</p>
          <p><span>الهاتف:</span> ${order.customer_phone || 'غير متوفر'}</p>
          <p><span>العنوان:</span> ${order.customer_address || 'غير متوفر'}</p>
          <p><span>طريقة الدفع:</span> ${getPaymentMethod(order.payment_method)}</p>
          <p><span>الحالة:</span> ${getStatusText(order.status)}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>المنتج</th>
              <th>الكمية</th>
              <th>السعر</th>
              <th>الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="total">
          الإجمالي الكلي: ${formatPrice(order.total_price)} ج
        </div>

        <div class="footer">
          <p>✨ شكراً لتسوقكم من جولدن ✨</p>
          <p>ضمان سنة كاملة | توصيل سريع | دفع آمن</p>
        </div>

        <script>
          setTimeout(() => { window.print(); }, 500);
        <\/script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

// Re-order
const reorder = (order) => {
  const items = getOrderItems(order);
  items.forEach((item) => {
    cartStore.addItem({
      id: item.product_id,
      name: item.name,
      price: item.price,
      image_url: item.image_url,
    });
  });
  showToast(`✅ تم إضافة ${items.length} منتج إلى السلة`, 'success');
  router.push('/cart');
};

const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type };
  setTimeout(() => { toast.value.show = false; }, 3000);
};

onMounted(() => {
  loadOrders();
});
</script>