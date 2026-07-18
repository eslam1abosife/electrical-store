<template>
  <div dir="rtl"
    class="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2"
  >
    <NuxtLink :to="`/products/${product.id}`" class="block">
      <!-- Image -->
      <div class="relative overflow-hidden h-40 sm:h-52 lg:h-64 bg-gray-50">
        <img
          :src="product.image_url || ''"
          :alt="product.name"
          class="w-full h-full object-contain p-3 sm:p-4 group-hover:scale-110 transition duration-500"
        />

        <div
          v-if="product.discount"
          class="absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-500 text-white px-2 py-1 rounded-lg text-[10px] sm:text-xs font-bold"
        >
          -{{ product.discount }}%
        </div>

        <button
          @click.prevent="toggleWishlist"
          class="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-red-50 transition text-lg sm:text-xl"
          :class="isInWishlist ? 'text-red-500' : 'text-gray-400'"
        >
          {{ isInWishlist ? "❤️" : "🤍" }}
        </button>
      </div>

      <!-- Content -->
      <div class="p-3 sm:p-4 lg:p-5">
        <!-- Title -->
        <h3
          class="font-bold text-sm sm:text-base text-black lg:text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition min-h-[44px]"
        >
          {{ product.name }}
        </h3>

        <!-- Rating -->
        <div class="flex items-center gap-2 mb-3">
          <div class="flex items-center gap-0.5">
            <span class="text-yellow-400">★</span>

            <span class="text-xs sm:text-sm text-black group-hover:text-blue-600 font-semibold">
              {{ product.rating || 4.5 }}
            </span>
          </div>

          <span class="text-[11px] sm:text-xs text-gray-400">
            ({{ product.reviews_count || 0 }})
          </span>
        </div>

        <!-- Price -->
        <div class="mb-4">
          <div class="flex flex-wrap items-center gap-2">
            <span
              class="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600"
            >
              {{ formatPrice(product.price) }} ج
            </span>

            <span
              v-if="product.old_price"
              class="text-xs sm:text-sm text-gray-400 line-through"
            >
              {{ formatPrice(product.old_price) }} ج
            </span>
          </div>
        </div>

        <!-- Buttons -->
        <div class="flex gap-2">
          <button
            @click.prevent="$emit('add-to-cart', product)"
            class="flex-1 bg-blue-600 text-white py-2.5 sm:py-3 rounded-xl hover:bg-blue-700 transition font-medium text-xs sm:text-sm"
          >
            🛒 أضف للسلة
          </button>

          <button
            @click.prevent="$emit('show-details', product)"
            class="w-10 sm:w-12 flex items-center justify-center border border-gray-300 rounded-xl hover:border-blue-600 hover:text-blue-600 transition"
          >
            👁️
          </button>
        </div>
      </div>
    </NuxtLink>
  </div>
</template>

<script setup>
import { useWishlistStore } from "~/stores/wishlist";

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["show-details", "add-to-cart"]);

const wishlistStore = useWishlistStore();

const isInWishlist = computed(() => {
  return wishlistStore.items.some((item) => item.id === props.product.id);
});

const toggleWishlist = () => {
  const exists = wishlistStore.items.some(
    (item) => item.id === props.product.id,
  );

  if (exists) {
    wishlistStore.removeItem(props.product.id);
  } else {
    wishlistStore.addItem(props.product);
  }
};

const formatPrice = (price) => {
  return new Intl.NumberFormat("ar-EG").format(price);
};
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
