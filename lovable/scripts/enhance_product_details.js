#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// 캐스터 전용 상세 정보 템플릿
const casterTemplates = {
  'cat_industrial': {
    baseDescription: '산업용 캐스터로 제조업 및 창고 환경에서 사용되는 고내구성 제품입니다.',
    features: {
      'load_capacity': '500-2000kg',
      'wheel_material': 'Polyurethane/Steel',
      'bearing_type': 'Ball Bearing',
      'temperature_range': '-20°C to +80°C',
      'floor_protection': 'Non-marking',
      'swivel_type': 'Kingpin/Raceway'
    },
    specifications: {
      'mounting_type': 'Plate/Stem',
      'brake_option': 'Available',
      'maintenance': 'Low maintenance',
      'certification': 'Industrial grade'
    }
  },
  'cat_heavy_duty': {
    baseDescription: '극한 하중을 견딜 수 있는 중량급 캐스터로 건설 및 항만 장비에 최적화되었습니다.',
    features: {
      'load_capacity': '1000-5000kg',
      'wheel_material': 'Steel/Cast Iron',
      'bearing_type': 'Roller Bearing',
      'temperature_range': '-30°C to +120°C',
      'floor_protection': 'Heavy duty',
      'swivel_type': 'Kingpin reinforced'
    },
    specifications: {
      'mounting_type': 'Heavy duty plate',
      'brake_option': 'Double brake',
      'maintenance': 'Grease lubrication',
      'certification': 'Heavy duty certified'
    }
  },
  'cat_light_medium': {
    baseDescription: '가벼운 운반 및 일반 사무 환경에 적합한 범용 캐스터입니다.',
    features: {
      'load_capacity': '50-500kg',
      'wheel_material': 'Rubber/Plastic',
      'bearing_type': 'Plain Bearing',
      'temperature_range': '0°C to +60°C',
      'floor_protection': 'Non-marking',
      'swivel_type': 'Raceway'
    },
    specifications: {
      'mounting_type': 'Plate/Stem',
      'brake_option': 'Optional',
      'maintenance': 'Maintenance free',
      'certification': 'Standard grade'
    }
  },
  'cat_specialty': {
    baseDescription: '특수 환경 및 용도에 맞춘 맞춤형 캐스터로 고유한 요구사항을 만족합니다.',
    features: {
      'load_capacity': '100-1000kg',
      'wheel_material': 'Specialized materials',
      'bearing_type': 'Precision bearing',
      'temperature_range': 'Environment specific',
      'floor_protection': 'Specialized coating',
      'swivel_type': 'Custom design'
    },
    specifications: {
      'mounting_type': 'Custom mounting',
      'brake_option': 'Specialized brake',
      'maintenance': 'Application specific',
      'certification': 'Special purpose'
    }
  },
  'cat_wheel_material': {
    baseDescription: '다양한 바퀴 소재로 제작된 캐스터로 바닥 조건에 최적화된 성능을 제공합니다.',
    features: {
      'load_capacity': '100-1500kg',
      'wheel_material': 'Various materials',
      'bearing_type': 'Material optimized',
      'temperature_range': 'Material dependent',
      'floor_protection': 'Material specific',
      'swivel_type': 'Standard/Custom'
    },
    specifications: {
      'mounting_type': 'Standard plate',
      'brake_option': 'Available',
      'maintenance': 'Material dependent',
      'certification': 'Material certified'
    }
  }
};

// 제품명에서 치수 정보 추출
function extractDimensions(productName) {
  // 패턴: 숫자x숫자mm 또는 숫자*숫자mm
  const dimensionPattern = /(\d+)[\sx\*×](\d+)mm/gi;
  const match = productName.match(dimensionPattern);
  
  if (match) {
    const fullMatch = match[0];
    const numbers = fullMatch.match(/\d+/g);
    if (numbers && numbers.length >= 2) {
      return {
        wheel_diameter: `${numbers[0]}mm`,
        wheel_width: `${numbers[1]}mm`,
        overall_height: `${parseInt(numbers[0]) + 30}mm` // 추정값
      };
    }
  }
  
  return {
    wheel_diameter: 'Contact for specifications',
    wheel_width: 'Contact for specifications',
    overall_height: 'Contact for specifications'
  };
}

