import { chromium } from 'playwright';

async function debugSocialLogin() {
  console.log('🔍 소셜 로그인 디버깅...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 콘솔 메시지 캡처
  page.on('console', msg => {
    if (msg.type() === 'log') {
      console.log('🟢 브라우저 LOG:', msg.text());
    } else if (msg.type() === 'error') {
      console.log('🔴 브라우저 ERROR:', msg.text());
    }
  });
  
  try {
    await page.goto('http://localhost:8081/auth?mode=login');
    await page.waitForTimeout(2000);
    
    console.log('📍 Google 로그인 테스트...');
    await page.click('button:has-text("Google로 계속하기")');
    await page.waitForTimeout(5000);
    
    console.log('Google 로그인 후 URL:', page.url());
    
    // 페이지의 현재 상태 확인
    const userButton = await page.$('button[aria-haspopup="menu"]');
    console.log('사용자 메뉴 버튼 존재:', !!userButton);
    
    if (userButton) {
      console.log('✅ 로그인 상태 확인됨');
    } else {
      console.log('❌ 로그인 상태가 확인되지 않음');
    }
    
    await page.screenshot({ path: 'debug-google-login.png' });
    
  } catch (error) {
    console.error('❌ 디버깅 에러:', error.message);
  } finally {
    await browser.close();
  }
}

debugSocialLogin();