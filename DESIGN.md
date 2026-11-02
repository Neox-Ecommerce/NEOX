# NEOX — Design system

Referência visual e de interação do front. Os tokens ficam em `src/index.css` e são expostos ao Tailwind em `tailwind.config.js`.
**Nunca use cores fixas do Tailwind** (`green-600`, `blue-500`…): use os tokens abaixo para que o tema escuro e o contraste funcionem.

## 1. Cores (tokens)

O **tema escuro é o padrão** e segue a logo: fundo verde quase preto (`#001300` na logo), verde das letras como cor principal e o gradiente do anel (lima → verde → verde-água) como destaque. O tema claro continua disponível pelo botão de tema no painel e no admin; a escolha fica salva no navegador.

Todos os pares texto/fundo abaixo têm contraste **≥ 4,5:1 (WCAG AA)** nos dois temas. A conferência foi feita por cálculo; o menor par é 5,5:1 no escuro e 4,7:1 no claro.

| Token | Escuro (padrão) | Claro | Uso |
|---|---|---|---|
| `background` / `foreground` | `hsl(140 45% 4%)` / quase branco | branco / `#0F172A` | Fundo e texto principal |
| `card`, `muted`, `border`, `input` | verdes muito escuros | neutros | Superfícies |
| `primary` / `primary-foreground` | `#2FDD4C` (verde da logo) / `#001300` | verde da logo escurecido / branco | Ações principais, links, item ativo, preço |
| `primary-muted` | verde escuro | verde 94% | Fundo do item ativo, destaques suaves |
| `brand` / `brand-2` | `#E0FF41` / `#1DFEAB` | iguais | **Só decorativo**: gradiente do anel (`text-brand-gradient`, `bg-brand-gradient`), usar apenas com `dark:` em texto |
| `success` / `-muted` | = primary | = primary | Entregue, pago, em estoque |
| `warning` / `-muted` | amarelo | `#B45309` | Pendente, estoque baixo, loja em análise |
| `destructive` / `-muted` | vermelho claro | `#B91C1C` | Erro, cancelado, esgotado, excluir |
| `info` / `-muted` | verde-água | `#1D4ED8` | Status em andamento (confirmado, enviado) |
| `admin` / `-muted` | índigo claro | `#4F46E5` | Destaque da área admin |
| `muted-foreground` | cinza esverdeado | cinza | Texto secundário |

Regra: texto sobre `primary`, `info`, `warning`, `destructive` ou `admin` usa sempre o `-foreground` correspondente (no escuro é texto escuro; `text-white` fixo não passa no contraste).

Status sempre com **cor + texto**: use `<StatusBadge kind="order|payment|store|stock" value=…/>`.

## 2. Tipografia

- Fonte: **Inter** (400, 500, 600, 700), carregada no `index.html`, com as fontes do sistema como fallback.
- Escala:

  | Elemento | Classes |
  |---|---|
  | Título de página | `text-2xl font-semibold tracking-tight` (dentro do `PageHeader`) |
  | Seção | `text-lg font-semibold` |
  | Corpo | `text-sm` |
  | Texto auxiliar | `text-sm text-muted-foreground` |
  | Legenda | `text-xs` |

- Preço: `font-semibold text-primary`. Preço antigo: `text-muted-foreground line-through`.

## 3. Espaçamento, raio e alvos de toque

- Escala de 4px (a padrão do Tailwind): `gap-2` (8px) entre controles, `gap-4` (16px) entre blocos, `gap-6` (24px) entre seções, `p-4`/`p-6` em cards.
- Raio: `--radius` 0,5rem (`rounded-lg`); botões e inputs `rounded-md`; chips e busca `rounded-full`.
- **Alvo de toque mínimo de 44px:** o `Button` já tem `h-11` no mobile e `h-10` a partir de `sm`. Itens de menu usam `min-h-11`.

## 4. Componentes

