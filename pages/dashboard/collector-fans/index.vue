<!-- pages/dashboard/fans/index.vue - الصفحة الرئيسية كاملة -->
<template>
  <div class="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen" dir="rtl">
    <!-- Header -->
    <FansHeader />

    <!-- بطاقات إحصائيات المراوح -->
    <FansStatsCards
      :total-fans-purchased="totalFansPurchased"
      :total-fans-purchase-value="totalFansPurchaseValue"
      :total-fans-delivered-to-collectors="totalFansDeliveredToCollectors"
      :total-fans-delivered-value="totalFansDeliveredValue"
      :total-fans-in-stock="totalFansInStock"
      :total-fans-stock-value="totalFansStockValue"
      :total-expenses="fanExpensesTotal"
    />

    <!-- تفاصيل المراوح حسب النوع -->
    <FansTypeTable :fan-stats="fanStats" />

    <!-- بطاقات إحصائيات المحصلين -->
    <CollectorStatsCards
      :collectors-count="collectors.length"
      :total-fans-delivered="totalFansDelivered"
      :total-all-payments="totalAllPayments"
      :total-due-this-month="totalDueThisMonth"
      :total-remaining="totalRemaining"
    />

    <!-- التابات -->
    <FansTabs v-model:activeTab="activeTab" :tabs="tabs" />

    <!-- 1. تسليم مراوح -->
    <DeliveryForm
      v-if="activeTab === 'delivery'"
      :collectors="collectors"
      :delivery="delivery"
      :delivery-loading="deliveryLoading"
      :total-fans-today="totalFansToday"
      :user-store="userStore"
      @save-delivery="saveDelivery"
      @calculate-totals="calculateTotals"
    />

    <!-- 2. وردية يومية -->
    <DailyPaymentForm
      v-if="activeTab === 'daily_payment'"
      :collectors="collectors"
      :daily-payment="dailyPayment"
      :daily-payment-loading="dailyPaymentLoading"
      :selected-collector-daily-payments="selectedCollectorDailyPayments"
      :user-store="userStore"
      :deliveries="deliveries"
      :daily-payments="dailyPayments"
      :installments="installments"
      @save-daily-payment="saveDailyPayment"
      @edit-daily-payment="editDailyPayment"
      @delete-daily-payment="deleteDailyPayment"
    />

    <!-- 3. المحصلين -->
    <CollectorsList
      v-if="activeTab === 'collectors'"
      :collectors="collectors"
      :user-store="userStore"
      :get-collector-total-fans="getCollectorTotalFans"
      :get-collector-total-paid-all="getCollectorTotalPaidAll"
      :get-collector-total-remaining-all="getCollectorTotalRemainingAll"
      :get-collector-due-this-month="getCollectorDueThisMonth"
      @show-collector-modal="openCollectorModal"
      @edit-collector="editCollector"
      @delete-collector="deleteCollector"
      @view-collector="navigateToCollector"
    />

    <!-- 4. الأقساط الشهرية -->
    <InstallmentsReport
      v-if="activeTab === 'installments'"
      :collectors="collectors"
      :selected-collector-id="selectedCollectorId"
      :monthly-report="monthlyReport"
      :total-monthly-report="totalMonthlyReport"
      :user-store="userStore"
      @select-collector="selectedCollectorId = $event"
      @pay-installment="payMonthlyInstallment"
      @edit-installment="editMonthlyInstallment"
      @delete-installment="deleteMonthlyInstallment"
    />

    <!-- 5. تقارير المحصلين -->
    <CollectorsReport
      v-if="activeTab === 'report'"
      :collectors="collectors"
      :user-store="userStore"
      :get-collector-total-fans="getCollectorTotalFans"
      :get-collector-total-paid-all="getCollectorTotalPaidAll"
      :get-collector-total-remaining-all="getCollectorTotalRemainingAll"
      :get-collector-due-this-month="getCollectorDueThisMonth"
      :get-collector-daily-payments="getCollectorDailyPayments"
      :get-collector-monthly-installments="getCollectorMonthlyInstallments"
      :total-monthly-amount="totalMonthlyAmount"
      :total-monthly-paid="totalMonthlyPaid"
      :total-monthly-remaining="totalMonthlyRemaining"
      @pay-installment="payMonthlyInstallmentFromReport"
    />

    <!-- 6. مورد المراوح -->
    <SupplierManagement
      v-if="activeTab === 'supplier'"
      :user-store="userStore"
      ref="supplierManagementRef"
      @pay-supplier="paySupplierInstallment"
      @delete-supplier-purchase="deleteSupplierPurchase"
    />

    <!-- 7. مصاريف المراوح -->
    <FanExpenses
      v-if="activeTab === 'expenses'"
      :user-store="userStore"
      ref="fanExpensesRef"
      @expenses-updated="updateFanExpensesTotal"
    />

    <!-- ================= المودالات ================= -->

    <!-- مودال إضافة/تعديل محصل -->
    <CollectorModal
      v-if="showCollectorModal"
      :is-editing="isEditingCollector"
      :collector-form="collectorForm"
      @close="showCollectorModal = false"
      @save="saveCollector"
    />

    <!-- مودال سداد قسط المحصل -->
    <PaymentModal
      v-if="showPaymentModal"
      :selected-installment="selectedInstallment"
      :payment-method="paymentMethod"
      :payment-notes="paymentNotes"
      @close="showPaymentModal = false"
      @pay="processInstallmentPayment"
      @update:payment-method="paymentMethod = $event"
      @update:payment-notes="paymentNotes = $event"
    />

    <!-- مودال تعديل وردية -->
    <DailyPaymentModal
      v-if="showDailyPaymentModal"
      :daily-payment-form="dailyPaymentForm"
      @close="showDailyPaymentModal = false"
      @update="updateDailyPayment"
      @update:daily-payment-form="
        (val) => {
          console.log('📥 استقبال تحديث من مودال الوردية:', val);
          dailyPaymentForm = val;
        }
      "
    />

    <!-- مودال تعديل قسط شهري -->
    <EditInstallmentModal
      v-if="showEditInstallmentModal"
      :edit-installment-form="editInstallmentForm"
      @close="showEditInstallmentModal = false"
      @update="updateMonthlyInstallment"
      @update:edit-installment-form="
        (val) => {
          editInstallmentForm = val;
          console.log('📥 استقبال تحديث:', val);
        }
      "
    />

    <!-- مودال سداد قسط المورد -->
    <SupplierPaymentModal
      v-if="showSupplierPaymentModal"
      :selected-supplier-purchase="selectedSupplierPurchase"
      :supplier-payment-amount="supplierPaymentAmount"
      :supplier-payment-date="supplierPaymentDate"
      @close="showSupplierPaymentModal = false"
      @pay="processSupplierPayment"
      @update:amount="supplierPaymentAmount = $event"
      @update:date="supplierPaymentDate = $event"
    />
  </div>
