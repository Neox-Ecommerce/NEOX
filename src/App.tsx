import React, { Suspense } from 'react';
import {
  createBrowserRouter, createRoutesFromElements, Navigate, Outlet, Route, RouterProvider, useLocation, useParams,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { Toaster } from '@/components/ui/toaster';
import { RoleGuard } from '@/components/RoleGuard';
import { PageLoader } from '@/components/PageStates';
import { StorefrontLayout } from '@/components/layouts/StorefrontLayout';
import { PanelLayout } from '@/components/layouts/PanelLayout';
import { AdminLayout } from '@/components/layouts/AdminLayout';

const lazy = <T extends Record<string, React.ComponentType>>(load: () => Promise<T>, name: keyof T) =>
  React.lazy(() => load().then((m) => ({ default: m[name] })));

// Loja (cliente)
const StorefrontHomePage = lazy(() => import('@/pages/client/storefront'), 'StorefrontHomePage');
const SearchPage = lazy(() => import('@/pages/client/search'), 'SearchPage');
const StoresPage = lazy(() => import('@/pages/client/stores'), 'StoresPage');
const StorePage = lazy(() => import('@/pages/client/store'), 'StorePage');
const ProductPage = lazy(() => import('@/pages/client/product'), 'ProductPage');
const CartPage = lazy(() => import('@/pages/client/cart'), 'CartPage');
const CheckoutPage = lazy(() => import('@/pages/client/checkout'), 'CheckoutPage');
const CheckoutReturnPage = lazy(() => import('@/pages/client/checkout-return'), 'CheckoutReturnPage');
const AccountPage = lazy(() => import('@/pages/client/account'), 'AccountPage');
const TermsPage = lazy(() => import('@/pages/client/legal'), 'TermsPage');
const PrivacyPage = lazy(() => import('@/pages/client/legal'), 'PrivacyPage');
const SellLandingPage = lazy(() => import('@/pages/client/home'), 'ClientHomePage');

// Acesso
const AuthPage = lazy(() => import('@/pages/auth'), 'AuthPage');
const ForgotPasswordPage = lazy(() => import('@/pages/auth/password'), 'ForgotPasswordPage');
const ResetPasswordPage = lazy(() => import('@/pages/auth/password'), 'ResetPasswordPage');
const SellerSignupPage = lazy(() => import('@/pages/auth/components/EntrepreneurRegistration'), 'EntrepreneurRegistration');

// Painel do lojista
const Dashboard = lazy(() => import('@/pages/painel/dashboard'), 'Dashboard');
const ProductsPage = lazy(() => import('@/pages/products/index'), 'ProductsPage');
const ProductFormPage = lazy(() => import('@/pages/products/form'), 'ProductFormPage');
const EstoquePage = lazy(() => import('@/pages/painel/estoque'), 'EstoquePage');
const PedidosPage = lazy(() => import('@/pages/painel/pedidos'), 'PedidosPage');
const TrendsPage = lazy(() => import('@/pages/painel/trends'), 'TrendsPage');
const ClientesPage = lazy(() => import('@/pages/painel/clientes'), 'ClientesPage');
const MarketingPage = lazy(() => import('@/pages/painel/marketing'), 'MarketingPage');
const RelatoriosPage = lazy(() => import('@/pages/painel/relatorios'), 'RelatoriosPage');
const FinanceiroPage = lazy(() => import('@/pages/painel/financeiro'), 'FinanceiroPage');
const AjudaPage = lazy(() => import('@/pages/painel/ajuda'), 'AjudaPage');
const MyStorePage = lazy(() => import('@/pages/painel/loja'), 'MyStorePage');
const MyAccountPage = lazy(() => import('@/pages/painel/conta'), 'MyAccountPage');

// Admin
const AdminLoginPage = lazy(() => import('@/pages/admin/login'), 'AdminLoginPage');
const AdminOverviewPage = lazy(() => import('@/pages/admin/overview'), 'AdminOverviewPage');
const AdminStoresPage = lazy(() => import('@/pages/admin/stores'), 'AdminStoresPage');
const AdminStoreDetailPage = lazy(() => import('@/pages/admin/store-detail'), 'AdminStoreDetailPage');
const AdminVideosPage = lazy(() => import('@/pages/admin/videos'), 'AdminVideosPage');
const AdminPayoutsPage = lazy(() => import('@/pages/admin/payouts'), 'AdminPayoutsPage');
const AdminSupportPage = lazy(() => import('@/pages/admin/support'), 'AdminSupportPage');
const AdminUsersPage = lazy(() => import('@/pages/admin/users'), 'AdminUsersPage');
const AdminSettingsPage = lazy(() => import('@/pages/admin/settings'), 'AdminSettingsPage');

// Erros
const NotFoundPage = lazy(() => import('@/pages/errors/not-found'), 'NotFoundPage');
const UnauthorizedPage = lazy(() => import('@/pages/errors/unauthorized'), 'UnauthorizedPage');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
    },
  },
});