| Componente | Arquivo | Regra |
|---|---|---|
| `Button` | `components/ui/button.tsx` | Sempre em vez de `<button>` estilizado à mão. Variantes: default, outline, ghost, destructive, link |
| `IconButton` | `components/PageStates.tsx` | Botão só com ícone; `label` obrigatório (vira `aria-label`) |
| `PageHeader` | `components/PageStates.tsx` | Topo de toda página do painel/admin: trilha, título, descrição, ações |
| `PageLoader`, `EmptyState`, `ErrorState`, `QueryState` | `components/PageStates.tsx` | Toda lista tem os 4 estados: carregando, erro (com "Tentar novamente"), vazio (com próxima ação) e dados |
| `StatusBadge` | `components/StatusBadge.tsx` | Status de pedido, pagamento, loja e estoque. Também exporta `ORDER_TRANSITIONS`, `ORDER_NEXT_STEP`, `stockLevel()` |
| `MetricCard` | `components/MetricCard.tsx` | Números-resumo em dashboards (lojista e admin) |
| Card de produto | `pages/client/ProductCard.tsx` | Imagem 1:1 `loading="lazy"`, nome em 2 linhas, preço, desconto, loja; o card inteiro é o link |
| Inputs | `components/ui/input.tsx` + `Label` | Todo campo tem `<Label htmlFor>`; erro abaixo do campo com `aria-invalid` + `aria-describedby` |

**Regra de estoque baixo (única no app):** `estoque <= minStock` (padrão 5), via `stockLevel()`.

## 5. Layouts

| Layout | Arquivo | Estrutura |
|---|---|---|
| Loja (cliente) | `components/layouts/StorefrontLayout.tsx` | Cabeçalho fixo: logo, busca, Lojas, Conta, carrinho com contador. Barra inferior no mobile: Início, Buscar, Carrinho, Conta. Rodapé. Link "Pular para o conteúdo" |
| Painel do lojista | `components/layouts/PanelLayout.tsx` | Menu lateral fixo em 6 grupos: Início, Vendas, Catálogo, Marketing, Financeiro, Minha loja. Rodapé do menu: Minha conta, Ajuda, Sair. Banner de status da loja. Barra inferior no mobile: Início, Pedidos, Produtos, Mais |
| Admin | `components/layouts/AdminLayout.tsx` | Mesma estrutura do painel com destaque `admin` (índigo): Visão geral, Lojas, Vídeos, Repasses, Suporte, Usuários, Configurações |

As páginas **não** montam layout próprio: o layout vem da rota (`App.tsx`, rotas aninhadas com `<Outlet/>`). O menu no celular usa Radix Dialog: prende o foco, fecha com Esc e ao tocar fora.

## 6. Telas-chave (especificação resumida)

| Tela | Objetivo | Estrutura | Mobile |
|---|---|---|---|
| **Vitrine `/`** | Descobrir produtos | Busca em destaque, faixa de categorias, produtos recentes (grade), lojas | Grade de 2 colunas |
| **Produto** | Decidir e comprar | Trilha → imagem · nome, preço/desconto, estoque, quantidade, CTA, loja → descrição/especificações | CTA "Adicionar ao carrinho" fixo no rodapé |
| **Checkout** | Pagar com o mínimo de passos | 1. Entrega (CEP primeiro → autopreenche; endereço salvo) · 2. Revisão (itens por loja, frete por loja, cupom, total real) → pagar | Resumo recolhível no topo, botão fixo no rodapé |
| **Dashboard do lojista** | Saber o que fazer agora | Checklist de configuração (loja nova) · métricas · alertas clicáveis · pedidos recentes | Métricas em 2 colunas |
| **Produtos** | Encontrar e editar rápido | `PageHeader` + filtros (busca, categoria, status, estoque) + tabela com ações em lote | Cards no lugar da tabela |
| **Edição de produto** | Cadastrar sem erro | Seções: Básico, Preço e estoque, Imagem, Envio; aviso de alterações não salvas | Seções empilhadas, botão Salvar fixo |
| **Admin: Visão geral** | Saúde da plataforma | Pendências (lojas para aprovar, vídeos denunciados, chamados abertos, repasses pendentes) + números globais | Cards empilhados |
| **Admin: Lojas** | Moderar | Fila "Em análise" primeiro; lista com busca/filtro; detalhe em `/admin/lojas/:id` | Lista em cards |
| **Admin: Configurações** | Regras globais | Contato de suporte, taxa da plataforma (%) | Formulário único |

## 7. Acessibilidade (checklist por tela)

- Foco visível (`:focus-visible` global) e ordem de tabulação lógica.
- Um `h1` por página (o `PageHeader`); sem pular nível de título.
- Ícones decorativos com `aria-hidden`; botões só com ícone usam `IconButton`.
- Formulários: rótulo, `autoComplete`, erro por campo e `aria-invalid`.
- Animações respeitam `prefers-reduced-motion` (já está no CSS global).
- Status nunca só por cor.
