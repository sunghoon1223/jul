import { chromium } from 'playwright'

console.log('🎯 종합 기능 테스트 시작...')

async function runComprehensiveTest() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1500
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
  
  const networkErrors = []
  page.on('requestfailed', request => {
    networkErrors.push(`Failed: ${request.url()} - ${request.failure().errorText}`)
  })
  
  const testResults = {
    homepage: false,
    productDisplay: false,
    cartAdd: false,
    cartDrawer: false,
    authModal: false,
    overall: false
  }
  
  try {
    console.log('\\n=== 1. 홈페이지 로딩 테스트 ===')
    await page.goto('http://localhost:8081/', { waitUntil: 'networkidle' })
    await page.waitForTimeout(3000)
    
    // 홈페이지 기본 요소 확인
    const headerVisible = await page.locator('header').isVisible()
    const logoVisible = await page.locator('text=Korean Caster').first().isVisible()
    const productsVisible = await page.locator('text=전체 제품 보기').isVisible()
    
    testResults.homepage = headerVisible && logoVisible && productsVisible
    console.log(`홈페이지 로딩: ${testResults.homepage ? '✅ 성공' : '❌ 실패'}`)
    
    await page.screenshot({ path: 'final-test-1-homepage.png' })
    
    console.log('\\n=== 2. 제품 표시 테스트 ===')
    
    // 제품 카드 확인
    const productNames = await page.locator('text=/캐스터|휠|모듈|AGV/').count()
    const productPrices = await page.locator('text=/₩|원|,/').count()
    const addButtons = await page.locator('button:has-text(\"담기\")').count()
    
    testResults.productDisplay = productNames > 0 && productPrices > 0 && addButtons > 0
    console.log(`제품 표시: ${testResults.productDisplay ? '✅ 성공' : '❌ 실패'}`)
    console.log(`  - 제품명: ${productNames}개`)
    console.log(`  - 가격: ${productPrices}개`)
    console.log(`  - 담기 버튼: ${addButtons}개`)
    
    await page.screenshot({ path: 'final-test-2-products.png' })
    
    console.log('\\n=== 3. 장바구니 추가 테스트 ===')
    
    if (addButtons > 0) {
      // 첫 번째 담기 버튼 클릭
      await page.locator('button:has-text(\"담기\")').first().click()
      await page.waitForTimeout(2000)
      
      // 장바구니 카운트 확인 (더 구체적인 선택자)
      const cartCount = await page.locator('button:has(.lucide-shopping-cart) span').isVisible()
      testResults.cartAdd = cartCount
      console.log(`장바구니 추가: ${testResults.cartAdd ? '✅ 성공' : '❌ 실패'}`)
      
      await page.screenshot({ path: 'final-test-3-cart-add.png' })
      
      console.log('\\n=== 4. 장바구니 드로어 테스트 ===')
      
      // 장바구니 버튼 클릭
      await page.locator('button:has(.lucide-shopping-cart)').first().click()
      await page.waitForTimeout(2000)
      
      // 장바구니 드로어 확인
      const drawerOpen = await page.locator('[role=\"dialog\"]').isVisible()
      const cartTitle = await page.locator('text=장바구니').isVisible()
      const productInCart = await page.locator('h4:has-text(\"JP AGV\")').isVisible()
      
      testResults.cartDrawer = drawerOpen && cartTitle && productInCart
      console.log(`장바구니 드로어: ${testResults.cartDrawer ? '✅ 성공' : '❌ 실패'}`)
      
      await page.screenshot({ path: 'final-test-4-cart-drawer.png' })
      
      // 장바구니 닫기
      await page.locator('button:has-text(\"계속 쇼핑\")').first().click()
      await page.waitForTimeout(1000)
    }
    
    console.log('\\n=== 5. 인증 모달 테스트 ===')
    
    // 로그인 버튼 클릭
    await page.locator('button:has-text(\"로그인\")').first().click()
    await page.waitForTimeout(2000)
    
    // 인증 모달 확인
    const authModal = await page.locator('[role=\"dialog\"]').isVisible()
    const emailInput = await page.locator('input[type=\"email\"]').isVisible()
    const passwordInput = await page.locator('input[type=\"password\"]').isVisible()
    
    testResults.authModal = authModal && emailInput && passwordInput
    console.log(`인증 모달: ${testResults.authModal ? '✅ 성공' : '❌ 실패'}`)
    
    await page.screenshot({ path: 'final-test-5-auth-modal.png' })
    
    // 모달 닫기
    await page.keyboard.press('Escape')
    await page.waitForTimeout(1000)
    
    // 전체 결과 계산
    const passedTests = Object.values(testResults).filter(result => result === true).length
    const totalTests = Object.keys(testResults).length - 1 // 'overall' 제외
    testResults.overall = passedTests >= totalTests * 0.8 // 80% 이상 성공
    
    console.log('\\n=== 6. 최종 스크린샷 ===')
    await page.screenshot({ path: 'final-test-6-complete.png' })
    
    return testResults
    
  } catch (error) {
    console.error('❌ 테스트 중 오류:', error.message)
    await page.screenshot({ path: 'final-test-error.png' })
    return testResults
  } finally {
    // 로그 분석
    console.log('\\n=== 콘솔 로그 분석 ===')
    const errorLogs = consoleLogs.filter(log => log.includes('error:'))
    console.log(`오류 로그: ${errorLogs.length}개`)
    
    if (errorLogs.length > 0) {
      console.log('주요 오류:')
      errorLogs.slice(0, 5).forEach(log => console.log(`  ${log}`))
    }
    
    if (networkErrors.length > 0) {
      console.log(`네트워크 오류: ${networkErrors.length}개`)
      networkErrors.slice(0, 3).forEach(error => console.log(`  ${error}`))
    }
    
    await browser.close()
  }
}

runComprehensiveTest().then(results => {
  console.log('\\n=== 🎯 종합 테스트 결과 ===')
  console.log(`홈페이지 로딩: ${results.homepage ? '✅ 성공' : '❌ 실패'}`)
  console.log(`제품 표시: ${results.productDisplay ? '✅ 성공' : '❌ 실패'}`)
  console.log(`장바구니 추가: ${results.cartAdd ? '✅ 성공' : '❌ 실패'}`)
  console.log(`장바구니 드로어: ${results.cartDrawer ? '✅ 성공' : '❌ 실패'}`)
  console.log(`인증 모달: ${results.authModal ? '✅ 성공' : '❌ 실패'}`)
  console.log(`\\n전체 결과: ${results.overall ? '🎉 성공' : '❌ 실패'}`)
  
  const passedTests = Object.values(results).filter(result => result === true).length - 1
  const totalTests = Object.keys(results).length - 1
  console.log(`성공률: ${passedTests}/${totalTests} (${Math.round(passedTests/totalTests*100)}%)`)
  
  process.exit(results.overall ? 0 : 1)
}).catch(error => {
  console.error('테스트 실행 실패:', error)
  process.exit(1)
})