// 제품 상세 정보 강화
function enhanceProductDetails(products) {
  console.log(`🔧 ${products.length}개 제품의 상세 정보를 강화합니다...`);
  
  const enhancedProducts = products.map((product, index) => {
    const categoryId = product.category_id;
    const template = casterTemplates[categoryId] || casterTemplates['cat_industrial'];
    
    // 치수 정보 추출
    const dimensions = extractDimensions(product.name);
    
    // 강화된 설명 생성
    const enhancedDescription = `${template.baseDescription}\n\n` +
      `이 제품은 ${product.manufacturer}에서 제조한 고품질 캐스터로, ` +
      `다양한 산업 환경에서 안정적인 성능을 제공합니다. ` +
      `우수한 내구성과 원활한 회전 성능으로 작업 효율성을 높입니다.`;
    
    // 기술 사양 결합
    const combinedFeatures = {
      ...template.features,
      ...dimensions,
      ...template.specifications
    };
    
    // 제품 정보 업데이트
    const enhancedProduct = {
      ...product,
      description: enhancedDescription,
      features: combinedFeatures,
      dimensions: dimensions,
      technical_specs: {
        category: product.category_id,
        application: getApplicationByCategory(categoryId),
        warranty: '12 months',
        origin: 'China',
        quality_standard: 'ISO 9001'
      }
    };
    
    if ((index + 1) % 10 === 0) {
      console.log(`   진행률: ${index + 1}/${products.length} (${((index + 1) / products.length * 100).toFixed(1)}%)`);
    }
    
    return enhancedProduct;
  });
  
  console.log('✅ 제품 상세 정보 강화 완료');
  return enhancedProducts;
}

// 카테고리별 적용 분야 정의
function getApplicationByCategory(categoryId) {
  const applications = {
    'cat_industrial': 'Manufacturing, Warehouse, Factory equipment',
    'cat_heavy_duty': 'Construction, Port equipment, Heavy machinery',
    'cat_light_medium': 'Office furniture, Light equipment, General purpose',
    'cat_specialty': 'Medical equipment, Food service, Clean room',
    'cat_wheel_material': 'Floor specific applications, Noise reduction'
  };
  
  return applications[categoryId] || 'General industrial use';
}

// 추가 제품 정보 생성
function addAdditionalProductInfo(products) {
  console.log('📋 추가 제품 정보를 생성합니다...');
  
  return products.map(product => {
    // 가격 정보 (견적 기반)
    const priceInfo = {
      price_type: 'quote_based',
      min_order_quantity: 50,
      bulk_discount: 'Available for orders over 500 units',
      delivery_time: '2-3 weeks',
      payment_terms: 'T/T, L/C'
    };
    
    // 품질 정보
    const qualityInfo = {
      quality_control: 'Strict QC process',
      testing_standards: 'Load test, Durability test, Material analysis',
      certifications: ['ISO 9001', 'CE marking', 'RoHS compliant'],
      warranty_period: '12 months'
    };
    
    // 배송 정보
    const shippingInfo = {
      packaging: 'Carton box with protective padding',
      shipping_methods: ['Air freight', 'Sea freight', 'Express delivery'],
      lead_time: '15-20 working days',
      port_of_shipment: 'Shanghai/Ningbo'
    };
    
    return {
      ...product,
      pricing: priceInfo,
      quality: qualityInfo,
      shipping: shippingInfo,
      updated_at: new Date().toISOString()
    };
  });
}

// 메인 실행 함수
async function main() {
  console.log('🚀 제품 상세 정보 강화 스크립트 시작...\n');
  
  try {
    // 현재 제품 데이터 로드
    const productsPath = '/mnt/c/MYCLAUDE_PROJECT/jul/lovable/src/data/products.json';
    const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    
    console.log(`📊 현재 제품 수: ${productsData.length}개`);
    
    // 백업 생성
    const backupPath = `/mnt/c/MYCLAUDE_PROJECT/jul/lovable/src/data/products.json.backup-${new Date().toISOString().replace(/:/g, '-')}`;
    fs.writeFileSync(backupPath, JSON.stringify(productsData, null, 2));
    console.log(`💾 백업 파일 생성: ${path.basename(backupPath)}`);
    
    // 1단계: 제품 상세 정보 강화
    const enhancedProducts = enhanceProductDetails(productsData);
    
    // 2단계: 추가 제품 정보 생성
    const finalProducts = addAdditionalProductInfo(enhancedProducts);
    
    // 결과 저장
    fs.writeFileSync(productsPath, JSON.stringify(finalProducts, null, 2));
    
    console.log('\n🎉 제품 상세 정보 강화 완료!');
    console.log(`📂 업데이트된 파일: ${productsPath}`);
    console.log(`💾 백업 파일: ${backupPath}`);
    
    // 강화된 내용 요약
    console.log('\n📋 강화된 내용:');
    console.log('   ✅ 카테고리별 맞춤 설명');
    console.log('   ✅ 기술 사양 및 특징');
    console.log('   ✅ 치수 정보 (제품명에서 추출)');
    console.log('   ✅ 가격 및 주문 정보');
    console.log('   ✅ 품질 및 인증 정보');
    console.log('   ✅ 배송 및 납기 정보');
    
    // 샘플 제품 출력
    console.log('\n🔍 샘플 제품 정보:');
    console.log(`   제품명: ${finalProducts[0].name}`);
    console.log(`   설명 길이: ${finalProducts[0].description.length}자`);
    console.log(`   기술 사양: ${Object.keys(finalProducts[0].features).length}개`);
    console.log(`   추가 정보: 가격정보, 품질정보, 배송정보`);
    
  } catch (error) {
    console.error('❌ 스크립트 실행 오류:', error.message);
    process.exit(1);
  }
}

// 스크립트 실행
main().catch(console.error);