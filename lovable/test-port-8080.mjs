import { chromium } from 'playwright';

async function testPort8080() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('🎯 8080 포트 테스트 시작...');
  
  // 콘솔 로그 수집
  page.on('console', msg => {
    console.log(`📊 브라우저 콘솔: ${msg.text()}`);
  });
  
  // 페이지 오류 수집
  page.on('pageerror', error => {
    console.log(`❌ 페이지 오류: ${error.message}`);
  });
  
  // 네트워크 요청 실패 수집
  page.on('requestfailed', request => {
    console.log(`🚫 네트워크 실패: ${request.url()}`);
  });
  
  try {
    // 8080 포트로 접속
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
    console.log('✅ 페이지 로드 완료');
    
    // 스크린샷 캡처
    await page.screenshot({ path: 'port-8080-test.png', fullPage: true });
    console.log('📸 스크린샷 저장: port-8080-test.png');
    
    // 환경 변수 상태 확인
    const envState = await page.evaluate(() => {
      return {
        hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
        hasGeminiKey: !!import.meta.env.VITE_GEMINI_API_KEY,
        mode: import.meta.env.MODE,
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL?.substring(0, 30) + '...'
      };
    });
    
    console.log('🔧 환경 변수 상태:', envState);
    
    // 페이지 내용 확인
    const pageContent = await page.textContent('body');
    if (pageContent && pageContent.trim().length > 0) {
      console.log('✅ 페이지 내용 로드됨');
      console.log('📄 페이지 내용 길이:', pageContent.length);
    } else {
      console.log('❌ 페이지 내용 없음 (화이트 스크린)');
    }
    
    // 테스트 메시지 확인
    const testMessage = await page.textContent('h1');
    if (testMessage) {
      console.log('🎉 테스트 메시지:', testMessage);
    }
    
    // 5초 대기 후 종료
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    await page.screenshot({ path: 'port-8080-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testPort8080().catch(console.error);