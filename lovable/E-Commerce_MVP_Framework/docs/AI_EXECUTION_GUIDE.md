# AI EXECUTION GUIDE - Step-by-Step Implementation Manual

## 🎯 PURPOSE
This guide provides precise, executable instructions for AI models to replicate the JP Caster e-commerce platform. Every step includes specific commands, code snippets, and verification procedures.

## 📋 PREREQUISITES CHECKLIST
- [ ] Node.js 18+ installed
- [ ] npm or bun package manager
- [ ] Supabase account and project
- [ ] Code editor with TypeScript support
- [ ] Git repository initialized

## 🚀 PHASE 1: PROJECT INITIALIZATION

### Step 1: Create Project Structure
```bash
# Execute these commands in sequence
npm create vite@latest ecommerce-platform -- --template react-ts
cd ecommerce-platform
npm install
```

### Step 2: Install Core Dependencies
```bash
# UI and Styling
npm install tailwindcss postcss autoprefixer
npm install @tailwindcss/typography
npm install class-variance-authority clsx tailwind-merge

# Radix UI Components
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-tabs
npm install @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-aspect-ratio
npm install @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-collapsible
npm install @radix-ui/react-context-menu @radix-ui/react-hover-card @radix-ui/react-label
npm install @radix-ui/react-menubar @radix-ui/react-navigation-menu @radix-ui/react-popover
npm install @radix-ui/react-progress @radix-ui/react-radio-group @radix-ui/react-scroll-area
npm install @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slider
npm install @radix-ui/react-slot @radix-ui/react-switch @radix-ui/react-toast
npm install @radix-ui/react-toggle @radix-ui/react-toggle-group @radix-ui/react-tooltip

# Backend Integration
npm install @supabase/supabase-js @supabase/ssr
npm install @tanstack/react-query

# Form Management
npm install react-hook-form @hookform/resolvers zod

# Routing and Navigation
npm install react-router-dom

# Icons and Utilities
npm install lucide-react date-fns axios

# Additional UI Components
npm install vaul sonner input-otp
npm install embla-carousel-react
npm install react-resizable-panels
npm install next-themes
```

### Step 3: Setup Configuration Files
```bash
# Initialize Tailwind
npx tailwindcss init -p
```

### Step 4: Create Environment File
```bash
# Create .env file
touch .env
```

Add to `.env`:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🏗️ PHASE 2: CORE CONFIGURATION

### Step 5: Configure Vite (vite.config.ts)
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  base: '/',
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
  define: {
    __VITE_SUPABASE_URL__: JSON.stringify(process.env.VITE_SUPABASE_URL),
    __VITE_SUPABASE_ANON_KEY__: JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY),
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    minify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
        }
      }
    }
  },
}));
```

### Step 6: Configure Tailwind (tailwind.config.ts)
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
```

## 🗄️ PHASE 3: DATABASE SETUP

### Step 7: Create Supabase Database Schema
Execute these SQL commands in your Supabase SQL editor:

```sql
-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  sku VARCHAR(100) UNIQUE,
  stock_quantity INTEGER DEFAULT 0,
  main_image_url TEXT,
  images TEXT[],
  specifications JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart items table
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  session_id VARCHAR(255),
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  product_id UUID REFERENCES products(id),
  product_name VARCHAR(255) NOT NULL,
  product_price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Step 8: Setup Row Level Security (RLS)
```sql
-- Enable RLS
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Cart items policies
CREATE POLICY "Users can view their own cart items" ON cart_items
  FOR SELECT USING (auth.uid() = user_id OR session_id = current_setting('app.session_id', true));

CREATE POLICY "Users can insert their own cart items" ON cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id OR session_id = current_setting('app.session_id', true));

CREATE POLICY "Users can update their own cart items" ON cart_items
  FOR UPDATE USING (auth.uid() = user_id OR session_id = current_setting('app.session_id', true));

CREATE POLICY "Users can delete their own cart items" ON cart_items
  FOR DELETE USING (auth.uid() = user_id OR session_id = current_setting('app.session_id', true));

-- Orders policies
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Order items policies
CREATE POLICY "Users can view their own order items" ON order_items
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own order items" ON order_items
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
  ));

-- Public read access for categories and products
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (true);
```

## 🔧 PHASE 4: CORE SERVICES

### Step 9: Create Supabase Client (src/integrations/supabase/client.ts)
```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

