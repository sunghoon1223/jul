#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// 한글 및 특수문자를 URL-safe slug로 변환
function createSlug(text) {
  // 한글 제거하고 영문/숫자만 남기기
  let slug = text
    .toLowerCase()
    .replace(/[가-힣]/g, '') // 한글 제거
    .replace(/[^a-z0-9\s-]/g, '') // 영문, 숫자, 공백, 하이픈만 남기기
    .replace(/\s+/g, '-') // 공백을 하이픈으로 변경
    .replace(/-+/g, '-') // 연속된 하이픈을 하나로 변경
    .replace(/^-+|-+$/g, ''); // 시작과 끝의 하이픈 제거
  
  // 빈 문자열인 경우 기본값 사용
  if (!slug) {
    slug = 'product';
  }
  
  return slug;
}

// 중복된 slug 해결
function makeUniqueSlug(baseSlug, existingSlugs) {
  let slug = baseSlug;
  let counter = 1;
  
  while (existingSlugs.has(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

// 메인 함수
async function fixProductSlugs() {
  console.log('🔧 제품 slug 수정 시작...');
  
  try {
    // 제품 데이터 로드
    const productsPath = '/mnt/c/MYCLAUDE_PROJECT/jul/lovable/src/data/products.json';
    const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    
    console.log(`📊 총 제품 수: ${productsData.length}개`);
    
    // 백업 생성
    const backupPath = `/mnt/c/MYCLAUDE_PROJECT/jul/lovable/src/data/products.json.backup-slug-${new Date().toISOString().replace(/:/g, '-')}`;
    fs.writeFileSync(backupPath, JSON.stringify(productsData, null, 2));
    console.log(`💾 백업 파일 생성: ${path.basename(backupPath)}`);
    
    // 기존 slug 추적
    const existingSlugs = new Set();
    let fixedCount = 0;
    
    const updatedProducts = productsData.map((product, index) => {
      // 기존 slug가 비어있거나 유효하지 않은 경우 수정
      if (!product.slug || product.slug === '') {
        // 제품명이나 SKU를 기반으로 slug 생성
        let baseSlug = '';
        
        // 제품명에서 영문/숫자 부분 추출
        if (product.name) {
          baseSlug = createSlug(product.name);
        }
        
        // 여전히 비어있으면 SKU 사용
        if (!baseSlug && product.sku) {
          baseSlug = createSlug(product.sku);
        }
        
        // 여전히 비어있으면 ID 사용
        if (!baseSlug) {
          baseSlug = `product-${index + 1}`;
        }
        
        // 중복 방지
        const uniqueSlug = makeUniqueSlug(baseSlug, existingSlugs);
        existingSlugs.add(uniqueSlug);
        
        console.log(`   ${index + 1}. "${product.name}" → "${uniqueSlug}"`);
        fixedCount++;
        
        return {
          ...product,
          slug: uniqueSlug,
          updated_at: new Date().toISOString()
        };
      } else {
        // 기존 slug가 있으면 추적만 하고 유지
        existingSlugs.add(product.slug);
        return product;
      }
    });
    
    // 결과 저장
    fs.writeFileSync(productsPath, JSON.stringify(updatedProducts, null, 2));
    
    console.log(`\\n✅ 제품 slug 수정 완료!`);
    console.log(`📂 업데이트된 파일: ${productsPath}`);
    console.log(`💾 백업 파일: ${backupPath}`);
    console.log(`🔧 수정된 제품 수: ${fixedCount}개`);
    
    // 샘플 slug 출력
    console.log('\\n🔍 생성된 slug 샘플:');
    updatedProducts.slice(0, 5).forEach((product, i) => {
      console.log(`   ${i + 1}. ${product.name} → ${product.slug}`);
    });
    
  } catch (error) {
    console.error('❌ 스크립트 실행 오류:', error.message);
    process.exit(1);
  }
}

// 스크립트 실행
fixProductSlugs().catch(console.error);