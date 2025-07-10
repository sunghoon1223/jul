"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, ShoppingCart, Star, ChevronDown, Grid3X3, List, ArrowLeft, Heart, Package } from "lucide-react"

const categoryData = {
  "agv-caster": {
    name: "AGV 캐스터",
    description: "자동 운반 차량(AGV)에 최적화된 전문 캐스터",
    image: "/placeholder.svg?height=400&width=800",
    products: [
      {
        id: 1,
        name: "AGV 중하중용 캐스터 200mm",
        price: 85000,
        originalPrice: 95000,
        image: "/placeholder.svg?height=250&width=250",
        rating: 4.8,
        reviews: 24,
        inStock: true,
        isNew: true,
        description: "최대 하중 500kg, 정밀 볼베어링 적용",
        specs: ["하중: 500kg", "직경: 200mm", "베어링: 볼베어링"],
      },
      {
        id: 2,
        name: "AGV 경량용 캐스터 150mm",
        price: 65000,
        originalPrice: null,
        image: "/placeholder.svg?height=250&width=250",
        rating: 4.6,
        reviews: 18,
        inStock: true,
        isNew: false,
        description: "경량 AGV용 고성능 캐스터",
        specs: ["하중: 300kg", "직경: 150mm", "베어링: 볼베어링"],
      },
      {
        id: 3,
        name: "AGV 방향전환 캐스터 180mm",
        price: 95000,
        originalPrice: 110000,
        image: "/placeholder.svg?height=250&width=250",
        rating: 4.9,
        reviews: 12,
        inStock: true,
        isNew: true,
        description: "360도 자유 회전 가능한 방향전환 캐스터",
        specs: ["하중: 400kg", "직경: 180mm", "회전: 360도"],
      },
      {
        id: 4,
        name: "AGV 브레이크 캐스터 200mm",
        price: 120000,
        originalPrice: null,
        image: "/placeholder.svg?height=250&width=250",
        rating: 4.7,
        reviews: 15,
        inStock: true,
        isNew: false,
        description: "토탈락 브레이크 시스템 적용",
        specs: ["하중: 500kg", "직경: 200mm", "브레이크: 토탈락"],
      },
    ],
  },
}

