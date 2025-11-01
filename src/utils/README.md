# 🛠️ Utilitários

Funções auxiliares e helpers reutilizáveis.

## 📁 Arquivos

### `validation.ts`
Funções para validação e garantia de tipos.

```typescript
import { ensureArray, ensureString } from '@/utils/validation';

// Garantir que seja sempre array
const items = ensureArray(data, []); // Nunca será null/undefined

// Garantir string válida
const name = ensureString(value, 'Default');
```

### `api-helpers.ts`
Helpers para trabalhar com respostas de API.

```typescript
import { extractApiArray, extractApiData } from '@/utils/api-helpers';

// Extrair array de resposta da API
const products = extractApiArray<Product>(apiResponse);

// Extrair dados de resposta
const product = extractApiData<Product>(apiResponse);
```

## 🎯 Funções Principais

### `ensureArray<T>(value, fallback)`
Garante que um valor seja sempre um array válido.

**Uso:**
```typescript
const categories = ensureArray(apiData, ['default']);
```

### `extractApiArray<T>(response)`
Extrai e normaliza array de resposta da API.

**Uso:**
```typescript
const products = extractApiArray<Product>(apiResponse);
```

### `normalizeApiArrayResponse<T>(response)`
Normaliza resposta da API para array.

**Uso:**
```typescript
const items = normalizeApiArrayResponse<Item>(response);
```

## 📝 Convenções

- **Funções puras** quando possível
- **Type-safe** com generics
- **Fallbacks seguros** sempre
- **JSDoc** para documentação

