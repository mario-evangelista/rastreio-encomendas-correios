# Rastreio de Encomendas - Frontend

Este é o frontend de uma aplicação web para rastreamento de encomendas dos Correios, desenvolvida com Vue.js e Vuetify. A aplicação permite aos usuários inserir códigos de rastreamento, visualizar o status das encomendas em tempo real e receber notificações push via Firebase Cloud Messaging (FCM).

## Descrição

A interface oferece:
- Um formulário para inserir códigos de rastreamento.
- Exibição detalhada do status, incluindo histórico completo.
- Notificações push para atualizações de status.
- Histórico de rastreamentos salvos localmente.

## Tecnologias Utilizadas

- **Vue.js**: Framework JavaScript para construção de interfaces.
- **Vuetify**: Framework de componentes UI baseado em Material Design.
- **Firebase**: Para notificações push (Cloud Messaging).
- **Axios**: Para chamadas HTTP ao backend.
- **Vite**: Ferramenta de build e desenvolvimento.

## Pré-requisitos

- Node.js (versão 16.x ou superior)
- npm (geralmente incluído com Node.js)
- Acesso à internet para carregar dependências e conectar ao backend

## Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/mario-evangelista/rastreio-encomendas-correios.git
   cd rastreio-encomendas-correios
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

2. Clone o repositório do Backend (Java 17 + Srping Boot):
   ```bash
   git ttps://github.com/mario-evangelista/api-proxy-labs-wonca.git
   ```   

3. Configure as variáveis de ambiente:
   - Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:
     ```
     VITE_API_BASE_URL=http://localhost:8080
     ```
   - Substitua `http://localhost:8080` pelo URL do seu backend em produção.

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   - Acesse `http://localhost:3000` no navegador.

## Configuração do Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/).
2. Habilite o Cloud Messaging e obtenha a chave VAPID.
3. Atualize o arquivo `firebase.js` com as credenciais do Firebase (substitua os valores em `firebaseConfig`).
4. Registre o Service Worker (`firebase-messaging-sw.js`) no diretório `public/`.
5. Documentação https://firebase.google.com/docs/cloud-messaging/js/client?hl=pt-br#web_1

## Uso

- Insira um código de rastreamento válido (ex.: `AA123456789BR`) no formulário.
- Códigos para Teste (AM001396702BR, AK701276615BR, ND510007744BR, AM414094794BR)
- Clique em "Rastrear" para visualizar os detalhes.
- Receba notificações push quando houver atualizações de status (requer permissão do navegador).
- Acesse o histórico de rastreamentos na seção correspondente.

## Estrutura do Projeto

```
rastreio-encomendas-frontend/
├── public/
│   ├── firebase-messaging-sw.js  # Service Worker para notificações
│   ├── icon.png                 # Ícone da notificação
│   └── badge.png                # Badge da notificação
├── src/
│   ├── assets/                 # Arquivos estáticos
│   ├── components/            # Componentes Vue
│   ├── firebase.js            # Configuração do Firebase
│   ├── App.vue                # Componente principal
│   └── main.js                # Ponto de entrada da aplicação
├── .env                       # Variáveis de ambiente
├── package.json              # Dependências e scripts
└── README.md                 # Este arquivo
```

## Demostração
https://rastreio-encomendas-correios.onrender.com
