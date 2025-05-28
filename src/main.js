// src/main.js
import { createApp } from "vue";
import App from "./App.vue";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import "vuetify/styles";
import { solicitarToken } from "./firebase";
import axios from "axios";

const vuetify = createVuetify({
  components,
  directives,
  theme: { defaultTheme: "dark" },
});

const app = createApp(App);
app.use(vuetify);

const API_BASE_URL =
  //import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
  import.meta.env.VITE_API_BASE_URL || "https://api-proxy-labs-wonca.onrender.com";


if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );
      console.log("✅ Service Worker registrado com sucesso:", registration);

      const vapidKey =
        "BK9SnBv4o6WH83EoTlFLmGorhKa_1b9GoG3iSvAQ_HvUFtX5CjJHR1vB08emtbFH6iGEai-Sq-GfJj0qbrd_39w"; // From Firebase Console
      const token = await solicitarToken(vapidKey, registration);
      if (token) {
        console.log("🔥 FCM Token:", token);
        localStorage.setItem("pushSubscriptionId", token);
        await axios.post(`${API_BASE_URL}/api/register-push-token`, {
          trackingCode: null, // Allow null for initial registration
          pushToken: token,
        });
      }
    } catch (err) {
      console.error("❌ Falha ao configurar Service Worker ou FCM:", err);
    }
  });
}

app.mount("#app");
