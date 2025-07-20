import { chromium } from 'playwright';

async function testCart() {
  console.log('🧪 Simple cart functionality test...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('🛒') || text.includes('장바구니') || text.includes('addItem')) {
      console.log('📝', text);
    }
  });
  
  try {
    await page.goto('https://studio-sb.com');
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Page loaded');
    
    // Check initial localStorage
    const initialLS = await page.evaluate(() => window.localStorage.getItem('shopping_cart'));
    console.log('💾 Initial cart in localStorage:', initialLS);
    
    // Wait for products to load and hover over first product
    await page.waitForSelector('.group.cursor-pointer', { timeout: 10000 });
    const firstProduct = page.locator('.group.cursor-pointer').first();
    
    console.log('🎯 Hovering over first product...');
    await firstProduct.hover();
    await page.waitForTimeout(1000);
    
    // Look for cart button in product overlay
    const cartButton = page.locator('button:has-text("장바구니")').first();
    const isVisible = await cartButton.isVisible();
    
    console.log('👁️ Cart button visible:', isVisible);
    
    if (isVisible) {
      console.log('🎯 Clicking cart button...');
      await cartButton.click();
      
      // Wait for any animations/state updates
      await page.waitForTimeout(3000);
      
      // Check localStorage after click
      const finalLS = await page.evaluate(() => window.localStorage.getItem('shopping_cart'));
      console.log('💾 Final cart in localStorage:', finalLS);
      
      // Check if cart count appeared in header
      const cartCount = await page.locator('button:has(svg.lucide-shopping-cart) span').count();
      console.log('📊 Cart count badge exists:', cartCount > 0);
      
      if (cartCount > 0) {
        const countText = await page.locator('button:has(svg.lucide-shopping-cart) span').textContent();
        console.log('📊 Cart count:', countText);
      }
    }
    
    console.log('✅ Test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testCart();