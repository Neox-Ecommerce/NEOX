import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { PersonalData } from '../EntrepreneurRegistration';

interface PersonalDataStepProps {
  data: PersonalData;
  onComplete: (data: PersonalData) => void;
}

export function PersonalDataStep({ data, onComplete }: PersonalDataStepProps) {
  const [formData, setFormData] = useState<PersonalData>(data);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  const validatePassword = (password: string) => {
    let strength = 0;
    const checks = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    ];
    
    strength = checks.filter(Boolean).length;
    setPasswordStrength(strength);
    
    return strength >= 4;
  };

  const handleInputChange = (field: keyof PersonalData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Validate password strength in real-time
    if (field === 'password') {
      validatePassword(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    // Validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Nome completo é obrigatório';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Nome deve ter pelo menos 2 caracteres';
    }
    
    if (!formData.email) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }
    
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e símbolo';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não conferem';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onComplete(formData);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-destructive';
    if (passwordStrength <= 3) return 'bg-warning';
    return 'bg-primary';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return 'Fraca';
    if (passwordStrength <= 3) return 'Média';
    return 'Forte';
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Dados Pessoais
        </h2>
        <p className="text-muted-foreground">
          Vamos começar com suas informações básicas
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name Field */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-foreground/80 mb-2">
            Nome Completo *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 ${
                errors.fullName 
                  ? 'border-destructive bg-destructive-muted' 
                  : formData.fullName.trim().length >= 2
                  ? 'border-primary bg-success-muted'
                  : 'border-input hover:border-foreground/40'
              }`}
              placeholder="Seu nome completo"
            />
            {formData.fullName.trim().length >= 2 && !errors.fullName && (
              <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary w-5 h-5" />
            )}
          </div>
          {errors.fullName && (
            <div className="mt-1 flex items-center space-x-1 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{errors.fullName}</p>
            </div>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground/80 mb-2">
            E-mail *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 ${
                errors.email 
                  ? 'border-destructive bg-destructive-muted' 
                  : /\S+@\S+\.\S+/.test(formData.email)
                  ? 'border-primary bg-success-muted'
                  : 'border-input hover:border-foreground/40'
              }`}
              placeholder="seu@email.com"
            />
            {/\S+@\S+\.\S+/.test(formData.email) && !errors.email && (
              <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary w-5 h-5" />
            )}
          </div>
          {errors.email && (
            <div className="mt-1 flex items-center space-x-1 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{errors.email}</p>
            </div>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-foreground/80 mb-2">
            Senha *
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 ${
                errors.password 
                  ? 'border-destructive bg-destructive-muted' 
                  : passwordStrength >= 4
                  ? 'border-primary bg-success-muted'
                  : 'border-input hover:border-foreground/40'
              }`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          
          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="mt-2">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  />
                </div>
                <span className={`text-xs font-medium ${
                  passwordStrength <= 2 ? 'text-destructive' : 
                  passwordStrength <= 3 ? 'text-warning' : 'text-primary'
                }`}>
                  {getPasswordStrengthText()}
                </span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Deve conter: maiúscula, minúscula, número e símbolo (min. 8 caracteres)
              </div>
            </div>
          )}
          
          {errors.password && (
            <div className="mt-1 flex items-center space-x-1 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{errors.password}</p>
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground/80 mb-2">
            Confirmar Senha *
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 ${
                errors.confirmPassword 
                  ? 'border-destructive bg-destructive-muted' 
                  : formData.confirmPassword && formData.password === formData.confirmPassword
                  ? 'border-primary bg-success-muted'
                  : 'border-input hover:border-foreground/40'
              }`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            {formData.confirmPassword && formData.password === formData.confirmPassword && !errors.confirmPassword && (
              <CheckCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 text-primary w-5 h-5" />
            )}
          </div>
          {errors.confirmPassword && (
            <div className="mt-1 flex items-center space-x-1 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{errors.confirmPassword}</p>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] focus:ring-4 focus:ring-ring/30"
        >
          Continuar
        </button>
      </form>
    </div>
  );
}