// Cliente HTTP único da aplicação: base URL, token JWT e tratamento de erro.
export const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

const TOKEN_KEY = 'neox_token';

export const tokenStore = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type Query = Record<string, string | number | boolean | undefined | null>;

interface Options {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown; // objeto vira JSON; FormData vai como multipart
  query?: Query;
}

function errorMessage(detail: unknown, fallback: string): string {
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map((d) => d?.msg ?? String(d)).join('; ');
  return fallback;
}

export async function api<T = void>(path: string, { method = 'GET', body, query }: Options = {}): Promise<T> {
  const url = new URL(API_URL + path);
  Object.entries(query ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
  });

  const headers: Record<string, string> = {};
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;
  const isForm = body instanceof FormData;
  if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json';

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: isForm ? body : body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError('Não foi possível conectar ao servidor. Verifique se a API está rodando.', 0);
  }

  if (res.status === 401 && token) {
    tokenStore.clear();
    window.dispatchEvent(new Event('neox:unauthorized'));
  }
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new ApiError(errorMessage(data?.detail, `Erro ${res.status}`), res.status);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/** Datas da API vêm como ISO em UTC sem fuso; converte os campos indicados em Date. */
export function toDate(value: string): Date {
  return new Date(/[zZ]|[+-]\d\d:\d\d$/.test(value) ? value : value + 'Z');
}

export function withDates<T extends object>(obj: T, keys: (keyof T)[]): T {
  const out = { ...obj } as Record<string, unknown>;
  keys.forEach((k) => {
    const v = out[k as string];
    if (typeof v === 'string') out[k as string] = toDate(v);
  });
  return out as T;
}

/** Gera um CSV (separador ;, compatível com Excel pt-BR) a partir de linhas já carregadas. */
export function toCsvBlob(rows: (string | number | boolean | null | undefined)[][]): Blob {
  const esc = (v: string | number | boolean | null | undefined) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return new Blob(['\ufeff' + rows.map((r) => r.map(esc).join(';')).join('\n')], { type: 'text/csv;charset=utf-8' });
}
