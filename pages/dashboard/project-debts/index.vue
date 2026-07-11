<template>
  <div class="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen" dir="rtl">
    <!-- Header -->
    <div class="mb-4 sm:mb-6">
      <div
        class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
            🏦 ديون المشروع
          </h1>
          <p class="text-sm sm:text-base text-gray-500">
            إدارة القروض، الإيجار، الرواتب، والفواتير
          </p>
        </div>
        <!-- ✅ إحصائيات سريعة للكشوفات (اختياري) -->
        <div class="flex gap-2">
          <div class="bg-pink-100 rounded-xl px-3 py-2 text-center">
            <p class="text-xs text-pink-600">ديون كشوفات</p>
            <p class="text-lg font-bold text-pink-600">
              {{ formatNumber(totalRemaining) }} ج
            </p>
          </div>
          <div class="bg-purple-100 rounded-xl px-3 py-2 text-center">
            <p class="text-xs text-purple-600">عدد الديون</p>
            <p class="text-lg font-bold text-purple-600">{{ debts.length }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 4 Cards رئيسية -->
    <div
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8"
    >
      <div
        class="bg-gradient-to-r from-red-500 to-red-600 rounded-xl sm:rounded-2xl shadow p-3 sm:p-5 text-white"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1 min-w-0">
            <p class="text-xs sm:text-sm opacity-90">💸 إجمالي الديون</p>
            <p class="text-xl sm:text-3xl font-bold mt-1 break-words">
              {{ formatNumber(totalRemaining) }} ج
            </p>
          </div>
          <div
            class="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center text-xl sm:text-2xl shrink-0"
          >
            📊
          </div>
        </div>
      </div>

      <div
        class="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl sm:rounded-2xl shadow p-3 sm:p-5 text-white"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1 min-w-0">
            <p class="text-xs sm:text-sm opacity-90">⚠️ المستحق هذا الشهر</p>
            <p class="text-xl sm:text-3xl font-bold mt-1 break-words">
              {{ formatNumber(dueThisMonth) }} ج
            </p>
          </div>
          <div
            class="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center text-xl sm:text-2xl shrink-0"
          >
            📅
          </div>
        </div>
      </div>

      <div
        class="bg-gradient-to-r from-green-500 to-green-600 rounded-xl sm:rounded-2xl shadow p-3 sm:p-5 text-white"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1 min-w-0">
            <p class="text-xs sm:text-sm opacity-90">✅ إجمالي المدفوع</p>
            <p class="text-xl sm:text-3xl font-bold mt-1 break-words">
              {{ formatNumber(totalPaid) }} ج
            </p>
          </div>
          <div
            class="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center text-xl sm:text-2xl shrink-0"
          >
            💰
          </div>
        </div>
      </div>

      <div
        class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl shadow p-3 sm:p-5 text-white"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1 min-w-0">
            <p class="text-xs sm:text-sm opacity-90">📋 عدد الديون</p>
            <p class="text-xl sm:text-3xl font-bold mt-1 break-words">
              {{ debts.length }}
            </p>
          </div>
          <div
            class="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center text-xl sm:text-2xl shrink-0"
          >
            🏷️
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 sm:gap-2 flex-wrap mb-4 sm:mb-6 border-b">
      <button
        @click="activeTab = 'list'"
        class="px-4 sm:px-6 py-2 sm:py-3 font-medium transition text-sm sm:text-base"
        :class="
          activeTab === 'list'
            ? 'border-b-2 border-blue-600 text-blue-600'
            : 'text-gray-500'
        "
      >
        📋 جميع الديون
      </button>
      <button
        v-if="userStore?.canEdit"
        @click="activeTab = 'add'"
        class="px-4 sm:px-6 py-2 sm:py-3 font-medium transition text-sm sm:text-base"
        :class="
          activeTab === 'add'
            ? 'border-b-2 border-green-600 text-green-600'
            : 'text-gray-500'
        "
      >
        ➕ إضافة دين جديد
      </button>
      <button
        @click="activeTab = 'payments'"
        class="px-4 sm:px-6 py-2 sm:py-3 font-medium transition text-sm sm:text-base"
        :class="
          activeTab === 'payments'
            ? 'border-b-2 border-purple-600 text-purple-600'
            : 'text-gray-500'
        "
      >
        💰 سجل المدفوعات
      </button>
    </div>

    <!-- ================= قائمة الديون ================= -->
    <div v-if="activeTab === 'list'">
      <!-- فلتر -->
      <div class="bg-white rounded-2xl shadow p-3 sm:p-4 mb-6">
        <div class="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
          <select
            v-model="filterType"
            class="p-2 border rounded-lg text-sm flex-1 min-w-[120px]"
          >
            <option value="all">جميع الأنواع</option>
            <option value="bank_loan">🏦 قرض بنكي</option>
            <option value="rent">🏢 إيجار</option>
            <option value="salary">👥 رواتب</option>
            <option value="personal_loan">👤 قرض شخصي</option>
            <option value="bills">💡 فواتير</option>
            <option value="other">📦 أخرى</option>
          </select>
          <select
            v-model="filterStatus"
            class="p-2 border rounded-lg text-sm flex-1 min-w-[120px]"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشط</option>
            <option value="completed">منتهي</option>
            <option value="late">متأخر</option>
          </select>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="🔍 بحث..."
            class="p-2 border rounded-lg text-sm flex-1 min-w-[200px]"
          />
        </div>
      </div>

      <!-- Mobile Cards View for Debts -->
      <div class="block md:hidden space-y-4">
        <div
          v-for="debt in filteredDebts"
          :key="debt.id"
          class="bg-white rounded-2xl shadow p-4"
        >
          <div class="flex justify-between items-start mb-3">
            <div>
              <span
                :class="getTypeClass(debt.debt_type)"
                class="px-2 py-1 rounded-full text-xs"
              >
                {{ getTypeName(debt.debt_type) }}
              </span>
              <p class="font-medium mt-2">{{ debt.creditor_name }}</p>
            </div>
            <span
              :class="getStatusClass(debt)"
              class="px-2 py-1 rounded-full text-xs"
            >
              {{ getStatusName(debt) }}
            </span>
          </div>

          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">الوصف:</span>
              <span class="truncate max-w-[180px]">{{
                debt.description || "-"
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">إجمالي الدين:</span>
              <span>{{ formatNumber(debt.total_amount) }} ج</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">المدفوع:</span>
              <span class="text-green-600"
                >{{ formatNumber(debt.paid_amount) }} ج</span
              >
            </div>
            <div class="flex justify-between">
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
            <div class="flex justify-between">
              <span class="text-gray-500">تاريخ الاستحقاق:</span>
              <span
                :class="
                  isDueDateLate(debt.due_date) ? 'text-red-600 font-bold' : ''
                "
              >
                {{ formatDate(debt.due_date) }}
              </span>
            </div>
            <div class="flex gap-2 pt-2">
              <button
                v-if="userStore?.canEdit"
                @click="openPaymentModal(debt)"
                class="flex-1 bg-green-100 text-green-700 py-2 rounded-lg text-sm hover:bg-green-200"
              >
                💰 تسديد
              </button>
              <button
                @click="viewDebtDetails(debt)"
                class="flex-1 bg-blue-100 text-blue-700 py-2 rounded-lg text-sm hover:bg-blue-200"
              >
                👁️ تفاصيل
              </button>
              <button
                v-if="userStore?.canEdit"
                @click="deleteDebt(debt.id)"
                class="flex-1 bg-red-100 text-red-700 py-2 rounded-lg text-sm hover:bg-red-200"
              >
                🗑️ حذف
              </button>
            </div>
          </div>
        </div>
        <div
          v-if="filteredDebts.length === 0"
          class="text-center py-12 text-gray-400 bg-white rounded-2xl"
        >
          لا توجد ديون
        </div>
      </div>

      <!-- Desktop Table View -->
      <div class="hidden md:block bg-white rounded-2xl shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[1000px]">
            <thead class="bg-gray-100">
              <tr>
                <th class="p-3 text-right text-sm">نوع الدين</th>
                <th class="p-3 text-right text-sm">الدائن</th>
                <th class="p-3 text-right text-sm hidden lg:table-cell">
                  الوصف
                </th>
                <th class="p-3 text-right text-sm">إجمالي الدين</th>
                <th class="p-3 text-right text-sm hidden sm:table-cell">
                  المدفوع
                </th>
                <th class="p-3 text-right text-sm">المتبقي</th>
                <th class="p-3 text-right text-sm hidden xl:table-cell">
                  القسط
                </th>
                <th class="p-3 text-right text-sm hidden lg:table-cell">
                  تاريخ الاستحقاق
                </th>
                <th class="p-3 text-right text-sm hidden sm:table-cell">
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
                <td class="p-3">
                  <span
                    :class="getTypeClass(debt.debt_type)"
                    class="px-2 py-1 rounded-full text-xs whitespace-nowrap"
                  >
                    {{ getTypeName(debt.debt_type) }}
                  </span>
                </td>
                <td class="p-3 text-sm font-medium max-w-[150px] truncate">
                  {{ debt.creditor_name }}
                </td>
                <td
                  class="p-3 text-sm hidden lg:table-cell max-w-[200px] truncate"
                >
                  {{ debt.description || "-" }}
                </td>
                <td class="p-3 text-sm whitespace-nowrap">
                  {{ formatNumber(debt.total_amount) }} ج
                </td>
                <td
                  class="p-3 text-sm text-green-600 hidden sm:table-cell whitespace-nowrap"
                >
                  {{ formatNumber(debt.paid_amount) }} ج
                </td>
                <td
                  class="p-3 text-sm font-bold"
                  :class="
                    debt.remaining_amount > 0
                      ? 'text-red-600'
                      : 'text-green-600'
                  "
                >
                  {{ formatNumber(debt.remaining_amount) }} ج
                </td>
                <td class="p-3 text-sm hidden xl:table-cell whitespace-nowrap">
                  {{
                    debt.installment_amount
                      ? formatNumber(debt.installment_amount) + " ج"
                      : "-"
                  }}
                </td>
                <td
                  class="p-3 text-sm hidden lg:table-cell"
                  :class="
                    isDueDateLate(debt.due_date) ? 'text-red-600 font-bold' : ''
                  "
                >
                  {{ formatDate(debt.due_date) }}
                </td>
                <td class="p-3 hidden sm:table-cell">
                  <span
                    :class="getStatusClass(debt)"
                    class="px-2 py-1 rounded-full text-xs whitespace-nowrap"
                  >
                    {{ getStatusName(debt) }}
                  </span>
                </td>
                <td class="p-3">
                  <div class="flex gap-1 sm:gap-2">
                    <button
                      v-if="userStore?.canEdit"
                      @click="openPaymentModal(debt)"
                      class="text-green-600 hover:text-green-800 text-base sm:text-lg"
                      title="تسديد"
                    >
                      💰
                    </button>
                    <button
                      v-if="userStore?.canEdit"
                      @click="viewDebtDetails(debt)"
                      class="text-blue-600 hover:text-blue-800 text-base sm:text-lg"
                      title="تفاصيل"
                    >
                      👁️
                    </button>
                    <button
                      v-if="userStore?.canEdit"
                      @click="deleteDebt(debt.id)"
                      class="text-red-600 hover:text-red-800 text-base sm:text-lg"
                      title="حذف"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredDebts.length === 0">
                <td colspan="10" class="text-center py-12 text-gray-400">
                  لا توجد ديون
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ================= إضافة دين جديد - Responsive ================= -->
    <div
      v-if="activeTab === 'add'"
      class="bg-white rounded-2xl shadow p-4 sm:p-6"
    >
      <h2 class="text-lg sm:text-xl font-bold mb-6">➕ إضافة دين جديد</h2>

      <form @submit.prevent="createDebt" class="space-y-4 sm:space-y-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">نوع الدين *</label>
            <select
              v-model="newDebt.debt_type"
              required
              class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
            >
              <option value="">-- اختر --</option>
              <option value="bank_loan">🏦 قرض بنكي</option>
              <option value="rent">🏢 إيجار</option>
              <option value="salary">👥 رواتب</option>
              <option value="personal_loan">👤 قرض شخصي</option>
              <option value="bills">💡 فواتير</option>
              <option value="other">📦 أخرى</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">اسم الدائن *</label>
            <input
              v-model="newDebt.creditor_name"
              required
              class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">الوصف</label>
          <textarea
            v-model="newDebt.description"
            rows="2"
            class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
            placeholder="مثال: قرض لشراء بضاعة - إيجار شهر يناير..."
          ></textarea>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1"
              >إجمالي المبلغ *</label
            >
            <input
              v-model.number="newDebt.total_amount"
              type="number"
              required
              @input="calculateInstallment"
              class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1"
              >المبلغ المدفوع مسبقاً</label
            >
            <input
              v-model.number="newDebt.paid_amount"
              type="number"
              @input="calculateInstallment"
              class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">عدد الأقساط</label>
            <input
              v-model.number="newDebt.installment_count"
              type="number"
              @input="calculateInstallment"
              class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1"
              >قيمة القسط الشهري</label
            >
            <input
              :value="newDebt.installment_amount"
              type="number"
              readonly
              class="w-full p-2.5 sm:p-3 border rounded-xl bg-gray-100 text-sm"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1"
              >تاريخ الاستحقاق القادم *</label
            >
            <input
              v-model="newDebt.due_date"
              type="date"
              required
              class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1"
              >تاريخ بدء الدين</label
            >
            <input
              v-model="newDebt.start_date"
              type="date"
              class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">ملاحظات</label>
          <textarea
            v-model="newDebt.notes"
            rows="2"
            class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
          ></textarea>
        </div>

        <div class="flex flex-col sm:flex-row gap-3">
          <button
            v-if="userStore?.canEdit"
            type="submit"
            :disabled="loading"
            class="bg-green-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl hover:bg-green-700 text-sm sm:text-base"
          >
            {{ loading ? "جاري الحفظ..." : "✅ إضافة الدين" }}
          </button>
          <button
            v-if="userStore?.canEdit"
            type="button"
            @click="resetForm"
            class="bg-gray-200 px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl hover:bg-gray-300 text-sm sm:text-base"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>

    <!-- ================= سجل المدفوعات - Responsive ================= -->
    <div
      v-if="activeTab === 'payments'"
      class="bg-white rounded-2xl shadow overflow-hidden"
    >
      <div class="p-3 sm:p-4 border-b">
        <h2 class="text-lg sm:text-xl font-bold">💰 سجل مدفوعات الديون</h2>
      </div>

      <!-- Mobile Cards for Payments -->
      <div class="block md:hidden divide-y">
        <div
          v-for="payment in allPayments"
          :key="payment.id"
          class="p-4 hover:bg-gray-50"
        >
          <div class="flex justify-between items-start mb-2">
            <span
              :class="getTypeClass(payment.debt_type)"
              class="px-2 py-1 rounded-full text-xs"
            >
              {{ getTypeName(payment.debt_type) }}
            </span>
            <span class="text-xs text-gray-500">{{
              formatDate(payment.payment_date)
            }}</span>
          </div>
          <div class="mt-2">
            <p class="font-medium">{{ payment.creditor_name }}</p>
            <div class="flex justify-between mt-2">
              <span class="text-gray-500">المبلغ:</span>
              <span class="font-bold text-green-600"
                >{{ formatNumber(payment.amount) }} ج</span
              >
            </div>
            <div class="flex justify-between mt-1">
              <span class="text-gray-500">طريقة الدفع:</span>
              <span>{{ getPaymentMethodName(payment.payment_method) }}</span>
            </div>
            <div v-if="payment.notes" class="mt-1 text-xs text-gray-500">
              {{ payment.notes }}
            </div>
          </div>
        </div>
        <div
          v-if="allPayments.length === 0"
          class="text-center py-12 text-gray-400"
        >
          لا توجد مدفوعات
        </div>
      </div>

      <!-- Desktop Table for Payments -->
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full min-w-[600px]">
          <thead class="bg-gray-100">
            <tr>
              <th class="p-3 text-right text-sm">التاريخ</th>
              <th class="p-3 text-right text-sm">نوع الدين</th>
              <th class="p-3 text-right text-sm">الدائن</th>
              <th class="p-3 text-right text-sm">المبلغ</th>
              <th class="p-3 text-right text-sm hidden sm:table-cell">
                طريقة الدفع
              </th>
              <th class="p-3 text-right text-sm hidden lg:table-cell">
                الملاحظات
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="payment in allPayments"
              :key="payment.id"
              class="border-t hover:bg-gray-50"
            >
              <td class="p-3 text-sm whitespace-nowrap">
                {{ formatDate(payment.payment_date) }}
              </td>
              <td class="p-3">
                <span
                  :class="getTypeClass(payment.debt_type)"
                  class="px-2 py-1 rounded-full text-xs whitespace-nowrap"
                >
                  {{ getTypeName(payment.debt_type) }}
                </span>
              </td>
              <td class="p-3 text-sm">{{ payment.creditor_name }}</td>
              <td
                class="p-3 font-bold text-green-600 text-sm whitespace-nowrap"
              >
                {{ formatNumber(payment.amount) }} ج
              </td>
              <td class="p-3 text-sm hidden sm:table-cell">
                {{ getPaymentMethodName(payment.payment_method) }}
              </td>
              <td
                class="p-3 text-sm text-gray-500 hidden lg:table-cell max-w-[200px] truncate"
              >
                {{ payment.notes || "-" }}
              </td>
            </tr>
            <tr v-if="allPayments.length === 0">
              <td colspan="6" class="text-center py-12 text-gray-400">
                لا توجد مدفوعات
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ================= Modal تسديد دين - Responsive ================= -->
    <div
      v-if="showPaymentModalFlag"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      @click.self="showPaymentModalFlag = false"
    >
      <div
        class="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg sm:text-xl font-bold">💰 تسديد دين</h2>
          <button
            @click="showPaymentModalFlag = false"
            class="text-gray-400 hover:text-gray-600 text-2xl"
          >
            &times;
          </button>
        </div>

        <div class="space-y-4">
          <div class="bg-gray-50 p-3 rounded-lg text-sm sm:text-base">
            <p><strong>الدائن:</strong> {{ selectedDebt?.creditor_name }}</p>
            <p>
              <strong>المتبقي:</strong>
              <span class="text-red-600 font-bold"
                >{{ formatNumber(selectedDebt?.remaining_amount) }} ج</span
              >
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1"
              >المبلغ المراد سداده *</label
            >
            <input
              v-model.number="paymentAmount"
              type="number"
              required
              :max="selectedDebt?.remaining_amount"
              class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">طريقة الدفع</label>
            <select
              v-model="paymentMethod"
              class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
            >
              <option value="cash">💰 كاش</option>
              <option value="bank_transfer">🏦 تحويل بنكي</option>
              <option value="check">📄 شيك</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">ملاحظات</label>
            <textarea
              v-model="paymentNotes"
              class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
              rows="2"
            ></textarea>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              v-if="userStore?.canEdit"
              @click="processPayment"
              :disabled="paymentLoading"
              class="flex-1 bg-green-600 text-white py-2.5 sm:py-3 rounded-xl hover:bg-green-700 text-sm sm:text-base"
            >
              {{ paymentLoading ? "جاري..." : "تأكيد السداد" }}
            </button>
            <button
              @click="showPaymentModalFlag = false"
              class="flex-1 bg-gray-200 py-2.5 sm:py-3 rounded-xl hover:bg-gray-300 text-sm sm:text-base"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal تفاصيل الدين - Responsive -->
    <div
      v-if="showDetailsModal"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      @click.self="showDetailsModal = false"
    >
      <div
        class="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg sm:text-xl font-bold">📄 تفاصيل الدين</h2>
          <button
            @click="showDetailsModal = false"
            class="text-gray-400 hover:text-gray-600 text-2xl"
          >
            &times;
          </button>
        </div>
        <div v-if="selectedDebtDetails" class="space-y-3 text-sm sm:text-base">
          <div
            class="flex flex-col sm:flex-row sm:justify-between border-b pb-2"
          >
            <span class="text-gray-500">نوع الدين:</span>
            <span>{{ getTypeName(selectedDebtDetails.debt_type) }}</span>
          </div>
          <div
            class="flex flex-col sm:flex-row sm:justify-between border-b pb-2"
          >
            <span class="text-gray-500">الدائن:</span>
            <span class="font-medium">{{
              selectedDebtDetails.creditor_name
            }}</span>
          </div>
          <div
            class="flex flex-col sm:flex-row sm:justify-between border-b pb-2"
          >
            <span class="text-gray-500">الوصف:</span>
            <span class="break-words">{{
              selectedDebtDetails.description || "-"
            }}</span>
          </div>
          <div
            class="flex flex-col sm:flex-row sm:justify-between border-b pb-2"
          >
            <span class="text-gray-500">إجمالي الدين:</span>
            <span>{{ formatNumber(selectedDebtDetails.total_amount) }} ج</span>
          </div>
          <div
            class="flex flex-col sm:flex-row sm:justify-between border-b pb-2"
          >
            <span class="text-gray-500">المدفوع:</span>
            <span class="text-green-600"
              >{{ formatNumber(selectedDebtDetails.paid_amount) }} ج</span
            >
          </div>
          <div
            class="flex flex-col sm:flex-row sm:justify-between border-b pb-2"
          >
            <span class="text-gray-500">المتبقي:</span>
            <span class="text-red-600 font-bold"
              >{{ formatNumber(selectedDebtDetails.remaining_amount) }} ج</span
            >
          </div>
          <div
            class="flex flex-col sm:flex-row sm:justify-between border-b pb-2"
          >
            <span class="text-gray-500">قيمة القسط:</span>
            <span>{{
              selectedDebtDetails.installment_amount
                ? formatNumber(selectedDebtDetails.installment_amount) + " ج"
                : "-"
            }}</span>
          </div>
          <div
            class="flex flex-col sm:flex-row sm:justify-between border-b pb-2"
          >
            <span class="text-gray-500">تاريخ الاستحقاق:</span>
            <span
              :class="
                isDueDateLate(selectedDebtDetails.due_date)
                  ? 'text-red-600'
                  : ''
              "
              >{{ formatDate(selectedDebtDetails.due_date) }}</span
            >
          </div>
          <div class="flex flex-col sm:flex-row sm:justify-between">
            <span class="text-gray-500">ملاحظات:</span>
            <span class="text-sm break-words">{{
              selectedDebtDetails.notes || "-"
            }}</span>
          </div>
        </div>
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

const supabase = useSupabaseClient();
const userStore = useUserStore();

// ✅ Toast state
const toast = ref({ show: false, message: "", type: "success", icon: "✅" });

// ✅ دالة عرض Toast
const showToast = (message, type = "success") => {
  const icons = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
  };
  toast.value = {
    show: true,
    message,
    type,
    icon: icons[type] || "✅",
  };
  setTimeout(() => {
    toast.value.show = false;
  }, 3000);
};

// State
const activeTab = ref("list");
const loading = ref(false);
const paymentLoading = ref(false);
const filterType = ref("all");
const filterStatus = ref("all");
const searchQuery = ref("");
const debts = ref([]);
const allPayments = ref([]);
const showPaymentModalFlag = ref(false);
const showDetailsModal = ref(false);
const selectedDebt = ref(null);
const selectedDebtDetails = ref(null);
const paymentAmount = ref(0);
const paymentMethod = ref("cash");
const paymentNotes = ref("");

// حساب الإحصائيات
const totalRemaining = ref(0);
const totalPaid = ref(0);
const dueThisMonth = ref(0);

// بيانات الدين الجديد
const newDebt = ref({
  debt_type: "",
  creditor_name: "",
  description: "",
  total_amount: 0,
  paid_amount: 0,
  installment_count: null,
  installment_amount: 0,
  due_date: new Date().toISOString().split("T")[0],
  start_date: new Date().toISOString().split("T")[0],
  notes: "",
});

// Helper functions
const formatNumber = (num) => {
  if (!num && num !== 0) return "0";
  return num.toLocaleString("ar-EG");
};

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("ar-EG");
};

const getTypeName = (type) => {
  const types = {
    bank_loan: "🏦 قرض بنكي",
    rent: "🏢 إيجار",
    salary: "👥 رواتب",
    personal_loan: "👤 قرض شخصي",
    bills: "💡 فواتير",
    other: "📦 أخرى",
  };
  return types[type] || type;
};

const getTypeClass = (type) => {
  const classes = {
    bank_loan: "bg-blue-100 text-blue-700",
    rent: "bg-orange-100 text-orange-700",
    salary: "bg-green-100 text-green-700",
    personal_loan: "bg-purple-100 text-purple-700",
    bills: "bg-yellow-100 text-yellow-700",
    other: "bg-gray-100 text-gray-700",
  };
  return classes[type] || "bg-gray-100 text-gray-700";
};

const getStatusName = (debt) => {
  if (debt.status === "completed") return "✅ منتهي";
  if (isDueDateLate(debt.due_date) && debt.remaining_amount > 0)
    return "⚠️ متأخر";
  return "📅 نشط";
};

const getStatusClass = (debt) => {
  if (debt.status === "completed") return "bg-green-100 text-green-700";
  if (isDueDateLate(debt.due_date) && debt.remaining_amount > 0)
    return "bg-red-100 text-red-700";
  return "bg-yellow-100 text-yellow-700";
};

const getPaymentMethodName = (method) => {
  const methods = {
    cash: "💰 كاش",
    bank_transfer: "🏦 تحويل بنكي",
    check: "📄 شيك",
  };
  return methods[method] || method;
};

const isDueDateLate = (dueDate) => {
  if (!dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  return due < today;
};

// حساب قيمة القسط
const calculateInstallment = () => {
  const remaining =
    newDebt.value.total_amount - (newDebt.value.paid_amount || 0);
  const count = newDebt.value.installment_count;
  if (count && count > 0 && remaining > 0) {
    newDebt.value.installment_amount = Math.ceil(remaining / count);
  } else {
    newDebt.value.installment_amount = 0;
  }
};

// جلب الديون
const loadDebts = async () => {
  try {
    const { data } = await supabase
      .from("project_debts")
      .select("*")
      .order("due_date", { ascending: true });

    debts.value = data || [];

    let remaining = 0;
    let paid = 0;
    let dueThis = 0;
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    debts.value.forEach((debt) => {
      remaining += debt.remaining_amount || 0;
      paid += debt.paid_amount || 0;

      const dueDate = new Date(debt.due_date);
      if (
        dueDate.getMonth() === currentMonth &&
        dueDate.getFullYear() === currentYear &&
        debt.remaining_amount > 0
      ) {
        dueThis += debt.installment_amount || debt.remaining_amount;
      }
    });

    totalRemaining.value = remaining;
    totalPaid.value = paid;
    dueThisMonth.value = dueThis;
  } catch (error) {
    console.error("Error loading debts:", error);
    showToast("❌ حدث خطأ في تحميل الديون", "error");
  }
};

// جلب سجل المدفوعات
const loadPayments = async () => {
  try {
    const { data } = await supabase
      .from("project_debt_payments")
      .select(
        `
        *,
        project_debts!inner (
          debt_type,
          creditor_name
        )
      `,
      )
      .order("payment_date", { ascending: false });

    if (data) {
      allPayments.value = data.map((p) => ({
        ...p,
        debt_type: p.project_debts?.debt_type,
        creditor_name: p.project_debts?.creditor_name,
      }));
    }
  } catch (error) {
    console.error("Error loading payments:", error);
  }
};

// تصفية الديون
const filteredDebts = computed(() => {
  let result = debts.value;

  if (filterType.value !== "all") {
    result = result.filter((d) => d.debt_type === filterType.value);
  }
  if (filterStatus.value !== "all") {
    if (filterStatus.value === "completed") {
      result = result.filter((d) => d.status === "completed");
    } else if (filterStatus.value === "late") {
      result = result.filter(
        (d) => d.remaining_amount > 0 && isDueDateLate(d.due_date),
      );
    } else if (filterStatus.value === "active") {
      result = result.filter(
        (d) => d.remaining_amount > 0 && !isDueDateLate(d.due_date),
      );
    }
  }
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (d) =>
        d.creditor_name.toLowerCase().includes(query) ||
        (d.description && d.description.toLowerCase().includes(query)),
    );
  }

  return result;
});

