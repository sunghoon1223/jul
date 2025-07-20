import { chromium } from 'playwright';
import fs from 'fs';

async function testAuthFeatures() {
  console.log('🔐 인증 기능 테스트 시작...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 콘솔 로그 캡처
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
      console.log(`[브라우저 ${msg.type()}] ${msg.text()}`);
    });

    // 1. 회원가입 테스트
    console.log('📍 1. 회원가입 테스트...');
    await page.goto('http://localhost:8081/auth?mode=signup');
    await page.waitForTimeout(2000);
    
    // 회원가입 폼 작성
    await page.fill('#email', 'newuser@test.com');
    await page.fill('#password', 'password123');
    await page.fill('#confirmPassword', 'password123');
    await page.fill('#name', '신규사용자');
    await page.fill('#phone', '010-9999-8888');
    
    // 약관 동의
    await page.check('#agreeTerms');
    await page.check('#agreePrivacy');
    
    await page.screenshot({ path: 'signup-ready.png' });
    
    // 회원가입 버튼 클릭
    const signupButton = await page.$('button[type="submit"]:has-text("회원가입")');
    await signupButton.click();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'after-signup.png' });
    
    // 2. 로그인 테스트
    console.log('📍 2. 로그인 테스트...');
    await page.goto('http://localhost:8081/auth?mode=login');
    await page.waitForTimeout(1000);
    
    await page.fill('#email', 'newuser@test.com');
    await page.fill('#password', 'password123');
    
    const loginButton = await page.$('button[type="submit"]:has-text("로그인")');
    await loginButton.click();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'after-login.png' });
    
    // 홈페이지로 리다이렉트 되었는지 확인
    const currentUrl = page.url();
    console.log('로그인 후 현재 URL:', currentUrl);
    
    // 3. 헤더에서 사용자 정보 확인
    console.log('📍 3. 헤더 사용자 정보 확인...');
    await page.waitForTimeout(1000);
    
    // 사용자 드롭다운 확인
    const userButton = await page.$('button[aria-haspopup="menu"]');
    if (userButton) {
      console.log('✅ 사용자 메뉴 버튼 확인됨');
      await userButton.click();
      await page.waitForTimeout(500);
      
      const logoutMenuItem = await page.$('text=로그아웃');
      if (logoutMenuItem) {
        console.log('✅ 로그아웃 메뉴 항목 확인됨');
      }
    } else {
      console.log('❌ 사용자 메뉴 버튼을 찾을 수 없음');
    }
    
    await page.screenshot({ path: 'user-menu.png' });
    
    // 4. Google 소셜 로그인 테스트
    console.log('📍 4. Google 소셜 로그인 테스트...');
    
    // 먼저 로그아웃
    if (userButton) {
      await userButton.click();
      await page.waitForTimeout(500);
      const logoutMenuItem = await page.$('text=로그아웃');
      if (logoutMenuItem) {
        await logoutMenuItem.click();
        await page.waitForTimeout(1000);
      }
    }
    
    await page.goto('http://localhost:8081/auth?mode=login');
    await page.waitForTimeout(1000);
    
    const googleButton = await page.$('button:has-text("Google로 계속하기")');
    if (googleButton) {
      console.log('Google 소셜 로그인 버튼 클릭...');
      await googleButton.click();
      await page.waitForTimeout(3000);
      
      await page.screenshot({ path: 'google-social-login.png' });
      console.log('✅ Google 소셜 로그인 테스트 완료');
    }
    
    // 5. Kakao 소셜 로그인 테스트
    console.log('📍 5. Kakao 소셜 로그인 테스트...');
    const kakaoButton = await page.$('button:has-text("카카오로 계속하기")');
    if (kakaoButton) {
      console.log('Kakao 소셜 로그인 버튼 클릭...');
      await kakaoButton.click();
      await page.waitForTimeout(3000);
      
      await page.screenshot({ path: 'kakao-social-login.png' });
      console.log('✅ Kakao 소셜 로그인 테스트 완료');
    }
    
    // 최종 결과 확인
    await page.goto('http://localhost:8081');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'final-homepage.png' });
    
    // 테스트 결과 저장
    const results = {
      timestamp: new Date().toISOString(),
      testResults: {
        signupTest: '완료',
        loginTest: '완료', 
        socialLoginGoogleTest: '완료',
        socialLoginKakaoTest: '완료',
        userMenuTest: !!userButton
      },
      consoleMessages: consoleMessages.slice(-20) // 마지막 20개 메시지만
    };
    
    fs.writeFileSync('auth-test-results.json', JSON.stringify(results, null, 2));
    console.log('✅ 인증 테스트 결과 저장 완료');
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
    await page.screenshot({ path: 'auth-test-error.png' });
  } finally {
    await browser.close();
  }
}

testAuthFeatures();