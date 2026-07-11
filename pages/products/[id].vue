<template>
  <div dir="rtl" class="min-h-screen bg-gray-50">
    <HeaderComponent v-model:searchQuery="searchQuery" />

    <!-- Loading State -->
    <div v-if="loading" class="container mx-auto px-4 py-8 sm:py-12">
      <div class="animate-pulse">
        <div class="grid md:grid-cols-2 gap-8 sm:gap-12">
          <div
            class="bg-gray-200 rounded-3xl h-[300px] sm:h-[400px] md:h-[500px]"
          ></div>
          <div class="space-y-4 sm:space-y-6">
            <div class="h-6 sm:h-8 bg-gray-200 rounded w-3/4"></div>
            <div class="h-4 sm:h-6 bg-gray-200 rounded w-1/2"></div>
            <div class="h-8 sm:h-12 bg-gray-200 rounded w-1/3"></div>
            <div class="space-y-2 sm:space-y-3">
              <div class="h-3 sm:h-4 bg-gray-200 rounded"></div>
              <div class="h-3 sm:h-4 bg-gray-200 rounded"></div>
              <div class="h-3 sm:h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Product Details -->
    <div
      v-else-if="product"
      class="container mx-auto px-4 py-6 sm:py-8 md:py-12"
    >
      <!-- Breadcrumb -->
      <div class="mb-4 sm:mb-6 text-xs sm:text-sm breadcrumbs">
        <div class="flex items-center gap-1 sm:gap-2 flex-wrap">
          <NuxtLink to="/" class="text-gray-500 hover:text-blue-600"
            >الرئيسية</NuxtLink
          >
          <span class="text-gray-400">›</span>
          <NuxtLink
            :to="`/${product.category}`"
            class="text-gray-500 hover:text-blue-600"
          >
            {{ getCategoryName(product.category) }}
          </NuxtLink>
          <span class="text-gray-400">›</span>
          <span class="text-gray-800 font-semibold line-clamp-1">{{
            product.name
          }}</span>
        </div>
      </div>

      <div class="grid md:grid-cols-2 gap-8 sm:gap-12">
        <!-- Product Image Slider -->
        <div class="space-y-3 sm:space-y-4">
          <!-- Main Image Slider -->
          <div
            class="relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg"
          >
            <button
              @click="prevImage"
              class="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 sm:p-2 rounded-full shadow-lg z-10 transition"
            >
              <span class="text-xl sm:text-2xl">❮</span>
            </button>
            <button
              @click="nextImage"
              class="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 sm:p-2 rounded-full shadow-lg z-10 transition"
            >
              <span class="text-xl sm:text-2xl">❯</span>
            </button>

            <div
              class="relative h-[300px] sm:h-[400px] md:h-[500px] overflow-hidden"
            >
              <transition name="fade" mode="out-in">
                <img
                  :key="currentImageIndex"
                  :src="getCurrentImage()"
                  :alt="product.name"
                  class="w-full h-full object-contain p-4 sm:p-6 md:p-8"
                />
              </transition>
            </div>

            <!-- Image Counter -->
            <div
              class="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 bg-black/60 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm"
            >
              {{ currentImageIndex + 1 }} / {{ totalImages }}
            </div>

            <!-- ✅ Badge "للطلب المسبق" -->
            <div
              v-if="product.product_type === 'pre_order'"
              class="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg"
            >
              📩 للطلب المسبق
            </div>
            <div
              v-else-if="product.stock === 0"
              class="absolute top-4 right-4 bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg"
            >
              ❌ غير متوفر حالياً
            </div>
          </div>

          <!-- Thumbnails Gallery -->
          <div class="flex gap-2 sm:gap-3 overflow-x-auto pb-2 justify-center">
            <button
              v-for="(img, idx) in productImages"
              :key="idx"
              @click="currentImageIndex = idx"
              class="relative w-14 h-14 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all"
              :class="
                currentImageIndex === idx
                  ? 'border-blue-500 shadow-lg scale-105'
                  : 'border-gray-200 hover:border-blue-300'
              "
            >
              <img
                :src="img"
                :alt="`${product.name} ${idx + 1}`"
                class="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>

        <!-- Product Info -->
        <div class="space-y-4 sm:space-y-6">
          <!-- Brand -->
          <div class="flex items-center gap-2">
            <span class="text-xs sm:text-sm text-gray-500"
              >العلامة التجارية:</span
            >
            <span class="font-semibold text-gray-800 text-sm sm:text-base">{{
              product.brand || "غير محدد"
            }}</span>
          </div>

          <!-- Product Name -->
          <h1
            class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight"
          >
            {{ product.name }}
          </h1>

          <!-- Rating -->
          <div class="flex flex-wrap items-center gap-2 sm:gap-3">
            <div class="flex items-center gap-0.5 sm:gap-1">
              <span
                v-for="i in 5"
                :key="i"
                class="text-lg sm:text-2xl"
                :class="
                  i <= (product.rating || 4.5)
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                "
              >
                ★
              </span>
            </div>
            <span class="text-xs sm:text-sm text-gray-600"
              >({{ product.reviews_count || 0 }} تقييم)</span
            >
            <div class="h-3 w-px bg-gray-300 hidden sm:block"></div>
            <span class="text-green-600 text-xs sm:text-sm"
              >✓ {{ product.sold_count || 0 }} تم بيعها</span
            >
          </div>

          <!-- Price -->
          <div class="flex flex-wrap items-center gap-2 sm:gap-4">
            <div
              class="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600"
            >
              {{ formatPrice(product.price) }} جنيه
            </div>
            <div
              v-if="product.old_price"
              class="text-base sm:text-xl text-gray-400 line-through"
            >
              {{ formatPrice(product.old_price) }} جنيه
            </div>
            <div
              v-if="product.discount"
              class="bg-red-500 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold"
            >
              خصم {{ product.discount }}%
            </div>
          </div>

          <!-- Short Description -->
          <div
            v-if="product.short_description"
            class="bg-blue-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl"
          >
            <p class="text-blue-800 text-sm sm:text-base">
              {{ product.short_description }}
            </p>
          </div>

          <!-- Key Features -->
          <div
            v-if="product.features && product.features.length"
            class="space-y-2"
          >
            <h3 class="font-bold text-base sm:text-lg">المميزات الرئيسية:</h3>
            <ul class="space-y-1 sm:space-y-2">
              <li
                v-for="(feature, idx) in product.features"
                :key="idx"
                class="flex items-center gap-2 text-gray-700 text-sm sm:text-base"
              >
                <span class="text-green-500 text-base sm:text-lg">✓</span>
                {{ feature }}
              </li>
            </ul>
          </div>

          <!-- ✅ Availability - دايمن يظهر للعميل -->
          <div
            class="flex flex-wrap items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl"
          >
            <div
              :class="
                product.product_type === 'pre_order'
                  ? 'bg-purple-100 text-purple-700'
                  : product.stock > 0
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
              "
              class="px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold"
            >
              {{
                product.product_type === "pre_order"
                  ? "📩 للطلب المسبق"
                  : product.stock > 0
                    ? "✅ متوفر"
                    : "❌ غير متوفر"
              }}
            </div>
            <div class="text-xs sm:text-sm text-gray-600">
              الكمية المتاحة:
              <span class="font-bold">{{ product.stock || 0 }}</span> قطعة
            </div>
            <div
              v-if="product.stock > 0 && product.stock < 10"
              class="text-orange-600 text-xs sm:text-sm"
            >
              🔥 باقي كمية محدودة!
            </div>
            <!-- ✅ رسالة للطلب المسبق -->
            <div
              v-if="product.product_type === 'pre_order'"
              class="text-purple-600 text-xs sm:text-sm w-full"
            >
              📌 هذا المنتج غير متوفر حالياً، يمكنك طلبه وسنقوم بتوفيره لك
            </div>
          </div>

          <!-- ✅ Quantity Selector - يظهر بس لو في مخزون -->
          <div
            v-if="product.stock > 0 && product.product_type !== 'pre_order'"
            class="flex flex-wrap items-center gap-3 sm:gap-4"
          >
            <span class="text-gray-700 font-semibold text-sm sm:text-base"
              >الكمية:</span
            >
            <div
              class="flex items-center border border-gray-300 rounded-lg bg-white"
            >
              <button
                @click="quantity > 1 && quantity--"
                class="px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-gray-100 text-lg sm:text-xl font-bold transition"
              >
                -
              </button>
              <input
                v-model.number="quantity"
                type="number"
                min="1"
                :max="product.stock"
                class="w-14 sm:w-20 text-center border-x border-gray-300 py-1.5 sm:py-2 focus:outline-none text-sm sm:text-base"
              />
              <button
                @click="quantity < product.stock && quantity++"
                class="px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-gray-100 text-lg sm:text-xl font-bold transition"
              >
                +
              </button>
            </div>
          </div>

          <!-- ✅ Action Buttons - متغيرة حسب حالة المنتج -->
          <!-- ✅ لو المنتج متوفر -->
          <template
            v-if="product.stock > 0 && product.product_type !== 'pre_order'"
          >
            <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
              <button
                @click="addToCart"
                class="flex-1 bg-blue-600 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 text-base sm:text-lg"
              >
                🛒 أضف إلى السلة
              </button>
              <button
                @click="buyNow"
                class="flex-1 bg-green-600 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold hover:bg-green-700 transition text-base sm:text-lg"
              >
                شراء الآن
              </button>
              <button
                @click="toggleWishlist"
                class="px-4 sm:px-6 py-3 sm:py-4 border-2 border-gray-300 rounded-xl sm:rounded-2xl hover:border-red-500 hover:text-red-500 transition text-xl sm:text-2xl"
                :class="
                  isInWishlist ? 'text-red-500 border-red-500 bg-red-50' : ''
                "
              >
                {{ isInWishlist ? "❤️" : "🤍" }}
              </button>
            </div>
          </template>

          <!-- ✅ لو المنتج غير متوفر أو للطلب المسبق -->
          <template v-else>
            <!-- ✅ فورم طلب المنتج -->
            <div
              class="bg-orange-50 p-4 sm:p-6 rounded-2xl border border-orange-200"
            >
              <h3
                class="text-lg font-bold text-orange-700 mb-3 flex items-center gap-2"
              >
                📩 طلب المنتج
              </h3>
              <p class="text-sm text-gray-600 mb-4">
                هذا المنتج غير متوفر حالياً، يمكنك طلبه وسنقوم بتوفيره لك
              </p>

              <div class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1"
                    >الاسم *</label
                  >
                  <input
                    v-model="customerRequest.name"
                    type="text"
                    placeholder="أدخل اسمك الكامل"
                    class="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none text-sm"
                    required
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1"
                    >رقم الهاتف *</label
                  >
                  <input
                    v-model="customerRequest.phone"
                    type="tel"
                    placeholder="أدخل رقم هاتفك"
                    class="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none text-sm dir-ltr"
                    required
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1"
                    >ملاحظات (اختياري)</label
                  >
                  <textarea
                    v-model="customerRequest.notes"
                    rows="2"
                    placeholder="أي ملاحظات إضافية..."
                    class="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none text-sm"
                  ></textarea>
                </div>

                <button
                  @click="requestProductWithForm"
                  :disabled="
                    isRequesting ||
                    !customerRequest.name ||
                    !customerRequest.phone
                  "
                  class="w-full bg-orange-600 text-white py-3 rounded-xl hover:bg-orange-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ isRequesting ? "⏳ جاري الإرسال..." : "📩 إرسال الطلب" }}
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Product Details Tabs -->
    <div class="mt-12 sm:mt-16" dir="rtl">
  <div class="border-b flex gap-4 sm:gap-8 overflow-x-auto">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      @click="activeTab = tab.id"
      :class="
        activeTab === tab.id
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700'
      "
      class="py-2 sm:py-3 px-0.5 sm:px-1 border-b-2 font-semibold transition whitespace-nowrap text-sm sm:text-base"
    >
      {{ tab.name }}
    </button>
  </div>

  <div class="py-6 sm:py-8">
    <div v-if="activeTab === 'description'" class="prose max-w-none text-right">
      <h3 class="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
        وصف المنتج
      </h3>
      <div class="text-gray-600 leading-relaxed whitespace-pre-line text-sm sm:text-base">
        {{ product.description || "لا يوجد وصف متاح لهذا المنتج" }}
      </div>
    </div>
  </div>
