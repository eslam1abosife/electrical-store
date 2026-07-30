<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-3 md:p-6 font-sans" dir="rtl">
    <!-- Header -->
    <div class="max-w-7xl mx-auto mb-4 md:mb-6">
      <div class="bg-white rounded-2xl shadow-xl p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-slate-100">
        <div class="flex items-center gap-3">
          <div class="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-2xl shadow-lg">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
          </div>
          <div>
            <h1 class="text-xl md:text-2xl font-bold text-slate-800">بيع من المعرض</h1>
            <p class="text-xs md:text-sm text-slate-500">تسجيل مبيعات المعرض - كاش أو تقسيط</p>
          </div>
        </div>
        <div class="flex gap-2 flex-wrap w-full md:w-auto">
          <button
            v-if="userStore?.canEdit"
            @click="openBrideChecklistModal"
            class="flex-1 md:flex-none bg-gradient-to-r from-rose-500 to-pink-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
          >
            <span>👰</span> تحميل كشف عروسة
          </button>
          <button
            v-if="userStore?.canEdit"
            @click="clearAllCart"
            class="flex-1 md:flex-none bg-slate-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-700 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            مسح الكل
          </button>
        </div>
      </div>
    </div>

    <!-- Bride Checklist Modal -->
    <div
      v-if="showBrideModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="showBrideModal = false"
    >
      <div class="bg-white rounded-3xl w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl animate-fadeIn">
        <div class="p-5 border-b flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-3xl">
          <h2 class="text-xl font-bold flex items-center gap-2">
            <span>👰</span> اختيار كشف عروسة
          </h2>
          <button @click="showBrideModal = false" class="w-8 h-8 rounded-full hover:bg-slate-100 transition-colors text-2xl">
            &times;
          </button>
        </div>
        <div class="p-5">
          <div v-if="savedChecklists.length === 0" class="text-center py-12 text-slate-400">
            <span class="text-6xl block mb-4">📋</span>
            <p>لا توجد كشوفات محفوظة</p>
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="checklist in savedChecklists"
              :key="checklist.id"
              class="border-2 rounded-2xl p-4 hover:border-rose-400 hover:shadow-lg cursor-pointer transition-all duration-300 group"
              @click="loadChecklistToCart(checklist.id)"
            >
              <div class="flex justify-between items-center">
                <div>
                  <p class="font-semibold text-lg group-hover:text-rose-600 transition-colors">{{ checklist.bride_name }}</p>
                  <p class="text-xs text-slate-500 flex items-center gap-2 mt-1">
                    <span>📅 {{ formatDate(checklist.checklist_date) }}</span>
                    <span class="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span>🛍️ {{ checklist.total_items }} منتج</span>
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-emerald-600 font-bold text-lg">{{ formatNumber(checklist.total_amount) }} ج</p>
                  <p class="text-xs text-slate-400">الإجمالي</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
      <!-- Products Section - 8 columns -->
      <div class="lg:col-span-8 bg-white rounded-2xl shadow-xl p-4 md:p-6 border border-slate-100">
        <!-- Section Header -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
          <h2 class="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2">
            <span class="bg-blue-50 p-2 rounded-xl">📦</span>
            إضافة منتجات
          </h2>
          <div v-if="cart.length > 0" class="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2">
            <span class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            {{ cart.length }} منتج
          </div>
        </div>

        <!-- Search Bar -->
        <div class="relative mb-4">
          <div class="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="🔍 بحث عن منتج..."
            class="w-full p-3 pr-10 border-2 border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300"
          />
        </div>

        <!-- Main Categories Tabs -->
        <div class="flex gap-1 flex-wrap mb-4 border-b-2 border-slate-100">
          <button
            v-for="cat in mainCategories"
            :key="cat.value"
            @click="activeMainCategory = cat.value; activeSubCategory = null; searchQuery = ''"
            class="px-4 py-2.5 font-semibold transition-all duration-300 text-sm md:text-base relative rounded-t-xl"
            :class="[
              activeMainCategory === cat.value 
                ? 'text-blue-600 bg-blue-50/50' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            ]"
          >
            <span class="ml-1.5">{{ cat.icon }}</span>
            {{ cat.name }}
            <span 
              v-if="activeMainCategory === cat.value" 
              class="absolute -bottom-[2px] left-0 right-0 h-0.5 bg-blue-600 rounded-full"
            ></span>
          </button>
        </div>

        <!-- Sub Categories Grid -->
        <div v-if="activeMainCategory" class="mb-4">
          <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1.5">
            <button
              v-for="(subCat, key) in getSubCategories(activeMainCategory)"
              :key="key"
              @click="activeSubCategory = key; selectedProductId = ''; searchQuery = ''"
              class="p-2.5 rounded-xl text-center transition-all duration-300 border-2 group relative"
              :class="[
                activeSubCategory === key 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
              ]"
            >
              <span class="text-xl md:text-2xl block group-hover:scale-110 transition-transform">{{ subCat.icon }}</span>
              <span class="text-[10px] md:text-xs font-medium block mt-1 leading-tight">{{ subCat.name }}</span>
              <div v-if="activeSubCategory === key" class="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
            </button>
          </div>
        </div>

        <!-- Product Selection -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div class="sm:col-span-2">
            <select
              v-model="selectedProductId"
              class="w-full p-3 border-2 border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 appearance-none bg-white pr-3 pl-10"
            >
              <option value="" class="text-slate-400">-- اختر منتج --</option>
              <option
                v-for="p in filteredProducts"
                :key="p.id"
                :value="p.id"
                :disabled="p.stock <= 0"
                class="py-2"
              >
                {{ p.name }} 
                <span class="text-slate-400">-</span> 
                <span class="font-bold">{{ formatNumber(p.price) }} ج</span>
                <span class="text-slate-400 text-sm mr-2">
                  ({{ p.stock }} قطعة)
                </span>
                <span v-if="p.stock <= 0" class="text-rose-500 mr-2">❌ غير متوفر</span>
              </option>
            </select>
          </div>
          <div class="flex gap-2">
            <div class="flex-1 flex items-center border-2 border-slate-200 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 transition-all duration-300">
              <button 
                @click="productQuantity = Math.max(1, productQuantity - 1)"
                class="px-3 py-2.5 bg-slate-50 hover:bg-slate-100 transition-colors text-slate-600 font-bold"
              >
                -
              </button>
              <input
                v-model.number="productQuantity"
                type="number"
                min="1"
                :max="maxAvailableQuantity"
                class="w-full p-2 text-center text-sm outline-none"
              />
              <button 
                @click="productQuantity = Math.min(maxAvailableQuantity, productQuantity + 1)"
                class="px-3 py-2.5 bg-slate-50 hover:bg-slate-100 transition-colors text-slate-600 font-bold"
              >
                +
              </button>
            </div>
            <button
              v-if="userStore?.canEdit"
              @click="addToCart"
              :disabled="!selectedProductId || selectedProductStock <= 0"
              class="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap font-semibold flex items-center gap-1"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              إضافة
            </button>
          </div>
        </div>

        <!-- Stock Info -->
        <div
          v-if="selectedProductId && selectedProductStock !== null"
          class="mb-4 p-3 rounded-xl transition-all duration-300"
          :class="selectedProductStock < 10 ? 'bg-amber-50 border-2 border-amber-200' : 'bg-emerald-50 border-2 border-emerald-200'"
        >
          <div class="flex justify-between items-center">
            <span class="text-sm text-slate-600 flex items-center gap-2">
              <span>📦</span> المخزون المتبقي:
            </span>
            <div class="flex items-center gap-3">
              <span
                :class="selectedProductStock < 10 ? 'text-amber-600' : 'text-emerald-600'"
                class="text-lg font-bold"
              >
                {{ selectedProductStock }} قطعة
              </span>
              <span v-if="selectedProductStock < 10" class="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full flex items-center gap-1">
                <span class="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                شارف يخلص
              </span>
            </div>
          </div>
        </div>

        <!-- Cart Items -->
        <div class="border-2 border-slate-200 rounded-xl overflow-hidden">
          <!-- Mobile View -->
          <div class="block md:hidden divide-y divide-slate-100">
            <div v-for="(item, index) in cart" :key="index" class="p-4 hover:bg-slate-50 transition-colors">
              <div class="flex justify-between items-start mb-3">
                <span class="font-medium text-sm">{{ item.name }}</span>
                <button
                  v-if="userStore?.canEdit"
                  @click="removeFromCart(index)"
                  class="text-rose-500 hover:text-rose-700 transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span class="text-slate-500 block mb-1">الكمية</span>
                  <div class="flex items-center gap-1">
                    <button
                      @click="item.quantity = Math.max(1, item.quantity - 1); updateCart()"
                      class="w-8 h-8 border-2 border-slate-200 rounded-lg hover:bg-slate-100 transition-colors font-bold"
                    >
                      -
                    </button>
                    <input
                      v-model.number="item.quantity"
                      @change="validateCartItemQuantity(item, index)"
                      type="number"
                      min="1"
                      :max="item.stock"
                      class="w-14 text-center p-1 border-2 border-slate-200 rounded-lg text-sm"
                    />
                    <button
                      @click="item.quantity = Math.min(item.stock, item.quantity + 1); updateCart()"
                      class="w-8 h-8 border-2 border-slate-200 rounded-lg hover:bg-slate-100 transition-colors font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div>
                  <span class="text-slate-500 block mb-1">السعر</span>
                  <span class="font-medium">{{ formatNumber(item.price) }} ج</span>
                </div>
                <div class="col-span-2">
                  <span class="text-slate-500 block mb-1">الإجمالي</span>
                  <span class="font-bold text-emerald-600">{{ formatNumber(item.price * item.quantity) }} ج</span>
                </div>
              </div>
            </div>
            <div v-if="cart.length === 0" class="text-center py-16 text-slate-400">
              <svg class="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              <p class="font-medium">لا توجد منتجات مضافة</p>
              <p class="text-xs mt-1">ابدأ بإضافة منتجات من القائمة</p>
            </div>
          </div>

          <!-- Desktop View -->
          <div class="hidden md:block overflow-x-auto">
            <table class="w-full">
              <thead class="bg-slate-50 border-b-2 border-slate-200">
                <tr>
                  <th class="p-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">المنتج</th>
                  <th class="p-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">الكمية</th>
                  <th class="p-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">السعر</th>
                  <th class="p-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">الإجمالي</th>
                  <th class="p-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in cart" :key="index" class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td class="p-3 text-sm font-medium">{{ item.name }}</td>
                  <td class="p-3">
                    <div class="flex items-center gap-1">
                      <button
                        @click="item.quantity = Math.max(1, item.quantity - 1); updateCart()"
                        class="w-8 h-8 border-2 border-slate-200 rounded-lg hover:bg-slate-100 transition-colors font-bold"
                      >
                        -
                      </button>
                      <input
                        v-model.number="item.quantity"
                        @change="validateCartItemQuantity(item, index)"
                        type="number"
                        min="1"
                        :max="item.stock"
                        class="w-16 text-center p-1.5 border-2 border-slate-200 rounded-lg text-sm"
                      />
                      <button
                        @click="item.quantity = Math.min(item.stock, item.quantity + 1); updateCart()"
                        class="w-8 h-8 border-2 border-slate-200 rounded-lg hover:bg-slate-100 transition-colors font-bold"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td class="p-3 text-sm">{{ formatNumber(item.price) }} ج</td>
                  <td class="p-3 text-sm font-semibold text-emerald-600">{{ formatNumber(item.price * item.quantity) }} ج</td>
                  <td class="p-3">
                    <button
                      v-if="userStore?.canEdit"
                      @click="removeFromCart(index)"
                      class="text-rose-500 hover:text-rose-700 transition-colors"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </td>
                </tr>
                <tr v-if="cart.length === 0">
                  <td colspan="5" class="text-center py-16 text-slate-400">
                    <svg class="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                    <p class="font-medium">لا توجد منتجات مضافة</p>
                    <p class="text-xs mt-1">ابدأ بإضافة منتجات من القائمة</p>
                  </td>
                </tr>
              </tbody>
              <tfoot class="bg-gradient-to-r from-slate-50 to-slate-100 border-t-2 border-slate-200">
                <tr>
                  <td colspan="3" class="p-3 font-bold text-slate-800 text-base">الإجمالي الكلي</td>
                  <td class="p-3 font-bold text-emerald-600 text-xl">{{ formatNumber(totalPrice) }} ج</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- Loaded Bride Info -->
        <div v-if="loadedBrideInfo" class="mt-4 p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl border-2 border-rose-200">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <p class="text-xs text-rose-600 font-semibold flex items-center gap-1.5">
                <span>📋</span> كشف عروسة محمل
              </p>
              <p class="font-semibold text-sm">{{ loadedBrideInfo.name }}</p>
              <p class="text-xs text-slate-500 mt-0.5">📱 {{ loadedBrideInfo.phone || '---' }}</p>
            </div>
            <button
              v-if="userStore?.canEdit"
              @click="clearLoadedBride"
              class="text-rose-500 hover:text-rose-700 transition-colors text-sm font-semibold flex items-center gap-1"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
              إلغاء
            </button>
          </div>
        </div>
      </div>

      <!-- Customer & Payment Section - 4 columns -->
      <div class="lg:col-span-4 bg-white rounded-2xl shadow-xl p-4 md:p-6 border border-slate-100">
        <h2 class="text-lg md:text-xl font-bold text-slate-800 mb-5 flex items-center gap-2">
          <span class="bg-emerald-50 p-2 rounded-xl">👤</span>
          بيانات العميل
        </h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1.5">
              اسم العميل <span class="text-rose-500">*</span>
            </label>
            <input
              v-model="customer.name"
              type="text"
              required
              class="w-full p-3 border-2 border-slate-200 rounded-xl text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all duration-300"
              placeholder="أدخل اسم العميل"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1.5">رقم الهاتف</label>
            <input
              v-model="customer.phone"
              type="tel"
              class="w-full p-3 border-2 border-slate-200 rounded-xl text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all duration-300"
              placeholder="رقم الهاتف"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1.5">اسم البائع</label>
            <input
              v-model="customer.cashier_name"
              type="text"
              placeholder="اسم الموظف"
              class="w-full p-3 border-2 border-slate-200 rounded-xl text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all duration-300"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1.5">طريقة الدفع</label>
            <div class="grid grid-cols-3 gap-2">
              <button
                @click="customer.payment_method = 'cash'; onPaymentMethodChange()"
                class="p-2.5 rounded-xl text-sm font-semibold transition-all duration-300 border-2"
                :class="customer.payment_method === 'cash' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 hover:border-emerald-300 text-slate-600'"
              >
                <span class="block text-xl">💰</span>
                كاش
              </button>
              <button
                @click="customer.payment_method = 'card'; onPaymentMethodChange()"
                class="p-2.5 rounded-xl text-sm font-semibold transition-all duration-300 border-2"
                :class="customer.payment_method === 'card' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-blue-300 text-slate-600'"
              >
                <span class="block text-xl">💳</span>
                بطاقة
              </button>
              <button
                @click="customer.payment_method = 'installments'; onPaymentMethodChange()"
                class="p-2.5 rounded-xl text-sm font-semibold transition-all duration-300 border-2"
                :class="customer.payment_method === 'installments' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-200 hover:border-purple-300 text-slate-600'"
              >
                <span class="block text-xl">📅</span>
                تقسيط
              </button>
            </div>
          </div>

          <!-- Installments Section -->
          <div v-if="customer.payment_method === 'installments'" class="border-t-2 border-purple-100 pt-4 mt-2 animate-fadeIn">
            <h3 class="font-semibold text-md mb-3 text-purple-700 flex items-center gap-2">
              <span>📋</span> تفاصيل التقسيط
            </h3>
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1.5">الدفعة المقدمة (المقدم) *</label>
                <input
                  v-model.number="installments.down_payment"
                  type="number"
                  min="0"
                  :max="totalPrice"
                  @input="calculateInstallment"
                  class="w-full p-3 border-2 border-slate-200 rounded-xl text-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-300"
                  placeholder="المبلغ المدفوع مقدماً"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1.5">عدد الشهور *</label>
                <input
                  v-model.number="installments.months"
                  type="number"
                  min="1"
                  max="36"
                  @input="calculateInstallment"
                  class="w-full p-3 border-2 border-slate-200 rounded-xl text-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-300"
                  placeholder="عدد شهور التقسيط"
                />
              </div>
              <div class="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border-2 border-purple-200">
                <div class="flex justify-between items-center py-1.5 border-b border-purple-100">
                  <span class="text-sm text-slate-600">إجمالي المبلغ</span>
                  <span class="font-bold">{{ formatNumber(totalPrice) }} ج</span>
                </div>
                <div class="flex justify-between items-center py-1.5 border-b border-purple-100">
                  <span class="text-sm text-slate-600">المدفوع مقدماً</span>
                  <span class="font-bold text-emerald-600">{{ formatNumber(installments.down_payment || 0) }} ج</span>
                </div>
                <div class="flex justify-between items-center py-1.5 border-b border-purple-100">
                  <span class="text-sm text-slate-600">المتبقي</span>
                  <span class="font-bold text-amber-600">{{ formatNumber(remainingAmount) }} ج</span>
                </div>
                <div class="flex justify-between items-center pt-2.5">
                  <span class="text-sm font-semibold text-slate-700">القسط الشهري</span>
                  <span class="font-bold text-purple-700 text-lg">{{ formatNumber(installments.monthly_payment) }} ج</span>
                </div>
                <div class="text-xs text-slate-500 mt-2 text-center bg-white/50 rounded-lg p-1.5">
                  على {{ installments.months || 0 }} شهر
                </div>
              </div>
            </div>
          </div>

          <button
            v-if="userStore?.canEdit"
            @click="completeSale"
            :disabled="cart.length === 0 || !customer.name || isProcessing"
            class="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-3.5 rounded-xl hover:shadow-xl hover:scale-[1.01] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base font-bold flex items-center justify-center gap-2 relative"
          >
            <svg v-if="!isProcessing" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <svg v-else class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isProcessing ? 'جاري المعالجة...' : 'تأكيد البيع وطباعة الفاتورة' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <ToastNotification v-model:toast="toast" />

    <!-- Invoice Modal - Professional Design -->
    <div
      v-if="showInvoiceModal"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
      @click.self="closeInvoiceModal"
    >
      <div class="bg-white rounded-3xl max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl animate-fadeIn">
        <!-- Modal Header -->
        <div class="sticky top-0 bg-white border-b p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 z-10 rounded-t-3xl">
          <h2 class="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>🧾</span> فاتورة البيع
          </h2>
          <div class="flex gap-2 w-full sm:w-auto">
            <button
              @click="printInvoiceFromModal"
              class="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-xl text-sm hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
              </svg>
              طباعة
            </button>
            <button
              @click="closeInvoiceModal"
              class="flex-1 sm:flex-none bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-sm hover:bg-slate-200 transition-all duration-300"
            >
              ✕ إغلاق
            </button>
          </div>
        </div>

        <!-- Invoice Content - Professional Design -->
        <div id="invoice-content" class="p-6 md:p-8" style="direction: rtl; font-family: 'Cairo', 'Tahoma', sans-serif;">
          <!-- Header -->
          <div class="text-center border-b-2 border-slate-200 pb-5 mb-5">
            <!-- Logo & Shop Name -->
            <div class="flex items-center justify-center gap-3 mb-2">
              <div class="bg-gradient-to-br from-blue-700 to-blue-500 p-3 rounded-2xl shadow-lg">
                <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
              </div>
              <div>
                <h1 class="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-500">جولدن</h1>
                <p class="text-base font-semibold text-slate-600">للأجهزة الكهربائية والأدوات المنزلية</p>
              </div>
            </div>
            <p class="text-sm text-slate-500 mt-1">📍 طنطا - سبرباي - أمام المدينه الجامعيه</p>
            <p class="text-sm text-slate-500">📞 للتواصل: 01034003002</p>
            
            <!-- Invoice Details -->
            <div class="flex flex-col sm:flex-row justify-between items-center gap-2 mt-4 pt-3 border-t border-slate-200">
              <span class="text-sm font-semibold text-slate-700">رقم الفاتورة: <span class="text-blue-600">#{{ invoiceNumber }}</span></span>
              <span class="text-sm font-semibold text-slate-700">التاريخ: <span class="text-slate-800">{{ currentDate }}</span></span>
            </div>
          </div>

          <!-- Customer & Payment Info -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div class="bg-gradient-to-r from-blue-50 to-white p-4 rounded-2xl border-r-4 border-blue-500">
              <h3 class="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">بيانات العميل</h3>
              <div class="space-y-1 text-sm">
                <div><span class="text-slate-500">👤 الاسم:</span> <span class="font-semibold">{{ customer.name }}</span></div>
                <div><span class="text-slate-500">📱 الهاتف:</span> <span>{{ customer.phone || '---' }}</span></div>
                <div><span class="text-slate-500">👨‍💼 البائع:</span> <span>{{ customer.cashier_name || userStore?.user?.email || '---' }}</span></div>
              </div>
            </div>
            <div class="bg-gradient-to-r from-emerald-50 to-white p-4 rounded-2xl border-r-4 border-emerald-500">
              <h3 class="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">بيانات الدفع</h3>
              <div class="space-y-1 text-sm">
                <div>
                  <span class="text-slate-500">💰 طريقة الدفع:</span>
                  <span v-if="customer.payment_method === 'cash'" class="font-semibold text-emerald-600">كاش</span>
                  <span v-else-if="customer.payment_method === 'card'" class="font-semibold text-blue-600">بطاقة</span>
                  <span v-else-if="customer.payment_method === 'installments'" class="font-semibold text-purple-600">تقسيط</span>
                </div>
                <div><span class="text-slate-500">💵 الإجمالي:</span> <span class="font-bold text-emerald-600">{{ formatNumber(totalPrice) }} ج</span></div>
              </div>
            </div>
          </div>

          <!-- Products Table -->
          <div class="overflow-x-auto mb-5">
            <table class="w-full text-sm border-collapse">
              <thead>
                <tr class="bg-slate-100 border-b-2 border-slate-300">
                  <th class="p-2.5 text-center w-10">#</th>
                  <th class="p-2.5 text-right">المنتج</th>
                  <th class="p-2.5 text-center w-20">الكمية</th>
                  <th class="p-2.5 text-right w-28">السعر</th>
                  <th class="p-2.5 text-right w-32">الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in cart" :key="idx" class="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                  <td class="p-2.5 text-center">{{ idx + 1 }}</td>
                  <td class="p-2.5">{{ item.name }}</td>
                  <td class="p-2.5 text-center">{{ item.quantity }}</td>
                  <td class="p-2.5 text-right">{{ formatNumber(item.price) }} ج</td>
                  <td class="p-2.5 text-right font-semibold">{{ formatNumber(item.price * item.quantity) }} ج</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="border-t-2 border-slate-400 bg-slate-50">
                  <td colspan="4" class="p-3 font-bold text-right text-base">الإجمالي الكلي</td>
                  <td class="p-3 font-bold text-right text-emerald-600 text-xl">{{ formatNumber(totalPrice) }} ج</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Installment Details -->
          <div v-if="customer.payment_method === 'installments'" class="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-2xl mb-5 border-r-4 border-purple-500">
            <h4 class="font-bold text-purple-700 mb-2 text-sm flex items-center gap-2">
              <span>📅</span> تفاصيل التقسيط
            </h4>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div class="bg-white/50 p-2.5 rounded-xl">
                <span class="text-slate-500 block text-xs">المقدم</span>
                <strong class="text-emerald-600 text-lg">{{ formatNumber(installments.down_payment) }} ج</strong>
              </div>
              <div class="bg-white/50 p-2.5 rounded-xl">
                <span class="text-slate-500 block text-xs">المتبقي</span>
                <strong class="text-amber-600 text-lg">{{ formatNumber(remainingAmount) }} ج</strong>
              </div>
              <div class="bg-white/50 p-2.5 rounded-xl">
                <span class="text-slate-500 block text-xs">القسط الشهري</span>
                <strong class="text-purple-700 text-lg">{{ formatNumber(installments.monthly_payment) }} ج</strong>
              </div>
              <div class="bg-white/50 p-2.5 rounded-xl">
                <span class="text-slate-500 block text-xs">عدد الشهور</span>
                <strong class="text-purple-700 text-lg">{{ installments.months }} شهر</strong>
              </div>
            </div>
          </div>

          <!-- Bride Checklist Note -->
          <div v-if="loadedBrideInfo" class="bg-gradient-to-r from-rose-50 to-pink-50 p-3 rounded-2xl mb-5 text-sm text-rose-700 border-r-4 border-rose-400">
            📋 ملاحظة: هذا البيع مستند على كشف عروسة مسجل مسبقاً
          </div>

          <!-- Signatures -->
          <div class="grid grid-cols-2 gap-6 mb-5 pt-4 border-t border-slate-200">
            <div class="text-right">
              <p class="text-sm font-semibold text-slate-600">توقيع العميل</p>
              <div class="border-b-2 border-slate-300 mt-2 h-6"></div>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold text-slate-600">توقيع البائع</p>
              <div class="border-b-2 border-slate-300 mt-2 h-6"></div>
            </div>
          </div>

          <!-- Footer -->
          <div class="text-center bg-gradient-to-r from-slate-50 to-slate-100 p-5 rounded-2xl border-t-2 border-slate-200">
            <p class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600">✨ شكراً لتسوقكم من جولدن ✨</p>
            <div class="flex flex-wrap items-center justify-center gap-3 mt-2">
              <span class="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">🛡️ ضمان سنة كاملة</span>
              <span class="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">🚚 توصيل سريع</span>
              <span class="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full">🔒 دفع آمن</span>
            </div>
            <p class="text-xs text-slate-500 mt-2">📞 للتواصل والاستفسار: 01034003002</p>
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