</template>

<script setup>
import { useUserStore } from "~/stores/user";

definePageMeta({ layout: "dashboard", middleware: "admin-only" });

import { supabase } from '~/lib/supabase';
const userStore = useUserStore();

// ===================== State =====================
const activeTab = ref("delivery");
const deliveryLoading = ref(false);
const dailyPaymentLoading = ref(false);
const showCollectorModal = ref(false);
const showPaymentModal = ref(false);
const showDailyPaymentModal = ref(false);
const showEditInstallmentModal = ref(false);
const showSupplierPaymentModal = ref(false);
const isEditingCollector = ref(false);
const selectedCollectorId = ref("");
const selectedInstallment = ref(null);
const selectedSupplierPurchase = ref(null);
const supplierPaymentAmount = ref(0);
const supplierPaymentDate = ref(new Date().toISOString().split("T")[0]);
const paymentMethod = ref("cash");
const paymentNotes = ref("");
const fanExpensesTotal = ref(0);

const collectors = ref([]);
const deliveries = ref([]);
const installments = ref([]);
const dailyPayments = ref([]);
const selectedCollectorDailyPayments = ref([]);
const supplierManagementRef = ref(null);
const fanExpensesRef = ref(null);

// Forms
const collectorForm = ref({
  id: null,
  name: "",
  phone: "",
  address: "",
  notes: "",
});
const dailyPaymentForm = ref({
  id: null,
  payment_date: "",
  amount: 0,
  payment_method: "cash",
  notes: "",
});
const editInstallmentForm = ref({
  id: null,
  installment_id: null,
  month_name: "",
  year: "",
  due_date: "",
  amount: 0,
  paid_amount: 0,
  fan_quantity: 0,
});

// Delivery data
const delivery = ref({
  collector_id: "",
  delivery_date: new Date().toISOString().split("T")[0],
  standing_fans_quantity: 0,
  standing_fans_price: 1600,
  standing_fans_total: 0,
  wall_fans_quantity: 0,
  wall_fans_price: 1400,
  wall_fans_total: 0,
  ceiling_fans_quantity: 0,
  ceiling_fans_price: 1600,
  ceiling_fans_total: 0,
  total_delivery: 0,
  paid_amount: 0,
  remaining_amount: 0,
  notes: "",
});

// Daily payment data
const dailyPayment = ref({
  collector_id: "",
  payment_date: new Date().toISOString().split("T")[0],
  amount: 0,
  payment_method: "cash",
  notes: "",
});

// ===================== Fans Inventory =====================

const totalFansPurchased = ref(0);
const totalFansPurchaseValue = ref(0);
const totalFansDeliveredToCollectors = ref(0);
const totalFansDeliveredValue = ref(0);
const totalFansInStock = ref(0);
const totalFansStockValue = ref(0);

const fanStats = ref({
  standing: { purchased: 0, delivered: 0, inStock: 0 },
  wall: { purchased: 0, delivered: 0, inStock: 0 },
  ceiling: { purchased: 0, delivered: 0, inStock: 0 },
  total: { purchased: 0, delivered: 0, inStock: 0, stockValue: 0 },
});

const deliveryHistory = ref([]);

// ===================== Computed =====================

const totalFansToday = computed(
  () =>
    (delivery.value.standing_fans_quantity || 0) +
    (delivery.value.wall_fans_quantity || 0) +
    (delivery.value.ceiling_fans_quantity || 0),
);

const totalFansDelivered = computed(() =>
  deliveries.value.reduce(
    (sum, d) =>
      sum +
      (d.standing_fans_quantity || 0) +
      (d.wall_fans_quantity || 0) +
      (d.ceiling_fans_quantity || 0),
    0,
  ),
);

const totalAllPayments = computed(
  () =>
    deliveries.value.reduce((sum, d) => sum + (d.paid_amount || 0), 0) +
    dailyPayments.value.reduce((sum, d) => sum + d.amount, 0) +
    installments.value
      .filter((i) => i.status === "paid")
      .reduce((sum, i) => sum + i.paid_amount, 0),
);

const totalRemaining = computed(
  () =>
    deliveries.value.reduce((sum, d) => sum + d.total_delivery, 0) -
    totalAllPayments.value,
);

const totalDueThisMonth = computed(() => {
  const now = new Date();
  const currentMonth = now.getMonth(),
    currentYear = now.getFullYear();
  return installments.value
    .filter((i) => {
      const dueDate = new Date(i.due_date);
      return (
        dueDate.getMonth() === currentMonth &&
        dueDate.getFullYear() === currentYear &&
        i.status !== "paid"
      );
    })
    .reduce((sum, i) => sum + (i.amount - (i.paid_amount || 0)), 0);
});

// ===================== Functions =====================
const updateCollectorStats = () => {
  // إعادة حساب الإحصائيات
  const totalPaid =
    deliveries.value.reduce((sum, d) => sum + (d.paid_amount || 0), 0) +
    dailyPayments.value.reduce((sum, d) => sum + d.amount, 0) +
    installments.value
      .filter((i) => i.status === "paid")
      .reduce((sum, i) => sum + i.paid_amount, 0);

  // تحديث المتغيرات التفاعلية
  // (هذه المتغيرات مفترضة موجودة في الكود)
  // إذا لم تكن موجودة، يمكنك إضافتها في الـ state
};
// Helper functions
const formatNumber = (num) => {
  if (!num && num !== 0) return "0";
  return num.toLocaleString("ar-EG");
};

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("ar-EG");
};

const calculateTotals = () => {
  delivery.value.standing_fans_total =
    (delivery.value.standing_fans_quantity || 0) * 1600;
  delivery.value.wall_fans_total =
    (delivery.value.wall_fans_quantity || 0) * 1400;
  delivery.value.ceiling_fans_total =
    (delivery.value.ceiling_fans_quantity || 0) * 1600;
  delivery.value.total_delivery =
    delivery.value.standing_fans_total +
    delivery.value.wall_fans_total +
    delivery.value.ceiling_fans_total;
  delivery.value.remaining_amount =
    delivery.value.total_delivery - (delivery.value.paid_amount || 0);
};

// ===================== Data Loading =====================

const loadCollectors = async () => {
  const { data } = await supabase.from("collectors").select("*").order("name");
  collectors.value = data || [];
};

const loadDeliveries = async () => {
  const { data } = await supabase
    .from("collector_fans_delivery")
    .select("*")
    .order("delivery_date", { ascending: false });
  deliveries.value = data || [];
  updateFanStats();
};

const loadInstallments = async () => {
  const { data } = await supabase
    .from("collector_installments")
    .select("*")
    .order("due_date", { ascending: true });
  installments.value = data || [];
};

