import { useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, LogOut, MapPin, Package, Pencil, Plus, ShoppingBag, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState, IconButton, PageHeader, QueryState } from '@/components/PageStates';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { cn, formatCurrency } from '@/lib/utils';
import { AddressService, type Address } from '@/services/AddressService';
import { AuthService } from '@/services/AuthService';
import { FeedbackService } from '@/services/FeedbackService';
import { OrdersService, type Order } from '@/services/OrdersService';
import { AddressFields, Field } from './AddressFields';
import { EMPTY_ADDRESS, maskPhone, validateAddress, type AddressValue, type FieldErrors } from './br';

const NAV = [
  { to: '/conta/pedidos', label: 'Pedidos', icon: Package },
  { to: '/conta/dados', label: 'Meus dados', icon: User },
  { to: '/conta/enderecos', label: 'Endereços', icon: MapPin },
];

const dateFmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

export function AccountPage() {
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 md:grid-cols-[13rem,1fr]">
      <nav aria-label="Minha conta" className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
        <ul className="flex gap-1 md:flex-col">
          {NAV.map((n) => {
            const on = pathname.startsWith(n.to);
            return (
              <li key={n.to} className="shrink-0">
                <Link
                  to={n.to}
                  aria-current={on ? 'page' : undefined}
                  className={cn('flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-medium', on ? 'bg-primary-muted text-primary' : 'text-foreground/80 hover:bg-accent')}
                >
                  <n.icon className="h-4 w-4" aria-hidden="true" /> {n.label}
                </Link>
              </li>
            );
          })}
          <li className="shrink-0">
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="flex min-h-11 w-full items-center gap-2 rounded-md px-3 text-sm font-medium text-foreground/80 hover:bg-accent"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" /> Sair
            </button>
          </li>
        </ul>
      </nav>
      <div className="min-w-0">
        <Routes>
          <Route index element={<Navigate to="pedidos" replace />} />
          <Route path="pedidos" element={<OrdersTab />} />
          <Route path="pedidos/:id" element={<OrderDetail />} />
          <Route path="dados" element={<ProfileTab />} />
          <Route path="enderecos" element={<AddressesTab />} />
          <Route path="*" element={<Navigate to="/conta/pedidos" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function OrdersTab() {
  const query = useQuery({ queryKey: ['my-orders'], queryFn: OrdersService.getMyOrders });
  return (
    <>
      <PageHeader title="Meus pedidos" description="Cada loja envia o seu pedido separadamente." />
      <QueryState
        query={query}
        isEmpty={(d) => d.length === 0}
        empty={
          <EmptyState
            icon={ShoppingBag}
            title="Você ainda não fez pedidos"
            action={<Button asChild><Link to="/buscar">Explorar produtos</Link></Button>}
          />
        }
      >
        {(orders) => (
          <ul className="space-y-3">
            {orders.map((o) => (
              <li key={o.id}>
                <Link to={`/conta/pedidos/${o.id}`} className="block rounded-lg border bg-card p-4 hover:shadow-md">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">Pedido {o.code}</span>
                    <span className="font-semibold text-primary">{formatCurrency(o.total)}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {o.lojaNome} · {dateFmt(o.createdAt)} · {o.items.reduce((n, i) => n + i.quantity, 0)} item(ns)
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <StatusBadge kind="order" value={o.status} />
                    <StatusBadge kind="payment" value={o.paymentStatus} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </QueryState>
    </>
  );
}

const TIMELINE = [
  { status: 'pending', label: 'Pedido feito' },
  { status: 'confirmed', label: 'Confirmado' },
  { status: 'processing', label: 'Em separação' },
  { status: 'shipped', label: 'Enviado' },
  { status: 'delivered', label: 'Entregue' },
];

function Timeline({ order }: { order: Order }) {
  if (order.status === 'cancelled' || order.status === 'returned') {
    return <StatusBadge kind="order" value={order.status} />;
  }
  const current = TIMELINE.findIndex((t) => t.status === order.status);
  return (
    <ol className="space-y-3">
      {TIMELINE.map((t, i) => {
        const done = i <= current;
        return (
          <li key={t.status} className="flex items-center gap-3 text-sm" aria-current={i === current ? 'step' : undefined}>
            <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full border', done ? 'border-primary bg-primary text-primary-foreground' : 'bg-muted')}>
              {done && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
            </span>
            <span className={done ? 'font-medium' : 'text-muted-foreground'}>
              {t.label}
              <span className="sr-only">{done ? ' (concluído)' : ' (pendente)'}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function OrderDetail() {
  const { id = '' } = useParams();
  const query = useQuery({ queryKey: ['my-order', id], queryFn: () => OrdersService.getMyOrder(id) });
  return (
    <QueryState query={query}>
      {(o) => (
        <>
          <PageHeader
            title={`Pedido ${o.code}`}
            description={`Feito em ${dateFmt(o.createdAt)}`}
            breadcrumbs={[{ label: 'Meus pedidos', to: '/conta/pedidos' }, { label: o.code }]}
          />
          <div className="mb-4 flex flex-wrap gap-2">
            <StatusBadge kind="order" value={o.status} />
            <StatusBadge kind="payment" value={o.paymentStatus} />
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <section className="rounded-lg border bg-card lg:col-span-2" aria-labelledby="itens">
              <h2 id="itens" className="border-b px-4 py-3 font-semibold">
                Itens de <Link to={`/lojas/${o.lojaId}`} className="text-primary hover:underline">{o.lojaNome}</Link>
              </h2>
              <ul className="divide-y">
                {o.items.map((i) => (
                  <li key={i.id} className="flex items-center gap-3 p-4 text-sm">
                    <span className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                      {i.image ? <img src={i.image} alt="" loading="lazy" className="h-full w-full object-cover" /> : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      {i.productId ? <Link to={`/produto/${i.productId}`} className="hover:underline">{i.productName}</Link> : i.productName}
                      <span className="block text-muted-foreground">{i.quantity} × {formatCurrency(i.price)}</span>
                    </span>
                    <span className="font-medium">{formatCurrency(i.price * i.quantity)}</span>
                  </li>
                ))}
              </ul>
              <dl className="space-y-1 border-t px-4 py-3 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatCurrency(o.subtotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">Frete</dt><dd>{o.shippingCost ? formatCurrency(o.shippingCost) : 'Grátis'}</dd></div>
                {o.discount > 0 && <div className="flex justify-between text-success"><dt>Desconto{o.couponCode ? ` (${o.couponCode})` : ''}</dt><dd>−{formatCurrency(o.discount)}</dd></div>}
                <div className="flex justify-between font-semibold"><dt>Total</dt><dd className="text-primary">{formatCurrency(o.total)}</dd></div>
              </dl>
            </section>
            <div className="space-y-4">
              <section className="rounded-lg border bg-card p-4" aria-labelledby="andamento">
                <h2 id="andamento" className="mb-3 font-semibold">Andamento</h2>
                <Timeline order={o} />
                {o.trackingCode && (
                  <p className="mt-4 text-sm">
                    Código de rastreio: <strong className="select-all break-all">{o.trackingCode}</strong>
                  </p>
                )}
              </section>
              <section className="rounded-lg border bg-card p-4 text-sm" aria-labelledby="entrega">
                <h2 id="entrega" className="mb-2 font-semibold">Entrega</h2>
                <p className="text-muted-foreground">
                  {o.shippingAddress.street}, {o.shippingAddress.number}
                  {o.shippingAddress.complement ? ` – ${o.shippingAddress.complement}` : ''}
                  <br />
                  {o.shippingAddress.neighborhood}, {o.shippingAddress.city}/{o.shippingAddress.state}
                  <br />
                  CEP {o.shippingAddress.zipCode}
                </p>
              </section>
            </div>
          </div>
        </>
      )}
    </QueryState>
  );
}

function ProfileTab() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(maskPhone(user?.phone ?? ''));
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });
  const [pwdError, setPwdError] = useState<FieldErrors>({});

  const profile = useMutation({
    mutationFn: () => updateProfile({ name: name.trim(), email: email.trim(), phone: phone || undefined }),
    onSuccess: () => FeedbackService.success('Dados atualizados'),
    onError: (e: Error) => FeedbackService.error('Não foi possível salvar', e.message),
  });
  const password = useMutation({
    mutationFn: () => AuthService.changePassword(pwd.current, pwd.next),
    onSuccess: () => {
      setPwd({ current: '', next: '', confirm: '' });
      FeedbackService.success('Senha alterada');
    },
    onError: (e: Error) => setPwdError({ current: e.message }),
  });

  return (
    <>
      <PageHeader title="Meus dados" />
      <div className="space-y-6">
        <form
          className="space-y-4 rounded-lg border bg-card p-4"
          onSubmit={(e) => {
            e.preventDefault();
            profile.mutate();
          }}
        >
          <h2 className="text-lg font-semibold">Perfil</h2>
          <Field id="perfil-nome" label="Nome">
            {(p) => <Input {...p} autoComplete="name" required minLength={2} value={name} onChange={(e) => setName(e.target.value)} />}
          </Field>
          <Field id="perfil-email" label="E-mail">
            {(p) => <Input {...p} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />}
          </Field>
          <Field id="perfil-telefone" label="Telefone">
            {(p) => <Input {...p} type="tel" autoComplete="tel-national" value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))} />}
          </Field>
          <Button type="submit" disabled={profile.isPending}>{profile.isPending ? 'Salvando…' : 'Salvar dados'}</Button>
        </form>

        <form
          className="space-y-4 rounded-lg border bg-card p-4"
          onSubmit={(e) => {
            e.preventDefault();
            const errs: FieldErrors = {};
            if (pwd.next.length < 6) errs.next = 'A nova senha precisa ter pelo menos 6 caracteres';
            if (pwd.confirm !== pwd.next) errs.confirm = 'As senhas não conferem';
            setPwdError(errs);
            if (!Object.keys(errs).length) password.mutate();
          }}
        >
          <h2 className="text-lg font-semibold">Alterar senha</h2>
          <Field id="senha-atual" label="Senha atual" error={pwdError.current}>
            {(p) => <Input {...p} type="password" autoComplete="current-password" required value={pwd.current} onChange={(e) => setPwd({ ...pwd, current: e.target.value })} />}
          </Field>
          <Field id="senha-nova" label="Nova senha" error={pwdError.next} hint="Mínimo de 6 caracteres.">
            {(p) => <Input {...p} type="password" autoComplete="new-password" required value={pwd.next} onChange={(e) => setPwd({ ...pwd, next: e.target.value })} />}
          </Field>
          <Field id="senha-confirma" label="Confirme a nova senha" error={pwdError.confirm}>
            {(p) => <Input {...p} type="password" autoComplete="new-password" required value={pwd.confirm} onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })} />}
          </Field>
          <Button type="submit" variant="outline" disabled={password.isPending}>{password.isPending ? 'Alterando…' : 'Alterar senha'}</Button>
        </form>
      </div>
    </>
  );
}

const toValue = (a: Address): AddressValue => ({
  zipCode: a.zipCode, street: a.street, number: a.number, complement: a.complement ?? '',
  neighborhood: a.neighborhood, city: a.city, state: a.state,
});

function AddressForm({ address, onDone }: { address?: Address; onDone: () => void }) {
  const queryClient = useQueryClient();
  const [value, setValue] = useState<AddressValue>(address ? toValue(address) : EMPTY_ADDRESS);
  const [label, setLabel] = useState(address?.label ?? 'Casa');
  const [errors, setErrors] = useState<FieldErrors>({});
  const save = useMutation({
    mutationFn: () => {
      const data = { ...value, complement: value.complement || null, label: label.trim() || 'Casa', isDefault: address?.isDefault ?? false };
      return address ? AddressService.update(address.id, data) : AddressService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-addresses'] });
      FeedbackService.success('Endereço salvo');
      onDone();
    },
    onError: (e: Error) => FeedbackService.error('Não foi possível salvar', e.message),
  });
  return (
    <form
      noValidate
      className="space-y-4 rounded-lg border bg-card p-4"
      onSubmit={(e) => {
        e.preventDefault();
        const errs = validateAddress(value);
        setErrors(errs);
        if (Object.keys(errs).length) document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
        else save.mutate();
      }}
    >
      <h2 className="text-lg font-semibold">{address ? 'Editar endereço' : 'Novo endereço'}</h2>
      <Field id="end-apelido" label="Apelido" hint="Ex.: Casa, Trabalho">
        {(p) => <Input {...p} maxLength={40} value={label} onChange={(e) => setLabel(e.target.value)} />}
      </Field>
      <AddressFields value={value} onChange={setValue} errors={errors} />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={save.isPending}>{save.isPending ? 'Salvando…' : 'Salvar endereço'}</Button>
        <Button type="button" variant="outline" onClick={onDone}>Cancelar</Button>
      </div>
    </form>
  );
}

function AddressesTab() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['my-addresses'], queryFn: AddressService.list });
  const [editing, setEditing] = useState<Address | 'new' | null>(null);
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['my-addresses'] });
  const makeDefault = useMutation({
    mutationFn: (a: Address) => AddressService.update(a.id, { ...a, isDefault: true }),
    onSuccess: refresh,
    onError: (e: Error) => FeedbackService.error(e.message),
  });
  const remove = useMutation({
    mutationFn: (a: Address) => AddressService.remove(a.id),
    onSuccess: () => {
      refresh();
      FeedbackService.success('Endereço excluído');
    },
    onError: (e: Error) => FeedbackService.error(e.message),
  });

  if (editing) {
    return (
      <>
        <PageHeader title="Endereços" />
        <AddressForm address={editing === 'new' ? undefined : editing} onDone={() => setEditing(null)} />
      </>
    );
  }
  return (
    <>
      <PageHeader
        title="Endereços"
        actions={<Button onClick={() => setEditing('new')}><Plus className="mr-2 h-4 w-4" aria-hidden="true" />Novo endereço</Button>}
      />
      <QueryState
        query={query}
        isEmpty={(d) => d.length === 0}
        empty={
          <EmptyState
            icon={MapPin}
            title="Nenhum endereço salvo"
            description="Salve um endereço para finalizar compras mais rápido."
            action={<Button onClick={() => setEditing('new')}>Adicionar endereço</Button>}
          />
        }
      >
        {(list) => (
          <ul className="space-y-3">
            {list.map((a) => (
              <li key={a.id} className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-start">
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-medium">
                    {a.label}
                    {a.isDefault && (
                      <span className="ml-2 rounded-full border border-primary/20 bg-primary-muted px-2 py-0.5 text-xs text-primary">Padrão</span>
                    )}
                  </p>
                  <p className="text-muted-foreground">
                    {a.street}, {a.number}{a.complement ? ` – ${a.complement}` : ''} · {a.neighborhood}, {a.city}/{a.state} · CEP {a.zipCode}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {!a.isDefault && (
                    <Button variant="ghost" size="sm" className="min-h-11" disabled={makeDefault.isPending} onClick={() => makeDefault.mutate(a)}>
                      Tornar padrão
                    </Button>
                  )}
                  <IconButton label={`Editar endereço ${a.label}`} icon={Pencil} className="h-11 w-11" onClick={() => setEditing(a)} />
                  <IconButton
                    label={`Excluir endereço ${a.label}`}
                    icon={Trash2}
                    className="h-11 w-11 text-destructive hover:text-destructive"
                    disabled={remove.isPending}
                    onClick={() => {
                      if (window.confirm(`Excluir o endereço "${a.label}"?`)) remove.mutate(a);
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </QueryState>
    </>
  );
}
