<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const trackingCode = ref('')
const trackingResult = ref(null)
const error = ref('')
const loading = ref(false)
const trackingHistory = ref([])

const rules = [
  (value) => !!value || 'Código de rastreio é obrigatório',
  (value) => /^[A-Z]{2}\d{9}[A-Z]{2}$/.test(value) || 'Código deve ter 13 caracteres (ex: AA123456789BR)',
]

// Load tracking history from localStorage on mount
onMounted(() => {
  const savedHistory = localStorage.getItem('trackingHistory')
  if (savedHistory) {
    trackingHistory.value = JSON.parse(savedHistory)
  }
})

const trackPackage = async () => {
  error.value = ''
  trackingResult.value = null
  loading.value = true

  try {
    const response = await axios.post('/api/track', { code: trackingCode.value })
    //const response = await axios.post('https://api-proxy-labs-wonca.onrender.com/api/track', { code: trackingCode.value })

    const result = JSON.parse(response.data.json)
    console.log('Tracking Result:', result)

    if (result.erro) {
      error.value = result.mensagem || 'Erro ao consultar o rastreio. Verifique o código ou tente novamente.'
      trackingResult.value = null
      return
    }

    trackingResult.value = result
    if (trackingResult.value.eventos) {
      trackingResult.value.eventos.forEach(event => {
        console.log('Event Unidade:', event.unidade)
      })

      // Remove any existing history entry with the same codObjeto
      if (trackingResult.value.codObjeto) {
        trackingHistory.value = trackingHistory.value.filter(
          entry => entry.result.codObjeto !== trackingResult.value.codObjeto
        )
      }

      // Add the new entry to the history
      const historyEntry = {
        code: trackingCode.value,
        result: trackingResult.value,
        timestamp: new Date().toISOString(),
      }
      trackingHistory.value.unshift(historyEntry) // Add to the beginning of the array
      localStorage.setItem('trackingHistory', JSON.stringify(trackingHistory.value))
    }
  } catch (err) {
    error.value = 'Erro ao consultar o rastreio. Verifique o código ou tente novamente.'
    console.error('API Error:', err)
  } finally {
    loading.value = false
  }
}

const formatDateTime = (dateObj) => {
  if (!dateObj || !dateObj.date) return '-'
  const date = new Date(dateObj.date)
  return date.toLocaleString('pt-BR', { timeZone: dateObj.timezone || 'America/Sao_Paulo' })
}

const getLocation = (unidade) => {
  if (!unidade) return '-, -'
  const city = unidade.endereco?.cidade || unidade.nome || '-'
  const uf = unidade.endereco?.uf || '-'
  return `${city}, ${uf}`
}

const getTransitDays = () => {
  if (!trackingResult.value || !trackingResult.value.eventos) return { days: '-', label: 'dias' }

  const eventos = trackingResult.value.eventos
  const postagemEvent = eventos.find(event => event.descricaoFrontEnd === 'Postado')
  const entregaEvent = eventos.find(event => event.descricaoFrontEnd === 'ENTREGUE')

  if (!postagemEvent) return { days: '-', label: 'dias' }

  const startDate = new Date(postagemEvent.dtHrCriado.date)
  let endDate

  if (entregaEvent) {
    endDate = new Date(entregaEvent.dtHrCriado.date)
  } else {
    endDate = new Date()
  }

  const diffTime = endDate - startDate
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return { days: '-', label: 'dias' }

  const label = diffDays === 1 ? 'dia' : 'dias'
  return { days: diffDays, label }
}

const getEventColor = (event) => {
  if (event.finalizador === 'S') return 'success'
  if (event.descricaoFrontEnd === 'Postado') return 'teal'
  return 'primary'
}

// Function to view a history entry and scroll to top
const viewHistoryEntry = (entry) => {
  trackingCode.value = entry.code
  trackingResult.value = entry.result
  error.value = ''
  // Scroll to the top of the page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Format timestamp for display
const formatTimestamp = (timestamp) => {
  return new Date(timestamp).toLocaleString('pt-BR')
}

// Get the latest event status for history display
const getLatestStatus = (result) => {
  if (result && result.eventos && result.eventos.length > 0) {
    return result.eventos[0].descricaoFrontEnd || '-'
  }
  return '-'
}
</script>

<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card class="pa-4">
          <v-card-title class="text-h5">Rastreamento de Encomendas - Correios</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="trackPackage">
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
            <v-card v-if="trackingResult && !error" class="mt-4">
              <v-card-title>Detalhes do Rastreamento</v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" sm="6">
                    <strong>Código:</strong> {{ trackingResult.codObjeto || '-' }}
                  </v-col>
                  <v-col cols="12" sm="6">
                    <strong>Tipo:</strong> {{ trackingResult.tipoPostal?.descricao || '-' }}
                  </v-col>
                  <v-col cols="12" sm="6">
                    <strong>Categoria:</strong> {{ trackingResult.tipoPostal?.categoria || '-' }}
                  </v-col>
                  <v-col cols="12" sm="6">
                    <strong>Previsão de Entrega:</strong> {{ trackingResult.dtPrevista || '-' }}
                  </v-col>
                  <v-col cols="12" sm="6">
                    <strong>Situação:</strong>
                    <v-chip :color="trackingResult.situacao === 'E' ? 'success' : 'warning'">
                      {{ trackingResult.situacao === 'E' ? 'Entregue' : 'Em andamento' }}
                    </v-chip>
                    <span class="ml-2">
                      ({{ getTransitDays().days }} {{ getTransitDays().label }} em transporte)
                    </span>
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
            <!-- Tracking History Section -->
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

<style scoped>
.v-card {
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.v-card-title {
  font-weight: 500;
}

.v-timeline-item .v-card {
  margin-bottom: 16px;
}

/* Define the cosmic color */
:root {
  --cosmic-color: #6A1B9A;
  /* Deep purple, cosmic-inspired */
}

/* Apply cosmic color to the dot */
.v-timeline-item .v-timeline-dot:has(+ .v-card .v-card-title.text-cosmic) {
  background-color: var(--cosmic-color) !important;
}

/* Apply cosmic color to the title */
.text-cosmic {
  color: var(--cosmic-color) !important;
}

/* Apply cosmic color to the background */
.bg-cosmic {
  background-color: var(--cosmic-color) !important;
}

/* Adjust text color for better contrast on cosmic background */
.v-timeline-item .v-card.bg-cosmic .v-card-text {
  color: #fff;
  /* White text for better readability on dark purple background */
}

/* Style for history items */
.history-item {
  cursor: pointer;
  transition: background-color 0.2s;
  padding: 16px;
  /* Increased padding for more separation */
  margin-bottom: 8px;
  /* Space between items */
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  /* Subtle separator */
}

.history-item:last-child {
  border-bottom: none;
  /* Remove separator for the last item */
}

.history-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

/* Add spacing between subtitle lines */
.history-subtitle {
  margin-bottom: 8px;
  /* Space between lines within an item */
}

@media (max-width: 600px) {
  .v-card {
    padding: 12px;
  }

  .v-card-title {
    font-size: 1.25rem;
  }

  .history-item {
    padding: 12px;
  }
}
</style>
