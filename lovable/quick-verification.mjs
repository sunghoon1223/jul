import { chromium } from 'playwright';

async function quickTest() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('🧪 Testing localhost:8080...');
  
  try {
    await page.goto('http://localhost:8080', { waitUntil: 'domcontentloaded', timeout: 10000 });
    
    const content = await page.textContent('body');
    const hasContent = content && content.trim().length > 0;
    
    console.log('✅ Page loaded successfully');
    console.log('📄 Content length:', content?.length || 0);
    console.log('🎯 Has content:', hasContent ? 'YES' : 'NO');
    
    if (hasContent) {
      console.log('🎉 No white screen detected!');
    } else {
      console.log('❌ White screen detected!');
    }
    
    await page.screenshot({ path: 'quick-verification.png' });
    console.log('📸 Screenshot saved: quick-verification.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

quickTest().catch(console.error);