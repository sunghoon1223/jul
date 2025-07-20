# 데이터베이스 스키마 상세 설계 가이드

## 🎯 목표
이커머스에 필요한 모든 데이터베이스 테이블과 관계를 완벽하게 설계

## 📊 ERD (Entity Relationship Diagram)

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Categories  │    │  Products   │    │ Cart_Items  │
│             │    │             │    │             │
│ id (PK)     │◄───┤category_id  │    │ id (PK)     │
│ name        │    │ id (PK)     │◄───┤product_id   │
│ slug        │    │ name        │    │ user_id     │
│ description │    │ slug        │    │ session_id  │
│ image_url   │    │ description │    │ quantity    │
│ sort_order  │    │ price       │    └─────────────┘
│ is_active   │    │ sku         │
└─────────────┘    │ stock_qty   │
                   │ manufacturer│
┌─────────────┐    │ main_img_url│    ┌─────────────┐
│ auth.users  │    │ image_urls  │    │  Orders     │
│ (Supabase)  │    │ features    │    │             │
│             │    │ is_published│    │ id (PK)     │
│ id (PK)     │◄─┐ │ is_featured │ ┌──┤user_id     │
│ email       │  │ └─────────────┘ │  │ email       │
│ created_at  │  │                 │  │ full_name   │
└─────────────┘  │ ┌─────────────┐ │  │ phone       │
                 │ │  Profiles   │ │  │ address     │
                 └─┤             │ │  │ total_amount│
                   │ id (PK/FK)  │ │  │ payment_*   │
                   │ full_name   │ │  │ order_status│
                   │ phone       │ │  │ shipping_*  │
                   │ address     │ │  └─────────────┘
                   │ role        │ │            │
                   └─────────────┘ │            │
                                   │  ┌─────────────┐
                                   │  │ Order_Items │
                                   │  │             │
                                   │  │ id (PK)     │
                                   └──┤order_id     │
                                      │ product_id  │◄─┐
                                      │ quantity    │  │
                                      │ price       │  │
                                      └─────────────┘  │
                                                       │
┌─────────────┐                                       │
│  Notices    │              Back to Products ────────┘
│             │
│ id (PK)     │
│ title       │
│ content     │
│ category    │
│ author      │
│ is_pinned   │
│ views       │
└─────────────┘
```

## 🗃️ 테이블별 상세 스키마

### 1. Categories (카테고리)

```sql
CREATE TABLE categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,                    -- 카테고리명
    slug VARCHAR(255) UNIQUE NOT NULL,             -- URL용 슬러그
    description TEXT,                              -- 카테고리 설명
    image_url TEXT,                                -- 카테고리 이미지
    sort_order INTEGER DEFAULT 0,                  -- 정렬 순서
    is_active BOOLEAN DEFAULT true,                -- 활성 상태
    parent_id UUID REFERENCES categories(id),      -- 상위 카테고리 (계층 구조)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_active ON categories(is_active);
