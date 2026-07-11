export default defineNuxtConfig({
  ssr: false,
  
  devtools: { enabled: true },

  modules: [
    "@nuxtjs/tailwindcss", 
    "@pinia/nuxt"  // ✅ استخدم الـ module فقط
  ],

  css: ["~/assets/css/main.css"],

  // ✅ إعدادات Pinia
  pinia: {
    storesDirs: ['./stores/**'],
  },

  components: [
    { path: "~/components", pathPrefix: false },
    { path: "~/components/fans", pathPrefix: false },
    { path: "~/components/fans/modals", pathPrefix: false },
  ],

  nitro: {
    preset: 'vercel',
  },

  compatibilityDate: "2025-06-01",
})