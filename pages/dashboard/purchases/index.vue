<template>
  <div class="p-3 sm:p-4 md:p-6 bg-gray-50 min-h-screen" dir="rtl">
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6"
    >
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">
        📥 فواتير المشتريات
      </h1>
      <button
        v-if="userStore?.canEdit"
        @click="showAddModal = true"
        class="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-sm sm:text-base w-full sm:w-auto"
      >
        + إضافة فاتورة شراء
      </button>
    </div>

    <!-- تبويبات الأقسام -->
    <div class="flex gap-2 flex-wrap mb-6 border-b">
      <button
        v-for="cat in categories"
        :key="cat.value"
        @click="activeCategory = cat.value"
        class="px-4 sm:px-6 py-2 sm:py-3 font-medium transition text-sm sm:text-base"
        :class="
          activeCategory === cat.value
            ? 'border-b-2 border-blue-600 text-blue-600'
            : 'text-gray-500'
        "
      >
        {{ cat.icon }} {{ cat.name }}
      </button>
      <button
        @click="activeCategory = 'all'"
        class="px-4 sm:px-6 py-2 sm:py-3 font-medium transition text-sm sm:text-base"
        :class="
          activeCategory === 'all'
            ? 'border-b-2 border-blue-600 text-blue-600'
            : 'text-gray-500'
        "
      >
        📋 الكل
      </button>
    </div>

    <!-- إحصائيات سريعة حسب القسم -->
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
      <div
        class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-3 text-white"
      >
        <p class="text-xs opacity-90">⚡ مشتريات الكهرباء</p>
        <p class="text-lg font-bold">
          {{ formatNumber(categoryTotals.electrical) }} ج
        </p>
      </div>
      <div
        class="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-3 text-white"
      >
        <p class="text-xs opacity-90">🏠 مشتريات المنزلي</p>
        <p class="text-lg font-bold">
          {{ formatNumber(categoryTotals.home) }} ج
        </p>
      </div>
      <div
        class="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-3 text-white"
      >
        <p class="text-xs opacity-90">🪑 مشتريات البلاستيك</p>
        <p class="text-lg font-bold">
          {{ formatNumber(categoryTotals.plastic) }} ج
        </p>
      </div>
      <div
        class="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-3 text-white"
      >
        <p class="text-xs opacity-90">📦 مشتريات خارجية</p>
        <p class="text-lg font-bold">
          {{ formatNumber(categoryTotals.external) }} ج
        </p>
      </div>
    </div>

    <!-- إحصائيات سريعة عامة -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
      <div class="bg-white p-3 sm:p-4 rounded-xl shadow">
        <p class="text-gray-500 text-xs sm:text-sm">إجمالي المشتريات (اليوم)</p>
        <p class="text-xl sm:text-2xl font-bold text-orange-600 break-words">
          {{ formatNumber(todayTotal) }} ج
        </p>
      </div>
      <div class="bg-white p-3 sm:p-4 rounded-xl shadow">
        <p class="text-gray-500 text-xs sm:text-sm">إجمالي المشتريات (الشهر)</p>
        <p class="text-xl sm:text-2xl font-bold text-purple-600 break-words">
          {{ formatNumber(monthTotal) }} ج
        </p>
      </div>
      <div class="bg-white p-3 sm:p-4 rounded-xl shadow">
        <p class="text-gray-500 text-xs sm:text-sm">عدد الفواتير</p>
        <p class="text-xl sm:text-2xl font-bold text-blue-600">
          {{ purchases.length }}
        </p>
      </div>
    </div>

    <!-- جدول المشتريات -->
    <div class="bg-white rounded-2xl shadow overflow-hidden">
      <!-- Mobile Cards View -->
      <div class="block md:hidden divide-y">
        <div
          v-for="purchase in filteredPurchases"
          :key="purchase.id"
          class="p-4 hover:bg-gray-50"
        >
          <div class="flex justify-between items-start mb-3">
            <div>
              <p class="font-medium text-sm">
                {{
                  purchase.product_name || getProductName(purchase.product_id)
                }}
              </p>
              <p class="text-xs text-gray-500 mt-1">
                <span
                  :class="getCategoryBadgeClass(purchase.category)"
                  class="px-2 py-0.5 rounded-full text-xs"
                >
                  {{ getCategoryIcon(purchase.category) }}
                  {{ getCategoryName(purchase.category) }}
                </span>
              </p>
              <p class="text-xs text-gray-500 mt-1">
                {{ purchase.supplier_name || "مورد غير محدد" }}
              </p>
            </div>
            <div class="flex items-center gap-1">
              <button
                v-if="userStore?.canEdit"
                @click="openEditModal(purchase)"
                class="text-blue-500 hover:text-blue-700 text-xs bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg transition"
              >
                ✏️
              </button>
              <button
                v-if="userStore?.canEdit"
                @click="deletePurchase(purchase.id)"
                class="text-red-500 text-sm"
              >
                🗑️
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span class="text-gray-500">الكمية:</span>
              <span class="font-medium mr-1">{{ purchase.quantity }}</span>
            </div>
            <div>
              <span class="text-gray-500">سعر الشراء:</span>
              <span class="font-medium mr-1"
                >{{ formatNumber(purchase.unit_price) }} ج</span
              >
            </div>
            <div class="col-span-2">
              <span class="text-gray-500">الإجمالي:</span>
              <span class="font-bold text-orange-600 mr-1"
                >{{ formatNumber(purchase.total_price) }} ج</span
              >
            </div>
            <div class="col-span-2">
              <span class="text-gray-500">التاريخ:</span>
              <span class="text-xs mr-1">{{
                formatDate(purchase.purchase_date)
              }}</span>
            </div>
          </div>
        </div>
        <div
          v-if="filteredPurchases.length === 0"
          class="text-center py-12 text-gray-400"
        >
          لا توجد مشتريات في هذا القسم
        </div>
      </div>

      <!-- Desktop Table View -->
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full min-w-[900px]">
          <thead class="bg-gray-100">
            <tr>
              <th class="p-3 text-right text-sm">القسم</th>
              <th class="p-3 text-right text-sm">المنتج</th>
              <th class="p-3 text-right text-sm">الكمية</th>
              <th class="p-3 text-right text-sm">سعر الشراء</th>
              <th class="p-3 text-right text-sm">الإجمالي</th>
              <th class="p-3 text-right text-sm hidden lg:table-cell">المورد</th>
              <th class="p-3 text-right text-sm hidden sm:table-cell">
                التاريخ
              </th>
              <th class="p-3 text-right text-sm">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="purchase in filteredPurchases"
              :key="purchase.id"
              class="border-t hover:bg-gray-50"
            >
              <td class="p-3">
                <span
                  :class="getCategoryBadgeClass(purchase.category)"
                  class="px-2 py-1 rounded-full text-xs whitespace-nowrap"
                >
                  {{ getCategoryIcon(purchase.category) }}
                  {{ getCategoryName(purchase.category) }}
                </span>
              </td>
              <td class="p-3 text-sm font-medium">
                {{
                  purchase.product_name || getProductName(purchase.product_id)
                }}
              </td>
              <td class="p-3 text-sm">{{ purchase.quantity }}</td>
              <td class="p-3 text-sm whitespace-nowrap">
                {{ formatNumber(purchase.unit_price) }} ج
              </td>
              <td
                class="p-3 font-bold text-orange-600 text-sm whitespace-nowrap"
              >
                {{ formatNumber(purchase.total_price) }} ج
              </td>
              <td class="p-3 text-sm hidden lg:table-cell">
                {{ purchase.supplier_name || "-" }}
              </td>
              <td class="p-3 text-sm hidden sm:table-cell whitespace-nowrap">
                {{ formatDate(purchase.purchase_date) }}
              </td>
              <td class="p-3">
                <div class="flex items-center gap-2">
                  <button
                    v-if="userStore?.canEdit"
                    @click="openEditModal(purchase)"
                    class="text-blue-500 hover:text-blue-700 text-sm bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg transition"
                  >
                    ✏️ تعديل
                  </button>
                  <button
                    v-if="userStore?.canEdit"
                    @click="deletePurchase(purchase.id)"
                    class="text-red-500 hover:text-red-700 text-sm bg-red-50 hover:bg-red-100 px-2 py-1 rounded-lg transition"
                  >
                    🗑️ حذف
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredPurchases.length === 0">
              <td colspan="8" class="text-center py-12 text-gray-400">
                لا توجد مشتريات
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <!-- ========================================== -->
    <!-- مودال تعديل الفاتورة -->
    <!-- ========================================== -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="showEditModal = false"
    >
      <div
        class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <!-- Header -->
        <div
          class="sticky top-0 z-10 bg-gradient-to-l from-amber-600 to-amber-700 rounded-t-3xl p-5"
        >
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-xl font-bold text-white">✏️ تعديل الفاتورة</h2>
              <p class="text-amber-100 text-sm">قم بتعديل بيانات الفاتورة</p>
            </div>
            <button
              @click="showEditModal = false"
              class="text-white/70 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-4">
          <!-- اختيار المنتج -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <span class="text-red-500">*</span> المنتج
            </label>
            <select
              v-model="editForm.product_id"
              class="w-full p-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
            >
              <option value="">اختر المنتج...</option>
              <option
                v-for="product in products"
                :key="product.id"
                :value="product.id"
              >
                {{ product.name }} - {{ formatNumber(product.price) }} ج ({{
                  product.stock
                }})
              </option>
            </select>
          </div>

          <!-- اسم المنتج (للقراءة) -->
          <div v-if="editForm.product_name">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              اسم المنتج
            </label>
            <input
              v-model="editForm.product_name"
              type="text"
              disabled
              class="w-full p-3 border border-gray-200 rounded-2xl bg-gray-50 text-gray-500 text-sm"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                <span class="text-red-500">*</span> الكمية
              </label>
              <input
                v-model.number="editForm.quantity"
                type="number"
                class="w-full p-3 border border-gray-200 rounded-2xl text-sm"
                min="1"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                <span class="text-red-500">*</span> سعر الشراء للوحدة
              </label>
              <input
                v-model.number="editForm.unit_price"
                type="number"
                class="w-full p-3 border border-gray-200 rounded-2xl text-sm"
                min="0"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                اسم المورد
              </label>
              <input
                v-model="editForm.supplier_name"
                type="text"
                placeholder="اسم المورد"
                class="w-full p-3 border border-gray-200 rounded-2xl text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                رقم الفاتورة
              </label>
              <input
                v-model="editForm.invoice_number"
                type="text"
                placeholder="رقم الفاتورة"
                class="w-full p-3 border border-gray-200 rounded-2xl text-sm"
              />
            </div>
          </div>

          <!-- الإجمالي -->
          <div
            class="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-4"
          >
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">الإجمالي</span>
              <span class="text-2xl font-bold text-orange-600">
                {{ formatNumber(editTotal) }} ج
              </span>
            </div>
          </div>

          <!-- أزرار الإجراءات -->
          <div class="flex flex-col sm:flex-row gap-3 pt-3 border-t">
            <button
              v-if="userStore?.canEdit"
              @click="updatePurchase"
              :disabled="updating"
              class="flex-1 bg-amber-600 text-white py-3 rounded-2xl font-medium hover:bg-amber-700 transition disabled:opacity-50"
            >
              {{ updating ? "جاري التحديث..." : "💾 تحديث" }}
            </button>
            <button
              @click="showEditModal = false"
              class="flex-1 bg-gray-100 text-gray-700 py-3 rounded-2xl font-medium hover:bg-gray-200 transition"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Modal إضافة مشتريات -->
    <div
      v-if="showAddModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="showAddModal = false"
    >
      <div
        class="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <!-- Header -->
        <div
          class="sticky top-0 z-10 bg-gradient-to-l from-blue-600 to-blue-700 rounded-t-3xl p-5"
        >
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-xl font-bold text-white">📥 إضافة فاتورة شراء</h2>
              <p class="text-blue-100 text-sm">أضف منتج جديد أو فاتورة كاملة</p>
            </div>
            <button
              @click="showAddModal = false"
              class="text-white/70 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-5">
          <!-- ✅ اختيار نوع الإضافة - 3 خيارات -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-3">
              🎯 نوع الإضافة
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <!-- منتج موجود -->
              <label
                class="p-4 border-2 rounded-2xl cursor-pointer transition-all hover:shadow-md"
                :class="
                  addType === 'existing'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                "
              >
                <input
                  type="radio"
                  value="existing"
                  v-model="addType"
                  class="sr-only"
                />
                <div class="text-center">
                  <span class="text-2xl block">📦</span>
                  <p class="font-medium text-sm mt-1">منتج موجود</p>
                  <p class="text-xs text-gray-400">اختر من القائمة</p>
                </div>
              </label>

              <!-- منتج جديد -->
              <label
                class="p-4 border-2 rounded-2xl cursor-pointer transition-all hover:shadow-md"
                :class="
                  addType === 'new'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200'
                "
              >
                <input
                  type="radio"
                  value="new"
                  v-model="addType"
                  class="sr-only"
                />
                <div class="text-center">
                  <span class="text-2xl block">✨</span>
                  <p class="font-medium text-sm mt-1">منتج جديد</p>
                  <p class="text-xs text-gray-400">إضافة منتج جديد</p>
                </div>
              </label>

              <!-- فاتورة كاملة -->
              <label
                class="p-4 border-2 rounded-2xl cursor-pointer transition-all hover:shadow-md"
                :class="
                  addType === 'bulk'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200'
                "
              >
                <input
                  type="radio"
                  value="bulk"
                  v-model="addType"
                  class="sr-only"
                />
                <div class="text-center">
                  <span class="text-2xl block">📋</span>
                  <p class="font-medium text-sm mt-1">فاتورة كاملة</p>
                  <p class="text-xs text-gray-400">أكثر من منتج</p>
                </div>
              </label>
            </div>
          </div>

          <!-- ========================================== -->
          <!-- 1️⃣ منتج موجود -->
          <!-- ========================================== -->
          <div v-if="addType === 'existing'" class="space-y-4">
            <div class="bg-blue-50 rounded-2xl p-4 text-sm text-blue-700">
              ℹ️ اختر المنتج من القائمة وأضف الكمية وسعر الشراء
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                <span class="text-red-500">*</span> المنتج
              </label>
              <select
                v-model="form.product_id"
                class="w-full p-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">اختر المنتج...</option>
                <option
                  v-for="product in filteredProductsByCategory"
                  :key="product.id"
                  :value="product.id"
                >
                  {{ product.name }} - {{ formatNumber(product.price) }} ج ({{
                    product.stock
                  }})
                </option>
              </select>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  <span class="text-red-500">*</span> الكمية
                </label>
                <input
                  v-model="form.quantity"
                  type="number"
                  class="w-full p-3 border border-gray-200 rounded-2xl text-sm"
                  min="1"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  <span class="text-red-500">*</span> سعر الشراء
                </label>
                <input
                  v-model="form.unit_price"
                  type="number"
                  class="w-full p-3 border border-gray-200 rounded-2xl text-sm"
                  min="0"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  اسم المورد (اختياري)
                </label>
                <input
                  v-model="form.supplier_name"
                  placeholder="اسم المورد"
                  class="w-full p-3 border border-gray-200 rounded-2xl text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  رقم الفاتورة (اختياري)
                </label>
                <input
                  v-model="form.invoice_number"
                  placeholder="رقم الفاتورة"
                  class="w-full p-3 border border-gray-200 rounded-2xl text-sm"
                />
              </div>
            </div>

            <div
              class="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-4"
            >
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">الإجمالي</span>
                <span class="text-2xl font-bold text-orange-600">
                  {{ formatNumber(calculatedTotal) }} ج
                </span>
              </div>
            </div>
          </div>

          <!-- ========================================== -->
          <!-- 2️⃣ منتج جديد -->
          <!-- ========================================== -->
          <div v-if="addType === 'new'" class="space-y-4">
            <div class="bg-purple-50 rounded-2xl p-4 text-sm text-purple-700">
              ✨ أضف منتج جديد بكل مواصفاته
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  <span class="text-red-500">*</span> اسم المنتج
                </label>
                <input
                  v-model="newProduct.name"
                  type="text"
                  placeholder="اسم المنتج"
                  class="w-full p-3 border border-gray-200 rounded-2xl text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  <span class="text-red-500">*</span> القسم
                </label>
                <select
                  v-model="newProduct.category"
                  class="w-full p-3 border border-gray-200 rounded-2xl text-sm"
                >
                  <option value="">اختر القسم</option>
                  <option value="electrical">⚡ الكهرباء</option>
                  <option value="home">🏠 المنزلي</option>
                  <option value="plastic">🪑 البلاستيك</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  النوع (اختياري)
                </label>
                <select
                  v-model="newProduct.sub_category"
                  class="w-full p-3 border border-gray-200 rounded-2xl text-sm"
                  :disabled="!newProduct.category"
                >
                  <option value="">اختر النوع</option>
                  <option
                    v-for="sub in getSubCategories(newProduct.category)"
                    :key="sub.value"
                    :value="sub.value"
                  >
                    {{ sub.name }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  الماركة (اختياري)
                </label>
                <input
                  v-model="newProduct.brand"
                  type="text"
                  placeholder="الماركة"
                  class="w-full p-3 border border-gray-200 rounded-2xl text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  <span class="text-red-500">*</span> سعر البيع
                </label>
                <input
                  v-model.number="newProduct.price"
                  type="number"
                  placeholder="سعر البيع"
                  class="w-full p-3 border border-gray-200 rounded-2xl text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  <span class="text-red-500">*</span> سعر الشراء
                </label>
                <input
                  v-model.number="newProduct.purchase_price"
                  type="number"
                  placeholder="سعر الشراء"
                  class="w-full p-3 border border-gray-200 rounded-2xl text-sm"
                />
              </div>
            </div>

            <!-- حقول الكمية وسعر الشراء للوحدة والفاتورة -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  <span class="text-red-500">*</span> الكمية
                </label>
                <input
                  v-model="form.quantity"
                  type="number"
                  class="w-full p-3 border border-gray-200 rounded-2xl text-sm"
                  min="1"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  <span class="text-red-500">*</span> سعر الشراء للوحدة
                </label>
                <input
                  v-model="form.unit_price"
                  type="number"
                  class="w-full p-3 border border-gray-200 rounded-2xl text-sm"
                  min="0"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  اسم المورد (اختياري)
                </label>
                <input
                  v-model="form.supplier_name"
                  placeholder="اسم المورد"
                  class="w-full p-3 border border-gray-200 rounded-2xl text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  رقم الفاتورة (اختياري)
                </label>
                <input
                  v-model="form.invoice_number"
                  placeholder="رقم الفاتورة"
                  class="w-full p-3 border border-gray-200 rounded-2xl text-sm"
                />
              </div>
            </div>

            <div
              class="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-4"
            >
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">الإجمالي</span>
                <span class="text-2xl font-bold text-orange-600">
                  {{ formatNumber(calculatedTotal) }} ج
                </span>
              </div>
            </div>

            <div class="bg-blue-50 p-3 rounded-xl text-xs text-gray-600">
              💡 سيتم إضافة المنتج الجديد إلى قاعدة البيانات وتحديث المخزون
              تلقائياً
            </div>
          </div>

          <!-- ========================================== -->
          <!-- 3️⃣ فاتورة كاملة -->
          <!-- ========================================== -->
          <div v-if="addType === 'bulk'" class="space-y-4">
            <div class="bg-green-50 rounded-2xl p-4 text-sm text-green-700">
              📋 أضف جميع منتجات الفاتورة دفعة واحدة
            </div>

            <!-- 🔥 حقل اختيار القسم للفاتورة -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                <span class="text-red-500">*</span> القسم
              </label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  @click="bulkInvoice.category = 'electrical'"
                  class="p-3 rounded-2xl border-2 transition-all text-sm font-medium"
                  :class="
                    bulkInvoice.category === 'electrical'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-300'
                  "
                >
                  ⚡ كهرباء
                </button>
                <button
                  @click="bulkInvoice.category = 'home'"
                  class="p-3 rounded-2xl border-2 transition-all text-sm font-medium"
                  :class="
                    bulkInvoice.category === 'home'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-green-300'
                  "
                >
                  🏠 منزلي
                </button>
                <button
                  @click="bulkInvoice.category = 'plastic'"
                  class="p-3 rounded-2xl border-2 transition-all text-sm font-medium"
                  :class="
                    bulkInvoice.category === 'plastic'
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-purple-300'
                  "
                >
                  🪑 بلاستيك
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  <span class="text-red-500">*</span> رقم الفاتورة
                </label>
                <input
                  v-model="bulkInvoice.invoice_number"
                  type="text"
                  placeholder="رقم الفاتورة"
                  class="w-full p-3 border border-gray-200 rounded-2xl text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  <span class="text-red-500">*</span> اسم المورد
                </label>
                <input
                  v-model="bulkInvoice.supplier_name"
                  type="text"
                  placeholder="اسم المورد"
                  class="w-full p-3 border border-gray-200 rounded-2xl text-sm"
                />
              </div>
            </div>

            <div>
              <div class="flex justify-between items-center mb-3">
                <h4 class="font-semibold text-gray-700">
                  🛍️ المنتجات ({{ bulkInvoice.items.length }})
                </h4>
                <button
                  @click="addBulkItem"
                  class="bg-green-500 text-white px-4 py-2 rounded-2xl text-sm font-medium hover:bg-green-600 transition"
                >
                  + إضافة منتج
                </button>
              </div>

              <div class="space-y-3 max-h-60 overflow-y-auto">
                <div
                  v-for="(item, index) in bulkInvoice.items"
                  :key="index"
                  class="bg-gray-50 rounded-2xl p-4 border border-gray-200"
                >
                  <div class="flex justify-between items-start mb-2">
                    <span class="font-medium text-sm">#{{ index + 1 }}</span>
                    <button
                      @click="removeBulkItem(index)"
                      class="text-red-400 hover:text-red-600 text-sm"
                    >
                      ✕ حذف
                    </button>
                  </div>

                  <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div>
                      <select
                        v-model="item.type"
                        class="w-full p-2 border rounded-xl text-sm"
                      >
                        <option value="existing">موجود</option>
                        <option value="new">جديد</option>
                      </select>
                    </div>
                    <div v-if="item.type === 'existing'">
                      <select
                        v-model="item.product_id"
                        class="w-full p-2 border rounded-xl text-sm"
                      >
                        <option value="">اختر...</option>
                        <option
                          v-for="product in filteredProductsByCategory"
                          :key="product.id"
                          :value="product.id"
                        >
                          {{ product.name }}
                        </option>
                      </select>
                    </div>
                    <div v-if="item.type === 'new'">
                      <input
                        v-model="item.newProductName"
                        type="text"
                        placeholder="اسم المنتج"
                        class="w-full p-2 border rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <input
                        v-model.number="item.quantity"
                        type="number"
                        placeholder="الكمية"
                        class="w-full p-2 border rounded-xl text-sm"
                        min="1"
                      />
                    </div>
                    <div>
                      <input
                        v-model.number="item.unit_price"
                        type="number"
                        placeholder="سعر الشراء"
                        class="w-full p-2 border rounded-xl text-sm"
                        min="0"
                      />
                    </div>
                    <div v-if="item.type === 'new'">
                      <input
                        v-model.number="item.selling_price"
                        type="number"
                        placeholder="سعر البيع"
                        class="w-full p-2 border rounded-xl text-sm"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div
                v-if="bulkInvoice.items.length === 0"
                class="text-center py-8 text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed"
              >
                <span class="text-4xl block">📦</span>
                <p class="text-sm">لا توجد منتجات</p>
              </div>
            </div>

            <div
              v-if="bulkInvoice.items.length > 0"
              class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4"
            >
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">إجمالي الفاتورة</span>
                <span class="text-2xl font-bold text-orange-600">
                  {{ formatNumber(bulkTotal) }} ج
                </span>
              </div>
            </div>
          </div>

          <!-- أزرار الإجراءات -->
          <div class="flex flex-col sm:flex-row gap-3 pt-3 border-t">
            <button
              v-if="userStore?.canEdit"
              @click="addPurchase"
              :disabled="adding"
              class="flex-1 bg-blue-600 text-white py-3 rounded-2xl font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {{ adding ? "جاري الحفظ..." : "💾 حفظ" }}
            </button>
            <button
              @click="showAddModal = false"
              class="flex-1 bg-gray-100 text-gray-700 py-3 rounded-2xl font-medium hover:bg-gray-200 transition"
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

import { supabase } from '~/lib/supabase';
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
const purchases = ref([]);
const products = ref([]);
const showAddModal = ref(false);
const showEditModal = ref(false);
const adding = ref(false);
const updating = ref(false);
const activeCategory = ref("all");
const addType = ref("existing");

// نموذج التعديل
const editForm = ref({
  id: null,
  product_id: "",
  product_name: "",
  quantity: 1,
  unit_price: 0,
  total_price: 0,
  supplier_name: "",
  invoice_number: "",
  old_quantity: 0, // لحفظ الكمية القديمة لتحديث المخزون
});

// حساب إجمالي التعديل
const editTotal = computed(() => {
  return (editForm.value.quantity || 0) * (editForm.value.unit_price || 0);
});

// فتح مودال التعديل
const openEditModal = (purchase) => {
  editForm.value = {
    id: purchase.id,
    product_id: purchase.product_id,
    product_name: purchase.product_name || getProductName(purchase.product_id),
    quantity: purchase.quantity,
    unit_price: purchase.unit_price,
    total_price: purchase.total_price,
    supplier_name: purchase.supplier_name || "",
    invoice_number: purchase.invoice_number || "",
    old_quantity: purchase.quantity,
  };
  showEditModal.value = true;
};

// ✅ تحديث الفاتورة
const updatePurchase = async () => {
  if (!userStore.canEdit) {
    showToast("⚠️ ليس لديك صلاحية لتحديث المشتريات", "warning");
    return;
  }

  if (!editForm.value.product_id) {
    showToast("⚠️ الرجاء اختيار منتج", "warning");
    return;
  }
  if (!editForm.value.quantity || editForm.value.quantity <= 0) {
    showToast("⚠️ الكمية غير صحيحة", "warning");
    return;
  }
  if (!editForm.value.unit_price || editForm.value.unit_price <= 0) {
    showToast("⚠️ سعر الشراء غير صحيح", "warning");
    return;
  }

  updating.value = true;

  try {
    const newTotal = editForm.value.quantity * editForm.value.unit_price;

    // 1. تحديث سجل الشراء
    const { error: updateError } = await supabase
      .from("purchases")
      .update({
        product_id: editForm.value.product_id,
        quantity: parseInt(editForm.value.quantity),
        unit_price: parseFloat(editForm.value.unit_price),
        total_price: newTotal,
        supplier_name: editForm.value.supplier_name || null,
        invoice_number: editForm.value.invoice_number || null,
      })
      .eq("id", editForm.value.id);

    if (updateError) throw updateError;

    // 2. تحديث المخزون (الفرق بين الكمية القديمة والجديدة)
    const product = products.value.find(
      (p) => p.id === editForm.value.product_id,
    );
    if (product) {
      const quantityDiff =
        parseInt(editForm.value.quantity) -
        parseInt(editForm.value.old_quantity);
      const newStock = (product.stock || 0) + quantityDiff;

      await supabase
        .from("products")
        .update({
          stock: newStock,
          purchase_price: editForm.value.unit_price,
        })
        .eq("id", editForm.value.product_id);
    }

    showToast("✅ تم تحديث الفاتورة بنجاح", "success");

    showEditModal.value = false;
    await loadPurchases();
    await loadProducts();
  } catch (error) {
    console.error("Error updating purchase:", error);
    showToast("❌ خطأ في التحديث: " + error.message, "error");
  } finally {
    updating.value = false;
  }
};

// النموذج الأساسي (فردي)
const form = ref({
  product_id: "",
  quantity: 1,
  unit_price: 0,
  supplier_name: "",
  invoice_number: "",
});

// منتج جديد (فردي)
const newProduct = ref({
  name: "",
  category: "",
  sub_category: "",
  brand: "",
  price: 0,
  purchase_price: 0,
});

// فاتورة كاملة (متعددة)
const bulkInvoice = ref({
  invoice_number: "",
  supplier_name: "",
  category: "plastic", // 🔥 القسم الافتراضي للفاتورة
  items: [],
});

// إضافة منتج للفاتورة
const addBulkItem = () => {
  bulkInvoice.value.items.push({
    type: "existing",
    product_id: "",
    newProductName: "",
    quantity: 1,
    unit_price: 0,
    selling_price: 0,
    category: "",
    sub_category: "",
  });
};

// حذف منتج من الفاتورة
const removeBulkItem = (index) => {
  bulkInvoice.value.items.splice(index, 1);
};

// حساب إجمالي الفاتورة
const bulkTotal = computed(() => {
  return bulkInvoice.value.items.reduce((sum, item) => {
    return sum + (item.quantity || 0) * (item.unit_price || 0);
  }, 0);
});

// الأقسام
const categories = [
  { name: "الكهرباء", value: "electrical", icon: "⚡" },
  { name: "المنزلي", value: "home", icon: "🏠" },
  { name: "البلاستيك", value: "plastic", icon: "🪑" },
];

// الأقسام الفرعية
const subCategories = {
  electrical: [
    { name: "الكل", value: "all" },
    { name: "ثلاجات", value: "refrigerators" },
    { name: "غسالات", value: "washing_machines" },
    { name: "تكييفات", value: "air_conditioners" },
    { name: "مراوح", value: "fans" },
    { name: "ميكروويف", value: "microwaves" },
    { name: "خلاطات", value: "blenders" },
    { name: "غلايات", value: "kettles" },
  ],
  home: [
    { name: "الكل", value: "all" },
    { name: "أطقم سفرة", value: "dinner_sets" },
    { name: "حلل وطاسات", value: "pots_pans" },
    { name: "أدوات تنظيف", value: "cleaning_tools" },
  ],
  plastic: [
    { name: "الكل", value: "all" },
    { name: "دولاب بلاستيك", value: "plastic_cabinets" },
    { name: "تانكات تخزين", value: "storage_tanks" },
    { name: "سلات تنظيم", value: "organization_baskets" },
    { name: "كراسي بلاستيك", value: "chairs" },
    { name: "طاولات بلاستيك", value: "plastic_tables" },
    { name: "علب حفظ طعام", value: "food_containers" },
    { name: "طقم سفرة بلاستيك", value: "dinner_sets" },
    { name: "أكواب وأباريق", value: "cups_pitchers" },
    { name: "صحون ومواعين", value: "plates_bowls" },
    { name: "أدوات مطبخ متنوعة", value: "kitchen_tools" },
    { name: "مجففات وحافظات طعام", value: "food_dryers" },
    { name: "مقشات وشفاطات", value: "brooms_dustpans" },
    { name: "سلات قمامة", value: "trash_bins" },
    { name: "أدوات تنظيف", value: "cleaning_tools" },
    { name: "شتّابات", value: "hangers" },
    { name: "شمع ومنتجات عناية", value: "wax_products" },
    { name: "منتجات متعددة", value: "misc_products" },
  ],
};

// دوال مساعدة
const getSubCategories = (category) => {
  return subCategories[category] || [];
};

const getCategoryName = (catValue) => {
  const names = {
    electrical: "كهرباء",
    home: "منزلي",
    plastic: "بلاستيك",
    external: "خارجي",
  };
  return names[catValue] || catValue;
};

const getCategoryIcon = (catValue) => {
  const icons = { electrical: "⚡", home: "🏠", plastic: "🪑", external: "📦" };
  return icons[catValue] || "📦";
};

const getCategoryBadgeClass = (catValue) => {
  const classes = {
    electrical: "bg-blue-100 text-blue-700",
    home: "bg-green-100 text-green-700",
    plastic: "bg-purple-100 text-purple-700",
    external: "bg-gray-100 text-gray-700",
  };
  return classes[catValue] || "bg-gray-100 text-gray-700";
};

// تصفية المنتجات حسب القسم المختار
const filteredProductsByCategory = computed(() => {
  if (activeCategory.value === "all") return products.value;
  return products.value.filter((p) => p.category === activeCategory.value);
});

// تصفية المشتريات حسب القسم
const filteredPurchases = computed(() => {
  if (activeCategory.value === "all") return purchases.value;
  return purchases.value.filter((p) => p.category === activeCategory.value);
});

// إجمالي المشتريات حسب القسم
const categoryTotals = computed(() => {
  const totals = { electrical: 0, home: 0, plastic: 0, external: 0 };
  purchases.value.forEach((p) => {
    if (p.category === "electrical") totals.electrical += p.total_price || 0;
    else if (p.category === "home") totals.home += p.total_price || 0;
    else if (p.category === "plastic") totals.plastic += p.total_price || 0;
    else totals.external += p.total_price || 0;
  });
  return totals;
});

const calculatedTotal = computed(() => {
  return (form.value.quantity || 0) * (form.value.unit_price || 0);
});

const todayTotal = computed(() => {
  const today = new Date().toDateString();
  return purchases.value
    .filter((p) => new Date(p.purchase_date).toDateString() === today)
    .reduce((sum, p) => sum + p.total_price, 0);
});

const monthTotal = computed(() => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  return purchases.value
    .filter((p) => {
      const date = new Date(p.purchase_date);
      return (
        date.getMonth() === currentMonth && date.getFullYear() === currentYear
      );
    })
    .reduce((sum, p) => sum + p.total_price, 0);
});

