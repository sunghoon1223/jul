

const { chromium } = require('playwright');

(async () => {
  let browser = null;
  try {
    console.log('Launching browser...');
    browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    console.log('Navigating to http://localhost:4174/ ...');
    await page.goto('http://localhost:4174/');
    console.log('Page title:', await page.title());
    await page.screenshot({ path: 'C:\\MYCLAUDE_PROJECT\\lovable\\screenshot.png' });
    console.log('Screenshot taken and saved to screenshot.png');
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    if (browser) {
      await browser.close();
      console.log('Browser closed.');
    }
  }
})();

