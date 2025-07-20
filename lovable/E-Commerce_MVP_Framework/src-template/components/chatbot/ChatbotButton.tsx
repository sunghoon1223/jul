import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, X, Sparkles } from 'lucide-react'
import { CustomerChatbot } from './CustomerChatbot'
import { useLocation, useParams } from 'react-router-dom'
import { useProductBySlug } from '@/hooks/useProductBySlug'

export function ChatbotButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<{
    name: string
    category: string
    description: string
    price: number
  } | undefined>()
  
  const location = useLocation()
  
  // URL에서 제품 슬러그 추출
  const isProductDetailPage = location.pathname.startsWith('/products/') && location.pathname !== '/products'
  const productSlug = isProductDetailPage ? location.pathname.split('/products/')[1] : ''
  
  // 제품 상세 페이지일 때만 제품 데이터 가져오기
  const { data: product } = useProductBySlug(productSlug || '')

  // 제품 상세 페이지에서 현재 제품 정보 설정
  useEffect(() => {
    if (product && isProductDetailPage) {
      setCurrentProduct({
        name: product.name,
        category: product.category?.name || '캐스터',
        description: product.description,
        price: product.price
      })
    } else {
      setCurrentProduct(undefined)
    }
  }, [product, isProductDetailPage])

  // 챗봇이 열릴 때 미읽음 메시지 상태 초기화
  useEffect(() => {
    if (isOpen) {
      setHasUnreadMessages(false)
    }
  }, [isOpen])

  // 컴포넌트 초기화 (부드러운 로딩)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  const handleToggle = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setHasUnreadMessages(false)
    }
  }

  // 초기화 완료 후에만 렌더링
  if (!isInitialized) {
    return null
  }

  return (
    <>
      {/* 플로팅 챗봇 버튼 */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          onClick={handleToggle}
          className={`
            h-14 w-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110
            ${isOpen 
              ? 'bg-gray-500 hover:bg-gray-600' 
              : 'bg-amber-500 hover:bg-amber-600'
            }
            ${hasUnreadMessages ? 'animate-pulse' : ''}
          `}
          size="icon"
          style={{
            opacity: isInitialized ? 1 : 0,
            transition: 'opacity 0.3s ease-out'
          }}
        >
          {isOpen ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <MessageCircle className="h-6 w-6 text-white" />
          )}
        </Button>

        {/* 미읽음 메시지 뱃지 */}
        {hasUnreadMessages && !isOpen && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-6 w-6 p-0 flex items-center justify-center text-xs animate-bounce"
          >
            <Sparkles className="h-3 w-3" />
          </Badge>
        )}

        {/* 툴팁 */}
        {!isOpen && (
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap">
              AI 상담 문의하기
              <div className="absolute top-full right-4 -mt-1">
                <div className="border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 챗봇 모달 */}
      <CustomerChatbot
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        currentProduct={currentProduct}
      />
    </>
  )
}