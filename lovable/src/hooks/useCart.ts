import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { CartState, CartWithItems, CartItem } from '@/types/cart'
import { useAuth } from './useAuth'
import { toast } from '@/hooks/use-toast'

export function useCart() {
  const { user } = useAuth()
  const [cartState, setCartState] = useState<CartState>({
    cart: null,
    loading: true,
    itemsCount: 0,
    totalAmount: 0
  })

  // Get or create session ID for non-logged in users
  const getSessionId = useCallback(() => {
    let sessionId = localStorage.getItem('cart_session_id')
    if (!sessionId) {
      sessionId = crypto.randomUUID()
      localStorage.setItem('cart_session_id', sessionId)
    }
    return sessionId
  }, [])

  // Calculate cart totals
  const calculateTotals = useCallback((cart: CartWithItems | null) => {
    if (!cart || !cart.cart_items) {
      return { itemsCount: 0, totalAmount: 0 }
    }

    const itemsCount = cart.cart_items.reduce((sum, item) => sum + item.quantity, 0)
    const totalAmount = cart.cart_items.reduce((sum, item) => {
      return sum + (item.product?.price || 0) * item.quantity
    }, 0)

    return { itemsCount, totalAmount }
  }, [])

  // Fetch cart
  const fetchCart = useCallback(async () => {
    try {
      setCartState(prev => ({ ...prev, loading: true }))

      let query = supabase
        .from('carts')
        .select(`
          *,
          cart_items (
            *,
            product:products (*)
          )
        `)

      if (user) {
        query = query.eq('user_id', user.id)
      } else {
        const sessionId = getSessionId()
        query = query.eq('session_id', sessionId)
      }

      const { data, error } = await query.maybeSingle()

      if (error) {
        console.error('Error fetching cart:', error)
        return
      }

      const cart = data as CartWithItems | null
      const { itemsCount, totalAmount } = calculateTotals(cart)

      setCartState({
        cart,
        loading: false,
        itemsCount,
        totalAmount
      })
    } catch (error) {
      console.error('Error in fetchCart:', error)
      setCartState(prev => ({ ...prev, loading: false }))
    }
  }, [user, getSessionId, calculateTotals])

  // Get or create cart
  const getOrCreateCart = useCallback(async () => {
    let cart = cartState.cart

    if (!cart) {
      const cartData = user
        ? { user_id: user.id }
        : { session_id: getSessionId() }

      const { data, error } = await supabase
        .from('carts')
        .insert(cartData)
        .select()
        .single()

      if (error) {
        console.error('Error creating cart:', error)
        return null
      }

      cart = { ...data, cart_items: [] } as CartWithItems
    }

    return cart
  }, [user, cartState.cart, getSessionId])

  // Add item to cart
  const addToCart = useCallback(async (productId: string, quantity: number = 1) => {
    try {
      const cart = await getOrCreateCart()
      if (!cart) return

      // Check if item already exists
      const existingItem = cart.cart_items?.find(item => item.product_id === productId)

      if (existingItem) {
        // Update quantity
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id)

        if (error) {
          console.error('Error updating cart item:', error)
          toast({
            variant: "destructive",
            title: "오류",
            description: "장바구니 업데이트에 실패했습니다."
          })
          return
        }
      } else {
        // Add new item
        const { error } = await supabase
          .from('cart_items')
          .insert({
            cart_id: cart.id,
            product_id: productId,
            quantity
          })

        if (error) {
          console.error('Error adding to cart:', error)
          toast({
            variant: "destructive",
            title: "오류",
            description: "장바구니에 추가하는데 실패했습니다."
          })
          return
        }
      }

      await fetchCart()
      toast({
        title: "장바구니에 추가됨",
        description: "상품이 장바구니에 추가되었습니다."
      })
    } catch (error) {
      console.error('Error in addToCart:', error)
      toast({
        variant: "destructive",
        title: "오류",
        description: "장바구니에 추가하는데 실패했습니다."
      })
    }
  }, [getOrCreateCart, fetchCart])

  // Update item quantity
  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      return removeItem(itemId)
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId)

      if (error) {
        console.error('Error updating quantity:', error)
        return
      }

      await fetchCart()
    } catch (error) {
      console.error('Error in updateQuantity:', error)
    }
  }, [fetchCart])

  // Remove item
  const removeItem = useCallback(async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)

      if (error) {
        console.error('Error removing item:', error)
        return
      }

      await fetchCart()
      toast({
        title: "상품 제거됨",
        description: "장바구니에서 상품이 제거되었습니다."
      })
    } catch (error) {
      console.error('Error in removeItem:', error)
    }
  }, [fetchCart])

  // Clear cart
  const clearCart = useCallback(async () => {
    if (!cartState.cart) return

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cartState.cart.id)

      if (error) {
        console.error('Error clearing cart:', error)
        return
      }

      await fetchCart()
    } catch (error) {
      console.error('Error in clearCart:', error)
    }
  }, [cartState.cart, fetchCart])

  // Fetch cart on mount and user change
  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  return {
    ...cartState,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    refetch: fetchCart
  }
}

// Remove item function
function removeItem(itemId: string): void | Promise<void> {
  throw new Error('Function not implemented.')
}