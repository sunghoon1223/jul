"use client"

import { useState } from "react"
import Link from "next/link"
import { ScrollHeader } from "@/components/scroll-header"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ChevronDown, ChevronUp, Search } from "lucide-react"

const faqData = [
  {
    category: "주문/결제",
    questions: [
      {
        q: "주문 취소는 어떻게 하나요?",
        a: "주문 완료 후 1시간 이내에 고객센터(02-1234-5678)로 연락주시면 취소 가능합니다. 이미 배송이 시작된 경우에는 배송 완료 후 반품 절차를 진행해주세요.",
      },
      {
        q: "결제 방법은 어떤 것들이 있나요?",
        a: "신용카드(국내 모든 카드사), 계좌이체, 무통장입금, 카카오페이, 네이버페이를 지원합니다. 법인 고객의 경우 후불결제도 가능합니다.",
      },
      {
        q: "세금계산서 발행이 가능한가요?",
        a: "네, 사업자등록증 제출 시 세금계산서 발행이 가능합니다. 주문 시 세금계산서 발행을 선택하시고 사업자 정보를 입력해주세요.",
      },
      {
        q: "할부 결제가 가능한가요?",
        a: "신용카드 결제 시 2-12개월 할부가 가능합니다. 5만원 이상 구매 시 무이자 할부 혜택도 제공됩니다.",
      },
    ],
  },
  {
    category: "배송/교환/반품",
    questions: [
      {
        q: "배송 기간은 얼마나 걸리나요?",
        a: "재고 보유 제품은 당일 출고되며, 맞춤 제작 제품은 3-5일 소요됩니다. 제주도 및 도서산간 지역은 1-2일 추가 소요될 수 있습니다.",
      },
      {
        q: "교환/반품이 가능한가요?",
        a: "제품 수령 후 7일 이내 미사용 제품에 한해 교환/반품이 가능합니다. 단, 맞춤 제작 제품은 교환/반품이 불가능합니다.",
      },
      {
        q: "배송비는 얼마인가요?",
        a: "10만원 이상 구매 시 무료배송, 미만 시 전국 일률 3,000원입니다. 제주도 및 도서산간 지역은 추가 배송비가 발생할 수 있습니다.",
      },
      {
        q: "배송 추적이 가능한가요?",
        a: "네, 출고 완료 시 SMS와 이메일로 송장번호를 안내드립니다. 택배사 홈페이지에서 실시간 배송 추적이 가능합니다.",
      },
    ],
  },
  {
    category: "제품/기술",
    questions: [
      {
        q: "맞춤 제작이 가능한가요?",
        a: "네, 고객 요구사항에 맞는 맞춤 제작 서비스를 제공합니다. 도면 제공 시 정확한 견적과 제작 기간을 안내드립니다.",
      },
      {
        q: "품질보증 기간은 얼마나 되나요?",
        a: "모든 제품에 대해 구매일로부터 1년간 품질보증을 제공합니다. 정상 사용 중 발생한 제조상 결함은 무상 수리 또는 교체해드립니다.",
      },
      {
        q: "기술 지원을 받을 수 있나요?",
        a: "전문 기술진이 설치 및 사용법에 대한 기술 지원을 제공합니다. 전화, 이메일, 현장 방문 지원이 모두 가능합니다.",
      },
      {
        q: "제품 사양서를 받을 수 있나요?",
        a: "네, 모든 제품의 상세 사양서와 도면을 제공합니다. 홈페이지에서 다운로드하거나 이메일로 요청하시면 발송해드립니다.",
      },
    ],
  },
]

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const filteredFAQ = faqData
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (q) =>
          q.q.toLowerCase().includes(searchTerm.toLowerCase()) || q.a.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    }))
    .filter((category) => category.questions.length > 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <ScrollHeader />

      <div className="pt-16">
        {/* Hero Section */}
        <section className="relative py-16 bg-gradient-to-r from-blue-600 to-indigo-700">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold text-white mb-4">자주 묻는 질문</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">고객님들이 자주 문의하시는 내용을 정리했습니다</p>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Search */}
          <div className="mb-12">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="질문 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 text-lg"
              />
            </div>
          </div>

          {/* FAQ Categories */}
          <div className="space-y-8">
            {filteredFAQ.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{category.category}</h2>
                <div className="space-y-4">
                  {category.questions.map((faq, faqIndex) => {
                    const itemId = `${categoryIndex}-${faqIndex}`
                    const isExpanded = expandedItems.includes(itemId)

                    return (
                      <Card key={faqIndex} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                        <CardContent className="p-0">
                          <button
                            onClick={() => toggleExpanded(itemId)}
                            className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-gray-900 pr-4">{faq.q}</h3>
                              {isExpanded ? (
                                <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                              )}
                            </div>
                          </button>
                          {isExpanded && (
                            <div className="px-6 pb-6">
                              <div className="border-t border-gray-200 pt-4">
                                <p className="text-gray-700 leading-relaxed">{faq.a}</p>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {filteredFAQ.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">검색 결과가 없습니다.</p>
              <p className="text-gray-400 mt-2">다른 키워드로 검색해보세요.</p>
            </div>
          )}

          {/* Contact CTA */}
          <div className="mt-16 text-center">
            <div className="bg-blue-50 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">원하는 답변을 찾지 못하셨나요?</h3>
              <p className="text-gray-600 mb-6">전문 상담원이 직접 도움을 드리겠습니다.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/support">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
                    문의하기
                  </button>
                </Link>
                <Link href="tel:02-1234-5678">
                  <button className="border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold px-6 py-3 rounded-lg transition-colors">
                    전화 상담
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
