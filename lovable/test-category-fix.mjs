import { chromium } from 'playwright'

console.log('🔧 Testing FeaturedProducts category fix...')

async function testCategoryFix() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  })
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  })
  
  const page = await context.newPage()
  
  // Collect console logs to check for errors
  const consoleLogs = []
  const errors = []
  
  page.on('console', msg => {
    consoleLogs.push(`${msg.type()}: ${msg.text()}`)
  })
  
  page.on('pageerror', error => {
    errors.push(`PAGE ERROR: ${error.message}`)
  })
  
  try {
    console.log('1. 홈페이지 접속...')
    await page.goto('http://localhost:8081/', { waitUntil: 'networkidle' })
    
    // Wait for the page to load
    await page.waitForTimeout(5000)
    
    console.log('2. 페이지 로드 완료, 스크린샷 촬영...')
    await page.screenshot({ path: 'category-fix-test.png' })
    
    // Check for the specific error
    const hasError = errors.some(error => error.includes('Cannot read properties of undefined (reading \'name\')'))
    
    console.log('3. 결과 확인...')
    console.log(`오류 수: ${errors.length}`)
    console.log(`특정 category.name 오류: ${hasError ? '발견됨' : '없음'}`)
    
    // Check if featured products are displayed
    const featuredProducts = await page.locator('text=인기 제품').isVisible()
    console.log(`Featured Products 섹션: ${featuredProducts ? '표시됨' : '표시 안됨'}`)
    
    // Check if product cards are rendered
    const productCards = await page.locator('.group.bg-white').count()
    console.log(`제품 카드 수: ${productCards}`)
    
    if (errors.length > 0) {
      console.log('\\n발견된 오류:')
      errors.forEach(error => console.log(`  ${error}`))
    }
    
    // Check debug logs
    const debugLogs = consoleLogs.filter(log => log.includes('FeaturedProducts:'))
    console.log('\\nFeaturedProducts 디버그 로그:')
    debugLogs.forEach(log => console.log(`  ${log}`))
    
    return !hasError && featuredProducts && productCards > 0
    
  } catch (error) {
    console.error('❌ 테스트 중 오류:', error.message)
    return false
  } finally {
    await browser.close()
  }
}

testCategoryFix().then(success => {
  console.log('\\n=== 테스트 결과 ===')
  console.log(`결과: ${success ? '✅ 성공 - 오류 수정됨' : '❌ 실패 - 오류 여전히 존재'}`)
  process.exit(success ? 0 : 1)
}).catch(error => {
  console.error('테스트 실행 실패:', error)
  process.exit(1)
})