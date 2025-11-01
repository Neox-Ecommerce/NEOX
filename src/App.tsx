import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { Toaster } from '@/components/ui/toaster';
// Import direto do default export - não usar lazy loading para evitar erros
import AuthPage from '@/pages/auth/index';

// Lazy load components
const Dashboard = React.lazy(() => import('@/pages/painel/dashboard').then(m => ({ default: m.Dashboard })));
const ProductsPage = React.lazy(() => import('@/pages/products/index').then(m => ({ default: m.ProductsPage })));
const ProductFormPage = React.lazy(() => import('@/pages/products/form').then(m => ({ default: m.ProductFormPage })));
const EstoquePage = React.lazy(() => import('@/pages/painel/estoque').then(m => ({ default: m.EstoquePage })));
const PedidosPage = React.lazy(() => import('@/pages/painel/pedidos').then(m => ({ default: m.PedidosPage })));
const TrendsPage = React.lazy(() => import('@/pages/painel/trends').then(m => ({ default: m.TrendsPage })));
const ClientesPage = React.lazy(() => import('@/pages/painel/clientes').then(m => ({ default: m.ClientesPage })));
const MarketingPage = React.lazy(() => import('@/pages/painel/marketing').then(m => ({ default: m.MarketingPage })));
const RelatoriosPage = React.lazy(() => import('@/pages/painel/relatorios').then(m => ({ default: m.RelatoriosPage })));
const FinanceiroPage = React.lazy(() => import('@/pages/painel/financeiro').then(m => ({ default: m.FinanceiroPage })));
const IntegracoesPage = React.lazy(() => import('@/pages/painel/integracoes').then(m => ({ default: m.IntegracoesPage })));
const ConfiguracoesPage = React.lazy(() => import('@/pages/painel/configuracoes').then(m => ({ default: m.ConfiguracoesPage })));
const AjudaPage = React.lazy(() => import('@/pages/painel/ajuda').then(m => ({ default: m.AjudaPage })));
const ProfilePage = React.lazy(() => import('@/pages/profile').then(m => ({ default: m.ProfilePage })));
const NotFoundPage = React.lazy(() => import('@/pages/errors/not-found').then(m => ({ default: m.NotFoundPage })));
const UnauthorizedPage = React.lazy(() => import('@/pages/errors/unauthorized').then(m => ({ default: m.UnauthorizedPage })));

// Cliente pages
const ClientHomePage = React.lazy(() => import('@/pages/client/home').then(m => ({ default: m.ClientHomePage })));
const ClientDashboard = React.lazy(() => import('@/pages/client/dashboard').then(m => ({ default: m.ClientDashboard })));
const StorePage = React.lazy(() => import('@/pages/client/store').then(m => ({ default: m.StorePage })));
const ProductPage = React.lazy(() => import('@/pages/client/product').then(m => ({ default: m.ProductPage })));
const CartPage = React.lazy(() => import('@/pages/client/cart').then(m => ({ default: m.CartPage })));

// Admin pages
const AdminStoresPage = React.lazy(() => import('@/pages/admin/stores').then(m => ({ default: m.AdminStoresPage })));
const AdminLoginPage = React.lazy(() => import('@/pages/admin/login').then(m => ({ default: m.AdminLoginPage })));
const AdminVideosPage = React.lazy(() => import('@/pages/admin/videos').then(m => ({ default: m.AdminVideosPage })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <LoadingOverlay />
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            }>
              <Routes>
                {/* Public Routes */}
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                
                {/* Client Routes */}
                <Route path="/" element={<ClientHomePage />} />
                <Route path="/cliente" element={<ClientDashboard />} />
                <Route path="/lojas/:id" element={<StorePage />} />
                <Route path="/produto/:id" element={<ProductPage />} />
                <Route path="/carrinho" element={<CartPage />} />
                
                {/* Painel do Empreendedor */}
                <Route path="/painel" element={<Navigate to="/painel/dashboard" replace />} />
                <Route path="/painel/dashboard" element={<Dashboard />} />
                <Route path="/painel/produtos" element={<ProductsPage />} />
                <Route path="/painel/produtos/novo" element={<ProductFormPage />} />
                <Route path="/painel/produtos/editar/:id" element={<ProductFormPage />} />
                <Route path="/painel/estoque" element={<EstoquePage />} />
                <Route path="/painel/pedidos" element={<PedidosPage />} />
                <Route path="/painel/trends" element={<TrendsPage />} />
                <Route path="/painel/clientes" element={<ClientesPage />} />
                <Route path="/painel/marketing" element={<MarketingPage />} />
                <Route path="/painel/relatorios" element={<RelatoriosPage />} />
                <Route path="/painel/financeiro" element={<FinanceiroPage />} />
                <Route path="/painel/financeiro/pagamentos" element={<FinanceiroPage />} />
                <Route path="/painel/financeiro/repasses" element={<FinanceiroPage />} />
                <Route path="/painel/integracoes" element={<IntegracoesPage />} />
                <Route path="/painel/configuracoes" element={<ConfiguracoesPage />} />
                <Route path="/painel/ajuda" element={<AjudaPage />} />
                <Route path="/painel/perfil" element={<ProfilePage />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<Navigate to="/admin/lojas" replace />} />
                <Route path="/admin/lojas" element={<AdminStoresPage />} />
                <Route path="/admin/videos" element={<AdminVideosPage />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />
                
                {/* Legacy redirects */}
                <Route path="/login" element={<Navigate to="/auth" replace />} />
                <Route path="/register" element={<Navigate to="/auth" replace />} />
                <Route path="/dashboard" element={<Navigate to="/painel/dashboard" replace />} />
                <Route path="/products" element={<Navigate to="/painel/produtos" replace />} />
                <Route path="/products/new" element={<Navigate to="/painel/produtos/novo" replace />} />
                <Route path="/products/edit/:id" element={<Navigate to="/painel/produtos/editar/:id" replace />} />
                <Route path="/profile" element={<Navigate to="/painel/perfil" replace />} />
                
                {/* Catch all - 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;