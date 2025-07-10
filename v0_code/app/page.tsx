"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollHeader } from "@/components/scroll-header"
import { ProductCard } from "@/components/product-card"
import { ArrowRight, Star, Zap, Award, Headphones, ChevronLeft, ChevronRight } from "lucide-react"

const heroSlides = [
  {
    id: 1,
    title: "산업용 캐스터의 새로운 기준",
    subtitle: "혁신적인 기술력으로 제작된",
    description: "20년 경험의 전문 기술진이 개발한 고품질 캐스터로 여러분의 비즈니스 효율성을 극대화하세요",
    buttonText: "제품 둘러보기",
    image: "/images/hero-bg-1.png",
    bgColor: "from-blue-600 to-indigo-800",
  },
  {
    id: 2,
    title: "AGV 시스템 전용 캐스터",
    subtitle: "자동화 시대를 선도하는",
    description: "무인 운반 차량(AGV)에 최적화된 고성능 캐스터로 스마트 팩토리 구축을 지원합니다",
    buttonText: "AGV 캐스터 보기",
    image: "/placeholder.svg?height=600&width=800",
    bgColor: "from-purple-600 to-pink-600",
  },
  {
    id: 3,
    title: "메카넘 휠의 혁신",
    subtitle: "전방향 이동이 가능한",
    description: "360도 자유로운 이동을 실현하는 메카넘 휠로 로봇 공학의 새로운 가능성을 열어보세요",
    buttonText: "메카넘 휠 보기",
    image: "/placeholder.svg?height=600&width=800",
    bgColor: "from-green-600 to-teal-600",
  },
  {
    id: 4,
    title: "중하중용 캐스터",
    subtitle: "강력한 내구성을 자랑하는",
    description: "최대 1톤까지 지지 가능한 초강력 캐스터로 대형 장비의 안전한 이동을 보장합니다",
    buttonText: "중하중 캐스터 보기",
    image: "/placeholder.svg?height=600&width=800",
    bgColor: "from-orange-600 to-red-600",
  },
  {
    id: 5,
    title: "맞춤형 솔루션",
    subtitle: "고객 요구에 특화된",
    description: "다양한 산업 분야의 특수 요구사항에 맞춘 커스터마이징 서비스를 제공합니다",
    buttonText: "상담 문의",
    image: "/placeholder.svg?height=600&width=800",
    bgColor: "from-indigo-600 to-purple-600",
  },
]

const recommendedProducts = [
  {
    id: 1,
    name: "AGV 중하중용 캐스터 200mm",
    description: "최대 하중 500kg, 정밀 볼베어링 적용",
    price: 85000,
    originalPrice: 95000,
    image: "/placeholder.svg?height=250&width=250",
    rating: 4.8,
    reviews: 24,
    inStock: true,
    isNew: true,
    category: "AGV 캐스터",
  },
  {
    id: 2,
    name: "산업용 폴리우레탄 휠 150mm",
    description: "내마모성이 뛰어난 폴리우레탄 소재",
    price: 45000,
    image: "/placeholder.svg?height=250&width=250",
    rating: 4.6,
    reviews: 18,
    inStock: true,
    isNew: false,
    category: "폴리우레탄 휠",
  },
  {
    id: 3,
    name: "메카넘 휠 세트 (4개입)",
    description: "전방향 이동이 가능한 특수 설계",
    price: 320000,
    originalPrice: 350000,
    image: "/placeholder.svg?height=250&width=250",
    rating: 4.9,
    reviews: 12,
    inStock: true,
    isNew: true,
    category: "메카넘 휠",
  },
  {
    id: 4,
    name: "고무 완충 캐스터 100mm",
    description: "진동 흡수가 우수한 고무 소재",
    price: 32000,
    image: "/placeholder.svg?height=250&width=250",
    rating: 4.5,
    reviews: 31,
    inStock: true,
    isNew: false,
    category: "고무 휠",
  },
]