import { supabase } from '~/lib/supabase';
import { sendWhatsAppNotification } from '~/lib/wati';
import { sendEmailNotification } from '~/lib/email';

const userStore = useUserStore();

// Sub Category Map (نفس القائمة السابقة)
const subCategoryMap = {
  refrigerator: { name: "ثلاجة", icon: "🧊", mainCategory: "electrical" },
  freezer: { name: "ديب فريزر", icon: "❄️", mainCategory: "electrical" },
  washing_machine: { name: "غسالة ملابس", icon: "🧺", mainCategory: "electrical" },
  dryer: { name: "مجفف ملابس", icon: "👕", mainCategory: "electrical" },
  dishwasher: { name: "غسالة أطباق", icon: "🍽️", mainCategory: "electrical" },
  cooker: { name: "بوتاجاز", icon: "🔥", mainCategory: "electrical" },
  oven: { name: "فرن كهربائي", icon: "🔥", mainCategory: "electrical" },
  hood: { name: "شفاط مطبخ", icon: "💨", mainCategory: "electrical" },
  microwave: { name: "ميكروويف", icon: "📡", mainCategory: "electrical" },
  water_cooler: { name: "مبرد مياه", icon: "💧", mainCategory: "electrical" },
  air_conditioner: { name: "تكييف", icon: "❄️", mainCategory: "electrical" },
  fan: { name: "مروحة", icon: "🌀", mainCategory: "electrical" },
  heater: { name: "دفاية", icon: "🔥", mainCategory: "electrical" },
  tv: { name: "شاشة تلفزيون", icon: "📺", mainCategory: "electrical" },
  iron: { name: "مكواة", icon: "👔", mainCategory: "electrical" },
  vacuum_cleaner: { name: "مكنسة كهربائية", icon: "🧹", mainCategory: "electrical" },
  blender: { name: "خلاط", icon: "🥤", mainCategory: "electrical" },
  food_grinder: { name: "كبة طعام", icon: "🍖", mainCategory: "electrical" },
  mixer: { name: "مضرب بيض / عجان", icon: "🥚", mainCategory: "electrical" },
  hand_blender: { name: "هاند بلندر", icon: "🥤", mainCategory: "electrical" },
  food_processor: { name: "محضر طعام", icon: "🍳", mainCategory: "electrical" },
  air_fryer: { name: "قلاية بدون زيت", icon: "🍟", mainCategory: "electrical" },
  kettle: { name: "غلاية مياه", icon: "☕", mainCategory: "electrical" },
  sandwich_maker: { name: "صانع ساندوتشات", icon: "🥪", mainCategory: "electrical" },
  meat_grinder: { name: "مفرمة لحوم", icon: "🥩", mainCategory: "electrical" },
  china_set: { name: "طقم صيني", icon: "🍽️", mainCategory: "home" },
  arcopal_set: { name: "طقم أركوبال", icon: "🍽️", mainCategory: "home" },
  melamine_set: { name: "طقم ملامين", icon: "🍽️", mainCategory: "home" },
  archovale_set: { name: "طقم أرشوفال", icon: "🍽️", mainCategory: "home" },
  pyrex_set: { name: "طقم عشاء بايركس", icon: "🍽️", mainCategory: "home" },
  pot_set: { name: "طقم حلل", icon: "🍳", mainCategory: "home" },
  pan_set: { name: "طقم طاسات", icon: "🍳", mainCategory: "home" },
  oven_trays: { name: "طقم صواني فرن", icon: "🧊", mainCategory: "home" },
  pressure_cooker: { name: "حلة ضغط", icon: "🍲", mainCategory: "home" },
  casserole: { name: "طواجن", icon: "🍲", mainCategory: "home" },
  cutlery_set: { name: "طقم معالق وشوك", icon: "🍴", mainCategory: "home" },
  serving_set: { name: "طقم توزيع", icon: "🥄", mainCategory: "home" },
  glass_set: { name: "طقم كاسات", icon: "🥤", mainCategory: "home" },
  cup_set: { name: "طقم كوبايات", icon: "☕", mainCategory: "home" },
  tea_coffee_set: { name: "طقم شاي وقهوة", icon: "☕", mainCategory: "home" },
  thermos: { name: "ترمس مياه وشاي", icon: "🧴", mainCategory: "home" },
  serving_trays: { name: "صواني تقديم", icon: "🧊", mainCategory: "home" },
  spice_set: { name: "طقم توابل", icon: "🧂", mainCategory: "home" },
  dish_drainer: { name: "صفاية أطباق", icon: "🧺", mainCategory: "home" },
  plastic_table: { name: "ترابيزة بلاستيك", icon: "🪑", mainCategory: "plastic" },
  plastic_chair: { name: "كرسي بلاستيك", icon: "🪑", mainCategory: "plastic" },
  plastic_cabinet: { name: "دولاب بلاستيك", icon: "🗄️", mainCategory: "plastic" },
  plastic_drawers: { name: "تربو مطبخ", icon: "🗄️", mainCategory: "plastic" },
  laundry_basket: { name: "سبت غسيل", icon: "🧺", mainCategory: "plastic" },
  wash_basin: { name: "طبق غسيل", icon: "🛁", mainCategory: "plastic" },
  washing_bucket: { name: "جردل غسيل", icon: "🪣", mainCategory: "plastic" },
  mop_bucket: { name: "جردل بممسحة", icon: "🧹", mainCategory: "plastic" },
  trash_bin: { name: "سلة مهملات", icon: "🗑️", mainCategory: "plastic" },
  food_container: { name: "علب حفظ طعام", icon: "📦", mainCategory: "plastic" },
  plastic_bottle: { name: "شفشق بلاستيك", icon: "🧴", mainCategory: "plastic" },
  water_bottle: { name: "زجاجة مياه بلاستيك", icon: "💧", mainCategory: "plastic" },
  lunch_box: { name: "لانش بوكس", icon: "🥪", mainCategory: "plastic" },
  vegetable_basket: { name: "سبت خضار", icon: "🥬", mainCategory: "plastic" },
  cutting_board: { name: "بلانشة تقطيع", icon: "🔪", mainCategory: "plastic" },
  spoon_drainer: { name: "صفاية معالق", icon: "🍴", mainCategory: "plastic" },
  broom_dustpan: { name: "جاروف ومقشة", icon: "🧹", mainCategory: "plastic" },
  baby_bath: { name: "بانيو أطفال بلاستيك", icon: "🛁", mainCategory: "plastic" },
  plastic_plate: { name: "اطباق بلاستيك", icon: "🍽️", mainCategory: "plastic" },
  plastic_basin: { name: "حوض بلاستيك", icon: "🛁", mainCategory: "plastic" },
  plastic_laundry_basket: { name: "سلة غسيل بلاستيك", icon: "🧺", mainCategory: "plastic" },
  plastic_tool_box: { name: "علبة أدوات بلاستيك", icon: "🧰", mainCategory: "plastic" },
  plastic_storage_box: { name: "بستله بلاستيك", icon: "📦", mainCategory: "plastic" },
  plastic_ladle: { name: "مغرفة بلاستيك", icon: "🥄", mainCategory: "plastic" },
  plastic_strainer: { name: "مصفاة بلاستيك", icon: "🧊", mainCategory: "plastic" },
  baby_cup: { name: "مج بلاستيك للأطفال", icon: "🥤", mainCategory: "plastic" },
  baby_toy_basket: { name: "سلة ألعاب أطفال", icon: "🧸", mainCategory: "plastic" },
  baby_seat: { name: "مقعد أطفال بلاستيك", icon: "🪑", mainCategory: "plastic" },
  baby_chair: { name: "كرسي أطفال بلاستيك", icon: "🪑", mainCategory: "plastic" },
  baby_bath2: { name: "بوله بلاستيك", icon: "🍳", mainCategory: "plastic" },
};

