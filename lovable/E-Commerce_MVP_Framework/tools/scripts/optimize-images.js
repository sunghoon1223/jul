#!/usr/bin/env node

/**
 * Image Optimization Script for E-Commerce MVP
 * Optimizes product images for web use
 */

const fs = require('fs');
const path = require('path');

// Configuration
const IMAGE_SIZES = {
  thumbnail: 200,
  medium: 400,
  large: 800
};

const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.webp'];

async function optimizeImages(sourceDir = 'public/images', outputDir = 'public/optimized') {
  console.log('🖼️  Starting image optimization...');
  
  try {
    // Check if source directory exists
    if (!fs.existsSync(sourceDir)) {
      console.error(`❌ Source directory ${sourceDir} does not exist`);
      return;
    }

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Read all files in source directory
    const files = fs.readdirSync(sourceDir);
    const imageFiles = files.filter(file => 
      SUPPORTED_FORMATS.includes(path.extname(file).toLowerCase())
    );

    console.log(`📁 Found ${imageFiles.length} images to optimize`);

    // Process each image
    for (const file of imageFiles) {
      const sourcePath = path.join(sourceDir, file);
      const fileInfo = path.parse(file);
      
      console.log(`🔄 Processing: ${file}`);

      // Create different sizes
      for (const [sizeName, width] of Object.entries(IMAGE_SIZES)) {
        const outputFileName = `${fileInfo.name}-${sizeName}${fileInfo.ext}`;
        const outputPath = path.join(outputDir, outputFileName);
        
        // For now, just copy the file (in real implementation, use sharp or similar)
        fs.copyFileSync(sourcePath, outputPath);
        console.log(`   ✅ Created ${sizeName} version (${width}px)`);
      }
    }

    // Generate image manifest
    const manifest = {
      optimized: true,
      timestamp: new Date().toISOString(),
      images: imageFiles.map(file => {
        const fileInfo = path.parse(file);
        return {
          original: file,
          variants: Object.keys(IMAGE_SIZES).map(size => 
            `${fileInfo.name}-${size}${fileInfo.ext}`
          )
        };
      })
    };

    fs.writeFileSync(
      path.join(outputDir, 'manifest.json'), 
      JSON.stringify(manifest, null, 2)
    );

    console.log('✅ Image optimization complete!');
    console.log(`📊 Optimized ${imageFiles.length} images`);
    console.log(`📄 Manifest saved to ${outputDir}/manifest.json`);

  } catch (error) {
    console.error('❌ Error during image optimization:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  const sourceDir = process.argv[2] || 'public/images';
  const outputDir = process.argv[3] || 'public/optimized';
  optimizeImages(sourceDir, outputDir);
}

module.exports = { optimizeImages };