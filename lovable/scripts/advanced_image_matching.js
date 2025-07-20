#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 파일 경로 설정
const PRODUCTS_FILE = path.join(__dirname, '../src/data/products.json');
const IMAGES_DIR = path.join(__dirname, '../public/images');

console.log('🔍 고급 ABUI 이미지 매칭 스크립트 시작...');

// 현재 products.json 읽기
const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
console.log(`📊 총 제품 수: ${products.length}`);

// public/images 폴더의 ABUI 이미지 파일 목록 가져오기
const imageFiles = fs.readdirSync(IMAGES_DIR)
  .filter(file => file.startsWith('ABUI') && (file.endsWith('.jpg') || file.endsWith('.png')))
  .sort();

console.log(`📁 사용 가능한 ABUI 이미지 파일: ${imageFiles.length}개`);

// 고급 매칭 함수
function advancedMatching(originalUrl, originalExtracted) {
  if (!originalExtracted || !originalExtracted.includes('ABUI')) {
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

  // 2. 크기 수정자 제거 (!300x300, !200x200 등)
  const sizeCleanExtracted = originalExtracted.replace(/![0-9]+x[0-9]+/g, '');
  if (sizeCleanExtracted !== originalExtracted) {
    const sizeCleanMatch = imageFiles.find(file => file === sizeCleanExtracted);
    if (sizeCleanMatch) {
      return {
        confidence: 0.95,
        method: 'size_modifier_removed_match',
        matched_file: sizeCleanMatch,
        original_extracted: originalExtracted,
        reason: 'size_modifier_removed'
      };
    }
  }

  // 3. 확장자 변환 매칭 (.png -> .jpg)
  const baseNameExtracted = sizeCleanExtracted.replace(/\.(png|jpg)$/i, '');
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

  // 4. ABUI 고유 식별자 추출 및 매칭
  const abuiMatch = originalExtracted.match(/ABUI[A-Za-z0-9]+/);
  if (abuiMatch) {
    const abuiId = abuiMatch[0];
    const partialMatch = imageFiles.find(file => file.includes(abuiId));
    if (partialMatch) {
      return {
        confidence: 0.8,
        method: 'abui_id_match',
        matched_file: partialMatch,
        original_extracted: originalExtracted,
        reason: 'abui_id_match'
      };
    }
  }

  // 5. 더 넓은 범위의 부분 매칭 시도
  const cleanPattern = originalExtracted
    .replace(/![0-9]+x[0-9]+/g, '')  // 크기 수정자 제거
    .replace(/\.(png|jpg)$/i, '')    // 확장자 제거
    .substring(0, 25);               // 처음 25글자만 사용

  const broadMatch = imageFiles.find(file => {
    const filePattern = file.replace(/\.(png|jpg)$/i, '').substring(0, 25);
    return filePattern === cleanPattern;
  });

  if (broadMatch) {
    return {
      confidence: 0.7,
      method: 'broad_pattern_match',
      matched_file: broadMatch,
      original_extracted: originalExtracted,
      reason: 'broad_pattern_match'
    };
  }

  return null;
}

// 제품 데이터 업데이트
let alreadyMatched = 0;
let newlyMatched = 0;
let stillUnmatched = 0;

products.forEach((product, index) => {
  const originalUrl = product.original_url;
  const originalExtracted = product.match_info?.original_extracted;

  // 이미 높은 신뢰도로 매칭된 제품은 건너뛰기
  if (product.match_info?.confidence >= 0.9) {
    alreadyMatched++;
    return;
  }

  // 고급 매칭 시도
  const matchResult = advancedMatching(originalUrl, originalExtracted);
  
  if (matchResult) {
    // 제품 데이터 업데이트
    product.main_image_url = `/images/${matchResult.matched_file}`;
    product.image_urls = [`/images/${matchResult.matched_file}`];
    product.match_info = matchResult;
    product.updated_at = new Date().toISOString();
    
    console.log(`✅ [${index + 1}] ${product.name}: ${matchResult.matched_file} (${matchResult.method}, ${matchResult.confidence})`);
    newlyMatched++;
  } else {
    console.log(`❌ [${index + 1}] ${product.name}: 매칭 실패 - ${originalExtracted}`);
    stillUnmatched++;
  }
});

// 백업 생성
const backupFile = PRODUCTS_FILE + '.backup-advanced-' + new Date().toISOString().replace(/[:.]/g, '-');
fs.writeFileSync(backupFile, JSON.stringify(products, null, 2));
console.log(`💾 백업 생성: ${backupFile}`);

// 업데이트된 데이터 저장
fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));

console.log('\n📈 고급 매칭 결과:');
console.log(`기존 매칭된 제품: ${alreadyMatched}개`);
console.log(`새로 매칭된 제품: ${newlyMatched}개`);
console.log(`여전히 매칭 실패: ${stillUnmatched}개`);
console.log(`총 매칭된 제품: ${alreadyMatched + newlyMatched}개`);
console.log(`매칭률: ${((alreadyMatched + newlyMatched) / products.length * 100).toFixed(1)}%`);

console.log('\n🎉 고급 ABUI 이미지 매칭 완료!');

// 매칭된 이미지 파일 목록 확인
const usedImages = new Set();
products.forEach(product => {
  if (product.main_image_url && product.main_image_url.includes('ABUI')) {
    const fileName = product.main_image_url.replace('/images/', '');
    usedImages.add(fileName);
  }
});

console.log(`\n📋 매칭에 사용된 이미지 파일: ${usedImages.size}개`);
console.log(`📋 사용되지 않은 이미지 파일: ${imageFiles.length - usedImages.size}개`);

if (imageFiles.length - usedImages.size > 0) {
  console.log('\n🔍 사용되지 않은 이미지 파일들:');
  imageFiles.forEach(file => {
    if (!usedImages.has(file)) {
      console.log(`   - ${file}`);
    }
  });
}