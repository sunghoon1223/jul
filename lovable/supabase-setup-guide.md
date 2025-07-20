# Supabase 프로젝트 생성 가이드

## 🚀 새로운 Supabase 프로젝트 생성

### 1. Supabase 대시보드 접속
1. https://supabase.com 방문
2. 로그인 또는 회원가입
3. "New Project" 버튼 클릭

### 2. 프로젝트 설정
- **Project Name**: jp-caster-local
- **Database Password**: 강력한 비밀번호 설정 (예: JpCaster2024!)
- **Region**: Singapore (아시아 최적화)

### 3. 프로젝트 생성 완료 후
1. 프로젝트 URL 복사 (예: https://abcdefghijklmnop.supabase.co)
2. Project Settings → API → API Keys 확인
   - `anon` `public` key 복사
   - `service_role` `secret` key 복사

### 4. 환경 변수 업데이트
`.env` 파일에 새로운 값들 입력:
```bash
VITE_SUPABASE_URL=https://[새로운-프로젝트-id].supabase.co
VITE_SUPABASE_ANON_KEY=[새로운-anon-key]
SUPABASE_SECRET_KEY=[새로운-secret-key]
```

### 5. 데이터베이스 테이블 생성
Supabase 대시보드에서 SQL Editor → 새로운 Query 생성 후 실행:

```sql
-- 카테고리 테이블
CREATE TABLE categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    product_count INTEGER DEFAULT 0,
    image TEXT,
    color TEXT,
    bg_color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 제품 테이블
CREATE TABLE products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2),
    sku TEXT UNIQUE,
    stock_quantity INTEGER DEFAULT 0,
    stock_status TEXT DEFAULT 'instock',
    weight DECIMAL(10,2),
    dimensions JSONB,
    manufacturer TEXT,
    category_id TEXT REFERENCES categories(id),
    main_image_url TEXT,
    image_urls JSONB,
    features JSONB,
    specifications JSONB,
    is_featured BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 장바구니 테이블
CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 장바구니 아이템 테이블
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_carts_session_id ON carts(session_id);
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);
```

### 6. RLS (Row Level Security) 설정
```sql
-- 공개 테이블은 모든 사용자가 읽기 가능
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- 읽기 정책
CREATE POLICY "Enable read access for all users" ON categories FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON products FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON carts FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON cart_items FOR SELECT USING (true);

-- 쓰기 정책 (장바구니)
CREATE POLICY "Enable insert for all users" ON carts FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON carts FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON carts FOR DELETE USING (true);

CREATE POLICY "Enable insert for all users" ON cart_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON cart_items FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON cart_items FOR DELETE USING (true);
```

## 🎯 완료 후 확인사항
1. 프로젝트가 정상적으로 생성되었는지 확인
2. API 키가 올바르게 설정되었는지 확인
3. 데이터베이스 테이블이 생성되었는지 확인
4. 로컬 개발 서버에서 연결 테스트