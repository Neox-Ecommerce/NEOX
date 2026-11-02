import React, { useState, useEffect } from 'react';
import { Store, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { StoreData } from '../EntrepreneurRegistration';
import { api, ApiError } from '@/lib/api';

interface StoreDataStepProps {
  data: StoreData;
  onComplete: (data: StoreData) => void;
  onBack: () => void;
}

export function StoreDataStep({ data, onComplete, onBack }: StoreDataStepProps) {
  const [formData, setFormData] = useState<StoreData>(data);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCheckingStoreName, setIsCheckingStoreName] = useState(false);
  const [isCheckingCnpj, setIsCheckingCnpj] = useState(false);
  const [storeNameDebounceTimer, setStoreNameDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [cnpjDebounceTimer, setCnpjDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const formatCNPJ = (value: string) => {
    const digits = value.replace(/\D/g, '');
    
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
    if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
  };

  const validateCNPJ = (cnpj: string) => {
    const digits = cnpj.replace(/\D/g, '');
    
    if (digits.length !== 14) return false;
    
    // Basic CNPJ validation algorithm
    let sum = 0;
    let weight = 2;
    
    for (let i = 11; i >= 0; i--) {
      sum += parseInt(digits[i]) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    
    const remainder = sum % 11;
    const digit1 = remainder < 2 ? 0 : 11 - remainder;
    
    if (parseInt(digits[12]) !== digit1) return false;
    
    sum = 0;
    weight = 2;
    
    for (let i = 12; i >= 0; i--) {
      sum += parseInt(digits[i]) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    
    const remainder2 = sum % 11;
    const digit2 = remainder2 < 2 ? 0 : 11 - remainder2;
    
    return parseInt(digits[13]) === digit2;
  };

  const checkStoreNameAvailability = async (storeName: string) => {
    if (!storeName.trim() || storeName.length < 3) return;
    
    setIsCheckingStoreName(true);
    
    try {
      const { available: isAvailable } = await api<{ available: boolean }>('/auth/store-name-available', { query: { name: storeName } });
      
      if (!isAvailable) {
        setErrors(prev => ({ ...prev, storeName: 'Este nome de loja já está em uso' }));
        setFormData(prev => ({ ...prev, isStoreNameValid: false }));
      } else {
        setErrors(prev => ({ ...prev, storeName: '' }));
        setFormData(prev => ({ ...prev, isStoreNameValid: true }));
      }
    } catch (error) {
      console.error('Error checking store name:', error);
    } finally {
      setIsCheckingStoreName(false);
    }
  };

  const fetchCnpjData = async (cnpj: string) => {
    if (!validateCNPJ(cnpj)) return;
    
    setIsCheckingCnpj(true);
    
    try {
      let companyName = '';
      try {
        companyName = (await api<{ companyName: string }>(`/auth/cnpj/${cnpj.replace(/\D/g, '')}`)).companyName;
      } catch (error) {
        // Receita fora do ar (502): CNPJ com dígitos válidos segue, sem razão social
        if (!(error instanceof ApiError) || error.status !== 502) throw error;
      }

      setFormData(prev => ({ 
        ...prev, 
        companyName,
        isCnpjValid: true 
      }));
      setErrors(prev => ({ ...prev, cnpj: '' }));
    } catch (error) {
      setErrors(prev => ({ ...prev, cnpj: error instanceof Error ? error.message : 'CNPJ não encontrado na Receita Federal' }));
      setFormData(prev => ({ ...prev, companyName: '', isCnpjValid: false }));
    } finally {
      setIsCheckingCnpj(false);
    }
  };

  const handleStoreNameChange = (value: string) => {
    setFormData(prev => ({ ...prev, storeName: value, isStoreNameValid: false }));
    
    // Clear previous timer
    if (storeNameDebounceTimer) {
      clearTimeout(storeNameDebounceTimer);
    }
    
    // Clear error immediately when user starts typing
    if (errors.storeName) {
      setErrors(prev => ({ ...prev, storeName: '' }));
    }
    
    // Set new timer for API call
    const timer = setTimeout(() => {
      checkStoreNameAvailability(value);
    }, 800);
    
    setStoreNameDebounceTimer(timer);
  };

  const handleCnpjChange = (value: string) => {
    const formattedValue = formatCNPJ(value);
    setFormData(prev => ({ 
      ...prev, 
      cnpj: formattedValue, 
      companyName: '',
      isCnpjValid: false 
    }));
    
    // Clear previous timer
    if (cnpjDebounceTimer) {
      clearTimeout(cnpjDebounceTimer);
    }
    
    // Clear error immediately when user starts typing
    if (errors.cnpj) {
      setErrors(prev => ({ ...prev, cnpj: '' }));
    }
    
    // Only fetch if CNPJ is complete
    if (formattedValue.length === 18) {
      const timer = setTimeout(() => {
        fetchCnpjData(formattedValue);
      }, 500);
      
      setCnpjDebounceTimer(timer);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.storeName.trim()) {
      newErrors.storeName = 'Nome da loja é obrigatório';
    } else if (formData.storeName.trim().length < 3) {
      newErrors.storeName = 'Nome da loja deve ter pelo menos 3 caracteres';
    } else if (!formData.isStoreNameValid) {
      newErrors.storeName = 'Aguarde a verificação do nome da loja';
    }
    
    if (!formData.cnpj.trim()) {
      newErrors.cnpj = 'CNPJ é obrigatório';
    } else if (!validateCNPJ(formData.cnpj)) {
      newErrors.cnpj = 'CNPJ inválido';
    } else if (!formData.isCnpjValid) {
      newErrors.cnpj = 'Aguarde a verificação do CNPJ';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onComplete(formData);
    }
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (storeNameDebounceTimer) clearTimeout(storeNameDebounceTimer);
      if (cnpjDebounceTimer) clearTimeout(cnpjDebounceTimer);
    };
  }, [storeNameDebounceTimer, cnpjDebounceTimer]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Dados da Loja
        </h2>
        <p className="text-muted-foreground">
          Informações comerciais da sua empresa
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Store Name Field */}
        <div>
          <label htmlFor="storeName" className="block text-sm font-medium text-foreground/80 mb-2">
            Nome da Loja *
          </label>
          <div className="relative">
            <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              id="storeName"
              type="text"
              value={formData.storeName}
              onChange={(e) => handleStoreNameChange(e.target.value)}
              className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 ${
                errors.storeName 
                  ? 'border-destructive bg-destructive-muted' 
                  : formData.isStoreNameValid
                  ? 'border-primary bg-success-muted'
                  : 'border-input hover:border-foreground/40'
              }`}
              placeholder="Nome da sua loja"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isCheckingStoreName ? (
                <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
              ) : formData.isStoreNameValid ? (
                <CheckCircle className="w-5 h-5 text-primary" />
              ) : null}
            </div>
          </div>
          {errors.storeName && (
            <div className="mt-1 flex items-center space-x-1 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{errors.storeName}</p>
            </div>
          )}
          {formData.isStoreNameValid && !errors.storeName && (
            <div className="mt-1 flex items-center space-x-1 text-primary">
              <CheckCircle className="w-4 h-4" />
              <p className="text-sm">Nome disponível!</p>
            </div>
          )}
        </div>

        {/* CNPJ Field */}
        <div>
          <label htmlFor="cnpj" className="block text-sm font-medium text-foreground/80 mb-2">
            CNPJ *
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              id="cnpj"
              type="text"
              value={formData.cnpj}
              onChange={(e) => handleCnpjChange(e.target.value)}
              className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 ${
                errors.cnpj 
                  ? 'border-destructive bg-destructive-muted' 
                  : formData.isCnpjValid
                  ? 'border-primary bg-success-muted'
                  : 'border-input hover:border-foreground/40'
              }`}
              placeholder="XX.XXX.XXX/XXXX-XX"
              maxLength={18}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isCheckingCnpj ? (
                <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
              ) : formData.isCnpjValid ? (
                <CheckCircle className="w-5 h-5 text-primary" />
              ) : null}
            </div>
          </div>
          {errors.cnpj && (
            <div className="mt-1 flex items-center space-x-1 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{errors.cnpj}</p>
            </div>
          )}
        </div>

        {/* Company Name Display */}
        {formData.companyName && (
          <div className="bg-success-muted border border-success/30 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-success">
                  Empresa encontrada na Receita Federal:
                </p>
                <p className="text-sm text-primary font-semibold">
                  {formData.companyName}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 bg-muted hover:bg-accent text-foreground/80 font-medium py-3 px-4 rounded-lg transition-all duration-200"
          >
            Voltar
          </button>
          <button
            type="submit"
            disabled={!formData.isStoreNameValid || !formData.isCnpjValid || isCheckingStoreName || isCheckingCnpj}
            className="flex-1 bg-primary hover:bg-primary-hover disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed text-primary-foreground font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] focus:ring-4 focus:ring-ring/30"
          >
            Continuar
          </button>
        </div>
      </form>
    </div>
  );
}