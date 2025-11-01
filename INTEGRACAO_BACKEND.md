# 🔌 Guia de Integração com Back-end

Este documento descreve como o front-end está configurado para integrar com o back-end.

## 📋 Configuração

### Variáveis de Ambiente

O projeto utiliza a variável `VITE_API_BASE_URL` para configurar a URL base da API. 

**Por padrão:** `http://localhost:8000/api`

Para configurar em desenvolvimento, crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

Para produção, configure a variável de ambiente no servidor de hospedagem.

## 🏗️ Estrutura da Integração

### Cliente HTTP Centralizado

O projeto utiliza um cliente HTTP centralizado localizado em `src/lib/api/client.ts` que:

- ✅ Gerencia automaticamente o token JWT nas requisições
- ✅ Trata erros HTTP de forma padronizada
- ✅ Redireciona para login em caso de 401 (não autorizado)
- ✅ Suporta timeout configurável (30 segundos por padrão)
- ✅ Suporta upload de arquivos

### Configuração da API

A configuração dos endpoints está em `src/lib/api/config.ts`. Os principais endpoints são:

```typescript
/api/auth/*          - Autenticação
/api/products/*      - Produtos
/api/orders/*        - Pedidos
/api/dashboard/*     - Dashboard
/api/inventory/*     - Estoque
/api/clients/*       - Clientes
/api/store/*         - Loja
/api/financial/*     - Financeiro
/api/reports/*       - Relatórios
/api/marketing/*     - Marketing
/api/trends/*        - Tendências
/api/integrations/*  - Integrações
/api/settings/*      - Configurações
/api/help/*          - Ajuda
```

## 🔐 Autenticação

### Fluxo de Login

1. O usuário faz login através do `AuthService.login(email, password)`
2. O back-end retorna um objeto com `{ user, token }`
3. O token é armazenado no `localStorage` como `neox_token`
4. O token é automaticamente incluído em todas as requisições subsequentes

### Gerenciamento de Token

O token JWT é:
- ✅ Armazenado no `localStorage` após login
- ✅ Enviado automaticamente no header `Authorization: Bearer {token}`
- ✅ Removido automaticamente em caso de erro 401
- ✅ Suporta refresh token (método `AuthService.refreshToken()`)

## 📦 Serviços Atualizados

Todos os serviços principais foram atualizados para usar chamadas HTTP reais:

### ✅ AuthService
- `login()` - POST `/api/auth/login`
- `register()` - POST `/api/auth/register`
- `updateProfile()` - PUT `/api/auth/profile/:id`
- `changePassword()` - POST `/api/auth/change-password`
- `refreshToken()` - POST `/api/auth/refresh`
- `logout()` - POST `/api/auth/logout`

### ✅ ProductService
- `getMyProducts()` - GET `/api/products?lojaId=...`
- `getById()` - GET `/api/products/:id`
- `create()` - POST `/api/products`
- `update()` - PUT `/api/products/:id`
- `delete()` - DELETE `/api/products/:id`
- `search()` - GET `/api/products/search?search=...`
- `uploadImage()` - POST `/api/products/:id/image` (FormData)

### ✅ OrdersService
- `getOrders()` - GET `/api/orders?lojaId=...`
- `getOrderById()` - GET `/api/orders/:id`
- `getOrderStats()` - GET `/api/orders/stats?lojaId=...`
- `updateOrderStatus()` - PUT `/api/orders/:id/status`
- `createOrder()` - POST `/api/orders`
- `deleteOrder()` - DELETE `/api/orders/:id`

### ✅ DashboardService
- `fetchOverview()` - GET `/api/dashboard/overview?lojaId=...`
- `fetchChartData()` - GET `/api/dashboard/chart?period=...&lojaId=...`
- `fetchRecentOrders()` - GET `/api/dashboard/recent-orders?lojaId=...`
- `fetchFeaturedProducts()` - GET `/api/dashboard/featured-products?lojaId=...`

## 🔄 Formato de Requisições e Respostas

### Requisições GET

```typescript
// Com parâmetros de query
apiClient.get<Product[]>('/api/products', { lojaId: '1', status: 'active' })
// Resultado: GET /api/products?lojaId=1&status=active
```

### Requisições POST/PUT

```typescript
// Enviando dados JSON
apiClient.post<Product>('/api/products', {
  nome: 'Produto',
  preco: 100,
  // ...
})
```

### Upload de Arquivos

```typescript
apiClient.upload<{ imageUrl: string }>(
  '/api/products/1/image',
  file,
  'image'
)
```

### Formato de Resposta

O back-end deve retornar os dados em um dos seguintes formatos:

```typescript
// Opção 1: Direto no data
{
  data: { /* seus dados */ }
}

// Opção 2: Dados diretos (recomendado)
{ /* seus dados diretamente */ }
```

### Tratamento de Erros

O cliente HTTP trata automaticamente:
- **401 Unauthorized**: Remove token e redireciona para `/auth`
- **404 Not Found**: Retorna `null` em métodos `getById`
- **Outros erros**: Lança exceção com mensagem do back-end

```typescript
try {
  const product = await ProductService.getById('1');
} catch (error) {
  // error.message contém a mensagem de erro do back-end
  console.error(error.message);
}
```

## 📝 Notas Importantes

1. **Headers Automáticos**: O cliente adiciona automaticamente:
   - `Content-Type: application/json`
   - `Authorization: Bearer {token}` (se disponível)

2. **Conversão de Datas**: Os serviços convertem strings de data para objetos `Date` automaticamente

3. **Parâmetros Opcionais**: Parâmetros como `lojaId` são opcionais e podem ser omitidos nas requisições

4. **Upload de Imagens**: Use o método `upload()` para envio de arquivos, não `post()`

## 🚀 Próximos Passos

1. Configure o back-end para responder nos endpoints especificados
2. Implemente autenticação JWT no back-end
3. Teste cada endpoint individualmente
4. Ajuste os formatos de resposta se necessário
5. Implemente tratamento de refresh token se necessário

## 🔧 Troubleshooting

### Erro: "Network Error" ou "CORS Error"
- Verifique se o back-end está rodando
- Configure CORS no back-end para permitir requisições do front-end
- Verifique se a URL da API está correta

### Erro: 401 Unauthorized
- O token pode ter expirado - faça login novamente
- Verifique se o back-end está validando o token corretamente

### Erro: "Cannot read property 'data' of undefined"
- O formato de resposta do back-end pode estar diferente
- Ajuste o método `handleResponse` em `src/lib/api/client.ts` se necessário

