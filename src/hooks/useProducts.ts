// ============================================
// HOOK CUSTOMIZADO PARA PRODUTOS
// ============================================

import { useQuery } from '@tanstack/react-query';
import { ProductService, Product } from '@/services/ProductService';
import { ensureArray } from '@/utils/validation';

interface UseProductsOptions {
  lojaId?: number | string | null;
  enabled?: boolean;
}

/**
 * Hook seguro para buscar produtos
 * SEMPRE retorna um array válido
 */
export function useProducts(options: UseProductsOptions = {}) {
  const { lojaId, enabled = true } = options;
  
  const {
    data: productsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['products', lojaId],
    queryFn: async () => {
      try {
        const result = await ProductService.getProducts(lojaId);
        // ProductService.getProducts sempre retorna array, mas garantimos aqui também
        return ensureArray<Product>(result, []);
      } catch (err) {
        console.error('Erro ao buscar produtos:', err);
        return [];
      }
    },
    enabled: enabled && !!lojaId,
    staleTime: 2 * 60 * 1000, // 2 minutos
    retry: 1,
    initialData: [], // Sempre começar com array vazio
  });
  
  // Garantir que sempre seja um array válido
  const products = ensureArray<Product>(productsData, []);
  
  // Calcular estatísticas
  const stats = ProductService.calculateStats(products);
  const categoryCounts = ProductService.calculateCategoryCounts(products);
  
  return {
    products, // SEMPRE um array válido (pode estar vazio)
    stats,
    categoryCounts,
    isLoading,
    error,
    refetch,
  };
}

