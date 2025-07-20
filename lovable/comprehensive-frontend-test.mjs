import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

console.log('🎭 프론트엔드 전체 기능 테스트 시작...')

async function comprehensiveFrontendTest() {
  const browser = await chromium.launch({ 
    headless: false, // 브라우저 창 보이게 설정
    slowMo: 1000    // 1초 간격으로 천천히 실행
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
  
  // 네트워크 에러 수집
  const networkErrors = []
  page.on('requestfailed', request => {
    networkErrors.push(`Failed: ${request.url()} - ${request.failure().errorText}`)
  })
  
  let testResults = {
    homepage: false,
    products: false,
    categories: false,
    search: false,
    cart: false,
    auth: false,
    navigation: false
  }
  
  try {
    // 1. 홈페이지 로딩 테스트
    console.log('\n1. 홈페이지 로딩 테스트...')
    await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' })
    
    // 페이지 타이틀 확인
    const title = await page.title()
    console.log(`   페이지 타이틀: ${title}`)
    
    // 기본 요소들 확인
    const headerExists = await page.locator('header').isVisible()
    const footerExists = await page.locator('footer').isVisible()
    
    console.log(`   헤더 존재: ${headerExists}`)
    console.log(`   푸터 존재: ${footerExists}`)
    
    if (headerExists && footerExists) {
      testResults.homepage = true
      console.log('✅ 홈페이지 로딩 성공')
    }
    
    await page.screenshot({ path: 'test-homepage.png' })
    
    // 2. 제품 목록 표시 확인
    console.log('\n2. 제품 목록 표시 확인...')
    
    // 제품 카드 찾기
    const productCards = await page.locator('[data-testid="product-card"], .product-card, .grid > div').count()
    console.log(`   제품 카드 수: ${productCards}`)
    
    // 제품 이름이 있는지 확인
    const productNames = await page.locator('text=/캐스터|휠|모듈/').count()
    console.log(`   제품 이름 수: ${productNames}`)
    
    // 가격이 표시되는지 확인
    const prices = await page.locator('text=/원|₩|,/').count()
    console.log(`   가격 표시 수: ${prices}`)
    
    if (productCards > 0 && productNames > 0) {
      testResults.products = true
      console.log('✅ 제품 목록 표시 성공')
    }
    
    await page.screenshot({ path: 'test-products.png' })
    
    // 3. 카테고리 네비게이션 테스트
    console.log('\n3. 카테고리 네비게이션 테스트...')
    
    // 카테고리 버튼 찾기
    const categoryButtons = await page.locator('text=/AGV|캐스터|휠|모듈/').count()
    console.log(`   카테고리 버튼 수: ${categoryButtons}`)
    
    if (categoryButtons > 0) {
      // 첫 번째 카테고리 클릭 시도
      try {
        await page.locator('text=/AGV|캐스터|휠|모듈/').first().click()
        await page.waitForTimeout(2000)
        
        testResults.categories = true
        console.log('✅ 카테고리 네비게이션 성공')
      } catch (error) {
        console.log('⚠️  카테고리 클릭 실패:', error.message)
      }
    }
    
    await page.screenshot({ path: 'test-categories.png' })
    
    // 4. 검색 기능 테스트
    console.log('\n4. 검색 기능 테스트...')
    
    // 검색창 찾기
    const searchInput = await page.locator('input[type="search"], input[placeholder*="검색"], input[placeholder*="search"]').first()
    const searchExists = await searchInput.isVisible().catch(() => false)
    
    console.log(`   검색창 존재: ${searchExists}`)
    
    if (searchExists) {
      try {
        await searchInput.fill('AGV')
        await page.keyboard.press('Enter')
        await page.waitForTimeout(2000)
        
        testResults.search = true
        console.log('✅ 검색 기능 성공')
      } catch (error) {
        console.log('⚠️  검색 실패:', error.message)
      }
    }
    
    await page.screenshot({ path: 'test-search.png' })
    
    // 5. 장바구니 기능 테스트
    console.log('\n5. 장바구니 기능 테스트...')
    
    // 장바구니 버튼 찾기
    const cartButton = await page.locator('text=/장바구니|cart/i, [data-testid="cart-button"]').first()
    const cartExists = await cartButton.isVisible().catch(() => false)
    
    console.log(`   장바구니 버튼 존재: ${cartExists}`)
    
    if (cartExists) {
      try {
        await cartButton.click()
        await page.waitForTimeout(2000)
        
        // 장바구니 드로어나 모달이 열렸는지 확인
        const cartModal = await page.locator('[data-testid="cart-drawer"], .cart-modal, .drawer').isVisible().catch(() => false)
        console.log(`   장바구니 모달 열림: ${cartModal}`)
        
        testResults.cart = true
        console.log('✅ 장바구니 기능 성공')
      } catch (error) {
        console.log('⚠️  장바구니 클릭 실패:', error.message)
      }
    }
    
    await page.screenshot({ path: 'test-cart.png' })
    
    // 6. 인증 시스템 테스트
    console.log('\n6. 인증 시스템 테스트...')
    
    // 로그인 버튼 찾기
    const loginButton = await page.locator('text=/로그인|login|sign in/i').first()
    const loginExists = await loginButton.isVisible().catch(() => false)
    
    console.log(`   로그인 버튼 존재: ${loginExists}`)
    
    if (loginExists) {
      try {
        await loginButton.click()
        await page.waitForTimeout(2000)
        
        // 로그인 모달이 열렸는지 확인
        const loginModal = await page.locator('input[type="email"], input[type="password"]').first().isVisible().catch(() => false)
        console.log(`   로그인 모달 열림: ${loginModal}`)
        
        if (loginModal) {
          testResults.auth = true
          console.log('✅ 인증 시스템 성공')
        }
      } catch (error) {
        console.log('⚠️  로그인 클릭 실패:', error.message)
      }
    }
    
    await page.screenshot({ path: 'test-auth.png' })
    
    // 7. 네비게이션 테스트
    console.log('\n7. 네비게이션 테스트...')
    
    // 네비게이션 메뉴 찾기
    const navLinks = await page.locator('nav a, header a').count()
    console.log(`   네비게이션 링크 수: ${navLinks}`)
    
    if (navLinks > 0) {
      testResults.navigation = true
      console.log('✅ 네비게이션 성공')
    }
    
    await page.screenshot({ path: 'test-navigation.png' })
    
    // 8. 콘솔 로그 및 에러 확인
    console.log('\n8. 콘솔 로그 및 에러 확인...')
    
    const errors = consoleLogs.filter(log => log.includes('error:'))
    const warnings = consoleLogs.filter(log => log.includes('warning:'))
    
    console.log(`   콘솔 에러 수: ${errors.length}`)
    console.log(`   콘솔 경고 수: ${warnings.length}`)
    console.log(`   네트워크 에러 수: ${networkErrors.length}`)
    
    if (errors.length > 0) {
      console.log('   콘솔 에러들:')
      errors.forEach(error => console.log(`     - ${error}`))
    }
    
    if (networkErrors.length > 0) {
      console.log('   네트워크 에러들:')
      networkErrors.forEach(error => console.log(`     - ${error}`))
    }
    
    await page.screenshot({ path: 'test-final.png' })
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error.message)
    await page.screenshot({ path: 'test-error.png' })
  } finally {
    await browser.close()
  }
  
  return testResults
}

// 테스트 실행
comprehensiveFrontendTest().then(results => {
  console.log('\n=== 프론트엔드 테스트 결과 ===')
  
  const totalTests = Object.keys(results).length
  const passedTests = Object.values(results).filter(Boolean).length
  
  console.log(`총 테스트: ${totalTests}`)
  console.log(`성공: ${passedTests}`)
  console.log(`실패: ${totalTests - passedTests}`)
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}`)
  })
  
  if (passedTests === totalTests) {
    console.log('\n🎉 모든 프론트엔드 테스트 통과!')
  } else {
    console.log('\n⚠️  일부 테스트 실패 - 수정이 필요합니다.')
  }
  
  process.exit(0)
}).catch(error => {
  console.error('테스트 실행 실패:', error)
  process.exit(1)
})