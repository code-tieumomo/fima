import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";
import process from "node:process";

const sw = process.env.SW === "true";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    pageTransition: { name: "page", mode: "out-in" }
  },
  compatibilityDate: "2024-04-03",
  css: ["~/assets/main.scss"],
  devtools: { enabled: false },
  ssr: false,

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  },

  modules: ["nuxtjs-naive-ui", "@nuxtjs/supabase", "@vite-pwa/nuxt", "@nuxt/icon", "@pinia/nuxt"],

  vite: {
    plugins: [
      AutoImport({
        imports: [
          {
            "naive-ui": [
              "useDialog",
              "useMessage",
              "useNotification",
              "useLoadingBar"
            ]
          }
        ]
      }),
      Components({
        resolvers: [NaiveUiResolver()]
      })
    ]
  },

  supabase: {
    redirect: false
  },

  pwa: {
    manifest: {
      name: "Fima",
      short_name: "Fima",
      display: "standalone",
      description: "My finance manager",
      background_color: "#ffffff",
      theme_color: "#ffffff",
      icons: [
        {
          src: "/icons/64.png",
          sizes: "64x64",
          type: "image/png"
        },
        {
          src: "/icons/144.png",
          sizes: "144x144",
          type: "image/png"
        },
        {
          src: "/icons/192.png",
          sizes: "192x192",
          type: "image/png"
        },
        {
          src: "/icons/512.png",
          sizes: "512x512",
          type: "image/png"
        }
      ],
      screenshots: [
        {
          src: "/screenshots/screenshot1.png",
          sizes: "720x1478",
          type: "image/png"
        }
      ]
    },
    workbox: {
      navigateFallback: "/"
    },
    devOptions: {
      // enabled: true,
      type: "module"
    }
  }
});
