import { chromium } from 'playwright';

async function testSocialLoginUI() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🔐 한국형 소셜 로그인 UI 테스트 시작...');
    
    // 콘솔 로그 캡처
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log(`❌ Browser Console Error:`, msg.text());
      }
    });

    // 로컬 서버 접속
    await page.goto('http://localhost:8080');
    console.log('✅ 메인 페이지 로딩 완료');

    await page.waitForTimeout(3000);

    // 로그인 버튼 클릭
    const loginButton = page.locator('text=/로그인|계정|사용자/i').first();
    if (await loginButton.isVisible()) {
      console.log('🔑 로그인 버튼 클릭...');
      await loginButton.click();
      await page.waitForTimeout(2000);
    }

    // 소셜 로그인 버튼들 확인
    console.log('🔍 소셜 로그인 버튼들 확인...');
    
    const kakaoButton = page.locator('button:has-text("카카오 로그인")');
    const naverButton = page.locator('button:has-text("네이버 로그인")');
    const googleButton = page.locator('button:has-text("구글 로그인")');

    if (await kakaoButton.isVisible()) {
      console.log('✅ 카카오 로그인 버튼 발견');
    } else {
      console.log('❌ 카카오 로그인 버튼 없음');
    }

    if (await naverButton.isVisible()) {
      console.log('✅ 네이버 로그인 버튼 발견');
    } else {
      console.log('❌ 네이버 로그인 버튼 없음');
    }

    if (await googleButton.isVisible()) {
      console.log('✅ 구글 로그인 버튼 발견');
    } else {
      console.log('❌ 구글 로그인 버튼 없음');
    }

    // 로그인 탭 스크린샷
    await page.screenshot({ path: 'social-login-signin.png' });

    // 회원가입 탭 클릭
    const signupTab = page.getByRole('tab', { name: '회원가입' });
    if (await signupTab.isVisible()) {
      console.log('📝 회원가입 탭 클릭...');
      await signupTab.click();
      await page.waitForTimeout(1000);
    }

    // 회원가입 탭의 소셜 로그인 버튼들 확인
    console.log('🔍 회원가입 탭의 소셜 로그인 버튼들 확인...');
    
    const kakaoSignupButton = page.locator('button:has-text("카카오로 가입")');
    const naverSignupButton = page.locator('button:has-text("네이버로 가입")');
    const googleSignupButton = page.locator('button:has-text("구글로 가입")');

    if (await kakaoSignupButton.isVisible()) {
      console.log('✅ 카카오로 가입 버튼 발견');
    } else {
      console.log('❌ 카카오로 가입 버튼 없음');
    }

    if (await naverSignupButton.isVisible()) {
      console.log('✅ 네이버로 가입 버튼 발견');
    } else {
      console.log('❌ 네이버로 가입 버튼 없음');
    }

    if (await googleSignupButton.isVisible()) {
      console.log('✅ 구글로 가입 버튼 발견');
    } else {
      console.log('❌ 구글로 가입 버튼 없음');
    }

    // 회원가입 탭 스크린샷
    await page.screenshot({ path: 'social-login-signup.png' });

    // 버튼 색상 확인
    console.log('🎨 버튼 색상 스타일 확인...');
    
    const kakaoStyle = await kakaoSignupButton.getAttribute('class');
    const naverStyle = await naverSignupButton.getAttribute('class');
    const googleStyle = await googleSignupButton.getAttribute('class');

    console.log('📋 카카오 버튼 스타일:', kakaoStyle);
    console.log('📋 네이버 버튼 스타일:', naverStyle);
    console.log('📋 구글 버튼 스타일:', googleStyle);

    // 기능 테스트 (실제 OAuth는 작동하지 않지만 클릭 이벤트 확인)
    console.log('🧪 버튼 클릭 기능 테스트...');
    
    // 카카오 버튼 클릭 시도
    try {
      await kakaoSignupButton.click();
      console.log('✅ 카카오 버튼 클릭 성공');
      await page.waitForTimeout(2000);
    } catch (error) {
      console.log('⚠️ 카카오 버튼 클릭 중 오류:', error.message);
    }

    console.log('🎉 소셜 로그인 UI 테스트 완료!');

  } catch (error) {
    console.error('❌ 소셜 로그인 UI 테스트 중 오류 발생:', error);
  } finally {
    await browser.close();
  }
}

testSocialLoginUI().catch(console.error);