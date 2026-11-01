# NEOX — Front-end

SPA do NEOX (marketplace multi-loja): React 18, TypeScript, Vite, Tailwind/shadcn, TanStack Query.
Todos os dados vêm da API (`Neox-APIs`); não há dados simulados.

## Rodar

```bash
npm ci
copy .env.example .env     # VITE_API_URL=http://localhost:8000
npm run dev                # http://localhost:5173
```

`npm run build` (checa tipos e gera `dist/`), `npm run typecheck`, `npm run lint`.

A API precisa estar rodando (veja o README de `Neox-APIs`).

## Estrutura

- `src/lib/api.ts`: cliente HTTP único (base URL, token JWT, erros, datas, CSV).
- `src/services/*`: um serviço por domínio, chamando a API.
- `src/contexts/AuthContext.tsx`: sessão (token em `localStorage`, validado em `/auth/me`).
- `src/pages/client`: vitrine, loja, produto, carrinho, checkout, retorno do Mercado Pago.
- `src/pages/painel`: painel do lojista (dashboard, produtos, estoque, pedidos, clientes, marketing, trends, relatórios, financeiro, integrações, configurações, ajuda).
- `src/pages/admin`: aprovação de lojas e moderação de vídeos.

Rotas protegidas por perfil com `RoleGuard`: CLIENTE, EMPREENDEDOR, ADMIN.
