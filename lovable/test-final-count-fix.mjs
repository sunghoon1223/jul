import { chromium } from 'playwright';

async function testFinalCountFix() {
  console.log('🎯 최종 개수 표시 수정 테스트...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 1. 모든 제품 페이지 테스트
    console.log('📦 모든 제품 페이지 테스트...');
    await page.goto('http://localhost:8080/products');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    let pageText = await page.textContent('main');
    let countMatch = pageText.match(/총 (\d+)개/);
    console.log('🔢 전체 제품 개수:', countMatch ? countMatch[1] : '개수 정보 없음');
    
    // 2. AGV 검색 테스트  
    console.log('🔍 AGV 검색 테스트...');
    const searchInput = await page.locator('input[type="search"], input[placeholder*="검색"], input[placeholder*="search"]');
    if (await searchInput.count() > 0) {
      await searchInput.first().fill('AGV');
      await searchInput.first().press('Enter');
      await page.waitForTimeout(3000);
      
      pageText = await page.textContent('main');
      countMatch = pageText.match(/대한 (\d+)개/);
      console.log('🔢 AGV 검색 결과 개수:', countMatch ? countMatch[1] : '개수 정보 없음');
    }
    
    // 3. 스크린샷 저장
    await page.screenshot({ path: 'final-count-fix-verification.png' });
    
    console.log('✅ 최종 개수 표시 수정 테스트 완료!');
    
  } catch (error) {
    console.error('❌ 테스트 중 오류:', error);
  } finally {
    await browser.close();
  }
}

testFinalCountFix().catch(console.error);