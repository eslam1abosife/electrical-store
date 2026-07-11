<template>
  <div
    class="relative h-[320px] sm:h-[420px] md:h-[520px] lg:h-[580px] overflow-hidden"
  >
    <swiper
      :modules="modules"
      :slides-per-view="1"
      :loop="true"
      :autoplay="{ delay: 4500, disableOnInteraction: false }"
      :navigation="true"
      class="h-full"
    >
      <swiper-slide
        v-for="(slide, index) in slides"
        :key="index"
      >
        <!-- Background Image -->
        <img
          :src="slide.image"
          class="absolute inset-0 w-full h-full object-cover"
          alt="عرض جولدن"
        />

        <!-- Overlay -->
        <div
          class="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20"
        ></div>

        <!-- Content -->
        <div
          class="absolute inset-0 flex items-center px-4 sm:px-8 md:px-12 lg:px-16 z-10"
        >
          <div
            class="max-w-full sm:max-w-xl lg:max-w-2xl text-white"
          >
            <!-- Badge -->
            <div
              class="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 sm:px-5 py-2 rounded-full text-xs sm:text-sm mb-4 sm:mb-5"
            >
              {{ slide.badge }}
            </div>

            <!-- Title -->
            <h1
              class="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6"
            >
              {{ slide.title }}
            </h1>

            <!-- Description -->
            <p
              class="text-sm sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 text-white/90 leading-relaxed"
            >
              {{ slide.description }}
            </p>

            <!-- Button -->
            <button
              @click="scrollToShop"
              class="bg-white text-black font-bold
                     text-sm sm:text-base lg:text-lg
                     px-5 sm:px-8 lg:px-10
                     py-3 sm:py-4
                     rounded-2xl sm:rounded-3xl
                     hover:bg-amber-400
                     hover:text-white
                     transition-all duration-300
                     flex items-center gap-2 sm:gap-3"
            >
              تسوق الآن

              <span
                class="text-lg sm:text-xl lg:text-2xl"
              >
                →
              </span>
            </button>
          </div>
        </div>
      </swiper-slide>
    </swiper>
  </div>
</template>

<script setup>
import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

const modules = [Autoplay, Navigation];

const slides = [
  {
    image: "https://picsum.photos/id/1015/1920/1080",
    badge: "🔥 عرض الصيف الحصري",
    title: "خصومات تصل إلى 40% على جميع الأجهزة",
    description:
      "ثلاجات - غسالات - تكييفات - ميكروويف بأفضل الأسعار",
  },
  {
    image: "https://picsum.photos/id/201/1920/1080",
    badge: "🆕 وصل حديثاً 2026",
    title: "أحدث موديلات التكييفات الإنفرتر",
    description:
      "توفير كهرباء + ضمان 5 سنوات",
  },
  {
    image: "https://picsum.photos/id/106/1920/1080",
    badge: "🏠 للبيت المثالي",
    title: "أطقم الأجهزة الكهربائية الكاملة",
    description:
      "باقات مميزة بأسعار خاصة",
  },
];

const scrollToShop = () => {
  document
    .getElementById("products-section")
    ?.scrollIntoView({
      behavior: "smooth",
    });
};
</script>

<style>
/* تحسين أزرار Swiper للموبايل */
.swiper-button-next,
.swiper-button-prev {
  transform: scale(0.8);
}

@media (max-width: 768px) {
  .swiper-button-next,
  .swiper-button-prev {
    display: none;
  }
}
</style>