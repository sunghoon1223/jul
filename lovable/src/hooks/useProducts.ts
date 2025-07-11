import { useQuery } from '@tanstack/react-query'
import type { ProductWithCategory, ProductsResponse } from '@/types/supabase'
import productsData from '@/data/products.json'

interface UseProductsParams {
  categorySlug?: string
  searchTerm?: string
  page?: number
  limit?: number
}

export function useProducts({ 
  categorySlug, 
  searchTerm, 
  page = 1, 
  limit = 12 
}: UseProductsParams = {}) {
  return useQuery({
    queryKey: ['products', { categorySlug, searchTerm, page, limit }],
    queryFn: async (): Promise<ProductsResponse> => {
      let filteredProducts: ProductWithCategory[] = productsData as ProductWithCategory[];

      // Filter by category if provided
      if (categorySlug) {
        filteredProducts = filteredProducts.filter(p => p.category.slug === categorySlug);
      }

      // Search if term provided
      if (searchTerm && searchTerm.trim()) {
        const lowercasedTerm = searchTerm.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(lowercasedTerm) ||
            (p.description && p.description.toLowerCase().includes(lowercasedTerm)) ||
            (p.sku && p.sku.toLowerCase().includes(lowercasedTerm))
        );
      }

      const count = filteredProducts.length;

      // Pagination
      const from = (page - 1) * limit
      const to = from + limit
      
      const paginatedProducts = filteredProducts.slice(from, to);

      return {
        data: paginatedProducts,
        count: count,
        hasMore: count > page * limit
      }
    },
  })
}
