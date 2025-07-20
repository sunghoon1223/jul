import { chromium, firefox, webkit } from 'playwright';

async function checkBrowserCompatibility() {
  console.log('🌐 다양한 브라우저에서 호환성 테스트...\n');
  
  const browsers = [
    { name: 'Chromium', launch: chromium },
    { name: 'Firefox', launch: firefox },
    { name: 'Safari/WebKit', launch: webkit }
  ];
  
  for (const browserInfo of browsers) {
    console.log(`\n🔍 ${browserInfo.name} 테스트 시작...`);
    
    try {
      const browser = await browserInfo.launch.launch();
      const page = await browser.newPage();
      
      let errors = [];
      let networkIssues = [];
      
      // 에러 수집
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      page.on('response', response => {
        if (response.status() >= 400) {
          networkIssues.push(`${response.status()} - ${response.url()}`);
        }
      });
      
      // 메인 페이지 테스트
      console.log('📍 메인 페이지 접속...');
      await page.goto('https://studio-sb.com', { waitUntil: 'networkidle' });
      
      const mainContent = await page.textContent('body');
      console.log(`✅ 메인 페이지: ${mainContent?.length || 0} 글자`);
      
      // 카테고리 페이지 테스트
      console.log('📂 카테고리 페이지 네비게이션...');
      await page.click('a[href*="products"]');
      await page.waitForTimeout(3000);
      
      const categoryContent = await page.textContent('body');
      const productCards = await page.$$eval('[class*="product"], [class*="card"]', cards => cards.length);
      
      console.log(`📦 카테고리 페이지: ${categoryContent?.length || 0} 글자, ${productCards} 제품`);
      
      // 결과 요약
      console.log(`\n📊 ${browserInfo.name} 결과:`);
      console.log(`- 메인 페이지: ${mainContent && mainContent.length > 1000 ? '✅' : '❌'}`);
      console.log(`- 카테고리 페이지: ${categoryContent && categoryContent.length > 1000 ? '✅' : '❌'}`);
      console.log(`- 제품 카드: ${productCards > 0 ? '✅' : '❌'} (${productCards}개)`);
      console.log(`- JavaScript 에러: ${errors.length}개`);
      console.log(`- 네트워크 에러: ${networkIssues.length}개`);
      
      if (errors.length > 0) {
        console.log('🚨 JavaScript 에러들:');
        errors.forEach(error => console.log(`  - ${error}`));
      }
      
      if (networkIssues.length > 0) {
        console.log('📡 네트워크 문제들:');
        networkIssues.slice(0, 5).forEach(issue => console.log(`  - ${issue}`));
      }
      
      await browser.close();
      
    } catch (error) {
      console.log(`❌ ${browserInfo.name} 테스트 실패: ${error.message}`);
    }
  }
  
  console.log('\n🔍 실제 사용자 경험 모사 테스트...');
  
  // 더 현실적인 테스트 (느린 네트워크, 캐시 없음)
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // 네트워크 속도 제한
  const client = await page.context().newCDPSession(page);
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: 1000000, // 1Mbps
    uploadThroughput: 500000,    // 0.5Mbps
    latency: 100                 // 100ms 지연
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
  
  console.log('🐌 느린 네트워크 조건에서 테스트...');
  
  let timeStates = [];
  
  await page.goto('https://studio-sb.com');
  
  // 10초간 상태 모니터링
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(500);
    
    const content = await page.textContent('body');
    const visible = await page.$$eval('*', els => 
      els.filter(el => el.offsetWidth > 0 && el.offsetHeight > 0).length
    );
    
    timeStates.push({
      time: (i + 1) * 0.5,
      contentLength: content?.length || 0,
      visibleElements: visible,
      hasContent: content && content.length > 500
    });
    
    if (i % 4 === 0) { // 2초마다 출력
      const status = timeStates[i].hasContent ? '✅' : '❌';
      console.log(`${status} ${timeStates[i].time}초: ${timeStates[i].contentLength} 글자, ${timeStates[i].visibleElements} 요소`);
    }
  }
  
  // 패턴 분석
  const contentProgression = timeStates.map(state => state.hasContent);
  const hasFlashOfContent = contentProgression.some((has, i) => has && !contentProgression[i + 1]);
  
  if (hasFlashOfContent) {
    console.log('\n🔴 FOUC (Flash of Unstyled Content) 감지!');
    console.log('원인: CSS 로딩 지연 또는 JavaScript hydration 문제');
  }
  
  await browser.close();
  console.log('\n✅ 브라우저 호환성 테스트 완료');
}

checkBrowserCompatibility().catch(console.error);