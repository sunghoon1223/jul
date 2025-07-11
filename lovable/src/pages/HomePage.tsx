"use client"

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ProductGrid } from '@/components/product/ProductGrid'
import { useProducts } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import { ArrowRight, Phone, Star, Shield, Truck, Award, ChevronLeft, ChevronRight } from 'lucide-react'

const heroSlides = [
  {
    title: "산업용 캐스터 전문",
    subtitle: "JP캐스터",
    description: "AGV부터 메카넘 휠까지, 20년 경험의 캐스터 전문 기업. 최고 품질의 산업용 캐스터 솔루션을 제공합니다.",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1920&h=800&fit=crop",
    cta: "제품 카탈로그 보기"
  },
  {
    title: "AGV 캐스터 솔루션",
    subtitle: "자동화 설비를 위한 정밀 캐스터",
    description: "무인 운반차량(AGV)에 최적화된 고성능 캐스터로 자동화 시스템의 효율성을 극대화하세요.",
    image: "https://images.unsplash.com/photo-1565087447937-4ab7c5fd1b45?w=1920&h=800&fit=crop",
    cta: "AGV 캐스터 보기"
  },
  {
    title: "메카넘 휠 기술",
    subtitle: "360도 전방향 이동",
    description: "로봇공학의 혁신을 이끄는 메카넘 휠 기술로 무한한 이동의 자유를 경험하세요.",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1920&h=800&fit=crop",
    cta: "메카넘 휠 보기"
  },
  {
    title: "맞춤형 제작 서비스",
    subtitle: "고객 요구사항 맞춤 설계",
    description: "설계부터 제작까지 원스톱 서비스로 고객만의 특별한 캐스터를 제작해드립니다.",
    image: "https://images.unsplash.com/photo-1581092795442-6ce0a6a54a20?w=1920&h=800&fit=crop",
    cta: "상담 신청하기"
  },
  {
    title: "품질 보증 시스템",
    subtitle: "ISO 9001 인증",
    description: "엄격한 품질 관리 시스템과 20년 노하우로 최상의 제품 품질을 보장합니다.",
    image: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=1920&h=800&fit=crop",
    cta: "품질 보증 보기"
  }
]

export function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  
  const { data: productsResponse, isLoading: productsLoading } = useProducts({
    page: 1,
    limit: 8
  })
  
  const { data: categories, isLoading: categoriesLoading } = useCategories()

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)

  return (
    <div className="min-h-screen">
      {/* Hero Slider Section */}
      <section className="relative h-[700px] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
            }`}
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${slide.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="container mx-auto px-4 h-full flex items-center">
              <div className="max-w-4xl text-white">
                <div className="animate-fade-in-up">
                  <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
                    {slide.title}
                    <br />
                    <span className="text-orange-400">{slide.subtitle}</span>
                  </h1>
                  <p className="text-xl md:text-2xl mb-8 text-blue-100 leading-relaxed max-w-3xl">
                    {slide.description}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      asChild 
                      size="lg" 
                      className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-8 py-4"
                    >
                      <Link to="/products">
                        {slide.cta}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                    <Button 
                      asChild 
                      variant="outline" 
                      size="lg" 
                      className="border-2 border-white text-white hover:bg-white hover:text-blue-900 text-lg px-8 py-4"
                    >
                      <Link to="/support">
                        전문 상담 신청
                        <Phone className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Navigation */}
        <div className="absolute inset-y-0 left-4 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={prevSlide}
            className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </div>
        <div className="absolute inset-y-0 right-4 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={nextSlide}
            className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
        
        {/* Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-orange-400' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
        
        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-black/20">
          <div 
            className="h-full bg-orange-400 transition-all duration-[5000ms] ease-linear"
            style={{ width: `${((currentSlide + 1) / heroSlides.length) * 100}%` }}
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              왜 JP캐스터를 선택해야 할까요?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              20년간 축적된 전문성과 혁신적인 기술로 최고의 캐스터 솔루션을 제공합니다
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Award,
                title: '20년 전문 경험',
                description: '2004년부터 축적된 캐스터 전문 기술과 노하우'
              },
              {
                icon: Shield,
                title: '검증된 품질',
                description: 'ISO 9001 인증 및 엄격한 품질 관리 시스템'
              },
              {
                icon: Truck,
                title: '빠른 배송',
                description: '전국 당일 배송 가능, 대량 주문 특별 지원'
              },
              {
                icon: Star,
                title: '맞춤 솔루션',
                description: '고객 요구사항에 맞는 커스텀 캐스터 제작'
              }
            ].map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              제품 카테고리
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              다양한 산업 분야에 최적화된 캐스터 솔루션을 만나보세요
            </p>
          </div>
          
          {categoriesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-40 bg-gray-200 animate-pulse rounded-xl shadow-md" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {categories?.map((category, index) => (
                <Link key={category.id} to={`/categories/${category.slug}`} className="group">
                  <Card className="h-full border-0 shadow-md hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <CardContent className="p-6 text-center h-full flex flex-col justify-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 transition-colors duration-300">
                        <div className="w-8 h-8 bg-blue-600 rounded group-hover:bg-white transition-colors duration-300"></div>
                      </div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 text-sm leading-tight">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                          {category.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">인기 제품</h2>
              <p className="text-xl text-gray-600">고객들이 가장 많이 선택하는 베스트셀러 제품들</p>
            </div>
            <Button asChild variant="outline" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 py-3">
              <Link to="/products">
                전체 제품 보기
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
          
          <ProductGrid 
            products={productsResponse?.data || []} 
            isLoading={productsLoading}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            맞춤형 캐스터 솔루션이 필요하신가요?
          </h2>
          <p className="text-xl md:text-2xl mb-12 text-blue-100 max-w-4xl mx-auto leading-relaxed">
            20년 경험의 전문가와 상담하여 최적의 캐스터를 찾아보세요
            <br />
            무료 상담을 통해 최고의 솔루션을 제안해드립니다
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-8 py-4">
              <Link to="/support">
                무료 상담 신청
                <Phone className="ml-2 h-6 w-6" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-blue-900 text-lg px-8 py-4">
              <Link to="/products">
                카탈로그 다운로드
                <ArrowRight className="ml-2 h-6 w-6" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}