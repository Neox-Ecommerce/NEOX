import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Check, ChevronDown, Clock, Globe, Mail, Menu, Package, Search, ShoppingBag, Star, TrendingUp, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { IconButton } from '@/components/PageStates';
import { Logo, MobileDrawer } from '@/components/layouts/shared';
import { cn } from '@/lib/utils';
import { FeedbackService } from '@/services/FeedbackService';
import { HelpService } from '@/services/HelpService';

const SIGNUP = '/vender/cadastro';

const SECTIONS = [
  { href: '#recursos', label: 'Recursos' },
  { href: '#planos', label: 'Planos' },
  { href: '#quem-somos', label: 'Quem somos' },
  { href: '#contato', label: 'Contato' },
];

const FEATURES = [
  { icon: Globe, title: 'Hospedagem incluída', text: 'Suas lojas ficam hospedadas em nossos servidores seguros e confiáveis.' },
  { icon: Search, title: 'Catálogo interno', text: 'Clientes encontram sua loja por nome, produtos ou categorias.' },
  { icon: TrendingUp, title: 'Área de tendências', text: 'Destaque para vídeos promocionais de empreendedores em alta.' },
  { icon: Zap, title: 'Fácil de usar', text: 'Interface simples para criar e gerenciar sua loja sem complicação.' },
];

const PLANS = [
  { icon: Package, name: 'Plano Básico', price: 'R$ 29', cta: 'Começar', items: ['1 loja', 'Até 20 produtos', 'Hospedagem incluída'], missing: ['Sem integrações externas'] },
  { icon: Star, name: 'Plano Profissional', price: 'R$ 79', cta: 'Escolher plano', highlight: true, items: ['Até 3 lojas', 'Até 100 produtos por loja', 'Suporte básico', 'Acesso à área de tendências'], missing: [] },
  { icon: Users, name: 'Plano Premium', price: 'R$ 149', cta: 'Escolher Premium', items: ['Lojas ilimitadas', 'Produtos ilimitados', 'Integrações externas', 'Destaque automático', 'Suporte completo'], missing: [] },
];

