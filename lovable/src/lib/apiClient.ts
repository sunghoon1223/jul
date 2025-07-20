/**
 * PHP API 클라이언트
 * Supabase를 대체하는 HTTP 클라이언트
 */

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-domain.com/api' 
  : 'http://localhost/api';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  address?: string;
  role: 'customer' | 'admin';
  created_at: string;
}

interface AuthResponse {
  user: User;
  token: string;
  expires_in: number;
}

interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  sku: string;
  stock_quantity: number;
  manufacturer: string;
  main_image_url: string;
  image_urls: string[];
  features: Record<string, string>;
  is_published: boolean;
  is_featured: boolean;
  category_name: string;
  category_slug: string;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  product_count: number;
}

interface CartItem {
  id: string;
  user_id?: string;
  session_id?: string;
  product_id: string;
  quantity: number;
  name: string;
  slug: string;
  price: number;
  main_image_url: string;
  stock_quantity: number;
  subtotal: number;
  in_stock: boolean;
  created_at: string;
  updated_at: string;
}

interface Order {
  id: string;
  user_id?: string;
  email: string;
  full_name: string;
  phone: string;
  address: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  shipping_method: string;
  tracking_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface Notice {
  id: number;
  title: string;
  content: string;
  category: string;
  author: string;
  is_pinned: boolean;
  isPinned: boolean; // Frontend 호환성
  views: number;
  created_at: string;
  createdAt: string; // Frontend 호환성
  updated_at: string;
  preview?: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  sku: string;
  stock_quantity: number;
  manufacturer: string;
  category_id: string;
  main_image_url: string;
  image_urls: string[];
  features: Record<string, any>;
  is_published: boolean;
}

export interface NoticeFormData {
  title: string;
  content: string;
  category: string;
  is_pinned?: boolean;
}

class ApiClient {
  private token: string | null = null;
  private sessionId: string | null = null;

  constructor() {
    // 토큰과 세션 ID 초기화
    this.token = localStorage.getItem('auth_token');
    this.sessionId = localStorage.getItem('session_id') || this.generateSessionId();
    
    if (!localStorage.getItem('session_id')) {
      localStorage.setItem('session_id', this.sessionId!);
    }
  }

