import { chromium } from 'playwright'

console.log('🌐 프론트엔드 로그인 테스트 시작...')

async function testLogin() {
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()
  
  try {
    // 1. 홈페이지 접속
    console.log('1. 홈페이지 접속...')
    await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' })
    
    // 2. 로그인 버튼 찾기
    console.log('2. 로그인 버튼 찾기...')
    const loginButton = await page.locator('text=로그인').first()
    const isLoginVisible = await loginButton.isVisible()
    
    if (isLoginVisible) {
      console.log('✅ 로그인 버튼 발견')
      
      // 3. 로그인 모달 열기
      console.log('3. 로그인 모달 열기...')
      await loginButton.click()
      await page.waitForTimeout(1000)
      
      // 4. 이메일/비밀번호 입력 필드 확인
      const emailField = await page.locator('input[type="email"]').first()
      const passwordField = await page.locator('input[type="password"]').first()
      
      const emailVisible = await emailField.isVisible()
      const passwordVisible = await passwordField.isVisible()
      
      console.log('✅ 로그인 폼 확인:')
      console.log('   이메일 필드:', emailVisible ? '✅' : '❌')
      console.log('   비밀번호 필드:', passwordVisible ? '✅' : '❌')
      
      // 5. 테스트 계정으로 회원가입 시도
      if (emailVisible && passwordVisible) {
        console.log('4. 테스트 계정 회원가입 시도...')
        
        // 회원가입 탭으로 전환
        const signupTab = await page.locator('text=회원가입').first()
        const signupVisible = await signupTab.isVisible()
        
        if (signupVisible) {
          await signupTab.click()
          await page.waitForTimeout(500)
          
          // 회원가입 폼 입력
          await page.fill('input[type="email"]', 'test@jpcaster.com')
          await page.fill('input[type="password"]', 'test123456')
          
          // 이름 필드가 있으면 입력
          const nameField = await page.locator('input[placeholder*="이름"], input[placeholder*="name"]').first()
          const nameVisible = await nameField.isVisible()
          if (nameVisible) {
            await nameField.fill('테스트 사용자')
          }
          
          // 회원가입 버튼 클릭
          const signupButton = await page.locator('button:has-text("회원가입")').first()
          await signupButton.click()
          
          // 결과 확인
          await page.waitForTimeout(2000)
          const successMessage = await page.locator('text=확인').first()
          const isSuccess = await successMessage.isVisible()
          
          console.log('✅ 회원가입 시도 완료:', isSuccess ? '성공' : '확인 필요')
        }
      }
      
    } else {
      console.log('❌ 로그인 버튼을 찾을 수 없음')
    }
    
    // 스크린샷 촬영
    await page.screenshot({ path: 'login-test-result.png' })
    console.log('📸 스크린샷 저장: login-test-result.png')
    
  } catch (error) {
    console.error('❌ 테스트 중 오류:', error.message)
    await page.screenshot({ path: 'login-test-error.png' })
  } finally {
    await browser.close()
  }
}

testLogin().catch(console.error)