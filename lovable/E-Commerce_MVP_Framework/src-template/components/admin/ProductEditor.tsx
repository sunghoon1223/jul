import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Upload, X, Plus, Minus, FileImage } from 'lucide-react'
import { Product, ProductFormData } from '@/hooks/useProductManagement'
import { apiClient } from '@/lib/apiClient'
import { toast } from '@/hooks/use-toast'

interface ProductEditorProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: ProductFormData) => Promise<boolean>
  product?: Product | null
  loading?: boolean
}

const categories = [
  { value: 'cat_agv', label: 'AGV 캐스터' },
  { value: 'cat_industrial', label: '산업용 캐스터' },
  { value: 'cat_heavy_duty', label: '헤비듀티 캐스터' },
  { value: 'cat_light_medium', label: '라이트/미디엄 캐스터' },
  { value: 'cat_specialty', label: '특수 캐스터' },
  { value: 'cat_polyurethane', label: '폴리우레탄 휠' },
  { value: 'cat_rubber', label: '러버 휠' },
  { value: 'cat_mecanum', label: '메카넘 휠' }
]

export function ProductEditor({ isOpen, onClose, onSave, product, loading = false }: ProductEditorProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    sku: '',
    stock_quantity: 0,
    manufacturer: '',
    category_id: 'cat_agv',
    main_image_url: '',
    image_urls: [],
    features: {},
    is_published: true
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [newImageUrl, setNewImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mainImageInputRef = useRef<HTMLInputElement>(null)

  // Initialize form data when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        sku: product.sku,
        stock_quantity: product.stock_quantity,
        manufacturer: product.manufacturer,
        category_id: product.category_id,
        main_image_url: product.main_image_url,
        image_urls: product.image_urls,
        features: product.features,
        is_published: product.is_published
      })
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        sku: '',
        stock_quantity: 0,
        manufacturer: '',
        category_id: 'cat_agv',
        main_image_url: '',
        image_urls: [],
        features: {},
        is_published: true
      })
    }
    setErrors({})
    setNewImageUrl('')
  }, [product, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = '제품명을 입력해주세요.'
    }

    if (!formData.description.trim()) {
      newErrors.description = '제품 설명을 입력해주세요.'
    }

    if (formData.price <= 0) {
      newErrors.price = '올바른 가격을 입력해주세요.'
    }

    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU를 입력해주세요.'
    }

    if (formData.stock_quantity < 0) {
      newErrors.stock_quantity = '재고 수량은 0 이상이어야 합니다.'
    }

    if (!formData.manufacturer.trim()) {
      newErrors.manufacturer = '제조사를 입력해주세요.'
    }

    if (!formData.category_id) {
      newErrors.category_id = '카테고리를 선택해주세요.'
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
      name: '',
      description: '',
      price: 0,
      sku: '',
      stock_quantity: 0,
      manufacturer: '',
      category_id: 'cat_agv',
      main_image_url: '',
      image_urls: [],
      features: {},
      is_published: true
    })
    setErrors({})
    setNewImageUrl('')
    onClose()
  }

  const addImageUrl = () => {
    if (newImageUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        image_urls: [...prev.image_urls, newImageUrl.trim()]
      }))
      setNewImageUrl('')
    }
  }

  const removeImageUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, i) => i !== index)
    }))
  }

  const setMainImage = (url: string) => {
    setFormData(prev => ({ ...prev, main_image_url: url }))
  }

  // 메인 이미지 파일 업로드
  const handleMainImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) { // 5MB 제한
      toast({
        title: '파일 크기 초과',
        description: '이미지 파일은 5MB 이하여야 합니다.',
        variant: 'destructive'
      })
      return
    }

    setUploading(true)
    try {
      const uploadResult = await apiClient.uploadImage(file)
      setFormData(prev => ({ ...prev, main_image_url: uploadResult.url }))
      toast({
        title: '이미지 업로드 성공',
        description: '메인 이미지가 성공적으로 업로드되었습니다.'
      })
    } catch (error) {
      console.error('Image upload failed:', error)
      toast({
        title: '업로드 실패',
        description: error instanceof Error ? error.message : '이미지 업로드에 실패했습니다.',
        variant: 'destructive'
      })
    } finally {
      setUploading(false)
    }
  }

  // 추가 이미지 파일 업로드
  const handleAdditionalImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) { // 5MB 제한
      toast({
        title: '파일 크기 초과',
        description: '이미지 파일은 5MB 이하여야 합니다.',
        variant: 'destructive'
      })
      return
    }

    setUploading(true)
    try {
      const uploadResult = await apiClient.uploadImage(file)
      setFormData(prev => ({
        ...prev,
        image_urls: [...prev.image_urls, uploadResult.url]
      }))
      toast({
        title: '이미지 업로드 성공',
        description: '추가 이미지가 성공적으로 업로드되었습니다.'
      })
      
      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Image upload failed:', error)
      toast({
        title: '업로드 실패',
        description: error instanceof Error ? error.message : '이미지 업로드에 실패했습니다.',
        variant: 'destructive'
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? '제품 수정' : '새 제품 추가'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">제품명 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="제품명을 입력하세요"
                disabled={loading}
              />
              {errors.name && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.name}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                placeholder="SKU를 입력하세요"
                disabled={loading}
              />
              {errors.sku && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.sku}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">제품 설명 *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="제품 설명을 입력하세요..."
              rows={4}
              disabled={loading}
            />
            {errors.description && (
              <Alert variant="destructive">
                <AlertDescription>{errors.description}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Price, Stock, Category */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">가격 *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                placeholder="가격"
                disabled={loading}
              />
              {errors.price && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.price}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock_quantity">재고 수량 *</Label>
              <Input
                id="stock_quantity"
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: Number(e.target.value) }))}
                placeholder="재고 수량"
                disabled={loading}
              />
              {errors.stock_quantity && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.stock_quantity}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category_id">카테고리 *</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
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
              {errors.category_id && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.category_id}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Manufacturer */}
          <div className="space-y-2">
            <Label htmlFor="manufacturer">제조사 *</Label>
            <Input
              id="manufacturer"
              value={formData.manufacturer}
              onChange={(e) => setFormData(prev => ({ ...prev, manufacturer: e.target.value }))}
              placeholder="제조사를 입력하세요"
              disabled={loading}
            />
            {errors.manufacturer && (
              <Alert variant="destructive">
                <AlertDescription>{errors.manufacturer}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Main Image */}
          <div className="space-y-2">
            <Label htmlFor="main_image_url">메인 이미지</Label>
            <div className="flex gap-2">
              <Input
                id="main_image_url"
                value={formData.main_image_url}
                onChange={(e) => setFormData(prev => ({ ...prev, main_image_url: e.target.value }))}
                placeholder="메인 이미지 URL을 입력하거나 파일을 업로드하세요"
                disabled={loading || uploading}
                className="flex-1"
              />
              <input
                type="file"
                ref={mainImageInputRef}
                onChange={handleMainImageUpload}
                accept="image/*"
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => mainImageInputRef.current?.click()}
                disabled={loading || uploading}
                className="px-3"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
              </Button>
            </div>
            {formData.main_image_url && (
              <div className="mt-2">
                <img
                  src={formData.main_image_url}
                  alt="메인 이미지 미리보기"
                  className="w-32 h-24 object-cover rounded border"
                />
              </div>
            )}
          </div>

          {/* Additional Images */}
          <div className="space-y-2">
            <Label>추가 이미지</Label>
            <div className="flex gap-2">
              <Input
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="이미지 URL을 입력하거나 파일을 업로드하세요"
                disabled={loading || uploading}
                className="flex-1"
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAdditionalImageUpload}
                accept="image/*"
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading || uploading}
                className="px-3"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileImage className="w-4 h-4" />
                )}
              </Button>
              <Button
                type="button"
                onClick={addImageUrl}
                disabled={loading || uploading || !newImageUrl.trim()}
                size="sm"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {formData.image_urls.length > 0 && (
              <div className="space-y-2">
                {formData.image_urls.map((url, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded">
                    <img
                      src={url}
                      alt={`이미지 ${index + 1}`}
                      className="w-16 h-12 object-cover rounded"
                    />
                    <span className="flex-1 text-sm truncate">{url}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setMainImage(url)}
                      disabled={loading}
                    >
                      메인으로
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeImageUrl(index)}
                      disabled={loading}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Publication Status */}
          <div className="space-y-2">
            <Label htmlFor="is_published">발행 상태</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_published"
                checked={formData.is_published}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
                disabled={loading}
              />
              <Label htmlFor="is_published" className="text-sm text-muted-foreground">
                {formData.is_published ? '발행됨' : '초안'}
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading || uploading}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={loading || uploading}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {loading || uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {uploading ? '업로드 중...' : '저장 중...'}
                </>
              ) : (
                product ? '수정' : '생성'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}