</div>

      <!-- Related Products -->
      <div v-if="relatedProducts.length > 0" class="mt-12 sm:mt-16" dir="rtl">
        <h2 class="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">
          منتجات مشابهة
        </h2>
        <div
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8"
        >
          <ProductCard
            v-for="product in relatedProducts"
            :key="product.id"
            :product="product"
            @show-details="navigateToProduct"
            @add-to-cart="addToCartFromRelated"
          />
        </div>
      </div>
    </div>

    <!-- Not Found -->
    <div v-else class="container mx-auto px-4 py-16 sm:py-32 text-center">
      <div class="text-6xl sm:text-9xl mb-3 sm:mb-4">🔍</div>
      <h1 class="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
        المنتج غير موجود
      </h1>
      <p class="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
        عذراً، لم نتمكن من العثور على المنتج الذي تبحث عنه
      </p>
      <NuxtLink
        to="/"
        class="bg-blue-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl hover:bg-blue-700 inline-block text-sm sm:text-base"
      >
        العودة إلى الرئيسية
      </NuxtLink>
    </div>

    <FooterComponent />
    <ToastNotification :toast="toast" @close="toast.show = false" />
  </div>
</template>

<script setup>
import { useCartStore } from "~/stores/cart";
import { useWishlistStore } from "~/stores/wishlist";
import { useUserStore } from "~/stores/user";

