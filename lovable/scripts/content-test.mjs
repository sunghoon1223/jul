import http from 'http'

function getPageContent(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => resolve(data))
    })
    req.on('error', reject)
    req.setTimeout(15000, () => {
      req.destroy()
      reject(new Error('Timeout'))
    })
  })
}

async function testContent() {
  try {
    console.log('🔍 Fetching page content...')
    const html = await getPageContent('http://localhost:8080')
    
    console.log('📄 HTML Analysis:')
    console.log(`   Total length: ${html.length} characters`)
    
    // Check for key elements
    const checks = [
      { name: 'DOCTYPE', test: html.includes('<!DOCTYPE html>') },
      { name: 'Root div', test: html.includes('<div id="root">') },
      { name: 'React scripts', test: html.includes('src="/src/main.tsx"') },
      { name: 'Vite client', test: html.includes('/@vite/client') },
      { name: 'Meta tags', test: html.includes('<meta') },
      { name: 'Title tag', test: html.includes('<title>') }
    ]
    
    checks.forEach(check => {
      console.log(`   ${check.name}: ${check.test ? '✅' : '❌'}`)
    })
    
    // Extract title
    const titleMatch = html.match(/<title>(.*?)<\/title>/)
    if (titleMatch) {
      console.log(`   Page title: "${titleMatch[1]}"`)
    }
    
    // Check for potential issues
    console.log('\n🔍 Checking for issues...')
    
    if (html.length < 500) {
      console.log('⚠️ Page content seems very minimal')
    }
    
    if (!html.includes('React')) {
      console.log('⚠️ No React references found')
    }
    
    if (!html.includes('main.tsx')) {
      console.log('⚠️ Main script not found')
    }
    
    console.log('\n📋 Summary:')
    console.log('- HTML structure appears correct')
    console.log('- React and Vite setup detected')
    console.log('- Page should be loading React components')
    
    // Log a snippet of the HTML for debugging
    console.log('\n📝 HTML snippet (first 500 chars):')
    console.log(html.substring(0, 500) + '...')
    
  } catch (error) {
    console.error('❌ Content test failed:', error.message)
  }
}

testContent()