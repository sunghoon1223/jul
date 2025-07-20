import { chromium } from 'playwright';

async function debugCategoryNavigation() {
  console.log('🔍 카테고리 페이지 네비게이션 로딩 문제 디버깅...\n');
  
  const browser = await chromium.launch({ 
    headless: false, // 브라우저 화면 보기
    slowMo: 300 // 느린 모션으로 관찰
  });
  const page = await browser.newPage();
  
  // 로딩 상태 추적
  let navigationStates = [];
  
  // 네트워크 모니터링
  page.on('response', response => {
    const url = response.url();
    const status = response.status();
    
    if (url.includes('studio-sb.com')) {
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
    console.log('📍 메인 페이지 접속...');
    await page.goto('https://studio-sb.com', { waitUntil: 'networkidle' });
    
    // 메인 페이지 상태 확인
    const mainBodyText = await page.textContent('body');
    console.log(`✅ 메인 페이지 로드됨: ${mainBodyText?.length || 0} 글자`);
    await page.screenshot({ path: 'main-page-loaded.png' });
    
    // 카테고리 링크 찾기
    console.log('\n🔍 카테고리 링크 찾는 중...');
    const categoryLinks = await page.$$eval('a[href*="products"]', links =>
      links.map(link => ({
        text: link.textContent.trim(),
        href: link.href
      })).filter(link => link.text && link.href)
    );
    
    console.log('발견된 카테고리 링크들:');
    categoryLinks.forEach((link, i) => {
      console.log(`${i+1}. "${link.text}" -> ${link.href}`);
    });
    
    if (categoryLinks.length === 0) {
      console.log('❌ 카테고리 링크를 찾을 수 없습니다!');
      return;
    }
    
    // 첫 번째 카테고리 링크 클릭
    const targetLink = categoryLinks[0];
    console.log(`\n🎯 클릭할 링크: "${targetLink.text}" -> ${targetLink.href}`);
    
    // 클릭하기 전 상태
    await page.screenshot({ path: 'before-category-click.png' });
    
    // 링크 클릭
    console.log('\n👆 카테고리 링크 클릭...');
    await page.click(`a[href*="products"]`);
    
    // 클릭 직후부터 상태 모니터링
    console.log('\n⏱️ 클릭 후 상태 모니터링:');
    
    for (let i = 0; i < 15; i++) {
      await page.waitForTimeout(500);
      
      const currentUrl = page.url();
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
      
      // 제품 카드 수 확인
      const productCards = await page.$$eval('[class*="product"], [class*="card"]', cards => cards.length);
      
      // 로딩 인디케이터 확인
      const loadingIndicators = await page.$$eval('[class*="loading"], [class*="spinner"], [class*="skeleton"]', els => els.length);
      
      const state = {
        time: (i + 1) * 0.5,
        url: currentUrl,
        bodyLength: bodyText?.length || 0,
        visibleElements,
        productCards,
        loadingIndicators,
        hasContent: bodyText && bodyText.length > 100
      };
      
      navigationStates.push(state);
      
      const status = state.hasContent ? '✅' : '❌';
      console.log(`${status} ${state.time}초: URL=${currentUrl.includes('products') ? '카테고리' : '메인'}, 텍스트=${state.bodyLength}, 제품=${state.productCards}, 로딩=${state.loadingIndicators}`);
      
      // 처음 5초 동안 스크린샷
      if (i < 10) {
        await page.screenshot({ path: `category-nav-${state.time}s.png` });
      }
      
      // URL이 변경되면 추가 대기
      if (currentUrl.includes('products') && i === 2) {
        console.log('📍 카테고리 페이지 URL 확인됨, 추가 로딩 대기...');
      }
    }
    
    console.log('\n📊 네비게이션 분석:');
    
    // URL 변경 확인
    const urlChanged = navigationStates.some(state => state.url.includes('products'));
    console.log(`URL 변경: ${urlChanged ? '✅' : '❌'}`);
    
    // 컨텐츠 사라짐 패턴 분석
    const initialContent = navigationStates[0]?.hasContent;
    const midContent = navigationStates[5]?.hasContent; // 2.5초 후
    const finalContent = navigationStates[navigationStates.length - 1]?.hasContent;
    
    console.log(`초기 컨텐츠: ${initialContent ? '✅' : '❌'}`);
    console.log(`중간 컨텐츠: ${midContent ? '✅' : '❌'}`);
    console.log(`최종 컨텐츠: ${finalContent ? '✅' : '❌'}`);
    
    if (initialContent && !midContent) {
      console.log('\n🔴 문제 발견: 카테고리 네비게이션 시 컨텐츠 사라짐');
      console.log('원인 추정: React Router 네비게이션 중 렌더링 실패');
    } else if (!finalContent) {
      console.log('\n🔴 문제 발견: 카테고리 페이지 로딩 실패');
      console.log('원인 추정: 라우팅 문제 또는 데이터 로딩 실패');
    } else {
      console.log('\n✅ 정상: 카테고리 네비게이션 성공');
    }
    
    // 최종 스크린샷
    await page.screenshot({ path: 'final-category-page.png' });
    
  } catch (error) {
    console.error('❌ 디버깅 실패:', error.message);
    await page.screenshot({ path: 'error-state.png' });
  }
  
  await browser.close();
  console.log('\n✅ 카테고리 네비게이션 디버깅 완료');
}

debugCategoryNavigation().catch(console.error);