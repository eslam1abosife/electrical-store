<!-- components/fans/SupplierManagement.vue -->
<template>
  <div dir="rtl" class="space-y-6">
    <!-- بطاقات إحصائيات المورد -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <div
        class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg p-5 text-white"
      >
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm opacity-90">📦 إجمالي المراوح المشتراة</p>
            <p class="text-3xl font-bold mt-1">
              {{ supplierStats.totalFans }} قطعة
            </p>
            <p class="text-xs opacity-80 mt-1">
              {{ formatNumber(supplierStats.totalValue) }} ج
            </p>
          </div>
          <div
            class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl"
          >
            📦
          </div>
        </div>
      </div>

      <div
        class="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-lg p-5 text-white"
      >
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm opacity-90">💰 إجمالي المدفوع للمورد</p>
            <p class="text-3xl font-bold mt-1">
              {{ formatNumber(supplierStats.totalPaid) }} ج
            </p>
            <p class="text-xs opacity-80 mt-1">كاش + أقساط</p>
          </div>
          <div
            class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl"
          >
            💰
          </div>
        </div>
      </div>

      <div
        class="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-lg p-5 text-white"
      >
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm opacity-90">⚠️ المتبقي للمورد</p>
            <p class="text-3xl font-bold mt-1">
              {{ formatNumber(supplierStats.totalRemaining) }} ج
            </p>
            <p class="text-xs opacity-80 mt-1">مستحق الدفع</p>
          </div>
          <div
            class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl"
          >
            ⚠️
          </div>
        </div>
      </div>

      <div
        class="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl shadow-lg p-5 text-white"
      >
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm opacity-90">📅 عدد الفواتير</p>
            <p class="text-3xl font-bold mt-1">
              {{ supplierPurchases.length }}
            </p>
            <p class="text-xs opacity-80 mt-1">فاتورة شراء</p>
          </div>
          <div
            class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl"
          >
            📅
          </div>
        </div>
      </div>
    </div>

    <!-- جدول تفاصيل المراوح حسب النوع -->
    <div class="bg-white rounded-2xl shadow p-4 sm:p-6">
      <h2 class="text-lg sm:text-xl font-bold mb-4 text-gray-800">
        📊 تفاصيل مشتريات المورد حسب النوع
      </h2>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[700px] text-sm">
          <thead class="bg-gray-100">
            <tr>
              <th class="p-3 text-right">نوع المروحة</th>
              <th class="p-3 text-right">الكمية المشتراة</th>
              <th class="p-3 text-right">سعر القطعة</th>
              <th class="p-3 text-right">الإجمالي</th>
              <th class="p-3 text-right">المدفوع</th>
              <th class="p-3 text-right">المتبقي</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-t hover:bg-gray-50">
              <td class="p-3 font-bold text-blue-600">🔄 عمود</td>
              <td class="p-3">{{ supplierStats.standing.quantity }}</td>
              <td class="p-3">{{ formatNumber(1600) }} ج</td>
              <td class="p-3 text-blue-600 font-bold">
                {{ formatNumber(supplierStats.standing.total) }} ج
              </td>
              <td class="p-3 text-green-600">
                {{ formatNumber(supplierStats.standing.paid) }} ج
              </td>
              <td class="p-3 text-orange-600 font-bold">
                {{ formatNumber(supplierStats.standing.remaining) }} ج
              </td>
            </tr>
            <tr class="border-t hover:bg-gray-50">
              <td class="p-3 font-bold text-green-600">📌 حائط</td>
              <td class="p-3">{{ supplierStats.wall.quantity }}</td>
              <td class="p-3">{{ formatNumber(1400) }} ج</td>
              <td class="p-3 text-blue-600 font-bold">
                {{ formatNumber(supplierStats.wall.total) }} ج
              </td>
              <td class="p-3 text-green-600">
                {{ formatNumber(supplierStats.wall.paid) }} ج
              </td>
              <td class="p-3 text-orange-600 font-bold">
                {{ formatNumber(supplierStats.wall.remaining) }} ج
              </td>
            </tr>
            <tr class="border-t hover:bg-gray-50">
              <td class="p-3 font-bold text-purple-600">🌀 سقف</td>
              <td class="p-3">{{ supplierStats.ceiling.quantity }}</td>
              <td class="p-3">{{ formatNumber(1600) }} ج</td>
              <td class="p-3 text-blue-600 font-bold">
                {{ formatNumber(supplierStats.ceiling.total) }} ج
              </td>
              <td class="p-3 text-green-600">
                {{ formatNumber(supplierStats.ceiling.paid) }} ج
              </td>
              <td class="p-3 text-orange-600 font-bold">
                {{ formatNumber(supplierStats.ceiling.remaining) }} ج
              </td>
            </tr>
          </tbody>
          <tfoot class="bg-gray-50 font-bold">
            <tr class="border-t-2">
              <td class="p-3 text-lg">📌 الإجمالي</td>
              <td class="p-3 text-lg">{{ supplierStats.totalFans }}</td>
              <td class="p-3"></td>
              <td class="p-3 text-lg text-blue-600">
                {{ formatNumber(supplierStats.totalValue) }} ج
              </td>
              <td class="p-3 text-lg text-green-600">
                {{ formatNumber(supplierStats.totalPaid) }} ج
              </td>
              <td class="p-3 text-lg text-orange-600">
                {{ formatNumber(supplierStats.totalRemaining) }} ج
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- إضافة فاتورة شراء -->
    <div class="bg-white rounded-2xl shadow p-4 sm:p-6">
      <h2 class="text-lg sm:text-xl font-bold mb-4">
        ➕ إضافة فاتورة شراء من المورد
      </h2>
      <form @submit.prevent="saveSupplierPurchase" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">نوع المروحة *</label>
            <select
              v-model="supplierPurchase.fan_type"
              required
              class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
            >
              <option value="">-- اختر النوع --</option>
              <option value="standing">🔄 عمود (1600 ج)</option>
              <option value="wall">📌 حائط (1400 ج)</option>
              <option value="ceiling">🌀 سقف (1600 ج)</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">الكمية *</label>
            <input
              v-model.number="supplierPurchase.quantity"
              type="number"
              min="1"
              required
              class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">سعر القطعة *</label>
            <input
              v-model.number="supplierPurchase.unit_price"
              type="number"
              min="1"
              required
              class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">طريقة الدفع *</label>
            <select
              v-model="supplierPurchase.payment_type"
              required
              class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
            >
              <option value="cash">💰 كاش</option>
              <option value="installment">📅 تقسيط</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">المبلغ المدفوع</label>
            <input
              v-model.number="supplierPurchase.paid_amount"
              type="number"
              min="0"
              class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
            />
            <p class="text-xs text-gray-500 mt-1">اترك 0 إذا لم تدفع</p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1"
              >عدد الأقساط (للتقسيط)</label
            >
            <input
              v-model.number="supplierPurchase.installments_count"
              type="number"
              min="1"
              class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
            />
            <p class="text-xs text-gray-500 mt-1">كم شهر؟ (اترك 0 لو كاش)</p>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">تاريخ الشراء</label>
            <input
              v-model="supplierPurchase.purchase_date"
              type="date"
              class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">ملاحظات</label>
          <textarea
            v-model="supplierPurchase.notes"
            rows="2"
            class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
          ></textarea>
        </div>

        <div class="bg-gray-100 rounded-xl p-3 sm:p-4">
          <h3 class="font-bold text-base mb-2">📊 ملخص الفاتورة</h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <p class="text-xs text-gray-600">الإجمالي</p>
              <p class="text-lg font-bold text-blue-600">
                {{ formatNumber(supplierPurchase.total || 0) }} ج
              </p>
            </div>
            <div>
              <p class="text-xs text-gray-600">المدفوع</p>
              <p class="text-lg font-bold text-green-600">
                {{ formatNumber(supplierPurchase.paid_amount || 0) }} ج
              </p>
            </div>
            <div>
              <p class="text-xs text-gray-600">المتبقي</p>
              <p class="text-lg font-bold text-orange-600">
                {{
                  formatNumber(
                    (supplierPurchase.total || 0) -
                      (supplierPurchase.paid_amount || 0),
                  )
                }}
                ج
              </p>
            </div>
            <div
              v-if="
                supplierPurchase.payment_type === 'installment' &&
                supplierPurchase.installments_count > 0
              "
            >
              <p class="text-xs text-gray-600">القسط الشهري</p>
              <p class="text-lg font-bold text-purple-600">
                {{
                  formatNumber(
                    ((supplierPurchase.total || 0) -
                      (supplierPurchase.paid_amount || 0)) /
                      supplierPurchase.installments_count,
                  )
                }}
                ج
              </p>
            </div>
          </div>
        </div>

        <button
          v-if="userStore?.canEdit"
          type="submit"
          :disabled="supplierLoading"
          class="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition text-sm font-medium"
        >
          {{ supplierLoading ? "جاري الحفظ..." : "✅ حفظ فاتورة الشراء" }}
        </button>
      </form>
    </div>

    <!-- سجل مشتريات المورد -->
    <div class="bg-white rounded-2xl shadow p-4 sm:p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg sm:text-xl font-bold">📋 سجل مشتريات المورد</h2>
        <span class="text-xs text-gray-500"
          >إجمالي الفواتير: {{ supplierPurchases.length }}</span
        >
      </div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[900px] text-sm">
          <thead class="bg-gray-100">
            <tr>
              <th class="p-3 text-right">#</th>
              <th class="p-3 text-right">التاريخ</th>
              <th class="p-3 text-right">النوع</th>
              <th class="p-3 text-right">الكمية</th>
              <th class="p-3 text-right">سعر القطعة</th>
              <th class="p-3 text-right">الإجمالي</th>
              <th class="p-3 text-right">المدفوع</th>
              <th class="p-3 text-right">المتبقي</th>
              <th class="p-3 text-right">طريقة الدفع</th>
              <th class="p-3 text-right">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(purchase, index) in supplierPurchases"
              :key="purchase.id"
              class="border-t hover:bg-gray-50"
            >
              <td class="p-3">{{ index + 1 }}</td>
              <td class="p-3">{{ formatDate(purchase.purchase_date) }}</td>
              <td class="p-3">
                <span
                  :class="{
                    'bg-blue-100 text-blue-700':
                      purchase.fan_type === 'standing',
                    'bg-green-100 text-green-700': purchase.fan_type === 'wall',
                    'bg-purple-100 text-purple-700':
                      purchase.fan_type === 'ceiling',
                  }"
                  class="px-2 py-1 rounded-full text-xs font-medium"
                >
                  {{ getFanTypeName(purchase.fan_type) }}
                </span>
              </td>
              <td class="p-3">{{ purchase.quantity }}</td>
              <td class="p-3">{{ formatNumber(purchase.unit_price) }} ج</td>
              <td class="p-3 text-blue-600 font-bold">
                {{ formatNumber(purchase.total) }} ج
              </td>
              <td class="p-3 text-green-600">
                {{ formatNumber(purchase.paid_amount || 0) }} ج
              </td>
              <td class="p-3 text-orange-600 font-bold">
                {{
                  formatNumber(purchase.total - (purchase.paid_amount || 0))
                }}
                ج
              </td>
              <td class="p-3">
                <span
                  :class="
                    purchase.payment_type === 'cash'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-purple-100 text-purple-700'
                  "
                  class="px-2 py-1 rounded-full text-xs font-medium"
                >
                  {{ purchase.payment_type === "cash" ? "💰 كاش" : "📅 تقسيط" }}
                </span>
              </td>
              <td class="p-3">
                <div class="flex gap-2">
                  <button
                    v-if="purchase.remaining > 0 && userStore.canEdit"
                    @click="$emit('pay-supplier', purchase)"
                    class="bg-green-600 text-white px-2 py-1 rounded-lg text-xs hover:bg-green-700"
                  >
                    💰 سداد
                  </button>
                  <button
                    v-if="userStore?.canEdit"
                    @click="$emit('delete-supplier-purchase', purchase.id)"
                    class="text-red-600 hover:text-red-800"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="supplierPurchases.length === 0">
              <td colspan="10" class="text-center py-8 text-gray-400">
                لا توجد مشتريات من المورد
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
const supabase = useSupabaseClient();
const userStore = useUserStore();

