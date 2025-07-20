import { chromium } from 'playwright';

async function debugLoadingIssue() {
  console.log('🔍 페이지 로딩 사라짐 문제 디버깅...\n');
  
  const browser = await chromium.launch({ 
    headless: false, // 브라우저 화면 보기
    slowMo: 500 // 느린 모션으로 관찰
  });
  const page = await browser.newPage();
  
  // 로딩 상태 추적
  let loadingStates = [];
  let contentStates = [];
  
  // 페이지 이벤트 모니터링
  page.on('domcontentloaded', () => {
    console.log('📄 DOM Content Loaded');
    loadingStates.push('DOM_LOADED');
  });
  
  page.on('load', () => {
    console.log('✅ Page Load Complete');
    loadingStates.push('PAGE_LOADED');
  });
  
  // 네트워크 모니터링
  page.on('response', response => {
    const url = response.url();
    const status = response.status();
    
    if (url.includes('studio-sb.com') && (status >= 400 || url.includes('js') || url.includes('css'))) {
      console.log(`📡 [${status}] ${url}`);
    }
  });
  
  // 콘솔 에러 모니터링
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`🚨 Console Error: ${msg.text()}`);
    }
  });
  
  try {
    console.log('📍 사이트 접속 시작...');
    await page.goto('https://studio-sb.com', { waitUntil: 'domcontentloaded' });
    
    // 단계별 상태 체크
    for (let i = 0; i < 10; i++) {
      await page.waitForTimeout(1000);
      
      const bodyText = await page.textContent('body');
      const visibleElements = await page.$$eval('*', elements => 
        elements.filter(el => {
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && 
                 style.visibility !== 'hidden' && 
                 el.offsetWidth > 0 && 
                 el.offsetHeight > 0;
        }).length
      );
      
      const loadingIndicators = await page.$$eval('[class*="loading"], [class*="spinner"], [class*="skeleton"]', els => els.length);
      
      contentStates.push({
        time: i + 1,
        bodyLength: bodyText?.length || 0,
        visibleElements,
        loadingIndicators,
        hasContent: bodyText && bodyText.length > 100
      });
      
      console.log(`⏰ ${i+1}초: 텍스트=${bodyText?.length || 0}, 요소=${visibleElements}, 로딩=${loadingIndicators}`);
      
      // 스크린샷 저장 (처음 5초만)
      if (i < 5) {
        await page.screenshot({ path: `loading-state-${i+1}s.png` });
      }
    }
    
    // React 에러 체크
    const reactErrors = await page.evaluate(() => {
      return window.React && window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?.ReactCurrentOwner?.current;
    });
    
    console.log('\n📊 로딩 상태 분석:');
    console.log('이벤트 순서:', loadingStates);
    
    console.log('\n📈 컨텐츠 변화:');
    contentStates.forEach(state => {
      const status = state.hasContent ? '✅' : '❌';
      console.log(`${status} ${state.time}초: 텍스트=${state.bodyLength}, 요소=${state.visibleElements}`);
    });
    
    // 패턴 분석
    const initialContent = contentStates[0]?.hasContent;
    const finalContent = contentStates[contentStates.length - 1]?.hasContent;
    
    if (initialContent && !finalContent) {
      console.log('\n🔴 문제 패턴: 초기 로딩 후 컨텐츠 사라짐');
      console.log('원인 추정: JavaScript 실행 중 에러 또는 React hydration 실패');
    } else if (!initialContent && !finalContent) {
      console.log('\n🔴 문제 패턴: 컨텐츠가 전혀 로드되지 않음');
      console.log('원인 추정: JavaScript 파일 로딩 실패 또는 라우팅 문제');
    } else {
      console.log('\n✅ 문제 없음: 컨텐츠 정상 유지');
    }
    
  } catch (error) {
    console.error('❌ 디버깅 실패:', error.message);
  }
  
  await browser.close();
  console.log('\n✅ 로딩 문제 디버깅 완료');
}

debugLoadingIssue().catch(console.error);