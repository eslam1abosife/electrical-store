<!-- pages/collector-dashboard/index.vue -->
<template>
  <div class="min-h-screen bg-gray-50" dir="rtl">
    <div class="container mx-auto px-4 py-8 sm:py-12">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-4 text-gray-500">جاري تحميل بيانات المحصل...</p>
      </div>

      <!-- Collector Data -->
      <div v-else-if="collector" class="space-y-6">
        <!-- Header -->
        <div class="bg-white rounded-2xl shadow p-6">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div class="flex items-center gap-3">
                <NuxtLink to="/dashboard/collector-fans" class="text-blue-600 hover:text-blue-800 text-sm">
                  ⬅️ العودة
                </NuxtLink>
                <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
                  👤 {{ collector.name }}
                </h1>
              </div>
              <p class="text-sm text-gray-500 mt-1">{{ collector.phone || 'لا يوجد رقم' }}</p>
            </div>
            <div class="flex gap-2">
              <span class="px-3 py-1 rounded-full text-sm font-medium" :class="getStatusClass(collector.status || 'active')">
                {{ collector.status === 'active' ? '✅ نشط' : '⛔ غير نشط' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow p-5 text-white">
            <p class="text-sm opacity-90">📦 إجمالي المراوح</p>
            <p class="text-3xl font-bold mt-1">{{ totalFans }} قطعة</p>
          </div>
          <div class="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow p-5 text-white">
            <p class="text-sm opacity-90">💰 إجمالي المدفوعات</p>
            <p class="text-3xl font-bold mt-1">{{ formatNumber(totalPaid) }} ج</p>
          </div>
          <div class="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow p-5 text-white">
            <p class="text-sm opacity-90">⚠️ المتبقي</p>
            <p class="text-3xl font-bold mt-1">{{ formatNumber(totalRemaining) }} ج</p>
          </div>
          <div class="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl shadow p-5 text-white">
            <p class="text-sm opacity-90">📅 عدد الأقساط</p>
            <p class="text-3xl font-bold mt-1">{{ installments.length }}</p>
          </div>
        </div>

        <!-- تفاصيل المراوح المسلمة -->
        <div class="bg-white rounded-2xl shadow overflow-hidden">
          <div class="bg-gray-50 p-4 border-b">
            <h2 class="text-lg font-bold">📦 المراوح المسلمة</h2>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full min-w-[700px]">
              <thead class="bg-gray-100">
                <tr>
                  <th class="p-3 text-right text-sm">#</th>
                  <th class="p-3 text-right text-sm">التاريخ</th>
                  <th class="p-3 text-right text-sm">🔄 عمود</th>
                  <th class="p-3 text-right text-sm">📌 حائط</th>
                  <th class="p-3 text-right text-sm">🌀 سقف</th>
                  <th class="p-3 text-right text-sm">الإجمالي</th>
                  <th class="p-3 text-right text-sm">المدفوع</th>
                  <th class="p-3 text-right text-sm">المتبقي</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(delivery, index) in deliveries" :key="delivery.id" class="border-t hover:bg-gray-50">
                  <td class="p-3">{{ index + 1 }}</td>
                  <td class="p-3">{{ formatDate(delivery.delivery_date) }}</td>
                  <td class="p-3">{{ delivery.standing_fans_quantity || 0 }}</td>
                  <td class="p-3">{{ delivery.wall_fans_quantity || 0 }}</td>
                  <td class="p-3">{{ delivery.ceiling_fans_quantity || 0 }}</td>
                  <td class="p-3 font-bold">{{ getTotalFansInDelivery(delivery) }}</td>
                  <td class="p-3 text-green-600">{{ formatNumber(delivery.paid_amount || 0) }} ج</td>
                  <td class="p-3 text-orange-600 font-bold">{{ formatNumber(delivery.remaining_amount || 0) }} ج</td>
                </tr>
                <tr v-if="deliveries.length === 0">
                  <td colspan="8" class="text-center py-8 text-gray-400">لا توجد تسليمات</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 💵 الورديات اليومية -->
        <div class="bg-white rounded-2xl shadow overflow-hidden">
          <div class="bg-teal-50 p-4 border-b">
            <h2 class="text-lg font-bold">💵 الورديات اليومية</h2>
            <p class="text-sm text-gray-500">سجل المدفوعات اليومية للمحصل</p>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full min-w-[700px]">
              <thead class="bg-gray-100">
                <tr>
                  <th class="p-3 text-right text-sm">#</th>
                  <th class="p-3 text-right text-sm">التاريخ</th>
                  <th class="p-3 text-right text-sm">المبلغ</th>
                  <th class="p-3 text-right text-sm">طريقة الدفع</th>
                  <th class="p-3 text-right text-sm hidden md:table-cell">ملاحظات</th>
                  <th class="p-3 text-right text-sm">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(payment, index) in dailyPayments" :key="payment.id" class="border-t hover:bg-gray-50">
                  <td class="p-3">{{ index + 1 }}</td>
                  <td class="p-3">{{ formatDate(payment.payment_date) }}</td>
                  <td class="p-3 text-green-600 font-bold">{{ formatNumber(payment.amount) }} ج</td>
                  <td class="p-3">
                    <span :class="payment.payment_method === 'cash' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'" class="px-2 py-1 rounded-full text-xs font-medium">
                      {{ payment.payment_method === 'cash' ? '💰 كاش' : '🏦 تحويل' }}
                    </span>
                  </td>
                  <td class="p-3 hidden md:table-cell">{{ payment.notes || '-' }}</td>
                  <td class="p-3">
                    <button 
                      v-if="userStore?.canEdit"
                      @click="deleteDailyPayment(payment.id)" 
                      class="text-red-600 hover:text-red-800"
                      title="حذف"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
                <tr v-if="dailyPayments.length === 0">
                  <td colspan="6" class="text-center py-8 text-gray-400">
                    لا توجد ورديات يومية مسجلة
                  </td>
                </tr>
              </tbody>
              <tfoot class="bg-gray-50 font-bold">
                <tr class="border-t">
                  <td colspan="2" class="p-3">📌 الإجمالي</td>
                  <td class="p-3 text-green-600">{{ formatNumber(totalDailyPayments) }} ج</td>
                  <td colspan="3"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- الأقساط الشهرية -->
        <div class="bg-white rounded-2xl shadow overflow-hidden">
          <div class="bg-gray-50 p-4 border-b">
            <h2 class="text-lg font-bold">📋 الأقساط الشهرية</h2>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full min-w-[800px]">
              <thead class="bg-gray-100">
                <tr>
                  <th class="p-3 text-right text-sm">#</th>
                  <th class="p-3 text-right text-sm">الشهر</th>
                  <th class="p-3 text-right text-sm">تاريخ الاستحقاق</th>
                  <th class="p-3 text-right text-sm">المبلغ</th>
                  <th class="p-3 text-right text-sm">المدفوع</th>
                  <th class="p-3 text-right text-sm">المتبقي</th>
                  <th class="p-3 text-right text-sm">الحالة</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(inst, index) in groupedInstallments" :key="index" class="border-t hover:bg-gray-50">
                  <td class="p-3">{{ index + 1 }}</td>
                  <td class="p-3 font-bold">{{ inst.month_name }} {{ inst.year }}</td>
                  <td class="p-3">{{ formatDate(inst.due_date) }}</td>
                  <td class="p-3 text-blue-600 font-bold">{{ formatNumber(inst.total_amount) }} ج</td>
                  <td class="p-3 text-green-600">{{ formatNumber(inst.total_paid) }} ج</td>
                  <td class="p-3 text-orange-600 font-bold">{{ formatNumber(inst.total_remaining) }} ج</td>
                  <td class="p-3">
                    <span :class="inst.total_remaining <= 0 ? 'bg-green-100 text-green-700' : inst.is_late ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'" class="px-2 py-1 rounded-full text-xs font-medium">
                      {{ inst.total_remaining <= 0 ? '✅ مدفوع' : inst.is_late ? '⚠️ متأخر' : '⏳ مستحق' }}
                    </span>
                  </td>
                </tr>
                <tr v-if="groupedInstallments.length === 0">
                  <td colspan="7" class="text-center py-8 text-gray-400">لا توجد أقساط</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Not Found -->
      <div v-else class="text-center py-16">
        <div class="text-6xl mb-4">🔍</div>
        <h1 class="text-2xl font-bold mb-2">المحصل غير موجود</h1>
        <p class="text-gray-500">لم نتمكن من العثور على المحصل المطلوب</p>
        <NuxtLink to="/dashboard/fans" class="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700">
          العودة للداشبورد
        </NuxtLink>
      </div>
    </div>

    <ToastNotification :toast="toast" @close="toast.show = false" />
  </div>
</template>

<script setup>
import { useUserStore } from '~/stores/user';

definePageMeta({
  layout: 'dashboard',
  middleware: 'admin-only',
});

import { supabase } from '~/lib/supabase';
const route = useRoute();
const userStore = useUserStore();

// State
const collector = ref(null);
const deliveries = ref([]);
const installments = ref([]);
const dailyPayments = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const toast = ref({ show: false, message: '', type: 'success' });

// Computed
const totalFans = computed(() => {
  return deliveries.value.reduce((sum, d) => {
    return sum + (d.standing_fans_quantity || 0) + (d.wall_fans_quantity || 0) + (d.ceiling_fans_quantity || 0);
  }, 0);
});

const totalPaid = computed(() => {
  // المدفوع من تسليمات المراوح
  const deliveryPaid = deliveries.value.reduce((sum, d) => sum + (d.paid_amount || 0), 0);
  
  // المدفوع من الورديات اليومية
  const dailyPaid = dailyPayments.value.reduce((sum, d) => sum + (d.amount || 0), 0);
  
  // المدفوع من الأقساط (اللي حالتها paid)
  const installmentPaid = installments.value
    .filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + (i.paid_amount || 0), 0);
  
  // ✅ الإجمالي الكلي
  return deliveryPaid + dailyPaid + installmentPaid;
});

// ✅ تعديل totalRemaining - المتبقي الكلي
const totalRemaining = computed(() => {
  // إجمالي قيمة المراوح المسلمة
  const totalDeliveryValue = deliveries.value.reduce((sum, d) => sum + (d.total_delivery || 0), 0);
  
  // إجمالي المدفوعات (من الدالة المحسوبة)
  const paid = totalPaid.value;
  
  // المتبقي = إجمالي قيمة المراوح - إجمالي المدفوعات
  return totalDeliveryValue - paid;
});
// ✅ إضافة Computed جديد لتوضيح التفاصيل
const totalDeliveryValue = computed(() => {
  return deliveries.value.reduce((sum, d) => sum + (d.total_delivery || 0), 0);
});

const totalDeliveryPaid = computed(() => {
  return deliveries.value.reduce((sum, d) => sum + (d.paid_amount || 0), 0);
});
const totalDailyPayments = computed(() => {
  return dailyPayments.value.reduce((sum, p) => sum + (p.amount || 0), 0);
});

const groupedInstallments = computed(() => {
  const grouped = {};
  installments.value.forEach(inst => {
    const dueDate = new Date(inst.due_date);
    const monthKey = `${dueDate.getFullYear()}-${dueDate.getMonth() + 1}`;
    const monthName = dueDate.toLocaleDateString('ar-EG', { month: 'long' });
    const year = dueDate.getFullYear();
    
    if (!grouped[monthKey]) {
      grouped[monthKey] = {
        month_name: monthName,
        year: year,
        due_date: dueDate,
        total_amount: 0,
        total_paid: 0,
        total_remaining: 0,
        is_late: false,
      };
    }
    grouped[monthKey].total_amount += inst.amount;
    grouped[monthKey].total_paid += inst.paid_amount || 0;
    grouped[monthKey].total_remaining += inst.amount - (inst.paid_amount || 0);
  });
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const result = Object.values(grouped);
  result.forEach(month => {
    month.is_late = month.due_date < today && month.total_remaining > 0;
  });
  result.sort((a, b) => a.due_date - b.due_date);
  return result;
});

// Methods
const formatNumber = (num) => {
  if (!num && num !== 0) return '0';
  return num.toLocaleString('ar-EG');
};

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('ar-EG');
};

