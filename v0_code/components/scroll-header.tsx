"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShoppingCart, Search, ChevronDown } from "lucide-react"

export function ScrollHeader() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50"
          : "bg-white shadow-sm border-b border-gray-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              JPCaster v2
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/company"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              회사소개
            </Link>
            <div className="relative group">
              <button className="flex items-center text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
                제품
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-white/95 backdrop-blur-md rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-2">
                  <Link href="/products" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    전체 제품
                  </Link>
                  <Link href="/category/agv-caster" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    AGV 캐스터
                  </Link>
                  <Link
                    href="/category/equipment-caster"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    장비용 캐스터
                  </Link>
                  <Link
                    href="/category/polyurethane-wheel"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    폴리우레탄 휠
                  </Link>
                </div>
              </div>
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
              <Input
                placeholder="Search products..."
                className="pl-10 pr-4 py-2 w-64 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <Link
              href="/cart"
              className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors duration-200"
            >
              <ShoppingCart className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                3
              </span>
            </Link>
            <Link href="/login">
              <Button variant="ghost" className="font-medium">
                Login
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="outline" className="font-medium bg-transparent">
                Admin
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