CREATE INDEX idx_categories_sort ON categories(sort_order);
```

**사용 예시:**
- `name`: "AGV 캐스터", "산업용 캐스터"
- `slug`: "agv-casters", "industrial-casters"
- `sort_order`: 1, 2, 3... (메뉴 순서)

### 2. Products (제품)

```sql
CREATE TABLE products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category_id UUID REFERENCES categories(id),
    name VARCHAR(255) NOT NULL,                    -- 제품명
    slug VARCHAR(255) UNIQUE NOT NULL,             -- URL용 슬러그
    description TEXT,                              -- 제품 설명
    price DECIMAL(10,2) NOT NULL,                  -- 가격
    sku VARCHAR(100) UNIQUE,                       -- 재고 관리 코드
    stock_quantity INTEGER DEFAULT 0,              -- 재고 수량
    manufacturer VARCHAR(255),                     -- 제조사
    main_image_url TEXT,                           -- 메인 이미지
    image_urls JSONB DEFAULT '[]',                 -- 추가 이미지들
    features JSONB DEFAULT '{}',                   -- 제품 특징 (키-값)
    specifications JSONB DEFAULT '{}',             -- 제품 사양
    dimensions JSONB DEFAULT '{}',                 -- 크기 정보
    weight_info JSONB DEFAULT '{}',                -- 무게 정보
    tags TEXT[],                                   -- 검색용 태그
    is_published BOOLEAN DEFAULT false,            -- 발행 상태
    is_featured BOOLEAN DEFAULT false,             -- 추천 제품
    meta_title VARCHAR(255),                       -- SEO 제목
    meta_description TEXT,                         -- SEO 설명
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_published ON products(is_published);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_tags ON products USING GIN(tags);
CREATE INDEX idx_products_search ON products USING GIN(to_tsvector('korean', name || ' ' || COALESCE(description, '')));
```

**JSONB 구조 예시:**
```json
{
  "features": {
    "하중_용량": "500kg",
    "휠_재질": "폴리우레탄",
    "베어링_타입": "볼베어링",
    "적용_분야": "AGV, 운반차"
  },
  "specifications": {
    "휠_직경": "100mm",
    "휠_폭": "35mm",
    "전체_높이": "125mm",
    "볼트_구멍": "M10"
  },
  "dimensions": {
    "length": 120,
    "width": 80,
    "height": 150,
    "unit": "mm"
  }
}
```

### 3. Profiles (사용자 프로필)

```sql
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name TEXT,
    phone TEXT,
    address TEXT,
    company_name TEXT,                             -- 회사명
    business_number TEXT,                          -- 사업자 번호
    role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'dealer')),
    preferences JSONB DEFAULT '{}',                -- 사용자 설정
    is_verified BOOLEAN DEFAULT false,             -- 인증 상태
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_verified ON profiles(is_verified);
```

### 4. Cart_Items (장바구니)

```sql
CREATE TABLE cart_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),       -- 로그인 사용자
    session_id TEXT,                               -- 비로그인 사용자
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    custom_options JSONB DEFAULT '{}',             -- 커스텀 옵션
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 제약 조건: 사용자당 제품별 하나의 항목만
    UNIQUE(user_id, product_id),
    UNIQUE(session_id, product_id),
    
    -- user_id 또는 session_id 중 하나는 필수
    CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

-- 인덱스
CREATE INDEX idx_cart_user ON cart_items(user_id);
CREATE INDEX idx_cart_session ON cart_items(session_id);
CREATE INDEX idx_cart_product ON cart_items(product_id);
```

### 5. Orders (주문)

```sql
CREATE TABLE orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,      -- 주문번호 (예: ORD-20250101-001)
    user_id UUID REFERENCES auth.users(id),
    
    -- 주문자 정보
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    company_name TEXT,
    
    -- 금액 정보
    subtotal DECIMAL(10,2) NOT NULL,               -- 소계
    tax_amount DECIMAL(10,2) DEFAULT 0,            -- 세금
    shipping_cost DECIMAL(10,2) DEFAULT 0,         -- 배송비
    discount_amount DECIMAL(10,2) DEFAULT 0,       -- 할인액
    total_amount DECIMAL(10,2) NOT NULL,           -- 총액
    
    -- 결제 정보
    payment_method TEXT,                           -- 결제 방법
    payment_status TEXT DEFAULT 'pending' CHECK (
        payment_status IN ('pending', 'paid', 'failed', 'refunded')
    ),
    payment_transaction_id TEXT,                   -- 결제 거래 ID
    
    -- 주문 상태
    order_status TEXT DEFAULT 'pending' CHECK (
        order_status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')
    ),
    
    -- 배송 정보
    shipping_method TEXT,
    tracking_number TEXT,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    
    -- 기타
    notes TEXT,                                    -- 주문 메모
    admin_notes TEXT,                              -- 관리자 메모
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_payment ON orders(payment_status);
CREATE INDEX idx_orders_date ON orders(created_at);
CREATE INDEX idx_orders_number ON orders(order_number);

