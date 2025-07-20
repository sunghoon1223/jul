import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import type { ProductWithCategory } from '@/types/supabase'

export function useProductBySlug(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async (): Promise<ProductWithCategory | null> => {
      console.log('🔍 useProductBySlug - Loading product with slug:', slug)
      
      try {
        // Supabase에서 제품 데이터 로드
        console.log('📡 Fetching product data from Supabase...')
        
        const { data: product, error } = await supabase
          .from('products')
          .select(`
            *,
            category:categories(*)
          `)
          .eq('slug', slug)
          .eq('is_published', true)
          .single()
        
        if (error) {
          if (error.code === 'PGRST116') {
            console.log('❌ Product not found with slug:', slug)
            return null
          }
          throw error
        }
        
        console.log('✅ Product found:', product.name, 'with slug:', product.slug)
        return product as ProductWithCategory
      } catch (error) {
        console.warn('⚠️ Supabase connection failed, using JSON fallback:', error.message)
        
        // Fallback to JSON files if Supabase fails
        try {
          // 제품 데이터 및 카테고리 데이터 로드
          console.log('📡 Fetching product and category data...')
          const [productsResponse, categoriesResponse] = await Promise.all([
            fetch('/data/products.json'),
            fetch('/data/categories.json')
          ])

          if (!productsResponse.ok) {
            throw new Error(`Failed to fetch products.json: ${productsResponse.status} ${productsResponse.statusText}`)
          }
          
          if (!categoriesResponse.ok) {
            throw new Error(`Failed to fetch categories.json: ${categoriesResponse.status} ${categoriesResponse.statusText}`)
          }

          const productsData = await productsResponse.json()
          const categoriesData = await categoriesResponse.json()

          console.log('📦 Products data loaded:', productsData?.length || 0, 'products')
          console.log('📋 Categories data loaded:', categoriesData?.length || 0, 'categories')

          if (!Array.isArray(productsData) || !Array.isArray(categoriesData)) {
            throw new Error('Invalid data format: expected arrays')
          }

          // 카테고리 맵 생성
          const categoryMap = new Map(categoriesData.map((cat: any) => [cat.id, cat]))

          // 제품 데이터 변환
          const products = productsData.map((product: any) => {
            const category = categoryMap.get(product.category_id) || {
              id: product.category_id,
              name: 'Unknown Category',
              slug: 'unknown',
              description: '',
              created_at: new Date().toISOString()
            }

            return {
              id: product.id,
              created_at: product.created_at || new Date().toISOString(),
              name: product.name,
              slug: product.slug,
              description: product.description,
              price: product.price || 0,
              sku: product.sku,
              stock_quantity: product.stock_quantity || 0,
              manufacturer: product.manufacturer || '',
              is_published: true,
              category_id: product.category_id,
              main_image_url: product.main_image_url || '',
              image_urls: product.image_urls || [],
              features: product.features || {},
              category: {
                id: category.id,
                name: category.name,
                slug: category.slug,
                description: category.description,
                created_at: category.created_at,
              }
            }
          })

          console.log('🔍 Searching for product with slug:', slug)
          console.log('📝 First 10 available slugs:', products.slice(0, 10).map((p: any) => p.slug))

          // slug로 제품 찾기
          const product = products.find((p: any) => p.slug === slug)
          
          if (!product) {
            console.error('❌ Product not found with slug:', slug)
            console.log('🔍 Total products searched:', products.length)
            
            // 유사한 slug 찾기 (디버깅용)
            const searchTerm = slug.split('-')[0]
            const similarSlugs = products
              .filter((p: any) => p.slug?.includes(searchTerm) || searchTerm.includes(p.slug?.split('-')[0] || ''))
              .map((p: any) => ({ slug: p.slug, name: p.name }))
              .slice(0, 5)
            
            if (similarSlugs.length > 0) {
              console.log('🔍 Similar slugs found:', similarSlugs)
            }
            
            return null
          }
          
          console.log('✅ Product found:', product.name, 'with slug:', product.slug)

          return product as ProductWithCategory
        } catch (fallbackError) {
          console.error('❌ Error loading product:', fallbackError)
          
          // 더 구체적인 에러 정보 제공
          if (fallbackError instanceof TypeError && fallbackError.message.includes('fetch')) {
            throw new Error('네트워크 연결 문제가 발생했습니다. 잠시 후 다시 시도해주세요.')
          } else if (fallbackError instanceof SyntaxError) {
            throw new Error('데이터 형식 오류가 발생했습니다. 관리자에게 문의해주세요.')
          } else {
            throw new Error(`제품 로딩 중 오류가 발생했습니다: ${fallbackError instanceof Error ? fallbackError.message : '알 수 없는 오류'}`)
          }
        }
      }
    },
    enabled: !!slug,
    retry: 3, // 3번까지 재시도
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // 지수적 백오프
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
    gcTime: 10 * 60 * 1000, // 10분간 메모리에 유지 (cacheTime 대신 gcTime 사용)
  })
}
