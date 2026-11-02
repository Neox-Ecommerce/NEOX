import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Moon, Sun, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { IconButton } from '@/components/PageStates';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

export function Logo({ to = '/', className }: { to?: string; className?: string }) {
  return (
    <Link to={to} className={cn('flex items-center gap-2 rounded-md', className)} aria-label="NEOX, página inicial">
      <img src="/logo.png" alt="" width={36} height={36} className="h-9 w-9" />
      <span className="text-lg font-bold tracking-tight text-foreground">NEOX</span>
    </Link>
  );
}

export function ThemeToggle() {
  const { dark, toggle } = useTheme();
  return <IconButton label={dark ? 'Usar tema claro' : 'Usar tema escuro'} icon={dark ? Sun : Moon} onClick={toggle} />;
}

/** Menu lateral do celular: prende o foco, fecha com Esc e ao tocar fora (Radix Dialog). */
export function MobileDrawer({
  open,
  onOpenChange,
  title,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/50" />
        <DialogPrimitive.Content className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-card shadow-xl focus:outline-none">
          <div className="flex h-16 items-center justify-between border-b px-4">
            <DialogPrimitive.Title className="font-semibold">{title}</DialogPrimitive.Title>
            <DialogPrimitive.Close asChild>
              <IconButton label="Fechar menu" icon={X} />
            </DialogPrimitive.Close>
          </div>
          <DialogPrimitive.Description className="sr-only">Navegação principal</DialogPrimitive.Description>
          <div className="flex-1 overflow-y-auto">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
}

export interface NavGroup {
  title?: string;
  items: NavItem[];
}

export function isActivePath(pathname: string, href: string, end = false) {
  return end ? pathname === href : pathname === href || pathname.startsWith(href + '/');
}

/** Lista de navegação do painel/admin. `tone` escolhe a cor de destaque da área. */
export function SideNav({
  groups,
  pathname,
  tone = 'primary',
  onNavigate,
}: {
  groups: NavGroup[];
  pathname: string;
  tone?: 'primary' | 'admin';
  onNavigate?: () => void;
}) {
  const active = tone === 'admin' ? 'bg-admin-muted text-admin' : 'bg-primary-muted text-primary';
  return (
    <nav aria-label="Navegação principal" className="space-y-6 px-3 py-4">
      {groups.map((g, i) => (
        <div key={g.title ?? i}>
          {g.title && (
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{g.title}</p>
          )}
          <ul className="space-y-1">
            {g.items.map((item) => {
              const on = isActivePath(pathname, item.href, item.end);
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    onClick={onNavigate}
                    aria-current={on ? 'page' : undefined}
                    className={cn(
                      'flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors sm:min-h-10',
                      on ? active : 'text-foreground/80 hover:bg-accent hover:text-foreground',
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/** Barra inferior fixa do celular (até 5 destinos). */
export function BottomNav({
  items,
  pathname,
  tone = 'primary',
}: {
  items: (NavItem & { badge?: number; onClick?: () => void })[];
  pathname: string;
  tone?: 'primary' | 'admin';
}) {
  const activeText = tone === 'admin' ? 'text-admin' : 'text-primary';
  return (
    <nav
      aria-label="Navegação rápida"
      className="fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="grid" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((item) => {
          const on = !item.onClick && isActivePath(pathname, item.href, item.end);
          const content = (
            <>
              <span className="relative">
                <item.icon className="h-5 w-5" aria-hidden="true" />
                {!!item.badge && (
                  <span className="absolute -right-2.5 -top-1.5 min-w-[1.125rem] rounded-full bg-primary px-1 text-center text-[10px] font-semibold leading-[1.125rem] text-primary-foreground">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </span>
              <span>{item.name}</span>
            </>
          );
          const cls = cn('flex h-14 w-full flex-col items-center justify-center gap-0.5 text-xs font-medium', on ? activeText : 'text-muted-foreground');
          return (
            <li key={item.name}>
              {item.onClick ? (
                <button type="button" onClick={item.onClick} className={cls}>{content}</button>
              ) : (
                <Link to={item.href} aria-current={on ? 'page' : undefined} className={cls}>{content}</Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
