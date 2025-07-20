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
    title: "CASTER",
    subtitle: "SOLUTIONS",
    description: "산업용 장비부터 로봇까지, 극한의 환경에서도 견뎌내는 프로페셔널 캐스터와 휠",
    image: "https://images.unsplash.com/photo-1677457132999-aba9939e9c83?w=1920&h=800&fit=crop&q=80",
    cta: "SHOP NOW"
  },
  {
    title: "AGV",
    subtitle: "CASTER",
    description: "자동화 설비를 위한 정밀 캐스터로 AGV 시스템의 효율성을 극대화하세요",
    image: "https://images.unsplash.com/photo-1611251132569-bb5166405a2a?w=1920&h=800&fit=crop&q=80",
    cta: "VIEW PRODUCTS"
  },
  {
    title: "INDUSTRIAL",
    subtitle: "WHEELS",
    description: "극한의 환경에서도 견뎌내는 고성능 산업용 휠과 캐스터 솔루션",
    image: "https://images.unsplash.com/photo-1633389403112-67950200de80?w=1920&h=800&fit=crop&q=80",
    cta: "EXPLORE"
  },
  {
    title: "CUSTOM",
    subtitle: "SOLUTIONS",
    description: "고객 요구사항에 맞춤 설계된 특별한 캐스터 제작 서비스",
    image: "https://images.unsplash.com/photo-1581092795442-6ce0a6a54a20?w=1920&h=800&fit=crop&q=80",
    cta: "GET QUOTE"
  },
  {
    title: "QUALITY",
    subtitle: "GUARANTEE",
    description: "ISO 인증 품질 보증과 10년 이상의 전문 경험으로 최상의 제품 품질 보장",
    image: "https://images.unsplash.com/photo-1581091870619-83511c583b35?w=1920&h=800&fit=crop&q=80",
    cta: "LEARN MORE"
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
      <section className="relative min-h-screen flex items-center bg-gray-900 overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
            }`}
          >
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
              <img 
                src={slide.image} 
                alt="Industrial Caster Background" 
                className="w-full h-full object-cover opacity-20" 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-gray-900/60" />
            </div>
            
            {/* Dynamic Background Elements */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-20 left-20 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-20 right-20 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl animate-pulse delay-1000" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-yellow-400/10 rounded-full animate-spin" style={{
                animationDuration: '30s'
              }} />
            </div>
            
            {/* Content */}
            <div className="relative z-10 container mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-screen py-20">
                {/* Left Content */}
                <div className="text-left animate-fade-in-up">
                  {/* Badge */}
                  <div className="inline-flex items-center px-6 py-3 mb-8 bg-yellow-400/20 rounded-full border-2 border-yellow-400/30 backdrop-blur-sm">
                    <Award className="w-5 h-5 text-yellow-400 mr-3" />
                    <span className="text-sm font-black text-yellow-400 uppercase tracking-widest">
                      PROFESSIONAL GRADE CASTER
                    </span>
                  </div>
                  
                  {/* Main Headline with Drop Shadow */}
                  <h1 className="text-6xl md:text-8xl font-black text-white mb-8 leading-none">
                    <span className="block text-yellow-400 drop-shadow-2xl" style={{
                      textShadow: '4px 4px 8px rgba(0,0,0,0.8), 2px 2px 4px rgba(234,179,8,0.3)'
                    }}>
                      {slide.title}
                    </span>
                    <span className="block drop-shadow-2xl" style={{
                      textShadow: '4px 4px 8px rgba(0,0,0,0.8), 2px 2px 4px rgba(0,0,0,0.5)'
                    }}>
                      {slide.subtitle}
                    </span>
                  </h1>
                  
                  {/* Subheadline with Drop Shadow */}
                  <p className="text-xl text-gray-200 mb-8 max-w-lg leading-relaxed font-medium" style={{
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                  }}>
                    {slide.description}
                  </p>
                  
                  {/* Feature Points */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                    {[
                      { icon: Award, text: "ISO 품질 인증" },
                      { icon: Truck, text: "빠른 배송 보장" },
                      { icon: Shield, text: "맞춤 제작 가능" },
                      { icon: Star, text: "전문가 상담" }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center text-white bg-white/5 rounded-xl p-4 border border-yellow-400/20 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                        <div className="w-10 h-10 bg-yellow-400/20 rounded-full flex items-center justify-center mr-4">
                          <item.icon className="w-5 h-5 text-yellow-400" />
                        </div>
                        <span className="font-bold text-sm uppercase tracking-wide">{item.text}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-6">
                    <Button 
                      asChild 
                      size="lg" 
                      className="bg-yellow-400 text-gray-900 hover:bg-yellow-400/90 font-black px-10 py-5 text-lg shadow-2xl hover:shadow-yellow-500/25 transition-all duration-300 uppercase tracking-widest hover:scale-105 transform border-2 border-yellow-400"
                    >
                      <Link to="/products">
                        <ArrowRight className="mr-3 h-6 w-6" />
                        {slide.cta}
                        <ArrowRight className="ml-3 h-6 w-6" />
                      </Link>
                    </Button>
                    
                    <Button 
                      asChild 
                      variant="outline" 
                      size="lg" 
                      className="border-3 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-gray-900 font-black px-10 py-5 text-lg transition-all duration-300 uppercase tracking-widest hover:scale-105 transform backdrop-blur-sm bg-white/5"
                    >
                      <Link to="/support">
                        <Phone className="mr-3 h-6 w-6" />
                        전문 상담
                      </Link>
                    </Button>
                  </div>
                </div>
                
                {/* Right Content - Hero Image */}
                <div className="hidden lg:block animate-fade-in-up" style={{
                  animationDelay: '0.3s'
                }}>
                  <div className="relative">
                    {/* Main Image Card */}
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-yellow-400/30 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm">
                      <img 
                        src={slide.image} 
                        alt="Industrial Caster Solutions" 
                        className="w-full h-96 object-cover" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-transparent to-transparent" />
                      
                      {/* Floating Info Card */}
                      <div className="absolute bottom-6 left-6 right-6">
                        <div className="bg-yellow-400/95 backdrop-blur-sm rounded-2xl p-6 border border-yellow-400 shadow-2xl">
                          <h3 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-wide">PROFESSIONAL GRADE</h3>
                          <p className="text-sm text-gray-900/80 font-bold">산업용 캐스터 전문 제조 • 10년+ 경험</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Floating Stats */}
                    <div className="absolute -bottom-6 -left-6 bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-yellow-400/30 shadow-xl">
                      <div className="text-center">
                        <div className="text-2xl font-black text-yellow-400">ISO</div>
                        <div className="text-xs text-white font-bold uppercase">인증</div>
                      </div>
                    </div>
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
            className="h-12 w-12 rounded-full bg-yellow-400/10 backdrop-blur-sm hover:bg-yellow-400/20 text-yellow-400 border border-yellow-400/30"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </div>
        <div className="absolute inset-y-0 right-4 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={nextSlide}
            className="h-12 w-12 rounded-full bg-yellow-400/10 backdrop-blur-sm hover:bg-yellow-400/20 text-yellow-400 border border-yellow-400/30"
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
                index === currentSlide ? 'bg-yellow-400' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
        
        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-black/20">
          <div 
            className="h-full bg-yellow-400 transition-all duration-5000 ease-linear"
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