### Step 10: Create TypeScript Types (src/integrations/supabase/types.ts)
```typescript
export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          category_id: string | null
          name: string
          slug: string
          description: string | null
          price: number
          sku: string | null
          stock_quantity: number
          main_image_url: string | null
          images: string[] | null
          specifications: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id?: string | null
          name: string
          slug: string
          description?: string | null
          price: number
          sku?: string | null
          stock_quantity?: number
          main_image_url?: string | null
          images?: string[] | null
          specifications?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string | null
          name?: string
          slug?: string
          description?: string | null
          price?: number
          sku?: string | null
          stock_quantity?: number
          main_image_url?: string | null
          images?: string[] | null
          specifications?: any | null
          created_at?: string
          updated_at?: string
        }
      }
      cart_items: {
        Row: {
          id: string
          user_id: string | null
          session_id: string | null
          product_id: string
          quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          product_id: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          product_id?: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
```

### Step 11: Create Cart Service (src/services/cartService.ts)
```typescript
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
  slug?: string
  product_id: string
}

export interface CartService {
  getCart: () => Promise<CartItem[]>
  addItem: (item: CartItem) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  clearCart: () => Promise<void>
}

class SupabaseCartService implements CartService {
  private getSessionId(): string {
    let sessionId = localStorage.getItem('cart_session_id')
    if (!sessionId) {
      sessionId = crypto.randomUUID()
      localStorage.setItem('cart_session_id', sessionId)
    }
    return sessionId
  }

  async getCart(): Promise<CartItem[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const sessionId = this.getSessionId()
      
      let query = supabase
        .from('cart_items')
        .select(`
          *,
          products (
            id,
            name,
            price,
            slug,
            main_image_url
          )
        `)
      
      if (user) {
        query = query.eq('user_id', user.id)
      } else {
        query = query.eq('session_id', sessionId)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      return data?.map(item => ({
        id: item.id,
        name: item.products.name,
        price: item.products.price,
        quantity: item.quantity,
        image: item.products.main_image_url,
        slug: item.products.slug,
        product_id: item.product_id
      })) || []
    } catch (error) {
      console.error('장바구니 조회 실패:', error)
      return []
    }
  }

  async addItem(item: CartItem): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const sessionId = this.getSessionId()
      
      // Check if item already exists
      const existingItems = await this.getCart()
      const existingItem = existingItems.find(cartItem => cartItem.product_id === item.product_id)
      
      if (existingItem) {
        await this.updateQuantity(existingItem.id, existingItem.quantity + item.quantity)
        return
      }
      
      const { error } = await supabase
        .from('cart_items')
        .insert({
          user_id: user?.id || null,
          session_id: user ? null : sessionId,
          product_id: item.product_id,
          quantity: item.quantity
        })
      
      if (error) throw error
      
      toast({
        title: "장바구니에 추가됨",
        description: `${item.name}이(가) 장바구니에 추가되었습니다.`
      })
    } catch (error) {
      console.error('장바구니 추가 실패:', error)
      toast({
        title: "오류",
        description: "장바구니 추가 중 오류가 발생했습니다.",
        variant: "destructive"
      })
    }
  }

  async updateQuantity(itemId: string, quantity: number): Promise<void> {
    try {
      if (quantity <= 0) {
        await this.removeItem(itemId)
        return
      }
      
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId)
      
      if (error) throw error
    } catch (error) {
      console.error('수량 업데이트 실패:', error)
      toast({
        title: "오류",
        description: "수량 업데이트 중 오류가 발생했습니다.",
        variant: "destructive"
      })
    }
  }

  async removeItem(itemId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)
      
      if (error) throw error
      
      toast({
        title: "상품 제거됨",
        description: "장바구니에서 상품이 제거되었습니다."
      })
    } catch (error) {
      console.error('상품 제거 실패:', error)
      toast({
        title: "오류",
        description: "상품 제거 중 오류가 발생했습니다.",
        variant: "destructive"
      })
    }
  }

  async clearCart(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const sessionId = this.getSessionId()
      
      let query = supabase.from('cart_items').delete()
      
      if (user) {
        query = query.eq('user_id', user.id)
      } else {
        query = query.eq('session_id', sessionId)
      }
      
      const { error } = await query
      
      if (error) throw error
      
      toast({
        title: "장바구니 비워짐",
        description: "장바구니가 성공적으로 비워졌습니다."
      })
    } catch (error) {
      console.error('장바구니 비우기 실패:', error)
      toast({
        title: "오류",
        description: "장바구니 비우기 중 오류가 발생했습니다.",
        variant: "destructive"
      })
    }
  }
}

export const cartService = new SupabaseCartService()
```

