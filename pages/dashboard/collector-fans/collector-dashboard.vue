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
          <p class="text-xs text-gray-500">🔄 إجمالي المراوح</p>
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
              <button @click="printClient(client.id)" class="flex-1 bg-green-500 text-white py-1.5 rounded-lg text-xs">🖨️ طباعة</button>
              <button @click="deleteClient(client.id)" class="flex-1 bg-red-500 text-white py-1.5 rounded-lg text-xs">🗑️</button>
            </div>
          </div>
        </div>

        <!-- Desktop Table -->
        <div class="hidden sm:block overflow-x-auto">
          <table class="w-full min-w-[900px]">
            <thead class="bg-gray-50">
              <tr>
                <th class="p-3 text-right text-sm">#</th>
                <th class="p-3 text-right text-sm">الاسم</th>
                <th class="p-3 text-right text-sm">الهاتف</th>
                <th class="p-3 text-right text-sm">المنطقة</th>
                <th class="p-3 text-right text-sm">المراوح</th>
                <th class="p-3 text-right text-sm">إجمالي المبلغ</th>
                <th class="p-3 text-right text-sm">المدفوع</th>
                <th class="p-3 text-right text-sm">المتبقي</th>
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
                  <div class="flex gap-1">
                    <button @click="viewClient(client.id)" class="text-blue-600 hover:text-blue-800 px-2 py-1 rounded-lg text-xs bg-blue-50 hover:bg-blue-100">👁️</button>
                    <button @click="printClient(client.id)" class="text-green-600 hover:text-green-800 px-2 py-1 rounded-lg text-xs bg-green-50 hover:bg-green-100">🖨️</button>
                    <button @click="deleteClient(client.id)" class="text-red-600 hover:text-red-800 px-2 py-1 rounded-lg text-xs bg-red-50 hover:bg-red-100">🗑️</button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredClients.length === 0">
                <td colspan="9" class="text-center py-12 text-gray-400">
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
      <div class="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div class="sticky top-0 bg-white border-b p-4 rounded-t-3xl">
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-bold">👤 {{ selectedClient?.name }}</h2>
            <button @click="showViewModal = false" class="text-2xl hover:text-gray-600">&times;</button>
          </div>
        </div>

        <div class="p-6" id="client-report">
          <!-- Client Info -->
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-2xl">
            <div><span class="text-gray-500">📱 الهاتف:</span> <span class="font-semibold">{{ selectedClient?.phone || '-' }}</span></div>
            <div><span class="text-gray-500">📍 العنوان:</span> <span class="font-semibold">{{ selectedClient?.address }}</span></div>
            <div><span class="text-gray-500">🏠 المنطقة:</span> <span class="font-semibold">{{ selectedClient?.area }}</span></div>
          </div>

          <!-- زر إضافة منتج -->
          <div class="mb-4">
            <button 
              @click="openAddProductModal" 
              class="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition flex items-center gap-2 text-sm"
            >
              ➕ إضافة منتج
            </button>
          </div>

          <!-- Products -->
          <h3 class="font-bold text-lg mb-3">🔄 المراوح والمنتجات</h3>
          <div class="overflow-x-auto mb-6">
            <table class="w-full min-w-[700px] text-sm">
              <thead class="bg-gray-100">
                <tr>
                  <th class="p-3 text-right">النوع</th>
                  <th class="p-3 text-right">الكمية</th>
                  <th class="p-3 text-right">سعر الوحدة</th>
                  <th class="p-3 text-right">الإجمالي</th>
                  <th class="p-3 text-right">المدفوع</th>
                  <th class="p-3 text-right">المتبقي</th>
                  <th class="p-3 text-right">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(product, idx) in selectedClientProducts" :key="idx" class="border-t hover:bg-gray-50">
                  <td class="p-3">{{ getProductTypeName(product.product_type) }}</td>
                  <td class="p-3">{{ product.quantity }}</td>
                  <td class="p-3">{{ formatNumber(product.unit_price) }} ج</td>
                  <td class="p-3 font-bold">{{ formatNumber(product.total_price) }} ج</td>
                  <td class="p-3 text-green-600">{{ formatNumber(product.paid_amount) }} ج</td>
                  <td class="p-3 text-orange-600 font-bold">{{ formatNumber(product.remaining_amount) }} ج</td>
                  <td class="p-3">
                    <button 
                      @click="deleteProduct(product.id)" 
                      class="text-red-600 hover:text-red-800 text-sm"
                    >
                      🗑️ حذف
                    </button>
                  </td>
                </tr>
                <tr v-if="selectedClientProducts.length === 0">
                  <td colspan="7" class="text-center py-4 text-gray-400">لا توجد منتجات</td>
                </tr>
              </tbody>
              <tfoot class="bg-gray-50 font-bold">
                <tr class="border-t">
                  <td colspan="3" class="p-3">📌 الإجمالي الكلي</td>
                  <td class="p-3">{{ formatNumber(selectedClientTotal) }} ج</td>
                  <td class="p-3 text-green-600">{{ formatNumber(selectedClientPaid) }} ج</td>
                  <td class="p-3 text-orange-600">{{ formatNumber(selectedClientRemaining) }} ج</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 pt-4 border-t">
            <button @click="printClientReport" class="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2">🖨️ طباعة التقرير</button>
            <button @click="showViewModal = false" class="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition">إغلاق</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ================= مودال إضافة منتج للزبون ================= -->
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
                  class="w-full p-3 border rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                >
                  <option value="">-- اختر النوع --</option>
                  <option value="standing">🔄 مروحة عمود</option>
                  <option value="wall">📌 مروحة حائط</option>
                  <option value="ceiling">🌀 مروحة سقف</option>
                  <option value="external">📦 منتج خارجي</option>
                </select>
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
                  placeholder="سعر الوحدة"
                  @input="calculateProductTotal"
                  class="w-full p-3 border rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  المبلغ المدفوع (مقدم)
                </label>
                <input
                  v-model.number="productForm.paid_amount"
                  type="number"
                  min="0"
                  placeholder="المدفوع"
                  @input="calculateProductTotal"
                  class="w-full p-3 border rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                />
              </div>
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  تاريخ التسليم
                </label>
                <input
                  v-model="productForm.delivery_date"
                  type="date"
                  class="w-full p-3 border rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                />
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

            <!-- ملخص -->
            <div class="bg-gray-50 rounded-xl p-4">
              <h3 class="font-bold text-sm mb-2">📊 ملخص المنتج</h3>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <p class="text-xs text-gray-500">الإجمالي</p>
                  <p class="text-lg font-bold text-blue-600">
                    {{ formatNumber(productForm.total_price || 0) }} ج
                  </p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">المدفوع</p>
                  <p class="text-lg font-bold text-green-600">
                    {{ formatNumber(productForm.paid_amount || 0) }} ج
                  </p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">المتبقي</p>
                  <p class="text-lg font-bold text-orange-600">
                    {{ formatNumber((productForm.total_price || 0) - (productForm.paid_amount || 0)) }} ج
                  </p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">الكمية</p>
                  <p class="text-lg font-bold">{{ productForm.quantity || 0 }}</p>
                </div>
              </div>
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
const filterArea = ref("");
const collector = ref(null);
const clients = ref([]);
const products = ref([]);
const payments = ref([]);
const selectedClient = ref(null);
const selectedClientProducts = ref([]);