// Props
const props = defineProps({
  userStore: { type: Object, required: true },
});

// State
const supplierPurchases = ref([]);
const supplierLoading = ref(false);

const supplierPurchase = ref({
  fan_type: "",
  quantity: 0,
  unit_price: 0,
  total: 0,
  paid_amount: 0,
  payment_type: "cash",
  installments_count: 0,
  purchase_date: new Date().toISOString().split("T")[0],
  notes: "",
});

const supplierStats = ref({
  totalFans: 0,
  totalValue: 0,
  totalPaid: 0,
  totalRemaining: 0,
  standing: { quantity: 0, total: 0, paid: 0, remaining: 0 },
  wall: { quantity: 0, total: 0, paid: 0, remaining: 0 },
  ceiling: { quantity: 0, total: 0, paid: 0, remaining: 0 },
});

// Methods
const formatNumber = (num) => {
  if (!num && num !== 0) return "0";
  return num.toLocaleString("ar-EG");
};

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("ar-EG");
};

const getFanTypeName = (type) => {
  const types = {
    standing: "🔄 عمود",
    wall: "📌 حائط",
    ceiling: "🌀 سقف",
  };
  return types[type] || type;
};

// Load supplier purchases
const loadSupplierPurchases = async () => {
  try {
    const { data } = await supabase
      .from("supplier_purchases")
      .select("*")
      .order("purchase_date", { ascending: false });

    supplierPurchases.value = data || [];
    calculateSupplierStats();
  } catch (error) {
    console.error("Error loading supplier purchases:", error);
  }
};

