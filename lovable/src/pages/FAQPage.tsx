import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Search, HelpCircle, Package, Truck, CreditCard, Settings, Phone, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  tags: string[]
}

const faqData: FAQ[] = [
  {
    id: '1',
    question: 'AGV 캐스터와 일반 캐스터의 차이점은 무엇인가요?',
    answer: 'AGV 캐스터는 무인 운반차량(AGV)의 특수한 요구사항에 맞춰 설계되었습니다. 일반 캐스터에 비해 더 높은 정밀도, 내구성, 그리고 자동화 시스템과의 호환성을 제공합니다. 또한 센서 통합, 정확한 위치 제어, 그리고 장시간 연속 운전에 최적화되어 있습니다.',
    category: '제품',
    tags: ['AGV', '캐스터', '차이점', '자동화']
  },
  {
    id: '2',
    question: '메카넘 휠은 어떤 원리로 360도 이동이 가능한가요?',
    answer: '메카넘 휠은 바퀴 둘레에 45도 각도로 배치된 작은 롤러들로 구성되어 있습니다. 4개의 메카넘 휠이 각각 다른 속도와 방향으로 회전하면서 전후진, 좌우 이동, 회전, 그리고 대각선 이동까지 가능합니다. 이러한 전방향 이동 능력으로 좁은 공간에서도 자유로운 조작이 가능합니다.',
    category: '제품',
    tags: ['메카넘', '휠', '360도', '이동', '원리']
  },
  {
    id: '3',
    question: '폴리우레탄 휠의 수명은 얼마나 되나요?',
    answer: '폴리우레탄 휠의 수명은 사용 환경과 조건에 따라 다르지만, 일반적으로 고무 휠보다 3-5배 더 오래 사용할 수 있습니다. 실내 환경에서는 보통 2-3년, 산업 환경에서는 1-2년 정도 사용 가능합니다. 정기적인 점검과 적절한 유지보수를 통해 수명을 연장할 수 있습니다.',
    category: '제품',
    tags: ['폴리우레탄', '휠', '수명', '내구성']
  },
  {
    id: '4',
    question: '주문 후 배송까지 얼마나 걸리나요?',
    answer: '재고 상품의 경우 주문 확인 후 1-2일 내에 출고되며, 배송지에 따라 2-3일 내에 도착합니다. 맞춤 제작 상품의 경우 제작 기간 1-2주 + 배송 기간이 소요됩니다. 급한 주문의 경우 고객센터로 문의하시면 최대한 빠른 배송을 도와드리겠습니다.',
    category: '배송',
    tags: ['배송', '시간', '주문', '출고']
  },
  {
    id: '5',
    question: '전국 어디든 배송이 가능한가요?',
    answer: '네, 전국 어디든 배송 가능합니다. 제주도와 도서산간 지역은 추가 배송료가 발생할 수 있습니다. 50만원 이상 주문 시 전국 무료배송이며, 대량 주문의 경우 별도 협의를 통해 배송 조건을 결정합니다.',
    category: '배송',
    tags: ['전국배송', '무료배송', '제주도', '도서산간']
  },
  {
    id: '6',
    question: '어떤 결제 방법을 사용할 수 있나요?',
    answer: '신용카드, 계좌이체, 무통장입금, 현금영수증 발행이 가능합니다. 법인고객의 경우 세금계산서 발행과 후불결제도 가능합니다. 대량 주문 시에는 별도 계약을 통한 결제 조건 협의가 가능합니다.',
    category: '결제',
    tags: ['결제', '신용카드', '계좌이체', '세금계산서']
  },
  {
    id: '7',
    question: '반품이나 교환은 어떻게 하나요?',
    answer: '제품 수령 후 7일 이내에 반품/교환 신청이 가능합니다. 단, 맞춤 제작 상품이나 고객의 단순 변심으로 인한 반품은 제한될 수 있습니다. 제품 하자나 오배송의 경우 무료로 교환해드리며, 반품 배송비는 당사에서 부담합니다.',
    category: '반품/교환',
    tags: ['반품', '교환', '환불', '하자']
  },
  {
    id: '8',
    question: '설치나 기술 지원 서비스가 있나요?',
    answer: '네, 전문 기술진이 직접 방문하여 설치 및 기술 지원 서비스를 제공합니다. 사전 예약을 통해 설치 일정을 조율하며, 설치 후에도 지속적인 A/S 서비스를 제공합니다. 원격 기술 지원도 가능하며, 긴급 상황 시 24시간 지원 서비스도 운영합니다.',
    category: '기술지원',
    tags: ['설치', '기술지원', 'A/S', '방문서비스']
  },
  {
    id: '9',
    question: '제품 보증 기간은 얼마나 되나요?',
    answer: '모든 제품은 구매일로부터 1년간 품질보증을 제공합니다. 정상적인 사용 조건 하에서 발생한 제품 하자의 경우 무료 수리 또는 교환해드립니다. 보증 기간 내에도 고객 과실로 인한 파손은 유료 수리가 될 수 있습니다.',
    category: '보증',
    tags: ['보증', '1년', '품질보증', '무료수리']
  },
  {
    id: '10',
    question: '대량 주문 시 할인이 있나요?',
    answer: '네, 대량 주문 시 수량에 따른 할인 혜택을 제공합니다. 100개 이상 주문 시 5%, 500개 이상 시 10%, 1000개 이상 시 15% 할인이 적용됩니다. 정확한 견적은 고객센터로 문의하시면 맞춤 견적을 제공해드리겠습니다.',
    category: '가격',
    tags: ['대량주문', '할인', '견적', '수량할인']
  }
]

