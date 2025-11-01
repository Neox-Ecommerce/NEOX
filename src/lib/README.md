# 📚 Bibliotecas e Configurações

Utilitários e configurações de bibliotecas externas.

## 📁 Conteúdo

### `utils.ts`
Funções utilitárias gerais:
- `cn()` - Merge de classes Tailwind
- `formatCurrency()` - Formatação de moeda
- `formatCNPJ()` - Formatação de CNPJ
- `formatPhone()` - Formatação de telefone
- `validateURL()` - Validação de URL
- `parseCurrency()` - Conversão de string para número

### `api-client.ts`
Cliente HTTP configurado com:
- Interceptors para autenticação
- Refresh token automático
- Tratamento de erros
- Normalização de respostas

## 🎯 Uso

```typescript
// Formatação
import { formatCurrency, formatPhone } from '@/lib/utils';

const price = formatCurrency(99.90); // R$ 99,90
const phone = formatPhone('11987654321'); // (11) 98765-4321

// Classes CSS
import { cn } from '@/lib/utils';

const className = cn('base-class', condition && 'conditional-class');
```