/** Página "Venda na NEOX" (/vender): apresentação para lojistas. */
export function ClientHomePage() {
  const [menu, setMenu] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-card focus:px-3 focus:py-2">
        Pular para o conteúdo
      </a>
      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo />
          <nav aria-label="Seções" className="hidden items-center gap-6 md:flex">
            {SECTIONS.map((s) => (
              <a key={s.href} href={s.href} className="text-sm font-medium text-foreground/80 hover:text-primary">{s.label}</a>
            ))}
            <Link to="/entrar" className="text-sm font-medium text-foreground/80 hover:text-primary">Entrar</Link>
            <Button asChild><Link to={SIGNUP}>Começar agora</Link></Button>
          </nav>
          <IconButton label="Abrir menu" icon={Menu} className="h-11 w-11 md:hidden" onClick={() => setMenu(true)} />
        </div>
      </header>
      <MobileDrawer open={menu} onOpenChange={setMenu} title="Menu">
        <nav aria-label="Seções" className="flex flex-col gap-1 p-3">
          {SECTIONS.map((s) => (
            <a key={s.href} href={s.href} onClick={() => setMenu(false)} className="flex min-h-11 items-center rounded-md px-3 text-sm font-medium hover:bg-accent">{s.label}</a>
          ))}
          <Link to="/entrar" className="flex min-h-11 items-center rounded-md px-3 text-sm font-medium hover:bg-accent">Entrar</Link>
          <Link to="/" className="flex min-h-11 items-center rounded-md px-3 text-sm font-medium hover:bg-accent">Ir para a loja</Link>
          <Button asChild className="mt-2"><Link to={SIGNUP}>Começar agora</Link></Button>
        </nav>
      </MobileDrawer>

      <main id="conteudo">
        <section className="bg-primary-muted py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              Crie sua <span className="text-primary dark:text-brand-gradient">loja virtual</span> em minutos
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
              A NEOX é uma plataforma completa para criar e gerenciar lojas online. Monte, personalize e gerencie sua loja
              de forma simples, e venda para clientes que já compram na vitrine NEOX.
            </p>
            <Button asChild size="lg" className="mt-8">
              <Link to={SIGNUP}><ShoppingBag className="mr-2 h-5 w-5" aria-hidden="true" />Criar minha loja</Link>
            </Button>
          </div>
        </section>

        <section id="recursos" className="scroll-mt-16 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <h2 className="text-center text-2xl font-bold sm:text-3xl">Por que escolher a <span className="text-primary">NEOX</span>?</h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">Tudo o que você precisa para vender online.</p>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2">
              {FEATURES.map((f) => (
                <li key={f.title} className="flex gap-4 rounded-xl border bg-card p-6">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-muted">
                    <f.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="font-semibold">{f.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="quem-somos" className="scroll-mt-16 bg-muted/40 py-16 sm:py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold sm:text-3xl">Quem <span className="text-primary">somos</span></h2>
              <p className="text-muted-foreground">
                A NEOX nasceu da vontade de democratizar o comércio eletrônico no Brasil. Somos uma equipe apaixonada por tecnologia
                e empreendedorismo, dedicada a tornar o comércio online acessível para todos.
              </p>
              <p className="text-muted-foreground">
                Nossa missão é dar a pequenos e médios empreendedores ferramentas profissionais, para que foquem no que fazem de melhor:
                vender seus produtos e cuidar dos seus clientes.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-8 text-center">
              <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-muted">
                <Users className="h-8 w-8 text-primary" aria-hidden="true" />
              </span>
              <h3 className="text-xl font-semibold">Nossa visão</h3>
              <p className="mt-2 text-muted-foreground">
                Conectar empreendedores aos seus clientes de forma simples, eficiente e inovadora.
              </p>
            </div>
          </div>
        </section>

        <section id="planos" className="scroll-mt-16 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-2xl font-bold sm:text-3xl">Planos de <span className="text-primary">assinatura</span></h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">Escolha o plano ideal para o seu negócio.</p>
            <ul className="mt-10 grid gap-6 md:grid-cols-3">
              {PLANS.map((p) => (
                <li key={p.name} className={cn('relative flex flex-col rounded-xl border bg-card p-6', p.highlight && 'border-2 border-primary shadow-lg')}>
                  {p.highlight && (
                    <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                      Mais popular
                    </span>
                  )}
                  <div className="text-center">
                    <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-muted">
                      <p.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                    </span>
                    <h3 className="text-xl font-semibold">{p.name}</h3>
                    <p className="mt-2"><span className="text-3xl font-bold">{p.price}</span> <span className="text-muted-foreground">/mês</span></p>
                  </div>
                  <ul className="my-6 flex-1 space-y-3 text-sm">
                    {p.items.map((i) => (
                      <li key={i} className="flex items-center gap-3"><Check className="h-5 w-5 text-primary" aria-hidden="true" />{i}</li>
                    ))}
                    {p.missing.map((i) => (
                      <li key={i} className="flex items-center gap-3 text-muted-foreground">
                        <span className="h-5 w-5 rounded-full border" aria-hidden="true" />{i}
                      </li>
                    ))}
                  </ul>
                  <Button asChild variant={p.highlight ? 'default' : 'outline'} className="w-full">
                    <Link to={SIGNUP}>{p.cta}</Link>
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <ContactSection />

        <section className="bg-primary py-16">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="text-2xl font-bold text-primary-foreground sm:text-3xl">Pronto para começar seu negócio online?</h2>
            <p className="mt-3 text-primary-foreground/90">Cadastre sua loja. Depois da análise, seus produtos aparecem na vitrine da NEOX.</p>
            <Button asChild size="lg" variant="outline" className="mt-8 border-primary-foreground bg-card text-primary hover:bg-card/90">
              <Link to={SIGNUP}><ShoppingBag className="mr-2 h-5 w-5" aria-hidden="true" />Criar minha loja agora</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t bg-card py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <Logo />
            <p>A plataforma para criar e gerenciar sua loja virtual.</p>
          </div>
          <nav aria-label="Rodapé" className="grid grid-cols-2 gap-x-10 gap-y-2 sm:grid-cols-3">
            <a href="#recursos" className="hover:text-foreground">Recursos</a>
            <a href="#planos" className="hover:text-foreground">Planos</a>
            <a href="#contato" className="hover:text-foreground">Contato</a>
            <Link to="/" className="hover:text-foreground">Ir para a loja</Link>
            <Link to="/termos" className="hover:text-foreground">Termos de uso</Link>
            <Link to="/privacidade" className="hover:text-foreground">Privacidade</Link>
          </nav>
        </div>
        <p className="mx-auto mt-6 max-w-7xl px-4 text-xs text-muted-foreground sm:px-6">© {new Date().getFullYear()} NEOX.</p>
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

  return (
    <section id="contato" className="scroll-mt-16 bg-muted/40 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">Entre em <span className="text-primary">contato</span></h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">Tem dúvidas? Nossa equipe está pronta para ajudar.</p>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <form className="space-y-4 rounded-xl border bg-card p-6" onSubmit={handleSubmit}>
            <h3 className="text-lg font-semibold">Envie sua mensagem</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="contato-nome">Nome completo</Label>
                <Input id="contato-nome" autoComplete="name" value={form.name} onChange={set('name')} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contato-email">E-mail</Label>
                <Input id="contato-email" type="email" autoComplete="email" value={form.email} onChange={set('email')} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contato-telefone">Telefone (opcional)</Label>
              <Input id="contato-telefone" type="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contato-assunto">Assunto</Label>
              <select
                id="contato-assunto"
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm sm:h-10"
                value={form.subject}
                onChange={set('subject')}
                required
              >
                <option value="">Selecione um assunto</option>
                <option value="Quero vender na NEOX">Quero vender na NEOX</option>
                <option value="Dúvida sobre um pedido">Dúvida sobre um pedido</option>
                <option value="Suporte técnico">Suporte técnico</option>
                <option value="Parcerias">Parcerias</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contato-mensagem">Mensagem</Label>
              <Textarea id="contato-mensagem" rows={5} value={form.message} onChange={set('message')} required />
            </div>
            <Button type="submit" className="w-full" disabled={contactMutation.isPending}>
              {contactMutation.isPending ? 'Enviando…' : 'Enviar mensagem'}
            </Button>
          </form>

          <div className="space-y-6">
            <div className="space-y-4 rounded-xl border bg-card p-6">
              <h3 className="text-lg font-semibold">Informações de contato</h3>
              <div className="flex gap-3">
                <Mail className="mt-0.5 h-5 w-5 text-primary" aria-hidden="true" />
                <div>
                  <p className="font-medium">E-mail</p>
                  <a href={`mailto:${contactInfo.email}`} className="text-sm text-primary hover:underline">{contactInfo.email}</a>
                </div>
              </div>
              <div className="flex gap-3">
                <Clock className="mt-0.5 h-5 w-5 text-primary" aria-hidden="true" />
                <div>
                  <p className="font-medium">Horário de atendimento</p>
                  {contactInfo.businessHours.map((h) => (
                    <p key={h.days} className="text-sm text-muted-foreground">{h.days}: {h.hours}</p>
                  ))}
                </div>
              </div>
            </div>

            {faq.length > 0 && (
              <div className="rounded-xl border bg-card p-6">
                <h3 className="mb-4 text-lg font-semibold">Perguntas frequentes</h3>
                <div className="divide-y">
                  {(showAllFaq ? faq : faq.slice(0, 3)).map((item) => (
                    <details key={item.id} className="group py-1">
                      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 font-medium [&::-webkit-details-marker]:hidden">
                        {item.question}
                        <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
                      </summary>
                      <p className="pb-3 text-sm text-muted-foreground">{item.answer}</p>
                    </details>
                  ))}
                </div>
                {faq.length > 3 && (
                  <Button type="button" variant="link" className="mt-2 px-0" onClick={() => setShowAllFaq(!showAllFaq)}>
                    {showAllFaq ? 'Ver menos' : 'Ver todas as perguntas'}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
