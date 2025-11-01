import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole: 'EMPREENDEDOR' | 'CLIENTE' | 'ADMIN';
  redirectTo?: string;
}

export function RoleGuard({ children, requiredRole, redirectTo }: RoleGuardProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (user?.role !== requiredRole) {
    const defaultRedirect = user?.role === 'CLIENTE' ? '/' : 
                           user?.role === 'EMPREENDEDOR' ? '/painel' : 
                           '/admin';
    return <Navigate to={redirectTo || defaultRedirect} replace />;
  }

  return <>{children}</>;
}