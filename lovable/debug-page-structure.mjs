import { chromium } from 'playwright';

async function debugPageStructure() {
  console.log('🔍 페이지 구조 분석 시작...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 홈페이지 먼저 확인
    console.log('📱 홈페이지 구조 분석...');
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'debug-homepage.png' });
    
    // 페이지 HTML 구조 확인
    const bodyHTML = await page.evaluate(() => {
      const body = document.querySelector('body');
      return body ? body.outerHTML : 'No body found';
    });
    
    console.log('📋 페이지 HTML 구조 (첫 1000자):');
    console.log(bodyHTML.substring(0, 1000));
    
    // 모든 버튼 찾기
    const buttons = await page.locator('button').all();
    console.log(`🔘 발견된 버튼 수: ${buttons.length}`);
    
    for (let i = 0; i < Math.min(buttons.length, 10); i++) {
      const button = buttons[i];
      const text = await button.textContent();
      const className = await button.getAttribute('class');
      console.log(`버튼 ${i + 1}: "${text}" (class: ${className})`);
    }
    
    // 모든 링크 찾기
    const links = await page.locator('a').all();
    console.log(`🔗 발견된 링크 수: ${links.length}`);
    
    for (let i = 0; i < Math.min(links.length, 10); i++) {
      const link = links[i];
      const text = await link.textContent();
      const href = await link.getAttribute('href');
      console.log(`링크 ${i + 1}: "${text}" (href: ${href})`);
    }
    
    // 제품 페이지로 이동
    console.log('📦 제품 페이지로 이동...');
    await page.goto('http://localhost:8080/products');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'debug-products-page.png' });
    
    // 제품 페이지 HTML 구조
    const productsHTML = await page.evaluate(() => {
      const main = document.querySelector('main');
      return main ? main.outerHTML : 'No main found';
    });
    
    console.log('📋 제품 페이지 HTML 구조 (첫 1000자):');
    console.log(productsHTML.substring(0, 1000));
    
    // 모든 카드 요소 찾기
    const cardElements = await page.locator('.card, [class*="card"], [class*="product"]').all();
    console.log(`🎴 발견된 카드 요소 수: ${cardElements.length}`);
    
    for (let i = 0; i < Math.min(cardElements.length, 5); i++) {
      const card = cardElements[i];
      const className = await card.getAttribute('class');
      const text = await card.textContent();
      console.log(`카드 ${i + 1}: class="${className}" text="${text?.substring(0, 50)}..."`);
    }
    
    // 모든 이미지 찾기
    const images = await page.locator('img').all();
    console.log(`🖼️ 발견된 이미지 수: ${images.length}`);
    
    for (let i = 0; i < Math.min(images.length, 5); i++) {
      const img = images[i];
      const src = await img.getAttribute('src');
      const alt = await img.getAttribute('alt');
      console.log(`이미지 ${i + 1}: src="${src}" alt="${alt}"`);
    }
    
    // 콘솔 에러 체크
    const logs = [];
    page.on('console', msg => {
      logs.push(`${msg.type()}: ${msg.text()}`);
    });
    
    await page.waitForTimeout(2000);
    
    console.log('📊 콘솔 로그:');
    logs.forEach(log => console.log(log));
    
  } catch (error) {
    console.error('❌ 디버깅 중 에러:', error);
  } finally {
    await browser.close();
  }
}

// 디버깅 실행
debugPageStructure().catch(console.error);