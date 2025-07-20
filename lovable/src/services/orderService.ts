import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'
import { CartItem } from './cartService'

export interface OrderItem {
  id: string
  product_id: string
  product_name: string
  product_price: number
  quantity: number
  total_price: number
}

export interface Order {
  id: string
  user_id?: string
  email: string
  full_name: string
  phone: string
  address: string
  total_amount: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  created_at: string
  updated_at: string
  items: OrderItem[]
}

export interface CreateOrderRequest {
  email: string
  full_name: string
  phone: string
  address: string
  items: CartItem[]
}

export interface OrderService {
  createOrder: (orderData: CreateOrderRequest) => Promise<Order>
  getOrders: (userId?: string) => Promise<Order[]>
  getOrder: (orderId: string) => Promise<Order | null>
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>
  cancelOrder: (orderId: string) => Promise<void>
}

class SupabaseOrderService implements OrderService {
  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Calculate total amount
      const totalAmount = orderData.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id || null,
          email: orderData.email,
          full_name: orderData.full_name,
          phone: orderData.phone,
          address: orderData.address,
          total_amount: totalAmount,
          status: 'pending'
        })
        .select()
        .single()
      
      if (orderError) throw orderError
      
      // Create order items
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.name,
        product_price: item.price,
        quantity: item.quantity,
        total_price: item.price * item.quantity
      }))
      
      const { data: createdItems, error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)
        .select()
      
      if (itemsError) throw itemsError
      
      // Update inventory
      for (const item of orderData.items) {
        // Get current stock first
        const { data: currentProduct } = await supabase
          .from('products')
          .select('stock_quantity')
          .eq('id', item.product_id)
          .single()
        
        if (currentProduct && currentProduct.stock_quantity >= item.quantity) {
          const { error: inventoryError } = await supabase
            .from('products')
            .update({
              stock_quantity: currentProduct.stock_quantity - item.quantity
            })
            .eq('id', item.product_id)
          
          if (inventoryError) {
            console.error('재고 업데이트 실패:', inventoryError)
          }
        }
      }
      
      toast({
        title: "주문이 완료되었습니다",
        description: `주문번호: ${order.id.slice(0, 8)}...`
      })
      
      return {
        ...order,
        items: createdItems.map(item => ({
          id: item.id,
          product_id: item.product_id,
          product_name: item.product_name,
          product_price: item.product_price,
          quantity: item.quantity,
          total_price: item.total_price
        }))
      }
    } catch (error) {
      console.error('주문 생성 실패:', error)
      toast({
        title: "주문 실패",
        description: "주문 처리 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive"
      })
      throw error
    }
  }
  
  async getOrders(userId?: string): Promise<Order[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const targetUserId = userId || user?.id
      
      if (!targetUserId) {
        return []
      }
      
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      return orders?.map(order => ({
        ...order,
        items: order.order_items.map(item => ({
          id: item.id,
          product_id: item.product_id,
          product_name: item.product_name,
          product_price: item.product_price,
          quantity: item.quantity,
          total_price: item.total_price
        }))
      })) || []
    } catch (error) {
      console.error('주문 목록 조회 실패:', error)
      return []
    }
  }
  
  async getOrder(orderId: string): Promise<Order | null> {
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('id', orderId)
        .single()
      
      if (error) throw error
      
      return {
        ...order,
        items: order.order_items.map(item => ({
          id: item.id,
          product_id: item.product_id,
          product_name: item.product_name,
          product_price: item.product_price,
          quantity: item.quantity,
          total_price: item.total_price
        }))
      }
    } catch (error) {
      console.error('주문 조회 실패:', error)
      return null
    }
  }
  
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
      
      if (error) throw error
      
      toast({
        title: "주문 상태 업데이트",
        description: `주문 상태가 "${status}"로 변경되었습니다.`
      })
    } catch (error) {
      console.error('주문 상태 업데이트 실패:', error)
      toast({
        title: "오류",
        description: "주문 상태 업데이트 중 오류가 발생했습니다.",
        variant: "destructive"
      })
    }
  }
  
  async cancelOrder(orderId: string): Promise<void> {
    try {
      // 주문 정보 조회
      const order = await this.getOrder(orderId)
      if (!order) {
        throw new Error('주문을 찾을 수 없습니다.')
      }
      
      // 주문 취소 상태로 변경
      await this.updateOrderStatus(orderId, 'cancelled')
      
      // 재고 복원
      for (const item of order.items) {
        // Get current stock first
        const { data: currentProduct } = await supabase
          .from('products')
          .select('stock_quantity')
          .eq('id', item.product_id)
          .single()
        
        if (currentProduct) {
          const { error: inventoryError } = await supabase
            .from('products')
            .update({
              stock_quantity: currentProduct.stock_quantity + item.quantity
            })
            .eq('id', item.product_id)
          
          if (inventoryError) {
            console.error('재고 복원 실패:', inventoryError)
          }
        }
      }
      
      toast({
        title: "주문 취소 완료",
        description: "주문이 취소되었습니다. 재고가 복원되었습니다."
      })
    } catch (error) {
      console.error('주문 취소 실패:', error)
      toast({
        title: "주문 취소 실패",
        description: "주문 취소 중 오류가 발생했습니다.",
        variant: "destructive"
      })
    }
  }
}

export const orderService = new SupabaseOrderService()