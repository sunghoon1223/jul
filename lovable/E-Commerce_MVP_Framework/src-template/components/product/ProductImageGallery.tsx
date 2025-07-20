import { useState, useEffect } from 'react'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Button } from '@/components/ui/button'
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious,
  type CarouselApi
} from '@/components/ui/carousel'
import { cn } from '@/lib/utils'
import { createSupabaseImageUrl } from '@/lib/supabase-storage'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ProductImageGalleryProps {
  mainImage: string | null
  additionalImages: string[] | null
  productName: string
}

export function ProductImageGallery({ 
  mainImage, 
  additionalImages, 
  productName 
}: ProductImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [api, setApi] = useState<CarouselApi>()

  // 모든 이미지 수집 (Supabase Storage URL로 변환)
  const allImages = [
    ...(mainImage ? [createSupabaseImageUrl(mainImage)] : []),
    ...(additionalImages || []).map(url => createSupabaseImageUrl(url))
  ].filter(Boolean)

  // 플레이스홀더가 없으면 추가
  if (allImages.length === 0) {
    allImages.push('/images/placeholder.svg')
  }

  // 캐러셀 상태 업데이트
  useEffect(() => {
    if (!api) return

    const onSelect = () => {
      setCurrentIndex(api.selectedScrollSnap())
    }

    api.on('select', onSelect)
    onSelect()

    return () => api.off('select', onSelect)
  }, [api])

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index)
    api?.scrollTo(index)
  }

  const handleImageLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  const handleImageError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  return (
    <div className="space-y-4">
      {/* Main Image Carousel */}
      <div className="relative">
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            {allImages.map((image, index) => (
              <CarouselItem key={index}>
                <AspectRatio ratio={1} className="bg-muted rounded-lg overflow-hidden border">
                  {isLoading && currentIndex === index && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                      <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    </div>
                  )}
                  {hasError && currentIndex === index ? (
                    <div className="flex items-center justify-center w-full h-full bg-muted text-muted-foreground">
                      <div className="text-center">
                        <div className="text-4xl mb-2">🖼️</div>
                        <p className="text-sm">이미지를 불러올 수 없습니다</p>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={image}
                      alt={`${productName} - Image ${index + 1}`}
                      className={cn(
                        "w-full h-full object-cover transition-all duration-300 hover:scale-105",
                        isLoading && currentIndex === index ? "opacity-0" : "opacity-100"
                      )}
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                    />
                  )}
                </AspectRatio>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {/* Custom Navigation Buttons */}
          {allImages.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md z-10"
                onClick={() => api?.scrollPrev()}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md z-10"
                onClick={() => api?.scrollNext()}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}
        </Carousel>
        
        {/* Image Counter */}
        {allImages.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
            {currentIndex + 1} / {allImages.length}
          </div>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {allImages.length > 1 && (
        <div className="flex gap-2 justify-center overflow-x-auto pb-2">
          {allImages.map((image, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className={cn(
                "p-1 h-16 w-16 rounded-md overflow-hidden border-2 transition-all duration-200",
                currentIndex === index 
                  ? "ring-2 ring-primary border-primary" 
                  : "border-gray-200 hover:border-gray-300"
              )}
              onClick={() => handleThumbnailClick(index)}
            >
              <AspectRatio ratio={1} className="w-full h-full">
                <img
                  src={image}
                  alt={`${productName} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover transition-opacity duration-200 hover:opacity-80"
                />
              </AspectRatio>
            </Button>
          ))}
        </div>
      )}

      {/* Progress Dots */}
      {allImages.length > 1 && (
        <div className="flex justify-center gap-2 mt-2">
          {allImages.map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200",
                currentIndex === index 
                  ? "bg-primary scale-125" 
                  : "bg-gray-300 hover:bg-gray-400"
              )}
              onClick={() => handleThumbnailClick(index)}
            />
          ))}
        </div>
      )}
    </div>
  )
}