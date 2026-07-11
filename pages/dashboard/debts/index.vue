<template>
  <div class="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen" dir="rtl">
    <!-- Header -->
    <div class="mb-4 sm:mb-6">
      <div
        class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
            📋 الديون والمستحقات
          </h1>
          <p class="text-sm sm:text-base text-gray-500">
            متابعة المستحقات والديون المتأخرة على العملاء
          </p>
        </div>
        <!-- إحصائيات سريعة للكشوفات -->
        <div class="flex gap-2">
          <div class="bg-pink-100 rounded-xl px-3 py-2 text-center">
            <p class="text-xs text-pink-600">ديون كشوفات</p>
            <p class="text-lg font-bold text-pink-600">
              {{ formatNumber(brideChecklistDebts.total) }} ج
            </p>
          </div>
          <div class="bg-purple-100 rounded-xl px-3 py-2 text-center">
            <p class="text-xs text-purple-600">عدد الكشوفات</p>
            <p class="text-lg font-bold text-purple-600">
              {{ brideChecklistDebts.count }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 4 Cards رئيسية -->
    <div
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8"
    >
      <!-- إجمالي الديون -->
      <div
        class="bg-gradient-to-r from-red-500 to-red-600 rounded-xl sm:rounded-2xl shadow p-3 sm:p-5 text-white"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1 min-w-0">
            <p class="text-xs sm:text-sm opacity-90">💸 إجمالي الديون</p>
            <p class="text-xl sm:text-3xl font-bold mt-1 break-words">
              {{ formatNumber(totalDebts) }} ج
            </p>
            <p class="text-xs opacity-80 mt-1">{{ totalCustomers }} عميل</p>
          </div>
          <div
            class="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center text-xl sm:text-2xl shrink-0"
          >
            📊
          </div>
        </div>
      </div>

      <!-- الديون المتأخرة -->
      <div
        class="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl sm:rounded-2xl shadow p-3 sm:p-5 text-white"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1 min-w-0">
            <p class="text-xs sm:text-sm opacity-90">⚠️ الديون المتأخرة</p>
            <p class="text-xl sm:text-3xl font-bold mt-1 break-words">
              {{ formatNumber(lateDebts) }} ج
            </p>
            <p class="text-xs opacity-80 mt-1">{{ lateCustomers }} عميل</p>
          </div>
          <div
            class="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center text-xl sm:text-2xl shrink-0"
          >
            ⏰
          </div>
        </div>
      </div>

      <!-- الديون الحالية -->
      <div
        class="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl sm:rounded-2xl shadow p-3 sm:p-5 text-white"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1 min-w-0">
            <p class="text-xs sm:text-sm opacity-90">📅 الديون الحالية</p>
            <p class="text-xl sm:text-3xl font-bold mt-1 break-words">
              {{ formatNumber(currentDebts) }} ج
            </p>
            <p class="text-xs opacity-80 mt-1">{{ currentCustomers }} عميل</p>
          </div>
          <div
            class="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center text-xl sm:text-2xl shrink-0"
          >
            💰
          </div>
        </div>
      </div>

      <!-- متوسط الدين لكل عميل -->
      <div
        class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl shadow p-3 sm:p-5 text-white"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1 min-w-0">
            <p class="text-xs sm:text-sm opacity-90">👥 متوسط الدين</p>
            <p class="text-xl sm:text-3xl font-bold mt-1 break-words">
              {{ formatNumber(avgDebtPerCustomer) }} ج
            </p>
            <p class="text-xs opacity-80 mt-1">لكل عميل</p>
          </div>
          <div
            class="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center text-xl sm:text-2xl shrink-0"
          >
            📈
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 sm:gap-2 flex-wrap mb-4 sm:mb-6 border-b">
      <button
        @click="activeTab = 'all'"
        class="px-3 sm:px-6 py-2 sm:py-3 font-medium transition text-sm sm:text-base"
        :class="
          activeTab === 'all'
            ? 'border-b-2 border-blue-600 text-blue-600'
            : 'text-gray-500'
        "
      >
        📋 جميع الديون
      </button>
      <button
        @click="activeTab = 'late'"
        class="px-3 sm:px-6 py-2 sm:py-3 font-medium transition text-sm sm:text-base"
        :class="
          activeTab === 'late'
            ? 'border-b-2 border-orange-600 text-orange-600'
            : 'text-gray-500'
        "
      >
        ⚠️ ديون متأخرة
      </button>
      <button
        @click="activeTab = 'current'"
        class="px-3 sm:px-6 py-2 sm:py-3 font-medium transition text-sm sm:text-base"
        :class="
          activeTab === 'current'
            ? 'border-b-2 border-yellow-600 text-yellow-600'
            : 'text-gray-500'
        "
      >
        📅 ديون حالية
      </button>
      <button
        @click="activeTab = 'paid'"
        class="px-3 sm:px-6 py-2 sm:py-3 font-medium transition text-sm sm:text-base"
        :class="
          activeTab === 'paid'
            ? 'border-b-2 border-green-600 text-green-600'
            : 'text-gray-500'
        "
      >
        ✅ ديون مسددة
      </button>
    </div>

 <!-- فلتر إضافي - نسخة Responsive محسنة -->
<div class="bg-white rounded-2xl shadow-lg p-4 sm:p-5 md:p-6 mb-6">
  <!-- عنوان الفلتر (يظهر في الموبايل فقط) -->
  <div class="block md:hidden mb-3">
    <h3 class="text-base font-semibold text-gray-700 flex items-center gap-2">
      <span>🔍</span> بحث وتصفية
    </h3>
  </div>

  <!-- حقل البحث - في الأعلى دائماً -->
  <div class="mb-3 sm:mb-4">
    <div class="relative">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="🔍 بحث باسم العميل أو رقم الهاتف..."
        class="w-full p-3 sm:p-3.5 md:p-4 border border-gray-200 rounded-xl text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gray-50 hover:bg-white"
      />
      <!-- زر مسح البحث (يظهر عند وجود نص) -->
      <button
        v-if="searchQuery"
        @click="searchQuery = ''"
        class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
      >
        ✕
      </button>
    </div>
  </div>

  <!-- خيارات الفلتر - بطريقة Grid مرنة -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
    <!-- فلتر نوع المبيعات -->
    <div class="relative">
      <label class="block text-xs sm:text-sm font-medium text-gray-600 mb-1.5 hidden sm:block">
        🏷️ نوع المبيعات
      </label>
      <select
        v-model="filterSaleType"
        class="w-full p-3 sm:p-3.5 border border-gray-200 rounded-xl text-sm sm:text-base bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer hover:border-gray-400 appearance-none"
        style="background-image: url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23666%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E'); background-repeat: no-repeat; background-position: left 12px center; background-size: 16px; padding-left: 40px;"
      >
        <option value="all">📊 جميع المبيعات</option>
        <option value="online">🖥️ من الموقع (أونلاين)</option>
        <option value="offline">🏪 من المعرض (كاش)</option>
      </select>
    </div>

    <!-- فلتر نوع الديون -->
    <div class="relative">
      <label class="block text-xs sm:text-sm font-medium text-gray-600 mb-1.5 hidden sm:block">
        💰 نوع الديون
      </label>
      <select
        v-model="filterDebtType"
        class="w-full p-3 sm:p-3.5 border border-gray-200 rounded-xl text-sm sm:text-base bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer hover:border-gray-400 appearance-none"
        style="background-image: url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23666%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E'); background-repeat: no-repeat; background-position: left 12px center; background-size: 16px; padding-left: 40px;"
      >
        <option value="all">📋 جميع الديون</option>
        <option value="normal">👤 ديون عادية</option>
        <option value="bride">👰 ديون كشوفات عرائس</option>
      </select>
    </div>

    <!-- زر تصدير Excel -->
    <div v-if="userStore?.canEdit">
      <label class="block text-xs sm:text-sm font-medium text-gray-600 mb-1.5 hidden sm:block">
        &nbsp;
      </label>
      <button
        @click="exportDebts"
        class="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl hover:from-green-700 hover:to-green-800 transition-all text-sm sm:text-base font-medium shadow-md hover:shadow-lg flex items-center justify-center gap-2"
      >
        <span class="text-base sm:text-lg">📥</span>
        <span>تصدير Excel</span>
      </button>
    </div>
  </div>

  <!-- عرض حالة الفلتر النشط (للموبايل) -->
  <div class="flex flex-wrap gap-2 mt-3 sm:mt-4">
    <span
      v-if="filterSaleType !== 'all'"
      class="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
    >
      🏷️ {{ filterSaleType === 'online' ? 'من الموقع' : 'من المعرض' }}
      <button @click="filterSaleType = 'all'" class="hover:text-blue-900">✕</button>
    </span>
    <span
      v-if="filterDebtType !== 'all'"
      class="inline-flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full"
    >
      💰 {{ filterDebtType === 'normal' ? 'ديون عادية' : 'كشوفات عرائس' }}
      <button @click="filterDebtType = 'all'" class="hover:text-purple-900">✕</button>
    </span>
    <span
      v-if="searchQuery"
      class="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
    >
      🔍 "{{ searchQuery }}"
      <button @click="searchQuery = ''" class="hover:text-gray-900">✕</button>
    </span>
  </div>
</div>

    <!-- جدول الديون -->
    <div class="bg-white rounded-2xl shadow overflow-hidden">
      <!-- Mobile Cards View -->
      <div class="block md:hidden divide-y">
        <div
          v-for="debt in filteredDebts"
          :key="debt.id"
          class="p-4 hover:bg-gray-50"
        >
          <div class="flex justify-between items-start mb-3">
            <div>
              <p class="font-medium text-sm">{{ debt.customer_name }}</p>
              <p class="text-xs text-gray-500 dir-ltr">
                {{ debt.customer_phone }}
              </p>
            </div>
            <div class="flex flex-col items-end gap-1">
              <span
                :class="
                  debt.sale_type === 'online'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-purple-100 text-purple-700'
                "
                class="px-2 py-1 rounded-full text-xs whitespace-nowrap"
              >
                {{ debt.sale_type === "online" ? "🖥️ موقع" : "🏪 معرض" }}
              </span>
              <!-- علامة كشف عروسة -->
              <span
                v-if="debt.is_from_bride"
                class="bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full text-xs"
              >
                👰 كشف عروسة
              </span>
            </div>
          </div>

          <div class="space-y-2 text-sm">
            <div class="flex justify-between flex-wrap gap-1">
              <span class="text-gray-500">إجمالي العقد:</span>
              <span>{{ formatNumber(debt.total_amount) }} ج</span>
            </div>
            <div class="flex justify-between flex-wrap gap-1">
              <span class="text-gray-500">المدفوع:</span>
              <span class="text-green-600"
                >{{
                  formatNumber(debt.total_amount - debt.remaining_amount)
                }}
                ج</span
              >
            </div>
            <div class="flex justify-between flex-wrap gap-1">
              <span class="text-gray-500">المتبقي:</span>
              <span
                :class="
                  debt.remaining_amount > 0
                    ? 'text-red-600 font-bold'
                    : 'text-green-600'
                "
              >
                {{ formatNumber(debt.remaining_amount) }} ج
              </span>
            </div>
            <div class="flex justify-between flex-wrap gap-1">
              <span class="text-gray-500">المتأخرات:</span>
              <span
                v-if="debt.late_amount > 0"
                class="text-orange-600 font-bold"
              >
                {{ formatNumber(debt.late_amount) }} ج
              </span>
              <span v-else class="text-gray-400">-</span>
            </div>
            <div class="flex justify-between flex-wrap gap-1">
              <span class="text-gray-500">آخر قسط:</span>
              <span class="text-xs">{{ formatDate(debt.last_due_date) }}</span>
            </div>
            <div class="flex justify-between flex-wrap gap-1">
              <span class="text-gray-500">الحالة:</span>
              <span
                :class="
                  debt.status === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : debt.late_amount > 0
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                "
                class="px-2 py-1 rounded-full text-xs"
              >
                {{
                  debt.status === "completed"
                    ? "✅ مسدد"
                    : debt.late_amount > 0
                      ? "⚠️ متأخر"
                      : "📅 مستحق"
                }}
              </span>
            </div>
          </div>

          <div class="flex gap-2 mt-3 pt-2 border-t">
            <button
              @click="viewContractDetails(debt.id)"
              class="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg text-sm"
            >
              👁️ تفاصيل
            </button>
            <button
              v-if="userStore?.canEdit"
              @click="goToPayments(debt.id)"
              class="flex-1 bg-green-50 text-green-600 py-2 rounded-lg text-sm"
            >
              💰 تسديد
            </button>
          </div>
        </div>
        <div
          v-if="filteredDebts.length === 0"
          class="text-center py-12 text-gray-400"
        >
          لا توجد ديون في هذه الفئة
        </div>
      </div>

      <!-- Desktop Table View -->
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full min-w-[1100px]">
          <thead class="bg-gray-100">
            <tr>
              <th class="p-3 text-right text-sm">العميل</th>
              <th class="p-3 text-right text-sm hidden lg:table-cell">
                الهاتف
              </th>
              <th class="p-3 text-right text-sm">نوع البيع</th>
              <th class="p-3 text-right text-sm">المصدر</th>
              <th class="p-3 text-right text-sm hidden sm:table-cell">
                إجمالي العقد
              </th>
              <th class="p-3 text-right text-sm hidden lg:table-cell">
                المدفوع
              </th>
              <th class="p-3 text-right text-sm">المتبقي</th>
              <th class="p-3 text-right text-sm hidden xl:table-cell">
                عدد الأقساط
              </th>
              <th class="p-3 text-right text-sm">المتأخرات</th>
              <th class="p-3 text-right text-sm hidden xl:table-cell">
                آخر قسط
              </th>
              <th class="p-3 text-right text-sm hidden lg:table-cell">
                الحالة
              </th>
              <th class="p-3 text-right text-sm">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="debt in filteredDebts"
              :key="debt.id"
              class="border-t hover:bg-gray-50"
            >
              <td class="p-3 font-medium text-sm max-w-[150px] truncate">
                {{ debt.customer_name }}
              </td>
              <td class="p-3 dir-ltr text-sm hidden lg:table-cell">
                {{ debt.customer_phone }}
              </td>
              <td class="p-3">
                <span
                  :class="
                    debt.sale_type === 'online'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-purple-100 text-purple-700'
                  "
                  class="px-2 py-1 rounded-full text-xs whitespace-nowrap"
                >
                  {{ debt.sale_type === "online" ? "🖥️ موقع" : "🏪 معرض" }}
                </span>
              </td>
              <td class="p-3">
                <!-- عرض مصدر الدين -->
                <span
                  v-if="debt.is_from_bride"
                  class="bg-pink-100 text-pink-700 px-2 py-1 rounded-full text-xs whitespace-nowrap"
                >
                  👰 كشف عروسة
                </span>
                <span v-else class="text-gray-500 text-xs">بيع مباشر</span>
              </td>
              <td class="p-3 text-sm hidden sm:table-cell whitespace-nowrap">
                {{ formatNumber(debt.total_amount) }} ج
              </td>
              <td
                class="p-3 text-sm text-green-600 hidden lg:table-cell whitespace-nowrap"
              >
                {{ formatNumber(debt.total_amount - debt.remaining_amount) }} ج
              </td>
              <td
                class="p-3 text-sm font-bold"
                :class="
                  debt.remaining_amount > 0 ? 'text-red-600' : 'text-green-600'
                "
              >
                {{ formatNumber(debt.remaining_amount) }} ج
              </td>
              <td class="p-3 text-sm hidden xl:table-cell">
                {{ debt.installment_count }}
              </td>
              <td class="p-3 text-sm">
                <span
                  v-if="debt.late_amount > 0"
                  class="text-orange-600 font-bold whitespace-nowrap"
                >
                  {{ formatNumber(debt.late_amount) }} ج
                </span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="p-3 text-sm hidden xl:table-cell whitespace-nowrap">
                {{ formatDate(debt.last_due_date) }}
              </td>
              <td class="p-3 hidden lg:table-cell">
                <span
                  :class="
                    debt.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : debt.late_amount > 0
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                  "
                  class="px-2 py-1 rounded-full text-xs whitespace-nowrap"
                >
                  {{
                    debt.status === "completed"
                      ? "✅ مسدد"
                      : debt.late_amount > 0
                        ? "⚠️ متأخر"
                        : "📅 مستحق"
                  }}
                </span>
              </td>
              <td class="p-3">
                <div class="flex gap-2">
                  <button
                    @click="viewContractDetails(debt.id)"
                    class="text-blue-600 hover:text-blue-800 text-base"
                    title="تفاصيل"
                  >
                    👁️
                  </button>
                  <button
                    v-if="userStore?.canEdit"
                    @click="goToPayments(debt.id)"
                    class="text-green-600 hover:text-green-800 text-base"
                    title="تسديد"
                  >
                    💰
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredDebts.length === 0">
              <td colspan="12" class="text-center py-12 text-gray-400">
                لا توجد ديون في هذه الفئة
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal تفاصيل العقد -->
    <div
      v-if="showContractModal"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      @click.self="showContractModal = false"
    >
      <div
        class="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        <div class="p-4 sm:p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg sm:text-2xl font-bold">📄 تفاصيل العقد</h2>
            <button
              @click="showContractModal = false"
              class="text-gray-400 hover:text-gray-600 text-2xl"
            >
              &times;
            </button>
          </div>

          <div v-if="selectedContractDetails" class="space-y-4">
            <!-- معلومات العميل -->
            <div class="bg-gray-50 p-3 sm:p-4 rounded-xl">
              <h3 class="font-bold text-base sm:text-lg mb-3">
                👤 معلومات العميل
              </h3>
              <div
                class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-sm"
              >
                <p>
                  <span class="text-gray-500">الاسم:</span>
                  {{ selectedContractDetails.customer_name }}
                </p>
                <p>
                  <span class="text-gray-500">الهاتف:</span>
                  <span class="dir-ltr">{{
                    selectedContractDetails.customer_phone
                  }}</span>
                </p>
                <p class="col-span-1 sm:col-span-2">
                  <span class="text-gray-500">العنوان:</span>
                  {{ selectedContractDetails.customer_address || "-" }}
                </p>
                <p>
                  <span class="text-gray-500">نوع البيع:</span>
                  {{
                    selectedContractDetails.sale_type === "online"
                      ? "🖥️ موقع"
                      : "🏪 معرض"
                  }}
                </p>
                <p
                  v-if="selectedContractDetails.is_from_bride"
                  class="text-pink-600"
                >
                  <span class="text-gray-500">👰 المصدر:</span> كشف عروسة
                </p>
              </div>
            </div>

            <!-- معلومات العقد -->
            <div class="bg-gray-50 p-3 sm:p-4 rounded-xl">
              <h3 class="font-bold text-base sm:text-lg mb-3">
                📋 معلومات العقد
              </h3>
              <div
                class="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 text-sm"
              >
                <p>
                  <span class="text-gray-500">إجمالي المبلغ:</span>
                  {{ formatNumber(selectedContractDetails.total_amount) }} ج
                </p>
                <p>
                  <span class="text-gray-500">دفعة مقدمة:</span>
                  {{ formatNumber(selectedContractDetails.down_payment) }} ج
                </p>
                <p>
                  <span class="text-gray-500">المتبقي:</span>
                  <span class="text-red-600 font-bold"
                    >{{
                      formatNumber(selectedContractDetails.remaining_amount)
                    }}
                    ج</span
                  >
                </p>
                <p>
                  <span class="text-gray-500">عدد الأقساط:</span>
                  {{ selectedContractDetails.installment_count }}
                </p>
                <p>
                  <span class="text-gray-500">قيمة القسط:</span>
                  {{
                    formatNumber(selectedContractDetails.installment_amount)
                  }}
                  ج
                </p>
                <p>
                  <span class="text-gray-500">تاريخ البدء:</span>
                  {{ formatDate(selectedContractDetails.start_date) }}
                </p>
                <p>
                  <span class="text-gray-500">تاريخ الانتهاء:</span>
                  {{ formatDate(selectedContractDetails.end_date) }}
                </p>
                <p>
                  <span class="text-gray-500">الحالة:</span>
                  <span
                    :class="
                      selectedContractDetails.status === 'completed'
                        ? 'text-green-600'
                        : 'text-yellow-600'
                    "
                  >
                    {{
                      selectedContractDetails.status === "completed"
                        ? "مكتمل"
                        : "نشط"
                    }}
                  </span>
                </p>
              </div>
            </div>

            <!-- جدول الأقساط -->
            <div class="bg-gray-50 p-3 sm:p-4 rounded-xl">
              <h3 class="font-bold text-base sm:text-lg mb-3">
                📅 جدول الأقساط
              </h3>
              <div class="overflow-x-auto">
                <table class="w-full text-sm min-w-[500px]">
                  <thead class="bg-gray-200">
                    <tr>
                      <th class="p-2 text-right">#</th>
                      <th class="p-2 text-right">تاريخ الاستحقاق</th>
                      <th class="p-2 text-right">القيمة</th>
                      <th class="p-2 text-right hidden sm:table-cell">
                        تاريخ السداد
                      </th>
                      <th class="p-2 text-right">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="payment in contractPaymentsDetails"
                      :key="payment.id"
                      class="border-t"
                    >
                      <td class="p-2">{{ payment.installment_number }}</td>
                      <td
                        class="p-2"
                        :class="
                          isPaymentLate(payment) ? 'text-red-600 font-bold' : ''
                        "
                      >
                        {{ formatDate(payment.due_date) }}
                      </td>
                      <td class="p-2 whitespace-nowrap">
                        {{ formatNumber(payment.amount) }} ج
                      </td>
                      <td class="p-2 hidden sm:table-cell whitespace-nowrap">
                        {{
                          payment.paid_date
                            ? formatDate(payment.paid_date)
                            : "-"
                        }}
                      </td>
                      <td class="p-2">
                        <span
                          :class="
                            payment.status === 'paid'
                              ? 'text-green-600'
                              : 'text-red-600'
                          "
                        >
                          {{
                            payment.status === "paid"
                              ? "✅ مدفوع"
                              : "❌ غير مدفوع"
                          }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "dashboard",
  middleware: "admin-only",
});

