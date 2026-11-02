/** Só aceita caminhos internos ("/x"), evitando redirecionamento aberto via ?next=//site-malicioso. */
export function safeNext(next: string | null | undefined, fallback: string): string {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : fallback;
}

/** Página de login com retorno para onde o usuário estava. */
export function loginPath(next: string, area: 'loja' | 'admin' = 'loja'): string {
  return `${area === 'admin' ? '/admin/login' : '/entrar'}?next=${encodeURIComponent(next)}`;
}

/** Destino padrão depois do login, por papel. */
export function homeFor(role: string | undefined): string {
  if (role === 'ADMIN') return '/admin';
  if (role === 'EMPREENDEDOR') return '/painel';
  return '/';
}