const getTotalFansInDelivery = (delivery) => {
  return (delivery.standing_fans_quantity || 0) + (delivery.wall_fans_quantity || 0) + (delivery.ceiling_fans_quantity || 0);
};

const getStatusClass = (status) => {
  return status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
};

// ✅ حذف وردية يومية
const deleteDailyPayment = async (id) => {
  if (!userStore.canEdit) {
    alert('⚠️ ليس لديك صلاحية لحذف الورديات');
    return;
  }

  if (!confirm('⚠️ هل أنت متأكد من حذف هذه الوردية؟')) return;

  try {
    const { error } = await supabase
      .from('collector_daily_payments')
      .delete()
      .eq('id', id);

    if (error) throw error;

    alert('✅ تم حذف الوردية بنجاح');
    
    // إعادة تحميل البيانات
    await loadCollectorData();

  } catch (error) {
    console.error('❌ خطأ:', error);
    alert('خطأ: ' + error.message);
  }
};

// Load data
const loadCollectorData = async () => {
  const collectorId = route.query.id;
  
  if (!collectorId) {
    loading.value = false;
    return;
  }

  try {
    // جلب بيانات المحصل
    const { data: collectorData, error: collectorError } = await supabase
      .from('collectors')
      .select('*')
      .eq('id', collectorId)
      .single();

    if (collectorError) throw collectorError;
    collector.value = collectorData;

    // جلب تسليمات المراوح
    const { data: deliveriesData, error: deliveriesError } = await supabase
      .from('collector_fans_delivery')
      .select('*')
      .eq('collector_id', collectorId)
      .order('delivery_date', { ascending: false });

    if (deliveriesError) throw deliveriesError;
    deliveries.value = deliveriesData || [];

    // جلب الأقساط
    const { data: installmentsData, error: installmentsError } = await supabase
      .from('collector_installments')
      .select('*')
      .eq('collector_id', collectorId)
      .order('due_date', { ascending: true });

    if (installmentsError) throw installmentsError;
    installments.value = installmentsData || [];

    // ✅ جلب الورديات اليومية
    const { data: dailyPaymentsData, error: dailyPaymentsError } = await supabase
      .from('collector_daily_payments')
      .select('*')
      .eq('collector_id', collectorId)
      .order('payment_date', { ascending: false });

    if (dailyPaymentsError) throw dailyPaymentsError;
    dailyPayments.value = dailyPaymentsData || [];

  } catch (error) {
    console.error('❌ خطأ:', error);
    toast.value = { show: true, message: '❌ حدث خطأ في تحميل البيانات', type: 'error' };
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadCollectorData();
});
</script>