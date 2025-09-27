# 📄 Documentação Geral do Front-end – NEOX

##  Visão Geral e Tecnologias

O front-end do **NEOX** é uma **Single-Page Application (SPA)** moderna e reativa, construída para oferecer uma experiência rápida, fluida e visualmente agradável.  
A arquitetura foi desenhada para ser **escalável** e de **fácil manutenção**.

- **Framework Principal:** React 18  
- **Linguagem:** TypeScript  
- **Build Tool:** Vite  
- **Estilização:** Tailwind CSS + Shadcn UI (baseado em Radix UI)  
- **Roteamento:** React Router DOM  
- **Gestão de Estado do Servidor:** TanStack Query (React Query)  
- **Gestão de Estado Global:** React Context API (AuthContext)  
- **Validação de Formulários:** Zod + React Hook Form  

---

## 📂 Estrutura de Pastas (corrigida)

```
/neox-frontend
|
|-- 📁 src/
|   |-- 📁 components/
|   |   |-- 📁 ui/                     # Componentes base (shadcn: Button, Card, etc.)
|   |   |   |-- accordion.tsx
|   |   |   |-- alert.tsx
|   |   |   |-- badge.tsx
|   |   |   |-- button.tsx
|   |   |   |-- card.tsx
|   |   |   |-- checkbox.tsx
|   |   |   |-- dialog.tsx
|   |   |   |-- dropdown-menu.tsx
|   |   |   |-- input.tsx
|   |   |   |-- label.tsx
|   |   |   |-- select.tsx
|   |   |   |-- skeleton.tsx
|   |   |   |-- switch.tsx
|   |   |   |-- table.tsx
|   |   |   |-- tabs.tsx
|   |   |   |-- textarea.tsx
|   |   |   |-- toast.tsx
|   |   |   |-- toaster.tsx
|   |   |   |-- tooltip.tsx
|   |   |
|   |   |-- AppShell.tsx              # Estrutura principal da navegação (sidebar, header)
|   |   |-- AuthGuard.tsx             # Protege rotas que exigem apenas autenticação
|   |   |-- DocumentUploadModal.tsx   # Modal para upload de documentos
|   |   |-- LoadingOverlay.tsx        # Indicador de carregamento global para chamadas de API
|   |   |-- MetricCard.tsx            # Cartão para exibir métricas nos dashboards
|   |   |-- ProductAdminCard.tsx      # Cartão de produto para a área de gestão
|   |   |-- ProductForm.tsx           # Formulário para criar/editar produtos
|   |   |-- RevenueChart.tsx          # Gráfico para dashboards
|   |   |-- RoleGuard.tsx             # Protege rotas baseadas no perfil do utilizador (Role)
|   |   |-- StatsWidget.tsx           # Widget de estatísticas
|   |
|   |-- 📁 contexts/
|   |   |-- AuthContext.tsx           # Contexto para dados de autenticação do utilizador
|   |
|   |-- 📁 hooks/
|   |   |-- use-toast.ts              # Hook para exibir notificações (toasts)
|   |   |-- useDebounce.ts            # Hook para atrasar a execução de uma função (ex: pesquisa)
|   |
|   |-- 📁 lib/
|   |   |-- utils.ts                  # Funções utilitárias e helpers (ex: cn, formatCurrency)
|   |
|   |-- 📁 pages/
|   |   |-- 📁 admin/                 # Páginas do painel administrativo
|   |   |   |-- login.tsx
|   |   |   |-- stores.tsx
|   |   |   |-- videos.tsx
|   |   |
|   |   |-- 📁 auth/                  # Páginas e componentes de autenticação
|   |   |   |-- 📁 components/         # Componentes específicos para autenticação
|   |   |   |   |-- 📁 registration/   # Componentes para o fluxo de registo de empreendedor
|   |   |   |   |   |-- PersonalDataStep.tsx
|   |   |   |   |   |-- RegistrationSuccess.tsx
|   |   |   |   |   |-- StoreDataStep.tsx
|   |   |   |   |   |-- VerificationStep.tsx
|   |   |   |   |
|   |   |   |   |-- auth-page.tsx
|   |   |   |   |-- EntrepreneurRegistration.tsx
|   |   |   |   |-- FloatingIcons.tsx
|   |   |   |   |-- LoginForm.tsx
|   |   |   |   |-- RegisterForm.tsx
|   |   |   |   |-- RoleSelector.tsx
|   |   |   |
|   |   |   |-- index.tsx             # Página principal de autenticação
|   |   |   |-- login.tsx
|   |   |   |-- register.tsx
|   |   |
|   |   |-- 📁 client/                # Páginas do portal do cliente
|   |   |   |-- cart.tsx
|   |   |   |-- dashboard.tsx
|   |   |   |-- home.tsx
|   |   |   |-- product.tsx
|   |   |   |-- store.tsx
|   |   |
|   |   |-- 📁 errors/                # Páginas de erro (404, 403)
|   |   |   |-- not-found.tsx
|   |   |   |-- unauthorized.tsx
|   |   |
|   |   |-- 📁 painel/                # Páginas do dashboard do empreendedor
|   |   |   |-- ajuda.tsx
|   |   |   |-- clientes.tsx
|   |   |   |-- configuracoes.tsx
|   |   |   |-- dashboard.tsx
|   |   |   |-- estoque.tsx
|   |   |   |-- financeiro.tsx
|   |   |   |-- integracoes.tsx
|   |   |   |-- marketing.tsx
|   |   |   |-- pedidos.tsx
|   |   |   |-- relatorios.tsx
|   |   |   |-- trends.tsx
|   |   |
|   |   |-- 📁 products/
|   |   |   |-- form.tsx
|   |   |   |-- index.tsx
|   |   |
|   |   |-- profile.tsx               # Página de perfil do utilizador
|   |
|   |-- 📁 services/                  # Lógica de comunicação com a API (atualmente com dados mocados)
|   |   |-- ApiProducts.ts
|   |   |-- AuthService.ts
|   |   |-- ClientsService.ts
|   |   |-- DashboardService.ts
|   |   |-- FeedbackService.ts
|   |   |-- FinancialService.ts
|   |   |-- HelpService.ts
|   |   |-- IntegrationsService.ts
|   |   |-- InventoryService.ts
|   |   |-- MarketingService.ts
|   |   |-- OrdersService.ts
|   |   |-- ProductService.ts
|   |   |-- ReportsService.ts
|   |   |-- SettingsService.ts
|   |   |-- StoreService.ts
|   |   |-- TrendsService.ts
|   |   |-- UserService.ts
|   |
|   |-- App.tsx                       # Componente raiz que define as rotas da aplicação
|   |-- index.css                     # Estilos globais e configuração do Tailwind CSS
|   |-- main.tsx                      # Ponto de entrada da aplicação React
|   |-- vite-env.d.ts
|
|-- package.json                      # Dependências e scripts do projeto
|-- ... (outros ficheiros de configuração: vite.config.ts, tailwind.config.js, etc.)
```

