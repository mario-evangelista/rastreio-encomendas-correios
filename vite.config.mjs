import { defineConfig } from "vite";
import Vue from "@vitejs/plugin-vue";
import VueRouter from "unplugin-vue-router/vite";
import Layouts from "vite-plugin-vue-layouts-next";
import Components from "unplugin-vue-components/vite";
import AutoImport from "unplugin-auto-import/vite";
import Fonts from "unplugin-fonts/vite";
import Vuetify, { transformAssetUrls } from "vite-plugin-vuetify";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    VueRouter(),
    Layouts(),
    Vue({
      template: { transformAssetUrls },
    }),
    Vuetify({
      autoImport: true,
      styles: {
        configFile: "src/styles/settings.scss",
      },
    }),
    Components(),
    Fonts({
      google: {
        families: [
          {
            name: "Roboto",
            styles: "wght@100;300;400;500;700;900",
          },
        ],
      },
    }),
    AutoImport({
      imports: ["vue", "vue-router"],
      eslintrc: { enabled: true },
      vueTemplate: true,
    }),
    VitePWA({
      registerType: "auto",
      devOptions: { enabled: true },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,jpg,jpeg,svg}"],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        // Exclude Firebase-related paths to avoid conflicts
        navigateFallbackDenylist: [
          /^\/firebase-cloud-messaging-push-scope/,
          /^\/firebase-messaging-sw\.js$/, // Explicitly exclude the Firebase Service Worker
        ],
        // Prevent Workbox from caching the Firebase Service Worker
        runtimeCaching: [
          {
            urlPattern: /^\/firebase-messaging-sw\.js$/,
            handler: "NetworkOnly", // Ensure this file is always fetched from the network
          },
        ],
      },
      // Explicitly include the Firebase Service Worker in the manifest
      includeAssets: ["firebase-messaging-sw.js"],
    }),
  ],
  resolve: {
    alias: { "@": "/src" },
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
  // Ensure the base is set to root
  base: "/",
});
