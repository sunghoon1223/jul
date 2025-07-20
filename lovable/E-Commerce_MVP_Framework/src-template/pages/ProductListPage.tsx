import { useParams, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ProductGrid } from '@/components/product/ProductGrid'
import { CategorySidebar } from '@/components/product/CategorySidebar'
import { useProducts } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { debug } from '@/utils/debug'

export function ProductListPage() {
  const { categorySlug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [currentPage, setCurrentPage] = useState(1)
  
  const searchTerm = searchParams.get('search') || undefined
  const limit = categorySlug || searchTerm ? 12 : 50 // 모든 제품 페이지에서는 50개씩 표시

  const { data: productsResponse, isLoading, error } = useProducts({
    categorySlug,
    searchTerm,
    page: currentPage,
    limit
  })

  const { data: categories } = useCategories()
  const currentCategory = categories?.find(cat => cat.slug === categorySlug)
  
  // 디버깅을 위한 로그
  debug.log('🔍 ProductListPage - categorySlug:', categorySlug)
  debug.log('📋 Categories:', categories?.map(c => ({ id: c.id, name: c.name, slug: c.slug })))
  debug.log('🎯 Current category:', currentCategory)
  debug.log('📦 Products response:', productsResponse)
  if (error) debug.error('❌ Error:', error)
  
  // 추가 디버깅 정보
  if (productsResponse) {
    const debugProducts = productsResponse?.data || []
    const debugTotalCount = productsResponse?.count || 0
    debug.log('📊 Products count:', debugProducts?.length)
    debug.log('⏳ Loading state:', isLoading)
    debug.log('🔢 Total count:', debugTotalCount)
    debug.log('📋 Full response:', productsResponse)
  }

  // 카테고리 매칭 디버깅
  if (categorySlug && categories) {
    debug.log('🔍 Searching for category with slug:', categorySlug)
    debug.log('📋 Available category slugs:', categories.map(c => c.slug))
    
    const matchedCategory = categories.find(cat => cat.slug === categorySlug)
    debug.log('🎯 Matched category:', matchedCategory)
    
    if (!matchedCategory) {
      debug.warn('⚠️ No category found for slug:', categorySlug)
      debug.log('💡 Did you mean one of these?', categories.map(c => c.slug).slice(0, 5))
    }
  }

  const products = productsResponse?.data || []
  const totalCount = productsResponse?.count || 0
  const hasMore = productsResponse?.hasMore || false
  const totalPages = Math.ceil(totalCount / limit)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Get page title
  const getPageTitle = () => {
    if (searchTerm) {
      return `"${searchTerm}" 검색 결과`
    }
    if (currentCategory) {
      return currentCategory.name
    }
    return '모든 제품'
  }

  const getPageDescription = () => {
    if (searchTerm) {
      return `"${searchTerm}"에 대한 ${totalCount}개의 제품을 찾았습니다`
    }
    if (currentCategory?.description) {
      return currentCategory.description
    }
    return `총 ${totalCount}개의 제품을 만나보세요`
  }

  // 에러 처리
  if (error) {
    debug.error('❌ ProductListPage error:', error)
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-red-600 mb-4">데이터를 불러오는 중 오류가 발생했습니다</h1>
          <p className="text-muted-foreground mb-4">
            {error.message || '알 수 없는 오류가 발생했습니다.'}
          </p>
          {categorySlug && (
            <p className="text-sm text-muted-foreground mb-4">
              카테고리: {categorySlug}
            </p>
          )}
          <Button onClick={() => window.location.reload()} className="mr-4">
            다시 시도
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    )
  }

  // 로딩 상태 - 더 명확한 표시
  if (isLoading) {
    debug.log('⏳ ProductListPage loading...')
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {categorySlug ? `${categorySlug} 카테고리` : '제품'} 로딩 중...
          </p>
        </div>
      </div>
    )
  }

  // 카테고리 슬러그가 있지만 카테고리를 찾을 수 없는 경우
  if (categorySlug && categories && !currentCategory) {
    debug.error('❌ Invalid category slug:', categorySlug)
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-red-600 mb-4">카테고리를 찾을 수 없습니다</h1>
          <p className="text-muted-foreground mb-4">
            요청하신 카테고리 "{categorySlug}"를 찾을 수 없습니다.
          </p>
          <Button variant="outline" onClick={() => window.location.href = '/products'}>
            모든 제품 보기
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
        {/* Sidebar */}
        <aside className="hidden lg:block">
          <CategorySidebar />
        </aside>

        {/* Main Content */}
        <main className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{getPageTitle()}</h1>
            <p className="text-muted-foreground">{getPageDescription()}</p>
            
            {totalCount > 0 && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>
                  총 {totalCount}개 제품 중 {((currentPage - 1) * limit) + 1}-{Math.min(currentPage * limit, totalCount)}번째 제품
                </span>
                {totalPages > 1 && (
                  <span>
                    {currentPage} / {totalPages} 페이지
                  </span>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Products Grid */}
          <ProductGrid 
            products={products} 
            isLoading={isLoading}
            error={error}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <div className="flex gap-1">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum: number
                  
                  if (totalPages <= 7) {
                    pageNum = i + 1
                  } else if (currentPage <= 4) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 3) {
                    pageNum = totalPages - 6 + i
                  } else {
                    pageNum = currentPage - 3 + i
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="w-10"
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}