const mainCategories = [
  { name: "الكهرباء", value: "electrical", icon: "⚡" },
  { name: "المنزلي", value: "home", icon: "🏠" },
  { name: "البلاستيك", value: "plastic", icon: "🪑" },
];

const toast = ref({ show: false, message: "", type: "success", icon: "✅" });
const isProcessing = ref(false);

const showToast = (message, type = "success") => {
  const icons = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" };
  toast.value = { show: true, message, type, icon: icons[type] || "✅" };
  setTimeout(() => { toast.value.show = false; }, 3000);
};

const activeMainCategory = ref("electrical");
const activeSubCategory = ref(null);
const searchQuery = ref("");
const products = ref([]);
const selectedProductId = ref("");
const productQuantity = ref(1);
const cart = ref([]);
const savedChecklists = ref([]);
const showBrideModal = ref(false);
const showInvoiceModal = ref(false);
const loadedBrideInfo = ref(null);

const installments = ref({
  down_payment: 0,
  months: 0,
  monthly_payment: 0,
});

const customer = ref({
  name: "",
  phone: "",
  cashier_name: "",
  payment_method: "cash",
});

const getSubCategories = (mainCategory) => {
  const subs = {};
  for (const [key, value] of Object.entries(subCategoryMap)) {
    if (value.mainCategory === mainCategory) {
      subs[key] = { name: value.name, icon: value.icon };
    }
  }
  return subs;
};

