import { chromium } from 'playwright';

async function testDebugCount() {
  console.log('🔍 카운트 계산 디버그 확인...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const logs = [];
  
  // 콘솔 메시지 수집
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Calculated count') || text.includes('Products loaded')) {
      logs.push(text);
      console.log('📋 COUNT LOG:', text);
    }
  });
  
  try {
    await page.goto('http://localhost:8080/products');
    await page.waitForTimeout(5000);
    
    console.log('\n=== 카운트 계산 로그 ===');
    logs.forEach((log, index) => {
      console.log(`${index + 1}. ${log}`);
    });
    
  } catch (error) {
    console.error('❌ 오류:', error);
  } finally {
    await browser.close();
  }
}

testDebugCount().catch(console.error);