---

# 📄 Status do Desenvolvimento do Front-end – NEOX

## ✅ O Que Já Foi Feito (Estado Atual)

O desenvolvimento do front-end está visualmente e arquitetonicamente avançado.  
A maior parte das interfaces está construída como componentes React, com uma estrutura de código organizada e pronta para ser conectada a um back-end real.

### 1. Interfaces de Utilizador Abrangentes

As "telas" para quase toda a aplicação já foram codificadas, resultando numa interface rica e completa.

- **Portal do Cliente**
  - Home Page: Apresenta a plataforma NEOX.
  - Dashboard do Cliente: Hub central para o utilizador logado, exibindo produtos, resumo de pedidos e carrinho.
  - Página de Produto: Layout para exibição de detalhes de um item específico.
  - Página de Loja: Template para o perfil público de uma loja.
  - Página de Carrinho: Interface para revisão e gestão dos itens antes da compra.

- **Painel do Empreendedor**
  - Uma estrutura de navegação (**AppShell**) serve de base para um conjunto completo de páginas de gestão, como Dashboard, Produtos, Pedidos, Marketing, e mais.

- **Painel do Admin**
  - Interfaces para a supervisão e moderação de **Lojas** e **Vídeos (Trends)**.

---

### 2. Sistema de Autenticação e Rotas