const supabase = useSupabaseClient();
const userStore = useUserStore();

// State
const activeTab = ref("all");
const searchQuery = ref("");
const filterSaleType = ref("all");
const filterDebtType = ref("all");
const debts = ref([]);
const showContractModal = ref(false);
const selectedContractDetails = ref(null);
const contractPaymentsDetails = ref([]);

// إحصائيات كشوفات العرائس
const brideChecklistDebts = ref({
  total: 0,
  count: 0,
});

// إحصائيات
const totalDebts = ref(0);
const lateDebts = ref(0);
const currentDebts = ref(0);
const totalCustomers = ref(0);
const lateCustomers = ref(0);
const currentCustomers = ref(0);
const avgDebtPerCustomer = ref(0);

// Helper functions
const formatNumber = (num) => {
  if (!num && num !== 0) return "0";
  return num.toLocaleString("ar-EG");
};

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("ar-EG");
};

const isPaymentLate = (payment) => {
  if (payment.status === "paid") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(payment.due_date);
  return dueDate < today;
};

// جلب الديون
const loadDebts = async () => {
  const { data: contracts } = await supabase
    .from("installment_contracts")
    .select("*")
    .order("created_at", { ascending: false });

  if (!contracts) return;

  const debtsList = [];
  let total = 0;
  let late = 0;
  let current = 0;
  let brideTotal = 0;
  let brideCount = 0;
  const lateCustomersSet = new Set();
  const currentCustomersSet = new Set();

  for (const contract of contracts) {
    const { data: payments } = await supabase
      .from("installment_payments")
      .select("*")
      .eq("contract_id", contract.id)
      .order("installment_number");

    // التحقق إذا كان العقد من كشف عروسة
    let isFromBride = false;
    if (contract.notes && contract.notes.includes("كشف عروسة")) {
      isFromBride = true;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let lateAmount = 0;
    let lastDueDate = null;
    let hasLate = false;

    payments?.forEach((payment) => {
      if (payment.status !== "paid") {
        const dueDate = new Date(payment.due_date);
        if (dueDate < today) {
          lateAmount += payment.amount;
          hasLate = true;
        }
        if (
          !lastDueDate ||
          new Date(payment.due_date) > new Date(lastDueDate)
        ) {
          lastDueDate = payment.due_date;
        }
      }
    });

    const remainingAmount = contract.remaining_amount || 0;
    const isCompleted = contract.status === "completed" || remainingAmount <= 0;

    if (!isCompleted) {
      total += remainingAmount;
      if (hasLate) {
        late += lateAmount;
        lateCustomersSet.add(contract.id);
      } else if (remainingAmount > 0) {
        current += remainingAmount;
        currentCustomersSet.add(contract.id);
      }

      // إحصائيات كشوفات العرائس
      if (isFromBride) {
        brideTotal += remainingAmount;
        brideCount++;
      }
    }

    debtsList.push({
      id: contract.id,
      customer_name: contract.customer_name,
      customer_phone: contract.customer_phone,
      sale_type: contract.sale_type,
      total_amount: contract.total_amount,
      remaining_amount: remainingAmount,
      installment_count: contract.installment_count,
      installment_amount: contract.installment_amount,
      status: isCompleted ? "completed" : hasLate ? "late" : "active",
      late_amount: lateAmount,
      last_due_date: lastDueDate,
      start_date: contract.start_date,
      end_date: contract.end_date,
      down_payment: contract.down_payment,
      is_from_bride: isFromBride,
    });
  }

  debts.value = debtsList;
  totalDebts.value = total;
  lateDebts.value = late;
  currentDebts.value = current;
  totalCustomers.value = debtsList.filter(
    (d) => d.status !== "completed",
  ).length;
  lateCustomers.value = lateCustomersSet.size;
  currentCustomers.value = currentCustomersSet.size;
  avgDebtPerCustomer.value =
    totalCustomers.value > 0 ? total / totalCustomers.value : 0;

  brideChecklistDebts.value = {
    total: brideTotal,
    count: brideCount,
  };
};

// تصفية الديون
const filteredDebts = computed(() => {
  let result = debts.value;

  if (activeTab.value === "late") {
    result = result.filter((d) => d.status === "late");
  } else if (activeTab.value === "current") {
    result = result.filter((d) => d.status === "active");
  } else if (activeTab.value === "paid") {
    result = result.filter((d) => d.status === "completed");
  }

  if (filterSaleType.value !== "all") {
    result = result.filter((d) => d.sale_type === filterSaleType.value);
  }

  // فلتر حسب نوع الديون (كشوفات عرائس / عادي)
  if (filterDebtType.value === "normal") {
    result = result.filter((d) => !d.is_from_bride);
  } else if (filterDebtType.value === "bride") {
    result = result.filter((d) => d.is_from_bride);
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (d) =>
        d.customer_name.toLowerCase().includes(query) ||
        d.customer_phone.includes(query),
    );
  }

  return result;
});

