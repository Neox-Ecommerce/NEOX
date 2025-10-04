# 🛒 NEOX

**NEOX** é uma plataforma moderna de e-commerce voltada para empreendedores digitais. Com uma interface intuitiva, responsiva e funcionalidades robustas, o sistema permite que usuários criem, gerenciem e operem suas próprias lojas virtuais de forma rápida e eficiente.

## 🌐 Visão Geral

O projeto está sendo desenvolvido em **React + Vite**, com foco em boas práticas de UI/UX, componentização, modularização e escalabilidade. Atualmente está em fase de desenvolvimento front-end, com mock de dados em LocalStorage, mas com interfaces prontas para integração via API REST.

---

## ✅ Funcionalidades já implementadas

- [x] Tela inicial (Home)
- [x] Login e cadastro (com distinção de Empreendedor e Cliente)
- [x] Painel do empreendedor (Dashboard)
- [x] Cadastro e edição de produtos (com imagem, preço, estoque)
- [x] Vitrine pública com produtos em destaque
- [x] Validação com Zod e mensagens inline
- [x] Pré-visualização de imagem no formulário
- [x] Limite de 5MB para upload
- [x] Toasts de sucesso/erro com feedback imediato
- [x] Skeleton loaders e animação com React CountUp
- [x] Busca reativa com debounce (Meus Produtos)
- [x] Simulação de API com LocalStorage
- [x] Finalizar cadastro de loja com verificação de CNPJ
- [x] Criar painel administrativo completo

---

## ⚙️ Tecnologias Utilizadas

- **React 18**
- **Vite**
- **TypeScript**
- **Tailwind CSS**
- **ShadCN/UI**
- **React Query**
- **Zod**
- **React CountUp**
- **LocalStorage** (mock de persistência)

---

## 📁 Estrutura de Pastas (Completa)

