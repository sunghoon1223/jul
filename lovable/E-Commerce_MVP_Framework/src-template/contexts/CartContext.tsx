import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { createCartService, CartItem } from '@/services/cartService'
import { useAuth } from '@/hooks/useAuth'

interface CartContextType {
  items: CartItem[]
  loading: boolean
  itemsCount: number
  totalAmount: number
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  addToCart: (productId: string, quantity?: number) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => void
  removeItem: (itemId: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [cartService] = useState(() => createCartService())
  const { user } = useAuth()

  // Derived state
  const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Load cart
  const loadCart = useCallback(async () => {
    try {
      setLoading(true)
      const cartItems = await cartService.getCart()
      setItems(cartItems)
      console.log('🛒 장바구니 로드 성공:', cartItems.length, '개 아이템')
    } catch (error) {
      console.error('❌ 장바구니 로드 실패:', error)
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [cartService])

  // Initialize cart
  useEffect(() => {
    loadCart()
  }, [loadCart])

  // Sync local cart to Supabase when user logs in
  useEffect(() => {
    if (user) {
      const syncLocalCart = async () => {
        try {
          const localCart = localStorage.getItem('shopping_cart')
          if (localCart) {
            const localItems = JSON.parse(localCart)
            if (localItems.length > 0) {
              await cartService.syncLocalCartToSupabase(localItems)
              await loadCart() // 동기화 후 다시 로드
            }
          }
        } catch (error) {
          console.error('로컬 장바구니 동기화 실패:', error)
        }
      }
      syncLocalCart()
    }
  }, [user, cartService, loadCart])

  // Add item to cart
  const addItem = useCallback((item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    console.log('🛒 CartContext.addItem 시작:', item.name, '수량:', item.quantity || 1)
    
    const addItemAsync = async () => {
      try {
        await cartService.addItem(item.product_id || item.id, item.quantity || 1)
        await loadCart() // 장바구니 새로고침
      } catch (error) {
        console.error('장바구니 추가 실패:', error)
      }
    }
    
    addItemAsync()
  }, [cartService, loadCart])

  // Remove item
  const removeItem = useCallback((itemId: string) => {
    const removeItemAsync = async () => {
      try {
        await cartService.removeItem(itemId)
        await loadCart() // 장바구니 새로고침
      } catch (error) {
        console.error('장바구니 제거 실패:', error)
      }
    }
    
    removeItemAsync()
  }, [cartService, loadCart])

  // Update quantity
  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    const updateQuantityAsync = async () => {
      try {
        await cartService.updateQuantity(itemId, quantity)
        await loadCart() // 장바구니 새로고침
      } catch (error) {
        console.error('수량 업데이트 실패:', error)
      }
    }
    
    updateQuantityAsync()
  }, [cartService, loadCart])

  // Clear cart
  const clearCart = useCallback(() => {
    const clearCartAsync = async () => {
      try {
        await cartService.clearCart()
        await loadCart() // 장바구니 새로고침
      } catch (error) {
        console.error('장바구니 비우기 실패:', error)
      }
    }
    
    clearCartAsync()
  }, [cartService, loadCart])

  // Legacy function for backward compatibility
  const addToCart = useCallback(async (productId: string, quantity: number = 1) => {
    try {
      await cartService.addItem(productId, quantity)
      await loadCart() // 장바구니 새로고침
    } catch (error) {
      console.error('장바구니 추가 실패:', error)
    }
  }, [cartService, loadCart])

  // Debug logging for itemsCount changes
  useEffect(() => {
    console.log('🔢 CartContext: itemsCount 변경됨:', itemsCount)
  }, [itemsCount])

  return (
    <CartContext.Provider value={{
      items,
      loading,
      itemsCount,
      totalAmount,
      addItem,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}