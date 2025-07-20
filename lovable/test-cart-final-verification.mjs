import puppeteer from 'puppeteer';

async function testCartFunctionality() {
    console.log('🔍 장바구니 기능 최종 검증 시작...');
    
    const browser = await puppeteer.launch({ 
        headless: false, 
        defaultViewport: { width: 1280, height: 720 }
    });
    
    try {
        const page = await browser.newPage();
        
        // Console logs 캡처
        page.on('console', msg => {
            if (msg.text().includes('🛒') || msg.text().includes('🔢') || msg.text().includes('CartContext')) {
                console.log('브라우저 로그:', msg.text());
            }
        });
        
        console.log('📱 홈페이지 접속 중...');
        await page.goto('https://studio-sb.com', { waitUntil: 'networkidle2' });
        
        // 페이지 제목 확인
        const title = await page.title();
        console.log('📄 페이지 제목:', title);
        
        // 1. 제품 페이지로 이동
        console.log('🔍 제품 페이지 이동...');
        await page.click('a[href*="products"]');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 2. 첫 번째 제품 카드 클릭
        console.log('🛍️ 제품 상세 페이지 이동...');
        const productCards = await page.$$('.group.bg-white');
        if (productCards.length > 0) {
            await productCards[0].click();
            await new Promise(resolve => setTimeout(resolve, 3000));
        } else {
            throw new Error('제품 카드를 찾을 수 없습니다');
        }
        
        // 3. 장바구니 추가 버튼 클릭 전 상태 확인
        console.log('📊 장바구니 추가 전 상태 확인...');
        
        // Header의 장바구니 카운트 확인
        const headerCountBefore = await page.$eval('[data-testid="cart-count"]', el => el.textContent).catch(() => '0');
        console.log('🔢 추가 전 헤더 카운트:', headerCountBefore);
        
        // localStorage 확인
        const localStorageBefore = await page.evaluate(() => {
            return localStorage.getItem('shopping_cart');
        });
        console.log('💾 추가 전 localStorage:', localStorageBefore || '빈 상태');
        
        // 4. 장바구니에 추가 버튼 클릭
        console.log('🛒 장바구니에 추가 버튼 클릭...');
        const addToCartBtn = await page.evaluateHandle(() => {
            // 텍스트로 버튼 찾기
            const buttons = Array.from(document.querySelectorAll('button'));
            return buttons.find(btn => 
                btn.textContent.includes('장바구니에 담기') || 
                btn.textContent.includes('장바구니') ||
                btn.className.includes('bg-blue')
            );
        });
        
        if (addToCartBtn) {
            await addToCartBtn.click();
            console.log('✅ 장바구니 추가 버튼 클릭 완료');
        } else {
            throw new Error('장바구니 추가 버튼을 찾을 수 없습니다');
        }
        
        // 5. 상태 변화 대기 및 확인
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 6. 추가 후 상태 확인
        console.log('📊 장바구니 추가 후 상태 확인...');
        
        // Header 카운트 다시 확인
        const headerCountAfter = await page.$eval('[data-testid="cart-count"]', el => el.textContent).catch(() => '0');
        console.log('🔢 추가 후 헤더 카운트:', headerCountAfter);
        
        // localStorage 다시 확인
        const localStorageAfter = await page.evaluate(() => {
            return localStorage.getItem('shopping_cart');
        });
        console.log('💾 추가 후 localStorage:', localStorageAfter || '빈 상태');
        
        // 7. 장바구니 드로어 열기 테스트
        console.log('🛒 장바구니 드로어 열기 테스트...');
        const cartButton = await page.evaluateHandle(() => {
            // 장바구니 아이콘이 있는 버튼 찾기
            const buttons = Array.from(document.querySelectorAll('button'));
            return buttons.find(btn => 
                btn.querySelector('[data-lucide="shopping-cart"]') ||
                btn.querySelector('svg') ||
                btn.textContent.includes('장바구니')
            );
        });
        
        if (cartButton) {
            await cartButton.click();
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 드로어가 열렸는지 확인
            const drawerVisible = await page.$('.bg-background') !== null;
            console.log('🚪 장바구니 드로어 열림:', drawerVisible ? '성공' : '실패');
        }
        
        // 8. 결과 분석
        console.log('\n📋 테스트 결과 분석:');
        console.log('=' + '='.repeat(50));
        
        const isHeaderCountUpdated = headerCountAfter !== headerCountBefore && headerCountAfter !== '0';
        const isLocalStorageUpdated = localStorageAfter && localStorageAfter !== 'null';
        
        console.log(`🔢 헤더 카운트 업데이트: ${isHeaderCountUpdated ? '✅ 성공' : '❌ 실패'}`);
        console.log(`💾 localStorage 저장: ${isLocalStorageUpdated ? '✅ 성공' : '❌ 실패'}`);
        
        if (isHeaderCountUpdated && isLocalStorageUpdated) {
            console.log('🎉 장바구니 기능이 정상적으로 작동합니다!');
            return true;
        } else {
            console.log('⚠️ 장바구니 기능에 문제가 있습니다.');
            return false;
        }
        
    } catch (error) {
        console.error('❌ 테스트 중 오류 발생:', error.message);
        return false;
    } finally {
        await browser.close();
    }
}

// 테스트 실행
testCartFunctionality().then(success => {
    console.log('\n🏁 최종 결과:', success ? '테스트 성공' : '테스트 실패');
    process.exit(success ? 0 : 1);
});