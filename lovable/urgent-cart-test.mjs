import { chromium } from 'playwright';

async function urgentCartTest() {
  console.log('🚨 긴급 장바구니 테스트 - 실제 사용자 관점에서 테스트');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500  // 느리게 실행하여 문제 확인
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 모든 콘솔 로그 출력
  page.on('console', msg => {
    console.log('🖥️', msg.text());
  });
  
  // 에러 캐치
  page.on('pageerror', error => {
    console.error('❌ 페이지 에러:', error.message);
  });
  
  // 네트워크 에러 캐치
  page.on('requestfailed', request => {
    console.error('📡 네트워크 실패:', request.url(), request.failure().errorText);
  });
  
  try {
    console.log('1️⃣ 홈페이지 접속');
    await page.goto('https://studio-sb.com');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 스크린샷 찍기
    await page.screenshot({ path: 'step1-homepage.png', fullPage: true });
    
    console.log('2️⃣ 제품 페이지로 이동');
    await page.goto('https://studio-sb.com/products');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'step2-products.png', fullPage: true });
    
    console.log('3️⃣ 첫 번째 제품 카드 찾기');
    const productCards = await page.locator('.group.cursor-pointer').count();
    console.log('📦 제품 카드 개수:', productCards);
    
    if (productCards === 0) {
      console.log('❌ 제품 카드가 없습니다!');
      return;
    }
    
    console.log('4️⃣ 첫 번째 제품 카드에 마우스 올리기');
    const firstCard = page.locator('.group.cursor-pointer').first();
    await firstCard.scrollIntoViewIfNeeded();
    await firstCard.hover();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'step3-hover.png' });
    
    console.log('5️⃣ 장바구니 버튼 찾기');
    const cartButtons = await page.locator('button:has-text("장바구니")').count();
    console.log('🛒 장바구니 버튼 개수:', cartButtons);
    
    if (cartButtons === 0) {
      console.log('❌ 장바구니 버튼이 보이지 않습니다!');
      
      // 다른 방법으로 버튼 찾기
      const allButtons = await page.locator('button').allTextContents();
      console.log('🔘 페이지의 모든 버튼 텍스트:', allButtons);
      
      return;
    }
    
    console.log('6️⃣ 초기 localStorage 상태 확인');
    const initialCart = await page.evaluate(() => {
      return window.localStorage.getItem('shopping_cart');
    });
    console.log('💾 초기 장바구니 상태:', initialCart);
    
    console.log('7️⃣ 장바구니 버튼 클릭!');
    const cartButton = page.locator('button:has-text("장바구니")').first();
    
    // 버튼이 실제로 보이는지 확인
    const isVisible = await cartButton.isVisible();
    const isEnabled = await cartButton.isEnabled();
    console.log('👁️ 버튼 보임:', isVisible);
    console.log('✋ 버튼 활성화:', isEnabled);
    
    if (!isVisible) {
      console.log('❌ 버튼이 보이지 않습니다!');
      return;
    }
    
    await cartButton.click();
    console.log('✅ 버튼 클릭 완료');
    
    console.log('8️⃣ 클릭 후 대기 및 상태 확인');
    await page.waitForTimeout(5000);  // 5초 대기
    
    const finalCart = await page.evaluate(() => {
      return window.localStorage.getItem('shopping_cart');
    });
    console.log('💾 클릭 후 장바구니 상태:', finalCart);
    
    console.log('9️⃣ 헤더 장바구니 아이콘 확인');
    const headerCartCount = await page.locator('header button:has(svg.lucide-shopping-cart) span').count();
    console.log('📊 헤더 장바구니 카운트 뱃지:', headerCartCount > 0 ? '있음' : '없음');
    
    if (headerCartCount > 0) {
      const countText = await page.locator('header button:has(svg.lucide-shopping-cart) span').textContent();
      console.log('📊 카운트 숫자:', countText);
    }
    
    console.log('🔟 최종 스크린샷');
    await page.screenshot({ path: 'step4-final.png', fullPage: true });
    
    // 결과 판정
    if (finalCart && finalCart !== 'null' && finalCart !== '[]') {
      console.log('✅ 성공: 장바구니에 상품이 추가되었습니다!');
    } else {
      console.log('❌ 실패: 장바구니에 상품이 추가되지 않았습니다!');
    }
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    console.error('📍 스택 트레이스:', error.stack);
  } finally {
    console.log('🏁 테스트 완료 - 브라우저 5초 후 닫힘');
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

urgentCartTest();