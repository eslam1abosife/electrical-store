<template>
  <header dir="rtl"
    class="bg-white shadow-sm sticky top-0 z-50 border-b backdrop-blur-md"
  >
    <div class="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
      <div class="flex items-center justify-between gap-4">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-3 flex-shrink-0">
          <div
            class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl sm:rounded-3xl flex items-center justify-center text-2xl sm:text-4xl shadow-lg"
          >
            🏬
          </div>

          <div>
            <h1
              class="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-gray-900"
            >
              جولدن
            </h1>

            <p class="hidden sm:block text-xs text-amber-600 -mt-1">
              الأجهزة الكهربائية
            </p>
          </div>
        </NuxtLink>

        <!-- Desktop Search -->
        <div class="hidden lg:flex flex-1 max-w-2xl mx-6 relative">
          <div class="relative w-full">
            <input
              v-model="searchQuery"
              @input="onSearchInput"
              @focus="showResults = true"
              @keydown.down="moveSelectionDown"
              @keydown.up="moveSelectionUp"
              @keydown.enter="selectCurrentItem"
              placeholder="ابحث عن ثلاجة، غسالة..."
              class="w-full bg-gray-100 border border-gray-200 rounded-2xl lg:rounded-3xl py-3 lg:py-4 px-5 pl-12 lg:pl-14 text-sm lg:text-base focus:outline-none focus:border-blue-500"
            />

            <span
              class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl"
            >
              🔍
            </span>

            <div
              v-if="searchLoading"
              class="absolute left-4 top-1/2 -translate-y-1/2"
            >
              <div
                class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"
              ></div>
            </div>
          </div>

          <!-- Search Results -->
          <div
            v-if="showResults && (searchResults.length > 0 || searchQuery)"
            class="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-[500px] overflow-y-auto z-50"
          >
            <div v-if="searchLoading" class="p-6 text-center">
              <div
                class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"
              ></div>

              <p class="text-gray-500 mt-2">جاري البحث...</p>
            </div>

            <div v-else-if="searchResults.length > 0">
              <div class="p-3 bg-gray-50 border-b">
                <p class="text-sm text-gray-500">
                  تم العثور على {{ searchResults.length }} منتج
                </p>
              </div>

              <div class="divide-y">
                <div
                  v-for="(product, index) in searchResults"
                  :key="product.id"
                  @click="selectProduct(product)"
                  @mouseenter="selectedIndex = index"
                  class="p-3 hover:bg-blue-50 cursor-pointer transition"
                  :class="{ 'bg-blue-50': selectedIndex === index }"
                >
                  <div class="flex gap-3">
                    <div
                      class="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0"
                    >
                      <img
                        :src="getProductImage(product)"
                        :alt="product.name"
                        class="w-full h-full object-cover"
                      />
                    </div>

                    <div class="flex-1 min-w-0">
                      <h4
                        class="font-semibold text-gray-900 line-clamp-2 text-sm"
                      >
                        {{ product.name }}
                      </h4>

                      <div class="mt-1">
                        <span class="text-blue-600 font-bold">
                          {{ formatPrice(product.price) }} ج
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="p-3 border-t bg-gray-50">
                <button
                  @click="viewAllResults"
                  class="w-full text-center text-blue-600 font-semibold py-2 hover:bg-blue-100 rounded-xl transition"
                >
                  عرض جميع النتائج
                </button>
              </div>
            </div>

            <div
              v-else-if="searchQuery && !searchLoading"
              class="p-8 text-center"
            >
              <div class="text-5xl mb-3">🔍</div>

              <p class="text-gray-600">لا توجد نتائج لـ "{{ searchQuery }}"</p>
            </div>
          </div>
        </div>

        <!-- Desktop Icons -->
        <div class="hidden lg:flex items-center gap-4 xl:gap-6">
          <!-- ✅ زرار الداشبورد - يظهر للمدير والشريك -->
          <NuxtLink
            v-if="userStore?.isAdmin || userStore?.isPartner"
            to="/dashboard"
            class="hover:scale-110 transition text-2xl xl:text-3xl"
            title="لوحة التحكم"
          >
            ⚙️
          </NuxtLink>

          <NuxtLink
            to="/offers"
            class="relative hover:scale-110 transition text-2xl xl:text-3xl"
          >
            🎁

            <span
              class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse"
            >
              !
            </span>
          </NuxtLink>

          <NuxtLink
            to="/cart"
            class="relative hover:scale-110 transition text-2xl xl:text-3xl"
          >
            🛒

            <span
              v-if="cartStore.totalItems > 0"
              class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[22px] h-5 px-1 flex items-center justify-center"
            >
              {{ cartStore.totalItems }}
            </span>
          </NuxtLink>

          <NuxtLink
            to="/wishlist"
            class="relative hover:scale-110 transition text-2xl xl:text-3xl"
          >
            ❤️

            <span
              v-if="wishlistStore.items.length > 0"
              class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[22px] h-5 px-1 flex items-center justify-center"
            >
              {{ wishlistStore.items.length }}
            </span>
          </NuxtLink>

          <!-- ✅ رابط طلباتي - يظهر للمستخدم المسجل -->
          <NuxtLink
            v-if="userStore.isLoggedIn"
            to="/orders"
            class="text-2xl xl:text-3xl relative hover:scale-110 transition hover:text-blue-600 transition flex items-center gap-1"
          >
            📋
          </NuxtLink>

          <!-- ✅ معلومات المستخدم وخروج -->
          <div v-if="userStore.isLoggedIn" class="flex items-center gap-3">
            <span class="text-sm text-gray-600 max-w-[150px] truncate">
              {{ userStore.user?.email }}
            </span>

            <button
              @click="logout"
              class="text-red-500 hover:text-red-700 text-sm"
            >
              خروج
            </button>
          </div>

          <NuxtLink
            v-else
            to="/login"
            class="bg-blue-600 text-white px-5 py-2 rounded-2xl hover:bg-blue-700 transition"
          >
            دخول
          </NuxtLink>
        </div>

        <!-- Mobile Menu Button -->
        <button
          @click="isMobileMenuOpen = !isMobileMenuOpen"
          class="lg:hidden text-2xl p-2"
        >
          ☰
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div v-if="isMobileMenuOpen" class="lg:hidden bg-white border-t">
      <div class="container mx-auto px-4 py-4 flex flex-col gap-4">
        <input
          v-model="searchQuery"
          @input="onSearchInput"
          placeholder="ابحث عن منتج..."
          class="border border-gray-300 rounded-2xl px-4 py-3 w-full text-sm"
        />

        <!-- ✅ زرار الداشبورد في الموبايل - يظهر للمدير والشريك -->
        <NuxtLink
          v-if="userStore.isAdmin || userStore.isPartner"
          to="/dashboard"
          class="py-2"
        >
          ⚙️ لوحة التحكم
        </NuxtLink>

        <NuxtLink to="/offers" class="py-2"> 🎁 العروض </NuxtLink>

        <NuxtLink to="/cart" class="py-2">
          🛒 السلة ({{ cartStore.totalItems }})
        </NuxtLink>

        <NuxtLink to="/wishlist" class="py-2">
          ❤️ المفضلة ({{ wishlistStore.items.length }})
        </NuxtLink>

        <!-- ✅ رابط طلباتي في الموبايل -->
        <NuxtLink v-if="userStore.isLoggedIn" to="/orders" class="py-2">
          📋 طلباتي
        </NuxtLink>

        <NuxtLink
          v-if="!userStore.isLoggedIn"
          to="/login"
          class="text-blue-600"
        >
          دخول
        </NuxtLink>

        <button
          v-if="userStore.isLoggedIn"
          @click="logout"
          class="text-red-600 text-right"
        >
          خروج
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useCartStore } from "~/stores/cart";
import { useUserStore } from "~/stores/user";
import { useWishlistStore } from "~/stores/wishlist";
import { storeToRefs } from "pinia";

