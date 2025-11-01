# 📋 Tipos TypeScript

Definições de tipos organizadas por domínio.

## 📁 Estrutura

```
types/
├── api.ts          # Tipos relacionados à API
├── auth.ts         # Tipos de autenticação
├── products.ts     # Tipos de produtos
├── store.ts        # Tipos de loja
├── common.ts       # Tipos comuns
└── index.ts        # Exportações centralizadas
```

## 🎯 Uso

### Import Centralizado
```typescript
import { Product, User, ApiResponse } from '@/types';
```

### Import Específico
```typescript
import { Product } from '@/types/products';
import { User } from '@/types/auth';
```

## 📝 Convenções

- **Um arquivo por domínio**
- **Tipos sempre exportados**
- **Interfaces para objetos complexos**
- **Types para unions e primitivos**
- **Re-export no index.ts**

## 🔍 Exemplos

### Tipo de Produto
```typescript
// types/products.ts
export interface Product {
  id: number;
  nome: string;
  preco: number;
  // ...
}
```

### Tipo de API Response
```typescript
// types/api.ts
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}
```

