#!/usr/bin/env node

import { chromium } from 'playwright';
import fs from 'fs';

async function detailedProductTest() {
  console.log('🔍 상세 제품 테스트 시작...');
  
  let browser;
  try {
    browser = await chromium.launch({ 
      headless: false,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    console.log('🌐 제품 목록 페이지 접속 중...');
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
    
    // 제품 목록 페이지로 이동
    await page.click('text=모든 제품', { timeout: 10000 });
    await page.waitForTimeout(3000);
    
    console.log('📸 제품 목록 페이지 스크린샷 촬영...');
    await page.screenshot({ path: 'product_list_test.png', fullPage: true });
    
    // 모든 제품 카드 확인
    const productCards = await page.locator('.group.cursor-pointer').all();
    console.log(`📦 총 제품 카드: ${productCards.length}개`);
    
    let abuiImagesFound = 0;
    let placeholderImagesFound = 0;
    const abuiProducts = [];
    
    for (let i = 0; i < productCards.length; i++) {
      const card = productCards[i];
      const img = card.locator('img').first();
      const src = await img.getAttribute('src');
      const alt = await img.getAttribute('alt');
      
      if (src && src.includes('ABUI')) {
        abuiImagesFound++;
        abuiProducts.push({
          index: i + 1,
          src,
          alt,
          filename: src.split('/').pop()
        });
        console.log(`✅ ABUI 이미지 발견 [${i + 1}]: ${alt} → ${src}`);
      } else if (src && src.includes('placeholder')) {
        placeholderImagesFound++;
        if (i < 10) { // 처음 10개만 로그
          console.log(`📝 플레이스홀더 [${i + 1}]: ${alt}`);
        }
      }
    }
    
    console.log(`\n📊 전체 제품 이미지 통계:`);
    console.log(`✅ ABUI 이미지: ${abuiImagesFound}개`);
    console.log(`📝 플레이스홀더: ${placeholderImagesFound}개`);
    console.log(`📈 ABUI 이미지 사용률: ${((abuiImagesFound / productCards.length) * 100).toFixed(1)}%`);
    
    // ABUI 이미지 상세 정보
    if (abuiProducts.length > 0) {
      console.log(`\n🎯 ABUI 이미지 사용 제품 상세:`);
      abuiProducts.forEach(product => {
        console.log(`   ${product.index}. ${product.alt}`);
        console.log(`      파일: ${product.filename}`);
        console.log(`      경로: ${product.src}`);
      });
    }
    
    // 첫 번째 ABUI 이미지 제품 클릭하여 상세 페이지 확인
    if (abuiProducts.length > 0) {
      console.log(`\n🔍 첫 번째 ABUI 제품 상세 페이지 테스트...`);
      const firstAbuiCard = productCards[abuiProducts[0].index - 1];
      await firstAbuiCard.click();
      await page.waitForTimeout(2000);
      
      console.log('📸 제품 상세 페이지 스크린샷 촬영...');
      await page.screenshot({ path: 'product_detail_test.png', fullPage: true });
      
      // 상세 페이지에서 이미지 확인
      const detailImg = await page.locator('img').first();
      const detailSrc = await detailImg.getAttribute('src');
      console.log(`📋 상세 페이지 이미지: ${detailSrc}`);
      
      const isDetailLoaded = await detailImg.evaluate(el => {
        return el.complete && el.naturalWidth > 0;
      });
      console.log(`   로딩 상태: ${isDetailLoaded ? '✅ 로딩됨' : '❌ 로딩 실패'}`);
    }
    
    // 결과 저장
    const results = {
      timestamp: new Date().toISOString(),
      totalProducts: productCards.length,
      abuiImages: abuiImagesFound,
      placeholderImages: placeholderImagesFound,
      abuiUsageRate: ((abuiImagesFound / productCards.length) * 100).toFixed(1),
      abuiProducts: abuiProducts
    };
    
    fs.writeFileSync('detailed_product_test_results.json', JSON.stringify(results, null, 2));
    
    console.log('\n🎉 상세 제품 테스트 완료!');
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// 스크립트 실행
detailedProductTest().catch(console.error);