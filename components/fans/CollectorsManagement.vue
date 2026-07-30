<!-- components/fans/CollectorsManagement.vue -->
<template>
  <div dir="rtl" class="bg-white rounded-2xl shadow p-4 sm:p-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h2 class="text-lg sm:text-xl font-bold text-gray-800">⚙️ إدارة المحصلين</h2>
        <p class="text-sm text-gray-500">إضافة وتعديل المحصلين مع بيانات الدخول</p>
      </div>
      <button
        v-if="userStore?.canEdit"
        @click="openAddModal"
        class="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition flex items-center gap-2 text-sm"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        إضافة محصل
      </button>
    </div>

    <!-- Search & Filter -->
    <div class="flex flex-col sm:flex-row gap-3 mb-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="🔍 بحث باسم المحصل أو المنطقة..."
        class="flex-1 p-3 border rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
      />
      <select
        v-model="filterArea"
        class="p-3 border rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
      >
        <option value="">كل المناطق</option>
        <option v-for="area in areas" :key="area" :value="area">{{ area }}</option>
      </select>
      <select
        v-model="filterStatus"
        class="p-3 border rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
      >
        <option value="">كل الحالات</option>
        <option value="active">✅ نشط</option>
        <option value="inactive">❌ غير نشط</option>
      </select>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full min-w-[800px] text-sm">
        <thead class="bg-gray-50 border-b">
          <tr>
            <th class="p-3 text-right">#</th>
            <th class="p-3 text-right">الاسم</th>
            <th class="p-3 text-right">الهاتف</th>
            <th class="p-3 text-right">المنطقة</th>
            <th class="p-3 text-right hidden md:table-cell">البريد الإلكتروني</th>
            <th class="p-3 text-right">الحالة</th>
            <th class="p-3 text-right">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(collector, idx) in filteredCollectors" :key="collector.id" class="border-t hover:bg-gray-50">
            <td class="p-3">{{ idx + 1 }}</td>
            <td class="p-3 font-medium">{{ collector.name }}</td>
            <td class="p-3 dir-ltr">{{ collector.phone }}</td>
            <td class="p-3">{{ collector.area || 'غير محدد' }}</td>
            <td class="p-3 hidden md:table-cell dir-ltr">{{ collector.email || '---' }}</td>
            <td class="p-3">
              <span :class="collector.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'" class="px-2 py-1 rounded-full text-xs">
                {{ collector.status === 'active' ? '✅ نشط' : '❌ غير نشط' }}
              </span>
            </td>
            <td class="p-3">
              <div class="flex gap-1 flex-wrap">
                <button @click="openEditModal(collector)" class="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg text-xs transition">
                  ✏️ تعديل
                </button>
                <button @click="deleteCollector(collector.id)" class="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-lg text-xs transition">
                  🗑️ حذف
                </button>
                <button @click="resetPassword(collector)" class="text-orange-600 hover:text-orange-800 bg-orange-50 hover:bg-orange-100 px-2 py-1 rounded-lg text-xs transition">
                  🔑 كلمة مرور
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="filteredCollectors.length === 0">
            <td colspan="7" class="text-center py-12 text-gray-400">
              <span class="text-4xl block mb-2">👤</span>
              لا توجد محصلين
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ================= Modal إضافة/تعديل محصل ================= -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="showModal = false">
      <div class="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div class="sticky top-0 bg-white border-b p-4 rounded-t-3xl">
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-bold">{{ isEditing ? '✏️ تعديل محصل' : '➕ إضافة محصل جديد' }}</h2>
            <button @click="showModal = false" class="text-2xl hover:text-gray-600">&times;</button>
          </div>
        </div>

        <div class="p-6">
          <form @submit.prevent="saveCollector" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  <span class="text-red-500">*</span> الاسم
                </label>
                <input v-model="form.name" type="text" required placeholder="اسم المحصل"
                  class="w-full p-3 border rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  <span class="text-red-500">*</span> رقم الهاتف
                </label>
                <input v-model="form.phone" type="tel" required placeholder="رقم الهاتف"
                  class="w-full p-3 border rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition dir-ltr" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  <span class="text-red-500">*</span> المنطقة
                </label>
                <input v-model="form.area" type="text" required placeholder="المنطقة"
                  class="w-full p-3 border rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">رقم البطاقة</label>
                <input v-model="form.id_number" type="text" placeholder="رقم البطاقة"
                  class="w-full p-3 border rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition dir-ltr" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  <span class="text-red-500">*</span> البريد الإلكتروني
                </label>
                <input v-model="form.email" type="email" required placeholder="البريد الإلكتروني"
                  class="w-full p-3 border rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition dir-ltr" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  <span class="text-red-500">*</span> كلمة المرور
                </label>
                <div class="relative">
                  <input v-model="form.password" :type="showPassword ? 'text' : 'password'" required placeholder="كلمة المرور"
                    class="w-full p-3 border rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition dir-ltr" />
                  <button type="button" @click="showPassword = !showPassword"
                    class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {{ showPassword ? '🙈' : '👁️' }}
                  </button>
                </div>
                <p class="text-xs text-gray-400 mt-1">{{ isEditing ? 'اتركه فارغاً للحفاظ على كلمة المرور الحالية' : '' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">تاريخ التعاقد</label>
                <input v-model="form.start_date" type="date"
                  class="w-full p-3 border rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                <select v-model="form.status"
                  class="w-full p-3 border rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition">
                  <option value="active">✅ نشط</option>
                  <option value="inactive">❌ غير نشط</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">نوع المحصل</label>
                <select v-model="form.collector_type"
                  class="w-full p-3 border rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition">
                  <option value="normal">👤 عادي</option>
                  <option value="supervisor">👑 مشرف</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
              <textarea v-model="form.address" rows="2" placeholder="العنوان بالتفصيل"
                class="w-full p-3 border rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
              <textarea v-model="form.notes" rows="2" placeholder="أي ملاحظات إضافية"
                class="w-full p-3 border rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"></textarea>
            </div>

            <div class="flex gap-3 pt-4 border-t">
              <button type="submit" :disabled="loading"
                class="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50">
                {{ loading ? 'جاري الحفظ...' : isEditing ? '💾 تحديث' : '✅ إضافة' }}
              </button>
              <button type="button" @click="showModal = false"
                class="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition">
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <ToastNotification v-model:toast="toast" />
  </div>
</template>

<script setup>
import { supabase } from '~/lib/supabase';

const props = defineProps({
  userStore: { type: Object, required: true },
});

const emit = defineEmits(['refresh']);

const toast = ref({ show: false, message: "", type: "success", icon: "✅" });
const loading = ref(false);
const showModal = ref(false);
const isEditing = ref(false);
const showPassword = ref(false);
const searchQuery = ref("");
const filterArea = ref("");
const filterStatus = ref("");

const collectors = ref([]);
const areas = ref([]);

const form = ref({
  id: null,
  name: "",
  phone: "",
  address: "",
  id_number: "",
  email: "",
  password: "",
  area: "",
  start_date: new Date().toISOString().split("T")[0],
  status: "active",
  collector_type: "normal",
  notes: "",
});

const showToast = (message, type = "success") => {
  const icons = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" };
  toast.value = { show: true, message, type, icon: icons[type] || "✅" };
  setTimeout(() => { toast.value.show = false; }, 3000);
};

const loadCollectors = async () => {
  try {
    const { data, error } = await supabase
      .from("collectors")
      .select("*")
      .order("name");

    if (error) throw error;
    collectors.value = data || [];

    const uniqueAreas = [...new Set(data?.map(c => c.area).filter(Boolean))];
    areas.value = uniqueAreas;
  } catch (error) {
    console.error("❌ Error loading collectors:", error);
    showToast("❌ خطأ في تحميل المحصلين", "error");
  }
};

const filteredCollectors = computed(() => {
  let result = collectors.value;

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.area?.toLowerCase().includes(q) ||
      c.phone?.includes(q)
    );
  }

  if (filterArea.value) {
    result = result.filter(c => c.area === filterArea.value);
  }

  if (filterStatus.value) {
    result = result.filter(c => c.status === filterStatus.value);
  }

  return result;
});

