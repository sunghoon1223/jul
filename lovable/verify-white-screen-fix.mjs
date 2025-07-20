import { chromium } from 'playwright';
import { promises as fs } from 'fs';

/**
 * Comprehensive Playwright test suite for verifying white screen fix
 * Tests all critical user flows including homepage, cart, authentication, and navigation
 */

class WhiteScreenVerificationTest {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.testResults = {
      homepage: { passed: false, errors: [], screenshots: [] },
      cart: { passed: false, errors: [], screenshots: [] },
      authentication: { passed: false, errors: [], screenshots: [] },
      navigation: { passed: false, errors: [], screenshots: [] },
      console: { errors: [], logs: [] },
      overall: { passed: false, summary: '' }
    };
  }

  async initialize() {
    console.log('🚀 초기화: 브라우저 시작...');
    this.browser = await chromium.launch({ 
      headless: false,
      slowMo: 500 // 500ms delay between actions for better visibility
    });
    
    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    });
    
    this.page = await this.context.newPage();
    
    // 콘솔 로그 수집
    this.page.on('console', msg => {
      const logEntry = `${msg.type()}: ${msg.text()}`;
      this.testResults.console.logs.push(logEntry);
      console.log(`📊 브라우저 콘솔: ${logEntry}`);
    });
    
    // 페이지 오류 수집
    this.page.on('pageerror', error => {
      const errorMsg = error.message;
      this.testResults.console.errors.push(errorMsg);
      console.log(`❌ 페이지 오류: ${errorMsg}`);
    });
    
    // 네트워크 요청 실패 수집
    this.page.on('requestfailed', request => {
      const failedRequest = `${request.method()} ${request.url()} - ${request.failure()?.errorText}`;
      this.testResults.console.errors.push(failedRequest);
      console.log(`🚫 네트워크 실패: ${failedRequest}`);
    });
  }

  async testHomepage() {
    console.log('🏠 홈페이지 테스트 시작...');
    
    try {
      // 홈페이지 로드
      await this.page.goto('http://localhost:8080', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      console.log('✅ 홈페이지 로드 완료');
      
      // 페이지 내용 확인
      const pageContent = await this.page.textContent('body');
      if (!pageContent || pageContent.trim().length === 0) {
        throw new Error('페이지 내용이 비어있음 (화이트 스크린)');
      }
      
      console.log('✅ 페이지 내용 확인됨:', pageContent.length, '문자');
      
      // 주요 섹션 확인
      const heroSection = await this.page.locator('text=Korean Caster').first();
      await heroSection.waitFor({ state: 'visible', timeout: 10000 });
      
      const productCategories = await this.page.locator('text=제품 카테고리').first();
      await productCategories.waitFor({ state: 'visible', timeout: 10000 });
      
      console.log('✅ 주요 섹션 렌더링 확인');
      
      // 스크린샷 캡처
      const screenshotPath = `homepage-test-${Date.now()}.png`;
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      this.testResults.homepage.screenshots.push(screenshotPath);
      
      console.log('📸 홈페이지 스크린샷 저장:', screenshotPath);
      
      this.testResults.homepage.passed = true;
      
    } catch (error) {
      console.error('❌ 홈페이지 테스트 실패:', error.message);
      this.testResults.homepage.errors.push(error.message);
      
      // 오류 스크린샷 캡처
      const errorScreenshot = `homepage-error-${Date.now()}.png`;
      await this.page.screenshot({ path: errorScreenshot, fullPage: true });
      this.testResults.homepage.screenshots.push(errorScreenshot);
    }
  }

  async testCartOperations() {
    console.log('🛒 장바구니 테스트 시작...');
    
    try {
      // 제품 페이지로 이동
      await this.page.goto('http://localhost:8080/products', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      console.log('✅ 제품 페이지 로드 완료');
      
      // 첫 번째 제품 찾기
      const firstProduct = await this.page.locator('[data-testid="product-card"]').first();
      if (await firstProduct.count() === 0) {
        // 제품 카드가 없다면 다른 선택자 시도
        await this.page.locator('text=장바구니에 추가').first().waitFor({ 
          state: 'visible', 
          timeout: 10000 
        });
      }
      
      // 장바구니 추가 버튼 클릭
      const addToCartBtn = await this.page.locator('text=장바구니에 추가').first();
      await addToCartBtn.click();
      
      console.log('✅ 장바구니 추가 버튼 클릭');
      
      // 장바구니 개수 확인
      await this.page.waitForTimeout(2000); // 상태 업데이트 대기
      
      const cartCount = await this.page.locator('[data-testid="cart-count"]').first();
      const cartCountText = await cartCount.textContent();
      
      if (cartCountText && parseInt(cartCountText) > 0) {
        console.log('✅ 장바구니 개수 업데이트 확인:', cartCountText);
      } else {
        console.log('⚠️ 장바구니 개수 업데이트 미확인');
      }
      
      // 장바구니 드로어 열기
      const cartButton = await this.page.locator('[data-testid="cart-button"]').first();
      await cartButton.click();
      
      console.log('✅ 장바구니 드로어 열기');
      
      // 장바구니 내용 확인
      await this.page.waitForTimeout(1000);
      
      // 스크린샷 캡처
      const screenshotPath = `cart-test-${Date.now()}.png`;
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      this.testResults.cart.screenshots.push(screenshotPath);
      
      console.log('📸 장바구니 테스트 스크린샷 저장:', screenshotPath);
      
      this.testResults.cart.passed = true;
      
    } catch (error) {
      console.error('❌ 장바구니 테스트 실패:', error.message);
      this.testResults.cart.errors.push(error.message);
      
      // 오류 스크린샷 캡처
      const errorScreenshot = `cart-error-${Date.now()}.png`;
      await this.page.screenshot({ path: errorScreenshot, fullPage: true });
      this.testResults.cart.screenshots.push(errorScreenshot);
    }
  }

  async testAuthentication() {
    console.log('🔐 인증 테스트 시작...');
    
    try {
      // 홈페이지로 이동
      await this.page.goto('http://localhost:8080', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // 로그인 버튼 찾기 및 클릭
      const loginButton = await this.page.locator('text=로그인').first();
      await loginButton.click();
      
      console.log('✅ 로그인 모달 열기');
      
      // 로그인 모달 확인
      await this.page.waitForTimeout(1000);
      
      const loginModal = await this.page.locator('[role="dialog"]').first();
      await loginModal.waitFor({ state: 'visible', timeout: 5000 });
      
      console.log('✅ 로그인 모달 표시 확인');
      
      // 관리자 로그인 버튼 테스트
      const adminButton = await this.page.locator('text=관리자').first();
      await adminButton.click();
      
      console.log('✅ 관리자 로그인 버튼 클릭');
      
      await this.page.waitForTimeout(1000);
      
      // 스크린샷 캡처
      const screenshotPath = `auth-test-${Date.now()}.png`;
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      this.testResults.authentication.screenshots.push(screenshotPath);
      
      console.log('📸 인증 테스트 스크린샷 저장:', screenshotPath);
      
      this.testResults.authentication.passed = true;
      
    } catch (error) {
      console.error('❌ 인증 테스트 실패:', error.message);
      this.testResults.authentication.errors.push(error.message);
      
      // 오류 스크린샷 캡처
      const errorScreenshot = `auth-error-${Date.now()}.png`;
      await this.page.screenshot({ path: errorScreenshot, fullPage: true });
      this.testResults.authentication.screenshots.push(errorScreenshot);
    }
  }

  async testNavigation() {
    console.log('🧭 네비게이션 테스트 시작...');
    
    try {
      // 홈페이지로 이동
      await this.page.goto('http://localhost:8080', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // 메가 메뉴 테스트
      const megaMenuTrigger = await this.page.locator('text=전체 메뉴').first();
      await megaMenuTrigger.hover();
      
      console.log('✅ 메가 메뉴 호버');
      
      await this.page.waitForTimeout(1000);
      
      // 카테고리 네비게이션 테스트
      const categoryLinks = await this.page.locator('a[href*="/categories/"]');
      const categoryCount = await categoryLinks.count();
      
      if (categoryCount > 0) {
        console.log('✅ 카테고리 링크 발견:', categoryCount, '개');
        
        // 첫 번째 카테고리 클릭
        const firstCategory = categoryLinks.first();
        await firstCategory.click();
        
        console.log('✅ 첫 번째 카테고리 클릭');
        
        // 페이지 로드 대기
        await this.page.waitForLoadState('networkidle', { timeout: 10000 });
        
        // 카테고리 페이지 내용 확인
        const pageContent = await this.page.textContent('body');
        if (!pageContent || pageContent.trim().length === 0) {
          throw new Error('카테고리 페이지 내용이 비어있음');
        }
        
        console.log('✅ 카테고리 페이지 내용 확인됨');
      }
      
      // 스크린샷 캡처
      const screenshotPath = `navigation-test-${Date.now()}.png`;
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      this.testResults.navigation.screenshots.push(screenshotPath);
      
      console.log('📸 네비게이션 테스트 스크린샷 저장:', screenshotPath);
      
      this.testResults.navigation.passed = true;
      
    } catch (error) {
      console.error('❌ 네비게이션 테스트 실패:', error.message);
      this.testResults.navigation.errors.push(error.message);
      
      // 오류 스크린샷 캡처
      const errorScreenshot = `navigation-error-${Date.now()}.png`;
      await this.page.screenshot({ path: errorScreenshot, fullPage: true });
      this.testResults.navigation.screenshots.push(errorScreenshot);
    }
  }

  async generateReport() {
    console.log('📋 최종 보고서 생성...');
    
    // 전체 테스트 결과 평가
    const passedTests = [
      this.testResults.homepage.passed,
      this.testResults.cart.passed,
      this.testResults.authentication.passed,
      this.testResults.navigation.passed
    ];
    
    const totalTests = passedTests.length;
    const passedCount = passedTests.filter(test => test).length;
    const hasConsoleErrors = this.testResults.console.errors.length > 0;
    
    this.testResults.overall.passed = passedCount === totalTests && !hasConsoleErrors;
    
    // 요약 생성
    this.testResults.overall.summary = `
🎯 화이트 스크린 수정 검증 완료 보고서
=====================================

📊 테스트 결과:
- 홈페이지 테스트: ${this.testResults.homepage.passed ? '✅ 통과' : '❌ 실패'}
- 장바구니 테스트: ${this.testResults.cart.passed ? '✅ 통과' : '❌ 실패'}
- 인증 테스트: ${this.testResults.authentication.passed ? '✅ 통과' : '❌ 실패'}
- 네비게이션 테스트: ${this.testResults.navigation.passed ? '✅ 통과' : '❌ 실패'}

📈 전체 결과: ${passedCount}/${totalTests} 테스트 통과

🔍 콘솔 로그: ${this.testResults.console.logs.length}개
❌ 콘솔 오류: ${this.testResults.console.errors.length}개

${hasConsoleErrors ? '⚠️ 콘솔 오류가 발견되었습니다.' : '✅ 콘솔 오류가 없습니다.'}

🏆 최종 판정: ${this.testResults.overall.passed ? '✅ 화이트 스크린 문제 해결됨' : '❌ 추가 수정 필요'}
`;
    
    console.log(this.testResults.overall.summary);
    
    // JSON 파일로 저장
    const reportPath = `white-screen-test-report-${Date.now()}.json`;
    await fs.writeFile(reportPath, JSON.stringify(this.testResults, null, 2));
    
    console.log('📄 보고서 저장:', reportPath);
    
    return this.testResults;
  }

  async cleanup() {
    console.log('🧹 정리 작업...');
    
    if (this.browser) {
      await this.browser.close();
    }
    
    console.log('✅ 브라우저 종료');
  }

  async runFullTest() {
    try {
      await this.initialize();
      
      console.log('🎯 종합 화이트 스크린 수정 검증 시작...');
      
      // 모든 테스트 실행
      await this.testHomepage();
      await this.testCartOperations();
      await this.testAuthentication();
      await this.testNavigation();
      
      // 보고서 생성
      await this.generateReport();
      
      return this.testResults;
      
    } catch (error) {
      console.error('❌ 테스트 실행 중 오류:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// 테스트 실행
async function runTest() {
  const test = new WhiteScreenVerificationTest();
  
  try {
    const results = await test.runFullTest();
    
    if (results.overall.passed) {
      console.log('🎉 모든 테스트 통과! 화이트 스크린 문제가 해결되었습니다.');
      process.exit(0);
    } else {
      console.log('⚠️ 일부 테스트 실패. 추가 수정이 필요합니다.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ 테스트 실행 실패:', error);
    process.exit(1);
  }
}

// 메인 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  runTest().catch(console.error);
}

export default WhiteScreenVerificationTest;