#!/usr/bin/env node

// 🚀 JP Caster 이미지 자동 다운로드 및 최적화 스크립트
// 사용법: node scripts/download-optimize-images.mjs

import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';
import sharp from 'sharp'; // npm install sharp

const IMAGES_DIR = './public/images/products';
const PRODUCTS_FILE = './src/data/products.json';
const MAX_CONCURRENT = 5; // 동시 다운로드 수

async function downloadAndOptimizeImages() {
  console.log('🚀 이미지 다운로드 및 최적화 시작...');
  
  // 이미지 디렉토리 생성
  await fs.mkdir(IMAGES_DIR, { recursive: true });
  
  // 제품 데이터 로드
  const products = JSON.parse(await fs.readFile(PRODUCTS_FILE, 'utf8'));
  
  let successCount = 0;
  let failCount = 0;
  
  // 배치 처리로 동시 다운로드 제한
  for (let i = 0; i < products.length; i += MAX_CONCURRENT) {
    const batch = products.slice(i, i + MAX_CONCURRENT);
    
    await Promise.all(batch.map(async (product) => {
      try {
        if (product.main_image_url && product.main_image_url.includes('jpcaster.cn')) {
          await downloadAndOptimizeImage(product);
          successCount++;
          console.log(`✅ ${product.name} (${successCount}/${products.length})`);
        }
      } catch (error) {
        failCount++;
        console.error(`❌ ${product.name}:`, error.message);
      }
    }));
  }
  
  console.log(`\n🎉 완료! 성공: ${successCount}, 실패: ${failCount}`);
  console.log('📝 제품 데이터 업데이트 중...');
  
  // 제품 데이터의 이미지 URL 업데이트
  const updatedProducts = products.map(product => ({
    ...product,
    main_image_url: product.main_image_url.includes('jpcaster.cn') 
      ? `/images/products/${product.id}.webp`
      : product.main_image_url
  }));
  
  await fs.writeFile(PRODUCTS_FILE, JSON.stringify(updatedProducts, null, 2));
  console.log('✅ 제품 데이터 업데이트 완료!');
}

async function downloadAndOptimizeImage(product) {
  const imageUrl = product.main_image_url;
  const filename = `${product.id}.webp`;
  const filepath = path.join(IMAGES_DIR, filename);
  
  // 이미 존재하면 건너뛰기
  try {
    await fs.access(filepath);
    return; // 파일이 이미 존재함
  } catch {
    // 파일이 없으므로 다운로드 진행
  }
  
  const response = await fetch(imageUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  
  const buffer = await response.buffer();
  
  // Sharp로 이미지 최적화 (WebP 변환, 리사이즈)
  await sharp(buffer)
    .resize(400, 400, { 
      fit: 'cover',
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .webp({ quality: 85 })
    .toFile(filepath);
}

// 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  downloadAndOptimizeImages().catch(console.error);
}

export { downloadAndOptimizeImages };
