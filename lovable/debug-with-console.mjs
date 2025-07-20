import { chromium } from 'playwright';

async function debugWithConsole() {
  console.log('🔍 브라우저 콘솔 직접 확인...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:8080/products');
    await page.waitForTimeout(5000);
    
    // 브라우저 콘솔에서 직접 확인
    const consoleOutput = await page.evaluate(() => {
      // 콘솔 로그 캡처
      const logs = [];
      const originalLog = console.log;
      console.log = function(...args) {
        logs.push(args.join(' '));
        originalLog.apply(console, args);
      };
      
      // 잠시 대기
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(logs);
        }, 2000);
      });
    });
    
    console.log('📋 브라우저 콘솔 로그:', consoleOutput);
    
    // 개발자 도구 콘솔에서 직접 실행
    await page.evaluate(() => {
      console.log('🧪 Direct console test');
    });
    
    await page.waitForTimeout(3000);
    
  } catch (error) {
    console.error('❌ 오류:', error);
  } finally {
    await browser.close();
  }
}

debugWithConsole().catch(console.error);