import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader } from '@/components/PageStates';
import { homeFor, loginPath } from '@/lib/navigation';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole: 'EMPREENDEDOR' | 'CLIENTE' | 'ADMIN';
}

/** Protege rotas por papel. Sem login: vai para o login e volta depois; papel errado: vai para a área do usuário. */
export function RoleGuard({ children, requiredRole }: RoleGuardProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;
  if (!user) {
    return <Navigate to={loginPath(location.pathname + location.search, requiredRole === 'ADMIN' ? 'admin' : 'loja')} replace />;
  }
  if (user.role !== requiredRole) return <Navigate to={homeFor(user.role)} replace />;
  return <>{children}</>;
}