const supabase = useSupabaseClient();
const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();
const wishlistStore = useWishlistStore();
const userStore = useUserStore();

// State
const product = ref(null);
const relatedProducts = ref([]);
const loading = ref(true);
const quantity = ref(1);
const activeTab = ref("description");
const currentImageIndex = ref(0);
const searchQuery = ref("");
const toast = ref({ show: false, message: "", type: "success" });
const isRequesting = ref(false);

// ✅ بيانات العميل للطلب (من الفورم)
const customerRequest = ref({
  name: "",
  phone: "",
  notes: "",
});

const tabs = [
  { id: "description", name: "الوصف" },
  // { id: "specifications", name: "المواصفات" },
  // { id: "reviews", name: "التقييمات" },
];

// Computed
const productImages = computed(() => {
  const images = [];

  if (product.value?.image_url) {
    images.push(product.value.image_url);
  }

  if (product.value?.images && Array.isArray(product.value.images)) {
    images.push(...product.value.images);
  }

  if (images.length === 0) {
    images.push("/images/placeholder.jpg");
  }

  return images;
});

const totalImages = computed(() => productImages.value.length);

const isInWishlist = computed(() => {
  return (
    product.value &&
    wishlistStore.items.some((item) => item.id === product.value.id)
  );
});

// Methods
const getCurrentImage = () => {
  return (
    productImages.value[currentImageIndex.value] || "/images/placeholder.jpg"
  );
};

const prevImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--;
  } else {
    currentImageIndex.value = totalImages.value - 1;
  }
};

const nextImage = () => {
  if (currentImageIndex.value < totalImages.value - 1) {
    currentImageIndex.value++;
  } else {
    currentImageIndex.value = 0;
  }
};

const getCategoryName = (categoryValue) => {
  const categories = {
    electrical: "الأجهزة الكهربائية",
    home: "الأدوات المنزلية",
    plastic: "البلاستيك والتخزين",
  };
  return categories[categoryValue] || "منتجات";
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("ar-EG").format(price);
};

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("ar-EG");
};

const showToast = (message, type = "success") => {
  toast.value = { show: true, message, type };
  setTimeout(() => {
    toast.value.show = false;
  }, 3000);
};

// ✅ دالة إضافة للسلة
const addToCart = () => {
  if (product.value.stock === 0) {
    showToast("❌ هذا المنتج غير متوفر حالياً", "error");
    return;
  }

  for (let i = 0; i < quantity.value; i++) {
    cartStore.addItem(product.value);
  }

  showToast(`✅ تم إضافة ${quantity.value} × ${product.value.name} إلى السلة`);
};

// ✅ دالة الشراء المباشر
const buyNow = () => {
  addToCart();
  router.push("/cart");
};

