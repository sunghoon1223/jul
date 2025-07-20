#!/usr/bin/env node

// 🚀 Quick Image Matching and Replacement Script
// Simplified version without Sentry dependencies

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

// 📊 Configuration
const CONFIG = {
  PRODUCTS_FILE: path.join(ROOT_DIR, 'src/data/products.json'),
  IMAGES_DIR: path.join(ROOT_DIR, 'public/images'),
  BACKUP_SUFFIX: `-backup-${new Date().toISOString().replace(/[:.]/g, '-')}`
};

console.log('🚀 Starting Quick Image Fix...');
console.log('====================================');

// Helper function to extract clean filename from URL
function extractCleanFilename(url) {
  if (!url || typeof url !== 'string') return null;
  
  // Extract ABUI pattern from jpcaster.cn URLs (handle !300x300 suffix)
  const abuiMatch = url.match(/(ABUI[A-Za-z0-9_-]+)\.([a-zA-Z]{3,4})(!300x300|!400x400)?/i);
  if (abuiMatch) {
    return `${abuiMatch[1]}.${abuiMatch[2]}`; // Remove !300x300 suffix
  }
  
  // Extract any filename from URL
  const generalMatch = url.match(/([^/]+\.(jpg|png|gif))(!300x300|!400x400)?$/i);
  if (generalMatch) {
    return generalMatch[1];
  }
  
  return null;
}

// Find best matching local file
function findBestMatch(extractedName, localFiles) {
  if (!extractedName) return null;
  
  // 1. Exact match
  const exactMatch = localFiles.find(file => file === extractedName);
  if (exactMatch) return { file: exactMatch, confidence: 1.0, method: 'exact' };
  
  // 2. Case-insensitive match
  const caseMatch = localFiles.find(file => 
    file.toLowerCase() === extractedName.toLowerCase()
  );
  if (caseMatch) return { file: caseMatch, confidence: 0.9, method: 'case_insensitive' };
  
  // 3. Partial match (contains ABUI pattern)
  const partialMatch = localFiles.find(file => {
    const baseName = extractedName.replace(/\.(jpg|png|gif)$/i, '');
    return file.toLowerCase().includes(baseName.toLowerCase());
  });
  if (partialMatch) return { file: partialMatch, confidence: 0.7, method: 'partial' };
  
  return null;
}

async function main() {
  try {
    // 1. Load products data
    console.log('📁 Loading products data...');
    const productsData = JSON.parse(await fs.readFile(CONFIG.PRODUCTS_FILE, 'utf8'));
    console.log(`   Found ${productsData.length} products`);
    
    // 2. Scan local images
    console.log('🖼️  Scanning local images...');
    const localFiles = await fs.readdir(CONFIG.IMAGES_DIR);
    const imageFiles = localFiles.filter(file => /\.(jpg|png|gif)$/i.test(file));
    console.log(`   Found ${imageFiles.length} local image files`);
    
    // 3. Create backup
    console.log('🔄 Creating backup...');
    const backupFile = CONFIG.PRODUCTS_FILE + CONFIG.BACKUP_SUFFIX;
    await fs.copyFile(CONFIG.PRODUCTS_FILE, backupFile);
    console.log(`   Backup saved: ${path.basename(backupFile)}`);
    
    // 4. Process each product
    console.log('🔍 Processing products...');
    let matchCount = 0;
    let placeholderCount = 0;
    
    const updatedProducts = productsData.map((product, index) => {
      const originalUrl = product.main_image_url;
      
      // Skip if already using local path
      if (originalUrl && originalUrl.startsWith('/images/')) {
        return product;
      }
      
      // Extract filename from external URL
      const extractedName = extractCleanFilename(originalUrl);
      const match = extractedName ? findBestMatch(extractedName, imageFiles) : null;
      
      if (match && match.confidence > 0.6) {
        // Use local image
        matchCount++;
        console.log(`   ✅ ${index + 1}/${productsData.length}: ${product.name} → ${match.file}`);
        return {
          ...product,
          main_image_url: `/images/${match.file}`,
          image_urls: [`/images/${match.file}`],
          original_url: originalUrl,
          match_info: {
            confidence: match.confidence,
            method: match.method,
            original_extracted: extractedName
          }
        };
      } else {
        // Use placeholder
        placeholderCount++;
        console.log(`   ⚠️  ${index + 1}/${productsData.length}: ${product.name} → placeholder (no match)`);
        return {
          ...product,
          main_image_url: '/images/placeholder.svg',
          image_urls: ['/images/placeholder.svg'],
          original_url: originalUrl,
          match_info: {
            confidence: 0,
            method: 'placeholder',
            original_extracted: extractedName,
            reason: match ? 'low_confidence' : 'no_match'
          }
        };
      }
    });
    
    // 5. Save updated products
    console.log('💾 Saving updated products...');
    await fs.writeFile(CONFIG.PRODUCTS_FILE, JSON.stringify(updatedProducts, null, 2));
    
    // 6. Report results
    console.log('');
    console.log('📊 RESULTS SUMMARY');
    console.log('==================');
    console.log(`Total products: ${productsData.length}`);
    console.log(`✅ Matched to local images: ${matchCount}`);
    console.log(`⚠️  Using placeholder: ${placeholderCount}`);
    console.log(`📈 Success rate: ${((matchCount / productsData.length) * 100).toFixed(1)}%`);
    console.log('');
    console.log(`🔄 Backup saved as: ${path.basename(backupFile)}`);
    console.log('✅ Image integration completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();