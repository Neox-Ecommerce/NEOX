import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted to-muted   flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-xl">
        <CardContent className="pt-12 pb-8">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-primary/10 rounded-full mb-4">
              <Search className="h-12 w-12 text-primary" />
            </div>
            <div className="text-6xl font-bold text-primary mb-2">404</div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              Página não encontrada
            </h1>
            <p className="text-muted-foreground  mb-8">
              A página que você está procurando não existe ou foi movida.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => navigate('/painel/dashboard')}
              className="w-full"
              size="lg"
            >
              <Home className="mr-2 h-4 w-4" />
              Retornar ao Painel
            </Button>
            
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </div>

          {/* Help Text */}
          <div className="mt-8 pt-6 border-t border-border ">
            <p className="text-sm text-muted-foreground ">
              Se você acredita que isso é um erro, entre em contato com o suporte.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}