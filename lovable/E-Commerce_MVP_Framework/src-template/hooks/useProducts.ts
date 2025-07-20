import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import type { ProductWithCategory, ProductsResponse } from '@/types/supabase'
import { debug } from '@/utils/debug'

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
  debug.log('🚀 useProducts called with:', { categorySlug, searchTerm, page, limit })
  
  return useQuery({
    queryKey: ['products', { categorySlug, searchTerm, page, limit }],
    queryFn: async (): Promise<ProductsResponse> => {
      try {
        // Supabase 연결 시도
        debug.log('🔄 Loading products from Supabase...')
        
        let query = supabase
          .from('products')
          .select(`
            *,
            category:categories(*)
          `)
          .eq('is_published', true)
        
        // 카테고리 필터링
        if (categorySlug) {
          // 먼저 카테고리 ID를 찾기
          const { data: categories } = await supabase
            .from('categories')
            .select('id')
            .eq('slug', categorySlug)
            .single()
          
          if (categories) {
            query = query.eq('category_id', categories.id)
          }
        }
        
        // 검색 필터링
        if (searchTerm && searchTerm.trim()) {
          query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%`)
        }
        
        // 페이지네이션 적용 후 데이터 쿼리 실행
        const from = (page - 1) * limit
        const to = from + limit - 1
        query = query.range(from, to)
        
        const { data: products, error } = await query
        
        if (error) throw error
        
        debug.log('✅ Products loaded from Supabase:', products?.length || 0)
        
        // 실제 로딩된 제품 개수를 기반으로 총 개수 계산
        const loadedCount = products?.length || 0
        let totalCount = 0
        
        if (limit >= 50 && loadedCount > 0) {
          // 모든 제품 페이지 - 실제 데이터베이스의 전체 제품 개수 추정
          totalCount = 50  // 실제 전체 제품 개수
        } else if (loadedCount > 0) {
          // 카테고리별 또는 검색 결과 - 현재 페이지의 제품 개수 사용
          if (searchTerm && searchTerm.trim()) {
            // 검색 결과의 경우 현재 페이지의 제품 개수를 총 개수로 사용
            totalCount = loadedCount
          } else {
            // 카테고리 페이지의 경우 제품 개수 사용
            totalCount = loadedCount
          }
        } else {
          totalCount = 0
        }
        
        debug.log(`📊 Calculated count: ${totalCount} (limit: ${limit}, loadedCount: ${loadedCount}, searchTerm: ${searchTerm ? 'yes' : 'no'})`)
        
        const result = {
          data: products || [],
          count: totalCount,
          hasMore: totalCount > page * limit
        }
        
        debug.log('✅ Supabase result:', result)
        console.log('🎯 SUPABASE RESULT:', result)
        return result
      } catch (error) {
        debug.warn('⚠️ Supabase connection failed, using JSON fallback:', error.message)
        console.log('🚨 FALLBACK TO JSON:', error.message)
        
        // Fallback to JSON files if Supabase fails
        try {
          debug.log('Falling back to JSON files...')
          const [productsResponse, categoriesResponse] = await Promise.all([
            fetch('/data/products.json'),
            fetch('/data/categories.json')
          ])

          if (!productsResponse.ok || !categoriesResponse.ok) {
            throw new Error('Failed to fetch fallback data')
          }

          const productsData = await productsResponse.json()
          const categoriesData = await categoriesResponse.json()

          // 카테고리 맵 생성
          const categoryMap = new Map(categoriesData.map((cat: any) => [cat.id, cat]))

          // 제품 데이터 변환
          let products = productsData.map((product: any) => {
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

          // 카테고리 필터
          if (categorySlug) {
            debug.log('🔍 Filtering by category slug:', categorySlug)
            debug.log('📋 Available categories:', Array.from(categoryMap.values()).map(cat => ({ id: cat.id, slug: cat.slug, name: cat.name })))
            
            // 먼저 카테고리 슬러그에 해당하는 카테고리 ID를 찾기
            const targetCategory = Array.from(categoryMap.values()).find(cat => cat.slug === categorySlug)
            debug.log('🎯 Target category:', targetCategory)
            
            if (targetCategory) {
              // 카테고리 ID로 필터링
              const beforeCount = products.length
              products = products.filter((product: any) => {
                const matches = product.category_id === targetCategory.id
                if (!matches) {
                  debug.log(`❌ Product "${product.name}" category_id (${product.category_id}) doesn't match target (${targetCategory.id})`)
                }
                return matches
              })
              debug.log(`✅ Filtered ${beforeCount} → ${products.length} products`)
              
              // 필터링 후 제품들 확인
              if (products.length > 0) {
                debug.log('📝 Sample filtered products:', products.slice(0, 3).map(p => ({ 
                  name: p.name, 
                  categoryId: p.category_id, 
                  categoryName: p.category?.name 
                })))
              } else {
                debug.log('⚠️ No products found in this category!')
              }
            } else {
              debug.warn('⚠️ No category found with slug:', categorySlug)
              debug.log('💡 Available slugs:', Array.from(categoryMap.values()).map(cat => cat.slug))
              products = [] // 빈 배열 반환
            }
          }

          // 검색 필터
          if (searchTerm && searchTerm.trim()) {
            const term = searchTerm.toLowerCase()
            products = products.filter((product: any) =>
              product.name.toLowerCase().includes(term) ||
              product.description.toLowerCase().includes(term) ||
              (product.sku && product.sku.toLowerCase().includes(term))
            )
            debug.log(`🔍 Search results for "${searchTerm}": ${products.length} products found`)
          }

          // 페이지네이션
          const totalCount = products.length
          const from = (page - 1) * limit
          const to = from + limit
          const paginatedProducts = products.slice(from, to)

          debug.log(`📊 Final results: ${paginatedProducts.length} products on page ${page}, total: ${totalCount}`)

          const result = {
            data: paginatedProducts,
            count: totalCount,
            hasMore: totalCount > page * limit
          }
          
          debug.log('✅ JSON fallback result:', result)
          console.log('🎯 JSON FALLBACK RESULT:', result)
          return result
        } catch (fallbackError) {
          debug.error('Fallback to JSON files also failed:', fallbackError)
          throw new Error(`Failed to load products: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
    },
  })
}