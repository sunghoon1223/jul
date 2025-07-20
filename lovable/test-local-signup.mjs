import { chromium } from 'playwright';

async function testLocalSignup() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('👤 로컬 회원가입 기능 테스트 시작...');
    
    // 콘솔 로그 및 오류 캡처
    page.on('console', (msg) => {
      console.log(`🖥️ Browser Console [${msg.type()}]:`, msg.text());
    });

    page.on('pageerror', (error) => {
      console.error(`❌ Page Error:`, error.message);
    });

    page.on('response', (response) => {
      if (response.url().includes('supabase') || response.url().includes('auth')) {
        console.log(`🌐 API Response: ${response.status()} ${response.url()}`);
      }
    });

    // 로컬 서버 접속
    await page.goto('http://localhost:8080');
    console.log('✅ 메인 페이지 로딩 완료');

    await page.waitForTimeout(3000);

    // 로그인 버튼 찾기 (헤더의 사용자 아이콘 또는 로그인 버튼)
    const loginButton = page.locator('text=/로그인|계정|사용자|User|Login/i').first();
    
    if (await loginButton.isVisible()) {
      console.log('🔑 로그인 버튼 클릭...');
      await loginButton.click();
      await page.waitForTimeout(2000);
    } else {
      console.log('⚠️ 로그인 버튼을 찾을 수 없어서 직접 인증 모달 트리거 시도...');
      // 다른 방법으로 인증 모달 트리거 시도
      const authTriggers = await page.locator('button, [role="button"]').all();
      for (const trigger of authTriggers) {
        const text = await trigger.textContent();
        if (text && (text.includes('로그인') || text.includes('계정') || text.includes('사용자'))) {
          await trigger.click();
          await page.waitForTimeout(1000);
          break;
        }
      }
    }

    // 회원가입 탭 클릭 (strict mode 회피)
    const signupTab = page.getByRole('tab', { name: '회원가입' });
    if (await signupTab.isVisible()) {
      console.log('📝 회원가입 탭 클릭...');
      await signupTab.click();
      await page.waitForTimeout(1000);
    } else {
      console.log('⚠️ 회원가입 탭을 찾을 수 없습니다. 모든 탭 확인...');
      const allTabs = await page.locator('[role="tab"]').all();
      for (let i = 0; i < allTabs.length; i++) {
        const tabText = await allTabs[i].textContent();
        console.log(`   탭 ${i + 1}: ${tabText}`);
        if (tabText && tabText.includes('회원가입')) {
          await allTabs[i].click();
          await page.waitForTimeout(1000);
          break;
        }
      }
    }

    // 테스트 스크린샷
    await page.screenshot({ path: 'local-signup-form.png' });

    // 회원가입 폼 입력
    const testEmail = `test_${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    const testName = '테스트 사용자';

    console.log(`📋 회원가입 정보 입력... (이메일: ${testEmail})`);

    // 이름 입력
    const nameInput = page.locator('input[id*="name"], input[placeholder*="이름"], input[type="text"]').first();
    if (await nameInput.isVisible()) {
      await nameInput.fill(testName);
      console.log('✅ 이름 입력 완료');
    }

    // 이메일 입력
    const emailInput = page.locator('input[type="email"], input[id*="email"], input[placeholder*="이메일"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill(testEmail);
      console.log('✅ 이메일 입력 완료');
    }

    // 비밀번호 입력
    const passwordInputs = await page.locator('input[type="password"]').all();
    if (passwordInputs.length >= 2) {
      await passwordInputs[0].fill(testPassword);
      await passwordInputs[1].fill(testPassword);
      console.log('✅ 비밀번호 입력 완료');
    }

    // 회원가입 버튼 클릭 (모달 내부의 버튼을 정확히 찾기)
    const submitButton = page.locator('div[role="dialog"] button[type="submit"], [role="dialog"] button:has-text("회원가입")').first();
    if (await submitButton.isVisible()) {
      console.log('🚀 회원가입 버튼 클릭...');
      await submitButton.click();
      
      // 응답 대기
      await page.waitForTimeout(5000);
      
      // 최종 스크린샷
      await page.screenshot({ path: 'local-signup-result.png' });
      
      // 성공/실패 메시지 확인
      const successMessage = await page.locator('text=/성공|완료|확인|환영|welcome/i').first();
      const errorMessage = await page.locator('text=/실패|오류|에러|error|failed/i').first();
      
      if (await successMessage.isVisible()) {
        const successText = await successMessage.textContent();
        console.log('✅ 회원가입 성공:', successText);
      } else if (await errorMessage.isVisible()) {
        const errorText = await errorMessage.textContent();
        console.log('❌ 회원가입 실패:', errorText);
      } else {
        console.log('⚠️ 성공/실패 메시지를 찾을 수 없습니다.');
      }
    } else {
      console.log('❌ 회원가입 버튼을 찾을 수 없습니다.');
    }

  } catch (error) {
    console.error('❌ 회원가입 테스트 중 오류 발생:', error);
  } finally {
    await browser.close();
  }
}

testLocalSignup().catch(console.error);