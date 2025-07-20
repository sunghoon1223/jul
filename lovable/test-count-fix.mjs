import { chromium } from 'playwright';

async function testCountFix() {
  console.log('🔍 개수 표시 수정 테스트 시작...');
  
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
    console.log('📊 모든 제품 페이지 텍스트:', pageText);
    
    // 개수 정보 찾기
    const countInfo = pageText.match(/총 (\d+)개/);
    console.log('🔢 전체 제품 개수:', countInfo ? countInfo[1] : '0 또는 정보 없음');
    
    await page.screenshot({ path: 'test-all-products-count-fixed.png' });
    
    // 2. AGV 검색 테스트
    console.log('🔍 AGV 검색 테스트...');
    
    const searchInput = await page.locator('input[type="search"], input[placeholder*="검색"], input[placeholder*="search"]');
    if (await searchInput.count() > 0) {
      await searchInput.first().fill('AGV');
      await searchInput.first().press('Enter');
      await page.waitForTimeout(3000);
      
      const searchPageText = await page.textContent('main');
      console.log('🔍 AGV 검색 결과 텍스트:', searchPageText);
      
      // 검색 결과 개수 찾기
      const searchCountInfo = searchPageText.match(/대한 (\d+)개/);
      console.log('🔢 AGV 검색 결과 개수:', searchCountInfo ? searchCountInfo[1] : '0 또는 정보 없음');
      
      await page.screenshot({ path: 'test-agv-search-count-fixed.png' });
    }
    
    console.log('✅ 개수 표시 수정 테스트 완료!');
    
  } catch (error) {
    console.error('❌ 테스트 중 오류:', error);
  } finally {
    await browser.close();
  }
}

testCountFix().catch(console.error);