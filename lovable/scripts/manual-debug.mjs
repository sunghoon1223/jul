import http from 'http'

// Manual debugging without browser automation
async function manualDebug() {
  console.log('🔍 Manual Website Debug (No Browser Required)')
  console.log('=================================================')
  
  try {
    console.log('\n1️⃣ Testing main page...')
    const mainPage = await fetchPage('http://localhost:8080')
    console.log(`   Status: ${mainPage.status}`)
    console.log(`   Title: ${mainPage.title}`)
    console.log(`   Has root div: ${mainPage.hasRoot ? '✅' : '❌'}`)
    console.log(`   Has React script: ${mainPage.hasReactScript ? '✅' : '❌'}`)
    
    console.log('\n2️⃣ Testing JavaScript files...')
    const jsFiles = [
      '/@vite/client',
      '/src/main.tsx',
      '/src/App.tsx',
      '/src/index.css'
    ]
    
    for (const file of jsFiles) {
      try {
        const response = await fetchPage(`http://localhost:8080${file}`)
        const size = response.content.length
        console.log(`   ${file}: ✅ (${size} bytes)`)
      } catch (error) {
        console.log(`   ${file}: ❌ ${error.message}`)
      }
    }
    
    console.log('\n3️⃣ Analyzing main.tsx content...')
    try {
      const mainTsx = await fetchPage('http://localhost:8080/src/main.tsx')
      const content = mainTsx.content
      
      const checks = [
        { name: 'Has React import', test: content.includes('import React') },
        { name: 'Has ReactDOM', test: content.includes('ReactDOM') },
        { name: 'Has App import', test: content.includes('import App') },
        { name: 'Has console.log', test: content.includes('console.log') },
        { name: 'Has createRoot', test: content.includes('createRoot') },
        { name: 'Has try-catch', test: content.includes('try') && content.includes('catch') }
      ]
      
      checks.forEach(check => {
        console.log(`   ${check.name}: ${check.test ? '✅' : '❌'}`)
      })
      
    } catch (error) {
      console.log(`   ❌ Failed to analyze main.tsx: ${error.message}`)
    }
    
    console.log('\n4️⃣ Checking data files...')
    try {
      const { readFileSync } = await import('fs')
      
      const categories = JSON.parse(readFileSync('/mnt/c/MYCLAUDE_PROJECT/jul/lovable/src/data/categories.json', 'utf8'))
      const products = JSON.parse(readFileSync('/mnt/c/MYCLAUDE_PROJECT/jul/lovable/src/data/products.json', 'utf8'))
      
      console.log(`   Categories: ✅ ${categories.length} items`)
      console.log(`   Products: ✅ ${products.length} items`)
      
      // Check first category and product
      if (categories.length > 0) {
        console.log(`   First category: "${categories[0].name}"`)
      }
      if (products.length > 0) {
        console.log(`   First product: "${products[0].product_name}"`)
      }
      
    } catch (error) {
      console.log(`   ❌ Data files error: ${error.message}`)
    }
    
    console.log('\n📋 DEBUGGING INSTRUCTIONS FOR USER:')
    console.log('=====================================')
    console.log('Since I cannot open a browser, please do the following:')
    console.log('')
    console.log('1. Open your browser and go to: http://localhost:8080')
    console.log('2. Press F12 to open Developer Tools')
    console.log('3. Go to the Console tab')
    console.log('4. Look for these messages:')
    console.log('   - "main.tsx loading..."')
    console.log('   - "Creating React root..."')
    console.log('   - "Root element found, rendering app..."')
    console.log('   - "App component rendering..."')
    console.log('   - "React app rendered successfully!"')
    console.log('')
    console.log('5. If you see those messages, the page should show:')
    console.log('   - Blue background')
    console.log('   - Title: "JP Caster Debug Test"')
    console.log('   - White box with green checkmarks')
    console.log('')
    console.log('6. If you see errors instead, copy the error message')
    console.log('7. If nothing appears, check the Elements tab and look inside <div id="root">')
    console.log('')
    console.log('8. Also test: http://localhost:8080/test-simple.html')
    console.log('   This should show debugging information about the React app')
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message)
  }
}

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let content = ''
      res.on('data', chunk => content += chunk)
      res.on('end', () => {
        const titleMatch = content.match(/<title>(.*?)<\/title>/)
        resolve({
          status: res.statusCode,
          content: content,
          title: titleMatch ? titleMatch[1] : 'No title',
          hasRoot: content.includes('<div id="root">'),
          hasReactScript: content.includes('/src/main.tsx')
        })
      })
    })
    req.on('error', reject)
    req.setTimeout(10000, () => {
      req.destroy()
      reject(new Error('Timeout'))
    })
  })
}

manualDebug()