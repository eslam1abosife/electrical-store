<template>
  <div class="p-4" dir="rtl">
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"
    >
      <div>
        <h1 class="text-2xl font-bold">📩 طلبات المنتجات غير المتوفرة</h1>
        <p class="text-gray-500">طلبات العملاء للمنتجات التي نفذت من المخزون</p>
      </div>
      <div class="flex gap-2 flex-wrap">
        <NuxtLink
          to="/dashboard/products/out-of-stock"
          class="bg-orange-600 text-white px-4 py-2 rounded-xl hover:bg-orange-700 transition text-sm"
        >
          ⬅️ العودة للمنتجات غير المتوفرة
        </NuxtLink>
        <NuxtLink
          to="/dashboard/purchases"
          class="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition text-sm"
        >
          📥 الذهاب للمشتريات
        </NuxtLink>
      </div>
    </div>

    <!-- إحصائيات سريعة -->
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
      <div
        class="bg-yellow-50 p-3 sm:p-4 rounded-2xl shadow text-center border border-yellow-200"
      >
        <p class="text-xs sm:text-sm text-yellow-600">⏳ قيد الانتظار</p>
        <p class="text-2xl sm:text-3xl font-bold text-yellow-700">
          {{ getStatusCount("pending") }}
        </p>
      </div>
      <div
        class="bg-blue-50 p-3 sm:p-4 rounded-2xl shadow text-center border border-blue-200"
      >
        <p class="text-xs sm:text-sm text-blue-600">🔄 قيد التجهيز</p>
        <p class="text-2xl sm:text-3xl font-bold text-blue-700">
          {{ getStatusCount("processing") }}
        </p>
      </div>
      <div
        class="bg-green-50 p-3 sm:p-4 rounded-2xl shadow text-center border border-green-200"
      >
        <p class="text-xs sm:text-sm text-green-600">✅ تم التوفير</p>
        <p class="text-2xl sm:text-3xl font-bold text-green-700">
          {{ getStatusCount("completed") }}
        </p>
      </div>
      <div
        class="bg-purple-50 p-3 sm:p-4 rounded-2xl shadow text-center border border-purple-200"
      >
        <p class="text-xs sm:text-sm text-purple-600">📦 إجمالي الطلبات</p>
        <p class="text-2xl sm:text-3xl font-bold text-purple-700">
          {{ requests.length }}
        </p>
      </div>
    </div>

    <!-- فلتر الحالة -->
    <div class="flex gap-2 flex-wrap mb-4">
      <button
        v-for="status in requestStatuses"
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

    <!-- جدول الطلبات -->
    <div class="bg-white rounded-2xl shadow overflow-hidden">
      <!-- Mobile Cards View -->
      <div class="block md:hidden divide-y">
        <div
          v-for="(req, idx) in filteredRequests"
          :key="req.id"
          class="p-4 hover:bg-gray-50"
        >
          <div class="flex justify-between items-start mb-2">
            <span class="font-bold text-sm">{{ req.product_name }}</span>
            <span
              class="px-2 py-0.5 rounded-full text-xs"
              :class="{
                'bg-yellow-100 text-yellow-700': req.status === 'pending',
                'bg-blue-100 text-blue-700': req.status === 'processing',
                'bg-green-100 text-green-700': req.status === 'completed',
                'bg-red-100 text-red-700': req.status === 'cancelled',
              }"
            >
              {{ getStatusText(req.status) }}
            </span>
          </div>
          <div class="space-y-1 text-sm">
            <div>
              <span class="text-gray-500">العميل:</span> {{ req.customer_name }}
            </div>
            <div>
              <span class="text-gray-500">📱 الهاتف:</span>
              <span class="dir-ltr font-medium text-blue-600">{{
                req.customer_phone || "غير متوفر"
              }}</span>
            </div>
            <div>
              <span class="text-gray-500">📧 البريد:</span>
              {{ req.customer_email }}
            </div>
            <div>
              <span class="text-gray-500">📅 التاريخ:</span>
              {{ formatDate(req.request_date) }}
            </div>
          </div>
          <div class="mt-3">
            <select
              v-model="req.status"
              @change="updateRequestStatus(req.id, req.status)"
              class="w-full px-3 py-2 border rounded-xl text-sm"
              :class="getStatusClass(req.status)"
            >
              <option value="pending">⏳ قيد الانتظار</option>
              <option value="processing">🔄 قيد التجهيز</option>
              <option value="completed">✅ تم التوفير</option>
              <option value="cancelled">❌ ملغي</option>
            </select>
          </div>
          <div class="mt-2 flex gap-2">
            <button
              v-if="req.status === 'pending' || req.status === 'processing'"
              @click="goToPurchase(req)"
              class="flex-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-blue-700"
            >
              📥 شراء المنتج
            </button>
            <button
              v-if="req.status === 'completed'"
              @click="markAsDelivered(req.id)"
              class="flex-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-green-700"
            >
              ✅ تأكيد التسليم
            </button>
          </div>
        </div>
        <div
          v-if="filteredRequests.length === 0"
          class="text-center py-12 text-gray-400"
        >
          لا توجد طلبات
        </div>
      </div>

      <!-- Desktop Table View -->
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full min-w-[1000px]">
          <thead class="bg-gray-100">
            <tr>
              <th class="p-3 text-right text-sm">#</th>
              <th class="p-3 text-right text-sm">المنتج</th>
              <th class="p-3 text-right text-sm">العميل</th>
              <th class="p-3 text-right text-sm">📱 الهاتف</th>
             
              <th class="p-3 text-right text-sm hidden sm:table-cell">
                التاريخ
              </th>
              <th class="p-3 text-right text-sm">الحالة</th>
              <th class="p-3 text-right text-sm">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(req, idx) in filteredRequests"
              :key="req.id"
              class="border-t hover:bg-gray-50 transition"
            >
              <td class="p-3 text-sm">{{ idx + 1 }}</td>
              <td class="p-3 font-medium text-sm">{{ req.product_name }}</td>
              <td class="p-3 text-sm">{{ req.customer_name }}</td>
              <td class="p-3 text-sm dir-ltr font-medium text-blue-600">
                <a :href="`tel:${req.customer_phone}`" class="hover:underline">
                  {{ req.customer_phone || "غير متوفر" }}
                </a>
              </td>
             
              <td class="p-3 text-sm hidden sm:table-cell">
                {{ formatDate(req.request_date) }}
              </td>
              <td class="p-3">
                <span
                  class="px-2 py-1 rounded-full text-xs whitespace-nowrap"
                  :class="{
                    'bg-yellow-100 text-yellow-700': req.status === 'pending',
                    'bg-blue-100 text-blue-700': req.status === 'processing',
                    'bg-green-100 text-green-700': req.status === 'completed',
                    'bg-red-100 text-red-700': req.status === 'cancelled',
                  }"
                >
                  {{ getStatusText(req.status) }}
                </span>
              </td>
              <td class="p-3">
                <div class="flex flex-wrap gap-2">
                  <!-- ✅ تغيير الحالة -->
                  <select
                    v-model="req.status"
                    @change="updateRequestStatus(req.id, req.status)"
                    class="px-2 py-1 border rounded-lg text-xs"
                    :class="getStatusClass(req.status)"
                  >
                    <option value="pending">⏳ قيد الانتظار</option>
                    <option value="processing">🔄 قيد التجهيز</option>
                    <option value="completed">✅ تم التوفير</option>
                    <option value="cancelled">❌ ملغي</option>
                  </select>

                  <!-- ✅ زر شراء المنتج (للحالات pending و processing) -->
                  <button
                    v-if="
                      req.status === 'pending' || req.status === 'processing'
                    "
                    @click="goToPurchase(req)"
                    class="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-blue-700 transition whitespace-nowrap"
                    title="اذهب لصفحة المشتريات لشراء المنتج"
                  >
                    📥 شراء
                  </button>

                  <!-- ✅ زر تأكيد التسليم (للحالة completed) -->
                  <button
                    v-if="req.status === 'completed'"
                    @click="markAsDelivered(req.id)"
                    class="bg-green-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-green-700 transition whitespace-nowrap"
                  >
                    ✅ تسليم
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredRequests.length === 0">
              <td colspan="8" class="text-center py-12 text-gray-400">
                <div class="text-4xl mb-2">📭</div>
                <p>لا توجد طلبات</p>
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

