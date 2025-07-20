import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Link } from 'react-router-dom'
import { 
  User, 
  Package, 
  Settings, 
  Heart, 
  Edit, 
  Eye, 
  Truck, 
  CreditCard,
  Bell,
  Shield,
  LogOut,
  ArrowRight
} from 'lucide-react'
import { useState } from 'react'

// Mock data
const mockUser = {
  id: 1,
  name: '김철수',
  email: 'kim@company.com',
  phone: '010-1234-5678',
  company: '테크 컴퍼니',
  joinDate: '2024-01-15',
  avatar: null
}

const mockOrders = [
  {
    id: '1001',
    date: '2024-01-20',
    status: '배송중',
    total: 300000,
    items: [
      { name: 'AGV 캐스터 AC-100', quantity: 2, price: 150000 }
    ]
  },
  {
    id: '1002',
    date: '2024-01-18',
    status: '완료',
    total: 425000,
    items: [
      { name: '산업용 캐스터 IC-200', quantity: 5, price: 85000 }
    ]
  },
  {
    id: '1003',
    date: '2024-01-15',
    status: '취소',
    total: 320000,
    items: [
      { name: '메카넘 휠 MW-300', quantity: 1, price: 320000 }
    ]
  }
]

const mockWishlist = [
  {
    id: 1,
    name: '폴리우레탄 휠 PW-400',
    price: 65000,
    image: '/images/wheel1.jpg',
    stock: 67
  },
  {
    id: 2,
    name: '러버 휠 RW-500',
    price: 45000,
    image: '/images/wheel2.jpg',
    stock: 134
  }
]

export function AccountPage() {
  const [userInfo, setUserInfo] = useState(mockUser)
  const [isEditing, setIsEditing] = useState(false)

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault()
    setIsEditing(false)
    // Handle profile update
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case '완료':
        return 'default'
      case '배송중':
        return 'secondary'
      case '취소':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8 animate-fade-in-up">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-yellow-600 transition-colors">홈</Link>
            <span>/</span>
            <span className="text-foreground">계정</span>
          </div>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src={userInfo.avatar || ''} />
              <AvatarFallback className="text-2xl bg-yellow-100 text-yellow-600">
                {userInfo.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{userInfo.name}</h1>
              <p className="text-muted-foreground">{userInfo.email}</p>
              <p className="text-sm text-muted-foreground">
                가입일: {new Date(userInfo.joinDate).toLocaleDateString('ko-KR')}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">총 주문</p>
                  <p className="text-2xl font-bold">{mockOrders.length}</p>
                </div>
                <Package className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">총 구매액</p>
                  <p className="text-2xl font-bold">₩{mockOrders.reduce((sum, order) => sum + order.total, 0).toLocaleString()}</p>
                </div>
                <CreditCard className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">위시리스트</p>
                  <p className="text-2xl font-bold">{mockWishlist.length}</p>
                </div>
                <Heart className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">진행 중인 주문</p>
                  <p className="text-2xl font-bold">{mockOrders.filter(o => o.status === '배송중').length}</p>
                </div>
                <Truck className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              프로필
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              주문 내역
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              위시리스트
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              설정
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>개인 정보</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {isEditing ? '취소' : '편집'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">이름</Label>
                      <Input
                        id="name"
                        value={userInfo.name}
                        onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">이메일</Label>
                      <Input
                        id="email"
                        type="email"
                        value={userInfo.email}
                        onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">연락처</Label>
                      <Input
                        id="phone"
                        value={userInfo.phone}
                        onChange={(e) => setUserInfo({...userInfo, phone: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="company">회사</Label>
                      <Input
                        id="company"
                        value={userInfo.company}
                        onChange={(e) => setUserInfo({...userInfo, company: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  
                  {isEditing && (
                    <div className="flex gap-2">
                      <Button type="submit" className="bg-yellow-400 hover:bg-yellow-500 text-gray-900">
                        저장
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                        취소
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>주문 내역</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="font-medium">주문 #{order.id}</div>
                            <div className="text-sm text-muted-foreground">{order.date}</div>
                          </div>
                          <Badge variant={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">₩{order.total.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">
                            {order.items.reduce((sum, item) => sum + item.quantity, 0)}개 상품
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span>{item.name}</span>
                            <span>{item.quantity}개 × ₩{item.price.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-2" />
                          상세 보기
                        </Button>
                        {order.status === '배송중' && (
                          <Button size="sm" variant="outline">
                            <Truck className="w-4 h-4 mr-2" />
                            배송 추적
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wishlist Tab */}
          <TabsContent value="wishlist" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>위시리스트</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockWishlist.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-lg font-bold text-yellow-600">₩{item.price.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">재고: {item.stock}개</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-gray-900">
                          장바구니에 추가
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>계정 설정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">알림 설정</div>
                        <div className="text-sm text-muted-foreground">주문 및 배송 알림</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      설정
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">비밀번호 변경</div>
                        <div className="text-sm text-muted-foreground">계정 보안 관리</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      변경
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">결제 정보</div>
                        <div className="text-sm text-muted-foreground">저장된 결제 수단</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      관리
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg border-red-200">
                    <div className="flex items-center gap-3">
                      <LogOut className="w-5 h-5 text-red-500" />
                      <div>
                        <div className="font-medium text-red-700">계정 탈퇴</div>
                        <div className="text-sm text-red-600">모든 데이터가 삭제됩니다</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
                      탈퇴
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}