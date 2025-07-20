# 내일 작업 계획서
**날짜:** 2025-07-18 (예정)  
**상황:** 장바구니 기능 디버깅 진행 중, 배포 문제로 중단

## 🚨 현재 상황 간단 요약
- 장바구니 담기 여전히 작동 안함 (사용자 체감)
- 주문하기 페이지 새로운 오류 발생  
- FTP 배포 실패로 수정사항 적용 불가
- 코드 수정은 완료되었으나 배포되지 않음

## 🎯 내일 해야 할 일 (우선순위별)

### 1. 긴급 - 배포 문제 해결 (30분)
**목표:** 수정된 코드를 실제 서버에 적용

#### Step 1: FTP 계정 상태 확인
```bash
# 호스팅거 관리자 패널 접속
# - FTP 계정 활성화 상태 확인
# - 패스워드 재설정 시도
# - IP 제한 설정 확인
```

#### Step 2: 대안 배포 방법 시도
```bash
# 방법 1: 파일매니저 직접 업로드
# 1. npm run build
# 2. dist 폴더를 zip으로 압축
# 3. 호스팅거 파일매니저에서 업로드
# 4. 서버에서 압축 해제

# 방법 2: 핵심 파일만 업로드
# - index.html
# - assets/index-[hash].js (메인 번들)
```

#### Step 3: 배포 확인
```bash
# 테스트 실행
node test-final-cart.mjs
```

### 2. 기술적 해결 - React Context 도입 (1시간)

#### Step 1: CartContext 생성
```typescript
// src/contexts/CartContext.tsx 생성
import { createContext, useContext, ReactNode } from 'react'
import { useCart } from '@/hooks/useCart'

interface CartContextType {
  items: CartItem[]
  itemsCount: number
  totalAmount: number  
  loading: boolean
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const cartState = useCart()
  return (
    <CartContext.Provider value={cartState}>
      {children}
    </CartContext.Provider>
  )
}

export function useCartContext() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider')
  }
  return context
}
```

#### Step 2: App.tsx에 Provider 추가
```typescript
// src/App.tsx 수정
import { CartProvider } from '@/contexts/CartContext'

function App() {
  return (
    <CartProvider>
      <Router>
        {/* 기존 코드 */}
      </Router>
    </CartProvider>
  )
}
```

#### Step 3: 컴포넌트에서 Context 사용
```typescript
// src/components/layout/Header.tsx
import { useCartContext } from '@/contexts/CartContext'

export function Header() {
  const { itemsCount } = useCartContext() // useCart() 대신
  // 나머지 코드...
}

// src/components/common/ProductCard.tsx  
import { useCartContext } from '@/contexts/CartContext'

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartContext() // useCart() 대신
  // 나머지 코드...
}
```

### 3. 검증 및 테스트 (30분)

#### 자동화 테스트 실행
```bash
# 장바구니 기능 전체 테스트
node test-final-cart.mjs

# 헤더 카운트 표시 테스트  
node test-header-count.mjs

# 사용자 관점 테스트
node urgent-cart-test.mjs
```

#### 수동 테스트 체크리스트
- [ ] 제품 페이지에서 장바구니 담기 클릭
- [ ] 헤더에 숫자 뱃지 표시 확인
- [ ] 헤더 장바구니 아이콘 클릭하여 드로어 열기
- [ ] 드로어에서 상품 목록 확인
- [ ] 주문하기 버튼으로 체크아웃 페이지 이동

### 4. 주문하기 페이지 오류 조사 (30분)

#### 오류 분석
```bash
# 1. 브라우저 개발자 도구에서 확인
# - Console 에러 메시지
# - Network 탭에서 실패한 요청
# - React Developer Tools로 컴포넌트 상태

# 2. CheckoutPage 컴포넌트 점검
# - src/pages/CheckoutPage.tsx 파일 확인
# - 라우팅 설정 점검 (main.tsx, App.tsx)
# - 관련 훅/컨텍스트 의존성 확인
```

#### 가능한 원인들
1. **라우팅 문제**: React Router 설정 오류
2. **의존성 문제**: useCart, useAuth 등 훅 의존성
3. **빌드 문제**: 컴포넌트 번들링 오류
4. **상태 관리**: 장바구니 상태 접근 오류

## 🛠️ 사용할 파일들

### 수정할 파일들
```
src/
├── contexts/CartContext.tsx (신규 생성)
├── App.tsx (Provider 추가)
├── components/layout/Header.tsx (Context 사용)
├── components/common/ProductCard.tsx (Context 사용)
└── pages/CheckoutPage.tsx (오류 조사 및 수정)
```

### 테스트 파일들
```
test-scripts/
├── test-final-cart.mjs
├── test-header-count.mjs  
├── urgent-cart-test.mjs
└── debug-checkout-page.mjs (필요시 신규 생성)
```

## 📋 체크리스트

### 배포 전 확인사항
- [ ] `npm run build` 성공 확인
- [ ] `dist` 폴더 생성 확인  
- [ ] 빌드 결과물 크기 정상 확인

### 배포 후 확인사항
- [ ] 사이트 접속 정상 확인
- [ ] 콘솔 에러 없음 확인
- [ ] 장바구니 기능 테스트
- [ ] 주문하기 페이지 접속 확인

### Context 도입 후 확인사항
- [ ] 헤더 카운트 정상 표시
- [ ] 다중 상품 추가 시 카운트 증가
- [ ] 장바구니 드로어 내용 일치
- [ ] 페이지 새로고침 후 상태 유지

## 🚨 주의사항

### 백업 필수
```bash
# 중요 파일 백업
cp src/App.tsx src/App.tsx.backup
cp src/components/layout/Header.tsx src/components/layout/Header.tsx.backup  
cp src/components/common/ProductCard.tsx src/components/common/ProductCard.tsx.backup
```

### 단계별 테스트
- 각 수정 후 즉시 테스트 실행
- 문제 발생 시 이전 단계로 롤백
- git commit으로 단계별 저장

### 사용자 영향 최소화
- 배포 시간을 사용량 적은 시간대 선택
- 문제 발생 시 즉시 이전 버전으로 롤백 준비

## 🎯 성공 기준

### 최소 목표 (반드시 달성)
- 장바구니 담기 버튼 정상 작동
- 헤더 카운트 표시

### 이상적 목표
- 전체 e-commerce 플로우 정상 작동
- 모든 자동화 테스트 통과
- 성능 저하 없음

## 📞 문제 발생 시 대응 방안

### 배포 실패 시
1. 파일매니저 직접 업로드 시도
2. 호스팅 업체 고객센터 문의
3. 대안 호스팅 서비스 검토

### Context 도입 실패 시  
1. 기존 useCart 방식으로 롤백
2. 다른 상태 관리 라이브러리 검토 (Zustand)
3. Custom Event 방식으로 대안 구현

### 주문하기 페이지 오류 심화 시
1. 해당 페이지 일시 비활성화
2. 간단한 연락처 안내 페이지로 대체
3. 기본 기능부터 단계적 복구

---

**내일 첫 번째 할 일:** 호스팅거 관리자 패널 접속하여 FTP 상태 확인

**예상 소요 시간:** 총 2-3시간

**성공 확률:** 80% (기술적 해결책은 준비되어 있음, 배포만 해결하면 됨)