const toast = ref({ show: false, message: "", type: "success", icon: "✅" });

const showToast = (message, type = "success") => {
  const icons = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" };
  toast.value = { show: true, message, type, icon: icons[type] || "✅" };
  setTimeout(() => {
    toast.value.show = false;
  }, 3000);
};

const requests = ref([]);
const filterStatus = ref("all");

const requestStatuses = [
  { name: "الكل", value: "all" },
  { name: "⏳ قيد الانتظار", value: "pending" },
  { name: "🔄 قيد التجهيز", value: "processing" },
  { name: "✅ تم التوفير", value: "completed" },
  { name: "❌ ملغي", value: "cancelled" },
];

const getStatusText = (status) => {
  const texts = {
    pending: "⏳ قيد الانتظار",
    processing: "🔄 قيد التجهيز",
    completed: "✅ تم التوفير",
    cancelled: "❌ ملغي",
  };
  return texts[status] || status;
};

const getStatusClass = (status) => {
  const classes = {
    pending: "bg-yellow-100 text-yellow-700",
    processing: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };
  return classes[status] || "bg-gray-100";
};

const getStatusCount = (status) => {
  return requests.value.filter((r) => r.status === status).length;
};

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Load product requests
const loadRequests = async () => {
  try {
    const { data, error } = await supabase
      .from("product_requests")
      .select("*")
      .order("request_date", { ascending: false });

    if (error) {
      console.error("❌ خطأ في جلب الطلبات:", error);
      showToast("❌ خطأ في جلب الطلبات", "error");
      return;
    }

    requests.value = data || [];
  } catch (error) {
    console.error("❌ خطأ:", error);
    showToast("❌ حدث خطأ", "error");
  }
};

