<template>
  <div dir="rtl" class="min-h-screen bg-gray-100">
    <header class="bg-white shadow-md p-3 sm:p-4">
      <div
        class="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-3"
      >
        <NuxtLink
          to="/cart"
          class="text-blue-600 hover:text-blue-800 transition text-sm sm:text-base"
        >
          ← العودة للسلة
        </NuxtLink>
        <div class="text-xs sm:text-sm text-gray-500">
          🖥️ طلب عبر الموقع الإلكتروني
        </div>
      </div>
    </header>

    <div class="container mx-auto px-4 py-6 sm:py-8">
      <h1 class="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">
        📝 إنهاء الطلب
      </h1>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <!-- نموذج بيانات العميل -->
        <div class="bg-white rounded-2xl shadow p-5 sm:p-6">
          <h2 class="text-lg sm:text-xl font-bold mb-4">بيانات العميل</h2>

          <form @submit.prevent="submitOrder" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1">الاسم *</label>
              <input
                v-model="customer.name"
                type="text"
                required
                class="w-full p-2.5 sm:p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none transition text-sm sm:text-base"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">رقم الهاتف *</label>
              <input
                v-model="customer.phone"
                type="tel"
                required
                class="w-full p-2.5 sm:p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none transition text-sm sm:text-base dir-ltr"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">العنوان</label>
              <textarea
                v-model="customer.address"
                rows="2"
                placeholder="العنوان بالكامل (اختياري)"
                class="w-full p-2.5 sm:p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none transition text-sm sm:text-base"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">طريقة الدفع</label>
              <select
                v-model="customer.payment_method"
                class="w-full p-2.5 sm:p-3 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none transition text-sm sm:text-base"
              >
                <option value="cash">💰 كاش عند الاستلام</option>
                <option value="card">💳 بطاقة ائتمان</option>
                <option value="installments">📅 تقسيط</option>
              </select>
            </div>

            <div
              class="bg-blue-50 p-3 rounded-xl text-xs sm:text-sm text-blue-700"
            >
              💡 ملاحظة: هذا الطلب سيتم تسجيله كمبيعات "من الموقع الإلكتروني"
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full bg-green-600 text-white py-2.5 sm:py-3 rounded-xl hover:bg-green-700 transition disabled:opacity-50 font-medium text-sm sm:text-base"
            >
              {{ loading ? "⏳ جاري المعالجة..." : "✅ تأكيد الطلب" }}
            </button>
          </form>
        </div>

        <!-- ملخص الطلب -->
        <div class="bg-white rounded-2xl shadow p-5 sm:p-6 h-fit">
          <h2 class="text-lg sm:text-xl font-bold mb-4">🛒 ملخص الطلب</h2>

          <!-- Cart Items -->
          <div class="space-y-3 max-h-96 overflow-y-auto mb-4">
            <!-- Mobile Card View -->
            <div class="block sm:hidden">
              <div
                v-for="item in cartStore.cartItems"
                :key="item.id"
                class="border rounded-xl p-3 mb-3"
              >
                <div class="flex justify-between items-start mb-2">
                  <span class="font-medium text-sm line-clamp-2 flex-1">{{
                    item.name
                  }}</span>
                  <span class="text-blue-600 font-semibold text-sm mr-2"
                    >{{ formatNumber(item.price * item.quantity) }} ج</span
                  >
                </div>
                <div class="flex justify-between text-xs text-gray-500">
                  <span>الكمية: {{ item.quantity }}</span>
                  <span>{{ formatNumber(item.price) }} ج/قطعة</span>
                </div>
              </div>
            </div>

            <!-- Desktop Table View -->
            <div class="hidden sm:block">
              <div
                v-for="item in cartStore.cartItems"
                :key="item.id"
                class="flex justify-between items-center border-b pb-2 mb-2"
              >
                <div class="flex-1">
                  <span class="font-medium text-sm">{{ item.name }}</span>
                  <span class="text-gray-500 text-xs mx-2"
                    >x{{ item.quantity }}</span
                  >
                </div>
                <span
                  class="text-blue-600 font-semibold text-sm whitespace-nowrap"
                  >{{ formatNumber(item.price * item.quantity) }} ج</span
                >
              </div>
            </div>

            <div
              v-if="cartStore.cartItems.length === 0"
              class="text-center py-8 text-gray-400 text-sm"
            >
              السلة فارغة
            </div>
          </div>

          <!-- Summary Totals -->
          <div class="border-t pt-4 space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">المجموع</span>
              <span class="font-semibold"
                >{{ formatNumber(cartStore.totalPrice) }} ج</span
              >
            </div>
            <div class="flex justify-between text-xs sm:text-sm text-gray-500">
              <span>الشحن</span>
              <span>حسب المنطقة (يتم حسابه لاحقاً)</span>
            </div>
            <div
              class="flex justify-between text-lg sm:text-xl font-bold text-green-600 pt-2 border-t"
            >
              <span>الإجمالي المتوقع</span>
              <span>{{ formatNumber(cartStore.totalPrice) }} ج</span>
            </div>
          </div>

          <!-- معلومات إضافية -->
          <div
            class="mt-4 p-3 bg-gray-50 rounded-xl text-[10px] sm:text-xs text-gray-500 text-center"
          >
            <p>سيتم التواصل معك لتأكيد الطلب وتفاصيل الشحن</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from "~/stores/cart";
