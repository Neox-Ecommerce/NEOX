import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AuthPage } from '@/pages/auth/auth-page';
import { ClientHomePage } from '@/pages/client/home';
import { Dashboard } from '@/pages/painel/dashboard';
import { ProductsPage } from '@/pages/products/index';
import { AppShell } from '@/components/AppShell';
import { RoleGuard } from '@/components/RoleGuard';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function AppRoutes() {
  const authContext = useAuth();
  
  // Verificar se o contexto está disponível
  if (!authContext) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-red-600">Erro: Contexto de autenticação não disponível</p>
        </div>
      </div>
    );
  }

  const { isAuthenticated, user, isLoading } = authContext;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {!isAuthenticated ? (
          <>
            <Route path="/" element={<ClientHomePage />} />
            <Route path="/auth" element={<AuthPage onSuccess={() => window.location.reload()} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <>
            <Route path="/auth" element={<Navigate to="/painel" replace />} />
            <Route path="/" element={<Navigate to="/painel" replace />} />
            
            <Route path="/painel" element={
              <RoleGuard requiredRole="EMPREENDEDOR">
                <AppShell>
                  <Dashboard user={user} />
                </AppShell>
              </RoleGuard>
            } />
            
            <Route path="/painel/produtos" element={
              <RoleGuard requiredRole="EMPREENDEDOR">
                <AppShell>
                  <ProductsPage />
                </AppShell>
              </RoleGuard>
            } />
            
            <Route path="/painel/produtos/novo" element={
              <RoleGuard requiredRole="EMPREENDEDOR">
                <AppShell>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold mb-4">Novo Produto</h1>
                    <p className="text-gray-600">Formulário de criação de produto será implementado aqui.</p>
                  </div>
                </AppShell>
              </RoleGuard>
            } />
            
            <Route path="/painel/produtos/editar/:id" element={
              <RoleGuard requiredRole="EMPREENDEDOR">
                <AppShell>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold mb-4">Editar Produto</h1>
                    <p className="text-gray-600">Formulário de edição de produto será implementado aqui.</p>
                  </div>
                </AppShell>
              </RoleGuard>
            } />
            
            {/* Cliente routes */}
            <Route path="/loja" element={
              <RoleGuard requiredRole="CLIENTE">
                <div className="min-h-screen bg-gray-50">
                  <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold mb-6">Loja</h1>
                    <p className="text-gray-600">Página da loja para clientes será implementada aqui.</p>
                  </div>
                </div>
              </RoleGuard>
            } />
            
            <Route path="*" element={<Navigate to="/painel" replace />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRoutes />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
