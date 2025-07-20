import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/hooks/useCart'
import { ShoppingCart, Minus, Plus, X } from 'lucide-react'
import { CartItem } from './CartItem'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface CartDrawerProps {
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CartDrawer({ children, open: controlledOpen, onOpenChange }: CartDrawerProps) {
  const { items, itemsCount, totalAmount, loading } = useCart()
  const [internalOpen, setInternalOpen] = useState(false)
  const navigate = useNavigate()
  
  // Debug logging for cart state (only log when cart has items)
  useEffect(() => {
    if (itemsCount > 0 && !loading) {
      console.log('🛒 CartDrawer: cart has', itemsCount, 'items, total:', totalAmount)
    }
  }, [itemsCount, totalAmount, loading])
  
  // Use controlled open state if provided, otherwise use internal state
  // Ensure we always have a boolean value to prevent undefined state issues
  const open = controlledOpen !== undefined ? Boolean(controlledOpen) : internalOpen
  const setOpen = onOpenChange || setInternalOpen
  
  // Debug logging for modal state
  useEffect(() => {
    console.log('🚪 CartDrawer state:', { 
      controlledOpen, 
      internalOpen, 
      open, 
      hasOnOpenChange: !!onOpenChange 
    })
  }, [controlledOpen, internalOpen, open, onOpenChange])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      
      <SheetContent className="flex flex-col w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            장바구니 ({itemsCount}개)
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-auto py-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">로딩 중...</div>
            </div>
          ) : !items.length ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">장바구니가 비어있습니다</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {items.length ? (
          <div className="border-t pt-4 space-y-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>총 금액</span>
              <span>₩{totalAmount.toLocaleString()}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                계속 쇼핑
              </Button>
              <Button onClick={() => {
                setOpen(false)
                navigate('/checkout')
              }}>
                주문하기
              </Button>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}