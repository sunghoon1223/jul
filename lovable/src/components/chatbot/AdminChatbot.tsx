import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Send, Bot, User, RefreshCw, Upload, FileImage, Lightbulb, Package, TrendingUp, Users, Settings } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
  typing?: boolean
  type?: 'text' | 'product-generation' | 'tips'
  data?: any
}

interface AdminChatbotProps {
  className?: string
}

// 환경변수 접근 방식 개선 (여러 방법 시도)
const getGeminiApiKey = () => {
  // 1. Vite 환경변수 (개발/빌드 시)
  if (import.meta.env.VITE_GEMINI_API_KEY) {
    return import.meta.env.VITE_GEMINI_API_KEY;
  }
  
  // 2. 정의된 상수 (빌드 시 대체)
  if (typeof __VITE_GEMINI_API_KEY__ !== 'undefined') {
    return __VITE_GEMINI_API_KEY__;
  }
  
  // 3. 기본값 (연동 필요 알림)
  console.warn('⚠️ Gemini API 키가 설정되지 않았습니다. 환경변수를 확인해주세요.');
  return null;
};

const GEMINI_API_KEY = getGeminiApiKey();

const quickActions = [
  {
    icon: Package,
    title: '신제품 생성',
    description: '이미지와 간단한 설명으로 제품 페이지 생성',
    action: 'product-generation'
  },
  {
    icon: TrendingUp,
    title: '매출 분석 팁',
    description: '매출 향상을 위한 전략 및 분석 방법',
    action: 'sales-tips'
  },
  {
    icon: Users,
    title: '고객 관리 가이드',
    description: '효과적인 고객 관리 및 서비스 개선 방법',
    action: 'customer-management'
  },
  {
    icon: Settings,
    title: '사이트 운영 팁',
    description: '이커머스 사이트 운영 및 최적화 조언',
    action: 'site-management'
  }
]

