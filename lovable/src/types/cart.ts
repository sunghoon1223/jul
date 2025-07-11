import { Product } from './supabase'

export interface Cart {
  id: string
  user_id: string | null
  session_id: string | null
  created_at: string
  updated_at: string
}

export interface CartItem {
  id: string
  cart_id: string
  product_id: string
  quantity: number
  created_at: string
  updated_at: string
  product?: Product
}

export interface CartWithItems extends Cart {
  cart_items: CartItem[]
}

export interface CartState {
  cart: CartWithItems | null
  loading: boolean
  itemsCount: number
  totalAmount: number
}