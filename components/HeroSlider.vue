<template>
  <div dir="rtl" class="relative w-full aspect-[16/8] sm:aspect-[16/7] md:aspect-[16/6] lg:aspect-[16/5] bg-[#021338] overflow-hidden">
    <swiper
      :modules="modules"
      :slides-per-view="1"
      :loop="true"
      :autoplay="{ delay: 5000, disableOnInteraction: false }"
      :navigation="true"
      class="w-full h-full"
    >
      <swiper-slide
        v-for="(slide, index) in slides"
        :key="index"
        class="relative w-full h-full flex items-center justify-end overflow-hidden"
      >
        <!-- 1. صورة الخلفية عالية الوضوح ومنتظمة -->
        <img
          :src="slide.image"
          class="absolute inset-0 w-[100vw] h-full object-cover object-left sm:object-center select-none max-w-full block"
          alt="معرض جولدن للأجهزة الكهربائية"
        />

        <!-- 2. تدرج ظلي ناعم واحترافي -->
        <div class="absolute inset-0 bg-gradient-to-l from-[#021338]/90 via-[#021338]/40 to-transparent"></div>

        <!-- 3. النصوص واسم المعرض فوق الصورة (HTML حقيقي) -->
        <div class="relative z-10 container mx-auto h-full flex items-center px-4 sm:px-8 lg:px-12 xl:px-16">
          <div class="max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl text-white space-y-2 sm:space-y-4">
            
            <!-- اسم المعرض والـ Badge -->
            <div class="flex items-center gap-2 sm:gap-3">
              <span class="bg-amber-400/20 border border-amber-400/40 backdrop-blur-md px-3 py-1 rounded-full text-amber-300 text-xs sm:text-sm font-semibold">
                {{ slide.badge }}
              </span>
              <span class="text-amber-400 font-extrabold text-sm sm:text-xl tracking-wider">
                معرض جولدن
              </span>
            </div>

            <!-- العنوان الرئيسي -->
            <h1 class="text-lg sm:text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight drop-shadow-lg">
              {{ slide.title }}
            </h1>

            <!-- الوصف -->
            <p class="text-[11px] sm:text-base md:text-lg text-slate-200 font-medium leading-relaxed drop-shadow">
              {{ slide.description }}
            </p>

            <!-- زر التفاعل -->
            <div class="pt-2 sm:pt-4">
              <button
                @click="scrollToShop"
                class="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold
                       text-[10px] sm:text-sm lg:text-base
                       px-3 sm:px-6 py-1.5 sm:py-3
                       rounded-lg sm:rounded-xl shadow-lg hover:shadow-amber-400/30
                       transition-all duration-300 transform hover:-translate-y-0.5
                       flex items-center gap-2"
              >
                تسوق جميع العروض
                <span class="text-sm sm:text-base">←</span>
              </button>
            </div>

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

import myimage1 from "../public/images/Gemini_Generated_Image_bdf35abdf35abdf3.png";
import myimage2 from "../public/images/image.png";
import myimage3 from "../public/images/Gemini_Generated_Image_taptydtaptydtapt.png";
import myimage4 from "../public/images/Gemini_Generated_Image_tqanwgtqanwgtqan.png";

const slides = [
  {
    image: myimage1,
    badge: "🔥 عرض الصيف الحصري",
    title: "أحدث موديلات التكييفات الإنفرتر",
    description: "توفير كهرباء يصل إلى 40% + ضمان 5 سنوات من معرض جولدن"
  },
  {
    image: myimage2,
    badge: "🆕 وصل حديثاً 2026",
    title: "عروض الشاشات والأنظمة الصوتية",
    description: "أحدث الشاشات الذكية بأسعار خاصة وتقنيات فور كي عالية الدقة"
  },
  {
    image: myimage3,
    badge: "🏠 المطبخ العصري",
    title: "أطقم وتجهيزات المطبخ الكاملة",
    description: "أفران بلت إن - ميكروويف - ماكينات قهوة وقلايات بأفضل خامة"
  },
  {
    image: myimage4,
    badge: "⚡ باقات العروسين",
    title: "خصومات تصل إلى 40% على جميع الأجهزة",
    description: "ثلاجات - غسالات - مجففات مع خدمة التوصيل والتركيب المجاني"
  }
];

const scrollToShop = () => {
  document.getElementById("products-section")?.scrollIntoView({
    behavior: "smooth",
  });
};
</script>

<style>
/* تصغير أزرار التنقل وسهم الإشارة */
.swiper-button-next,
.swiper-button-prev {
  color: #ffffff !important;
  background: rgba(2, 19, 56, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.15);
  width: 28px !important;  /* تم تصغير القطر من 36px إلى 28px */
  height: 28px !important;
  border-radius: 50%;
  backdrop-filter: blur(6px);
  transition: all 0.3s ease-in-out;
  margin-top: -14px !important; /* محاذاة سنتر جديدة لتناسب الارتفاع الجديد */
  z-index: 20;
}

.swiper-button-next:hover,
.swiper-button-prev:hover {
  background: #fbbf24;
  border-color: #fbbf24;
  color: #021338 !important;
  transform: scale(1.1);
}

.swiper-button-next::after,
.swiper-button-prev::after {
  font-size: 10px !important; /* تم تصغير سهم الاتجاه نفسه من 14px إلى 10px */
  font-weight: 900;
}

/* موضع الأسهم على الأطراف */
.swiper-button-prev {
  right: 1.2% !important;
  left: auto !important;
}
.swiper-button-next {
  left: 1.2% !important;
  right: auto !important;
}

@media (max-width: 768px) {
  .swiper-button-next,
  .swiper-button-prev {
    display: none !important;
  }
}
.swiper-button-prev ::slotted(svg), .swiper-button-prev svg, .swiper-button-next ::slotted(svg), .swiper-button-next svg{
  width: 25% !important;

}
</style>