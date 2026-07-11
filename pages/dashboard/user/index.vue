<template>
  <div class="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen" dir="rtl">
    <div class="mb-4 sm:mb-6">
      <h1 class="text-2xl sm:text-3xl font-bold mb-2">👥 إدارة المستخدمين والصلاحيات</h1>
      <p class="text-sm sm:text-base text-gray-500">إدارة حسابات المستخدمين وتحديد الصلاحيات المختلفة</p>
    </div>
    
    <!-- Stats Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
      <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white">
        <p class="text-xs sm:text-sm opacity-90">👥 إجمالي المستخدمين</p>
        <p class="text-xl sm:text-2xl font-bold">{{ users.length }}</p>
      </div>
      <div class="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white">
        <p class="text-xs sm:text-sm opacity-90">👑 المديرين</p>
        <p class="text-xl sm:text-2xl font-bold">{{ getUsersByRole('admin') }}</p>
      </div>
      <div class="bg-gradient-to-r from-green-500 to-green-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white">
        <p class="text-xs sm:text-sm opacity-90">🤝 الشركاء</p>
        <p class="text-xl sm:text-2xl font-bold">{{ getUsersByRole('partner') }}</p>
      </div>
      <div class="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white">
        <p class="text-xs sm:text-sm opacity-90">🔄 المحصلين</p>
        <p class="text-xl sm:text-2xl font-bold">{{ getUsersByRole('collector') }}</p>
      </div>
    </div>

    <!-- Search Filter -->
    <div class="mb-4 sm:mb-6">
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="🔍 بحث عن مستخدم... (الإيميل، الاسم، أو الهاتف)"
          class="w-full px-4 py-2.5 sm:py-3 pr-10 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none text-sm sm:text-base"
        />
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow overflow-hidden">
      <!-- Mobile Cards View (visible on small screens) -->
      <div class="block md:hidden divide-y">
        <div v-for="user in filteredUsers" :key="user.id" class="p-4 hover:bg-gray-50">
          <div class="flex justify-between items-start mb-3">
            <div class="flex flex-col gap-1">
              <span class="font-medium text-sm">{{ user.full_name || 'مستخدم بدون اسم' }}</span>
              <span class="text-xs text-gray-500 break-all">{{ user.email }}</span>
            </div>
            <span :class="getRoleBadgeClass(user.role)" class="px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap">
              {{ getRoleName(user.role) }}
            </span>
          </div>
          
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">📞 الهاتف:</span>
              <span class="dir-ltr">{{ user.phone || 'غير مسجل' }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-500">🔧 الصلاحية:</span>
              <select 
                :value="user.role" 
                @change="updateRole(user.id, $event.target.value)"
                class="px-2 py-1 border rounded-lg text-sm font-medium"
              >
                <option value="customer">👤 عميل</option>
                <option value="collector">🔄 محصل</option>
                <option value="partner">🤝 شريك</option>
                <option value="admin">👑 مدير</option>
              </select>
            </div>
            <div class="flex justify-end pt-2">
              <button @click="viewUserDetails(user)" class="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1">
                👁️ عرض التفاصيل
              </button>
            </div>
          </div>
        </div>
        <div v-if="filteredUsers.length === 0" class="text-center py-12 text-gray-400">
          لا توجد مستخدمين مطابقين للبحث
        </div>
      </div>

      <!-- Desktop Table View (hidden on mobile) -->
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full min-w-[800px]">
          <thead class="bg-gray-100">
            <tr>
              <th class="p-3 text-right text-sm">الإيميل</th>
              <th class="p-3 text-right text-sm">الاسم</th>
              <th class="p-3 text-right text-sm hidden lg:table-cell">الهاتف</th>
              <th class="p-3 text-right text-sm">الصلاحية</th>
              <th class="p-3 text-right text-sm">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id" class="border-t hover:bg-gray-50">
              <td class="p-3 text-sm break-all max-w-[200px]">{{ user.email }}</td>
              <td class="p-3 text-sm">{{ user.full_name || '-' }}</td>
              <td class="p-3 text-sm dir-ltr hidden lg:table-cell">{{ user.phone || '-' }}</td>
              <td class="p-3">
                <select 
                  :value="user.role" 
                  @change="updateRole(user.id, $event.target.value)"
                  class="p-1.5 sm:p-2 border rounded-lg text-xs sm:text-sm font-medium"
                >
                  <option value="customer">👤 عميل</option>
                  <option value="collector">🔄 محصل</option>
                  <option value="partner">🤝 شريك</option>
                  <option value="admin">👑 مدير</option>
                </select>
              </td>
              <td class="p-3">
                <button @click="viewUserDetails(user)" class="text-blue-600 hover:text-blue-800 text-xl sm:text-base" title="تفاصيل">
                  👁️
                </button>
              </td>
            </tr>
            <tr v-if="filteredUsers.length === 0">
              <td colspan="5" class="text-center py-12 text-gray-400">
                لا توجد مستخدمين مطابقين للبحث
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Role Legend -->
    <div class="mt-6 p-3 sm:p-4 bg-white rounded-xl shadow-sm">
      <h3 class="text-sm sm:text-base font-bold mb-2">📋 دليل الصلاحيات</h3>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm">
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-blue-500"></span>
          <span>👑 مدير - صلاحية كاملة</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-green-500"></span>
          <span>🤝 شريك - صلاحية محدودة</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-orange-500"></span>
          <span>🔄 محصل - متابعة الديون</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-gray-400"></span>
          <span>👤 عميل - عرض فقط</span>
        </div>
      </div>
    </div>

    <!-- User Details Modal -->
    <div v-if="showDetailsModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" @click.self="showDetailsModal = false">
      <div class="bg-white rounded-2xl w-full max-w-md">
        <div class="p-4 sm:p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl sm:text-2xl font-bold">📋 تفاصيل المستخدم</h2>
            <button @click="showDetailsModal = false" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>
          
          <div class="space-y-3 text-sm sm:text-base">
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-2">
              <span class="text-gray-500 font-medium">الإيميل:</span>
              <span class="break-all">{{ selectedUser?.email }}</span>
            </div>
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-2">
              <span class="text-gray-500 font-medium">الاسم:</span>
              <span>{{ selectedUser?.full_name || 'غير مدخل' }}</span>
            </div>
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-2">
              <span class="text-gray-500 font-medium">الهاتف:</span>
              <span class="dir-ltr">{{ selectedUser?.phone || 'غير مدخل' }}</span>
            </div>
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-2">
              <span class="text-gray-500 font-medium">الصلاحية:</span>
              <span :class="getRoleBadgeClass(selectedUser?.role)" class="px-2 py-1 rounded-full text-xs inline-block">
                {{ getRoleName(selectedUser?.role) }}
              </span>
            </div>
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <span class="text-gray-500 font-medium">معرّف المستخدم:</span>
              <span class="text-xs font-mono break-all">{{ selectedUser?.id }}</span>
            </div>
          </div>
        </div>
        <div class="p-4 sm:p-6 border-t">
          <button @click="showDetailsModal = false" class="w-full bg-blue-600 text-white py-2.5 sm:py-3 rounded-xl hover:bg-blue-700">
            إغلاق
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'dashboard',
  middleware: 'admin-only'
})

