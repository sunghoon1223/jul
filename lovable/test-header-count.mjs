import { chromium } from 'playwright';

async function testHeaderCount() {
  console.log('🧪 헤더 카운트 표시 집중 테스트');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 콘솔 로그 모니터링 (헤더 관련만)
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('🔢') || text.includes('Header') || text.includes('itemsCount')) {
      console.log('📝', text);
    }
  });
  
  try {
    console.log('1️⃣ 제품 페이지 로드');
    await page.goto('https://studio-sb.com/products');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('2️⃣ localStorage 초기화');
    await page.evaluate(() => {
      window.localStorage.removeItem('shopping_cart');
      console.log('🧹 localStorage cleared');
    });
    
    // 페이지 새로고침하여 상태 완전 초기화
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('3️⃣ 초기 헤더 상태 확인');
    const initialBadgeCount = await page.locator('header button:has(svg.lucide-shopping-cart) span').count();
    console.log('📊 초기 카운트 뱃지 개수:', initialBadgeCount);
    
    console.log('4️⃣ 첫 번째 상품 장바구니 추가');
    const firstProduct = page.locator('.group.cursor-pointer').first();
    await firstProduct.hover();
    await page.waitForTimeout(1000);
    
    const cartButton = page.locator('button:has-text("장바구니")').first();
    await cartButton.click();
    
    console.log('5️⃣ 추가 후 상태 변화 관찰 (10초 대기)');
    
    // 상태 변화를 여러 번 체크
    for (let i = 1; i <= 10; i++) {
      await page.waitForTimeout(1000);
      
      const badgeCount = await page.locator('header button:has(svg.lucide-shopping-cart) span').count();
      const cartData = await page.evaluate(() => {
        const data = window.localStorage.getItem('shopping_cart');
        return data ? JSON.parse(data).length : 0;
      });
      
      console.log(`⏰ ${i}초 후 - 뱃지: ${badgeCount > 0 ? '있음' : '없음'}, localStorage: ${cartData}개`);
      
      if (badgeCount > 0) {
        const countText = await page.locator('header button:has(svg.lucide-shopping-cart) span').textContent();
        console.log(`🎯 카운트 뱃지 발견! 숫자: ${countText}`);
        break;
      }
    }
    
    console.log('6️⃣ 두 번째 상품도 추가해보기');
    const secondProduct = page.locator('.group.cursor-pointer').nth(1);
    await secondProduct.hover();
    await page.waitForTimeout(1000);
    
    const secondCartButton = page.locator('button:has-text("장바구니")').nth(1);
    await secondCartButton.click();
    await page.waitForTimeout(3000);
    
    const finalBadgeCount = await page.locator('header button:has(svg.lucide-shopping-cart) span').count();
    const finalCartData = await page.evaluate(() => {
      const data = window.localStorage.getItem('shopping_cart');
      return data ? JSON.parse(data).length : 0;
    });
    
    console.log('📊 최종 결과:');
    console.log('   - 헤더 카운트 뱃지:', finalBadgeCount > 0 ? '있음' : '없음');
    console.log('   - localStorage 아이템:', finalCartData, '개');
    
    if (finalBadgeCount > 0) {
      const finalCountText = await page.locator('header button:has(svg.lucide-shopping-cart) span').textContent();
      console.log('   - 표시된 숫자:', finalCountText);
      console.log('✅ 헤더 카운트 표시 성공!');
    } else {
      console.log('❌ 헤더 카운트 표시 실패 - 상태 동기화 문제');
    }
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
  }
}

testHeaderCount();