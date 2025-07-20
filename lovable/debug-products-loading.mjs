import { chromium } from 'playwright'

console.log('🔍 제품 로딩 디버깅 시작...')

async function debugProductsLoading() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  })
  
  const page = await browser.newPage()
  
  // 네트워크 요청 모니터링
  const networkRequests = []
  page.on('request', request => {
    if (request.url().includes('supabase') || request.url().includes('products')) {
      networkRequests.push(`${request.method()} ${request.url()}`)
    }
  })
  
  // 응답 모니터링
  const networkResponses = []
  page.on('response', response => {
    if (response.url().includes('supabase') || response.url().includes('products')) {
      networkResponses.push(`${response.status()} ${response.url()}`)
    }
  })
  
  // 콘솔 로그 수집
  const consoleLogs = []
  page.on('console', msg => {
    consoleLogs.push(`${msg.type()}: ${msg.text()}`)
  })
  
  try {
    console.log('1. 홈페이지 접속...')
    await page.goto('http://localhost:8081/', { waitUntil: 'networkidle' })
    await page.waitForTimeout(5000)  // 더 오래 기다림
    
    console.log('2. 페이지 상태 확인...')
    await page.screenshot({ path: 'debug-page-state.png' })
    
    // 제품 데이터 로딩 상태 확인
    console.log('3. 제품 로딩 상태 확인...')
    
    // 로딩 스피너 확인
    const loadingSpinner = await page.locator('.animate-pulse, .loading, .spinner').count()
    console.log(`로딩 스피너 수: ${loadingSpinner}`)
    
    // 제품 카드 확인
    const productCards = await page.locator('.product-card, [data-testid="product-card"]').count()
    console.log(`제품 카드 수: ${productCards}`)
    
    // 오류 메시지 확인
    const errorMessages = await page.locator('text=오류, text=Error, text=Failed').count()
    console.log(`오류 메시지 수: ${errorMessages}`)
    
    // 제품 이름 확인
    const productNames = await page.locator('text=/캐스터|휠|모듈|AGV/').count()
    console.log(`제품 이름 수: ${productNames}`)
    
    // 가격 확인
    const prices = await page.locator('text=/₩|원|,/').count()
    console.log(`가격 표시 수: ${prices}`)
    
    // "담기" 버튼 확인
    const addButtons = await page.locator('button:has-text("담기"), button:has-text("Add to Cart")').count()
    console.log(`"담기" 버튼 수: ${addButtons}`)
    
    if (addButtons > 0) {
      console.log('4. 장바구니 추가 테스트...')
      
      // 첫 번째 "담기" 버튼 클릭
      await page.locator('button:has-text("담기")').first().click()
      await page.waitForTimeout(2000)
      
      // 토스트 메시지 확인
      const toastMessages = await page.locator('.toast, .sonner-toast, [data-testid="toast"]').count()
      console.log(`토스트 메시지 수: ${toastMessages}`)
      
      // 장바구니 카운트 확인
      const cartCount = await page.locator('.cart-count, [data-testid="cart-count"]').count()
      console.log(`장바구니 카운트 표시 수: ${cartCount}`)
      
      await page.screenshot({ path: 'debug-cart-add.png' })
      
      console.log('5. 장바구니 드로어 테스트...')
      
      // 장바구니 버튼 클릭
      await page.locator('button:has(.lucide-shopping-cart)').first().click()
      await page.waitForTimeout(2000)
      
      // 장바구니 드로어 확인
      const cartDrawer = await page.locator('.drawer-content, [data-testid="cart-drawer"]').count()
      console.log(`장바구니 드로어 수: ${cartDrawer}`)
      
      if (cartDrawer > 0) {
        // 장바구니 아이템 확인
        const cartItems = await page.locator('.cart-item, [data-testid="cart-item"]').count()
        console.log(`장바구니 아이템 수: ${cartItems}`)
        
        await page.screenshot({ path: 'debug-cart-drawer.png' })
        
        if (cartItems > 0) {
          console.log('✅ 장바구니 기능 정상 작동!')
          return true
        } else {
          console.log('⚠️  장바구니 드로어는 열렸지만 아이템이 없음')
        }
      } else {
        console.log('❌ 장바구니 드로어가 열리지 않음')
      }
    } else {
      console.log('❌ "담기" 버튼을 찾을 수 없음 - 제품 로딩 실패')
    }
    
    return false
    
  } catch (error) {
    console.error('❌ 디버깅 중 오류:', error.message)
    await page.screenshot({ path: 'debug-error.png' })
    return false
  } finally {
    console.log('\n=== 디버깅 결과 ===')
    
    console.log('\n네트워크 요청:')
    networkRequests.forEach(req => console.log(`  ${req}`))
    
    console.log('\n네트워크 응답:')
    networkResponses.forEach(res => console.log(`  ${res}`))
    
    console.log('\n콘솔 로그 (중요한 것만):')
    const importantLogs = consoleLogs.filter(log => 
      log.includes('products') || log.includes('error') || log.includes('supabase') || 
      log.includes('cart') || log.includes('loading') || log.includes('fetch')
    )
    
    importantLogs.forEach(log => console.log(`  ${log}`))
    
    await browser.close()
  }
}

debugProductsLoading().then(success => {
  console.log('\n=== 디버깅 완료 ===')
  console.log('결과:', success ? '✅ 성공' : '❌ 실패')
  process.exit(success ? 0 : 1)
})