// Filtered requests
const filteredRequests = computed(() => {
  if (filterStatus.value === "all") return requests.value;
  return requests.value.filter((r) => r.status === filterStatus.value);
});

// ✅ تحديث حالة الطلب
const updateRequestStatus = async (id, newStatus) => {
  try {
    const { error } = await supabase
      .from("product_requests")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      showToast("❌ خطأ في تحديث الحالة: " + error.message, "error");
      return;
    }

    showToast("✅ تم تحديث الحالة", "success");
    await loadRequests();
  } catch (error) {
    console.error("❌ خطأ:", error);
    showToast("❌ حدث خطأ", "error");
  }
};

// ✅ الانتقال لصفحة المشتريات مع تجهيز البيانات
const goToPurchase = (request) => {
  // حفظ بيانات الطلب في localStorage عشان نستخدمها في صفحة المشتريات
  localStorage.setItem(
    "pending_request",
    JSON.stringify({
      id: request.id,
      product_id: request.product_id,
      product_name: request.product_name,
      customer_name: request.customer_name,
      customer_phone: request.customer_phone,
      customer_email: request.customer_email,
    }),
  );

  showToast(`🔄 جاري التوجيه لشراء المنتج: ${request.product_name}`, "info");

  // التوجيه لصفحة المشتريات مع بارامتر
  navigateTo(
    `/dashboard/purchases?request_id=${request.id}&product=${request.product_id}`,
  );
};

// ✅ تأكيد تسليم المنتج للعميل
const markAsDelivered = async (id) => {
  if (!confirm("✅ هل أنت متأكد من تسليم المنتج للعميل؟")) return;

  try {
    const { error } = await supabase
      .from("product_requests")
      .update({
        status: "delivered",
        delivered_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      showToast("❌ خطأ: " + error.message, "error");
      return;
    }

    showToast("✅ تم تأكيد تسليم المنتج للعميل", "success");
    await loadRequests();
  } catch (error) {
    console.error("❌ خطأ:", error);
    showToast("❌ حدث خطأ", "error");
  }
};

onMounted(() => {
  loadRequests();
});
</script>

<style scoped>
.dir-ltr {
  direction: ltr;
  text-align: left;
}

select {
  cursor: pointer;
}

/* تحسينات الموبايل */
@media (max-width: 640px) {
  select,
  button {
    font-size: 16px !important;
  }
}
</style>
