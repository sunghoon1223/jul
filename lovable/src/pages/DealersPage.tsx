import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Clock, Users, Building, Search, ArrowRight } from 'lucide-react'
import { useState } from 'react'

const dealerData = [
  {
    id: 1,
    name: "서울 강남점",
    address: "서울시 강남구 테헤란로 123",
    phone: "02-1234-5678",
    email: "gangnam@koreancaster.co.kr",
    hours: "09:00 - 18:00",
    status: "영업중",
    manager: "김철수",
    specialties: ["AGV 캐스터", "산업용 캐스터"]
  },
  {
    id: 2,
    name: "부산 해운대점",
    address: "부산시 해운대구 해운대로 456",
    phone: "051-2345-6789",
    email: "busan@koreancaster.co.kr",
    hours: "09:00 - 18:00",
    status: "영업중",
    manager: "박영희",
    specialties: ["메카넘 휠", "폴리우레탄 휠"]
  },
  {
    id: 3,
    name: "대구 수성점",
    address: "대구시 수성구 수성로 789",
    phone: "053-3456-7890",
    email: "daegu@koreancaster.co.kr",
    hours: "09:00 - 15:00",
    status: "영업종료",
    manager: "이민수",
    specialties: ["장비용 캐스터", "러버 휠"]
  },
  {
    id: 4,
    name: "인천 송도점",
    address: "인천시 연수구 송도대로 101",
    phone: "032-4567-8901",
    email: "incheon@koreancaster.co.kr",
    hours: "09:00 - 18:00",
    status: "영업중",
    manager: "정태호",
    specialties: ["드라이빙 모듈", "AGV 캐스터"]
  },
  {
    id: 5,
    name: "광주 북구점",
    address: "광주시 북구 용봉로 202",
    phone: "062-5678-9012",
    email: "gwangju@koreancaster.co.kr",
    hours: "09:00 - 18:00",
    status: "영업중",
    manager: "한미영",
    specialties: ["산업용 캐스터", "폴리우레탄 휠"]
  },
  {
    id: 6,
    name: "대전 유성점",
    address: "대전시 유성구 대학로 303",
    phone: "042-6789-0123",
    email: "daejeon@koreancaster.co.kr",
    hours: "09:00 - 18:00",
    status: "영업중",
    manager: "송준호",
    specialties: ["메카넘 휠", "드라이빙 모듈"]
  }
]

export function DealersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDealer, setSelectedDealer] = useState<number | null>(null)

  const filteredDealers = dealerData.filter(dealer =>
    dealer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dealer.address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8 animate-fade-in-up">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-amber-600 transition-colors">홈</Link>
            <span>/</span>
            <span className="text-foreground">대리점</span>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center px-6 py-3 mb-6 bg-amber-400/20 rounded-full border-2 border-amber-400/30">
            <MapPin className="w-5 h-5 text-amber-400 mr-3" />
            <span className="text-sm font-black text-amber-400 uppercase tracking-widest">
              DEALER NETWORK
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            전국 대리점 네트워크
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            전국 주요 도시에 위치한 공식 대리점을 통해 빠르고 정확한 서비스를 제공받으세요.
          </p>
        </div>

        {/* Search Section */}
        <div className="mb-12">
          <div className="max-w-md mx-auto">
            <Label htmlFor="search" className="sr-only">대리점 검색</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="지역 또는 대리점명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Dealers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filteredDealers.map((dealer) => (
            <Card 
              key={dealer.id} 
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedDealer === dealer.id ? 'ring-2 ring-amber-400' : ''
              }`}
              onClick={() => setSelectedDealer(dealer.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{dealer.name}</CardTitle>
                  <Badge variant={dealer.status === '영업중' ? 'default' : 'secondary'}>
                    {dealer.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{dealer.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{dealer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{dealer.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{dealer.hours}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">담당: {dealer.manager}</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">전문 분야:</p>
                  <div className="flex flex-wrap gap-1">
                    {dealer.specialties.map((specialty) => (
                      <Badge key={specialty} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 bg-amber-400 hover:bg-amber-500 text-slate-900">
                    <Phone className="w-4 h-4 mr-2" />
                    전화
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 hover:bg-amber-50 hover:text-amber-900">
                    <Mail className="w-4 h-4 mr-2" />
                    이메일
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Dealer Application Form */}
        <section className="mb-16">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
                <Building className="w-6 h-6 text-amber-600" />
                대리점 신청
              </CardTitle>
              <p className="text-center text-muted-foreground">
                Korean Caster 대리점 참여를 원하시면 아래 양식을 작성해 주세요.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company-name">회사명</Label>
                  <Input id="company-name" placeholder="회사명을 입력하세요" />
                </div>
                <div>
                  <Label htmlFor="representative">대표자명</Label>
                  <Input id="representative" placeholder="대표자명을 입력하세요" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">연락처</Label>
                  <Input id="phone" placeholder="연락처를 입력하세요" />
                </div>
                <div>
                  <Label htmlFor="email">이메일</Label>
                  <Input id="email" type="email" placeholder="이메일을 입력하세요" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="address">주소</Label>
                <Input id="address" placeholder="주소를 입력하세요" />
              </div>
              
              <div>
                <Label htmlFor="business-type">사업 형태</Label>
                <Input id="business-type" placeholder="예: 캐스터 도매업, 산업용품 판매업" />
              </div>
              
              <div>
                <Label htmlFor="message">신청 사유 및 기타 문의</Label>
                <Textarea 
                  id="message" 
                  placeholder="대리점 신청 사유와 기타 문의사항을 입력하세요"
                  rows={4}
                />
              </div>
              
              <Button className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900">
                신청서 제출
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Benefits Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">대리점 혜택</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "마케팅 지원",
                description: "본사에서 제공하는 마케팅 자료 및 광고 지원",
                icon: "📢"
              },
              {
                title: "기술 교육",
                description: "제품 전문 교육 및 기술 지원 서비스",
                icon: "🎓"
              },
              {
                title: "물류 지원",
                description: "효율적인 물류 시스템 및 재고 관리 지원",
                icon: "🚚"
              }
            ].map((benefit, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="text-4xl mb-4">{benefit.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="text-center">
          <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold mb-4">대리점 문의</h2>
              <p className="text-lg mb-8 opacity-90">
                대리점 관련 문의사항이 있으시면 언제든지 연락주세요.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-amber-400 hover:bg-amber-500 text-slate-900">
                  <Link to="/support">
                    문의하기
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-slate-900 hover:!text-slate-900 focus:bg-white focus:text-slate-900">
                  <Link to="/products">
                    제품 보기
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}