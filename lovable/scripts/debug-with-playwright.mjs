import { chromium } from 'playwright'

async function debugWithPlaywright() {
  let browser = null
  let page = null
  
  try {
    console.log('🚀 Starting Playwright debug session...')
    
    // Try to launch browser with all possible flags
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ]
    })
    
    console.log('✅ Browser launched successfully')
    
    page = await browser.newPage()
    
    // Listen for console messages
    const consoleMessages = []
    const errors = []
    
    page.on('console', msg => {
      const type = msg.type()
      const text = msg.text()
      consoleMessages.push({ type, text })
      console.log(`[BROWSER ${type.toUpperCase()}] ${text}`)
    })
    
    page.on('pageerror', error => {
      errors.push(error.message)
      console.log(`[BROWSER ERROR] ${error.message}`)
    })
    
    console.log('🌐 Navigating to http://localhost:8080...')
    
    await page.goto('http://localhost:8080', {
      waitUntil: 'networkidle',
      timeout: 30000
    })
    
    console.log('✅ Page loaded')
    
    // Wait a bit for React to render
    await page.waitForTimeout(3000)
    
    // Check if React root has content
    const rootContent = await page.evaluate(() => {
      const root = document.getElementById('root')
      return {
        exists: !!root,
        hasContent: root ? root.innerHTML.length > 0 : false,
        innerHTML: root ? root.innerHTML.substring(0, 200) : 'No root element'
      }
    })
    
    console.log('\n📊 React App Analysis:')
    console.log(`   Root element exists: ${rootContent.exists ? '✅' : '❌'}`)
    console.log(`   Root has content: ${rootContent.hasContent ? '✅' : '❌'}`)
    console.log(`   Root innerHTML preview: ${rootContent.innerHTML}...`)
    
    // Check page title
    const title = await page.title()
    console.log(`   Page title: "${title}"`)
    
    // Take screenshot if possible
    try {
      await page.screenshot({ 
        path: '/mnt/c/MYCLAUDE_PROJECT/jul/lovable/debug-screenshot.png',
        fullPage: true 
      })
      console.log('📸 Screenshot saved to debug-screenshot.png')
    } catch (screenshotError) {
      console.log('⚠️ Could not take screenshot:', screenshotError.message)
    }
    
    console.log('\n📝 Console Messages Summary:')
    if (consoleMessages.length === 0) {
      console.log('   No console messages found')
    } else {
      consoleMessages.forEach(msg => {
        console.log(`   [${msg.type}] ${msg.text}`)
      })
    }
    
    console.log('\n🐛 JavaScript Errors:')
    if (errors.length === 0) {
      console.log('   ✅ No JavaScript errors found')
    } else {
      errors.forEach(error => {
        console.log(`   ❌ ${error}`)
      })
    }
    
    // Test the simple debug page too
    console.log('\n🔍 Testing debug page...')
    await page.goto('http://localhost:8080/test-simple.html', {
      waitUntil: 'networkidle',
      timeout: 10000
    })
    
    await page.waitForTimeout(2000)
    
    const debugResults = await page.evaluate(() => {
      const results = document.getElementById('test-results')
      return results ? results.innerText : 'No debug results found'
    })
    
    console.log('📋 Debug page results:')
    console.log(debugResults)
    
  } catch (error) {
    console.error('❌ Playwright debug failed:', error.message)
    
    if (error.message.includes('Executable doesn\'t exist')) {
      console.log('\n💡 Browser executable not found. Try:')
      console.log('   npx playwright install chromium')
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Cannot connect to localhost:8080')
      console.log('   Make sure the dev server is running: npm run dev')
    }
  } finally {
    if (page) await page.close()
    if (browser) await browser.close()
    console.log('🔒 Browser closed')
  }
}

debugWithPlaywright()