const formatNumber = (num) => {
  if (!num && num !== 0) return "0";
  return num.toLocaleString("ar-EG");
};

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("ar-EG");
};

const getProductName = (id) => {
  const product = products.value.find((p) => p.id === id);
  return product?.name || "منتج غير معروف";
};

// ✅ جلب المنتجات
const loadProducts = async () => {
  try {
    const { data } = await supabase.from("products").select("*").order("name");
    products.value = data || [];
  } catch (error) {
    console.error("Error loading products:", error);
    showToast("❌ حدث خطأ في تحميل المنتجات", "error");
  }
};

// ✅ جلب المشتريات
const loadPurchases = async () => {
  try {
    const { data } = await supabase
      .from("purchases")
      .select("*")
      .order("purchase_date", { ascending: false });

    purchases.value = (data || []).map((p) => {
      const product = products.value.find((pr) => pr.id === p.product_id);
      return {
        ...p,
        category: product?.category || "plastic",
        product_name: product?.name || p.product_name,
      };
    });
  } catch (error) {
    console.error("Error loading purchases:", error);
    showToast("❌ حدث خطأ في تحميل المشتريات", "error");
  }
};

// ✅ إضافة منتج جديد إلى قاعدة البيانات
const addNewProductToDB = async (productData) => {
  const { data, error } = await supabase
    .from("products")
    .insert([productData])
    .select();

  if (error) {
    console.error("Error adding product:", error);
    showToast("❌ خطأ في إضافة المنتج: " + error.message, "error");
    return null;
  }
  return data?.[0] || null;
};

