"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ShoppingCart,
  Star,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Minus,
  Plus,
  Search,
  ChevronDown,
  ArrowLeft,
  Check,
  Info,
} from "lucide-react"

const productData = {
  id: 1,
  name: "AGV 중하중용 캐스터 200mm",
  category: "AGV 캐스터",
  price: 85000,
  originalPrice: 95000,
  images: [
    "/placeholder.svg?height=500&width=500",
    "/placeholder.svg?height=500&width=500",
    "/placeholder.svg?height=500&width=500",
    "/placeholder.svg?height=500&width=500",
  ],
  rating: 4.8,
  reviews: 24,
  inStock: true,
  stockCount: 15,
  isNew: true,
  shortDescription: "AGV 시스템에 최적화된 고강도 캐스터로, 무인 운반 차량의 안정적인 이동을 보장합니다.",
  features: [
    "최대 하중: 500kg",
    "휠 직경: 200mm",
    "베어링: 정밀 볼 베어링",
    "소재: 고강도 폴리우레탄",
    "브레이크: 토탈 락 브레이크",
    "온도 범위: -20°C ~ +80°C",
    "소음 수준: 저소음 설계",
    "내구성: 50만회 이상 테스트 완료",
  ],
  specifications: {
    "제품 코드": "AGV-200-PU-BL",
    "휠 직경": "200mm",
    "휠 폭": "50mm",
    "전체 높이": "235mm",
    "플레이트 크기": "140 x 110mm",
    "볼트 구멍": "M12 x 4개",
    "최대 하중": "500kg",
    소재: "폴리우레탄",
    베어링: "정밀 볼 베어링",
    브레이크: "토탈 락",
    제조국: "한국",
    품질인증: "ISO 9001, CE",
  },
  options: [
    { name: "브레이크 없음", price: 0 },
    { name: "토탈 락 브레이크", price: 15000 },
    { name: "방향 락 브레이크", price: 10000 },
  ],
}

const reviews = [
  {
    id: 1,
    user: "김**",
    rating: 5,
    date: "2024-01-15",
    content: "AGV에 사용하고 있는데 매우 만족합니다. 조용하고 부드럽게 작동해요. 품질이 정말 좋습니다.",
    helpful: 12,
  },
  {
    id: 2,
    user: "박**",
    rating: 4,
    date: "2024-01-10",
    content: "품질이 좋고 내구성도 뛰어납니다. 다만 가격이 조금 비싼 편이네요. 그래도 성능을 생각하면 만족합니다.",
    helpful: 8,
  },
  {
    id: 3,
    user: "이**",
    rating: 5,
    date: "2024-01-08",
    content: "무거운 장비에 사용했는데 전혀 문제없이 잘 굴러갑니다. 브레이크 기능도 확실하고 추천합니다.",
    helpful: 15,
  },
]

