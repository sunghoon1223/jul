import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import type { Category } from '@/types/supabase'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<Category[]> => {
      try {
        console.log('🔄 Loading categories from Supabase...')
        
        const { data: categories, error } = await supabase
          .from('categories')
          .select('*')
          .order('name')
        
        if (error) throw error
        
        console.log('✅ Categories loaded from Supabase:', categories?.length || 0)
        return categories || []
      } catch (error) {
        console.warn('⚠️ Supabase connection failed for categories, using JSON fallback:', error.message)
        
        // Fallback to local JSON data
        try {
          const response = await fetch('/data/categories.json')
          if (!response.ok) {
            throw new Error('Failed to fetch local categories')
          }
          const categoriesData = await response.json()
          console.log('✅ Loaded categories from local JSON fallback')
          return categoriesData as Category[]
        } catch (fallbackError) {
          console.error('Failed to load categories from local fallback:', fallbackError)
          return []
        }
      }
    },
  })
}
