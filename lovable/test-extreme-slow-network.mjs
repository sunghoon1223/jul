import { chromium } from 'playwright';

async function testExtremeSlowNetwork() {
  console.log('🔍 극도로 느린 네트워크에서 FOUC 테스트...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 200
  });
  const page = await browser.newPage();
  
  // 매우 느린 네트워크 조건
  const client = await page.context().newCDPSession(page);
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: 50000,   // 50KB/s (매우 느림)
    uploadThroughput: 25000,     // 25KB/s
    latency: 500                 // 500ms 지연
  });
  
  // 캐시 완전 비활성화
  await page.route('**/*', async route => {
    // 요청을 인위적으로 지연
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
    
    route.continue({
      headers: {
        ...route.request().headers(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  });
  
  let states = [];
  let firstLoaderSeen = false;
  let loaderHidden = false;
  
  console.log('🐌 극도로 느린 네트워크 조건에서 사이트 접속...');
  console.log('⏳ 로딩 상태 모니터링 시작...\n');
  
  // 페이지 이동 시작
  const navigationPromise = page.goto('https://studio-sb.com', { 
    waitUntil: 'domcontentloaded',
    timeout: 30000 
  });
  
  // 20초간 상태 모니터링
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(500);
    
    try {
      // DOM 요소들 확인
      const loaderExists = await page.$('#initial-loader');
      const loaderVisible = loaderExists ? await page.isVisible('#initial-loader:not(.fade-out)') : false;
      const loaderFading = loaderExists ? await page.isVisible('#initial-loader.fade-out') : false;
      
      // 컨텐츠 확인
      const bodyText = await page.textContent('body').catch(() => '');
      const rootContent = await page.$eval('#root', el => el.children.length).catch(() => 0);
      const hasRealContent = bodyText.includes('JP Caster') && bodyText.length > 500;
      
      // 스피너 확인
      const spinnerVisible = await page.isVisible('.spinner').catch(() => false);
      
      const state = {
        time: (i + 1) * 0.5,
        loaderExists: !!loaderExists,
        loaderVisible,
        loaderFading,
        spinnerVisible,
        hasRealContent,
        rootContent,
        bodyLength: bodyText.length
      };
      
      states.push(state);
      
      // 중요한 상태 변화 감지
      if (loaderVisible && !firstLoaderSeen) {
        firstLoaderSeen = true;
        console.log(`🔄 ${state.time}초: 로딩 스크린 표시 시작!`);
      }
      
      if (firstLoaderSeen && !loaderVisible && !loaderHidden) {
        loaderHidden = true;
        console.log(`✅ ${state.time}초: 로딩 스크린 숨김 완료!`);
      }
      
      if (hasRealContent) {
        console.log(`📄 ${state.time}초: 실제 컨텐츠 로드됨!`);
      }
      
      // 2초마다 상태 출력
      if (i % 4 === 0) {
        const status = hasRealContent ? '✅' : (loaderVisible ? '🔄' : (loaderExists ? '⏳' : '❌'));
        console.log(`${status} ${state.time}초: 로더=${loaderVisible ? 'Y' : 'N'}, 스피너=${spinnerVisible ? 'Y' : 'N'}, 컨텐츠=${hasRealContent ? 'Y' : 'N'} (${bodyText.length}자)`);
      }
      
      // 스크린샷 (처음 10초)
      if (i < 20) {
        await page.screenshot({ path: `extreme-slow-${state.time}s.png` });
      }
      
    } catch (error) {
      console.log(`⚠️ ${(i + 1) * 0.5}초: 측정 오류 - ${error.message}`);
    }
  }
  
  // 네비게이션 완료 대기
  try {
    await navigationPromise;
    console.log('✅ 페이지 네비게이션 완료');
  } catch (error) {
    console.log(`⚠️ 네비게이션 타임아웃: ${error.message}`);
  }
  
  console.log('\n📊 극도로 느린 네트워크에서의 로딩 경험 분석:');
  
  // 로딩 경험 분석
  const loaderShown = states.some(state => state.loaderVisible);
  const contentLoaded = states.some(state => state.hasRealContent);
  const smoothTransition = states.filter(state => state.loaderFading).length > 0;
  
  console.log(`🔄 로딩 스크린 표시됨: ${loaderShown ? '✅' : '❌'}`);
  console.log(`📄 컨텐츠 최종 로드: ${contentLoaded ? '✅' : '❌'}`);
  console.log(`🎭 부드러운 전환: ${smoothTransition ? '✅' : '❌'}`);
  
  // 시간 측정
  const firstLoaderTime = states.find(state => state.loaderVisible)?.time;
  const firstContentTime = states.find(state => state.hasRealContent)?.time;
  const loaderHideTime = states.find(state => state.loaderFading)?.time;
  
  if (firstLoaderTime) {
    console.log(`⏱️ 로딩 스크린 첫 표시: ${firstLoaderTime}초`);
  }
  if (firstContentTime) {
    console.log(`⏱️ 첫 컨텐츠 로드: ${firstContentTime}초`);
  }
  if (loaderHideTime) {
    console.log(`⏱️ 로딩 스크린 숨김: ${loaderHideTime}초`);
  }
  
  // FOUC 검사
  let foucDetected = false;
  for (let i = 0; i < states.length - 1; i++) {
    const current = states[i];
    const next = states[i + 1];
    
    if (current.hasRealContent && !next.hasRealContent) {
      foucDetected = true;
      console.log(`⚡ FOUC 감지: ${current.time}초 -> ${next.time}초`);
    }
  }
  
  console.log(`⚡ FOUC 발생: ${foucDetected ? '❌ 감지됨' : '✅ 없음'}`);
  
  await browser.close();
  
  console.log('\n🏆 극도로 느린 네트워크 테스트 완료!');
  console.log(`최종 평가: ${loaderShown && contentLoaded && !foucDetected ? '✅ FOUC 완벽 해결' : '⚠️ 추가 최적화 필요'}`);
}

testExtremeSlowNetwork().catch(console.error);