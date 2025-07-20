import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Link, useLocation, Navigate } from 'react-router-dom'
import { CheckCircle, Package, ArrowRight, Download, Truck } from 'lucide-react'

export function CheckoutSuccessPage() {
  const location = useLocation()
  const { orderId, orderTotal } = location.state || {}

  // Redirect if no order information
  if (!orderId) {
    return <Navigate to="/" replace />
  }

  const orderNumber = orderId.replace('ORDER_', '')
  const estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR')

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">주문이 완료되었습니다!</h1>
          <p className="text-muted-foreground">주문해 주셔서 감사합니다. 주문 확인 이메일을 발송해 드렸습니다.</p>
        </div>

        {/* Order Details */}
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-yellow-600" />
                주문 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">주문번호</p>
                  <p className="font-bold text-lg">#{orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">주문 금액</p>
                  <p className="font-bold text-lg">₩{orderTotal?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">주문일</p>
                  <p className="font-medium">{new Date().toLocaleDateString('ko-KR')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">예상 배송일</p>
                  <p className="font-medium flex items-center gap-2">
                    <Truck className="w-4 h-4 text-yellow-600" />
                    {estimatedDelivery}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">주문 상태</p>
                  <p className="font-medium text-green-600">결제 완료</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>다음 단계</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium">주문 확인</div>
                    <div className="text-sm text-muted-foreground">주문 확인 이메일을 확인하세요</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Package className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <div className="font-medium">상품 준비</div>
                    <div className="text-sm text-muted-foreground">1-2 영업일 내 상품을 준비합니다</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <Truck className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium">배송 시작</div>
                    <div className="text-sm text-muted-foreground">배송 추적 정보를 이메일로 안내드립니다</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-gray-900">
              <Link to="/account">
                <Package className="w-4 h-4 mr-2" />
                주문 내역 보기
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="flex-1">
              <Link to="/products">
                <ArrowRight className="w-4 h-4 mr-2" />
                쇼핑 계속하기
              </Link>
            </Button>
          </div>

          {/* Support Info */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="font-semibold mb-2">궁금한 점이 있으시나요?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  주문이나 배송에 관해 문의사항이 있으시면 언제든 연락주세요.
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link to="/support">
                    고객지원 센터
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