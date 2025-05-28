<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card class="pa-4">
          <v-card-title class="text-h2 text-center">
            <a href="#" @click.prevent="refreshPage" class="text-decoration-none" color="white"
              style="color: white !important;">
              Trackin - App
            </a>
          </v-card-title>
          <v-card-title class="text-h5 text-center">Rastreamento de Encomendas - Correios</v-card-title>
          <v-card-text>
            <v-form ref="form" @submit.prevent="trackPackage">
              <v-text-field v-model="trackingCode" label="Código de Rastreio" placeholder="Ex: AA123456789BR"
                :rules="rules" counter="13" maxlength="13" prepend-inner-icon="mdi-package-variant"
                :disabled="loading"></v-text-field>
              <v-btn type="submit" color="primary" block :loading="loading" :disabled="!trackingCode || loading">
                Rastrear
              </v-btn>
            </v-form>
            <v-alert v-if="error" type="error" class="mt-4" dismissible @update:model-value="error = ''">
              {{ error }}
            </v-alert>
            <v-snackbar v-model="snackbar" :timeout="5000" color="info" location="top">
              {{ notificationMessage }}
              <template v-slot:actions>
                <v-btn color="white" variant="text" @click="snackbar = false">
                  Fechar
                </v-btn>
              </template>
            </v-snackbar>
            <v-card v-if="trackingResult && !error" class="mt-4">
              <v-card-title>Detalhes do Rastreamento</v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" sm="6">
                    <strong>Código:</strong> {{ trackingResult.codObjeto || '-' }}
                  </v-col>
                  <v-col cols="12" sm="6">
                    <strong>Tipo:</strong> {{ trackingResult.tipoPostal?.descripcion || '-' }}
                  </v-col>
                  <v-col cols="12" sm="6">
                    <strong>Categoria:</strong> {{ trackingResult.tipoPostal?.categoria || '-' }}
                  </v-col>
                  <v-col cols="12" sm="6">
                    <strong>Previsão de Entrega:</strong> {{ trackingResult.dtPrevista || '-' }}
                  </v-col>
                  <v-col cols="12" sm="6">
                    <strong>Situação:</strong>
                    <v-chip
                      :color="trackingResult.situacao === 'E' ? 'success' : trackingResult.situacao === 'T' ? 'warning' : 'info'">
                      {{ trackingResult.situacao === 'E' ? 'Entregue' : trackingResult.situacao === 'T' ? 'Em trânsito'
                        :
                        'Desconhecida' }}
                    </v-chip>
                    <span class="ml-2">
                      ({{ getTransitDays().days }} {{ getTransitDays().label }} em transporte)
                    </span>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <strong>Modalidade:</strong> {{ trackingResult.modalidade === 'F' ? 'PAC' : 'Desconhecida' }}
                  </v-col>
                  <v-col cols="12" sm="6">
                    <strong>Bloqueio:</strong>
                    <v-chip :color="trackingResult.bloqueioObjeto ? 'error' : 'success'">
                      {{ trackingResult.bloqueioObjeto ? 'Sim' : 'Não' }}
                    </v-chip>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <strong>Atrasado:</strong>
                    <v-chip :color="trackingResult.atrasado ? 'error' : 'success'">
                      {{ trackingResult.atrasado ? 'Sim' : 'Não' }}
                    </v-chip>
                  </v-col>
                </v-row>
                <v-divider class="my-4"></v-divider>
                <h3>Eventos</h3>
                <v-timeline side="end" density="compact">
                  <v-timeline-item v-for="(event, index) in trackingResult.eventos" :key="index"
                    :dot-color="getEventColor(event)">
                    <v-card :class="event.descricaoFrontEnd === 'Postado' ? 'bg-cosmic' : ''">
                      <v-card-title
                        :class="getEventColor(event) === 'cosmic' ? 'text-cosmic' : `text-${getEventColor(event)}`">
                        {{ event.descricaoFrontEnd || '-' }}
                      </v-card-title>
                      <v-card-text>
                        <p><strong>Data/Hora:</strong> {{ formatDateTime(event.dtHrCriado) }}</p>
                        <p><strong>Local:</strong> {{ getLocation(event.unidade) }}</p>
                        <p><strong>Detalhes:</strong> {{ event.detalhe || '-' }}</p>
                        <p v-if="event.unidadeDestino">
                          <strong>Destino:</strong> {{ getLocation(event.unidadeDestino) }}
                        </p>
                      </v-card-text>
                    </v-card>
                  </v-timeline-item>
                </v-timeline>
              </v-card-text>
            </v-card>
            <v-card v-if="trackingHistory.length > 0" class="mt-4">
              <v-card-title>Histórico de Rastreamento</v-card-title>
              <v-list>
                <v-list-item v-for="(entry, index) in trackingHistory" :key="index" @click="viewHistoryEntry(entry)"
                  class="history-item">
                  <v-list-item-title class="text-primary">
                    {{ entry.code }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="history-subtitle">
                    <strong>Último Status:</strong>
                    <span :class="getLatestStatus(entry.result) === 'ENTREGUE' ? 'text-success' : ''">
                      {{ getLatestStatus(entry.result) }}
                    </span>
                  </v-list-item-subtitle>
                  <v-list-item-subtitle class="history-subtitle">
                    <strong>Rastreamento em:</strong> {{ formatTimestamp(entry.timestamp) }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { messaging, solicitarToken, onMessage } from "@/firebase";

const trackingCode = ref("");
const trackingResult = ref(null);
const error = ref("");
const loading = ref(false);
const trackingHistory = ref([]);
const pushToken = ref(null);
const snackbar = ref(false);
const notificationMessage = ref("");
const valid = ref(false);
const form = ref(null);

// Configuração do ambiente - API de Middleware
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// Regras de validação para código de rastreamento
const rules = [
  (value) => !!value || "Código de rastreio é obrigatório",
  (value) => /^[A-Z]{2}\d{9}[A-Z]{2}$/.test(value) || "Código deve ter 13 caracteres (ex: AA123456789BR)",
];

// Obter token FCM - Firebase Cloud Messaging - Google
const getFCMToken = async () => {
  try {
    const savedToken = localStorage.getItem("pushSubscriptionId");
    if (savedToken) {
      console.log("🔁 Token FCM reutilizado do localStorage:", savedToken);
      pushToken.value = savedToken;
      return savedToken;
    }

    const vapidKey = "BK9SnBv4o6WH83EoTlFLmGorhKa_1b9GoG3iSvAQ_HvUFtX5CjJHR1vB08emtbFH6iGEai-Sq-GfJj0qbrd_39w";
    const registration = await navigator.serviceWorker.getRegistration("/firebase-messaging-sw.js");
    if (!registration) {
      console.error("❌ Service Worker não registrado");
      error.value = "Service Worker não registrado. Notificações não disponíveis.";
      return null;
    }

    const token = await solicitarToken(vapidKey, registration);
    if (token) {
      console.log("✅ Token FCM armazenado:", token);
      pushToken.value = token;
      localStorage.setItem("pushSubscriptionId", token);
      await registerPushToken(token, trackingCode.value);
      return token;
    } else {
      console.warn("⚠️ Nenhum token FCM recuperado. Permissão pode não ter sido concedida.");
      error.value = "Não foi possível obter o token de notificação.";
      return null;
    }
  } catch (err) {
    console.error("❌ Erro ao obter token FCM:", err);
    localStorage.removeItem("pushSubscriptionId");
    error.value = `Erro ao obter token de notificação: ${err.message}`;
    return null;
  }
};

// Registra o token FCM no backend
const registerPushToken = async (token, code) => {
  try {
    await axios.post(`${API_BASE_URL}/api/register-push-token`, {
      trackingCode: code,
      pushToken: token,
    });
    console.log("✅ Token FCM registrado para o código:", code);
  } catch (err) {
    console.warn("⚠️ Falha ao registrar token FCM:", err.response?.data || err.message);
    error.value = `Falha ao registrar token: ${err.response?.data?.message || err.message}`;
  }
};

// Configura as notificações em primeiro plano
const setupForegroundNotifications = () => {
  console.log("🔧 Configurando listener de mensagens em foreground...");
  try {
    onMessage(messaging, (payload) => {
      console.log("📩 Mensagem recebida em foreground:", payload);
      const title = payload.notification?.title || "Nova Atualização";
      const status = payload.notification?.body || "Seu pacote foi atualizado";

      // Extrai o código de rastreamento da URL ou do payload
      const url = payload.data?.url || "";
      const trackingCodeMatch = url.match(/code=([A-Z0-9]+)/);
      const trackingCodeFromPayload = trackingCodeMatch ? trackingCodeMatch[1] : "Desconhecido";

      // Obter data/hora atual no formato brasileiro
      const now = new Date();
      const currentDateTime = now.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

      // Construir a mensagem com status, código e data/hora
      const body = `${status}\nCódigo: ${trackingCodeFromPayload}\nData/Hora: ${currentDateTime}`;

      const options = {
        body: body,
        icon: "/icon.png",
        badge: "/badge.png",
        data: { url: payload.data?.url || "http://localhost:3000" },
        requireInteraction: true,
      };

      // Verifica as permissões antes de exibir
      if (Notification.permission !== "granted") {
        console.warn("⚠️ Permissão de notificação não concedida para exibir em foreground.");
        notificationMessage.value = body;
        snackbar.value = true;
        return;
      }

      try {
        const notification = new Notification(title, options);
        console.log("✅ Notificação em foreground exibida com sucesso:", notification);
        notificationMessage.value = body;
        snackbar.value = true;

        // Adiciona um evento de clique para redirecionar
        notification.onclick = (event) => {
          event.preventDefault();
          window.open(options.data.url, "_blank");
        };
      } catch (err) {
        console.error("❌ Erro ao exibir notificação em foreground:", err);
        error.value = "Erro ao exibir notificação: " + err.message;
        notificationMessage.value = body;
        snackbar.value = true;
      }
    });
    console.log("✅ Listener de mensagens em foreground configurado com sucesso.");
  } catch (err) {
    console.error("❌ Erro ao configurar listener de mensagens em foreground:", err);
    error.value = `Erro ao configurar notificações em foreground: ${err.message}`;
  }
};

// Iniciaando as notificações
const initializeNotifications = async () => {
  try {
    if ("Notification" in window) {
      console.log("🔍 Verificando permissões de notificação...");
      if (Notification.permission === "granted") {
        console.log("✅ Permissão de notificação já concedida.");
        const token = await getFCMToken();
        if (token) {
          setupForegroundNotifications();

          // Teste manual para verificar se onMessage funciona
          console.log("🔍 Testando recebimento de mensagens em foreground...");
          onMessage(messaging, (testPayload) => {
            console.log("📩 Teste: Mensagem recebida em foreground (teste adicional):", testPayload);
          });
        }
      } else if (Notification.permission !== "denied") {
        console.log("📢 Solicitando permissão de notificação...");
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          console.log("✅ Permissão de notificação concedida.");
          const token = await getFCMToken();
          if (token) {
            setupForegroundNotifications();

            // Teste manual para verificar se onMessage funciona
            console.log("🔍 Testando recebimento de mensagens em foreground...");
            onMessage(messaging, (testPayload) => {
              console.log("📩 Teste: Mensagem recebida em foreground (teste adicional):", testPayload);
            });
          }
        } else {
          console.warn("ℹ️ Permissão de notificação negada pelo usuário.");
          error.value = "Permissão de notificação negada.";
        }
      } else {
        console.warn("⚠️ Permissão de notificação negada permanentemente.");
        error.value = "Permissões de notificação negadas permanentemente.";
      }
    } else {
      console.warn("⚠️ Este navegador não suporta notificações.");
      error.value = "Notificações não são suportadas neste navegador.";
    }
  } catch (err) {
    console.error("❌ Erro ao inicializar notificações:", err);
    error.value = `Erro ao inicializar notificações push: ${err.message}`;
  }
};

// Iniciar na montagem do componente
onMounted(async () => {
  // Carrega o histórico de rastreamento
  const savedHistory = localStorage.getItem("trackingHistory");
  if (savedHistory) {
    try {
      trackingHistory.value = JSON.parse(savedHistory);
      trackingHistory.value = trackingHistory.value.map(entry => {
        if (entry.timestamp && new Date(entry.timestamp).toString() === "Data Inválida") {
          const match = entry.timestamp.match(/^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2})$/);
          if (match) {
            const [_, day, month, year, hour, minute, second] = match;
            entry.timestamp = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}-03:00`).toISOString();
          } else {
            entry.timestamp = new Date().toISOString();
          }
        }
        return entry;
      });
      localStorage.setItem("trackingHistory", JSON.stringify(trackingHistory.value));
    } catch (err) {
      console.error("❌ Erro ao carregar histórico:", err);
    }
  }

  await initializeNotifications();
});

const trackPackage = async () => {
  error.value = "";
  trackingResult.value = null;
  loading.value = true;

  try {
    const response = await axios.post(`${API_BASE_URL}/api/track`, { code: trackingCode.value });
    console.log("📦 Resposta bruta /api/track:", response);

    if (!response.data || typeof response.data !== "object" || !("json" in response.data)) {
      throw new Error("Resposta inválida do servidor: campo 'json' ausente ou malformado.");
    }

    let result;
    try {
      const jsonString = response.data.json.trim();
      if (typeof jsonString !== "string") throw new Error("Campo JSON não é uma string.");
      result = JSON.parse(jsonString);
    } catch (parseErr) {
      throw new Error(`Erro ao interpretar resposta JSON: ${parseErr.message}`);
    }

    if (result.erro) {
      error.value = result.mensagem || "Erro ao consultar o rastreio.";
      return;
    }

    trackingResult.value = result;

    if (trackingResult.value.eventos) {
      if (trackingResult.value?.codObjeto) {
        trackingHistory.value = trackingHistory.value.filter(
          (entry) => entry.result.codObjeto !== trackingResult.value?.codObjeto
        );
      }

      const historyEntry = {
        code: trackingCode.value,
        result: trackingResult.value,
        timestamp: new Date().toISOString(),
      };
      trackingHistory.value.unshift(historyEntry);
      localStorage.setItem("trackingHistory", JSON.stringify(trackingHistory.value));

      const token = pushToken.value || (await getFCMToken());
      if (token) {
        await registerPushToken(token, trackingCode.value);
      } else {
        console.warn("⚠️ Nenhum token FCM disponível para registrar.");
      }
    }
  } catch (err) {
    error.value = err.response?.data?.message || `Erro ao consultar o rastreio: ${err.message}`;
    console.error("❌ Erro de rastreamento:", err);
  } finally {
    loading.value = false;
    if (form.value) form.value.resetValidation();
  }
};

// Formata data e hora
const formatDateTime = (dateObj) => {
  if (!dateObj?.date) return "-";
  const date = new Date(dateObj.date.replace(" ", "T"));
  return date.toLocaleString("pt-BR", { timeZone: dateObj?.timezone || "America/Sao_Paulo" });
};

// Obtem localização
const getLocation = (unidade) => {
  if (!unidade) return "-, -";
  const city = unidade.endereco?.cidade || unidade.nome || "-";
  const uf = unidade.endereco?.uf || "-";
  return `${city}, ${uf}`;
};

// Calcular os dias em trânsito
const getTransitDays = () => {
  const eventos = trackingResult.value?.eventos || [];
  const postagem = eventos.find((e) => e.descricaoFrontEnd === "Postado");
  const entrega = eventos.find((e) => e.descricaoFrontEnd === "ENTREGUE");

  if (!postagem) return { days: "-", label: "dias" };

  const start = new Date(postagem.dtHrCriado.date.replace(" ", "T"));
  const end = entrega ? new Date(entrega.dtHrCriado.date.replace(" ", "T")) : new Date();

  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return { days: diff, label: diff === 1 ? "dia" : "dias" };
};

// Obtem a cor do evento
const getEventColor = (event) => {
  if (event?.finalizador === "S") return "success";
  if (event?.descricaoFrontEnd === "Postado") return "teal";
  return "primary";
};

// Voltar para o topo
const viewHistoryEntry = (entry) => {
  trackingCode.value = entry.code;
  trackingResult.value = entry.result;
  error.value = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// Formata a data/hora
const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    console.warn("⚠️ Timestamp inválido:", timestamp);
    return "-";
  }
  return date.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
};

// Status mais recente
const getLatestStatus = (result) => {
  return result?.eventos?.[0]?.descricaoFrontEnd || "-";
};

// Ao clicar no titulo - Atualizar página e limpar formulário
const refreshPage = () => {
  trackingCode.value = ""; // Limpa o campo de entrada
  if (form.value) {
    form.value.reset(); // Reseta o formulário (limpa validações e valores)
    form.value.resetValidation(); // Limpa mensagens de validação
  }
  trackingResult.value = null; // Limpa os resultados do rastreamento
  error.value = ""; // Limpa mensagens de erro
  window.location.reload(); // Atualiza a página
};
</script>

<style scoped>
.v-card {
  border-radius: 8px !important;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
}

.v-card-title {
  font-weight: 500 !important;
}

.v-card-title.text-h5 {
  text-align: center;
}

.v-card-title.text-h2 {
  text-align: center;
}

.v-timeline-item .v-card {
  margin-bottom: 16px;
}

:root {
  --cosmic-color: #6A1B9A;
}

.v-timeline-item .v-timeline-dot:has(+ .v-card .v-card-title.text-cosmic) {
  background-color: var(--cosmic-color) !important;
}

.text-cosmic {
  color: var(--cosmic-color) !important;
}

.bg-cosmic {
  background-color: var(--cosmic-color) !important;
}

.v-timeline-item .v-card.bg-cosmic .v-card-text {
  color: #fff !important;
}

.history-item {
  cursor: pointer;
  transition: background-color 0.2s;
  padding: 16px;
  margin-bottom: 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.history-item:last-child {
  border-bottom: none;
}

.history-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.history-subtitle {
  margin-bottom: 8px;
}

@media (max-width: 600px) {
  .v-card {
    padding: 12px !important;
  }

  .v-card-title {
    font-size: 1.25rem !important;
  }

  .history-item {
    padding: 12px;
  }
}
</style>
