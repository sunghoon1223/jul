import Link from "next/link"
import { ScrollHeader } from "@/components/scroll-header"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, FileText, Phone, Mail, CheckCircle, XCircle, Clock, Wrench } from "lucide-react"

const warrantySteps = [
  {
    step: 1,
    title: "문의 접수",
    description: "고객센터 또는 이메일로 A/S 신청",
    icon: Phone,
    details: ["전화: 02-1234-5678", "이메일: as@jpcasterpro.co.kr", "온라인 문의 양식 작성"],
  },
  {
    step: 2,
    title: "제품 진단",
    description: "전문 기술진이 제품 상태를 정확히 진단",
    icon: FileText,
    details: ["원격 진단 가능", "필요시 현장 방문", "정확한 고장 원인 파악"],
  },
  {
    step: 3,
    title: "수리/교체",
    description: "보증 범위 내 무상 수리 또는 신품 교체",
    icon: Wrench,
    details: ["정품 부품 사용", "숙련된 기술진 작업", "품질 검사 완료"],
  },
  {
    step: 4,
    title: "배송/설치",
    description: "수리 완료 후 안전한 배송 및 설치 지원",
    icon: CheckCircle,
    details: ["안전 포장 배송", "설치 지원 서비스", "사용법 재안내"],
  },
]

const warrantyIncludes = [
  "제조상의 결함으로 인한 고장",
  "정상 사용 중 발생한 성능 저하",
  "부품 파손 (정상 사용 범위 내)",
  "기능 이상 및 작동 불량",
  "베어링 및 회전 부품 이상",
  "브레이크 시스템 고장",
]

const warrantyExcludes = [
  "사용자 과실로 인한 손상",
  "무리한 하중으로 인한 파손",
  "개조 또는 분해로 인한 고장",
  "자연재해로 인한 손상",
  "화학물질에 의한 부식",
  "정상 마모로 인한 교체",
]

export default function WarrantyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ScrollHeader />

      <div className="pt-16">
        {/* Hero Section */}
        <section className="relative py-16 bg-gradient-to-r from-green-600 to-emerald-700">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">품질보증 안내</h1>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              JPCaster의 모든 제품은 1년 품질보증과 전문 A/S 서비스를 제공합니다
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Warranty Overview */}
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-6">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">1년 품질보증</h3>
                <p className="text-gray-600">구매일로부터 1년간 무상 A/S 서비스 제공</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-6">
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">빠른 대응</h3>
                <p className="text-gray-600">접수 후 24시간 이내 1차 진단 완료</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-2xl mb-6">
                  <Wrench className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">전문 기술진</h3>
                <p className="text-gray-600">20년 경력의 전문 엔지니어가 직접 수리</p>
              </CardContent>
            </Card>
          </div>

          {/* A/S Process */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">A/S 신청 절차</h2>
              <p className="text-lg text-gray-600">간단한 4단계로 완료되는 A/S 프로세스</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {warrantySteps.map((step, index) => (
                <Card key={index} className="border-0 shadow-lg relative">
                  <CardContent className="p-6 text-center">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {step.step}
                      </div>
                    </div>

                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4 mt-4">
                      <step.icon className="h-6 w-6 text-blue-600" />
                    </div>

                    <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{step.description}</p>

                    <div className="space-y-1">
                      {step.details.map((detail, detailIndex) => (
                        <p key={detailIndex} className="text-xs text-gray-500">
                          • {detail}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Warranty Coverage */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">보증 범위</h2>
              <p className="text-lg text-gray-600">무상 A/S 대상과 제외 사항을 확인하세요</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                    <h3 className="text-xl font-bold text-gray-900">보증 포함 사항</h3>
                  </div>
                  <div className="space-y-3">
                    {warrantyIncludes.map((item, index) => (
                      <div key={index} className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <XCircle className="h-6 w-6 text-red-600 mr-3" />
                    <h3 className="text-xl font-bold text-gray-900">보증 제외 사항</h3>
                  </div>
                  <div className="space-y-3">
                    {warrantyExcludes.map((item, index) => (
                      <div key={index} className="flex items-center">
                        <XCircle className="h-4 w-4 text-red-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Required Documents */}
          <section className="mb-16">
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <FileText className="h-6 w-6 text-blue-600 mr-3" />
                  <h3 className="text-xl font-bold text-gray-900">A/S 신청 시 필요 서류</h3>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-3">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">구매 증빙</h4>
                    <p className="text-sm text-gray-600">영수증, 세금계산서, 온라인 주문서 중 1개</p>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mb-3">
                      <Shield className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">제품 보증서</h4>
                    <p className="text-sm text-gray-600">제품과 함께 제공된 품질보증서</p>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mb-3">
                      <Mail className="h-6 w-6 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">고장 증상</h4>
                    <p className="text-sm text-gray-600">고장 증상 및 사용 환경 설명서</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Contact Information */}
          <section>
            <Card className="border-0 shadow-lg bg-gray-900 text-white">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-6">A/S 문의</h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <Phone className="h-8 w-8 mx-auto mb-4 text-blue-400" />
                    <h4 className="font-semibold mb-2">전화 문의</h4>
                    <p className="text-gray-300 mb-2">02-1234-5678</p>
                    <p className="text-sm text-gray-400">평일 09:00-18:00</p>
                  </div>
                  <div>
                    <Mail className="h-8 w-8 mx-auto mb-4 text-green-400" />
                    <h4 className="font-semibold mb-2">이메일 문의</h4>
                    <p className="text-gray-300 mb-2">as@jpcasterpro.co.kr</p>
                    <p className="text-sm text-gray-400">24시간 접수</p>
                  </div>
                </div>
                <div className="mt-8">
                  <Link href="/support">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
                      온라인 A/S 신청
                    </button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  )
}
