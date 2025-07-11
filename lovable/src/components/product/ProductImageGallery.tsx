import { useState } from 'react'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious,
  type CarouselApi
} from '@/components/ui/carousel'
import { cn } from '@/lib/utils'
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

  // Combine all images
  const allImages = [
    ...(mainImage ? [mainImage] : []),
    ...(additionalImages || [])
  ].filter(Boolean)

  // Fallback if no images
  if (allImages.length === 0) {
    return (
      <div className="space-y-4">
        <AspectRatio ratio={1} className="bg-muted rounded-lg flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="text-4xl mb-2">📦</div>
            <p>No image available</p>
          </div>
        </AspectRatio>
      </div>
    )
  }

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
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {allImages.map((image, index) => (
            <CarouselItem key={index}>
              <AspectRatio ratio={1} className="bg-muted rounded-lg overflow-hidden">
                {isLoading && currentIndex === index && (
                  <Skeleton className="w-full h-full" />
                )}
                {hasError && currentIndex === index ? (
                  <div className="flex items-center justify-center w-full h-full bg-muted text-muted-foreground">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🚫</div>
                      <p>Failed to load image</p>
                    </div>
                  </div>
                ) : (
                  <img
                    src={image}
                    alt={`${productName} - Image ${index + 1}`}
                    className={cn(
                      "w-full h-full object-cover transition-opacity duration-200",
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
        
        {allImages.length > 1 && (
          <>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </>
        )}
      </Carousel>

      {/* Thumbnail Navigation */}
      {allImages.length > 1 && (
        <div className="flex gap-2 justify-center overflow-x-auto pb-2">
          {allImages.map((image, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className={cn(
                "p-1 h-16 w-16 rounded-md overflow-hidden",
                currentIndex === index && "ring-2 ring-primary"
              )}
              onClick={() => handleThumbnailClick(index)}
            >
              <AspectRatio ratio={1} className="w-full h-full">
                <img
                  src={image}
                  alt={`${productName} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </AspectRatio>
            </Button>
          ))}
        </div>
      )}

      {/* Image Counter */}
      {allImages.length > 1 && (
        <div className="text-center text-sm text-muted-foreground">
          {currentIndex + 1} / {allImages.length}
        </div>
      )}
    </div>
  )
}