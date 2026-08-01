<!-- pages/dashboard/collector-fans/collector-dashboard.vue -->
<template>
  <div class="min-h-screen bg-gray-50" dir="rtl">
    <!-- التحقق من الجلسة -->
    <div v-if="!isLoggedIn" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="text-6xl mb-4">🔒</div>
        <h1 class="text-2xl font-bold mb-2">غير مسموح بالدخول</h1>
        <p class="text-gray-500 mb-4">يرجى تسجيل الدخول أولاً</p>
        <NuxtLink 
          to="/dashboard/collector-fans/login" 
          class="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 inline-block"
        >
          🚪 تسجيل الدخول
        </NuxtLink>
      </div>
    </div>

    <div v-else-if="loading" class="container mx-auto px-4 py-12 text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-4 text-gray-500">جاري تحميل البيانات...</p>
    </div>

    <div v-else-if="collector" class="container mx-auto px-4 py-6 sm:py-8">
      <!-- Header -->
      <div class="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div class="flex items-center gap-3">
              <div class="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-2xl shadow-lg">
                <span class="text-2xl">👤</span>
              </div>
              <div>
                <h1 class="text-2xl font-bold text-gray-800">{{ collector.name }}</h1>
                <p class="text-sm text-gray-500">📱 {{ collector.phone || 'لا يوجد رقم' }}</p>
                <p class="text-xs text-gray-400">📍 المنطقة: {{ collector.area || 'غير محدد' }}</p>
              </div>
            </div>
          </div>
          <div class="flex gap-2">
            <span class="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">✅ نشط</span>
            <button @click="logout" class="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition text-sm">🚪 خروج</button>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-2xl shadow p-4 text-center">
          <p class="text-xs text-gray-500">👥 إجمالي الزبائن</p>
          <p class="text-2xl font-bold text-blue-600">{{ clients.length }}</p>
        </div>
        <div class="bg-white rounded-2xl shadow p-4 text-center">
          <p class="text-xs text-gray-500">🔄 إجمالي المنتجات</p>
          <p class="text-2xl font-bold text-blue-600">{{ totalFans }}</p>
        </div>
        <div class="bg-white rounded-2xl shadow p-4 text-center">
          <p class="text-xs text-gray-500">💰 إجمالي المدفوع</p>
          <p class="text-2xl font-bold text-green-600">{{ formatNumber(totalPaid) }} ج</p>
        </div>
        <div class="bg-white rounded-2xl shadow p-4 text-center">
          <p class="text-xs text-gray-500">⚠️ إجمالي المتبقي</p>
          <p class="text-2xl font-bold text-orange-600">{{ formatNumber(totalRemaining) }} ج</p>
        </div>
      </div>

      <!-- مناطق الزبائن -->
      <div class="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
        <h2 class="text-lg font-bold mb-4">📍 المناطق</h2>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="area in areas"
            :key="area"
            @click="filterArea = area"
            class="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 border-2"
            :class="filterArea === area ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-300'"
          >
            {{ area }}
            <span class="text-xs bg-gray-100 px-2 py-0.5 rounded-full mr-1">{{ getClientsByArea(area).length }}</span>
          </button>
          <button @click="filterArea = ''" class="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 border-2" :class="filterArea === '' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-300'">
            📋 الكل
            <span class="text-xs bg-gray-100 px-2 py-0.5 rounded-full mr-1">{{ clients.length }}</span>
          </button>
        </div>
      </div>

      <!-- قائمة الزبائن -->
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div class="p-4 sm:p-6 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 class="text-lg font-bold">👥 قائمة الزبائن</h2>
          <button @click="openAddClientModal" class="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition flex items-center gap-2 text-sm">➕ إضافة زبون</button>
        </div>

        <!-- Mobile Cards -->
        <div class="block sm:hidden divide-y">
          <div v-for="client in filteredClients" :key="client.id" class="p-4 hover:bg-gray-50">
            <div class="flex justify-between items-start mb-2">
              <p class="font-bold">{{ client.name }}</p>
              <span class="text-xs text-gray-500">{{ client.area }}</span>
            </div>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div><span class="text-gray-500">📱</span> {{ client.phone || '-' }}</div>
              <div><span class="text-gray-500">🔄</span> {{ getClientTotalFans(client.id) }}</div>
              <div><span class="text-gray-500">💰</span> <span class="text-green-600">{{ formatNumber(getClientPaid(client.id)) }} ج</span></div>
              <div><span class="text-gray-500">⚠️</span> <span class="text-orange-600">{{ formatNumber(getClientRemaining(client.id)) }} ج</span></div>
            </div>
            <div class="flex gap-2 mt-3">
              <button @click="viewClient(client.id)" class="flex-1 bg-blue-500 text-white py-1.5 rounded-lg text-xs">👁️ عرض</button>
              <button @click="printClientPDF(client.id)" class="flex-1 bg-red-500 text-white py-1.5 rounded-lg text-xs">📄 PDF</button>
              <button @click="deleteClient(client.id)" class="flex-1 bg-red-500 text-white py-1.5 rounded-lg text-xs">🗑️</button>
            </div>
          </div>
        </div>

        <!-- Desktop Table -->
        <div class="hidden sm:block overflow-x-auto">
          <table class="w-full min-w-[1000px]">
            <thead class="bg-gray-50">
              <tr>
                <th class="p-3 text-right text-sm">#</th>
                <th class="p-3 text-right text-sm">الاسم</th>
                <th class="p-3 text-right text-sm">الهاتف</th>
                <th class="p-3 text-right text-sm">المنطقة</th>
                <th class="p-3 text-right text-sm">المنتجات</th>
                <th class="p-3 text-right text-sm">إجمالي المبلغ</th>
                <th class="p-3 text-right text-sm">المدفوع</th>
                <th class="p-3 text-right text-sm">المتبقي</th>
                <th class="p-3 text-right text-sm">القسط الشهري</th>
                <th class="p-3 text-right text-sm">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(client, idx) in filteredClients" :key="client.id" class="border-t hover:bg-gray-50">
                <td class="p-3">{{ idx + 1 }}</td>
                <td class="p-3 font-medium">{{ client.name }}</td>
                <td class="p-3">{{ client.phone || '-' }}</td>
                <td class="p-3"><span class="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs">{{ client.area }}</span></td>
                <td class="p-3">{{ getClientTotalFans(client.id) }}</td>
                <td class="p-3 font-bold">{{ formatNumber(getClientTotal(client.id)) }} ج</td>
                <td class="p-3 text-green-600">{{ formatNumber(getClientPaid(client.id)) }} ج</td>
                <td class="p-3 text-orange-600 font-bold">{{ formatNumber(getClientRemaining(client.id)) }} ج</td>
                <td class="p-3">
                  <span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    {{ formatNumber(getClientMonthlyInstallment(client.id)) }} ج
                  </span>
                </td>
                <td class="p-3">
                  <div class="flex gap-1">
                    <button @click="viewClient(client.id)" class="text-blue-600 hover:text-blue-800 px-2 py-1 rounded-lg text-xs bg-blue-50 hover:bg-blue-100">👁️</button>
                    <button @click="printClientPDF(client.id)" class="text-red-600 hover:text-red-800 px-2 py-1 rounded-lg text-xs bg-red-50 hover:bg-red-100">📄</button>
                    <button @click="deleteClient(client.id)" class="text-red-600 hover:text-red-800 px-2 py-1 rounded-lg text-xs bg-red-50 hover:bg-red-100">🗑️</button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredClients.length === 0">
                <td colspan="10" class="text-center py-12 text-gray-400">
                  <span class="text-4xl block mb-2">📭</span>
                  لا يوجد زبائن {{ filterArea ? `في منطقة ${filterArea}` : '' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Not Found -->
    <div v-else class="container mx-auto px-4 py-16 text-center">
      <div class="text-6xl mb-4">🔍</div>
      <h1 class="text-2xl font-bold mb-2">المحصل غير موجود</h1>
      <p class="text-gray-500">لم نتمكن من العثور على المحصل المطلوب</p>
      <NuxtLink to="/dashboard/collector-fans/login" class="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700">
        العودة لتسجيل الدخول
      </NuxtLink>
    </div>

    <!-- ================= مودال إضافة زبون ================= -->
    <div v-if="showClientModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="showClientModal = false">
      <div class="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div class="sticky top-0 bg-white border-b p-4 rounded-t-3xl">
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-bold">➕ إضافة زبون جديد</h2>
            <button @click="showClientModal = false" class="text-2xl hover:text-gray-600">&times;</button>
          </div>
        </div>

        <div class="p-6">
          <form @submit.prevent="saveClient" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"><span class="text-red-500">*</span> اسم الزبون</label>
                <input v-model="clientForm.name" type="text" required placeholder="اسم الزبون" class="w-full p-3 border rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                <input v-model="clientForm.phone" type="tel" placeholder="رقم الهاتف" class="w-full p-3 border rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition dir-ltr" />
              </div>
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1"><span class="text-red-500">*</span> العنوان</label>
                <input v-model="clientForm.address" type="text" required placeholder="العنوان الكامل" class="w-full p-3 border rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" />
              </div>
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1"><span class="text-red-500">*</span> المنطقة</label>
                <input v-model="clientForm.area" type="text" required placeholder="المنطقة" class="w-full p-3 border rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
              <textarea v-model="clientForm.notes" rows="2" placeholder="أي ملاحظات إضافية" class="w-full p-3 border rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"></textarea>
            </div>

            <div class="flex gap-3 pt-4 border-t">
              <button type="submit" :disabled="loading" class="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50">
                {{ loading ? 'جاري الحفظ...' : '✅ إضافة الزبون' }}
              </button>
              <button type="button" @click="showClientModal = false" class="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition">إلغاء</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- ================= مودال عرض الزبون ================= -->
    <div v-if="showViewModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="showViewModal = false">
      <div class="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div class="sticky top-0 bg-white border-b p-4 rounded-t-3xl z-10">
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-bold">👤 {{ selectedClient?.name }}</h2>
            <button @click="showViewModal = false" class="text-2xl hover:text-gray-600">&times;</button>
          </div>
        </div>

        <div class="p-6" id="client-report">
          <!-- Client Info -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-2xl">
            <div><span class="text-gray-500">📱 الهاتف:</span> <span class="font-semibold">{{ selectedClient?.phone || '-' }}</span></div>
            <div><span class="text-gray-500">📍 العنوان:</span> <span class="font-semibold">{{ selectedClient?.address }}</span></div>
            <div><span class="text-gray-500">🏠 المنطقة:</span> <span class="font-semibold">{{ selectedClient?.area }}</span></div>
            <div><span class="text-gray-500">💰 القسط الشهري:</span> <span class="font-semibold text-blue-600">{{ formatNumber(selectedClientMonthlyInstallment) }} ج</span></div>
          </div>

          <!-- أزرار الإجراءات -->
          <div class="flex flex-wrap gap-3 mb-4">
            <button 
              @click="openAddProductModal" 
              class="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition flex items-center gap-2 text-sm"
            >
              ➕ إضافة منتج
            </button>
            <button 
              @click="openAddPaymentModal" 
              class="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition flex items-center gap-2 text-sm"
            >
              💰 تسجيل قسط شهري
            </button>
            <button 
              @click="printClientPDF(selectedClient?.id)" 
              class="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition flex items-center gap-2 text-sm"
            >
              📄 PDF احترافي
            </button>
          </div>

          <!-- Products - مجمعة حسب الشهر والنوع -->
          <h3 class="font-bold text-lg mb-3">🔄 المنتجات</h3>
          <div class="overflow-x-auto mb-6">
            <table class="w-full min-w-[900px] text-sm">
              <thead class="bg-gray-100">
                <tr>
                  <th class="p-3 text-right">النوع</th>
                  <th class="p-3 text-right">الاسم</th>
                  <th class="p-3 text-right">الكمية</th>
                  <th class="p-3 text-right">سعر الوحدة</th>
                  <th class="p-3 text-right">الإجمالي</th>
                  <th class="p-3 text-right">المدفوع (مقدمة)</th>
                  <th class="p-3 text-right">المتبقي</th>
                  <th class="p-3 text-right">شهر المقدمة</th>
                  <th class="p-3 text-right">القسط الشهري</th>
                  <th class="p-3 text-right">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(product, idx) in groupedProducts" :key="idx" class="border-t hover:bg-gray-50">
                  <td class="p-3">{{ getProductTypeName(product.product_type) }}</td>
                  <td class="p-3">{{ product.product_name || getProductTypeName(product.product_type) }}</td>
                  <td class="p-3">{{ product.quantity }}</td>
                  <td class="p-3">{{ formatNumber(product.unit_price) }} ج</td>
                  <td class="p-3 font-bold">{{ formatNumber(product.total_price) }} ج</td>
                  <td class="p-3 text-green-600">{{ formatNumber(product.paid_amount || 0) }} ج</td>
                  <td class="p-3 text-orange-600 font-bold">{{ formatNumber(product.remaining_amount || 0) }} ج</td>
                  <td class="p-3">
                    <span class="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                      {{ getMonthName(product.delivery_month) }}
                    </span>
                  </td>
                  <td class="p-3">
                    <span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      {{ formatNumber(getProductMonthlyInstallment(product)) }} ج
                    </span>
                  </td>
                  <td class="p-3">
                    <button 
                      @click="deleteProduct(product.id)" 
                      class="text-red-600 hover:text-red-800 text-sm"
                    >
                      🗑️ حذف
                    </button>
                  </td>
                </tr>
                <tr v-if="groupedProducts.length === 0">
                  <td colspan="10" class="text-center py-4 text-gray-400">لا توجد منتجات</td>
                </tr>
              </tbody>
              <tfoot class="bg-gray-50 font-bold">
                <tr class="border-t">
                  <td colspan="4" class="p-3">📌 الإجمالي الكلي</td>
                  <td class="p-3">{{ formatNumber(selectedClientTotal) }} ج</td>
                  <td class="p-3 text-green-600">{{ formatNumber(selectedClientDownPayments) }} ج</td>
                  <td class="p-3 text-orange-600">{{ formatNumber(selectedClientRemaining) }} ج</td>
                  <td colspan="3"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- ========== جدول الأقساط الشهرية ========== -->
          <h3 class="font-bold text-lg mb-3">📅 سجل الأقساط الشهرية</h3>
          <div class="overflow-x-auto mb-6">
            <table class="w-full min-w-[700px] text-sm">
              <thead class="bg-blue-50">
                <tr>
                  <th class="p-3 text-right">#</th>
                  <th class="p-3 text-right">الشهر</th>
                  <th class="p-3 text-right">المبلغ المستحق</th>
                  <th class="p-3 text-right">المدفوع</th>
                  <th class="p-3 text-right">المتبقي</th>
                  <th class="p-3 text-right">الحالة</th>
                  <th class="p-3 text-right">ملاحظات</th>
                  <th class="p-3 text-right">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(payment, idx) in sortedClientPayments" :key="idx" class="border-t hover:bg-gray-50">
                  <td class="p-3">{{ idx + 1 }}</td>
                  <td class="p-3 font-semibold">{{ getMonthName(payment.month) }}</td>
                  <td class="p-3">{{ formatNumber(payment.amount) }} ج</td>
                  <td class="p-3 text-green-600">{{ formatNumber(payment.paid_amount || 0) }} ج</td>
                  <td class="p-3 text-orange-600 font-bold">{{ formatNumber((payment.amount || 0) - (payment.paid_amount || 0)) }} ج</td>
                  <td class="p-3">
                    <span :class="getPaymentStatusClass(payment)"
                      class="px-2 py-1 rounded-full text-xs font-semibold">
                      {{ getPaymentStatusText(payment) }}
                    </span>
                  </td>
                  <td class="p-3 text-xs">{{ payment.notes || '-' }}</td>
                  <td class="p-3">
                    <div class="flex gap-1 flex-wrap">
                      <button 
                        v-if="(payment.amount || 0) > (payment.paid_amount || 0)"
                        @click="openAddPartialPaymentModal(payment)"
                        class="text-blue-600 hover:text-blue-800 text-xs bg-blue-50 px-2 py-1 rounded"
                      >
                        💰 دفع
                      </button>
                      <button 
                        @click="deletePayment(payment.id)"
                        class="text-red-600 hover:text-red-800 text-xs bg-red-50 px-2 py-1 rounded"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="clientPayments.length === 0">
                  <td colspan="8" class="text-center py-4 text-gray-400">لا توجد أقساط مسجلة</td>
                </tr>
              </tbody>
              <tfoot class="bg-gray-50 font-bold">
                <tr class="border-t">
                  <td colspan="2" class="p-3">📌 الإجمالي</td>
                  <td class="p-3">{{ formatNumber(totalPaymentsAmount) }} ج</td>
                  <td class="p-3 text-green-600">{{ formatNumber(paidPaymentsAmount) }} ج</td>
                  <td class="p-3 text-orange-600">{{ formatNumber(totalPaymentsAmount - paidPaymentsAmount) }} ج</td>
                  <td colspan="3"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 pt-4 border-t flex-wrap">
            <button @click="printClientPDF(selectedClient?.id)" class="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2 min-w-[150px]">
              📄 PDF احترافي
            </button>
            <button @click="showViewModal = false" class="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition min-w-[150px]">
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ================= مودال إضافة منتج ================= -->
    <div v-if="showAddProductModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="showAddProductModal = false">
      <div class="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div class="sticky top-0 bg-white border-b p-4 rounded-t-3xl">
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-bold">➕ إضافة منتج للزبون: {{ selectedClient?.name }}</h2>
            <button @click="showAddProductModal = false" class="text-2xl hover:text-gray-600">&times;</button>
          </div>
        </div>

        <div class="p-6">
          <form @submit.prevent="saveProduct" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  <span class="text-red-500">*</span> نوع المنتج
                </label>
                <select
                  v-model="productForm.product_type"
                  required
                  @change="onProductTypeChange"
                  class="w-full p-3 border rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                >
                  <option value="">-- اختر النوع --</option>
                  <option value="standing">🔄 مروحة عمود</option>
                  <option value="wall">📌 مروحة حائط</option>
                  <option value="ceiling">🌀 مروحة سقف</option>
                  <option value="external">📦 منتج خارجي</option>
                </select>
              </div>
              <div v-if="productForm.product_type === 'external'">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  <span class="text-red-500">*</span> اسم المنتج
                </label>
                <input
                  v-model="productForm.product_name"
                  type="text"
                  required
                  placeholder="مثال: غسالة - ثلاجة - تلفزيون"
                  class="w-full p-3 border rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  <span class="text-red-500">*</span> الكمية
                </label>
                <input
                  v-model.number="productForm.quantity"
                  type="number"
                  min="1"
                  required
                  placeholder="الكمية"
                  @input="calculateProductTotal"
                  class="w-full p-3 border rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  <span class="text-red-500">*</span> سعر الوحدة
                </label>
                <input
                  v-model.number="productForm.unit_price"
                  type="number"
                  min="0"
                  required
                  :readonly="productForm.product_type !== 'external'"
                  :class="productForm.product_type !== 'external' ? 'bg-gray-100 cursor-not-allowed' : ''"
                  placeholder="سعر الوحدة"
                  @input="calculateProductTotal"
                  class="w-full p-3 border rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  المبلغ المدفوع (مقدمة)
                </label>
                <input
                  v-model.number="productForm.paid_amount"
                  type="number"
                  min="0"
                  required
                  :readonly="productForm.product_type !== 'external'"
                  :class="productForm.product_type !== 'external' ? 'bg-gray-100 cursor-not-allowed' : ''"
                  placeholder="المدفوع"
                  @input="calculateProductTotal"
                  class="w-full p-3 border rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                />
              </div>
              <div v-if="productForm.product_type === 'external'">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  القسط الشهري
                </label>
                <input
                  v-model.number="productForm.installment"
                  type="number"
                  min="0"
                  placeholder="القسط الشهري"
                  class="w-full p-3 border rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                />
              </div>
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  تاريخ التسليم (شهر المقدمة)
                </label>
                <input
                  v-model="productForm.delivery_date"
                  type="date"
                  class="w-full p-3 border rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                />
                <p class="text-xs text-yellow-600 mt-1">📅 هذا التاريخ يحدد شهر المقدمة</p>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
              <textarea
                v-model="productForm.notes"
                rows="2"
                placeholder="أي ملاحظات إضافية"
                class="w-full p-3 border rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              ></textarea>
            </div>

            <div class="flex gap-3 pt-4 border-t">
              <button type="submit" :disabled="loading"
                class="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50">
                {{ loading ? 'جاري الحفظ...' : '✅ إضافة المنتج' }}
              </button>
              <button type="button" @click="showAddProductModal = false"
                class="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition">
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- ================= مودال تسجيل قسط شهري ================= -->
    <div v-if="showPaymentModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="showPaymentModal = false">
      <div class="bg-white rounded-3xl w-full max-w-md shadow-2xl">
        <div class="sticky top-0 bg-white border-b p-4 rounded-t-3xl">
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-bold">💰 تسجيل قسط شهري</h2>
            <button @click="showPaymentModal = false" class="text-2xl hover:text-gray-600">&times;</button>
          </div>
        </div>

        <div class="p-6">
          <form @submit.prevent="savePayment" class="space-y-4">
            <div class="bg-yellow-50 rounded-xl p-3 mb-2">
              <p class="text-sm text-yellow-700">⚠️ المبلغ المدفوع سيتم توزيعه على الأقساط الغير مدفوعة (من الأقدم للأحدث)</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                <span class="text-red-500">*</span> المبلغ المدفوع
              </label>
              <input
                v-model.number="paymentForm.paid_amount"
                type="number"
                min="1"
                required
                placeholder="المبلغ المدفوع"
                class="w-full p-3 border rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">تاريخ الدفع</label>
              <input
                v-model="paymentForm.payment_date"
                type="date"
                class="w-full p-3 border rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
              <textarea
                v-model="paymentForm.notes"
                rows="2"
                placeholder="ملاحظات عن الدفع"
                class="w-full p-3 border rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              ></textarea>
            </div>

            <div class="flex gap-3 pt-4 border-t">
              <button type="submit" :disabled="loading"
                class="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50">
                {{ loading ? 'جاري الحفظ...' : '✅ تسجيل الدفع' }}
              </button>
              <button type="button" @click="showPaymentModal = false"
                class="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition">
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- ================= مودال دفع جزء من القسط ================= -->
    <div v-if="showPartialPaymentModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="showPartialPaymentModal = false">
      <div class="bg-white rounded-3xl w-full max-w-md shadow-2xl">
        <div class="sticky top-0 bg-white border-b p-4 rounded-t-3xl">
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-bold">💰 دفع قسط شهري</h2>
            <button @click="showPartialPaymentModal = false" class="text-2xl hover:text-gray-600">&times;</button>
          </div>
        </div>

        <div class="p-6">
          <form @submit.prevent="savePartialPayment" class="space-y-4">
            <div class="bg-gray-50 rounded-xl p-3 mb-4">
              <p class="text-sm"><span class="text-gray-500">الشهر:</span> <span class="font-semibold">{{ getMonthName(partialPaymentForm.month) }}</span></p>
              <p class="text-sm"><span class="text-gray-500">المبلغ المستحق:</span> <span class="font-semibold">{{ formatNumber(partialPaymentForm.amount) }} ج</span></p>
              <p class="text-sm"><span class="text-gray-500">المتبقي:</span> <span class="font-semibold text-orange-600">{{ formatNumber(partialPaymentForm.remaining) }} ج</span></p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                <span class="text-red-500">*</span> المبلغ المدفوع
              </label>
              <input
                v-model.number="partialPaymentForm.paid_amount"
                type="number"
                min="1"
                :max="partialPaymentForm.remaining"
                required
                placeholder="المبلغ المدفوع"
                class="w-full p-3 border rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              />
              <p class="text-xs text-gray-400 mt-1">الحد الأقصى: {{ formatNumber(partialPaymentForm.remaining) }} ج</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">تاريخ الدفع</label>
              <input
                v-model="partialPaymentForm.payment_date"
                type="date"
                class="w-full p-3 border rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
              />
            </div>

            <div class="flex gap-3 pt-4 border-t">
              <button type="submit" :disabled="loading"
                class="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50">
                {{ loading ? 'جاري الحفظ...' : '✅ تأكيد الدفع' }}
              </button>
              <button type="button" @click="showPartialPaymentModal = false"
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

const toast = ref({ show: false, message: "", type: "success", icon: "✅" });
const loading = ref(false);
const isLoggedIn = ref(false);
const showClientModal = ref(false);
const showViewModal = ref(false);
const showAddProductModal = ref(false);
const showPaymentModal = ref(false);
const showPartialPaymentModal = ref(false);
const filterArea = ref("");
const collector = ref(null);
const clients = ref([]);
const products = ref([]);
const payments = ref([]);
const selectedClient = ref(null);
const selectedClientProducts = ref([]);
const clientPayments = ref([]);
const selectedPayment = ref(null);

const clientForm = ref({
  name: "",
  phone: "",
  address: "",
  area: "",
  notes: "",
});

const productForm = ref({
  product_type: "",
  product_name: "",
  quantity: 1,
  unit_price: 0,
  total_price: 0,
  paid_amount: 0,
  installment: 0,
  delivery_date: new Date().toISOString().split("T")[0],
  notes: "",
});

const paymentForm = ref({
  paid_amount: 0,
  payment_date: new Date().toISOString().split("T")[0],
  notes: "",
});

const partialPaymentForm = ref({
  id: null,
  month: "",
  amount: 0,
  remaining: 0,
  paid_amount: 0,
  payment_date: new Date().toISOString().split("T")[0],
});

// ===================== بيانات الشركة =====================
const COMPANY_DATA = {
  name: 'شركة جولدن للتجارة والتوزيع',
  phone: '01030537692',
  address: 'طنطا - سبرباي - امام المدينة الجماعية',
  logo: '🏢'
};

// ===================== أسعار المنتجات الثابتة =====================
const FAN_PRICES = {
  standing: { price: 1800, down_payment: 300, installment: 300 },
  ceiling: { price: 1800, down_payment: 300, installment: 300 },
  wall: { price: 1600, down_payment: 300, installment: 300, last_month: 100 },
};

// ===================== أسماء الأشهر =====================
const monthNames = {
  '01': 'يناير', '02': 'فبراير', '03': 'مارس', '04': 'أبريل',
  '05': 'مايو', '06': 'يونيو', '07': 'يوليو', '08': 'أغسطس',
  '09': 'سبتمبر', '10': 'أكتوبر', '11': 'نوفمبر', '12': 'ديسمبر'
};

const getMonthName = (monthStr) => {
  if (!monthStr) return '-';
  const parts = monthStr.split('-');
  if (parts.length !== 2) return monthStr;
  const year = parts[0];
  const month = parts[1];
  return `${monthNames[month] || month} ${year}`;
};

const showToast = (message, type = "success") => {
  const icons = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" };
  toast.value = { show: true, message, type, icon: icons[type] || "✅" };
  setTimeout(() => { toast.value.show = false; }, 3000);
};

// ===================== حساب الأقساط الشهرية =====================

const getProductMonthlyInstallment = (product) => {
  if (!product) return 0;
  
  if (product.product_type === 'external') {
    if (product.metadata && product.metadata.installment) {
      return product.metadata.installment * (product.quantity || 1);
    }
    const remaining = product.remaining_amount || 0;
    return Math.ceil(remaining / 6);
  }
  
  const fanData = FAN_PRICES[product.product_type];
  if (!fanData) return 0;
  
  return fanData.installment * (product.quantity || 1);
};

const getProductMonthlyInstallmentFromForm = () => {
  const type = productForm.value.product_type;
  const quantity = productForm.value.quantity || 1;
  
  if (type === 'external') {
    return productForm.value.installment || 0;
  }
  
  const fanData = FAN_PRICES[type];
  if (!fanData) return 0;
  
  return fanData.installment * quantity;
};

const getClientMonthlyInstallment = (clientId) => {
  const clientProducts = products.value.filter(p => p.client_id === clientId);
  let total = 0;
  
  for (const product of clientProducts) {
    total += getProductMonthlyInstallment(product);
  }
  
  return total;
};

// ===================== Computed =====================
const areas = computed(() => {
  return [...new Set(clients.value.map(c => c.area).filter(Boolean))];
});

const filteredClients = computed(() => {
  if (!filterArea.value) return clients.value;
  return clients.value.filter(c => c.area === filterArea.value);
});

const totalFans = computed(() => {
  let count = 0;
  products.value.forEach(p => { count += p.quantity || 0; });
  return count;
});

// ✅ إجمالي المدفوع = المقدمات + المدفوع الإضافي فقط (يشتغل مع البيانات القديمة والجديدة)
const totalPaid = computed(() => {
  let downs = 0;
  products.value.forEach(p => {
    if (p.product_type === 'external') {
      downs += p.paid_amount || 0;
    } else {
      downs += 300 * (p.quantity || 0);
    }
  });
  let paymentsPaid = 0;
  payments.value.forEach(p => { 
    paymentsPaid += p.paid_amount || 0; 
  });
  // لو البيانات القديمة فيها المقدمات محقونة → متكررش
  const extra = Math.max(0, paymentsPaid - downs);
  return downs + extra;
});

const totalRemaining = computed(() => {
  let totalAmount = 0;
  products.value.forEach(p => { totalAmount += p.total_price || 0; });
  return Math.max(0, totalAmount - totalPaid.value);
});

// تجميع المنتجات حسب (النوع + شهر المقدمة)
const groupedProducts = computed(() => {
  const groups = {};
  
  for (const product of selectedClientProducts.value) {
    const key = `${product.product_type}_${product.delivery_month}`;
    if (!groups[key]) {
      groups[key] = {
        ...product,
        quantity: 0,
        total_price: 0,
        paid_amount: 0,
        remaining_amount: 0,
        unit_price: product.unit_price || 0,
        products: []
      };
    }
    groups[key].quantity += product.quantity;
    groups[key].total_price += product.total_price;
    // المقدمة = 300 × الكمية للمراوح
    if (product.product_type === 'external') {
      groups[key].paid_amount += product.paid_amount || 0;
    } else {
      groups[key].paid_amount += 300 * product.quantity;
    }
    groups[key].remaining_amount += product.remaining_amount || 0;
    groups[key].products.push(product);
    if (!groups[key].id) {
      groups[key].id = product.id;
    }
  }
  
  return Object.values(groups);
});

const selectedClientTotal = computed(() => {
  return selectedClientProducts.value.reduce((sum, p) => sum + (p.total_price || 0), 0);
});

// ✅ المقدمات فقط (بدون تكرار)
const selectedClientDownPayments = computed(() => {
  return groupedProducts.value.reduce((sum, p) => sum + (p.paid_amount || 0), 0);
});

const selectedClientPaid = computed(() => {
  // المقدمات + المدفوع الإضافي فقط (بدون تكرار مع البيانات القديمة)
  const downs = selectedClientDownPayments.value;
  const paymentsPaid = clientPayments.value.reduce((sum, p) => sum + (p.paid_amount || 0), 0);
  const extra = Math.max(0, paymentsPaid - downs);
  return downs + extra;
});

const selectedClientRemaining = computed(() => {
  // المتبقي = إجمالي المنتجات - كل المدفوع (مقدمات + أقساط)
  return Math.max(0, selectedClientTotal.value - selectedClientPaid.value);
});

const selectedClientMonthlyInstallment = computed(() => {
  let total = 0;
  for (const product of groupedProducts.value) {
    total += getProductMonthlyInstallment(product);
  }
  return total;
});

const sortedClientPayments = computed(() => {
  return [...clientPayments.value].sort((a, b) => a.month.localeCompare(b.month));
});

const totalPaymentsAmount = computed(() => {
  return clientPayments.value.reduce((sum, p) => sum + (p.amount || 0), 0);
});

const paidPaymentsAmount = computed(() => {
  return clientPayments.value.reduce((sum, p) => sum + (p.paid_amount || 0), 0);
});

// ===================== Functions =====================
const formatNumber = (num) => {
  if (!num && num !== 0) return "0";
  return num.toLocaleString("ar-EG");
};

const getProductTypeName = (type) => {
  const types = {
    standing: "عمود",
    wall: "حائط",
    ceiling: "سقف",
    external: "خارجي"
  };
  return types[type] || type;
};

const getClientProducts = (clientId) => {
  return products.value.filter(p => p.client_id === clientId);
};

const getClientTotalFans = (clientId) => {
  return getClientProducts(clientId).reduce((sum, p) => sum + (p.quantity || 0), 0);
};

const getClientTotal = (clientId) => {
  return getClientProducts(clientId).reduce((sum, p) => sum + (p.total_price || 0), 0);
};

// ✅ بدون تكرار المقدمات (يشتغل مع البيانات القديمة والجديدة)
const getClientPaid = (clientId) => {
  const clientProducts = getClientProducts(clientId);
  let downs = 0;
  clientProducts.forEach(p => {
    if (p.product_type === 'external') {
      downs += p.paid_amount || 0;
    } else {
      downs += 300 * (p.quantity || 0);
    }
  });
  const clientPaymentsData = payments.value.filter(p => p.client_id === clientId);
  const paymentAmount = clientPaymentsData.reduce((sum, p) => sum + (p.paid_amount || 0), 0);
  const extra = Math.max(0, paymentAmount - downs);
  return downs + extra;
};

const getClientRemaining = (clientId) => {
  return Math.max(0, getClientTotal(clientId) - getClientPaid(clientId));
};

const getClientsByArea = (area) => {
  return clients.value.filter(c => c.area === area);
};

const getPaymentStatusText = (payment) => {
  const remaining = (payment.amount || 0) - (payment.paid_amount || 0);
  if (remaining <= 0) return '✅ مدفوع بالكامل';
  if ((payment.paid_amount || 0) > 0) return `⚠️ مدفوع جزئياً (متبقي ${formatNumber(remaining)} ج)`;
  return '❌ غير مدفوع';
};

const getPaymentStatusClass = (payment) => {
  const remaining = (payment.amount || 0) - (payment.paid_amount || 0);
  if (remaining <= 0) return 'bg-green-100 text-green-700';
  if ((payment.paid_amount || 0) > 0) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
};

// ===================== Check Session =====================
const checkSession = () => {
  const session = localStorage.getItem('collector_session');
  if (!session) {
    isLoggedIn.value = false;
    return false;
  }

  try {
    const data = JSON.parse(session);
    if (!data.isCollector) {
      isLoggedIn.value = false;
      return false;
    }
    return data;
  } catch (e) {
    isLoggedIn.value = false;
    return false;
  }
};

// ===================== Data Loading =====================
const loadCollectorData = async () => {
  const sessionData = checkSession();
  if (!sessionData) {
    isLoggedIn.value = false;
    loading.value = false;
    return;
  }

  isLoggedIn.value = true;
  loading.value = true;

  try {
    const { data: collectorData, error: collectorError } = await supabase
      .from('collectors')
      .select('*')
      .eq('id', sessionData.id)
      .single();

    if (collectorError || !collectorData) {
      showToast('❌ لم يتم العثور على المحصل', 'error');
      localStorage.removeItem('collector_session');
      isLoggedIn.value = false;
      loading.value = false;
      return;
    }

    if (collectorData.status !== 'active') {
      showToast('⚠️ الحساب غير نشط، يرجى التواصل مع الإدارة', 'warning');
      localStorage.removeItem('collector_session');
      isLoggedIn.value = false;
      loading.value = false;
      return;
    }

    collector.value = collectorData;

    const { data: clientsData, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .eq('collector_id', collectorData.id)
      .order('name');

    if (clientsError) throw clientsError;
    clients.value = clientsData || [];

    const clientIds = clients.value.map(c => c.id);
    if (clientIds.length > 0) {
      const { data: productsData } = await supabase
        .from('client_products')
        .select('*')
        .in('client_id', clientIds);
      products.value = productsData || [];

      const { data: paymentsData } = await supabase
        .from('client_payments')
        .select('*')
        .in('client_id', clientIds);
      payments.value = paymentsData || [];
    }

  } catch (error) {
    console.error('❌ خطأ:', error);
    showToast('❌ حدث خطأ في تحميل البيانات', 'error');
  } finally {
    loading.value = false;
  }
};

// ===================== Client CRUD =====================
const openAddClientModal = () => {
  clientForm.value = { name: "", phone: "", address: "", area: "", notes: "" };
  showClientModal.value = true;
};

const saveClient = async () => {
  if (!collector.value) return;

  if (!clientForm.value.name) {
    showToast("⚠️ الرجاء إدخال اسم الزبون", "warning");
    return;
  }
  if (!clientForm.value.address) {
    showToast("⚠️ الرجاء إدخال العنوان", "warning");
    return;
  }
  if (!clientForm.value.area) {
    showToast("⚠️ الرجاء إدخال المنطقة", "warning");
    return;
  }

  loading.value = true;

  try {
    const { data, error } = await supabase
      .from('clients')
      .insert([{
        collector_id: collector.value.id,
        name: clientForm.value.name,
        phone: clientForm.value.phone,
        address: clientForm.value.address,
        area: clientForm.value.area,
        notes: clientForm.value.notes,
      }])
      .select();

    if (error) throw error;

    showToast(`✅ تم إضافة الزبون "${clientForm.value.name}" بنجاح`, "success");
    showClientModal.value = false;
    await loadCollectorData();

  } catch (error) {
    console.error('❌ خطأ:', error);
    showToast("❌ خطأ: " + error.message, "error");
  } finally {
    loading.value = false;
  }
};

const deleteClient = async (id) => {
  if (!confirm("⚠️ هل أنت متأكد من حذف هذا الزبون وجميع بياناته؟")) return;

  loading.value = true;

  try {
    const clientProducts = products.value.filter(p => p.client_id === id);
    const productIds = clientProducts.map(p => p.id);
    
    if (productIds.length > 0) {
      await supabase.from('client_payments').delete().in('product_id', productIds);
    }
    
    await supabase.from('client_payments').delete().eq('client_id', id).is('product_id', null);
    
    if (productIds.length > 0) {
      await supabase.from('client_products').delete().in('id', productIds);
    }
    
    await supabase.from('clients').delete().eq('id', id);

    showToast("✅ تم حذف الزبون وجميع بياناته بنجاح", "success");
    await loadCollectorData();
  } catch (error) {
    console.error('❌ خطأ:', error);
    showToast("❌ خطأ: " + error.message, "error");
  } finally {
    loading.value = false;
  }
};

// ===================== Product CRUD =====================

const onProductTypeChange = () => {
  const type = productForm.value.product_type;
  
  if (type === 'external') {
    productForm.value.unit_price = 0;
    productForm.value.paid_amount = 0;
    productForm.value.installment = 0;
    productForm.value.product_name = "";
  } else if (FAN_PRICES[type]) {
    const fan = FAN_PRICES[type];
    productForm.value.unit_price = fan.price;
    productForm.value.paid_amount = fan.down_payment;
    productForm.value.installment = fan.installment;
    productForm.value.product_name = "";
  }
  
  calculateProductTotal();
};

const openAddProductModal = () => {
  productForm.value = {
    product_type: "",
    product_name: "",
    quantity: 1,
    unit_price: 0,
    total_price: 0,
    paid_amount: 0,
    installment: 0,
    delivery_date: new Date().toISOString().split("T")[0],
    notes: "",
  };
  showAddProductModal.value = true;
};

const calculateProductTotal = () => {
  const qty = productForm.value.quantity || 0;
  const price = productForm.value.unit_price || 0;
  productForm.value.total_price = qty * price;
};

const saveProduct = async () => {
  if (!selectedClient.value) return;

  if (!productForm.value.product_type) {
    showToast("⚠️ الرجاء اختيار نوع المنتج", "warning");
    return;
  }
  if (productForm.value.product_type === 'external' && !productForm.value.product_name) {
    showToast("⚠️ الرجاء إدخال اسم المنتج", "warning");
    return;
  }
  if (!productForm.value.quantity || productForm.value.quantity <= 0) {
    showToast("⚠️ الرجاء إدخال الكمية", "warning");
    return;
  }
  if (!productForm.value.unit_price || productForm.value.unit_price <= 0) {
    showToast("⚠️ الرجاء إدخال سعر الوحدة", "warning");
    return;
  }

  loading.value = true;

  try {
    // المقدمة: للمنتجات الخارجية المستخدم يحدد، للمراوح 300 لكل قطعة
    let downPayment = 0;
    if (productForm.value.product_type === 'external') {
      downPayment = productForm.value.paid_amount || 0;
    } else {
      downPayment = 300 * (productForm.value.quantity || 1);
    }
    
    const total = (productForm.value.quantity || 0) * (productForm.value.unit_price || 0);
    const paid = downPayment;
    const remaining = total - paid;
    
    const extraData = {};
    const productName = productForm.value.product_type === 'external' ? productForm.value.product_name : null;
    
    if (productForm.value.product_type !== 'external') {
      const fanData = FAN_PRICES[productForm.value.product_type];
      if (fanData) {
        extraData.down_payment = fanData.down_payment;
        extraData.installment = fanData.installment;
        if (fanData.last_month) {
          extraData.last_month = fanData.last_month;
        }
      }
    } else {
      extraData.installment = productForm.value.installment || 0;
      extraData.down_payment = downPayment;
    }

    const deliveryDate = productForm.value.delivery_date || new Date().toISOString().split("T")[0];
    const deliveryMonth = deliveryDate.slice(0, 7);

    const { data, error } = await supabase
      .from('client_products')
      .insert([{
        client_id: selectedClient.value.id,
        product_type: productForm.value.product_type,
        product_name: productName,
        quantity: productForm.value.quantity,
        unit_price: productForm.value.unit_price,
        total_price: total,
        paid_amount: paid,
        remaining_amount: remaining,
        delivery_date: deliveryDate,
        delivery_month: deliveryMonth,
        notes: productForm.value.notes || null,
        metadata: extraData,
      }])
      .select();

    if (error) throw error;

    showToast(`✅ تم إضافة المنتج بنجاح`, "success");
    showAddProductModal.value = false;
    
    await loadCollectorData();
    await viewClient(selectedClient.value.id);
    await generateInstallmentsAfterAdd();

  } catch (error) {
    console.error('❌ خطأ:', error);
    showToast("❌ خطأ: " + error.message, "error");
  } finally {
    loading.value = false;
  }
};

// ===================== توليد الأقساط =====================
// ✅ تم التصحيح: مش بنحقن المقدمة داخل الأقساط عشان ميتمش التكرار
const generateInstallmentsAfterAdd = async () => {
  if (!selectedClient.value) return;
  
  const { data: productsData } = await supabase
    .from('client_products')
    .select('*')
    .eq('client_id', selectedClient.value.id);
  
  if (!productsData || productsData.length === 0) {
    await supabase.from('client_payments').delete().eq('client_id', selectedClient.value.id);
    return;
  }

  try {
    await supabase.from('client_payments').delete().eq('client_id', selectedClient.value.id);

    const installmentsMap = new Map();

    for (const product of productsData) {
      const remaining = product.remaining_amount || 0;
      if (remaining <= 0) continue;

      let monthlyInstallment = getProductMonthlyInstallment(product);
      if (monthlyInstallment <= 0) {
        monthlyInstallment = Math.ceil(remaining / 6);
      }

      let isWallFan = product.product_type === 'wall';
      let lastMonthAmount = 0;
      
      if (isWallFan && product.metadata && product.metadata.last_month) {
        lastMonthAmount = product.metadata.last_month * (product.quantity || 1);
      }

      const deliveryMonth = product.delivery_month || new Date().toISOString().slice(0, 7);
      const numInstallments = Math.ceil(remaining / monthlyInstallment);
      
      let currentMonth = new Date(deliveryMonth + '-01');
      let totalGenerated = 0;
      const productName = product.product_name || getProductTypeName(product.product_type);

      for (let i = 0; i < numInstallments; i++) {
        let amount = monthlyInstallment;
        
        if (isWallFan && i === numInstallments - 1 && numInstallments > 1) {
          amount = lastMonthAmount || 100;
        }
        
        if (totalGenerated + amount > remaining) {
          amount = remaining - totalGenerated;
        }
        totalGenerated += amount;
        
        const monthStr = currentMonth.toISOString().slice(0, 7);
        
        let notes = `قسط ${i + 1} من ${numInstallments} - ${productName}`;
        
        if (!installmentsMap.has(monthStr)) {
          installmentsMap.set(monthStr, {
            month: monthStr,
            amount: 0,
            paid_amount: 0,
            remaining_amount: 0,
            notes: [],
          });
        }
        
        const entry = installmentsMap.get(monthStr);
        entry.amount += amount;
        entry.remaining_amount += amount;
        entry.notes.push(notes);
        
        currentMonth.setMonth(currentMonth.getMonth() + 1);
      }
    }

    // ❌ تم حذف قسم "نطبق المقدمات" بالكامل عشان ميتمش التكرار
    // المقدمة بتتحسب منفصلة في جدول المنتجات فقط

    const installmentsToGenerate = [];
    for (const [month, data] of installmentsMap) {
      installmentsToGenerate.push({
        client_id: selectedClient.value.id,
        month: data.month,
        amount: data.amount,
        paid_amount: 0, // تبدأ بصفر - المقدمة مش هنا
        remaining_amount: data.amount,
        status: 'pending',
        payment_date: null,
        notes: data.notes.join(' | '),
      });
    }

    installmentsToGenerate.sort((a, b) => a.month.localeCompare(b.month));

    if (installmentsToGenerate.length > 0) {
      for (const inst of installmentsToGenerate) {
        await supabase.from('client_payments').insert(inst);
      }
    }

    await loadCollectorData();
    await viewClient(selectedClient.value.id);

  } catch (error) {
    console.error('❌ خطأ في توليد الأقساط:', error);
  }
};

// ===================== حذف المنتج =====================
const deleteProduct = async (productId) => {
  if (!confirm("⚠️ هل أنت متأكد من حذف هذا المنتج وجميع أقساطه؟")) return;

  loading.value = true;

  try {
    await supabase.from('client_payments').delete().eq('product_id', productId);
    await supabase.from('client_products').delete().eq('id', productId);

    showToast("✅ تم حذف المنتج وجميع أقساطه بنجاح", "success");
    await loadCollectorData();
    if (selectedClient.value) {
      await viewClient(selectedClient.value.id);
      await generateInstallmentsAfterAdd();
    }
  } catch (error) {
    console.error('❌ خطأ:', error);
    showToast("❌ خطأ: " + error.message, "error");
  } finally {
    loading.value = false;
  }
};

// ===================== Payment CRUD =====================

const openAddPaymentModal = () => {
  paymentForm.value = {
    paid_amount: 0,
    payment_date: new Date().toISOString().split("T")[0],
    notes: "",
  };
  showPaymentModal.value = true;
};

const savePayment = async () => {
  if (!selectedClient.value) return;

  const paidAmount = paymentForm.value.paid_amount || 0;
  
  if (paidAmount <= 0) {
    showToast("⚠️ الرجاء إدخال المبلغ المدفوع", "warning");
    return;
  }

  loading.value = true;

  try {
    const unpaidPayments = clientPayments.value
      .filter(p => p.status === 'pending' || p.status === 'partial')
      .sort((a, b) => a.month.localeCompare(b.month));
    
    let remainingToPay = paidAmount;
    let paymentsUpdated = [];

    for (const payment of unpaidPayments) {
      if (remainingToPay <= 0) break;
      
      const currentRemaining = (payment.amount || 0) - (payment.paid_amount || 0);
      if (currentRemaining <= 0) continue;
      
      let payAmount = Math.min(remainingToPay, currentRemaining);
      
      const newPaid = (payment.paid_amount || 0) + payAmount;
      const newRemaining = payment.amount - newPaid;
      
      let status = 'pending';
      if (newRemaining <= 0) {
        status = 'paid';
      } else if (newPaid > 0) {
        status = 'partial';
      }
      
      await supabase
        .from('client_payments')
        .update({
          paid_amount: newPaid,
          remaining_amount: newRemaining,
          status: status,
          payment_date: paymentForm.value.payment_date || new Date().toISOString().split("T")[0],
        })
        .eq('id', payment.id);
      
      paymentsUpdated.push({
        month: payment.month,
        amount: payAmount,
        remaining: newRemaining
      });
      
      remainingToPay -= payAmount;
    }

    let message = `✅ تم تسجيل الدفعة بنجاح:\n`;
    if (paymentsUpdated.length > 0) {
      for (const p of paymentsUpdated) {
        message += `• ${getMonthName(p.month)}: دفع ${formatNumber(p.amount)} ج`;
        if (p.remaining > 0) {
          message += ` (متبقي ${formatNumber(p.remaining)} ج)`;
        } else {
          message += ` ✅ مدفوع بالكامل`;
        }
        message += `\n`;
      }
    }
    
    showToast(message, "success");
    showPaymentModal.value = false;
    await loadCollectorData();
    await viewClient(selectedClient.value.id);

  } catch (error) {
    console.error('❌ خطأ:', error);
    showToast("❌ خطأ: " + error.message, "error");
  } finally {
    loading.value = false;
  }
};

const openAddPartialPaymentModal = (payment) => {
  selectedPayment.value = payment;
  partialPaymentForm.value = {
    id: payment.id,
    month: payment.month,
    amount: payment.amount,
    remaining: (payment.amount || 0) - (payment.paid_amount || 0),
    paid_amount: 0,
    payment_date: new Date().toISOString().split("T")[0],
  };
  showPartialPaymentModal.value = true;
};

const savePartialPayment = async () => {
  if (!selectedPayment.value) return;
  
  const paidAmount = partialPaymentForm.value.paid_amount || 0;
  
  if (paidAmount <= 0) {
    showToast("⚠️ الرجاء إدخال المبلغ المدفوع", "warning");
    return;
  }
  
  if (paidAmount > partialPaymentForm.value.remaining) {
    showToast(`⚠️ المبلغ المدفوع لا يتجاوز ${formatNumber(partialPaymentForm.value.remaining)} ج`, "warning");
    return;
  }

  loading.value = true;

  try {
    const newPaidAmount = (selectedPayment.value.paid_amount || 0) + paidAmount;
    const newRemaining = selectedPayment.value.amount - newPaidAmount;
    
    let status = 'pending';
    if (newRemaining <= 0) {
      status = 'paid';
    } else if (newPaidAmount > 0) {
      status = 'partial';
    }

    await supabase
      .from('client_payments')
      .update({
        paid_amount: newPaidAmount,
        remaining_amount: newRemaining,
        status: status,
        payment_date: partialPaymentForm.value.payment_date || new Date().toISOString().split("T")[0],
      })
      .eq('id', selectedPayment.value.id);

    if (newRemaining > 0) {
      const nextMonth = new Date(selectedPayment.value.month + '-01');
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const nextMonthStr = nextMonth.toISOString().slice(0, 7);
      
      const existingNext = clientPayments.value.find(p => p.month === nextMonthStr && p.id !== selectedPayment.value.id);
      if (existingNext) {
        const newAmount = (existingNext.amount || 0) + newRemaining;
        const newRemainingAmt = (existingNext.remaining_amount || 0) + newRemaining;
        await supabase
          .from('client_payments')
          .update({
            amount: newAmount,
            remaining_amount: newRemainingAmt,
          })
          .eq('id', existingNext.id);
      } else {
        await supabase
          .from('client_payments')
          .insert([{
            client_id: selectedClient.value.id,
            month: nextMonthStr,
            amount: newRemaining,
            paid_amount: 0,
            remaining_amount: newRemaining,
            status: 'pending',
            payment_date: null,
            notes: `مرحل من شهر ${getMonthName(selectedPayment.value.month)}`,
          }]);
      }
      
      showToast(`✅ تم الدفع، والباقي ${formatNumber(newRemaining)} ج تحول للشهر الجاي`, "success");
    } else {
      showToast(`✅ تم دفع القسط بالكامل`, "success");
    }
    
    showPartialPaymentModal.value = false;
    await loadCollectorData();
    await viewClient(selectedClient.value.id);

  } catch (error) {
    console.error('❌ خطأ:', error);
    showToast("❌ خطأ: " + error.message, "error");
  } finally {
    loading.value = false;
  }
};

const deletePayment = async (paymentId) => {
  if (!confirm("⚠️ هل أنت متأكد من حذف هذا القسط؟")) return;

  try {
    await supabase.from('client_payments').delete().eq('id', paymentId);
    showToast("✅ تم حذف القسط", "success");
    await loadCollectorData();
    if (selectedClient.value) {
      await viewClient(selectedClient.value.id);
    }
  } catch (error) {
    console.error('❌ خطأ:', error);
    showToast("❌ خطأ: " + error.message, "error");
  }
};


// ===================== طباعة PDF احترافي =====================
const printClientPDF = async (clientId) => {
  if (!clientId) {
    showToast("⚠️ الرجاء اختيار زبون أولاً", "warning");
    return;
  }

  loading.value = true;

  try {
    const { data: clientData } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (!clientData) {
      showToast("❌ لم يتم العثور على الزبون", "error");
      loading.value = false;
      return;
    }

    const { data: productsData } = await supabase
      .from('client_products')
      .select('*')
      .eq('client_id', clientId);

    const { data: paymentsData } = await supabase
      .from('client_payments')
      .select('*')
      .eq('client_id', clientId);

    const productsList = productsData || [];
    const paymentsList = paymentsData || [];

    // تجميع المنتجات مع حساب المقدمة الصحيحة (300 لكل قطعة)
    const groups = {};
    for (const product of productsList) {
      const key = `${product.product_type}_${product.delivery_month}`;
      if (!groups[key]) {
        groups[key] = {
          ...product,
          quantity: 0,
          total_price: 0,
          paid_amount: 0,
          remaining_amount: 0,
          unit_price: product.unit_price || 0
        };
      }
      groups[key].quantity += product.quantity;
      groups[key].total_price += product.total_price;
      // المقدمة الصحيحة: 300 لكل قطعة للمراوح
      if (product.product_type === 'external') {
        groups[key].paid_amount += product.paid_amount || 0;
      } else {
        groups[key].paid_amount += 300 * product.quantity;
      }
      groups[key].remaining_amount += product.remaining_amount || 0;
    }
    const groupedProductsList = Object.values(groups);

    // ✅ الحسابات الصحيحة — تشتغل مع البيانات القديمة والجديدة
    const totalAmount = productsList.reduce((s, p) => s + (p.total_price || 0), 0);
    const totalDowns = groupedProductsList.reduce((s, p) => s + (p.paid_amount || 0), 0);
    const paymentsPaidRaw = paymentsList.reduce((s, p) => s + (p.paid_amount || 0), 0);
    // لو البيانات القديمة فيها المقدمات محقونة جوه الأقساط → متكررش
    // لو البيانات الجديدة → paymentsPaidRaw = المدفوع الإضافي فقط
    const extraPaid = Math.max(0, paymentsPaidRaw - totalDowns);
    const totalPaid = totalDowns + extraPaid;
    const totalRemaining = Math.max(0, totalAmount - totalPaid);
    const monthlyInstallment = groupedProductsList.reduce((s, p) => s + getProductMonthlyInstallment(p), 0);
    const totalPaymentsAmount = paymentsList.reduce((s, p) => s + (p.amount || 0), 0);
    const paidPaymentsAmount = paymentsList.reduce((s, p) => s + (p.paid_amount || 0), 0);

    const formatNum = (num) => {
      if (!num && num !== 0) return "0";
      return Number(num).toLocaleString('ar-EG');
    };

    // استخدام html2canvas - تصميم مضغوط لصفحة واحدة
    const container = document.createElement('div');
    container.style.cssText = `
      position: fixed;
      left: -9999px;
      top: 0;
      width: 210mm;
      background: white;
      padding: 0;
      direction: rtl;
      font-family: 'Cairo', 'Segoe UI', 'Tahoma', 'Arial', sans-serif;
      z-index: 99999;
    `;
    
    container.innerHTML = `
      <div style="max-width:100%;margin:0 auto;background:white;overflow:hidden;">
        
        <!-- HEADER مضغوط -->
        <div style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#1e40af 100%);color:white;padding:18px 28px 16px;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-size:22px;font-weight:900;">شركة جولدن</div>
            <div style="font-size:12px;opacity:0.85;margin-top:1px;">للتجارة والتوزيع</div>
            <div style="display:flex;gap:14px;font-size:11px;opacity:0.8;margin-top:6px;">
              <span>📞 01030537692</span>
              <span>📍 طنطا - سبرباي</span>
            </div>
          </div>
          <div style="text-align:center;background:rgba(255,255,255,0.12);padding:8px 14px;border-radius:10px;">
            <div style="font-size:10px;opacity:0.75;">تاريخ التقرير</div>
            <div style="font-size:13px;font-weight:700;">${new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
        </div>
        
        <!-- بيانات الزبون + ملخص -->
        <div style="padding:14px 28px 10px;background:#f8fafc;border-bottom:1px solid #e2e8f0;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <div>
              <div style="font-size:11px;color:#64748b;font-weight:600;">التقرير المالي للزبون</div>
              <div style="font-size:20px;font-weight:800;color:#0f172a;">${clientData.name || 'غير مسجل'}</div>
            </div>
            <div style="font-size:12px;color:#1d4ed8;font-weight:700;background:#eff6ff;padding:6px 12px;border-radius:8px;">
              القسط الشهري: ${formatNum(monthlyInstallment)} ج
            </div>
          </div>
          
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:10px;">
            <div style="background:white;padding:8px 10px;border-radius:8px;border:1px solid #e2e8f0;">
              <div style="font-size:9px;color:#94a3b8;font-weight:700;">📱 الهاتف</div>
              <div style="font-size:12px;font-weight:700;color:#0f172a;">${clientData.phone || '—'}</div>
            </div>
            <div style="background:white;padding:8px 10px;border-radius:8px;border:1px solid #e2e8f0;">
              <div style="font-size:9px;color:#94a3b8;font-weight:700;">📍 العنوان</div>
              <div style="font-size:12px;font-weight:700;color:#0f172a;">${clientData.address || '—'}</div>
            </div>
            <div style="background:white;padding:8px 10px;border-radius:8px;border:1px solid #e2e8f0;">
              <div style="font-size:9px;color:#94a3b8;font-weight:700;">🏠 المنطقة</div>
              <div style="font-size:12px;font-weight:700;color:#0f172a;">${clientData.area || '—'}</div>
            </div>
            <div style="background:white;padding:8px 10px;border-radius:8px;border:1px solid #e2e8f0;">
              <div style="font-size:9px;color:#94a3b8;font-weight:700;">📦 المنتجات</div>
              <div style="font-size:12px;font-weight:700;color:#0f172a;">${groupedProductsList.length}</div>
            </div>
          </div>
          
          <!-- ملخص الأرقام -->
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">
            <div style="background:white;padding:10px 8px;border-radius:8px;text-align:center;border:1px solid #e2e8f0;">
              <div style="font-size:9px;color:#64748b;font-weight:600;">إجمالي المبلغ</div>
              <div style="font-size:16px;font-weight:800;color:#0f172a;">${formatNum(totalAmount)}</div>
            </div>
            <div style="background:white;padding:10px 8px;border-radius:8px;text-align:center;border:1px solid #e2e8f0;">
              <div style="font-size:9px;color:#64748b;font-weight:600;">المقدمات</div>
              <div style="font-size:16px;font-weight:800;color:#7c3aed;">${formatNum(totalDowns)}</div>
            </div>
            <div style="background:white;padding:10px 8px;border-radius:8px;text-align:center;border:1px solid #e2e8f0;">
              <div style="font-size:9px;color:#64748b;font-weight:600;">إجمالي المدفوع</div>
              <div style="font-size:16px;font-weight:800;color:#16a34a;">${formatNum(totalPaid)}</div>
            </div>
            <div style="background:white;padding:10px 8px;border-radius:8px;text-align:center;border:1px solid #e2e8f0;">
              <div style="font-size:9px;color:#64748b;font-weight:600;">المتبقي</div>
              <div style="font-size:16px;font-weight:800;color:#ea580c;">${formatNum(totalRemaining)}</div>
            </div>
          </div>
        </div>
        
        <!-- جدول المنتجات مضغوط -->
        <div style="padding:12px 28px 6px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
            <div style="width:3px;height:16px;background:#1d4ed8;border-radius:2px;"></div>
            <div style="font-size:13px;font-weight:800;color:#0f172a;">المنتجات</div>
            <span style="display:flex;align-items:center;justify-content:center;background:#1d4ed8;color:white;font-size:10px;padding:1px 8px;border-radius:50%;font-weight:700;">${groupedProductsList.length}</span>
          </div>
          
          <table style="width:100%;border-collapse:collapse;font-size:11px;">
            <thead>
              <tr>
                <th style="background:#f1f5f9;padding:7px 6px;text-align:center;border-bottom:2px solid #cbd5e1;font-weight:800;font-size:10px;color:#475569;">#</th>
                <th style="background:#f1f5f9;padding:7px 6px;text-align:center;border-bottom:2px solid #cbd5e1;font-weight:800;font-size:10px;color:#475569;">النوع</th>
                <th style="background:#f1f5f9;padding:7px 6px;text-align:center;border-bottom:2px solid #cbd5e1;font-weight:800;font-size:10px;color:#475569;">الاسم</th>
                <th style="background:#f1f5f9;padding:7px 6px;text-align:center;border-bottom:2px solid #cbd5e1;font-weight:800;font-size:10px;color:#475569;">الكمية</th>
                <th style="background:#f1f5f9;padding:7px 6px;text-align:center;border-bottom:2px solid #cbd5e1;font-weight:800;font-size:10px;color:#475569;">سعر الوحدة</th>
                <th style="background:#f1f5f9;padding:7px 6px;text-align:center;border-bottom:2px solid #cbd5e1;font-weight:800;font-size:10px;color:#475569;">الإجمالي</th>
                <th style="background:#f1f5f9;padding:7px 6px;text-align:center;border-bottom:2px solid #cbd5e1;font-weight:800;font-size:10px;color:#475569;">المقدمة</th>
                <th style="background:#f1f5f9;padding:7px 6px;text-align:center;border-bottom:2px solid #cbd5e1;font-weight:800;font-size:10px;color:#475569;">المتبقي</th>
              </tr>
            </thead>
            <tbody>
              ${groupedProductsList.map((p, i) => `
                <tr style="background:${i % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                  <td style="padding:6px;border-bottom:1px solid #f1f5f9;text-align:center;color:#64748b;">${i + 1}</td>
                  <td style="padding:6px;border-bottom:1px solid #f1f5f9;text-align:center;">${getProductTypeName(p.product_type)}</td>
                  <td style="padding:6px;border-bottom:1px solid #f1f5f9;text-align:center;font-weight:600;">${p.product_name || getProductTypeName(p.product_type)}</td>
                  <td style="padding:6px;border-bottom:1px solid #f1f5f9;text-align:center;font-weight:700;">${p.quantity}</td>
                  <td style="padding:6px;border-bottom:1px solid #f1f5f9;text-align:center;">${formatNum(p.unit_price)}</td>
                  <td style="padding:6px;border-bottom:1px solid #f1f5f9;text-align:center;font-weight:700;">${formatNum(p.total_price)}</td>
                  <td style="padding:6px;border-bottom:1px solid #f1f5f9;text-align:center;font-weight:700;color:#16a34a;">${formatNum(p.paid_amount || 0)}</td>
                  <td style="padding:6px;border-bottom:1px solid #f1f5f9;text-align:center;font-weight:700;color:#ea580c;">${formatNum(p.remaining_amount || 0)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="5" style="padding:7px 6px;font-weight:800;border-top:2px solid #cbd5e1;background:#f1f5f9;text-align:center;font-size:11px;">الإجمالي</td>
                <td style="padding:7px 6px;font-weight:800;border-top:2px solid #cbd5e1;background:#f1f5f9;text-align:center;font-size:11px;">${formatNum(totalAmount)}</td>
                <td style="padding:7px 6px;font-weight:800;border-top:2px solid #cbd5e1;background:#f1f5f9;text-align:center;font-size:11px;color:#16a34a;">${formatNum(totalDowns)}</td>
                <td style="padding:7px 6px;font-weight:800;border-top:2px solid #cbd5e1;background:#f1f5f9;text-align:center;font-size:11px;color:#ea580c;">${formatNum(groupedProductsList.reduce((s,p)=>s+(p.remaining_amount||0),0))}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <!-- جدول الأقساط مضغوط -->
        <div style="padding:8px 28px 10px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
            <div style="width:3px;height:16px;background:#1d4ed8;border-radius:2px;"></div>
            <div style="font-size:13px;font-weight:800;color:#0f172a;">الأقساط الشهرية</div>
            <span style="background:#1d4ed8;color:white;font-size:10px;padding:1px 8px;border-radius:12px;font-weight:700;">${paymentsList.length}</span>
          </div>
          
          <table style="width:100%;border-collapse:collapse;font-size:11px;">
            <thead>
              <tr>
                <th style="background:#f1f5f9;padding:7px 6px;text-align:center;border-bottom:2px solid #cbd5e1;font-weight:800;font-size:10px;color:#475569;">#</th>
                <th style="background:#f1f5f9;padding:7px 6px;text-align:center;border-bottom:2px solid #cbd5e1;font-weight:800;font-size:10px;color:#475569;">الشهر</th>
                <th style="background:#f1f5f9;padding:7px 6px;text-align:center;border-bottom:2px solid #cbd5e1;font-weight:800;font-size:10px;color:#475569;">المستحق</th>
                <th style="background:#f1f5f9;padding:7px 6px;text-align:center;border-bottom:2px solid #cbd5e1;font-weight:800;font-size:10px;color:#475569;">المدفوع</th>
                <th style="background:#f1f5f9;padding:7px 6px;text-align:center;border-bottom:2px solid #cbd5e1;font-weight:800;font-size:10px;color:#475569;">المتبقي</th>
                <th style="background:#f1f5f9;padding:7px 6px;text-align:center;border-bottom:2px solid #cbd5e1;font-weight:800;font-size:10px;color:#475569;">الحالة</th>
              </tr>
            </thead>
            <tbody>
              ${paymentsList.length > 0 ? paymentsList
                .sort((a, b) => a.month.localeCompare(b.month))
                .map((p, i) => {
                  const remaining = (p.amount || 0) - (p.paid_amount || 0);
                  let statusText = 'غير مدفوع';
                  let statusColor = '#dc2626';
                  let statusBg = '#fef2f2';
                  if (remaining <= 0) { 
                    statusText = 'مدفوع'; 
                    statusColor = '#16a34a';
                    statusBg = '#f0fdf4';
                  } else if ((p.paid_amount || 0) > 0) { 
                    statusText = 'جزئي'; 
                    statusColor = '#ea580c';
                    statusBg = '#fff7ed';
                  }
                  return `
                    <tr style="background:${i % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                      <td style="padding:6px;border-bottom:1px solid #f1f5f9;text-align:center;color:#64748b;">${i + 1}</td>
                      <td style="padding:6px;border-bottom:1px solid #f1f5f9;text-align:center;font-weight:700;">${getMonthName(p.month)}</td>
                      <td style="padding:6px;border-bottom:1px solid #f1f5f9;text-align:center;">${formatNum(p.amount)}</td>
                      <td style="padding:6px;border-bottom:1px solid #f1f5f9;text-align:center;font-weight:700;color:#16a34a;">${formatNum(p.paid_amount || 0)}</td>
                      <td style="padding:6px;border-bottom:1px solid #f1f5f9;text-align:center;font-weight:700;color:#ea580c;">${formatNum(remaining)}</td>
                      <td style="padding:6px;border-bottom:1px solid #f1f5f9;text-align:center;">
                        <span style="background:${statusBg};color:${statusColor};padding:2px 8px;border-radius:12px;font-weight:700;font-size:10px;">${statusText}</span>
                      </td>
                    </tr>
                  `;
                }).join('') : `
                <tr>
                  <td colspan="6" style="text-align:center;padding:16px;color:#94a3b8;font-size:12px;">لا توجد أقساط مسجلة</td>
                </tr>
              `}
            </tbody>
            ${paymentsList.length > 0 ? `
            <tfoot>
              <tr>
                <td colspan="2" style="padding:7px 6px;font-weight:800;border-top:2px solid #cbd5e1;background:#f1f5f9;text-align:center;font-size:11px;">الإجمالي</td>
                <td style="padding:7px 6px;font-weight:800;border-top:2px solid #cbd5e1;background:#f1f5f9;text-align:center;font-size:11px;">${formatNum(totalPaymentsAmount)}</td>
                <td style="padding:7px 6px;font-weight:800;border-top:2px solid #cbd5e1;background:#f1f5f9;text-align:center;font-size:11px;color:#16a34a;">${formatNum(paidPaymentsAmount)}</td>
                <td style="padding:7px 6px;font-weight:800;border-top:2px solid #cbd5e1;background:#f1f5f9;text-align:center;font-size:11px;color:#ea580c;">${formatNum(totalPaymentsAmount - paidPaymentsAmount)}</td>
                <td style="padding:7px 6px;border-top:2px solid #cbd5e1;background:#f1f5f9;"></td>
              </tr>
            </tfoot>
            ` : ''}
          </table>
        </div>
        
        <!-- FOOTER مضغوط -->
        <div style="background:#0f172a;padding:14px 28px;color:white;">
          <div style="text-align:center;margin-bottom:10px;">
            <div style="font-size:12px;font-weight:600;opacity:0.95;">شكراً لثقتكم بشركة جولدن للتجارة والتوزيع</div>
            <div style="font-size:10px;opacity:0.55;margin-top:2px;">هذا التقرير يوضح حالة المدفوعات والمتبقي من الأقساط المستحقة</div>
          </div>
          <div style="display:flex;justify-content:center;gap:60px;">
            <div style="text-align:center;">
              <div style="width:120px;border-top:1.5px solid rgba(255,255,255,0.35);margin:0 auto 6px;"></div>
              <div style="font-size:11px;font-weight:600;opacity:0.8;">توقيع العميل</div>
            </div>
            <div style="text-align:center;">
              <div style="width:120px;border-top:1.5px solid rgba(255,255,255,0.35);margin:0 auto 6px;"></div>
              <div style="font-size:11px;font-weight:600;opacity:0.8;">توقيع المندوب</div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    await new Promise(resolve => setTimeout(resolve, 500));

    const { default: html2canvas } = await import('html2canvas');
    const { default: jsPDF } = await import('jspdf');

    const canvas = await html2canvas(container, {
      scale: 2.5,
      useCORS: true,
      letterRendering: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    // إجبار التقرير على صفحة واحدة (تصغير لو أطول)
    if (pdfHeight > pageHeight) {
      const scale = pageHeight / pdfHeight;
      pdfHeight = pageHeight;
      const scaledWidth = pdfWidth * scale;
      const xOffset = (pdfWidth - scaledWidth) / 2;
      pdf.addImage(imgData, 'JPEG', xOffset, 0, scaledWidth, pdfHeight);
    } else {
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    }

    pdf.save(`تقرير_الزبون_${clientData.name}_${new Date().toISOString().slice(0, 10)}.pdf`);

    document.body.removeChild(container);
    showToast(`✅ تم تحميل PDF`, "success");

  } catch (error) {
    console.error('❌ خطأ:', error);
    showToast("❌ خطأ: " + error.message, "error");
  } finally {
    loading.value = false;
  }
};

// ===================== View =====================
const viewClient = async (id) => {
  const client = clients.value.find(c => c.id === id);
  if (!client) return;
  selectedClient.value = client;
  selectedClientProducts.value = products.value.filter(p => p.client_id === id);
  clientPayments.value = payments.value.filter(p => p.client_id === id);
  showViewModal.value = true;
};

const logout = () => {
  localStorage.removeItem('collector_session');
  isLoggedIn.value = false;
  collector.value = null;
  clients.value = [];
  products.value = [];
  payments.value = [];
  navigateTo('/dashboard/collector-fans/login');
};

// ===================== On Mounted =====================
onMounted(() => {
  loadCollectorData();
});
</script>

<style scoped>
.dir-ltr {
  direction: ltr;
  display: inline-block;
}
</style>
