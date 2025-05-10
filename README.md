# Aplicação de Rastreamento de Encomendas - Correios

Este projeto é uma aplicação web para rastreamento de encomendas através da API dos Correios (serviço postal brasileiro). Possui um front-end em Vue.js com Vuetify para uma interface responsiva e um back-end em Spring Boot para lidar com requisições à API de forma segura.

## Funcionalidades
- **Rastrear Encomendas**: Insira um código de rastreamento (ex.: `ND510007744BR`) para ver o status e o histórico de eventos da encomenda.
- **Histórico de Rastreamento**: Salva o histórico de rastreamentos no `localStorage`, exibindo consultas anteriores com entradas clicáveis para ver detalhes.
- **Linha do Tempo Visual**: Exibe os eventos de rastreamento em uma linha do tempo com cores diferenciadas (ex.: verde para "Entregue", roxo cósmico para "Postado").
- **Design Responsivo**: Funciona em dispositivos desktop e móveis.

## Tecnologias Utilizadas
- **Front-End**: Vue.js 3, Vuetify 3, Axios
- **Back-End**: Spring Boot (Java), Maven
- **API**: API SRO dos Correios (via proxy)
- **API**: (https://labs.wonca.com.br/)

## Pré-requisitos
- **Node.js**: Versão 14.x ou superior
- **npm**: Versão 6.x ou superior
- **Java**: JDK 11 ou superior
- **Maven**: Versão 3.6.x ou superior
- **Chave de API dos Correios**: Obtenha uma chave de API dos Correios para requisições de rastreamento.

## Instruções de Configuração

### Clonar o Repositório
```bash
git clone https://github.com/mario-evangelista/aplicacao-rastreamento-correios.git
cd aplicacao-rastreamento-correios
```

### Configuração do Back-End
1. **Navegue até o Diretório do Back-End**:
   ```bash
   cd backend
   ```
   *(Nota: Ajuste o nome do diretório se for diferente.)*

2. **Configure a Chave de API**:
   - Abra o arquivo `src/main/resources/application.properties`.
   - Adicione sua chave de API dos Correios:
     ```properties
     correios.api.key=sua-chave-de-api-aqui
     ```

3. **Execute o Back-End**:
   ```bash
   mvn spring-boot:run
   ```
   - O back-end será executado em `http://localhost:8080`.

### Configuração do Front-End
1. **Navegue até o Diretório do Front-End**:
   ```bash
   cd frontend
   ```
   *(Nota: Ajuste o nome do diretório se for diferente.)*

2. **Instale as Dependências**:
   ```bash
   npm install
   ```

3. **Execute o Front-End**:
   ```bash
   npm run dev
   ```
   - O front-end será executado em `http://localhost:3000`.

## Como Usar
1. Abra `http://localhost:3000/track` no seu navegador.
2. Insira um código de rastreamento válido dos Correios (ex.: `ND510007744BR`).
3. Clique em "Rastrear" para ver os detalhes do rastreamento.
4. Veja o histórico de rastreamento abaixo do formulário; clique em qualquer entrada para ver seus detalhes (a página rolará automaticamente para o topo).

## Capturas de Tela
*(Adicione capturas de tela da aplicação aqui, por exemplo, o formulário de rastreamento, a linha do tempo e a seção de histórico.)*

## Estrutura do Projeto
- **backend/**: Aplicação Spring Boot
  - `src/main/java/com/example/proxy/`: Arquivos fonte em Java
  - `src/main/resources/application.properties`: Arquivo de configuração
- **frontend/**: Aplicação Vue.js
  - `src/pages/Track.vue`: Página principal de rastreamento
  - `src/plugins/vuetify.js`: Configuração do Vuetify
  - `src/styles/`: Estilos personalizados

## Personalização
- **Tema Cósmico**: O evento "Postado" usa uma cor roxa cósmica (`#6A1B9A`). Modifique o `--cosmic-color` em `Track.vue` para alterar isso.
- **Exibição do Histórico**: As cores e o espaçamento da seção de histórico podem ser ajustados na seção `<style>` de `Track.vue`.

## Implantação
- **Back-End**:
  - Gere o arquivo JAR: `mvn clean package`
  - Implante em um servidor ou plataforma na nuvem (ex.: Heroku, AWS).
  - Atualize o `@CrossOrigin` no controlador Spring Boot para corresponder à URL do seu front-end.
- **Front-End**:
  - Gere a build para produção: `npm run build`
  - Implante a pasta `dist` em um serviço de hospedagem estática (ex.: Netlify, Vercel).
  - Atualize a URL da API em `Track.vue` (requisições axios) para apontar para o seu back-end.

## Notas de Segurança
- Proteja a chave de API em `application.properties` usando variáveis de ambiente em produção.
- Certifique-se de que o back-end aceita apenas requisições do domínio do seu front-end (atualize o `@CrossOrigin`).

## Melhorias Futuras
- Adicionar um botão "Limpar Histórico" para resetar o histórico de rastreamento.
- Implementar um spinner de carregamento para eventos individuais na linha do tempo.
- Adicionar suporte para rastreamento de múltiplos códigos ao mesmo tempo.

## Contribuição
1. Faça um fork do repositório.
2. Crie uma branch para sua funcionalidade: `git checkout -b nome-da-funcionalidade`
3. Faça commit das suas alterações: `git commit -m "Adiciona funcionalidade"`
4. Envie para a branch: `git push origin nome-da-funcionalidade`
5. Abra um pull request.

## Licença
Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## Contato
Para perguntas ou sugestões, abra uma issue ou entre em contato comigo em mariojbe@gmail.com.