// Calculate supplier stats
const calculateSupplierStats = () => {
  const stats = {
    totalFans: 0,
    totalValue: 0,
    totalPaid: 0,
    totalRemaining: 0,
    standing: { quantity: 0, total: 0, paid: 0, remaining: 0 },
    wall: { quantity: 0, total: 0, paid: 0, remaining: 0 },
    ceiling: { quantity: 0, total: 0, paid: 0, remaining: 0 },
  };

  supplierPurchases.value.forEach((p) => {
    const fanType = p.fan_type || "standing";
    const total = p.total || p.quantity * p.unit_price;
    const paid = p.paid_amount || 0;
    const remaining = total - paid;

    stats.totalFans += p.quantity || 0;
    stats.totalValue += total;
    stats.totalPaid += paid;
    stats.totalRemaining += remaining;

    if (fanType === "standing") {
      stats.standing.quantity += p.quantity || 0;
      stats.standing.total += total;
      stats.standing.paid += paid;
      stats.standing.remaining += remaining;
    } else if (fanType === "wall") {
      stats.wall.quantity += p.quantity || 0;
      stats.wall.total += total;
      stats.wall.paid += paid;
      stats.wall.remaining += remaining;
    } else if (fanType === "ceiling") {
      stats.ceiling.quantity += p.quantity || 0;
      stats.ceiling.total += total;
      stats.ceiling.paid += paid;
      stats.ceiling.remaining += remaining;
    }
  });

  supplierStats.value = stats;
};