const supabase = useSupabaseClient();
const users = ref([]);
const searchQuery = ref('');
const showDetailsModal = ref(false);
const selectedUser = ref(null);

// Computed: فلتر المستخدمين
const filteredUsers = computed(() => {
  if (!searchQuery.value.trim()) return users.value;
  
  const query = searchQuery.value.toLowerCase().trim();
  return users.value.filter(user => 
    user.email?.toLowerCase().includes(query) ||
    user.full_name?.toLowerCase().includes(query) ||
    user.phone?.includes(query)
  );
});

// جلب عدد المستخدمين حسب الدور
const getUsersByRole = (role) => {
  return users.value.filter(u => u.role === role).length;
};

// اسم الدور بالعربي
const getRoleName = (role) => {
  const roles = {
    admin: '👑 مدير',
    partner: '🤝 شريك',
    collector: '🔄 محصل',
    customer: '👤 عميل'
  };
  return roles[role] || role;
};

// Class للبادج حسب الدور
const getRoleBadgeClass = (role) => {
  const classes = {
    admin: 'bg-red-100 text-red-700',
    partner: 'bg-green-100 text-green-700',
    collector: 'bg-orange-100 text-orange-700',
    customer: 'bg-gray-100 text-gray-700'
  };
  return classes[role] || 'bg-gray-100 text-gray-700';
};

const loadUsers = async () => {
  const { data: profiles, error: profilesError } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (profilesError) {
    console.error('خطأ في جلب البروفايلات:', profilesError);
    return;
  }
  
  try {
    const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();
    
    if (!authError && authUsers) {
      const userMap = new Map();
      authUsers.forEach(u => userMap.set(u.id, u.email));
      
      users.value = profiles.map(p => ({
        id: p.id,
        email: userMap.get(p.id) || '-',
        full_name: p.full_name,
        phone: p.phone,
        role: p.role || 'customer'
      }));
    } else {
      users.value = profiles.map(p => ({
        id: p.id,
        email: 'غير متاح',
        full_name: p.full_name,
        phone: p.phone,
        role: p.role || 'customer'
      }));
    }
  } catch (err) {
    users.value = profiles.map(p => ({
      id: p.id,
      email: 'غير متاح',
      full_name: p.full_name,
      phone: p.phone,
      role: p.role || 'customer'
    }));
  }
};

const updateRole = async (userId, newRole) => {
  const { error } = await supabase
    .from('user_profiles')
    .update({ role: newRole })
    .eq('id', userId);
  
  if (error) {
    alert('❌ خطأ: ' + error.message);
  } else {
    alert('✅ تم تحديث الصلاحية بنجاح');
    await loadUsers();
  }
};

const viewUserDetails = (user) => {
  selectedUser.value = user;
  showDetailsModal.value = true;
};

onMounted(() => {
  loadUsers();
});
</script>

<style scoped>
.dir-ltr {
  direction: ltr;
  display: inline-block;
}

/* تحسين مظهر الـ select على الموبايل */
@media (max-width: 768px) {
  select {
    font-size: 16px !important; /* منع zoom على iOS */
  }
}
</style>