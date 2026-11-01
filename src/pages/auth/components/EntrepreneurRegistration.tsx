import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PersonalDataStep } from './registration/PersonalDataStep';
import { StoreDataStep } from './registration/StoreDataStep';
import { VerificationStep } from './registration/VerificationStep';
import { RegistrationSuccess } from './registration/RegistrationSuccess';
import { ArrowLeft, CheckCircle, Rocket } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { FeedbackService } from '@/services/FeedbackService';

export interface PersonalData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface StoreData {
  storeName: string;
  cnpj: string;
  companyName: string;
  isStoreNameValid: boolean;
  isCnpjValid: boolean;
}

export interface VerificationData {
  document: File | null;
  acceptTerms: boolean;
}

export interface RegistrationData {
  personal: PersonalData;
  store: StoreData;
  verification: VerificationData;
}

export function EntrepreneurRegistration() {
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  const { registerStore } = useAuth();
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    personal: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    store: {
      storeName: '',
      cnpj: '',
      companyName: '',
      isStoreNameValid: false,
      isCnpjValid: false
    },
    verification: {
      document: null,
      acceptTerms: false
    }
  });

  const steps = [
    { number: 1, title: 'Dados Pessoais', description: 'Informações básicas' },
    { number: 2, title: 'Dados da Loja', description: 'Informações comerciais' },
    { number: 3, title: 'Verificação', description: 'Documentos e termos' }
  ];

  const handleStepComplete = (stepData: PersonalData | StoreData | VerificationData) => {
    if (currentStep === 1) {
      setRegistrationData(prev => ({ ...prev, personal: stepData as PersonalData }));
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setRegistrationData(prev => ({ ...prev, store: stepData as StoreData }));
      setCurrentStep(3);
    } else if (currentStep === 3) {
      const data = { ...registrationData, verification: stepData as VerificationData };
      setRegistrationData(data);
      return handleRegistrationSubmit(data);
    }
  };

  // recebe os dados completos por parâmetro: o state ainda não refletiu a etapa 3 neste render
  const handleRegistrationSubmit = async (data: RegistrationData) => {
    try {
      await registerStore({
        name: data.personal.fullName,
        email: data.personal.email,
        password: data.personal.password,
        storeName: data.store.storeName,
        cnpj: data.store.cnpj,
        companyName: data.store.companyName,
        document: data.verification.document,
      });
      setCurrentStep(4);
    } catch (error) {
      FeedbackService.error(error instanceof Error ? error.message : 'Erro ao concluir o cadastro');
    }
  };

  const handleBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleBackToAuth = () => {
    navigate('/auth');
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalDataStep
            data={registrationData.personal}
            onComplete={handleStepComplete}
          />
        );
      case 2:
        return (
          <StoreDataStep
            data={registrationData.store}
            onComplete={handleStepComplete}
            onBack={handleBackStep}
          />
        );
      case 3:
        return (
          <VerificationStep
            data={registrationData.verification}
            onComplete={handleStepComplete}
            onBack={handleBackStep}
          />
        );
      case 4:
        return <RegistrationSuccess />;
      default:
        return null;
    }
  };

  if (currentStep === 4) {
    return renderCurrentStep();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 relative overflow-hidden">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 relative z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-center space-x-2">
          <Rocket className="w-5 h-5" />
          <span className="text-sm font-medium">
            🚀 Comece com segurança! Empreendedores verificados geram mais vendas.
          </span>
        </div>
      </div>

      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-4xl mx-auto">
          {/* Back to Auth Button - Hero Position */}
          <div className="mb-8">
            <button
              onClick={handleBackToAuth}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
              <span className="font-medium">Voltar ao Login</span>
            </button>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Cadastro de Empreendedor
            </h1>
            <p className="text-gray-600">
              Configure sua loja digital em poucos passos
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                        currentStep >= step.number
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {currentStep > step.number ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        step.number
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <div className={`text-sm font-medium ${
                        currentStep >= step.number ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-500 hidden sm:block">
                        {step.description}
                      </div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-16 h-0.5 transition-all duration-300 ${
                        currentStep > step.number ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm border border-white/20">
            {/* Step Content */}
            {renderCurrentStep()}
          </div>
        </div>
      </div>
    </div>
  );
}