export default function ProductDetailPage() {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedOption, setSelectedOption] = useState("")
  const [activeTab, setActiveTab] = useState("description")

  const handleQuantityChange = (change: number) => {
    setQuantity(Math.max(1, Math.min(productData.stockCount, quantity + change)))
  }

  const selectedOptionPrice = productData.options.find((opt) => opt.name === selectedOption)?.price || 0
  const totalPrice = (productData.price + selectedOptionPrice) * quantity

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
                <input
                  placeholder="Search products..."
                  className="pl-10 pr-4 py-2 w-64 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
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
            <Link href="/category/agv-caster" className="text-gray-500 hover:text-blue-600">
              {productData.category}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{productData.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/category/agv-caster" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {productData.category}로 돌아가기
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative bg-white rounded-2xl p-4 shadow-sm">
              <Image
                src={productData.images[selectedImage] || "/placeholder.svg"}
                alt={productData.name}
                width={500}
                height={500}
                className="w-full h-96 object-cover rounded-xl"
              />
              {productData.isNew && <Badge className="absolute top-6 left-6 bg-green-500">신제품</Badge>}
              {productData.originalPrice && (
                <Badge className="absolute top-6 right-6 bg-red-500">
                  {Math.round((1 - productData.price / productData.originalPrice) * 100)}% 할인
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2">
              {productData.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`border-2 rounded-lg overflow-hidden transition-all ${
                    selectedImage === index
                      ? "border-blue-600 ring-2 ring-blue-200"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${productData.name} ${index + 1}`}
                    width={100}
                    height={100}
                    className="w-full h-20 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-3">
                {productData.category}
              </Badge>
              {productData.isNew && <Badge className="ml-2 bg-green-500">신제품</Badge>}

              <h1 className="text-3xl font-bold text-gray-900 mb-4">{productData.name}</h1>

              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(productData.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-gray-600">
                    {productData.rating} ({productData.reviews}개 리뷰)
                  </span>
                </div>
                <div className="flex items-center text-green-600">
                  <Check className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">재고 {productData.stockCount}개</span>
                </div>
              </div>

              <p className="text-gray-600 text-lg leading-relaxed">{productData.shortDescription}</p>
            </div>

            {/* Price */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl font-bold text-gray-900">₩{productData.price.toLocaleString()}</span>
                {productData.originalPrice && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      ₩{productData.originalPrice.toLocaleString()}
                    </span>
                    <Badge variant="destructive" className="text-sm">
                      {Math.round((1 - productData.price / productData.originalPrice) * 100)}% 할인
                    </Badge>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-600">부가세 포함 가격</p>
            </div>

            {/* Options */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">브레이크 옵션</label>
                <Select value={selectedOption} onValueChange={setSelectedOption}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="옵션을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {productData.options.map((option) => (
                      <SelectItem key={option.name} value={option.name}>
                        {option.name} {option.price > 0 && `(+₩${option.price.toLocaleString()})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">수량</label>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="h-10 w-10 p-0"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-medium w-16 text-center bg-gray-50 py-2 rounded-lg">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= productData.stockCount}
                    className="h-10 w-10 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-500 ml-4">재고: {productData.stockCount}개</span>
                </div>
              </div>

              {selectedOption && selectedOptionPrice > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">옵션 추가 금액:</span>
                    <span className="font-medium text-blue-600">
                      +₩{(selectedOptionPrice * quantity).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-blue-200">
                    <span className="font-medium text-gray-900">총 금액:</span>
                    <span className="text-xl font-bold text-blue-600">₩{totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4">
                <ShoppingCart className="h-5 w-5 mr-2" />₩{totalPrice.toLocaleString()} - 장바구니 담기
              </Button>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" size="lg" className="flex items-center justify-center gap-2 bg-transparent">
                  <Heart className="h-5 w-5" />
                  찜하기
                </Button>
                <Button variant="outline" size="lg" className="flex items-center justify-center gap-2 bg-transparent">
                  <Share2 className="h-5 w-5" />
                  공유하기
                </Button>
              </div>
            </div>

            {/* Service Info */}
            <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50 rounded-2xl">
              <div className="text-center">
                <Truck className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">빠른 배송</p>
                <p className="text-xs text-gray-600">당일/익일 배송</p>
              </div>
              <div className="text-center">
                <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">품질 보증</p>
                <p className="text-xs text-gray-600">1년 무상 A/S</p>
              </div>
              <div className="text-center">
                <RotateCcw className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">교환/반품</p>
                <p className="text-xs text-gray-600">7일 무료</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="description">상품 설명</TabsTrigger>
            <TabsTrigger value="specifications">상세 규격</TabsTrigger>
            <TabsTrigger value="reviews">리뷰 ({productData.reviews})</TabsTrigger>
            <TabsTrigger value="qna">문의</TabsTrigger>
          </TabsList>

          <TabsContent value="description">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-6">제품 특징</h3>
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  {productData.features.map((feature, index) => (
                    <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
                      <Check className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="prose max-w-none">
                  <h4 className="text-xl font-semibold mb-4">상세 설명</h4>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    이 AGV 캐스터는 무인 운반 차량(AGV)의 특수한 요구사항을 충족하도록 설계되었습니다. 고강도 폴리우레탄
                    휠은 뛰어난 내마모성과 조용한 작동을 제공하며, 정밀한 볼 베어링 시스템으로 부드럽고 안정적인 회전을
                    보장합니다.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    토탈 락 브레이크 시스템은 AGV의 정확한 위치 제어를 가능하게 하며, 견고한 스틸 플레이트는 장기간
                    사용에도 변형 없이 안정적인 성능을 유지합니다.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    -20°C부터 +80°C까지의 넓은 온도 범위에서 안정적으로 작동하며, 50만회 이상의 내구성 테스트를 통과한
                    검증된 품질을 자랑합니다.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specifications">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-6">상세 규격</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {Object.entries(productData.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="font-medium text-gray-700">{key}</span>
                      <span className="text-gray-900 font-semibold">{value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">품질 인증</h4>
                      <p className="text-blue-800 text-sm">
                        본 제품은 ISO 9001 품질경영시스템 및 CE 인증을 획득한 제품으로, 엄격한 품질 관리 하에 생산되어
                        안전성과 신뢰성이 검증되었습니다.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold">고객 리뷰</h3>
                  <Button variant="outline">리뷰 작성하기</Button>
                </div>

                <div className="flex items-center mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center mr-6">
                    <span className="text-3xl font-bold text-gray-900 mr-2">{productData.rating}</span>
                    <div>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">{productData.reviews}개 리뷰</p>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="space-y-1">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center">
                          <span className="text-sm w-8">{rating}점</span>
                          <div className="flex-1 mx-2 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-400 h-2 rounded-full"
                              style={{ width: `${rating === 5 ? 70 : rating === 4 ? 20 : 10}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-8">
                            {rating === 5 ? "17" : rating === 4 ? "5" : "2"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="flex mr-3">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                              />
                            ))}
                          </div>
                          <span className="font-medium text-gray-900">{review.user}</span>
                          <span className="ml-3 text-sm text-gray-500">{review.date}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="text-gray-500">
                          도움됨 {review.helpful}
                        </Button>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{review.content}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qna">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold">상품 문의</h3>
                  <Button>문의하기</Button>
                </div>

                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-6">
                    <div className="flex items-start mb-3">
                      <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1">
                        Q
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-1">다른 크기도 주문 가능한가요?</p>
                        <p className="text-sm text-gray-500">김** • 2024.01.12</p>
                      </div>
                    </div>
                    <div className="flex items-start ml-9">
                      <div className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">
                        A
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-700 mb-1">
                          네, 150mm, 250mm 크기도 제작 가능합니다. 별도 문의 부탁드립니다.
                        </p>
                        <p className="text-sm text-gray-500">JPCaster 고객지원팀 • 2024.01.12</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-b border-gray-200 pb-6">
                    <div className="flex items-start mb-3">
                      <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1">
                        Q
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-1">배송 기간은 얼마나 걸리나요?</p>
                        <p className="text-sm text-gray-500">박** • 2024.01.10</p>
                      </div>
                    </div>
                    <div className="flex items-start ml-9">
                      <div className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3">
                        A
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-700 mb-1">
                          재고 보유 제품은 당일 출고되며, 맞춤 제작 시 3-5일 소요됩니다.
                        </p>
                        <p className="text-sm text-gray-500">JPCaster 고객지원팀 • 2024.01.10</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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
