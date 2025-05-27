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
   git clone https://github.com/seu-usuario/rastreio-encomendas-frontend.git
   cd rastreio-encomendas-frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
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

## Uso

- Insira um código de rastreamento válido (ex.: `AA123456789BR`) no formulário.
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

## Contribuindo

1. Faça um fork do repositório.
2. Crie uma branch para sua feature:
   ```bash
   git checkout -b feature/nova-funcionalidade
   ```
3. Commit suas mudanças:
   ```bash
   git commit -m "Adiciona nova funcionalidade"
   ```
4. Envie para o repositório remoto:
   ```bash
   git push origin feature/nova-funcionalidade
   ```
5. Abra um Pull Request.

## Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## Contato

Para dúvidas ou sugestões, entre em contato em [seu-email@exemplo.com](mailto:seu-email@exemplo.com) ou abra uma issue no GitHub.

---

Última atualização: 27/05/2025 19:35 -03
```

---

### README.md para o Backend (Spring Boot)

```markdown
# Rastreio de Encomendas - Backend

Este é o backend de uma aplicação para rastreamento de encomendas dos Correios, desenvolvido com Spring Boot. O backend fornece uma API REST para consultar status de encomendas, gerenciar dados de rastreamento e enviar notificações push via Firebase Cloud Messaging (FCM).

## Descrição

O backend oferece:
- Consulta de status de encomendas via API externa dos Correios.
- Registro de tokens FCM para envio de notificações.
- Envio de notificações push com atualizações de status.
- Armazenamento de histórico de rastreamentos no banco de dados.

## Tecnologias Utilizadas

- **Spring Boot**: Framework Java para desenvolvimento backend.
- **Spring Data JPA**: Para persistência de dados.
- **Firebase Admin SDK**: Para envio de notificações push.
- **Maven**: Gerenciador de dependências e build.
- **H2 Database** (ou outro banco configurado): Para armazenamento local (opcional em produção).

## Pré-requisitos

- Java 17 (ou superior)
- Maven (versão 3.6.x ou superior)
- Acesso à internet para carregar dependências e conectar à API dos Correios
- Credenciais do Firebase (chave privada do Admin SDK)

## Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/rastreio-encomendas-backend.git
   cd rastreio-encomendas-backend
   ```

2. Configure as credenciais do Firebase:
   - Baixe o arquivo JSON do Admin SDK no [Firebase Console](https://console.firebase.google.com/).
   - Coloque o arquivo em `src/main/resources/firebase-service-account.json`.

3. Configure as variáveis de ambiente:
   - Crie um arquivo `application.properties` em `src/main/resources` com o seguinte conteúdo:
     ```
     spring.datasource.url=jdbc:h2:mem:testdb
     spring.datasource.driverClassName=org.h2.Driver
     spring.datasource.username=sa
     spring.datasource.password=
     spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
     spring.h2.console.enabled=true
     ```
   - Para produção, ajuste o `spring.datasource.url` para seu banco de dados (ex.: PostgreSQL).

4. Instale as dependências e compile o projeto:
   ```bash
   mvn clean install
   ```

5. Inicie a aplicação:
   ```bash
   mvn spring-boot:run
   ```
   - A API estará disponível em `http://localhost:8080`.

## Endpoints da API

- `POST /api/track`: Consulta o status de um código de rastreamento.
  - Body: `{ "code": "AA123456789BR" }`
  - Response: JSON com os dados do rastreamento.

- `POST /api/register-push-token`: Registra um token FCM para notificações.
  - Body: `{ "trackingCode": "AA123456789BR", "pushToken": "TOKEN_FCM" }`

- `POST /api/test-updates`: Envia uma notificação de teste (para desenvolvimento).

## Configuração do Firebase

1. Adicione o arquivo `firebase-service-account.json` ao projeto.
2. Certifique-se de que o método `initializeFirebase()` no `FirebaseConfig.java` está configurado corretamente.

## Uso

- O backend verifica atualizações de status automaticamente via o método `checkForUpdates()` (configurado com `@Scheduled`).
- Notificações push são enviadas quando o status muda, incluindo o novo status, código de rastreamento e data/hora atual.

## Estrutura do Projeto

```
rastreio-encomendas-backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   ├── com/example/rastreio/  # Pacote principal
│   │   │   │   ├── config/          # Configurações (ex.: FirebaseConfig.java)
│   │   │   │   ├── controller/      # Controladores REST
│   │   │   │   ├── entity/          # Entidades JPA
│   │   │   │   ├── repository/      # Repositórios JPA
│   │   │   │   ├── service/         # Serviços de negócio
│   │   │   │   └── TrackingService.java # Lógica principal
│   │   ├── resources/
│   │   │   ├── application.properties # Configurações
│   │   │   └── firebase-service-account.json # Credenciais Firebase
├── pom.xml                       # Dependências Maven
└── README.md                    # Este arquivo
```

## Contribuindo

1. Faça um fork do repositório.
2. Crie uma branch para sua feature:
   ```bash
   git checkout -b feature/nova-funcionalidade
   ```
3. Commit suas mudanças:
   ```bash
   git commit -m "Adiciona nova funcionalidade"
   ```
4. Envie para o repositório remoto:
   ```bash
   git push origin feature/nova-funcionalidade
   ```
5. Abra um Pull Request.

## Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## Contato

Para dúvidas ou sugestões, entre em contato em [seu-email@exemplo.com](mailto:seu-email@exemplo.com) ou abra uma issue no GitHub.

---

Última atualização: 27/05/2025 19:35 -03
```

---

### Notas
- **Personalização**: Substitua `seu-usuario`, `YOUR_API_KEY`, e outros placeholders pelos valores reais do seu projeto.
- **Horário**: Os arquivos refletem a data e hora atuais (27/05/2025 19:35 -03).
- **Estrutura**: As estruturas de diretórios são baseadas no contexto fornecido; ajuste conforme necessário.

Esses `README.md` fornecem uma documentação clara e detalhada para ambos os lados do projeto no GitHub. Se precisar de ajustes ou mais detalhes, é só pedir!
