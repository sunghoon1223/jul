import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ShoppingCart,
  Search,
  ChevronDown,
  Users,
  Award,
  Target,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Factory,
} from "lucide-react"

const stats = [
  { label: "설립년도", value: "2004", icon: Calendar },
  { label: "직원 수", value: "150+", icon: Users },
  { label: "연간 생산량", value: "50만개", icon: Factory },
  { label: "고객사", value: "500+", icon: TrendingUp },
]

const milestones = [
  { year: "2004", title: "회사 설립", description: "산업용 캐스터 전문 제조업체로 출발" },
  { year: "2008", title: "ISO 9001 인증", description: "품질경영시스템 국제 표준 인증 획득" },
  { year: "2012", title: "해외 진출", description: "동남아시아 시장 진출 및 수출 확대" },
  { year: "2016", title: "R&D 센터 설립", description: "자체 연구개발센터 구축으로 기술력 강화" },
  { year: "2020", title: "스마트 팩토리", description: "4차 산업혁명 대응 스마트 제조시스템 도입" },
  { year: "2024", title: "AI 기반 품질관리", description: "인공지능 기반 품질관리 시스템 구축" },
]

const values = [
  {
    icon: Award,
    title: "품질 우선",
    description: "최고 품질의 제품만을 고객에게 제공합니다",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Users,
    title: "고객 중심",
    description: "고객의 니즈를 최우선으로 생각합니다",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    icon: Target,
    title: "혁신 추구",
    description: "끊임없는 연구개발로 혁신을 이끌어갑니다",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
]

export default function CompanyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              JPCaster v2
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/company" className="text-blue-600 font-medium">
                회사소개
              </Link>
              <div className="relative group">
                <button className="flex items-center text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
                  제품
                  <ChevronDown className="ml-1 h-4 w-4" />
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
                  로그인
                </Button>
              </Link>
              <Link href="/admin">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6">관리자</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-white mb-6">회사소개</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            20년간 축적된 기술력과 경험으로 최고 품질의 산업용 캐스터를 제공하는 전문 기업입니다
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center border-0 shadow-lg">
                <CardContent className="p-8">
                  <stat.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                산업용 캐스터의
                <span className="block text-blue-600">새로운 기준을 제시합니다</span>
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                JPCaster는 2004년 설립 이래 산업용 캐스터 분야에서 끊임없는 혁신을 추구해왔습니다. 고객의 다양한
                요구사항을 충족하기 위해 최첨단 기술과 엄격한 품질관리 시스템을 바탕으로 최고 품질의 제품을 생산하고
                있습니다.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                AGV 시스템부터 중하중 산업장비까지, 다양한 분야에서 신뢰받는 파트너로서 고객의 성공을 함께 만들어가고
                있습니다.
              </p>
              <Link href="/products">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  제품 둘러보기
                </Button>
              </Link>
            </div>
            <div className="relative">
              <Image
                src="/placeholder.svg?height=500&width=600"
                alt="Company Overview"
                width={600}
                height={500}
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">핵심 가치</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">JPCaster가 추구하는 가치와 철학입니다</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card
                key={index}
                className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <CardContent className="p-8">
                  <div className={`inline-flex items-center justify-center w-16 h-16 ${value.bg} rounded-2xl mb-6`}>
                    <value.icon className={`h-8 w-8 ${value.color}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">회사 연혁</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">JPCaster의 성장 과정과 주요 성과들을 소개합니다</p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-blue-200"></div>
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}>
                  <div className={`w-1/2 ${index % 2 === 0 ? "pr-8 text-right" : "pl-8 text-left"}`}>
                    <Card className="border-0 shadow-lg">
                      <CardContent className="p-6">
                        <Badge className="mb-3 bg-blue-600">{milestone.year}</Badge>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{milestone.title}</h3>
                        <p className="text-gray-600">{milestone.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="relative z-10 flex items-center justify-center w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-lg"></div>
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">오시는 길</h2>
            <p className="text-xl text-gray-600">JPCaster 본사 및 공장 위치</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">연락처 정보</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="text-gray-700">서울시 강남구 테헤란로 123, JPCaster 빌딩</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="text-gray-700">02-1234-5678</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="text-gray-700">info@jpcasterpro.co.kr</span>
                  </div>
                </div>

                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">운영시간</h4>
                  <div className="space-y-2 text-gray-700">
                    <div className="flex justify-between">
                      <span>평일</span>
                      <span>09:00 - 18:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>토요일</span>
                      <span>09:00 - 13:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>일요일/공휴일</span>
                      <span>휴무</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-gray-200 rounded-2xl h-96 flex items-center justify-center">
              <p className="text-gray-500">지도 영역 (Google Maps 연동)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
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
