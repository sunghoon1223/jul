"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  Search,
  ChevronDown,
  Gift,
  Truck,
  CreditCard,
  Shield,
} from "lucide-react"

const initialCartItems = [
  {
    id: 1,
    name: "AGV 중하중용 캐스터 200mm",
    price: 85000,
    quantity: 2,
    image: "/placeholder.svg?height=100&width=100",
    options: "토탈 락 브레이크",
    optionPrice: 15000,
    inStock: true,
  },
  {
    id: 2,
    name: "산업용 폴리우레탄 휠 150mm",
    price: 45000,
    quantity: 1,
    image: "/placeholder.svg?height=100&width=100",
    options: "브레이크 없음",
    optionPrice: 0,
    inStock: true,
  },
  {
    id: 3,
    name: "메카넘 휠 세트 (4개입)",
    price: 320000,
    quantity: 1,
    image: "/placeholder.svg?height=100&width=100",
    options: "기본형",
    optionPrice: 0,
    inStock: true,
  },
]

export default function CartPage() {
  const [cartItems, setCartItems] = useState(initialCartItems)
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null)

  const updateQuantity = (id: number, change: number) => {
    setCartItems((items) =>
      items.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, item.quantity + change) } : item)),
    )
  }

  const removeItem = (id: number) => {
    setCartItems((items) => items.filter((item) => item.id !== id))
  }

  const applyCoupon = () => {
    if (couponCode === "WELCOME10") {
      setAppliedCoupon({ code: couponCode, discount: 0.1 })
      setCouponCode("")
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price + item.optionPrice) * item.quantity, 0)
  const couponDiscount = appliedCoupon ? subtotal * appliedCoupon.discount : 0
  const shipping = subtotal >= 100000 ? 0 : 3000
  const total = subtotal - couponDiscount + shipping

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
                <button className="flex items-center text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
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
              <Link href="/cart" className="relative p-2 text-blue-600">
                <ShoppingCart className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {cartItems.length}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">장바구니</h1>
            <p className="text-gray-600">{cartItems.length}개 상품이 담겨있습니다</p>
          </div>
          <Link href="/products" className="flex items-center text-blue-600 hover:text-blue-700">
            <ArrowLeft className="h-5 w-5 mr-2" />
            쇼핑 계속하기
          </Link>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">장바구니가 비어있습니다</h2>
            <p className="text-gray-600 mb-8">원하는 상품을 장바구니에 담아보세요</p>
            <Link href="/products">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                상품 둘러보기
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          width={100}
                          height={100}
                          className="rounded-lg border object-cover"
                        />
                        {!item.inStock && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs font-medium">품절</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-gray-900 mb-1 truncate">{item.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">옵션: {item.options}</p>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-gray-900">
                            ₩{(item.price + item.optionPrice).toLocaleString()}
                          </span>
                          {item.optionPrice > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              +₩{item.optionPrice.toLocaleString()}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="flex items-center border rounded-lg">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.id, -1)}
                            disabled={item.quantity <= 1}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.id, 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900 mb-2">
                          ₩{((item.price + item.optionPrice) * item.quantity).toLocaleString()}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Coupon Section */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Gift className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="font-semibold text-gray-900">할인 쿠폰</h3>
                  </div>

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center">
                        <Badge className="bg-green-500 mr-2">{appliedCoupon.code}</Badge>
                        <span className="text-sm text-green-700">{appliedCoupon.discount * 100}% 할인 적용됨</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAppliedCoupon(null)}
                        className="text-green-600 hover:text-green-700"
                      >
                        제거
                      </Button>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <Input
                        placeholder="쿠폰 코드 입력 (WELCOME10)"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={applyCoupon} variant="outline">
                        적용
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <Card className="border-0 shadow-sm sticky top-24">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-6">주문 요약</h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">상품 금액</span>
                      <span className="font-medium">₩{subtotal.toLocaleString()}</span>
                    </div>

                    {appliedCoupon && (
                      <div className="flex justify-between text-green-600">
                        <span>쿠폰 할인</span>
                        <span>-₩{couponDiscount.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-gray-600">배송비</span>
                      <span className="font-medium">
                        {shipping === 0 ? (
                          <span className="text-green-600">무료</span>
                        ) : (
                          `₩${shipping.toLocaleString()}`
                        )}
                      </span>
                    </div>

                    {shipping > 0 && (
                      <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                        ₩{(100000 - subtotal).toLocaleString()} 더 구매하시면 무료배송!
                      </div>
                    )}
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-between text-xl font-bold mb-6">
                    <span>총 결제 금액</span>
                    <span className="text-blue-600">₩{total.toLocaleString()}</span>
                  </div>

                  <Link href="/checkout">
                    <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 mb-4">
                      <CreditCard className="h-5 w-5 mr-2" />
                      주문하기
                    </Button>
                  </Link>

                  <div className="text-center">
                    <Link href="/products" className="text-blue-600 hover:underline text-sm">
                      쇼핑 계속하기
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Benefits */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">구매 혜택</h3>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <Truck className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-gray-700">전국 무료배송 (10만원 이상)</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Shield className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-gray-700">1년 품질보증</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Gift className="h-4 w-4 text-purple-600 mr-2" />
                      <span className="text-gray-700">적립금 1% 지급</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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
