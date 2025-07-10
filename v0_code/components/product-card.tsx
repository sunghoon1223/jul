"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, Eye } from "lucide-react"

interface ProductCardProps {
  product: {
    id: number
    name: string
    price: number
    originalPrice?: number
    image: string
    rating: number
    reviews?: number
    inStock: boolean
    isNew?: boolean
    description: string
    category?: string
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          width={300}
          height={300}
          className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Overlay with View Details Button */}
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center transition-all duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <Link href={`/product/${product.id}`}>
            <Button
              size="lg"
              className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-6 py-3 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
            >
              <Eye className="h-5 w-5 mr-2" />
              상세보기
            </Button>
          </Link>
        </div>

        {/* Badges */}
        {product.isNew && <Badge className="absolute top-3 left-3 bg-green-500">신제품</Badge>}
        {product.originalPrice && (
          <Badge className="absolute top-3 right-3 bg-red-500">
            {Math.round((1 - product.price / product.originalPrice) * 100)}% 할인
          </Badge>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold bg-gray-800 px-4 py-2 rounded-lg">품절</span>
          </div>
        )}
      </div>

      <div className="p-6">
        {product.category && (
          <Badge variant="secondary" className="mb-3 text-xs">
            {product.category}
          </Badge>
        )}

        <Link href={`/product/${product.id}`}>
          <h3 className="font-bold text-lg text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

        {product.reviews && (
          <div className="flex items-center mb-4">
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="ml-1 text-sm text-gray-600">
                {product.rating} ({product.reviews})
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-gray-900">₩{product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="ml-2 text-sm text-gray-500 line-through">₩{product.originalPrice.toLocaleString()}</span>
            )}
          </div>
          <Button size="sm" disabled={!product.inStock} className="flex items-center gap-1">
            <ShoppingCart className="h-4 w-4" />
            담기
          </Button>
        </div>
      </div>
    </div>
  )
}
