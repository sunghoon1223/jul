import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Phone, Mail, MapPin, Clock, MessageCircle, FileText } from 'lucide-react'

export function SupportPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">고객지원</h1>
          <p className="text-xl text-muted-foreground">
            전문 기술진이 최적의 캐스터 솔루션을 제안해 드립니다
          </p>
        </div>

        {/* Contact Info */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="text-center">
            <CardHeader>
              <Phone className="h-8 w-8 mx-auto text-primary mb-2" />
              <CardTitle className="text-lg">전화 문의</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">평일 9:00-18:00</p>
              <p className="font-semibold">02-1234-5678</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Mail className="h-8 w-8 mx-auto text-primary mb-2" />
              <CardTitle className="text-lg">이메일 문의</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">24시간 접수</p>
              <p className="font-semibold">info@jpcaster.co.kr</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <MessageCircle className="h-8 w-8 mx-auto text-primary mb-2" />
              <CardTitle className="text-lg">카카오톡</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">실시간 상담</p>
              <p className="font-semibold">@jpcaster</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <FileText className="h-8 w-8 mx-auto text-primary mb-2" />
              <CardTitle className="text-lg">기술자료</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">제품 카탈로그</p>
              <Button variant="outline" size="sm">다운로드</Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>문의하기</CardTitle>
              <CardDescription>
                제품 문의나 기술 지원이 필요하시면 언제든 연락주세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">이름</Label>
                  <Input id="name" placeholder="홍길동" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">회사명</Label>
                  <Input id="company" placeholder="(주)회사명" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>
                  <Input id="email" type="email" placeholder="example@company.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">연락처</Label>
                  <Input id="phone" placeholder="010-1234-5678" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">문의 유형</Label>
                <select className="w-full p-2 border rounded-md">
                  <option>제품 문의</option>
                  <option>기술 지원</option>
                  <option>견적 요청</option>
                  <option>일반 문의</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">문의 내용</Label>
                <Textarea 
                  id="message" 
                  placeholder="상세한 문의 내용을 입력해 주세요" 
                  rows={5}
                />
              </div>

              <Button className="w-full" size="lg">
                문의 보내기
              </Button>
            </CardContent>
          </Card>

          {/* Company Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  찾아오시는 길
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold">본사 및 공장</p>
                    <p className="text-muted-foreground">
                      경기도 안산시 단원구 산업로 123<br />
                      JP캐스터 본사빌딩
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">지하철</p>
                    <p className="text-muted-foreground">
                      4호선 안산역 3번 출구에서 도보 10분
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">버스</p>
                    <p className="text-muted-foreground">
                      123, 456, 789번 산업단지입구 하차
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  운영시간
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
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
                  <div className="text-sm text-muted-foreground mt-3">
                    * 긴급 기술지원은 24시간 가능합니다
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}