// ✅ إضافة شراء فردي
const addSinglePurchase = async () => {
  let productId = form.value.product_id;
  let productCategory = null;
  let productName = null;

  if (addType.value === "new") {
    if (!newProduct.value.name) {
      showToast("⚠️ الرجاء إدخال اسم المنتج", "warning");
      return false;
    }
    if (!newProduct.value.category) {
      showToast("⚠️ الرجاء اختيار القسم", "warning");
      return false;
    }
    if (!newProduct.value.price || newProduct.value.price <= 0) {
      showToast("⚠️ الرجاء إدخال سعر بيع صحيح", "warning");
      return false;
    }

    const productData = {
      name: newProduct.value.name,
      category: newProduct.value.category,
      sub_category: newProduct.value.sub_category || null,
      brand: newProduct.value.brand || null,
      price: newProduct.value.price,
      purchase_price: newProduct.value.purchase_price || 0,
      stock: 0,
      created_at: new Date().toISOString(),
    };

    const newProd = await addNewProductToDB(productData);
    if (!newProd) return false;
    productId = newProd.id;
    productCategory = newProd.category;
    productName = newProd.name;
    await loadProducts();
  } else {
    if (!form.value.product_id) {
      showToast("⚠️ الرجاء اختيار منتج", "warning");
      return false;
    }
    const selectedProduct = products.value.find(
      (p) => p.id === form.value.product_id,
    );
    productCategory = selectedProduct?.category;
    productName = selectedProduct?.name;
  }

  if (!form.value.quantity || form.value.quantity <= 0) {
    showToast("⚠️ الكمية غير صحيحة", "warning");
    return false;
  }
  if (!form.value.unit_price || form.value.unit_price <= 0) {
    showToast("⚠️ سعر الشراء غير صحيح", "warning");
    return false;
  }

  const total = (form.value.quantity || 0) * (form.value.unit_price || 0);

  const { error: purchaseError } = await supabase.from("purchases").insert([
    {
      product_id: productId,
      quantity: parseInt(form.value.quantity),
      unit_price: parseFloat(form.value.unit_price),
      total_price: total,
      supplier_name: form.value.supplier_name || null,
      invoice_number: form.value.invoice_number || null,
      purchase_date: new Date(),
      product_name: productName,
    },
  ]);

  if (purchaseError) throw purchaseError;

  const currentProduct = products.value.find((p) => p.id === productId);
  const currentStock = currentProduct?.stock || 0;
  const newStock = currentStock + parseInt(form.value.quantity);

  await supabase
    .from("products")
    .update({
      stock: newStock,
      purchase_price: form.value.unit_price,
    })
    .eq("id", productId);

  return true;
};