const loadDailyPayments = async () => {
  const { data } = await supabase
    .from("collector_daily_payments")
    .select("*")
    .order("payment_date", { ascending: false });
  dailyPayments.value = data || [];
};

const loadCollectorDailyPayments = async (collectorId) => {
  if (!collectorId) {
    selectedCollectorDailyPayments.value = [];
    return;
  }
  const { data } = await supabase
    .from("collector_daily_payments")
    .select("*")
    .eq("collector_id", collectorId)
    .order("payment_date", { ascending: false });
  selectedCollectorDailyPayments.value = data || [];
};

// ===================== Fan Stats =====================

const updateFanStats = async () => {
  let standing = 0,
    wall = 0,
    ceiling = 0;
  let deliveredStanding = 0,
    deliveredWall = 0,
    deliveredCeiling = 0;

  const { data: supplierPurchases } = await supabase
    .from("supplier_purchases")
    .select("*");

  supplierPurchases?.forEach((p) => {
    const fanType = p.fan_type || "standing";
    const quantity = p.quantity || 0;
    if (fanType === "standing") {
      standing += quantity;
    } else if (fanType === "wall") {
      wall += quantity;
    } else if (fanType === "ceiling") {
      ceiling += quantity;
    }
  });

  deliveries.value.forEach((d) => {
    deliveredStanding += d.standing_fans_quantity || 0;
    deliveredWall += d.wall_fans_quantity || 0;
    deliveredCeiling += d.ceiling_fans_quantity || 0;
  });

  const totalPurchased = standing + wall + ceiling;
  const totalDelivered = deliveredStanding + deliveredWall + deliveredCeiling;

  fanStats.value = {
    standing: {
      purchased: standing,
      delivered: deliveredStanding,
      inStock: standing - deliveredStanding,
    },
    wall: {
      purchased: wall,
      delivered: deliveredWall,
      inStock: wall - deliveredWall,
    },
    ceiling: {
      purchased: ceiling,
      delivered: deliveredCeiling,
      inStock: ceiling - deliveredCeiling,
    },
    total: {
      purchased: totalPurchased,
      delivered: totalDelivered,
      inStock: totalPurchased - totalDelivered,
      stockValue: (totalPurchased - totalDelivered) * 1500,
    },
  };

  totalFansPurchased.value = totalPurchased;
  totalFansPurchaseValue.value = totalPurchased * 1500;
  totalFansDeliveredToCollectors.value = totalDelivered;
  totalFansDeliveredValue.value = deliveries.value.reduce(
    (sum, d) => sum + (d.total_delivery || 0),
    0,
  );
  totalFansInStock.value = totalPurchased - totalDelivered;
  totalFansStockValue.value = (totalPurchased - totalDelivered) * 1500;
};

// ===================== Collector Functions =====================

const getCollectorDeliveries = (collectorId) =>
  deliveries.value.filter((d) => d.collector_id === collectorId);

const getCollectorDailyPayments = (collectorId) =>
  dailyPayments.value.filter((d) => d.collector_id === collectorId);

const getCollectorInstallments = (collectorId) =>
  installments.value.filter((i) => i.collector_id === collectorId);

const getCollectorTotalFans = (collectorId) =>
  getCollectorDeliveries(collectorId).reduce(
    (sum, d) =>
      sum +
      (d.standing_fans_quantity || 0) +
      (d.wall_fans_quantity || 0) +
      (d.ceiling_fans_quantity || 0),
    0,
  );

const getCollectorTotalPaidAll = (collectorId) =>
  getCollectorDeliveries(collectorId).reduce(
    (sum, d) => sum + (d.paid_amount || 0),
    0,
  ) +
  getCollectorDailyPayments(collectorId).reduce((sum, d) => sum + d.amount, 0) +
  getCollectorInstallments(collectorId)
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.paid_amount, 0);

const getCollectorTotalRemainingAll = (collectorId) =>
  getCollectorDeliveries(collectorId).reduce(
    (sum, d) => sum + d.total_delivery,
    0,
  ) - getCollectorTotalPaidAll(collectorId);

const getCollectorTotalRemaining = (collectorId) =>
  getCollectorDeliveries(collectorId).reduce(
    (sum, d) => sum + d.total_delivery,
    0,
  );

const getCollectorDueThisMonth = (collectorId) => {
  const now = new Date();
  const currentMonth = now.getMonth(),
    currentYear = now.getFullYear();
  return getCollectorInstallments(collectorId)
    .filter((i) => {
      const dueDate = new Date(i.due_date);
      return (
        dueDate.getMonth() === currentMonth &&
        dueDate.getFullYear() === currentYear &&
        i.status !== "paid"
      );
    })
    .reduce((sum, i) => sum + (i.amount - (i.paid_amount || 0)), 0);
};

