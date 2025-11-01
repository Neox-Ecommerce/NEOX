# 📌 Constantes

Constantes específicas do domínio da aplicação.

## 📁 Arquivos

### `categories.ts`
Categorias padrão de produtos e funções relacionadas.

```typescript
import { DEFAULT_CATEGORIES, getDefaultCategories } from '@/constants/categories';

// Array imutável
const categories = DEFAULT_CATEGORIES;

// Array mutável
const mutableCategories = getDefaultCategories();
```

## 🎯 Uso

```typescript
// Importar categorias padrão
import { getDefaultCategories } from '@/constants/categories';

const categories = getDefaultCategories();
// ['Eletrônicos', 'Informática', ...]
```

## 📝 Convenções

- **Constantes**: `UPPER_SNAKE_CASE` para valores imutáveis
- **Funções**: `camelCase` para valores mutáveis/derivados
- **Tipos**: `PascalCase` para tipos TypeScript

