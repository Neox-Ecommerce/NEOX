import { CheckCircle, Clock, Settings, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function RegistrationSuccess() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-2xl mx-auto relative z-10">
        <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm border border-white/20 text-center">
          {/* Success Icon */}
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          {/* Main Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Cadastro Realizado com Sucesso!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Sua conta foi criada. Sua loja agora aguarda a aprovação de um administrador da NEOX.
          </p>

          {/* Status Badge */}
          <div className="inline-flex items-center space-x-2 bg-yellow-50 border border-yellow-200 rounded-full px-6 py-3 mb-8">
            <Clock className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">
              Loja aguardando aprovação – prepare tudo pelo painel enquanto isso
            </span>
          </div>

          {/* Next Steps */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Próximos Passos
            </h2>
            <div className="space-y-3 text-left">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-medium text-gray-900">Análise de Documentos</p>
                  <p className="text-sm text-gray-600">Um administrador da NEOX vai conferir seus dados e documentos. Acompanhe o status no painel.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-medium text-gray-900">Configure sua Loja</p>
                  <p className="text-sm text-gray-600">Complete o perfil da loja, cadastre produtos e defina as regras de frete</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                  3
                </div>
                <div>
                  <p className="font-medium text-gray-900">Comece a Vender</p>
                  <p className="text-sm text-gray-600">Após a aprovação, sua loja aparece para os clientes e pode receber pedidos</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link to="/painel/dashboard" className="block">
              <button
                type="button"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] focus:ring-4 focus:ring-green-500/30 flex items-center justify-center space-x-2"
              >
                <Settings className="w-5 h-5" />
                <span>Ir para o Painel</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            
            <p className="text-sm text-gray-500">
              O resultado da análise aparece no topo do painel da sua loja
            </p>
          </div>

          {/* Contact Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Dúvidas? Entre em contato conosco:{' '}
              <a href="mailto:suporte@neoxstore.com" className="text-green-600 hover:text-green-700 font-medium">
                suporte@neoxstore.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}