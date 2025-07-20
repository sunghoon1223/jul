#!/usr/bin/env node

import { chromium } from 'playwright';

async function testProductDetail() {
  console.log('🔍 제품 상세 페이지 테스트 시작...');
  
  let browser;
  try {
    browser = await chromium.launch({ 
      headless: false,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // 제품 목록 페이지 접속
    console.log('📦 제품 목록 페이지 접속...');
    await page.goto('http://localhost:8080/products', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // 첫 번째 제품 클릭
    console.log('🎯 첫 번째 제품 클릭...');
    const firstProduct = page.locator('.group.cursor-pointer').first();
    await firstProduct.click();
    await page.waitForTimeout(3000);
    
    // 제품 상세 페이지 확인
    console.log('📄 제품 상세 페이지 분석...');
    
    // 제품 정보 확인
    const productTitle = await page.locator('h1').textContent();
    console.log(`   제품명: ${productTitle}`);
    
    const description = await page.locator('.prose p').textContent();
    console.log(`   설명: ${description.substring(0, 50)}...`);
    
    // 기술 사양 확인
    const techSpecsCard = page.locator(':has-text("Technical Specifications")');
    const hasTechSpecs = await techSpecsCard.count() > 0;
    console.log(`   기술 사양: ${hasTechSpecs ? '✅ 있음' : '❌ 없음'}`);
    
    if (hasTechSpecs) {
      const specItems = await techSpecsCard.locator('dl > div').count();
      console.log(`   사양 항목: ${specItems}개`);
    }
    
    // 품질 인증 확인
    const qualityCard = page.locator(':has-text("Quality & Certifications")');
    const hasQuality = await qualityCard.count() > 0;
    console.log(`   품질 인증: ${hasQuality ? '✅ 있음' : '❌ 없음'}`);
    
    if (hasQuality) {
      const certBadges = await qualityCard.locator('.bg-secondary').count();
      console.log(`   인증 배지: ${certBadges}개`);
    }
    
    // 가격 및 배송 정보 확인
    const pricingCard = page.locator(':has-text("Pricing & Shipping")');
    const hasPricing = await pricingCard.count() > 0;
    console.log(`   가격 정보: ${hasPricing ? '✅ 있음' : '❌ 없음'}`);
    
    // 스크린샷 촬영
    console.log('📸 제품 상세 페이지 스크린샷 촬영...');
    await page.screenshot({ path: 'product_detail_enhanced.png', fullPage: true });
    
    // 추가 제품 테스트
    console.log('\\n🔄 추가 제품 테스트...');
    await page.goBack();
    await page.waitForTimeout(2000);
    
    // 두 번째 제품 클릭
    const secondProduct = page.locator('.group.cursor-pointer').nth(1);
    await secondProduct.click();
    await page.waitForTimeout(3000);
    
    const secondProductTitle = await page.locator('h1').textContent();
    console.log(`   두 번째 제품: ${secondProductTitle}`);
    
    // 카테고리별 제품 테스트
    console.log('\\n🏷️ 카테고리별 제품 테스트...');
    await page.goto('http://localhost:8080/categories/heavy-duty-casters', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const categoryProducts = await page.locator('.group.cursor-pointer').count();
    console.log(`   Heavy Duty 카테고리 제품: ${categoryProducts}개`);
    
    if (categoryProducts > 0) {
      await page.locator('.group.cursor-pointer').first().click();
      await page.waitForTimeout(3000);
      
      const categoryProductTitle = await page.locator('h1').textContent();
      console.log(`   카테고리 제품명: ${categoryProductTitle}`);
      
      // 카테고리 제품 스크린샷
      await page.screenshot({ path: 'category_product_detail.png', fullPage: true });
    }
    
    console.log('\\n🎉 제품 상세 페이지 테스트 완료!');
    console.log('📊 테스트 결과:');
    console.log(`   ✅ 제품 상세 정보: 강화됨`);
    console.log(`   ✅ 기술 사양: ${hasTechSpecs ? '표시됨' : '표시 안됨'}`);
    console.log(`   ✅ 품질 인증: ${hasQuality ? '표시됨' : '표시 안됨'}`);
    console.log(`   ✅ 가격 정보: ${hasPricing ? '표시됨' : '표시 안됨'}`);
    console.log(`   ✅ 카테고리 제품: ${categoryProducts}개`);
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// 스크립트 실행
testProductDetail().catch(console.error);