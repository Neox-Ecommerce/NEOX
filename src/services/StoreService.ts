interface Store {
  id: string;
  nomeFantasia: string;
  razaoSocial: string;
  cnpj: string;
  cnpjVerificado: boolean;
  segmento: string;
  categoriaTributaria: string;
  logo?: string;
  endereco?: string;
  telefone?: string;
  descricaoLoja?: string;
  horarioFuncionamento: {
    [key: string]: {
      ativo: boolean;
      abertura: string;
      fechamento: string;
    };
  };
  redesSociais: {
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
    website?: string;
  };
  tiposEntrega: string[];
}

export class StoreService {
  private static STORE_KEY = 'neox_store';

  private static store: Store = {
    id: '1',
    nomeFantasia: 'TechStore Premium',
    razaoSocial: 'TechStore Premium Comércio de Eletrônicos LTDA',
    cnpj: '12.345.678/0001-90',
    cnpjVerificado: false,
    segmento: 'Eletrônicos',
    categoriaTributaria: 'Simples Nacional',
    logo: 'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?auto=compress&cs=tinysrgb&w=150',
    endereco: 'Rua das Flores, 123 - São Paulo, SP',
    telefone: '(11) 3333-4444',
    descricaoLoja: 'Loja especializada em produtos eletrônicos de alta qualidade com os melhores preços do mercado.',
    horarioFuncionamento: {
      segunda: { ativo: true, abertura: '08:00', fechamento: '18:00' },
      terca: { ativo: true, abertura: '08:00', fechamento: '18:00' },
      quarta: { ativo: true, abertura: '08:00', fechamento: '18:00' },
      quinta: { ativo: true, abertura: '08:00', fechamento: '18:00' },
      sexta: { ativo: true, abertura: '08:00', fechamento: '18:00' },
      sabado: { ativo: true, abertura: '09:00', fechamento: '17:00' },
      domingo: { ativo: false, abertura: '09:00', fechamento: '17:00' }
    },
    redesSociais: {
      instagram: '@techstore_premium',
      facebook: 'TechStorePremium',
      whatsapp: '5511999999999',
      website: 'https://techstore.com.br'
    },
    tiposEntrega: ['Delivery próprio', 'Retirada no local']
  };

  static async getStore(): Promise<Store> {
    const stored = localStorage.getItem(this.STORE_KEY);
    if (stored) {
      this.store = JSON.parse(stored);
    }
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ...this.store };
  }

  static async updateStore(data: Partial<Store>): Promise<Store> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const currentStore = await this.getStore();
    this.store = { ...currentStore, ...data };

    localStorage.setItem(this.STORE_KEY, JSON.stringify(this.store));

    return { ...this.store };
  }

  static async uploadDocument(file: File, description: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    // Simular upload e verificação
    this.store.cnpjVerificado = true;
    localStorage.setItem(this.STORE_KEY, JSON.stringify(this.store));
  }

  static getSegmentos(): string[] {
    return [
      'Eletrônicos',
      'Moda e Acessórios',
      'Casa e Jardim',
      'Esportes e Lazer',
      'Livros e Papelaria',
      'Alimentação',
      'Saúde e Beleza',
      'Automotivo',
      'Brinquedos',
      'Informática',
      'Móveis',
      'Outros'
    ];
  }

  static getCategoriasTributarias(): Array<{value: string, label: string, description: string}> {
    return [
      {
        value: 'MEI',
        label: 'MEI - Microempreendedor Individual',
        description: 'Para faturamento até R$ 81.000/ano'
      },
      {
        value: 'Simples Nacional',
        label: 'Simples Nacional',
        description: 'Para faturamento até R$ 4.800.000/ano'
      },
      {
        value: 'Lucro Presumido',
        label: 'Lucro Presumido',
        description: 'Para faturamento até R$ 78.000.000/ano'
      },
      {
        value: 'Lucro Real',
        label: 'Lucro Real',
        description: 'Para empresas de grande porte'
      }
    ];
  }

  static getTiposEntrega(): string[] {
    return [
      'Delivery próprio',
      'Retirada no local',
      'Entrega por apps parceiros',
      'Correios',
      'Transportadora'
    ];
  }

  static getDiasSemana(): Array<{key: string, label: string}> {
    return [
      { key: 'segunda', label: 'Segunda-feira' },
      { key: 'terca', label: 'Terça-feira' },
      { key: 'quarta', label: 'Quarta-feira' },
      { key: 'quinta', label: 'Quinta-feira' },
      { key: 'sexta', label: 'Sexta-feira' },
      { key: 'sabado', label: 'Sábado' },
      { key: 'domingo', label: 'Domingo' }
    ];
  }
}