const remainingAmount = computed(() => {
  return Math.max(0, totalPrice.value - (installments.value.down_payment || 0));
});

const calculateInstallment = () => {
  if (installments.value.months > 0 && remainingAmount.value > 0) {
    installments.value.monthly_payment = Math.ceil(
      remainingAmount.value / installments.value.months
    );
  } else {
    installments.value.monthly_payment = 0;
  }
};

const onPaymentMethodChange = () => {
  if (customer.value.payment_method !== "installments") {
    installments.value = { down_payment: 0, months: 0, monthly_payment: 0 };
  }
};

const invoiceNumber = computed(() => {
  return Math.floor(Math.random() * 1000000).toString().padStart(6, "0");
});

const currentDate = computed(() => {
  const now = new Date();
  return now.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

const selectedProduct = computed(() => {
  return products.value.find((p) => p.id === selectedProductId.value);
});

const selectedProductStock = computed(() => {
  return selectedProduct.value?.stock || 0;
});

const maxAvailableQuantity = computed(() => {
  return selectedProductStock.value;
});

const filteredProducts = computed(() => {
  let filtered = products.value.filter((p) => {
    if (p.category !== activeMainCategory.value) return false;
    if (activeSubCategory.value) {
      return p.sub_category === activeSubCategory.value;
    }
    return true;
  });
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (p) => p.name.toLowerCase().includes(query) || p.brand?.toLowerCase().includes(query)
    );
  }
  return filtered;
});

