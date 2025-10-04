import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Store, Eye, EyeOff, Loader2, User, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { FeedbackService } from '@/services/FeedbackService';

const registerSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  role: z.enum(['CLIENTE', 'EMPREENDEDOR'], {
    required_error: 'Selecione o tipo de conta'
  }),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const { confirmPassword, ...userData } = data;
      await registerUser(userData);
      FeedbackService.success('Conta criada com sucesso!');
      
      if (data.role === 'EMPREENDEDOR') {
        navigate('/painel');
      } else {
        navigate('/');
      }
    } catch (error: any) {
      FeedbackService.error(error.message || 'Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedRole = watch('role');

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
            <Store className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">NEOX</h1>
          <p className="text-gray-600 mt-2">Crie sua conta</p>
        </div>

        {/* Register Form */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold text-center">
              Criar Conta
            </CardTitle>
            <p className="text-sm text-muted-foreground text-center">
              Preencha os dados para começar
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">Tipo de Conta</Label>
                <Select value={watch('role')} onValueChange={(value) => setValue('role', value as any)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Selecione o tipo de conta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLIENTE">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <div>
                          <div className="font-medium">Cliente</div>
                          <div className="text-xs text-gray-500">Comprar produtos</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="EMPREENDEDOR">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        <div>
                          <div className="font-medium">Empreendedor</div>
                          <div className="text-xs text-gray-500">Vender produtos</div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-red-500">{errors.role.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Seu nome completo"
                  className="h-11"
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="seu@email.com"
                  className="h-11"
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone (opcional)</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="(11) 99999-9999"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    placeholder="Sua senha"
                    className="h-11 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-11 w-11 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...register('confirmPassword')}
                    placeholder="Confirme sua senha"
                    className="h-11 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-11 w-11 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  'Criar Conta'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Fazer login
                </Link>
              </p>
            </div>

            {/* Role Info */}
            {selectedRole && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {selectedRole === 'CLIENTE' ? 'Como Cliente você pode:' : 'Como Empreendedor você pode:'}
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {selectedRole === 'CLIENTE' ? (
                    <>
                      <li>• Navegar pelo catálogo de produtos</li>
                      <li>• Adicionar itens ao carrinho</li>
                      <li>• Finalizar compras</li>
                      <li>• Acompanhar pedidos</li>
                    </>
                  ) : (
                    <>
                      <li>• Gerenciar produtos e estoque</li>
                      <li>• Acompanhar vendas e métricas</li>
                      <li>• Criar campanhas de marketing</li>
                      <li>• Configurar sua loja virtual</li>
                    </>
                  )}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2024 NEOX. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
}