```
📦src
 ┣ 📂components
 ┃ ┣ 📂ui
 ┃ ┃ ┣ 📜accordion.tsx
 ┃ ┃ ┣ 📜alert.tsx
 ┃ ┃ ┣ 📜badge.tsx
 ┃ ┃ ┣ 📜button.tsx
 ┃ ┃ ┣ 📜card.tsx
 ┃ ┃ ┣ 📜checkbox.tsx
 ┃ ┃ ┣ 📜dialog.tsx
 ┃ ┃ ┣ 📜dropdown-menu.tsx
 ┃ ┃ ┣ 📜input.tsx
 ┃ ┃ ┣ 📜label.tsx
 ┃ ┃ ┣ 📜select.tsx
 ┃ ┃ ┣ 📜skeleton.tsx
 ┃ ┃ ┣ 📜switch.tsx
 ┃ ┃ ┣ 📜table.tsx
 ┃ ┃ ┣ 📜tabs.tsx
 ┃ ┃ ┣ 📜textarea.tsx
 ┃ ┃ ┣ 📜toast.tsx
 ┃ ┃ ┣ 📜toaster.tsx
 ┃ ┃ ┗ 📜tooltip.tsx
 ┃ ┣ 📜AppShell.tsx
 ┃ ┣ 📜AuthGuard.tsx
 ┃ ┣ 📜DocumentUploadModal.tsx
 ┃ ┣ 📜LoadingOverlay.tsx
 ┃ ┣ 📜MetricCard.tsx
 ┃ ┣ 📜ProductAdminCard.tsx
 ┃ ┣ 📜ProductForm.tsx
 ┃ ┣ 📜RevenueChart.tsx
 ┃ ┣ 📜RoleGuard.tsx
 ┃ ┗ 📜StatsWidget.tsx
 ┣ 📂contexts
 ┃ ┗ 📜AuthContext.tsx
 ┣ 📂hooks
 ┃ ┣ 📜use-toast.ts
 ┃ ┗ 📜useDebounce.ts
 ┣ 📂lib
 ┃ ┗ 📜utils.ts
 ┣ 📂pages
 ┃ ┣ 📂admin
 ┃ ┃ ┣ 📜login.tsx
 ┃ ┃ ┣ 📜stores.tsx
 ┃ ┃ ┗ 📜videos.tsx
 ┃ ┣ 📂auth
 ┃ ┃ ┣ 📂components
 ┃ ┃ ┃ ┣ 📂registration
 ┃ ┃ ┃ ┃ ┣ 📜PersonalDataStep.tsx
 ┃ ┃ ┃ ┃ ┣ 📜RegistrationSuccess.tsx
 ┃ ┃ ┃ ┃ ┣ 📜StoreDataStep.tsx
 ┃ ┃ ┃ ┃ ┗ 📜VerificationStep.tsx
 ┃ ┃ ┃ ┣ 📜auth-page.tsx
 ┃ ┃ ┃ ┣ 📜EntrepreneurRegistration.tsx
 ┃ ┃ ┃ ┣ 📜FloatingIcons.tsx
 ┃ ┃ ┃ ┣ 📜LoginForm.tsx
 ┃ ┃ ┃ ┣ 📜RegisterForm.tsx
 ┃ ┃ ┃ ┗ 📜RoleSelector.tsx
 ┃ ┃ ┣ 📜auth-page.tsx
 ┃ ┃ ┣ 📜index.tsx
 ┃ ┃ ┣ 📜login.tsx
 ┃ ┃ ┗ 📜register.tsx
 ┃ ┣ 📂client
 ┃ ┃ ┣ 📜cart.tsx
 ┃ ┃ ┣ 📜dashboard.tsx
 ┃ ┃ ┣ 📜home.tsx
 ┃ ┃ ┣ 📜product.tsx
 ┃ ┃ ┗ 📜store.tsx
 ┃ ┣ 📂errors
 ┃ ┃ ┣ 📜not-found.tsx
 ┃ ┃ ┗ 📜unauthorized.tsx
 ┃ ┣ 📂painel
 ┃ ┃ ┣ 📜ajuda.tsx
 ┃ ┃ ┣ 📜clientes.tsx
 ┃ ┃ ┣ 📜configuracoes.tsx
 ┃ ┃ ┣ 📜dashboard.tsx
 ┃ ┃ ┣ 📜estoque.tsx
 ┃ ┃ ┣ 📜financeiro.tsx
 ┃ ┃ ┣ 📜integracoes.tsx
 ┃ ┃ ┣ 📜marketing.tsx
 ┃ ┃ ┣ 📜pedidos.tsx
 ┃ ┃ ┣ 📜relatorios.tsx
 ┃ ┃ ┗ 📜trends.tsx
 ┃ ┣ 📂products
 ┃ ┃ ┣ 📜form.tsx
 ┃ ┃ ┗ 📜index.tsx
 ┃ ┗ 📜profile.tsx
 ┣ 📂services
 ┃ ┣ 📜AuthService.ts
 ┃ ┣ 📜ClientsService.ts
 ┃ ┣ 📜DashboardService.ts
 ┃ ┣ 📜FeedbackService.ts
 ┃ ┣ 📜FinancialService.ts
 ┃ ┣ 📜HelpService.ts
 ┃ ┣ 📜IntegrationsService.ts
 ┃ ┣ 📜InventoryService.ts
 ┃ ┣ 📜MarketingService.ts
 ┃ ┣ 📜OrdersService.ts
 ┃ ┣ 📜ProductService.ts
 ┃ ┣ 📜ReportsService.ts
 ┃ ┣ 📜SettingsService.ts
 ┃ ┣ 📜StoreService.ts
 ┃ ┣ 📜TrendsService.ts
 ┃ ┗ 📜UserService.ts
 ┣ 📜App.tsx
 ┣ 📜index.css
 ┣ 📜main.tsx
 ┗ 📜vite-env.d.ts
```