const categories = [
  {
    id: "agv-caster",
    name: "AGV 캐스터",
    description: "자동 운반 차량용 전문 캐스터",
    image: "/placeholder.svg?height=300&width=400",
    productCount: 24,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "equipment-caster",
    name: "장비용 캐스터",
    description: "산업용 장비를 위한 고강도 캐스터",
    image: "/placeholder.svg?height=300&width=400",
    productCount: 45,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    id: "polyurethane-wheel",
    name: "폴리우레탄 휠",
    description: "내구성이 뛰어난 폴리우레탄 소재",
    image: "/placeholder.svg?height=300&width=400",
    productCount: 32,
    gradient: "from-green-500 to-emerald-500",
  },
  {
    id: "rubber-wheel",
    name: "고무 휠",
    description: "충격 흡수가 우수한 고무 재질",
    image: "/placeholder.svg?height=300&width=400",
    productCount: 28,
    gradient: "from-orange-500 to-red-500",
  },
  {
    id: "drive-module",
    name: "구동 모듈",
    description: "정밀 제어를 위한 구동 모듈",
    image: "/placeholder.svg?height=300&width=400",
    productCount: 18,
    gradient: "from-yellow-500 to-amber-500",
  },
]

const features = [
  {
    id: "expert-consulting",
    title: "전문가 상담",
    description: "20년 경력의 전문가가 맞춤형 솔루션을 제공합니다.",
    icon: Headphones,
  },
  {
    id: "high-quality-products",
    title: "고품질 제품",
    description: "엄격한 품질 관리 시스템을 통해 생산됩니다.",
    icon: Award,
  },
  {
    id: "fast-delivery",
    title: "빠른 배송",
    description: "전국 어디든 신속하게 배송해 드립니다.",
    icon: Zap,
  },
]

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
        setIsAnimating(false)
      }, 300)
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    if (!isAnimating) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
        setIsAnimating(false)
      }, 300)
    }
  }

  const prevSlide = () => {
    if (!isAnimating) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
        setIsAnimating(false)
      }, 300)
    }
  }

  const currentSlideData = heroSlides[currentSlide]

  return (
    <div className="min-h-screen bg-white">
      {/* Translucent scroll header */}
      <ScrollHeader />

      {/* padding for fixed header */}
      <div className="pt-16">
        {/* Hero Slider */}
        <section className="relative h-screen overflow-hidden">
          {/* gradient background */}
          <div className={`absolute inset-0 bg-gradient-to-r ${currentSlideData.bgColor} transition-all duration-1000`}>
            <div className="absolute inset-0 bg-black/20" />
          </div>

          {/* background image */}
          <Image
            src={currentSlideData.image || "/placeholder.svg"}
            alt={currentSlideData.title}
            fill
            className="object-cover opacity-30"
            priority
          />

          {/* slide content */}
          <div className="relative h-full flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* left text */}
                <div
                  className={`text-white transform transition-all duration-700 ${
                    isAnimating ? "translate-x-[-100px] opacity-0" : "translate-x-0 opacity-100"
                  }`}
                >
                  <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
                    <Star className="h-4 w-4 mr-2 text-yellow-400" />
                    20년 경험의 전문 기업
                  </div>
                  <h2 className="text-lg font-medium mb-2 text-blue-200">{currentSlideData.subtitle}</h2>
                  <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">{currentSlideData.title}</h1>
                  <p className="text-xl mb-8 text-blue-100 leading-relaxed max-w-2xl">{currentSlideData.description}</p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/products">
                      <Button
                        size="lg"
                        className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200 group"
                      >
                        {currentSlideData.buttonText}
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* right mock image */}
                <div
                  className={`relative transition-all duration-700 delay-200 ${
                    isAnimating ? "translate-x-[100px] opacity-0" : "translate-x-0 opacity-100"
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-3xl blur-3xl opacity-30" />
                  <Image
                    src="/placeholder.svg?height=500&width=600"
                    alt="Industrial Equipment"
                    width={600}
                    height={500}
                    className="relative rounded-3xl shadow-2xl border border-white/20"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* nav arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-200"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-200"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* indicators */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide ? "bg-white scale-125" : "bg-white/50 hover:bg-white/75"
                }`}
              />
            ))}
          </div>

          {/* progress bar */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
            <div
              className="h-full bg-white transition-all duration-300 ease-linear"
              style={{ width: `${((currentSlide + 1) / heroSlides.length) * 100}%` }}
            />
          </div>
        </section>

        {/* Recommended products */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">RECOMMENDED ITEM</h2>
              <p className="text-lg text-gray-600">고객님께 추천하는 인기 제품들입니다</p>
            </div>

            {/* grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">제품 카테고리</h2>
              <p className="text-lg text-gray-600">다양한 산업 분야에 적용 가능한 캐스터 및 휠을 만나보세요.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <Link key={category.id} href={`/categories/${category.id}`} className="block">
                  <Card className="hover:shadow-lg transition-shadow duration-200">
                    <CardContent className="p-6">
                      <div className="relative h-48 mb-4 rounded-md overflow-hidden">
                        <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-20`} />
                        <Image
                          src={category.image || "/placeholder.svg"}
                          alt={category.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.name}</h3>
                      <p className="text-gray-600">{category.description}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm text-gray-500">{category.productCount} Products</span>
                        <ChevronRight className="h-5 w-5 text-gray-500" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">왜 우리를 선택해야 할까요?</h2>
              <p className="text-lg text-gray-600">고객 만족을 최우선으로 생각하는 우리의 약속입니다.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature) => (
                <div key={feature.id} className="text-center">
                  <div className="flex items-center justify-center h-16 w-16 mx-auto bg-blue-50 rounded-full text-blue-500 mb-4">
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-12 mb-8">
              {/* Notice Section */}
              <div>
                <h3 className="text-lg font-semibold mb-6 text-gray-300">NOTICE</h3>
                <ul className="space-y-3 text-gray-400 text-sm">
                  <li>• 디월트 6월 공식 서비스센터 운영시간 변경 공지</li>
                  <li>• 토탈케어, 스마트블랙앤데커 통합 고객 지원 서비스 (25. ...)</li>
                  <li>• [안내]2025 상반기 웰로페스타 솔다백 사은품 조기 소진 ...</li>
                  <li>• [D-13] 2025 상반기 웰로페스타 마감 임박 및 사은 ...</li>
                  <li>• 6월 휴무 안내</li>
                </ul>
              </div>

              {/* Store Section */}
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-6 text-gray-300">STORE</h3>
                <div className="mb-6">
                  <h4 className="text-xl font-bold mb-2">매장 검색</h4>
                  <p className="text-gray-400 text-sm mb-4">내 주위에서 가장 가까운 매장 위치를 찾을 수 있습니다.</p>
                  <Button variant="outline" className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800">
                    바로가기
                  </Button>
                </div>
              </div>

              {/* Customer Center Section */}
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-6 text-gray-300">CUSTOMER CENTER</h3>
                <div>
                  <h4 className="text-xl font-bold mb-2">문의하기</h4>
                  <p className="text-gray-400 text-sm mb-4">궁금하신 사항이나 문의 하실 내용을 남겨주세요.</p>
                  <Button variant="outline" className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800">
                    바로가기
                  </Button>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-8">
              <div className="grid md:grid-cols-4 gap-8">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">JPCaster v2</h3>
                  <p className="text-gray-400 leading-relaxed">
                    산업용 캐스터 전문업체로 최고 품질의 제품과 서비스를 제공합니다.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-4 text-lg">제품</h4>
                  <ul className="space-y-3 text-gray-400">
                    <li>
                      <Link href="/category/agv-caster" className="hover:text-white transition-colors duration-200">
                        AGV 캐스터
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/category/equipment-caster"
                        className="hover:text-white transition-colors duration-200"
                      >
                        장비용 캐스터
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/category/polyurethane-wheel"
                        className="hover:text-white transition-colors duration-200"
                      >
                        폴리우레탄 휠
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4 text-lg">고객지원</h4>
                  <ul className="space-y-3 text-gray-400">
                    <li>
                      <Link href="/support" className="hover:text-white transition-colors duration-200">
                        문의하기
                      </Link>
                    </li>
                    <li>
                      <Link href="/faq" className="hover:text-white transition-colors duration-200">
                        자주 묻는 질문
                      </Link>
                    </li>
                    <li>
                      <Link href="/warranty" className="hover:text-white transition-colors duration-200">
                        품질보증
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4 text-lg">연락처</h4>
                  <div className="text-gray-400 space-y-3">
                    <p>전화: 02-1234-5678</p>
                    <p>이메일: info@jpcasterpro.co.kr</p>
                    <p>주소: 서울시 강남구 테헤란로 123</p>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-800 pt-8 mt-8 text-center text-gray-400">
                <p>&copy; 2024 JPCaster v2. All rights reserved.</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
