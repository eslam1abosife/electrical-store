export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ["@nuxtjs/tailwindcss", "@pinia/nuxt", "@nuxtjs/supabase"],

  css: ["~/assets/css/main.css"],

  // ===== التعديلات المهمة هنا =====
  supabase: {
    redirect: false,
    autoRefreshToken: true,
    persistSession: true,
    // أضف المتغيرات هنا عشان Vercel يقدر يقرأها
    url: process.env.NUXT_PUBLIC_SUPABASE_URL,
    key: process.env.NUXT_PUBLIC_SUPABASE_KEY,
  },

  // ===== أضف runtimeConfig =====
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NUXT_PUBLIC_SUPABASE_KEY,
    }
  },

  // ===== أضف env عشان Vercel =====
  env: {
    NUXT_PUBLIC_SUPABASE_URL: process.env.NUXT_PUBLIC_SUPABASE_URL,
    NUXT_PUBLIC_SUPABASE_KEY: process.env.NUXT_PUBLIC_SUPABASE_KEY,
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

  // ===== مهم لـ Vercel =====
  nitro: {
    preset: 'vercel',
  },

  compatibilityDate: "2025-06-01",
});