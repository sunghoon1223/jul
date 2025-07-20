import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

async function testCartWorking() {
  console.log('🛒 JP Caster 장바구니 시스템 테스트 (올바른 선택자로)...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    errors: [],
    cartItems: []
  };
  
  try {
    // 1. 제품 페이지로 직접 이동
    console.log('📦 제품 페이지로 이동...');
    await page.goto('http://localhost:8080/products');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'cart-working-1-homepage.png' });
    
    results.tests.push({
      name: '제품 페이지 로드',
      status: 'success',
      timestamp: new Date().toISOString()
    });
    
    // 2. 제품 카드 찾기 (실제 클래스명 사용)
    console.log('🏷️ 제품 카드 찾기...');
    
    const productCardSelector = '.rounded-lg.text-card-foreground.group.cursor-pointer';
    await page.waitForSelector(productCardSelector, { timeout: 10000 });
    
    const productCards = await page.locator(productCardSelector);
    const productCount = await productCards.count();
    console.log(`📦 발견된 제품 수: ${productCount}`);
    
    results.tests.push({
      name: '제품 카드 찾기',
      status: 'success',
      details: `${productCount}개 제품 발견`,
      timestamp: new Date().toISOString()
    });
    
    // 3. 첫 번째 제품의 장바구니 버튼 찾기
    console.log('🛒 장바구니 버튼 찾기...');
    
    const firstProductCard = productCards.first();
    const addToCartButton = await firstProductCard.locator('button:has-text("장바구니")');
    
    if (await addToCartButton.count() > 0) {
      console.log('✅ 장바구니 버튼 발견');
      
      // 장바구니에 추가하기 전 스크린샷
      await page.screenshot({ path: 'cart-working-2-before-add.png' });
      
      // 장바구니에 추가
      await addToCartButton.click();
      await page.waitForTimeout(2000);
      
      // 장바구니에 추가 후 스크린샷
      await page.screenshot({ path: 'cart-working-3-after-add.png' });
      
      results.tests.push({
        name: '장바구니 추가 버튼 클릭',
        status: 'success',
        timestamp: new Date().toISOString()
      });
      
      // 4. 장바구니 개수 확인
      console.log('🔢 장바구니 개수 확인...');
      
      // 헤더의 장바구니 아이콘 찾기
      const cartIconSelectors = [
        'button:has([data-testid="cart-icon"])',
        'button:has(.lucide-shopping-cart)',
        'button[title*="장바구니"]',
        'button[aria-label*="장바구니"]'
      ];
      
      let cartIcon = null;
      for (const selector of cartIconSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 2000 });
          cartIcon = await page.locator(selector);
          if (await cartIcon.count() > 0) {
            console.log(`✅ 장바구니 아이콘 발견: ${selector}`);
            break;
          }
        } catch (e) {
          console.log(`선택자 ${selector}로 장바구니 아이콘을 찾을 수 없음`);
        }
      }
      
      if (cartIcon) {
        // 장바구니 아이콘 클릭해서 드로어 열기
        await cartIcon.first().click();
        await page.waitForTimeout(1000);
        
        // 장바구니 드로어 스크린샷
        await page.screenshot({ path: 'cart-working-4-drawer-opened.png' });
        
        results.tests.push({
          name: '장바구니 드로어 열기',
          status: 'success',
          timestamp: new Date().toISOString()
        });
        
        // 5. 장바구니 내용 확인
        console.log('📋 장바구니 내용 확인...');
        
        // 장바구니 드로어가 열렸는지 확인
        const drawerSelectors = [
          '[data-testid="cart-drawer"]',
          '.sheet-content',
          '[role="dialog"]'
        ];
        
        let drawerFound = false;
        for (const selector of drawerSelectors) {
          try {
            await page.waitForSelector(selector, { timeout: 3000 });
            drawerFound = true;
            console.log(`✅ 장바구니 드로어 발견: ${selector}`);
            break;
          } catch (e) {
            console.log(`선택자 ${selector}로 드로어를 찾을 수 없음`);
          }
        }
        
        if (drawerFound) {
          // 장바구니 아이템 확인
          const cartItemSelectors = [
            '.cart-item',
            '[data-testid="cart-item"]',
            '.sheet-content .flex.items-center'
          ];
          
          for (const selector of cartItemSelectors) {
            try {
              const cartItems = await page.locator(selector);
              const itemCount = await cartItems.count();
              
              if (itemCount > 0) {
                console.log(`📦 장바구니 아이템 수: ${itemCount}`);
                
                results.tests.push({
                  name: '장바구니 내용 확인',
                  status: 'success',
                  details: `${itemCount}개 아이템 발견`,
                  timestamp: new Date().toISOString()
                });
                
                // 아이템 정보 수집
                for (let i = 0; i < itemCount; i++) {
                  const item = cartItems.nth(i);
                  const itemText = await item.textContent();
                  
                  results.cartItems.push({
                    index: i,
                    content: itemText,
                    timestamp: new Date().toISOString()
                  });
                }
                
                break;
              }
            } catch (e) {
              console.log(`선택자 ${selector}로 장바구니 아이템을 찾을 수 없음`);
            }
          }
        }
        
        // 최종 장바구니 상태 스크린샷
        await page.screenshot({ path: 'cart-working-5-final-state.png' });
        
      } else {
        results.tests.push({
          name: '장바구니 아이콘 찾기',
          status: 'failed',
          error: '장바구니 아이콘을 찾을 수 없음',
          timestamp: new Date().toISOString()
        });
      }
      
    } else {
      results.tests.push({
        name: '장바구니 버튼 찾기',
        status: 'failed',
        error: '장바구니 버튼을 찾을 수 없음',
        timestamp: new Date().toISOString()
      });
    }
    
    // 콘솔 에러 수집
    page.on('console', msg => {
      if (msg.type() === 'error') {
        results.errors.push({
          message: msg.text(),
          timestamp: new Date().toISOString()
        });
      }
    });
    
    results.summary = {
      totalTests: results.tests.length,
      successTests: results.tests.filter(t => t.status === 'success').length,
      failedTests: results.tests.filter(t => t.status === 'failed').length,
      totalErrors: results.errors.length,
      cartItemsFound: results.cartItems.length
    };
    
    console.log(`✅ 테스트 완료: ${results.summary.successTests}/${results.summary.totalTests} 성공`);
    console.log(`🛒 장바구니 아이템: ${results.summary.cartItemsFound}개`);
    console.log(`❌ 에러: ${results.summary.totalErrors}개`);
    
  } catch (error) {
    console.error('❌ 테스트 실행 중 에러:', error);
    results.errors.push({
      message: `테스트 실행 에러: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  } finally {
    await browser.close();
  }
  
  // 결과 파일 저장
  writeFileSync('cart-working-results.json', JSON.stringify(results, null, 2));
  console.log('📊 결과가 cart-working-results.json에 저장되었습니다.');
  
  return results;
}

// 테스트 실행
testCartWorking().catch(console.error);