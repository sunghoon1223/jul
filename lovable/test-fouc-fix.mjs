import { chromium } from 'playwright';

async function testFOUCFix() {
  console.log('🔍 FOUC 수정 사항 테스트...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 300
  });
  const page = await browser.newPage();
  
  // 네트워크 속도 제한 (느린 연결 시뮬레이션)
  const client = await page.context().newCDPSession(page);
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: 500000,  // 0.5Mbps
    uploadThroughput: 250000,    // 0.25Mbps
    latency: 200                 // 200ms 지연
  });
  
  // 캐시 비활성화
  await page.route('**/*', route => {
    route.continue({
      headers: {
        ...route.request().headers(),
        'Cache-Control': 'no-cache'
      }
    });
  });
  
  let states = [];
  let loadingScreenVisible = false;
  let contentVisible = false;
  
  // 네트워크 모니터링
  page.on('response', response => {
    const url = response.url();
    const status = response.status();
    
    if (url.includes('studio-sb.com') && (url.includes('index.html') || url.includes('js') || url.includes('css'))) {
      console.log(`📡 [${status}] ${url.split('/').pop()}`);
    }
  });
  
  console.log('🐌 느린 네트워크 조건에서 사이트 접속...');
  await page.goto('https://studio-sb.com', { waitUntil: 'domcontentloaded' });
  
  // 15초간 상태 모니터링
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(500);
    
    try {
      // 로딩 스크린 확인
      const loaderVisible = await page.isVisible('#initial-loader:not(.fade-out)');
      
      // 메인 컨텐츠 확인
      const bodyText = await page.textContent('body');
      const hasMainContent = bodyText && bodyText.includes('JP Caster') && bodyText.length > 1000;
      
      // React 앱 컨테이너 확인
      const appLoaded = await page.evaluate(() => {
        const root = document.getElementById('root');
        return root && root.children.length > 0 && root.classList.contains('loaded');
      });
      
      const state = {
        time: (i + 1) * 0.5,
        loaderVisible,
        hasMainContent,
        appLoaded,
        bodyLength: bodyText?.length || 0
      };
      
      states.push(state);
      
      // 상태 변화 감지
      if (loaderVisible && !loadingScreenVisible) {
        loadingScreenVisible = true;
        console.log(`⏰ ${state.time}초: 🔄 로딩 스크린 표시됨`);
      }
      
      if (hasMainContent && !contentVisible) {
        contentVisible = true;
        console.log(`⏰ ${state.time}초: ✅ 메인 컨텐츠 로드됨`);
      }
      
      if (appLoaded) {
        console.log(`⏰ ${state.time}초: 🎯 React 앱 완전 로드됨`);
      }
      
      // 매 2초마다 상태 출력
      if (i % 4 === 0) {
        const status = hasMainContent ? '✅' : (loaderVisible ? '🔄' : '❌');
        console.log(`${status} ${state.time}초: 로더=${loaderVisible ? 'Y' : 'N'}, 컨텐츠=${hasMainContent ? 'Y' : 'N'}, 앱=${appLoaded ? 'Y' : 'N'}`);
      }
      
      // 처음 10초 스크린샷
      if (i < 20) {
        await page.screenshot({ path: `fouc-test-${state.time}s.png` });
      }
      
    } catch (error) {
      console.log(`⚠️ ${(i + 1) * 0.5}초: 측정 오류 - ${error.message}`);
    }
  }
  
  console.log('\n📊 FOUC 테스트 결과 분석:');
  
  // 로딩 경험 분석
  const initialStates = states.slice(0, 6); // 첫 3초
  const hasFlash = initialStates.some((state, i) => {
    const nextState = initialStates[i + 1];
    return state.hasMainContent && nextState && !nextState.hasMainContent;
  });
  
  const loaderWasVisible = states.some(state => state.loaderVisible);
  const contentEventuallyLoaded = states.some(state => state.hasMainContent);
  const appEventuallyLoaded = states.some(state => state.appLoaded);
  
  console.log(`🔄 로딩 스크린 표시: ${loaderWasVisible ? '✅' : '❌'}`);
  console.log(`📄 컨텐츠 로드: ${contentEventuallyLoaded ? '✅' : '❌'}`);
  console.log(`⚛️ React 앱 로드: ${appEventuallyLoaded ? '✅' : '❌'}`);
  console.log(`⚡ FOUC 발생: ${hasFlash ? '❌ 여전히 있음' : '✅ 해결됨'}`);
  
  // 로딩 시간 측정
  const firstContentTime = states.find(state => state.hasMainContent)?.time;
  const appLoadTime = states.find(state => state.appLoaded)?.time;
  
  if (firstContentTime) {
    console.log(`⏱️ 첫 컨텐츠 표시: ${firstContentTime}초`);
  }
  if (appLoadTime) {
    console.log(`⏱️ 앱 완전 로드: ${appLoadTime}초`);
  }
  
  // 카테고리 네비게이션 테스트
  console.log('\n🔍 카테고리 페이지 네비게이션 테스트...');
  
  try {
    await page.click('a[href*="products"]');
    await page.waitForTimeout(2000);
    
    const categoryContent = await page.textContent('body');
    const productCards = await page.$$eval('[class*="product"], [class*="card"]', cards => cards.length);
    
    console.log(`📦 카테고리 페이지: ${categoryContent?.length || 0} 글자, ${productCards} 제품`);
    console.log(`🎯 카테고리 네비게이션: ${productCards > 0 ? '✅ 성공' : '❌ 실패'}`);
    
    await page.screenshot({ path: 'category-page-final.png' });
    
  } catch (error) {
    console.log(`❌ 카테고리 테스트 실패: ${error.message}`);
  }
  
  await browser.close();
  
  console.log('\n🏆 FOUC 수정 테스트 완료!');
  console.log(`전체 평가: ${!hasFlash && loaderWasVisible && contentEventuallyLoaded ? '✅ 성공적으로 해결됨' : '⚠️ 추가 개선 필요'}`);
}

testFOUCFix().catch(console.error);