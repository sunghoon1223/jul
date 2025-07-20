-- JP Caster MySQL Database Schema
-- Hostinger 호환 버전
-- 생성일: 2025-07-19

-- 데이터베이스 생성 (호스팅거 cPanel에서 수동 생성)
-- CREATE DATABASE jpcaster_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE jpcaster_db;

-- 1. 사용자 프로필 테이블
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    role ENUM('customer', 'admin') DEFAULT 'customer',
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_created_at (created_at)
);

-- 2. 카테고리 테이블
CREATE TABLE categories (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_slug (slug),
    INDEX idx_active (is_active),
    INDEX idx_sort (sort_order)
);

-- 3. 제품 테이블
CREATE TABLE products (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    category_id VARCHAR(36) NOT NULL,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    sku VARCHAR(50) UNIQUE,
    stock_quantity INT DEFAULT 0 CHECK (stock_quantity >= 0),
    manufacturer VARCHAR(100),
    main_image_url TEXT,
    image_urls JSON,
    features JSON,
    is_published BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    INDEX idx_category (category_id),
    INDEX idx_slug (slug),
    INDEX idx_published (is_published),
    INDEX idx_featured (is_featured),
    INDEX idx_sku (sku),
    INDEX idx_price (price)
);

-- 4. 장바구니 테이블
CREATE TABLE cart_items (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36),
    session_id VARCHAR(100),
    product_id VARCHAR(36) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_session (session_id),
    INDEX idx_product (product_id),
    UNIQUE KEY unique_user_product (user_id, product_id),
    UNIQUE KEY unique_session_product (session_id, product_id)
);

-- 5. 주문 테이블
CREATE TABLE orders (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36),
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    payment_method ENUM('credit_card', 'bank_transfer', 'kakao_pay', 'toss_pay') DEFAULT 'credit_card',
    payment_status ENUM('pending', 'paid', 'failed', 'cancelled', 'refunded') DEFAULT 'pending',
    order_status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    shipping_method ENUM('standard', 'express') DEFAULT 'standard',
    tracking_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_email (email),
    INDEX idx_payment_status (payment_status),
    INDEX idx_order_status (order_status),
    INDEX idx_created_at (created_at)
);

-- 6. 주문 아이템 테이블
CREATE TABLE order_items (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    order_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    product_price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    INDEX idx_order (order_id),
    INDEX idx_product (product_id)
);

-- 7. 결제 로그 테이블
CREATE TABLE payment_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    order_id VARCHAR(36) NOT NULL,
    pg_name VARCHAR(50) NOT NULL, -- 'iamport', 'toss', etc.
    pg_transaction_id VARCHAR(100),
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'success', 'failed', 'cancelled') NOT NULL,
    pg_response JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order (order_id),
    INDEX idx_status (status),
    INDEX idx_pg_transaction (pg_transaction_id)
);

-- 8. 공지사항 테이블
CREATE TABLE notices (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    category ENUM('notice', 'product', 'event', 'maintenance') DEFAULT 'notice',
    is_published BOOLEAN DEFAULT TRUE,
    is_pinned BOOLEAN DEFAULT FALSE,
    view_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_slug (slug),
    INDEX idx_category (category),
    INDEX idx_published (is_published),
    INDEX idx_pinned (is_pinned),
    INDEX idx_created_at (created_at)
);

-- 초기 카테고리 데이터 삽입
INSERT INTO categories (name, slug, description) VALUES
('AGV 캐스터', 'agv-casters', '무인 운반차량(AGV) 전용 고성능 캐스터'),
('장비용 캐스터', 'industrial-casters', '산업용 장비 및 기계용 고내구성 캐스터'),
('중하중 캐스터', 'heavy-duty-casters', '고하중 지지용 초중량 캐스터'),
('폴리우레탄 휠', 'polyurethane-wheels', '고성능 폴리우레탄 소재 휠 및 캐스터'),
('러버 휠', 'rubber-wheels', '고무 소재 휠 및 방진 캐스터'),
('메카넘 휠', 'mecanum-wheels', '360도 전방향 이동 가능한 메카넘 휠'),
('드라이빙 모듈', 'drive-modules', '모터 일체형 구동 모듈');

-- 초기 관리자 계정 생성 (비밀번호: admin123!)
INSERT INTO users (email, password_hash, full_name, role, email_verified) VALUES
('admin@jpcaster.co.kr', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'JP Caster 관리자', 'admin', TRUE);

-- 샘플 제품 데이터 삽입
INSERT INTO products (category_id, name, slug, description, price, sku, stock_quantity, manufacturer, main_image_url, features, is_published, is_featured) 
SELECT 
    c.id,
    'JP AGV 전용 캐스터 50mm',
    'jp-agv-exclusive-50mm',
    '무인 운반차량(AGV) 전용으로 설계된 고정밀 캐스터입니다. 자동화 시스템에 최적화되어 있으며, 정확한 위치 제어와 안정적인 구동력을 제공합니다.',
    220000.00,
    'JP-AGV-50',
    50,
    'JP Caster',
    '/images/ABUIABACGAAgiO7CoQYooebvrAYwoAY4oAY.jpg',
    JSON_OBJECT('하중용량', '300kg', '휠소재', 'AGV 전용 폴리우레탄', '베어링', '정밀 볼 베어링', '온도범위', '-10°C ~ +60°C'),
    TRUE,
    TRUE
FROM categories c WHERE c.slug = 'agv-casters';

-- 초기 공지사항 데이터
INSERT INTO notices (title, slug, content, category, is_published, is_pinned) VALUES
('설날 연휴 배송 및 고객센터 운영 안내', 'lunar-new-year-notice', 
'안녕하세요, JP CASTER 고객 여러분.\n\n설날 연휴 기간 중 배송 및 고객센터 운영 일정을 안내드립니다.\n\n■ 연휴 기간: 2025년 1월 28일(화) ~ 2월 2일(일)\n■ 배송 중단: 1월 29일 ~ 2월 1일\n■ 고객센터 휴무: 1월 29일 ~ 2월 1일\n\n연휴 기간 중 주문은 정상 접수되며, 2월 3일(월)부터 순차 배송됩니다.',
'notice', TRUE, TRUE),

('2025년 신제품 AGV 전용 캐스터 출시 안내', 'new-agv-caster-2025',
'안녕하세요, JP CASTER입니다.\n\n2025년 신제품으로 AGV(무인 운반차량) 전용 캐스터를 출시하게 되어 안내드립니다.\n\n■ 주요 특징\n- 정밀도 향상: ±0.1mm 위치 정확도\n- 내구성 강화: 수명 30% 향상\n- 소음 감소: 기존 대비 40% 소음 감소\n\n자세한 사양은 제품 페이지에서 확인하실 수 있습니다.',
'product', TRUE, FALSE);