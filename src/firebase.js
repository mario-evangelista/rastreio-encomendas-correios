import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDhtch79wHOrYP_opPJ-vuhkETYm4GTXa4",
  authDomain: "notification-push-2b889.firebaseapp.com",
  projectId: "notification-push-2b889",
  storageBucket: "notification-push-2b889.firebasestorage.app",
  messagingSenderId: "1067959839671",
  appId: "1:1067959839671:web:9d2742c52bdec2c5139632",
  measurementId: "G-CZT5ZT4NX3",
};

// Inicializar Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log("✅ Firebase inicializado com sucesso.");
} catch (err) {
  console.error("❌ Erro ao inicializar Firebase:", err);
}

// Inicializar Messaging
let messaging;
try {
  messaging = getMessaging(app);
  console.log("✅ Messaging inicializado com sucesso.");
} catch (err) {
  console.error("❌ Erro ao inicializar Messaging:", err);
}

const solicitarToken = async (vapidKey, registration) => {
  try {
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });
    if (token) {
      console.log("🔥 Token FCM obtido:", token);
      return token;
    } else {
      console.warn("⚠️ Nenhum token FCM obtido.");
      return null;
    }
  } catch (err) {
    console.error("❌ Erro ao solicitar token FCM:", err);
    return null;
  }
};

// Testar se onMessage está disponível
console.log(
  "🔍 Verificando disponibilidade do onMessage:",
  typeof onMessage === "function" ? "Disponível" : "Indisponível"
);

export { messaging, solicitarToken, onMessage };
