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
    <div className="min-h-screen bg-gradient-to-br from-destructive-muted to-destructive-muted   flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-xl">
        <CardContent className="pt-12 pb-8">
          {/* Unauthorized Illustration */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-destructive-muted  rounded-full mb-4">
              <Shield className="h-12 w-12 text-destructive " />
            </div>
            <div className="text-6xl font-bold text-destructive  mb-2">403</div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              Acesso Negado
            </h1>
            <p className="text-muted-foreground  mb-8">
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
          <div className="mt-8 pt-6 border-t border-border ">
            <p className="text-sm text-muted-foreground ">
              Se você é um empreendedor e deveria ter acesso, verifique suas credenciais ou entre em contato com o suporte.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}