// عرض تفاصيل العقد
const viewContractDetails = async (contractId) => {
  const { data: contract } = await supabase
    .from("installment_contracts")
    .select("*")
    .eq("id", contractId)
    .single();

  const { data: payments } = await supabase
    .from("installment_payments")
    .select("*")
    .eq("contract_id", contractId)
    .order("installment_number");

  selectedContractDetails.value = contract;
  contractPaymentsDetails.value = payments || [];
  showContractModal.value = true;
};

// التوجه لصفحة السداد
const goToPayments = (contractId) => {
  navigateTo(`/dashboard/installments?tab=payments&contract=${contractId}`);
};

// تصدير الديون (للمدير فقط)
const exportDebts = () => {
  if (!userStore.canEdit) {
    alert("⚠️ ليس لديك صلاحية لتصدير الديون");
    return;
  }

  const headers = [
    "العميل",
    "الهاتف",
    "نوع البيع",
    "المصدر",
    "إجمالي العقد",
    "المدفوع",
    "المتبقي",
    "المتأخرات",
    "الحالة",
  ];
  const rows = filteredDebts.value.map((debt) => [
    debt.customer_name,
    debt.customer_phone,
    debt.sale_type === "online" ? "موقع" : "معرض",
    debt.is_from_bride ? "كشف عروسة" : "بيع مباشر",
    debt.total_amount,
    debt.total_amount - debt.remaining_amount,
    debt.remaining_amount,
    debt.late_amount,
    debt.status === "completed"
      ? "مسدد"
      : debt.status === "late"
        ? "متأخر"
        : "مستحق",
  ]);

  let csv = headers.join(",") + "n";
  rows.forEach((row) => {
    csv += row.map((cell) => `"${cell}"`).join(",") + "n";
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.setAttribute(
    "download",
    `debts_${new Date().toISOString().split("T")[0]}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  alert("✅ تم تصدير الديون بنجاح");
};

onMounted(() => {
  loadDebts();
});
</script>

<style scoped>
.dir-ltr {
  direction: ltr;
  display: inline-block;
}

/* تحسين مظهر الـ select والمودال على الموبايل */
@media (max-width: 640px) {
  select,
  input {
    font-size: 16px !important;
  }
}
</style>
