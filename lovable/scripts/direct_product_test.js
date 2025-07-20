#!/usr/bin/env node

import { chromium } from 'playwright';

async function directProductTest() {
  console.log('🎯 제품 상세 페이지 직접 테스트...');
  
  let browser;
  try {
    browser = await chromium.launch({ 
      headless: false,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // 제품 목록 페이지에서 실제 제품 클릭
    console.log('📦 제품 목록 페이지 접속...');
    await page.goto('http://localhost:8080/products', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    // 실제 제품 카드 클릭 (첫 번째 제품이 아닌 실제 제품)
    console.log('🔍 실제 제품 카드 찾기...');
    const productCards = await page.locator('.group.cursor-pointer').all();
    console.log(`   총 제품 카드: ${productCards.length}개`);
    
    // 첫 번째 제품 카드의 링크 확인
    if (productCards.length > 0) {
      const firstProductLink = await productCards[0].locator('a').first().getAttribute('href');
      console.log(`   첫 번째 제품 링크: ${firstProductLink}`);
      
      // 제품 상세 페이지로 직접 이동
      if (firstProductLink && firstProductLink.includes('/products/')) {
        console.log('🎯 제품 상세 페이지로 직접 이동...');
        await page.goto(`http://localhost:8080${firstProductLink}`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(3000);
        
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
        await page.screenshot({ path: 'product_detail_direct.png', fullPage: true });
        
        // 기술 사양 세부 확인
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
        
        // 품질 인증 배지 확인
        if (hasQuality) {
          const certBadges = await page.locator(':has-text("Quality & Certifications")').locator('.bg-secondary').count();
          console.log(`   인증 배지: ${certBadges}개`);
        }
        
      } else {
        console.log('❌ 제품 상세 페이지 링크를 찾을 수 없습니다.');
      }
    } else {
      console.log('❌ 제품 카드가 없습니다.');
    }
    
    console.log('\\n🎉 제품 상세 페이지 직접 테스트 완료!');
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// 스크립트 실행
directProductTest().catch(console.error);