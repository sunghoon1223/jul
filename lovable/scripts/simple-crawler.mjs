import puppeteer from 'puppeteer';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SimpleCrawler {
  constructor() {
    this.baseUrl = 'http://www.jpcaster.cn';
    this.dataDir = path.join(__dirname, '../crawled_data');
    this.imagesDir = path.join(__dirname, '../public/images/crawled');
    this.results = [];
    
    this.ensureDirectories();
  }
  
  ensureDirectories() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    if (!fs.existsSync(this.imagesDir)) {
      fs.mkdirSync(this.imagesDir, { recursive: true });
    }
  }
  
  async crawlWithAxios(url, categoryName, expectedCount) {
    try {
      console.log(`📥 Crawling: ${url}`);
      console.log(`📂 Category: ${categoryName}`);
      
      // Use axios to get the page content
      const response = await axios.get(url, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      // Parse with cheerio
      const $ = cheerio.load(response.data);
      
      const products = [];
      
      // Try different selectors to find products
      const productSelectors = [
        '.product-item',
        '.product-list .item',
        '.pro-item',
        '[class*="product"]',
        '.col-md-3',
        '.col-sm-6',
        'a[href*="pd.jsp"]'
      ];
      
      let productElements = $();
      for (const selector of productSelectors) {
        productElements = $(selector);
        if (productElements.length > 0) {
          console.log(`✅ Found products with selector: ${selector}`);
          break;
        }
      }
      
      // If still no products found, try to find any links with images
      if (productElements.length === 0) {
        productElements = $('a').filter((i, el) => {
          const $el = $(el);
          return $el.find('img').length > 0 || $el.attr('href')?.includes('pd.jsp');
        });
        console.log(`🔍 Fallback: Found ${productElements.length} elements with images or product links`);
      }
      
      productElements.each((index, element) => {
        const $el = $(element);
        
        // Extract product information
        let name = '';
        let image = '';
        let link = '';
        
        // Try to find product name
        const nameElement = $el.find('.product-name, .pro-name, .title, h3, h4, .name').first();
        if (nameElement.length) {
          name = nameElement.text().trim();
        } else {
          // Try image alt text
          const imgElement = $el.find('img').first();
          if (imgElement.length) {
            name = imgElement.attr('alt') || imgElement.attr('title') || '';
          }
        }
        
        // Try to find product image
        const imgElement = $el.find('img').first();
        if (imgElement.length) {
          let imgSrc = imgElement.attr('src');
          if (imgSrc) {
            // Make absolute URL
            if (imgSrc.startsWith('/')) {
              imgSrc = this.baseUrl + imgSrc;
            } else if (imgSrc.startsWith('../')) {
              imgSrc = this.baseUrl + '/' + imgSrc.replace('../', '');
            }
            image = imgSrc;
          }
        }
        
        // Try to find product link
        if ($el.is('a')) {
          link = $el.attr('href');
        } else {
          const linkElement = $el.find('a').first();
          if (linkElement.length) {
            link = linkElement.attr('href');
          }
        }
        
        // Make absolute URL for links
        if (link && link.startsWith('/')) {
          link = this.baseUrl + link;
        }
        
        // Only add if we have meaningful data
        if (name || image || link) {
          products.push({
            name: name || `Product ${index + 1}`,
            image: image,
            link: link,
            category: categoryName,
            index: index + 1
          });
        }
      });
      
      console.log(`✅ Found ${products.length} products (expected: ${expectedCount})`);
      
      // Process products and download images
      const processedProducts = [];
      
      for (let i = 0; i < Math.min(products.length, expectedCount || products.length); i++) {
        const product = products[i];
        
        console.log(`📦 Processing ${i + 1}/${products.length}: ${product.name}`);
        
        // Download image if available
        let localImagePath = null;
        if (product.image) {
          localImagePath = await this.downloadImage(product.image, `${categoryName}_${i + 1}`);
        }
        
        const processedProduct = {
          id: `prod_${Date.now()}_${i}`,
          name: product.name,
          category: categoryName,
          categoryUrl: url,
          originalImageUrl: product.image,
          localImagePath: localImagePath,
          productUrl: product.link,
          sku: `JP-${Date.now()}-${i}`,
          price: 0,
          stock: 100,
          status: 'active',
          created_at: new Date().toISOString()
        };
        
        processedProducts.push(processedProduct);
      }
      
      return {
        categoryName,
        categoryUrl: url,
        expectedCount,
        actualCount: processedProducts.length,
        products: processedProducts
      };
      
    } catch (error) {
      console.error(`❌ Error crawling ${url}:`, error.message);
      return {
        categoryName: categoryName || 'Error',
        categoryUrl: url,
        expectedCount,
        actualCount: 0,
        products: [],
        error: error.message
      };
    }
  }
  
  async downloadImage(imageUrl, filename) {
    try {
      if (!imageUrl) return null;
      
      console.log(`📸 Downloading: ${imageUrl}`);
      
      // Extract file extension
      const urlParts = imageUrl.split('.');
      const extension = urlParts[urlParts.length - 1].split('?')[0] || 'jpg';
      
      // Create safe filename
      const safeFilename = filename.replace(/[^a-zA-Z0-9_-]/g, '_');
      const localFilename = `${safeFilename}.${extension}`;
      const localPath = path.join(this.imagesDir, localFilename);
      
      // Skip if already exists
      if (fs.existsSync(localPath)) {
        console.log(`🔄 Image already exists: ${localFilename}`);
        return `/images/crawled/${localFilename}`;
      }
      
      // Download image
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      fs.writeFileSync(localPath, response.data);
      console.log(`✅ Image saved: ${localFilename}`);
      
      return `/images/crawled/${localFilename}`;
      
    } catch (error) {
      console.log(`⚠️  Could not download image ${imageUrl}: ${error.message}`);
      return null;
    }
  }
  
  async crawlAll() {
    console.log('🎯 Starting JP Caster website crawl...');
    
    const urlsToScrape = [
      { url: 'http://www.jpcaster.cn/col.jsp?id=106', category: 'Industrial Casters', expected: 3 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_223', category: 'Heavy Duty Casters', expected: 5 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_225', category: 'Medical Casters', expected: 1 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_3', category: 'Light Duty Casters', expected: 8 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_4', category: 'Medium Duty Casters', expected: 40 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_5', category: 'Heavy Duty Industrial', expected: 39 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_81', category: 'Swivel Casters', expected: 56 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_82', category: 'Fixed Casters', expected: 19 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_83', category: 'Brake Casters', expected: 7 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_251', category: 'Specialty Casters', expected: 3 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_179', category: 'Custom Casters', expected: 1 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_237', category: 'Furniture Casters', expected: 3 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_182', category: 'Cart Casters', expected: 8 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_180', category: 'Trolley Casters', expected: 7 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_228', category: 'Platform Casters', expected: 2 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_236', category: 'Door Casters', expected: 2 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_183', category: 'Equipment Casters', expected: 3 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_184', category: 'Machine Casters', expected: 2 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_185', category: 'Pneumatic Casters', expected: 5 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_157', category: 'Rubber Wheel Casters', expected: 7 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_159', category: 'Polyurethane Casters', expected: 7 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_161', category: 'Nylon Wheel Casters', expected: 7 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_165', category: 'Steel Wheel Casters', expected: 5 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_167', category: 'Plastic Wheel Casters', expected: 6 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_168', category: 'Ball Bearing Casters', expected: 7 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_169', category: 'Roller Bearing Casters', expected: 4 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_173', category: 'Stainless Steel Casters', expected: 6 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_176', category: 'Anti-Static Casters', expected: 5 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_178', category: 'High Temperature Casters', expected: 2 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_212', category: 'Low Temperature Casters', expected: 3 }
    ];
    
    const results = [];
    let totalProducts = 0;
    
    for (let i = 0; i < urlsToScrape.length; i++) {
      const { url, category, expected } = urlsToScrape[i];
      
      console.log(`\n📋 Progress: ${i + 1}/${urlsToScrape.length}`);
      console.log(`🔗 URL: ${url}`);
      
      const result = await this.crawlWithAxios(url, category, expected);
      results.push(result);
      totalProducts += result.products.length;
      
      // Save intermediate results
      this.saveResults(results, totalProducts);
      
      // Wait between requests
      if (i < urlsToScrape.length - 1) {
        console.log('⏳ Waiting 2 seconds...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log(`\n🎉 Crawling completed!`);
    console.log(`📊 Total categories: ${results.length}`);
    console.log(`📦 Total products: ${totalProducts}`);
    
    return results;
  }
  
  saveResults(results, totalProducts) {
    // Save detailed results
    const detailedResults = {
      crawledAt: new Date().toISOString(),
      totalCategories: results.length,
      totalProducts: totalProducts,
      categories: results
    };
    
    fs.writeFileSync(
      path.join(this.dataDir, 'crawl_results.json'),
      JSON.stringify(detailedResults, null, 2)
    );
    
    // Create products and categories arrays
    const allProducts = [];
    const categories = [];
    
    results.forEach((result, categoryIndex) => {
      if (result.categoryName && result.categoryName !== 'Error') {
        // Add category
        const categoryId = `cat_${categoryIndex + 1}`;
        categories.push({
          id: categoryId,
          name: result.categoryName,
          slug: result.categoryName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          description: `${result.categoryName} products from JP Caster`,
          url: result.categoryUrl
        });
        
        // Add products
        result.products.forEach(product => {
          allProducts.push({
            ...product,
            categoryId: categoryId
          });
        });
      }
    });
    
    // Save products and categories
    fs.writeFileSync(
      path.join(this.dataDir, 'products.json'),
      JSON.stringify(allProducts, null, 2)
    );
    
    fs.writeFileSync(
      path.join(this.dataDir, 'categories.json'),
      JSON.stringify(categories, null, 2)
    );
    
    console.log(`💾 Results saved to ${this.dataDir}/`);
    console.log(`📊 Current totals: ${categories.length} categories, ${allProducts.length} products`);
  }
}

// Test with single category first
async function testSingle() {
  const crawler = new SimpleCrawler();
  
  try {
    console.log('🧪 Testing single category...');
    
    const result = await crawler.crawlWithAxios(
      'http://www.jpcaster.cn/col.jsp?id=106',
      'Test Category',
      3
    );
    
    console.log('\n📊 Test Results:');
    console.log(`Category: ${result.categoryName}`);
    console.log(`Products found: ${result.actualCount}`);
    console.log(`Expected: ${result.expectedCount}`);
    
    if (result.products.length > 0) {
      console.log('\n📦 Sample Product:');
      console.log(JSON.stringify(result.products[0], null, 2));
    }
    
    // Save test results
    crawler.saveResults([result], result.products.length);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--test')) {
    await testSingle();
  } else {
    const crawler = new SimpleCrawler();
    await crawler.crawlAll();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default SimpleCrawler;