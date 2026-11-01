import { api } from '@/lib/api';

export interface StoreSettings {
  general: {
    storeName: string;
    storeDescription: string;
    logo?: string;
    favicon?: string;
    primaryColor: string;
    secondaryColor: string;
    timezone: string;
    currency: string;
    language: string;
  };
  contact: {
    email: string;
    phone: string;
    whatsapp?: string;
    address: {
      street: string;
      number: string;
      complement?: string;
      neighborhood: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
  business: {
    cnpj: string;
    companyName: string;
    stateRegistration?: string;
    municipalRegistration?: string;
    taxRegime: 'MEI' | 'Simples Nacional' | 'Lucro Presumido' | 'Lucro Real';
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    orderNotifications: boolean;
    stockNotifications: boolean;
    marketingNotifications: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireNumbers: boolean;
      requireSymbols: boolean;
    };
    allowedIPs: string[];
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    googleAnalyticsId?: string;
    facebookPixelId?: string;
    googleTagManagerId?: string;
  };
  social: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    linkedin?: string;
    tiktok?: string;
  };
  shipping: {
    freeShippingThreshold: number;
    defaultShippingCost: number;
    processingTime: number;
    allowPickup: boolean;
    pickupInstructions?: string;
  };
  taxes: {
    includeTaxInPrice: boolean;
    defaultTaxRate: number;
    taxByState: Array<{
      state: string;
      rate: number;
    }>;
  };
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  numberFormat: string;
  dashboardLayout: 'compact' | 'comfortable';
  emailDigest: 'daily' | 'weekly' | 'monthly' | 'never';
  notifications: {
    browser: boolean;
    email: boolean;
    mobile: boolean;
  };
}

/** Atualização parcial: cada seção é mesclada no servidor (enviar só um campo não apaga os outros). */
export type StoreSettingsPatch = { [K in keyof StoreSettings]?: Partial<StoreSettings[K]> };

export const SettingsService = {
  getStoreSettings: (): Promise<StoreSettings> => api<StoreSettings>('/stores/me/settings'),

  updateStoreSettings: (settings: StoreSettingsPatch): Promise<StoreSettings> =>
    api<StoreSettings>('/stores/me/settings', { method: 'PUT', body: settings }),

  getUserPreferences: (): Promise<UserPreferences> => api<UserPreferences>('/users/me/preferences'),

  updateUserPreferences: (preferences: Partial<UserPreferences>): Promise<UserPreferences> =>
    api<UserPreferences>('/users/me/preferences', { method: 'PUT', body: preferences }),

  getTimezones(): Array<{ value: string; label: string }> {
    return [
      { value: 'America/Sao_Paulo', label: 'São Paulo (UTC-3)' },
      { value: 'America/Manaus', label: 'Manaus (UTC-4)' },
      { value: 'America/Rio_Branco', label: 'Rio Branco (UTC-5)' },
      { value: 'America/Noronha', label: 'Fernando de Noronha (UTC-2)' }
    ];
  },

  getCurrencies(): Array<{ value: string; label: string; symbol: string }> {
    return [
      { value: 'BRL', label: 'Real Brasileiro', symbol: 'R$' },
      { value: 'USD', label: 'Dólar Americano', symbol: '$' },
      { value: 'EUR', label: 'Euro', symbol: '€' }
    ];
  },

  getLanguages(): Array<{ value: string; label: string }> {
    return [
      { value: 'pt-BR', label: 'Português (Brasil)' },
      { value: 'en-US', label: 'English (US)' },
      { value: 'es-ES', label: 'Español' }
    ];
  },

  getBrazilianStates(): Array<{ value: string; label: string }> {
    return [
      { value: 'AC', label: 'Acre' },
      { value: 'AL', label: 'Alagoas' },
      { value: 'AP', label: 'Amapá' },
      { value: 'AM', label: 'Amazonas' },
      { value: 'BA', label: 'Bahia' },
      { value: 'CE', label: 'Ceará' },
      { value: 'DF', label: 'Distrito Federal' },
      { value: 'ES', label: 'Espírito Santo' },
      { value: 'GO', label: 'Goiás' },
      { value: 'MA', label: 'Maranhão' },
      { value: 'MT', label: 'Mato Grosso' },
      { value: 'MS', label: 'Mato Grosso do Sul' },
      { value: 'MG', label: 'Minas Gerais' },
      { value: 'PA', label: 'Pará' },
      { value: 'PB', label: 'Paraíba' },
      { value: 'PR', label: 'Paraná' },
      { value: 'PE', label: 'Pernambuco' },
      { value: 'PI', label: 'Piauí' },
      { value: 'RJ', label: 'Rio de Janeiro' },
      { value: 'RN', label: 'Rio Grande do Norte' },
      { value: 'RS', label: 'Rio Grande do Sul' },
      { value: 'RO', label: 'Rondônia' },
      { value: 'RR', label: 'Roraima' },
      { value: 'SC', label: 'Santa Catarina' },
      { value: 'SP', label: 'São Paulo' },
      { value: 'SE', label: 'Sergipe' },
      { value: 'TO', label: 'Tocantins' }
    ];
  },
};
