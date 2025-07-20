#!/usr/bin/env node

import { chromium } from 'playwright';

async function manualProductTest() {
  console.log('🎯 수동 제품 상세 페이지 테스트...');
  
  let browser;
  try {
    browser = await chromium.launch({ 
      headless: false,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // 제품 상세 페이지 직접 접속
    console.log('📄 제품 상세 페이지 직접 접속...');
    await page.goto('http://localhost:8080/products/product', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
    
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
    
    // 설명 확인
    if (hasDescription) {
      const description = await page.locator('.prose p').textContent();
      console.log(`   설명: ${description.substring(0, 100)}...`);
    }
    
    // 기술 사양 확인
    if (hasTechSpecs) {
      const specCount = await page.locator(':has-text("Technical Specifications")').locator('dl > div').count();
      console.log(`   기술 사양 항목: ${specCount}개`);
      
      // 몇 개 항목 출력
      const specItems = await page.locator(':has-text("Technical Specifications")').locator('dl > div').all();
      for (let i = 0; i < Math.min(3, specItems.length); i++) {
        const label = await specItems[i].locator('dt').textContent();
        const value = await specItems[i].locator('dd').textContent();
        console.log(`     ${label} ${value}`);
      }
    }
    
    // 품질 인증 확인
    if (hasQuality) {
      const certBadges = await page.locator(':has-text("Quality & Certifications")').locator('.bg-secondary').count();
      console.log(`   인증 배지: ${certBadges}개`);
      
      if (certBadges > 0) {
        const certTexts = await page.locator(':has-text("Quality & Certifications")').locator('.bg-secondary').allTextContents();
        console.log(`   인증 목록: ${certTexts.join(', ')}`);
      }
    }
    
    // 가격 정보 확인
    if (hasPricing) {
      const minOrderQty = await page.locator(':has-text("Min Order Quantity")').locator('+ *').textContent();
      const deliveryTime = await page.locator(':has-text("Delivery Time")').locator('+ *').textContent();
      console.log(`   최소 주문: ${minOrderQty}`);
      console.log(`   배송 시간: ${deliveryTime}`);
    }
    
    // 스크린샷 촬영
    console.log('📸 제품 상세 페이지 스크린샷...');
    await page.screenshot({ path: 'product_detail_manual.png', fullPage: true });
    
    // 다른 제품도 테스트
    console.log('\\n🔄 다른 제품 테스트...');
    await page.goto('http://localhost:8080/products/product-2', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    const product2Title = await page.locator('h1').textContent();
    const product2HasTech = await page.locator(':has-text("Technical Specifications")').count() > 0;
    console.log(`   Product 2 제목: ${product2Title}`);
    console.log(`   Product 2 기술 사양: ${product2HasTech ? '✅' : '❌'}`);
    
    // Product 2 스크린샷
    await page.screenshot({ path: 'product_2_detail.png', fullPage: true });
    
    console.log('\\n🎉 수동 제품 상세 페이지 테스트 완료!');
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// 스크립트 실행
manualProductTest().catch(console.error);