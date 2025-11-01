# ⚙️ Configurações

Configurações globais da aplicação.

## 📁 Arquivos

### `constants.ts`
Constantes de configuração:
- `APP_CONFIG` - Informações do app
- `API_CONFIG` - Configurações da API
- `STORAGE_KEYS` - Chaves do localStorage
- `ROUTES` - Rotas da aplicação
- `USER_ROLES` - Roles de usuário
- `QUERY_KEYS` - Chaves do React Query

## 🎯 Uso

```typescript
import { ROUTES, STORAGE_KEYS, API_CONFIG } from '@/config';

// Rotas
const productRoute = ROUTES.painel.produtos;

// Storage
localStorage.setItem(STORAGE_KEYS.token, token);

// API
const baseURL = API_CONFIG.baseURL;
```

## 📝 Convenções

- Constantes são `readonly` e tipadas
- Agrupadas por funcionalidade
- Fácil de localizar e modificar

