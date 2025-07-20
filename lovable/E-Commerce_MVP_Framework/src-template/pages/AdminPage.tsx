import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Link } from 'react-router-dom'
import { 
  Package, 
  Users, 
  ShoppingCart, 
  BarChart3, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Bell,
  Pin,
  AlertCircle,
  Bot
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAdmin } from '@/hooks/useAdmin'
import { useNoticeManagement } from '@/hooks/useNoticeManagement'
import { useProductManagement } from '@/hooks/useProductManagement'
import { NoticeEditor } from '@/components/admin/NoticeEditor'
import { ProductEditor } from '@/components/admin/ProductEditor'
import { AIProductGenerator } from '@/components/admin/AIProductGenerator'
import { AdminChatbot } from '@/components/chatbot/AdminChatbot'

export function AdminPage() {
  const { isAdmin, loading: adminLoading, adminUser } = useAdmin()
  const { notices, loading: noticesLoading, loadNotices, createNotice, updateNotice, deleteNotice, togglePin } = useNoticeManagement()
  const { products, loading: productsLoading, loadProducts, createProduct, updateProduct, deleteProduct, togglePublishStatus } = useProductManagement()
  
  // 상태 관리
  const [searchTerm, setSearchTerm] = useState("")
  const [noticeEditorOpen, setNoticeEditorOpen] = useState(false)
  const [editingNotice, setEditingNotice] = useState<any>(null)
  const [productEditorOpen, setProductEditorOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [aiGeneratorOpen, setAiGeneratorOpen] = useState(false)
  
  // 실제 데이터 로딩을 위한 상태들
  const [users, setUsers] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    monthlyOrders: 0,
    monthlyRevenue: 0
  })

  // Load all data on component mount
  useEffect(() => {
    if (isAdmin && !adminLoading) {
      loadNotices()
      loadProducts()
      loadUsers()
      loadOrders()
      loadStats()
    }
  }, [isAdmin, adminLoading, loadNotices, loadProducts])

  // Load users data
  const loadUsers = async () => {
    setUsersLoading(true)
    try {
      const response = await fetch('/api/admin/users.php', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('사용자 데이터 로딩 실패:', error)
    } finally {
      setUsersLoading(false)
    }
  }

  // Load orders data
  const loadOrders = async () => {
    setOrdersLoading(true)
    try {
      const response = await fetch('/api/admin/orders.php', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('주문 데이터 로딩 실패:', error)
    } finally {
      setOrdersLoading(false)
    }
  }

  // Load statistics
  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/stats.php', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setStats({
          totalProducts: data.totalProducts || 0,
          totalUsers: data.totalUsers || 0,
          monthlyOrders: data.monthlyOrders || 0,
          monthlyRevenue: data.monthlyRevenue || 0
        })
      }
    } catch (error) {
      console.error('통계 데이터 로딩 실패:', error)
    }
  }

  // Debug logging with emojis for easy tracking
  console.log('🏠 AdminPage render:', { isAdmin, adminLoading, adminUser: !!adminUser })

  // Simple loading check
  if (adminLoading) {
    console.log('⏳ AdminPage: showing loading state')
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">관리자 권한을 확인 중...</p>
        </div>
      </div>
    )
  }

  // Simple admin check - if not admin, redirect immediately
  if (!isAdmin) {
    console.log('🚫 AdminPage: not admin, redirecting to home')
    return <Navigate to="/" replace />
  }

  // If we reach here, user is admin - show the page
  console.log('✅ AdminPage: admin verified, showing admin dashboard')

  const handleEditNotice = (notice: any) => {
    setEditingNotice(notice)
    setNoticeEditorOpen(true)
  }

  const handleCreateNotice = () => {
    setEditingNotice(null)
    setNoticeEditorOpen(true)
  }

  const handleSaveNotice = async (formData: any) => {
    if (editingNotice) {
      return await updateNotice(editingNotice.id, formData)
    } else {
      return await createNotice(formData)
    }
  }

  const handleDeleteNotice = async (id: number) => {
    if (window.confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
      await deleteNotice(id)
    }
  }

  // Product management handlers
  const handleEditProduct = (product: any) => {
    setEditingProduct(product)
    setProductEditorOpen(true)
  }

  const handleCreateProduct = () => {
    setEditingProduct(null)
    setProductEditorOpen(true)
  }

  const handleSaveProduct = async (formData: any) => {
    if (editingProduct) {
      return await updateProduct(editingProduct.id, formData)
    } else {
      return await createProduct(formData)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('정말로 이 제품을 삭제하시겠습니까?')) {
      await deleteProduct(id)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "활성":
      case "완료":
        return "default"
      case "비활성":
      case "품절":
        return "destructive"
      case "처리중":
      case "배송중":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "cancelled":
        return "destructive"
      case "pending":
      case "processing":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getOrderStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "대기중"
      case "processing":
        return "처리중"
      case "completed":
        return "완료"
      case "cancelled":
        return "취소"
      default:
        return status
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
            <span className="text-foreground">관리자</span>
          </div>
        </nav>

        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-bold text-foreground mb-2">관리자 대시보드</h1>
          <p className="text-muted-foreground">시스템 관리 및 모니터링 도구</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">총 제품</p>
                  <p className="text-2xl font-bold">{stats.totalProducts}</p>
                </div>
                <Package className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-500">+12.5%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">총 사용자</p>
                  <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                </div>
                <Users className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-500">+8.2%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">월간 주문</p>
                  <p className="text-2xl font-bold">{stats.monthlyOrders}</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                <span className="text-sm text-red-500">-3.1%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">월간 매출</p>
                  <p className="text-2xl font-bold">₩{(stats.monthlyRevenue / 1000000).toFixed(1)}M</p>
                </div>
                <DollarSign className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-500">+15.3%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="notices" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="notices" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              공지사항
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              제품 관리
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              사용자 관리
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              주문 관리
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              분석
            </TabsTrigger>
            <TabsTrigger value="ai-assistant" className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              AI 어시스턴트
            </TabsTrigger>
          </TabsList>

          {/* Notices Tab */}
          <TabsContent value="notices" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>공지사항 관리</CardTitle>
                  <Button 
                    onClick={handleCreateNotice}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    새 공지사항 작성
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="공지사항 검색..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    필터
                  </Button>
                </div>

                {noticesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-muted-foreground">공지사항을 불러오는 중...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">제목</th>
                          <th className="text-left py-2">카테고리</th>
                          <th className="text-left py-2">작성자</th>
                          <th className="text-left py-2">작성일</th>
                          <th className="text-left py-2">조회수</th>
                          <th className="text-left py-2">상태</th>
                          <th className="text-left py-2">작업</th>
                        </tr>
                      </thead>
                      <tbody>
                        {notices.map((notice) => (
                          <tr key={notice.id} className="border-b">
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                {notice.isPinned && (
                                  <Pin className="w-4 h-4 text-amber-600" />
                                )}
                                <span className="font-medium max-w-xs truncate">
                                  {notice.title}
                                </span>
                              </div>
                            </td>
                            <td className="py-3">
                              <Badge variant="outline">{notice.category}</Badge>
                            </td>
                            <td className="py-3 text-muted-foreground">{notice.author}</td>
                            <td className="py-3 text-muted-foreground">{formatDate(notice.createdAt)}</td>
                            <td className="py-3 text-muted-foreground">{notice.views}</td>
                            <td className="py-3">
                              <Badge variant={notice.isPinned ? "default" : "secondary"}>
                                {notice.isPinned ? '고정됨' : '일반'}
                              </Badge>
                            </td>
                            <td className="py-3">
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => togglePin(notice.id)}
                                  title={notice.isPinned ? '고정 해제' : '상단 고정'}
                                >
                                  <Pin className={`w-4 h-4 ${notice.isPinned ? 'fill-current' : ''}`} />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleEditNotice(notice)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleDeleteNotice(notice.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>제품 관리</CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => setAiGeneratorOpen(true)}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    >
                      <Bot className="w-4 h-4 mr-2" />
                      AI 자동 생성
                    </Button>
                    <Button 
                      onClick={handleCreateProduct}
                      className="bg-yellow-400 hover:bg-yellow-500 text-gray-900"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      수동 추가
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="제품 검색..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    필터
                  </Button>
                </div>

{productsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-muted-foreground">제품을 불러오는 중...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">제품명</th>
                          <th className="text-left py-2">SKU</th>
                          <th className="text-left py-2">가격</th>
                          <th className="text-left py-2">재고</th>
                          <th className="text-left py-2">상태</th>
                          <th className="text-left py-2">작업</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => (
                          <tr key={product.id} className="border-b">
                            <td className="py-3 font-medium max-w-xs truncate">{product.name}</td>
                            <td className="py-3 text-muted-foreground">{product.sku}</td>
                            <td className="py-3">₩{product.price.toLocaleString()}</td>
                            <td className="py-3">{product.stock_quantity}개</td>
                            <td className="py-3">
                              <Badge variant={product.is_published ? "default" : "secondary"}>
                                {product.is_published ? '발행됨' : '초안'}
                              </Badge>
                            </td>
                            <td className="py-3">
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => togglePublishStatus(product.id)}
                                  title={product.is_published ? '발행 취소' : '발행'}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleEditProduct(product)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleDeleteProduct(product.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>사용자 관리</CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-muted-foreground">사용자 데이터를 불러오는 중...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">이름</th>
                          <th className="text-left py-2">이메일</th>
                          <th className="text-left py-2">가입일</th>
                          <th className="text-left py-2">마지막 로그인</th>
                          <th className="text-left py-2">상태</th>
                          <th className="text-left py-2">작업</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.length > 0 ? users.map((user) => (
                          <tr key={user.id} className="border-b">
                            <td className="py-3 font-medium">{user.name || '이름 없음'}</td>
                            <td className="py-3 text-muted-foreground">{user.email}</td>
                            <td className="py-3">{formatDate(user.created_at)}</td>
                            <td className="py-3">{user.last_login ? formatDate(user.last_login) : '없음'}</td>
                            <td className="py-3">
                              <Badge variant={user.is_active ? "default" : "secondary"}>
                                {user.is_active ? '활성' : '비활성'}
                              </Badge>
                            </td>
                            <td className="py-3">
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-muted-foreground">
                              등록된 사용자가 없습니다.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>주문 관리</CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-muted-foreground">주문 데이터를 불러오는 중...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">주문번호</th>
                          <th className="text-left py-2">고객</th>
                          <th className="text-left py-2">총액</th>
                          <th className="text-left py-2">상태</th>
                          <th className="text-left py-2">주문일</th>
                          <th className="text-left py-2">작업</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.length > 0 ? orders.map((order) => (
                          <tr key={order.id} className="border-b">
                            <td className="py-3 font-medium">#{order.id}</td>
                            <td className="py-3">{order.customer_email || order.customer_name || '고객 정보 없음'}</td>
                            <td className="py-3">₩{order.total_amount.toLocaleString()}</td>
                            <td className="py-3">
                              <Badge variant={getOrderStatusColor(order.status)}>
                                {getOrderStatusText(order.status)}
                              </Badge>
                            </td>
                            <td className="py-3">{formatDate(order.created_at)}</td>
                            <td className="py-3">
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-muted-foreground">
                              주문 내역이 없습니다.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>매출 분석</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>매출 차트가 여기에 표시됩니다</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>인기 제품</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {products.slice(0, 3).map((product, index) => (
                      <div key={product.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-yellow-600">
                              {index + 1}
                            </span>
                          </div>
                          <span className="font-medium">{product.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {product.stock_quantity}개 재고
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>최근 활동</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">새로운 주문 #1005가 접수되었습니다</span>
                    <span className="text-xs text-muted-foreground ml-auto">2분 전</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">제품 "AGV 캐스터 AC-100"의 재고가 업데이트되었습니다</span>
                    <span className="text-xs text-muted-foreground ml-auto">15분 전</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">새로운 사용자가 가입했습니다</span>
                    <span className="text-xs text-muted-foreground ml-auto">1시간 전</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Assistant Tab */}
          <TabsContent value="ai-assistant" className="space-y-6">
            <Card className="h-[600px]">
              <AdminChatbot className="h-full" />
            </Card>
          </TabsContent>
        </Tabs>

        {/* Notice Editor Modal */}
        <NoticeEditor
          isOpen={noticeEditorOpen}
          onClose={() => {
            setNoticeEditorOpen(false)
            setEditingNotice(null)
          }}
          onSave={handleSaveNotice}
          notice={editingNotice}
          loading={noticesLoading}
        />

        {/* Product Editor Modal */}
        <ProductEditor
          isOpen={productEditorOpen}
          onClose={() => {
            setProductEditorOpen(false)
            setEditingProduct(null)
          }}
          onSave={handleSaveProduct}
          product={editingProduct}
          loading={productsLoading}
        />

        {/* AI Product Generator Modal */}
        <AIProductGenerator
          isOpen={aiGeneratorOpen}
          onClose={() => setAiGeneratorOpen(false)}
          onProductCreated={() => {
            loadProducts() // 새로 생성된 제품 목록 새로고침
            setAiGeneratorOpen(false)
          }}
        />
      </div>
    </div>
  )
}