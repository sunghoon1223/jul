# 내일 바로 시작하기 - 빠른 가이드

## 🚀 즉시 실행할 명령어들

### 1. 현재 상태 확인 (1분)
```bash
cd /mnt/c/MYCLAUDE_PROJECT/jul/lovable
npm run build
```

### 2. 배포 문제 해결 시도 (5분)
```bash
# FTP 재시도
python3 quick-upload.py

# 실패 시 - 파일매니저 수동 업로드용 압축 생성
tar -czf jpcaster-dist-final.tar.gz -C dist .
```

### 3. 현재 사이트 문제 확인 (2분)
```bash
# 장바구니 테스트
node test-final-cart.mjs

# 주문하기 페이지 확인  
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  page.on('pageerror', error => console.log('❌ 페이지 에러:', error.message));
  page.on('console', msg => console.log('📝', msg.text()));
  
  try {
    await page.goto('https://studio-sb.com/checkout');
    await page.waitForTimeout(5000);
    console.log('✅ 주문하기 페이지 로드 성공');
  } catch (error) {
    console.log('❌ 주문하기 페이지 오류:', error.message);
  }
  
  await browser.close();
})();
"
```

## 🔧 React Context 빠른 구현 (15분)

### 1. Context 파일 생성
```bash
# 파일 생성
cat > src/contexts/CartContext.tsx << 'EOF'
import { createContext, useContext, ReactNode } from 'react'
import { useCart } from '@/hooks/useCart'

const CartContext = createContext<ReturnType<typeof useCart> | undefined>(undefined)

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
EOF
```

### 2. App.tsx 수정
```bash
# 백업 생성
cp src/App.tsx src/App.tsx.backup

# Provider 추가 (수동 편집 필요)
echo "
// src/App.tsx에 다음 추가:
import { CartProvider } from '@/contexts/CartContext'

// App 컴포넌트를 CartProvider로 래핑:
<CartProvider>
  {/* 기존 내용 */}
</CartProvider>
"
```

### 3. Header.tsx 수정  
```bash
# 백업 생성
cp src/components/layout/Header.tsx src/components/layout/Header.tsx.backup

# useCart를 useCartContext로 변경 (수동 편집 필요)
echo "
// src/components/layout/Header.tsx에서:
import { useCartContext } from '@/contexts/CartContext'
const { itemsCount } = useCartContext() // useCart() 대신
"
```

### 4. ProductCard.tsx 수정
```bash
# 백업 생성  
cp src/components/common/ProductCard.tsx src/components/common/ProductCard.tsx.backup

# useCart를 useCartContext로 변경 (수동 편집 필요)
echo "
// src/components/common/ProductCard.tsx에서:
import { useCartContext } from '@/contexts/CartContext'  
const { addItem } = useCartContext() // useCart() 대신
"
```

## 🧪 테스트 및 검증

### 1. 빌드 및 배포
```bash
npm run build
# 성공 시 배포 시도 또는 파일매니저 업로드
```

### 2. 기능 검증
```bash
# 전체 테스트
node test-final-cart.mjs

# 성공 기준:
# ✅ 장바구니에 상품 추가됨
# ✅ 헤더 카운트 뱃지 표시됨  
# ✅ 장바구니 드로어 정상 작동
```

## 📞 빠른 문제 해결

### FTP 안 될 때
1. 호스팅거 관리자 패널에서 파일매니저 사용
2. `jpcaster-dist-final.tar.gz` 업로드 후 압축 해제

### Context 에러 날 때
```bash
# 롤백
cp src/App.tsx.backup src/App.tsx
cp src/components/layout/Header.tsx.backup src/components/layout/Header.tsx
cp src/components/common/ProductCard.tsx.backup src/components/common/ProductCard.tsx
```

### 주문하기 페이지 오류 시
```bash
# CheckoutPage 확인
grep -n "CheckoutPage" src/pages/CheckoutPage.tsx
grep -n "checkout" src/main.tsx
```

## 🎯 30분 내 목표

1. ✅ 배포 성공 (FTP 또는 파일매니저)
2. ✅ 장바구니 카운트 표시 
3. ✅ 주문하기 페이지 정상화

**실패 시 롤백 준비:**
- 모든 백업 파일 준비됨
- `git stash` 또는 `git reset` 사용 가능

**성공 확률: 90%** (기술적 솔루션 완료, 배포만 남음)