// إنشاء دين جديد
const createDebt = async () => {
  if (!userStore.canEdit) {
    showToast("⚠️ ليس لديك صلاحية لإضافة ديون", "warning");
    return;
  }

  if (
    !newDebt.value.debt_type ||
    !newDebt.value.creditor_name ||
    !newDebt.value.total_amount
  ) {
    showToast("⚠️ الرجاء ملء جميع الحقول المطلوبة", "warning");
    return;
  }

  loading.value = true;

  try {
    const remaining =
      newDebt.value.total_amount - (newDebt.value.paid_amount || 0);

    const { error } = await supabase.from("project_debts").insert([
      {
        debt_type: newDebt.value.debt_type,
        creditor_name: newDebt.value.creditor_name,
        description: newDebt.value.description,
        total_amount: newDebt.value.total_amount,
        paid_amount: newDebt.value.paid_amount || 0,
        remaining_amount: remaining,
        installment_count: newDebt.value.installment_count || null,
        installment_amount: newDebt.value.installment_amount || null,
        due_date: newDebt.value.due_date,
        start_date: newDebt.value.start_date,
        status: remaining <= 0 ? "completed" : "active",
        notes: newDebt.value.notes,
      },
    ]);

    if (error) throw error;

    showToast("✅ تم إضافة الدين بنجاح", "success");
    resetForm();
    loadDebts();
    activeTab.value = "list";
  } catch (error) {
    console.error("Create debt error:", error);
    showToast("❌ خطأ: " + error.message, "error");
  } finally {
    loading.value = false;
  }
};