import { supabase } from '~/lib/supabase';
const cartStore = useCartStore();
const userStore = useUserStore();
const wishlistStore = useWishlistStore();

// State
const isMobileMenuOpen = ref(false);
const showResults = ref(false);
const searchResults = ref([]);
const searchLoading = ref(false);
const selectedIndex = ref(-1);
let searchTimeout = null;

// ✅ استخدام storeToRefs لجعل القيم تفاعلية
const { isAdmin, isPartner, isLoggedIn, user, initialized } =
  storeToRefs(userStore);
const searchQuery = defineModel("searchQuery", { type: String, default: "" });

// Methods
const formatPrice = (price) => {
  return new Intl.NumberFormat("ar-EG").format(price);
};

const getCategoryName = (categoryValue) => {
  const categories = {
    electrical: "أجهزة كهربائية",
    home: "أدوات منزلية",
    plastic: "بلاستيك وتخزين",
  };
  return categories[categoryValue] || categoryValue;
};

const getProductImage = (product) => {
  if (product.images && product.images.length > 0) {
    return product.images[0];
  }
  return product.image_url || "/images/placeholder.jpg";
};

const logout = async () => {
  await userStore.logout();
  navigateTo("/");
};

const onSearchInput = async () => {
  const query = searchQuery.value.trim();

  if (!query) {
    searchResults.value = [];
    showResults.value = false;
    return;
  }

  showResults.value = true;
  searchLoading.value = true;
  selectedIndex.value = -1;

  if (searchTimeout) clearTimeout(searchTimeout);

  searchTimeout = setTimeout(async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .or(
          `name.ilike.%${query}%,brand.ilike.%${query}%,description.ilike.%${query}%`,
        )
        .limit(10);

      if (error) throw error;
      searchResults.value = data || [];
    } catch (error) {
      console.error("Search error:", error);
      searchResults.value = [];
    } finally {
      searchLoading.value = false;
    }
  }, 300);
};

const selectProduct = (product) => {
  searchQuery.value = product.name;
  showResults.value = false;
  navigateTo(`/products/${product.id}`);
};

const viewAllResults = () => {
  showResults.value = false;
  navigateTo(`/search?q=${encodeURIComponent(searchQuery.value)}`);
};

const moveSelectionDown = () => {
  if (selectedIndex.value < searchResults.value.length - 1) {
    selectedIndex.value++;
    scrollToSelected();
  }
};

const moveSelectionUp = () => {
  if (selectedIndex.value > 0) {
    selectedIndex.value--;
    scrollToSelected();
  }
};

const selectCurrentItem = () => {
  if (selectedIndex.value >= 0 && searchResults.value[selectedIndex.value]) {
    selectProduct(searchResults.value[selectedIndex.value]);
  } else if (searchResults.value.length > 0) {
    selectProduct(searchResults.value[0]);
  } else if (searchQuery.value) {
    viewAllResults();
  }
};

const scrollToSelected = () => {
  nextTick(() => {
    const selected = document.querySelector(".bg-blue-50");
    if (selected) {
      selected.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  });
};

onMounted(() => {
  userStore.initialize();

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".relative")) {
      showResults.value = false;
    }
  });
});

onUnmounted(() => {
  if (searchTimeout) clearTimeout(searchTimeout);
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