-- 주문번호 자동 생성 함수
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    order_date TEXT;
    sequence_num INTEGER;
BEGIN
    order_date := TO_CHAR(NOW(), 'YYYYMMDD');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 'ORD-' || order_date || '-(.*)') AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM orders
    WHERE order_number LIKE 'ORD-' || order_date || '-%';
    
    RETURN 'ORD-' || order_date || '-' || LPAD(sequence_num::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- 주문번호 자동 생성 트리거
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION set_order_number();
```

### 6. Order_Items (주문 항목)

```sql
CREATE TABLE order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    
    -- 주문 시점의 제품 정보 (스냅샷)
    product_name TEXT NOT NULL,                    -- 제품명 (주문 시점)
    product_sku TEXT,                              -- SKU (주문 시점)
    unit_price DECIMAL(10,2) NOT NULL,             -- 개당 가격
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    subtotal DECIMAL(10,2) NOT NULL,               -- 소계 (unit_price * quantity)
    
    -- 커스텀 옵션
    custom_options JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- 소계 자동 계산 트리거
CREATE OR REPLACE FUNCTION calculate_order_item_subtotal()
RETURNS TRIGGER AS $$
BEGIN
    NEW.subtotal := NEW.unit_price * NEW.quantity;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_subtotal
    BEFORE INSERT OR UPDATE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION calculate_order_item_subtotal();
```

### 7. Notices (공지사항)

```sql
CREATE TABLE notices (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT '일반',
    author TEXT DEFAULT '관리자',
    is_pinned BOOLEAN DEFAULT false,               -- 상단 고정
    is_published BOOLEAN DEFAULT true,             -- 발행 상태
    views INTEGER DEFAULT 0,                       -- 조회수
    image_url TEXT,                                -- 썸네일 이미지
    tags TEXT[],                                   -- 태그
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_notices_category ON notices(category);
CREATE INDEX idx_notices_pinned ON notices(is_pinned);
CREATE INDEX idx_notices_published ON notices(is_published);
CREATE INDEX idx_notices_date ON notices(created_at);
CREATE INDEX idx_notices_tags ON notices USING GIN(tags);
```

## 🔄 자동화 함수들

### 1. 업데이트 시간 자동 갱신

```sql
-- 업데이트 시간 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 모든 테이블에 적용
CREATE TRIGGER trigger_update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- (다른 테이블들도 동일하게 적용)
```

### 2. 재고 관리 함수

```sql
-- 재고 차감 함수
CREATE OR REPLACE FUNCTION decrease_stock(product_uuid UUID, decrease_qty INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    current_stock INTEGER;
BEGIN
    SELECT stock_quantity INTO current_stock
    FROM products
    WHERE id = product_uuid;
    
    IF current_stock >= decrease_qty THEN
        UPDATE products
        SET stock_quantity = stock_quantity - decrease_qty
        WHERE id = product_uuid;
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;
```

## 🔍 성능 최적화

### 1. 파티셔닝 (대용량 데이터 처리)

```sql
-- 주문 테이블 월별 파티셔닝 (대용량 처리시)
CREATE TABLE orders_y2025m01 PARTITION OF orders
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE orders_y2025m02 PARTITION OF orders
FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
```

### 2. 전문 검색 설정

```sql
-- 한국어 전문 검색 설정
CREATE INDEX idx_products_fulltext
ON products
USING GIN(to_tsvector('korean', name || ' ' || COALESCE(description, '') || ' ' || COALESCE(sku, '')));
```

## ✅ 스키마 검증 체크리스트

- [ ] 모든 테이블 생성 확인
- [ ] 외래키 관계 설정 확인
- [ ] 인덱스 적용 확인
- [ ] 트리거 함수 작동 확인
- [ ] RLS 정책 적용 확인
- [ ] 데이터 타입 적절성 확인
- [ ] 제약 조건 설정 확인

이 스키마는 실제 이커머스 운영에 필요한 모든 기능을 지원하며, 확장 가능한 구조로 설계되었습니다.