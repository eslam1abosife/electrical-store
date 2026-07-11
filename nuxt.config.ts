export default defineNuxtConfig({
  ssr: false,
  
  devtools: { enabled: true },

  // ✅ أزل "@nuxtjs/supabase" من القائمة
  modules: ["@nuxtjs/tailwindcss", "@pinia/nuxt"],

  css: ["~/assets/css/main.css"],

  runtimeConfig: {
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NUXT_PUBLIC_SUPABASE_KEY,
    }
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
      ],
    },
  },

  nitro: {
    preset: 'vercel',
  },

  compatibilityDate: "2025-06-01",
});