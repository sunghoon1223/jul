"use client"

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Menu, X, ShoppingCart, User, ChevronDown } from 'lucide-react'
import { AuthModal } from '@/components/auth/AuthModal'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)
  const [showProductsMenu, setShowProductsMenu] = useState(false)
  const navigate = useNavigate()
  
  const { user } = useAuth()
  const { itemsCount } = useCart()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`)
      setSearchTerm('')
      setMobileMenuOpen(false)
    }
  }

  const productCategories = [
    { name: 'AGV 캐스터', slug: 'agv-casters' },
    { name: '장비용 캐스터', slug: 'equipment-casters' },
    { name: '폴리우레탄 휠', slug: 'polyurethane-wheels' },
    { name: '고무 휠', slug: 'rubber-wheels' },
    { name: '구동 모듈', slug: 'drive-modules' },
    { name: '메카넘 휠', slug: 'mecanum-wheels' }
  ]

  return (
    <>
      <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-200/20' 
          : 'bg-white border-b border-gray-200'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                JP캐스터
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                to="/company" 
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors relative group"
              >
                회사소개
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              
              <div 
                className="relative group"
                onMouseEnter={() => setShowProductsMenu(true)}
                onMouseLeave={() => setShowProductsMenu(false)}
              >
                <Link 
                  to="/products" 
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-1"
                >
                  제품
                  <ChevronDown className="h-3 w-3" />
                </Link>
                
                {showProductsMenu && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl py-2">
                    {productCategories.map((category) => (
                      <Link
                        key={category.slug}
                        to={`/categories/${category.slug}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        onClick={() => setShowProductsMenu(false)}
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              
              <Link 
                to="/support" 
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors relative group"
              >
                고객지원
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </nav>

            {/* Search and Actions */}
            <div className="flex items-center space-x-4">
              {/* Desktop Search */}
              <form onSubmit={handleSearch} className="hidden lg:flex items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="제품 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64 pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </form>

              {/* Cart */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCartOpen(true)}
                className="relative hover:bg-blue-50"
              >
                <ShoppingCart className="h-5 w-5 text-gray-600" />
                {itemsCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-blue-600"
                  >
                    {itemsCount}
                  </Badge>
                )}
              </Button>

              {/* User Menu */}
              {user ? (
                <Button variant="ghost" size="sm" className="hover:bg-blue-50">
                  <User className="h-5 w-5 text-gray-600" />
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAuthModalOpen(true)}
                  className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                >
                  로그인
                </Button>
              )}

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden hover:bg-blue-50"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4 bg-white/95 backdrop-blur-md">
              <nav className="flex flex-col space-y-4">
                <Link
                  to="/company"
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  회사소개
                </Link>
                <Link
                  to="/products"
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  제품
                </Link>
                <Link
                  to="/support"
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  고객지원
                </Link>
                
                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="search"
                      placeholder="제품 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-gray-200 focus:border-blue-500"
                    />
                  </div>
                </form>
              </nav>
            </div>
          )}
        </div>
      </header>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </>
  )
}