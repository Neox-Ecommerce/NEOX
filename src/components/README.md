# 📦 Componentes

Componentes React organizados por funcionalidade.

## 📁 Estrutura

```
components/
├── 📁 auth/              # Componentes de autenticação
│   └── LoginForm.tsx     # Formulário de login
│
├── 📁 products/          # Componentes de produtos
│   └── ProductForm.tsx   # Formulário de produto
│
├── 📁 ui/                # Componentes base (ShadCN UI)
│   ├── button.tsx
│   ├── input.tsx
│   └── ...
│
├── AppShell.tsx          # Layout principal
├── AuthGuard.tsx        # Proteção de rotas
├── RoleGuard.tsx        # Proteção por role
└── ErrorBoundary.tsx    # Tratamento de erros
```

## 🎯 Uso

### Componentes de Produto
```typescript
import { ProductForm } from '@/components/products/ProductForm';
```

### Componentes de UI
```typescript
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
```

## 📝 Convenções

- **Um componente por arquivo**
- **Nome do arquivo = nome do componente**
- **PascalCase para nomes**
- **Props tipadas com TypeScript**
- **Componentes devem ser puros quando possível**

