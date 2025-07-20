import { chromium } from 'playwright';

async function testLocalCategoryError() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🔍 로컬 카테고리 페이지 오류 테스트 시작...');
    
    // 콘솔 로그 캡처
    page.on('console', (msg) => {
      console.log(`🖥️ Browser Console [${msg.type()}]:`, msg.text());
    });

    // 오류 캡처
    page.on('pageerror', (error) => {
      console.error(`❌ Page Error:`, error.message);
    });

    // 로컬 서버 접속
    await page.goto('http://localhost:8080');
    console.log('✅ 메인 페이지 로딩 완료');

    // 페이지 로딩 대기
    await page.waitForTimeout(3000);

    // 메인 페이지 스크린샷
    await page.screenshot({ path: 'local-test-main-page.png' });

    // 카테고리 버튼 찾기
    const categoryButtons = await page.locator('text=/캐스터|Heavy|Light|Industrial|Specialty|Wheel/').all();
    console.log(`🎯 발견된 카테고리 버튼 개수: ${categoryButtons.length}`);

    if (categoryButtons.length > 0) {
      // 첫 번째 카테고리 클릭
      console.log('🖱️ 첫 번째 카테고리 클릭 시도...');
      await categoryButtons[0].click();
      
      // 페이지 로딩 대기
      await page.waitForTimeout(5000);
      
      // 카테고리 페이지 스크린샷
      await page.screenshot({ path: 'local-test-category-page.png' });

      // 오류 메시지 확인
      const errorElements = await page.locator('text=/TypeError|Error|오류|cannot read properties/i').all();
      if (errorElements.length > 0) {
        console.log('❌ 카테고리 페이지에서 오류 발견!');
        for (let i = 0; i < errorElements.length; i++) {
          const errorText = await errorElements[i].textContent();
          console.log(`   오류 ${i + 1}: ${errorText}`);
        }
      } else {
        console.log('✅ 카테고리 페이지 오류 없음 - ProductCard.tsx 수정 성공!');
      }

      // 제품 카드 렌더링 확인
      const productCards = await page.locator('[data-testid="product-card"], .group, .cursor-pointer').all();
      console.log(`📦 렌더링된 제품 카드 개수: ${productCards.length}`);

      // 카테고리 텍스트 확인
      const categoryTexts = await page.locator('text=/카테고리 없음|Heavy|Light|Industrial|Specialty|Wheel/').all();
      console.log(`🏷️ 카테고리 텍스트 개수: ${categoryTexts.length}`);

      // 개발자 도구 콘솔 확인
      const consoleLogs = await page.evaluate(() => {
        const logs = [];
        const originalLog = console.log;
        const originalError = console.error;
        
        console.log = (...args) => {
          logs.push({ type: 'log', message: args.join(' ') });
          originalLog.apply(console, args);
        };
        
        console.error = (...args) => {
          logs.push({ type: 'error', message: args.join(' ') });
          originalError.apply(console, args);
        };
        
        return logs;
      });

      console.log('📋 콘솔 로그 상태:', consoleLogs);

    } else {
      console.log('⚠️ 카테고리 버튼을 찾을 수 없습니다.');
    }

  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
  } finally {
    await browser.close();
  }
}

testLocalCategoryError().catch(console.error);