export default defineNuxtConfig({
  ssr: false, // ✅ تأكد من وجودها
  
  devtools: { enabled: true },

  modules: ["@nuxtjs/tailwindcss", "@pinia/nuxt"],

  css: ["~/assets/css/main.css"],

  // ✅ أضف إعدادات Pinia
  pinia: {
    storesDirs: ['./stores/**'],
  },

  components: [
    { path: "~/components", pathPrefix: false },
    { path: "~/components/fans", pathPrefix: false },
    { path: "~/components/fans/modals", pathPrefix: false },
  ],

  vite: {
    optimizeDeps: {
      include: [
        "@vue/devtools-core",
        "@vue/devtools-kit",
        "date-fns",
        "date-fns/locale",
        "swiper/modules",
        "swiper/vue",
        "pinia-plugin-persistedstate", // ✅ أضف ده
      ],
    },
  },

  nitro: {
    preset: 'vercel',
  },

  compatibilityDate: "2025-06-01",
});