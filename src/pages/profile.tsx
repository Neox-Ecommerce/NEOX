import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Upload, 
  User, 
  Store, 
  Shield, 
  Clock, 
  Globe, 
  Truck, 
  FileText,
  Instagram,
  Facebook,
  MessageCircle,
  HelpCircle,
  CheckCircle,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { RoleGuard } from '@/components/RoleGuard';
import { DocumentUploadModal } from '@/components/DocumentUploadModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AuthService } from '@/services/AuthService';
import { StoreService, type StoreDocument, type StoreStatus } from '@/services/StoreService';
import { FeedbackService } from '@/services/FeedbackService';
import { useAuth } from '@/contexts/AuthContext';
import { formatPhone, validateURL, validateInstagram, validateFacebook } from '@/lib/utils';

const profileSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional().refine((val) => !val || val.length >= 6, 'A nova senha deve ter ao menos 6 caracteres'),
}).refine((d) => !d.newPassword || !!d.currentPassword, { message: 'Informe a senha atual', path: ['currentPassword'] });

const storeSchema = z.object({
  nomeFantasia: z.string().min(1, 'Nome fantasia é obrigatório'),
  razaoSocial: z.string().min(1, 'Razão social é obrigatória'),
  segmento: z.string().min(1, 'Segmento é obrigatório'),
  categoriaTributaria: z.string().min(1, 'Categoria tributária é obrigatória'),
  logo: z.string().optional(),
  endereco: z.string().optional(),
  telefone: z.string().optional(),
  descricaoLoja: z.string().max(300, 'Descrição deve ter no máximo 300 caracteres').optional(),
  horarioFuncionamento: z.record(z.object({
    ativo: z.boolean(),
    abertura: z.string(),
    fechamento: z.string()
  })),
  redesSociais: z.object({
    instagram: z.string().optional().refine((val) => !val || validateInstagram(val), 'Username do Instagram inválido'),
    facebook: z.string().optional().refine((val) => !val || validateFacebook(val), 'Username do Facebook inválido'),
    whatsapp: z.string().optional(),
    website: z.string().optional().refine((val) => !val || validateURL(val), 'URL inválida')
  }),
  tiposEntrega: z.array(z.string())
});

const STORE_STATUS: Record<StoreStatus, { label: string; variant: 'success' | 'warning' | 'destructive' }> = {
  APROVADA: { label: 'aprovada', variant: 'success' },
  PENDENTE: { label: 'em análise', variant: 'warning' },
  REJEITADA: { label: 'rejeitada', variant: 'destructive' },
  SUSPENSA: { label: 'suspensa', variant: 'destructive' },
};

const DOC_STATUS: Record<StoreDocument['status'], { label: string; variant: 'success' | 'warning' | 'destructive' }> = {
  VERIFICADO: { label: 'Verificado', variant: 'success' },
  PENDENTE: { label: 'Em análise', variant: 'warning' },
  REJEITADO: { label: 'Rejeitado', variant: 'destructive' },
};

type ProfileFormData = z.infer<typeof profileSchema>;
type StoreFormData = z.infer<typeof storeSchema>;

