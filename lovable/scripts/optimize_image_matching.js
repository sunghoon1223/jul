#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 파일 경로 설정
const CRAWLED_DATA_FILE = path.join(__dirname, '../crawled_data/products.json');
const CURRENT_PRODUCTS_FILE = path.join(__dirname, '../src/data/products.json');
const IMAGES_DIR = path.join(__dirname, '../public/images');

console.log('🎯 로컬 ABUI 이미지 매칭 최적화 시작...');

// 크롤링 원본 데이터 읽기
const crawledData = JSON.parse(fs.readFileSync(CRAWLED_DATA_FILE, 'utf8'));
const currentProducts = JSON.parse(fs.readFileSync(CURRENT_PRODUCTS_FILE, 'utf8'));

console.log(`📊 크롤링 원본 데이터: ${crawledData.length}개`);
console.log(`📊 현재 제품 데이터: ${currentProducts.length}개`);

// public/images 폴더의 ABUI 이미지 파일 목록 가져오기
const imageFiles = fs.readdirSync(IMAGES_DIR)
  .filter(file => file.startsWith('ABUI') && (file.endsWith('.jpg') || file.endsWith('.png')))
  .sort();

console.log(`📁 사용 가능한 ABUI 이미지 파일: ${imageFiles.length}개`);

// 카테고리 매핑 정보
const categoryMapping = {
  'Industrial Casters': 'cat_industrial',
  'Heavy Duty Industrial': 'cat_industrial',
  'Equipment Casters': 'cat_industrial',
  'Machine Casters': 'cat_industrial',
  
  'Heavy Duty Casters': 'cat_heavy_duty',
  'Platform Casters': 'cat_heavy_duty',
  'Trolley Casters': 'cat_heavy_duty',
  'Cart Casters': 'cat_heavy_duty',
  
  'Light Duty Casters': 'cat_light_medium',
  'Medium Duty Casters': 'cat_light_medium',
  'Furniture Casters': 'cat_light_medium',
  'Door Casters': 'cat_light_medium',
  'Swivel Casters': 'cat_light_medium',
  'Fixed Casters': 'cat_light_medium',
  'Brake Casters': 'cat_light_medium',
  
  'Medical Casters': 'cat_specialty',
  'Anti-Static Casters': 'cat_specialty',
  'High Temperature Casters': 'cat_specialty',
  'Low Temperature Casters': 'cat_specialty',
  'Pneumatic Casters': 'cat_specialty',
  'Custom Casters': 'cat_specialty',
  'Specialty Casters': 'cat_specialty',
  
  'Rubber Wheel Casters': 'cat_wheel_material',
  'Polyurethane Casters': 'cat_wheel_material',
  'Nylon Wheel Casters': 'cat_wheel_material',
  'Steel Wheel Casters': 'cat_wheel_material',
  'Plastic Wheel Casters': 'cat_wheel_material',
  'Stainless Steel Casters': 'cat_wheel_material',
  'Ball Bearing Casters': 'cat_wheel_material',
  'Roller Bearing Casters': 'cat_wheel_material'
};

// 이미지 매칭 함수
function matchImage(originalImageUrl) {
  if (!originalImageUrl || !originalImageUrl.includes('ABUI')) {
    return null;
  }

  console.log(`\n🔍 매칭 시도: ${originalImageUrl}`);

  // URL에서 ABUI 파일명 추출
  const match = originalImageUrl.match(/ABUI[^\/\?]+\.(jpg|png)/i);
  if (!match) {
    console.log(`❌ ABUI 파일명 추출 실패`);
    return null;
  }

  let extractedFilename = match[0];
  console.log(`📝 추출된 파일명: ${extractedFilename}`);

  // 1. 정확한 파일명 매칭
  const exactMatch = imageFiles.find(file => file === extractedFilename);
  if (exactMatch) {
    console.log(`✅ 정확한 매칭: ${exactMatch}`);
    return {
      filename: exactMatch,
      confidence: 1.0,
      method: 'exact_match'
    };
  }

  // 2. 크기 수정자 제거 매칭 (!300x300 등 제거)
  const cleanFilename = extractedFilename.replace(/![0-9]+x[0-9]+/g, '');
  console.log(`🧹 크기 수정자 제거: ${cleanFilename}`);
  
  const cleanMatch = imageFiles.find(file => file === cleanFilename);
  if (cleanMatch) {
    console.log(`✅ 크기 수정자 제거 매칭: ${cleanMatch}`);
    return {
      filename: cleanMatch,
      confidence: 0.95,
      method: 'size_modifier_removed'
    };
  }

  // 3. 확장자 변환 매칭
  const baseNameExtracted = cleanFilename.replace(/\.(png|jpg)$/i, '');
  const extensionMatch = imageFiles.find(file => {
    const baseName = file.replace(/\.(png|jpg)$/i, '');
    return baseName === baseNameExtracted;
  });
  
  if (extensionMatch) {
    console.log(`✅ 확장자 변환 매칭: ${extensionMatch}`);
    return {
      filename: extensionMatch,
      confidence: 0.9,
      method: 'extension_conversion'
    };
  }

  console.log(`❌ 매칭 실패: ${extractedFilename}`);
  return null;
}

