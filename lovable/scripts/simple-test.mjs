import http from 'http'
import https from 'https'

function testURL(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http
    
    const req = client.get(url, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          contentLength: data.length,
          hasContent: data.length > 100,
          hasReact: data.includes('React') || data.includes('root'),
          hasVite: data.includes('vite') || data.includes('@vite'),
          title: data.match(/<title>(.*?)<\/title>/)?.[1] || 'No title'
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

async function runTests() {
  console.log('🧪 Testing website connectivity...')
  
  try {
    console.log('📡 Testing http://localhost:8080...')
    const result = await testURL('http://localhost:8080')
    
    console.log('📊 Test Results:')
    console.log(`   Status: ${result.status}`)
    console.log(`   Title: "${result.title}"`)
    console.log(`   Content Length: ${result.contentLength} bytes`)
    console.log(`   Has Content: ${result.hasContent ? '✅' : '❌'}`)
    console.log(`   Has React: ${result.hasReact ? '✅' : '❌'}`)
    console.log(`   Has Vite: ${result.hasVite ? '✅' : '❌'}`)
    
    if (result.status === 200 && result.hasContent) {
      console.log('✅ Website is accessible and serving content!')
      
      // Test API endpoints
      console.log('\n🔌 Testing API connectivity...')
      
      // Test categories data access
      try {
        const { execSync } = await import('child_process')
        const nodeCheck = execSync('node -e "const data = require(\\"./src/data/categories.json\\"); console.log(data.length)"', {
          encoding: 'utf8',
          cwd: '/mnt/c/MYCLAUDE_PROJECT/jul/lovable'
        })
        console.log(`✅ Categories data: ${nodeCheck.trim()} categories loaded`)
      } catch (e) {
        console.log('⚠️ Categories data check failed:', e.message)
      }
      
      // Test products data access
      try {
        const { execSync } = await import('child_process')
        const nodeCheck = execSync('node -e "const data = require(\\"./src/data/products.json\\"); console.log(data.length)"', {
          encoding: 'utf8',
          cwd: '/mnt/c/MYCLAUDE_PROJECT/jul/lovable'
        })
        console.log(`✅ Products data: ${nodeCheck.trim()} products loaded`)
      } catch (e) {
        console.log('⚠️ Products data check failed:', e.message)
      }
      
    } else {
      console.log('❌ Website is not working properly')
      if (result.status !== 200) {
        console.log(`   HTTP Error: ${result.status}`)
      }
      if (!result.hasContent) {
        console.log('   No content returned')
      }
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 The development server is not running or not accessible')
      console.log('   Try running: npm run dev')
    } else if (error.message === 'Timeout') {
      console.log('💡 Server is taking too long to respond')
    }
  }
}

runTests()