import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, X, Search, ShoppingCart, User, LogOut, Phone, Award, MapPin, ChevronDown, Globe, Grid3X3, Settings, Truck, Star, Shield } from "lucide-react";
import { AuthModal } from '@/components/auth/AuthModal'
import { AdminLoginModal } from '@/components/auth/AdminLoginModal'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { useAdmin } from '@/hooks/useAdmin'
import { useLanguage } from '@/contexts/LanguageContext'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [adminModalOpen, setAdminModalOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [cartCount, setCartCount] = useState(0);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const { user, signOut } = useAuth()
  const { itemsCount } = useCart()
  
  // Debug logging for cart count (강화된 디버깅)
  useEffect(() => {
    console.log('🔢 Header: cart count 업데이트:', itemsCount)
    if (itemsCount > 0) {
      console.log('🎯 Header: 장바구니에 상품 있음!', itemsCount, '개')
    } else {
      console.log('📭 Header: 장바구니 비어있음')
    }
  }, [itemsCount])
  const { isAdmin, adminUser, logoutAdmin } = useAdmin()
  const { t } = useLanguage()
  const navigate = useNavigate();

  const mainNavItems = [
    { nameKey: "nav.company", href: "/company" },
    { nameKey: "nav.agv-caster", href: "/categories/agv-casters" },
    { nameKey: "nav.equipment-caster", href: "/categories/industrial-casters" },
    { nameKey: "nav.polyurethane-wheel", href: "/categories/polyurethane-wheels" },
    { nameKey: "nav.rubber-wheel", href: "/categories/rubber-wheels" },
    { nameKey: "nav.driving-module", href: "/categories/drive-modules" },
    { nameKey: "nav.notices", href: "/notices" },
    { nameKey: "nav.support", href: "/support" },
  ];

  const megaMenuCategories = [
    {
      titleKey: "megamenu.productCategory",
      icon: Settings,
      items: [
        { nameKey: "megamenu.allProducts", href: "/products", icon: Grid3X3 },
        { nameKey: "nav.agv-caster", href: "/categories/agv-casters", icon: Star },
        { nameKey: "nav.equipment-caster", href: "/categories/industrial-casters", icon: Truck },
        { nameKey: "megamenu.heavyDutyCasters", href: "/categories/heavy-duty-casters", icon: Settings },
        { nameKey: "nav.polyurethane-wheel", href: "/categories/polyurethane-wheels", icon: Award },
        { nameKey: "nav.rubber-wheel", href: "/categories/rubber-wheels", icon: Shield },
        { nameKey: "megamenu.mecanumWheels", href: "/categories/mecanum-wheels", icon: Star },
        { nameKey: "nav.driving-module", href: "/categories/drive-modules", icon: Award },
      ]
    },
    {
      titleKey: "megamenu.companyInfo",
      icon: Award,
      items: [
        { nameKey: "megamenu.aboutCompany", href: "/about", icon: Award },
        { nameKey: "megamenu.qualityAssurance", href: "/quality", icon: Shield },
        { nameKey: "megamenu.dealers", href: "/dealers", icon: MapPin },
      ]
    },
    {
      titleKey: "megamenu.customerSupport",
      icon: Phone,
      items: [
        { nameKey: "nav.notices", href: "/notices", icon: Phone },
        { nameKey: "megamenu.techSupport", href: "/support", icon: Phone },
        { nameKey: "megamenu.contact", href: "/contact", icon: Phone },
        { nameKey: "megamenu.downloads", href: "/downloads", icon: Star },
      ]
    }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`)
      setSearchTerm('')
      setIsMenuOpen(false)
    }
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm border-b border-gray-200">
      {/* Top Utility Bar */}
      <div className="bg-steel text-white text-sm border-b border-steel-light/20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-12">
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/support" className="flex items-center hover:text-primary transition-colors font-medium">
                <Phone className="w-4 h-4 mr-2" />
                {t("header.support")}
              </Link>
              <Link to="/quality" className="flex items-center hover:text-primary transition-colors font-medium">
                <Award className="w-4 h-4 mr-2" />
                {t("header.quality")}
              </Link>
              <Link to="/dealers" className="flex items-center hover:text-primary transition-colors font-medium">
                <MapPin className="w-4 h-4 mr-2" />
                {t("header.dealers")}
              </Link>
            </div>
            <div className="flex items-center space-x-4 md:space-x-6">
              {isAdmin ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1 hover:text-primary transition-colors font-medium">
                      관리자: {adminUser?.name}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate('/admin')} className="cursor-pointer">
                      관리자 페이지
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logoutAdmin} className="cursor-pointer">
                      관리자 로그아웃
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <button onClick={() => setAdminModalOpen(true)} className="hover:text-primary transition-colors font-medium">
                  관리자
                </button>
              )}
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="bg-primary text-primary-foreground px-4 md:px-6 py-3 font-black text-lg md:text-xl tracking-wider">
              Korean Caster
            </div>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="relative border-2 border-primary/30 rounded-lg overflow-hidden w-full">
              <Input
                type="text"
                placeholder={t("header.search")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-12 py-3 text-base border-0 focus:ring-0 focus:outline-none bg-white"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 px-4 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Search className="w-4 h-4" />
              </Button>
            </form>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 hover:text-primary md:hidden">
              <Search className="w-5 h-5" />
            </Button>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative hover:bg-primary/10 hover:text-primary hidden md:flex px-3">
                    <User className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">{t("header.account")}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/account" className="flex items-center gap-2 cursor-pointer">
                      <User className="w-4 h-4" />
                      {t("header.account")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 cursor-pointer">
                    <LogOut className="w-4 h-4" />
                    {t("header.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" className="relative hover:bg-primary/10 hover:text-primary hidden md:flex px-3" onClick={() => setAuthModalOpen(true)}>
                <User className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">{t("header.login")}</span>
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative hover:bg-yellow-50 hover:text-yellow-600 transition-colors"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart className="w-5 h-5" />
              {itemsCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-yellow-400 text-gray-900 text-xs rounded-full flex items-center justify-center font-bold border border-white">
                  {itemsCount}
                </span>
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="md:hidden hover:bg-primary/10 hover:text-primary"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="bg-card border-t shadow-sm">
        <div className="container mx-auto px-4">
          <nav className="hidden md:flex items-center h-14 relative">
            {/* Mega Menu Trigger */}
            <div 
              className="relative"
              onMouseEnter={() => setShowMegaMenu(true)}
              onMouseLeave={() => setShowMegaMenu(false)}
            >
              <button className="flex items-center text-base font-semibold text-foreground hover:text-primary transition-colors py-4 px-5 hover:bg-yellow-50">
                {t("megamenu.allMenu")}
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>
              
              {/* Mega Menu Dropdown */}
              {showMegaMenu && (
                <div className="absolute top-full left-0 z-50 bg-white shadow-2xl border border-gray-200 rounded-lg min-w-[800px] mt-1">
                  <div className="p-6">
                    <div className="grid grid-cols-3 gap-8">
                      {megaMenuCategories.map((category, index) => {
                        const CategoryIcon = category.icon;
                        return (
                          <div key={index} className="space-y-4">
                            <div className="pb-2 border-b border-gray-200">
                              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
                                {t(category.titleKey)}
                              </h3>
                            </div>
                            <div className="space-y-2">
                              {category.items.map((item, itemIndex) => {
                                const ItemIcon = item.icon;
                                return (
                                  <Link
                                    key={itemIndex}
                                    to={item.href}
                                    className="flex items-center p-2 rounded-md hover:bg-yellow-50 hover:text-yellow-600 transition-colors group"
                                    onClick={() => setShowMegaMenu(false)}
                                  >
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-yellow-600">
                                      {t(item.nameKey)}
                                    </span>
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                      <p className="text-xs text-gray-500">
                        {t("megamenu.description")}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Regular Navigation Items */}
            {mainNavItems.map((item) => (
              <Link
                key={item.nameKey}
                to={item.href}
                className="flex items-center text-base font-semibold text-foreground hover:text-primary whitespace-nowrap transition-colors py-4 px-5"
              >
                <span>{t(item.nameKey)}</span>
              </Link>
            ))}
          </nav>
          
          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 space-y-2">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative border-2 border-primary/30 rounded-lg overflow-hidden mb-4">
                <Input
                  type="text"
                  placeholder={t("header.search")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 text-base border-0 focus:ring-0 focus:outline-none bg-white"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 px-4 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </form>
              
              {/* Mobile Menu Items */}
              {mainNavItems.map((item) => (
                <Link
                  key={item.nameKey}
                  to={item.href}
                  className="block text-base font-semibold text-foreground hover:text-primary transition-colors py-3 px-2 border-b border-muted last:border-b-0"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t(item.nameKey)}
                </Link>
              ))}
              
              {/* Mobile Utility Links */}
              <div className="pt-4 border-t border-muted space-y-2">
                <Link to="/support" className="block text-sm text-muted-foreground hover:text-primary transition-colors py-2 px-2">
                  {t("header.support")}
                </Link>
                <Link to="/quality" className="block text-sm text-muted-foreground hover:text-primary transition-colors py-2 px-2">
                  {t("header.quality")}
                </Link>
                <Link to="/dealers" className="block text-sm text-muted-foreground hover:text-primary transition-colors py-2 px-2">
                  {t("header.dealers")}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      <AdminLoginModal 
        isOpen={adminModalOpen} 
        onClose={() => setAdminModalOpen(false)}
        onSuccess={() => {
          console.log('🎯 Header: Admin login success, navigating to admin page immediately')
          navigate('/admin')
        }}
      />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </header>
  )
}