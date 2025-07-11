import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductImageGallery } from '@/components/product/ProductImageGallery'
import { useProductBySlug } from '@/hooks/useProductBySlug'
import { ArrowLeft, Package, Building, Hash } from 'lucide-react'

export function ProductDetailPage() {
  const { productSlug } = useParams<{ productSlug: string }>()
  const { data: product, isLoading, error } = useProductBySlug(productSlug!)

  console.log('ProductDetailPage - product:', product);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-16 rounded-md" />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Product Not Found</h1>
          <p className="text-muted-foreground">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  const getStockStatus = () => {
    if (product.stock_quantity === 0) {
      return { text: 'Out of Stock', variant: 'destructive' as const, available: false }
    } else if (product.stock_quantity <= 5) {
      return { text: `Only ${product.stock_quantity} left`, variant: 'secondary' as const, available: true }
    }
    return { text: 'In Stock', variant: 'default' as const, available: true }
  }

  const stockStatus = getStockStatus()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link to="/products" className="hover:text-foreground">
          Products
        </Link>
        <span>/</span>
        <Link to={`/categories/${product.category.slug}`} className="hover:text-foreground">
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </div>

      <Button asChild variant="ghost" className="mb-6">
        <Link to="/products">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Product Images */}
        <div>
          <ProductImageGallery
            mainImage={product.main_image_url}
            additionalImages={product.image_urls}
            productName={product.name}
          />
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{product.category.name}</Badge>
                <Badge variant={stockStatus.variant}>{stockStatus.text}</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-3xl font-bold text-primary">
                {formatPrice(product.price)}
              </p>
            </div>
          </div>

          <Separator />

          {/* Product Information */}
          <div className="space-y-4">
            <div className="grid gap-4 text-sm">
              {product.sku && (
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">SKU:</span>
                  <span className="font-mono">{product.sku}</span>
                </div>
              )}
              
              {product.manufacturer && (
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Manufacturer:</span>
                  <span>{product.manufacturer}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Availability:</span>
                <span className={stockStatus.available ? 'text-green-600' : 'text-red-600'}>
                  {stockStatus.text}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Description</h2>
            <div className="prose prose-sm max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>
          </div>

          {/* Features */}
          {product.features && Object.keys(product.features).length > 0 && (
            <>
              <Separator />
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid gap-2 text-sm">
                    {Object.entries(product.features).map(([key, value]) => (
                      <div key={key} className="grid grid-cols-2 gap-2">
                        <dt className="font-medium text-muted-foreground capitalize">
                          {key.replace(/[_-]/g, ' ')}:
                        </dt>
                        <dd>{String(value)}</dd>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>
            </>
          )}

          {/* Call to Action */}
          <div className="space-y-4">
            <Button 
              size="lg" 
              className="w-full"
              disabled={!stockStatus.available}
            >
              {stockStatus.available ? 'Contact for Quote' : 'Out of Stock'}
            </Button>
            
            <p className="text-sm text-muted-foreground text-center">
              Contact us for pricing and availability information
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}