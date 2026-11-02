// Rótulos e tons de status da área admin (sempre cor + texto).
// Mesmas classes de tom do StatusBadge: sempre cor + texto.
export type Tone = 'neutral' | 'info' | 'warning' | 'success' | 'danger' | 'admin';
export const TONE_CLASS: Record<Tone, string> = {
  neutral: 'bg-muted text-muted-foreground border-border',
  info: 'bg-info-muted text-info border-info/20',
  warning: 'bg-warning-muted text-warning border-warning/20',
  success: 'bg-success-muted text-success border-success/20',
  danger: 'bg-destructive-muted text-destructive border-destructive/20',
  admin: 'bg-admin-muted text-admin border-admin/20',
};

export type LabelMap = Record<string, { label: string; tone: Tone }>;

export const PAYOUT_STATUS: LabelMap = {
  pending: { label: 'Pendente', tone: 'warning' },
  processing: { label: 'Em processamento', tone: 'info' },
  completed: { label: 'Pago', tone: 'success' },
  failed: { label: 'Falhou', tone: 'danger' },
};

export const TICKET_STATUS: LabelMap = {
  open: { label: 'Aberto', tone: 'warning' },
  in_progress: { label: 'Em atendimento', tone: 'info' },
  waiting_response: { label: 'Aguardando usuário', tone: 'neutral' },
  resolved: { label: 'Resolvido', tone: 'success' },
  closed: { label: 'Fechado', tone: 'neutral' },
};

export const TICKET_PRIORITY: LabelMap = {
  low: { label: 'Baixa', tone: 'neutral' },
  medium: { label: 'Média', tone: 'info' },
  high: { label: 'Alta', tone: 'warning' },
  urgent: { label: 'Urgente', tone: 'danger' },
};

export const USER_ROLE: LabelMap = {
  CLIENTE: { label: 'Cliente', tone: 'neutral' },
  EMPREENDEDOR: { label: 'Lojista', tone: 'info' },
  ADMIN: { label: 'Admin', tone: 'admin' },
};

export const VIDEO_STATUS: LabelMap = {
  published: { label: 'Publicado', tone: 'success' },
  processing: { label: 'Processando', tone: 'warning' },
  rejected: { label: 'Rejeitado', tone: 'danger' },
  removed: { label: 'Removido', tone: 'danger' },
};

export const DOCUMENT_STATUS: LabelMap = {
  PENDENTE: { label: 'Pendente', tone: 'warning' },
  VERIFICADO: { label: 'Verificado', tone: 'success' },
  REJEITADO: { label: 'Rejeitado', tone: 'danger' },
};

export const formatDate = (d: Date | null | undefined, withTime = false) =>
  d ? d.toLocaleString('pt-BR', withTime ? { dateStyle: 'short', timeStyle: 'short' } : { dateStyle: 'short' }) : '—';
