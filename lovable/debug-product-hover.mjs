import { chromium } from 'playwright';

async function debugProductHover() {
  console.log('🔍 Debugging product card hover...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('https://studio-sb.com');
    await page.waitForLoadState('networkidle');
    
    // Scroll to featured products section
    await page.locator('text=추천 제품').scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);
    
    // Find all product cards
    const productCards = page.locator('.group.cursor-pointer');
    const count = await productCards.count();
    console.log('📦 Found product cards:', count);
    
    if (count > 0) {
      const firstCard = productCards.first();
      
      // Check initial state
      console.log('📋 Checking card structure...');
      const cardHTML = await firstCard.innerHTML();
      console.log('🏗️ Card HTML (first 200 chars):', cardHTML.substring(0, 200));
      
      // Check for cart buttons before hover
      const cartButtonsBefore = await page.locator('button:has-text("장바구니")').count();
      console.log('🛒 Cart buttons before hover:', cartButtonsBefore);
      
      // Hover over the card
      console.log('🎯 Hovering over first product card...');
      await firstCard.hover();
      await page.waitForTimeout(2000);
      
      // Check for cart buttons after hover
      const cartButtonsAfter = await page.locator('button:has-text("장바구니")').count();
      console.log('🛒 Cart buttons after hover:', cartButtonsAfter);
      
      // Check for any buttons in the overlay
      const overlayButtons = await page.locator('.absolute.inset-0 button').count();
      console.log('🔘 Overlay buttons found:', overlayButtons);
      
      if (overlayButtons > 0) {
        // Get all button texts in overlay
        const buttonTexts = await page.locator('.absolute.inset-0 button').allTextContents();
        console.log('📝 Button texts:', buttonTexts);
      }
      
      // Check CSS classes on the overlay
      const overlay = page.locator('.absolute.inset-0').first();
      const overlayClass = await overlay.getAttribute('class');
      console.log('🎨 Overlay classes:', overlayClass);
      
      // Check if overlay is visible
      const overlayVisible = await overlay.isVisible();
      console.log('👁️ Overlay visible:', overlayVisible);
    }
    
    console.log('✅ Debug completed');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    await browser.close();
  }
}

debugProductHover();