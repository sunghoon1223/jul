import { chromium } from 'playwright';

async function debugSite() {
  console.log('🔍 Studio-sb.com 사이트 디버깅 시작...\n');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // 네트워크 요청 모니터링
  page.on('response', response => {
    const status = response.status();
    const url = response.url();
    
    if (status >= 400) {
      console.log(`❌ [${status}] ${url}`);
    } else if (url.includes('assets/') || url.includes('data/') || url.includes('images/')) {
      console.log(`✅ [${status}] ${url}`);
    }
  });
  
  // 콘솔 에러 모니터링
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`🚨 Console Error: ${msg.text()}`);
    }
  });
  
  try {
    console.log('📍 사이트 접속 중...');
    await page.goto('https://studio-sb.com', { waitUntil: 'networkidle' });
    
    // 페이지 타이틀 확인
    const title = await page.title();
    console.log(`📄 페이지 타이틀: ${title}`);
    
    // body 내용 확인
    const bodyText = await page.textContent('body');
    console.log(`📝 Body 내용 길이: ${bodyText?.length || 0} 문자`);
    
    // 실제 화면에 표시되는 요소들 확인
    const visibleElements = await page.$$eval('*', elements => 
      elements.filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               el.offsetWidth > 0 && 
               el.offsetHeight > 0;
      }).length
    );
    
    console.log(`👁️ 화면에 표시되는 요소 수: ${visibleElements}`);
    
    // JavaScript 에러 체크
    const jsErrors = await page.evaluate(() => {
      return window.jsErrors || [];
    });
    
    console.log(`\n📊 최종 분석:`);
    console.log(`- 페이지 로드 상태: ${visibleElements > 5 ? '정상' : '문제 있음'}`);
    console.log(`- JavaScript 실행: ${bodyText && bodyText.length > 100 ? '정상' : '실패'}`);
    
    // 스크린샷 저장
    await page.screenshot({ path: 'site-debug.png', fullPage: true });
    console.log(`📸 스크린샷 저장: site-debug.png`);
    
  } catch (error) {
    console.error('❌ 사이트 접속 실패:', error.message);
  }
  
  await browser.close();
  console.log('\n✅ 디버깅 완료');
}

debugSite().catch(console.error);