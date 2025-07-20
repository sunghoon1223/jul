import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

async function testAuthSystem() {
  console.log('🔍 JP Caster 인증 시스템 테스트 시작...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    errors: []
  };
  
  try {
    // 1. 홈페이지 로드 테스트
    console.log('📱 홈페이지 로드 테스트...');
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
    
    // 스크린샷 촬영
    await page.screenshot({ path: 'auth-test-homepage.png' });
    
    results.tests.push({
      name: '홈페이지 로드',
      status: 'success',
      timestamp: new Date().toISOString()
    });
    
    // 2. 로그인 모달 열기 테스트
    console.log('🔐 로그인 모달 열기 테스트...');
    
    // 로그인 버튼 찾기 (여러 가능한 선택자 시도)
    const loginSelectors = [
      'button:has-text("로그인")',
      'button:has-text("Login")',
      '[data-testid="login-button"]',
      '.login-button',
      'button[aria-label*="로그인"]'
    ];
    
    let loginButton = null;
    for (const selector of loginSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        loginButton = await page.locator(selector).first();
        break;
      } catch (e) {
        console.log(`선택자 ${selector}로 로그인 버튼을 찾을 수 없음`);
      }
    }
    
    if (loginButton) {
      await loginButton.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'auth-test-login-modal.png' });
      
      results.tests.push({
        name: '로그인 모달 열기',
        status: 'success',
        timestamp: new Date().toISOString()
      });
    } else {
      results.tests.push({
        name: '로그인 모달 열기',
        status: 'failed',
        error: '로그인 버튼을 찾을 수 없음',
        timestamp: new Date().toISOString()
      });
    }
    
    // 3. 소셜 로그인 버튼 확인
    console.log('🌐 소셜 로그인 버튼 확인...');
    
    const socialButtons = [
      'button:has-text("Google")',
      'button:has-text("Kakao")',
      'button:has-text("Naver")',
      'button:has-text("카카오")',
      'button:has-text("네이버")'
    ];
    
    let foundButtons = [];
    for (const selector of socialButtons) {
      try {
        const button = await page.locator(selector).first();
        if (await button.isVisible()) {
          foundButtons.push(selector);
        }
      } catch (e) {
        console.log(`소셜 로그인 버튼 ${selector}를 찾을 수 없음`);
      }
    }
    
    results.tests.push({
      name: '소셜 로그인 버튼 확인',
      status: foundButtons.length > 0 ? 'success' : 'failed',
      details: `발견된 버튼: ${foundButtons.join(', ')}`,
      timestamp: new Date().toISOString()
    });
    
    // 4. 회원가입 폼 테스트
    console.log('📝 회원가입 폼 테스트...');
    
    // 회원가입 탭 또는 버튼 찾기
    const signupSelectors = [
      'button:has-text("회원가입")',
      'button:has-text("Sign Up")',
      '[data-testid="signup-tab"]',
      '.signup-tab'
    ];
    
    let signupButton = null;
    for (const selector of signupSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        signupButton = await page.locator(selector).first();
        break;
      } catch (e) {
        console.log(`선택자 ${selector}로 회원가입 버튼을 찾을 수 없음`);
      }
    }
    
    if (signupButton) {
      await signupButton.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'auth-test-signup-form.png' });
      
      results.tests.push({
        name: '회원가입 폼 접근',
        status: 'success',
        timestamp: new Date().toISOString()
      });
    } else {
      results.tests.push({
        name: '회원가입 폼 접근',
        status: 'failed',
        error: '회원가입 버튼을 찾을 수 없음',
        timestamp: new Date().toISOString()
      });
    }
    
    // 5. 콘솔 에러 확인
    console.log('🔍 콘솔 에러 확인...');
    
    const logs = await page.evaluate(() => {
      return window.console.logs || [];
    });
    
    // 페이지에서 에러 수집
    page.on('console', msg => {
      if (msg.type() === 'error') {
        results.errors.push({
          message: msg.text(),
          timestamp: new Date().toISOString()
        });
      }
    });
    
    // 네트워크 요청 확인
    console.log('🌐 네트워크 요청 확인...');
    
    const networkRequests = [];
    page.on('request', request => {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        timestamp: new Date().toISOString()
      });
    });
    
    // 최종 스크린샷
    await page.screenshot({ path: 'auth-test-final.png' });
    
    results.networkRequests = networkRequests;
    results.summary = {
      totalTests: results.tests.length,
      successTests: results.tests.filter(t => t.status === 'success').length,
      failedTests: results.tests.filter(t => t.status === 'failed').length,
      totalErrors: results.errors.length
    };
    
    console.log(`✅ 테스트 완료: ${results.summary.successTests}/${results.summary.totalTests} 성공`);
    console.log(`❌ 에러 개수: ${results.summary.totalErrors}`);
    
  } catch (error) {
    console.error('❌ 테스트 실행 중 에러:', error);
    results.errors.push({
      message: `테스트 실행 에러: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  } finally {
    await browser.close();
  }
  
  // 결과 파일 저장
  writeFileSync('auth-test-results.json', JSON.stringify(results, null, 2));
  console.log('📊 결과가 auth-test-results.json에 저장되었습니다.');
  
  return results;
}

// 테스트 실행
testAuthSystem().catch(console.error);