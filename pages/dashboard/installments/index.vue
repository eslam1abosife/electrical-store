<template>
  <div class="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen" dir="rtl">
    <!-- Header -->
    <div class="mb-4 sm:mb-6">
      <div
        class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
            🏦 عقود التقسيط
          </h1>
          <p class="text-sm sm:text-base text-gray-500">
            إدارة عقود التقسيط ومتابعة الأقساط وتأجيل الدفعات
          </p>
        </div>
        <!-- إحصائيات سريعة للكشوفات -->
        <div class="flex gap-2">
          <div class="bg-pink-100 rounded-xl px-3 py-2 text-center">
            <p class="text-xs text-pink-600">عقود كشوفات</p>
            <p class="text-lg font-bold text-pink-600">
              {{ formatNumber(brideContractsStats.total) }} ج
            </p>
          </div>
          <div class="bg-purple-100 rounded-xl px-3 py-2 text-center">
            <p class="text-xs text-purple-600">عدد العقود</p>
            <p class="text-lg font-bold text-purple-600">
              {{ brideContractsStats.count }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 sm:gap-2 flex-wrap mb-4 sm:mb-6 border-b">
      <button
        @click="activeTab = 'contracts'"
        class="px-3 sm:px-6 py-2 sm:py-3 font-medium transition text-sm sm:text-base"
        :class="
          activeTab === 'contracts'
            ? 'border-b-2 border-blue-600 text-blue-600'
            : 'text-gray-500'
        "
      >
        📋 عقود التقسيط
      </button>
      <button
        v-if="userStore?.canEdit"
        @click="activeTab = 'new'"
        class="px-3 sm:px-6 py-2 sm:py-3 font-medium transition text-sm sm:text-base"
        :class="
          activeTab === 'new'
            ? 'border-b-2 border-blue-600 text-blue-600'
            : 'text-gray-500'
        "
      >
        ➕ عقد جديد
      </button>
      <button
        @click="activeTab = 'payments'"
        class="px-3 sm:px-6 py-2 sm:py-3 font-medium transition text-sm sm:text-base"
        :class="
          activeTab === 'payments'
            ? 'border-b-2 border-blue-600 text-blue-600'
            : 'text-gray-500'
        "
      >
        💰 سداد الأقساط
      </button>
      <button
        @click="activeTab = 'postponeLog'"
        class="px-3 sm:px-6 py-2 sm:py-3 font-medium transition text-sm sm:text-base"
        :class="
          activeTab === 'postponeLog'
            ? 'border-b-2 border-orange-600 text-orange-600'
            : 'text-gray-500'
        "
      >
        📜 سجل التأجيلات
      </button>
    </div>

    <!-- ================= عقود التقسيط ================= -->
    <div v-if="activeTab === 'contracts'">
      <!-- فلتر -->
      <div class="bg-white rounded-2xl shadow p-3 sm:p-4 mb-6">
        <div class="flex flex-col sm:flex-row gap-3">
          <select
            v-model="filterStatus"
            class="p-2 border rounded-lg text-sm flex-1"
          >
            <option value="all">جميع العقود</option>
            <option value="active">نشطة</option>
            <option value="completed">منتهية</option>
            <option value="defaulted">متأخرة</option>
          </select>
          <select
            v-model="filterSaleType"
            class="p-2 border rounded-lg text-sm flex-1"
          >
            <option value="all">جميع المبيعات</option>
            <option value="online">🖥️ من الموقع</option>
            <option value="offline">🏪 من المعرض</option>
          </select>
          <!-- فلتر نوع العقود -->
          <select
            v-model="filterContractType"
            class="p-2 border rounded-lg text-sm flex-1"
          >
            <option value="all">جميع العقود</option>
            <option value="normal">عقود عادية</option>
            <option value="bride">عقود كشوفات عرائس</option>
          </select>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="🔍 بحث باسم العميل..."
            class="p-2 border rounded-lg text-sm flex-1"
          />
        </div>
      </div>

      <!-- بطاقات العقود - Responsive -->
      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
      >
        <div
          v-for="contract in filteredContracts"
          :key="contract.id"
          class="bg-white rounded-2xl shadow overflow-hidden"
        >
          <div
            class="p-4"
            :class="contract.status === 'active' ? 'bg-blue-50' : 'bg-gray-100'"
          >
            <div class="flex justify-between items-start mb-3">
              <div class="flex-1 min-w-0">
                <h3 class="font-bold text-base sm:text-lg truncate">
                  {{ contract.customer_name }}
                </h3>
                <p class="text-xs sm:text-sm text-gray-500 dir-ltr">
                  {{ contract.customer_phone }}
                </p>
              </div>
              <div class="flex flex-col items-end gap-1">
                <span
                  :class="
                    contract.sale_type === 'online'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-purple-100 text-purple-700'
                  "
                  class="px-2 py-1 rounded-full text-xs whitespace-nowrap shrink-0 mr-2"
                >
                  {{ contract.sale_type === "online" ? "🖥️ موقع" : "🏪 معرض" }}
                </span>
                <!-- علامة كشف عروسة -->
                <span
                  v-if="contract.is_from_bride"
                  class="bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full text-xs whitespace-nowrap"
                >
                  👰 كشف عروسة
                </span>
              </div>
            </div>

            <div class="space-y-2 text-sm">
              <div class="flex justify-between flex-wrap gap-1">
                <span class="text-gray-500">إجمالي المبلغ:</span>
                <span class="font-bold"
                  >{{ formatNumber(contract.total_amount) }} ج</span
                >
              </div>
              <div class="flex justify-between flex-wrap gap-1">
                <span class="text-gray-500">دفعة مقدمة:</span>
                <span>{{ formatNumber(contract.down_payment) }} ج</span>
              </div>
              <div class="flex justify-between flex-wrap gap-1">
                <span class="text-gray-500">المتبقي:</span>
                <span class="font-bold text-orange-600"
                  >{{ formatNumber(contract.remaining_amount) }} ج</span
                >
              </div>
              <div class="flex justify-between flex-wrap gap-1">
                <span class="text-gray-500">القيمة الشهرية:</span>
                <span
                  >{{ formatNumber(contract.installment_amount) }} ج ×
                  {{ contract.installment_count }} شهر</span
                >
              </div>
              <div
                class="flex justify-between text-xs text-gray-400 flex-wrap gap-1"
              >
                <span>من: {{ formatDate(contract.start_date) }}</span>
                <span>إلى: {{ formatDate(contract.end_date) }}</span>
              </div>
            </div>
          </div>

          <div class="p-3 sm:p-4 border-t flex gap-2">
            <button
              @click="viewContractDetails(contract)"
              class="flex-1 bg-blue-600 text-white py-2 rounded-lg text-xs sm:text-sm"
            >
              تفاصيل الأقساط
            </button>
            <button
              v-if="userStore?.canEdit"
              @click="confirmDeleteContract(contract.id)"
              class="px-3 sm:px-4 bg-red-100 text-red-600 rounded-lg text-xs sm:text-sm"
            >
              حذف
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ================= عقد جديد - Responsive ================= -->
    <div
      v-if="activeTab === 'new'"
      class="bg-white rounded-2xl shadow p-4 sm:p-6"
    >
      <h2 class="text-lg sm:text-xl font-bold mb-4 sm:mb-6">
        ➕ إنشاء عقد تقسيط جديد
      </h2>

      <form @submit.prevent="createContract" class="space-y-4 sm:space-y-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">نوع البيع *</label>
            <select
              v-model="newContract.sale_type"
              required
              class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
            >
              <option value="online">🖥️ من الموقع</option>
              <option value="offline">🏪 من المعرض</option>
            </select>
          </div>
          <div v-if="newContract.sale_type === 'offline'">
            <label class="block text-sm font-medium mb-1">اسم البائع</label>
            <input
              v-model="newContract.cashier_name"
              type="text"
              class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">اسم العميل *</label>
            <input
              v-model="newContract.customer_name"
              required
              class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">رقم الهاتف *</label>
            <input
              v-model="newContract.customer_phone"
              required
              class="w-full p-2.5 sm:p-3 border rounded-xl text-sm dir-ltr"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">العنوان</label>
          <textarea
            v-model="newContract.customer_address"
            rows="2"
            class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
          ></textarea>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div>
            <label class="block text-sm font-medium mb-1"
              >إجمالي المبلغ *</label
            >
            <input
              v-model.number="newContract.total_amount"
              type="number"
              required
              @input="calculateInstallments"
              class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">دفعة مقدمة</label>
            <input
              v-model.number="newContract.down_payment"
              type="number"
              @input="calculateInstallments"
              class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">عدد الأقساط *</label>
            <input
              v-model.number="newContract.installment_count"
              type="number"
              required
              @input="calculateInstallments"
              class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">قيمة القسط</label>
            <input
              :value="newContract.installment_amount"
              type="number"
              readonly
              class="w-full p-2.5 sm:p-3 border rounded-xl bg-gray-100 text-sm"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1"
              >تاريخ بدء التقسيط *</label
            >
            <input
              v-model="newContract.start_date"
              type="date"
              required
              @change="calculateEndDate"
              class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">تاريخ الانتهاء</label>
            <input
              :value="newContract.end_date"
              type="date"
              readonly
              class="w-full p-2.5 sm:p-3 border rounded-xl bg-gray-100 text-sm"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">ملاحظات</label>
          <textarea
            v-model="newContract.notes"
            rows="2"
            class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
          ></textarea>
        </div>

        <div class="flex flex-col sm:flex-row gap-3">
          <button
            v-if="userStore?.canEdit"
            type="submit"
            :disabled="loading"
            class="bg-green-600 text-white px-4 sm:px-8 py-2.5 sm:py-3 rounded-xl hover:bg-green-700 text-sm sm:text-base"
          >
            {{ loading ? "جاري الحفظ..." : "✅ إنشاء العقد" }}
          </button>
          <button
            v-if="userStore?.canEdit"
            type="button"
            @click="resetForm"
            class="bg-gray-200 px-4 sm:px-8 py-2.5 sm:py-3 rounded-xl hover:bg-gray-300 text-sm sm:text-base"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>

    <!-- ================= سداد الأقساط - Responsive ================= -->
    <div v-if="activeTab === 'payments'">
      <div class="bg-white rounded-2xl shadow overflow-hidden">
        <div class="p-3 sm:p-4 border-b">
          <h2 class="text-lg sm:text-xl font-bold">💰 سداد قسط</h2>
        </div>

        <div class="p-4 sm:p-6">
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1"
              >اختر عقد التقسيط</label
            >
            <select
              v-model="selectedContractId"
              @change="loadContractPayments"
              class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
            >
              <option value="">-- اختر العميل --</option>
              <option v-for="c in activeContracts" :key="c.id" :value="c.id">
                {{ c.customer_name }} {{ c.is_from_bride ? "👰" : "" }} - متبقي:
                {{ formatNumber(c.remaining_amount) }} ج
              </option>
            </select>
          </div>

          <div v-if="selectedContract" class="space-y-4">
            <!-- Summary Cards -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div class="bg-gray-50 p-3 rounded-xl text-center">
                <p class="text-xs text-gray-500">إجمالي العقد</p>
                <p class="font-bold text-sm sm:text-base">
                  {{ formatNumber(selectedContract.total_amount) }} ج
                </p>
              </div>
              <div class="bg-gray-50 p-3 rounded-xl text-center">
                <p class="text-xs text-gray-500">المدفوع</p>
                <p class="font-bold text-green-600 text-sm sm:text-base">
                  {{
                    formatNumber(
                      selectedContract.total_amount -
                        selectedContract.remaining_amount,
                    )
                  }}
                  ج
                </p>
              </div>
              <div class="bg-gray-50 p-3 rounded-xl text-center">
                <p class="text-xs text-gray-500">المتبقي</p>
                <p class="font-bold text-orange-600 text-sm sm:text-base">
                  {{ formatNumber(selectedContract.remaining_amount) }} ج
                </p>
              </div>
              <div class="bg-gray-50 p-3 rounded-xl text-center">
                <p class="text-xs text-gray-500">عدد الأقساط</p>
                <p class="font-bold text-sm sm:text-base">
                  {{ getPaidCount }}/{{ selectedContract.installment_count }}
                </p>
              </div>
            </div>

            <!-- Mobile Cards for Payments -->
            <div class="block md:hidden space-y-3">
              <div
                v-for="payment in contractPayments"
                :key="payment.id"
                class="border rounded-xl p-4"
              >
                <div class="flex justify-between items-center mb-2">
                  <span class="font-bold"
                    >قسط {{ payment.installment_number }}</span
                  >
                  <span
                    :class="
                      payment.status === 'paid'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    "
                    class="px-2 py-1 rounded-full text-xs"
                  >
                    {{ payment.status === "paid" ? "مدفوع" : "مستحق" }}
                  </span>
                </div>
                <div class="space-y-1 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-500">تاريخ الاستحقاق:</span>
                    <span
                      :class="isLate(payment) ? 'text-red-600 font-bold' : ''"
                      >{{ formatDate(payment.due_date) }}</span
                    >
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">القيمة:</span>
                    <span>{{ formatNumber(payment.amount) }} ج</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">المدفوع:</span>
                    <span>{{ formatNumber(payment.paid_amount) }} ج</span>
                  </div>
                </div>
                <div class="flex gap-2 mt-3">
                  <button
                    v-if="userStore.canEdit && payment.status !== 'paid'"
                    @click="showPaymentModal(payment)"
                    class="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm"
                  >
                    💰 سداد
                  </button>
                  <button
                    v-if="userStore.canEdit && payment.status !== 'paid'"
                    @click="showPostponeModal(payment)"
                    class="flex-1 bg-orange-500 text-white py-2 rounded-lg text-sm"
                  >
                    📅 تأجيل
                  </button>
                  <span
                    v-else
                    class="flex-1 text-center text-gray-400 text-sm py-2"
                    >تم السداد</span
                  >
                </div>
              </div>
            </div>

            <!-- Desktop Table for Payments -->
            <div class="hidden md:block overflow-x-auto">
              <table class="w-full border rounded-xl min-w-[600px]">
                <thead class="bg-gray-100">
                  <tr>
                    <th class="p-3 text-right text-sm">رقم القسط</th>
                    <th class="p-3 text-right text-sm">تاريخ الاستحقاق</th>
                    <th class="p-3 text-right text-sm">القيمة</th>
                    <th class="p-3 text-right text-sm hidden lg:table-cell">
                      المدفوع
                    </th>
                    <th class="p-3 text-right text-sm">الحالة</th>
                    <th class="p-3 text-right text-sm">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="payment in contractPayments"
                    :key="payment.id"
                    class="border-t"
                  >
                    <td class="p-3 text-sm">
                      {{ payment.installment_number }}
                    </td>
                    <td
                      class="p-3 text-sm"
                      :class="isLate(payment) ? 'text-red-600 font-bold' : ''"
                    >
                      {{ formatDate(payment.due_date) }}
                      <span
                        v-if="isLate(payment)"
                        class="bg-red-100 text-red-600 text-xs px-1 rounded mr-1"
                        >متأخر</span
                      >
                    </td>
                    <td class="p-3 text-sm whitespace-nowrap">
                      {{ formatNumber(payment.amount) }} ج
                    </td>
                    <td
                      class="p-3 text-sm hidden lg:table-cell whitespace-nowrap"
                    >
                      {{ formatNumber(payment.paid_amount) }} ج
                    </td>
                    <td class="p-3">
                      <span
                        :class="
                          payment.status === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        "
                        class="px-2 py-1 rounded-full text-xs whitespace-nowrap"
                      >
                        {{ payment.status === "paid" ? "مدفوع" : "مستحق" }}
                      </span>
                    </td>
                    <td class="p-3">
                      <div class="flex gap-2 flex-wrap">
                        <button
                          v-if="userStore.canEdit && payment.status !== 'paid'"
                          @click="showPaymentModal(payment)"
                          class="bg-green-600 text-white px-3 py-1 rounded-lg text-sm"
                        >
                          سداد
                        </button>
                        <button
                          v-if="userStore.canEdit && payment.status !== 'paid'"
                          @click="showPostponeModal(payment)"
                          class="bg-orange-500 text-white px-3 py-1 rounded-lg text-sm"
                        >
                          تأجيل
                        </button>
                        <span v-else class="text-gray-400 text-sm"
                          >تم السداد</span
                        >
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ================= سجل التأجيلات - Responsive ================= -->
    <div
      v-if="activeTab === 'postponeLog'"
      class="bg-white rounded-2xl shadow overflow-hidden"
    >
      <div class="p-3 sm:p-4 border-b bg-orange-50">
        <h2 class="text-lg sm:text-xl font-bold text-orange-700">
          📜 سجل تأجيلات الأقساط
        </h2>
      </div>

      <!-- Mobile Cards for Postpone Logs -->
      <div class="block md:hidden divide-y">
        <div
          v-for="log in postponeLogs"
          :key="log.id"
          class="p-4 hover:bg-gray-50"
        >
          <div class="flex justify-between items-start mb-2">
            <span class="font-medium text-sm">{{
              getCustomerName(log.contract_id)
            }}</span>
            <span class="text-xs text-gray-500"
              >قسط {{ getPaymentNumber(log.payment_id) }}</span
            >
          </div>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">التاريخ القديم:</span>
              <span class="text-orange-600">{{
                formatDate(log.old_due_date)
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">التاريخ الجديد:</span>
              <span class="text-green-600">{{
                formatDate(log.new_due_date)
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">السبب:</span>
              <span>{{ getReasonName(log.reason) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">تاريخ التأجيل:</span>
              <span class="text-xs">{{ formatDateTime(log.created_at) }}</span>
            </div>
            <div v-if="log.notes" class="mt-1 text-xs text-gray-500">
              📝 {{ log.notes }}
            </div>
          </div>
        </div>
        <div
          v-if="postponeLogs.length === 0"
          class="text-center py-12 text-gray-400"
        >
          لا توجد تأجيلات حتى الآن
        </div>
      </div>

      <!-- Desktop Table for Postpone Logs -->
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full min-w-[700px]">
          <thead class="bg-gray-100">
            <tr>
              <th class="p-3 text-right text-sm">العميل</th>
              <th class="p-3 text-right text-sm">رقم القسط</th>
              <th class="p-3 text-right text-sm hidden lg:table-cell">
                التاريخ القديم
              </th>
              <th class="p-3 text-right text-sm hidden lg:table-cell">
                التاريخ الجديد
              </th>
              <th class="p-3 text-right text-sm">السبب</th>
              <th class="p-3 text-right text-sm hidden xl:table-cell">
                تاريخ التأجيل
              </th>
              <th class="p-3 text-right text-sm hidden xl:table-cell">
                الملاحظات
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="log in postponeLogs"
              :key="log.id"
              class="border-t hover:bg-gray-50"
            >
              <td class="p-3 text-sm font-medium">
                {{ getCustomerName(log.contract_id) }}
              </td>
              <td class="p-3 text-sm">
                {{ getPaymentNumber(log.payment_id) }}
              </td>
              <td class="p-3 text-sm text-orange-600 hidden lg:table-cell">
                {{ formatDate(log.old_due_date) }}
              </td>
              <td class="p-3 text-sm text-green-600 hidden lg:table-cell">
                {{ formatDate(log.new_due_date) }}
              </td>
              <td class="p-3 text-sm">{{ getReasonName(log.reason) }}</td>
              <td
                class="p-3 text-xs text-gray-500 hidden xl:table-cell whitespace-nowrap"
              >
                {{ formatDateTime(log.created_at) }}
              </td>
              <td
                class="p-3 text-sm text-gray-500 hidden xl:table-cell max-w-[200px] truncate"
              >
                {{ log.notes || "-" }}
              </td>
            </tr>
            <tr v-if="postponeLogs.length === 0">
              <td colspan="7" class="text-center py-12 text-gray-400">
                لا توجد تأجيلات حتى الآن
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ================= Modal سداد القسط - Responsive ================= -->
    <div
      v-if="showPaymentModalFlag"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      @click.self="showPaymentModalFlag = false"
    >
      <div class="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-md">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg sm:text-xl font-bold">
            💰 سداد القسط رقم {{ selectedPayment?.installment_number }}
          </h2>
          <button
            @click="showPaymentModalFlag = false"
            class="text-gray-400 hover:text-gray-600 text-2xl"
          >
            &times;
          </button>
        </div>

        <div class="space-y-4">
          <div class="bg-gray-50 p-3 rounded-lg text-sm sm:text-base">
            <p>
              قيمة القسط:
              <strong class="text-blue-600"
                >{{ formatNumber(selectedPayment?.amount) }} ج</strong
              >
            </p>
            <p>
              تاريخ الاستحقاق:
              <strong>{{ formatDate(selectedPayment?.due_date) }}</strong>
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">طريقة الدفع</label>
            <select
              v-model="paymentData.method"
              class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
            >
              <option value="cash">💰 كاش</option>
              <option value="card">💳 بطاقة</option>
              <option value="transfer">🏦 تحويل بنكي</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">ملاحظات</label>
            <textarea
              v-model="paymentData.notes"
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

    <!-- ================= Modal تأجيل القسط - Responsive ================= -->
    <div
      v-if="showPostponeModalFlag"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      @click.self="showPostponeModalFlag = false"
    >
      <div class="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-md">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg sm:text-xl font-bold">
            📅 تأجيل القسط رقم {{ selectedPayment?.installment_number }}
          </h2>
          <button
            @click="showPostponeModalFlag = false"
            class="text-gray-400 hover:text-gray-600 text-2xl"
          >
            &times;
          </button>
        </div>

        <div class="space-y-4">
          <div class="bg-yellow-50 p-3 rounded-lg text-sm sm:text-base">
            <p>
              تاريخ الاستحقاق الحالي:
              <strong class="text-orange-600">{{
                formatDate(selectedPayment?.due_date)
              }}</strong>
            </p>
            <p>
              قيمة القسط:
              <strong>{{ formatNumber(selectedPayment?.amount) }} ج</strong>
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1"
              >تاريخ الاستحقاق الجديد *</label
            >
            <input
              type="date"
              v-model="postponeData.new_due_date"
              :min="getMinDate()"
              class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">سبب التأجيل</label>
            <select
              v-model="postponeData.reason"
              class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
            >
              <option value="">-- اختر السبب --</option>
              <option value="customer_request">طلب من العميل</option>
              <option value="financial_difficulty">ظروف مالية</option>
              <option value="technical_error">خطأ في النظام</option>
              <option value="other">أخرى</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">ملاحظات</label>
            <textarea
              v-model="postponeData.notes"
              class="w-full p-2.5 sm:p-3 border rounded-xl text-sm"
              rows="2"
              placeholder="سبب التأجيل بالتفصيل..."
            ></textarea>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              v-if="userStore?.canEdit"
              @click="processPostpone"
              :disabled="postponeLoading"
              class="flex-1 bg-orange-600 text-white py-2.5 sm:py-3 rounded-xl hover:bg-orange-700 text-sm sm:text-base"
            >
              {{ postponeLoading ? "جاري..." : "تأكيد التأجيل" }}
            </button>
            <button
              @click="showPostponeModalFlag = false"
              class="flex-1 bg-gray-200 py-2.5 sm:py-3 rounded-xl hover:bg-gray-300 text-sm sm:text-base"
            >
              إلغاء
            </button>
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

// ==================== State ====================
const activeTab = ref("contracts");
const loading = ref(false);
const paymentLoading = ref(false);
const postponeLoading = ref(false);
const filterStatus = ref("all");
const filterSaleType = ref("all");
const filterContractType = ref("all");
const searchQuery = ref("");
const selectedContractId = ref("");
const selectedContract = ref(null);
const contractPayments = ref([]);
const activeContracts = ref([]);
const showPaymentModalFlag = ref(false);
const showPostponeModalFlag = ref(false);
const selectedPayment = ref(null);
const contracts = ref([]);
const postponeLogs = ref([]);

// إحصائيات عقود كشوفات العرائس
const brideContractsStats = ref({
  total: 0,
  count: 0,
});

// بيانات العقد الجديد
const newContract = ref({
  sale_type: "offline",
  cashier_name: "",
  customer_name: "",
  customer_phone: "",
  customer_address: "",
  total_amount: 0,
  down_payment: 0,
  installment_count: 6,
  installment_amount: 0,
  start_date: new Date().toISOString().split("T")[0],
  end_date: "",
  notes: "",
});

// بيانات السداد
const paymentData = ref({
  method: "cash",
  notes: "",
});

// بيانات التأجيل
const postponeData = ref({
  new_due_date: "",
  reason: "",
  notes: "",
});

// ==================== Helper Functions ====================
const formatNumber = (num) => {
  if (!num && num !== 0) return "0";
  return num.toLocaleString("ar-EG");
};

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("ar-EG");
};

const formatDateTime = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleString("ar-EG");
};

const getReasonName = (reason) => {
  const reasons = {
    customer_request: "طلب من العميل",
    financial_difficulty: "ظروف مالية",
    technical_error: "خطأ في النظام",
    other: "أخرى",
  };
  return reasons[reason] || reason || "-";
};

const getMinDate = () => {
  return new Date().toISOString().split("T")[0];
};

const isLate = (payment) => {
  if (payment.status === "paid") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(payment.due_date);
  return dueDate < today;
};

// ==================== حساب الأقساط ====================
const calculateInstallments = () => {
  const total = newContract.value.total_amount || 0;
  const down = newContract.value.down_payment || 0;
  const remaining = total - down;
  const count = newContract.value.installment_count || 1;

  newContract.value.installment_amount = Math.ceil(remaining / count);
};

const calculateEndDate = () => {
  if (newContract.value.start_date && newContract.value.installment_count) {
    const start = new Date(newContract.value.start_date);
    const end = new Date(start);
    end.setMonth(end.getMonth() + newContract.value.installment_count);
    newContract.value.end_date = end.toISOString().split("T")[0];
  }
};

// ==================== CRUD Operations ====================
const createContract = async () => {
  if (!userStore.canEdit) {
    showToast("⚠️ ليس لديك صلاحية لإنشاء عقود تقسيط", "warning");
    return;
  }

  if (!newContract.value.customer_name || !newContract.value.customer_phone) {
    showToast("⚠️ الرجاء إدخال اسم العميل ورقم الهاتف", "warning");
    return;
  }
  if (newContract.value.total_amount <= 0) {
    showToast("⚠️ إجمالي المبلغ غير صحيح", "warning");
    return;
  }
  if (newContract.value.installment_count <= 0) {
    showToast("⚠️ عدد الأقساط غير صحيح", "warning");
    return;
  }

  loading.value = true;

  try {
    const remaining =
      newContract.value.total_amount - (newContract.value.down_payment || 0);
    const installmentAmount = Math.ceil(
      remaining / newContract.value.installment_count,
    );

    const { data: contract, error: contractError } = await supabase
      .from("installment_contracts")
      .insert([
        {
          customer_name: newContract.value.customer_name,
          customer_phone: newContract.value.customer_phone,
          customer_address: newContract.value.customer_address,
          total_amount: newContract.value.total_amount,
          down_payment: newContract.value.down_payment || 0,
          remaining_amount: remaining,
          installment_count: newContract.value.installment_count,
          installment_amount: installmentAmount,
          start_date: newContract.value.start_date,
          end_date: newContract.value.end_date,
          status: "active",
          sale_type: newContract.value.sale_type,
          cashier_name: newContract.value.cashier_name,
          notes: newContract.value.notes,
        },
      ])
      .select();

    if (contractError) throw contractError;

    const payments = [];
    const startDate = new Date(newContract.value.start_date);

    for (let i = 1; i <= newContract.value.installment_count; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(startDate.getMonth() + i);
      payments.push({
        contract_id: contract[0].id,
        installment_number: i,
        due_date: dueDate.toISOString().split("T")[0],
        amount: installmentAmount,
        status: "pending",
      });
    }

    const { error: paymentsError } = await supabase
      .from("installment_payments")
      .insert(payments);

    if (paymentsError) throw paymentsError;

    showToast("✅ تم إنشاء عقد التقسيط بنجاح", "success");
    resetForm();
    loadContracts();
    activeTab.value = "contracts";
  } catch (error) {
    console.error("Create contract error:", error);
    showToast("❌ خطأ: " + error.message, "error");
  } finally {
    loading.value = false;
  }
};

const loadContracts = async () => {
  try {
    const { data } = await supabase
      .from("installment_contracts")
      .select("*")
      .order("created_at", { ascending: false });

    const contractsWithFlag = (data || []).map((contract) => ({
      ...contract,
      is_from_bride: contract.notes && contract.notes.includes("كشف عروسة"),
    }));

    contracts.value = contractsWithFlag;

    const brideContracts = contractsWithFlag.filter((c) => c.is_from_bride);
    brideContractsStats.value = {
      total: brideContracts.reduce(
        (sum, c) => sum + (c.remaining_amount || 0),
        0,
      ),
      count: brideContracts.length,
    };

    activeContracts.value = contractsWithFlag.filter(
      (c) => c.status === "active" && c.remaining_amount > 0,
    );
  } catch (error) {
    console.error("Load contracts error:", error);
  }
};

const loadContractPayments = async () => {
  if (!selectedContractId.value) return;

  try {
    const { data: contract } = await supabase
      .from("installment_contracts")
      .select("*")
      .eq("id", selectedContractId.value)
      .single();
    selectedContract.value = {
      ...contract,
      is_from_bride: contract.notes && contract.notes.includes("كشف عروسة"),
    };

    const { data: payments } = await supabase
      .from("installment_payments")
      .select("*")
      .eq("contract_id", selectedContractId.value)
      .order("installment_number");
    contractPayments.value = payments || [];
  } catch (error) {
    console.error("Load contract payments error:", error);
  }
};

const loadPostponeLogs = async () => {
  try {
    const { data } = await supabase
      .from("installment_postpone_log")
      .select("*")
      .order("created_at", { ascending: false });
    postponeLogs.value = data || [];
  } catch (error) {
    console.error("Load postpone logs error:", error);
  }
};

const getPaidCount = computed(() => {
  return contractPayments.value.filter((p) => p.status === "paid").length;
});

const filteredContracts = computed(() => {
  let result = contracts.value;

  if (filterStatus.value !== "all") {
    result = result.filter((c) => c.status === filterStatus.value);
  }
  if (filterSaleType.value !== "all") {
    result = result.filter((c) => c.sale_type === filterSaleType.value);
  }
  if (filterContractType.value === "normal") {
    result = result.filter((c) => !c.is_from_bride);
  } else if (filterContractType.value === "bride") {
    result = result.filter((c) => c.is_from_bride);
  }
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (c) =>
        c.customer_name.toLowerCase().includes(query) ||
        c.customer_phone.includes(query),
    );
  }

  return result;
});

const getCustomerName = (contractId) => {
  const contract = contracts.value.find((c) => c.id === contractId);
  return contract?.customer_name || "-";
};

const getPaymentNumber = (paymentId) => {
  const payment = contractPayments.value.find((p) => p.id === paymentId);
  return payment?.installment_number || "-";
};

// ==================== Payment ====================
const showPaymentModal = (payment) => {
  if (!userStore.canEdit) {
    showToast("⚠️ ليس لديك صلاحية لتسديد الأقساط", "warning");
    return;
  }
  selectedPayment.value = payment;
  paymentData.value = { method: "cash", notes: "" };
  showPaymentModalFlag.value = true;
};

const processPayment = async () => {
  if (!userStore.canEdit) {
    showToast("⚠️ ليس لديك صلاحية لتسديد الأقساط", "warning");
    return;
  }

  paymentLoading.value = true;

  try {
    const { error: updateError } = await supabase
      .from("installment_payments")
      .update({
        paid_amount: selectedPayment.value.amount,
        paid_date: new Date().toISOString().split("T")[0],
        status: "paid",
        payment_method: paymentData.value.method,
        notes: paymentData.value.notes,
      })
      .eq("id", selectedPayment.value.id);

    if (updateError) throw updateError;

    const newRemaining =
      selectedContract.value.remaining_amount - selectedPayment.value.amount;
    const newStatus = newRemaining <= 0 ? "completed" : "active";

    await supabase
      .from("installment_contracts")
      .update({ remaining_amount: newRemaining, status: newStatus })
      .eq("id", selectedContract.value.id);

    showToast("✅ تم تسجيل السداد بنجاح", "success");
    showPaymentModalFlag.value = false;
    await loadContractPayments();
    await loadContracts();
  } catch (error) {
    console.error("Payment error:", error);
    showToast("❌ خطأ: " + error.message, "error");
  } finally {
    paymentLoading.value = false;
  }
};

// ==================== Postpone ====================
const showPostponeModal = (payment) => {
  if (!userStore.canEdit) {
    showToast("⚠️ ليس لديك صلاحية لتأجيل الأقساط", "warning");
    return;
  }
  selectedPayment.value = payment;
  postponeData.value = {
    new_due_date: "",
    reason: "",
    notes: "",
  };
  showPostponeModalFlag.value = true;
};

const processPostpone = async () => {
  if (!userStore.canEdit) {
    showToast("⚠️ ليس لديك صلاحية لتأجيل الأقساط", "warning");
    return;
  }

  if (!postponeData.value.new_due_date) {
    showToast("⚠️ الرجاء اختيار تاريخ الاستحقاق الجديد", "warning");
    return;
  }

  postponeLoading.value = true;

  try {
    const newDate = new Date(postponeData.value.new_due_date);
    const oldDate = new Date(selectedPayment.value.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (newDate <= oldDate) {
      showToast(
        "⚠️ التاريخ الجديد يجب أن يكون بعد تاريخ الاستحقاق الحالي",
        "warning",
      );
      postponeLoading.value = false;
      return;
    }

    if (newDate < today) {
      showToast("⚠️ لا يمكن تأجيل القسط إلى تاريخ مضى", "warning");
      postponeLoading.value = false;
      return;
    }

    const { error: updateError } = await supabase
      .from("installment_payments")
      .update({
        due_date: postponeData.value.new_due_date,
        notes: `[تم التأجيل] السبب: ${postponeData.value.reason || "غير محدد"}`,
      })
      .eq("id", selectedPayment.value.id);

    if (updateError) throw updateError;

    const { error: logError } = await supabase
      .from("installment_postpone_log")
      .insert([
        {
          payment_id: selectedPayment.value.id,
          contract_id: selectedContract.value.id,
          old_due_date: selectedPayment.value.due_date,
          new_due_date: postponeData.value.new_due_date,
          reason: postponeData.value.reason,
          notes: postponeData.value.notes,
        },
      ]);

    if (logError) console.error("Log error:", logError);

    showToast("✅ تم تأجيل القسط بنجاح", "success");
    showPostponeModalFlag.value = false;
    await loadContractPayments();
    await loadContracts();
    await loadPostponeLogs();
  } catch (error) {
    console.error("Postpone error:", error);
    showToast("❌ خطأ: " + error.message, "error");
  } finally {
    postponeLoading.value = false;
  }
};

// ==================== Delete ====================
const confirmDeleteContract = async (id) => {
  if (!userStore.canEdit) {
    showToast("⚠️ ليس لديك صلاحية لحذف العقود", "warning");
    return;
  }

  if (
    confirm("هل أنت متأكد من حذف هذا العقد؟ سيتم حذف جميع الأقساط المرتبطة")
  ) {
    await deleteContract(id);
  }
};

const deleteContract = async (id) => {
  try {
    const { error } = await supabase
      .from("installment_contracts")
      .delete()
      .eq("id", id);

    if (error) throw error;

    showToast("✅ تم حذف العقد بنجاح", "success");
    await loadContracts();
  } catch (error) {
    console.error("Delete contract error:", error);
    showToast("❌ خطأ: " + error.message, "error");
  }
};

const viewContractDetails = (contract) => {
  const brideText = contract.is_from_bride ? "n📋 المصدر: كشف عروسة 👰" : "";
  showToast(
    `📄 تفاصيل العقد:nالعميل: ${contract.customer_name}nالمتبقي: ${contract.remaining_amount} جnعدد الأقساط المدفوعة: ${contract.installment_count - Math.ceil(contract.remaining_amount / contract.installment_amount)}/${contract.installment_count}${brideText}`,
    "info",
  );
};

const resetForm = () => {
  newContract.value = {
    sale_type: "offline",
    cashier_name: "",
    customer_name: "",
    customer_phone: "",
    customer_address: "",
    total_amount: 0,
    down_payment: 0,
    installment_count: 6,
    installment_amount: 0,
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    notes: "",
  };
};

// ==================== Watchers ====================
watch(() => newContract.value.total_amount, calculateInstallments);
watch(() => newContract.value.down_payment, calculateInstallments);
watch(() => newContract.value.installment_count, calculateInstallments);
watch(() => newContract.value.start_date, calculateEndDate);
watch(() => newContract.value.installment_count, calculateEndDate);

// ==================== Mounted ====================
onMounted(() => {
  loadContracts();
  loadPostponeLogs();
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
  input,
  textarea {
    font-size: 16px !important;
  }
}
</style>