// ✅ إضافة فاتورة كاملة
const addBulkPurchase = async () => {
  if (!bulkInvoice.value.invoice_number) {
    showToast("⚠️ الرجاء إدخال رقم الفاتورة", "warning");
    return false;
  }
  if (!bulkInvoice.value.supplier_name) {
    showToast("⚠️ الرجاء إدخال اسم المورد", "warning");
    return false;
  }
  if (!bulkInvoice.value.category) {
    showToast("⚠️ الرجاء اختيار القسم", "warning");
    return false;
  }
  if (bulkInvoice.value.items.length === 0) {
    showToast("⚠️ الرجاء إضافة منتجات للفاتورة", "warning");
    return false;
  }

  for (const item of bulkInvoice.value.items) {
    if (!item.quantity || item.quantity <= 0) {
      showToast("⚠️ الكمية غير صحيحة لأحد المنتجات", "warning");
      return false;
    }
    if (!item.unit_price || item.unit_price <= 0) {
      showToast("⚠️ سعر الشراء غير صحيح لأحد المنتجات", "warning");
      return false;
    }

    let productId = item.product_id;
    let productName = "";

    if (item.type === "new") {
      if (!item.newProductName) {
        showToast("⚠️ الرجاء إدخال اسم المنتج الجديد", "warning");
        return false;
      }
      if (!item.selling_price || item.selling_price <= 0) {
        showToast("⚠️ الرجاء إدخال سعر بيع للمنتج الجديد", "warning");
        return false;
      }

      // 🔥 استخدام القسم المحدد للفاتورة
      const productData = {
        name: item.newProductName,
        category: bulkInvoice.value.category, // ← القسم المحدد
        sub_category: null,
        brand: null,
        price: item.selling_price,
        purchase_price: item.unit_price,
        stock: 0,
        created_at: new Date().toISOString(),
      };

      const newProd = await addNewProductToDB(productData);
      if (!newProd) return false;
      productId = newProd.id;
      productName = newProd.name;
    } else {
      if (!item.product_id) {
        showToast("⚠️ الرجاء اختيار منتج", "warning");
        return false;
      }
      const selectedProduct = products.value.find(
        (p) => p.id === item.product_id,
      );
      productName = selectedProduct?.name;
    }

    const total = (item.quantity || 0) * (item.unit_price || 0);

    const { error: purchaseError } = await supabase.from("purchases").insert([
      {
        product_id: productId,
        quantity: parseInt(item.quantity),
        unit_price: parseFloat(item.unit_price),
        total_price: total,
        supplier_name: bulkInvoice.value.supplier_name,
        invoice_number: bulkInvoice.value.invoice_number,
        purchase_date: new Date(),
        product_name: productName,
      },
    ]);

    if (purchaseError) throw purchaseError;

    const currentProduct = products.value.find((p) => p.id === productId);
    const currentStock = currentProduct?.stock || 0;
    const newStock = currentStock + parseInt(item.quantity);

    await supabase
      .from("products")
      .update({
        stock: newStock,
        purchase_price: item.unit_price,
      })
      .eq("id", productId);
  }

  return true;
};

