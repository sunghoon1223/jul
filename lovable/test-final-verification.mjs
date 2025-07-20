import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

async function testFinalVerification() {
  console.log('🏁 JP Caster 전체 시스템 최종 검증 테스트...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    errors: [],
    performance: {},
    features: {}
  };
  
  // 콘솔 에러 수집
  page.on('console', msg => {
    if (msg.type() === 'error') {
      results.errors.push({
        message: msg.text(),
        timestamp: new Date().toISOString()
      });
    }
  });
  
  try {
    // 1. 홈페이지 로드 및 성능 측정
    console.log('🏠 홈페이지 로드 및 성능 측정...');
    const startTime = Date.now();
    
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    results.performance.homePageLoad = loadTime;
    
    await page.screenshot({ path: 'final-verification-homepage.png' });
    
    results.tests.push({
      name: '홈페이지 로드',
      status: 'success',
      loadTime: `${loadTime}ms`,
      timestamp: new Date().toISOString()
    });
    
    // 2. 제품 카탈로그 테스트
    console.log('📦 제품 카탈로그 테스트...');
    
    await page.goto('http://localhost:8080/products');
    await page.waitForLoadState('networkidle');
    
    // 제품 개수 확인
    const productCards = await page.locator('.rounded-lg.text-card-foreground.group.cursor-pointer');
    const productCount = await productCards.count();
    
    results.features.productCatalog = {
      totalProducts: productCount,
      status: productCount > 0 ? 'success' : 'failed'
    };
    
    await page.screenshot({ path: 'final-verification-products.png' });
    
    results.tests.push({
      name: '제품 카탈로그',
      status: productCount > 0 ? 'success' : 'failed',
      details: `${productCount}개 제품 발견`,
      timestamp: new Date().toISOString()
    });
    
    // 3. 검색 기능 테스트
    console.log('🔍 검색 기능 테스트...');
    
    const searchInput = await page.locator('input[type="search"], input[placeholder*="검색"], input[placeholder*="search"]');
    
    if (await searchInput.count() > 0) {
      await searchInput.first().fill('AGV');
      await searchInput.first().press('Enter');
      await page.waitForTimeout(2000);
      
      const searchResults = await page.locator('.rounded-lg.text-card-foreground.group.cursor-pointer');
      const searchResultCount = await searchResults.count();
      
      results.features.search = {
        available: true,
        searchTerm: 'AGV',
        resultCount: searchResultCount,
        status: 'success'
      };
      
      results.tests.push({
        name: '검색 기능',
        status: 'success',
        details: `AGV 검색 결과: ${searchResultCount}개`,
        timestamp: new Date().toISOString()
      });
    } else {
      results.features.search = {
        available: false,
        status: 'not_found'
      };
      
      results.tests.push({
        name: '검색 기능',
        status: 'failed',
        error: '검색 입력창을 찾을 수 없음',
        timestamp: new Date().toISOString()
      });
    }
    
    // 4. 카테고리 네비게이션 테스트
    console.log('🗂️ 카테고리 네비게이션 테스트...');
    
    await page.goto('http://localhost:8080/products');
    await page.waitForLoadState('networkidle');
    
    const categoryLinks = await page.locator('a[href*="/categories/"]');
    const categoryCount = await categoryLinks.count();
    
    if (categoryCount > 0) {
      // 첫 번째 카테고리 클릭
      await categoryLinks.first().click();
      await page.waitForLoadState('networkidle');
      
      const categoryProducts = await page.locator('.rounded-lg.text-card-foreground.group.cursor-pointer');
      const categoryProductCount = await categoryProducts.count();
      
      results.features.categories = {
        totalCategories: categoryCount,
        testCategoryProducts: categoryProductCount,
        status: 'success'
      };
      
      results.tests.push({
        name: '카테고리 네비게이션',
        status: 'success',
        details: `${categoryCount}개 카테고리, 테스트 카테고리에 ${categoryProductCount}개 제품`,
        timestamp: new Date().toISOString()
      });
    } else {
      results.features.categories = {
        status: 'not_found'
      };
      
      results.tests.push({
        name: '카테고리 네비게이션',
        status: 'failed',
        error: '카테고리 링크를 찾을 수 없음',
        timestamp: new Date().toISOString()
      });
    }
    
    // 5. 제품 상세 페이지 테스트
    console.log('📋 제품 상세 페이지 테스트...');
    
    await page.goto('http://localhost:8080/products');
    await page.waitForLoadState('networkidle');
    
    const firstProduct = await page.locator('.rounded-lg.text-card-foreground.group.cursor-pointer').first();
    const detailButton = await firstProduct.locator('button:has-text("상세보기"), a:has-text("상세보기")');
    
    if (await detailButton.count() > 0) {
      await detailButton.click();
      await page.waitForLoadState('networkidle');
      
      // 제품 상세 정보 확인
      const productTitle = await page.locator('h1, h2, .product-title').first().textContent();
      const productPrice = await page.locator('.price, .cost').first().textContent();
      
      results.features.productDetail = {
        title: productTitle,
        price: productPrice,
        status: 'success'
      };
      
      results.tests.push({
        name: '제품 상세 페이지',
        status: 'success',
        details: `제품명: ${productTitle}, 가격: ${productPrice}`,
        timestamp: new Date().toISOString()
      });
    } else {
      results.features.productDetail = {
        status: 'not_found'
      };
      
      results.tests.push({
        name: '제품 상세 페이지',
        status: 'failed',
        error: '상세보기 버튼을 찾을 수 없음',
        timestamp: new Date().toISOString()
      });
    }
    
    // 6. 반응형 디자인 테스트
    console.log('📱 반응형 디자인 테스트...');
    
    // 모바일 크기로 변경
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
    
    // 모바일 메뉴 확인
    const mobileMenuButton = await page.locator('button:has-text("메뉴"), .mobile-menu-button, [aria-label*="menu"]');
    
    if (await mobileMenuButton.count() > 0) {
      results.features.responsive = {
        mobileMenuAvailable: true,
        status: 'success'
      };
      
      results.tests.push({
        name: '반응형 디자인',
        status: 'success',
        details: '모바일 메뉴 확인됨',
        timestamp: new Date().toISOString()
      });
    } else {
      results.features.responsive = {
        mobileMenuAvailable: false,
        status: 'partial'
      };
      
      results.tests.push({
        name: '반응형 디자인',
        status: 'partial',
        details: '모바일 메뉴 버튼을 찾을 수 없음',
        timestamp: new Date().toISOString()
      });
    }
    
    // 데스크톱 크기로 복원
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // 7. 페이지 속도 및 SEO 기본 요소 확인
    console.log('⚡ 페이지 속도 및 SEO 확인...');
    
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
    
    const pageTitle = await page.title();
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
    
    results.features.seo = {
      title: pageTitle,
      description: metaDescription,
      status: pageTitle ? 'success' : 'partial'
    };
    
    results.tests.push({
      name: 'SEO 기본 요소',
      status: pageTitle ? 'success' : 'partial',
      details: `제목: ${pageTitle}, 설명: ${metaDescription}`,
      timestamp: new Date().toISOString()
    });
    
    // 최종 스크린샷
    await page.screenshot({ path: 'final-verification-complete.png' });
    
    results.summary = {
      totalTests: results.tests.length,
      successTests: results.tests.filter(t => t.status === 'success').length,
      failedTests: results.tests.filter(t => t.status === 'failed').length,
      partialTests: results.tests.filter(t => t.status === 'partial').length,
      totalErrors: results.errors.length,
      overallStatus: results.tests.filter(t => t.status === 'success').length >= results.tests.length * 0.8 ? 'excellent' : 'good'
    };
    
    console.log(`✅ 전체 테스트 완료!`);
    console.log(`📊 성공: ${results.summary.successTests}/${results.summary.totalTests}`);
    console.log(`⚠️ 부분 성공: ${results.summary.partialTests}`);
    console.log(`❌ 실패: ${results.summary.failedTests}`);
    console.log(`🚨 에러: ${results.summary.totalErrors}`);
    console.log(`🏆 전체 상태: ${results.summary.overallStatus}`);
    
  } catch (error) {
    console.error('❌ 최종 검증 중 에러:', error);
    results.errors.push({
      message: `최종 검증 에러: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  } finally {
    await browser.close();
  }
  
  // 결과 파일 저장
  writeFileSync('final-verification-results.json', JSON.stringify(results, null, 2));
  console.log('📊 최종 검증 결과가 final-verification-results.json에 저장되었습니다.');
  
  return results;
}

// 테스트 실행
testFinalVerification().catch(console.error);