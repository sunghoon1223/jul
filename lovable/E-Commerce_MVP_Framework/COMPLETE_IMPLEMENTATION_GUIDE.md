# 🚀 E-Commerce MVP 완전 구현 가이드

## 📋 개요

이 가이드는 검증된 성공 패턴을 기반으로 한 완전한 이커머스 MVP 구현 방법을 제공합니다. 모든 단계는 실제 프로덕션 환경에서 검증되었습니다.

## 🎯 개발 플로우 (검증된 최적 순서)

### Phase 1: Supabase 백엔드 구축 (30분)
```bash
# 1. Supabase 프로젝트 생성
supabase init your-project
cd your-project

# 2. 데이터베이스 스키마 적용
supabase start
supabase db push

# 3. 환경 변수 설정
cp .env.example .env.local
# SUPABASE_URL과 ANON_KEY 설정
```

**핵심 성공 요소:**
- 반드시 RLS 정책을 먼저 설정하세요
- 인덱스를 적절히 설정하여 성능을 보장하세요
- 외래키 관계를 정확히 설정하세요

### Phase 2: v0.dev UI 프로토타이핑 (2-3시간)
```bash
# v0.dev에서 컴포넌트별 프롬프트 사용
# 1. 홈페이지 → 2. 제품 목록 → 3. 제품 상세 → 4. 장바구니 → 5. 관리자
```

**핵심 성공 요소:**
- `development-flow/05_v0_prompts_collection.md`의 프롬프트를 정확히 사용하세요
- 디자인 시스템을 일관되게 유지하세요
- shadcn/ui 컴포넌트를 적극 활용하세요

### Phase 3: React 프로젝트 통합 (4-6시간)
```bash
# 1. Vite React 프로젝트 생성
npm create vite@latest my-ecommerce -- --template react-ts
cd my-ecommerce

# 2. 필수 의존성 설치
npm install @supabase/supabase-js @radix-ui/react-* tailwindcss
npm install react-router-dom @tanstack/react-query

# 3. 소스 코드 템플릿 복사
cp -r src-template/* src/
```

**핵심 성공 요소:**
- 서비스 레이어 패턴을 사용하세요 (`cartService.ts`, `orderService.ts`)
- Context + Custom Hooks로 상태 관리하세요
- TypeScript 인터페이스를 정확히 정의하세요

## 📁 프로젝트 구조 (최적화된 패턴)

```
my-ecommerce/
├── src/
│   ├── components/          # 재사용 가능한 컴포넌트
│   │   ├── ui/             # shadcn/ui 컴포넌트
│   │   ├── layout/         # Header, Footer 등
│   │   ├── product/        # 제품 관련 컴포넌트
│   │   └── cart/           # 장바구니 컴포넌트
│   ├── hooks/              # 커스텀 훅
│   │   ├── useAuth.ts      # 인증 훅
│   │   ├── useCart.ts      # 장바구니 훅
│   │   └── useProducts.ts  # 제품 훅
│   ├── services/           # 비즈니스 로직
│   │   ├── cartService.ts  # 장바구니 서비스
│   │   └── orderService.ts # 주문 서비스
│   ├── types/              # TypeScript 타입
│   ├── pages/              # 페이지 컴포넌트
│   └── lib/                # 유틸리티
├── public/
│   ├── images/             # 제품 이미지
│   └── data/               # 정적 데이터
└── config files
```

## 🔧 필수 설정 파일들

### 1. `vite.config.ts` (성능 최적화)
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
        }
      }
    }
  }
})
```

### 2. `package.json` (검증된 의존성)
핵심 의존성만 포함된 최적화된 구성:
- React 18.3.1 + TypeScript 5.5.3
- Vite 5.4.1 (빠른 빌드)
- Tailwind CSS 3.4.11 + shadcn/ui
- Supabase 2.50.3 (안정된 버전)

## 🗄️ 데이터베이스 설계

### 핵심 테이블 구조:
1. **categories** - 제품 카테고리
2. **products** - 제품 정보 (JSONB 활용)
3. **cart_items** - 장바구니 (로그인/비로그인 지원)
4. **orders** - 주문 정보
5. **order_items** - 주문 상세
6. **profiles** - 사용자 프로필
7. **notices** - 공지사항

자세한 스키마는 `development-flow/02_database_schema_detailed.md` 참조

## 🚀 단계별 구현 가이드

### 1단계: 기본 환경 설정
```bash
# 프로젝트 생성
npm create vite@latest my-ecommerce -- --template react-ts
cd my-ecommerce

# 패키지 설치
npm install

# 환경 설정
cp config-templates/.env.example .env.local
cp config-templates/vite.config.ts .
cp config-templates/tailwind.config.ts .
```

### 2단계: Supabase 연동
```bash
# Supabase 설정
npm install @supabase/supabase-js
```

`src/lib/supabase.ts` 생성:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)
```

### 3단계: 핵심 컴포넌트 구현
1. **인증 시스템** (`useAuth.ts`)
2. **제품 목록** (`useProducts.ts`)
3. **장바구니** (`useCart.ts`)
4. **주문 시스템** (`orderService.ts`)

