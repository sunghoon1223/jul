"use client"

import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { ShoppingCart, Eye } from 'lucide-react'
import type { ProductWithCategory } from '@/types/supabase'
import { useState } from 'react'
import { useCart } from '@/hooks/useCart'

interface ProductCardProps {
  product: ProductWithCategory
}

export function ProductCard({ product }: ProductCardProps) {
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)
  const { addToCart } = useCart()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(price).replace('₩', '₩ ')
  }

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await addToCart(product.id, 1)
  }

  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-0 shadow-lg bg-white overflow-hidden"
      onMouseEnter={() => setShowOverlay(true)}
      onMouseLeave={() => setShowOverlay(false)}
    >
      <CardContent className="p-0">
        <div className="relative overflow-hidden">
          <AspectRatio ratio={1} className="bg-gray-100">
            {product.main_image_url && !imageError ? (
              <img
                src={product.main_image_url}
                alt={product.name}
                className={`object-cover w-full h-full transition-all duration-500 group-hover:scale-110 ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageError(true)
                  setImageLoading(false)
                }}
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-400">
                <div className="text-center">
                  <div className="text-4xl mb-2">📦</div>
                  <p className="text-sm">이미지 없음</p>
                </div>
              </div>
            )}
            
            {/* Hover Overlay */}
            <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center gap-3 transition-all duration-300 ${
              showOverlay ? 'opacity-100' : 'opacity-0'
            }`}>
              <Button 
                asChild
                size="sm" 
                className="bg-white/90 text-gray-900 hover:bg-white hover:text-black shadow-lg"
              >
                <Link to={`/products/${product.slug}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  상세보기
                </Link>
              </Button>
              <Button 
                size="sm" 
                onClick={handleAddToCart}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                장바구니
              </Button>
            </div>
          </AspectRatio>
          
          <div className="p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight text-sm">
                {product.name}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {product.category.name}
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-blue-600">
                {formatPrice(product.price)}
              </div>
              {product.stock_quantity > 0 ? (
                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  재고 있음
                </span>
              ) : (
                <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                  품절
                </span>
              )}
            </div>
            
            {product.sku && (
              <p className="text-xs text-gray-400 font-mono">
                SKU: {product.sku}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}