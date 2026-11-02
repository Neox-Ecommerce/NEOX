import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Home, Search, ShoppingCart, Store, User } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useCartCount } from '@/hooks/useCartCount';
import { homeFor, loginPath } from '@/lib/navigation';
import { GuestCartService } from '@/services/GuestCartService';
import { BottomNav, Logo } from './shared';

/** Busca do cabeçalho: envia para /buscar?q=… (o catálogo público). */
function HeaderSearch({ className = '' }: { className?: string }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const urlQ = params.get('q') ?? '';
  useEffect(() => setQ(urlQ), [urlQ]); // acompanha a URL (voltar, filtros, links)
  return (
    <form
      role="search"
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        navigate(q.trim() ? `/buscar?q=${encodeURIComponent(q.trim())}` : '/buscar');
      }}
    >
      <label htmlFor="busca-global" className="sr-only">Buscar produtos</label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          id="busca-global"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar produtos e lojas"
          autoComplete="off"
          className="h-11 w-full rounded-full border border-input bg-background pl-10 pr-4 text-sm placeholder:text-muted-foreground sm:h-10"
        />
      </div>
    </form>
  );
}

export function StorefrontLayout() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const cartCount = useCartCount();
  const queryClient = useQueryClient();

  // Sessão de cliente restaurada com carrinho de visitante pendente: leva os itens para a conta.
  useEffect(() => {
    if (user?.role === 'CLIENTE' && GuestCartService.items().length) {
      GuestCartService.mergeIntoApi().then(() => queryClient.invalidateQueries({ queryKey: ['cart'] }));
    }
  }, [user, queryClient]);
  const accountHref = !user ? loginPath(pathname) : user.role === 'CLIENTE' ? '/conta' : homeFor(user.role);
  const accountLabel = !user ? 'Entrar' : user.role === 'CLIENTE' ? 'Minha conta' : 'Meu painel';

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-card focus:px-3 focus:py-2">
        Pular para o conteúdo
      </a>
      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Logo />
          <HeaderSearch className="hidden flex-1 md:block md:max-w-xl" />
          <nav aria-label="Atalhos" className="ml-auto flex items-center gap-1">
            <Link to="/lojas" className="hidden h-10 items-center gap-2 rounded-md px-3 text-sm font-medium text-foreground/80 hover:bg-accent md:flex">
              <Store className="h-4 w-4" aria-hidden="true" /> Lojas
            </Link>
            <Link to={accountHref} className="hidden h-10 items-center gap-2 rounded-md px-3 text-sm font-medium text-foreground/80 hover:bg-accent md:flex">
              <User className="h-4 w-4" aria-hidden="true" /> {accountLabel}
            </Link>
            <Link
              to="/carrinho"
              className="relative flex h-11 w-11 items-center justify-center rounded-md hover:bg-accent sm:h-10 sm:w-10"
              aria-label={`Carrinho, ${cartCount} ${cartCount === 1 ? 'item' : 'itens'}`}
            >
              <ShoppingCart className="h-5 w-5" aria-hidden="true" />
              {cartCount > 0 && (
                <span aria-hidden="true" className="absolute right-0.5 top-0.5 min-w-[1.125rem] rounded-full bg-primary px-1 text-center text-[10px] font-semibold leading-[1.125rem] text-primary-foreground">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
          </nav>
        </div>
        <div className="px-4 pb-3 md:hidden">
          <HeaderSearch />
        </div>
      </header>

      <main id="conteudo" className="flex-1 pb-20 lg:pb-0">
        <Outlet />
      </main>

      <footer className="hidden border-t bg-card lg:block">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} NEOX. Compre de lojas independentes.</p>
          <nav aria-label="Rodapé" className="flex flex-wrap gap-4">
            <Link to="/vender" className="hover:text-foreground">Venda na NEOX</Link>
            <Link to="/termos" className="hover:text-foreground">Termos de uso</Link>
            <Link to="/privacidade" className="hover:text-foreground">Privacidade</Link>
            <Link to="/vender#contato" className="hover:text-foreground">Contato</Link>
          </nav>
        </div>
      </footer>

      <BottomNav
        pathname={pathname}
        items={[
          { name: 'Início', href: '/', icon: Home, end: true },
          { name: 'Buscar', href: '/buscar', icon: Search },
          { name: 'Carrinho', href: '/carrinho', icon: ShoppingCart, badge: cartCount },
          { name: user?.role === 'CLIENTE' ? 'Conta' : 'Entrar', href: accountHref, icon: User },
        ]}
      />
    </div>
  );
}
