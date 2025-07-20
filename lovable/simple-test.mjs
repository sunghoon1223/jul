import { chromium } from 'playwright';

async function simpleTest() {
  console.log('🧪 간단 기능 테스트 시작...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 1. 홈페이지 확인
    console.log('📍 1. 홈페이지 기본 확인...');
    await page.goto('http://localhost:8081');
    await page.waitForTimeout(3000);
    
    const title = await page.title();
    console.log('✅ 페이지 제목:', title);
    
    const logoText = await page.textContent('a[href="/"] div');
    console.log('✅ 헤더 로고:', logoText);
    
    await page.screenshot({ path: 'simple-homepage.png' });
    
    // 2. 회원가입 테스트
    console.log('📍 2. 회원가입 테스트...');
    await page.goto('http://localhost:8081/auth?mode=signup');
    await page.waitForTimeout(2000);
    
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'password123');
    await page.fill('#confirmPassword', 'password123');
    await page.fill('#name', '테스트 사용자');
    await page.fill('#phone', '010-1234-5678');
    
    await page.check('#agreeTerms');
    await page.check('#agreePrivacy');
    
    console.log('회원가입 폼 작성 완료, 제출 시도...');
    await page.click('button[type="submit"]:has-text("회원가입")');
    await page.waitForTimeout(3000);
    
    console.log('현재 URL:', page.url());
    
    // 3. 로그인 테스트
    console.log('📍 3. 로그인 테스트...');
    await page.goto('http://localhost:8081/auth?mode=login');
    await page.waitForTimeout(1000);
    
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'password123');
    
    console.log('로그인 폼 작성 완료, 제출 시도...');
    await page.click('button[type="submit"]:has-text("로그인")');
    await page.waitForTimeout(3000);
    
    console.log('로그인 후 URL:', page.url());
    
    // 4. 소셜 로그인 버튼 테스트
    console.log('📍 4. 소셜 로그인 버튼 테스트...');
    await page.goto('http://localhost:8081/auth?mode=login');
    await page.waitForTimeout(1000);
    
    console.log('Google 로그인 버튼 클릭...');
    await page.click('button:has-text("Google로 계속하기")');
    await page.waitForTimeout(2000);
    
    console.log('Google 로그인 후 URL:', page.url());
    
    console.log('Kakao 로그인 버튼 클릭...');
    await page.goto('http://localhost:8081/auth?mode=login');
    await page.waitForTimeout(1000);
    await page.click('button:has-text("카카오로 계속하기")');
    await page.waitForTimeout(2000);
    
    console.log('Kakao 로그인 후 URL:', page.url());
    
    await page.screenshot({ path: 'simple-final.png' });
    
    console.log('✅ 모든 기본 테스트 완료!');
    
  } catch (error) {
    console.error('❌ 테스트 에러:', error.message);
    await page.screenshot({ path: 'simple-error.png' });
  } finally {
    await browser.close();
  }
}

simpleTest();