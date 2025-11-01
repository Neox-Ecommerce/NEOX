# 📚 Documentação do Código-Fonte

## 🗂️ Estrutura de Pastas

### `/components`
Componentes React reutilizáveis organizados por funcionalidade.

### `/config`
Configurações globais da aplicação (rotas, constantes, etc).

### `/constants`
Constantes específicas do domínio (categorias, status, etc).

### `/contexts`
Contextos React para estado global.

### `/hooks`
Hooks customizados reutilizáveis.

### `/lib`
Utilitários e configurações de bibliotecas.

### `/pages`
Páginas da aplicação organizadas por área.

### `/services`
Camada de serviços para comunicação com API e lógica de negócio.

### `/types`
Definições de tipos TypeScript organizadas por domínio.

### `/utils`
Funções utilitárias e helpers.

## 🔍 Como Encontrar Código

### Buscar um Componente
```typescript
// Componente de produto
import { ProductForm } from '@/components/products/ProductForm';

// Ou usando barrel export (se disponível)
import { ProductForm } from '@/components/products';
```

### Buscar um Hook
```typescript
// Hook de categorias
import { useCategories } from '@/hooks/useCategories';

// Ou usando barrel export
import { useCategories } from '@/hooks';
```

### Buscar um Tipo
```typescript
// Tipos de produtos
import { Product, CreateProductData } from '@/types';

// Tipos específicos
import { Product } from '@/types/products';
```

### Buscar um Service
```typescript
import { ProductService } from '@/services/ProductService';
```

### Buscar Utilitários
```typescript
// Validação
import { ensureArray } from '@/utils/validation';

// Helpers de API
import { extractApiArray } from '@/utils/api-helpers';

// Ou usando barrel export
import { ensureArray, extractApiArray } from '@/utils';
```

## 🎯 Convenções

### Imports
- Use paths absolutos com `@/` prefix
- Importe de barrel exports quando disponível
- Organize imports: externos → internos → relativos

### Nomes de Arquivos
- Componentes: `PascalCase.tsx`
- Hooks: `camelCase.ts` com prefixo `use`
- Services: `PascalCase.ts`
- Utils: `camelCase.ts`
- Types: `camelCase.ts`

### Estrutura de Componente
```typescript
// 1. Imports externos
import { useState } from 'react';

// 2. Imports internos
import { Button } from '@/components/ui/button';

// 3. Types/Interfaces
interface Props { ... }

// 4. Constants
const CONSTANT = 'value';

// 5. Component
export function Component({ ... }: Props) { ... }
```

