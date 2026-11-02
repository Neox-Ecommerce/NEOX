import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, Inbox, Loader2, Mail, MessageSquare, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState, PageHeader, QueryState } from '@/components/PageStates';
import { FeedbackService } from '@/services/FeedbackService';
import { AdminService, type TicketPriority, type TicketStatus } from '@/services/AdminService';
import { cn } from '@/lib/utils';
import { Pill } from './shared';
import { TICKET_PRIORITY, TICKET_STATUS, USER_ROLE, formatDate } from './labels';

function TicketPanel({ id, onBack }: { id: string; onBack: () => void }) {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ['admin-ticket', id], queryFn: () => AdminService.getTicket(id) });
  const [reply, setReply] = useState('');

  const onSuccess = (msg: string) => () => {
    qc.invalidateQueries({ queryKey: ['admin-ticket', id] });
    qc.invalidateQueries({ queryKey: ['admin-tickets'] });
    qc.invalidateQueries({ queryKey: ['admin-overview'] });
    FeedbackService.success(msg);
  };
  const onError = (e: Error) => FeedbackService.error(e.message);
  const replyMut = useMutation({
    mutationFn: AdminService.replyTicket,
    onSuccess: () => { setReply(''); onSuccess('Resposta enviada')(); },
    onError,
  });
  const updateMut = useMutation({ mutationFn: AdminService.updateTicket, onSuccess: onSuccess('Chamado atualizado'), onError });

  return (
    <Card className="h-full">
      <CardContent className="p-4 sm:p-6">
        <Button variant="ghost" size="sm" className="mb-2 lg:hidden" onClick={onBack}>
          <ArrowLeft className="mr-1 h-4 w-4" aria-hidden="true" />Voltar para a lista
        </Button>
        <QueryState query={query}>
          {(t) => (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">{t.subject}</h2>
                <p className="text-sm text-muted-foreground">
                  {t.userName} · <a href={`mailto:${t.userEmail}`} className="hover:underline">{t.userEmail}</a> ·{' '}
                  <Pill map={USER_ROLE} value={t.userRole} /> · aberto em {formatDate(t.createdAt, true)}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="ticket-status">Status</Label>
                  <Select value={t.status} onValueChange={(v) => updateMut.mutate({ ticketId: t.id, status: v as TicketStatus })}>
                    <SelectTrigger id="ticket-status" className="h-11 sm:h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(TICKET_STATUS).map(([v, { label }]) => <SelectItem key={v} value={v}>{label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="ticket-priority">Prioridade</Label>
                  <Select value={t.priority} onValueChange={(v) => updateMut.mutate({ ticketId: t.id, priority: v as TicketPriority })}>
                    <SelectTrigger id="ticket-priority" className="h-11 sm:h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(TICKET_PRIORITY).map(([v, { label }]) => <SelectItem key={v} value={v}>{label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <ol className="max-h-[50vh] space-y-3 overflow-y-auto rounded-md bg-muted/40 p-3" aria-label="Conversa">
                {t.messages.map((m) => (
                  <li key={m.id} className={cn('max-w-[85%] rounded-lg p-3 text-sm', m.isFromSupport ? 'ml-auto bg-admin-muted' : 'bg-card border')}>
                    <p className="mb-1 text-xs font-medium text-muted-foreground">
                      {m.isFromSupport ? 'Suporte NEOX' : t.userName} · {formatDate(m.createdAt, true)}
                    </p>
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  </li>
                ))}
              </ol>

              {t.status === 'closed' ? (
                <p className="text-sm text-muted-foreground">Chamado fechado. Reabra mudando o status para responder.</p>
              ) : (
                <form
                  className="space-y-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (reply.trim()) replyMut.mutate({ ticketId: t.id, content: reply.trim() });
                  }}
                >
                  <Label htmlFor="ticket-reply">Responder</Label>
                  <Textarea id="ticket-reply" rows={4} maxLength={5000} value={reply} onChange={(e) => setReply(e.target.value)}
                    placeholder="Escreva a resposta para o usuário" />
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">Ao responder, o status vira “Aguardando usuário”.</p>
                    <Button type="submit" disabled={!reply.trim() || replyMut.isPending}>
                      {replyMut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}Enviar resposta
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}
        </QueryState>
      </CardContent>
    </Card>
  );
}