import { useUserStore } from "~/stores/user";

const supabase = useSupabaseClient();
const cartStore = useCartStore();
const userStore = useUserStore();
const loading = ref(false);

// بيانات العميل
const customer = ref({
  name: "",
  phone: "",
  address: "",
  payment_method: "cash",
});

const formatNumber = (num) => {
  if (!num && num !== 0) return "0";
  return num.toLocaleString("ar-EG");
};

const submitOrder = async () => {
  // التحقق من صحة البيانات
  if (!customer.value.name || customer.value.name.trim() === "") {
    alert("⚠️ الرجاء إدخال الاسم");
    return;
  }

  if (!customer.value.phone || customer.value.phone.trim() === "") {
    alert("⚠️ الرجاء إدخال رقم الهاتف");
    return;
  }

  if (cartStore.cartItems.length === 0) {
    alert("⚠️ السلة فارغة، الرجاء إضافة منتجات أولاً");
    navigateTo("/");
    return;
  }

  loading.value = true;

  try {
    // ✅ 1. تحديث المخزون
    for (const item of cartStore.cartItems) {
      const { data: product, error: fetchError } = await supabase
        .from("products")
        .select("stock")
        .eq("id", item.id)
        .single();

      if (fetchError) throw fetchError;
      if (!product) throw new Error("Product not found");

      const newStock = Math.max(0, (product.stock || 0) - item.quantity);

      const { error: updateError } = await supabase
        .from("products")
        .update({
          stock: newStock,
          product_type: newStock === 0 ? "pre_order" : "in_stock",
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id);

      if (updateError) throw updateError;
    }

    // ✅ 2. تحضير بيانات الطلب
    const orderData = {
      customer_name: customer.value.name.trim(),
      customer_phone: customer.value.phone.trim(),
      customer_email: userStore.user?.email || null,
      customer_address: customer.value.address?.trim() || null,
      items: cartStore.cartItems.map((item) => ({
        product_id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image_url: item.image_url,
      })),
      total_price: cartStore.totalPrice,
      status: "pending",
      payment_method: customer.value.payment_method,
      sale_type: "online",
      order_date: new Date().toISOString(),
      notes: "طلب من الموقع الإلكتروني",
    };

    // ✅ 3. إضافة الطلب إلى customer_orders (خاص بالعميل)
    const { error: customerOrderError } = await supabase
      .from("customer_orders")
      .insert([orderData]);

    if (customerOrderError) throw customerOrderError;

    // ✅ 4. إضافة الطلب إلى orders (خاص بالداشبورد - الإدارة)
    const { error: adminOrderError } = await supabase.from("orders").insert([
      {
        ...orderData,
        customer_email: userStore.user?.email || null,
      },
    ]);

    if (adminOrderError) throw adminOrderError;

    // ✅ 5. نجاح الطلب
    alert(
      "🎉 تم استلام طلبك بنجاح! سنتواصل معك قريباً لتأكيد الطلب وتفاصيل الشحن",
    );

    // ✅ 6. تفريغ السلة
    cartStore.clearCart();

    // ✅ 7. التوجه لصفحة الطلبات
    navigateTo("/orders");
  } catch (error) {
    console.error("❌ Checkout Error:", error);
    alert("❌ حدث خطأ: " + error.message);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  cartStore.loadFromLocalStorage();

  if (cartStore.cartItems.length === 0) {
    setTimeout(() => {
      alert("⚠️ السلة فارغة، الرجاء إضافة منتجات أولاً");
    }, 500);
  }
});
</script>

<style scoped>
.dir-ltr {
  direction: ltr;
  text-align: left;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

@media (max-width: 640px) {
  input,
  select,
  textarea,
  button {
    font-size: 16px !important;
  }
}

.max-h-96::-webkit-scrollbar {
  width: 4px;
}

.max-h-96::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.max-h-96::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
</style>
