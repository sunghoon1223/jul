import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Upload, FileImage, Wand2, CheckCircle, AlertCircle } from 'lucide-react'
import { apiClient } from '@/lib/apiClient'
import { toast } from '@/hooks/use-toast'

interface AIProductGeneratorProps {
  isOpen: boolean
  onClose: () => void
  onProductCreated: () => void
}

interface GenerationStep {
  id: string
  title: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  description: string
  result?: any
}

interface MinimalProductInfo {
  productName: string
  basicDescription: string
  targetPrice?: number
  mainImage?: File
  additionalImages?: File[]
  productType: 'standard' | 'custom' | 'agv' | 'industrial'
  keyFeatures: string[]
}

const productTypes = [
  { value: 'agv', label: 'AGV 캐스터', category: 'cat_agv' },
  { value: 'industrial', label: '산업용 캐스터', category: 'cat_industrial' },
  { value: 'heavy_duty', label: '헤비듀티 캐스터', category: 'cat_heavy_duty' },
  { value: 'standard', label: '일반 캐스터', category: 'cat_light_medium' },
  { value: 'custom', label: '특수 캐스터', category: 'cat_specialty' }
]

export function AIProductGenerator({ isOpen, onClose, onProductCreated }: AIProductGeneratorProps) {
  const [step, setStep] = useState<'input' | 'generating' | 'review' | 'completed'>('input')
  const [minimalInfo, setMinimalInfo] = useState<MinimalProductInfo>({
    productName: '',
    basicDescription: '',
    productType: 'standard',
    keyFeatures: ['']
  })
  
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([])
  const [generatedProduct, setGeneratedProduct] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  
  const mainImageRef = useRef<HTMLInputElement>(null)
  const additionalImagesRef = useRef<HTMLInputElement>(null)

  const resetForm = () => {
    setStep('input')
    setMinimalInfo({
      productName: '',
      basicDescription: '',
      productType: 'standard',
      keyFeatures: ['']
    })
    setGenerationSteps([])
    setGeneratedProduct(null)
    setIsGenerating(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const addKeyFeature = () => {
    setMinimalInfo(prev => ({
      ...prev,
      keyFeatures: [...prev.keyFeatures, '']
    }))
  }

  const removeKeyFeature = (index: number) => {
    setMinimalInfo(prev => ({
      ...prev,
      keyFeatures: prev.keyFeatures.filter((_, i) => i !== index)
    }))
  }

  const updateKeyFeature = (index: number, value: string) => {
    setMinimalInfo(prev => ({
      ...prev,
      keyFeatures: prev.keyFeatures.map((feature, i) => i === index ? value : feature)
    }))
  }

  const handleMainImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: '파일 크기 초과',
          description: '이미지 파일은 5MB 이하여야 합니다.',
          variant: 'destructive'
        })
        return
      }
      setMinimalInfo(prev => ({ ...prev, mainImage: file }))
    }
  }

  const handleAdditionalImagesUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length > 0) {
      const validFiles = files.filter(file => {
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: '파일 크기 초과',
            description: `${file.name}은 5MB를 초과합니다.`,
            variant: 'destructive'
          })
          return false
        }
        return true
      })
      setMinimalInfo(prev => ({ ...prev, additionalImages: validFiles }))
    }
  }

  const generateAIPrompt = (): string => {
    const selectedType = productTypes.find(type => type.value === minimalInfo.productType)
    
    return `
당신은 JP CASTER의 전문 제품 기획자입니다. 다음 최소 정보를 바탕으로 완전한 제품 상세 정보를 생성해주세요:

**입력 정보:**
- 제품명: ${minimalInfo.productName}
- 기본 설명: ${minimalInfo.basicDescription}
- 제품 타입: ${selectedType?.label}
- 주요 특징: ${minimalInfo.keyFeatures.filter(f => f.trim()).join(', ')}
- 목표 가격대: ${minimalInfo.targetPrice ? `₩${minimalInfo.targetPrice.toLocaleString()}` : '미정'}

**생성해야 할 내용:**
1. **완전한 제품 설명** (300-500자, 기술적 상세 포함)
2. **SKU 코드** (JP-YYYYMMDD-XXX 형식)
3. **정확한 가격** (시장 조사 기반)
4. **재고 수량** (적정 초기 재고)
5. **제조사 정보** (JP Caster 또는 파트너사)
6. **상세 특징** (JSON 객체 형태, 최소 5개 항목)
7. **적용 분야** (어떤 산업/용도에 사용되는지)
8. **기술 사양** (크기, 하중, 재질 등)

**JSON 응답 형식:**
\`\`\`json
{
  "name": "완전한 제품명",
  "description": "상세한 제품 설명",
  "sku": "SKU 코드",
  "price": 숫자,
  "stock_quantity": 숫자,
  "manufacturer": "제조사명",
  "features": {
    "하중_용량": "값",
    "휠_재질": "값",
    "베어링_타입": "값",
    "적용_분야": "값",
    "특수_기능": "값"
  },
  "suggested_categories": ["추천 카테고리 ID"],
  "seo_keywords": ["SEO 키워드들"],
  "marketing_points": ["마케팅 포인트들"]
}
\`\`\`

전문적이고 정확한 정보를 제공해주세요.
`
  }

  const updateGenerationStep = (stepId: string, updates: Partial<GenerationStep>) => {
    setGenerationSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ))
  }

  const callGeminiAPI = async (prompt: string, imageData?: string): Promise<any> => {
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
    
    if (!API_KEY) {
      throw new Error('Gemini API 키가 설정되지 않았습니다.')
    }

    const parts: any[] = [{ text: prompt }]
    
    if (imageData) {
      parts.push({
        inline_data: {
          mime_type: 'image/jpeg',
          data: imageData
        }
      })
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
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
  }

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result as string
        const base64Data = base64.split(',')[1]
        resolve(base64Data)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const startGeneration = async () => {
    if (!minimalInfo.productName.trim() || !minimalInfo.basicDescription.trim()) {
      toast({
        title: '정보 부족',
        description: '제품명과 기본 설명은 필수입니다.',
        variant: 'destructive'
      })
      return
    }

    setIsGenerating(true)
    setStep('generating')

    // 생성 단계 초기화
    const steps: GenerationStep[] = [
      {
        id: 'analyze',
        title: '제품 정보 분석',
        status: 'processing',
        description: '입력된 정보를 AI가 분석하고 있습니다...'
      },
      {
        id: 'generate',
        title: '상세 정보 생성',
        status: 'pending',
        description: 'AI가 완전한 제품 정보를 생성합니다.'
      },
      {
        id: 'upload',
        title: '이미지 업로드',
        status: 'pending',
        description: '제품 이미지를 서버에 업로드합니다.'
      },
      {
        id: 'validate',
        title: '정보 검증',
        status: 'pending',
        description: '생성된 정보의 품질을 검증합니다.'
      }
    ]

    setGenerationSteps(steps)

    try {
      // 1. 이미지 분석 및 정보 생성
      updateGenerationStep('analyze', { status: 'processing' })
      
      let imageData: string | undefined
      if (minimalInfo.mainImage) {
        imageData = await convertImageToBase64(minimalInfo.mainImage)
      }

      const prompt = generateAIPrompt()
      const aiResponse = await callGeminiAPI(prompt, imageData)
      
      updateGenerationStep('analyze', { status: 'completed', result: 'AI 분석 완료' })
      updateGenerationStep('generate', { status: 'processing' })

      // JSON 파싱
      let productData: any
      try {
        const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/)
        if (jsonMatch) {
          productData = JSON.parse(jsonMatch[1])
        } else {
          // JSON 블록이 없으면 전체 텍스트에서 JSON 찾기
          productData = JSON.parse(aiResponse)
        }
      } catch (e) {
        throw new Error('AI 응답을 파싱할 수 없습니다: ' + aiResponse)
      }

      updateGenerationStep('generate', { status: 'completed', result: productData })
      updateGenerationStep('upload', { status: 'processing' })

      // 2. 이미지 업로드
      let uploadedImages: string[] = []
      if (minimalInfo.mainImage) {
        const mainImageResult = await apiClient.uploadImage(minimalInfo.mainImage)
        uploadedImages.push(mainImageResult.url)
      }

      if (minimalInfo.additionalImages && minimalInfo.additionalImages.length > 0) {
        for (const image of minimalInfo.additionalImages) {
          const imageResult = await apiClient.uploadImage(image)
          uploadedImages.push(imageResult.url)
        }
      }

      updateGenerationStep('upload', { status: 'completed', result: uploadedImages })
      updateGenerationStep('validate', { status: 'processing' })

      // 3. 최종 제품 데이터 구성
      const selectedType = productTypes.find(type => type.value === minimalInfo.productType)
      
      const finalProductData = {
        name: productData.name || minimalInfo.productName,
        description: productData.description || minimalInfo.basicDescription,
        price: productData.price || minimalInfo.targetPrice || 100000,
        sku: productData.sku || `JP-${Date.now()}`,
        stock_quantity: productData.stock_quantity || 50,
        manufacturer: productData.manufacturer || 'JP Caster',
        category_id: selectedType?.category || 'cat_agv',
        main_image_url: uploadedImages[0] || '',
        image_urls: uploadedImages.slice(1) || [],
        features: productData.features || {},
        is_published: false // 검토 후 발행
      }

      setGeneratedProduct(finalProductData)
      updateGenerationStep('validate', { status: 'completed', result: '검증 완료' })

      setStep('review')
      
      toast({
        title: 'AI 제품 생성 완료!',
        description: '생성된 제품 정보를 검토해주세요.'
      })

    } catch (error) {
      console.error('Generation error:', error)
      
      const currentStep = generationSteps.find(s => s.status === 'processing')
      if (currentStep) {
        updateGenerationStep(currentStep.id, { 
          status: 'error', 
          description: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.' 
        })
      }
      
      toast({
        title: '생성 실패',
        description: error instanceof Error ? error.message : '제품 생성 중 오류가 발생했습니다.',
        variant: 'destructive'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const confirmAndCreateProduct = async () => {
    if (!generatedProduct) return

    try {
      setIsGenerating(true)
      
      await apiClient.createProduct(generatedProduct)
      
      setStep('completed')
      onProductCreated()
      
      toast({
        title: '제품 생성 완료!',
        description: '새로운 제품이 성공적으로 생성되었습니다.'
      })

    } catch (error) {
      console.error('Product creation error:', error)
      toast({
        title: '제품 생성 실패',
        description: error instanceof Error ? error.message : '제품 생성 중 오류가 발생했습니다.',
        variant: 'destructive'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const renderStepIcon = (status: GenerationStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-amber-600" />
            AI 자동 제품 생성기
          </DialogTitle>
        </DialogHeader>

        {step === 'input' && (
          <div className="space-y-6">
            <Alert>
              <Wand2 className="h-4 w-4" />
              <AlertDescription>
                최소한의 정보만 입력하면 AI가 완전한 제품 페이지를 자동으로 생성합니다.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productName">제품명 *</Label>
                <Input
                  id="productName"
                  value={minimalInfo.productName}
                  onChange={(e) => setMinimalInfo(prev => ({ ...prev, productName: e.target.value }))}
                  placeholder="예: AGV 전용 캐스터 75mm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="productType">제품 타입 *</Label>
                <select
                  id="productType"
                  value={minimalInfo.productType}
                  onChange={(e) => setMinimalInfo(prev => ({ ...prev, productType: e.target.value as any }))}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  {productTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="basicDescription">기본 설명 *</Label>
              <Textarea
                id="basicDescription"
                value={minimalInfo.basicDescription}
                onChange={(e) => setMinimalInfo(prev => ({ ...prev, basicDescription: e.target.value }))}
                placeholder="제품의 주요 용도와 특징을 간단히 설명해주세요..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetPrice">목표 가격 (선택사항)</Label>
              <Input
                id="targetPrice"
                type="number"
                value={minimalInfo.targetPrice || ''}
                onChange={(e) => setMinimalInfo(prev => ({ ...prev, targetPrice: Number(e.target.value) || undefined }))}
                placeholder="예: 150000"
              />
            </div>

            <div className="space-y-2">
              <Label>주요 특징</Label>
              {minimalInfo.keyFeatures.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => updateKeyFeature(index, e.target.value)}
                    placeholder="예: 고하중 지지, 정밀 제어 등"
                  />
                  {minimalInfo.keyFeatures.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeKeyFeature(index)}
                    >
                      제거
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addKeyFeature}
              >
                특징 추가
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>메인 이미지 (선택사항)</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => mainImageRef.current?.click()}
                    className="flex-1"
                  >
                    <FileImage className="w-4 h-4 mr-2" />
                    {minimalInfo.mainImage ? minimalInfo.mainImage.name : '이미지 선택'}
                  </Button>
                  <input
                    type="file"
                    ref={mainImageRef}
                    onChange={handleMainImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>추가 이미지 (선택사항)</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => additionalImagesRef.current?.click()}
                    className="flex-1"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {minimalInfo.additionalImages ? `${minimalInfo.additionalImages.length}개 선택됨` : '이미지 선택'}
                  </Button>
                  <input
                    type="file"
                    ref={additionalImagesRef}
                    onChange={handleAdditionalImagesUpload}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'generating' && (
          <div className="space-y-4">
            <div className="text-center">
              <Wand2 className="w-12 h-12 text-amber-600 mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-semibold">AI가 제품을 생성하고 있습니다...</h3>
              <p className="text-muted-foreground">잠시만 기다려주세요.</p>
            </div>

            <div className="space-y-3">
              {generationSteps.map((step) => (
                <div key={step.id} className="flex items-center gap-3 p-3 border rounded">
                  {renderStepIcon(step.status)}
                  <div className="flex-1">
                    <div className="font-medium">{step.title}</div>
                    <div className="text-sm text-muted-foreground">{step.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 'review' && generatedProduct && (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                AI가 생성한 제품 정보를 검토하고 확인해주세요.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>{generatedProduct.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="font-semibold">설명</Label>
                  <p className="text-sm mt-1">{generatedProduct.description}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="font-semibold">가격</Label>
                    <p className="text-sm">₩{generatedProduct.price.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">SKU</Label>
                    <p className="text-sm">{generatedProduct.sku}</p>
                  </div>
                  <div>
                    <Label className="font-semibold">재고</Label>
                    <p className="text-sm">{generatedProduct.stock_quantity}개</p>
                  </div>
                  <div>
                    <Label className="font-semibold">제조사</Label>
                    <p className="text-sm">{generatedProduct.manufacturer}</p>
                  </div>
                </div>

                {Object.keys(generatedProduct.features).length > 0 && (
                  <div>
                    <Label className="font-semibold">주요 특징</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {Object.entries(generatedProduct.features).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="font-medium">{key}:</span> {value as string}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {generatedProduct.main_image_url && (
                  <div>
                    <Label className="font-semibold">메인 이미지</Label>
                    <img 
                      src={generatedProduct.main_image_url} 
                      alt="생성된 제품 이미지"
                      className="w-32 h-24 object-cover rounded border mt-1"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'completed' && (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">제품 생성 완료!</h3>
            <p className="text-muted-foreground">
              새로운 제품이 성공적으로 생성되었습니다.<br />
              제품 관리 탭에서 확인하실 수 있습니다.
            </p>
          </div>
        )}

        <DialogFooter>
          {step === 'input' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                취소
              </Button>
              <Button 
                onClick={startGeneration}
                disabled={!minimalInfo.productName.trim() || !minimalInfo.basicDescription.trim()}
                className="bg-amber-600 hover:bg-amber-700"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                AI 생성 시작
              </Button>
            </>
          )}

          {step === 'review' && (
            <>
              <Button variant="outline" onClick={() => setStep('input')}>
                다시 생성
              </Button>
              <Button 
                onClick={confirmAndCreateProduct}
                disabled={isGenerating}
                className="bg-green-600 hover:bg-green-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  '제품 생성 확인'
                )}
              </Button>
            </>
          )}

          {step === 'completed' && (
            <Button onClick={handleClose} className="w-full">
              완료
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}