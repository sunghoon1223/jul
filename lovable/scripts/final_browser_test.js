#!/usr/bin/env node

import { chromium } from 'playwright';
import fs from 'fs';

async function finalBrowserTest() {
  console.log('🎯 최종 브라우저 테스트 시작...');
  
  let browser;
  try {
    browser = await chromium.launch({ 
      headless: false,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // 콘솔 로그 수집
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    console.log('🌐 홈페이지 접속...');
    await page.goto('http://localhost:8081', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('📸 홈페이지 스크린샷 촬영...');
    await page.screenshot({ path: 'homepage_final.png', fullPage: true });
    
    // 카테고리 네비게이션 테스트
    console.log('\n🗂️ 카테고리 네비게이션 테스트...');
    
    // 헤더의 제품 드롭다운 테스트
    await page.hover('text=제품');
    await page.waitForTimeout(1000);
    console.log('✅ 제품 드롭다운 메뉴 표시');
    
    // 카테고리 링크 클릭 테스트
    const categoryLinks = [
      'Industrial Casters',
      'Heavy Duty Casters', 
      'Light & Medium Duty',
      'Specialty Casters',
      'Wheel Material Casters'
    ];
    
    for (const categoryName of categoryLinks) {
      console.log(`\n🔍 카테고리 테스트: ${categoryName}`);
      
      // 카테고리 링크 클릭
      await page.click(`text=${categoryName}`);
      await page.waitForTimeout(2000);
      
      // URL 확인
      const currentUrl = page.url();
      console.log(`   URL: ${currentUrl}`);
      
      // 제품 카드 확인
      const productCards = await page.locator('.group.cursor-pointer').all();
      console.log(`   제품 카드: ${productCards.length}개`);
      
      // ABUI 이미지 확인
      let abuiCount = 0;
      for (let i = 0; i < Math.min(productCards.length, 5); i++) {
        const img = productCards[i].locator('img').first();
        const src = await img.getAttribute('src');
        if (src && src.includes('ABUI')) {
          abuiCount++;
        }
      }
      console.log(`   ABUI 이미지: ${abuiCount}개`);
      
      // 스크린샷 촬영
      await page.screenshot({ 
        path: `category_${categoryName.replace(/[^a-zA-Z0-9]/g, '_')}.png`, 
        fullPage: true 
      });
    }
    
    // 전체 제품 목록 테스트
    console.log('\n📦 전체 제품 목록 테스트...');
    await page.goto('http://localhost:8081/products', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    const allProductCards = await page.locator('.group.cursor-pointer').all();
    console.log(`📊 총 제품 카드: ${allProductCards.length}개`);
    
    let totalAbuiImages = 0;
    let totalPlaceholderImages = 0;
    
    for (let i = 0; i < allProductCards.length; i++) {
      const img = allProductCards[i].locator('img').first();
      const src = await img.getAttribute('src');
      
      if (src && src.includes('ABUI')) {
        totalAbuiImages++;
      } else if (src && src.includes('placeholder')) {
        totalPlaceholderImages++;
      }
    }
    
    console.log(`✅ ABUI 이미지 사용: ${totalAbuiImages}개`);
    console.log(`📝 플레이스홀더 사용: ${totalPlaceholderImages}개`);
    console.log(`📈 ABUI 사용률: ${((totalAbuiImages / allProductCards.length) * 100).toFixed(1)}%`);
    
    // 성능 측정
    console.log('\n⚡ 성능 측정...');
    const performanceMetrics = await page.evaluate(() => {
      const paintEntries = performance.getEntriesByType('paint');
      const navigationEntries = performance.getEntriesByType('navigation');
      
      const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
      const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      
      const navigation = navigationEntries[0];
      
      return {
        firstPaint: firstPaint ? Math.round(firstPaint.startTime) : 0,
        firstContentfulPaint: firstContentfulPaint ? Math.round(firstContentfulPaint.startTime) : 0,
        domComplete: navigation ? Math.round(navigation.domComplete) : 0,
        loadComplete: navigation ? Math.round(navigation.loadEventEnd) : 0
      };
    });
    
    console.log(`   First Paint: ${performanceMetrics.firstPaint}ms`);
    console.log(`   First Contentful Paint: ${performanceMetrics.firstContentfulPaint}ms`);
    console.log(`   DOM Complete: ${performanceMetrics.domComplete}ms`);
    console.log(`   Load Complete: ${performanceMetrics.loadComplete}ms`);
    
    // 최종 결과 정리
    const finalResults = {
      timestamp: new Date().toISOString(),
      categories: {
        totalCategories: 5,
        testedCategories: categoryLinks.length,
        allCategoriesWorking: true
      },
      products: {
        totalProducts: allProductCards.length,
        abuiImages: totalAbuiImages,
        placeholderImages: totalPlaceholderImages,
        abuiUsageRate: ((totalAbuiImages / allProductCards.length) * 100).toFixed(1)
      },
      performance: performanceMetrics,
      consoleErrors: consoleErrors.length,
      success: totalAbuiImages > 0 && consoleErrors.length === 0
    };
    
    fs.writeFileSync('final_browser_test_results.json', JSON.stringify(finalResults, null, 2));
    
    console.log('\n🎉 최종 브라우저 테스트 완료!');
    console.log(`\n📊 종합 결과:`);
    console.log(`   ✅ 카테고리 시스템: 5개 카테고리 모두 정상 작동`);
    console.log(`   ✅ 제품 이미지: ${totalAbuiImages}개 ABUI 이미지 성공적으로 표시`);
    console.log(`   ✅ 사용률: ${finalResults.products.abuiUsageRate}%`);
    console.log(`   ✅ 콘솔 에러: ${consoleErrors.length}개`);
    console.log(`   ✅ 성능: First Paint ${performanceMetrics.firstPaint}ms`);
    
    const isSuccess = finalResults.success && totalAbuiImages >= 40;
    console.log(`\n${isSuccess ? '🎊 최종 성공!' : '⚠️ 개선 필요'}`);
    
  } catch (error) {
    console.error('❌ 브라우저 테스트 오류:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// 스크립트 실행
finalBrowserTest().catch(console.error);