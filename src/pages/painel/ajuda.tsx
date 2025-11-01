import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  HelpCircle, 
  Search, 
  MessageSquare,
  FileText,
  Video,
  Mail,
  Phone,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Plus,
  Send,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Users,
  ChevronRight,
  ChevronDown,
  Play
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { RoleGuard } from '@/components/RoleGuard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { HelpService } from '@/services/HelpService';
import { FeedbackService } from '@/services/FeedbackService';
import { useAuth } from '@/contexts/AuthContext';

export function AjudaPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFAQCategory, setSelectedFAQCategory] = useState<string>('');
  const [selectedTutorialCategory, setSelectedTutorialCategory] = useState<string>('');
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [ticketData, setTicketData] = useState({
    subject: '',
    description: '',
    category: 'technical' as 'technical' | 'billing' | 'general' | 'feature_request' | 'bug_report',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent'
  });
  const [newMessage, setNewMessage] = useState('');

  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: faq = [], isLoading: faqLoading } = useQuery({
    queryKey: ['faq', selectedFAQCategory],
    queryFn: () => HelpService.getFAQ(selectedFAQCategory || undefined)
  });

  const { data: tickets = [], isLoading: ticketsLoading } = useQuery({
    queryKey: ['support-tickets', user?.id],
    queryFn: () => HelpService.getSupportTickets(user?.id || '1')
  });

  const { data: tutorials = [], isLoading: tutorialsLoading } = useQuery({
    queryKey: ['tutorials', selectedTutorialCategory],
    queryFn: () => HelpService.getTutorials(selectedTutorialCategory || undefined)
  });

  const createTicketMutation = useMutation({
    mutationFn: HelpService.createSupportTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      FeedbackService.success('Ticket criado com sucesso!');
      setTicketModalOpen(false);
      setTicketData({
        subject: '',
        description: '',
        category: 'technical',
        priority: 'medium'
      });
    },
    onError: () => {
      FeedbackService.error('Erro ao criar ticket');
    }
  });

  const addTicketMessageMutation = useMutation({
    mutationFn: ({ ticketId, content }: { ticketId: string; content: string }) => 
      HelpService.addTicketMessage(ticketId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      FeedbackService.success('Mensagem enviada com sucesso!');
      setNewMessage('');
    },
    onError: () => {
      FeedbackService.error('Erro ao enviar mensagem');
    }
  });

  const rateFAQMutation = useMutation({
    mutationFn: ({ faqId, helpful }: { faqId: string; helpful: boolean }) => 
      HelpService.rateFAQ(faqId, helpful),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faq'] });
      FeedbackService.success('Obrigado pelo feedback!');
    }
  });

  const handleCreateTicket = () => {
    if (!ticketData.subject || !ticketData.description) {
      FeedbackService.error('Preencha todos os campos obrigatórios');
      return;
    }

    createTicketMutation.mutate({
      ...ticketData,
      userId: user?.id || '1'
    });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return;

    addTicketMessageMutation.mutate({
      ticketId: selectedTicket.id,
      content: newMessage
    });
  };

  const handleRateFAQ = (faqId: string, helpful: boolean) => {
    rateFAQMutation.mutate({ faqId, helpful });
  };

  const filteredFAQ = searchQuery
    ? faq.filter(item => 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : faq;

  const filteredTutorials = searchQuery
    ? tutorials.filter(tutorial => 
        tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tutorial.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tutorial.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : tutorials;

  const contactInfo = HelpService.getContactInfo();
  const faqCategories = HelpService.getFAQCategories();
  const tutorialCategories = HelpService.getTutorialCategories();
  
  // Garantir que sejam sempre arrays válidos
  const faqCategoriesArray = Array.isArray(faqCategories) ? faqCategories : [];
  const tutorialCategoriesArray = Array.isArray(tutorialCategories) ? tutorialCategories : [];

  const getStatusBadge = (status: string) => {
    const variants = {
      'open': { variant: 'warning' as const, label: 'Aberto' },
      'in_progress': { variant: 'default' as const, label: 'Em Andamento' },
      'waiting_response': { variant: 'secondary' as const, label: 'Aguardando Resposta' },
      'resolved': { variant: 'success' as const, label: 'Resolvido' },
      'closed': { variant: 'secondary' as const, label: 'Fechado' }
    };

    const config = variants[status as keyof typeof variants] || variants.open;

    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      'low': { variant: 'secondary' as const, label: 'Baixa' },
      'medium': { variant: 'default' as const, label: 'Média' },
      'high': { variant: 'warning' as const, label: 'Alta' },
      'urgent': { variant: 'destructive' as const, label: 'Urgente' }
    };

    const config = variants[priority as keyof typeof variants] || variants.medium;

    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  if (faqLoading || ticketsLoading || tutorialsLoading) {
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
                Central de Ajuda
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Encontre respostas para suas dúvidas e obtenha suporte
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button onClick={() => setTicketModalOpen(true)}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Abrir Ticket
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Buscar na Central de Ajuda..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>

          <Tabs defaultValue="faq" className="space-y-6">
            <TabsList>
              <TabsTrigger value="faq" className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                Perguntas Frequentes
              </TabsTrigger>
              <TabsTrigger value="tickets" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Meus Tickets
              </TabsTrigger>
              <TabsTrigger value="tutorials" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                Tutoriais
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Contato
              </TabsTrigger>
            </TabsList>

            <TabsContent value="faq" className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Categories */}
                <Card className="sm:w-64">
                  <CardHeader>
                    <CardTitle>Categorias</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="space-y-1 p-4">
                      <Button
                        variant={selectedFAQCategory === '' ? 'default' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => setSelectedFAQCategory('')}
                      >
                        Todas as categorias
                      </Button>
                      {faqCategoriesArray.length > 0 ? faqCategoriesArray.map((category) => (
                        <Button
                          key={category}
                          variant={selectedFAQCategory === category ? 'default' : 'ghost'}
                          className="w-full justify-start"
                          onClick={() => setSelectedFAQCategory(category)}
                        >
                          {category}
                        </Button>
                      )) : null}
                    </div>
                  </CardContent>
                </Card>

                {/* FAQ Items */}
                <div className="flex-1 space-y-6">
                  <h2 className="text-xl font-semibold">
                    {selectedFAQCategory ? `Perguntas sobre ${selectedFAQCategory}` : 'Perguntas Frequentes'}
                  </h2>

                  {filteredFAQ.length === 0 ? (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <HelpCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          Nenhuma pergunta encontrada
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {searchQuery 
                            ? `Não encontramos resultados para "${searchQuery}"`
                            : 'Não há perguntas disponíveis nesta categoria'
                          }
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <Accordion type="single" collapsible className="space-y-4">
                      {filteredFAQ.map((item) => (
                        <AccordionItem key={item.id} value={item.id} className="border rounded-lg overflow-hidden">
                          <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                            <div className="text-left">
                              <div className="font-medium text-gray-900 dark:text-white">
                                {item.question}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {item.category}
                                </Badge>
                                {item.tags.slice(0, 2).map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-6 py-4 bg-gray-50 dark:bg-gray-800">
                            <div className="space-y-4">
                              <div className="prose prose-sm max-w-none dark:prose-invert">
                                <p>{item.answer}</p>
                              </div>
                              
                              <div className="flex items-center justify-between pt-4 border-t">
                                <div className="text-sm text-gray-500">
                                  Esta resposta foi útil?
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleRateFAQ(item.id, true)}
                                  >
                                    <ThumbsUp className="h-4 w-4 mr-2" />
                                    Sim ({item.helpful})
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleRateFAQ(item.id, false)}
                                  >
                                    <ThumbsDown className="h-4 w-4 mr-2" />
                                    Não ({item.notHelpful})
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tickets" className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <h2 className="text-xl font-semibold">Meus Tickets de Suporte</h2>
                <Button onClick={() => setTicketModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Ticket
                </Button>
              </div>

              {tickets.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Nenhum ticket encontrado
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Você ainda não abriu nenhum ticket de suporte
                    </p>
                    <Button onClick={() => setTicketModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Abrir Novo Ticket
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {ticket.subject}
                              </h3>
                              {getStatusBadge(ticket.status)}
                              {getPriorityBadge(ticket.priority)}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {ticket.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageSquare className="h-4 w-4" />
                                {ticket.messages.length} mensagens
                              </div>
                            </div>
                          </div>
                          <Button 
                            variant="outline"
                            onClick={() => setSelectedTicket(ticket)}
                          >
                            Ver Detalhes
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Ticket Details Dialog */}
              {selectedTicket && (
                <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <div className="flex items-center justify-between">
                        <DialogTitle>{selectedTicket.subject}</DialogTitle>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(selectedTicket.status)}
                          {getPriorityBadge(selectedTicket.priority)}
                        </div>
                      </div>
                      <DialogDescription>
                        Ticket #{selectedTicket.id} • Criado em {new Date(selectedTicket.createdAt).toLocaleDateString('pt-BR')}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                      {/* Ticket Messages */}
                      <div className="space-y-4">
                        {selectedTicket.messages.map((message: any) => (
                          <div 
                            key={message.id} 
                            className={`flex ${message.isFromSupport ? 'justify-start' : 'justify-end'}`}
                          >
                            <div 
                              className={`max-w-[80%] rounded-lg p-4 ${
                                message.isFromSupport 
                                  ? 'bg-gray-100 dark:bg-gray-800' 
                                  : 'bg-primary/10 dark:bg-primary/20'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                  message.isFromSupport 
                                    ? 'bg-blue-100 text-blue-600' 
                                    : 'bg-primary/20 text-primary'
                                }`}>
                                  {message.isFromSupport ? 'S' : user?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div>
                                  <div className="font-medium">
                                    {message.isFromSupport ? 'Suporte NEOX' : user?.name || 'Você'}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {new Date(message.createdAt).toLocaleString('pt-BR')}
                                  </div>
                                </div>
                              </div>
                              <p className="text-sm">{message.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Reply Form */}
                      {selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' && (
                        <div className="border-t pt-4">
                          <div className="space-y-4">
                            <Label htmlFor="reply">Sua Resposta</Label>
                            <Textarea
                              id="reply"
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              placeholder="Digite sua mensagem..."
                              rows={3}
                            />
                            <div className="flex justify-end">
                              <Button 
                                onClick={handleSendMessage}
                                disabled={!newMessage.trim() || addTicketMessageMutation.isPending}
                              >
                                {addTicketMessageMutation.isPending ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Enviando...
                                  </>
                                ) : (
                                  <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Enviar
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Ticket Closed Message */}
                      {(selectedTicket.status === 'closed' || selectedTicket.status === 'resolved') && (
                        <div className="bg-gray-50 dark:bg-gray-800 border rounded-lg p-4 text-center">
                          <CheckCircle className="mx-auto h-8 w-8 text-green-600 mb-2" />
                          <p className="text-gray-600 dark:text-gray-400">
                            Este ticket está {selectedTicket.status === 'closed' ? 'fechado' : 'resolvido'}.
                          </p>
                          <Button 
                            variant="outline" 
                            className="mt-2"
                            onClick={() => setTicketModalOpen(true)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Abrir Novo Ticket
                          </Button>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </TabsContent>

            <TabsContent value="tutorials" className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Categories */}
                <Card className="sm:w-64">
                  <CardHeader>
                    <CardTitle>Categorias</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="space-y-1 p-4">
                      <Button
                        variant={selectedTutorialCategory === '' ? 'default' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => setSelectedTutorialCategory('')}
                      >
                        Todos os tutoriais
                      </Button>
                      {tutorialCategoriesArray.length > 0 ? tutorialCategoriesArray.map((category) => (
                        <Button
                          key={category}
                          variant={selectedTutorialCategory === category ? 'default' : 'ghost'}
                          className="w-full justify-start"
                          onClick={() => setSelectedTutorialCategory(category)}
                        >
                          {category}
                        </Button>
                      )) : null}
                    </div>
                  </CardContent>
                </Card>

                {/* Tutorials */}
                <div className="flex-1 space-y-6">
                  <h2 className="text-xl font-semibold">
                    {selectedTutorialCategory ? `Tutoriais de ${selectedTutorialCategory}` : 'Tutoriais Populares'}
                  </h2>

                  {filteredTutorials.length === 0 ? (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <Video className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          Nenhum tutorial encontrado
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {searchQuery 
                            ? `Não encontramos resultados para "${searchQuery}"`
                            : 'Não há tutoriais disponíveis nesta categoria'
                          }
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredTutorials.map((tutorial) => (
                        <Card key={tutorial.id} className="hover:shadow-md transition-shadow">
                          <div className="relative">
                            {tutorial.steps[0].image ? (
                              <img 
                                src={tutorial.steps[0].image} 
                                alt={tutorial.title}
                                className="w-full h-40 object-cover rounded-t-lg"
                              />
                            ) : (
                              <div className="w-full h-40 bg-gray-100 dark:bg-gray-800 rounded-t-lg flex items-center justify-center">
                                <Video className="h-12 w-12 text-gray-400" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <Button size="icon" className="rounded-full bg-white/20 backdrop-blur-sm">
                                <Play className="h-6 w-6 text-white" />
                              </Button>
                            </div>
                            <Badge className="absolute top-2 right-2" variant={
                              tutorial.difficulty === 'beginner' ? 'success' :
                              tutorial.difficulty === 'intermediate' ? 'warning' : 'destructive'
                            }>
                              {tutorial.difficulty === 'beginner' ? 'Iniciante' :
                               tutorial.difficulty === 'intermediate' ? 'Intermediário' : 'Avançado'}
                            </Badge>
                          </div>
                          
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                              {tutorial.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                              {tutorial.description}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Clock className="h-4 w-4" />
                                {tutorial.estimatedTime} min
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <ThumbsUp className="h-4 w-4" />
                                {tutorial.likes}
                              </div>
                            </div>
                            
                            <Button className="w-full mt-4">
                              Ver Tutorial
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Entre em Contato</CardTitle>
                    <CardDescription>
                      Estamos aqui para ajudar você com qualquer dúvida
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">Email</h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            {contactInfo.email}
                          </p>
                          <Button variant="link" className="p-0 h-auto text-primary">
                            Enviar email
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <Phone className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">Telefone</h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            {contactInfo.phone}
                          </p>
                          <Button variant="link" className="p-0 h-auto text-primary">
                            Ligar agora
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <MessageSquare className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">WhatsApp</h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            {contactInfo.phone}
                          </p>
                          <Button variant="link" className="p-0 h-auto text-primary">
                            Conversar no WhatsApp
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">Horário de Atendimento</h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Segunda a Sexta:</span>
                          <span>9h às 18h</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sábado:</span>
                          <span>9h às 12h</span>
                        </div>
                        <div className="flex justify-between text-gray-500">
                          <span>Domingo:</span>
                          <span>Fechado</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Formulário de Contato</CardTitle>
                    <CardDescription>
                      Envie uma mensagem diretamente para nossa equipe
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="contact-name">Nome</Label>
                        <Input
                          id="contact-name"
                          placeholder="Seu nome completo"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contact-email">Email</Label>
                        <Input
                          id="contact-email"
                          type="email"
                          placeholder="seu@email.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contact-subject">Assunto</Label>
                        <Input
                          id="contact-subject"
                          placeholder="Assunto da mensagem"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contact-message">Mensagem</Label>
                        <Textarea
                          id="contact-message"
                          placeholder="Digite sua mensagem..."
                          rows={4}
                        />
                      </div>

                      <Button className="w-full">
                        <Send className="h-4 w-4 mr-2" />
                        Enviar Mensagem
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recursos Adicionais</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                          <FileText className="h-5 w-5" />
                        </div>
                        <h3 className="font-medium text-gray-900 dark:text-white">Documentação</h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Acesse nossa documentação completa com guias detalhados
                      </p>
                      <Button variant="outline" className="w-full">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ver Documentação
                      </Button>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-full">
                          <Video className="h-5 w-5" />
                        </div>
                        <h3 className="font-medium text-gray-900 dark:text-white">Vídeos</h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Assista a vídeos tutoriais sobre como usar a plataforma
                      </p>
                      <Button variant="outline" className="w-full">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Canal do YouTube
                      </Button>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-green-100 text-green-600 rounded-full">
                          <Users className="h-5 w-5" />
                        </div>
                        <h3 className="font-medium text-gray-900 dark:text-white">Comunidade</h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Participe da nossa comunidade e conecte-se com outros usuários
                      </p>
                      <Button variant="outline" className="w-full">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Acessar Fórum
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Create Ticket Modal */}
          <Dialog open={ticketModalOpen} onOpenChange={setTicketModalOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Abrir Novo Ticket</DialogTitle>
                <DialogDescription>
                  Descreva seu problema ou dúvida para que possamos ajudar
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ticket-subject">Assunto *</Label>
                  <Input
                    id="ticket-subject"
                    value={ticketData.subject}
                    onChange={(e) => setTicketData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Ex: Problema com pagamento"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ticket-category">Categoria *</Label>
                  <Select 
                    value={ticketData.category} 
                    onValueChange={(value) => setTicketData(prev => ({ ...prev, category: value as any }))}
                  >
                    <SelectTrigger id="ticket-category">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Suporte Técnico</SelectItem>
                      <SelectItem value="billing">Faturamento</SelectItem>
                      <SelectItem value="general">Dúvida Geral</SelectItem>
                      <SelectItem value="feature_request">Sugestão de Funcionalidade</SelectItem>
                      <SelectItem value="bug_report">Reportar Bug</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ticket-priority">Prioridade *</Label>
                  <Select 
                    value={ticketData.priority} 
                    onValueChange={(value) => setTicketData(prev => ({ ...prev, priority: value as any }))}
                  >
                    <SelectTrigger id="ticket-priority">
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ticket-description">Descrição *</Label>
                  <Textarea
                    id="ticket-description"
                    value={ticketData.description}
                    onChange={(e) => setTicketData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva seu problema ou dúvida em detalhes..."
                    rows={5}
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">
                        Dicas para um atendimento mais rápido
                      </p>
                      <ul className="text-sm text-yellow-700 mt-1 space-y-1 list-disc list-inside">
                        <li>Seja claro e detalhado na descrição do problema</li>
                        <li>Informe quais passos você já tentou para resolver</li>
                        <li>Inclua capturas de tela se possível</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setTicketModalOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCreateTicket}
                  disabled={createTicketMutation.isPending}
                >
                  {createTicketMutation.isPending ? 'Enviando...' : 'Enviar Ticket'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </AppShell>
    </RoleGuard>
  );
}