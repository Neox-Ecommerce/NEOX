# 🎣 Hooks Customizados

Hooks React reutilizáveis para lógica compartilhada.

## 📦 Hooks Disponíveis

### `useCategories`
Hook seguro para buscar categorias. **SEMPRE retorna array válido**.

```typescript
import { useCategories } from '@/hooks/useCategories';

function Component() {
  const { categories, isLoading, error } = useCategories({
    lojaId: 1,
    enabled: true,
  });
  
  // categories é sempre um array válido (nunca undefined/null)
  return categories.map(cat => <div key={cat}>{cat}</div>);
}
```

### `useProducts`
Hook para buscar produtos com estatísticas.

```typescript
import { useProducts } from '@/hooks/useProducts';

function Component() {
  const { products, stats, categoryCounts, isLoading } = useProducts({
    lojaId: 1,
  });
  
  // products é sempre um array válido (pode estar vazio)
  return <div>{products.length} produtos</div>;
}
```

## 🎯 Características

- ✅ **Type-safe**: Tipos garantidos pelo TypeScript
- ✅ **Sempre retorna valores válidos**: Nunca `undefined` ou `null` inesperados
- ✅ **Fallbacks seguros**: Valores padrão em caso de erro
- ✅ **Otimizado**: Cache e staleTime configurados

## 📝 Criando um Novo Hook

```typescript
// hooks/useCustom.ts
import { useQuery } from '@tanstack/react-query';
import { ensureArray } from '@/utils/validation';

export function useCustom(options = {}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['custom', options.id],
    queryFn: async () => {
      // Sua lógica aqui
      const result = await fetchData();
      return ensureArray(result, []); // Sempre garantir array
    },
    initialData: [], // Valor inicial seguro
  });
  
  // Garantir tipo na saída
  const items = ensureArray(data, []);
  
  return { items, isLoading, error };
}
```