### Step 12: Create Authentication Hook (src/hooks/useAuth.ts)
```typescript
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { User } from '@supabase/supabase-js'

const USE_MOCK_AUTH = false

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (USE_MOCK_AUTH) {
      // Mock user for development
      setUser({
        id: 'mock-user-id',
        email: 'mock@example.com',
        user_metadata: { full_name: 'Mock User' }
      } as User)
      setIsLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    if (USE_MOCK_AUTH) {
      setUser({
        id: 'mock-user-id',
        email: email,
        user_metadata: { full_name: 'Mock User' }
      } as User)
      return { error: null }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    if (USE_MOCK_AUTH) {
      setUser({
        id: 'mock-user-id',
        email: email,
        user_metadata: { full_name: fullName }
      } as User)
      return { error: null }
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
    return { error }
  }

  const signOut = async () => {
    if (USE_MOCK_AUTH) {
      setUser(null)
      return { error: null }
    }

    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
  }
}
```

## 🎨 PHASE 5: UI COMPONENTS

### Step 13: Create Utility Functions (src/lib/utils.ts)
```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Step 14: Create Toast Hook (src/hooks/use-toast.ts)
```typescript
import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id">

function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }
```

## 🧪 PHASE 6: TESTING AND VALIDATION

### Step 15: Create Test Script
```bash
# Create test script
echo 'npm run dev' > test-dev.sh
chmod +x test-dev.sh
```

### Step 16: Run Development Server
```bash
# Test the development server
npm run dev
```

### Step 17: Verify Core Functionality
Visit `http://localhost:5173` and verify:
- [ ] Page loads without errors
- [ ] Responsive design works
- [ ] Navigation functions
- [ ] Cart functionality works
- [ ] Authentication flows work
- [ ] Database connections are established

### Step 18: Build for Production
```bash
# Test production build
npm run build
npm run preview
```

## 📦 PHASE 7: FINAL STEPS

### Step 19: Create Deployment Configuration
```bash
# Create deployment script
cat > deploy.sh << 'EOF'
#!/bin/bash
npm run build
echo "Build completed successfully"
EOF
chmod +x deploy.sh
```

### Step 20: Create Documentation
```bash
# Generate project documentation
echo "# Project Documentation" > README.md
echo "Built using AI Execution Guide" >> README.md
echo "Date: $(date)" >> README.md
```

## ✅ VERIFICATION CHECKLIST

Before considering the project complete, verify:

- [ ] All dependencies installed without errors
- [ ] Development server runs on port 5173
- [ ] Production build completes successfully
- [ ] Database schema created correctly
- [ ] RLS policies implemented
- [ ] Authentication works (sign up, sign in, sign out)
- [ ] Cart functionality works (add, update, remove items)
- [ ] Order placement works
- [ ] Responsive design implemented
- [ ] Error handling implemented
- [ ] TypeScript compilation successful
- [ ] Environment variables configured
- [ ] Cross-platform compatibility verified

## 🎯 SUCCESS CRITERIA

Project is complete when:
1. All tests pass
2. No TypeScript errors
3. No console errors in browser
4. All features work as expected
5. Documentation is complete
6. Code is properly formatted and commented

## 🔧 TROUBLESHOOTING QUICK FIXES

### Common Issues:
1. **npm command not found**: Check .npmrc file, remove Linux paths
2. **Supabase connection fails**: Verify environment variables
3. **Build fails**: Run `npm install` again, check for missing dependencies
4. **TypeScript errors**: Ensure all types are properly defined
5. **Cart not working**: Check product_id field in cart items

### Emergency Reset:
```bash
# If something goes wrong, reset:
rm -rf node_modules package-lock.json
npm install
npm run dev
```

This guide provides a complete, executable blueprint for recreating the JP Caster e-commerce platform. Follow each step in sequence for best results.