<!-- pages/collector/[id].vue -->
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b sticky top-0 z-10">
      <div class="container mx-auto px-6 py-4">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">
              📊 تقرير المحصل: {{ collector.name }}
            </h1>
            <p class="text-sm text-gray-500 mt-1">
              عرض فقط - لا يمكن التعديل - بيانات خاصة بهذا المحصل فقط
            </p>
          </div>
          <button
            @click="logout"
            class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            🚪 تسجيل خروج
          </button>
        </div>
      </div>
    </header>

    <div class="container mx-auto px-6 py-8" v-if="!loading">
      <!-- بطاقات إحصائيات -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow p-6 text-white">
          <div>
            <p class="text-sm opacity-90">📦 إجمالي المراوح</p>
            <p class="text-3xl font-bold mt-2">{{ totalFans }} قطعة</p>
          </div>
        </div>

        <div class="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow p-6 text-white">
          <div>
            <p class="text-sm opacity-90">💰 إجمالي المدفوعات</p>
            <p class="text-3xl font-bold mt-2">{{ formatNumber(totalPaid) }} ج</p>
          </div>
        </div>

        <div class="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow p-6 text-white">
          <div>
            <p class="text-sm opacity-90">⚠️ المتبقي الكلي</p>
            <p class="text-3xl font-bold mt-2">{{ formatNumber(totalRemaining) }} ج</p>
          </div>
        </div>

        <div class="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl shadow p-6 text-white">
          <div>
            <p class="text-sm opacity-90">📅 المستحق هذا الشهر</p>
            <p class="text-3xl font-bold mt-2">{{ formatNumber(dueThisMonth) }} ج</p>
          </div>
        </div>
      </div>

      <!-- معلومات المحصل -->
      <div class="bg-white rounded-2xl shadow mb-8 p-6">
        <h2 class="text-xl font-bold mb-4 text-gray-800">📋 معلومات المحصل</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p class="text-sm text-gray-500">الاسم</p>
            <p class="font-medium">{{ collector.name || '-' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">رقم الهاتف</p>
            <p class="font-medium">{{ collector.phone || '-' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">العنوان</p>
            <p class="font-medium">{{ collector.address || '-' }}</p>
          </div>
        </div>
      </div>

      <!-- الورديات اليومية -->
      <div class="bg-white rounded-2xl shadow overflow-hidden mb-8">
        <div class="bg-gray-50 p-4 border-b">
          <h2 class="text-xl font-bold">💵 الورديات اليومية</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-100">
              <tr>
                <th class="p-3 text-right">التاريخ</th>
                <th class="p-3 text-right">المبلغ</th>
                <th class="p-3 text-right">طريقة الدفع</th>
                <th class="p-3 text-right">ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="pay in dailyPayments" :key="pay.id" class="border-t">
                <td class="p-3">{{ formatDate(pay.payment_date) }}</td>
                <td class="p-3 text-green-600 font-bold">{{ formatNumber(pay.amount) }} ج</td>
                <td class="p-3">{{ pay.payment_method === 'cash' ? '💰 كاش' : '🏦 تحويل' }}</td>
                <td class="p-3">{{ pay.notes || '-' }}</td>
              </tr>
              <tr v-if="dailyPayments.length === 0">
                <td colspan="4" class="text-center py-8 text-gray-400">📭 لا توجد ورديات مسجلة</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-else class="flex justify-center items-center h-64">
      <div class="text-gray-500">جاري التحميل...</div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'collector-only'
})

const supabase = useSupabaseClient();
const router = useRouter();
const userStore = useUserStore();
const route = useRoute();

const collector = ref({});
const deliveries = ref([]);
const dailyPayments = ref([]);
const installments = ref([]);
const loading = ref(true);

const formatNumber = (num) => {
  if (!num && num !== 0) return '0';
  return num.toLocaleString('ar-EG');
};

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('ar-EG');
};

const loadCollectorData = async () => {
  const collectorId = route.params.id;
  
  console.log("📥 جلب بيانات المحصل:", collectorId);
  
  // جلب بيانات المحصل
  const { data: collectorData, error: collectorError } = await supabase
    .from('collectors')
    .select('*')
    .eq('id', collectorId)
    .maybeSingle();
  
  if (collectorError || !collectorData) {
    console.error('❌ محصل غير موجود');
    router.push('/');
    return;
  }
  
  collector.value = collectorData;
  
  // جلب الورديات اليومية
  const { data: paymentsData } = await supabase
    .from('collector_daily_payments')
    .select('*')
    .eq('collector_id', collectorId)
    .order('payment_date', { ascending: false });
  
  dailyPayments.value = paymentsData || [];
  
  loading.value = false;
};

// حساب الإحصائيات
const totalFans = computed(() => 0);
const totalPaid = computed(() => {
  return dailyPayments.value.reduce((sum, d) => sum + d.amount, 0);
});
const totalRemaining = computed(() => 0);
const dueThisMonth = computed(() => 0);

const logout = async () => {
  await userStore.logout();
  router.push('/login');
};

onMounted(async () => {
  if (!userStore.isLoggedIn) {
    router.push('/login');
    return;
  }
  await loadCollectorData();
});
</script>

<style scoped>
.container { max-width: 1280px; margin: 0 auto; }
</style>