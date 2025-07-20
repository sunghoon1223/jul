import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, MessageCircle, Mail, Phone } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface InquiryModalProps {
  isOpen: boolean
  onClose: () => void
  productName?: string
  productId?: string
}

interface InquiryFormData {
  name: string
  email: string
  phone: string
  company: string
  inquiryType: string
  subject: string
  message: string
}

const inquiryTypes = [
  { value: 'general', label: '일반 문의' },
  { value: 'technical', label: '기술 문의' },
  { value: 'price', label: '가격 문의' },
  { value: 'stock', label: '재고 문의' },
  { value: 'custom', label: '맞춤 제작 문의' },
  { value: 'partnership', label: '파트너십 문의' }
]

export function InquiryModal({ isOpen, onClose, productName, productId }: InquiryModalProps) {
  const [formData, setFormData] = useState<InquiryFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    inquiryType: 'general',
    subject: productName ? `${productName} 관련 문의` : '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요.'
    }

    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 주소를 입력해주세요.'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = '연락처를 입력해주세요.'
    }

    if (!formData.subject.trim()) {
      newErrors.subject = '문의 제목을 입력해주세요.'
    }

    if (!formData.message.trim()) {
      newErrors.message = '문의 내용을 입력해주세요.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      // In a real app, you would send this data to your backend
      const inquiryData = {
        ...formData,
        productId,
        productName,
        submittedAt: new Date().toISOString()
      }

      console.log('Inquiry submitted:', inquiryData)

      // Save to localStorage for demo purposes
      const existingInquiries = JSON.parse(localStorage.getItem('product_inquiries') || '[]')
      const newInquiry = {
        id: Date.now().toString(),
        ...inquiryData
      }
      existingInquiries.push(newInquiry)
      localStorage.setItem('product_inquiries', JSON.stringify(existingInquiries))

      toast({
        title: '문의가 접수되었습니다',
        description: '빠른 시일 내에 답변 드리겠습니다.'
      })

      handleClose()
    } catch (error) {
      toast({
        title: '문의 접수 실패',
        description: '문의 접수 중 오류가 발생했습니다. 다시 시도해주세요.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      inquiryType: 'general',
      subject: productName ? `${productName} 관련 문의` : '',
      message: ''
    })
    setErrors({})
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-amber-600" />
            제품 문의하기
          </DialogTitle>
          {productName && (
            <p className="text-sm text-muted-foreground">
              문의 제품: <span className="font-medium">{productName}</span>
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">이름 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="성함을 입력하세요"
                disabled={loading}
              />
              {errors.name && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.name}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">회사명</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                placeholder="회사명 (선택사항)"
                disabled={loading}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일 *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="이메일을 입력하세요"
                disabled={loading}
              />
              {errors.email && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.email}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">연락처 *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="연락처를 입력하세요"
                disabled={loading}
              />
              {errors.phone && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.phone}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Inquiry Type */}
          <div className="space-y-2">
            <Label htmlFor="inquiryType">문의 유형</Label>
            <Select
              value={formData.inquiryType}
              onValueChange={(value) => setFormData(prev => ({ ...prev, inquiryType: value }))}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="문의 유형 선택" />
              </SelectTrigger>
              <SelectContent>
                {inquiryTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">문의 제목 *</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="문의 제목을 입력하세요"
              disabled={loading}
            />
            {errors.subject && (
              <Alert variant="destructive">
                <AlertDescription>{errors.subject}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">문의 내용 *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="상세한 문의 내용을 입력해주세요..."
              rows={6}
              disabled={loading}
            />
            {errors.message && (
              <Alert variant="destructive">
                <AlertDescription>{errors.message}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Contact Information */}
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h4 className="font-medium text-amber-800 mb-2">직접 연락하기</h4>
            <div className="space-y-1 text-sm text-amber-700">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>전화: 1588-1234</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>이메일: support@jpcaster.com</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  문의 접수 중...
                </>
              ) : (
                '문의 접수'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}