#!/usr/bin/env node

// 🚀 Direct ABUI Pattern Image Matcher
// Simple and efficient direct pattern matching
// Usage: node scripts/direct-image-matcher.mjs

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

const CONFIG = {
  PRODUCTS_FILE: path.join(ROOT_DIR, 'src/data/products.json'),
  IMAGES_DIR: path.join(ROOT_DIR, 'public/images'),
  BACKUP_DIR: path.join(ROOT_DIR, 'backups'),
};

// 🔍 Direct Pattern Matcher
class DirectImageMatcher {
  constructor() {
    this.stats = {
      total_products: 0,
      matched: 0,
      failed: 0,
      already_local: 0
    };
    this.localImages = [];
  }

  // 📁 Load available local images
  async loadLocalImages() {
    try {
      const files = await fs.readdir(CONFIG.IMAGES_DIR);
      this.localImages = files.filter(file => 
        file.startsWith('ABUI') && file.endsWith('.jpg')
      );
      console.log(`✅ Found ${this.localImages.length} local ABUI images`);
      return this.localImages;
    } catch (error) {
      console.error('❌ Failed to load local images:', error);
      return [];
    }
  }

  // 🎯 Extract ABUI pattern from URL
  extractABUIPattern(url) {
    if (!url || typeof url !== 'string') return null;
    
    // Extract ABUI pattern from URLs like:
    // http://www.jpcaster.cn//25412776.s21i.faiusr.com/2/ABUIABACGAAgw67ovwYoy-e26QcwoAY4oAY!300x300.jpg
    const abuiMatch = url.match(/ABUI[A-Za-z0-9_-]+/);
    if (abuiMatch) {
      return abuiMatch[0] + '.jpg';
    }
    
    return null;
  }

  // 🔍 Find exact match in local files
  findExactMatch(extractedPattern) {
    if (!extractedPattern) return null;
    
    // Check for exact match
    if (this.localImages.includes(extractedPattern)) {
      return extractedPattern;
    }
    
    return null;
  }

  // 🎯 Process individual product
  async processProduct(product) {
    if (!product.original_url || product.main_image_url?.startsWith('/images/') && !product.main_image_url.includes('placeholder')) {
      this.stats.already_local++;
      return product; // Already using local image
    }

    const extractedPattern = this.extractABUIPattern(product.original_url);
    if (!extractedPattern) {
      this.stats.failed++;
      return product; // Can't extract pattern
    }

    const matchedFile = this.findExactMatch(extractedPattern);
    if (matchedFile) {
      // Success! Update to use local image
      product.main_image_url = `/images/${matchedFile}`;
      product.image_urls = [`/images/${matchedFile}`];
      product.match_info = {
        confidence: 1.0,
        method: "direct_abui_match",
        matched_file: matchedFile,
        original_extracted: extractedPattern,
        reason: "exact_pattern_match"
      };
      product.updated_at = new Date().toISOString();
      
      this.stats.matched++;
      console.log(`✅ ${product.name}: ${extractedPattern} → ${matchedFile}`);
      return product;
    } else {
      this.stats.failed++;
      console.log(`❌ ${product.name}: No match for ${extractedPattern}`);
      return product; // Keep placeholder
    }
  }

  // 🚀 Main execution
  async execute() {
    console.log('🚀 Starting Direct ABUI Pattern Matching...');
    
    try {
      // Load local images
      await this.loadLocalImages();
      
      // Load products
      const productsData = await fs.readFile(CONFIG.PRODUCTS_FILE, 'utf8');
      const products = JSON.parse(productsData);
      this.stats.total_products = products.length;
      
      console.log(`📦 Processing ${products.length} products...`);
      
      // Create backup
      const backupPath = path.join(CONFIG.BACKUP_DIR, `products-${Date.now()}.json`);
      await fs.mkdir(CONFIG.BACKUP_DIR, { recursive: true });
      await fs.writeFile(backupPath, productsData);
      console.log(`💾 Backup created: ${backupPath}`);
      
      // Process each product
      const updatedProducts = [];
      for (const product of products) {
        const updatedProduct = await this.processProduct(product);
        updatedProducts.push(updatedProduct);
      }
      
      // Save updated products
      await fs.writeFile(CONFIG.PRODUCTS_FILE, JSON.stringify(updatedProducts, null, 2));
      
      // Print results
      console.log('\n📊 === Matching Results ===');
      console.log(`📦 Total products: ${this.stats.total_products}`);
      console.log(`✅ Successfully matched: ${this.stats.matched}`);
      console.log(`❌ Failed to match: ${this.stats.failed}`);
      console.log(`🔄 Already local: ${this.stats.already_local}`);
      console.log(`📈 Success rate: ${Math.round((this.stats.matched / this.stats.total_products) * 100)}%`);
      console.log('🎉 Matching completed!');
      
      return {
        total: this.stats.total_products,
        matched: this.stats.matched,
        failed: this.stats.failed,
        already_local: this.stats.already_local,
        success_rate: Math.round((this.stats.matched / this.stats.total_products) * 100)
      };
      
    } catch (error) {
      console.error('💥 Matching failed:', error);
      throw error;
    }
  }
}

// Execute if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const matcher = new DirectImageMatcher();
  matcher.execute().catch(console.error);
}

export { DirectImageMatcher };