import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/layouts/shared';
import { PersonalDataStep } from './registration/PersonalDataStep';
import { StoreDataStep } from './registration/StoreDataStep';
import { VerificationStep } from './registration/VerificationStep';
import { RegistrationSuccess } from './registration/RegistrationSuccess';
import { ArrowLeft, CheckCircle } from 'lucide-react';
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
    <div className="min-h-screen bg-muted/40">
      <header className="border-b bg-card">
        <div className="mx-auto flex h-16 max-w-4xl items-center px-4 sm:px-6">
          <Logo to="/vender" />
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
        <Link to="/vender" className="mb-6 inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Voltar para Venda na NEOX
        </Link>

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Cadastro de lojista</h1>
          <p className="mt-1 text-sm text-muted-foreground">Configure sua loja em poucos passos. Já tem conta? <Link to="/entrar" className="font-medium text-primary hover:underline">Entrar</Link></p>
        </div>

        <ol className="mb-6 flex items-start justify-center gap-2 sm:gap-4" aria-label="Etapas do cadastro">
          {steps.map((step, index) => {
            const done = currentStep > step.number;
            const on = currentStep >= step.number;
            return (
              <li key={step.number} className="flex items-start gap-2 sm:gap-4" aria-current={currentStep === step.number ? 'step' : undefined}>
                <div className="flex flex-col items-center text-center">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${on ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {done ? <CheckCircle className="h-5 w-5" aria-label="Concluída" /> : step.number}
                  </span>
                  <span className={`mt-2 text-xs font-medium sm:text-sm ${on ? 'text-primary' : 'text-muted-foreground'}`}>{step.title}</span>
                  <span className="hidden text-xs text-muted-foreground sm:block">{step.description}</span>
                </div>
                {index < steps.length - 1 && (
                  <span aria-hidden="true" className={`mt-5 h-0.5 w-6 sm:w-16 ${done ? 'bg-primary' : 'bg-border'}`} />
                )}
              </li>
            );
          })}
        </ol>

        <div className="rounded-xl border bg-card p-4 shadow-sm sm:p-8">{renderCurrentStep()}</div>
      </main>
    </div>
  );
}
