import { useParams, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ProductGrid } from '@/components/product/ProductGrid'
import { CategorySidebar } from '@/components/product/CategorySidebar'
import { useProducts } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function ProductListPage() {
  const { categorySlug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [currentPage, setCurrentPage] = useState(1)
  
  const searchTerm = searchParams.get('search') || undefined
  const limit = 12

  const { data: productsResponse, isLoading, error } = useProducts({
    categorySlug,
    searchTerm,
    page: currentPage,
    limit
  })

  console.log('ProductListPage - productsResponse:', productsResponse);

  const { data: categories } = useCategories()
  console.log('ProductListPage - categories:', categories);

  const currentCategory = categories?.find(cat => cat.slug === categorySlug)

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

          {/* Load More Alternative (commented out for now) */}
          {/* {hasMore && (
            <div className="text-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Load More Products'}
              </Button>
            </div>
          )} */}
        </main>
      </div>
    </div>
  )
}