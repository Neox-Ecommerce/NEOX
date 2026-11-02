import { useState } from 'react';

const KEY = 'neox_theme';

/** Aplica o tema salvo antes do primeiro render (chamado em main.tsx). Padrão: escuro, como a logo. */
export function applyStoredTheme() {
  try {
    document.documentElement.classList.toggle('dark', localStorage.getItem(KEY) !== 'light');
  } catch {
    /* navegação privada sem storage: fica no tema escuro (classe já está no index.html) */
  }
}

export function useTheme() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem(KEY, next ? 'dark' : 'light');
    } catch {
      /* ignora */
    }
  };
  return { dark, toggle };
}
