import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, User, Building, ArrowRight } from 'lucide-react';
import { UserRole, UserRoles } from '../index';

interface RoleSelectorProps {
  availableRoles: UserRoles;
  onRoleSelect: (role: UserRole) => void;
  onClose: () => void;
}

export function RoleSelector({ availableRoles, onRoleSelect, onClose }: RoleSelectorProps) {
  const navigate = useNavigate();
  
  const roles = [
    {
      key: 'cliente' as UserRole,
      title: 'Cliente',
      description: 'Navegue, compre e gerencie seus pedidos',
      icon: User,
      color: 'blue',
      available: availableRoles.cliente,
      route: '/'
    },
    {
      key: 'empreendedor' as UserRole,
      title: 'Empreendedor',
      description: 'Gerencie sua loja e vendas',
      icon: Building,
      color: 'green',
      available: availableRoles.empreendedor,
      route: '/painel/dashboard'
    }
  ];

  const availableRolesList = roles.filter(role => role.available);

  const handleRoleSelect = (role: UserRole) => {
    const selectedRole = roles.find(r => r.key === role);
    if (selectedRole) {
      onRoleSelect(role);
      navigate(selectedRole.route);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Escolha seu papel
          </h2>
          <p className="text-gray-600">
            Você tem múltiplos papéis disponíveis. Escolha como deseja entrar:
          </p>
        </div>

        {/* Role Options */}
        <div className="space-y-3">
          {availableRolesList.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.key}
                onClick={() => handleRoleSelect(role.key)}
                className={`w-full p-4 rounded-lg border-2 transition-all duration-200 hover:scale-[1.02] group ${
                  role.color === 'green'
                    ? 'border-green-200 hover:border-green-400 hover:bg-green-50'
                    : 'border-blue-200 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full ${
                    role.color === 'green' ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      role.color === 'green' ? 'text-green-600' : 'text-blue-600'
                    }`} />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-gray-900">{role.title}</h3>
                    <p className="text-sm text-gray-600">{role.description}</p>
                  </div>
                  <ArrowRight className={`w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity ${
                    role.color === 'green' ? 'text-green-600' : 'text-blue-600'
                  }`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Você pode alternar entre os papéis a qualquer momento dentro do aplicativo
          </p>
        </div>
      </div>
    </div>
  );
}