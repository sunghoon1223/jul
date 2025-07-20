import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

async function debugSearchIssue() {
  console.log('🔍 디버깅: 검색 기능 문제 분석 시작...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    searchResults: {},
    productCounts: {},
    errors: []
  };
  
  // 콘솔 로그 수집
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString()
    });
  });
  
  try {
    // 1. 홈페이지 로드
    console.log('🏠 홈페이지 로드...');
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
    
    results.tests.push({
      name: '홈페이지 로드',
      status: 'success',
      timestamp: new Date().toISOString()
    });
    
    // 2. 모든 제품 페이지 확인
    console.log('📦 모든 제품 페이지 확인...');
    await page.goto('http://localhost:8080/products');
    await page.waitForLoadState('networkidle');
    
    // 제품 개수 확인
    const productCards = await page.locator('.rounded-lg.text-card-foreground.group.cursor-pointer');
    const productCount = await productCards.count();
    
    // 페이지 텍스트에서 총 개수 확인
    const pageText = await page.textContent('main');
    const totalCountMatch = pageText.match(/총 (\\d+)개/);
    const displayedCount = totalCountMatch ? parseInt(totalCountMatch[1]) : 0;
    
    results.productCounts.allProducts = {
      cardsDisplayed: productCount,
      totalCountDisplayed: displayedCount,
      pageText: pageText.substring(0, 500)
    };
    
    await page.screenshot({ path: 'debug-all-products.png' });
    console.log(`📊 모든 제품 페이지: ${productCount}개 카드 표시, 총 ${displayedCount}개 표시`);
    
    // 3. AGV 검색 테스트
    console.log('🔍 AGV 검색 테스트...');
    
    // 검색창 찾기
    const searchInput = await page.locator('input[type="search"], input[placeholder*="검색"], input[placeholder*="search"]');
    
    if (await searchInput.count() > 0) {
      await searchInput.first().fill('AGV');
      await searchInput.first().press('Enter');
      await page.waitForTimeout(3000); // 검색 결과 로딩 대기
      
      // 검색 결과 확인
      const searchResultCards = await page.locator('.rounded-lg.text-card-foreground.group.cursor-pointer');
      const searchResultCount = await searchResultCards.count();
      
      // 검색 결과 페이지 텍스트
      const searchPageText = await page.textContent('main');
      const searchCountMatch = searchPageText.match(/대한 (\\d+)개/);
      const searchDisplayedCount = searchCountMatch ? parseInt(searchCountMatch[1]) : 0;
      
      results.searchResults.agv = {
        cardsDisplayed: searchResultCount,
        totalCountDisplayed: searchDisplayedCount,
        searchPageText: searchPageText.substring(0, 500)
      };
      
      await page.screenshot({ path: 'debug-agv-search.png' });
      console.log(`🔍 AGV 검색 결과: ${searchResultCount}개 카드 표시, 총 ${searchDisplayedCount}개 표시`);
      
      // 검색 결과 상세 정보 수집
      if (searchResultCount > 0) {
        for (let i = 0; i < Math.min(searchResultCount, 3); i++) {
          const card = searchResultCards.nth(i);
          const cardText = await card.textContent();
          console.log(`📋 검색 결과 ${i + 1}: ${cardText.substring(0, 100)}...`);
        }
      }
      
      results.tests.push({
        name: 'AGV 검색',
        status: searchResultCount > 0 ? 'success' : 'failed',
        details: `${searchResultCount}개 결과 표시`,
        timestamp: new Date().toISOString()
      });
    } else {
      results.tests.push({
        name: 'AGV 검색',
        status: 'failed',
        error: '검색 입력창을 찾을 수 없음',
        timestamp: new Date().toISOString()
      });
    }
    
    // 4. 네트워크 요청 확인
    console.log('🌐 네트워크 요청 확인...');
    
    const networkRequests = [];
    page.on('request', request => {
      if (request.url().includes('products') || request.url().includes('search')) {
        networkRequests.push({
          url: request.url(),
          method: request.method(),
          timestamp: new Date().toISOString()
        });
      }
    });
    
    // 5. 다른 검색어로도 테스트
    console.log('🔍 다른 검색어 테스트...');
    
    const searchTerms = ['캐스터', '50mm', 'JP'];
    for (const term of searchTerms) {
      await page.goto('http://localhost:8080/products');
      await page.waitForLoadState('networkidle');
      
      const searchInput = await page.locator('input[type="search"], input[placeholder*="검색"], input[placeholder*="search"]');
      if (await searchInput.count() > 0) {
        await searchInput.first().fill(term);
        await searchInput.first().press('Enter');
        await page.waitForTimeout(2000);
        
        const resultCards = await page.locator('.rounded-lg.text-card-foreground.group.cursor-pointer');
        const resultCount = await resultCards.count();
        
        results.searchResults[term] = {
          cardsDisplayed: resultCount,
          timestamp: new Date().toISOString()
        };
        
        console.log(`🔍 "${term}" 검색 결과: ${resultCount}개`);
      }
    }
    
    // 최종 콘솔 로그 저장
    results.consoleLogs = consoleLogs;
    results.networkRequests = networkRequests;
    
    console.log(`✅ 디버깅 완료: ${results.tests.length}개 테스트 실행`);
    
  } catch (error) {
    console.error('❌ 디버깅 중 오류:', error);
    results.errors.push({
      message: error.message,
      timestamp: new Date().toISOString()
    });
  } finally {
    await browser.close();
  }
  
  // 결과 저장
  writeFileSync('debug-search-results.json', JSON.stringify(results, null, 2));
  console.log('📊 디버깅 결과가 debug-search-results.json에 저장되었습니다.');
  
  return results;
}

// 디버깅 실행
debugSearchIssue().catch(console.error);