import { chromium } from 'playwright';

async function testCartCountAndDrawer() {
  console.log('🧪 Testing cart count display and drawer functionality...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('🛒') || text.includes('🔢') || text.includes('🚪')) {
      console.log('📝', text);
    }
  });
  
  try {
    // Go to products page where we know cart functionality works
    await page.goto('https://studio-sb.com/products');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('✅ Products page loaded');
    
    // Check initial cart count (should not exist)
    const initialCartCount = await page.locator('button:has(svg.lucide-shopping-cart) span').count();
    console.log('📊 Initial cart count badge exists:', initialCartCount > 0);
    
    // Clear localStorage first
    await page.evaluate(() => window.localStorage.removeItem('shopping_cart'));
    console.log('🧹 Cleared localStorage');
    
    // Add item to cart
    const firstProduct = page.locator('[class*="group"][class*="cursor-pointer"]').first();
    await firstProduct.hover();
    await page.waitForTimeout(1000);
    
    const cartButton = page.locator('button:has-text("장바구니")').first();
    console.log('🎯 Clicking cart button...');
    await cartButton.click();
    await page.waitForTimeout(2000);
    
    // Check if cart count badge appeared
    const cartCountAfter = await page.locator('button:has(svg.lucide-shopping-cart) span').count();
    console.log('📊 Cart count badge after addition:', cartCountAfter > 0);
    
    if (cartCountAfter > 0) {
      const countText = await page.locator('button:has(svg.lucide-shopping-cart) span').textContent();
      console.log('📊 Cart count text:', countText);
    }
    
    // Test cart drawer opening
    const headerCartButton = page.locator('button:has(svg.lucide-shopping-cart)');
    console.log('🚪 Clicking header cart button to open drawer...');
    await headerCartButton.click();
    await page.waitForTimeout(2000);
    
    // Check if drawer opened
    const drawer = await page.locator('[role="dialog"]').count();
    console.log('🗂️ Cart drawer opened:', drawer > 0);
    
    if (drawer > 0) {
      // Check drawer content
      const drawerTitle = await page.locator('[role="dialog"] h2').textContent();
      console.log('📋 Drawer title:', drawerTitle);
      
      // Check if items are displayed in drawer
      const drawerItems = await page.locator('[role="dialog"] [class*="space-y-4"] > div').count();
      console.log('📦 Items in drawer:', drawerItems);
    }
    
    // Add another item to test count increment
    console.log('➕ Adding second item...');
    
    // Close drawer first if open
    if (drawer > 0) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
    }
    
    // Add second item
    const secondProduct = page.locator('[class*="group"][class*="cursor-pointer"]').nth(1);
    await secondProduct.hover();
    await page.waitForTimeout(1000);
    
    const secondCartButton = page.locator('button:has-text("장바구니")').nth(1);
    await secondCartButton.click();
    await page.waitForTimeout(2000);
    
    // Check updated count
    const finalCountElement = page.locator('button:has(svg.lucide-shopping-cart) span');
    if (await finalCountElement.count() > 0) {
      const finalCount = await finalCountElement.textContent();
      console.log('📊 Final cart count:', finalCount);
    }
    
    // Check localStorage final state
    const finalCartData = await page.evaluate(() => {
      const data = window.localStorage.getItem('shopping_cart');
      return data ? JSON.parse(data) : null;
    });
    console.log('💾 Final cart data:', finalCartData?.length || 0, 'items');
    
    console.log('✅ Cart count and drawer test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testCartCountAndDrawer();