const categories = ['전체', '제품', '배송', '결제', '반품/교환', '기술지원', '보증', '가격']

export function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('전체')

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === '전체' || faq.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8 animate-fade-in-up">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-amber-600 transition-colors">홈</Link>
            <span>/</span>
            <Link to="/support" className="hover:text-amber-600 transition-colors">고객지원</Link>
            <span>/</span>
            <span className="text-foreground">FAQ</span>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center px-6 py-3 mb-6 bg-amber-400/20 rounded-full border-2 border-amber-400/30">
            <HelpCircle className="w-5 h-5 text-amber-400 mr-3" />
            <span className="text-sm font-black text-amber-400 uppercase tracking-widest">
              FAQ
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            자주 묻는 질문
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            JP캐스터 제품과 서비스에 대한 궁금한 점을 빠르게 해결해보세요
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="질문이나 키워드를 검색해보세요..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category ? "bg-amber-400 text-slate-900 hover:bg-amber-500" : ""}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="max-w-4xl mx-auto">
          {filteredFAQs.length > 0 ? (
            <Accordion type="single" collapsible className="space-y-4">
              {filteredFAQs.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id} className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left hover:no-underline">
                    <div className="flex items-start gap-3">
                      <Badge variant="secondary" className="mt-1">
                        {faq.category}
                      </Badge>
                      <span className="font-medium">{faq.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pt-4">
                    <p className="leading-relaxed mb-4">{faq.answer}</p>
                    <div className="flex flex-wrap gap-1">
                      {faq.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-12">
              <HelpCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">검색 결과가 없습니다</h3>
              <p className="text-muted-foreground">다른 키워드로 검색해보시거나 아래 연락처로 문의해주세요</p>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Package className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <CardTitle className="text-lg">제품 카탈로그</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                다양한 캐스터 제품을 확인해보세요
              </p>
              <Button asChild variant="outline" className="hover:bg-amber-50 hover:text-amber-900">
                <Link to="/products">제품 보기</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Phone className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <CardTitle className="text-lg">전화 상담</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                전문 상담원과 직접 통화하세요
              </p>
              <p className="text-lg font-bold text-amber-600 mb-4">1588-1234</p>
              <Button variant="outline" className="hover:bg-amber-50 hover:text-amber-900">
                <Phone className="w-4 h-4 mr-2" />
                전화하기
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Mail className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <CardTitle className="text-lg">온라인 문의</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                온라인으로 편리하게 문의하세요
              </p>
              <Button asChild variant="outline" className="hover:bg-amber-50 hover:text-amber-900">
                <Link to="/support">문의하기</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Contact CTA */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">찾는 답변이 없나요?</h2>
              <p className="text-lg mb-6 opacity-90">
                추가 문의사항이 있으시면 언제든지 연락해주세요. 전문 상담원이 도움을 드리겠습니다.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-amber-400 hover:bg-amber-500 text-slate-900">
                  <Link to="/support">
                    <Mail className="w-5 h-5 mr-2" />
                    온라인 문의
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-slate-900 hover:!text-slate-900 focus:bg-white focus:text-slate-900">
                  <Link to="/dealers">
                    <Phone className="w-5 h-5 mr-2" />
                    대리점 찾기
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}