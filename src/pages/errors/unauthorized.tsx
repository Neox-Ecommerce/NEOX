import { useNavigate } from 'react-router-dom';
import { Shield, Home, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

export function UnauthorizedPage() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const handleLoginRedirect = () => {
    if (isAuthenticated) {
      logout();
    }
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-xl">
        <CardContent className="pt-12 pb-8">
          {/* Unauthorized Illustration */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
              <Shield className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
            <div className="text-6xl font-bold text-red-600 dark:text-red-400 mb-2">403</div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Acesso Negado
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Você não tem permissão para acessar esta página. Esta área é restrita a empreendedores.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {isAuthenticated ? (
              <Button
                onClick={() => navigate('/painel/dashboard')}
                className="w-full"
                size="lg"
              >
                <Home className="mr-2 h-4 w-4" />
                Ir para Dashboard
              </Button>
            ) : (
              <Button
                onClick={handleLoginRedirect}
                className="w-full"
                size="lg"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Fazer Login
              </Button>
            )}
            
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Voltar
            </Button>
          </div>

          {/* Help Text */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Se você é um empreendedor e deveria ter acesso, verifique suas credenciais ou entre em contato com o suporte.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}