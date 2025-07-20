export interface Order {
  id: string
  user_id: string | null
  email: string
  full_name: string
  phone: string
  address: string
  total_amount: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  product_price: number
  quantity: number
  total_price: number
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[]
}