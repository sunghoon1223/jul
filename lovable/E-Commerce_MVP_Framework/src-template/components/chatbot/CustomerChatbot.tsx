import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, Send, Bot, User, X, Minimize2, Maximize2, RefreshCw } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
  typing?: boolean
}

interface CustomerChatbotProps {
  isOpen: boolean
  onClose: () => void
  currentProduct?: {
    name: string
    category: string
    description: string
    price: number
  }
}

// 환경변수 접근 방식 개선 (빌드 시 확실한 포함 보장)
const getGeminiApiKey = () => {
  // 1. Vite 환경변수 (개발/빌드 시)
  if (import.meta.env.VITE_GEMINI_API_KEY) {
    console.log('🔑 Vite 환경변수에서 API 키 로드됨');
    return import.meta.env.VITE_GEMINI_API_KEY;
  }
  
  // 2. 하드코딩된 키 (임시 - 프로덕션에서는 환경변수 사용 권장)
  const hardcodedKey = 'AIzaSyD8AQziB3NYBRGP62PLrrZv4UFYhNv72OM';
  if (hardcodedKey) {
    console.log('🔑 하드코딩된 API 키 사용 (프로덕션용)');
    return hardcodedKey;
  }
  
  // 3. 기본값 (연동 필요 알림)
  console.warn('⚠️ Gemini API 키가 설정되지 않았습니다. 환경변수를 확인해주세요.');
  return null;
};

const GEMINI_API_KEY = getGeminiApiKey();

export function CustomerChatbot({ isOpen, onClose, currentProduct }: CustomerChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '안녕하세요! JPCaster AI 고객지원입니다. 캐스터 제품에 대한 문의나 기술 상담을 도와드리겠습니다. 어떤 도움이 필요하신가요?',
      isUser: false,
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 새 메시지가 추가될 때 스크롤을 맨 아래로
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  // 챗봇이 열릴 때 인풋에 포커스
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, isMinimized])

  const generateSystemPrompt = () => {
    let systemPrompt = `
당신은 JPCaster의 전문 AI 고객지원 담당자입니다. 다음 역할을 수행해주세요:

1. 캐스터 제품에 대한 전문적인 기술 상담
2. 제품 추천 및 선택 가이드
3. 설치 및 유지보수 안내
4. 가격 및 주문 문의 처리
5. 친근하고 전문적인 톤으로 응답

회사 정보:
- JPCaster는 산업용 캐스터 전문 제조업체입니다
- 주요 제품: AGV 캐스터, 산업용 캐스터, 폴리우레탄 휠, 러버 휠, 구동 모듈
- 특징: 고품질, 내구성, 정밀 제어, 안전성

응답 가이드라인:
- 간결하고 명확하게 답변
- 기술적 질문에는 전문적으로, 일반 질문에는 친근하게
- 필요시 관련 제품 추천
- 복잡한 문의는 전문 상담사 연결 안내
- 한국어로 응답

`

    if (currentProduct) {
      systemPrompt += `
현재 고객이 보고 있는 제품:
- 제품명: ${currentProduct.name}
- 카테고리: ${currentProduct.category}
- 설명: ${currentProduct.description}
- 가격: ${currentProduct.price.toLocaleString()}원

이 제품과 관련된 질문이 들어오면 해당 제품을 중심으로 답변해주세요.
`
    }

    return systemPrompt
  }

  const callGeminiAPI = async (userMessage: string): Promise<string> => {
    // API 키 유효성 검사
    if (!GEMINI_API_KEY) {
      console.error('❌ Gemini API 키가 없습니다.');
      return '죄송합니다. AI 챗봇 서비스 설정에 문제가 있습니다. 관리자에게 문의해주세요. (API 키 미설정)';
    }
    
    console.log('🤖 Gemini API 호출 시작... 키:', GEMINI_API_KEY.substring(0, 10) + '...');
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: generateSystemPrompt() + '\n\n사용자 질문: ' + userMessage
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
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
      return '죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요. 급한 문의사항은 고객센터(1588-1234)로 연락해주세요.'
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage = inputValue.trim()
    setInputValue('')
    setIsLoading(true)

    // 사용자 메시지 추가
    const userMessageObj: Message = {
      id: Date.now().toString(),
      content: userMessage,
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
      // Gemini AI 호출
      const aiResponse = await callGeminiAPI(userMessage)
      
      // 타이핑 인디케이터 제거 및 AI 응답 추가
      setMessages(prev => prev.filter(msg => msg.id !== 'typing').concat({
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date()
      }))
      
      // AI 응답 후 입력창에 포커스
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }, 100)
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => prev.filter(msg => msg.id !== 'typing').concat({
        id: (Date.now() + 1).toString(),
        content: '죄송합니다. 메시지 전송 중 오류가 발생했습니다. 다시 시도해주세요.',
        isUser: false,
        timestamp: new Date()
      }))
      
      // 오류 후에도 입력창에 포커스
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }, 100)
      
      toast({
        title: '메시지 전송 실패',
        description: '일시적인 오류가 발생했습니다. 다시 시도해주세요.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
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
        content: '안녕하세요! JPCaster AI 고객지원입니다. 캐스터 제품에 대한 문의나 기술 상담을 도와드리겠습니다. 어떤 도움이 필요하신가요?',
        isUser: false,
        timestamp: new Date()
      }
    ])
    toast({
      title: '대화 내역 삭제',
      description: '새로운 대화를 시작합니다.'
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          onClick={() => setIsMinimized(false)}
          className="h-14 w-14 rounded-full bg-amber-500 hover:bg-amber-600 shadow-lg"
          size="icon"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-6 w-6 p-0 flex items-center justify-center text-xs"
        >
          {messages.filter(m => !m.isUser).length}
        </Badge>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md h-[600px] p-0 flex flex-col [&>button]:hidden">
        <DialogHeader className="flex-shrink-0 px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-amber-500 rounded-full flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <DialogTitle className="text-base">JPCaster AI 지원</DialogTitle>
                <p className="text-xs text-muted-foreground">온라인 상태</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleClearChat}
                title="대화 내역 삭제"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsMinimized(true)}
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {currentProduct && (
          <div className="flex-shrink-0 px-4 py-2 bg-amber-50 border-b">
            <div className="text-xs text-amber-700">
              <span className="font-medium">현재 제품:</span> {currentProduct.name}
            </div>
          </div>
        )}

        <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
          <div className="space-y-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 max-w-[80%] ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.isUser 
                      ? 'bg-blue-500' 
                      : 'bg-amber-500'
                  }`}>
                    {message.isUser ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div className={`rounded-lg px-3 py-2 ${
                    message.isUser
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    {message.typing ? (
                      <div className="flex items-center gap-1">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-xs text-gray-500 ml-2">입력 중...</span>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.isUser ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex-shrink-0 p-4 border-t">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              size="icon"
              className="bg-amber-500 hover:bg-amber-600"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            AI가 생성한 응답입니다. 정확한 정보는 고객센터로 문의해주세요.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}