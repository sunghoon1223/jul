import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'

async function testWebsite() {
  let browser = null
  
  try {
    console.log('🚀 Launching browser...')
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    
    const page = await browser.newPage()
    
    console.log('📱 Setting viewport...')
    await page.setViewport({ width: 1200, height: 800 })
    
    console.log('🔗 Navigating to localhost:8080...')
    await page.goto('http://localhost:8080', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    })
    
    console.log('📖 Getting page title...')
    const title = await page.title()
    console.log(`✅ Page title: "${title}"`)
    
    // Wait for content to load
    console.log('⏳ Waiting for content to load...')
    await page.waitForTimeout(3000)
    
    // Check if categories are loaded
    console.log('🏷️ Checking categories...')
    const categories = await page.evaluate(() => {
      const categoryElements = document.querySelectorAll('[data-testid="category"], .category-item, nav a, aside a')
      return Array.from(categoryElements).slice(0, 5).map(el => el.textContent?.trim()).filter(Boolean)
    })
    
    if (categories.length > 0) {
      console.log(`✅ Found ${categories.length} categories:`)
      categories.forEach((cat, i) => console.log(`   ${i + 1}. ${cat}`))
    } else {
      console.log('⚠️ No categories found')
    }
    
    // Check if products are loaded
    console.log('🛒 Checking products...')
    const products = await page.evaluate(() => {
      const productElements = document.querySelectorAll('[data-testid="product"], .product-card, .grid > div')
      return Array.from(productElements).slice(0, 5).map(el => {
        const name = el.querySelector('h3, h2, .product-name, [class*="title"]')?.textContent?.trim()
        const price = el.querySelector('.price, [class*="price"]')?.textContent?.trim()
        return { name, price }
      }).filter(p => p.name)
    })
    
    if (products.length > 0) {
      console.log(`✅ Found ${products.length} products:`)
      products.forEach((prod, i) => console.log(`   ${i + 1}. ${prod.name} ${prod.price || ''}`))
    } else {
      console.log('⚠️ No products found')
    }
    
    // Check for errors in console
    console.log('🐛 Checking for console errors...')
    const logs = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(`❌ Console Error: ${msg.text()}`)
      }
    })
    
    // Take screenshot
    console.log('📸 Taking screenshot...')
    const screenshotPath = path.join(process.cwd(), 'website-test.png')
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: true 
    })
    console.log(`✅ Screenshot saved: ${screenshotPath}`)
    
    // Check page content
    console.log('📄 Checking page content...')
    const bodyText = await page.evaluate(() => document.body.textContent)
    const hasContent = bodyText && bodyText.length > 100
    
    if (hasContent) {
      console.log(`✅ Page has content (${bodyText.length} characters)`)
    } else {
      console.log('⚠️ Page appears to be empty or minimal content')
    }
    
    // Check if React is loaded
    console.log('⚛️ Checking React...')
    const reactLoaded = await page.evaluate(() => {
      return typeof window.React !== 'undefined' || 
             document.querySelector('[data-reactroot]') !== null ||
             document.querySelector('#root') !== null
    })
    
    if (reactLoaded) {
      console.log('✅ React appears to be loaded')
    } else {
      console.log('⚠️ React may not be loaded properly')
    }
    
    // Final summary
    console.log('\n📊 Test Summary:')
    console.log(`- Page loads: ✅`)
    console.log(`- Title: "${title}"`)
    console.log(`- Categories found: ${categories.length}`)
    console.log(`- Products found: ${products.length}`)
    console.log(`- Has content: ${hasContent ? '✅' : '❌'}`)
    console.log(`- React loaded: ${reactLoaded ? '✅' : '❌'}`)
    
    if (logs.length > 0) {
      console.log('\n🐛 Console Errors:')
      logs.forEach(log => console.log(log))
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    
    // Try to get more info about the error
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Solution: Make sure the development server is running on port 8080')
      console.log('   Run: npm run dev')
    }
    
  } finally {
    if (browser) {
      await browser.close()
      console.log('🔒 Browser closed')
    }
  }
}

testWebsite()