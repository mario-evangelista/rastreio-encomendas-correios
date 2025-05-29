// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyDhtch79wHOrYP_opPJ-vuhkETYm4GTXa4",
  authDomain: "notification-push-2b889.firebaseapp.com",
  projectId: "notification-push-2b889",
  storageBucket: "notification-push-2b889.firebasestorage.app",
  messagingSenderId: "1067959839671",
  appId: "1:1067959839671:web:9d2742c52bdec2c5139632",
  measurementId: "G-CZT5ZT4NX3",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Push event received:", payload);
  const notificationTitle = payload.notification?.title || "Nova Atualização";
  const status = payload.notification?.body || "Seu pacote foi atualizado";

  // Extrair o código de rastreamento da URL ou do payload
  const url = payload.data?.url || "";
  const trackingCodeMatch = url.match(/code=([A-Z0-9]+)/);
  const trackingCodeFromPayload = trackingCodeMatch
    ? trackingCodeMatch[1]
    : "Desconhecido";

  // Obter data/hora atual no formato brasileiro
  const now = new Date();
  const currentDateTime = now.toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });

  // Construir a mensagem com status, código e data/hora
  const body = `${status}\nCódigo: ${trackingCodeFromPayload}\nData/Hora: ${currentDateTime}`;

  const notificationOptions = {
    body: body,
    icon: payload.notification?.icon || "/icon.png",
    //data: { url: payload.data?.url || "http://localhost:3000" },
    data: { url: payload.data?.url || "https://rastreio-encomendas-correios.onrender.com" },
    requireInteraction: payload.notification?.requireInteraction || true,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
