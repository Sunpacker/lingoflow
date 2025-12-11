export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: false, // SPA-режим для простоты, или true для SSR
  modules: ["@nuxt/ui", "@nuxtjs/tailwindcss", "@pinia/nuxt"],

  // Настройки Nuxt UI
  ui: {
    icons: ["heroicons", "lucide"],
  },

  // Настройки TailwindCSS
  tailwindcss: {
    cssPath: "~/assets/css/tailwind.css",
    configPath: "tailwind.config.js",
  },

  // Настройки Runtime Config для доступа к переменным окружения
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "http://localhost:80", // Nginx proxy
      googleClientId: process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID,
    },
  },

  // Настройки Vite для тестов
  vite: {
    test: {
      globals: true,
      environment: "jsdom",
    },
  },
});
