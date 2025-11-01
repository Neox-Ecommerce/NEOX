// ============================================
// UTILITÁRIOS DE VALIDAÇÃO E TRANSFORMAÇÃO
// ============================================

/**
 * Garante que um valor seja sempre um array válido
 * Útil para prevenir erros como "X.map is not a function"
 */
export function ensureArray<T>(value: unknown, fallback: T[] = []): T[] {
  if (Array.isArray(value)) {
    return value;
  }
  
  if (value === null || value === undefined) {
    return fallback;
  }
  
  // Se for um objeto com propriedade data que é um array
  if (typeof value === 'object' && value !== null) {
    if ('data' in value && Array.isArray((value as any).data)) {
      return (value as any).data as T[];
    }
    if ('items' in value && Array.isArray((value as any).items)) {
      return (value as any).items as T[];
    }
    if ('results' in value && Array.isArray((value as any).results)) {
      return (value as any).results as T[];
    }
  }
  
  return fallback;
}

/**
 * Valida se um valor é um array não vazio
 */
export function isNonEmptyArray<T>(value: unknown): value is T[] {
  return Array.isArray(value) && value.length > 0;
}

/**
 * Valida e filtra um array, removendo valores inválidos
 */
export function filterValidItems<T>(
  items: unknown[],
  validator: (item: unknown) => item is T
): T[] {
  if (!Array.isArray(items)) {
    return [];
  }
  
  return items.filter(validator);
}

/**
 * Normaliza resposta da API para array
 */
export function normalizeApiArrayResponse<T>(response: unknown): T[] {
  if (Array.isArray(response)) {
    return response;
  }
  
  if (response && typeof response === 'object') {
    const obj = response as Record<string, unknown>;
    
    if (Array.isArray(obj.data)) return obj.data as T[];
    if (Array.isArray(obj.items)) return obj.items as T[];
    if (Array.isArray(obj.results)) return obj.results as T[];
  }
  
  return [];
}

/**
 * Garante que uma string seja válida e não vazia
 */
export function ensureString(value: unknown, fallback: string = ''): string {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }
  return fallback;
}

/**
 * Valida se um objeto tem todas as propriedades necessárias
 */
export function hasRequiredFields<T extends Record<string, unknown>>(
  obj: unknown,
  requiredFields: (keyof T)[]
): obj is T {
  if (!obj || typeof obj !== 'object') {
    return false;
  }
  
  return requiredFields.every(field => field in obj);
}

