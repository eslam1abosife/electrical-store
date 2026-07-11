export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ["@nuxtjs/tailwindcss", "@pinia/nuxt", "@nuxtjs/supabase"],

  css: ["~/assets/css/main.css"],

  supabase: {
    redirect: false,
    autoRefreshToken: true,
    persistSession: true,
  },

  components: [
    { path: "~/components", pathPrefix: false },
    { path: "~/components/fans", pathPrefix: false },
    { path: "~/components/fans/modals", pathPrefix: false },
  ],

  // ✅ أضف القسم ده عشان تحسين الأداء ومنع إعادة التحميل
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

  compatibilityDate: "2025-06-01",
});