// Save supplier purchase
const saveSupplierPurchase = async () => {
  if (!userStore.canEdit) {
    alert("⚠️ ليس لديك صلاحية لإضافة مشتريات");
    return;
  }

  if (!supplierPurchase.value.fan_type) {
    alert("⚠️ الرجاء اختيار نوع المروحة");
    return;
  }

  if (
    !supplierPurchase.value.quantity ||
    supplierPurchase.value.quantity <= 0
  ) {
    alert("⚠️ الرجاء إدخال الكمية");
    return;
  }

  if (
    !supplierPurchase.value.unit_price ||
    supplierPurchase.value.unit_price <= 0
  ) {
    alert("⚠️ الرجاء إدخال سعر القطعة");
    return;
  }

  supplierLoading.value = true;

  try {
    const total =
      supplierPurchase.value.quantity * supplierPurchase.value.unit_price;
    const paid = supplierPurchase.value.paid_amount || 0;

    const { error } = await supabase.from("supplier_purchases").insert([
      {
        fan_type: supplierPurchase.value.fan_type,
        quantity: supplierPurchase.value.quantity,
        unit_price: supplierPurchase.value.unit_price,
        total: total,
        paid_amount: paid,
        payment_type: supplierPurchase.value.payment_type,
        installments_count: supplierPurchase.value.installments_count || 0,
        purchase_date:
          supplierPurchase.value.purchase_date ||
          new Date().toISOString().split("T")[0],
        notes: supplierPurchase.value.notes || null,
      },
    ]);

    if (error) throw error;

    alert("✅ تم إضافة فاتورة الشراء بنجاح");

    supplierPurchase.value = {
      fan_type: "",
      quantity: 0,
      unit_price: 0,
      total: 0,
      paid_amount: 0,
      payment_type: "cash",
      installments_count: 0,
      purchase_date: new Date().toISOString().split("T")[0],
      notes: "",
    };

    await loadSupplierPurchases();
  } catch (error) {
    console.error("❌ خطأ:", error);
    alert("خطأ: " + error.message);
  } finally {
    supplierLoading.value = false;
  }
};

// Watch for total calculation
watch(
  () => [supplierPurchase.value.quantity, supplierPurchase.value.unit_price],
  () => {
    supplierPurchase.value.total =
      (supplierPurchase.value.quantity || 0) *
      (supplierPurchase.value.unit_price || 0);
  },
);

// Load on mount
onMounted(() => {
  loadSupplierPurchases();
});

// Expose for parent
defineExpose({
  loadSupplierPurchases,
});
</script>
