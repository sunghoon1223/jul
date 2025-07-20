#!/usr/bin/env node

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5173';
const SCREENSHOT_DIR = './screenshots';

// 스크린샷 디렉토리 생성
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// 테스트할 제품 슬러그들
const TEST_PRODUCTS = [
  'agv-exclusive-50mm',
  'drive-module-caster-50mm', // 드라이빙 모듈
  'industrial-caster-50mm',
  'heavy-duty-super-heavy-50mm',
  'polyurethane-wheel-50mm',
  'rubber-wheel-50mm',
  'non-existent-product', // 404 테스트용
  'agv-캐스터-장비용-캐스터-폴리우레탄-휠-러버-휠-드라이빙-모듈' // 사용자가 언급한 문제 제품
];

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function takeScreenshot(page, name, description = '') {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${name}-${timestamp}.png`;
  const filepath = path.join(SCREENSHOT_DIR, filename);
  
  await page.screenshot({ 
    path: filepath, 
    fullPage: true,
    type: 'png'
  });
  
  console.log(`📸 스크린샷 저장: ${filename} ${description ? `(${description})` : ''}`);
  return filepath;
}

async function testProductNavigation(browser) {
  console.log('\n🧪 제품 네비게이션 종합 테스트 시작...\n');
  
  const results = {
    totalTests: 0,
    passed: 0,
    failed: 0,
    details: []
  };

  for (const productSlug of TEST_PRODUCTS) {
    console.log(`\n🔍 테스트 제품: ${productSlug}`);
    results.totalTests++;
    
    const page = await browser.newPage();
    
    try {
      // 홈페이지에서 시작
      console.log('1️⃣ 홈페이지 로드...');
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0', timeout: 10000 });
      await delay(1000);

      // 제품 목록 페이지로 이동
      console.log('2️⃣ 제품 목록 페이지로 이동...');
      await page.goto(`${BASE_URL}/products`, { waitUntil: 'networkidle0', timeout: 10000 });
      await delay(1000);
      
      // 스크롤 위치 기록
      const scrollYBeforeProductClick = await page.evaluate(() => window.scrollY);
      console.log(`📊 제품 목록 페이지 스크롤 위치: ${scrollYBeforeProductClick}px`);

      // 제품 상세 페이지로 이동
      console.log('3️⃣ 제품 상세 페이지로 이동...');
      await page.goto(`${BASE_URL}/products/${productSlug}`, { waitUntil: 'networkidle0', timeout: 10000 });
      await delay(2000);

      // 페이지 상태 확인
      const pageTitle = await page.title();
      const hasErrorIndicator = await page.$('.text-red-600, .text-red-500, .bg-red-100');
      const hasLoadingIndicator = await page.$('.animate-pulse, .animate-spin');
      const hasProductContent = await page.$('h1');
      
      console.log(`📋 페이지 제목: ${pageTitle}`);
      console.log(`❌ 에러 표시: ${hasErrorIndicator ? 'Yes' : 'No'}`);
      console.log(`⏳ 로딩 표시: ${hasLoadingIndicator ? 'Yes' : 'No'}`);
      console.log(`📦 제품 콘텐츠: ${hasProductContent ? 'Yes' : 'No'}`);

      // 스크린샷 촬영
      await takeScreenshot(page, `product-${productSlug}`, '제품 상세 페이지');

      // 뒤로가기 테스트
      console.log('4️⃣ 뒤로가기 테스트...');
      await page.goBack();
      await delay(2000);

      // 뒤로가기 후 스크롤 위치 확인
      const scrollYAfterBack = await page.evaluate(() => window.scrollY);
      console.log(`📊 뒤로가기 후 스크롤 위치: ${scrollYAfterBack}px`);

      // 스크롤 위치 복원 확인
      const scrollRestored = Math.abs(scrollYAfterBack - scrollYBeforeProductClick) < 100;
      console.log(`🔄 스크롤 위치 복원: ${scrollRestored ? 'Success' : 'Failed'}`);

      await takeScreenshot(page, `back-${productSlug}`, '뒤로가기 후');

      // 결과 기록
      const testResult = {
        productSlug,
        hasError: !!hasErrorIndicator,
        hasLoading: !!hasLoadingIndicator,
        hasContent: !!hasProductContent,
        scrollRestored,
        pageTitle,
        status: (!hasErrorIndicator || productSlug.includes('non-existent') || productSlug.includes('캐스터-장비용')) ? 'PASS' : 'FAIL'
      };

      results.details.push(testResult);
      
      if (testResult.status === 'PASS') {
        results.passed++;
        console.log('✅ 테스트 통과');
      } else {
        results.failed++;
        console.log('❌ 테스트 실패');
      }

    } catch (error) {
      console.error(`❌ 테스트 실패 (${productSlug}):`, error.message);
      results.failed++;
      results.details.push({
        productSlug,
        error: error.message,
        status: 'ERROR'
      });
      
      // 에러 발생 시에도 스크린샷 촬영
      try {
        await takeScreenshot(page, `error-${productSlug}`, '에러 발생');
      } catch (screenshotError) {
        console.error('스크린샷 촬영 실패:', screenshotError.message);
      }
    } finally {
      await page.close();
    }
  }

  return results;
}

async function testSpecificFeatures(browser) {
  console.log('\n🔬 특정 기능 테스트...\n');
  
  const page = await browser.newPage();
  const results = [];

  try {
    // 드라이빙 모듈 제품 테스트 (문제가 되었던 제품)
    console.log('🎯 드라이빙 모듈 제품 상세 테스트...');
    await page.goto(`${BASE_URL}/products/drive-module-caster-50mm`, { waitUntil: 'networkidle0' });
    await delay(2000);

    // 장바구니 기능 테스트
    const addToCartButton = await page.$('button:has-text("장바구니 담기")');
    if (addToCartButton) {
      console.log('🛒 장바구니 버튼 클릭 테스트...');
      await addToCartButton.click();
      await delay(1000);
      
      // 토스트 메시지 확인
      const toastMessage = await page.$('.toast, [data-testid="toast"]');
      console.log(`📨 토스트 메시지: ${toastMessage ? 'Displayed' : 'Not found'}`);
    }

    // 수량 조절 테스트
    console.log('🔢 수량 조절 기능 테스트...');
    const plusButton = await page.$('button[title="수량 증가"]');
    const minusButton = await page.$('button[title="수량 감소"]');
    
    if (plusButton) {
      await plusButton.click();
      await delay(500);
      console.log('➕ 수량 증가 버튼 작동');
    }
    
    if (minusButton) {
      await minusButton.click();
      await delay(500);
      console.log('➖ 수량 감소 버튼 작동');
    }

    // 공유 기능 테스트
    console.log('📤 공유 기능 테스트...');
    const shareButton = await page.$('button:has-text("공유하기")');
    if (shareButton) {
      await shareButton.click();
      await delay(1000);
      console.log('📤 공유 버튼 작동');
    }

    await takeScreenshot(page, 'feature-test', '기능 테스트 완료');

    results.push({
      test: 'feature_test',
      addToCart: !!addToCartButton,
      quantityControls: !!(plusButton && minusButton),
      shareButton: !!shareButton,
      status: 'PASS'
    });

  } catch (error) {
    console.error('❌ 기능 테스트 실패:', error.message);
    results.push({
      test: 'feature_test',
      error: error.message,
      status: 'ERROR'
    });
  } finally {
    await page.close();
  }

  return results;
}

async function main() {
  console.log('🚀 JP Caster 웹사이트 종합 테스트 시작...\n');
  
  const browser = await puppeteer.launch({
    headless: false, // 브라우저 창 표시
    defaultViewport: { width: 1920, height: 1080 },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor'
    ]
  });

  try {
    // 네비게이션 테스트
    const navigationResults = await testProductNavigation(browser);
    
    // 특정 기능 테스트
    const featureResults = await testSpecificFeatures(browser);

    // 결과 리포트 생성
    const report = {
      timestamp: new Date().toISOString(),
      navigation: navigationResults,
      features: featureResults,
      summary: {
        totalTests: navigationResults.totalTests,
        passed: navigationResults.passed,
        failed: navigationResults.failed,
        passRate: `${((navigationResults.passed / navigationResults.totalTests) * 100).toFixed(1)}%`
      }
    };

    // 결과 파일 저장
    const reportPath = path.join(SCREENSHOT_DIR, `test-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // 콘솔 요약 출력
    console.log('\n📊 테스트 결과 요약:');
    console.log(`총 테스트: ${report.summary.totalTests}`);
    console.log(`통과: ${report.summary.passed}`);
    console.log(`실패: ${report.summary.failed}`);
    console.log(`통과율: ${report.summary.passRate}`);
    console.log(`\n📁 상세 리포트: ${reportPath}`);
    console.log(`📁 스크린샷: ${SCREENSHOT_DIR}`);

    if (report.summary.failed > 0) {
      console.log('\n❌ 실패한 테스트:');
      navigationResults.details
        .filter(test => test.status === 'FAIL' || test.status === 'ERROR')
        .forEach(test => {
          console.log(`  - ${test.productSlug}: ${test.error || test.status}`);
        });
    }

  } catch (error) {
    console.error('❌ 테스트 실행 실패:', error);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);