const getCollectorMonthlyInstallments = (collectorId) => {
  const collectorInstallments = getCollectorInstallments(collectorId);
  const groupedByMonth = {};
  collectorInstallments.forEach((inst) => {
    const dueDate = new Date(inst.due_date);
    const monthKey = `${dueDate.getFullYear()}-${dueDate.getMonth() + 1}`;
    const monthName = dueDate.toLocaleDateString("ar-EG", { month: "long" });
    const year = dueDate.getFullYear();
    if (!groupedByMonth[monthKey])
      groupedByMonth[monthKey] = {
        month_key: monthKey,
        month_name: monthName,
        year: year,
        due_date: dueDate,
        total_amount: 0,
        total_paid: 0,
        total_remaining: 0,
        is_late: false,
        installment_ids: [],
      };
    groupedByMonth[monthKey].total_amount += inst.amount;
    groupedByMonth[monthKey].total_paid += inst.paid_amount || 0;
    groupedByMonth[monthKey].total_remaining +=
      inst.amount - (inst.paid_amount || 0);
    groupedByMonth[monthKey].installment_ids.push(inst.id);
  });
  const months = Object.values(groupedByMonth);
  months.sort((a, b) => a.due_date - b.due_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  months.forEach((month) => {
    month.is_late = month.due_date < today && month.total_remaining > 0;
  });
  return months;
};

const totalMonthlyAmount = (collectorId) => {
  const months = getCollectorMonthlyInstallments(collectorId);
  return months.reduce((sum, m) => sum + m.total_amount, 0);
};

const totalMonthlyPaid = (collectorId) => {
  const months = getCollectorMonthlyInstallments(collectorId);
  return months.reduce((sum, m) => sum + m.total_paid, 0);
};

const totalMonthlyRemaining = (collectorId) => {
  const months = getCollectorMonthlyInstallments(collectorId);
  return months.reduce((sum, m) => sum + m.total_remaining, 0);
};

// ===================== Delivery Functions =====================

const saveDelivery = async () => {
  if (!userStore.canEdit) {
    alert("⚠️ ليس لديك صلاحية لإضافة تسليم مراوح");
    return;
  }
  if (!delivery.value.collector_id) {
    alert("الرجاء اختيار المحصل");
    return;
  }
  if (totalFansToday.value === 0) {
    alert("الرجاء إدخال كميات المراوح");
    return;
  }
  deliveryLoading.value = true;
  try {
    const standingTotal = delivery.value.standing_fans_quantity || 0,
      wallTotal = delivery.value.wall_fans_quantity || 0,
      ceilingTotal = delivery.value.ceiling_fans_quantity || 0;
    const totalFans = standingTotal + wallTotal + ceilingTotal;
    const totalDeliveryValue =
      standingTotal * 1600 + wallTotal * 1400 + ceilingTotal * 1600;
    const paidAmount = delivery.value.paid_amount || 0;
    const remainingAfterDown = totalDeliveryValue - paidAmount;

    const { data: deliveryData, error: deliveryError } = await supabase
      .from("collector_fans_delivery")
      .insert([
        {
          collector_id: delivery.value.collector_id,
          delivery_date: delivery.value.delivery_date,
          standing_fans_quantity: standingTotal,
          standing_fans_price: 1600,
          standing_fans_total: standingTotal * 1600,
          wall_fans_quantity: wallTotal,
          wall_fans_price: 1400,
          wall_fans_total: wallTotal * 1400,
          ceiling_fans_quantity: ceilingTotal,
          ceiling_fans_price: 1600,
          ceiling_fans_total: ceilingTotal * 1600,
          total_delivery: totalDeliveryValue,
          paid_amount: paidAmount,
          remaining_amount: remainingAfterDown,
          notes: delivery.value.notes,
        },
      ])
      .select();

    if (deliveryError) throw deliveryError;

    const monthlyAmount = 300 * totalFans;
    const fifthMonthAmount =
      300 * (standingTotal + ceilingTotal) + 100 * wallTotal;
    const installmentsList = [];
    const startDate = new Date(delivery.value.delivery_date);

    for (let month = 1; month <= 4; month++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(startDate.getMonth() + month);
      dueDate.setDate(1);
      installmentsList.push({
        collector_id: delivery.value.collector_id,
        delivery_id: deliveryData[0].id,
        fan_type: "all",
        fan_quantity: totalFans,
        installment_number: month,
        due_date: dueDate.toISOString().split("T")[0],
        amount: monthlyAmount,
        status: "pending",
      });
    }

    const dueDate = new Date(startDate);
    dueDate.setMonth(startDate.getMonth() + 5);
    dueDate.setDate(1);
    installmentsList.push({
      collector_id: delivery.value.collector_id,
      delivery_id: deliveryData[0].id,
      fan_type: "all",
      fan_quantity: totalFans,
      installment_number: 5,
      due_date: dueDate.toISOString().split("T")[0],
      amount: fifthMonthAmount,
      status: "pending",
    });

    const { error: installmentsError } = await supabase
      .from("collector_installments")
      .insert(installmentsList);
    if (installmentsError) throw installmentsError;

    alert(
      `✅ تم تسليم ${totalFans} مروحة بنجاح\n\n📊 ملخص الأقساط الشهرية (5 أشهر):\n• الأشهر 1-4: ${formatNumber(monthlyAmount)} ج شهرياً\n• الشهر الخامس: ${formatNumber(fifthMonthAmount)} ج`,
    );

    delivery.value = {
      collector_id: "",
      delivery_date: new Date().toISOString().split("T")[0],
      standing_fans_quantity: 0,
      standing_fans_price: 1600,
      standing_fans_total: 0,
      wall_fans_quantity: 0,
      wall_fans_price: 1400,
      wall_fans_total: 0,
      ceiling_fans_quantity: 0,
      ceiling_fans_price: 1600,
      ceiling_fans_total: 0,
      total_delivery: 0,
      paid_amount: 0,
      remaining_amount: 0,
      notes: "",
    };

    await loadDeliveries();
    await loadInstallments();
    await updateFanStats();
  } catch (error) {
    console.error("❌ خطأ:", error);
    alert("خطأ: " + error.message);
  } finally {
    deliveryLoading.value = false;
  }
};

// ===================== Daily Payment Functions =====================

const saveDailyPayment = async () => {
  if (!userStore.canEdit) {
    alert("⚠️ ليس لديك صلاحية لإضافة وردية يومية");
    return;
  }

  if (!dailyPayment.value.collector_id) {
    alert("⚠️ الرجاء اختيار المحصل");
    return;
  }

  if (!dailyPayment.value.amount || dailyPayment.value.amount <= 0) {
    alert("⚠️ الرجاء إدخال المبلغ");
    return;
  }

  dailyPaymentLoading.value = true;

  try {
    const collectorId = dailyPayment.value.collector_id;
    const amount = dailyPayment.value.amount;

    const { error: paymentError } = await supabase
      .from("collector_daily_payments")
      .insert([
        {
          collector_id: collectorId,
          payment_date: dailyPayment.value.payment_date,
          amount: amount,
          payment_method: dailyPayment.value.payment_method,
          notes: dailyPayment.value.notes || null,
        },
      ]);

    if (paymentError) throw paymentError;

    await distributeAmountToInstallments(collectorId, amount);

    alert(
      `✅ تم تسجيل الوردية اليومية بنجاح\nالمبلغ: ${formatNumber(amount)} ج`,
    );

    dailyPayment.value = {
      collector_id: "",
      payment_date: new Date().toISOString().split("T")[0],
      amount: 0,
      payment_method: "cash",
      notes: "",
    };

    if (collectorId) {
      await loadCollectorDailyPayments(collectorId);
    }
    await loadDailyPayments();
    await loadInstallments();
    await loadMonthlyReport();
    updateCollectorStats();
  } catch (error) {
    console.error("❌ خطأ:", error);
    alert("❌ خطأ: " + error.message);
  } finally {
    dailyPaymentLoading.value = false;
  }
};

const distributeAmountToInstallments = async (collectorId, amount) => {
  if (amount <= 0) return { remainingAmount: amount, updateLog: [] };

  let remainingAmount = amount;
  const updateLog = [];

  // ✅ زى الكود القديم بالضبط - جيب كل الأقساط
  const { data: installmentsList, error } = await supabase
    .from("collector_installments")
    .select("*")
    .eq("collector_id", collectorId)
    .order("installment_number", { ascending: true });

  if (error) {
    console.error("❌ خطأ في جلب الأقساط:", error);
    return { remainingAmount, updateLog };
  }

  if (!installmentsList || installmentsList.length === 0) {
    console.log("⚠️ لا توجد أقساط");
    return { remainingAmount, updateLog };
  }

  // ✅ توزيع المبلغ على الأقساط بالترتيب (زي الكود القديم)
  for (const installment of installmentsList) {
    if (remainingAmount <= 0) break;

    const remainingInInstallment =
      installment.amount - (installment.paid_amount || 0);
    if (remainingInInstallment <= 0) continue;

    const toPay = Math.min(remainingAmount, remainingInInstallment);
    const newPaidAmount = (installment.paid_amount || 0) + toPay;
    const newStatus = newPaidAmount >= installment.amount ? "paid" : "pending";

    const { error: updateError } = await supabase
      .from("collector_installments")
      .update({
        paid_amount: newPaidAmount,
        paid_date:
          newStatus === "paid" ? new Date().toISOString().split("T")[0] : null,
        status: newStatus,
      })
      .eq("id", installment.id);

    if (updateError) {
      console.error(`❌ خطأ في تحديث القسط ${installment.id}:`, updateError);
    } else {
      console.log(
        `✅ تم توزيع ${formatNumber(toPay)} ج على قسط ${installment.installment_number}`,
      );
      updateLog.push({
        installment_number: installment.installment_number,
        amount_paid: toPay,
        due_date: installment.due_date,
        remaining_in_installment: remainingInInstallment - toPay,
        new_status: newStatus,
      });
      remainingAmount -= toPay;
    }
  }

  return { remainingAmount, updateLog };
};

// ===================== Monthly Report =====================

const monthlyReport = ref([]);
const totalMonthlyReport = ref({
  standing_fans: 0,
  wall_fans: 0,
  ceiling_fans: 0,
  total_fans: 0,
  amount_due: 0,
  amount_paid: 0,
  amount_remaining: 0,
});

const loadMonthlyReport = async () => {
  if (!selectedCollectorId.value) {
    monthlyReport.value = [];
    return;
  }
  try {
    const { data: installmentsList, error: instError } = await supabase
      .from("collector_installments")
      .select("*")
      .eq("collector_id", selectedCollectorId.value)
      .order("due_date", { ascending: true });

    if (instError) throw instError;
    if (!installmentsList || installmentsList.length === 0) {
      monthlyReport.value = [];
      return;
    }

    console.log("📊 installmentsList:", installmentsList);

    const groupedByMonth = {};
    installmentsList.forEach((inst) => {
      const dueDate = new Date(inst.due_date);
      const monthKey = `${dueDate.getFullYear()}-${dueDate.getMonth() + 1}`;
      const monthName = dueDate.toLocaleDateString("ar-EG", { month: "long" });
      const year = dueDate.getFullYear();
      const month = dueDate.getMonth() + 1;

      if (!groupedByMonth[monthKey]) {
        groupedByMonth[monthKey] = {
          month_name: monthName,
          year: year,
          month: month,
          due_date: dueDate,
          total_amount: 0,
          total_paid: 0,
          total_remaining: 0,
          installment_ids: [],
        };
      }
      groupedByMonth[monthKey].total_amount += inst.amount;
      groupedByMonth[monthKey].total_paid += inst.paid_amount || 0;
      groupedByMonth[monthKey].total_remaining +=
        inst.amount - (inst.paid_amount || 0);
      groupedByMonth[monthKey].installment_ids.push(inst.id);
    });

    const months = Object.values(groupedByMonth);
    months.sort((a, b) => a.due_date - b.due_date);

    const { data: deliveriesList } = await supabase
      .from("collector_fans_delivery")
      .select("*")
      .eq("collector_id", selectedCollectorId.value);

    let totalStanding = 0,
      totalWall = 0,
      totalCeiling = 0;
    deliveriesList?.forEach((d) => {
      totalStanding += d.standing_fans_quantity || 0;
      totalWall += d.wall_fans_quantity || 0;
      totalCeiling += d.ceiling_fans_quantity || 0;
    });
    const totalFans = totalStanding + totalWall + totalCeiling;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const finalMonths = months.map((month) => ({
      ...month,
      standing_fans: totalStanding,
      wall_fans: totalWall,
      ceiling_fans: totalCeiling,
      total_fans: totalFans,
      amount_due: month.total_amount,
      amount_paid: month.total_paid,
      amount_remaining: month.total_remaining,
      is_late: month.due_date < today && month.total_remaining > 0,
      status:
        month.total_remaining <= 0
          ? "paid"
          : month.due_date < today
            ? "late"
            : "pending",
      installment_id: month.installment_ids[0] || null,
      installment_ids: month.installment_ids,
    }));

    monthlyReport.value = finalMonths;

    totalMonthlyReport.value = {
      standing_fans: totalStanding,
      wall_fans: totalWall,
      ceiling_fans: totalCeiling,
      total_fans: totalFans,
      amount_due: finalMonths.reduce((sum, m) => sum + m.amount_due, 0),
      amount_paid: finalMonths.reduce((sum, m) => sum + m.amount_paid, 0),
      amount_remaining: finalMonths.reduce(
        (sum, m) => sum + m.amount_remaining,
        0,
      ),
    };

    console.log("📊 monthlyReport:", finalMonths);
  } catch (err) {
    console.error("❌ خطأ:", err);
    monthlyReport.value = [];
  }
};

// ===================== Payment Functions =====================

const payMonthlyInstallment = async (month) => {
  if (!userStore.canEdit) {
    alert("⚠️ ليس لديك صلاحية لتسديد الأقساط");
    return;
  }

  if (!selectedCollectorId.value) {
    alert("⚠️ الرجاء اختيار المحصل أولاً");
    return;
  }

  const amount = month.amount_remaining || 0;
  if (!amount || amount <= 0) {
    alert("✅ هذا القسط مدفوع بالفعل");
    return;
  }

  let idsToPay = [];
  if (
    month.installment_ids &&
    Array.isArray(month.installment_ids) &&
    month.installment_ids.length > 0
  ) {
    idsToPay = month.installment_ids;
  } else if (month.installment_id) {
    idsToPay = [month.installment_id];
  } else {
    alert("⚠️ لا يوجد قسط محدد للسداد");
    return;
  }

  const method = prompt("طريقة الدفع:\n1 - كاش\n2 - تحويل بنكي", "1");
  if (!method || (method !== "1" && method !== "2")) {
    alert("❌ تم إلغاء العملية");
    return;
  }

  try {
    let remainingAmount = amount;
    for (const installmentId of idsToPay) {
      if (remainingAmount <= 0) break;

      const { data: installment, error: fetchError } = await supabase
        .from("collector_installments")
        .select("*")
        .eq("id", installmentId)
        .single();

      if (fetchError) {
        console.error("❌ خطأ في جلب القسط:", fetchError);
        continue;
      }

      const remainingInInst =
        installment.amount - (installment.paid_amount || 0);
      if (remainingInInst <= 0) continue;

      const toPay = Math.min(remainingAmount, remainingInInst);
      const newPaidAmount = (installment.paid_amount || 0) + toPay;
      const newStatus =
        newPaidAmount >= installment.amount ? "paid" : "pending";

      const { error: updateError } = await supabase
        .from("collector_installments")
        .update({
          paid_amount: newPaidAmount,
          paid_date:
            newStatus === "paid"
              ? new Date().toISOString().split("T")[0]
              : null,
          status: newStatus,
          notes: `تم السداد يدوياً - ${new Date().toLocaleString("ar-EG")}`,
        })
        .eq("id", installmentId);

      if (updateError) throw updateError;

      remainingAmount -= toPay;
    }

    alert(`✅ تم تسديد ${formatNumber(amount)} ج بنجاح`);

    await loadInstallments();
    await loadMonthlyReport();
  } catch (error) {
    console.error("❌ خطأ:", error);
    alert("خطأ: " + error.message);
  }
};

const payMonthlyInstallmentFromReport = async (collectorId, month) => {
  if (!userStore.canEdit) {
    alert("⚠️ ليس لديك صلاحية لتسديد الأقساط");
    return;
  }

  // ✅ التأكد من وجود المبلغ المتبقي
  const amount = month.total_remaining || 0;
  if (!amount || amount <= 0) {
    alert("✅ هذا القسط مدفوع بالفعل");
    return;
  }

  // ✅ تحديد ids الأقساط
  let idsToPay = [];
  if (
    month.installment_ids &&
    Array.isArray(month.installment_ids) &&
    month.installment_ids.length > 0
  ) {
    idsToPay = month.installment_ids;
  } else {
    // ✅ لو مفيش IDs، حاول تجيب الأقساط من قاعدة البيانات
    const { data: installmentsInMonth } = await supabase
      .from("collector_installments")
      .select("id")
      .eq("collector_id", collectorId)
      .gte(
        "due_date",
        `${month.year}-${String(month.month).padStart(2, "0")}-01`,
      )
      .lt(
        "due_date",
        `${month.year}-${String(month.month + 1).padStart(2, "0")}-01`,
      );

    if (installmentsInMonth && installmentsInMonth.length > 0) {
      idsToPay = installmentsInMonth.map((i) => i.id);
    }
  }

  if (idsToPay.length === 0) {
    alert("⚠️ لا يوجد قسط محدد للسداد");
    return;
  }

  const method = prompt("طريقة الدفع:\n1 - كاش\n2 - تحويل بنكي", "1");
  if (!method || (method !== "1" && method !== "2")) {
    alert("❌ تم إلغاء العملية");
    return;
  }

  const paymentMethodValue = method === "1" ? "cash" : "transfer";

  try {
    // ✅ 1. تسجيل الوردية اليومية
    const { error: paymentError } = await supabase
      .from("collector_daily_payments")
      .insert([
        {
          collector_id: collectorId,
          payment_date: new Date().toISOString().split("T")[0],
          amount: amount,
          payment_method: paymentMethodValue,
          notes: `سداد قسط شهر ${month.month_name} ${month.year}`,
        },
      ]);

    if (paymentError) throw paymentError;

    // ✅ 2. تحديث الأقساط
    let remainingAmount = amount;
    for (const installmentId of idsToPay) {
      if (remainingAmount <= 0) break;

      const { data: installment, error: fetchError } = await supabase
        .from("collector_installments")
        .select("*")
        .eq("id", installmentId)
        .single();

      if (fetchError) {
        console.error("❌ خطأ في جلب القسط:", fetchError);
        continue;
      }

      const remainingInInst =
        installment.amount - (installment.paid_amount || 0);
      if (remainingInInst <= 0) continue;

      const toPay = Math.min(remainingAmount, remainingInInst);
      const newPaidAmount = (installment.paid_amount || 0) + toPay;
      const newStatus =
        newPaidAmount >= installment.amount ? "paid" : "pending";

      const { error: updateError } = await supabase
        .from("collector_installments")
        .update({
          paid_amount: newPaidAmount,
          paid_date:
            newStatus === "paid"
              ? new Date().toISOString().split("T")[0]
              : null,
          status: newStatus,
        })
        .eq("id", installmentId);

      if (updateError) throw updateError;

      remainingAmount -= toPay;
    }

    alert(`✅ تم تسديد ${formatNumber(amount)} ج بنجاح`);

    // ✅ إعادة تحميل البيانات
    await loadInstallments();
    await loadDailyPayments();
    await loadMonthlyReport();
  } catch (error) {
    console.error("❌ خطأ:", error);
    alert("خطأ: " + error.message);
  }
};

const editMonthlyInstallment = (month) => {
  if (!userStore.canEdit) {
    alert("⚠️ ليس لديك صلاحية لتعديل الأقساط");
    return;
  }

  console.log("📦 month data:", month);
  console.log("🔑 installment_id:", month.installment_id);

  // ✅ استخدام installment_id من month
  const installmentId =
    month.installment_id || (month.installment_ids && month.installment_ids[0]);

  if (!installmentId) {
    alert(
      "⚠️ لا يوجد قسط محدد للتعديل. قد يكون هذا الشهر مجمع من عدة أقساط، يرجى تعديل كل قسط على حدة.",
    );
    return;
  }

  // ✅ تعبئة الفورم
  editInstallmentForm.value = {
    id: installmentId,
    installment_id: installmentId,
    month_name: month.month_name || "",
    year: month.year || "",
    due_date: month.due_date || "",
    amount: month.amount_due || 0,
    paid_amount: month.amount_paid || 0,
    fan_quantity: month.total_fans || 0,
  };

  showEditInstallmentModal.value = true;
};

const updateMonthlyInstallment = async () => {
  if (!userStore.canEdit) {
    alert("⚠️ ليس لديك صلاحية لتعديل الأقساط");
    return;
  }
  // ✅ استخدم installment_id
  const installmentId =
    editInstallmentForm.value.installment_id || editInstallmentForm.value.id;
  // ✅ استخدام installment_id زي الكود القديم
  if (!editInstallmentForm.value.installment_id) {
    alert("⚠️ لا يوجد قسط محدد للتعديل");
    return;
  }

  // ✅ التحقق من صحة البيانات (زي الكود القديم)
  if (
    editInstallmentForm.value.paid_amount > editInstallmentForm.value.amount
  ) {
    alert(`⚠️ خطأ: المبلغ المدفوع لا يمكن أن يزيد عن قيمة القسط`);
    return;
  }

  if (editInstallmentForm.value.amount <= 0) {
    alert("⚠️ خطأ: قيمة القسط يجب أن تكون أكبر من صفر");
    return;
  }

  try {
    const newRemaining =
      editInstallmentForm.value.amount - editInstallmentForm.value.paid_amount;
    const newStatus = newRemaining <= 0 ? "paid" : "pending";

    // ✅ تحديث باستخدام installment_id (زي الكود القديم)
    const { error } = await supabase
      .from("collector_installments")
      .update({
        amount: editInstallmentForm.value.amount,
        paid_amount: editInstallmentForm.value.paid_amount,
        due_date: editInstallmentForm.value.due_date,
        fan_quantity: editInstallmentForm.value.fan_quantity,
        status: newStatus,
        notes: `تم التعديل يدوياً - ${new Date().toLocaleString("ar-EG")}`,
      })
      .eq("id", editInstallmentForm.value.installment_id); // ✅ استخدم installment_id

    if (error) throw error;

    alert("✅ تم تعديل القسط بنجاح");
    showEditInstallmentModal.value = false;

    // ✅ إعادة تحميل البيانات
    await loadInstallments();
    await loadMonthlyReport();

    // ✅ إعادة تعيين الفورم
    editInstallmentForm.value = {
      id: null,
      installment_id: null,
      month_name: "",
      year: "",
      due_date: "",
      amount: 0,
      paid_amount: 0,
      fan_quantity: 0,
    };
  } catch (error) {
    console.error("❌ خطأ:", error);
    alert("خطأ: " + error.message);
  }
};

const deleteMonthlyInstallment = async (month) => {
  if (!userStore.canEdit) {
    alert("⚠️ ليس لديك صلاحية لحذف الأقساط");
    return;
  }

  const idsToDelete =
    month.installment_ids || [month.installment_id].filter(Boolean);

  if (idsToDelete.length === 0) {
    alert("⚠️ لا يوجد قسط محدد للحذف");
    return;
  }

  if (
    !confirm(
      `⚠️ هل أنت متأكد من حذف ${idsToDelete.length} قسط(اقط) لشهر ${month.month_name || ""} ${month.year || ""}؟\n\n` +
        `القسط: ${formatNumber(month.amount_due || 0)} ج\n` +
        `المدفوع: ${formatNumber(month.amount_paid || 0)} ج\n\n` +
        `لا يمكن التراجع عن هذا الإجراء!`,
    )
  )
    return;

  try {
    for (const id of idsToDelete) {
      const { error } = await supabase
        .from("collector_installments")
        .delete()
        .eq("id", id);

      if (error) throw error;
    }

    alert(`✅ تم حذف ${idsToDelete.length} قسط(اقط) بنجاح`);

    await loadInstallments();
    await loadMonthlyReport();
  } catch (error) {
    console.error("❌ خطأ:", error);
    alert("خطأ: " + error.message);
  }
};

// ===================== Collector CRUD =====================

const openCollectorModal = () => {
  isEditingCollector.value = false;
  collectorForm.value = {
    id: null,
    name: "",
    phone: "",
    address: "",
    notes: "",
  };
  showCollectorModal.value = true;
};

const editCollector = (collector) => {
  if (!userStore.canEdit) {
    alert("⚠️ ليس لديك صلاحية لتعديل المحصلين");
    return;
  }
  collectorForm.value = { ...collector };
  isEditingCollector.value = true;
  showCollectorModal.value = true;
};

const saveCollector = async () => {
  if (!userStore.canEdit) {
    alert("⚠️ ليس لديك صلاحية لإضافة أو تعديل المحصلين");
    return;
  }
  if (!collectorForm.value.name) {
    alert("الرجاء إدخال الاسم");
    return;
  }
  try {
    if (isEditingCollector.value) {
      await supabase
        .from("collectors")
        .update(collectorForm.value)
        .eq("id", collectorForm.value.id);
      alert("✅ تم تعديل المحصل بنجاح");
    } else {
      await supabase.from("collectors").insert([
        {
          name: collectorForm.value.name,
          phone: collectorForm.value.phone,
          address: collectorForm.value.address,
          notes: collectorForm.value.notes,
        },
      ]);
      alert("✅ تم إضافة المحصل بنجاح");
    }
    await loadCollectors();
    showCollectorModal.value = false;
    collectorForm.value = {
      id: null,
      name: "",
      phone: "",
      address: "",
      notes: "",
    };
    isEditingCollector.value = false;
  } catch (error) {
    alert("خطأ: " + error.message);
  }
};

const deleteCollector = async (id) => {
  if (!userStore.canEdit) {
    alert("⚠️ ليس لديك صلاحية لحذف المحصلين");
    return;
  }
  if (!confirm("هل أنت متأكد من حذف هذا المحصل؟")) return;
  await supabase.from("collectors").delete().eq("id", id);
  await loadCollectors();
  alert("تم الحذف");
};

const navigateToCollector = (id) => {
  navigateTo(`/dashboard/collector-fans/collector-dashboard?id=${id}`);
};

// ===================== Daily Payment Edit/Delete =====================

const editDailyPayment = (payment) => {
  console.log("✏️ تعديل الوردية:", payment);

  if (!userStore.canEdit) {
    alert("⚠️ ليس لديك صلاحية لتعديل الورديات");
    return;
  }

  // ✅ تعبئة الفورم
  dailyPaymentForm.value = {
    id: payment.id,
    payment_date:
      payment.payment_date || new Date().toISOString().split("T")[0],
    amount: payment.amount || 0,
    payment_method: payment.payment_method || "cash",
    notes: payment.notes || "",
  };

  console.log("📦 dailyPaymentForm بعد التعبئة:", dailyPaymentForm.value);

  showDailyPaymentModal.value = true;
};

const updateDailyPayment = async () => {
  if (!userStore.canEdit) {
    alert("⚠️ ليس لديك صلاحية لتعديل الورديات");
    return;
  }
  if (!dailyPaymentForm.value.id) return;
  try {
    const { data: oldPayment } = await supabase
      .from("collector_daily_payments")
      .select("*")
      .eq("id", dailyPaymentForm.value.id)
      .single();
    const oldAmount = oldPayment.amount,
      newAmount = dailyPaymentForm.value.amount,
      amountDiff = newAmount - oldAmount,
      collectorId = oldPayment.collector_id;

    await supabase
      .from("collector_daily_payments")
      .update({
        payment_date: dailyPaymentForm.value.payment_date,
        amount: newAmount,
        payment_method: dailyPaymentForm.value.payment_method,
        notes: dailyPaymentForm.value.notes,
      })
      .eq("id", dailyPaymentForm.value.id);

    if (amountDiff !== 0) {
      if (amountDiff > 0) {
        await distributeAmountToInstallments(
          collectorId,
          amountDiff,
          dailyPaymentForm.value.payment_date,
        );
      } else {
        await removeAmountFromInstallments(collectorId, Math.abs(amountDiff));
      }
    }
    alert("✅ تم تعديل الوردية وتحديث الأقساط بنجاح");
    showDailyPaymentModal.value = false;
    await loadDailyPayments();
    await loadInstallments();
    await loadMonthlyReport();
    updateCollectorStats();
    if (selectedCollectorId.value === collectorId)
      await loadCollectorDailyPayments(collectorId);
  } catch (error) {
    alert("خطأ: " + error.message);
  }
};

const deleteDailyPayment = async (id) => {
  if (!userStore.canEdit) {
    alert("⚠️ ليس لديك صلاحية لحذف الورديات");
    return;
  }
  if (
    !confirm(
      "⚠️ هل أنت متأكد من حذف هذه الوردية؟\nسيتم أيضاً استرجاع المبلغ من الأقساط التي تم توزيعها عليها.",
    )
  )
    return;
  try {
    const { data: payment } = await supabase
      .from("collector_daily_payments")
      .select("*")
      .eq("id", id)
      .single();
    const collectorId = payment.collector_id;
    await supabase.from("collector_daily_payments").delete().eq("id", id);
    await removeAmountFromInstallments(collectorId, payment.amount);
    await loadDailyPayments();
    await loadInstallments();
    await loadMonthlyReport();
    updateCollectorStats();
    if (selectedCollectorId.value === collectorId)
      await loadCollectorDailyPayments(collectorId);
    alert(
      `✅ تم حذف الوردية بنجاح\nتم استرجاع ${formatNumber(payment.amount)} ج من الأقساط`,
    );
  } catch (error) {
    alert("خطأ: " + error.message);
  }
};

const removeAmountFromInstallments = async (collectorId, amount) => {
  if (amount <= 0) return { remainingAmount: amount };
  let remainingAmount = amount;
  const { data: installmentsList } = await supabase
    .from("collector_installments")
    .select("*")
    .eq("collector_id", collectorId)
    .gt("paid_amount", 0)
    .order("installment_number", { ascending: false });
  if (!installmentsList) return { remainingAmount };
  for (let installment of installmentsList) {
    if (remainingAmount <= 0) break;
    const currentPaid = installment.paid_amount || 0;
    if (currentPaid <= 0) continue;
    const toRemove = Math.min(remainingAmount, currentPaid);
    const newPaidAmount = currentPaid - toRemove;
    const newStatus = newPaidAmount <= 0 ? "pending" : "pending";
    await supabase
      .from("collector_installments")
      .update({
        paid_amount: newPaidAmount,
        paid_date: newPaidAmount <= 0 ? null : installment.paid_date,
        status: newStatus,
      })
      .eq("id", installment.id);
    remainingAmount -= toRemove;
  }
  return { remainingAmount };
};

// ===================== Payment Modal =====================

const processInstallmentPayment = async () => {
  if (!userStore.canEdit) {
    alert("⚠️ ليس لديك صلاحية لتسديد الأقساط");
    return;
  }
  if (!selectedInstallment.value) return;
  try {
    await supabase
      .from("collector_installments")
      .update({
        paid_amount: selectedInstallment.value.amount,
        paid_date: new Date().toISOString().split("T")[0],
        status: "paid",
        notes: paymentNotes.value,
      })
      .eq("id", selectedInstallment.value.id);
    alert("✅ تم تسجيل سداد القسط بنجاح");
    showPaymentModal.value = false;
    await loadInstallments();
  } catch (error) {
    alert("خطأ: " + error.message);
  }
};

// ===================== Supplier Functions =====================

const paySupplierInstallment = async (purchase) => {
  if (!userStore.canEdit) {
    alert("⚠️ ليس لديك صلاحية لتسديد الأقساط");
    return;
  }
  selectedSupplierPurchase.value = purchase;
  supplierPaymentAmount.value = purchase.remaining;
  supplierPaymentDate.value = new Date().toISOString().split("T")[0];
  showSupplierPaymentModal.value = true;
};

const processSupplierPayment = async () => {
  if (!selectedSupplierPurchase.value) return;
  if (!supplierPaymentAmount.value || supplierPaymentAmount.value <= 0) {
    alert("⚠️ الرجاء إدخال المبلغ");
    return;
  }

  try {
    const purchase = selectedSupplierPurchase.value;
    const newPaid = (purchase.paid_amount || 0) + supplierPaymentAmount.value;
    const remaining = purchase.total - newPaid;

    const { error } = await supabase
      .from("supplier_purchases")
      .update({
        paid_amount: newPaid,
      })
      .eq("id", purchase.id);

    if (error) throw error;

    alert(`✅ تم تسديد ${formatNumber(supplierPaymentAmount.value)} ج بنجاح`);

    showSupplierPaymentModal.value = false;
    selectedSupplierPurchase.value = null;
    supplierPaymentAmount.value = 0;

    await supplierManagementRef.value?.loadSupplierPurchases();
    await loadDeliveries();
    await updateFanStats();
  } catch (error) {
    console.error("❌ خطأ:", error);
    alert("خطأ: " + error.message);
  }
};

const deleteSupplierPurchase = async (id) => {
  if (!userStore.canEdit) {
    alert("⚠️ ليس لديك صلاحية لحذف المشتريات");
    return;
  }

  if (!confirm("⚠️ هل أنت متأكد من حذف هذه الفاتورة؟")) return;

  try {
    const { error } = await supabase
      .from("supplier_purchases")
      .delete()
      .eq("id", id);

    if (error) throw error;

    alert("✅ تم حذف الفاتورة بنجاح");
    await supplierManagementRef.value?.loadSupplierPurchases();
    await loadDeliveries();
    await updateFanStats();
  } catch (error) {
    console.error("❌ خطأ:", error);
    alert("خطأ: " + error.message);
  }
};

// ===================== Fan Expenses =====================

const updateFanExpensesTotal = (total) => {
  console.log("📥 استقبال التحديث من FanExpenses:", total);
  fanExpensesTotal.value = total;
  console.log("✅ fanExpensesTotal بعد التحديث:", fanExpensesTotal.value);
};

watch(fanExpensesTotal, (newVal) => {
  console.log("👀 fanExpensesTotal تغيرت إلى:", newVal);
});

// ===================== Tabs =====================

const tabs = [
  { name: "تسليم مراوح", value: "delivery", icon: "📦" },
  { name: "وردية يومية", value: "daily_payment", icon: "💵" },
  { name: "المحصلين", value: "collectors", icon: "👥" },
  { name: "الأقساط الشهرية", value: "installments", icon: "📋" },
  { name: "تقارير المحصلين", value: "report", icon: "📊" },
  { name: "مورد المراوح", value: "supplier", icon: "🏭" },
  { name: "مصاريف المراوح", value: "expenses", icon: "💰" },
];

// ===================== Watchers =====================

watch(
  () => dailyPayment.value.collector_id,
  async (newVal) => {
    if (newVal) await loadCollectorDailyPayments(newVal);
    else selectedCollectorDailyPayments.value = [];
  },
);

watch(selectedCollectorId, () => {
  if (selectedCollectorId.value) loadMonthlyReport();
  else monthlyReport.value = [];
});

// ===================== On Mounted =====================

onMounted(async () => {
  await loadCollectors();
  await loadDeliveries();
  await loadInstallments();
  await loadDailyPayments();
  await updateFanStats();
});
</script>
