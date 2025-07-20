# Phase 1: Supabase 백엔드 완전 구축 가이드

## 🎯 목표
30분 내에 완전한 이커머스 백엔드를 Supabase로 구축하기

## 📋 사전 준비사항
- Node.js 18+ 설치
- Supabase 계정 생성
- Git 설치

## 🔧 1단계: Supabase CLI 설치 및 설정

```bash
# Supabase CLI 설치
npm install -g supabase

# 로그인
supabase login

# 프로젝트 초기화
supabase init your-ecommerce-project
cd your-ecommerce-project
```

## 🗄️ 2단계: 데이터베이스 스키마 생성

### 테이블 구조 (마이그레이션 파일)

```sql
-- supabase/migrations/20250101000001_create_ecommerce_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category_id UUID REFERENCES categories(id),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    stock_quantity INTEGER DEFAULT 0,
    manufacturer VARCHAR(255),
    main_image_url TEXT,
    image_urls JSONB DEFAULT '[]',
    features JSONB DEFAULT '{}',
    is_published BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles table (사용자 확장 정보)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name TEXT,
    phone TEXT,
    address TEXT,
    role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart items table
CREATE TABLE cart_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    session_id TEXT, -- 비로그인 사용자용
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id),
    UNIQUE(session_id, product_id)
);

-- Orders table
CREATE TABLE orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending',
    order_status TEXT DEFAULT 'pending',
    shipping_method TEXT,
    tracking_number TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES orders(id),
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notices table
CREATE TABLE notices (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT '일반',
    author TEXT DEFAULT '관리자',
    is_pinned BOOLEAN DEFAULT false,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔒 3단계: RLS 정책 설정

```sql
-- supabase/migrations/20250101000002_setup_rls_policies.sql

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

-- Categories policies (공개 읽기, 관리자만 수정)
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Only admins can insert categories" ON categories FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Only admins can update categories" ON categories FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- Products policies
CREATE POLICY "Published products are viewable by everyone" ON products FOR SELECT USING (is_published = true OR auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Only admins can insert products" ON products FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Only admins can update products" ON products FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Cart policies
CREATE POLICY "Users can view own cart" ON cart_items FOR SELECT USING (auth.uid() = user_id OR session_id IS NOT NULL);
CREATE POLICY "Users can manage own cart" ON cart_items FOR ALL USING (auth.uid() = user_id OR session_id IS NOT NULL);

-- Orders policies
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Only admins can update orders" ON orders FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- Order items policies
CREATE POLICY "Order items viewable by order owner" ON order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_id AND (orders.user_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin'))
);

-- Notices policies
CREATE POLICY "Notices are viewable by everyone" ON notices FOR SELECT USING (true);
CREATE POLICY "Only admins can manage notices" ON notices FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
```

## 🚀 4단계: 마이그레이션 실행

```bash
# 로컬 개발 환경 시작
supabase start

# 마이그레이션 실행
supabase db push

# 타입 생성 (TypeScript 프로젝트용)
supabase gen types typescript --local > types/supabase.ts
```

## 🔧 5단계: 환경 변수 설정

```bash
# .env.local 파일 생성
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## ✅ 6단계: 백엔드 기능 테스트

### Supabase 대시보드에서 확인:
1. 테이블 생성 확인
2. RLS 정책 적용 확인
3. 인증 설정 확인

### API 테스트:
```javascript
// 테스트 스크립트
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, key)

// 1. 카테고리 조회 테스트
const { data: categories } = await supabase.from('categories').select('*')
console.log('Categories:', categories)

// 2. 제품 조회 테스트
const { data: products } = await supabase.from('products').select('*')
console.log('Products:', products)

// 3. 인증 테스트
const { data: authData } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'password123'
})
console.log('Auth:', authData)
```

## 🎯 완료 체크리스트

- [ ] Supabase 프로젝트 생성
- [ ] 데이터베이스 스키마 적용
- [ ] RLS 정책 설정
- [ ] 환경 변수 설정
- [ ] API 기능 테스트
- [ ] 인증 시스템 확인

## 🔄 다음 단계
이제 Phase 2: UI 빌더 프론트엔드 개발로 넘어갑니다.

## 🚨 문제 해결

### 자주 발생하는 오류:

1. **마이그레이션 실패**
   ```bash
   supabase db reset
   supabase db push
   ```

2. **RLS 정책 오류**
   - Supabase 대시보드에서 정책 확인
   - auth.jwt() 함수 대신 auth.uid() 사용 권장

3. **환경 변수 문제**
   - .env.local 파일 위치 확인
   - 변수명 정확성 확인

이 가이드를 따르면 30분 내에 완전한 이커머스 백엔드가 구축됩니다.