- **Fluxos de Utilizador:** Os formulários e ecrãs para Login e Registo estão completos, incluindo o processo detalhado de registo para Empreendedores.  
- **Proteção de Rotas:** O sistema de rotas (`App.tsx`) utiliza **RoleGuard** e **AuthGuard** para proteger o acesso às páginas, garantindo que apenas utilizadores autenticados e com o perfil correto possam aceder a áreas restritas.

---

### 3. Lógica de Dados Simulada (Mocada)

- **Serviços Independentes:** Todos os dados da aplicação (produtos, pedidos, etc.) são atualmente geridos por ficheiros na pasta `/services`. Estes ficheiros simulam uma API, utilizando o **localStorage** do navegador para guardar e ler informações.  
- **Vantagem Estratégica:** Esta abordagem permitiu o desenvolvimento completo do UI sem depender do back-end. Mais importante, já define os "contratos" (os formatos de dados) que a API do back-end precisará de fornecer.

---

### 4. Arquitetura de Componentes Sólida

- O projeto utiliza uma excelente **componentização**, com componentes de UI genéricos e reutilizáveis (em `/components/ui`) e componentes mais complexos e de negócio (como **ProductForm** e **MetricCard**).  
- Isso resulta num código **limpo** e de **fácil manutenção**.

---

## ❌ O Que Falta Fazer (Próximos Passos Críticos)

Apesar de as interfaces estarem visualmente prontas, a aplicação ainda não é funcionalmente completa.  
O trabalho agora foca-se em substituir a simulação por interações reais com o servidor.

### 1. Integração Completa com a API (Tarefa Principal)

- Refatorar todos os serviços em `/src/services`.  
- Substituir lógica baseada em `localStorage` por chamadas **axios** ou **fetch** para os endpoints correspondentes no back-end Python.  

**Exemplo:**  
A função `ProductService.getMyProducts()` deve deixar de usar:  
```ts
localStorage.getItem('neox_products')
```  
E passar a fazer:  
```http
GET /api/v1/products/
```

---

### 2. Ativar a Navegação entre Páginas

- **Conectar os Links:** Atualmente, não é possível navegar visualmente para todas as páginas.  
- Implementar os links com `<Link>` do **react-router-dom** em locais como:
  - Nos cartões de produto → página de detalhes do produto.  
  - No nome da loja → página da loja (`/lojas/:id`).  

---

### 3. Gestão de Autenticação com Token JWT

- `AuthService.login` deve armazenar o **token JWT** retornado pelo back-end no `localStorage`.  
- Criar um **interceptor do axios** que adicione automaticamente o cabeçalho:  
  ```
  Authorization: Bearer <token>
  ```  
- Isso garantirá que o utilizador permaneça autenticado em todas as chamadas.  

---

### 4. Implementar Funcionalidades de Upload de Ficheiros

- Formulários de **imagens de produtos**, **logo da loja** e **vídeos (Trends)** precisam enviar os dados como **FormData**, permitindo que o back-end processe corretamente os ficheiros.  

---

### 5. Construir as Páginas de Gestão da Conta do Cliente

- **Meu Perfil:** Edição de dados pessoais e alteração de senha.  
- **Meus Pedidos:** Histórico detalhado de todas as compras.  
- **Meus Favoritos:** Galeria de produtos guardados.  
- **Meus Endereços:** Gestão de endereços de entrega.  

---

### 6. Desenvolver o Fluxo de Checkout Completo

- Implementar o processo de finalização de compra:  
  1. Seleção de endereço  
  2. Cálculo de frete (dados via API)  
  3. Seleção do método de pagamento  
  4. Integração final com gateway de pagamento  

---

## 📌 Resumo

O front-end está num estado **excelente em termos de UI/UX e arquitetura**.  
O foco total da equipe agora deve ser na **integração com a API** para substituir os dados mocados e na implementação da **navegação e do fluxo de compra**, tornando a aplicação totalmente interativa e funcional.
