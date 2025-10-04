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

export interface SystemSettings {
  maintenance: {
    enabled: boolean;
    message: string;
    allowedUsers: string[];
  };
  backup: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    retention: number;
    lastBackup?: Date;
  };
  performance: {
    cacheEnabled: boolean;
    compressionEnabled: boolean;
    cdnEnabled: boolean;
  };
  limits: {
    maxProducts: number;
    maxOrders: number;
    maxStorage: number;
    maxBandwidth: number;
  };
}

export class SettingsService {
  private static STORE_SETTINGS_KEY = 'neox_store_settings';
  private static USER_PREFERENCES_KEY = 'neox_user_preferences';
  private static SYSTEM_SETTINGS_KEY = 'neox_system_settings';

  private static getStoredStoreSettings(): StoreSettings {
    const stored = localStorage.getItem(this.STORE_SETTINGS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    
    const defaultSettings: StoreSettings = {
      general: {
        storeName: 'TechStore Premium',
        storeDescription: 'Loja especializada em produtos eletrônicos de alta qualidade',
        primaryColor: '#1DC37E',
        secondaryColor: '#18A56A',
        timezone: 'America/Sao_Paulo',
        currency: 'BRL',
        language: 'pt-BR'
      },
      contact: {
        email: 'contato@techstore.com',
        phone: '(11) 3333-4444',
        whatsapp: '5511999999999',
        address: {
          street: 'Rua das Flores',
          number: '123',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567',
          country: 'Brasil'
        }
      },
      business: {
        cnpj: '12.345.678/0001-90',
        companyName: 'TechStore Premium Comércio de Eletrônicos LTDA',
        taxRegime: 'Simples Nacional'
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        orderNotifications: true,
        stockNotifications: true,
        marketingNotifications: false
      },
      security: {
        twoFactorAuth: false,
        sessionTimeout: 30,
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireNumbers: true,
          requireSymbols: false
        },
        allowedIPs: []
      },
      seo: {
        metaTitle: 'TechStore Premium - Eletrônicos de Qualidade',
        metaDescription: 'Encontre os melhores produtos eletrônicos com preços competitivos e entrega rápida.',
        metaKeywords: 'eletrônicos, smartphones, notebooks, tecnologia'
      },
      social: {
        instagram: '@techstore_premium',
        facebook: 'TechStorePremium'
      },
      shipping: {
        freeShippingThreshold: 200,
        defaultShippingCost: 15.90,
        processingTime: 2,
        allowPickup: true,
        pickupInstructions: 'Retirada na loja de segunda a sexta, das 8h às 18h'
      },
      taxes: {
        includeTaxInPrice: true,
        defaultTaxRate: 18,
        taxByState: [
          { state: 'SP', rate: 18 },
          { state: 'RJ', rate: 20 },
          { state: 'MG', rate: 18 }
        ]
      }
    };
    
    this.saveStoreSettings(defaultSettings);
    return defaultSettings;
  }

  private static getStoredUserPreferences(): UserPreferences {
    const stored = localStorage.getItem(this.USER_PREFERENCES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    
    const defaultPreferences: UserPreferences = {
      theme: 'light',
      language: 'pt-BR',
      timezone: 'America/Sao_Paulo',
      dateFormat: 'DD/MM/YYYY',
      numberFormat: 'pt-BR',
      dashboardLayout: 'comfortable',
      emailDigest: 'weekly',
      notifications: {
        browser: true,
        email: true,
        mobile: false
      }
    };
    
    this.saveUserPreferences(defaultPreferences);
    return defaultPreferences;
  }

  private static getStoredSystemSettings(): SystemSettings {
    const stored = localStorage.getItem(this.SYSTEM_SETTINGS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    
    const defaultSettings: SystemSettings = {
      maintenance: {
        enabled: false,
        message: 'Sistema em manutenção. Voltaremos em breve.',
        allowedUsers: []
      },
      backup: {
        enabled: true,
        frequency: 'daily',
        retention: 30,
        lastBackup: new Date()
      },
      performance: {
        cacheEnabled: true,
        compressionEnabled: true,
        cdnEnabled: false
      },
      limits: {
        maxProducts: 1000,
        maxOrders: 10000,
        maxStorage: 5000, // MB
        maxBandwidth: 100000 // MB
      }
    };
    
    this.saveSystemSettings(defaultSettings);
    return defaultSettings;
  }

  private static saveStoreSettings(settings: StoreSettings): void {
    localStorage.setItem(this.STORE_SETTINGS_KEY, JSON.stringify(settings));
  }

  private static saveUserPreferences(preferences: UserPreferences): void {
    localStorage.setItem(this.USER_PREFERENCES_KEY, JSON.stringify(preferences));
  }

  private static saveSystemSettings(settings: SystemSettings): void {
    localStorage.setItem(this.SYSTEM_SETTINGS_KEY, JSON.stringify(settings));
  }

  static async getStoreSettings(): Promise<StoreSettings> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.getStoredStoreSettings();
  }

  static async getUserPreferences(): Promise<UserPreferences> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.getStoredUserPreferences();
  }

  static async getSystemSettings(): Promise<SystemSettings> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return this.getStoredSystemSettings();
  }

  static async updateStoreSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const currentSettings = this.getStoredStoreSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    
    this.saveStoreSettings(updatedSettings);
    return updatedSettings;
  }

  static async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const currentPreferences = this.getStoredUserPreferences();
    const updatedPreferences = { ...currentPreferences, ...preferences };
    
    this.saveUserPreferences(updatedPreferences);
    return updatedPreferences;
  }

  static async updateSystemSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const currentSettings = this.getStoredSystemSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    
    this.saveSystemSettings(updatedSettings);
    return updatedSettings;
  }

  static getTimezones(): Array<{ value: string; label: string }> {
    return [
      { value: 'America/Sao_Paulo', label: 'São Paulo (UTC-3)' },
      { value: 'America/Manaus', label: 'Manaus (UTC-4)' },
      { value: 'America/Rio_Branco', label: 'Rio Branco (UTC-5)' },
      { value: 'America/Noronha', label: 'Fernando de Noronha (UTC-2)' }
    ];
  }

  static getCurrencies(): Array<{ value: string; label: string; symbol: string }> {
    return [
      { value: 'BRL', label: 'Real Brasileiro', symbol: 'R$' },
      { value: 'USD', label: 'Dólar Americano', symbol: '$' },
      { value: 'EUR', label: 'Euro', symbol: '€' }
    ];
  }

  static getLanguages(): Array<{ value: string; label: string }> {
    return [
      { value: 'pt-BR', label: 'Português (Brasil)' },
      { value: 'en-US', label: 'English (US)' },
      { value: 'es-ES', label: 'Español' }
    ];
  }

  static getBrazilianStates(): Array<{ value: string; label: string }> {
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
  }
}