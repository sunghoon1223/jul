import { Link } from 'react-router-dom'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { MapPin, Phone, Mail, Clock, ArrowRight, Bell, Search, HeadphonesIcon } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-slate-800 via-slate-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* NOTICE Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-400" />
              NOTICE
            </h3>
            <div className="space-y-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <h4 className="font-semibold text-blue-300 mb-2">신제품 출시 안내</h4>
                <p className="text-sm text-gray-300 leading-relaxed">
                  새로운 AGV 전용 캐스터 시리즈가 출시되었습니다. 향상된 내구성과 정밀도를 경험해보세요.
                </p>
                <div className="flex items-center mt-3 text-xs text-blue-400">
                  <span>2024.01.15</span>
                  <ArrowRight className="h-3 w-3 ml-auto" />
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <h4 className="font-semibold text-green-300 mb-2">무료 배송 이벤트</h4>
                <p className="text-sm text-gray-300 leading-relaxed">
                  50만원 이상 주문 시 전국 무료배송! 이번 기회를 놓치지 마세요.
                </p>
                <div className="flex items-center mt-3 text-xs text-green-400">
                  <span>2024.01.10</span>
                  <ArrowRight className="h-3 w-3 ml-auto" />
                </div>
              </div>
            </div>
          </div>

          {/* STORE Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Search className="h-5 w-5 text-green-400" />
              STORE
            </h3>
            <div className="space-y-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <h4 className="font-semibold text-white mb-3">전국 대리점 찾기</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">서울 강남점</span>
                    <span className="text-xs bg-blue-600 px-2 py-1 rounded-full">영업중</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">부산 해운대점</span>
                    <span className="text-xs bg-blue-600 px-2 py-1 rounded-full">영업중</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">대구 수성점</span>
                    <span className="text-xs bg-gray-600 px-2 py-1 rounded-full">영업종료</span>
                  </div>
                </div>
                <Button 
                  asChild 
                  variant="outline" 
                  size="sm" 
                  className="mt-4 w-full border-white/20 text-white hover:bg-white hover:text-gray-900"
                >
                  <Link to="/support">
                    전체 매장 보기
                    <ArrowRight className="h-3 w-3 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* CUSTOMER CENTER Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <HeadphonesIcon className="h-5 w-5 text-purple-400" />
              CUSTOMER CENTER
            </h3>
            <div className="space-y-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-1">1588-1234</div>
                    <div className="text-sm text-gray-300">상담 전용 번호</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="text-center">
                      <div className="text-blue-300 font-medium">평일</div>
                      <div className="text-gray-300">09:00-18:00</div>
                    </div>
                    <div className="text-center">
                      <div className="text-blue-300 font-medium">토요일</div>
                      <div className="text-gray-300">09:00-15:00</div>
                    </div>
                  </div>
                  
                  <Separator className="bg-white/10" />
                  
                  <div className="space-y-2">
                    <Button 
                      asChild 
                      size="sm" 
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    >
                      <Link to="/support">온라인 문의하기</Link>
                    </Button>
                    <Button 
                      asChild 
                      variant="outline" 
                      size="sm" 
                      className="w-full border-white/20 text-white hover:bg-white hover:text-gray-900"
                    >
                      <Link to="/support">FAQ 바로가기</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-12 bg-white/10" />

        {/* Company Info & Links */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              JP캐스터
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              20년 경험의 산업용 캐스터 전문 기업으로, AGV부터 메카넘 휠까지 최고 품질의 솔루션을 제공합니다.
            </p>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-400" />
                <span>서울시 강남구 테헤란로 123</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-400" />
                <span>info@jpcaster.co.kr</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-white">빠른 링크</h4>
            <nav className="grid grid-cols-2 gap-2">
              <Link to="/company" className="text-sm text-gray-300 hover:text-white transition-colors">
                회사소개
              </Link>
              <Link to="/products" className="text-sm text-gray-300 hover:text-white transition-colors">
                제품 카탈로그
              </Link>
              <Link to="/support" className="text-sm text-gray-300 hover:text-white transition-colors">
                고객지원
              </Link>
              <Link to="/support" className="text-sm text-gray-300 hover:text-white transition-colors">
                품질보증
              </Link>
              <Link to="/categories/agv-casters" className="text-sm text-gray-300 hover:text-white transition-colors">
                AGV 캐스터
              </Link>
              <Link to="/categories/mecanum-wheels" className="text-sm text-gray-300 hover:text-white transition-colors">
                메카넘 휠
              </Link>
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-white">인증 및 보증</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>ISO 9001 품질경영시스템</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>KC 안전인증</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>1년 품질보증</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>전국 A/S 네트워크</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-white/10" />

        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <div className="mb-4 md:mb-0">
            <p>&copy; 2024 JP캐스터. All rights reserved.</p>
          </div>
          <div className="flex space-x-6">
            <Link to="/privacy" className="hover:text-white transition-colors">
              개인정보처리방침
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors">
              이용약관
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}