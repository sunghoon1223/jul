import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { 
  Building, 
  Users, 
  Award, 
  Target, 
  ArrowRight,
  CheckCircle,
  Clock,
  Shield,
  Globe
} from 'lucide-react'

export function AboutPage() {
  const stats = [
    { icon: Clock, label: '설립년도', value: '2004년' },
    { icon: Users, label: '전문 인력', value: '50명+' },
    { icon: Award, label: '특허 기술', value: '15개' },
    { icon: Globe, label: '해외 수출', value: '30개국' }
  ]

  const values = [
    {
      icon: Target,
      title: '정확성',
      description: '고객의 요구사항을 정확히 파악하여 최적의 솔루션을 제공합니다.'
    },
    {
      icon: Shield,
      title: '신뢰성',
      description: '엄격한 품질 관리와 지속적인 R&D로 신뢰할 수 있는 제품을 만듭니다.'
    },
    {
      icon: CheckCircle,
      title: '혁신성',
      description: '끊임없는 기술 개발로 산업 발전에 기여하는 혁신적인 제품을 개발합니다.'
    }
  ]

  const milestones = [
    { year: '2004', event: 'JP캐스터 설립' },
    { year: '2008', event: 'ISO 9001 인증 획득' },
    { year: '2012', event: '메카넘 휠 기술 개발' },
    { year: '2016', event: '해외 수출 시작' },
    { year: '2020', event: 'AGV 캐스터 전문화' },
    { year: '2024', event: '스마트 팩토리 솔루션 런칭' }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 hero-gradient text-primary-foreground">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            JP캐스터 소개
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
            2004년부터 산업용 캐스터 분야의 선두주자로서, 
            혁신적인 기술과 최고의 품질로 고객의 성공을 함께 만들어가고 있습니다.
          </p>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            20년 전통의 캐스터 전문기업
          </Badge>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="card-industrial text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 btn-industrial rounded-xl flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-20 px-4 metallic-bg">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-primary mb-6">
                우리의 이야기
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  JP캐스터는 2004년 설립 이후 산업용 캐스터 분야에서 끊임없는 혁신을 추구해왔습니다. 
                  창립자의 '움직임의 자유를 제공한다'는 철학을 바탕으로, 다양한 산업 분야에 
                  최적화된 캐스터 솔루션을 제공하고 있습니다.
                </p>
                <p>
                  자동화 설비의 발달과 함께 AGV, 로봇, 스마트 팩토리 등 첨단 산업 분야로 
                  사업영역을 확장하며, 지속적인 R&D 투자를 통해 업계 최고 수준의 
                  기술력을 확보하고 있습니다.
                </p>
                <p>
                  현재 30개국에 제품을 수출하며 글로벌 시장에서도 인정받는 
                  대한민국 대표 캐스터 기업으로 성장했습니다.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-primary mb-6">주요 연혁</h3>
              <div className="space-y-4">
                {milestones.map((milestone, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-16 h-16 btn-industrial rounded-full flex items-center justify-center text-primary-foreground font-bold">
                      {milestone.year.slice(-2)}
                    </div>
                    <div>
                      <div className="font-semibold text-primary">{milestone.year}</div>
                      <div className="text-muted-foreground">{milestone.event}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center text-primary mb-16">
            핵심 가치
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="card-industrial text-center group hover:shadow-industrial">
                <CardHeader>
                  <div className="w-16 h-16 btn-industrial rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <value.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl text-primary">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 px-4 metallic-bg">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            <Card className="card-industrial">
              <CardHeader>
                <CardTitle className="text-2xl text-primary flex items-center gap-3">
                  <Target className="h-6 w-6" />
                  비전
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  글로벌 1위 산업용 캐스터 전문기업으로서, 
                  혁신적인 기술과 최고의 품질로 
                  <span className="font-semibold text-primary"> 움직임의 미래를 선도</span>합니다.
                </p>
              </CardContent>
            </Card>

            <Card className="card-industrial">
              <CardHeader>
                <CardTitle className="text-2xl text-primary flex items-center gap-3">
                  <Building className="h-6 w-6" />
                  미션
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  고객의 비즈니스 성공을 위한 
                  <span className="font-semibold text-primary">최적의 캐스터 솔루션</span>을 제공하며, 
                  지속가능한 산업 발전에 기여합니다.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 hero-gradient text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            JP캐스터와 함께하세요
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            20년 경험과 기술력으로 귀하의 비즈니스 성공을 함께 만들어갑니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="btn-accent">
              <Link to="/products">
                제품 보기
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              <Link to="/support">
                상담 문의
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}