import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Star, ArrowRight, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useProducts } from '@/hooks/useProducts';
import { createSupabaseImageUrl } from '@/lib/supabase-storage';

interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  main_image_url?: string;
  category?: {
    name: string;
  } | null;
  stock_quantity?: number;
}

const FeaturedProducts = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const { data: productsResponse, isLoading } = useProducts();
  const { toast } = useToast();
  const { user } = useAuth();
  const { addItem } = useCart();

  useEffect(() => {
    if (productsResponse?.data && productsResponse.data.length > 0) {
      // Debug: Log the raw data structure
      console.log('🔍 FeaturedProducts: Raw products data:', productsResponse.data.slice(0, 2));
      console.log('🔍 FeaturedProducts: Category structure check:', productsResponse.data.map(p => ({
        name: p.name,
        category: p.category,
        categoryType: typeof p.category,
        categoryName: p.category?.name
      })).slice(0, 3));
      
      // Get first 5 products as featured, filter out any with problematic data
      const featured = productsResponse.data
        .filter(product => {
          // Ensure product has required fields
          if (!product?.name || !product?.id || !product?.slug) {
            console.warn('⚠️ FeaturedProducts: Skipping product with missing required fields:', product);
            return false;
          }
          return true;
        })
        .slice(0, 5);
      
      console.log('✅ FeaturedProducts: Filtered products:', featured.length);
      setFeaturedProducts(featured);
    }
  }, [productsResponse]);

  const addToCart = async (product: Product) => {
    try {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: createSupabaseImageUrl(product.main_image_url),
        slug: product.slug,
        product_id: product.id,
        quantity: 1
      });

      toast({
        title: "추가 완료",
        description: "장바구니에 추가되었습니다.",
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "오류",
        description: "장바구니 추가 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-foreground mb-4">Featured Products</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover our most popular premium casters and wheels
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="bg-card">
                <CardContent className="p-0">
                  <div className="aspect-square bg-muted animate-pulse"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-2/3 animate-pulse"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-gray-900 mb-4">
            인기 제품
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            가장 인기 있는 프리미엄 캐스터와 휠을 만나보세요
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {featuredProducts.map((product, index) => {
            // Additional safety check for rendering
            if (!product || !product.name || !product.id) {
              console.warn('⚠️ FeaturedProducts: Skipping invalid product in render:', product);
              return null;
            }
            
            return (
              <Card 
                key={product.id}
                className="group bg-white border-2 hover:border-yellow-400/50 transition-all duration-300 hover:shadow-xl overflow-hidden"
              >
                <CardContent className="p-0">
                  {/* Product Image */}
                  <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    <img
                      src={createSupabaseImageUrl(product.main_image_url)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {index < 3 && (
                        <Badge className="bg-red-500 text-white border-0 px-2 py-1 text-xs">
                          BEST
                        </Badge>
                      )}
                      <Badge variant="secondary" className="bg-yellow-400 text-gray-900 border-0 px-2 py-1 text-xs font-bold">
                        {product.category?.name || '캐스터'}
                      </Badge>
                    </div>

                    {/* Quick View Button */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Link to={`/products/${product.slug}`}>
                        <Button
                          className="bg-yellow-400 text-gray-900 hover:bg-yellow-500 font-bold"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          상세보기
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">(24)</span>
                      </div>
                      {(product.stock_quantity || 0) <= 5 && (product.stock_quantity || 0) > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          재고부족
                        </Badge>
                      )}
                    </div>
                    
                    <Link to={`/products/${product.slug}`}>
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-yellow-600 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xl font-black text-yellow-600">
                          ₩{product.price.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-500">
                          재고: {product.stock_quantity || 0}개
                        </span>
                      </div>
                      <Button 
                        onClick={() => addToCart(product)}
                        variant="outline" 
                        size="sm" 
                        className="border-yellow-400/30 hover:bg-yellow-400 hover:text-gray-900"
                        disabled={(product.stock_quantity || 0) === 0}
                      >
                        담기
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link to="/products">
            <Button 
              size="lg" 
              className="bg-yellow-400 text-gray-900 hover:bg-yellow-500 font-black px-8 py-3 text-lg"
            >
              전체 제품 보기
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;