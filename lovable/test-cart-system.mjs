import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

async function testCartSystem() {
  console.log('🛒 JP Caster 장바구니 시스템 테스트 시작...');
  
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
    // 1. 홈페이지 로드
    console.log('📱 홈페이지 로드...');
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'cart-test-homepage.png' });
    
    results.tests.push({
      name: '홈페이지 로드',
      status: 'success',
      timestamp: new Date().toISOString()
    });
    
    // 2. 제품 목록 확인
    console.log('🏷️ 제품 목록 확인...');
    
    // 제품 카드 찾기
    const productSelectors = [
      '[data-testid="product-card"]',
      '.product-card',
      '.grid .card',
      '.product-grid .card'
    ];
    
    let productCards = null;
    for (const selector of productSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        productCards = await page.locator(selector);
        break;
      } catch (e) {
        console.log(`선택자 ${selector}로 제품 카드를 찾을 수 없음`);
      }
    }
    
    if (!productCards) {
      // 제품 페이지로 이동
      console.log('📦 제품 페이지로 이동...');
      await page.goto('http://localhost:8080/products');
      await page.waitForLoadState('networkidle');
      
      for (const selector of productSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 5000 });
          productCards = await page.locator(selector);
          break;
        } catch (e) {
          console.log(`선택자 ${selector}로 제품 카드를 찾을 수 없음`);
        }
      }
    }
    
    if (productCards) {
      const productCount = await productCards.count();
      console.log(`📦 발견된 제품 수: ${productCount}`);
      
      results.tests.push({
        name: '제품 목록 확인',
        status: 'success',
        details: `${productCount}개 제품 발견`,
        timestamp: new Date().toISOString()
      });
      
      // 3. 장바구니 추가 버튼 테스트
      console.log('🛒 장바구니 추가 버튼 테스트...');
      
      const cartButtonSelectors = [
        'button:has-text("장바구니")',
        'button:has-text("Add to Cart")',
        '[data-testid="add-to-cart"]',
        '.add-to-cart-btn',
        'button[aria-label*="장바구니"]'
      ];
      
      let cartButton = null;
      for (const selector of cartButtonSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 3000 });
          cartButton = await page.locator(selector).first();
          break;
        } catch (e) {
          console.log(`선택자 ${selector}로 장바구니 버튼을 찾을 수 없음`);
        }
      }
      
      if (cartButton) {
        // 장바구니 추가 전 스크린샷
        await page.screenshot({ path: 'cart-test-before-add.png' });
        
        // 장바구니에 추가
        await cartButton.click();
        await page.waitForTimeout(1000);
        
        // 장바구니 추가 후 스크린샷
        await page.screenshot({ path: 'cart-test-after-add.png' });
        
        results.tests.push({
          name: '장바구니 추가 버튼 클릭',
          status: 'success',
          timestamp: new Date().toISOString()
        });
        
        // 4. 장바구니 아이콘 확인
        console.log('🛒 장바구니 아이콘 및 개수 확인...');
        
        const cartIconSelectors = [
          '[data-testid="cart-icon"]',
          '.cart-icon',
          'button:has-text("장바구니")',
          '.shopping-cart'
        ];
        
        for (const selector of cartIconSelectors) {
          try {
            const cartIcon = await page.locator(selector).first();
            if (await cartIcon.isVisible()) {
              // 장바구니 개수 확인
              const cartCount = await page.locator('.cart-count, .badge, .cart-badge').first().textContent();
              console.log(`🛒 장바구니 개수: ${cartCount}`);
              
              results.tests.push({
                name: '장바구니 아이콘 및 개수 확인',
                status: 'success',
                details: `장바구니 개수: ${cartCount}`,
                timestamp: new Date().toISOString()
              });
              break;
            }
          } catch (e) {
            console.log(`선택자 ${selector}로 장바구니 아이콘을 찾을 수 없음`);
          }
        }
        
        // 5. 장바구니 드로어 열기
        console.log('🛒 장바구니 드로어 열기...');
        
        try {
          const cartDrawerTrigger = await page.locator('[data-testid="cart-icon"], .cart-icon, button:has-text("장바구니")').first();
          await cartDrawerTrigger.click();
          await page.waitForTimeout(1000);
          
          // 장바구니 드로어 스크린샷
          await page.screenshot({ path: 'cart-test-drawer.png' });
          
          results.tests.push({
            name: '장바구니 드로어 열기',
            status: 'success',
            timestamp: new Date().toISOString()
          });
          
          // 6. 장바구니 내용 확인
          console.log('📋 장바구니 내용 확인...');
          
          const cartItemSelectors = [
            '[data-testid="cart-item"]',
            '.cart-item',
            '.cart-drawer .item'
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
                
                // 첫 번째 아이템 정보 수집
                const firstItem = cartItems.first();
                const itemName = await firstItem.locator('.item-name, .product-name, h3, h4').first().textContent();
                const itemPrice = await firstItem.locator('.price, .cost').first().textContent();
                
                results.cartItems.push({
                  name: itemName,
                  price: itemPrice,
                  timestamp: new Date().toISOString()
                });
                
                break;
              }
            } catch (e) {
              console.log(`선택자 ${selector}로 장바구니 아이템을 찾을 수 없음`);
            }
          }
        } catch (e) {
          results.tests.push({
            name: '장바구니 드로어 열기',
            status: 'failed',
            error: e.message,
            timestamp: new Date().toISOString()
          });
        }
      } else {
        results.tests.push({
          name: '장바구니 추가 버튼 찾기',
          status: 'failed',
          error: '장바구니 추가 버튼을 찾을 수 없음',
          timestamp: new Date().toISOString()
        });
      }
    } else {
      results.tests.push({
        name: '제품 목록 확인',
        status: 'failed',
        error: '제품 카드를 찾을 수 없음',
        timestamp: new Date().toISOString()
      });
    }
    
    // 최종 스크린샷
    await page.screenshot({ path: 'cart-test-final.png' });
    
    results.summary = {
      totalTests: results.tests.length,
      successTests: results.tests.filter(t => t.status === 'success').length,
      failedTests: results.tests.filter(t => t.status === 'failed').length,
      totalErrors: results.errors.length,
      cartItemsFound: results.cartItems.length
    };
    
    console.log(`✅ 테스트 완료: ${results.summary.successTests}/${results.summary.totalTests} 성공`);
    console.log(`🛒 장바구니 아이템: ${results.summary.cartItemsFound}개`);
    
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
  writeFileSync('cart-test-results.json', JSON.stringify(results, null, 2));
  console.log('📊 결과가 cart-test-results.json에 저장되었습니다.');
  
  return results;
}

// 테스트 실행
testCartSystem().catch(console.error);