const clientForm = ref({
  name: "",
  phone: "",
  address: "",
  area: "",
  notes: "",
});

const productForm = ref({
  product_type: "",
  quantity: 0,
  unit_price: 0,
  total_price: 0,
  paid_amount: 0,
  delivery_date: new Date().toISOString().split("T")[0],
  notes: "",
});

const showToast = (message, type = "success") => {
  const icons = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" };
  toast.value = { show: true, message, type, icon: icons[type] || "✅" };
  setTimeout(() => { toast.value.show = false; }, 3000);
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

const totalPaid = computed(() => {
  let total = 0;
  products.value.forEach(p => { total += p.paid_amount || 0; });
  payments.value.forEach(p => { total += p.amount || 0; });
  return total;
});

const totalRemaining = computed(() => {
  let total = 0;
  products.value.forEach(p => { total += p.remaining_amount || 0; });
  return total;
});

const selectedClientTotal = computed(() => {
  return selectedClientProducts.value.reduce((sum, p) => sum + (p.total_price || 0), 0);
});

const selectedClientPaid = computed(() => {
  return selectedClientProducts.value.reduce((sum, p) => sum + (p.paid_amount || 0), 0);
});

const selectedClientRemaining = computed(() => {
  return selectedClientProducts.value.reduce((sum, p) => sum + (p.remaining_amount || 0), 0);
});

// ===================== Functions =====================
const formatNumber = (num) => {
  if (!num && num !== 0) return "0";
  return num.toLocaleString("ar-EG");
};

const getProductTypeName = (type) => {
  const types = {
    standing: "🔄 عمود",
    wall: "📌 حائط",
    ceiling: "🌀 سقف",
    external: "📦 خارجي"
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

const getClientPaid = (clientId) => {
  const productPaid = getClientProducts(clientId).reduce((sum, p) => sum + (p.paid_amount || 0), 0);
  const clientPayments = payments.value.filter(p => p.client_id === clientId);
  const paymentAmount = clientPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  return productPaid + paymentAmount;
};

const getClientRemaining = (clientId) => {
  return getClientTotal(clientId) - getClientPaid(clientId);
};

const getClientsByArea = (area) => {
  return clients.value.filter(c => c.area === area);
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

  try {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) throw error;
    showToast("✅ تم حذف الزبون بنجاح", "success");
    await loadCollectorData();
  } catch (error) {
    console.error('❌ خطأ:', error);
    showToast("❌ خطأ: " + error.message, "error");
  }
};

// ===================== Product CRUD =====================

// فتح مودال إضافة منتج
const openAddProductModal = () => {
  productForm.value = {
    product_type: "",
    quantity: 0,
    unit_price: 0,
    total_price: 0,
    paid_amount: 0,
    delivery_date: new Date().toISOString().split("T")[0],
    notes: "",
  };
  showAddProductModal.value = true;
};

// حساب إجمالي المنتج
const calculateProductTotal = () => {
  productForm.value.total_price = (productForm.value.quantity || 0) * (productForm.value.unit_price || 0);
};

// حفظ المنتج
const saveProduct = async () => {
  if (!selectedClient.value) return;

  if (!productForm.value.product_type) {
    showToast("⚠️ الرجاء اختيار نوع المنتج", "warning");
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
    const total = (productForm.value.quantity || 0) * (productForm.value.unit_price || 0);
    const paid = productForm.value.paid_amount || 0;
    const remaining = total - paid;

    const { data, error } = await supabase
      .from('client_products')
      .insert([{
        client_id: selectedClient.value.id,
        product_type: productForm.value.product_type,
        quantity: productForm.value.quantity,
        unit_price: productForm.value.unit_price,
        total_price: total,
        paid_amount: paid,
        remaining_amount: remaining,
        delivery_date: productForm.value.delivery_date || new Date().toISOString().split("T")[0],
        notes: productForm.value.notes || null,
      }])
      .select();

    if (error) throw error;

    showToast(`✅ تم إضافة المنتج بنجاح`, "success");
    showAddProductModal.value = false;
    
    // إعادة تحميل بيانات الزبون
    await loadCollectorData();
    
    // إعادة فتح عرض الزبون
    await viewClient(selectedClient.value.id);

  } catch (error) {
    console.error('❌ خطأ:', error);
    showToast("❌ خطأ: " + error.message, "error");
  } finally {
    loading.value = false;
  }
};

// حذف منتج
const deleteProduct = async (productId) => {
  if (!confirm("⚠️ هل أنت متأكد من حذف هذا المنتج؟")) return;

  try {
    const { error } = await supabase
      .from('client_products')
      .delete()
      .eq('id', productId);

    if (error) throw error;

    showToast("✅ تم حذف المنتج بنجاح", "success");
    await loadCollectorData();
    
    // إعادة فتح عرض الزبون إذا كان مفتوح
    if (selectedClient.value) {
      await viewClient(selectedClient.value.id);
    }
  } catch (error) {
    console.error('❌ خطأ:', error);
    showToast("❌ خطأ: " + error.message, "error");
  }
};

// ===================== View & Print =====================
const viewClient = async (id) => {
  const client = clients.value.find(c => c.id === id);
  if (!client) return;
  selectedClient.value = client;
  selectedClientProducts.value = products.value.filter(p => p.client_id === id);
  showViewModal.value = true;
};

const printClient = (id) => {
  viewClient(id);
  setTimeout(() => printClientReport(), 500);
};

const printClientReport = () => {
  const content = document.getElementById('client-report');
  if (!content) return;

  const win = window.open('', '_blank');
  win.document.write(`
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <title>تقرير الزبون - ${selectedClient.value?.name}</title>
      <meta charset="UTF-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Cairo', sans-serif; padding: 30px; background: white; }
        .no-print { display: none; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .text-green { color: #16a34a; }
        .text-orange { color: #d97706; }
        .bg-gray-50 { background: #f9fafb; }
        .rounded { border-radius: 8px; }
        .p-4 { padding: 16px; }
        .mb-4 { margin-bottom: 16px; }
      </style>
    </head>
    <body>
      <div style="max-width: 800px; margin: 0 auto;">${content.outerHTML}</div>
      <div class="no-print" style="text-align: center; margin-top: 20px;">
        <button onclick="window.print()" style="padding: 10px 20px; margin: 5px; cursor: pointer; border: none; background: #2563eb; color: white; border-radius: 10px;">🖨️ طباعة</button>
        <button onclick="window.close()" style="padding: 10px 20px; margin: 5px; cursor: pointer; border: none; background: #ef4444; color: white; border-radius: 10px;">❌ إغلاق</button>
      </div>
      <script>setTimeout(() => { window.print(); }, 1000);<\/script>
    </body>
    </html>
  `);
  win.document.close();
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