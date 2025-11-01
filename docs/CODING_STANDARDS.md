# 📋 Padrões de Código - NEOX

## 🎯 Princípios Gerais

### 1. Type Safety
- ✅ Sempre usar TypeScript
- ✅ Tipos explícitos para funções públicas
- ✅ Evitar `any` - usar `unknown` se necessário
- ✅ Tipos centralizados em `src/types/`

### 2. Validação de Arrays
- ✅ **SEMPRE** validar arrays antes de `.map()`, `.filter()`, etc.
- ✅ Usar `ensureArray()` de `@/utils/validation`
- ✅ Usar hooks customizados que garantem arrays válidos

### 3. Tratamento de Erros
- ✅ Try-catch em operações assíncronas
- ✅ Fallbacks seguros sempre
- ✅ Logs informativos para debug
- ✅ ErrorBoundary para erros de render

### 4. Imports
```typescript
// ✅ Ordem recomendada
// 1. React e bibliotecas externas
import { useState } from 'react';

// 2. Imports internos absolutos
import { Button } from '@/components/ui/button';
import { Product } from '@/types';
import { useCategories } from '@/hooks';

// 3. Imports relativos (evitar quando possível)
import { helper } from './helper';
```

## 📝 Convenções de Nomenclatura

### Arquivos
- **Componentes**: `PascalCase.tsx` (ex: `ProductForm.tsx`)
- **Hooks**: `camelCase.ts` com `use` (ex: `useCategories.ts`)
- **Services**: `PascalCase.ts` (ex: `ProductService.ts`)
- **Utils**: `camelCase.ts` (ex: `validation.ts`)
- **Types**: `camelCase.ts` (ex: `products.ts`)

### Variáveis e Funções
- **Componentes**: `PascalCase`
- **Funções**: `camelCase`
- **Constantes**: `UPPER_SNAKE_CASE`
- **Tipos/Interfaces**: `PascalCase`

## 🏗️ Estrutura de Componente

```typescript
// 1. Imports
import { useState } from 'react';
import { Button } from '@/components/ui/button';

// 2. Types/Interfaces
interface Props {
  title: string;
}

// 3. Constants
const MAX_LENGTH = 100;

// 4. Component
export function Component({ title }: Props) {
  // 5. Hooks
  const [state, setState] = useState();
  
  // 6. Handlers
  const handleClick = () => {};
  
  // 7. Render
  return <div>{title}</div>;
}
```

## 🎣 Hooks Customizados

```typescript
// ✅ Padrão recomendado
export function useCustom(options = {}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['key', options.id],
    queryFn: async () => {
      // Validação e chamada
      const result = await fetchData();
      // Garantir tipo válido
      return ensureArray(result, []);
    },
    initialData: [], // Sempre ter fallback
  });
  
  // Garantir tipo na saída
  const items = ensureArray(data, []);
  
  return { items, isLoading, error };
}
```

## 🔧 Services

```typescript
// ✅ Padrão recomendado
export class Service {
  static async getItems(id: string): Promise<Item[]> {
    try {
      // Validação de input
      if (!id) return [];
      
      // Chamada API
      const response = await ApiService.get(id);
      
      // Normalização
      const items = extractApiArray<Item>(response);
      
      // Transformação
      return items.map(mapToItem);
    } catch (error) {
      console.error('Erro:', error);
      return []; // Sempre retornar tipo válido
    }
  }
}
```

## 🛡️ Validações Obrigatórias

### Antes de usar arrays
```typescript
// ❌ ERRADO
items.map(item => ...)

// ✅ CORRETO
const validItems = ensureArray(items, []);
validItems.map(item => ...)
```

### Antes de usar hooks
```typescript
// ❌ ERRADO
const { data } = useQuery(...);
data.map(...)

// ✅ CORRETO
const { items } = useCustom();
items.map(...) // items sempre é array válido
```

## 📦 Barrel Exports

Use `index.ts` para exportações centralizadas:

```typescript
// types/index.ts
export * from './products';
export * from './auth';

// Uso:
import { Product, User } from '@/types';
```

## 🎨 Formatação

- **Indentação**: 2 espaços
- **Aspas**: Simples para JSX, duplas para strings
- **Semicolons**: Sempre
- **Trailing commas**: Sim

## ✅ Checklist de Código

Antes de fazer commit, verificar:

- [ ] Tipos definidos corretamente
- [ ] Arrays validados antes de usar `.map()`
- [ ] Try-catch em operações assíncronas
- [ ] Fallbacks seguros implementados
- [ ] Imports organizados
- [ ] Sem console.log de debug (exceto warnings)
- [ ] Código comentado quando necessário
- [ ] Sem erros de lint