function Tickets() {
  const [params, setParams] = useSearchParams();
  const status = params.get('status') ?? 'ativos';
  const q = params.get('q') ?? '';
  const selected = params.get('id');
  const query = useQuery({
    queryKey: ['admin-tickets', status, q],
    queryFn: () => AdminService.getTickets({ status: status === 'ativos' || status === 'todos' ? undefined : (status as TicketStatus), q }),
  });

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <div className={cn('space-y-3', selected && 'hidden lg:block')}>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input type="search" aria-label="Buscar chamados" placeholder="Assunto, nome ou e-mail" value={q}
              onChange={(e) => setParam('q', e.target.value)} className="h-11 rounded-full pl-9" />
          </div>
          <Select value={status} onValueChange={(v) => setParam('status', v)}>
            <SelectTrigger aria-label="Filtrar por status" className="h-11 sm:w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ativos">Em aberto</SelectItem>
              <SelectItem value="todos">Todos</SelectItem>
              {Object.entries(TICKET_STATUS).map(([v, { label }]) => <SelectItem key={v} value={v}>{label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <QueryState
          query={query}
          isEmpty={(d) => d.length === 0}
          empty={<EmptyState icon={MessageSquare} title="Nenhum chamado" description="Nada encontrado com estes filtros." />}
        >
          {(tickets) => {
            // "Em aberto" = tudo que não foi resolvido nem fechado
            const rows = status === 'ativos' ? tickets.filter((t) => t.status !== 'resolved' && t.status !== 'closed') : tickets;
            if (rows.length === 0) return <EmptyState icon={MessageSquare} title="Nenhum chamado em aberto" description="Suporte em dia." />;
            return (
              <ul className="space-y-2">
                {rows.map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => setParam('id', t.id)}
                      aria-current={selected === t.id ? 'true' : undefined}
                      className={cn('w-full rounded-lg border bg-card p-3 text-left hover:border-admin/40',
                        selected === t.id && 'border-admin bg-admin-muted/40')}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="line-clamp-1 font-medium">{t.subject}</span>
                        <Pill map={TICKET_STATUS} value={t.status} />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t.userName} ({USER_ROLE[t.userRole]?.label ?? t.userRole}) · {t.messageCount} msg · {formatDate(t.updatedAt, true)}
                      </p>
                      <Pill map={TICKET_PRIORITY} value={t.priority} className="mt-2" />
                    </button>
                  </li>
                ))}
              </ul>
            );
          }}
        </QueryState>
      </div>
      <div className={cn(!selected && 'hidden lg:block')}>
        {selected
          ? <TicketPanel key={selected} id={selected} onBack={() => setParam('id', null)} />
          : <Card><EmptyState icon={Inbox} title="Selecione um chamado" description="A conversa aparece aqui." /></Card>}
      </div>
    </div>
  );
}

function ContactMessages() {
  const query = useQuery({ queryKey: ['admin-contact-messages'], queryFn: AdminService.getContactMessages });
  return (
    <QueryState query={query} isEmpty={(d) => d.length === 0}
      empty={<EmptyState icon={Mail} title="Nenhuma mensagem de contato" description="Mensagens do formulário público aparecem aqui." />}>
      {(msgs) => (
        <ul className="space-y-3">
          {msgs.map((m) => (
            <li key={m.id} className="rounded-lg border bg-card p-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <p className="font-medium">{m.subject}</p>
                <span className="text-xs text-muted-foreground">{formatDate(m.createdAt, true)}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {m.name} · <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`} className="hover:underline">{m.email}</a>
                {m.phone && <> · <a href={`tel:${m.phone}`} className="hover:underline">{m.phone}</a></>}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm">{m.message}</p>
              <Button asChild variant="outline" size="sm" className="mt-3">
                <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`}>
                  <Mail className="mr-2 h-4 w-4" aria-hidden="true" />Responder por e-mail
                </a>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </QueryState>
  );
}

export function AdminSupportPage() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('aba') ?? 'chamados';
  return (
    <div>
      <PageHeader title="Suporte" description="Chamados de clientes e lojistas e mensagens do formulário de contato." />
      <Tabs value={tab} onValueChange={(v) => setParams({ aba: v }, { replace: true })}>
        <TabsList className="mb-4">
          <TabsTrigger value="chamados" className="min-h-10">Chamados</TabsTrigger>
          <TabsTrigger value="contato" className="min-h-10">Mensagens de contato</TabsTrigger>
        </TabsList>
        <TabsContent value="chamados"><Tickets /></TabsContent>
        <TabsContent value="contato"><ContactMessages /></TabsContent>
      </Tabs>
    </div>
  );
}
