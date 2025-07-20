#!/usr/bin/env node

import { chromium } from 'playwright';

async function quickTest() {
  console.log('🎯 빠른 테스트 시작...');
  
  let browser;
  try {
    browser = await chromium.launch({ 
      headless: false,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    console.log('🌐 홈페이지 접속...');
    await page.goto('http://localhost:8081', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
    
    console.log('📸 홈페이지 스크린샷 촬영...');
    await page.screenshot({ path: 'homepage_quick.png', fullPage: true });
    
    // 제품 페이지 접속
    console.log('📦 제품 페이지 접속...');
    await page.goto('http://localhost:8081/products', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
    
    console.log('📸 제품 페이지 스크린샷 촬영...');
    await page.screenshot({ path: 'products_quick.png', fullPage: true });
    
    // 제품 카드 확인
    const productCards = await page.locator('.group.cursor-pointer').count();
    console.log(`📊 총 제품 카드: ${productCards}개`);
    
    // ABUI 이미지 확인
    const abuiImages = await page.locator('img[src*="ABUI"]').count();
    console.log(`✅ ABUI 이미지: ${abuiImages}개`);
    
    // 플레이스홀더 이미지 확인
    const placeholderImages = await page.locator('img[src*="placeholder"]').count();
    console.log(`📝 플레이스홀더: ${placeholderImages}개`);
    
    if (abuiImages > 0) {
      console.log(`📈 ABUI 사용률: ${((abuiImages / productCards) * 100).toFixed(1)}%`);
    }
    
    console.log('\n🎉 빠른 테스트 완료!');
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// 스크립트 실행
quickTest().catch(console.error);