/** Redirect que preserva a query string (ex.: /auth?next=… → /entrar?next=…). */
function KeepQuery({ to }: { to: string }) {
  const { search } = useLocation();
  return <Navigate to={to + search} replace />;
}

/** Redirect de rota antiga que preserva o :id. */
function LegacyProductEdit() {
  const { id } = useParams();
  return <Navigate to={`/painel/produtos/editar/${id}`} replace />;
}

const guard = (role: 'CLIENTE' | 'EMPREENDEDOR' | 'ADMIN') => (
  <RoleGuard requiredRole={role}>
    <Outlet />
  </RoleGuard>
);

/** Raiz das rotas: tudo que precisa estar dentro do roteador. */
function RootLayout() {
  return (
    <>
      <LoadingOverlay />
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
      <Toaster />
    </>
  );
}

// Roteador de dados (createBrowserRouter): necessário para useBlocker (aviso de alterações não salvas).
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<RootLayout />}>
              {/* Loja pública e área do cliente */}
              <Route element={<StorefrontLayout />}>
                <Route path="/" element={<StorefrontHomePage />} />
                <Route path="/buscar" element={<SearchPage />} />
                <Route path="/lojas" element={<StoresPage />} />
                <Route path="/lojas/:id" element={<StorePage />} />
                <Route path="/produto/:id" element={<ProductPage />} />
                <Route path="/carrinho" element={<CartPage />} />
                <Route path="/termos" element={<TermsPage />} />
                <Route path="/privacidade" element={<PrivacyPage />} />
                <Route element={guard('CLIENTE')}>
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/checkout/retorno" element={<CheckoutReturnPage />} />
                  <Route path="/conta/*" element={<AccountPage />} />
                </Route>
              </Route>

              {/* Acesso e página de vendas para lojistas (layout próprio) */}
              <Route path="/entrar" element={<AuthPage />} />
              <Route path="/recuperar-senha" element={<ForgotPasswordPage />} />
              <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
              <Route path="/vender" element={<SellLandingPage />} />
              <Route path="/vender/cadastro" element={<SellerSignupPage />} />

              {/* Painel do lojista */}
              <Route path="/painel" element={guard('EMPREENDEDOR')}>
                <Route element={<PanelLayout />}>
                  <Route index element={<Navigate to="/painel/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="pedidos" element={<PedidosPage />} />
                  <Route path="clientes" element={<ClientesPage />} />
                  <Route path="produtos" element={<ProductsPage />} />
                  <Route path="produtos/novo" element={<ProductFormPage />} />
                  <Route path="produtos/editar/:id" element={<ProductFormPage />} />
                  <Route path="estoque" element={<EstoquePage />} />
                  <Route path="marketing" element={<MarketingPage />} />
                  <Route path="trends" element={<TrendsPage />} />
                  <Route path="financeiro/*" element={<FinanceiroPage />} />
                  <Route path="relatorios" element={<RelatoriosPage />} />
                  <Route path="loja/*" element={<MyStorePage />} />
                  <Route path="conta" element={<MyAccountPage />} />
                  <Route path="ajuda" element={<AjudaPage />} />
                  {/* rotas antigas */}
                  <Route path="perfil" element={<Navigate to="/painel/conta" replace />} />
                  <Route path="configuracoes" element={<Navigate to="/painel/loja" replace />} />
                  <Route path="integracoes" element={<Navigate to="/painel/loja/integracoes" replace />} />
                </Route>
              </Route>

              {/* Admin */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={guard('ADMIN')}>
                <Route element={<AdminLayout />}>
                  <Route index element={<AdminOverviewPage />} />
                  <Route path="lojas" element={<AdminStoresPage />} />
                  <Route path="lojas/:id" element={<AdminStoreDetailPage />} />
                  <Route path="videos" element={<AdminVideosPage />} />
                  <Route path="repasses" element={<AdminPayoutsPage />} />
                  <Route path="suporte" element={<AdminSupportPage />} />
                  <Route path="usuarios" element={<AdminUsersPage />} />
                  <Route path="configuracoes" element={<AdminSettingsPage />} />
                </Route>
              </Route>

              {/* Rotas antigas */}
              <Route path="/auth" element={<KeepQuery to="/entrar" />} />
              <Route path="/login" element={<KeepQuery to="/entrar" />} />
              <Route path="/register" element={<Navigate to="/entrar?aba=cadastro" replace />} />
              <Route path="/cliente" element={<Navigate to="/conta/pedidos" replace />} />
              <Route path="/dashboard" element={<Navigate to="/painel/dashboard" replace />} />
              <Route path="/products" element={<Navigate to="/painel/produtos" replace />} />
              <Route path="/products/new" element={<Navigate to="/painel/produtos/novo" replace />} />
              <Route path="/products/edit/:id" element={<LegacyProductEdit />} />
              <Route path="/profile" element={<Navigate to="/painel/conta" replace />} />

              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route path="*" element={<NotFoundPage />} />
    </Route>,
  ),
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
