import JPCasterCrawler from './jpcaster-crawler.mjs';

async function testSinglePage() {
  const crawler = new JPCasterCrawler();
  
  try {
    console.log('🧪 Testing crawler with single page...');
    await crawler.init();
    
    // Test just one page first
    const result = await crawler.crawlCategoryPage('http://www.jpcaster.cn/col.jsp?id=106', 3);
    
    console.log('\n📊 Test Results:');
    console.log(`Category: ${result.categoryName}`);
    console.log(`Products found: ${result.products.length}`);
    console.log(`Expected: 3`);
    
    if (result.products.length > 0) {
      console.log('\n📦 Sample Product:');
      console.log(JSON.stringify(result.products[0], null, 2));
    }
    
    // Save test results
    crawler.saveResults([result], result.products.length);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await crawler.close();
  }
}

testSinglePage();