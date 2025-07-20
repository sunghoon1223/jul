import { chromium } from 'playwright';

async function testConsoleLogs() {
  console.log('🔍 콘솔 로그 상세 확인...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const logs = [];
  
  // 콘솔 메시지 수집
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('FALLBACK') || text.includes('result') || text.includes('count')) {
      logs.push(text);
      console.log('📋 KEY LOG:', text);
    }
  });
  
  try {
    await page.goto('http://localhost:8080/products');
    await page.waitForTimeout(5000);
    
    console.log('\n=== 모든 중요 로그 ===');
    logs.forEach((log, index) => {
      console.log(`${index + 1}. ${log}`);
    });
    
  } catch (error) {
    console.error('❌ 오류:', error);
  } finally {
    await browser.close();
  }
}

testConsoleLogs().catch(console.error);