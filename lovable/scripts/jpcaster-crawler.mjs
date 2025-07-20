import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Disable SSL verification for the crawler
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

class JPCasterCrawler {
  constructor() {
    this.baseUrl = 'http://www.jpcaster.cn';
    this.browser = null;
    this.page = null;
    this.categories = [];
    this.products = [];
    this.images = new Map(); // Store image URLs and local paths
    
    // Create directories
    this.dataDir = path.join(__dirname, '../crawled_data');
    this.imagesDir = path.join(__dirname, '../public/images/crawled');
    
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
  
  async init() {
    console.log('🚀 Initializing browser...');
    this.browser = await chromium.launch({ 
      headless: false, // Set to true for production
      args: ['--ignore-certificate-errors', '--ignore-ssl-errors']
    });
    this.page = await this.browser.newPage();
    
    // Set user agent to avoid blocking
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Set timeout
    this.page.setDefaultTimeout(30000);
  }
  
  async crawlCategoryPage(url, expectedCount = null) {
    try {
      console.log(`📥 Crawling: ${url}`);
      
      await this.page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // Wait for page to load
      await this.page.waitForTimeout(2000);
      
      // Extract category name from page
      const categoryName = await this.page.evaluate(() => {
        // Try multiple selectors for category name
        const selectors = [
          '.nav-title',
          '.category-title', 
          '.page-title',
          'h1',
          '.breadcrumb li:last-child',
          'title'
        ];
        
        for (const selector of selectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent.trim()) {
            return element.textContent.trim();
          }
        }
        return 'Unknown Category';
      });
      
      console.log(`📂 Category: ${categoryName}`);
      
      // Extract products from the page
      const products = await this.page.evaluate(() => {
        const products = [];
        
        // Try multiple selectors for product containers
        const containerSelectors = [
          '.product-item',
          '.product-list .item',
          '.pro-item',
          '[class*="product"]',
          '.col-md-3',
          '.col-sm-6'
        ];
        
        let productElements = [];
        for (const selector of containerSelectors) {
          productElements = document.querySelectorAll(selector);
          if (productElements.length > 0) break;
        }
        
        // If no specific containers, try to find product links and images
        if (productElements.length === 0) {
          // Look for links that might be product links
          const links = document.querySelectorAll('a[href*="pd.jsp"], a[href*="product"], a[href*="detail"]');
          productElements = links;
        }
        
        productElements.forEach((element, index) => {
          try {
            // Extract product information
            let name = '';
            let image = '';
            let link = '';
            
            // Try to find product name
            const nameSelectors = [
              '.product-name',
              '.pro-name', 
              '.title',
              'h3',
              'h4',
              '.name',
              'img[alt]'
            ];
            
            for (const selector of nameSelectors) {
              const nameEl = element.querySelector(selector);
              if (nameEl) {
                if (nameEl.tagName === 'IMG') {
                  name = nameEl.alt || nameEl.title || '';
                } else {
                  name = nameEl.textContent?.trim() || '';
                }
                if (name) break;
              }
            }
            
            // Try to find product image
            const imageSelectors = [
              'img[src]',
              '.product-image img',
              '.pro-img img'
            ];
            
            for (const selector of imageSelectors) {
              const imgEl = element.querySelector(selector);
              if (imgEl && imgEl.src) {
                image = imgEl.src;
                break;
              }
            }
            
            // Try to find product link
            if (element.tagName === 'A') {
              link = element.href;
            } else {
              const linkEl = element.querySelector('a[href]');
              if (linkEl) {
                link = linkEl.href;
              }
            }
            
            // If we couldn't find a name, try to extract from image alt or generate one
            if (!name && image) {
              const imgEl = element.querySelector('img');
              name = imgEl?.alt || imgEl?.title || `Product ${index + 1}`;
            }
            
            if (name || image || link) {
              products.push({
                name: name || `Product ${index + 1}`,
                image: image,
                link: link,
                rawHtml: element.outerHTML.substring(0, 500) // For debugging
              });
            }
          } catch (error) {
            console.log('Error processing product element:', error);
          }
        });
        
        return products;
      });
      
      console.log(`✅ Found ${products.length} products (expected: ${expectedCount || 'unknown'})`);
      
      if (expectedCount && products.length !== expectedCount) {
        console.warn(`⚠️  Expected ${expectedCount} products but found ${products.length}`);
      }
      
      // Process each product
      const processedProducts = [];
      
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        
        console.log(`📦 Processing product ${i + 1}/${products.length}: ${product.name}`);
        
        // Download and save image if available
        let localImagePath = null;
        if (product.image) {
          localImagePath = await this.downloadImage(product.image, `${categoryName}_${i + 1}`);
        }
        
        // Get additional product details if link is available
        let details = {};
        if (product.link && product.link.includes('pd.jsp')) {
          details = await this.crawlProductDetails(product.link);
        }
        
        const processedProduct = {
          name: product.name,
          category: categoryName,
          categoryUrl: url,
          originalImageUrl: product.image,
          localImagePath: localImagePath,
          productUrl: product.link,
          ...details,
          sku: `JP-${Date.now()}-${i}`, // Generate unique SKU
          created_at: new Date().toISOString()
        };
        
        processedProducts.push(processedProduct);
      }
      
      return {
        categoryName,
        categoryUrl: url,
        products: processedProducts,
        expectedCount,
        actualCount: processedProducts.length
      };
      
    } catch (error) {
      console.error(`❌ Error crawling ${url}:`, error);
      return {
        categoryName: 'Error',
        categoryUrl: url,
        products: [],
        error: error.message
      };
    }
  }
  
  async crawlProductDetails(productUrl) {
    try {
      // Create a new page for product details to avoid interference
      const detailPage = await this.browser.newPage();
      await detailPage.goto(productUrl, { waitUntil: 'networkidle', timeout: 15000 });
      
      const details = await detailPage.evaluate(() => {
        const result = {};
        
        // Try to extract more detailed information
        const descriptionSelectors = [
          '.product-description',
          '.pro-desc',
          '.description',
          '.content',
          '.detail'
        ];
        
        for (const selector of descriptionSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            result.description = element.textContent?.trim() || '';
            break;
          }
        }
        
        // Try to extract specifications
        const specElements = document.querySelectorAll('.spec-item, .specification tr, .detail-table tr');
        const specifications = {};
        
        specElements.forEach(element => {
          const label = element.querySelector('.label, td:first-child, th');
          const value = element.querySelector('.value, td:last-child');
          
          if (label && value) {
            specifications[label.textContent?.trim()] = value.textContent?.trim();
          }
        });
        
        if (Object.keys(specifications).length > 0) {
          result.specifications = specifications;
        }
        
        // Try to extract additional images
        const additionalImages = [];
        const imageElements = document.querySelectorAll('.product-gallery img, .additional-images img');
        
        imageElements.forEach(img => {
          if (img.src && !additionalImages.includes(img.src)) {
            additionalImages.push(img.src);
          }
        });
        
        if (additionalImages.length > 0) {
          result.additionalImages = additionalImages;
        }
        
        return result;
      });
      
      await detailPage.close();
      return details;
      
    } catch (error) {
      console.log(`⚠️  Could not get details for ${productUrl}:`, error.message);
      return {};
    }
  }
  
  async downloadImage(imageUrl, filename) {
    try {
      if (!imageUrl || imageUrl === 'undefined') return null;
      
      // Make sure URL is absolute
      if (imageUrl.startsWith('/')) {
        imageUrl = this.baseUrl + imageUrl;
      }
      
      // Extract file extension
      const urlParts = imageUrl.split('.');
      const extension = urlParts[urlParts.length - 1].split('?')[0] || 'jpg';
      
      // Create safe filename
      const safeFilename = filename.replace(/[^a-zA-Z0-9_-]/g, '_');
      const localFilename = `${safeFilename}.${extension}`;
      const localPath = path.join(this.imagesDir, localFilename);
      
      // Skip if already downloaded
      if (fs.existsSync(localPath)) {
        console.log(`🔄 Image already exists: ${localFilename}`);
        return `/images/crawled/${localFilename}`;
      }
      
      // Download image
      console.log(`📸 Downloading image: ${imageUrl}`);
      
      await this.page.goto(imageUrl);
      const imageBuffer = await this.page.screenshot({ fullPage: true });
      
      // Alternative: Use HTTP request if screenshot doesn't work
      if (!imageBuffer || imageBuffer.length === 0) {
        return await this.downloadImageHTTP(imageUrl, localPath, localFilename);
      }
      
      fs.writeFileSync(localPath, imageBuffer);
      console.log(`✅ Image saved: ${localFilename}`);
      
      return `/images/crawled/${localFilename}`;
      
    } catch (error) {
      console.log(`⚠️  Could not download image ${imageUrl}:`, error.message);
      return null;
    }
  }
  
  async downloadImageHTTP(imageUrl, localPath, localFilename) {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(localPath);
      
      https.get(imageUrl, (response) => {
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          console.log(`✅ Image saved via HTTP: ${localFilename}`);
          resolve(`/images/crawled/${localFilename}`);
        });
        
        file.on('error', (error) => {
          fs.unlink(localPath, () => {}); // Delete partial file
          reject(error);
        });
      }).on('error', (error) => {
        reject(error);
      });
    });
  }
  
  async crawlAll() {
    console.log('🎯 Starting comprehensive crawl of JP Caster website...');
    
    const urlsToScrape = [
      { url: 'http://www.jpcaster.cn/col.jsp?id=106', expected: 3 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_223', expected: 5 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_225', expected: 1 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_3', expected: 8 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_4', expected: 40 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_5', expected: 39 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_81', expected: 56 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_82', expected: 19 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_83', expected: 7 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_251', expected: 3 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_179', expected: 1 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_237', expected: 3 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_182', expected: 8 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_180', expected: 7 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_228', expected: 2 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_236', expected: 2 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_183', expected: 3 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_184', expected: 2 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_185', expected: 5 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_157', expected: 7 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_159', expected: 7 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_161', expected: 7 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_165', expected: 5 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_167', expected: 6 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_168', expected: 7 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_169', expected: 4 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_173', expected: 6 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_176', expected: 5 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_178', expected: 2 },
      { url: 'http://www.jpcaster.cn/pr.jsp?_jcp=3_212', expected: 3 }
    ];
    
    const results = [];
    let totalProducts = 0;
    
    for (let i = 0; i < urlsToScrape.length; i++) {
      const { url, expected } = urlsToScrape[i];
      
      console.log(`\n📋 Progress: ${i + 1}/${urlsToScrape.length}`);
      console.log(`🔗 URL: ${url}`);
      
      const result = await this.crawlCategoryPage(url, expected);
      results.push(result);
      
      totalProducts += result.products.length;
      
      // Save intermediate results
      this.saveResults(results, totalProducts);
      
      // Wait between requests to be respectful
      if (i < urlsToScrape.length - 1) {
        console.log('⏳ Waiting 3 seconds before next request...');
        await this.page.waitForTimeout(3000);
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
    
    // Create simplified products array for easy import
    const allProducts = [];
    const categories = [];
    
    results.forEach(result => {
      // Add category
      if (result.categoryName && result.categoryName !== 'Error') {
        categories.push({
          id: `cat_${categories.length + 1}`,
          name: result.categoryName,
          slug: result.categoryName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          description: `${result.categoryName} products from JP Caster`,
          url: result.categoryUrl
        });
      }
      
      // Add products
      result.products.forEach((product, index) => {
        allProducts.push({
          ...product,
          id: `prod_${allProducts.length + 1}`,
          categoryId: `cat_${categories.length}`,
          price: 0, // Default price
          stock: 100, // Default stock
          status: 'active'
        });
      });
    });
    
    // Save products and categories separately
    fs.writeFileSync(
      path.join(this.dataDir, 'products.json'),
      JSON.stringify(allProducts, null, 2)
    );
    
    fs.writeFileSync(
      path.join(this.dataDir, 'categories.json'),
      JSON.stringify(categories, null, 2)
    );
    
    console.log(`💾 Results saved to ${this.dataDir}/`);
  }
  
  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Main execution
async function main() {
  const crawler = new JPCasterCrawler();
  
  try {
    await crawler.init();
    const results = await crawler.crawlAll();
    
    console.log('\n🎯 Crawling Summary:');
    results.forEach(result => {
      console.log(`📂 ${result.categoryName}: ${result.products.length} products`);
    });
    
  } catch (error) {
    console.error('❌ Crawling failed:', error);
  } finally {
    await crawler.close();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default JPCasterCrawler;