const openAddModal = () => {
  isEditing.value = false;
  form.value = {
    id: null,
    name: "",
    phone: "",
    address: "",
    id_number: "",
    email: "",
    password: "",
    area: "",
    start_date: new Date().toISOString().split("T")[0],
    status: "active",
    collector_type: "normal",
    notes: "",
  };
  showModal.value = true;
};

const openEditModal = (collector) => {
  isEditing.value = true;
  form.value = {
    id: collector.id,
    name: collector.name || "",
    phone: collector.phone || "",
    address: collector.address || "",
    id_number: collector.id_number || "",
    email: collector.email || "",
    password: "",
    area: collector.area || "",
    start_date: collector.start_date || new Date().toISOString().split("T")[0],
    status: collector.status || "active",
    collector_type: collector.collector_type || "normal",
    notes: collector.notes || "",
  };
  showModal.value = true;
};

const saveCollector = async () => {
  if (!props.userStore.canEdit) {
    showToast("⚠️ ليس لديك صلاحية", "warning");
    return;
  }

  if (!form.value.name) {
    showToast("⚠️ الرجاء إدخال الاسم", "warning");
    return;
  }
  if (!form.value.phone) {
    showToast("⚠️ الرجاء إدخال رقم الهاتف", "warning");
    return;
  }
  if (!form.value.email) {
    showToast("⚠️ الرجاء إدخال البريد الإلكتروني", "warning");
    return;
  }
  if (!form.value.area) {
    showToast("⚠️ الرجاء إدخال المنطقة", "warning");
    return;
  }

  if (!isEditing.value && !form.value.password) {
    showToast("⚠️ الرجاء إدخال كلمة المرور", "warning");
    return;
  }

  loading.value = true;

  try {
    const dataToSave = {
      name: form.value.name,
      phone: form.value.phone,
      address: form.value.address,
      id_number: form.value.id_number,
      email: form.value.email,
      area: form.value.area,
      start_date: form.value.start_date,
      status: form.value.status,
      collector_type: form.value.collector_type,
      notes: form.value.notes,
    };

    if (form.value.password) {
      dataToSave.password = form.value.password;
    }

    if (isEditing.value) {
      const { error } = await supabase
        .from("collectors")
        .update(dataToSave)
        .eq("id", form.value.id);

      if (error) throw error;
      showToast("✅ تم تعديل المحصل بنجاح", "success");
    } else {
      const { error } = await supabase
        .from("collectors")
        .insert([dataToSave]);

      if (error) throw error;
      showToast("✅ تم إضافة المحصل بنجاح", "success");
    }

    showModal.value = false;
    await loadCollectors();
    emit('refresh');
  } catch (error) {
    console.error("❌ Error saving collector:", error);
    showToast("❌ خطأ: " + error.message, "error");
  } finally {
    loading.value = false;
  }
};

