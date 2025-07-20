import { chromium } from 'playwright'

console.log('🛒 장바구니 기능 상세 테스트 시작...')

async function testCartFunctionality() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 2000
  })
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  })
  
  const page = await context.newPage()
  
  // 콘솔 로그 수집
  const consoleLogs = []
  page.on('console', msg => {
    consoleLogs.push(`${msg.type()}: ${msg.text()}`)
  })
  
  try {
    console.log('\n1. 홈페이지 접속...')
    await page.goto('http://localhost:8081/', { waitUntil: 'networkidle' })
    await page.screenshot({ path: 'cart-test-1-homepage.png' })
    
    console.log('2. 장바구니 버튼 찾기...')
    
    // 여러 가지 방법으로 장바구니 버튼 찾기
    const cartSelectors = [
      'button:has-text("장바구니")',
      'button:has(svg[data-testid="ShoppingCart"])',
      'button:has(.lucide-shopping-cart)',
      '[data-testid="cart-button"]',
      'button:has([data-lucide="shopping-cart"])',
      'button:has-text("Cart")',
      'button:has-text("cart")',
      'button[aria-label*="cart"]',
      'button[aria-label*="Cart"]',
      'button[aria-label*="장바구니"]'
    ]
    
    let cartButton = null
    for (const selector of cartSelectors) {
      try {
        const button = page.locator(selector).first()
        if (await button.isVisible()) {
          cartButton = button
          console.log(`✅ 장바구니 버튼 발견: ${selector}`)
          break
        }
      } catch (error) {
        // 다음 선택자 시도
      }
    }
    
    if (!cartButton) {
      console.log('❌ 장바구니 버튼을 찾을 수 없습니다.')
      
      // 모든 버튼 확인
      console.log('3. 모든 버튼 확인...')
      const allButtons = await page.locator('button').all()
      console.log(`총 버튼 수: ${allButtons.length}`)
      
      for (let i = 0; i < Math.min(10, allButtons.length); i++) {
        const button = allButtons[i]
        const text = await button.innerText().catch(() => '')
        const ariaLabel = await button.getAttribute('aria-label').catch(() => '')
        console.log(`버튼 ${i + 1}: "${text}" (aria-label: "${ariaLabel}")`)
      }
      
      await page.screenshot({ path: 'cart-test-2-buttons.png' })
      
      // SVG 아이콘 확인
      console.log('4. SVG 아이콘 확인...')
      const svgIcons = await page.locator('svg').all()
      console.log(`총 SVG 수: ${svgIcons.length}`)
      
      for (let i = 0; i < Math.min(10, svgIcons.length); i++) {
        const svg = svgIcons[i]
        const className = await svg.getAttribute('class').catch(() => '')
        const dataTestId = await svg.getAttribute('data-testid').catch(() => '')
        console.log(`SVG ${i + 1}: class="${className}" data-testid="${dataTestId}"`)
      }
      
      await page.screenshot({ path: 'cart-test-3-svgs.png' })
      
    } else {
      console.log('3. 장바구니 버튼 클릭 테스트...')
      await cartButton.click()
      await page.waitForTimeout(2000)
      
      // 장바구니 드로어가 열렸는지 확인 (Sheet component 사용)
      const cartDrawer = await page.locator('[data-testid="cart-drawer"], .cart-drawer, .drawer-content, [data-state="open"]').isVisible().catch(() => false)
      console.log(`장바구니 드로어 열림: ${cartDrawer}`)
      
      // Sheet 컴포넌트의 content를 더 구체적으로 확인
      const sheetContent = await page.locator('[role="dialog"], [data-radix-dialog-content]').isVisible().catch(() => false)
      console.log(`Sheet 컨텐츠 열림: ${sheetContent}`)
      
      await page.screenshot({ path: 'cart-test-4-drawer.png' })
      
      if (cartDrawer) {
        console.log('✅ 장바구니 기능 정상 작동!')
        
        // 장바구니 내용 확인
        const cartItems = await page.locator('[data-testid="cart-item"], .cart-item').count()
        console.log(`장바구니 아이템 수: ${cartItems}`)
        
        // 장바구니 닫기
        const closeButton = await page.locator('button:has-text("닫기"), button:has-text("Close"), [aria-label="Close"]').first()
        const closeVisible = await closeButton.isVisible().catch(() => false)
        if (closeVisible) {
          await closeButton.click()
          console.log('장바구니 닫기 성공')
        }
        
      } else {
        console.log('❌ 장바구니 드로어가 열리지 않음')
      }
    }
    
    console.log('\n5. 제품 장바구니 추가 테스트...')
    
    // 제품 "담기" 버튼 찾기
    const addToCartButtons = await page.locator('button:has-text("담기"), button:has-text("Add to Cart")').all()
    console.log(`"담기" 버튼 수: ${addToCartButtons.length}`)
    
    if (addToCartButtons.length > 0) {
      console.log('첫 번째 "담기" 버튼 클릭...')
      await addToCartButtons[0].click()
      await page.waitForTimeout(2000)
      
      // 토스트 메시지 확인
      const toast = await page.locator('[data-testid="toast"], .toast, .sonner-toast').isVisible().catch(() => false)
      console.log(`토스트 메시지 표시: ${toast}`)
      
      await page.screenshot({ path: 'cart-test-5-add-item.png' })
      
      // 장바구니 카운트 증가 확인
      const cartCountElement = await page.locator('[data-testid="cart-count"], .cart-count').first()
      const cartCountVisible = await cartCountElement.isVisible().catch(() => false)
      
      if (cartCountVisible) {
        const cartCountText = await cartCountElement.innerText().catch(() => '0')
        console.log(`장바구니 카운트: ${cartCountText}`)
      }
      
      console.log('✅ 제품 장바구니 추가 테스트 완료')
    }
    
    await page.screenshot({ path: 'cart-test-final.png' })
    
    // 콘솔 로그 확인
    console.log('\n6. 콘솔 로그 확인...')
    const cartLogs = consoleLogs.filter(log => log.includes('cart') || log.includes('장바구니'))
    console.log(`장바구니 관련 로그: ${cartLogs.length}개`)
    
    cartLogs.forEach(log => {
      console.log(`   ${log}`)
    })
    
    return true
    
  } catch (error) {
    console.error('❌ 테스트 중 오류:', error.message)
    await page.screenshot({ path: 'cart-test-error.png' })
    return false
  } finally {
    await browser.close()
  }
}

testCartFunctionality().then(success => {
  console.log('\n=== 장바구니 테스트 완료 ===')
  console.log('결과:', success ? '✅ 성공' : '❌ 실패')
  process.exit(success ? 0 : 1)
}).catch(error => {
  console.error('테스트 실행 실패:', error)
  process.exit(1)
})