---

## 🔗 Ponto de Integração: `/src/services/`

A pasta `/services/` concentra todos os módulos de comunicação com o back-end. Cada arquivo representa uma **interface para consumo de APIs** específicas, com métodos como `getAll`, `getById`, `create`, `update`, `delete`.

| Serviço Front-end              | Expectativa no Back-end (API REST)            |
|--------------------------------|-----------------------------------------------|
| `AuthService.ts`               | Login, registro, verificação de perfil        |
| `ProductService.ts`            | CRUD de produtos                              |
| `OrdersService.ts`             | Listar, atualizar status, criar pedidos       |
| `FinancialService.ts`          | Consultar repasses, taxas, saldo              |
| `ReportsService.ts`            | Gerar relatórios (vendas, pedidos, estoque)   |
| `DashboardService.ts`          | KPIs (visitas, vendas, pedidos pendentes etc.)|
| `ClientsService.ts`            | Listagem de clientes e perfis                 |
| `MarketingService.ts`          | Produtos em destaque (trends), vídeos         |
| `StoreService.ts`              | Cadastro de loja, CNPJ, redes sociais         |

---

## 📁 Estrutura de Telas (`/pages/`)

As páginas representam rotas divididas por tipo de usuário. O back-end fornecerá dados via JSON para alimentar essas telas.

- **`/auth`** – Registro e autenticação (JWT esperado).  
- **`/client`** – Vitrine, loja, produtos e carrinho.  
- **`/painel`** – Área do empreendedor com dashboard, produtos, financeiro, relatórios.  
- **`/admin`** – Telas administrativas.  
- **`/products`** – Cadastro/edição de produto.

---

## 🔐 Autenticação e Autorização

- Contexto de autenticação via `AuthContext.tsx`.  
- Guardiões de rota: `AuthGuard` / `RoleGuard`.  
- O back-end deve retornar um **JWT** contendo o perfil (`admin`, `empreendedor`, `cliente`).

---

## 🎯 Sugestão de Organização REST no Back-end

```
/api/
├── auth/
├── products/
├── orders/
├── finance/
├── reports/
├── dashboard/
├── marketing/
├── clients/
└── store/
```

Cada rota segue o padrão RESTful:

```
GET    /api/products
GET    /api/products/:id
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
```

---

## 📌 Observações

- Os dados ainda são mockados no front (LocalStorage).  
- As interfaces de requisição/resposta já estão preparadas para consumir APIs reais.  
- Toasts e loaders estão integrados aos retornos HTTP.  
- Espera-se um token JWT no header `Authorization` para rotas privadas.

---

## 🧪 Como Rodar Localmente

### Pré-requisitos
- Node.js (v18+ recomendado)
- Git

### Passos:

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/neox.git
   cd neox
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Execute o projeto**
   ```bash
   npm run dev
   ```

4. **Acesse no navegador**
   ```
   http://localhost:5173/
   ```

---

## 🚧 Status do Projeto

🟡 **Em desenvolvimento**  
✔️ Front-end parcialmente concluído  
❌ Back-end ainda não implementado (mock via LocalStorage)  
🔜 Integração com Spring Boot e banco de dados MySQL

---

## 🧑‍💻 Equipe

- **Josias Azevedo** – Full-stack, UI/UX e protótipos (Fundador)
- **Cauã** – Back-end e arquitetura (Co-fundador)
- **Fabricio** – Back-end e suporte

---

## 📌 Roadmap (Próximos passos)

- [ ] Implementar autenticação JWT com Spring Boot
- [ ] Desenvolver API REST e conectar com o front
- [ ] Gerar relatórios (PDF, CSV)
- [ ] Integrações com meios de pagamento

---

## 📄 Licença

Este é um projeto **privado**. Todos os direitos reservados aos desenvolvedores autorizados.  
**Proibido uso, distribuição ou modificação sem autorização prévia.**
