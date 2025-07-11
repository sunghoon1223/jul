import { useQuery } from '@tanstack/react-query'
import type { ProductWithCategory } from '@/types/supabase'
import productsData from '@/data/products.json'

export function useProductBySlug(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async (): Promise<ProductWithCategory | null> => {
      console.log('useProductBySlug - searching for slug:', slug);
      console.log('useProductBySlug - productsData first item slug:', (productsData as ProductWithCategory[])[0]?.slug);
      const product = (productsData as ProductWithCategory[]).find(p => p.slug === slug);
      console.log('useProductBySlug - found product:', product);
      return product || null;
    },
    enabled: !!slug,
  })
}
