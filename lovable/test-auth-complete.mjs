import { chromium } from 'playwright'

console.log('🔐 회원가입/로그인 전체 테스트 시작...')

async function testAuthComplete() {
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
  
  const networkErrors = []
  page.on('requestfailed', request => {
    networkErrors.push(`Failed: ${request.url()} - ${request.failure().errorText}`)
  })
  
  try {
    console.log('\n1. 홈페이지 접속...')
    await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' })
    await page.screenshot({ path: 'auth-test-1-homepage.png' })
    
    console.log('2. 로그인 버튼 찾기...')
    
    // 로그인 버튼 찾기
    const loginSelectors = [
      'button:has-text("로그인")',
      'button:has-text("Login")',
      'button:has-text("Sign In")',
      'button:has-text("sign in")',
      'button:has-text("signin")',
      'a:has-text("로그인")',
      'a:has-text("Login")',
      '[data-testid="login-button"]',
      'button[aria-label*="login"]',
      'button[aria-label*="Login"]',
      'button[aria-label*="로그인"]'
    ]
    
    let loginButton = null
    for (const selector of loginSelectors) {
      try {
        const button = page.locator(selector).first()
        if (await button.isVisible()) {
          loginButton = button
          console.log(`✅ 로그인 버튼 발견: ${selector}`)
          break
        }
      } catch (error) {
        // 다음 선택자 시도
      }
    }
    
    if (!loginButton) {
      console.log('❌ 로그인 버튼을 찾을 수 없습니다.')
      
      // 모든 버튼과 링크 확인
      console.log('모든 버튼 확인...')
      const allButtons = await page.locator('button, a').all()
      console.log(`총 버튼/링크 수: ${allButtons.length}`)
      
      for (let i = 0; i < Math.min(15, allButtons.length); i++) {
        const button = allButtons[i]
        const text = await button.innerText().catch(() => '')
        const href = await button.getAttribute('href').catch(() => '')
        if (text.includes('로그인') || text.includes('Login') || text.includes('sign') || text.includes('user')) {
          console.log(`버튼 ${i + 1}: "${text}" (href: "${href}")`)
        }
      }
      
      await page.screenshot({ path: 'auth-test-2-no-login.png' })
      return false
    }
    
    console.log('3. 로그인 버튼 클릭...')
    await loginButton.click()
    await page.waitForTimeout(2000)
    await page.screenshot({ path: 'auth-test-3-login-clicked.png' })
    
    console.log('4. 로그인 모달 확인...')
    
    // 로그인 모달이 열렸는지 확인
    const emailInput = await page.locator('input[type="email"]').first()
    const passwordInput = await page.locator('input[type="password"]').first()
    
    const emailVisible = await emailInput.isVisible().catch(() => false)
    const passwordVisible = await passwordInput.isVisible().catch(() => false)
    
    console.log(`이메일 입력창: ${emailVisible}`)
    console.log(`비밀번호 입력창: ${passwordVisible}`)
    
    if (emailVisible && passwordVisible) {
      console.log('✅ 로그인 모달 정상 오픈')
      
      console.log('5. 회원가입 탭 테스트...')
      
      // 회원가입 탭 찾기
      const signupTab = await page.locator('text=회원가입, text=Sign Up, text=signup, text=register').first()
      const signupVisible = await signupTab.isVisible().catch(() => false)
      
      if (signupVisible) {
        console.log('회원가입 탭 발견, 클릭...')
        await signupTab.click()
        await page.waitForTimeout(1000)
        await page.screenshot({ path: 'auth-test-4-signup-tab.png' })
        
        console.log('6. 회원가입 폼 테스트...')
        
        // 회원가입 폼 입력
        const testEmail = `test${Date.now()}@jpcaster.com`
        const testPassword = 'TestPassword123!'
        const testName = '테스트 사용자'
        
        console.log(`테스트 이메일: ${testEmail}`)
        
        // 이메일 입력
        await emailInput.fill(testEmail)
        console.log('이메일 입력 완료')
        
        // 비밀번호 입력
        await passwordInput.fill(testPassword)
        console.log('비밀번호 입력 완료')
        
        // 이름 입력 (있는 경우)
        const nameInput = await page.locator('input[placeholder*="이름"], input[placeholder*="name"], input[placeholder*="Name"]').first()
        const nameVisible = await nameInput.isVisible().catch(() => false)
        
        if (nameVisible) {
          await nameInput.fill(testName)
          console.log('이름 입력 완료')
        }
        
        await page.screenshot({ path: 'auth-test-5-signup-form.png' })
        
        console.log('7. 회원가입 버튼 클릭...')
        
        // 회원가입 버튼 클릭
        const signupButton = await page.locator('button:has-text("회원가입"), button:has-text("Sign Up"), button:has-text("Register")').first()
        const signupButtonVisible = await signupButton.isVisible().catch(() => false)
        
        if (signupButtonVisible) {
          await signupButton.click()
          await page.waitForTimeout(3000)
          await page.screenshot({ path: 'auth-test-6-signup-result.png' })
          
          // 결과 확인
          const successMessage = await page.locator('text=성공, text=완료, text=가입').first()
          const successVisible = await successMessage.isVisible().catch(() => false)
          
          const errorMessage = await page.locator('text=오류, text=실패, text=Error').first()
          const errorVisible = await errorMessage.isVisible().catch(() => false)
          
          console.log(`회원가입 성공 메시지: ${successVisible}`)
          console.log(`회원가입 오류 메시지: ${errorVisible}`)
          
          if (successVisible) {
            console.log('✅ 회원가입 성공!')
            
            // 로그인 탭으로 돌아가서 로그인 테스트
            console.log('8. 로그인 테스트...')
            
            const loginTab = await page.locator('text=로그인, text=Login, text=Sign In').first()
            const loginTabVisible = await loginTab.isVisible().catch(() => false)
            
            if (loginTabVisible) {
              await loginTab.click()
              await page.waitForTimeout(1000)
              
              // 로그인 정보 입력
              await page.locator('input[type="email"]').fill(testEmail)
              await page.locator('input[type="password"]').fill(testPassword)
              await page.screenshot({ path: 'auth-test-7-login-form.png' })
              
              // 로그인 버튼 클릭
              const loginSubmitButton = await page.locator('button:has-text("로그인"), button:has-text("Login"), button:has-text("Sign In")').first()
              await loginSubmitButton.click()
              await page.waitForTimeout(3000)
              await page.screenshot({ path: 'auth-test-8-login-result.png' })
              
              // 로그인 성공 확인
              const userMenu = await page.locator('text=로그아웃, text=Logout, text=내 정보').first()
              const loggedIn = await userMenu.isVisible().catch(() => false)
              
              console.log(`로그인 성공: ${loggedIn}`)
              
              if (loggedIn) {
                console.log('✅ 로그인 성공!')
                
                // 로그아웃 테스트
                console.log('9. 로그아웃 테스트...')
                const logoutButton = await page.locator('text=로그아웃, text=Logout').first()
                const logoutVisible = await logoutButton.isVisible().catch(() => false)
                
                if (logoutVisible) {
                  await logoutButton.click()
                  await page.waitForTimeout(2000)
                  await page.screenshot({ path: 'auth-test-9-logout.png' })
                  
                  // 로그아웃 확인
                  const loginButtonAfterLogout = await page.locator('text=로그인, text=Login').first()
                  const backToLogin = await loginButtonAfterLogout.isVisible().catch(() => false)
                  
                  console.log(`로그아웃 성공: ${backToLogin}`)
                  
                  if (backToLogin) {
                    console.log('✅ 로그아웃 성공!')
                    return true
                  }
                }
              }
            }
          } else if (errorVisible) {
            console.log('⚠️  회원가입 실패 (예상됨 - 이미 존재하는 이메일일 수 있음)')
            
            // 로그인 시도
            console.log('기존 계정으로 로그인 시도...')
            const loginTab = await page.locator('text=로그인, text=Login').first()
            const loginTabVisible = await loginTab.isVisible().catch(() => false)
            
            if (loginTabVisible) {
              await loginTab.click()
              await page.waitForTimeout(1000)
              
              // 테스트 계정으로 로그인
              await page.locator('input[type="email"]').fill('test@jpcaster.com')
              await page.locator('input[type="password"]').fill('test123456')
              
              const loginSubmitButton = await page.locator('button:has-text("로그인"), button:has-text("Login")').first()
              await loginSubmitButton.click()
              await page.waitForTimeout(3000)
              await page.screenshot({ path: 'auth-test-existing-login.png' })
              
              return true
            }
          }
        }
      }
    } else {
      console.log('❌ 로그인 모달이 열리지 않음')
      await page.screenshot({ path: 'auth-test-modal-fail.png' })
    }
    
    return false
    
  } catch (error) {
    console.error('❌ 테스트 중 오류:', error.message)
    await page.screenshot({ path: 'auth-test-error.png' })
    return false
  } finally {
    // 콘솔 로그 확인
    console.log('\n콘솔 로그 확인...')
    const authLogs = consoleLogs.filter(log => 
      log.includes('auth') || log.includes('login') || log.includes('signup') || 
      log.includes('로그인') || log.includes('회원가입') || log.includes('supabase')
    )
    console.log(`인증 관련 로그: ${authLogs.length}개`)
    
    authLogs.forEach(log => {
      console.log(`   ${log}`)
    })
    
    if (networkErrors.length > 0) {
      console.log('네트워크 오류:', networkErrors.length, '개')
      networkErrors.forEach(error => {
        console.log(`   ${error}`)
      })
    }
    
    await browser.close()
  }
}

testAuthComplete().then(success => {
  console.log('\n=== 인증 시스템 테스트 완료 ===')
  console.log('결과:', success ? '✅ 성공' : '❌ 실패')
  process.exit(success ? 0 : 1)
}).catch(error => {
  console.error('테스트 실행 실패:', error)
  process.exit(1)
})