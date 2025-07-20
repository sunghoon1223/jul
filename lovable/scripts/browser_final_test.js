#!/usr/bin/env node

import { chromium } from 'playwright';
import fs from 'fs';

async function finalBrowserTest() {
  console.log('🚀 브라우저 최종 검증 시작...');
  
  let browser;
  try {
    // 브라우저 실행
    browser = await chromium.launch({ 
      headless: false,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // 콘솔 로그 수집
    const consoleLogs = [];
    const consoleErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      } else {
        consoleLogs.push(`${msg.type()}: ${msg.text()}`);
      }
    });
    
    // 네트워크 요청 실패 수집
    const networkErrors = [];
    page.on('response', response => {
      if (!response.ok()) {
        networkErrors.push(`${response.status()} ${response.url()}`);
      }
    });
    
    console.log('🌐 localhost:8080 접속 중...');
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
    
    // 페이지 로드 완료 대기
    await page.waitForTimeout(3000);
    
    console.log('📸 초기 상태 스크린샷 촬영...');
    await page.screenshot({ path: 'final_test_homepage.png', fullPage: true });
    
    // 제품 카드들 확인
    const productCards = await page.locator('[data-testid="product-card"], .group.cursor-pointer').count();
    console.log(`📦 발견된 제품 카드: ${productCards}개`);
    
    // 이미지 로딩 상태 확인
    const images = await page.locator('img').all();
    let loadedImages = 0;
    let failedImages = 0;
    
    for (const img of images) {
      const src = await img.getAttribute('src');
      const naturalWidth = await img.evaluate(el => el.naturalWidth);
      
      if (naturalWidth > 0) {
        loadedImages++;
        if (src && src.includes('ABUI')) {
          console.log(`✅ ABUI 이미지 로딩 성공: ${src}`);
        }
      } else {
        failedImages++;
        if (src && src.includes('ABUI')) {
          console.log(`❌ ABUI 이미지 로딩 실패: ${src}`);
        }
      }
    }
    
    console.log(`\n📊 이미지 로딩 통계:`);
    console.log(`✅ 로딩 성공: ${loadedImages}개`);
    console.log(`❌ 로딩 실패: ${failedImages}개`);
    console.log(`📈 성공률: ${((loadedImages / (loadedImages + failedImages)) * 100).toFixed(1)}%`);
    
    // 제품 목록 페이지 테스트
    console.log('\n🔍 제품 목록 페이지 테스트...');
    await page.click('a[href*="products"]', { timeout: 5000 });
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'final_test_products.png', fullPage: true });
    
    // 카테고리별 테스트
    const categories = await page.locator('nav a, [data-category]').all();
    console.log(`📋 카테고리 개수: ${categories.length}`);
    
    // 성능 측정
    console.log('\n⚡ 성능 측정 시작...');
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      };
    });
    
    console.log('📊 성능 메트릭스:');
    console.log(`   로드 시간: ${performanceMetrics.loadTime.toFixed(2)}ms`);
    console.log(`   DOM 로드: ${performanceMetrics.domContentLoaded.toFixed(2)}ms`);
    console.log(`   First Paint: ${performanceMetrics.firstPaint.toFixed(2)}ms`);
    console.log(`   First Contentful Paint: ${performanceMetrics.firstContentfulPaint.toFixed(2)}ms`);
    
    // 최종 결과 정리
    const finalResults = {
      timestamp: new Date().toISOString(),
      productCards,
      images: {
        loaded: loadedImages,
        failed: failedImages,
        successRate: ((loadedImages / (loadedImages + failedImages)) * 100).toFixed(1)
      },
      performance: performanceMetrics,
      consoleErrors: consoleErrors.length,
      networkErrors: networkErrors.length,
      errorDetails: {
        console: consoleErrors.slice(0, 10),
        network: networkErrors.slice(0, 10)
      }
    };
    
    fs.writeFileSync('final_test_results.json', JSON.stringify(finalResults, null, 2));
    
    console.log('\n📋 최종 검증 결과:');
    console.log(`✅ 제품 카드: ${productCards}개`);
    console.log(`✅ 이미지 성공률: ${finalResults.images.successRate}%`);
    console.log(`✅ 콘솔 에러: ${consoleErrors.length}개`);
    console.log(`✅ 네트워크 에러: ${networkErrors.length}개`);
    
    if (consoleErrors.length > 0) {
      console.log('\n❌ 발견된 콘솔 에러:');
      consoleErrors.slice(0, 5).forEach(error => console.log(`   - ${error}`));
    }
    
    if (networkErrors.length > 0) {
      console.log('\n❌ 발견된 네트워크 에러:');
      networkErrors.slice(0, 5).forEach(error => console.log(`   - ${error}`));
    }
    
    console.log('\n🎉 브라우저 최종 검증 완료!');
    
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