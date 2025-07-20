import { chromium } from 'playwright';
import fs from 'fs';

async function testAllFeatures() {
  console.log('🚀 모든 기능 테스트 시작...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 1. 홈페이지 접속 및 기본 요소 확인
    console.log('📍 1. 홈페이지 접속 및 기본 확인...');
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(2000);
    
    // 페이지 제목 확인
    const title = await page.title();
    console.log('페이지 제목:', title);
    
    // favicon 확인
    const faviconLink = await page.$('link[rel="icon"]');
    if (faviconLink) {
      const faviconHref = await faviconLink.getAttribute('href');
      console.log('Favicon 경로:', faviconHref);
    }
    
    // 헤더 로고 확인
    const logoElement = await page.$('a[href="/"] div');
    if (logoElement) {
      const logoText = await logoElement.textContent();
      console.log('헤더 로고 텍스트:', logoText);
    }
    
    // 관리자 버튼 확인
    const adminButton = await page.$('button:has-text("관리자")');
    if (adminButton) {
      console.log('✅ 관리자 버튼 텍스트 확인됨');
      const hasIcon = await adminButton.$('svg');
      if (!hasIcon) {
        console.log('✅ 관리자 버튼에 아이콘 없음 확인');
      } else {
        console.log('❌ 관리자 버튼에 아직 아이콘이 있음');
      }
    }
    
    await page.screenshot({ path: 'homepage-check.png' });
    
    // 2. 회원가입 페이지 테스트
    console.log('📍 2. 회원가입 페이지 테스트...');
    await page.goto('http://localhost:8080/auth?mode=signup');
    await page.waitForTimeout(1000);
    
    // 소셜 로그인 버튼 확인
    const googleButton = await page.$('button:has-text("Google로 계속하기")');
    const kakaoButton = await page.$('button:has-text("카카오로 계속하기")');
    
    console.log('Google 버튼 존재:', !!googleButton);
    console.log('Kakao 버튼 존재:', !!kakaoButton);
    
    await page.screenshot({ path: 'signup-page.png' });
    
    // 3. Google 로그인 버튼 클릭 테스트
    console.log('📍 3. Google 로그인 버튼 클릭 테스트...');
    if (googleButton) {
      console.log('Google 버튼 클릭 시도...');
      
      // 콘솔 에러 리스너 추가
      page.on('console', msg => {
        if (msg.type() === 'error') {
          console.log('❌ 콘솔 에러:', msg.text());
        }
      });
      
      // 네트워크 요청 모니터링
      page.on('request', request => {
        if (request.url().includes('supabase') || request.url().includes('google')) {
          console.log('🌐 요청:', request.method(), request.url());
        }
      });
      
      try {
        await googleButton.click();
        await page.waitForTimeout(3000);
        console.log('Google 버튼 클릭 완료');
      } catch (error) {
        console.log('❌ Google 버튼 클릭 에러:', error.message);
      }
    }
    
    // 4. 일반 회원가입 테스트
    console.log('📍 4. 일반 회원가입 테스트...');
    await page.goto('http://localhost:8080/auth?mode=signup');
    await page.waitForTimeout(1000);
    
    // 테스트 데이터 입력
    await page.fill('#email', 'test@test.com');
    await page.fill('#password', 'testpassword123');
    await page.fill('#confirmPassword', 'testpassword123');
    await page.fill('#name', '테스트사용자');
    await page.fill('#phone', '010-1234-5678');
    
    // 약관 동의 체크박스
    await page.check('#agreeTerms');
    await page.check('#agreePrivacy');
    
    await page.screenshot({ path: 'signup-form-filled.png' });
    
    // 회원가입 버튼 클릭
    console.log('회원가입 버튼 클릭...');
    const signupButton = await page.$('button[type="submit"]:has-text("회원가입")');
    if (signupButton) {
      try {
        await signupButton.click();
        await page.waitForTimeout(3000);
        console.log('회원가입 버튼 클릭 완료');
      } catch (error) {
        console.log('❌ 회원가입 에러:', error.message);
      }
    }
    
    // 5. 로그인 페이지 테스트
    console.log('📍 5. 로그인 페이지 테스트...');
    await page.goto('http://localhost:8080/auth?mode=login');
    await page.waitForTimeout(1000);
    
    await page.fill('#email', 'test@test.com');
    await page.fill('#password', 'testpassword123');
    
    await page.screenshot({ path: 'login-form-filled.png' });
    
    const loginButton = await page.$('button[type="submit"]:has-text("로그인")');
    if (loginButton) {
      try {
        await loginButton.click();
        await page.waitForTimeout(3000);
        console.log('로그인 버튼 클릭 완료');
      } catch (error) {
        console.log('❌ 로그인 에러:', error.message);
      }
    }
    
    // 최종 스크린샷
    await page.screenshot({ path: 'final-test-result.png' });
    
    // 테스트 결과 정리
    const results = {
      timestamp: new Date().toISOString(),
      tests: {
        pageTitle: title,
        faviconPath: faviconHref || 'not found',
        logoText: logoText || 'not found',
        adminButtonFound: !!adminButton,
        googleButtonFound: !!googleButton,
        kakaoButtonFound: !!kakaoButton
      }
    };
    
    fs.writeFileSync('test-results.json', JSON.stringify(results, null, 2));
    console.log('✅ 테스트 결과 저장 완료');
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
    await page.screenshot({ path: 'error-screenshot.png' });
  } finally {
    await browser.close();
  }
}

testAllFeatures();