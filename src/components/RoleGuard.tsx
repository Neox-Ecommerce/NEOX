import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole: 'EMPREENDEDOR' | 'CLIENTE' | 'ADMIN';
  redirectTo?: string;
}

export function RoleGuard({ children, requiredRole, redirectTo }: RoleGuardProps) {
  const authContext = useAuth();
  const location = useLocation();

  // Verificar se o contexto está disponível
  if (!authContext) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-red-600">Erro: Contexto de autenticação não disponível</p>
        </div>
      </div>
    );
  }

  const { user, isAuthenticated, isLoading } = authContext;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== requiredRole) {
    const defaultRedirect = user?.role === 'CLIENTE' ? '/' : 
                           user?.role === 'EMPREENDEDOR' ? '/painel' : 
                           '/admin';
    return <Navigate to={redirectTo || defaultRedirect} replace />;
  }

  return <>{children}</>;
}