# 🛒 NEOX - Plataforma de E-commerce Completa

![Status](https://img.shields.io/badge/status-active-success.svg)
![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-private-red.svg)

**NEOX** é uma plataforma moderna e completa de e-commerce voltada para empreendedores digitais. Com uma interface intuitiva, responsiva e funcionalidades robustas, o sistema permite que empreendedores criem, gerenciem e operem suas próprias lojas virtuais, enquanto clientes podem navegar, comprar e gerenciar seus pedidos de forma simples e eficiente.

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Status do Projeto](#-status-do-projeto)
- [Tecnologias](#️-tecnologias-utilizadas)
- [Funcionalidades](#-funcionalidades-implementadas)
- [Instalação](#-instalação-e-configuração)
- [Integração Backend](#-integração-com-backend)
- [Credenciais de Teste](#-credenciais-de-teste)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Arquitetura](#-arquitetura-técnica)
- [Equipe](#-equipe)
- [Licença](#-licença)

---

## 🌐 Visão Geral

O projeto foi desenvolvido em **React 18 + TypeScript + Vite**, seguindo as melhores práticas de UI/UX, componentização, modularização e escalabilidade.

### Características Principais:

- ✅ **Front-end completo e funcional** - Pronto para uso em produção
- ✅ **Backend integrado** - FastAPI rodando em Python com SQLite
- ✅ **Sistema de autenticação JWT** - Login, registro e refresh token automático
- ✅ **Carrinho de compras completo** - Com cupons, cálculo de frete e checkout
- ✅ **Painel do empreendedor** - Gerenciamento completo de produtos, pedidos e clientes
- ✅ **Design system robusto** - 20+ componentes UI reutilizáveis
- ✅ **Dark mode persistente** - Tema escuro com preferência salva
- ✅ **Responsivo** - Mobile-first design

---

## 🚀 Status do Projeto

| Componente | Status | Tecnologia | Porta |
|------------|--------|------------|-------|
| **Front-end** | 🟢 Completo | React 18 + TypeScript + Vite | 5175 |
| **Backend API** | 🟢 Funcionando | FastAPI + Python 3.11 | 8000 |
| **Banco de Dados** | 🟢 Ativo | SQLite (desenvolvimento) | - |
| **Autenticação** | 🟢 Implementada | JWT com refresh token | - |
| **CORS** | 🟢 Configurado | Permite porta 5175 | - |

### Progresso Geral: 95% ✅

- ✅ Autenticação e autorização
- ✅ CRUD de produtos
- ✅ Gerenciamento de pedidos
- ✅ Carrinho de compras
- ✅ Sistema de marketing
- ✅ Dashboard e relatórios
- ✅ Integração frontend ↔ backend
- 🔄 Deploy em produção (próximo passo)

---

## ⚙️ Tecnologias Utilizadas

### 🎨 Frontend

| Categoria | Tecnologias |
|-----------|-------------|
| **Core** | React 18, TypeScript, Vite |
| **UI Framework** | Tailwind CSS, Radix UI |
| **Estado** | TanStack React Query v5, Context API |
| **Formulários** | React Hook Form, Zod |
| **Roteamento** | React Router v6 |
| **Gráficos** | Recharts |
| **Ícones** | Lucide React |
| **Utils** | clsx, date-fns, React CountUp |

### 🔧 Backend

| Categoria | Tecnologias |
|-----------|-------------|
| **Framework** | FastAPI (Python 3.11) |
| **ORM** | SQLAlchemy |
| **Banco de Dados** | SQLite (dev), PostgreSQL (prod) |
| **Autenticação** | JWT (python-jose) |
| **Validação** | Pydantic |
| **Servidor** | Uvicorn |

---

## ✅ Funcionalidades Implementadas

### 🔐 Autenticação e Autorização

- [x] Sistema completo de login e registro
- [x] Proteção de rotas com AuthGuard e RoleGuard
- [x] **Refresh token automático** (interceptor HTTP inteligente)
- [x] Suporte para 3 tipos de usuários: CLIENTE, EMPREENDEDOR, ADMIN
- [x] Persistência de sessão com localStorage
- [x] Redirecionamento inteligente baseado em role
- [x] Logout com limpeza de token

### 🏪 Área do Empreendedor

#### Dashboard
- [x] Métricas em tempo real (vendas, pedidos, receita)
- [x] Gráficos de receita com Recharts
- [x] Widgets de estatísticas
- [x] Pedidos recentes
- [x] Produtos em destaque

#### Produtos
- [x] **CRUD completo** (criar, editar, deletar, listar, buscar)
- [x] Upload de imagens com drag-and-drop
- [x] Validação com Zod
- [x] Sistema de categorias e tags
- [x] Controle de estoque
- [x] Preços com desconto
- [x] Dimensões e peso
- [x] SKU e código de barras

#### Pedidos
- [x] Listagem com paginação
- [x] Filtros por status e data
- [x] Atualização de status
- [x] Detalhes do pedido
- [x] Exportação para CSV
- [x] Estatísticas de vendas

#### Clientes
- [x] Listagem de clientes
- [x] Perfil detalhado
- [x] Histórico de compras
- [x] Estatísticas (ticket médio, LTV)
- [x] Exportação de dados
- [x] Busca e filtros

#### Marketing
- [x] Campanhas promocionais
- [x] Sistema de cupons de desconto
- [x] Programa de afiliados
- [x] Estatísticas de conversão

#### Relatórios
- [x] Relatório de vendas
- [x] Análise de conversão
- [x] Funil de vendas
- [x] Exportação em CSV/PDF

#### Financeiro
- [x] Dashboard financeiro
- [x] Repasses e comissões
- [x] Histórico de transações
- [x] Gráficos de receita

#### Integrações
- [x] Gateways de pagamento
- [x] Transportadoras
- [x] Webhooks

#### Configurações
- [x] Dados da loja
- [x] Preferências do usuário
- [x] Notificações

### 🛒 Área do Cliente

- [x] Homepage pública com produtos em destaque
- [x] **Página de loja** (`/lojas/:id`) com listagem de produtos
- [x] **Página de produto** (`/produto/:id`) com detalhes completos
- [x] **Sistema de carrinho** completo e funcional:
  - [x] Adicionar produtos
  - [x] Remover produtos
  - [x] Atualizar quantidades
  - [x] Aplicar cupons de desconto
  - [x] Cálculo de frete automático
  - [x] Resumo do pedido
  - [x] Validação de estoque
- [x] Dashboard do cliente
- [x] Histórico de pedidos

### 🎨 UI/UX

- [x] Design system completo com 20+ componentes
- [x] **Dark mode com persistência** (preferência salva)
- [x] Animações e transições suaves
- [x] Loading states e skeleton loaders
- [x] Toast notifications (sucesso, erro, info)
- [x] **Responsivo** (mobile-first)
- [x] **Error boundaries** para tratamento de erros
- [x] Acessibilidade (ARIA labels)

### 🔧 Infraestrutura

- [x] Cliente HTTP centralizado (`src/lib/api/client.ts`)
- [x] **Interceptor de refresh token automático**
- [x] **17 serviços de API** completos
- [x] React Query para cache e sincronização
- [x] Validação de formulários com Zod
- [x] Roteamento com React Router v6
- [x] Lazy loading de componentes
- [x] TypeScript em 100% do código
- [x] CORS configurado corretamente

---

## 📦 Instalação e Configuração

### Pré-requisitos

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Python** 3.11+ ([Download](https://www.python.org/))
- **Git** ([Download](https://git-scm.com/))

### 1️⃣ Clonar o Repositório

```bash
git clone <url-do-repositorio>
cd NEOX
```

### 2️⃣ Instalar Dependências do Frontend

```bash
npm install
```

### 3️⃣ Configurar Variáveis de Ambiente (Opcional)

Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

> **Nota:** Se não configurar, o padrão `http://localhost:8000/api` será usado.

### 4️⃣ Iniciar o Frontend

```bash
npm run dev
```

O frontend estará disponível em: **http://localhost:5175**

---

## 🔌 Integração com Backend

### Configuração do Backend

O backend está localizado em: `C:\Users\jjosi\OneDrive\Desktop\Projetos\Neox-APIs`

#### 1️⃣ Ativar Ambiente Virtual

**Windows:**
```bash
cd C:\Users\jjosi\OneDrive\Desktop\Projetos\Neox-APIs
.venv\Scripts\activate
```

**Linux/Mac:**
```bash
cd ~/Projetos/Neox-APIs
source .venv/bin/activate
```

#### 2️⃣ Criar Usuários de Teste

```bash
python create_test_users.py
```

Isso criará os seguintes usuários:
- **Empreendedor:** `empreendedor@neox.com` / `senha123`
- **Cliente:** `cliente@neox.com` / `senha123`
- **Admin:** `admin@neox.com` / `admin123`

#### 3️⃣ Iniciar o Servidor Backend

```bash
python run_server.py
```

O backend estará disponível em: **http://localhost:8000**

Documentação interativa: **http://localhost:8000/docs**

### Verificar Conexão

Após iniciar ambos os servidores:

1. Acesse: `http://localhost:5175`
2. Clique em "Fazer Login"
3. Use: `empreendedor@neox.com` / `senha123`
4. Você será redirecionado para o painel!

---

## 🔑 Credenciais de Teste

Use as seguintes credenciais para testar o sistema:

| Perfil | Email | Senha | Acesso |
|--------|-------|-------|--------|
| **Empreendedor** | `empreendedor@neox.com` | `senha123` | Painel completo de gerenciamento |
| **Cliente** | `cliente@neox.com` | `senha123` | Área do cliente, carrinho |
| **Admin** | `admin@neox.com` | `admin123` | Área administrativa |

---

## 📁 Estrutura do Projeto

```
📦 NEOX/
├── 📂 public/                    # Arquivos públicos
├── 📂 src/
│   ├── 📂 components/            # Componentes React
│   │   ├── 📂 ui/                # Componentes UI (20+ componentes)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── table.tsx
│   │   │   └── ...
│   │   ├── AppShell.tsx          # Layout principal com sidebar
│   │   ├── AuthGuard.tsx         # Proteção de rotas
│   │   ├── RoleGuard.tsx         # Proteção por role
│   │   ├── ErrorBoundary.tsx     # Tratamento de erros
│   │   ├── LoadingOverlay.tsx    # Overlay de loading
│   │   ├── ProductForm.tsx       # Formulário de produtos
│   │   ├── MetricCard.tsx        # Card de métricas
│   │   └── RevenueChart.tsx      # Gráfico de receita
│   │
│   ├── 📂 contexts/
│   │   └── AuthContext.tsx       # Contexto de autenticação
│   │
│   ├── 📂 hooks/
│   │   ├── use-toast.ts          # Hook de notificações
│   │   └── useDebounce.ts        # Hook de debounce
│   │
│   ├── 📂 lib/
│   │   ├── 📂 api/
│   │   │   ├── client.ts         # Cliente HTTP centralizado
│   │   │   └── config.ts         # Configuração de endpoints
│   │   └── utils.ts              # Funções utilitárias
│   │
│   ├── 📂 pages/
│   │   ├── 📂 auth/              # Páginas de autenticação
│   │   │   ├── index.tsx
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   └── 📂 components/
│   │   │
│   │   ├── 📂 client/            # Páginas do cliente
│   │   │   ├── home.tsx
│   │   │   ├── store.tsx         # Página da loja
│   │   │   ├── product.tsx       # Página do produto
│   │   │   ├── cart.tsx          # Carrinho de compras
│   │   │   └── dashboard.tsx
│   │   │
│   │   ├── 📂 painel/            # Painel do empreendedor
│   │   │   ├── dashboard.tsx
│   │   │   ├── produtos.tsx
│   │   │   ├── pedidos.tsx
│   │   │   ├── clientes.tsx
│   │   │   ├── estoque.tsx
│   │   │   ├── marketing.tsx
│   │   │   ├── relatorios.tsx
│   │   │   ├── financeiro.tsx
│   │   │   ├── integracoes.tsx
│   │   │   ├── configuracoes.tsx
│   │   │   ├── trends.tsx
│   │   │   ├── ajuda.tsx
│   │   │   └── perfil.tsx
│   │   │
│   │   ├── 📂 admin/             # Páginas admin
│   │   │   ├── login.tsx
│   │   │   ├── stores.tsx
│   │   │   └── videos.tsx
│   │   │
│   │   ├── 📂 products/
│   │   │   ├── index.tsx
│   │   │   └── form.tsx
│   │   │
│   │   ├── 📂 errors/
│   │   │   ├── not-found.tsx
│   │   │   └── unauthorized.tsx
│   │   │
│   │   └── profile.tsx
│   │
│   ├── 📂 services/              # Serviços de API (17 arquivos)
│   │   ├── AuthService.ts        # Autenticação
│   │   ├── ProductService.ts     # Produtos
│   │   ├── OrdersService.ts      # Pedidos
│   │   ├── CartService.ts        # Carrinho (NOVO!)
│   │   ├── DashboardService.ts   # Dashboard
│   │   ├── ClientsService.ts     # Clientes
│   │   ├── InventoryService.ts   # Estoque
│   │   ├── MarketingService.ts   # Marketing
│   │   ├── FinancialService.ts   # Financeiro
│   │   ├── TrendsService.ts      # Trends
│   │   ├── ReportsService.ts     # Relatórios
│   │   ├── IntegrationsService.ts# Integrações
│   │   ├── SettingsService.ts    # Configurações
│   │   ├── StoreService.ts       # Lojas
│   │   ├── HelpService.ts        # Ajuda
│   │   ├── UserService.ts        # Usuários
│   │   └── FeedbackService.ts    # Notificações
│   │
│   ├── App.tsx                   # Componente principal
│   ├── main.tsx                  # Ponto de entrada
│   ├── index.css                 # Estilos globais
│   └── vite-env.d.ts             # Types do Vite
│
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 vite.config.ts
├── 📄 tailwind.config.js
├── 📄 README.md
├── 📄 INTEGRACAO_BACKEND.md      # Guia de integração
└── 📄 .env.local                 # Variáveis de ambiente (criar)
```

---

## 🎯 Scripts Disponíveis

| Script | Comando | Descrição |
|--------|---------|-----------|
| **Desenvolvimento** | `npm run dev` | Inicia servidor de desenvolvimento (porta 5175) |
| **Build** | `npm run build` | Gera build de produção otimizada |
| **Preview** | `npm run preview` | Preview da build de produção |
| **Lint** | `npm run lint` | Executa ESLint para verificar código |

---

## 🏗️ Arquitetura Técnica

### Cliente HTTP Centralizado

O sistema utiliza um cliente HTTP centralizado em `src/lib/api/client.ts` que:

- ✅ Gerencia automaticamente tokens JWT
- ✅ **Intercepta erros 401 e faz refresh automático do token**
- ✅ Redireciona para login quando necessário
- ✅ Trata erros de forma padronizada
- ✅ Suporta timeout configurável
- ✅ Suporta upload de arquivos
- ✅ Adiciona headers automaticamente

### Endpoints da API

A configuração dos endpoints está em `src/lib/api/config.ts`:

```typescript
BASE_URL: http://localhost:8000/api

/api/auth/*          - Autenticação
/api/products/*      - Produtos
/api/orders/*        - Pedidos
/api/dashboard/*     - Dashboard
/api/clients/*       - Clientes
/api/store/*         - Loja
/api/financial/*     - Financeiro
/api/reports/*       - Relatórios
/api/marketing/*     - Marketing
/api/trends/*        - Tendências
/api/integrations/*  - Integrações
/api/settings/*      - Configurações
/api/help/*          - Ajuda
```

### Fluxo de Autenticação

```mermaid
sequenceDiagram
    participant U as Usuário
    participant F as Frontend
    participant API as Backend API
    participant DB as Banco de Dados

    U->>F: Faz login
    F->>API: POST /api/auth/login
    API->>DB: Verifica credenciais
    DB-->>API: Retorna usuário
    API-->>F: Retorna token + refreshToken
    F->>F: Salva token no localStorage
    F-->>U: Redireciona para dashboard

    Note over F,API: Em requisições futuras
    F->>API: GET /api/produtos (com token)
    API->>API: Valida token
    alt Token válido
        API-->>F: Retorna dados
    else Token expirado (401)
        F->>F: Interceptor detecta 401
        F->>API: POST /api/auth/refresh
        API-->>F: Retorna novo token
        F->>F: Atualiza token
        F->>API: Retry requisição original
        API-->>F: Retorna dados
    end
```

### Proteção de Rotas

- **AuthGuard**: Verifica se o usuário está autenticado
- **RoleGuard**: Verifica se o usuário tem o role necessário

```typescript
// Exemplo de uso
<Route path="/painel" element={
  <AuthGuard>
    <RoleGuard requiredRole="EMPREENDEDOR">
      <Dashboard />
    </RoleGuard>
  </AuthGuard>
} />
```

---

## 🎓 Fluxo de Uso

### Como Empreendedor:

1. Acesse `http://localhost:5175/auth`
2. Faça login com `empreendedor@neox.com` / `senha123`
3. Você será redirecionado para `/painel/dashboard`
4. Navegue pelas opções:
   - **Produtos** → Adicionar/editar produtos
   - **Pedidos** → Gerenciar pedidos
   - **Clientes** → Ver lista de clientes
   - **Marketing** → Criar campanhas e cupons
   - **Relatórios** → Visualizar estatísticas

### Como Cliente:

1. Acesse `http://localhost:5175`
2. Navegue pelos produtos em destaque
3. Clique em "Ver Loja" ou acesse `/lojas/:id`
4. Clique em um produto para ver detalhes
5. Adicione ao carrinho
6. Acesse `/carrinho`
7. Aplique cupom (ex: `DESC10`)
8. Finalize a compra

---

## 📊 Integração com Backend

### Formato de Requisições

#### Autenticação (Login)
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "empreendedor@neox.com",
  "password": "senha123"
}

Response:
{
  "user": {
    "id": "3",
    "email": "empreendedor@neox.com",
    "name": "Empreendedor Teste",
    "role": "EMPREENDEDOR",
    "lojaId": "1"
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refreshToken": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### Listar Produtos
```http
GET /api/products?lojaId=1
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...

Response:
[
  {
    "id": "1",
    "nome": "Produto 1",
    "preco": 100.00,
    "estoque": 50,
    "imagem": "url...",
    ...
  }
]
```

### Tratamento de Erros

O cliente HTTP trata automaticamente:

- **401 Unauthorized**: Tenta refresh token, se falhar redireciona para `/auth`
- **404 Not Found**: Retorna `null` em métodos `getById`
- **400 Bad Request**: Lança exceção com mensagem do backend
- **500 Server Error**: Lança exceção genérica
- **Timeout**: Após 30 segundos
- **Network Error**: Se backend não estiver disponível

---

## 🧪 Testes

### Testar API Backend

```bash
# Health check
curl http://localhost:8000/api/health

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"empreendedor@neox.com","password":"senha123"}'
```

### Documentação Interativa

Acesse: **http://localhost:8000/docs**

Swagger UI com todos os endpoints documentados e testáveis.

---

## 🐛 Troubleshooting

### ❌ Erro: "Failed to fetch dynamically imported module"

**Solução:**
1. Certifique-se que o servidor está rodando: `npm run dev`
2. Limpe o cache do navegador: `Ctrl + Shift + R`
3. Limpe o cache do Vite:
   ```bash
   rm -rf node_modules/.vite
   rm -rf dist
   npm run dev
   ```

### ❌ Erro: "CORS policy blocked"

**Solução:**
- Verifique se o backend está configurado para permitir porta 5175
- Arquivo: `Neox-APIs/app/main.py` deve ter:
  ```python
  allow_origins=[
      "http://localhost:5175",
      "http://127.0.0.1:5175",
  ]
  ```

### ❌ Erro: "Bad Request" no login

**Solução:**
1. Verifique se o backend está rodando: `python run_server.py`
2. Verifique se os usuários foram criados: `python create_test_users.py`
3. Verifique no console do navegador (F12) qual é o erro exato

### ❌ Erro: "Cannot connect to server"

**Solução:**
1. Verifique se o backend está rodando na porta 8000
2. Acesse http://localhost:8000/docs para confirmar
3. Verifique a variável `VITE_API_BASE_URL` no `.env.local`

---

## 📈 Roadmap

### ✅ Concluído
- [x] Frontend completo e funcional
- [x] Backend FastAPI integrado
- [x] Sistema de autenticação JWT
- [x] CRUD de produtos
- [x] Carrinho de compras
- [x] Sistema de cupons
- [x] Dark mode persistente
- [x] Refresh token automático

### 🔄 Em Andamento
- [ ] Implementação do checkout completo
- [ ] Gateway de pagamento
- [ ] Sistema de frete (cálculo real)
- [ ] Upload de imagens para S3

### 📅 Planejado
- [ ] Notificações em tempo real (WebSocket)
- [ ] PWA (Progressive Web App)
- [ ] Testes unitários e E2E
- [ ] CI/CD
- [ ] Deploy em produção
- [ ] Migração para PostgreSQL
- [ ] Analytics e métricas avançadas
- [ ] Chat de suporte

---

## 👥 Equipe

- **Josias Azevedo** - Full-stack Developer, UI/UX (Fundador)
  - Frontend (React/TypeScript)
  - Backend (FastAPI/Python)
  - Design e Protótipos

- **Cauã** - Backend Developer (Co-fundador)
  - Arquitetura
  - Banco de dados

- **Fabricio** - Backend Developer
  - Suporte e manutenção

---

## 📞 Suporte

Para dúvidas ou problemas:

1. **Abra uma issue** no repositório (se aplicável)
2. **Consulte a documentação** em `INTEGRACAO_BACKEND.md`
3. **Entre em contato** com a equipe

---

## 📄 Licença

Este é um projeto **privado**. Todos os direitos reservados aos desenvolvedores autorizados.

**Proibido uso, distribuição ou modificação sem autorização prévia.**

---

## 🎉 Agradecimentos

Obrigado por usar o NEOX! Esperamos que esta plataforma ajude empreendedores a crescerem seus negócios online.

---

<div align="center">

**[⬆ Voltar ao topo](#-neox---plataforma-de-e-commerce-completa)**

Made with ❤️ by NEOX Team

</div>
