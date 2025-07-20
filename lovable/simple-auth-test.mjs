import { chromium } from 'playwright'

console.log('🔐 간단 인증 테스트 시작...')

async function simpleAuthTest() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 3000  // 더 천천히
  })
  
  const page = await browser.newPage()
  
  try {
    console.log('1. 홈페이지 접속...')
    await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)
    
    console.log('2. 로그인 버튼 클릭...')
    await page.locator('button:has-text("로그인")').first().click()
    await page.waitForTimeout(3000)
    
    console.log('3. 회원가입 탭 클릭...')
    await page.locator('[data-value="signup"], button[value="signup"]').first().click()
    await page.waitForTimeout(2000)
    
    console.log('4. 회원가입 폼 입력...')
    const testEmail = `test${Date.now()}@example.com`
    
    await page.locator('input[type="email"]').fill(testEmail)
    await page.locator('input[type="password"]').first().fill('TestPassword123!')
    await page.locator('input[placeholder*="이름"]').fill('테스트사용자')
    
    console.log('5. 회원가입 버튼 클릭...')
    await page.locator('button:has-text("회원가입")').click()
    await page.waitForTimeout(5000)
    
    console.log('6. 결과 확인...')
    await page.screenshot({ path: 'simple-auth-result.png' })
    
    console.log('✅ 인증 테스트 완료')
    return true
    
  } catch (error) {
    console.error('❌ 테스트 중 오류:', error.message)
    await page.screenshot({ path: 'simple-auth-error.png' })
    return false
  } finally {
    await browser.close()
  }
}

simpleAuthTest().then(success => {
  console.log('결과:', success ? '✅ 성공' : '❌ 실패')
  process.exit(success ? 0 : 1)
})