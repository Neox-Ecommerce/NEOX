# 📂 Estrutura do Projeto NEOX

## 🎯 Visão Geral

O projeto foi refatorado seguindo as melhores práticas de arquitetura frontend moderna, com foco em:
- ✅ **Organização clara** e intuitiva
- ✅ **Type safety** com TypeScript
- ✅ **Reutilização** de código
- ✅ **Manutenibilidade** facilitada
- ✅ **Documentação** completa

## 📁 Estrutura de Diretórios Completa

```
src/
│
├── 📁 components/              # Componentes React
│   ├── 📁 auth/                # Autenticação
│   │   └── LoginForm.tsx
│   │
│   ├── 📁 products/            # Produtos
│   │   ├── ProductForm.tsx     # Formulário de produto
│   │   ├── ProductCard.tsx     # Card de produto
│   │   └── index.ts            # Exportações
│   │
│   ├── 📁 ui/                  # Componentes base (ShadCN)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── ...
│   │
│   ├── AppShell.tsx            # Layout principal
│   ├── AuthGuard.tsx           # Guard de autenticação
│   ├── RoleGuard.tsx           # Guard de permissões
│   ├── ErrorBoundary.tsx       # Tratamento de erros
│   └── README.md               # Documentação
│
├── 📁 config/                   # Configurações
│   ├── constants.ts            # Constantes globais
│   └── index.ts                # Exportações
│
├── 📁 constants/                # Constantes específicas
│   └── categories.ts           # Categorias padrão
│
├── 📁 contexts/                 # Contextos React
│   └── AuthContext.tsx         # Contexto de autenticação
│
├── 📁 hooks/                    # Hooks customizados
│   ├── useCategories.ts        # Hook de categorias
│   ├── useProducts.ts          # Hook de produtos
│   ├── use-toast.ts            # Hook de toast
│   ├── useDebounce.ts          # Hook de debounce
│   ├── index.ts                # Exportações
│   └── README.md               # Documentação
│
├── 📁 lib/                      # Bibliotecas e configs
│   ├── api-client.ts           # Cliente HTTP
│   └── utils.ts                 # Utilitários gerais
│
├── 📁 pages/                    # Páginas da aplicação
│   ├── 📁 admin/               # Área administrativa
│   ├── 📁 auth/                # Autenticação
│   ├── 📁 client/               # Área do cliente
│   ├── 📁 painel/              # Painel empreendedor
│   └── 📁 products/            # Páginas de produtos
│
├── 📁 services/                 # Camada de serviços
│   ├── ProductApiService.ts    # API de produtos
│   ├── ProductService.ts       # Lógica de produtos
│   ├── AuthApiService.ts        # API de autenticação
│   ├── AuthService.ts          # Lógica de autenticação
│   └── README.md               # Documentação
│
├── 📁 types/                    # Tipos TypeScript
│   ├── api.ts                  # Tipos da API
│   ├── auth.ts                 # Tipos de autenticação
│   ├── products.ts             # Tipos de produtos
│   ├── store.ts                # Tipos de loja
│   ├── common.ts               # Tipos comuns
│   ├── index.ts                # Exportações
│   └── README.md               # Documentação
│
├── 📁 utils/                    # Utilitários
│   ├── validation.ts           # Validações
│   ├── api-helpers.ts          # Helpers de API
│   ├── index.ts                # Exportações
│   └── README.md               # Documentação
│
├── App.tsx                      # Componente raiz
├── main.tsx                     # Entry point
├── index.css                    # Estilos globais
└── README.md                    # Documentação geral
```

## 🎨 Padrões de Organização

### 1. **Componentes**
- Organizados por funcionalidade
- Um componente por arquivo
- Nome do arquivo = nome do componente
- Props tipadas

### 2. **Hooks**
- Prefixo `use` obrigatório
- Lógica reutilizável
- Sempre retornam valores válidos
- Type-safe

### 3. **Services**
- Separação: ApiService (HTTP) vs Service (lógica)
- Métodos estáticos
- Sempre retornam tipos garantidos
- Tratamento de erros robusto

### 4. **Types**
- Um arquivo por domínio
- Barrel exports no index.ts
- Interfaces para objetos complexos
- Types para unions

### 5. **Utils**
- Funções puras quando possível
- Type-safe com generics
- Fallbacks seguros
- Documentação JSDoc

## 🔄 Fluxo de Dados

```
┌─────────────┐
│  Component  │
└──────┬──────┘
       │ usa
       ▼
┌─────────────┐
│    Hook     │ ──▶ React Query (cache, retry)
└──────┬──────┘
       │ chama
       ▼
┌─────────────┐
│   Service   │ ──▶ Validação, transformação
└──────┬──────┘
       │ usa
       ▼
┌─────────────┐
│ ApiService  │ ──▶ HTTP request
└──────┬──────┘
       │
       ▼
┌─────────────┐
│     API     │
└─────────────┘
```

## 📚 Documentação

Cada diretório importante tem seu README.md explicando:
- Estrutura
- Convenções
- Exemplos de uso
- Boas práticas

## 🚀 Como Navegar

1. **Buscar um componente**: `src/components/[categoria]/[Nome].tsx`
2. **Buscar um hook**: `src/hooks/use[Nome].ts`
3. **Buscar um tipo**: `src/types/[dominio].ts`
4. **Buscar um service**: `src/services/[Nome]Service.ts`
5. **Buscar um util**: `src/utils/[nome].ts`

## ✨ Benefícios

- 🎯 **Fácil de encontrar** código
- 🔍 **Fácil de entender** estrutura
- 🔄 **Fácil de manter** e estender
- 👥 **Fácil de colaborar** com equipe
- 📖 **Bem documentado** com READMEs

