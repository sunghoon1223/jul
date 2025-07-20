import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Upload, X } from 'lucide-react'
import { Notice, NoticeFormData } from '@/hooks/useNoticeManagement'

interface NoticeEditorProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: NoticeFormData) => Promise<boolean>
  notice?: Notice | null
  loading?: boolean
}

const categories = [
  { value: '제품', label: '제품' },
  { value: '공지', label: '공지' },
  { value: '사업', label: '사업' },
  { value: '시스템', label: '시스템' },
  { value: '인증', label: '인증' },
  { value: '기술', label: '기술' },
  { value: '행사', label: '행사' }
]

export function NoticeEditor({ isOpen, onClose, onSave, notice, loading = false }: NoticeEditorProps) {
  const [formData, setFormData] = useState<NoticeFormData>({
    title: '',
    content: '',
    category: '공지',
    isPinned: false,
    thumbnail: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize form data when notice changes
  useEffect(() => {
    if (notice) {
      setFormData({
        title: notice.title,
        content: notice.content,
        category: notice.category,
        isPinned: notice.isPinned,
        thumbnail: notice.thumbnail || ''
      })
    } else {
      setFormData({
        title: '',
        content: '',
        category: '공지',
        isPinned: false,
        thumbnail: ''
      })
    }
    setErrors({})
  }, [notice, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요.'
    }

    if (!formData.content.trim()) {
      newErrors.content = '내용을 입력해주세요.'
    }

    if (!formData.category) {
      newErrors.category = '카테고리를 선택해주세요.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const success = await onSave(formData)
    if (success) {
      onClose()
    }
  }

  const handleClose = () => {
    setFormData({
      title: '',
      content: '',
      category: '공지',
      isPinned: false,
      thumbnail: ''
    })
    setErrors({})
    onClose()
  }

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // In a real app, you would upload the file to a server
      // For now, we'll use a placeholder URL
      const imageUrl = URL.createObjectURL(file)
      setFormData(prev => ({ ...prev, thumbnail: imageUrl }))
    }
  }

  const removeThumbnail = () => {
    setFormData(prev => ({ ...prev, thumbnail: '' }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {notice ? '공지사항 수정' : '새 공지사항 작성'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">제목 *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="공지사항 제목을 입력하세요"
              disabled={loading}
            />
            {errors.title && (
              <Alert variant="destructive">
                <AlertDescription>{errors.title}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Category and Pin Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">카테고리 *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.category}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="isPinned">중요 공지</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPinned"
                  checked={formData.isPinned}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPinned: checked }))}
                  disabled={loading}
                />
                <Label htmlFor="isPinned" className="text-sm text-muted-foreground">
                  상단에 고정 표시
                </Label>
              </div>
            </div>
          </div>

          {/* Thumbnail */}
          <div className="space-y-2">
            <Label htmlFor="thumbnail">썸네일 이미지</Label>
            <div className="space-y-3">
              {formData.thumbnail ? (
                <div className="relative inline-block">
                  <img
                    src={formData.thumbnail}
                    alt="썸네일 미리보기"
                    className="w-32 h-24 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={removeThumbnail}
                    disabled={loading}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    썸네일 이미지를 업로드하세요
                  </p>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    disabled={loading}
                    className="max-w-xs mx-auto"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">내용 *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="공지사항 내용을 입력하세요..."
              rows={10}
              disabled={loading}
            />
            {errors.content && (
              <Alert variant="destructive">
                <AlertDescription>{errors.content}</AlertDescription>
              </Alert>
            )}
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
                  저장 중...
                </>
              ) : (
                notice ? '수정' : '작성'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}