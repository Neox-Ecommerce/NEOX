import React, { useState } from 'react';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { RoleSelector } from './components/RoleSelector';
import { FloatingIcons } from './components/FloatingIcons';
import { EntrepreneurRegistration } from './components/EntrepreneurRegistration';
import { ArrowRight, Building } from 'lucide-react';

export type UserRole = 'cliente' | 'empreendedor';

export interface UserRoles {
  cliente: boolean;
  empreendedor: boolean;
}

export function AuthPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'entrepreneur'>('login');
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [availableRoles] = useState<UserRoles>({ cliente: true, empreendedor: true }); // Mock data
  const [selectedRole, setSelectedRole] = useState<UserRole>('cliente');

  const handleLoginSuccess = (userRoles: UserRoles) => {
    const roles = Object.entries(userRoles).filter(([_, hasRole]) => hasRole) as [UserRole, boolean][];
    
    if (roles.length > 1) {
      setShowRoleSelector(true);
    } else {
      // Direct login with single role
      console.log('Logging in with role:', roles[0][0]);
    }
  };

  const handleRoleSelection = (role: UserRole) => {
    setSelectedRole(role);
    setShowRoleSelector(false);
    console.log('Selected role:', role);
  };

  const handleEntrepreneurRegistration = () => {
    setActiveTab('entrepreneur');
  };

  // Show entrepreneur registration flow
  if (activeTab === 'entrepreneur') {
    return <EntrepreneurRegistration />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Role Selector Modal */}
      {showRoleSelector && (
        <RoleSelector
          availableRoles={availableRoles}
          onRoleSelect={handleRoleSelection}
          onClose={() => setShowRoleSelector(false)}
        />
      )}

      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left side - Auth Card */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm border border-white/20">
            {/* Logo and Title */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">NeoxStore</h1>
              <p className="text-gray-600">Bem-vindo de volta</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex bg-gray-100 rounded-lg p-1 mb-8">
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'login'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Entrar
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'register'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Criar Conta
              </button>
            </div>

            {/* Form Content */}
            <div className="transition-all duration-300 ease-in-out">
              {activeTab === 'login' ? (
                <LoginForm onLoginSuccess={handleLoginSuccess} />
              ) : (
                <RegisterForm onEntrepreneurRegistration={handleEntrepreneurRegistration} />
              )}
            </div>
          </div>
        </div>

        {/* Right side - Enhanced Marketing Content */}
        <div className="hidden lg:block">
          <div className="relative h-96 flex flex-col justify-center">
            <FloatingIcons />

            {/* Main Content */}
            <div className="text-center z-10 space-y-6">
              <div>
                <h2 className="text-4xl font-bold text-gray-800 mb-4 leading-tight">
                  Crie sua loja digital
                </h2>
                <p className="text-lg text-gray-600 max-w-lg mx-auto leading-relaxed">
                  Crie sua loja, gerencie tudo e comece a vender em minutos!
                </p>
              </div>

              {/* Entrepreneur CTA - Only button remaining */}
              <div className="mt-8">
                <button
                  onClick={handleEntrepreneurRegistration}
                  className="group inline-flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Building className="w-4 h-4" />
                  <span>Cadastro Completo de Empreendedor</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}