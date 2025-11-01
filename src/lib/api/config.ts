/**
 * Configuração da API
 */
export const API_CONFIG = {
  // URL base da API - pode ser configurada via variável de ambiente
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  
  // Timeouts
  TIMEOUT: 30000, // 30 segundos
  
  // Endpoints
  ENDPOINTS: {
    // Autenticação
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      REFRESH: '/auth/refresh',
      LOGOUT: '/auth/logout',
      PROFILE: '/auth/profile',
      CHANGE_PASSWORD: '/auth/change-password',
    },
    
    // Produtos
    PRODUCTS: '/products',
    
    // Pedidos
    ORDERS: '/orders',
    
    // Dashboard
    DASHBOARD: '/dashboard',
    
    // Estoque
    INVENTORY: '/inventory',
    
    // Clientes
    CLIENTS: '/clients',
    
    // Loja
    STORE: '/store',
    
    // Financeiro
    FINANCIAL: '/financial',
    
    // Relatórios
    REPORTS: '/reports',
    
    // Marketing
    MARKETING: '/marketing',
    
    // Tendências
    TRENDS: '/trends',
    
    // Integrações
    INTEGRATIONS: '/integrations',
    
    // Configurações
    SETTINGS: '/settings',
    
    // Ajuda
    HELP: '/help',
  },
} as const;

