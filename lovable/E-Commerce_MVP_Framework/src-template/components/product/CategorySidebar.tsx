import { Link, useParams } from 'react-router-dom'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCategories } from '@/hooks/useCategories'
import { cn } from '@/lib/utils'

export function CategorySidebar() {
  const { categorySlug } = useParams()
  const { data: categories, isLoading } = useCategories()

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">카테고리</h3>
      <ScrollArea className="h-[600px]">
        <div className="space-y-1">
          <Button
            asChild
            variant={!categorySlug ? "default" : "ghost"}
            className={cn(
              "w-full justify-start",
              !categorySlug && "bg-primary text-primary-foreground"
            )}
          >
            <Link to="/products">
              모든 제품
            </Link>
          </Button>
          
          {categories?.map((category) => (
            <Button
              key={category.id}
              asChild
              variant={categorySlug === category.slug ? "default" : "ghost"}
              className={cn(
                "w-full justify-start",
                categorySlug === category.slug && "bg-primary text-primary-foreground"
              )}
            >
              <Link to={`/categories/${category.slug}`}>
                {category.name}
              </Link>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}