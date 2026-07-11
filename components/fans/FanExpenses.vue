<!-- components/fans/FanExpenses.vue -->
<template>
  <div dir="rtl" class="space-y-6">
    <!-- بطاقات إحصائيات المصاريف -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <div
        class="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl shadow-lg p-5 text-white"
      >
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm opacity-90">💰 إجمالي المصاريف</p>
            <p class="text-3xl font-bold mt-1">
              {{ formatNumber(totalExpensesAmount) }} ج
            </p>
            <p class="text-xs opacity-80 mt-1">كل المصاريف</p>
          </div>
          <div
            class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl"
          >
            💰
          </div>
        </div>
      </div>

      <div
        class="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl shadow-lg p-5 text-white"
      >
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm opacity-90">🔌 مصاريف الموصلات</p>
            <p class="text-3xl font-bold mt-1">
              {{ formatNumber(connectorExpenses) }} ج
            </p>
            <p class="text-xs opacity-80 mt-1">{{ connectorCount }} عملية</p>
          </div>
          <div
            class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl"
          >
            🔌
          </div>
        </div>
      </div>

      <div
        class="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-lg p-5 text-white"
      >
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm opacity-90">💔 هالك المراوح</p>
            <p class="text-3xl font-bold mt-1">
              {{ formatNumber(damageExpenses) }} ج
            </p>
            <p class="text-xs opacity-80 mt-1">{{ damageCount }} مروحة</p>
          </div>
          <div
            class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl"
          >
            💔
          </div>
        </div>
      </div>

      <div
        class="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl shadow-lg p-5 text-white"
      >
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm opacity-90">📦 المصاريف الأخرى</p>
            <p class="text-3xl font-bold mt-1">
              {{ formatNumber(otherExpenses) }} ج
            </p>
            <p class="text-xs opacity-80 mt-1">{{ otherCount }} عملية</p>
          </div>
          <div
            class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl"
          >
            📦
          </div>
        </div>
      </div>
    </div>

    <!-- إضافة مصروف جديد -->
    <div class="bg-white rounded-2xl shadow p-4 sm:p-6">
      <h2 class="text-lg sm:text-xl font-bold mb-4">➕ إضافة مصروف</h2>
      <form @submit.prevent="saveExpense" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">نوع المصروف *</label>
            <select
              v-model="expenseForm.type"
              required
              class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
            >
              <option value="">-- اختر النوع --</option>
              <option value="connector">🔌 موصلات</option>
              <option value="damage">💔 هالك مروحة</option>
              <option value="other">📦 أخرى</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">المبلغ *</label>
            <input
              v-model.number="expenseForm.amount"
              type="number"
              min="1"
              required
              class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1"
              >عدد القطع (للهالك)</label
            >
            <input
              v-model.number="expenseForm.quantity"
              type="number"
              min="0"
              class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
            />
            <p class="text-xs text-gray-500 mt-1">عدد المراوح التالفة</p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">التاريخ</label>
            <input
              v-model="expenseForm.date"
              type="date"
              class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1"
              >رقم الفاتورة (اختياري)</label
            >
            <input
              v-model="expenseForm.invoice_number"
              type="text"
              class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">ملاحظات</label>
          <textarea
            v-model="expenseForm.notes"
            rows="2"
            class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
            placeholder="تفاصيل المصروف..."
          ></textarea>
        </div>

        <div class="bg-gray-100 rounded-xl p-3 sm:p-4">
          <h3 class="font-bold text-base mb-2">📊 ملخص المصروف</h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <p class="text-xs text-gray-600">النوع</p>
              <p class="font-bold">
                {{ getExpenseTypeName(expenseForm.type) }}
              </p>
            </div>
            <div>
              <p class="text-xs text-gray-600">المبلغ</p>
              <p class="font-bold text-red-600">
                {{ formatNumber(expenseForm.amount || 0) }} ج
              </p>
            </div>
            <div>
              <p class="text-xs text-gray-600">العدد</p>
              <p class="font-bold">{{ expenseForm.quantity || 0 }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-600">التاريخ</p>
              <p class="font-bold">{{ formatDate(expenseForm.date) }}</p>
            </div>
          </div>
        </div>

        <button
          v-if="userStore?.canEdit"
          type="submit"
          :disabled="expenseLoading"
          class="w-full bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition text-sm font-medium"
        >
          {{ expenseLoading ? "جاري الحفظ..." : "✅ حفظ المصروف" }}
        </button>
      </form>
    </div>

    <!-- سجل المصاريف -->
    <div class="bg-white rounded-2xl shadow p-4 sm:p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg sm:text-xl font-bold">📋 سجل المصاريف</h2>
        <div class="flex gap-2">
          <select
            v-model="filterExpenseType"
            class="p-2 border rounded-lg text-sm"
          >
            <option value="all">جميع المصاريف</option>
            <option value="connector">🔌 موصلات</option>
            <option value="damage">💔 هالك</option>
            <option value="other">📦 أخرى</option>
          </select>
          <span class="text-xs text-gray-500"
            >إجمالي: {{ expensesList.length }}</span
          >
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[800px] text-sm">
          <thead class="bg-gray-100">
            <tr>
              <th class="p-3 text-right">#</th>
              <th class="p-3 text-right">التاريخ</th>
              <th class="p-3 text-right">النوع</th>
              <th class="p-3 text-right">المبلغ</th>
              <th class="p-3 text-right">العدد</th>
              <th class="p-3 text-right">رقم الفاتورة</th>
              <th class="p-3 text-right hidden md:table-cell">ملاحظات</th>
              <th class="p-3 text-right">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(expense, index) in filteredExpenses"
              :key="expense.id"
              class="border-t hover:bg-gray-50"
            >
              <td class="p-3">{{ index + 1 }}</td>
              <td class="p-3">{{ formatDate(expense.date) }}</td>
              <td class="p-3">
                <span
                  :class="getExpenseTypeClass(expense.type)"
                  class="px-2 py-1 rounded-full text-xs font-medium"
                >
                  {{ getExpenseTypeName(expense.type) }}
                </span>
              </td>
              <td class="p-3 text-red-600 font-bold">
                {{ formatNumber(expense.amount) }} ج
              </td>
              <td class="p-3">{{ expense.quantity || "-" }}</td>
              <td class="p-3">{{ expense.invoice_number || "-" }}</td>
              <td class="p-3 hidden md:table-cell">
                {{ expense.notes || "-" }}
              </td>
              <td class="p-3">
                <button
                  v-if="userStore?.canEdit"
                  @click="deleteExpense(expense.id)"
                  class="text-red-600 hover:text-red-800"
                >
                  🗑️
                </button>
              </td>
            </tr>
            <tr v-if="filteredExpenses.length === 0">
              <td colspan="8" class="text-center py-8 text-gray-400">
                لا توجد مصاريف مسجلة
              </td>
            </tr>
          </tbody>
          <tfoot class="bg-gray-50 font-bold">
            <tr class="border-t">
              <td colspan="3" class="p-3">📌 الإجمالي</td>
              <td class="p-3 text-red-600">
                {{ formatNumber(totalExpensesAmount) }} ج
              </td>
              <td colspan="4"></td>
            </tr>
          </tfoot>
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
const expensesList = ref([]);
const expenseLoading = ref(false);
const filterExpenseType = ref("all");
const emit = defineEmits(["expenses-updated"]);
const expenseForm = ref({
  type: "",
  amount: 0,
  quantity: 0,
  date: new Date().toISOString().split("T")[0],
  invoice_number: "",
  notes: "",
});

// Computed
const totalExpensesAmount = computed(() => {
  return expensesList.value.reduce((sum, e) => sum + (e.amount || 0), 0);
});

const connectorExpenses = computed(() => {
  return expensesList.value
    .filter((e) => e.type === "connector")
    .reduce((sum, e) => sum + (e.amount || 0), 0);
});

const damageExpenses = computed(() => {
  return expensesList.value
    .filter((e) => e.type === "damage")
    .reduce((sum, e) => sum + (e.amount || 0), 0);
});

const otherExpenses = computed(() => {
  return expensesList.value
    .filter((e) => e.type === "other")
    .reduce((sum, e) => sum + (e.amount || 0), 0);
});

const connectorCount = computed(() => {
  return expensesList.value.filter((e) => e.type === "connector").length;
});

const damageCount = computed(() => {
  return expensesList.value.filter((e) => e.type === "damage").length;
});

const otherCount = computed(() => {
  return expensesList.value.filter((e) => e.type === "other").length;
});

const filteredExpenses = computed(() => {
  if (filterExpenseType.value === "all") return expensesList.value;
  return expensesList.value.filter((e) => e.type === filterExpenseType.value);
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

const getExpenseTypeName = (type) => {
  const types = {
    connector: "🔌 موصلات",
    damage: "💔 هالك مروحة",
    other: "📦 أخرى",
  };
  return types[type] || type;
};

const getExpenseTypeClass = (type) => {
  const classes = {
    connector: "bg-yellow-100 text-yellow-700",
    damage: "bg-red-100 text-red-700",
    other: "bg-purple-100 text-purple-700",
  };
  return classes[type] || "bg-gray-100 text-gray-700";
};

// Load expenses
const loadExpenses = async () => {
  try {
    console.log('🔄 جاري تحميل المصاريف...');
    
    const { data, error } = await supabase
      .from('fan_expenses')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      console.error('❌ خطأ في جلب المصاريف:', error);
      return;
    }
    
    console.log('✅ البيانات المسترجعة:', data);
    
    expensesList.value = data || [];
    
    const total = expensesList.value.reduce((sum, e) => sum + (e.amount || 0), 0);
    console.log('💰 الإجمالي المحسوب:', total);
    
    // ✅ إرسال القيمة للأب
    emit('expenses-updated', total);
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  }
};

// Save expense
const saveExpense = async () => {
  if (!userStore.canEdit) {
    alert("⚠️ ليس لديك صلاحية لإضافة مصاريف");
    return;
  }

  if (!expenseForm.value.type) {
    alert("⚠️ الرجاء اختيار نوع المصروف");
    return;
  }

  if (!expenseForm.value.amount || expenseForm.value.amount <= 0) {
    alert("⚠️ الرجاء إدخال المبلغ");
    return;
  }

  expenseLoading.value = true;

  try {
    const { error } = await supabase.from("fan_expenses").insert([
      {
        type: expenseForm.value.type,
        amount: expenseForm.value.amount,
        quantity: expenseForm.value.quantity || 0,
        date: expenseForm.value.date || new Date().toISOString().split("T")[0],
        invoice_number: expenseForm.value.invoice_number || null,
        notes: expenseForm.value.notes || null,
        created_by: userStore.user?.id,
      },
    ]);

    if (error) throw error;

    alert("✅ تم إضافة المصروف بنجاح");

    expenseForm.value = {
      type: "",
      amount: 0,
      quantity: 0,
      date: new Date().toISOString().split("T")[0],
      invoice_number: "",
      notes: "",
    };

    if (success) {
      await loadExpenses(); // هتحدث الإجمالي تلقائياً
    }
  } catch (error) {
    console.error("❌ خطأ:", error);
    alert("خطأ: " + error.message);
  } finally {
    expenseLoading.value = false;
  }
};

// Delete expense
const deleteExpense = async (id) => {
  if (!userStore.canEdit) {
    alert("⚠️ ليس لديك صلاحية لحذف المصاريف");
    return;
  }

  if (!confirm("⚠️ هل أنت متأكد من حذف هذا المصروف؟")) return;

  try {
    const { error } = await supabase.from("fan_expenses").delete().eq("id", id);

    if (error) throw error;

    alert("✅ تم حذف المصروف بنجاح");
    if (success) {
      await loadExpenses(); // هتحدث الإجمالي تلقائياً
    }
  } catch (error) {
    console.error("❌ خطأ:", error);
    alert("خطأ: " + error.message);
  }
};

// Load on mount
onMounted(() => {
  loadExpenses();
});

// Expose for parent
defineExpose({
  loadExpenses,
});
</script>
