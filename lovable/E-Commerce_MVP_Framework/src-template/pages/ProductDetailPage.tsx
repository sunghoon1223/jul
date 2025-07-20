import { useState, useEffect } from 'react'
import { useParams, Navigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ShoppingCart, Minus, Plus, Truck, RotateCcw, Shield, Star, Share2, MessageCircle, RefreshCw, AlertCircle, Home } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { useCart } from '@/hooks/useCart'
import { useProductBySlug } from '@/hooks/useProductBySlug'
import { InquiryModal } from '@/components/product/InquiryModal'
import { createSupabaseImageUrl } from '@/lib/supabase-storage'
import type { ProductWithCategory } from '@/types/supabase'

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [quantity, setQuantity] = useState(1)
  const [relatedProducts, setRelatedProducts] = useState<ProductWithCategory[]>([])
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false)
  const [relatedProductsLoading, setRelatedProductsLoading] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const { data: product, isLoading, error, refetch } = useProductBySlug(slug || '')
  const { user } = useAuth()
  const { toast } = useToast()
  const { addItem } = useCart()

  // 관련 제품 로드
  useEffect(() => {
    const loadRelatedProducts = async () => {
      if (!product) return
      
      setRelatedProductsLoading(true)
      try {
        console.log('🔄 Loading related products for:', product.name)
        
        const [productsResponse, categoriesResponse] = await Promise.all([
          fetch('/data/products.json'),
          fetch('/data/categories.json')
        ])
        
        if (!productsResponse.ok || !categoriesResponse.ok) {
          throw new Error('Failed to fetch related products data')
        }
        
        const productsData = await productsResponse.json()
        const categoriesData = await categoriesResponse.json()
        
        const categoryMap = new Map(categoriesData.map((cat: any) => [cat.id, cat]))
        
        // 같은 카테고리 또는 관련 카테고리의 제품들 필터링
        const related = productsData
          .filter((p: any) => p.id !== product.id && (
            p.category_id === product.category_id || 
            // AGV 카테고리면 industrial이나 heavy-duty 추천
            (product.category_id === 'cat_agv' && ['cat_industrial', 'cat_heavy_duty'].includes(p.category_id)) ||
            // Industrial 카테고리면 AGV나 heavy-duty 추천 
            (product.category_id === 'cat_industrial' && ['cat_agv', 'cat_heavy_duty'].includes(p.category_id)) ||
            // 기타 카테고리는 polyurethane이나 rubber 추천
            (['cat_polyurethane', 'cat_rubber'].includes(product.category_id) && ['cat_polyurethane', 'cat_rubber'].includes(p.category_id))
          ))
          .slice(0, 3)
          .map((product: any) => {
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
        
        console.log('✅ Related products loaded:', related.length)
        setRelatedProducts(related)
      } catch (error) {
        console.error('❌ Error loading related products:', error)
        // 관련 제품 로딩 실패는 치명적이지 않으므로 빈 배열로 설정
        setRelatedProducts([])
      } finally {
        setRelatedProductsLoading(false)
      }
    }
    
    loadRelatedProducts()
  }, [product])

  // 수동 재시도 함수
  const handleRetry = async () => {
    console.log('🔄 Manual retry initiated, attempt:', retryCount + 1)
    setRetryCount(prev => prev + 1)
    
    try {
      await refetch()
      toast({
        title: "재시도 성공",
        description: "제품 정보를 다시 불러왔습니다."
      })
    } catch (error) {
      console.error('❌ Manual retry failed:', error)
      toast({
        title: "재시도 실패",
        description: "제품 정보를 불러오는데 실패했습니다.",
        variant: "destructive"
      })
    }
  }

  if (!slug) {
    return <Navigate to="/products" replace />
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || (!isLoading && !product)) {
    console.log('❌ ProductDetailPage - Error or no product:', { error, product, slug, isLoading })
    
    const isNetworkError = error?.message?.includes('네트워크') || error?.message?.includes('fetch')
    const isNotFoundError = !product && !error
    
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb for error pages */}
          <nav className="mb-8">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-colors">홈</Link>
              <span>/</span>
              <Link to="/products" className="hover:text-primary transition-colors">제품</Link>
              <span>/</span>
              <span className="text-foreground">오류</span>
            </div>
          </nav>

          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-md mx-auto">
              {/* Error Icon */}
              <div className="mb-6">
                {isNetworkError ? (
                  <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <RefreshCw className="w-10 h-10 text-yellow-600" />
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-10 h-10 text-red-600" />
                  </div>
                )}
              </div>

              {/* Error Title */}
              <h1 className="text-2xl font-bold text-foreground mb-4">
                {isNetworkError ? '연결 문제가 발생했습니다' : '제품을 찾을 수 없습니다'}
              </h1>

              {/* Error Description */}
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {isNetworkError ? (
                  '네트워크 연결을 확인하고 다시 시도해주세요.'
                ) : isNotFoundError ? (
                  <>
                    요청하신 제품 <span className="font-medium text-foreground">"{slug}"</span>을 찾을 수 없습니다.<br />
                    제품명을 확인하거나 다른 제품을 찾아보세요.
                  </>
                ) : (
                  `오류가 발생했습니다: ${error?.message || '알 수 없는 오류'}`
                )}
              </p>

              {/* Error Actions */}
              <div className="space-y-3">
                {isNetworkError && (
                  <Button 
                    onClick={handleRetry} 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        재시도 중...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        다시 시도
                      </>
                    )}
                  </Button>
                )}
                
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" asChild>
                    <Link to="/products">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      제품 목록
                    </Link>
                  </Button>
                  <Button variant="outline" className="flex-1" asChild>
                    <Link to="/">
                      <Home className="w-4 h-4 mr-2" />
                      홈으로
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Retry count indicator */}
              {retryCount > 0 && (
                <p className="text-xs text-muted-foreground mt-4">
                  재시도 횟수: {retryCount}
                </p>
              )}

              {/* Additional help for 404 */}
              {isNotFoundError && (
                <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">추천 검색어</h3>
                  <div className="flex flex-wrap gap-2">
                    {['AGV 캐스터', '장비용 캐스터', '폴리우레탄 휠', '러버 휠'].map((keyword) => (
                      <Link
                        key={keyword}
                        to={`/products?search=${encodeURIComponent(keyword)}`}
                        className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs hover:bg-blue-200 transition-colors"
                      >
                        {keyword}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const formatPrice = (price: number) => {
    return `₩${price.toLocaleString()}`
  }

  const addToCart = async () => {
    if (!product) {
      console.error('❌ addToCart: product is null')
      toast({
        title: "오류",
        description: "제품 정보를 불러올 수 없습니다.",
        variant: "destructive"
      })
      return
    }

    if (quantity <= 0) {
      toast({
        title: "수량 오류",
        description: "수량은 1개 이상이어야 합니다.",
        variant: "destructive"
      })
      return
    }

    if (product.stock_quantity && quantity > product.stock_quantity) {
      toast({
        title: "재고 부족",
        description: `최대 ${product.stock_quantity}개까지만 주문할 수 있습니다.`,
        variant: "destructive"
      })
      return
    }

    console.log('🎯 Adding to cart:', product.name, 'x', quantity)

    try {
      const cartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: createSupabaseImageUrl(product.main_image_url),
        slug: product.slug,
        quantity: quantity
      }
      
      addItem(cartItem)
      
      toast({
        title: "장바구니에 추가됨",
        description: `${product.name} ${quantity}개가 장바구니에 추가되었습니다.`
      })
    } catch (error) {
      console.error('❌ Error adding to cart:', error)
      toast({
        title: "장바구니 추가 실패",
        description: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
        variant: "destructive"
      })
    }
  }


  const handleInquiry = () => {
    if (!product) return
    
    setInquiryModalOpen(true)
  }

  const handleShare = () => {
    if (!product) return
    
    // Copy product URL to clipboard
    const productUrl = `${window.location.origin}/products/${product.slug}`
    
    if (navigator.share) {
      // Use native share API if available
      navigator.share({
        title: product.name,
        text: product.description,
        url: productUrl
      }).catch(console.error)
    } else if (navigator.clipboard) {
      // Fallback to clipboard
      navigator.clipboard.writeText(productUrl).then(() => {
        toast({
          title: '링크 복사됨',
          description: '제품 링크가 클립보드에 복사되었습니다.',
        })
      }).catch(() => {
        toast({
          title: '복사 실패',
          description: '링크 복사에 실패했습니다.',
          variant: 'destructive'
        })
      })
    }
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8 animate-fade-in-up">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">홈</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-primary transition-colors">제품</Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="relative aspect-square bg-white rounded-lg overflow-hidden border group">
              <img
                src={createSupabaseImageUrl(product.main_image_url)}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Image counter */}
              <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-sm">
                1 / 4
              </div>
              {/* Navigation arrows */}
              <button className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-sm transition-all">
                <span className="text-gray-600 text-lg">‹</span>
              </button>
              <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-sm transition-all">
                <span className="text-gray-600 text-lg">›</span>
              </button>
            </div>
            
            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i}
                  className={`aspect-square bg-white rounded-lg border-2 transition-colors cursor-pointer ${
                    i === 1 ? 'border-blue-400' : 'border-gray-200 hover:border-blue-400/50'
                  }`}
                >
                  <img
                    src={createSupabaseImageUrl(product.main_image_url)}
                    alt={`${product.name} view ${i}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {/* Header */}
            <div className="space-y-4">
              <div className="text-sm text-gray-500 font-medium">
                모델: {product.sku || 'AGV-LG'}
              </div>
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-yellow-500 font-medium">4.8</span>
                <span className="text-sm text-gray-500">(사용자 리뷰)</span>
              </div>
              
              <div className="text-3xl font-bold text-gray-900">
                {formatPrice(product.price)}
              </div>
              
              <div className="text-sm text-gray-600 leading-relaxed">
                {product.description}
              </div>
            </div>

            
            {/* Key Features */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">주요 특징</h3>
              <div className="space-y-2">
                {[
                  '방향 전환',
                  '정밀 제어',
                  '내구성',
                  '안전성',
                  '360도 회전',
                  '부품 취급 기술'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>
            </div>



            {/* Quantity Selector */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">수량:</span>
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newQuantity = Math.max(1, quantity - 1);
                      setQuantity(newQuantity);
                      if (newQuantity === 1) {
                        console.log('⚠️ Minimum quantity reached');
                      }
                    }}
                    disabled={quantity <= 1}
                    className="px-3 py-1 h-8"
                    title="수량 감소"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-1 text-center min-w-[40px] text-sm font-medium border-x">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const maxQuantity = product.stock_quantity || 99;
                      const newQuantity = Math.min(maxQuantity, quantity + 1);
                      setQuantity(newQuantity);
                      
                      if (newQuantity >= maxQuantity && product.stock_quantity) {
                        toast({
                          title: "재고 한계",
                          description: `최대 재고량 ${maxQuantity}개에 도달했습니다.`,
                          variant: "destructive"
                        });
                      }
                    }}
                    disabled={quantity >= (product.stock_quantity || 99)}
                    className="px-3 py-1 h-8"
                    title="수량 증가"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Stock Information */}
                {product.stock_quantity && product.stock_quantity <= 10 && (
                  <span className="text-xs text-amber-600 font-medium">
                    재고 {product.stock_quantity}개 남음
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <Button
                  onClick={addToCart}
                  className="w-full h-12 text-base bg-amber-400 hover:bg-amber-500 text-slate-900 font-medium disabled:opacity-50 transition-all duration-300"
                  disabled={!stockStatus.available}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  장바구니 담기
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 h-10 text-sm hover:bg-gray-50 hover:text-gray-900 border-gray-300"
                    onClick={handleInquiry}
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    문의하기
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 h-10 text-sm hover:bg-gray-50 hover:text-gray-900 border-gray-300"
                    onClick={handleShare}
                  >
                    <Share2 className="w-4 h-4 mr-1" />
                    공유하기
                  </Button>
                </div>
              </div>

              {/* Stock Alert */}
              {!stockStatus.available && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm font-medium">현재 품절된 상품입니다.</p>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Detailed Information Tabs */}
        <div className="mt-12 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <Tabs defaultValue="specifications" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-200 p-0 h-auto">
              <TabsTrigger value="specifications" className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-gray-50 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none">
                제품 사양
              </TabsTrigger>
              <TabsTrigger value="components" className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-gray-50 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none">
                구성품
              </TabsTrigger>
              <TabsTrigger value="reviews" className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-gray-50 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none">
                리뷰
              </TabsTrigger>
              <TabsTrigger value="usage" className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-gray-50 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none">
                사용법
              </TabsTrigger>
            </TabsList>


            <TabsContent value="specifications" className="mt-6">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">제품 사양</h3>
                  <div className="space-y-4">
                    {[
                      { label: '최대 하중', value: '100kg', label2: '휠 직경', value2: '75mm' },
                      { label: '휠 폭', value: '25mm', label2: '전체 높이', value2: '100mm' },
                      { label: '플레이트 크기', value: '60 × 60mm', label2: '볼트 구멍', value2: 'M8 × 4개' },
                      { label: '휠 재질', value: '폴리우레탄', label2: '프레임 재질', value2: '알루미늄 합금' },
                      { label: '베어링', value: '정밀 볼베어링', label2: '브레이크', value2: '자동 잠금식' }
                    ].map((spec, index) => (
                      <div key={index} className="grid grid-cols-2 gap-8">
                        <div className="flex justify-between items-center py-3">
                          <span className="text-gray-600">{spec.label}</span>
                          <span className="text-gray-900 font-medium">{spec.value}</span>
                        </div>
                        <div className="flex justify-between items-center py-3">
                          <span className="text-gray-600">{spec.label2}</span>
                          <span className="text-gray-900 font-medium">{spec.value2}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-12">
                    <h4 className="text-lg font-bold text-gray-900 mb-4 text-center">관련 제품</h4>
                    <p className="text-gray-600 mb-6 text-center">함께 구매하면 좋은 캐스터 제품들을 확인해보세요</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {relatedProductsLoading ? (
                        // 로딩 중일 때 스켈레톤 표시
                        [1, 2, 3].map((item) => (
                          <div key={item} className="relative bg-white rounded-lg border p-4 animate-pulse">
                            <div className="aspect-square bg-gray-200 rounded-lg mb-3" />
                            <div className="h-4 bg-gray-200 rounded mb-2" />
                            <div className="h-3 bg-gray-200 rounded mb-2 w-2/3" />
                            <div className="h-4 bg-gray-200 rounded w-1/2" />
                          </div>
                        ))
                      ) : relatedProducts.length > 0 ? (
                        // 관련 제품이 있을 때
                        relatedProducts.map((item, index) => {
                          const discountPercent = Math.floor(Math.random() * 20) + 10; // 10-30% 할인
                          const isNew = Math.random() > 0.5; // 50% 확률로 NEW 표시
                          
                          return (
                            <Link key={item.id} to={`/products/${item.slug}`} className="relative bg-white rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer block">
                              <div className="absolute top-2 left-2 flex gap-1">
                                {isNew && <Badge className="bg-red-500 text-white text-xs px-2 py-1">NEW</Badge>}
                                <Badge className="bg-amber-400 text-slate-900 text-xs px-2 py-1">{discountPercent}% OFF</Badge>
                              </div>
                              <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                                {item.main_image_url ? (
                                  <img 
                                    src={createSupabaseImageUrl(item.main_image_url)} 
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      // 이미지 로딩 실패 시 기본 플레이스홀더 표시
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      const placeholder = target.parentNode?.querySelector('.placeholder');
                                      if (placeholder) {
                                        (placeholder as HTMLElement).style.display = 'block';
                                      }
                                    }}
                                  />
                                ) : null}
                                <div className="placeholder w-16 h-16 bg-gray-300 rounded-full" style={{ display: item.main_image_url ? 'none' : 'block' }} />
                              </div>
                              <h5 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2">{item.name}</h5>
                              <p className="text-xs text-gray-500 mb-2">{item.category.name}</p>
                              <p className="text-sm font-bold text-slate-900">₩{item.price.toLocaleString()}</p>
                            </Link>
                          )
                        })
                      ) : (
                        // 관련 제품이 없을 때
                        <div className="col-span-3 text-center py-8">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShoppingCart className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-gray-500 mb-4">관련 제품이 없습니다.</p>
                          <Button variant="outline" size="sm" asChild>
                            <Link to="/products">
                              모든 제품 보기
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">고객 리뷰</h3>
                  <div className="text-center py-12">
                    <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">아직 리뷰가 없습니다.</p>
                    <p className="text-sm text-gray-500">첫 번째 리뷰를 남겨보세요!</p>
                    <Button variant="outline" className="mt-4 border-gray-300 hover:bg-gray-50 hover:text-gray-900">
                      리뷰 작성하기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="components" className="mt-6">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">구성품</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900">기본 구성품</h4>
                      <ul className="space-y-2">
                        {[
                          '캐스터 본체 × 1개',
                          '고정 볼트 × 4개',
                          '와셔 × 4개',
                          '육각 렌치 × 1개',
                          '설치 매뉴얼 × 1부'
                        ].map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                            <span className="text-gray-600">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900">선택 구성품</h4>
                      <ul className="space-y-2">
                        {[
                          '브레이크 키트',
                          '보호 커버',
                          '교체용 휠',
                          '추가 고정 볼트',
                          '전용 윤활유'
                        ].map((item, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full mt-2" />
                            <span className="text-gray-600">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="usage" className="mt-6">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">사용법</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">설치 방법</h4>
                      <ol className="space-y-2 text-gray-600">
                        <li className="flex items-start gap-3">
                          <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">1</span>
                          <span>장비 하단의 설치 위치를 확인하고 청소합니다.</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">2</span>
                          <span>캐스터 플레이트를 설치 위치에 맞춰 정렬합니다.</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">3</span>
                          <span>제공된 볼트와 와셔를 사용하여 고정합니다.</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">4</span>
                          <span>육각 렌치를 사용하여 적절한 토크로 조립합니다.</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">5</span>
                          <span>설치 완료 후 회전 및 이동이 원활한지 확인합니다.</span>
                        </li>
                      </ol>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">유지보수</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                          <span>월 1회 베어링 부분에 윤활유를 도포하세요.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                          <span>휠 표면의 이물질을 정기적으로 청소하세요.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                          <span>볼트 체결 상태를 주기적으로 점검하세요.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Inquiry Modal */}
        <InquiryModal
          isOpen={inquiryModalOpen}
          onClose={() => setInquiryModalOpen(false)}
          productName={product?.name}
          productId={product?.id}
        />
      </div>
    </div>
  )
}