#!/usr/bin/env node

import { chromium } from 'playwright';
import fs from 'fs';

async function improvedBrowserTest() {
  console.log('🚀 개선된 브라우저 검증 시작...');
  
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
      if (msg.type() === 'error' || msg.type() === 'warning') {
        consoleErrors.push(`${msg.type()}: ${text}`);
        console.log(`🔴 ${msg.type().toUpperCase()}: ${text}`);
      } else {
        consoleLogs.push(`${msg.type()}: ${text}`);
      }
    });
    
    // 네트워크 요청 모니터링
    const networkRequests = [];
    page.on('response', response => {
      const url = response.url();
      const status = response.status();
      networkRequests.push({ url, status });
      
      if (!response.ok()) {
        console.log(`🔴 네트워크 에러: ${status} ${url}`);
      } else if (url.includes('images/') || url.includes('ABUI')) {
        console.log(`✅ 이미지 로딩 성공: ${status} ${url}`);
      }
    });
    
    console.log('🌐 localhost:8080 접속 중...');
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
    
    // 페이지 로드 완료 대기
    await page.waitForTimeout(5000);
    
    console.log('📸 스크린샷 촬영...');
    await page.screenshot({ path: 'improved_test_homepage.png', fullPage: true });
    
    // 제품 카드들 상세 분석
    const productCards = await page.locator('.group.cursor-pointer').all();
    console.log(`📦 발견된 제품 카드: ${productCards.length}개`);
    
    let abuiImagesFound = 0;
    let placeholderImagesFound = 0;
    
    for (let i = 0; i < Math.min(productCards.length, 10); i++) {
      const card = productCards[i];
      const img = card.locator('img').first();
      const src = await img.getAttribute('src');
      const alt = await img.getAttribute('alt');
      
      console.log(`\n📋 제품 카드 ${i + 1}:`);
      console.log(`   이미지 경로: ${src}`);
      console.log(`   ALT 텍스트: ${alt}`);
      
      if (src && src.includes('ABUI')) {
        abuiImagesFound++;
        console.log(`   ✅ ABUI 이미지 사용`);
      } else if (src && src.includes('placeholder')) {
        placeholderImagesFound++;
        console.log(`   📝 플레이스홀더 이미지 사용`);
      }
      
      // 이미지 로딩 상태 확인
      const isLoaded = await img.evaluate(el => {
        return el.complete && el.naturalWidth > 0;
      });
      
      console.log(`   로딩 상태: ${isLoaded ? '✅ 로딩됨' : '❌ 로딩 실패'}`);
    }
    
    console.log(`\n📊 이미지 사용 통계:`);
    console.log(`✅ ABUI 이미지: ${abuiImagesFound}개`);
    console.log(`📝 플레이스홀더: ${placeholderImagesFound}개`);
    console.log(`🔄 기타: ${productCards.length - abuiImagesFound - placeholderImagesFound}개`);
    
    // 성능 측정
    const performanceMetrics = await page.evaluate(() => {
      const perfEntries = performance.getEntriesByType('navigation');
      if (perfEntries.length > 0) {
        const navigation = perfEntries[0];
        return {
          loadTime: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
          domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
          responseStart: Math.round(navigation.responseStart - navigation.navigationStart),
          domComplete: Math.round(navigation.domComplete - navigation.navigationStart)
        };
      }
      return {
        loadTime: 0,
        domContentLoaded: 0,
        responseStart: 0,
        domComplete: 0
      };
    });
    
    console.log(`\n⚡ 성능 메트릭스:`);
    console.log(`   서버 응답: ${performanceMetrics.responseStart}ms`);
    console.log(`   DOM 완료: ${performanceMetrics.domComplete}ms`);
    console.log(`   로드 완료: ${performanceMetrics.loadTime}ms`);
    
    // 최종 결과 정리
    const finalResults = {
      timestamp: new Date().toISOString(),
      productCards: productCards.length,
      imageStats: {
        abuiImages: abuiImagesFound,
        placeholderImages: placeholderImagesFound,
        total: productCards.length
      },
      performance: performanceMetrics,
      consoleErrors: consoleErrors.length,
      networkRequests: networkRequests.length,
      errorDetails: {
        console: consoleErrors.slice(0, 10),
        networkSample: networkRequests.filter(r => !r.url.includes('favicon')).slice(0, 10)
      }
    };
    
    fs.writeFileSync('improved_test_results.json', JSON.stringify(finalResults, null, 2));
    
    console.log(`\n📋 최종 검증 결과:`);
    console.log(`✅ 제품 카드: ${productCards.length}개`);
    console.log(`✅ ABUI 이미지: ${abuiImagesFound}개`);
    console.log(`✅ 플레이스홀더: ${placeholderImagesFound}개`);
    console.log(`✅ 콘솔 에러: ${consoleErrors.length}개`);
    console.log(`✅ 네트워크 요청: ${networkRequests.length}개`);
    
    const successRate = ((abuiImagesFound / productCards.length) * 100).toFixed(1);
    console.log(`📈 ABUI 이미지 사용률: ${successRate}%`);
    
    console.log('\n🎉 개선된 브라우저 검증 완료!');
    
  } catch (error) {
    console.error('❌ 브라우저 테스트 오류:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// 스크립트 실행
improvedBrowserTest().catch(console.error);