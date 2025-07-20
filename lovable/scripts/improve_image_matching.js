#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 파일 경로 설정
const PRODUCTS_FILE = path.join(__dirname, '../src/data/products.json');
const IMAGES_DIR = path.join(__dirname, '../public/images');

console.log('🔍 ABUI 이미지 매칭 개선 스크립트 시작...');

// 현재 products.json 읽기
const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
console.log(`📊 총 제품 수: ${products.length}`);

// public/images 폴더의 ABUI 이미지 파일 목록 가져오기
const imageFiles = fs.readdirSync(IMAGES_DIR)
  .filter(file => file.startsWith('ABUI') && (file.endsWith('.jpg') || file.endsWith('.png')))
  .sort();

console.log(`📁 사용 가능한 ABUI 이미지 파일: ${imageFiles.length}개`);
console.log('파일 목록:', imageFiles.slice(0, 5), '...');

// 개선된 매칭 함수
function improvedMatching(originalUrl, originalExtracted) {
  if (!originalExtracted || !originalExtracted.startsWith('ABUI')) {
    return null;
  }

  // 1. 정확한 파일명 매칭
  const exactMatch = imageFiles.find(file => file === originalExtracted);
  if (exactMatch) {
    return {
      confidence: 1,
      method: 'direct_abui_match',
      matched_file: exactMatch,
      original_extracted: originalExtracted
    };
  }

  // 2. 확장자 변환 매칭 (.png -> .jpg)
  const baseNameExtracted = originalExtracted.replace(/\.(png|jpg)$/i, '');
  const extensionMatch = imageFiles.find(file => {
    const baseName = file.replace(/\.(png|jpg)$/i, '');
    return baseName === baseNameExtracted;
  });
  
  if (extensionMatch) {
    return {
      confidence: 0.9,
      method: 'extension_conversion_match',
      matched_file: extensionMatch,
      original_extracted: originalExtracted,
      reason: 'extension_converted'
    };
  }

  // 3. 크기 수정자 제거 매칭 (!300x300 등)
  const cleanExtracted = originalExtracted.replace(/![0-9x]+/g, '');
  if (cleanExtracted !== originalExtracted) {
    const sizeCleanMatch = imageFiles.find(file => file === cleanExtracted);
    if (sizeCleanMatch) {
      return {
        confidence: 0.8,
        method: 'size_modifier_removed_match',
        matched_file: sizeCleanMatch,
        original_extracted: originalExtracted,
        reason: 'size_modifier_removed'
      };
    }
  }

  // 4. 부분 매칭 (ABUI 고유 식별자 기준)
  const abuiId = originalExtracted.match(/ABUI[A-Za-z0-9]+/);
  if (abuiId) {
    const partialMatch = imageFiles.find(file => file.includes(abuiId[0]));
    if (partialMatch) {
      return {
        confidence: 0.7,
        method: 'partial_abui_match',
        matched_file: partialMatch,
        original_extracted: originalExtracted,
        reason: 'partial_id_match'
      };
    }
  }

  return null;
}

// 제품 데이터 업데이트
let matchedCount = 0;
let improvedCount = 0;

products.forEach((product, index) => {
  const originalUrl = product.original_url;
  const originalExtracted = product.match_info?.original_extracted;

  // 이미 매칭된 제품은 건너뛰기
  if (product.match_info?.method === 'direct_abui_match' && product.match_info?.confidence === 1) {
    matchedCount++;
    return;
  }

  // 개선된 매칭 시도
  const matchResult = improvedMatching(originalUrl, originalExtracted);
  
  if (matchResult) {
    // 제품 데이터 업데이트
    product.main_image_url = `/images/${matchResult.matched_file}`;
    product.image_urls = [`/images/${matchResult.matched_file}`];
    product.match_info = matchResult;
    product.updated_at = new Date().toISOString();
    
    console.log(`✅ [${index + 1}] ${product.name}: ${matchResult.matched_file} (${matchResult.method})`);
    improvedCount++;
  } else {
    console.log(`❌ [${index + 1}] ${product.name}: 매칭 실패 - ${originalExtracted}`);
  }
});

// 백업 생성
const backupFile = PRODUCTS_FILE + '.backup-' + new Date().toISOString().replace(/[:.]/g, '-');
fs.writeFileSync(backupFile, JSON.stringify(products, null, 2));
console.log(`💾 백업 생성: ${backupFile}`);

// 업데이트된 데이터 저장
fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));

console.log('\n📈 매칭 결과:');
console.log(`기존 매칭된 제품: ${matchedCount}개`);
console.log(`새로 매칭된 제품: ${improvedCount}개`);
console.log(`총 매칭된 제품: ${matchedCount + improvedCount}개`);
console.log(`매칭률: ${((matchedCount + improvedCount) / products.length * 100).toFixed(1)}%`);

console.log('\n🎉 ABUI 이미지 매칭 개선 완료!');