// ✅ دالة طلب المنتج من الفورم
const requestProductWithForm = async () => {
  if (!product.value) return;

  // التحقق من البيانات
  if (!customerRequest.value.name || customerRequest.value.name.trim() === "") {
    showToast("⚠️ الرجاء إدخال الاسم", "warning");
    return;
  }

  if (
    !customerRequest.value.phone ||
    customerRequest.value.phone.trim() === ""
  ) {
    showToast("⚠️ الرجاء إدخال رقم الهاتف", "warning");
    return;
  }

  isRequesting.value = true;

  try {
    // ✅ إضافة طلب المنتج مع بيانات العميل من الفورم
    const { error } = await supabase.from("product_requests").insert([
      {
        product_id: product.value.id,
        product_name: product.value.name,
        customer_name: customerRequest.value.name.trim(),
        customer_phone: customerRequest.value.phone.trim(),
        notes: customerRequest.value.notes?.trim() || null,
        request_date: new Date().toISOString(),
        status: "pending",
      },
    ]);

    if (error) {
      console.error("❌ خطأ في طلب المنتج:", error);
      showToast("❌ حدث خطأ في طلب المنتج: " + error.message, "error");
    } else {
      showToast(
        `✅ تم طلب المنتج "${product.value.name}" بنجاح، سنتواصل معك قريباً`,
        "success",
      );

      // ✅ تفريغ الفورم بعد النجاح
      customerRequest.value = {
        name: "",
        phone: "",
        notes: "",
      };
    }
  } catch (error) {
    console.error("❌ خطأ:", error);
    showToast("❌ حدث خطأ", "error");
  } finally {
    isRequesting.value = false;
  }
};

// ✅ دالة إشعار عند التوفّر
const notifyWhenAvailable = () => {
  if (!userStore?.isLoggedIn) {
    showToast("⚠️ الرجاء تسجيل الدخول للإشعار", "warning");
    router.push("/login");
    return;
  }
  showToast("🔔 سيتم إعلامك عند توفر المنتج", "info");
};

const toggleWishlist = () => {
  if (!product.value) return;

  const exists = wishlistStore.items.some(
    (item) => item.id === product.value.id,
  );

  if (exists) {
    wishlistStore.removeItem(product.value.id);
    showToast("❌ تم إزالة المنتج من المفضلة", "info");
  } else {
    wishlistStore.addItem(product.value);
    showToast("❤️ تم إضافة المنتج للمفضلة", "success");
  }
};

const navigateToProduct = (prod) => {
  router.push(`/products/${prod.id}`);
};

const addToCartFromRelated = (prod) => {
  cartStore.addItem(prod);
  showToast(`✅ تم إضافة ${prod.name} إلى السلة`);
};

// Load Product Data
const loadProduct = async () => {
  loading.value = true;
  const productId = route.params.id;

  try {
    const { data: productData, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (productError) throw productError;

    product.value = productData;
    currentImageIndex.value = 0;

    const { data: relatedData, error: relatedError } = await supabase
      .from("products")
      .select("*")
      .eq("category", productData.category)
      .neq("id", productId)
      .limit(4);

    if (!relatedError && relatedData) {
      relatedProducts.value = relatedData;
    }
  } catch (error) {
    console.error("Error loading product:", error);
    product.value = null;
  } finally {
    setTimeout(() => {
      loading.value = false;
    }, 500);
  }
};

// Watch for route changes
watch(
  () => route.params.id,
  () => {
    loadProduct();
    quantity.value = 1;
    activeTab.value = "description";
    currentImageIndex.value = 0;
  },
  { immediate: true },
);
</script>

<style scoped>
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  opacity: 1;
}

.prose {
  max-width: none;
}

.prose p {
  margin-bottom: 1rem;
  line-height: 1.8;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.breadcrumbs {
  direction: rtl;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.overflow-x-auto::-webkit-scrollbar {
  height: 4px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.break-words {
  word-break: break-word;
}

.dir-ltr {
  direction: ltr;
  text-align: left;
}
</style>
