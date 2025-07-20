import { chromium } from 'playwright';

async function testDeployedCart() {
  console.log('🧪 Testing cart functionality on deployed site...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down actions for better debugging
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('🛒') || text.includes('🚪') || text.includes('CartDrawer')) {
      console.log('📝', text);
    }
  });
  
  // Listen for errors
  page.on('pageerror', error => {
    console.error('❌ Page error:', error.message);
  });
  
  try {
    // Navigate to deployed site
    await page.goto('https://studio-sb.com');
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Page loaded successfully');
    
    // Wait for the page to fully render
    await page.waitForTimeout(3000);
    
    // Check initial modal state
    const modalOverlay = await page.locator('div[data-state="open"][aria-hidden="true"]').count();
    console.log('🚪 Modal overlays detected:', modalOverlay);
    
    // Check if cart button exists and is clickable
    const cartButton = page.locator('button:has(svg.lucide-shopping-cart)');
    const cartButtonCount = await cartButton.count();
    console.log('🛒 Cart buttons found:', cartButtonCount);
    
    if (cartButtonCount > 0) {
      const isVisible = await cartButton.first().isVisible();
      const isEnabled = await cartButton.first().isEnabled();
      console.log('👁️ Cart button visible:', isVisible);
      console.log('✋ Cart button enabled:', isEnabled);
      
      // Check initial cart count
      const cartCountElement = page.locator('button:has(svg.lucide-shopping-cart) span');
      const initialCartCount = await cartCountElement.textContent() || '0';
      console.log('📊 Initial cart count:', initialCartCount);
      
      // Try to click cart button (header cart icon)
      console.log('🎯 Attempting to click header cart button...');
      await cartButton.first().click({ force: true });
      
      // Wait for potential state changes
      await page.waitForTimeout(2000);
      
      // Check if cart drawer opened
      const cartDrawer = await page.locator('[role="dialog"]').count();
      console.log('🗂️ Cart drawer opened:', cartDrawer > 0);
      
      // Check localStorage
      const localStorage = await page.evaluate(() => {
        return {
          cart: window.localStorage.getItem('shopping_cart'),
          cartItems: window.localStorage.getItem('cart_items')
        };
      });
      console.log('💾 LocalStorage:', localStorage);
      
      // Try finding product cart buttons
      await page.waitForSelector('.group.cursor-pointer', { timeout: 5000 });
      
      // Scroll to products section
      await page.locator('.group.cursor-pointer').first().scrollIntoViewIfNeeded();
      
      // Hover over first product to reveal cart button
      const firstProduct = page.locator('.group.cursor-pointer').first();
      await firstProduct.hover();
      
      // Wait for overlay to appear
      await page.waitForTimeout(1000);
      
      // Try to click product cart button
      const productCartButton = page.locator('button:has-text("장바구니")').first();
      const productCartButtonVisible = await productCartButton.isVisible();
      console.log('🛍️ Product cart button visible:', productCartButtonVisible);
      
      if (productCartButtonVisible) {
        console.log('🎯 Clicking product cart button...');
        await productCartButton.click({ force: true });
        
        // Wait for state update
        await page.waitForTimeout(2000);
        
        // Check cart count after product addition
        const newCartCount = await cartCountElement.textContent() || '0';
        console.log('📊 Cart count after product addition:', newCartCount);
        
        // Check localStorage again
        const newLocalStorage = await page.evaluate(() => {
          return {
            cart: window.localStorage.getItem('shopping_cart'),
            cartItems: window.localStorage.getItem('cart_items')
          };
        });
        console.log('💾 LocalStorage after click:', newLocalStorage);
        
        // Final modal state check
        const finalModalOverlay = await page.locator('div[data-state="open"][aria-hidden="true"]').count();
        console.log('🚪 Final modal overlays:', finalModalOverlay);
      }
    }
    
    console.log('✅ Cart test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('🔍 Stack trace:', error.stack);
  } finally {
    await browser.close();
  }
}

testDeployedCart();