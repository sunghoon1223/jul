import { chromium } from 'playwright'

console.log('🔧 Testing port 8080 - category.name error fix verification...')

async function testPort8080Fix() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  })
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  })
  
  const page = await context.newPage()
  
  // Collect all errors to check for the specific TypeError
  const errors = []
  const consoleLogs = []
  
  page.on('console', msg => {
    consoleLogs.push(`${msg.type()}: ${msg.text()}`)
  })
  
  page.on('pageerror', error => {
    errors.push(`PAGE ERROR: ${error.message}`)
    console.error(`❌ PAGE ERROR: ${error.message}`)
  })
  
  try {
    console.log('\\n=== 1. 사용자 URL 접속 (http://localhost:8080/) ===')
    await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' })
    
    // Wait for the page to fully load
    await page.waitForTimeout(8000)
    
    console.log('\\n=== 2. 오류 검사 ===')
    
    // Check for the specific error the user reported
    const hasCategoryNameError = errors.some(error => 
      error.includes('Cannot read properties of undefined (reading \'name\')')
    )
    
    // Check for any TypeError
    const hasTypeError = errors.some(error => 
      error.includes('TypeError')
    )
    
    console.log(`특정 category.name 오류: ${hasCategoryNameError ? '❌ 발견됨' : '✅ 해결됨'}`)
    console.log(`모든 TypeError: ${hasTypeError ? '❌ 발견됨' : '✅ 없음'}`)
    console.log(`전체 오류 수: ${errors.length}개`)
    
    if (errors.length > 0) {
      console.log('\\n발견된 오류:')
      errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`)
      })
    }
    
    console.log('\\n=== 3. 페이지 기능 확인 ===')
    
    // Check if Featured Products section loads
    const featuredSection = await page.locator('text=인기 제품').isVisible()
    console.log(`Featured Products 섹션: ${featuredSection ? '✅ 표시됨' : '❌ 표시 안됨'}`)
    
    // Check if product cards render
    const productCards = await page.locator('.group.bg-white').count()
    console.log(`제품 카드 렌더링: ${productCards > 0 ? '✅' : '❌'} ${productCards}개`)
    
    // Check if category badges render properly
    const categoryBadges = await page.locator('.bg-yellow-400.text-gray-900').count()
    console.log(`카테고리 배지 렌더링: ${categoryBadges > 0 ? '✅' : '❌'} ${categoryBadges}개`)
    
    console.log('\\n=== 4. 스크린샷 저장 ===')
    await page.screenshot({ path: 'port-8080-fix-verification.png' })
    
    console.log('\\n=== 5. 디버그 로그 확인 ===')
    const debugLogs = consoleLogs.filter(log => 
      log.includes('FeaturedProducts:') || log.includes('category')
    )
    
    if (debugLogs.length > 0) {
      console.log('관련 디버그 로그:')
      debugLogs.forEach(log => console.log(`  ${log}`))
    } else {
      console.log('디버그 로그 없음 (정상)')
    }
    
    // Success criteria
    const isSuccess = !hasCategoryNameError && featuredSection && productCards > 0
    
    return {
      success: isSuccess,
      hasCategoryNameError,
      hasTypeError,
      totalErrors: errors.length,
      featuredSection,
      productCards,
      categoryBadges
    }
    
  } catch (error) {
    console.error('❌ 테스트 중 오류:', error.message)
    return {
      success: false,
      error: error.message
    }
  } finally {
    await browser.close()
  }
}

testPort8080Fix().then(results => {
  console.log('\\n=== 🎯 포트 8080 검증 결과 ===')
  
  if (results.success) {
    console.log('🎉 성공! category.name 오류가 완전히 해결되었습니다!')
    console.log('✅ 사용자가 접속하는 http://localhost:8080/ 에서 오류 없이 정상 작동합니다.')
  } else {
    console.log('❌ 실패: 여전히 문제가 있습니다.')
  }
  
  console.log('\\n상세 결과:')
  console.log(`- Category.name 오류: ${results.hasCategoryNameError ? '❌ 존재' : '✅ 해결됨'}`)
  console.log(`- TypeError: ${results.hasTypeError ? '❌ 존재' : '✅ 없음'}`)
  console.log(`- 전체 오류: ${results.totalErrors}개`)
  console.log(`- Featured Products: ${results.featuredSection ? '✅' : '❌'}`)
  console.log(`- 제품 카드: ${results.productCards}개`)
  console.log(`- 카테고리 배지: ${results.categoryBadges}개`)
  
  process.exit(results.success ? 0 : 1)
}).catch(error => {
  console.error('테스트 실행 실패:', error)
  process.exit(1)
})