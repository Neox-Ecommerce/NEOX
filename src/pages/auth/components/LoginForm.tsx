import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { FeedbackService } from '@/services/FeedbackService';

interface LoginFormProps {
  onLoginSuccess?: (userRoles: any) => void;
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }
    
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        // Use the AuthService to login
        const user = await login(formData.email, formData.password);
        
        FeedbackService.success('Login realizado com sucesso!');
        
        // Determine user role and redirect accordingly
        if (user?.role === 'ADMIN') {
          navigate('/admin/lojas');
        } else if (user?.role === 'EMPREENDEDOR') {
          navigate('/painel/dashboard');
        } else if (user?.role === 'CLIENTE') {
          navigate('/cliente');
        } else {
          // Fallback for users without role
          navigate('/');
        }
        
      } catch (error: any) {
        FeedbackService.error(error.message || 'Credenciais inválidas');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Multi-role info */}
      <div className="text-center mb-4">
        <p className="text-sm text-gray-500">
          Entre com sua conta única e escolha seu papel
        </p>
      </div>

      {/* Demo Credentials Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <p className="text-xs font-medium text-blue-800 mb-1">Credenciais de demonstração:</p>
        <div className="text-xs text-blue-700 space-y-1">
          <p><strong>Admin:</strong> admin@neox.com / 123456</p>
          <p><strong>Empreendedor:</strong> lojista@neox.com / 123456</p>
          <p><strong>Cliente:</strong> cliente@neox.com / 123456</p>
        </div>
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          E-mail
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
              errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            placeholder="seu@email.com"
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Senha
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
              errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password}</p>
        )}
      </div>

      {/* Remember Me and Forgot Password */}
      <div className="flex items-center justify-between">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.rememberMe}
            onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
          />
          <span className="ml-2 text-sm text-gray-600">Lembrar de mim</span>
        </label>
        <button
          type="button"
          className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
        >
          Esqueci minha senha
        </button>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] focus:ring-4 focus:ring-green-500/30"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Entrando...
          </div>
        ) : (
          'Entrar'
        )}
      </button>
    </form>
  );
}