// src/firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDhtch79wHOrYP_opPJ-vuhkETYm4GTXa4",
  authDomain: "notification-push-2b889.firebaseapp.com",
  projectId: "notification-push-2b889",
  storageBucket: "notification-push-2b889.firebasestorage.app",
  messagingSenderId: "1067959839671",
  appId: "1:1067959839671:web:9d2742c52bdec2c5139632",
  measurementId: "G-CZT5ZT4NX3",
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export async function solicitarToken(vapidKey, serviceWorkerRegistration) {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("⚠️ Permissão de notificação negada:", permission);
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration,
    });
    if (!token) {
      console.warn("⚠️ Nenhum token FCM gerado.");
      return null;
    }

    console.log("🔥 Token FCM obtido:", token);
    return token;
  } catch (err) {
    console.error("❌ Erro ao obter token FCM:", err);
    return null;
  }
}
