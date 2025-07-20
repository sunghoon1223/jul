#!/usr/bin/env node

import { chromium } from 'playwright';

async function navigationTest() {
  console.log('🔍 네비게이션 테스트 시작...');
  
  let browser;
  try {
    browser = await chromium.launch({ 
      headless: false,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    console.log('🌐 홈페이지 접속...');
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // 네비게이션 링크들 확인
    const navLinks = await page.locator('nav a, header a').all();
    console.log(`📋 네비게이션 링크: ${navLinks.length}개`);
    
    for (let i = 0; i < navLinks.length; i++) {
      const link = navLinks[i];
      const text = await link.textContent();
      const href = await link.getAttribute('href');
      console.log(`   ${i + 1}. "${text}" → ${href}`);
    }
    
    // 스크롤하여 더 많은 제품 확인
    console.log('\n📜 스크롤하여 더 많은 제품 확인...');
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(2000);
    
    // 현재 페이지의 모든 제품 카드 확인
    const productCards = await page.locator('.group.cursor-pointer').all();
    console.log(`📦 홈페이지 제품 카드: ${productCards.length}개`);
    
    let abuiImagesFound = 0;
    let placeholderImagesFound = 0;
    
    for (let i = 0; i < productCards.length; i++) {
      const card = productCards[i];
      const img = card.locator('img').first();
      const src = await img.getAttribute('src');
      const alt = await img.getAttribute('alt');
      
      if (src && src.includes('ABUI')) {
        abuiImagesFound++;
        console.log(`✅ ABUI 이미지 [${i + 1}]: ${alt} → ${src}`);
      } else if (src && src.includes('placeholder')) {
        placeholderImagesFound++;
        if (i < 5) { // 처음 5개만 로그
          console.log(`📝 플레이스홀더 [${i + 1}]: ${alt}`);
        }
      }
    }
    
    // 카테고리별 페이지 접근 시도
    console.log('\n🗂️ 카테고리 페이지 접근 시도...');
    try {
      // 카테고리 링크 찾기
      const categoryLinks = await page.locator('a[href*="/category/"], a[href*="/products"]').all();
      console.log(`📂 카테고리 링크: ${categoryLinks.length}개`);
      
      if (categoryLinks.length > 0) {
        const firstCategory = categoryLinks[0];
        const categoryText = await firstCategory.textContent();
        const categoryHref = await firstCategory.getAttribute('href');
        console.log(`🔍 첫 번째 카테고리 접근: "${categoryText}" → ${categoryHref}`);
        
        await firstCategory.click();
        await page.waitForTimeout(3000);
        
        // 카테고리 페이지의 제품 확인
        const categoryProducts = await page.locator('.group.cursor-pointer').all();
        console.log(`📦 카테고리 페이지 제품: ${categoryProducts.length}개`);
        
        let categoryAbuiImages = 0;
        for (let i = 0; i < Math.min(categoryProducts.length, 10); i++) {
          const card = categoryProducts[i];
          const img = card.locator('img').first();
          const src = await img.getAttribute('src');
          const alt = await img.getAttribute('alt');
          
          if (src && src.includes('ABUI')) {
            categoryAbuiImages++;
            console.log(`✅ 카테고리 ABUI 이미지 [${i + 1}]: ${alt} → ${src}`);
          }
        }
        
        console.log(`📊 카테고리 페이지 ABUI 이미지: ${categoryAbuiImages}개`);
      }
    } catch (error) {
      console.log(`❌ 카테고리 페이지 접근 실패: ${error.message}`);
    }
    
    console.log(`\n📊 홈페이지 이미지 통계:`);
    console.log(`✅ ABUI 이미지: ${abuiImagesFound}개`);
    console.log(`📝 플레이스홀더: ${placeholderImagesFound}개`);
    console.log(`📈 ABUI 이미지 사용률: ${((abuiImagesFound / productCards.length) * 100).toFixed(1)}%`);
    
    console.log('\n🎉 네비게이션 테스트 완료!');
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// 스크립트 실행
navigationTest().catch(console.error);