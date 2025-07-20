import { chromium } from 'playwright';

async function testSocialLoginUIFixed() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  try {
    console.log('🔐 한국형 소셜 로그인 UI 테스트 시작...');
    
    // 로컬 서버 접속
    await page.goto('http://localhost:8080');
    console.log('✅ 메인 페이지 로딩 완료');

    await page.waitForTimeout(3000);

    // 로그인 버튼 클릭
    const loginButton = page.locator('text=/로그인|계정|사용자/i').first();
    if (await loginButton.isVisible()) {
      console.log('🔑 로그인 버튼 클릭...');
      await loginButton.click();
      await page.waitForTimeout(2000);
    }

    // 모달 내부 요소 확인
    console.log('🔍 모달 내부 요소 확인...');
    
    // 모달 전체 스크린샷
    await page.screenshot({ path: 'social-login-modal-full.png', fullPage: true });

    // 로그인 폼 요소들 확인
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const loginFormButton = page.locator('button[type="submit"]');

    console.log('📋 이메일 입력:', await emailInput.isVisible());
    console.log('📋 비밀번호 입력:', await passwordInput.isVisible());
    console.log('📋 로그인 버튼:', await loginFormButton.isVisible());

    // 모달 하단까지 스크롤
    await page.locator('[role="dialog"]').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);

    // 소셜 로그인 섹션 찾기
    const socialSection = page.locator('text="또는"');
    if (await socialSection.isVisible()) {
      console.log('✅ "또는" 구분선 발견');
    } else {
      console.log('❌ "또는" 구분선 없음');
    }

    // 개별 소셜 로그인 버튼 확인
    const allButtons = await page.locator('button').all();
    console.log(`🔍 전체 버튼 개수: ${allButtons.length}`);

    for (let i = 0; i < allButtons.length; i++) {
      const buttonText = await allButtons[i].textContent();
      console.log(`   버튼 ${i + 1}: ${buttonText}`);
    }

    // 소셜 로그인 버튼들 직접 찾기
    const socialButtons = await page.locator('button:has-text("카카오"), button:has-text("네이버"), button:has-text("구글")').all();
    console.log(`🔍 소셜 로그인 버튼 개수: ${socialButtons.length}`);

    for (let i = 0; i < socialButtons.length; i++) {
      const buttonText = await socialButtons[i].textContent();
      console.log(`   소셜 버튼 ${i + 1}: ${buttonText}`);
    }

    // 다시 스크린샷
    await page.screenshot({ path: 'social-login-modal-final.png' });

    console.log('🎉 소셜 로그인 UI 테스트 완료!');

  } catch (error) {
    console.error('❌ 소셜 로그인 UI 테스트 중 오류 발생:', error);
  } finally {
    await browser.close();
  }
}

testSocialLoginUIFixed().catch(console.error);