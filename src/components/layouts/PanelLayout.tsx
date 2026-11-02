import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle, Archive, BarChart3, CircleUser, HelpCircle, Home, LogOut, Megaphone, Menu,
  MoreHorizontal, Package, ShoppingCart, Store, Users, Video, Wallet,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { IconButton } from '@/components/PageStates';
import { StoreService, type StoreStatus } from '@/services/StoreService';
import { BottomNav, Logo, MobileDrawer, SideNav, ThemeToggle, type NavGroup } from './shared';

const GROUPS: NavGroup[] = [
  { items: [{ name: 'Início', href: '/painel/dashboard', icon: Home }] },
  { title: 'Vendas', items: [
    { name: 'Pedidos', href: '/painel/pedidos', icon: ShoppingCart },
    { name: 'Clientes', href: '/painel/clientes', icon: Users },
  ] },
  { title: 'Catálogo', items: [
    { name: 'Produtos', href: '/painel/produtos', icon: Package },
    { name: 'Estoque', href: '/painel/estoque', icon: Archive },
  ] },
  { title: 'Marketing', items: [
    { name: 'Cupons e campanhas', href: '/painel/marketing', icon: Megaphone },
    { name: 'Trends', href: '/painel/trends', icon: Video },
  ] },
  { title: 'Financeiro', items: [
    { name: 'Financeiro', href: '/painel/financeiro', icon: Wallet },
    { name: 'Relatórios', href: '/painel/relatorios', icon: BarChart3 },
  ] },
  { title: 'Minha loja', items: [{ name: 'Minha loja', href: '/painel/loja', icon: Store }] },
];

const FOOTER: NavGroup[] = [{ items: [
  { name: 'Minha conta', href: '/painel/conta', icon: CircleUser },
  { name: 'Ajuda', href: '/painel/ajuda', icon: HelpCircle },
] }];

const STATUS_BANNER: Partial<Record<StoreStatus, { title: string; text: string; tone: string }>> = {
  PENDENTE: { title: 'Loja em análise', text: 'A equipe NEOX está verificando seus dados. Enquanto isso, a loja não aparece para os clientes.', tone: 'bg-warning-muted text-warning' },
  REJEITADA: { title: 'Loja rejeitada', text: 'Corrija os dados indicados e envie novos documentos em Minha loja.', tone: 'bg-destructive-muted text-destructive' },
  SUSPENSA: { title: 'Loja suspensa', text: 'Sua loja não aparece para os clientes enquanto estiver suspensa.', tone: 'bg-destructive-muted text-destructive' },
};

/** Layout persistente do painel do lojista (menu não remonta ao trocar de página). */
export function PanelLayout() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { data: store } = useQuery({ queryKey: ['store'], queryFn: StoreService.getStore });
  const banner = store ? STATUS_BANNER[store.status] : undefined;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const sidebar = (onNavigate?: () => void) => (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        <SideNav groups={GROUPS} pathname={pathname} onNavigate={onNavigate} />
      </div>
      <div className="border-t">
        <SideNav groups={FOOTER} pathname={pathname} onNavigate={onNavigate} />
        <div className="px-3 pb-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-foreground sm:min-h-10"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" /> Sair
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/40">
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-card focus:px-3 focus:py-2">
        Pular para o conteúdo
      </a>
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r bg-card lg:flex">
        <div className="flex h-16 items-center border-b px-5">
          <Logo to="/painel" />
        </div>
        {sidebar()}
      </aside>

      <MobileDrawer open={open} onOpenChange={setOpen} title="Menu do painel">
        {sidebar(() => setOpen(false))}
      </MobileDrawer>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-card/95 px-4 backdrop-blur sm:px-6">
          <IconButton label="Abrir menu" icon={Menu} className="lg:hidden" onClick={() => setOpen(true)} />
          <div className="lg:hidden"><Logo to="/painel" /></div>
          <div className="ml-auto flex items-center gap-2">
            {store && (
              <Link
                to={store.status === 'APROVADA' ? `/lojas/${store.id}` : '/painel/loja'}
                className="hidden max-w-[16rem] truncate rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-accent sm:block"
                title={store.status === 'APROVADA' ? 'Ver a loja como cliente' : 'Minha loja'}
              >
                {store.nomeFantasia}
              </Link>
            )}
            <ThemeToggle />
            <span className="hidden text-sm text-muted-foreground md:inline">{user?.name}</span>
          </div>
        </header>

        {banner && store && (
          <div role="status" className={`flex items-start gap-3 border-b px-4 py-3 text-sm sm:px-6 ${banner.tone}`}>
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <span className="font-semibold">{banner.title}.</span> {banner.text}
              {store.statusReason && <div className="mt-1">Motivo: {store.statusReason}</div>}
            </div>
            {!pathname.startsWith('/painel/loja') && (
              <Link to="/painel/loja" className="shrink-0 font-medium underline">Minha loja</Link>
            )}
          </div>
        )}

        <main id="conteudo" className="mx-auto max-w-7xl px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8">
          <Outlet />
        </main>
      </div>

      <BottomNav
        pathname={pathname}
        items={[
          { name: 'Início', href: '/painel/dashboard', icon: Home },
          { name: 'Pedidos', href: '/painel/pedidos', icon: ShoppingCart },
          { name: 'Produtos', href: '/painel/produtos', icon: Package },
          { name: 'Mais', href: '#', icon: MoreHorizontal, onClick: () => setOpen(true) },
        ]}
      />
    </div>
  );
}
