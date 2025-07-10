"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Star, ShoppingCart } from "lucide-react"

const recommendedProducts = [
  {
    id: 1,
    name: "AGV 중하중용 캐스터 200mm",
    description: "최대 하중 500kg, 정밀 볼베어링 적용",
    price: 85000,
    originalPrice: 95000,
    image: "/placeholder.svg?height=250&width=250",
    rating: 4.8,
    isNew: true,
  },
  {
    id: 2,
    name: "산업용 폴리우레탄 휠 150mm",
    description: "내마모성이 뛰어난 폴리우레탄 소재",
    price: 45000,
    image: "/placeholder.svg?height=250&width=250",
    rating: 4.6,
    isNew: false,
  },
  {
    id: 3,
    name: "메카넘 휠 세트 (4개입)",
    description: "전방향 이동이 가능한 특수 설계",
    price: 320000,
    originalPrice: 350000,
    image: "/placeholder.svg?height=250&width=250",
    rating: 4.9,
    isNew: true,
  },
  {
    id: 4,
    name: "고무 완충 캐스터 100mm",
    description: "진동 흡수가 우수한 고무 소재",
    price: 32000,
    image: "/placeholder.svg?height=250&width=250",
    rating: 4.5,
    isNew: false,
  },
  {
    id: 5,
    name: "전동 구동 모듈 250W",
    description: "고효율 전동 구동 시스템",
    price: 450000,
    image: "/placeholder.svg?height=250&width=250",
    rating: 4.7,
    isNew: false,
  },
]

export function RecommendedProducts() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const itemsPerPage = 4

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.ceil(recommendedProducts.length / itemsPerPage))
  }

  const prevSlide = () => {
    setCurrentIndex(
      (prev) =>
        (prev - 1 + Math.ceil(recommendedProducts.length / itemsPerPage)) %
        Math.ceil(recommendedProducts.length / itemsPerPage),
    )
  }

  const visibleProducts = recommendedProducts.slice(currentIndex * itemsPerPage, (currentIndex + 1) * itemsPerPage)

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">RECOMMENDED ITEM</h2>
          <p className="text-lg text-gray-600">고객님께 추천하는 인기 제품들입니다</p>
        </div>

        <div className="relative">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {visibleProducts.map((product) => (
              <Card
                key={product.id}
                className="group hover:shadow-xl transition-all duration-300 border-0 bg-white overflow-hidden hover:-translate-y-2"
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
                  </div>

                  <div className="p-6">
                    <Link href={`/product/${product.id}`}>
                      <h3 className="font-bold text-lg text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

                    <div className="flex items-center mb-4">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="ml-1 text-sm text-gray-600">{product.rating}</span>
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

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="h-6 w-6 text-gray-600" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors"
          >
            <ChevronRight className="h-6 w-6 text-gray-600" />
          </button>

          {/* Pagination Dots */}
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: Math.ceil(recommendedProducts.length / itemsPerPage) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? "bg-blue-600" : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
