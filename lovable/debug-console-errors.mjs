import { chromium } from 'playwright';

async function debugConsoleErrors() {
  console.log('🔍 콘솔 에러 디버깅 시작...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const errors = [];
  const logs = [];
  
  // 콘솔 메시지 수집
  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error') {
      errors.push(text);
      console.log('❌ ERROR:', text);
    } else if (msg.type() === 'log') {
      logs.push(text);
      console.log('📋 LOG:', text);
    }
  });
  
  try {
    // 1. 모든 제품 페이지 로드
    console.log('📦 모든 제품 페이지 로드...');
    await page.goto('http://localhost:8080/products');
    await page.waitForTimeout(5000); // 로그 수집을 위해 충분히 대기
    
    // 2. AGV 검색
    console.log('🔍 AGV 검색...');
    const searchInput = await page.locator('input[type="search"], input[placeholder*="검색"], input[placeholder*="search"]');
    if (await searchInput.count() > 0) {
      await searchInput.first().fill('AGV');
      await searchInput.first().press('Enter');
      await page.waitForTimeout(5000);
    }
    
    console.log('\\n=== 수집된 에러 ===');
    errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
    
    console.log('\\n=== 수집된 로그 ===');
    logs.forEach((log, index) => {
      console.log(`${index + 1}. ${log}`);
    });
    
  } catch (error) {
    console.error('❌ 디버깅 중 오류:', error);
  } finally {
    await browser.close();
  }
}

debugConsoleErrors().catch(console.error);