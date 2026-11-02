import { CheckCircle, Clock, Settings, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function RegistrationSuccess() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-info-muted via-purple-50 to-admin-muted flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-admin-muted rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-info-muted rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-admin-muted rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-2xl mx-auto relative z-10">
        <div className="bg-card rounded-2xl shadow-xl p-8 border border-border text-center">
          {/* Success Icon */}
          <div className="mx-auto w-20 h-20 bg-success-muted rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-primary" />
          </div>

          {/* Main Message */}
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Cadastro Realizado com Sucesso!
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Sua conta foi criada. Sua loja agora aguarda a aprovação de um administrador da NEOX.
          </p>

          {/* Status Badge */}
          <div className="inline-flex items-center space-x-2 bg-warning-muted border border-warning/30 rounded-full px-6 py-3 mb-8">
            <Clock className="w-5 h-5 text-warning" />
            <span className="text-sm font-medium text-warning">
              Loja aguardando aprovação – prepare tudo pelo painel enquanto isso
            </span>
          </div>

          {/* Next Steps */}
          <div className="bg-muted rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Próximos Passos
            </h2>
            <div className="space-y-3 text-left">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-medium text-foreground">Análise de Documentos</p>
                  <p className="text-sm text-muted-foreground">Um administrador da NEOX vai conferir seus dados e documentos. Acompanhe o status no painel.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-info text-info-foreground rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-medium text-foreground">Configure sua Loja</p>
                  <p className="text-sm text-muted-foreground">Complete o perfil da loja, cadastre produtos e defina as regras de frete</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-admin text-admin-foreground rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                  3
                </div>
                <div>
                  <p className="font-medium text-foreground">Comece a Vender</p>
                  <p className="text-sm text-muted-foreground">Após a aprovação, sua loja aparece para os clientes e pode receber pedidos</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button asChild size="lg" className="w-full">
              <Link to="/painel">
                <Settings className="mr-2 h-5 w-5" aria-hidden="true" />
                Ir para o painel
                <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </Link>
            </Button>
            
            <p className="text-sm text-muted-foreground">
              O resultado da análise aparece no topo do painel da sua loja
            </p>
          </div>

          {/* Contact Info */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Dúvidas? Entre em contato conosco:{' '}
              <a href="mailto:suporte@neoxstore.com" className="text-primary hover:text-primary-hover font-medium">
                suporte@neoxstore.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}