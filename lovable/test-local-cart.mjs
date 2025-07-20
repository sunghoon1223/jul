import { chromium } from 'playwright';

async function testLocalCart() {
  console.log('🧪 Testing cart functionality locally...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    if (msg.type() === 'log' && msg.text().includes('🛒')) {
      console.log('📝', msg.text());
    }
  });
  
  try {
    // Start local dev server first
    console.log('🌐 Starting local development server...');
    
    // Navigate to local development server
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Page loaded successfully');
    
    // Wait for products to load
    await page.waitForSelector('button:has-text("장바구니")', { timeout: 10000 });
    console.log('✅ Cart buttons found');
    
    // Check initial cart count
    const initialCartCount = await page.locator('button:has(svg.lucide-shopping-cart) span').textContent() || '0';
    console.log('📊 Initial cart count:', initialCartCount);
    
    // Find and click a cart button
    const cartButton = page.locator('button:has-text("장바구니")').first();
    console.log('🎯 Clicking cart button...');
    
    await cartButton.click();
    
    // Wait a moment for state update
    await page.waitForTimeout(2000);
    
    // Check cart count after click
    const newCartCount = await page.locator('button:has(svg.lucide-shopping-cart) span').textContent() || '0';
    console.log('📊 New cart count:', newCartCount);
    
    // Check localStorage
    const localStorage = await page.evaluate(() => {
      return {
        cart: window.localStorage.getItem('shopping_cart'),
        cartItems: window.localStorage.getItem('cart_items')
      };
    });
    console.log('💾 LocalStorage:', localStorage);
    
    console.log('✅ Local cart test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testLocalCart();