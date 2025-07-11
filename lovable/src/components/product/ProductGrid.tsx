import { ProductCard } from '@/components/common/ProductCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import type { ProductWithCategory } from '@/types/supabase'

interface ProductGridProps {
  products: ProductWithCategory[]
  isLoading: boolean
  error?: Error | null
}

export function ProductGrid({ products, isLoading, error }: ProductGridProps) {
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error loading products: {error.message}</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <AspectRatio ratio={1} className="mb-4">
                <Skeleton className="w-full h-full rounded-md" />
              </AspectRatio>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-12" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">No products found</h3>
          <p>Try adjusting your search criteria or browse our categories.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}