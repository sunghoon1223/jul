import { chromium } from 'playwright';

async function debugProductsSection() {
  console.log('🔍 Debugging products section...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('https://studio-sb.com');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Take a screenshot first
    await page.screenshot({ path: 'debug-homepage.png', fullPage: true });
    console.log('📸 Screenshot saved as debug-homepage.png');
    
    // Find all elements with product card classes
    const productCards = await page.locator('[class*="group"][class*="cursor-pointer"]').count();
    console.log('📦 Elements with group cursor-pointer:', productCards);
    
    // Look for any card elements
    const cards = await page.locator('[class*="card"]').count();
    console.log('🎴 Elements with card class:', cards);
    
    // Look for any buttons with cart text
    const cartButtons = await page.locator('button:has-text("장바구니")').count();
    console.log('🛒 Cart buttons found:', cartButtons);
    
    // Look for shopping cart icons
    const cartIcons = await page.locator('svg.lucide-shopping-cart').count();
    console.log('🛒 Cart icons found:', cartIcons);
    
    // Check for any overlays
    const overlays = await page.locator('[class*="absolute"][class*="inset-0"]').count();
    console.log('📄 Overlay elements found:', overlays);
    
    // Navigate to products page to see if products exist there
    console.log('🚀 Navigating to products page...');
    await page.goto('https://studio-sb.com/products');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Check products page
    const productPageCards = await page.locator('[class*="group"][class*="cursor-pointer"]').count();
    console.log('📦 Product cards on products page:', productPageCards);
    
    if (productPageCards > 0) {
      console.log('🎯 Testing cart button on products page...');
      
      const firstCard = page.locator('[class*="group"][class*="cursor-pointer"]').first();
      await firstCard.hover();
      await page.waitForTimeout(2000);
      
      const cartButtonsAfterHover = await page.locator('button:has-text("장바구니")').count();
      console.log('🛒 Cart buttons after hover on products page:', cartButtonsAfterHover);
      
      if (cartButtonsAfterHover > 0) {
        const cartButton = page.locator('button:has-text("장바구니")').first();
        const isVisible = await cartButton.isVisible();
        console.log('👁️ First cart button visible:', isVisible);
        
        if (isVisible) {
          console.log('🎯 Clicking cart button...');
          await cartButton.click();
          await page.waitForTimeout(2000);
          
          // Check localStorage
          const cartData = await page.evaluate(() => {
            return window.localStorage.getItem('shopping_cart');
          });
          console.log('💾 Cart data after click:', cartData);
        }
      }
    }
    
    console.log('✅ Debug completed');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    await browser.close();
  }
}

debugProductsSection();