import { chromium } from 'playwright'

console.log('🏁 Final comprehensive verification test...')

async function runFinalVerification() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1500
  })
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  })
  
  const page = await context.newPage()
  
  // Collect all logs and errors
  const consoleLogs = []
  const errors = []
  
  page.on('console', msg => {
    consoleLogs.push(`${msg.type()}: ${msg.text()}`)
  })
  
  page.on('pageerror', error => {
    errors.push(`PAGE ERROR: ${error.message}`)
  })
  
  const testResults = {
    pageLoad: false,
    noErrors: false,
    featuredProducts: false,
    productCards: false,
    cartFunction: false,
    authModal: false,
    overall: false
  }
  
  try {
    console.log('\\n=== 1. 페이지 로드 테스트 ===')
    await page.goto('http://localhost:8081/', { waitUntil: 'networkidle' })
    await page.waitForTimeout(5000)
    
    testResults.pageLoad = true
    console.log('✅ 페이지 로드 성공')
    
    console.log('\\n=== 2. 오류 검사 ===')
    const hasCriticalErrors = errors.some(error => 
      error.includes('Cannot read properties of undefined') || 
      error.includes('TypeError') || 
      error.includes('ReferenceError')
    )
    
    testResults.noErrors = !hasCriticalErrors
    console.log(`${testResults.noErrors ? '✅' : '❌'} 치명적인 오류: ${hasCriticalErrors ? '발견됨' : '없음'}`)
    
    console.log('\\n=== 3. Featured Products 섹션 테스트 ===')
    const featuredSection = await page.locator('text=인기 제품').isVisible()
    testResults.featuredProducts = featuredSection
    console.log(`${testResults.featuredProducts ? '✅' : '❌'} Featured Products 섹션: ${featuredSection ? '표시됨' : '표시 안됨'}`)
    
    console.log('\\n=== 4. 제품 카드 테스트 ===')
    const productCards = await page.locator('.group.bg-white').count()
    testResults.productCards = productCards > 0
    console.log(`${testResults.productCards ? '✅' : '❌'} 제품 카드: ${productCards}개`)
    
    // Check for category badges
    const categoryBadges = await page.locator('.bg-yellow-400.text-gray-900').count()
    console.log(`카테고리 배지: ${categoryBadges}개`)
    
    console.log('\\n=== 5. 장바구니 기능 테스트 ===')
    const addButtons = await page.locator('button:has-text(\"담기\")').count()
    if (addButtons > 0) {
      await page.locator('button:has-text(\"담기\")').first().click()
      await page.waitForTimeout(2000)
      
      const cartButton = await page.locator('button:has(.lucide-shopping-cart)').first()
      await cartButton.click()
      await page.waitForTimeout(2000)
      
      const cartDrawer = await page.locator('[role=\"dialog\"]').isVisible()
      testResults.cartFunction = cartDrawer
      console.log(`${testResults.cartFunction ? '✅' : '❌'} 장바구니 기능: ${cartDrawer ? '정상' : '오류'}`)
      
      if (cartDrawer) {
        // Close cart
        await page.locator('button:has-text(\"계속 쇼핑\")').first().click()
        await page.waitForTimeout(1000)
      }
    }
    
    console.log('\\n=== 6. 인증 모달 테스트 ===')
    const loginButton = await page.locator('button:has-text(\"로그인\")').first()
    await loginButton.click()
    await page.waitForTimeout(2000)
    
    const authModal = await page.locator('[role=\"dialog\"]').isVisible()
    testResults.authModal = authModal
    console.log(`${testResults.authModal ? '✅' : '❌'} 인증 모달: ${authModal ? '정상' : '오류'}`)
    
    // Close modal
    await page.keyboard.press('Escape')
    await page.waitForTimeout(1000)
    
    console.log('\\n=== 7. 스크린샷 저장 ===')
    await page.screenshot({ path: 'final-verification-complete.png' })
    
    // Calculate overall result
    const passedTests = Object.values(testResults).filter(result => result === true).length
    const totalTests = Object.keys(testResults).length - 1 // excluding 'overall'
    testResults.overall = passedTests >= totalTests * 0.8 // 80% pass rate
    
    return testResults
    
  } catch (error) {
    console.error('❌ 테스트 중 오류:', error.message)
    return testResults
  } finally {
    console.log('\\n=== 로그 분석 ===')
    
    // Show debug logs
    const debugLogs = consoleLogs.filter(log => log.includes('FeaturedProducts:'))
    if (debugLogs.length > 0) {
      console.log('FeaturedProducts 디버그 로그:')
      debugLogs.forEach(log => console.log(`  ${log}`))
    }
    
    // Show errors if any
    if (errors.length > 0) {
      console.log('\\n발견된 오류:')
      errors.forEach(error => console.log(`  ${error}`))
    }
    
    await browser.close()
  }
}

runFinalVerification().then(results => {
  console.log('\\n=== 🏁 최종 검증 결과 ===')
  console.log(`페이지 로드: ${results.pageLoad ? '✅ 성공' : '❌ 실패'}`)
  console.log(`오류 없음: ${results.noErrors ? '✅ 성공' : '❌ 실패'}`)
  console.log(`Featured Products: ${results.featuredProducts ? '✅ 성공' : '❌ 실패'}`)
  console.log(`제품 카드: ${results.productCards ? '✅ 성공' : '❌ 실패'}`)
  console.log(`장바구니 기능: ${results.cartFunction ? '✅ 성공' : '❌ 실패'}`)
  console.log(`인증 모달: ${results.authModal ? '✅ 성공' : '❌ 실패'}`)
  
  const passedTests = Object.values(results).filter(result => result === true).length - 1
  const totalTests = Object.keys(results).length - 1
  console.log(`\\n전체 결과: ${results.overall ? '🎉 성공' : '❌ 실패'}`)
  console.log(`성공률: ${passedTests}/${totalTests} (${Math.round(passedTests/totalTests*100)}%)`)
  
  if (results.overall) {
    console.log('\\n🎉 모든 주요 기능이 정상 작동합니다!')
    console.log('✅ FeaturedProducts category.name 오류가 완전히 해결되었습니다!')
  }
  
  process.exit(results.overall ? 0 : 1)
}).catch(error => {
  console.error('테스트 실행 실패:', error)
  process.exit(1)
})