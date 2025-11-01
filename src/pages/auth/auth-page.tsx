import React, { useState } from 'react';
import { LoginForm, RegisterForm } from '@/components/auth/LoginForm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Users, TrendingUp, Shield } from 'lucide-react';

interface AuthPageProps {
  onSuccess: () => void;
}

export function AuthPage({ onSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);

  const features = [
    {
      icon: ShoppingBag,
      title: 'Venda Online',
      description: 'Crie sua loja virtual e venda seus produtos para todo o Brasil'
    },
    {
      icon: Users,
      title: 'Gestão de Clientes',
      description: 'Gerencie seus clientes e construa relacionamentos duradouros'
    },
    {
      icon: TrendingUp,
      title: 'Analytics Avançado',
      description: 'Acompanhe suas vendas e crescimento com relatórios detalhados'
    },
    {
      icon: Shield,
      title: 'Segurança Total',
      description: 'Seus dados e transações protegidos com a melhor tecnologia'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center min-h-[calc(100vh-4rem)]">
          {/* Left Side - Features */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Bem-vindo ao{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  NEOX
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                A plataforma completa para empreendedores digitais
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Pronto para começar?</h3>
              <p className="text-blue-100 mb-6">
                Junte-se a milhares de empreendedores que já estão vendendo online
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">10K+</div>
                  <div className="text-sm text-blue-100">Lojas Ativas</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">R$ 50M+</div>
                  <div className="text-sm text-blue-100">Vendas Processadas</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">99.9%</div>
                  <div className="text-sm text-blue-100">Uptime</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Form */}
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <div className="mb-8">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={isLogin ? 'default' : 'ghost'}
                    className="flex-1"
                    onClick={() => setIsLogin(true)}
                  >
                    Entrar
                  </Button>
                  <Button
                    variant={!isLogin ? 'default' : 'ghost'}
                    className="flex-1"
                    onClick={() => setIsLogin(false)}
                  >
                    Criar Conta
                  </Button>
                </div>
              </div>

              {isLogin ? (
                <LoginForm onSuccess={onSuccess} onToggleForm={() => setIsLogin(false)} />
              ) : (
                <RegisterForm onSuccess={onSuccess} onToggleForm={() => setIsLogin(true)} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}