export function AdminChatbot({ className }: AdminChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '안녕하세요! JPCaster 관리자 AI 어시스턴트입니다.\n\n저는 다음과 같은 업무를 도와드릴 수 있습니다:\n\n📦 **제품 페이지 자동 생성**: 이미지와 간단한 설명만으로 완성도 높은 제품 페이지 생성\n📊 **이커머스 운영 팁**: 매출 증대, 고객 관리, 사이트 최적화 등 전문적인 조언\n🎯 **맞춤형 관리 도구**: 재고 관리, 주문 처리, 마케팅 전략 등 실무 가이드\n\n어떤 도움이 필요하신가요?',
      isUser: false,
      timestamp: new Date(),
      type: 'text'
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  const generateSystemPrompt = () => {
    return `
당신은 JPCaster 이커머스 사이트의 전문 관리자 AI 어시스턴트입니다. 다음 역할을 수행해주세요:

**주요 기능:**
1. **제품 페이지 자동 생성**: 
   - 이미지와 간단한 설명을 받아 완성도 높은 제품 정보 생성
   - 제품명, 상세 설명, 주요 특징, 기술 사양, 가격 추천 등
   - SEO 최적화된 제품 설명 작성

2. **이커머스 운영 조언**:
   - 매출 증대 전략 및 마케팅 팁
   - 고객 관리 및 서비스 개선 방법
   - 재고 관리 및 주문 처리 최적화
   - 사이트 성능 및 UX 개선 가이드

3. **실무 지원**:
   - 카테고리 관리 및 상품 분류 조언
   - 가격 전략 및 프로모션 계획
   - 고객 문의 대응 가이드
   - 경쟁사 분석 및 시장 동향

**회사 정보:**
- JPCaster: 산업용 캐스터 전문 제조업체
- 주요 제품: AGV 캐스터, 산업용 캐스터, 폴리우레탄 휠, 러버 휠, 구동 모듈
- 고객층: B2B 제조업체, 물류 회사, 자동화 솔루션 업체

**응답 스타일:**
- 전문적이고 실무적인 조언 제공
- 구체적이고 실행 가능한 솔루션 제시
- 단계별 가이드 및 체크리스트 형태로 정리
- 이커머스 업계 트렌드 및 베스트 프랙티스 반영

**제품 생성 시 포함 요소:**
- 제품명 (한국어/영어)
- 카테고리 분류
- 상세 설명 (기능, 용도, 장점)
- 주요 특징 (5-7개 핵심 포인트)
- 기술 사양 (크기, 하중, 재질 등)
- 적용 분야 및 호환성
- 가격 범위 추천
- SEO 키워드 제안

한국어로 응답하되, 전문적이고 신뢰할 수 있는 톤을 유지해주세요.
`
  }

  const callGeminiAPI = async (userMessage: string, imageData?: string): Promise<string> => {
    try {
      const parts: any[] = [
        {
          text: generateSystemPrompt() + '\n\n관리자 요청: ' + userMessage
        }
      ]

      // 이미지가 있는 경우 추가
      if (imageData) {
        parts.push({
          inline_data: {
            mime_type: 'image/jpeg',
            data: imageData
          }
        })
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: parts
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
          ]
        })
      })

      if (!response.ok) {
        throw new Error(`Gemini API Error: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text
      } else {
        throw new Error('Invalid response format from Gemini API')
      }
    } catch (error) {
      console.error('Gemini API Error:', error)
      return '죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요. 문제가 지속되면 시스템 관리자에게 문의해주세요.'
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB 제한
        toast({
          title: '파일 크기 초과',
          description: '이미지 파일은 5MB 이하여야 합니다.',
          variant: 'destructive'
        })
        return
      }

      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result as string
        // data:image/jpeg;base64, 부분 제거
        const base64Data = base64.split(',')[1]
        resolve(base64Data)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleSendMessage = async () => {
    if ((!inputValue.trim() && !selectedImage) || isLoading) return

    const userMessage = inputValue.trim() || '이미지를 분석해서 제품 정보를 생성해주세요.'
    setInputValue('')
    setIsLoading(true)

    // 사용자 메시지 추가
    const userMessageObj: Message = {
      id: Date.now().toString(),
      content: userMessage + (selectedImage ? '\n\n[첨부된 이미지 분석 요청]' : ''),
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessageObj])

    // 타이핑 인디케이터 추가
    const typingMessage: Message = {
      id: 'typing',
      content: '',
      isUser: false,
      timestamp: new Date(),
      typing: true
    }

    setMessages(prev => [...prev, typingMessage])

    try {
      let imageData: string | undefined
      if (selectedImage) {
        imageData = await convertImageToBase64(selectedImage)
      }

      const aiResponse = await callGeminiAPI(userMessage, imageData)
      
      setMessages(prev => prev.filter(msg => msg.id !== 'typing').concat({
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date(),
        type: selectedImage ? 'product-generation' : 'text'
      }))

      // 이미지 및 미리보기 초기화
      setSelectedImage(null)
      setImagePreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => prev.filter(msg => msg.id !== 'typing').concat({
        id: (Date.now() + 1).toString(),
        content: '죄송합니다. 메시지 전송 중 오류가 발생했습니다. 다시 시도해주세요.',
        isUser: false,
        timestamp: new Date()
      }))
      
      toast({
        title: '메시지 전송 실패',
        description: '일시적인 오류가 발생했습니다. 다시 시도해주세요.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAction = async (action: string) => {
    let prompt = ''
    switch (action) {
      case 'product-generation':
        prompt = '제품 이미지를 업로드하고 간단한 설명을 입력하면, 완성도 높은 제품 페이지를 자동으로 생성해드립니다. 어떤 제품의 페이지를 만들고 싶으신가요?'
        break
      case 'sales-tips':
        prompt = '매출 향상을 위한 전략을 알려드리겠습니다:\n\n1. **상품 분석**: 인기 상품과 저조한 상품을 파악하여 재고 관리 최적화\n2. **가격 전략**: 경쟁사 분석을 통한 적정 가격 설정\n3. **마케팅**: 타겟 고객별 맞춤형 프로모션 계획\n4. **고객 유지**: 리뷰 관리 및 애프터서비스 강화\n\n구체적으로 어떤 부분에 대해 더 자세히 알고 싶으신가요?'
        break
      case 'customer-management':
        prompt = '효과적인 고객 관리 방법을 안내해드리겠습니다:\n\n1. **고객 분류**: VIP, 일반, 신규 고객별 차별화된 서비스\n2. **문의 대응**: 신속하고 정확한 답변을 위한 FAQ 및 템플릿 구축\n3. **만족도 향상**: 정기적인 피드백 수집 및 개선사항 반영\n4. **재구매 유도**: 개인화된 추천 상품 및 할인 혜택 제공\n\n어떤 고객 관리 영역에 집중하고 싶으신가요?'
        break
      case 'site-management':
        prompt = '이커머스 사이트 운영 최적화 가이드:\n\n1. **성능 최적화**: 페이지 로딩 속도 개선 및 모바일 최적화\n2. **SEO 향상**: 검색엔진 최적화를 통한 자연 유입 증대\n3. **UI/UX 개선**: 사용자 경험 향상을 위한 인터페이스 개선\n4. **보안 강화**: 고객 정보 보호 및 결제 시스템 안전성 확보\n\n특별히 개선하고 싶은 영역이 있으신가요?'
        break
    }

    const quickActionMessage: Message = {
      id: Date.now().toString(),
      content: prompt,
      isUser: false,
      timestamp: new Date(),
      type: 'tips'
    }

    setMessages(prev => [...prev, quickActionMessage])
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleClearChat = () => {
    setMessages([
      {
        id: '1',
        content: '안녕하세요! JPCaster 관리자 AI 어시스턴트입니다.\n\n저는 다음과 같은 업무를 도와드릴 수 있습니다:\n\n📦 **제품 페이지 자동 생성**: 이미지와 간단한 설명만으로 완성도 높은 제품 페이지 생성\n📊 **이커머스 운영 팁**: 매출 증대, 고객 관리, 사이트 최적화 등 전문적인 조언\n🎯 **맞춤형 관리 도구**: 재고 관리, 주문 처리, 마케팅 전략 등 실무 가이드\n\n어떤 도움이 필요하신가요?',
        isUser: false,
        timestamp: new Date(),
        type: 'text'
      }
    ])
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    toast({
      title: '대화 내역 삭제',
      description: '새로운 세션을 시작합니다.'
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b bg-gradient-to-r from-amber-50 to-yellow-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-amber-500 rounded-full flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">AI 관리자 어시스턴트</h3>
              <p className="text-sm text-muted-foreground">제품 생성 및 운영 최적화 도우미</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearChat}
            title="대화 내역 삭제"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex-shrink-0 p-4 border-b bg-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-3 flex flex-col gap-2 hover:bg-amber-50"
                onClick={() => handleQuickAction(action.action)}
              >
                <Icon className="h-5 w-5 text-amber-600" />
                <div className="text-center">
                  <div className="text-xs font-medium">{action.title}</div>
                  <div className="text-xs text-muted-foreground hidden md:block">
                    {action.description}
                  </div>
                </div>
              </Button>
            )
          })}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.isUser 
                    ? 'bg-blue-500' 
                    : message.type === 'product-generation' 
                    ? 'bg-green-500' 
                    : message.type === 'tips'
                    ? 'bg-amber-500'
                    : 'bg-gray-500'
                }`}>
                  {message.isUser ? (
                    <User className="h-4 w-4 text-white" />
                  ) : (
                    <Bot className="h-4 w-4 text-white" />
                  )}
                </div>
                <Card className={`${
                  message.isUser
                    ? 'bg-blue-500 text-white'
                    : 'bg-white'
                }`}>
                  <CardContent className="p-3">
                    {message.typing ? (
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-xs text-gray-500">분석 중...</span>
                      </div>
                    ) : (
                      <>
                        {message.type && !message.isUser && (
                          <Badge 
                            variant="secondary" 
                            className="mb-2 text-xs"
                          >
                            {message.type === 'product-generation' ? '제품 생성' : 
                             message.type === 'tips' ? '운영 팁' : '일반'}
                          </Badge>
                        )}
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className={`text-xs mt-2 ${
                          message.isUser ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="flex-shrink-0 p-4 border-t bg-gray-50">
        {/* Image Preview */}
        {imagePreview && (
          <div className="mb-3 p-3 bg-white rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">첨부된 이미지:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedImage(null)
                  setImagePreview(null)
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
              >
                제거
              </Button>
            </div>
            <img 
              src={imagePreview} 
              alt="업로드된 이미지" 
              className="max-w-32 max-h-32 object-cover rounded"
            />
          </div>
        )}

        <div className="space-y-3">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="제품 생성 요청, 운영 질문, 개선 아이디어 등을 입력하세요..."
            disabled={isLoading}
            className="min-h-[60px] resize-none"
            rows={2}
          />
          
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              title="이미지 업로드"
            >
              <FileImage className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={handleSendMessage}
              disabled={(!inputValue.trim() && !selectedImage) || isLoading}
              className="flex-1 bg-amber-500 hover:bg-amber-600"
            >
              <Send className="h-4 w-4 mr-2" />
              {isLoading ? '처리 중...' : '전송'}
            </Button>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-2 text-center">
          AI가 생성한 정보입니다. 실제 적용 전 검토가 필요합니다.
        </p>
      </div>
    </div>
  )
}