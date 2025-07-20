import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read existing data
const productsPath = path.join(__dirname, '../src/data/products.json');
const categoriesPath = path.join(__dirname, '../src/data/categories.json');

const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));

// Create category lookup map
const categoryMap = new Map(categoriesData.map(cat => [cat.id, cat]));

// Korean category name mapping
const categoryNameMapping = {
  'cat_industrial': '장비용 캐스터',
  'cat_heavy_duty': 'AGV 캐스터', 
  'cat_light_medium': '드라이빙 모듈',
  'cat_specialty': '폴리우레탄 휠',
  'cat_wheel_material': '러버 휠'
};

// Clean product names and generate proper Korean names
const generateKoreanName = (originalName, index, categoryId) => {
  const categoryPrefix = {
    'cat_industrial': 'IND',
    'cat_heavy_duty': 'AGV', 
    'cat_light_medium': 'DRV',
    'cat_specialty': 'PU',
    'cat_wheel_material': 'RUB'
  };
  
  const prefix = categoryPrefix[categoryId] || 'PRO';
  const productNumber = String(index + 1).padStart(3, '0');
  
  const typeNames = {
    'cat_industrial': ['산업용캐스터', '회전캐스터', '고정캐스터', '브레이크캐스터'],
    'cat_heavy_duty': ['AGV캐스터', 'AGV모듈', 'AGV휠', 'AGV브레이크'],
    'cat_light_medium': ['구동모듈', '드라이빙유닛', '모터모듈', '제어모듈'],
    'cat_specialty': ['폴리우레탄휠', 'PU휠', '특수휠', '메카넘휠'],
    'cat_wheel_material': ['고무휠', '러버휠', '충격흡수휠', '방진휠']
  };
  
  const types = typeNames[categoryId] || ['캐스터'];
  const typeName = types[index % types.length];
  
  return `${prefix}-${productNumber} ${typeName}`;
};

// Generate proper slugs
const generateSlug = (name, index) => {
  // Use simple pattern: category-number format
  const cleanName = name.replace(/[^a-zA-Z0-9가-힣\s-]/g, '');
  const parts = cleanName.split(' ');
  if (parts.length >= 2) {
    const prefix = parts[0].toLowerCase();
    const number = String(index + 1).padStart(3, '0');
    return `${prefix}-${number}`;
  }
  return `product-${String(index + 1).padStart(3, '0')}`;
};

// Generate realistic prices
const generatePrice = (categoryId, index) => {
  const priceRanges = {
    'cat_industrial': [80000, 200000],
    'cat_heavy_duty': [150000, 450000],
    'cat_light_medium': [200000, 600000], 
    'cat_specialty': [60000, 300000],
    'cat_wheel_material': [40000, 150000]
  };
  
  const [min, max] = priceRanges[categoryId] || [50000, 200000];
  const price = Math.floor(Math.random() * (max - min) + min);
  return Math.round(price / 5000) * 5000; // Round to nearest 5000
};

// Generate stock quantities
const generateStock = () => {
  const stocks = [0, 5, 10, 15, 20, 25, 30, 40, 50, 75, 100];
  return stocks[Math.floor(Math.random() * stocks.length)];
};

// Transform products
const transformedProducts = productsData.map((product, index) => {
  const category = categoryMap.get(product.category_id);
  if (!category) return null;
  
  const koreanName = generateKoreanName(product.name, index, product.category_id);
  const slug = generateSlug(koreanName, index);
  const price = generatePrice(product.category_id, index);
  const stock = generateStock();
  
  return {
    id: product.id || `prod_${Date.now()}_${index}`,
    name: koreanName,
    slug: slug,
    description: product.description || `${koreanName}은 고품질 소재로 제작된 전문 산업용 제품입니다. 뛰어난 내구성과 안정성으로 다양한 산업 환경에서 최적의 성능을 제공합니다.`,
    price: price,
    main_image_url: product.main_image_url || `/src/assets/product-${(index % 10) + 1}.jpg`,
    category: {
      id: category.slug.replace('-casters', '').replace('-', '_'),
      name: categoryNameMapping[product.category_id] || category.name
    },
    stock_quantity: stock,
    features: product.features || {
      "하중용량": "500-2000kg",
      "휠재질": "폴리우레탄/스틸", 
      "베어링타입": "볼베어링",
      "온도범위": "-20°C ~ +80°C",
      "바닥보호": "논마킹",
      "회전타입": "스위블/고정",
      "마운팅": "플레이트/스템",
      "브레이크옵션": "사용가능"
    }
  };
}).filter(Boolean);

// Write transformed data
const outputPath = path.join(__dirname, '../src/data/transformed-products.json');
fs.writeFileSync(outputPath, JSON.stringify(transformedProducts, null, 2));

console.log(`✅ Converted ${transformedProducts.length} products`);
console.log(`📁 Output saved to: ${outputPath}`);

// Print summary
const categoryStats = {};
transformedProducts.forEach(product => {
  const catName = product.category.name;
  categoryStats[catName] = (categoryStats[catName] || 0) + 1;
});

console.log('\n📊 Category Distribution:');
Object.entries(categoryStats).forEach(([cat, count]) => {
  console.log(`   ${cat}: ${count}개`);
});