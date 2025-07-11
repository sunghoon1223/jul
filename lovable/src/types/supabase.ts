export interface Category {
  id: string
  created_at: string
  name: string
  slug: string
  description: string | null
}

export interface Product {
  id: string
  created_at: string
  name: string
  slug: string
  description: string
  price: number
  sku: string | null
  stock_quantity: number
  manufacturer: string | null
  is_published: boolean
  category_id: string
  main_image_url: string | null
  image_urls: string[] | null
  features: any | null
}

export interface ProductWithCategory extends Product {
  category: Category
}

export interface ProductsResponse {
  data: ProductWithCategory[]
  count: number
  hasMore: boolean
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

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