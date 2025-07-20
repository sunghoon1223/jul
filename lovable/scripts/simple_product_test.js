#!/usr/bin/env node

import { chromium } from 'playwright';

async function simpleProductTest() {
  console.log('📱 제품 상세 페이지 간단 테스트...');
  
  let browser;
  try {
    browser = await chromium.launch({ 
      headless: false,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // 홈페이지 접속
    console.log('🏠 홈페이지 접속...');
    await page.goto('http://localhost:8080', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    // 제품 목록 페이지로 이동
    console.log('📦 제품 목록 페이지 접속...');
    await page.click('text=제품');
    await page.waitForTimeout(2000);
    
    // 첫 번째 제품 카드 클릭
    console.log('🎯 첫 번째 제품 클릭...');
    const productCards = await page.locator('.group.cursor-pointer').count();
    console.log(`   제품 카드 수: ${productCards}개`);
    
    if (productCards > 0) {
      await page.locator('.group.cursor-pointer').first().click();
      await page.waitForTimeout(3000);
      
      // 현재 URL 확인
      const currentUrl = page.url();
      console.log(`   현재 URL: ${currentUrl}`);
      
      // 제품 상세 페이지 요소 확인
      const hasTitle = await page.locator('h1').count() > 0;
      const hasDescription = await page.locator('.prose').count() > 0;
      const hasTechSpecs = await page.locator(':has-text("Technical Specifications")').count() > 0;
      const hasQuality = await page.locator(':has-text("Quality & Certifications")').count() > 0;
      const hasPricing = await page.locator(':has-text("Pricing & Shipping")').count() > 0;
      
      console.log(`   제품 제목: ${hasTitle ? '✅' : '❌'}`);
      console.log(`   제품 설명: ${hasDescription ? '✅' : '❌'}`);
      console.log(`   기술 사양: ${hasTechSpecs ? '✅' : '❌'}`);
      console.log(`   품질 인증: ${hasQuality ? '✅' : '❌'}`);
      console.log(`   가격 정보: ${hasPricing ? '✅' : '❌'}`);
      
      // 제품 이름 가져오기
      if (hasTitle) {
        const productName = await page.locator('h1').textContent();
        console.log(`   제품명: ${productName}`);
      }
      
      // 스크린샷 촬영
      console.log('📸 제품 상세 페이지 스크린샷...');
      await page.screenshot({ path: 'product_detail_test.png', fullPage: true });
      
      // 기술 사양 세부 확인
      if (hasTechSpecs) {
        const specCount = await page.locator(':has-text("Technical Specifications")').locator('dl > div').count();
        console.log(`   기술 사양 항목: ${specCount}개`);
      }
      
      // 품질 인증 배지 확인
      if (hasQuality) {
        const certBadges = await page.locator(':has-text("Quality & Certifications")').locator('.bg-secondary').count();
        console.log(`   인증 배지: ${certBadges}개`);
      }
      
    } else {
      console.log('❌ 제품 카드가 없습니다.');
    }
    
    console.log('\\n🎉 제품 상세 페이지 테스트 완료!');
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// 스크립트 실행
simpleProductTest().catch(console.error);