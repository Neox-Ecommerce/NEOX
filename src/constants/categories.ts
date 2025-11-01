// ============================================
// CONSTANTES DE CATEGORIAS
// ============================================

export const DEFAULT_CATEGORIES = [
  'Eletrônicos',
  'Informática',
  'Moda e Acessórios',
  'Casa e Jardim',
  'Esportes e Lazer',
  'Livros e Papelaria',
  'Alimentação',
  'Saúde e Beleza',
  'Automotivo',
  'Brinquedos',
  'Móveis',
  'Outros',
] as const;

export type Category = typeof DEFAULT_CATEGORIES[number];

/**
 * Retorna categorias padrão como array mutável
 */
export function getDefaultCategories(): string[] {
  return [...DEFAULT_CATEGORIES];
}

