import { api } from '@/lib/api';

export type TrackedEvent = 'store_view' | 'product_view' | 'add_to_cart';

const SESSION_KEY = 'neox_session_id';

function source(): string {
  const utm = new URLSearchParams(window.location.search).get('utm_source');
  if (utm) return utm;
  try {
    const host = document.referrer ? new URL(document.referrer).host : '';
    if (host && host !== window.location.host) return host;
  } catch {
    /* referrer inválido */
  }
  return 'direct';
}

export const AnalyticsService = {
  /** Identificador anônimo do navegador, base para contar visitantes e conversão. */
  sessionId(): string {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  },

  /** Fire-and-forget: falha de analytics nunca atrapalha a navegação. */
  track(type: TrackedEvent, storeId: string, productId?: string): void {
    api('/analytics/events', {
      method: 'POST',
      body: { type, storeId, productId, sessionId: AnalyticsService.sessionId(), source: source() },
    }).catch(() => undefined);
  },
};
