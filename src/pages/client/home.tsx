import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Zap, Globe, Search, TrendingUp, Users, Check, Star, Store, Package, Headphones, Instagram, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMutation, useQuery } from '@tanstack/react-query';
import { HelpService } from '@/services/HelpService';
import { FeedbackService } from '@/services/FeedbackService';

export function ClientHomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800">NeoxStore</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#recursos" className="text-gray-600 hover:text-green-600 transition-colors">Recursos</a>
              <a href="#planos" className="text-gray-600 hover:text-green-600 transition-colors">Planos</a>
              <a href="#quem-somos" className="text-gray-600 hover:text-green-600 transition-colors">Quem Somos</a>
              <a href="#contato" className="text-gray-600 hover:text-green-600 transition-colors">Contato</a>
              <Link to="/auth">
                <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors">
                  Começar Agora
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section with Animated Background */}
      <section id="hero" className="hero-section py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        {/* Container das partículas confinado ao hero */}
        <div id="hero-particles" className="absolute inset-0 pointer-events-none">
          <div className="particle-icon particle-icon-1" style={{left: '5%'}}>
            <ShoppingBag className="w-8 h-8 text-green-600" />
          </div>
          <div className="particle-icon particle-icon-2" style={{left: '15%'}}>
            <Zap className="w-7 h-7 text-blue-600" />
          </div>
          <div className="particle-icon particle-icon-3" style={{left: '25%'}}>
            <Globe className="w-8 h-8 text-purple-600" />
          </div>
          <div className="particle-icon particle-icon-4" style={{left: '35%'}}>
            <Search className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="particle-icon particle-icon-5" style={{left: '45%'}}>
            <TrendingUp className="w-7 h-7 text-green-600" />
          </div>
          <div className="particle-icon particle-icon-6" style={{left: '55%'}}>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <div className="particle-icon particle-icon-7" style={{left: '65%'}}>
            <Star className="w-7 h-7 text-purple-600" />
          </div>
          <div className="particle-icon particle-icon-8" style={{left: '75%'}}>
            <Package className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="particle-icon particle-icon-9" style={{left: '85%'}}>
            <Store className="w-8 h-8 text-green-600" />
          </div>
          <div className="particle-icon particle-icon-10" style={{left: '10%'}}>
            <ShoppingBag className="w-6 h-6 text-blue-600" />
          </div>
          <div className="particle-icon particle-icon-11" style={{left: '30%'}}>
            <Zap className="w-8 h-8 text-purple-600" />
          </div>
          <div className="particle-icon particle-icon-12" style={{left: '50%'}}>
            <Globe className="w-7 h-7 text-green-600" />
          </div>
          <div className="particle-icon particle-icon-13" style={{left: '70%'}}>
            <Search className="w-8 h-8 text-indigo-600" />
          </div>
          <div className="particle-icon particle-icon-14" style={{left: '20%'}}>
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div className="particle-icon particle-icon-15" style={{left: '90%'}}>
            <Users className="w-7 h-7 text-purple-600" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
              Crie sua
              <span className="text-green-600"> loja virtual </span>
              em minutos
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              A NeoxStore é uma plataforma completa para criação e gerenciamento de lojas online. 
              Monte, personalize e gerencie sua loja diretamente pelo nosso sistema web e desktop, 
              de forma intuitiva e acessível.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/auth">
                <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors flex items-center space-x-2">
                  <ShoppingBag className="w-5 h-5" />
                  <span>Criar Minha Loja</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="recursos" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Por que escolher a <span className="text-green-600">NeoxStore</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Uma plataforma completa que oferece tudo o que você precisa para ter sucesso no e-commerce
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow border border-gray-100">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Globe className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Hospedagem Incluída</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Suas lojas ficam hospedadas em nossos servidores seguros e confiáveis
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow border border-gray-100">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Search className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Catálogo Interno</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Clientes podem encontrar lojas por nome, produtos ou categorias
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow border border-gray-100">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Área de Tendências</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Destaque para vídeos promocionais de empreendedores em alta
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow border border-gray-100">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Zap className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Fácil de Usar</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Interface intuitiva para criar e gerenciar sua loja sem complicações
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quem Somos Section */}
      <section id="quem-somos" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
                Quem <span className="text-green-600">Somos</span>
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                A NeoxStore nasceu da visão de democratizar o e-commerce no Brasil. Somos uma equipe apaixonada por tecnologia e empreendedorismo, dedicada a criar soluções que tornem o comércio eletrônico acessível para todos.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Nossa missão é empoderar pequenos e médios empreendedores com ferramentas profissionais, permitindo que foquem no que fazem de melhor: vender seus produtos e construir relacionamentos com seus clientes.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center bg-white p-6 rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-green-600 mb-2">1000+</div>
                  <div className="text-gray-600">Lojas Criadas</div>
                </div>
                <div className="text-center bg-white p-6 rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-green-600 mb-2">50k+</div>
                  <div className="text-gray-600">Produtos Vendidos</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-12 h-12 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Nossa Visão</h3>
                <p className="text-gray-600">
                  Ser a principal plataforma de e-commerce do Brasil, conectando empreendedores aos seus clientes de forma simples, eficiente e inovadora.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="planos" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Planos de <span className="text-green-600">Assinatura</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Escolha o plano ideal para o seu negócio e comece a vender hoje mesmo
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Plano Básico */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow border border-gray-200">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Plano Básico</h3>
                <div className="text-3xl font-bold text-gray-800 mb-1">R$ 29</div>
                <div className="text-gray-500">/mês</div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-600">1 loja</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-600">Até 20 produtos</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-600">Hospedagem incluída</span>
                </li>
                <li className="flex items-center space-x-3 opacity-50">
                  <span className="w-5 h-5 border border-gray-300 rounded-full"></span>
                  <span className="text-gray-400">Sem integrações externas</span>
                </li>
              </ul>
              <Link to="/auth">
                <Button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold transition-colors">
                  Começar Grátis
                </Button>
              </Link>
            </div>

            {/* Plano Profissional */}
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow border-2 border-green-500 relative transform scale-105">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Mais Popular
                </span>
              </div>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Plano Profissional</h3>
                <div className="text-3xl font-bold text-gray-800 mb-1">R$ 79</div>
                <div className="text-gray-500">/mês</div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-600">Até 3 lojas</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-600">Até 100 produtos por loja</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-600">Suporte básico</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-600">Acesso à área de tendências</span>
                </li>
              </ul>
              <Link to="/auth">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors">
                  Escolher Plano
                </Button>
              </Link>
            </div>

            {/* Plano Premium */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow border border-gray-200">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Plano Premium</h3>
                <div className="text-3xl font-bold text-gray-800 mb-1">R$ 149</div>
                <div className="text-gray-500">/mês</div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-600">Lojas ilimitadas</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-600">Produtos ilimitados</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-600">Integrações externas</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-600">Destaque automático</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-gray-600">Suporte completo</span>
                </li>
              </ul>
              <Link to="/auth">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors">
                  Escolher Premium
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ContactSection />

      {/* CTA Section */}
      <section className="py-20 bg-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Pronto para começar seu negócio online?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de empreendedores que já escolheram a NeoxStore para criar suas lojas virtuais
          </p>
          <Link to="/auth">
            <Button className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-colors inline-flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5" />
              <span>Criar Minha Loja Agora</span>
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">NeoxStore</span>
              </div>
              <p className="text-gray-300 mb-6">
                A plataforma completa para criar e gerenciar sua loja virtual.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-green-600 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-green-600 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#recursos" className="hover:text-white transition-colors">Recursos</a></li>
                <li><a href="#planos" className="hover:text-white transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrações</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#contato" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Política de Privacidade</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
                <li><a href="#quem-somos" className="hover:text-white transition-colors">Sobre</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-300">
            <p>&copy; 2025 NeoxStore. Todos os direitos reservados.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors text-sm">Política de Privacidade</a>
              <a href="#" className="hover:text-white transition-colors text-sm">Termos de Uso</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [showAllFaq, setShowAllFaq] = useState(false);
  const contactInfo = HelpService.getContactInfo();
  const { data: faq = [] } = useQuery({ queryKey: ['faq', 'public'], queryFn: () => HelpService.getFAQ() });

  const contactMutation = useMutation({
    mutationFn: HelpService.sendContactMessage,
    onSuccess: (res) => {
      FeedbackService.success(res.message);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    },
    onError: (error: Error) => FeedbackService.error(error.message || 'Erro ao enviar mensagem'),
  });

  const set = (field: keyof typeof form) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || form.message.trim().length < 10) {
      FeedbackService.error('Preencha nome, e-mail, assunto e uma mensagem com ao menos 10 caracteres');
      return;
    }
    contactMutation.mutate({ ...form, phone: form.phone || undefined });
  };

  const inputClass = 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors';

  return (
      <section id="contato" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Entre em <span className="text-green-600">Contato</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tem dúvidas ou precisa de ajuda? Nossa equipe está pronta para atendê-lo
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Envie sua mensagem</h3>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
                      Nome completo
                    </label>
                    <Input type="text" id="nome" name="nome" className={inputClass} placeholder="Seu nome"
                      value={form.name} onChange={set('name')} required />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      E-mail
                    </label>
                    <Input type="email" id="email" name="email" className={inputClass} placeholder="seu@email.com"
                      value={form.email} onChange={set('email')} required />
                  </div>
                </div>
                <div>
                  <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone (opcional)
                  </label>
                  <Input type="tel" id="telefone" name="telefone" className={inputClass} placeholder="(11) 99999-9999"
                    value={form.phone} onChange={set('phone')} />
                </div>
                <div>
                  <label htmlFor="assunto" className="block text-sm font-medium text-gray-700 mb-2">
                    Assunto
                  </label>
                  <select id="assunto" name="assunto" className={inputClass} value={form.subject} onChange={set('subject')} required>
                    <option value="">Selecione um assunto</option>
                    <option value="Quero vender na NEOX">Quero vender na NEOX</option>
                    <option value="Dúvida sobre um pedido">Dúvida sobre um pedido</option>
                    <option value="Suporte técnico">Suporte técnico</option>
                    <option value="Parcerias">Parcerias</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="mensagem" className="block text-sm font-medium text-gray-700 mb-2">
                    Mensagem
                  </label>
                  <textarea id="mensagem" name="mensagem" rows={5} className={`${inputClass} resize-none`}
                    placeholder="Descreva sua dúvida ou necessidade..." value={form.message} onChange={set('message')} required />
                </div>
                <Button
                  type="submit"
                  disabled={contactMutation.isPending}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                >
                  {contactMutation.isPending ? 'Enviando...' : 'Enviar Mensagem'}
                </Button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Informações de contato</h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">E-mail</h4>
                      <a href={`mailto:${contactInfo.email}`} className="text-gray-600 hover:text-green-600">{contactInfo.email}</a>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Horário de atendimento</h4>
                      {contactInfo.businessHours.map((h) => (
                        <p key={h.days} className="text-gray-600">{h.days}: {h.hours}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ */}
              {faq.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Perguntas frequentes</h3>
                  <div className="space-y-4">
                    {(showAllFaq ? faq : faq.slice(0, 3)).map((item) => (
                      <details key={item.id} className="border-l-4 border-green-500 pl-4 group">
                        <summary className="font-semibold text-gray-800 cursor-pointer list-none">{item.question}</summary>
                        <p className="text-gray-600 text-sm mt-1">{item.answer}</p>
                      </details>
                    ))}
                  </div>
                  {faq.length > 3 && (
                    <div className="mt-6">
                      <Button
                        type="button"
                        className="text-green-600 hover:text-green-700 font-semibold flex items-center space-x-2 transition-colors"
                        variant="ghost"
                        onClick={() => setShowAllFaq(!showAllFaq)}
                      >
                        <Headphones className="w-5 h-5" />
                        <span>{showAllFaq ? 'Ver menos' : 'Ver todas as perguntas'}</span>
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
  );
}
