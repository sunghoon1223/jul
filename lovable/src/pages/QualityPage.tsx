import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import { Shield, Award, CheckCircle, FileText, Clock, Users, ArrowRight } from 'lucide-react'

export function QualityPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8 animate-fade-in-up">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-yellow-600 transition-colors">홈</Link>
            <span>/</span>
            <span className="text-foreground">품질보증</span>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center px-6 py-3 mb-6 bg-yellow-400/20 rounded-full border-2 border-yellow-400/30">
            <Shield className="w-5 h-5 text-yellow-400 mr-3" />
            <span className="text-sm font-black text-yellow-400 uppercase tracking-widest">
              QUALITY ASSURANCE
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            품질보증
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            ISO 9001 인증을 바탕으로 한 엄격한 품질 관리 시스템과 10년 이상의 전문 경험으로 
            최상의 제품 품질을 보장합니다.
          </p>
        </div>

        {/* Quality Standards */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">품질 표준</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Shield,
                title: "ISO 9001 인증",
                description: "국제 품질경영시스템 인증으로 검증된 품질 관리"
              },
              {
                icon: Award,
                title: "KC 안전인증",
                description: "국가 안전 기준을 만족하는 안전한 제품"
              },
              {
                icon: CheckCircle,
                title: "품질 검사",
                description: "전 제품 출하 전 엄격한 품질 검사 실시"
              },
              {
                icon: FileText,
                title: "품질 문서화",
                description: "모든 품질 관련 데이터 체계적 관리"
              }
            ].map((item, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Quality Process */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">품질 관리 프로세스</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "원료 검사",
                description: "모든 원료는 입고 시 품질 기준에 따라 엄격하게 검사합니다."
              },
              {
                step: "02", 
                title: "제조 공정 관리",
                description: "생산 과정에서 실시간 품질 모니터링을 통해 일관된 품질을 유지합니다."
              },
              {
                step: "03",
                title: "최종 검사",
                description: "출하 전 최종 품질 검사를 통해 완벽한 제품만을 공급합니다."
              }
            ].map((item, index) => (
              <Card key={index} className="relative overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="text-4xl font-bold text-yellow-400 mb-2">{item.step}</div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Certifications */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">인증 현황</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-600" />
                  품질 인증
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>ISO 9001:2015</span>
                    <Badge variant="default">유효</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>KC 안전인증</span>
                    <Badge variant="default">유효</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>CE 마킹</span>
                    <Badge variant="default">유효</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>RoHS 준수</span>
                    <Badge variant="default">유효</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  품질 보증 기간
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>일반 캐스터</span>
                    <Badge variant="secondary">1년</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>산업용 캐스터</span>
                    <Badge variant="secondary">2년</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>AGV 캐스터</span>
                    <Badge variant="secondary">3년</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>메카넘 휠</span>
                    <Badge variant="secondary">2년</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Quality Team */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">품질 관리팀</h2>
            <p className="text-muted-foreground">
              전문 품질 관리팀이 24시간 제품 품질을 책임집니다.
            </p>
          </div>
          
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">전문 인력</h3>
                  <p className="text-sm text-muted-foreground">10년 이상 경험의 품질 관리 전문가</p>
                </div>
                <div>
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">실시간 모니터링</h3>
                  <p className="text-sm text-muted-foreground">생산 전 과정 실시간 품질 관리</p>
                </div>
                <div>
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">지속적 개선</h3>
                  <p className="text-sm text-muted-foreground">고객 피드백 기반 품질 개선</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold mb-4">품질에 대한 확신</h2>
              <p className="text-lg mb-8 opacity-90">
                우리의 품질 관리 시스템에 대해 더 자세히 알아보시거나 
                품질 관련 문의사항이 있으시면 언제든지 연락주세요.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-gray-900">
                  <Link to="/support">
                    품질 문의하기
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-gray-900">
                  <Link to="/products">
                    제품 둘러보기
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