// فتح مودال السداد
const openPaymentModal = (debt) => {
  if (!userStore.canEdit) {
    showToast("⚠️ ليس لديك صلاحية لتسديد الديون", "warning");
    return;
  }
  selectedDebt.value = debt;
  paymentAmount.value = debt.installment_amount || debt.remaining_amount;
  paymentMethod.value = "cash";
  paymentNotes.value = "";
  showPaymentModalFlag.value = true;
};

// معالجة السداد
const processPayment = async () => {
  if (!userStore.canEdit) {
    showToast("⚠️ ليس لديك صلاحية لتسديد الديون", "warning");
    return;
  }

  if (!paymentAmount.value || paymentAmount.value <= 0) {
    showToast("⚠️ المبلغ غير صحيح", "warning");
    return;
  }
  if (paymentAmount.value > selectedDebt.value.remaining_amount) {
    showToast("⚠️ المبلغ أكبر من المتبقي", "warning");
    return;
  }

  paymentLoading.value = true;

  try {
    // تسجيل الدفعة
    const { error: paymentError } = await supabase
      .from("project_debt_payments")
      .insert([
        {
          debt_id: selectedDebt.value.id,
          payment_date: new Date().toISOString().split("T")[0],
          amount: paymentAmount.value,
          payment_method: paymentMethod.value,
          notes: paymentNotes.value,
        },
      ]);

    if (paymentError) throw paymentError;

    // تحديث بيانات الدين
    const newPaid = selectedDebt.value.paid_amount + paymentAmount.value;
    const newRemaining = selectedDebt.value.total_amount - newPaid;
    const newStatus = newRemaining <= 0 ? "completed" : "active";

    const { error: updateError } = await supabase
      .from("project_debts")
      .update({
        paid_amount: newPaid,
        remaining_amount: newRemaining,
        status: newStatus,
      })
      .eq("id", selectedDebt.value.id);

    if (updateError) throw updateError;

    showToast("✅ تم تسجيل السداد بنجاح", "success");
    showPaymentModalFlag.value = false;
    await loadDebts();
    await loadPayments();
  } catch (error) {
    console.error("Payment error:", error);
    showToast("❌ خطأ: " + error.message, "error");
  } finally {
    paymentLoading.value = false;
  }
};