const totalPrice = computed(() => {
  return cart.value.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

const closeInvoiceModal = () => {
  showInvoiceModal.value = false;
};

const printInvoiceFromModal = () => {
  const printContent = document.getElementById("invoice-content");
  if (!printContent) return;

  const originalTitle = document.title;
  document.title = `فاتورة_${customer.value.name}_${invoiceNumber.value}`;

  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <title>فاتورة بيع - جولدن</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Cairo', 'Tahoma', sans-serif; 
          margin: 0; 
          padding: 20px; 
          background: white; 
          direction: rtl;
        }
        .invoice-wrapper {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          padding: 30px;
          border-radius: 16px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .text-sm { font-size: 0.875rem; }
        .text-lg { font-size: 1.125rem; }
        .text-xl { font-size: 1.25rem; }
        .text-2xl { font-size: 1.5rem; }
        .text-4xl { font-size: 2.25rem; }
        .text-emerald-600 { color: #059669; }
        .text-blue-600 { color: #2563eb; }
        .text-purple-700 { color: #7c3aed; }
        .text-amber-600 { color: #d97706; }
        .text-slate-600 { color: #475569; }
        .text-slate-700 { color: #334155; }
        .text-slate-800 { color: #1e293b; }
        .bg-slate-50 { background-color: #f8fafc; }
        .bg-slate-100 { background-color: #f1f5f9; }
        .bg-blue-50 { background-color: #eff6ff; }
        .bg-emerald-50 { background-color: #ecfdf5; }
        .bg-purple-50 { background-color: #faf5ff; }
        .bg-gradient-to-r { background: linear-gradient(to right, var(--tw-gradient-from), var(--tw-gradient-to)); }
        .border-b-2 { border-bottom-width: 2px; }
        .border-slate-200 { border-color: #e2e8f0; }
        .border-slate-300 { border-color: #cbd5e1; }
        .border-slate-400 { border-color: #94a3b8; }
        .border-blue-500 { border-color: #3b82f6; }
        .border-emerald-500 { border-color: #10b981; }
        .border-purple-500 { border-color: #8b5cf6; }
        .border-r-4 { border-right-width: 4px; }
        .p-2 { padding: 0.5rem; }
        .p-2\.5 { padding: 0.625rem; }
        .p-3 { padding: 0.75rem; }
        .p-4 { padding: 1rem; }
        .p-5 { padding: 1.25rem; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mb-5 { margin-bottom: 1.25rem; }
        .mt-1 { margin-top: 0.25rem; }
        .mt-2 { margin-top: 0.5rem; }
        .mt-4 { margin-top: 1rem; }
        .pt-2 { padding-top: 0.5rem; }
        .pt-3 { padding-top: 0.75rem; }
        .pt-4 { padding-top: 1rem; }
        .rounded-2xl { border-radius: 1rem; }
        .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
        .grid { display: grid; }
        .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
        .grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
        .gap-3 { gap: 0.75rem; }
        .gap-4 { gap: 1rem; }
        .gap-6 { gap: 1.5rem; }
        .flex { display: flex; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .flex-wrap { flex-wrap: wrap; }
        .space-y-1 > * + * { margin-top: 0.25rem; }
        @media print { 
          body { padding: 0; } 
          .no-print { display: none; }
          .invoice-wrapper { box-shadow: none; padding: 20px; }
        }
        @media (max-width: 640px) {
          .grid-cols-2 { grid-template-columns: 1fr; }
          .grid-cols-4 { grid-template-columns: repeat(2, 1fr); }
          .text-4xl { font-size: 1.5rem; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-wrapper">
        ${printContent.outerHTML}
      </div>
      <div class="no-print" style="text-align: center; margin-top: 20px; direction: ltr;">
        <button onclick="window.print()" style="padding: 12px 24px; margin: 5px; cursor: pointer; border: none; background: #2563eb; color: white; border-radius: 12px; font-size: 16px; font-weight: bold;">🖨️ طباعة</button>
        <button onclick="window.close()" style="padding: 12px 24px; margin: 5px; cursor: pointer; border: none; background: #ef4444; color: white; border-radius: 12px; font-size: 16px; font-weight: bold;">❌ إغلاق</button>
      </div>
      <script>
        setTimeout(() => { window.print(); }, 1000);
      <\/script>
    </body>
    </html>
  `);
  printWindow.document.close();
  document.title = originalTitle;
};

const loadProducts = async () => {
  try {
    const { data } = await supabase.from("products").select("*").order("name");
    products.value = data || [];
  } catch (error) {
    console.error("Error loading products:", error);
    showToast("❌ حدث خطأ في تحميل المنتجات", "error");
  }
};

const loadSavedChecklists = async () => {
  try {
    const { data } = await supabase.from("bride_checklists").select("*").order("created_at", { ascending: false });
    savedChecklists.value = data || [];
  } catch (error) {
    console.error("Error loading saved checklists:", error);
  }
};

const openBrideChecklistModal = async () => {
  if (!userStore.canEdit) {
    showToast("⚠️ ليس لديك صلاحية لتحميل كشوفات العرائس", "warning");
    return;
  }
  await loadSavedChecklists();
  showBrideModal.value = true;
};

const loadChecklistToCart = async (checklistId) => {
  if (!userStore.canEdit) {
    showToast("⚠️ ليس لديك صلاحية لتحميل كشوفات العرائس", "warning");
    return;
  }

  try {
    const { data: checklist } = await supabase
      .from("bride_checklists")
      .select("*")
      .eq("id", checklistId)
      .single();

    const { data: items } = await supabase
      .from("bride_checklist_items")
      .select("*")
      .eq("checklist_id", checklistId);

    if (!items || items.length === 0) {
      showToast("⚠️ لا توجد منتجات في هذا الكشف", "warning");
      return;
    }

    loadedBrideInfo.value = {
      id: checklist.id,
      name: checklist.bride_name,
      phone: checklist.bride_phone,
      date: checklist.checklist_date,
      seller: checklist.seller_name,
    };

    const newCartItems = [];
    for (const item of items) {
      const product = products.value.find((p) => p.id === item.product_id);
      const stock = product?.stock || 0;

      if (stock < item.quantity) {
        showToast(`⚠️ المنتج "${item.product_name}" غير متوفر بالكمية المطلوبة (المتاح: ${stock})`, "warning");
        continue;
      }

      newCartItems.push({
        id: item.product_id || item.id,
        name: item.product_name,
        price: product?.price || item.price,
        quantity: item.quantity,
        stock: stock,
        isFromBrideChecklist: true,
      });
    }

    cart.value = newCartItems;

    if (checklist.bride_name) {
      customer.value.name = checklist.bride_name;
    }
    if (checklist.bride_phone) {
      customer.value.phone = checklist.bride_phone;
    }

    showBrideModal.value = false;
    showToast(`✅ تم تحميل كشف "${checklist.bride_name}" بنجاح`, "success");
  } catch (error) {
    console.error("Error loading checklist:", error);
    showToast("❌ حدث خطأ أثناء تحميل الكشف", "error");
  }
};

const clearLoadedBride = () => {
  if (!userStore.canEdit) {
    showToast("⚠️ ليس لديك صلاحية لمسح الكشف", "warning");
    return;
  }
  loadedBrideInfo.value = null;
  cart.value = [];
  customer.value = { name: "", phone: "", cashier_name: "", payment_method: "cash" };
  showToast("🗑️ تم إلغاء الكشف المحمل", "info");
};

const clearAllCart = () => {
  if (!userStore.canEdit) {
    showToast("⚠️ ليس لديك صلاحية لمسح السلة", "warning");
    return;
  }
  if (cart.value.length === 0) return;
  if (confirm("هل تريد مسح جميع المنتجات من السلة؟")) {
    cart.value = [];
    loadedBrideInfo.value = null;
    customer.value = { name: "", phone: "", cashier_name: "", payment_method: "cash" };
    installments.value = { down_payment: 0, months: 0, monthly_payment: 0 };
    showToast("🗑️ تم مسح السلة", "info");
  }
};

const validateCartItemQuantity = (item, index) => {
  if (item.quantity > item.stock) {
    item.quantity = item.stock;
    showToast(`⚠️ الكمية المطلوبة أكبر من المخزون المتاح (المتاح: ${item.stock})`, "warning");
  }
  if (item.quantity < 1) {
    item.quantity = 1;
  }
  updateCart();
};

const formatNumber = (num) => {
  if (!num && num !== 0) return "0";
  return num.toLocaleString("ar-EG") || "0";
};

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("ar-EG");
};

const addToCart = () => {
  if (!userStore.canEdit) {
    showToast("⚠️ ليس لديك صلاحية لإضافة منتجات", "warning");
    return;
  }

  if (!selectedProductId.value) {
    showToast("⚠️ اختر منتج أولاً", "warning");
    return;
  }

  if (productQuantity.value < 1) {
    showToast("⚠️ الكمية غير صحيحة", "warning");
    return;
  }

  const product = products.value.find((p) => p.id === selectedProductId.value);
  if (!product) return;

  if (product.stock < productQuantity.value) {
    showToast(`⚠️ المخزون غير كافٍ. المتوفر: ${product.stock} قطعة فقط`, "warning");
    return;
  }

  const existing = cart.value.find((i) => i.id === product.id);
  if (existing) {
    const newQuantity = existing.quantity + productQuantity.value;
    if (product.stock < newQuantity) {
      showToast(`⚠️ المخزون غير كافٍ. المتوفر: ${product.stock} قطعة فقط`, "warning");
      return;
    }
    existing.quantity = newQuantity;
    showToast(`✅ تم تحديث كمية ${product.name} إلى ${newQuantity}`, "success");
  } else {
    cart.value.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: productQuantity.value,
      stock: product.stock,
    });
    showToast(`✅ تم إضافة ${product.name} إلى السلة`, "success");
  }

  selectedProductId.value = "";
  productQuantity.value = 1;
};

const updateCart = () => {
  cart.value = [...cart.value];
};

const removeFromCart = (index) => {
  if (!userStore.canEdit) {
    showToast("⚠️ ليس لديك صلاحية لحذف المنتجات", "warning");
    return;
  }
  const item = cart.value[index];
  cart.value.splice(index, 1);
  showToast(`❌ تم إزالة ${item.name} من السلة`, "info");
};

// استبدل دالة completeSale بهذه النسخة المعدلة
const completeSale = async () => {
  if (!userStore.canEdit) {
    showToast("⚠️ ليس لديك صلاحية لإتمام عملية البيع", "warning");
    return;
  }

  if (cart.value.length === 0) {
    showToast("⚠️ لا توجد منتجات", "warning");
    return;
  }
  if (!customer.value.name) {
    showToast("⚠️ الرجاء إدخال اسم العميل", "warning");
    return;
  }

  if (customer.value.payment_method === "installments") {
    if (!installments.value.down_payment && installments.value.down_payment !== 0) {
      showToast("⚠️ الرجاء إدخال قيمة الدفعة المقدمة", "warning");
      return;
    }
    if (!installments.value.months || installments.value.months < 1) {
      showToast("⚠️ الرجاء إدخال عدد الشهور", "warning");
      return;
    }
    if (installments.value.down_payment > totalPrice.value) {
      showToast("⚠️ الدفعة المقدمة لا يمكن أن تزيد عن إجمالي المبلغ", "warning");
      return;
    }
  }

  let outOfStock = false;
  for (const item of cart.value) {
    const currentProduct = products.value.find((p) => p.id === item.id);
    if (currentProduct && currentProduct.stock < item.quantity) {
      showToast(`⚠️ المنتج "${item.name}" غير متوفر بالكمية المطلوبة (المتاح: ${currentProduct.stock})`, "warning");
      outOfStock = true;
    }
  }
  if (outOfStock) return;

  isProcessing.value = true;

  try {
    let notes = loadedBrideInfo.value ? `كشف عروسة ID: ${loadedBrideInfo.value.id}` : "";

    if (customer.value.payment_method === "installments") {
      const installmentDetails = `\n【تفاصيل التقسيط】
- الدفعة المقدمة: ${installments.value.down_payment} ج
- عدد الشهور: ${installments.value.months} شهر
- القسط الشهري: ${installments.value.monthly_payment} ج
- المتبقي: ${remainingAmount.value} ج`;

      notes = notes ? notes + installmentDetails : installmentDetails;
    }

    const orderData = {
      customer_name: customer.value.name,
      customer_phone: customer.value.phone || null,
      customer_address: loadedBrideInfo.value ? `كشف عروسة - ${loadedBrideInfo.value.name}` : "بيع من المعرض",
      items: cart.value.map((item) => ({
        product_id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      total_price: totalPrice.value,
      status: "delivered",
      payment_method: customer.value.payment_method,
      sale_type: "offline",
      cashier_name: customer.value.cashier_name || userStore.user?.email,
      order_date: new Date().toISOString(),
      notes: notes.trim() || null,
      down_payment: customer.value.payment_method === "installments" ? installments.value.down_payment || 0 : 0,
      remaining_amount: customer.value.payment_method === "installments" ? remainingAmount.value || 0 : 0,
      monthly_payment: customer.value.payment_method === "installments" ? installments.value.monthly_payment || 0 : 0,
      months: customer.value.payment_method === "installments" ? installments.value.months || 0 : 0
    };

    const { data: orderResult, error: orderError } = await supabase
      .from("orders")
      .insert([orderData])
      .select()
      .single();

    if (orderError) {
      showToast(`❌ خطأ: ${orderError.message}`, "error");
      isProcessing.value = false;
      return;
    }

    // ✅ إرسال إشعار إيميل
    await sendEmailForOrder(orderData);

    // إرسال باقي الإشعارات
    try {
      await sendWhatsAppNotification(orderResult);
      console.log('✅ تم إرسال إشعار واتساب');
    } catch (watiError) {
      console.error('⚠️ خطأ في إرسال إشعار واتساب:', watiError);
    }

    if (Notification.permission === 'granted') {
      new Notification('📦 طلب جديد من المعرض', {
        body: `العميل: ${orderData.customer_name} - المبلغ: ${formatNumber(orderData.total_price)} ج`,
        icon: '/favicon.ico',
        vibrate: [200, 100, 200]
      });
    }

    // تحديث المخزون
    for (const item of cart.value) {
      const product = products.value.find((p) => p.id === item.id);
      const newStock = Math.max(0, (product.stock || 0) - item.quantity);
      await supabase.from("products").update({ stock: newStock }).eq("id", item.id);
      product.stock = newStock;
    }

    showToast("✅ تم تسجيل البيع وإرسال الإشعارات بنجاح", "success");
    showInvoiceModal.value = true;
  } catch (error) {
    console.error('❌ خطأ:', error);
    showToast("❌ حدث خطأ غير متوقع", "error");
  } finally {
    isProcessing.value = false;
  }
};

// إرسال إشعار إيميل للفاتورة
const sendEmailForOrder = async (orderData) => {
  try {
    const { sendEmailNotification } = await import('~/lib/email');
    const result = await sendEmailNotification(orderData, 'order');
    if (result.success) {
      console.log('✅ تم إرسال الإيميل بنجاح');
    } else {
      console.error('⚠️ فشل إرسال الإيميل:', result.error);
    }
  } catch (error) {
    console.error('⚠️ خطأ في إرسال الإيميل:', error);
  }
};
const refreshAfterSale = async () => {
  cart.value = [];
  loadedBrideInfo.value = null;
  customer.value = { name: "", phone: "", cashier_name: "", payment_method: "cash" };
  installments.value = { down_payment: 0, months: 0, monthly_payment: 0 };
  await loadProducts();
};

watch(showInvoiceModal, (newVal) => {
  if (!newVal) {
    refreshAfterSale();
  }
});

onMounted(() => {
  loadProducts();
  loadSavedChecklists();
});
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@media (max-width: 640px) {
  select, input {
    font-size: 16px !important;
  }
}

button:active {
  transform: scale(0.97);
}

.fixed .overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}
.fixed .overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}
.fixed .overflow-y-auto::-webkit-scrollbar-thumb {
  background: #f43f5e;
  border-radius: 10px;
}

select option:disabled {
  color: #9ca3af;
  background-color: #f3f4f6;
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
}
</style>