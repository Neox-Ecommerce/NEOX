// ============================================
// CONSTANTES DA APLICAÇÃO
// ============================================

export const APP_CONFIG = {
  name: 'NEOX',
  version: '1.0.0',
  description: 'Plataforma de E-commerce Completa',
} as const;

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
} as const;

export const STORAGE_KEYS = {
  token: 'neox_token',
  refreshToken: 'neox_refresh_token',
  user: 'neox_user',
  theme: 'neox_theme',
} as const;

export const ROUTES = {
  // Público
  home: '/',
  auth: '/auth',
  login: '/auth/login',
  register: '/auth/register',
  
  // Cliente
  client: {
    home: '/cliente',
    store: '/loja',
    cart: '/carrinho',
    product: '/produto/:id',
  },
  
  // Painel Empreendedor
  painel: {
    dashboard: '/painel/dashboard',
    produtos: '/painel/produtos',
    produtosNovo: '/painel/produtos/novo',
    produtosEditar: '/painel/produtos/editar/:id',
    pedidos: '/painel/pedidos',
    clientes: '/painel/clientes',
    financeiro: '/painel/financeiro',
    estoque: '/painel/estoque',
    marketing: '/painel/marketing',
    relatorios: '/painel/relatorios',
    trends: '/painel/trends',
    integracoes: '/painel/integracoes',
    configuracoes: '/painel/configuracoes',
    ajuda: '/painel/ajuda',
  },
  
  // Admin
  admin: {
    dashboard: '/admin/dashboard',
    lojas: '/admin/lojas',
    videos: '/admin/videos',
    usuarios: '/admin/usuarios',
  },
} as const;

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  EMPREENDEDOR: 'EMPREENDEDOR',
  CLIENTE: 'CLIENTE',
} as const;

export const QUERY_KEYS = {
  products: 'products',
  product: 'product',
  categories: 'categories',
  orders: 'orders',
  clients: 'clients',
  inventory: 'inventory',
  stats: 'stats',
} as const;