// عرض تفاصيل الدين
const viewDebtDetails = (debt) => {
  selectedDebtDetails.value = debt;
  showDetailsModal.value = true;
};

// حذف دين
const deleteDebt = async (id) => {
  if (!userStore.canEdit) {
    showToast("⚠️ ليس لديك صلاحية لحذف الديون", "warning");
    return;
  }

  if (!confirm("هل أنت متأكد من حذف هذا الدين؟")) return;

  try {
    const { error } = await supabase
      .from("project_debts")
      .delete()
      .eq("id", id);

    if (error) throw error;

    showToast("✅ تم حذف الدين بنجاح", "success");
    await loadDebts();
  } catch (error) {
    console.error("Delete debt error:", error);
    showToast("❌ خطأ: " + error.message, "error");
  }
};

const resetForm = () => {
  newDebt.value = {
    debt_type: "",
    creditor_name: "",
    description: "",
    total_amount: 0,
    paid_amount: 0,
    installment_count: null,
    installment_amount: 0,
    due_date: new Date().toISOString().split("T")[0],
    start_date: new Date().toISOString().split("T")[0],
    notes: "",
  };
};

// مراقبة
watch(() => newDebt.value.total_amount, calculateInstallment);
watch(() => newDebt.value.paid_amount, calculateInstallment);
watch(() => newDebt.value.installment_count, calculateInstallment);

onMounted(() => {
  loadDebts();
  loadPayments();
});
</script>

<style scoped>
/* تحسين مظهر الـ select والمودال على الموبايل */
@media (max-width: 640px) {
  select,
  input,
  textarea {
    font-size: 16px !important;
  }
}
</style>
