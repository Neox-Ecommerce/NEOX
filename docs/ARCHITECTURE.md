# 🏗️ Arquitetura do Projeto NEOX

## 📁 Estrutura de Diretórios

```
src/
├── 📁 components/          # Componentes React reutilizáveis
│   ├── 📁 auth/           # Componentes de autenticação
│   ├── 📁 products/       # Componentes relacionados a produtos
│   ├── 📁 ui/             # Componentes base (ShadCN UI)
│   └── ...
│
├── 📁 config/             # Configurações da aplicação
│   ├── constants.ts       # Constantes globais
│   └── index.ts           # Exportações centralizadas
│
├── 📁 constants/          # Constantes específicas
│   └── categories.ts      # Categorias padrão
│
├── 📁 contexts/           # Contextos React
│   └── AuthContext.tsx    # Contexto de autenticação
│
├── 📁 hooks/              # Hooks customizados
│   ├── useCategories.ts   # Hook para categorias
│   ├── useProducts.ts     # Hook para produtos
│   └── index.ts           # Exportações centralizadas
│
├── 📁 lib/                # Utilitários e configurações
│   ├── api-client.ts      # Cliente HTTP com interceptors
│   └── utils.ts           # Funções utilitárias
│
├── 📁 pages/              # Páginas da aplicação
│   ├── 📁 admin/         # Área administrativa
│   ├── 📁 auth/          # Autenticação
│   ├── 📁 client/        # Área do cliente
│   ├── 📁 painel/        # Painel do empreendedor
│   └── 📁 products/      # Páginas de produtos
│
├── 📁 services/           # Camada de serviços
│   ├── 📁 api/           # Serviços de API (opcional)
│   ├── ProductService.ts  # Lógica de negócio de produtos
│   ├── ProductApiService.ts # Comunicação com API
│   └── ...
│
├── 📁 types/              # Definições de tipos TypeScript
│   ├── api.ts            # Tipos da API
│   ├── auth.ts           # Tipos de autenticação
│   ├── products.ts       # Tipos de produtos
│   ├── store.ts          # Tipos de loja
│   ├── common.ts         # Tipos comuns
│   └── index.ts          # Exportações centralizadas
│
└── 📁 utils/              # Utilitários e helpers
    ├── validation.ts      # Funções de validação
    ├── api-helpers.ts     # Helpers para API
    └── index.ts           # Exportações centralizadas
```

## 🎯 Princípios de Organização

### 1. **Separação de Responsabilidades**
- **Components**: Apenas apresentação e interação
- **Services**: Lógica de negócio e comunicação com API
- **Hooks**: Lógica reutilizável de estado e efeitos
- **Utils**: Funções puras e helpers
- **Types**: Definições de tipos centralizadas

### 2. **Padrão de Nomenclatura**
- **Componentes**: PascalCase (`ProductForm.tsx`)
- **Hooks**: camelCase com prefixo `use` (`useCategories.ts`)
- **Services**: PascalCase (`ProductService.ts`)
- **Utils**: camelCase (`validation.ts`)
- **Types**: camelCase (`products.ts`)

### 3. **Barrel Exports (index.ts)**
- Cada diretório pode ter um `index.ts` para exportações centralizadas
- Facilita imports: `import { X } from '@/types'` ao invés de `import { X } from '@/types/products'`

## 🔄 Fluxo de Dados

```
Component → Hook → Service → API Service → API
         ↓
      Types/Utils
```

### Exemplo: Buscar Categorias

1. **Component**: `ProductForm` usa `useCategories()`
2. **Hook**: `useCategories` chama `ProductService.getCategories()`
3. **Service**: `ProductService` usa `ProductApiService` e valida dados
4. **API Service**: `ProductApiService` faz requisição HTTP
5. **API**: Retorna dados
6. **Validação**: Utils validam e normalizam resposta
7. **Retorno**: Hook retorna dados garantidos como array válido

## 🛡️ Segurança e Validação

### Camadas de Proteção

1. **API Client**: Interceptors para tokens e tratamento de erros
2. **API Service**: Validação de resposta da API
3. **Service**: Normalização e validação de dados
4. **Hook**: Garantia de tipos e valores padrão
5. **Component**: Validação de formulário e tratamento de erros

### Funções de Validação

- `ensureArray()`: Garante que valor seja sempre array
- `normalizeApiArrayResponse()`: Normaliza resposta da API
- `extractApiArray()`: Extrai array de resposta da API
- `ensureString()`: Garante string válida

## 📦 Gerenciamento de Estado

### React Query
- **Queries**: Dados do servidor
- **Mutations**: Alterações de dados
- **Cache**: Configurado globalmente no `QueryClient`

### Context API
- **AuthContext**: Estado de autenticação global

## 🎨 Componentes

### Estrutura
```
components/
├── auth/          # Componentes de autenticação
├── products/      # Componentes de produtos
└── ui/            # Componentes base (ShadCN)
```

### Padrão de Componente
```typescript
// 1. Imports
// 2. Types/Interfaces
// 3. Constants
// 4. Component
// 5. Export
```

## 🔧 Services

### Padrão de Service
```typescript
export class Service {
  // Métodos estáticos para operações
  static async get(): Promise<T[]> {
    // Validação
    // Chamada API
    // Normalização
    // Retorno garantido
  }
}
```

## 📝 Documentação

Cada módulo importante deve ter:
- JSDoc para funções públicas
- Comentários explicativos para lógica complexa
- Exemplos de uso quando necessário

## 🚀 Boas Práticas

1. ✅ **Sempre validar arrays** antes de usar `.map()`, `.filter()`, etc.
2. ✅ **Usar hooks customizados** para lógica reutilizável
3. ✅ **Tipos centralizados** em `src/types`
4. ✅ **Constantes** em `src/constants` ou `src/config`
5. ✅ **Tratamento de erros** em todas as camadas
6. ✅ **Fallbacks** sempre que possível
7. ✅ **Logs** para debug em desenvolvimento