const deleteCollector = async (id) => {
  if (!props.userStore.canEdit) {
    showToast("⚠️ ليس لديك صلاحية", "warning");
    return;
  }

  if (!confirm("⚠️ هل أنت متأكد من حذف هذا المحصل؟")) return;

  try {
    const { error } = await supabase
      .from("collectors")
      .delete()
      .eq("id", id);

    if (error) throw error;
    showToast("✅ تم حذف المحصل بنجاح", "success");
    await loadCollectors();
    emit('refresh');
  } catch (error) {
    console.error("❌ Error deleting collector:", error);
    showToast("❌ خطأ: " + error.message, "error");
  }
};

const resetPassword = async (collector) => {
  if (!props.userStore.canEdit) {
    showToast("⚠️ ليس لديك صلاحية", "warning");
    return;
  }

  const newPassword = prompt("أدخل كلمة المرور الجديدة للمحصل:", "123456");
  if (newPassword === null) return;

  if (newPassword.length < 4) {
    showToast("⚠️ كلمة المرور يجب أن تكون 4 أحرف على الأقل", "warning");
    return;
  }

  try {
    const { error } = await supabase
      .from("collectors")
      .update({ password: newPassword })
      .eq("id", collector.id);

    if (error) throw error;
    showToast(`✅ تم إعادة تعيين كلمة المرور للمحصل ${collector.name}`, "success");
  } catch (error) {
    console.error("❌ Error resetting password:", error);
    showToast("❌ خطأ: " + error.message, "error");
  }
};

onMounted(() => {
  loadCollectors();
});
</script>

<style scoped>
.dir-ltr {
  direction: ltr;
  display: inline-block;
}
</style>