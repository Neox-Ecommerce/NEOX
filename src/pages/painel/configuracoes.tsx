import { useEffect, useState, type ChangeEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Store, 
  Bell, 
  Search,
  Palette,
  CreditCard,
  Truck,
  Percent,
  Save,
  Moon,
  Sun,
  Upload,
  Plus,
  Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { RoleGuard } from '@/components/RoleGuard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { SettingsService, type StoreSettings } from '@/services/SettingsService';
import { FeedbackService } from '@/services/FeedbackService';

type Section = keyof StoreSettings;

export function ConfiguracoesPage() {
  const queryClient = useQueryClient();
  // rascunho local: os campos editam o rascunho e cada botão "Salvar" envia só a sua seção
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);

  const { data: savedSettings, isLoading: storeSettingsLoading } = useQuery({
    queryKey: ['store-settings'],
    queryFn: SettingsService.getStoreSettings
  });

  useEffect(() => {
    if (savedSettings) setStoreSettings(savedSettings);
  }, [savedSettings]);

  const { data: userPreferences, isLoading: userPreferencesLoading } = useQuery({
    queryKey: ['user-preferences'],
    queryFn: SettingsService.getUserPreferences
  });

  const updateStoreSettingsMutation = useMutation({
    mutationFn: SettingsService.updateStoreSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(['store-settings'], data);
      queryClient.invalidateQueries({ queryKey: ['store'] });
      FeedbackService.success('Configurações da loja atualizadas com sucesso!');
    },
    onError: (error: Error) => {
      FeedbackService.error(error.message || 'Erro ao atualizar configurações da loja');
    }
  });

  const updateUserPreferencesMutation = useMutation({
    mutationFn: SettingsService.updateUserPreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
      FeedbackService.success('Preferências atualizadas com sucesso!');
    },
    onError: (error: Error) => {
      FeedbackService.error(error.message || 'Erro ao atualizar preferências');
    }
  });

  const handleUpdateStoreSettings = <S extends Section>(section: S, data: Partial<StoreSettings[S]>) => {
    setStoreSettings((prev) => (prev ? { ...prev, [section]: { ...prev[section], ...data } } : prev));
  };

  const saveSection = (section: Section) => {
    if (storeSettings) updateStoreSettingsMutation.mutate({ [section]: storeSettings[section] });
  };

  const handleImageUpload = (field: 'logo' | 'favicon') => (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      FeedbackService.error('Use uma imagem JPG, PNG ou WEBP');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => handleUpdateStoreSettings('general', { [field]: reader.result as string });
    reader.readAsDataURL(file);
  };

  const handleUpdateUserPreferences = (data: Partial<NonNullable<typeof userPreferences>>) => {
    updateUserPreferencesMutation.mutate(data);
  };

  const toggleTheme = () => {
    if (!userPreferences) return;
    
    const newTheme = userPreferences.theme === 'light' ? 'dark' : 'light';
    handleUpdateUserPreferences({ theme: newTheme });
    
    // Also toggle the document class for immediate effect
    document.documentElement.classList.toggle('dark');
  };

  const timezones = SettingsService.getTimezones();
  const currencies = SettingsService.getCurrencies();
  const languages = SettingsService.getLanguages();
  const brazilianStates = SettingsService.getBrazilianStates();

  if (storeSettingsLoading || userPreferencesLoading || !storeSettings) {
    return (
      <RoleGuard requiredRole="EMPREENDEDOR">
        <AppShell>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </AppShell>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard requiredRole="EMPREENDEDOR">
      <AppShell>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Configurações
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gerencie as configurações da sua loja e preferências pessoais
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={toggleTheme}>
                {userPreferences?.theme === 'dark' ? (
                  <>
                    <Sun className="h-4 w-4 mr-2" />
                    Modo Claro
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4 mr-2" />
                    Modo Escuro
                  </>
                )}
              </Button>
            </div>
          </div>

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <Store className="h-4 w-4" />
                <span className="hidden md:inline">Geral</span>
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                <span className="hidden md:inline">Aparência</span>
              </TabsTrigger>
              <TabsTrigger value="shipping" className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                <span className="hidden md:inline">Envio</span>
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span className="hidden md:inline">Pagamentos</span>
              </TabsTrigger>
              <TabsTrigger value="taxes" className="flex items-center gap-2">
                <Percent className="h-4 w-4" />
                <span className="hidden md:inline">Impostos</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden md:inline">Notificações</span>
              </TabsTrigger>
              <TabsTrigger value="seo" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <span className="hidden md:inline">SEO</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Gerais</CardTitle>
                  <CardDescription>
                    Configure as informações básicas da sua loja
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="store-name">Nome da Loja</Label>
                      <Input
                        id="store-name"
                        value={storeSettings?.general.storeName}
                        onChange={(e) => handleUpdateStoreSettings('general', { storeName: e.target.value })}
                        placeholder="Nome da sua loja"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timezone">Fuso Horário</Label>
                      <Select 
                        value={storeSettings?.general.timezone} 
                        onValueChange={(value) => handleUpdateStoreSettings('general', { timezone: value })}
                      >
                        <SelectTrigger id="timezone">
                          <SelectValue placeholder="Selecione o fuso horário" />
                        </SelectTrigger>
                        <SelectContent>
                          {timezones.map((timezone) => (
                            <SelectItem key={timezone.value} value={timezone.value}>
                              {timezone.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="currency">Moeda</Label>
                      <Select 
                        value={storeSettings?.general.currency} 
                        onValueChange={(value) => handleUpdateStoreSettings('general', { currency: value })}
                      >
                        <SelectTrigger id="currency">
                          <SelectValue placeholder="Selecione a moeda" />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency.value} value={currency.value}>
                              {currency.label} ({currency.symbol})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="language">Idioma</Label>
                      <Select 
                        value={storeSettings?.general.language} 
                        onValueChange={(value) => handleUpdateStoreSettings('general', { language: value })}
                      >
                        <SelectTrigger id="language">
                          <SelectValue placeholder="Selecione o idioma" />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map((language) => (
                            <SelectItem key={language.value} value={language.value}>
                              {language.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="store-description">Descrição da Loja</Label>
                    <Textarea
                      id="store-description"
                      value={storeSettings?.general.storeDescription}
                      onChange={(e) => handleUpdateStoreSettings('general', { storeDescription: e.target.value })}
                      placeholder="Descreva sua loja em poucas palavras"
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={() => saveSection('general')} disabled={updateStoreSettingsMutation.isPending}>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Alterações
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Informações de Contato</CardTitle>
                  <CardDescription>
                    Configure as informações de contato da sua loja
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="contact-email">Email de Contato</Label>
                      <Input
                        id="contact-email"
                        value={storeSettings?.contact.email}
                        onChange={(e) => handleUpdateStoreSettings('contact', { email: e.target.value })}
                        placeholder="contato@sualoja.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact-phone">Telefone de Contato</Label>
                      <Input
                        id="contact-phone"
                        value={storeSettings?.contact.phone}
                        onChange={(e) => handleUpdateStoreSettings('contact', { phone: e.target.value })}
                        placeholder="(11) 3333-4444"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-whatsapp">WhatsApp Business (opcional)</Label>
                    <Input
                      id="contact-whatsapp"
                      value={storeSettings?.contact.whatsapp}
                      onChange={(e) => handleUpdateStoreSettings('contact', { whatsapp: e.target.value })}
                      placeholder="5511999999999"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Endereço</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Rua"
                        value={storeSettings?.contact.address.street}
                        onChange={(e) => handleUpdateStoreSettings('contact', { 
                          address: { ...storeSettings.contact.address, street: e.target.value } 
                        })}
                      />
                      <Input
                        placeholder="Número"
                        value={storeSettings?.contact.address.number}
                        onChange={(e) => handleUpdateStoreSettings('contact', { 
                          address: { ...storeSettings.contact.address, number: e.target.value } 
                        })}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <Input
                        placeholder="Complemento"
                        value={storeSettings?.contact.address.complement}
                        onChange={(e) => handleUpdateStoreSettings('contact', { 
                          address: { ...storeSettings.contact.address, complement: e.target.value } 
                        })}
                      />
                      <Input
                        placeholder="Bairro"
                        value={storeSettings?.contact.address.neighborhood}
                        onChange={(e) => handleUpdateStoreSettings('contact', { 
                          address: { ...storeSettings.contact.address, neighborhood: e.target.value } 
                        })}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                      <Input
                        placeholder="Cidade"
                        value={storeSettings?.contact.address.city}
                        onChange={(e) => handleUpdateStoreSettings('contact', { 
                          address: { ...storeSettings.contact.address, city: e.target.value } 
                        })}
                      />
                      <Select 
                        value={storeSettings?.contact.address.state} 
                        onValueChange={(value) => handleUpdateStoreSettings('contact', { 
                          address: { ...storeSettings.contact.address, state: value } 
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                          {brazilianStates.map((state) => (
                            <SelectItem key={state.value} value={state.value}>
                              {state.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="CEP"
                        value={storeSettings?.contact.address.zipCode}
                        onChange={(e) => handleUpdateStoreSettings('contact', { 
                          address: { ...storeSettings.contact.address, zipCode: e.target.value } 
                        })}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={() => saveSection('contact')} disabled={updateStoreSettingsMutation.isPending}>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Alterações
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Aparência da Loja</CardTitle>
                  <CardDescription>
                    Personalize a aparência da sua loja
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="primary-color">Cor Primária</Label>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded-full border"
                          style={{ backgroundColor: storeSettings?.general.primaryColor }}
                        ></div>
                        <Input
                          id="primary-color"
                          type="color"
                          value={storeSettings?.general.primaryColor}
                          onChange={(e) => handleUpdateStoreSettings('general', { primaryColor: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secondary-color">Cor Secundária</Label>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded-full border"
                          style={{ backgroundColor: storeSettings?.general.secondaryColor }}
                        ></div>
                        <Input
                          id="secondary-color"
                          type="color"
                          value={storeSettings?.general.secondaryColor}
                          onChange={(e) => handleUpdateStoreSettings('general', { secondaryColor: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Logo da Loja</Label>
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden">
                        {storeSettings?.general.logo ? (
                          <img 
                            src={storeSettings.general.logo} 
                            alt="Logo preview" 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Store className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          id="logo-upload"
                          onChange={handleImageUpload('logo')}
                        />
                        <Label htmlFor="logo-upload">
                          <Button type="button" variant="outline" asChild>
                            <span className="cursor-pointer">
                              <Upload className="h-4 w-4 mr-2" />
                              Carregar Logo
                            </span>
                          </Button>
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Favicon</Label>
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden">
                        {storeSettings?.general.favicon ? (
                          <img 
                            src={storeSettings.general.favicon} 
                            alt="Favicon preview" 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Store className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          id="favicon-upload"
                          onChange={handleImageUpload('favicon')}
                        />
                        <Label htmlFor="favicon-upload">
                          <Button type="button" variant="outline" asChild>
                            <span className="cursor-pointer">
                              <Upload className="h-4 w-4 mr-2" />
                              Carregar Favicon
                            </span>
                          </Button>
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={() => saveSection('general')} disabled={updateStoreSettingsMutation.isPending}>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Alterações
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="shipping" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Envio</CardTitle>
                  <CardDescription>
                    Configure as opções de envio da sua loja
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="free-shipping-threshold">Valor Mínimo para Frete Grátis (R$)</Label>
                      <Input
                        id="free-shipping-threshold"
                        type="number"
                        min="0"
                        step="0.01"
                        value={storeSettings?.shipping.freeShippingThreshold}
                        onChange={(e) => handleUpdateStoreSettings('shipping', { 
                          freeShippingThreshold: Number(e.target.value) || 0 
                        })}
                        placeholder="0.00"
                      />
                      <p className="text-sm text-gray-500">
                        Defina 0 para desativar o frete grátis
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="default-shipping-cost">Custo Padrão de Envio (R$)</Label>
                      <Input
                        id="default-shipping-cost"
                        type="number"
                        min="0"
                        step="0.01"
                        value={storeSettings?.shipping.defaultShippingCost}
                        onChange={(e) => handleUpdateStoreSettings('shipping', { 
                          defaultShippingCost: Number(e.target.value) || 0 
                        })}
                        placeholder="0.00"
                      />
                      <p className="text-sm text-gray-500">
                        Valor padrão quando não for possível calcular o frete
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="processing-time">Tempo de Processamento (dias)</Label>
                      <Input
                        id="processing-time"
                        type="number"
                        min="0"
                        step="1"
                        value={storeSettings?.shipping.processingTime}
                        onChange={(e) => handleUpdateStoreSettings('shipping', { 
                          processingTime: Math.trunc(Number(e.target.value)) || 0 
                        })}
                        placeholder="1"
                      />
                      <p className="text-sm text-gray-500">
                        Tempo para preparar o pedido antes do envio
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Retirada na Loja</Label>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Permitir retirada na loja</span>
                        <Switch
                          checked={storeSettings?.shipping.allowPickup}
                          onCheckedChange={(checked) => handleUpdateStoreSettings('shipping', { 
                            allowPickup: checked 
                          })}
                        />
                      </div>
                      {storeSettings?.shipping.allowPickup && (
                        <Textarea
                          placeholder="Instruções para retirada na loja"
                          value={storeSettings?.shipping.pickupInstructions}
                          onChange={(e) => handleUpdateStoreSettings('shipping', { 
                            pickupInstructions: e.target.value 
                          })}
                          rows={3}
                          className="mt-2"
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={() => saveSection('shipping')} disabled={updateStoreSettingsMutation.isPending}>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Alterações
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Pagamento</CardTitle>
                  <CardDescription>
                    Configure as opções de pagamento da sua loja
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Os pagamentos dos pedidos são processados pelo Mercado Pago da plataforma NEOX: você não precisa
                    cadastrar credenciais para vender. Os valores recebidos aparecem em Financeiro.
                  </p>
                  <Button variant="outline" asChild>
                    <Link to="/painel/financeiro">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Ir para o Financeiro
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="taxes" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Impostos</CardTitle>
                  <CardDescription>
                    Configure as opções de impostos da sua loja
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Incluir Imposto no Preço</Label>
                      <Switch
                        checked={storeSettings?.taxes.includeTaxInPrice}
                        onCheckedChange={(checked) => handleUpdateStoreSettings('taxes', { 
                          includeTaxInPrice: checked 
                        })}
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      Se ativado, os impostos serão incluídos no preço exibido ao cliente
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="default-tax-rate">Taxa de Imposto Padrão (%)</Label>
                    <Input
                      id="default-tax-rate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={storeSettings?.taxes.defaultTaxRate}
                      onChange={(e) => handleUpdateStoreSettings('taxes', { 
                        defaultTaxRate: Number(e.target.value) || 0 
                      })}
                      placeholder="0"
                    />
                    <p className="text-sm text-gray-500">
                      Taxa de imposto padrão aplicada quando não há uma taxa específica para o estado
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Taxas por Estado</Label>
                    <div className="border rounded-lg p-4 space-y-4 max-h-60 overflow-y-auto">
                      {storeSettings?.taxes.taxByState.map((tax, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <Select 
                            value={tax.state} 
                            onValueChange={(value) => {
                              const newTaxes = [...storeSettings.taxes.taxByState];
                              newTaxes[index].state = value;
                              handleUpdateStoreSettings('taxes', { taxByState: newTaxes });
                            }}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent>
                              {brazilianStates.map((state) => (
                                <SelectItem key={state.value} value={state.value}>
                                  {state.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={tax.rate}
                            onChange={(e) => {
                              const newTaxes = [...storeSettings.taxes.taxByState];
                              newTaxes[index].rate = Number(e.target.value) || 0;
                              handleUpdateStoreSettings('taxes', { taxByState: newTaxes });
                            }}
                            placeholder="0"
                            className="w-24"
                          />
                          <span className="text-sm">%</span>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              const newTaxes = storeSettings.taxes.taxByState.filter((_, i) => i !== index);
                              handleUpdateStoreSettings('taxes', { taxByState: newTaxes });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const newTaxes = [...storeSettings.taxes.taxByState, { state: '', rate: 0 }];
                          handleUpdateStoreSettings('taxes', { taxByState: newTaxes });
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Estado
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={() => saveSection('taxes')} disabled={updateStoreSettingsMutation.isPending}>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Alterações
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Notificações</CardTitle>
                  <CardDescription>
                    Configure como você deseja receber notificações
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Notificações por Email</Label>
                        <p className="text-sm text-gray-500">
                          Receba atualizações importantes por email
                        </p>
                      </div>
                      <Switch
                        checked={storeSettings?.notifications.emailNotifications}
                        onCheckedChange={(checked) => handleUpdateStoreSettings('notifications', { 
                          emailNotifications: checked 
                        })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Notificações por SMS</Label>
                        <p className="text-sm text-gray-500">
                          Receba alertas urgentes por SMS
                        </p>
                      </div>
                      <Switch
                        checked={storeSettings?.notifications.smsNotifications}
                        onCheckedChange={(checked) => handleUpdateStoreSettings('notifications', { 
                          smsNotifications: checked 
                        })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Notificações Push</Label>
                        <p className="text-sm text-gray-500">
                          Receba notificações no navegador ou aplicativo
                        </p>
                      </div>
                      <Switch
                        checked={storeSettings?.notifications.pushNotifications}
                        onCheckedChange={(checked) => handleUpdateStoreSettings('notifications', { 
                          pushNotifications: checked 
                        })}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-6 space-y-4">
                    <h3 className="text-lg font-medium">Eventos de Notificação</h3>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Novos Pedidos</Label>
                        <p className="text-sm text-gray-500">
                          Notificações quando novos pedidos forem realizados
                        </p>
                      </div>
                      <Switch
                        checked={storeSettings?.notifications.orderNotifications}
                        onCheckedChange={(checked) => handleUpdateStoreSettings('notifications', { 
                          orderNotifications: checked 
                        })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Alertas de Estoque</Label>
                        <p className="text-sm text-gray-500">
                          Notificações quando o estoque estiver baixo
                        </p>
                      </div>
                      <Switch
                        checked={storeSettings?.notifications.stockNotifications}
                        onCheckedChange={(checked) => handleUpdateStoreSettings('notifications', { 
                          stockNotifications: checked 
                        })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Atualizações de Marketing</Label>
                        <p className="text-sm text-gray-500">
                          Notificações sobre campanhas e promoções
                        </p>
                      </div>
                      <Switch
                        checked={storeSettings?.notifications.marketingNotifications}
                        onCheckedChange={(checked) => handleUpdateStoreSettings('notifications', { 
                          marketingNotifications: checked 
                        })}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={() => saveSection('notifications')} disabled={updateStoreSettingsMutation.isPending}>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Alterações
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seo" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de SEO</CardTitle>
                  <CardDescription>
                    Otimize sua loja para mecanismos de busca
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="meta-title">Título da Página (Meta Title)</Label>
                    <Input
                      id="meta-title"
                      value={storeSettings?.seo.metaTitle}
                      onChange={(e) => handleUpdateStoreSettings('seo', { metaTitle: e.target.value })}
                      placeholder="Ex: Minha Loja - Produtos de qualidade"
                    />
                    <p className="text-sm text-gray-500">
                      Recomendado: até 60 caracteres
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meta-description">Descrição da Página (Meta Description)</Label>
                    <Textarea
                      id="meta-description"
                      value={storeSettings?.seo.metaDescription}
                      onChange={(e) => handleUpdateStoreSettings('seo', { metaDescription: e.target.value })}
                      placeholder="Ex: Descreva em uma frase o que sua loja vende"
                      rows={3}
                    />
                    <p className="text-sm text-gray-500">
                      Recomendado: até 160 caracteres
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meta-keywords">Palavras-chave (Meta Keywords)</Label>
                    <Input
                      id="meta-keywords"
                      value={storeSettings?.seo.metaKeywords}
                      onChange={(e) => handleUpdateStoreSettings('seo', { metaKeywords: e.target.value })}
                      placeholder="Ex: roupas, acessórios, moda feminina"
                    />
                    <p className="text-sm text-gray-500">
                      Separe as palavras-chave por vírgulas
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="google-analytics">ID do Google Analytics</Label>
                    <Input
                      id="google-analytics"
                      value={storeSettings?.seo.googleAnalyticsId}
                      onChange={(e) => handleUpdateStoreSettings('seo', { googleAnalyticsId: e.target.value })}
                      placeholder="Ex: G-XXXXXXXXXX"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="facebook-pixel">ID do Facebook Pixel</Label>
                    <Input
                      id="facebook-pixel"
                      value={storeSettings?.seo.facebookPixelId}
                      onChange={(e) => handleUpdateStoreSettings('seo', { facebookPixelId: e.target.value })}
                      placeholder="Ex: XXXXXXXXXX"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={() => saveSection('seo')} disabled={updateStoreSettingsMutation.isPending}>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Alterações
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </div>
      </AppShell>
    </RoleGuard>
  );
}