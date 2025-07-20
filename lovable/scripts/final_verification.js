#!/usr/bin/env node

import { chromium } from 'playwright';
import fs from 'fs';

async function finalVerification() {
  console.log('🎯 최종 검증 시작...');
  
  let browser;
  try {
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
      const text = msg.text();
      if (msg.type() === 'error') {
        consoleErrors.push(text);
      } else if (msg.type() === 'log' && text.includes('이미지')) {
        consoleLogs.push(text);
      }
    });
    
    // 네트워크 모니터링
    const imageRequests = [];
    page.on('response', response => {
      const url = response.url();
      if (url.includes('/images/') && (url.includes('ABUI') || url.includes('placeholder'))) {
        imageRequests.push({
          url: url,
          status: response.status(),
          type: url.includes('ABUI') ? 'ABUI' : 'placeholder'
        });
      }
    });
    
    console.log('🌐 제품 카탈로그 페이지 접속...');
    await page.goto('http://localhost:8080/products', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('📸 제품 카탈로그 페이지 스크린샷 촬영...');
    await page.screenshot({ path: 'final_verification_products.png', fullPage: true });
    
    // 모든 제품 카드 분석
    const productCards = await page.locator('.group.cursor-pointer').all();
    console.log(`📦 총 제품 카드: ${productCards.length}개`);
    
    let abuiImagesFound = 0;
    let placeholderImagesFound = 0;
    let abuiSuccessCount = 0;
    const abuiDetails = [];
    
    for (let i = 0; i < productCards.length; i++) {
      const card = productCards[i];
      const img = card.locator('img').first();
      const src = await img.getAttribute('src');
      const alt = await img.getAttribute('alt');
      
      if (src && src.includes('ABUI')) {
        abuiImagesFound++;
        
        // 이미지 로딩 상태 확인
        const isLoaded = await img.evaluate(el => {
          return el.complete && el.naturalWidth > 0;
        });
        
        if (isLoaded) {
          abuiSuccessCount++;
        }
        
        abuiDetails.push({
          index: i + 1,
          alt: alt,
          src: src,
          filename: src.split('/').pop(),
          loaded: isLoaded
        });
        
        console.log(`${isLoaded ? '✅' : '❌'} ABUI 이미지 [${i + 1}]: ${alt}`);
        console.log(`   파일: ${src.split('/').pop()}`);
      } else if (src && src.includes('placeholder')) {
        placeholderImagesFound++;
      }
    }
    
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
        loadComplete: navigation ? Math.round(navigation.loadEventEnd) : 0,
        networkLatency: navigation ? Math.round(navigation.responseStart - navigation.requestStart) : 0
      };
    });
    
    // 이미지 로딩 성능 측정
    const imagePerformance = await page.evaluate(() => {
      const images = Array.from(document.images);
      let loadedCount = 0;
      let failedCount = 0;
      
      images.forEach(img => {
        if (img.complete) {
          if (img.naturalWidth > 0) {
            loadedCount++;
          } else {
            failedCount++;
          }
        }
      });
      
      return {
        total: images.length,
        loaded: loadedCount,
        failed: failedCount
      };
    });
    
    // 최종 결과 정리
    const finalResults = {
      timestamp: new Date().toISOString(),
      verification: {
        totalProducts: productCards.length,
        abuiImages: abuiImagesFound,
        abuiSuccessful: abuiSuccessCount,
        placeholderImages: placeholderImagesFound,
        abuiSuccessRate: abuiImagesFound > 0 ? ((abuiSuccessCount / abuiImagesFound) * 100).toFixed(1) : '0.0',
        overallImageSuccessRate: imagePerformance.total > 0 ? ((imagePerformance.loaded / imagePerformance.total) * 100).toFixed(1) : '0.0'
      },
      performance: performanceMetrics,
      imageLoading: imagePerformance,
      consoleErrors: consoleErrors.length,
      imageRequests: imageRequests.length,
      abuiDetails: abuiDetails,
      networkDetails: {
        abuiRequests: imageRequests.filter(r => r.type === 'ABUI').length,
        placeholderRequests: imageRequests.filter(r => r.type === 'placeholder').length,
        successfulRequests: imageRequests.filter(r => r.status === 200).length,
        failedRequests: imageRequests.filter(r => r.status !== 200).length
      }
    };
    
    fs.writeFileSync('final_verification_results.json', JSON.stringify(finalResults, null, 2));
    
    console.log('\n📊 최종 검증 결과:');
    console.log(`✅ 총 제품: ${productCards.length}개`);
    console.log(`✅ ABUI 이미지 사용: ${abuiImagesFound}개`);
    console.log(`✅ ABUI 로딩 성공: ${abuiSuccessCount}개`);
    console.log(`✅ 플레이스홀더 사용: ${placeholderImagesFound}개`);
    console.log(`📈 ABUI 이미지 성공률: ${finalResults.verification.abuiSuccessRate}%`);
    console.log(`📈 전체 이미지 성공률: ${finalResults.verification.overallImageSuccessRate}%`);
    
    console.log('\n⚡ 성능 메트릭스:');
    console.log(`   First Paint: ${performanceMetrics.firstPaint}ms`);
    console.log(`   First Contentful Paint: ${performanceMetrics.firstContentfulPaint}ms`);
    console.log(`   DOM Complete: ${performanceMetrics.domComplete}ms`);
    console.log(`   Load Complete: ${performanceMetrics.loadComplete}ms`);
    
    console.log('\n🌐 네트워크 요청:');
    console.log(`   ABUI 이미지 요청: ${finalResults.networkDetails.abuiRequests}개`);
    console.log(`   플레이스홀더 요청: ${finalResults.networkDetails.placeholderRequests}개`);
    console.log(`   성공한 요청: ${finalResults.networkDetails.successfulRequests}개`);
    console.log(`   실패한 요청: ${finalResults.networkDetails.failedRequests}개`);
    
    console.log('\n🔥 ABUI 이미지 상세 정보:');
    abuiDetails.forEach(detail => {
      console.log(`   ${detail.loaded ? '✅' : '❌'} ${detail.alt} (${detail.filename})`);
    });
    
    console.log('\n🎉 최종 검증 완료!');
    
    // 결과 요약
    const isSuccess = abuiImagesFound > 0 && abuiSuccessCount > 0 && consoleErrors.length === 0;
    console.log(`\n${isSuccess ? '🎊 검증 성공!' : '⚠️ 검증 완료 (개선 사항 있음)'}`);
    
  } catch (error) {
    console.error('❌ 최종 검증 오류:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// 스크립트 실행
finalVerification().catch(console.error);