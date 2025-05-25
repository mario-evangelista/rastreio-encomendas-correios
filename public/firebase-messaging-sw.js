// public/firebase-messaging-sw.js (excerpt)
self.addEventListener("notificationclick", function (event) {
  console.log(
    "[firebase-messaging-sw.js] Notificação clicada:",
    event.notification.data
  );
  event.notification.close();

  const urlToOpen = event.notification.data?.url || "http://localhost:3000";
  try {
    new URL(urlToOpen);
  } catch (err) {
    console.warn("URL inválida na notificação:", urlToOpen);
    return;
  }

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        for (const client of clientList) {
          if (
            client.url.includes(new URL(urlToOpen).origin) &&
            "focus" in client
          ) {
            console.log(
              "[firebase-messaging-sw.js] Focando janela existente:",
              client.url
            );
            client.focus();
            if (client.url !== urlToOpen) {
              client.navigate(urlToOpen);
            }
            return;
          }
        }
        console.log(
          "[firebase-messaging-sw.js] Abrindo nova janela:",
          urlToOpen
        );
        return clients.openWindow(urlToOpen).then((windowClient) => {
          if (windowClient && "focus" in windowClient) {
            setTimeout(() => windowClient.focus(), 100); // Delayed focus for Windows 11
          }
        });
      })
      .catch((err) => {
        console.error("Erro ao processar clique na notificação:", err);
      })
  );
});
