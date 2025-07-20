#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 파일 경로 설정
const PRODUCTS_FILE = path.join(__dirname, '../src/data/products.json');
const IMAGES_DIR = path.join(__dirname, '../public/images');

console.log('🔍 최종 ABUI 이미지 매칭 스크립트 시작...');

// 현재 products.json 읽기
const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
console.log(`📊 총 제품 수: ${products.length}`);

// public/images 폴더의 ABUI 이미지 파일 목록 가져오기
const imageFiles = fs.readdirSync(IMAGES_DIR)
  .filter(file => file.startsWith('ABUI') && (file.endsWith('.jpg') || file.endsWith('.png')))
  .sort();

console.log(`📁 사용 가능한 ABUI 이미지 파일: ${imageFiles.length}개`);

// 완전한 매칭 함수
function finalMatching(originalUrl, originalExtracted) {
  if (!originalExtracted || !originalExtracted.includes('ABUI')) {
    return null;
  }

  console.log(`\n🔍 매칭 시도: ${originalExtracted}`);

  // 1. 정확한 파일명 매칭
  const exactMatch = imageFiles.find(file => file === originalExtracted);
  if (exactMatch) {
    console.log(`✅ 정확한 매칭: ${exactMatch}`);
    return {
      confidence: 1,
      method: 'direct_abui_match',
      matched_file: exactMatch,
      original_extracted: originalExtracted
    };
  }

  // 2. 크기 수정자 제거 매칭 (!300x300 등 제거)
  const cleanExtracted = originalExtracted.replace(/![0-9]+x[0-9]+/g, '');
  console.log(`🧹 크기 수정자 제거: ${cleanExtracted}`);
  
  const cleanMatch = imageFiles.find(file => file === cleanExtracted);
  if (cleanMatch) {
    console.log(`✅ 크기 수정자 제거 매칭: ${cleanMatch}`);
    return {
      confidence: 0.95,
      method: 'size_modifier_removed_match',
      matched_file: cleanMatch,
      original_extracted: originalExtracted,
      reason: 'size_modifier_removed'
    };
  }

  // 3. 확장자 변환 매칭
  const baseNameExtracted = cleanExtracted.replace(/\.(png|jpg)$/i, '');
  const extensionMatch = imageFiles.find(file => {
    const baseName = file.replace(/\.(png|jpg)$/i, '');
    return baseName === baseNameExtracted;
  });
  
  if (extensionMatch) {
    console.log(`✅ 확장자 변환 매칭: ${extensionMatch}`);
    return {
      confidence: 0.9,
      method: 'extension_conversion_match',
      matched_file: extensionMatch,
      original_extracted: originalExtracted,
      reason: 'extension_converted'
    };
  }

  // 4. 유사한 파일명 찾기 (퍼지 매칭)
  const basePattern = baseNameExtracted.substring(0, 20); // 처음 20글자
  const fuzzyMatch = imageFiles.find(file => {
    const fileBase = file.replace(/\.(png|jpg)$/i, '').substring(0, 20);
    return fileBase === basePattern;
  });

  if (fuzzyMatch) {
    console.log(`✅ 퍼지 매칭: ${fuzzyMatch}`);
    return {
      confidence: 0.8,
      method: 'fuzzy_match',
      matched_file: fuzzyMatch,
      original_extracted: originalExtracted,
      reason: 'fuzzy_match'
    };
  }

  console.log(`❌ 매칭 실패: ${originalExtracted}`);
  return null;
}

// 제품 데이터 업데이트
let alreadyMatched = 0;
let newlyMatched = 0;
let stillUnmatched = 0;

console.log('\n🔄 제품별 매칭 처리 시작...');

products.forEach((product, index) => {
  const originalUrl = product.original_url;
  const originalExtracted = product.match_info?.original_extracted;

  console.log(`\n📦 [${index + 1}/${products.length}] ${product.name}`);

  // 이미 높은 신뢰도로 매칭된 제품은 건너뛰기
  if (product.match_info?.confidence >= 0.95) {
    console.log(`✅ 이미 매칭됨 (신뢰도: ${product.match_info.confidence})`);
    alreadyMatched++;
    return;
  }

  // 최종 매칭 시도
  const matchResult = finalMatching(originalUrl, originalExtracted);
  
  if (matchResult) {
    // 제품 데이터 업데이트
    product.main_image_url = `/images/${matchResult.matched_file}`;
    product.image_urls = [`/images/${matchResult.matched_file}`];
    product.match_info = matchResult;
    product.updated_at = new Date().toISOString();
    
    console.log(`✅ 매칭 성공: ${matchResult.matched_file} (${matchResult.method}, ${matchResult.confidence})`);
    newlyMatched++;
  } else {
    console.log(`❌ 매칭 실패: ${originalExtracted}`);
    stillUnmatched++;
  }
});

// 백업 생성
const backupFile = PRODUCTS_FILE + '.backup-final-' + new Date().toISOString().replace(/[:.]/g, '-');
fs.writeFileSync(backupFile, JSON.stringify(products, null, 2));
console.log(`\n💾 백업 생성: ${backupFile}`);

// 업데이트된 데이터 저장
fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));

console.log('\n📈 최종 매칭 결과:');
console.log(`기존 매칭된 제품: ${alreadyMatched}개`);
console.log(`새로 매칭된 제품: ${newlyMatched}개`);
console.log(`여전히 매칭 실패: ${stillUnmatched}개`);
console.log(`총 매칭된 제품: ${alreadyMatched + newlyMatched}개`);
console.log(`매칭률: ${((alreadyMatched + newlyMatched) / products.length * 100).toFixed(1)}%`);

console.log('\n🎉 최종 ABUI 이미지 매칭 완료!');

// 성공 통계
if (newlyMatched > 0) {
  console.log('\n✨ 새로 매칭된 제품들:');
  products.forEach((product, index) => {
    if (product.match_info?.confidence >= 0.8 && product.updated_at?.includes('2025-07-15T07:5')) {
      console.log(`   ${index + 1}. ${product.name} → ${product.match_info.matched_file}`);
    }
  });
}