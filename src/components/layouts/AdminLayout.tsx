import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, LifeBuoy, LogOut, Menu, MoreHorizontal, Settings, Store, Users, Video, Wallet,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { IconButton } from '@/components/PageStates';
import { BottomNav, Logo, MobileDrawer, SideNav, ThemeToggle, type NavGroup } from './shared';

const GROUPS: NavGroup[] = [
  { items: [{ name: 'Visão geral', href: '/admin', icon: LayoutDashboard, end: true }] },
  { title: 'Moderação', items: [
    { name: 'Lojas', href: '/admin/lojas', icon: Store },
    { name: 'Vídeos', href: '/admin/videos', icon: Video },
  ] },
  { title: 'Operação', items: [
    { name: 'Repasses', href: '/admin/repasses', icon: Wallet },
    { name: 'Suporte', href: '/admin/suporte', icon: LifeBuoy },
    { name: 'Usuários', href: '/admin/usuarios', icon: Users },
  ] },
  { title: 'Plataforma', items: [{ name: 'Configurações', href: '/admin/configuracoes', icon: Settings }] },
];

/** Layout persistente da área admin. Destaque em índigo para não confundir com o painel do lojista. */
export function AdminLayout() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const sidebar = (onNavigate?: () => void) => (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        <SideNav groups={GROUPS} pathname={pathname} tone="admin" onNavigate={onNavigate} />
      </div>
      <div className="border-t px-3 py-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-foreground sm:min-h-10"
        >
          <LogOut className="h-5 w-5" aria-hidden="true" /> Sair
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/40">
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-card focus:px-3 focus:py-2">
        Pular para o conteúdo
      </a>
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r bg-card lg:flex">
        <div className="flex h-16 items-center gap-2 border-b px-5">
          <Logo to="/admin" />
          <span className="rounded bg-admin px-1.5 py-0.5 text-xs font-semibold text-admin-foreground">Admin</span>
        </div>
        {sidebar()}
      </aside>

      <MobileDrawer open={open} onOpenChange={setOpen} title="Menu do admin">
        {sidebar(() => setOpen(false))}
      </MobileDrawer>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-card/95 px-4 backdrop-blur sm:px-6">
          <IconButton label="Abrir menu" icon={Menu} className="lg:hidden" onClick={() => setOpen(true)} />
          <div className="flex items-center gap-2 lg:hidden">
            <Logo to="/admin" />
            <span className="rounded bg-admin px-1.5 py-0.5 text-xs font-semibold text-admin-foreground">Admin</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <span className="hidden text-sm text-muted-foreground md:inline">{user?.name}</span>
          </div>
        </header>
        <main id="conteudo" className="mx-auto max-w-7xl px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8">
          <Outlet />
        </main>
      </div>

      <BottomNav
        tone="admin"
        pathname={pathname}
        items={[
          { name: 'Início', href: '/admin', icon: LayoutDashboard, end: true },
          { name: 'Lojas', href: '/admin/lojas', icon: Store },
          { name: 'Suporte', href: '/admin/suporte', icon: LifeBuoy },
          { name: 'Mais', href: '#', icon: MoreHorizontal, onClick: () => setOpen(true) },
        ]}
      />
    </div>
  );
}