export function ProfilePage() {
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [telefoneDisplay, setTelefoneDisplay] = useState<string>('');
  const [whatsappDisplay, setWhatsappDisplay] = useState<string>('');
  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user: profile, updateProfile } = useAuth();

  const { data: store, isLoading: storeLoading } = useQuery({
    queryKey: ['store'],
    queryFn: StoreService.getStore
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['store-documents'],
    queryFn: StoreService.getDocuments
  });

  const { data: warnings = [] } = useQuery({
    queryKey: ['store-warnings'],
    queryFn: StoreService.getWarnings
  });

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
    }
  });

  const storeForm = useForm<StoreFormData>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      nomeFantasia: store?.nomeFantasia || '',
      razaoSocial: store?.razaoSocial || '',
      segmento: store?.segmento || '',
      categoriaTributaria: store?.categoriaTributaria || '',
      logo: store?.logo || '',
      endereco: store?.endereco || '',
      telefone: store?.telefone || '',
      descricaoLoja: store?.descricaoLoja || '',
      horarioFuncionamento: store?.horarioFuncionamento || {},
      redesSociais: store?.redesSociais || {},
      tiposEntrega: store?.tiposEntrega || []
    }
  });

  // Update forms when data loads
  React.useEffect(() => {
    if (profile) {
      profileForm.reset({
        name: profile.name,
        email: profile.email,
        phone: profile.phone || '',
      });
    }
  }, [profile, profileForm]);

  React.useEffect(() => {
    if (store) {
      storeForm.reset({
        nomeFantasia: store.nomeFantasia,
        razaoSocial: store.razaoSocial,
        segmento: store.segmento,
        categoriaTributaria: store.categoriaTributaria,
        logo: store.logo || '',
        endereco: store.endereco || '',
        telefone: store.telefone || '',
        descricaoLoja: store.descricaoLoja || '',
        horarioFuncionamento: store.horarioFuncionamento,
        redesSociais: store.redesSociais,
        tiposEntrega: store.tiposEntrega
      });
      setLogoPreview(store.logo || '');
      setTelefoneDisplay(store.telefone || '');
      setWhatsappDisplay(store.redesSociais?.whatsapp || '');
    }
  }, [store, storeForm]);

  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      FeedbackService.success('Perfil atualizado com sucesso!');
    },
    onError: (error: Error) => {
      FeedbackService.error(error.message || 'Erro ao atualizar perfil');
    }
  });

  const updateStoreMutation = useMutation({
    mutationFn: StoreService.updateStore,
    onSuccess: (updated) => {
      FeedbackService.success('Dados da loja atualizados com sucesso!');
      queryClient.setQueryData(['store'], updated);
      queryClient.invalidateQueries({ queryKey: ['store-settings'] });
    },
    onError: (error: Error) => {
      FeedbackService.error(error.message || 'Erro ao atualizar dados da loja');
    }
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: ({ file, description }: { file: File; description: string }) =>
      StoreService.uploadDocument(file, description),
    onSuccess: () => {
      FeedbackService.success('Documento enviado! Ele será analisado pela equipe NEOX.');
      queryClient.invalidateQueries({ queryKey: ['store-documents'] });
    },
    onError: (error: Error) => {
      FeedbackService.error(error.message || 'Erro ao enviar documento');
    }
  });

  const changePasswordMutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      AuthService.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      FeedbackService.success('Senha alterada com sucesso!');
      profileForm.setValue('currentPassword', '');
      profileForm.setValue('newPassword', '');
    },
    onError: (error: Error) => {
      FeedbackService.error(error.message || 'Erro ao alterar senha');
    }
  });

  const handleProfileSubmit = (data: ProfileFormData) => {
    const { currentPassword, newPassword, ...profileData } = data;
    
    updateProfileMutation.mutate(profileData);
    
    if (currentPassword && newPassword) {
      changePasswordMutation.mutate({ currentPassword, newPassword });
    }
  };

  const handleStoreSubmit = (data: StoreFormData) => {
    updateStoreMutation.mutate(data);
  };

  const handleDocumentUpload = async (file: File, description: string) => {
    await uploadDocumentMutation.mutateAsync({ file, description });
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        storeForm.setValue('logo', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTelefoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = formatPhone(event.target.value);
    setTelefoneDisplay(value);
    storeForm.setValue('telefone', value);
  };

  const handleWhatsappChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\D/g, '');
    setWhatsappDisplay(value);
    storeForm.setValue('redesSociais.whatsapp', value);
  };

  const handleTipoEntregaChange = (tipo: string, checked: boolean) => {
    const currentTipos = storeForm.getValues('tiposEntrega') || [];
    if (checked) {
      storeForm.setValue('tiposEntrega', [...currentTipos, tipo]);
    } else {
      storeForm.setValue('tiposEntrega', currentTipos.filter(t => t !== tipo));
    }
  };

  const handleHorarioChange = (dia: string, field: 'ativo' | 'abertura' | 'fechamento', value: boolean | string) => {
    const atual = storeForm.getValues(`horarioFuncionamento.${dia}`) || { ativo: false, abertura: '08:00', fechamento: '18:00' };
    storeForm.setValue(`horarioFuncionamento.${dia}`, { ...atual, [field]: value });
  };

  if (storeLoading) {
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

  const segmentos = StoreService.getSegmentos();
  const categoriasTributarias = StoreService.getCategoriasTributarias();
  const tiposEntrega = StoreService.getTiposEntrega();
  const diasSemana = StoreService.getDiasSemana();

  return (
    <RoleGuard requiredRole="EMPREENDEDOR">
      <AppShell>
        <TooltipProvider>
          <div className="p-6 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Perfil
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gerencie suas informações pessoais e da loja
              </p>
            </div>

            <Tabs defaultValue="personal" className="max-w-6xl">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="personal" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Dados Pessoais</span>
                </TabsTrigger>
                <TabsTrigger value="store" className="flex items-center space-x-2">
                  <Store className="h-4 w-4" />
                  <span>Dados da Loja</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="personal">
                <Card>
                  <CardHeader>
                    <CardTitle>Dados Pessoais</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nome Completo</Label>
                          <Input
                            id="name"
                            {...profileForm.register('name')}
                            placeholder="Seu nome completo"
                          />
                          {profileForm.formState.errors.name && (
                            <p className="text-sm text-red-500">
                              {profileForm.formState.errors.name.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            {...profileForm.register('email')}
                            placeholder="seu@email.com"
                          />
                          {profileForm.formState.errors.email && (
                            <p className="text-sm text-red-500">
                              {profileForm.formState.errors.email.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                          id="phone"
                          {...profileForm.register('phone')}
                          placeholder="(11) 99999-9999"
                        />
                      </div>

                      <div className="border-t pt-6">
                        <h3 className="text-lg font-medium mb-4">Alterar Senha</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="currentPassword">Senha Atual</Label>
                            <Input
                              id="currentPassword"
                              type="password"
                              {...profileForm.register('currentPassword')}
                              placeholder="Senha atual"
                            />
                            {profileForm.formState.errors.currentPassword && (
                              <p className="text-sm text-red-500">
                                {profileForm.formState.errors.currentPassword.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="newPassword">Nova Senha</Label>
                            <Input
                              id="newPassword"
                              type="password"
                              {...profileForm.register('newPassword')}
                              placeholder="Nova senha"
                            />
                            {profileForm.formState.errors.newPassword && (
                              <p className="text-sm text-red-500">
                                {profileForm.formState.errors.newPassword.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          disabled={updateProfileMutation.isPending || changePasswordMutation.isPending}
                        >
                          {updateProfileMutation.isPending || changePasswordMutation.isPending 
                            ? 'Salvando...' 
                            : 'Salvar Alterações'
                          }
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="store">
                <div className="space-y-6">
                  {/* Status de Verificação */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Status de Verificação
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <Badge variant={STORE_STATUS[store?.status ?? 'PENDENTE'].variant}>
                            Loja {STORE_STATUS[store?.status ?? 'PENDENTE'].label}
                          </Badge>
                          <Badge
                            variant={store?.cnpjVerificado ? "success" : "warning"}
                            className="flex items-center gap-1"
                          >
                            {store?.cnpjVerificado ? (
                              <CheckCircle className="h-3 w-3" />
                            ) : (
                              <AlertCircle className="h-3 w-3" />
                            )}
                            {store?.cnpjVerificado ? 'CNPJ Verificado' : 'CNPJ não verificado'}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {store?.cnpjVerificado
                              ? 'Sua empresa foi verificada pela equipe NEOX'
                              : 'Envie documentos da empresa para a equipe NEOX analisar'
                            }
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDocumentModalOpen(true)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Enviar Documento
                        </Button>
                      </div>

                      {store?.statusReason && store.status !== 'APROVADA' && (
                        <p className="text-sm text-red-600">Motivo: {store.statusReason}</p>
                      )}

                      {documents.length > 0 && (
                        <div className="border-t pt-4 space-y-2">
                          <p className="text-sm font-medium">Documentos enviados</p>
                          {documents.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between text-sm">
                              <a href={doc.url} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate">
                                {doc.tipo}{doc.description ? ` - ${doc.description}` : ''}
                              </a>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-gray-500">{doc.createdAt.toLocaleDateString('pt-BR')}</span>
                                <Badge variant={DOC_STATUS[doc.status].variant}>{DOC_STATUS[doc.status].label}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {warnings.filter((w) => !w.resolvido).length > 0 && (
                        <div className="border-t pt-4 space-y-2">
                          <p className="text-sm font-medium flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            Avisos da equipe NEOX
                          </p>
                          {warnings.filter((w) => !w.resolvido).map((w) => (
                            <p key={w.id} className="text-sm text-gray-700 dark:text-gray-300">
                              {w.createdAt.toLocaleDateString('pt-BR')}: {w.motivo}
                            </p>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Dados da Loja */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Informações da Loja</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={storeForm.handleSubmit(handleStoreSubmit)} className="space-y-8">
                        {/* Logo Upload */}
                        <div className="space-y-2">
                          <Label>Logo da Loja</Label>
                          <div className="flex items-center space-x-4">
                            <div className="h-20 w-20 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden">
                              {logoPreview ? (
                                <img 
                                  src={logoPreview} 
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
                                onChange={handleLogoUpload}
                                className="hidden"
                                id="logo-upload"
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

                        {/* Informações Básicas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="nomeFantasia">Nome Fantasia *</Label>
                              <Input
                                id="nomeFantasia"
                                {...storeForm.register('nomeFantasia')}
                                placeholder="Nome da sua loja"
                              />
                              {storeForm.formState.errors.nomeFantasia && (
                                <p className="text-sm text-red-500">
                                  {storeForm.formState.errors.nomeFantasia.message}
                                </p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="razaoSocial">Razão Social *</Label>
                              <Input
                                id="razaoSocial"
                                {...storeForm.register('razaoSocial')}
                                placeholder="Razão social da empresa"
                              />
                              {storeForm.formState.errors.razaoSocial && (
                                <p className="text-sm text-red-500">
                                  {storeForm.formState.errors.razaoSocial.message}
                                </p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="cnpj">CNPJ *</Label>
                              <Input
                                id="cnpj"
                                value={store?.cnpj ?? ''}
                                readOnly
                                disabled
                              />
                              <p className="text-xs text-gray-500">
                                O CNPJ não pode ser alterado. Se houver erro, abra um ticket em Ajuda.
                              </p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="segmento">Segmento *</Label>
                              <Controller
                                name="segmento"
                                control={storeForm.control}
                                render={({ field }) => (
                                  <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione o segmento" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {segmentos.map((segmento) => (
                                        <SelectItem key={segmento} value={segmento}>
                                          {segmento}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                              />
                              {storeForm.formState.errors.segmento && (
                                <p className="text-sm text-red-500">
                                  {storeForm.formState.errors.segmento.message}
                                </p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Label htmlFor="categoriaTributaria">Categoria Tributária *</Label>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <HelpCircle className="h-4 w-4 text-gray-400" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Escolha o regime tributário da sua empresa</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <Controller
                                name="categoriaTributaria"
                                control={storeForm.control}
                                render={({ field }) => (
                                  <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione a categoria" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {categoriasTributarias.map((categoria) => (
                                        <SelectItem key={categoria.value} value={categoria.value}>
                                          <div>
                                            <div className="font-medium">{categoria.label}</div>
                                            <div className="text-xs text-gray-500">{categoria.description}</div>
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                              />
                              {storeForm.formState.errors.categoriaTributaria && (
                                <p className="text-sm text-red-500">
                                  {storeForm.formState.errors.categoriaTributaria.message}
                                </p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="telefone">Telefone da Loja</Label>
                              <Input
                                id="telefone"
                                value={telefoneDisplay}
                                onChange={handleTelefoneChange}
                                placeholder="(11) 3333-4444"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Endereço e Descrição */}
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="endereco">Endereço</Label>
                            <Input
                              id="endereco"
                              {...storeForm.register('endereco')}
                              placeholder="Endereço completo da loja"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="descricaoLoja">Descrição da Loja</Label>
                            <Textarea
                              id="descricaoLoja"
                              {...storeForm.register('descricaoLoja')}
                              placeholder="Descreva sua loja para os clientes..."
                              rows={3}
                              maxLength={300}
                            />
                            <div className="flex justify-between items-center">
                              {storeForm.formState.errors.descricaoLoja && (
                                <p className="text-sm text-red-500">
                                  {storeForm.formState.errors.descricaoLoja.message}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 ml-auto">
                                {storeForm.watch('descricaoLoja')?.length || 0}/300 caracteres
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Horário de Funcionamento */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            <Label className="text-base font-semibold">Horário de Funcionamento</Label>
                          </div>
                          <div className="grid gap-3">
                            {diasSemana.map((dia) => {
                              const horario = storeForm.watch(`horarioFuncionamento.${dia.key}`) || { ativo: false, abertura: '08:00', fechamento: '18:00' };
                              return (
                                <div key={dia.key} className="flex items-center gap-4 p-3 border rounded-lg">
                                  <div className="flex items-center space-x-2 min-w-[120px]">
                                    <Checkbox
                                      checked={horario.ativo}
                                      onCheckedChange={(checked) => 
                                        handleHorarioChange(dia.key, 'ativo', checked as boolean)
                                      }
                                    />
                                    <Label className="text-sm font-medium">{dia.label}</Label>
                                  </div>
                                  {horario.ativo && (
                                    <div className="flex items-center gap-2">
                                      <Input
                                        type="time"
                                        value={horario.abertura}
                                        onChange={(e) => handleHorarioChange(dia.key, 'abertura', e.target.value)}
                                        className="w-24"
                                      />
                                      <span className="text-sm text-gray-500">às</span>
                                      <Input
                                        type="time"
                                        value={horario.fechamento}
                                        onChange={(e) => handleHorarioChange(dia.key, 'fechamento', e.target.value)}
                                        className="w-24"
                                      />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Redes Sociais */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Globe className="h-5 w-5" />
                            <Label className="text-base font-semibold">Redes Sociais</Label>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="instagram" className="flex items-center gap-2">
                                <Instagram className="h-4 w-4" />
                                Instagram
                              </Label>
                              <Input
                                id="instagram"
                                {...storeForm.register('redesSociais.instagram')}
                                placeholder="@usuario ou usuario"
                              />
                              {storeForm.formState.errors.redesSociais?.instagram && (
                                <p className="text-sm text-red-500">
                                  {storeForm.formState.errors.redesSociais.instagram.message}
                                </p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="facebook" className="flex items-center gap-2">
                                <Facebook className="h-4 w-4" />
                                Facebook
                              </Label>
                              <Input
                                id="facebook"
                                {...storeForm.register('redesSociais.facebook')}
                                placeholder="usuario.pagina"
                              />
                              {storeForm.formState.errors.redesSociais?.facebook && (
                                <p className="text-sm text-red-500">
                                  {storeForm.formState.errors.redesSociais.facebook.message}
                                </p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="whatsapp" className="flex items-center gap-2">
                                <MessageCircle className="h-4 w-4" />
                                WhatsApp Business
                              </Label>
                              <Input
                                id="whatsapp"
                                value={whatsappDisplay}
                                onChange={handleWhatsappChange}
                                placeholder="5511999999999"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="website" className="flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                Site da Loja
                              </Label>
                              <Input
                                id="website"
                                {...storeForm.register('redesSociais.website')}
                                placeholder="https://minhaloja.com.br"
                              />
                              {storeForm.formState.errors.redesSociais?.website && (
                                <p className="text-sm text-red-500">
                                  {storeForm.formState.errors.redesSociais.website.message}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Tipos de Entrega */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Truck className="h-5 w-5" />
                            <Label className="text-base font-semibold">Tipos de Entrega Atendida</Label>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {tiposEntrega.map((tipo) => {
                              const isChecked = storeForm.watch('tiposEntrega')?.includes(tipo) || false;
                              return (
                                <div key={tipo} className="flex items-center space-x-2">
                                  <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={(checked) => 
                                      handleTipoEntregaChange(tipo, checked as boolean)
                                    }
                                  />
                                  <Label className="text-sm">{tipo}</Label>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex justify-end pt-6 border-t">
                          <Button 
                            type="submit" 
                            disabled={updateStoreMutation.isPending}
                            className="min-w-[150px]"
                          >
                            {updateStoreMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Document Upload Modal */}
          <DocumentUploadModal
            open={documentModalOpen}
            onOpenChange={setDocumentModalOpen}
            onSubmit={handleDocumentUpload}
          />
        </TooltipProvider>
      </AppShell>
    </RoleGuard>
  );
}