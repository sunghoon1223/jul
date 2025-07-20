import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Cog, Truck, Settings, Disc, Zap, Bot, Factory, Dumbbell, Rotate3D, Battery } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: any;
  product_count: number;
  image: string;
  color: string;
  bgColor: string;
}

const ProductCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: categoriesData, isLoading } = useCategories();

  useEffect(() => {
    const loadCategoriesData = async () => {
      try {
        const [categoriesResponse, productsResponse] = await Promise.all([
          fetch('/data/categories.json'),
          fetch('/data/products.json')
        ]);
        
        const categoriesData = await categoriesResponse.json();
        const productsData = await productsResponse.json();
        
        // 각 카테고리별 제품 개수 계산
        const categoryCount = productsData.reduce((acc: Record<string, number>, product: any) => {
          acc[product.category_id] = (acc[product.category_id] || 0) + 1;
          return acc;
        }, {});
        
        // 카테고리별 이미지 및 색상 매핑
        const categoryStyles = {
          'cat_agv': { icon: Bot, color: 'text-blue-600', bgColor: 'bg-blue-100', image: '/images/ABUIABACGAAgiO7CoQYooebvrAYwoAY4oAY.jpg' },
          'cat_industrial': { icon: Factory, color: 'text-gray-600', bgColor: 'bg-gray-100', image: '/images/ABUIABACGAAg0rLUswYotNOjtgYwoAY4oAY.jpg' },
          'cat_heavy_duty': { icon: Dumbbell, color: 'text-red-600', bgColor: 'bg-red-100', image: '/images/ABUIABACGAAg277EoQYo0srl7gQwoAY4oAY.jpg' },
          'cat_polyurethane': { icon: Disc, color: 'text-purple-600', bgColor: 'bg-purple-100', image: '/images/ABUIABACGAAg0LHIoQYo8PKWiAQwoAY4oAY.jpg' },
          'cat_rubber': { icon: Cog, color: 'text-green-600', bgColor: 'bg-green-100', image: '/images/ABUIABACGAAg7L7IoQYoiJS5cDCgBjigBg.jpg' },
          'cat_mecanum': { icon: Rotate3D, color: 'text-orange-600', bgColor: 'bg-orange-100', image: '/images/ABUIABACGAAg3PifvgYo35jC6wEwoAY4oAY.jpg' },
          'cat_drive_module': { icon: Battery, color: 'text-yellow-600', bgColor: 'bg-yellow-100', image: '/images/ABUIABACGAAgktLTqQYoyO_QrQMwoAY4oAY.jpg' }
        };
        
        const mappedCategories = categoriesData.map((category: any) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          icon: categoryStyles[category.id as keyof typeof categoryStyles]?.icon || Settings,
          color: categoryStyles[category.id as keyof typeof categoryStyles]?.color || 'text-gray-600',
          bgColor: categoryStyles[category.id as keyof typeof categoryStyles]?.bgColor || 'bg-gray-100',
          product_count: categoryCount[category.id] || 0,
          image: categoryStyles[category.id as keyof typeof categoryStyles]?.image || "/images/placeholder.svg"
        }));
        
        setCategories(mappedCategories);
        setLoading(false);
      } catch (error) {
        console.error('Error loading categories:', error);
        setLoading(false);
      }
    };
    
    loadCategoriesData();
  }, []);

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6 animate-fade-in-up">
            제품 카테고리
          </h2>
          <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed animate-fade-in-up">
            산업용 캐스터와 휠의 전문 제조업체로서 다양한 분야에 최적화된 고품질 제품을 제공합니다
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <Card key={i} className="border-0 bg-card overflow-hidden shadow-lg">
                <CardContent className="p-8">
                  <Skeleton className="h-48 w-full rounded-lg animate-pulse" />
                </CardContent>
              </Card>
            ))
          ) : (
            categories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <Link to={`/categories/${category.slug}`} key={category.id}>
                  <Card
                    className="group cursor-pointer border-0 bg-white shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-300 hover:scale-105"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardContent className="p-8 relative">
                      <div className="absolute top-0 right-0 w-32 h-32 opacity-10 overflow-hidden">
                        <img 
                          src={category.image} 
                          alt=""
                          className="w-full h-full object-cover transform rotate-12 scale-150"
                          onError={(e) => {
                            e.currentTarget.src = '/images/placeholder.svg';
                          }}
                        />
                      </div>
                      
                      <div className="relative z-10">
                        <div className="flex items-start space-x-5">
                          <div className={`p-2 rounded-2xl ${category.bgColor} group-hover:scale-110 transition-transform duration-300 shadow-lg overflow-hidden`}>
                            <img 
                              src={category.image} 
                              alt={category.name}
                              className="h-12 w-12 object-cover rounded-lg"
                              onError={(e) => {
                                e.currentTarget.src = '/images/placeholder.svg';
                              }}
                            />
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
                              {category.name}
                            </h3>
                            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                              {category.description}
                            </p>
                            <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-semibold inline-block mb-4">
                              {category.product_count} Products
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="group-hover:bg-amber-400 group-hover:text-slate-900 transition-all duration-300 p-3 h-auto rounded-full font-medium"
                            >
                              제품 보기
                              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-orange-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          )}
        </div>
        
        <div className="text-center mt-16">
          <Link to="/products">
            <Button 
              size="lg" 
              className="bg-amber-400 hover:bg-amber-500 text-slate-900 text-lg px-8 py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              전체 제품 둘러보기
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductCategories;