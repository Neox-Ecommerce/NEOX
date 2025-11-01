// ============================================
// HOOK CUSTOMIZADO PARA CATEGORIAS
// ============================================

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { ProductService } from '@/services/ProductService';
import { ensureArray } from '@/utils/validation';
import { getDefaultCategories } from '@/constants/categories';

interface UseCategoriesOptions {
  lojaId?: number | string | null;
  enabled?: boolean;
}

/**
 * Hook seguro para buscar categorias
 * SEMPRE retorna um array válido, nunca undefined ou null
 */
export function useCategories(options: UseCategoriesOptions = {}) {
  const { lojaId, enabled = true } = options;
  
  const {
    data: categoriasData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['categories', lojaId],
    queryFn: async () => {
      try {
        const result = await ProductService.getCategories(lojaId);
        // ProductService.getCategories SEMPRE retorna array válido
        // Mas garantimos aqui também por segurança
        const array = ensureArray<string>(result, getDefaultCategories());
        return array.length > 0 ? array : getDefaultCategories();
      } catch (err) {
        console.error('Erro ao buscar categorias:', err);
        return getDefaultCategories();
      }
    },
    enabled: enabled && !!lojaId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1,
    // Sempre começar com categorias padrão
    initialData: getDefaultCategories(),
    // Em caso de erro, usar categorias padrão
    onError: () => {
      console.warn('Erro na query de categorias, usando padrão');
    },
  });
  
  // Garantir que sempre seja um array válido com múltiplas camadas de proteção
  const categories = useMemo(() => {
    try {
      // Se houver erro, usar padrão
      if (error) {
        return getDefaultCategories();
      }
      
      // Se não tiver dados, usar padrão
      if (!categoriasData) {
        return getDefaultCategories();
      }
      
      // Garantir que seja array
      const array = ensureArray<string>(categoriasData, getDefaultCategories());
      
      // Se array vazio, usar padrão
      if (array.length === 0) {
        return getDefaultCategories();
      }
      
      // Validar que todos são strings válidas
      const validCategories = array.filter(
        (cat): cat is string => typeof cat === 'string' && cat.trim().length > 0
      );
      
      return validCategories.length > 0 ? validCategories : getDefaultCategories();
    } catch (err) {
      console.error('Erro ao processar categorias:', err);
      return getDefaultCategories();
    }
  }, [categoriasData, error]);
  
  return {
    categories, // SEMPRE um array válido de strings
    isLoading,
    error,
    refetch,
  };
}

