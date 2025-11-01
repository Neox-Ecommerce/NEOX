// ============================================
// HELPERS PARA CHAMADAS DE API
// ============================================

import { ApiResponse } from '@/types';
import { ensureArray, normalizeApiArrayResponse } from './validation';

/**
 * Extrai dados de uma resposta da API, normalizando para array se necessário
 */
export function extractApiData<T>(response: ApiResponse<T> | T | unknown): T {
  // Se já for do tipo esperado e não for objeto de resposta
  if (response && typeof response === 'object' && !('success' in response)) {
    return response as T;
  }
  
  // Se for ApiResponse
  if (response && typeof response === 'object' && 'data' in response) {
    const apiResponse = response as ApiResponse<T>;
    return apiResponse.data;
  }
  
  return response as T;
}

/**
 * Normaliza resposta da API para array garantindo tipo seguro
 */
export function extractApiArray<T>(response: ApiResponse<T[]> | T[] | unknown): T[] {
  // Se já for array
  if (Array.isArray(response)) {
    return response;
  }
  
  // Se for ApiResponse
  if (response && typeof response === 'object' && 'data' in response) {
    const apiResponse = response as ApiResponse<T[]>;
    return normalizeApiArrayResponse<T>(apiResponse.data);
  }
  
  // Tentar normalizar de qualquer forma
  return normalizeApiArrayResponse<T>(response);
}

/**
 * Cria uma função segura que sempre retorna array
 */
export function createSafeArrayGetter<T>(getter: () => Promise<T[] | unknown>, fallback: T[] = []) {
  return async (): Promise<T[]> => {
    try {
      const result = await getter();
      const array = ensureArray<T>(result, fallback);
      return array.length > 0 ? array : fallback;
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      return fallback;
    }
  };
}

/**
 * Wrapper para serviços que retornam arrays, garantindo sempre um array válido
 */
export async function safeArrayFetch<T>(
  fetchFn: () => Promise<T[] | unknown>,
  fallback: T[] = []
): Promise<T[]> {
  try {
    const result = await fetchFn();
    const array = ensureArray<T>(result, fallback);
    return array.length > 0 ? array : fallback;
  } catch (error) {
    console.error('Erro em safeArrayFetch:', error);
    return fallback;
  }
}