// ✅ إضافة شراء (الرئيسية)
const addPurchase = async () => {
  if (!userStore.canEdit) {
    showToast("⚠️ ليس لديك صلاحية لإضافة مشتريات", "warning");
    return;
  }

  adding.value = true;

  try {
    let success = false;

    if (addType.value === "bulk") {
      success = await addBulkPurchase();
    } else {
      success = await addSinglePurchase();
    }

    if (!success) {
      adding.value = false;
      return;
    }

    showToast("✅ تم إضافة الفاتورة بنجاح", "success");

    showAddModal.value = false;
    form.value = {
      product_id: "",
      quantity: 1,
      unit_price: 0,
      supplier_name: "",
      invoice_number: "",
    };
    newProduct.value = {
      name: "",
      category: "",
      sub_category: "",
      brand: "",
      price: 0,
      purchase_price: 0,
    };
    bulkInvoice.value = {
      invoice_number: "",
      supplier_name: "",
      category: "plastic",
      items: [],
    };
    addType.value = "existing";

    await loadPurchases();
    await loadProducts();
  } catch (error) {
    console.error("Error:", error);
    showToast("❌ خطأ: " + error.message, "error");
  } finally {
    adding.value = false;
  }
};

// ✅ حذف شراء
const deletePurchase = async (id) => {
  if (!userStore.canEdit) {
    showToast("⚠️ ليس لديك صلاحية لحذف المشتريات", "warning");
    return;
  }

  if (!confirm("هل أنت متأكد من حذف هذه الفاتورة؟")) return;

  const purchase = purchases.value.find((p) => p.id === id);

  try {
    const { error } = await supabase.from("purchases").delete().eq("id", id);
    if (error) throw error;

    if (purchase) {
      const product = products.value.find((p) => p.id === purchase.product_id);
      if (product) {
        const newStock = Math.max(0, (product.stock || 0) - purchase.quantity);
        await supabase
          .from("products")
          .update({ stock: newStock })
          .eq("id", purchase.product_id);
      }
    }

    showToast("✅ تم حذف الفاتورة بنجاح", "success");
    await loadPurchases();
    await loadProducts();
  } catch (error) {
    console.error("Delete error:", error);
    showToast("❌ خطأ في الحذف: " + error.message, "error");
  }
};

onMounted(async () => {
  await loadProducts();
  await loadPurchases();
});
</script>

<style scoped>
@media (max-width: 640px) {
  select,
  input {
    font-size: 16px !important;
  }
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}
</style>
