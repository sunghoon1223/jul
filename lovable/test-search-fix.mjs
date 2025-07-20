import { chromium } from 'playwright';

async function testSearchFix() {
  console.log('🔍 검색 기능 수정 테스트 시작...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 1. 모든 제품 페이지 확인
    console.log('📦 모든 제품 페이지 확인...');
    await page.goto('http://localhost:8080/products');
    await page.waitForLoadState('networkidle');
    
    // 잠시 대기 후 페이지 상태 확인
    await page.waitForTimeout(3000);
    
    const pageText = await page.textContent('main');
    console.log('📊 모든 제품 페이지 텍스트:', pageText.match(/총 \d+개/)?.[0] || '개수 정보 없음');
    
    await page.screenshot({ path: 'test-all-products-fixed.png' });
    
    // 2. AGV 검색 테스트
    console.log('🔍 AGV 검색 테스트...');
    
    const searchInput = await page.locator('input[type="search"], input[placeholder*="검색"], input[placeholder*="search"]');
    if (await searchInput.count() > 0) {
      await searchInput.first().fill('AGV');
      await searchInput.first().press('Enter');
      await page.waitForTimeout(3000);
      
      const searchPageText = await page.textContent('main');
      console.log('🔍 AGV 검색 결과 텍스트:', searchPageText.match(/대한 \d+개/)?.[0] || '개수 정보 없음');
      
      await page.screenshot({ path: 'test-agv-search-fixed.png' });
    }
    
    // 3. 다른 검색어로 테스트
    console.log('🔍 캐스터 검색 테스트...');
    
    await page.goto('http://localhost:8080/products');
    await page.waitForLoadState('networkidle');
    
    const searchInput2 = await page.locator('input[type="search"], input[placeholder*="검색"], input[placeholder*="search"]');
    if (await searchInput2.count() > 0) {
      await searchInput2.first().fill('캐스터');
      await searchInput2.first().press('Enter');
      await page.waitForTimeout(3000);
      
      const searchPageText2 = await page.textContent('main');
      console.log('🔍 캐스터 검색 결과 텍스트:', searchPageText2.match(/대한 \d+개/)?.[0] || '개수 정보 없음');
    }
    
    console.log('✅ 검색 기능 테스트 완료!');
    
  } catch (error) {
    console.error('❌ 테스트 중 오류:', error);
  } finally {
    await browser.close();
  }
}

testSearchFix().catch(console.error);