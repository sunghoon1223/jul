"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Search,
  ChevronDown,
  ShoppingCart,
  Phone,
  Mail,
  MessageCircle,
  HelpCircle,
  FileText,
  Truck,
  Shield,
  Users,
  MapPin,
  Clock,
  Star,
  Building,
} from "lucide-react"

const supportOptions = [
  {
    icon: Phone,
    title: "전화 상담",
    description: "전문 상담원과 직접 통화",
    contact: "02-1234-5678",
    hours: "평일 09:00-18:00",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Mail,
    title: "이메일 문의",
    description: "상세한 문의사항을 이메일로",
    contact: "support@jpcasterpro.co.kr",
    hours: "24시간 접수",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    icon: MessageCircle,
    title: "실시간 채팅",
    description: "즉시 답변받는 채팅 상담",
    contact: "채팅 시작하기",
    hours: "평일 09:00-18:00",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
]

const dealers = [
  {
    id: 1,
    name: "서울 강남 대리점",
    address: "서울시 강남구 테헤란로 456",
    phone: "02-555-1234",
    email: "gangnam@jpcasterpro.co.kr",
    manager: "김대리",
    hours: "평일 09:00-18:00, 토요일 09:00-15:00",
    specialties: ["AGV 캐스터", "중하중 캐스터"],
    rating: 4.8,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 2,
    name: "부산 해운대 대리점",
    address: "부산시 해운대구 센텀중앙로 123",
    phone: "051-777-5678",
    email: "busan@jpcasterpro.co.kr",
    manager: "박과장",
    hours: "평일 09:00-18:00, 토요일 09:00-13:00",
    specialties: ["폴리우레탄 휠", "고무 휠"],
    rating: 4.9,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 3,
    name: "대구 수성 대리점",
    address: "대구시 수성구 동대구로 789",
    phone: "053-888-9012",
    email: "daegu@jpcasterpro.co.kr",
    manager: "이팀장",
    hours: "평일 09:00-18:00",
    specialties: ["메카넘 휠", "구동 모듈"],
    rating: 4.7,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 4,
    name: "인천 송도 대리점",
    address: "인천시 연수구 송도과학로 321",
    phone: "032-999-3456",
    email: "incheon@jpcasterpro.co.kr",
    manager: "최부장",
    hours: "평일 09:00-18:00, 토요일 09:00-14:00",
    specialties: ["장비용 캐스터", "AGV 캐스터"],
    rating: 4.6,
    image: "/placeholder.svg?height=200&width=300",
  },
]

const faqCategories = [
  {
    title: "주문/결제",
    questions: [
      { q: "주문 취소는 어떻게 하나요?", a: "주문 완료 후 1시간 이내에 고객센터로 연락주시면 취소 가능합니다." },
      { q: "결제 방법은 어떤 것들이 있나요?", a: "신용카드, 계좌이체, 무통장입금을 지원합니다." },
      { q: "세금계산서 발행이 가능한가요?", a: "네, 사업자등록증 제출 시 세금계산서 발행 가능합니다." },
    ],
  },
  {
    title: "배송/교환/반품",
    questions: [
      { q: "배송 기간은 얼마나 걸리나요?", a: "재고 보유 제품은 당일 출고, 맞춤 제작 시 3-5일 소요됩니다." },
      { q: "교환/반품이 가능한가요?", a: "제품 수령 후 7일 이내 미사용 제품에 한해 교환/반품 가능합니다." },
      { q: "배송비는 얼마인가요?", a: "10만원 이상 구매 시 무료배송, 미만 시 3,000원입니다." },
    ],
  },
  {
    title: "제품/기술",
    questions: [
      { q: "맞춤 제작이 가능한가요?", a: "네, 고객 요구사항에 맞는 맞춤 제작 서비스를 제공합니다." },
      { q: "품질보증 기간은 얼마나 되나요?", a: "모든 제품에 대해 1년 품질보증을 제공합니다." },
      { q: "기술 지원을 받을 수 있나요?", a: "전문 기술진이 설치 및 사용법에 대한 기술 지원을 제공합니다." },
    ],
  },
]

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState("contact")
  const [consultationForm, setConsultationForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    message: "",
  })
  const [isConsultationOpen, setIsConsultationOpen] = useState(false)

  const handleConsultationSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 여기서 실제로는 이메일 발송 로직을 구현
    console.log("상담 신청:", consultationForm)
    setIsConsultationOpen(false)
    setConsultationForm({ name: "", company: "", email: "", phone: "", message: "" })
    alert("상담 신청이 완료되었습니다. 빠른 시일 내에 연락드리겠습니다.")
  }

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
              <Link href="/support" className="text-blue-600 font-medium">
                고객지원
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search products..." className="pl-10 pr-4 py-2 w-64" />
              </div>
              <Link href="/cart" className="relative p-2 text-gray-700 hover:text-blue-600">
                <ShoppingCart className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
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

      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">고객지원</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            궁금한 점이 있으시면 언제든지 문의해주세요. 전문 상담원이 도와드리겠습니다.
          </p>

          {/* 무료 상담 신청 버튼 */}
          <Dialog open={isConsultationOpen} onOpenChange={setIsConsultationOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-4">
                무료 상담 신청
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-center text-xl font-bold">무료 상담 신청</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleConsultationSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="consultation-name">이름 *</Label>
                  <Input
                    id="consultation-name"
                    value={consultationForm.name}
                    onChange={(e) => setConsultationForm({ ...consultationForm, name: e.target.value })}
                    placeholder="이름을 입력하세요"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="consultation-company">회사명</Label>
                  <Input
                    id="consultation-company"
                    value={consultationForm.company}
                    onChange={(e) => setConsultationForm({ ...consultationForm, company: e.target.value })}
                    placeholder="회사명을 입력하세요"
                  />
                </div>
                <div>
                  <Label htmlFor="consultation-email">이메일 *</Label>
                  <Input
                    id="consultation-email"
                    type="email"
                    value={consultationForm.email}
                    onChange={(e) => setConsultationForm({ ...consultationForm, email: e.target.value })}
                    placeholder="이메일을 입력하세요"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="consultation-phone">전화번호 *</Label>
                  <Input
                    id="consultation-phone"
                    value={consultationForm.phone}
                    onChange={(e) => setConsultationForm({ ...consultationForm, phone: e.target.value })}
                    placeholder="전화번호를 입력하세요"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="consultation-message">상담 내용</Label>
                  <Textarea
                    id="consultation-message"
                    value={consultationForm.message}
                    onChange={(e) => setConsultationForm({ ...consultationForm, message: e.target.value })}
                    placeholder="상담받고 싶은 내용을 입력하세요"
                    className="min-h-20"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                    상담 신청
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsConsultationOpen(false)}
                    className="flex-1"
                  >
                    취소
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Navigation Tabs */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-2xl p-2 shadow-lg border">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab("contact")}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === "contact"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                문의하기
              </button>
              <button
                onClick={() => setActiveTab("dealers")}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === "dealers"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                대리점 찾기
              </button>
              <button
                onClick={() => setActiveTab("faq")}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === "faq"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                자주 묻는 질문
              </button>
              <button
                onClick={() => setActiveTab("warranty")}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === "warranty"
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                품질보증
              </button>
            </div>
          </div>
        </div>

        {/* Contact Tab */}
        {activeTab === "contact" && (
          <div className="space-y-16">
            {/* Contact Options */}
            <section>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">문의 방법</h2>
                <p className="text-lg text-gray-600">편리한 방법으로 문의해주세요</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {supportOptions.map((option, index) => (
                  <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardContent className="p-8 text-center">
                      <div
                        className={`inline-flex items-center justify-center w-16 h-16 ${option.bg} rounded-2xl mb-6`}
                      >
                        <option.icon className={`h-8 w-8 ${option.color}`} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{option.title}</h3>
                      <p className="text-gray-600 mb-4">{option.description}</p>
                      <div className="space-y-2">
                        <p className="font-semibold text-gray-900">{option.contact}</p>
                        <p className="text-sm text-gray-500">{option.hours}</p>
                      </div>
                      <Button className="mt-4 w-full bg-transparent" variant="outline">
                        {option.title === "실시간 채팅" ? "채팅 시작" : "연락하기"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Contact Form */}
            <section>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">온라인 문의</h2>
                <p className="text-lg text-gray-600">문의사항을 남겨주시면 빠르게 답변드리겠습니다</p>
              </div>

              <Card className="max-w-2xl mx-auto border-0 shadow-lg">
                <CardContent className="p-8">
                  <form className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="name">이름 *</Label>
                        <Input id="name" placeholder="이름을 입력하세요" className="mt-2" />
                      </div>
                      <div>
                        <Label htmlFor="company">회사명</Label>
                        <Input id="company" placeholder="회사명을 입력하세요" className="mt-2" />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="email">이메일 *</Label>
                        <Input id="email" type="email" placeholder="이메일을 입력하세요" className="mt-2" />
                      </div>
                      <div>
                        <Label htmlFor="phone">전화번호</Label>
                        <Input id="phone" placeholder="전화번호를 입력하세요" className="mt-2" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="category">문의 유형 *</Label>
                      <select
                        id="category"
                        className="mt-2 w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                      >
                        <option value="">문의 유형을 선택하세요</option>
                        <option value="product">제품 문의</option>
                        <option value="order">주문/결제 문의</option>
                        <option value="delivery">배송 문의</option>
                        <option value="technical">기술 지원</option>
                        <option value="other">기타</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="subject">제목 *</Label>
                      <Input id="subject" placeholder="문의 제목을 입력하세요" className="mt-2" />
                    </div>

                    <div>
                      <Label htmlFor="message">문의 내용 *</Label>
                      <Textarea id="message" placeholder="문의 내용을 자세히 입력해주세요" className="mt-2 min-h-32" />
                    </div>

                    <div className="flex items-center">
                      <input type="checkbox" id="privacy" className="mr-2" />
                      <Label htmlFor="privacy" className="text-sm text-gray-600">
                        개인정보 수집 및 이용에 동의합니다
                      </Label>
                    </div>

                    <Button type="submit" size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
                      문의하기
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </section>
          </div>
        )}

        {/* Dealers Tab */}
        {activeTab === "dealers" && (
          <div className="space-y-12">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">전국 대리점 안내</h2>
              <p className="text-lg text-gray-600">가까운 대리점에서 직접 상담받으세요</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {dealers.map((dealer) => (
                <Card key={dealer.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-0">
                    <div className="relative">
                      <img
                        src={dealer.image || "/placeholder.svg"}
                        alt={dealer.name}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                          <span className="text-sm font-medium">{dealer.rating}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{dealer.name}</h3>
                          <div className="flex items-center text-gray-600 mb-2">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span className="text-sm">{dealer.address}</span>
                          </div>
                          <div className="flex items-center text-gray-600 mb-2">
                            <Phone className="h-4 w-4 mr-2" />
                            <span className="text-sm">{dealer.phone}</span>
                          </div>
                          <div className="flex items-center text-gray-600 mb-2">
                            <Mail className="h-4 w-4 mr-2" />
                            <span className="text-sm">{dealer.email}</span>
                          </div>
                          <div className="flex items-center text-gray-600 mb-4">
                            <Clock className="h-4 w-4 mr-2" />
                            <span className="text-sm">{dealer.hours}</span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="flex items-center">
                          <Building className="h-3 w-3 mr-1" />
                          {dealer.manager}
                        </Badge>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">전문 분야</h4>
                        <div className="flex flex-wrap gap-2">
                          {dealer.specialties.map((specialty, index) => (
                            <Badge key={index} className="bg-blue-100 text-blue-800">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                          <Phone className="h-4 w-4 mr-2" />
                          전화하기
                        </Button>
                        <Button variant="outline" className="flex-1 bg-transparent">
                          <MapPin className="h-4 w-4 mr-2" />
                          길찾기
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* FAQ Tab */}
        {activeTab === "faq" && (
          <div className="space-y-12">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">자주 묻는 질문</h2>
              <p className="text-lg text-gray-600">고객님들이 자주 문의하시는 내용입니다</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {faqCategories.map((category, categoryIndex) => (
                <Card key={categoryIndex} className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <HelpCircle className="h-5 w-5 text-blue-600 mr-2" />
                      {category.title}
                    </h3>
                    <div className="space-y-4">
                      {category.questions.map((faq, faqIndex) => (
                        <div key={faqIndex} className="border-b border-gray-200 pb-4 last:border-b-0">
                          <h4 className="font-medium text-gray-900 mb-2">{faq.q}</h4>
                          <p className="text-sm text-gray-600">{faq.a}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <p className="text-gray-600 mb-4">원하는 답변을 찾지 못하셨나요?</p>
              <Button onClick={() => setActiveTab("contact")} className="bg-blue-600 hover:bg-blue-700">
                직접 문의하기
              </Button>
            </div>
          </div>
        )}

        {/* Warranty Tab */}
        {activeTab === "warranty" && (
          <div className="space-y-12">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">품질보증 안내</h2>
              <p className="text-lg text-gray-600">JPCaster의 품질보증 정책을 확인하세요</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <Shield className="h-8 w-8 text-green-600 mr-3" />
                    <h3 className="text-2xl font-bold text-gray-900">품질보증 정책</h3>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">보증 기간</h4>
                      <p className="text-gray-600">모든 제품에 대해 구매일로부터 1년간 품질보증을 제공합니다.</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">보증 범위</h4>
                      <ul className="text-gray-600 space-y-1">
                        <li>• 제조상의 결함으로 인한 고장</li>
                        <li>• 정상 사용 중 발생한 성능 저하</li>
                        <li>• 부품 파손 (정상 사용 범위 내)</li>
                        <li>• 기능 이상 및 작동 불량</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">보증 제외 사항</h4>
                      <ul className="text-gray-600 space-y-1">
                        <li>• 사용자 과실로 인한 손상</li>
                        <li>• 무리한 하중으로 인한 파손</li>
                        <li>• 개조 또는 분해로 인한 고장</li>
                        <li>• 자연재해로 인한 손상</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <FileText className="h-8 w-8 text-blue-600 mr-3" />
                    <h3 className="text-2xl font-bold text-gray-900">A/S 신청 방법</h3>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">1단계: 문의 접수</h4>
                      <p className="text-gray-600">고객센터(02-1234-5678) 또는 이메일로 A/S 신청</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">2단계: 제품 진단</h4>
                      <p className="text-gray-600">전문 기술진이 제품 상태를 정확히 진단</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">3단계: 수리/교체</h4>
                      <p className="text-gray-600">보증 범위 내 무상 수리 또는 신품 교체</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">4단계: 배송/설치</h4>
                      <p className="text-gray-600">수리 완료 후 안전한 배송 및 설치 지원</p>
                    </div>
                  </div>

                  <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">필요 서류</h4>
                    <ul className="text-blue-800 text-sm space-y-1">
                      <li>• 구매 영수증 또는 세금계산서</li>
                      <li>• 제품 보증서</li>
                      <li>• 고장 증상 설명서</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Button onClick={() => setActiveTab("contact")} size="lg" className="bg-blue-600 hover:bg-blue-700">
                A/S 신청하기
              </Button>
            </div>
          </div>
        )}

        {/* Service Info */}
        <section className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">서비스 안내</h2>
            <p className="text-lg text-gray-600">JPCaster의 다양한 서비스를 확인해보세요</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-6">
                <Truck className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-bold text-gray-900 mb-2">빠른 배송</h3>
                <p className="text-sm text-gray-600">당일/익일 배송 서비스</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-6">
                <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-bold text-gray-900 mb-2">품질 보증</h3>
                <p className="text-sm text-gray-600">1년 무상 A/S</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-6">
                <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-bold text-gray-900 mb-2">전문 상담</h3>
                <p className="text-sm text-gray-600">기술 전문가 지원</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-6">
                <FileText className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <h3 className="font-bold text-gray-900 mb-2">맞춤 제작</h3>
                <p className="text-sm text-gray-600">고객 요구사항 반영</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12 mb-8">
            {/* Notice Section */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-gray-300">NOTICE</h3>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li>• 디월트 6월 공식 서비스센터 운영시간 변경 공지</li>
                <li>• 토탈케어, 스마트블랙앤데커 통합 고객 지원 서비스 (25. ...)</li>
                <li>• [안내]2025 상반기 웰로페스타 솔다백 사은품 조기 소진 ...</li>
                <li>• [D-13] 2025 상반기 웰로페스타 마감 임박 및 사은 ...</li>
                <li>• 6월 휴무 안내</li>
              </ul>
            </div>

            {/* Store Section */}
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-6 text-gray-300">STORE</h3>
              <div className="mb-6">
                <h4 className="text-xl font-bold mb-2">매장 검색</h4>
                <p className="text-gray-400 text-sm mb-4">내 주위에서 가장 가까운 매장 위치를 찾을 수 있습니다.</p>
                <Button variant="outline" className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800">
                  바로가기
                </Button>
              </div>
            </div>

            {/* Customer Center Section */}
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-6 text-gray-300">CUSTOMER CENTER</h3>
              <div>
                <h4 className="text-xl font-bold mb-2">문의하기</h4>
                <p className="text-gray-400 text-sm mb-4">궁금하신 사항이나 문의 하실 내용을 남겨주세요.</p>
                <Button variant="outline" className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800">
                  바로가기
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="grid md:grid-cols-4 gap-8">
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
                    <Link
                      href="/category/polyurethane-wheel"
                      className="hover:text-white transition-colors duration-200"
                    >
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
            <div className="border-t border-gray-800 pt-8 mt-8 text-center text-gray-400">
              <p>&copy; 2024 JPCaster v2. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
