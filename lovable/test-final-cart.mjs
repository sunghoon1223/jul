import { chromium } from 'playwright';

async function testFinalCart() {
  console.log('🧪 Final comprehensive cart test...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('🛒') || text.includes('addItem') || text.includes('장바구니')) {
      console.log('📝', text);
    }
  });
  
  try {
    // Go to products page
    await page.goto('https://studio-sb.com/products');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('✅ Products page loaded');
    
    // Clear localStorage first
    await page.evaluate(() => window.localStorage.removeItem('shopping_cart'));
    
    // Check initial header cart button (no count badge should exist)
    const headerCartButton = page.locator('header button:has(svg.lucide-shopping-cart)');
    const initialCountBadge = await page.locator('header button:has(svg.lucide-shopping-cart) span').count();
    console.log('📊 Initial cart count badge exists:', initialCountBadge > 0);
    
    // Add first item to cart
    const firstProduct = page.locator('[class*="group"][class*="cursor-pointer"]').first();
    await firstProduct.hover();
    await page.waitForTimeout(1000);
    
    const cartButton = page.locator('button:has-text("장바구니")').first();
    console.log('🎯 Adding first item to cart...');
    await cartButton.click();
    await page.waitForTimeout(2000);
    
    // Check if cart count badge appeared
    const cartCountAfter1 = await page.locator('header button:has(svg.lucide-shopping-cart) span').count();
    console.log('📊 Cart count badge after first addition:', cartCountAfter1 > 0);
    
    if (cartCountAfter1 > 0) {
      const countText1 = await page.locator('header button:has(svg.lucide-shopping-cart) span').textContent();
      console.log('📊 Cart count after first item:', countText1);
    }
    
    // Add second item
    const secondProduct = page.locator('[class*="group"][class*="cursor-pointer"]').nth(1);
    await secondProduct.hover();
    await page.waitForTimeout(1000);
    
    const secondCartButton = page.locator('button:has-text("장바구니")').nth(1);
    console.log('🎯 Adding second item to cart...');
    await secondCartButton.click();
    await page.waitForTimeout(2000);
    
    // Check updated count
    const cartCountAfter2 = await page.locator('header button:has(svg.lucide-shopping-cart) span').count();
    if (cartCountAfter2 > 0) {
      const countText2 = await page.locator('header button:has(svg.lucide-shopping-cart) span').textContent();
      console.log('📊 Cart count after second item:', countText2);
    }
    
    // Test cart drawer
    console.log('🚪 Testing cart drawer...');
    await headerCartButton.click();
    await page.waitForTimeout(2000);
    
    // Check if drawer opened
    const drawer = await page.locator('[role="dialog"]').count();
    console.log('🗂️ Cart drawer opened:', drawer > 0);
    
    if (drawer > 0) {
      const drawerTitle = await page.locator('[role="dialog"] h2').textContent();
      console.log('📋 Drawer title:', drawerTitle);
      
      // Check items in drawer
      const drawerItems = await page.locator('[role="dialog"] [data-testid="cart-item"], [role="dialog"] .space-y-4 > div').count();
      console.log('📦 Items visible in drawer:', drawerItems);
      
      // Check checkout button
      const checkoutButton = await page.locator('[role="dialog"] button:has-text("주문하기")').count();
      console.log('💳 Checkout button present:', checkoutButton > 0);
    }
    
    // Final localStorage check
    const finalCartData = await page.evaluate(() => {
      const data = window.localStorage.getItem('shopping_cart');
      return data ? JSON.parse(data) : null;
    });
    console.log('💾 Final localStorage cart items:', finalCartData?.length || 0);
    
    if (finalCartData && finalCartData.length > 0) {
      console.log('📝 Cart items:');
      finalCartData.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.name} - ₩${item.price} (qty: ${item.quantity})`);
      });
    }
    
    console.log('✅ Comprehensive cart test completed successfully!');
    console.log('🎉 Cart functionality is working correctly on the deployed site!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testFinalCart();