// 사용되지 않은 이미지 파일 목록
let usedImages = new Set();

// 제품 데이터 업데이트
let matchedCount = 0;
let unmatchedCount = 0;
const updatedProducts = [];

console.log('\n🔄 제품별 이미지 매칭 시작...');

// 크롤링 데이터를 기반으로 제품 데이터 재구성
for (let i = 0; i < Math.min(crawledData.length, 50); i++) {
  const crawledProduct = crawledData[i];
  
  console.log(`\n📦 [${i + 1}/50] ${crawledProduct.name}`);
  
  // 기본 제품 정보 구성
  const product = {
    id: crawledProduct.id,
    name: crawledProduct.name,
    slug: crawledProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
    description: `${crawledProduct.name} from ${crawledProduct.category} category manufactured by JP Caster.`,
    price: crawledProduct.price || 0,
    sale_price: null,
    sku: crawledProduct.sku,
    stock_quantity: crawledProduct.stock || 100,
    stock_status: 'instock',
    weight: null,
    dimensions: null,
    manufacturer: 'JP Caster',
    main_image_url: '/images/placeholder.svg',
    image_urls: ['/images/placeholder.svg'],
    is_published: true,
    tags: [],
    source_url: crawledProduct.originalImageUrl,
    category_id: categoryMapping[crawledProduct.category] || 'cat_industrial',
    created_at: crawledProduct.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // 이미지 매칭 시도
  const matchResult = matchImage(crawledProduct.originalImageUrl);
  
  if (matchResult) {
    product.main_image_url = `/images/${matchResult.filename}`;
    product.image_urls = [`/images/${matchResult.filename}`];
    product.match_info = {
      confidence: matchResult.confidence,
      method: matchResult.method,
      matched_file: matchResult.filename,
      original_url: crawledProduct.originalImageUrl
    };
    
    usedImages.add(matchResult.filename);
    matchedCount++;
    console.log(`✅ 매칭 성공: ${matchResult.filename} (${matchResult.method})`);
  } else {
    product.match_info = {
      confidence: 0,
      method: 'no_match',
      original_url: crawledProduct.originalImageUrl,
      reason: 'no_matching_file'
    };
    unmatchedCount++;
    console.log(`❌ 매칭 실패`);
  }

  updatedProducts.push(product);
}

// 매칭되지 않은 제품에 남은 이미지 할당
const unusedImages = imageFiles.filter(file => !usedImages.has(file));
console.log(`\n🔄 매칭되지 않은 제품에 남은 이미지 할당... (${unusedImages.length}개 남음)`);

let unusedImageIndex = 0;
for (const product of updatedProducts) {
  if (product.match_info.confidence === 0 && unusedImageIndex < unusedImages.length) {
    const assignedImage = unusedImages[unusedImageIndex];
    product.main_image_url = `/images/${assignedImage}`;
    product.image_urls = [`/images/${assignedImage}`];
    product.match_info = {
      confidence: 0.5,
      method: 'assigned_unused',
      matched_file: assignedImage,
      original_url: product.source_url,
      reason: 'assigned_from_unused_pool'
    };
    
    matchedCount++;
    unmatchedCount--;
    unusedImageIndex++;
    console.log(`🔄 할당됨: ${product.name} → ${assignedImage}`);
  }
}

// 백업 생성
const backupFile = CURRENT_PRODUCTS_FILE + '.backup-' + new Date().toISOString().replace(/[:.]/g, '-');
fs.writeFileSync(backupFile, JSON.stringify(currentProducts, null, 2));
console.log(`\n💾 백업 생성: ${backupFile}`);

// 업데이트된 데이터 저장
fs.writeFileSync(CURRENT_PRODUCTS_FILE, JSON.stringify(updatedProducts, null, 2));

console.log('\n📈 최종 매칭 결과:');
console.log(`✅ 매칭된 제품: ${matchedCount}개`);
console.log(`❌ 매칭 실패: ${unmatchedCount}개`);
console.log(`📊 매칭률: ${((matchedCount / updatedProducts.length) * 100).toFixed(1)}%`);
console.log(`🖼️ 사용된 이미지: ${usedImages.size + unusedImageIndex}개 / ${imageFiles.length}개`);

console.log('\n🎉 이미지 매칭 최적화 완료!');