### 4단계: UI 컴포넌트 통합
1. v0.dev에서 생성한 컴포넌트들을 복사
2. shadcn/ui로 일관된 디자인 시스템 구축
3. 반응형 디자인 적용

## 🎨 디자인 시스템

### 색상 팔레트:
- Primary: Navy Blue (#1e3a8a)
- Accent: Amber/Yellow (#f59e0b)
- Neutral: Gray 계열
- Success: Green (#10b981)
- Error: Red (#ef4444)

### 타이포그래피:
- Font: Inter (primary)
- H1: 2.5rem, H2: 2rem, H3: 1.5rem
- Body: 1rem, Small: 0.875rem

## 🔐 인증 시스템

### 설정 방법:
```typescript
// src/hooks/useAuth.ts
const USE_MOCK_AUTH = false // 프로덕션에서는 false

// Supabase 인증 활성화
export const useAuth = () => {
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )
    
    return () => subscription.unsubscribe()
  }, [])
  
  return { user, signIn, signUp, signOut }
}
```

## 🛒 장바구니 시스템

### 핵심 기능:
- 로그인/비로그인 사용자 지원
- 세션 기반 임시 저장
- 실시간 수량 업데이트
- 재고 확인

### 구현 패턴:
```typescript
// src/services/cartService.ts
export const cartService = {
  async addItem(productId: string, quantity: number) {
    // 로그인 사용자와 비로그인 사용자 분기 처리
    // 재고 확인 후 추가
  },
  
  async updateQuantity(itemId: string, quantity: number) {
    // 수량 업데이트 및 유효성 검사
  },
  
  async removeItem(itemId: string) {
    // 아이템 삭제
  }
}
```

## 📦 주문 시스템

### 주문 플로우:
1. 장바구니 확인
2. 배송 정보 입력
3. 결제 정보 입력
4. 주문 생성
5. 재고 차감
6. 주문 확인

## 🚀 배포 가이드

### Vercel 배포:
```bash
# 빌드 테스트
npm run build

# Vercel 배포
npx vercel
```

### Netlify 배포:
```bash
# 빌드 설정
build command: npm run build
publish directory: dist
```

## ⚡ 성능 최적화

### 1. 이미지 최적화
- WebP 형식 사용
- 지연 로딩 적용
- 적절한 크기 리사이징

### 2. 코드 스플리팅
```typescript
// 라우트별 지연 로딩
const ProductPage = lazy(() => import('./pages/ProductPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
```

### 3. 캐싱 전략
- React Query로 서버 상태 캐싱
- 로컬 스토리지로 사용자 설정 저장

## 🐛 디버깅 가이드

### 자주 발생하는 문제들:

#### 1. 장바구니 아이템이 추가되지 않는 문제
```bash
# 해결: product_id 필드 확인
console.log('Adding to cart:', { product_id: product.id, quantity })
```

#### 2. Supabase RLS 정책 오류
```sql
-- 해결: 정책 확인 및 수정
SELECT * FROM cart_items WHERE user_id = auth.uid();
```

#### 3. 이미지 로딩 실패
```typescript
// 해결: fallback 이미지 설정
<img 
  src={product.image_url} 
  onError={(e) => e.target.src = '/images/placeholder.svg'}
  alt={product.name}
/>
```

## 📚 참고 문서

1. **MASTER_BUILD_GUIDE.md** - 전체 빌드 프로세스
2. **BUILD_EXPERIENCES.md** - 실제 경험과 교훈
3. **AI_EXECUTION_GUIDE.md** - AI 개발 가이드
4. **DEBUGGING_GUIDE.md** - 문제 해결 방법
5. **PERFORMANCE_OPTIMIZATION_GUIDE.md** - 성능 최적화

## ✅ 체크리스트

### 개발 완료 체크리스트:
- [ ] Supabase 백엔드 구축 완료
- [ ] 인증 시스템 구현 완료
- [ ] 제품 목록/상세 페이지 완료
- [ ] 장바구니 기능 완료
- [ ] 주문 시스템 완료
- [ ] 관리자 대시보드 완료
- [ ] 반응형 디자인 완료
- [ ] 성능 최적화 완료
- [ ] 배포 준비 완료

### 배포 전 체크리스트:
- [ ] 모든 환경 변수 설정 확인
- [ ] 프로덕션 빌드 테스트
- [ ] 모바일 반응형 확인
- [ ] 브라우저 호환성 테스트
- [ ] 성능 측정 (Lighthouse)
- [ ] SEO 최적화 확인

## 🎉 결론

이 가이드를 따라하면 **2-3일 내에** 완전한 이커머스 MVP를 구축할 수 있습니다. 모든 패턴과 설정은 실제 프로덕션에서 검증되었으므로 안심하고 사용하세요.

**핵심 성공 요소:**
1. **순서를 정확히 따르세요** - Supabase → v0 → React 통합
2. **검증된 패턴을 사용하세요** - 서비스 레이어, Custom Hooks
3. **문서를 참조하세요** - 각 단계별 상세 가이드 활용
4. **성능을 고려하세요** - 코드 스플리팅, 이미지 최적화

이 프레임워크로 다양한 이커머스 프로젝트를 빠르게 개발할 수 있습니다!