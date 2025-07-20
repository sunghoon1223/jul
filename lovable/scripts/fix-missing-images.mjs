#!/usr/bin/env node

// 🔧 누락된 이미지 파일 수정 스크립트
// 존재하지 않는 ABUI 이미지를 플레이스홀더로 되돌리기

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

async function fixMissingImages() {
  console.log('🔧 누락된 이미지 파일 수정 시작...');
  
  try {
    // 백업 생성
    const productsData = await fs.readFile(CONFIG.PRODUCTS_FILE, 'utf8');
    const backupPath = path.join(CONFIG.BACKUP_DIR, `products-fix-${Date.now()}.json`);
    await fs.mkdir(CONFIG.BACKUP_DIR, { recursive: true });
    await fs.writeFile(backupPath, productsData);
    console.log(`💾 백업 생성: ${backupPath}`);
    
    const products = JSON.parse(productsData);
    let fixedCount = 0;
    let verifiedCount = 0;
    
    console.log('\n📋 이미지 파일 검증 및 수정...');
    
    for (const product of products) {
      if (product.main_image_url && product.main_image_url.startsWith('/images/ABUI')) {
        const imagePath = path.join(CONFIG.IMAGES_DIR, product.main_image_url.replace('/images/', ''));
        
        try {
          await fs.access(imagePath);
          // 파일이 존재함
          console.log(`✅ 유효: ${product.name} - ${product.main_image_url}`);
          verifiedCount++;
        } catch (error) {
          // 파일이 존재하지 않음 - 플레이스홀더로 되돌리기
          console.log(`❌ 누락: ${product.name} - ${product.main_image_url}`);
          console.log(`   → 플레이스홀더로 변경`);
          
          product.main_image_url = '/images/placeholder.svg';
          product.image_urls = ['/images/placeholder.svg'];
          product.updated_at = new Date().toISOString();
          
          // match_info 업데이트
          if (product.match_info) {
            product.match_info.method = 'fixed_missing';
            product.match_info.reason = 'file_not_found';
            product.match_info.confidence = 0;
          }
          
          fixedCount++;
        }
      }
    }
    
    // 수정된 데이터 저장
    await fs.writeFile(CONFIG.PRODUCTS_FILE, JSON.stringify(products, null, 2));
    
    console.log('\n📊 === 수정 완료 ===');
    console.log(`✅ 검증된 이미지: ${verifiedCount}개`);
    console.log(`🔧 수정된 제품: ${fixedCount}개`);
    console.log(`📦 총 제품 수: ${products.length}개`);
    
    if (fixedCount > 0) {
      console.log('\n🎯 권장 작업:');
      console.log('1. npm run dev - 개발 서버 재시작');
      console.log('2. 브라우저에서 http://localhost:8080 확인');
      console.log('3. F12 → Console에서 이미지 로딩 메시지 확인');
    }
    
    return { verified: verifiedCount, fixed: fixedCount, total: products.length };
    
  } catch (error) {
    console.error('💥 수정 실패:', error);
    throw error;
  }
}

// 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  fixMissingImages().catch(console.error);
}

export { fixMissingImages };