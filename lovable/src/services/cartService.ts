import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  slug: string
  product_id: string
}

export interface CartService {
  getCart: () => Promise<CartItem[]>
  addItem: (productId: string, quantity?: number) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  clearCart: () => Promise<void>
  syncLocalCartToSupabase: (localItems: CartItem[]) => Promise<void>
}

class SupabaseCartService implements CartService {
  private cartId: string | null = null
  private sessionId: string | null = null

  constructor() {
    // 비로그인 사용자를 위한 세션 ID 생성
    this.sessionId = this.getOrCreateSessionId()
  }

  private getOrCreateSessionId(): string {
    let sessionId = localStorage.getItem('cart_session_id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('cart_session_id', sessionId)
    }
    return sessionId
  }

  private async getOrCreateCart(): Promise<string> {
    if (this.cartId) {
      return this.cartId
    }

    const { data: { user } } = await supabase.auth.getUser()
    
    // 기존 장바구니 찾기
    let query = supabase.from('carts').select('id')
    
    if (user) {
      query = query.eq('user_id', user.id)
    } else {
      query = query.eq('session_id', this.sessionId)
    }
    
    const { data: existingCart } = await query.single()
    
    if (existingCart) {
      this.cartId = existingCart.id
      return this.cartId
    }

    // 새 장바구니 생성
    const { data: newCart, error } = await supabase
      .from('carts')
      .insert({
        user_id: user?.id || null,
        session_id: user ? null : this.sessionId
      })
      .select('id')
      .single()

    if (error) throw error
    
    this.cartId = newCart.id
    return this.cartId
  }

  async getCart(): Promise<CartItem[]> {
    try {
      const cartId = await this.getOrCreateCart()
      
      const { data: cartItems, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(*)
        `)
        .eq('cart_id', cartId)
      
      if (error) throw error
      
      return cartItems?.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        image: item.product.main_image_url || '',
        quantity: item.quantity,
        slug: item.product.slug,
        product_id: item.product.id
      })) || []
    } catch (error) {
      console.error('Error fetching cart:', error)
      return []
    }
  }

  async addItem(productId: string, quantity: number = 1): Promise<void> {
    try {
      const cartId = await this.getOrCreateCart()
      
      // 기존 아이템 확인
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', cartId)
        .eq('product_id', productId)
        .single()
      
      if (existingItem) {
        // 수량 업데이트
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id)
        
        if (error) throw error
      } else {
        // 새 아이템 추가
        const { error } = await supabase
          .from('cart_items')
          .insert({
            cart_id: cartId,
            product_id: productId,
            quantity
          })
        
        if (error) throw error
      }
      
      toast({
        title: "장바구니에 추가됨",
        description: "상품이 장바구니에 추가되었습니다."
      })
    } catch (error) {
      console.error('Error adding item to cart:', error)
      toast({
        title: "오류",
        description: "장바구니에 상품을 추가하는 중 오류가 발생했습니다.",
        variant: "destructive"
      })
    }
  }

  async updateQuantity(productId: string, quantity: number): Promise<void> {
    try {
      const cartId = await this.getOrCreateCart()
      
      if (quantity <= 0) {
        await this.removeItem(productId)
        return
      }
      
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('cart_id', cartId)
        .eq('product_id', productId)
      
      if (error) throw error
    } catch (error) {
      console.error('Error updating cart item quantity:', error)
      toast({
        title: "오류",
        description: "수량 업데이트 중 오류가 발생했습니다.",
        variant: "destructive"
      })
    }
  }

  async removeItem(productId: string): Promise<void> {
    try {
      const cartId = await this.getOrCreateCart()
      
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cartId)
        .eq('product_id', productId)
      
      if (error) throw error
      
      toast({
        title: "상품 제거됨",
        description: "장바구니에서 상품이 제거되었습니다."
      })
    } catch (error) {
      console.error('Error removing item from cart:', error)
      toast({
        title: "오류",
        description: "상품 제거 중 오류가 발생했습니다.",
        variant: "destructive"
      })
    }
  }

  async clearCart(): Promise<void> {
    try {
      const cartId = await this.getOrCreateCart()
      
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cartId)
      
      if (error) throw error
    } catch (error) {
      console.error('Error clearing cart:', error)
      toast({
        title: "오류",
        description: "장바구니 비우기 중 오류가 발생했습니다.",
        variant: "destructive"
      })
    }
  }

  async syncLocalCartToSupabase(localItems: CartItem[]): Promise<void> {
    try {
      // 로컬 장바구니를 Supabase에 동기화
      for (const item of localItems) {
        await this.addItem(item.product_id, item.quantity)
      }
      
      // 로컬 장바구니 정리
      localStorage.removeItem('shopping_cart')
    } catch (error) {
      console.error('Error syncing local cart to Supabase:', error)
    }
  }
}

// 로컬 스토리지 기반 장바구니 (fallback)
class LocalCartService implements CartService {
  private storageKey = 'shopping_cart'

  async getCart(): Promise<CartItem[]> {
    try {
      const savedCart = localStorage.getItem(this.storageKey)
      return savedCart ? JSON.parse(savedCart) : []
    } catch (error) {
      console.error('Error loading local cart:', error)
      return []
    }
  }

  async addItem(productId: string, quantity: number = 1): Promise<void> {
    try {
      // 제품 정보 가져오기
      const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()
      
      if (!product) return

      const items = await this.getCart()
      const existingItem = items.find(item => item.product_id === productId)
      
      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        items.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.main_image_url || '',
          quantity,
          slug: product.slug,
          product_id: product.id
        })
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(items))
      
      toast({
        title: "장바구니에 추가됨",
        description: "상품이 장바구니에 추가되었습니다."
      })
    } catch (error) {
      console.error('Error adding item to local cart:', error)
      toast({
        title: "오류",
        description: "장바구니에 상품을 추가하는 중 오류가 발생했습니다.",
        variant: "destructive"
      })
    }
  }

  async updateQuantity(productId: string, quantity: number): Promise<void> {
    try {
      const items = await this.getCart()
      const updatedItems = items.map(item => 
        item.product_id === productId ? { ...item, quantity } : item
      ).filter(item => item.quantity > 0)
      
      localStorage.setItem(this.storageKey, JSON.stringify(updatedItems))
    } catch (error) {
      console.error('Error updating local cart item quantity:', error)
    }
  }

  async removeItem(productId: string): Promise<void> {
    try {
      const items = await this.getCart()
      const updatedItems = items.filter(item => item.product_id !== productId)
      
      localStorage.setItem(this.storageKey, JSON.stringify(updatedItems))
      
      toast({
        title: "상품 제거됨",
        description: "장바구니에서 상품이 제거되었습니다."
      })
    } catch (error) {
      console.error('Error removing item from local cart:', error)
    }
  }

  async clearCart(): Promise<void> {
    localStorage.removeItem(this.storageKey)
  }

  async syncLocalCartToSupabase(): Promise<void> {
    // 로컬 카트는 동기화 불필요
  }
}

// 카트 서비스 팩토리
export const createCartService = (): CartService => {
  // 개발 환경에서는 로컬 스토리지 사용, 프로덕션에서는 Supabase 사용
  const useSupabaseCart = process.env.NODE_ENV === 'production' || 
                         import.meta.env.VITE_USE_SUPABASE_CART === 'true'
  
  return useSupabaseCart ? new SupabaseCartService() : new LocalCartService()
}