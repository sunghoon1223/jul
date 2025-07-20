import { chromium } from 'playwright';

async function openBrowserForUser() {
  console.log('🌐 브라우저를 열어드리겠습니다...');
  console.log('📍 URL: http://localhost:8080');
  console.log('👀 화이트 스크린 여부를 직접 확인해보세요!');
  console.log('');
  
  const browser = await chromium.launch({ 
    headless: false,  // 실제 브라우저 창 표시
    slowMo: 100,      // 동작을 천천히 하여 보기 좋게
    args: ['--start-maximized']  // 최대화된 창으로 시작
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🔄 페이지 로딩 중...');
    await page.goto('http://localhost:8080', { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    
    console.log('✅ 페이지 로드 완료!');
    console.log('');
    console.log('🔍 확인사항:');
    console.log('  1. 화이트 스크린이 아닌 실제 콘텐츠가 보이는지');
    console.log('  2. "Korean Caster" 로고가 표시되는지');
    console.log('  3. 제품 카테고리들이 보이는지');
    console.log('  4. 헤더 메뉴가 정상적으로 보이는지');
    console.log('');
    console.log('💡 브라우저 창을 닫으면 테스트가 종료됩니다.');
    console.log('📝 결과를 확인한 후 브라우저를 닫아주세요.');
    
    // 페이지 내용 확인
    const content = await page.textContent('body');
    const hasContent = content && content.trim().length > 0;
    
    console.log('');
    console.log('📊 자동 검사 결과:');
    console.log('  - 콘텐츠 길이:', content?.length || 0, '문자');
    console.log('  - 화이트 스크린 여부:', hasContent ? '❌ 아님 (정상)' : '✅ 화이트 스크린 (문제)');
    
    // 브라우저 창이 닫힐 때까지 대기
    await page.waitForEvent('close', { timeout: 300000 }); // 5분 대기
    
  } catch (error) {
    if (error.message.includes('Page closed')) {
      console.log('');
      console.log('✅ 브라우저가 닫혔습니다. 확인 완료!');
    } else {
      console.error('❌ 오류 발생:', error.message);
    }
  } finally {
    await browser.close();
    console.log('🏁 브라우저 테스트 완료');
  }
}

openBrowserForUser().catch(console.error);