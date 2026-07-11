<template>
  <footer dir="rtl" class="bg-gray-900 text-gray-300">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">

      <!-- Main Footer -->
      <div class="py-10 sm:py-14 lg:py-16">
        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12"
        >

          <!-- About -->
          <div>
            <div class="flex items-center gap-3 mb-5">
              <div
                class="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-2xl shrink-0"
              >
                🏬
              </div>

              <h3 class="text-xl sm:text-2xl font-bold text-white">
                جولدن
              </h3>
            </div>

            <p class="text-sm sm:text-base leading-relaxed text-gray-400">
              أفضل الأجهزة الكهربائية والأدوات المنزلية بأسعار منافسة وضمان
              حقيقي وخدمة عملاء متميزة.
            </p>
          </div>

          <!-- Quick Links -->
          <div>
            <h4 class="text-white text-lg font-semibold mb-5">
              روابط سريعة
            </h4>

            <ul class="space-y-3 text-sm sm:text-base">
              <li>
                <NuxtLink
                  to="/all-products"
                  class="hover:text-amber-400 transition"
                >
                  جميع المنتجات
                </NuxtLink>
              </li>

              <li>
                <NuxtLink
                  to="/offers"
                  class="hover:text-amber-400 transition"
                >
                  العروض
                </NuxtLink>
              </li>

              <li>
                <NuxtLink
                  to="/cart"
                  class="hover:text-amber-400 transition"
                >
                  السلة
                </NuxtLink>
              </li>

              <li>
                <NuxtLink
                  to="/orders"
                  class="hover:text-amber-400 transition"
                >
                  طلباتي
                </NuxtLink>
              </li>
            </ul>
          </div>

          <!-- Contact -->
          <div>
            <h4 class="text-white text-lg font-semibold mb-5">
              تواصل معنا
            </h4>

            <ul class="space-y-3 text-sm sm:text-base">
              <li class="flex items-center gap-2">
                <span>📍</span>
                <span>القاهرة - مصر</span>
              </li>

              <li class="flex items-center gap-2">
                <span>📞</span>
                <span dir="ltr">0100 123 4567</span>
              </li>

              <li class="flex items-center gap-2 break-all">
                <span>✉️</span>
                <span>info@goldenstore.com</span>
              </li>
            </ul>
          </div>

          <!-- Payment -->
          <div>
            <h4 class="text-white text-lg font-semibold mb-5">
              طرق الدفع
            </h4>

            <div class="flex flex-wrap gap-3 text-3xl">
              <div
                class="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center"
              >
                💳
              </div>

              <div
                class="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center"
              >
                🏧
              </div>

              <div
                class="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center"
              >
                📱
              </div>
            </div>

            <div
              class="mt-6 inline-flex items-center gap-2 bg-green-500/10 text-green-400 px-3 py-2 rounded-xl text-sm"
            >
              🔒 دفع آمن 100%
            </div>
          </div>

        </div>
      </div>

      <!-- Bottom Bar -->
      <div
        class="border-t border-gray-800 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-gray-500"
      >
        <p class="text-center sm:text-right">
          © 2026 جولدن - جميع الحقوق محفوظة
        </p>

        <p class="text-center sm:text-right">
          تم التطوير بواسطة فريق جولدن
        </p>
      </div>

    </div>
  </footer>
</template>