export default function CategoryPage({ params }: { params: { id: string } }) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("name")
  const [priceRange, setPriceRange] = useState("all")

  const category = categoryData[params.id as keyof typeof categoryData] || categoryData["agv-caster"]

  const filteredProducts = category.products
    .filter((product) => {
      if (priceRange === "all") return true
      if (priceRange === "under-50k") return product.price < 50000
      if (priceRange === "50k-100k") return product.price >= 50000 && product.price < 100000
      if (priceRange === "over-100k") return product.price >= 100000
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "rating":
          return b.rating - a.rating
        default:
          return a.name.localeCompare(b.name)
      }
    })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              JPCaster v2
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="/company"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
              >
                회사소개
              </Link>
              <div className="relative group">
                <button className="flex items-center text-blue-600 font-medium">
                  제품 <ChevronDown className="ml-1 h-4 w-4" />
                </button>
              </div>
              <Link
                href="/support"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
              >
                고객지원
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search products..." className="pl-10 pr-4 py-2 w-64" />
              </div>
              <Link href="/cart" className="relative p-2 text-gray-700 hover:text-blue-600">
                <ShoppingCart className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </Link>
              <Link href="/login">
                <Button variant="ghost">로그인</Button>
              </Link>
              <Link href="/admin">
                <Button className="bg-blue-600 hover:bg-blue-700">관리자</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-blue-600">
              홈
            </Link>
            <span className="text-gray-400">/</span>
            <Link href="/products" className="text-gray-500 hover:text-blue-600">
              제품
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{category.name}</span>
          </div>
        </div>
      </div>

      {/* Category Hero */}
      <section className="relative py-16 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <Link href="/products" className="inline-flex items-center text-blue-200 hover:text-white mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                전체 제품으로 돌아가기
              </Link>
              <h1 className="text-4xl font-bold mb-4">{category.name}</h1>
              <p className="text-xl text-blue-100 mb-6">{category.description}</p>
              <div className="flex items-center space-x-4">
                <Badge className="bg-white/20 text-white">{category.products.length}개 제품</Badge>
                <Badge className="bg-white/20 text-white">무료배송</Badge>
                <Badge className="bg-white/20 text-white">1년 보증</Badge>
              </div>
            </div>
            <div className="relative">
              <Image
                src={category.image || "/placeholder.svg"}
                alt={category.name}
                width={800}
                height={400}
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Controls */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="정렬 기준" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">이름순</SelectItem>
                  <SelectItem value="price-low">가격 낮은순</SelectItem>
                  <SelectItem value="price-high">가격 높은순</SelectItem>
                  <SelectItem value="rating">평점순</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="가격대" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 가격</SelectItem>
                  <SelectItem value="under-50k">5만원 미만</SelectItem>
                  <SelectItem value="50k-100k">5만원 - 10만원</SelectItem>
                  <SelectItem value="over-100k">10만원 이상</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <Filter className="h-4 w-4" />
                필터 초기화
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">{filteredProducts.length}개 제품</span>
              <div className="flex border rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${viewMode === "grid" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${viewMode === "list" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        {viewMode === "grid" ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white overflow-hidden hover:-translate-y-2"
              >
                <CardContent className="p-0">
                  <div className="relative">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      width={250}
                      height={250}
                      className="w-full h-64 object-cover"
                    />
                    {product.isNew && <Badge className="absolute top-3 left-3 bg-green-500">신제품</Badge>}
                    {product.originalPrice && (
                      <Badge className="absolute top-3 right-3 bg-red-500">
                        {Math.round((1 - product.price / product.originalPrice) * 100)}% 할인
                      </Badge>
                    )}
                    <button className="absolute top-3 right-3 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Heart className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>

                  <div className="p-6">
                    <Link href={`/product/${product.id}`}>
                      <h3 className="font-bold text-lg text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>
                    </Link>

                    <p className="text-gray-600 text-sm mb-3">{product.description}</p>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {product.specs.map((spec, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center mb-4">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="ml-1 text-sm text-gray-600">
                          {product.rating} ({product.reviews})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xl font-bold text-gray-900">₩{product.price.toLocaleString()}</span>
                        {product.originalPrice && (
                          <span className="ml-2 text-sm text-gray-500 line-through">
                            ₩{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <Button size="sm" className="flex items-center gap-1">
                        <ShoppingCart className="h-4 w-4" />
                        담기
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      width={150}
                      height={150}
                      className="rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <Link href={`/product/${product.id}`}>
                            <h3 className="font-bold text-xl text-gray-900 mb-2 hover:text-blue-600">{product.name}</h3>
                          </Link>
                          <p className="text-gray-600 mb-3">{product.description}</p>
                          <div className="flex items-center mb-3">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="ml-1 text-sm text-gray-600">
                              {product.rating} ({product.reviews} 리뷰)
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {product.specs.map((spec, index) => (
                              <Badge key={index} variant="secondary">
                                {spec}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900 mb-2">₩{product.price.toLocaleString()}</div>
                          {product.originalPrice && (
                            <div className="text-sm text-gray-500 line-through mb-2">
                              ₩{product.originalPrice.toLocaleString()}
                            </div>
                          )}
                          <Button className="flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4" />
                            장바구니 담기
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Package className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">검색 결과가 없습니다</h3>
            <p className="text-gray-600 mb-6">다른 조건으로 검색해보세요</p>
            <Button
              onClick={() => {
                setSortBy("name")
                setPriceRange("all")
              }}
            >
              필터 초기화
            </Button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
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
                  <Link href="/category/equipment-caster" className="hover:text-white transition-colors duration-200">
                    장비용 캐스터
                  </Link>
                </li>
                <li>
                  <Link href="/category/polyurethane-wheel" className="hover:text-white transition-colors duration-200">
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
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 JPCaster v2. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
