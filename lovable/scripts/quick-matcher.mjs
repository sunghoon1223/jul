#!/usr/bin/env node

/**
 * Quick Manual Image Matcher - 빠른 수동 매칭
 */

import fs from 'fs/promises';

const quickMatches = [
  // 고확률 매칭 패턴들 (수동으로 확인된 패턴)
  { pattern: 'ABUIABACGAAgw67ovwYoy-e26QcwoAY4oAY', file: 'ABUIABACGAAgw67ovwYoy-e26QcwoAY4oAY.jpg' },
  { pattern: 'ABUIABACGAAg4LuTtwYo-tLygQQwoAY4oAY', file: 'ABUIABACGAAg4LuTtwYo-tLygQQwoAY4oAY.jpg' },
  { pattern: 'ABUIABACGAAgq8-IoQYoiPnjvgMwoAY4oAY', file: 'ABUIABACGAAgq8-IoQYoiPnjvgMwoAY4oAY.jpg' },
  { pattern: 'ABUIABACGAAg-NKVugYors-enAMwoAY4oAY', file: 'ABUIABACGAAg-NKVugYors-enAMwoAY4oAY.jpg' },
  { pattern: 'ABUIABACGAAgt76jtAYos7jrnAEwoAY4oAY', file: 'ABUIABACGAAgt76jtAYos7jrnAEwoAY4oAY.jpg' },
  { pattern: 'ABUIABACGAAg5fahrQYomNjOwAUwoAY4oAY', file: 'ABUIABACGAAg5fahrQYomNjOwAUwoAY4oAY.jpg' },
  { pattern: 'ABUIABACGAAgmvuhrQYon620iwYwoAY4oAY', file: 'ABUIABACGAAgmvuhrQYon620iwYwoAY4oAY.jpg' },
  { pattern: 'ABUIABACGAAgxrHzwgYovMaNsAcwoAY4oAY', file: 'ABUIABACGAAgxrHzwgYovMaNsAcwoAY4oAY.jpg' },
  { pattern: 'ABUIABACGAAg8MnZswYoltDl4QEwoAY4oAY', file: 'ABUIABACGAAg8MnZswYoltDl4QEwoAY4oAY.jpg' },
  { pattern: 'ABUIABACGAAg57PXqQYoyfqj5gcwoAY4oAY', file: 'ABUIABACGAAg57PXqQYoyfqj5gcwoAY4oAY.jpg' }
];

async function quickMatch() {
  try {
    console.log('⚡ 빠른 매칭 시작...');
    
    const products = JSON.parse(await fs.readFile('./src/data/products.json', 'utf-8'));
    let matchCount = 0;
    
    for (const product of products) {
      if (product.main_image_url?.startsWith('/images/ABUI')) continue;
      
      const originalUrl = product.original_url || '';
      for (const match of quickMatches) {
        if (originalUrl.includes(match.pattern)) {
          product.main_image_url = `/images/${match.file}`;
          product.image_urls = [`/images/${match.file}`];
          product.updated_at = new Date().toISOString();
          matchCount++;
          console.log(`✅ ${product.name} → ${match.file}`);
          break;
        }
      }
    }
    
    await fs.writeFile('./src/data/products.json', JSON.stringify(products, null, 2));
    console.log(`🎉 ${matchCount}개 제품 매칭 완료!`);
    
  } catch (error) {
    console.error('❌ 빠른 매칭 실패:', error.message);
  }
}

quickMatch();