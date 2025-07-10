"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, ShoppingCart, Star } from "lucide-react"

const products = [
  {
    id: 1,
    name: "AGV 중하중용 캐스터 200mm",
    category: "AGV 캐스터",
    price: 85000,
    originalPrice: 95000,
    image: "/placeholder.svg?height=250&width=250",
    rating: 4.8,
    reviews: 24,
    inStock: true,
    isNew: true,
    description: "AGV 시스템에 최적화된 고강도 캐스터",
  },
  {
    id: 2,
    name: "산업용 폴리우레탄 휠 150mm",
    category: "폴리우레탄 휠",
    price: 45000,
    originalPrice: null,
    image: "/placeholder.svg?height=250&width=250",
    rating: 4.6,
    reviews: 18,
    inStock: true,
    isNew: false,
    description: "내마모성이 뛰어난 폴리우레탄 소재",
  },
  {
    id: 3,
    name: "메카넘 휠 세트 (4개입)",
    category: "메카넘 휠",
    price: 320000,
    originalPrice: 350000,
    image: "/placeholder.svg?height=250&width=250",
    rating: 4.9,
    reviews: 12,
    inStock: true,
    isNew: true,
    description: "전방향 이동이 가능한 특수 설계",
  },
  {
    id: 4,
    name: "고무 완충 캐스터 100mm",
    category: "고무 휠",
    price: 32000,
    originalPrice: null,
    image: "/placeholder.svg?height=250&width=250",
    rating: 4.5,
    reviews: 31,
    inStock: false,
    isNew: false,
    description: "진동 흡수가 우수한 고무 소재",
  },
  {
    id: 5,
    name: "전동 구동 모듈 250W",
    category: "구동 모듈",
    price: 450000,
    originalPrice: null,
    image: "/placeholder.svg?height=250&width=250",
    rating: 4.7,
    reviews: 8,
    inStock: true,
    isNew: false,
    description: "고효율 전동 구동 시스템",
  },
  {
    id: 6,
    name: "장비용 고하중 캐스터 300mm",
    category: "장비용 캐스터",
    price: 125000,
    originalPrice: 140000,
    image: "/placeholder.svg?height=250&width=250",
    rating: 4.8,
    reviews: 19,
    inStock: true,
    isNew: false,
    description: "최대 500kg까지 지지 가능",
  },
]

const categories = ["전체", "AGV 캐스터", "장비용 캐스터", "폴리우레탄 휠", "고무 휠", "구동 모듈", "메카넘 휠"]

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("전체")
  const [sortBy, setSortBy] = useState("name")

  const filteredProducts = products
    .filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedCategory === "전체" || product.category === selectedCategory),
    )
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header - Same as homepage */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link
              href="/"
              className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            >
              CasterPro
            </Link>
            <nav className="hidden md:flex space-x-10">
              <Link href="/products" className="text-blue-600 font-medium relative">
                전체상품
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-600"></span>
              </Link>
              <Link
                href="/categories"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 relative group"
              >
                카테고리
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <Link
                href="/about"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 relative group"
              >
                회사소개
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <Link
                href="/contact"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 relative group"
              >
                고객지원
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-200 group-hover:w-full"></span>
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link
                href="/cart"
                className="relative p-3 text-gray-700 hover:text-blue-600 transition-colors duration-200 hover:bg-blue-50 rounded-full"
              >
                <ShoppingCart className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium shadow-lg">
                  3
                </span>
              </Link>
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="font-medium hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
                >
                  로그인
                </Button>
              </Link>
              <Link href="/admin">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-6 shadow-lg hover:shadow-xl transition-all duration-200">
                  관리자
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">전체 상품</h1>
          <p className="text-gray-600">고품질 캐스터와 휠을 찾아보세요</p>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="제품명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="정렬 기준" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">이름순</SelectItem>
                <SelectItem value="price-low">가격 낮은순</SelectItem>
                <SelectItem value="price-high">가격 높은순</SelectItem>
                <SelectItem value="rating">평점순</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              필터 초기화
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm overflow-hidden hover:-translate-y-2"
            >
              <CardContent className="p-0">
                <Link href={`/product/${product.id}`}>
                  <div className="relative">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      width={250}
                      height={250}
                      className="w-full h-64 object-cover rounded-t-lg"
                    />
                    {product.isNew && <Badge className="absolute top-3 left-3 bg-green-500">신제품</Badge>}
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-t-lg">
                        <span className="text-white font-semibold">품절</span>
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-4">
                  <div className="mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {product.category}
                    </Badge>
                  </div>

                  <Link href={`/product/${product.id}`}>
                    <h3 className="font-semibold text-gray-900 mb-2 hover:text-blue-600">{product.name}</h3>
                  </Link>

                  <p className="text-sm text-gray-600 mb-3">{product.description}</p>

                  <div className="flex items-center mb-3">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="ml-1 text-sm text-gray-600">
                        {product.rating} ({product.reviews})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-gray-900">₩{product.price.toLocaleString()}</span>
                      {product.originalPrice && (
                        <span className="ml-2 text-sm text-gray-500 line-through">
                          ₩{product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <Button size="sm" disabled={!product.inStock} className="flex items-center gap-1">
                      <ShoppingCart className="h-4 w-4" />
                      담기
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">검색 결과가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  )
}