  private generateSessionId(): string {
    return 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    // JWT 토큰 헤더 추가
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // 인증 관련 메서드
  async signUp(email: string, password: string, fullName: string, phone?: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register.php', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        full_name: fullName,
        phone
      }),
    });

    if (response.success && response.data) {
      this.token = response.data.token;
      localStorage.setItem('auth_token', this.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data!;
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login.php', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data) {
      this.token = response.data.token;
      localStorage.setItem('auth_token', this.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data!;
  }

  async signOut(): Promise<void> {
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.token) return null;

    try {
      const response = await this.request<User>('/auth/me.php');
      return response.data || null;
    } catch (error) {
      console.error('Get current user failed:', error);
      this.signOut(); // 토큰이 유효하지 않으면 로그아웃
      return null;
    }
  }

  // 제품 관련 메서드
  async getProducts(params: {
    category_id?: string;
    category?: string;
    search?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ products: Product[]; pagination: any }> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });

    const response = await this.request<{ products: Product[]; pagination: any }>(
      `/products/list.php?${searchParams}`
    );

    return response.data!;
  }

  async getProduct(slugOrId: string): Promise<{ product: Product; related_products: Product[] }> {
    const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
    const param = isId ? `id=${slugOrId}` : `slug=${slugOrId}`;
    
    const response = await this.request<{ product: Product; related_products: Product[] }>(
      `/products/detail.php?${param}`
    );

    return response.data!;
  }

  // 카테고리 관련 메서드
  async getCategories(): Promise<Category[]> {
    const response = await this.request<Category[]>('/categories/list.php');
    return response.data!;
  }

  // 장바구니 관련 메서드
  async getCartItems(): Promise<{ items: CartItem[]; summary: any }> {
    const params = new URLSearchParams();
    if (this.sessionId) {
      params.append('session_id', this.sessionId);
    }

    const response = await this.request<{ items: CartItem[]; summary: any }>(
      `/cart/list.php?${params}`
    );

    return response.data!;
  }

  async addToCart(productId: string, quantity: number = 1): Promise<CartItem> {
    const response = await this.request<CartItem>('/cart/add.php', {
      method: 'POST',
      body: JSON.stringify({
        product_id: productId,
        quantity,
        session_id: this.sessionId
      }),
    });

    return response.data!;
  }

  async updateCartItem(itemId: string, quantity: number): Promise<CartItem> {
    const response = await this.request<CartItem>('/cart/update.php', {
      method: 'POST',
      body: JSON.stringify({
        item_id: itemId,
        quantity,
        session_id: this.sessionId
      }),
    });

    return response.data!;
  }

  async removeFromCart(itemId: string): Promise<void> {
    await this.request('/cart/remove.php', {
      method: 'POST',
      body: JSON.stringify({
        item_id: itemId,
        session_id: this.sessionId
      }),
    });
  }

  // 주문 관련 메서드
  async createOrder(orderData: {
    email: string;
    full_name: string;
    phone: string;
    address: string;
    payment_method: string;
    shipping_method: string;
    items: Array<{
      product_id: string;
      quantity: number;
    }>;
  }): Promise<{ order: Order; items: any[] }> {
    const response = await this.request<{ order: Order; items: any[] }>('/orders/create.php', {
      method: 'POST',
      body: JSON.stringify({
        ...orderData,
        session_id: this.sessionId
      }),
    });

    return response.data!;
  }

  async getOrders(): Promise<Order[]> {
    const response = await this.request<Order[]>('/orders/list.php');
    return response.data!;
  }

  async getOrder(orderId: string): Promise<{ order: Order; items: any[] }> {
    const response = await this.request<{ order: Order; items: any[] }>(
      `/orders/detail.php?id=${orderId}`
    );

    return response.data!;
  }

  // 관리자 - 제품 관리 메서드
  async createProduct(productData: ProductFormData): Promise<Product> {
    const response = await this.request<Product>('/products/create.php', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
    return response.product!;
  }

  async updateProduct(productId: string, productData: Partial<ProductFormData>): Promise<Product> {
    const response = await this.request<Product>('/products/update.php', {
      method: 'PUT',
      body: JSON.stringify({
        id: productId,
        ...productData
      }),
    });
    return response.product!;
  }

  async deleteProduct(productId: string): Promise<void> {
    await this.request(`/products/delete.php?id=${productId}`, {
      method: 'DELETE',
    });
  }

  async toggleProductPublish(productId: string): Promise<Product> {
    const response = await this.request<Product>('/products/toggle-publish.php', {
      method: 'POST',
      body: JSON.stringify({ id: productId }),
    });
    return response.product!;
  }

  // 관리자 - 공지사항 관리 메서드
  async getNotices(params?: { page?: number; limit?: number; category?: string; search?: string }): Promise<{
    notices: Notice[];
    pagination: any;
    category_statistics: any[];
  }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const url = `/notices/list.php${queryString ? '?' + queryString : ''}`;
    
    const response = await this.request<{
      notices: Notice[];
      pagination: any;
      category_statistics: any[];
    }>(url);
    
    return response.data!;
  }

  async createNotice(noticeData: NoticeFormData): Promise<Notice> {
    const response = await this.request<Notice>('/notices/create.php', {
      method: 'POST',
      body: JSON.stringify(noticeData),
    });
    return response.notice!;
  }

  async updateNotice(noticeId: number, noticeData: Partial<NoticeFormData>): Promise<Notice> {
    const response = await this.request<Notice>('/notices/update.php', {
      method: 'PUT',
      body: JSON.stringify({
        id: noticeId,
        ...noticeData
      }),
    });
    return response.notice!;
  }

  async deleteNotice(noticeId: number): Promise<void> {
    await this.request(`/notices/delete.php?id=${noticeId}`, {
      method: 'DELETE',
    });
  }

  async toggleNoticePin(noticeId: number): Promise<Notice> {
    const response = await this.request<Notice>('/notices/toggle-pin.php', {
      method: 'POST',
      body: JSON.stringify({ id: noticeId }),
    });
    return response.notice!;
  }

  // 관리자 - 사용자 관리 메서드
  async getUsers(params?: { page?: number; limit?: number; role?: string; search?: string }): Promise<{
    users: User[];
    pagination: any;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.role) queryParams.append('role', params.role);
    if (params?.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const url = `/users/list.php${queryString ? '?' + queryString : ''}`;
    
    const response = await this.request<{
      users: User[];
      pagination: any;
    }>(url);
    
    return response.data!;
  }

  // 관리자 - 주문 관리 메서드
  async getAdminOrders(params?: { page?: number; limit?: number; status?: string; search?: string }): Promise<{
    orders: any[];
    pagination: any;
    statistics: any[];
  }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const url = `/orders/list.php${queryString ? '?' + queryString : ''}`;
    
    const response = await this.request<{
      orders: any[];
      pagination: any;
      statistics: any[];
    }>(url);
    
    return response.data!;
  }

  async updateOrderStatus(orderId: string, status: string): Promise<any> {
    const response = await this.request<any>('/orders/update-status.php', {
      method: 'PUT',
      body: JSON.stringify({
        id: orderId,
        status
      }),
    });
    return response.order!;
  }

  // 파일 업로드 메서드
  async uploadImage(file: File): Promise<{
    filename: string;
    url: string;
    size: number;
    type: string;
  }> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/upload/image.php`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data.image;
  }

  // 유틸리티 메서드
  isAuthenticated(): boolean {
    return !!this.token;
  }

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }
}

// 싱글톤 인스턴스 생성
export const apiClient = new ApiClient();

// 타입 익스포트
export type { User, Product, Category, CartItem, Order, AuthResponse, Notice };