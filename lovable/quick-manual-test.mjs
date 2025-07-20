import puppeteer from 'puppeteer';

async function quickTest() {
    console.log('🔍 빠른 수동 확인 테스트...');
    
    const browser = await puppeteer.launch({ 
        headless: false, 
        devtools: true,
        defaultViewport: { width: 1280, height: 720 }
    });
    
    try {
        const page = await browser.newPage();
        
        // Console logs 캡처
        page.on('console', msg => {
            console.log('브라우저:', msg.text());
        });
        
        console.log('📱 홈페이지 접속...');
        await page.goto('https://studio-sb.com', { waitUntil: 'networkidle2' });
        
        console.log('✋ 브라우저가 열려있습니다. 수동으로 테스트해보세요:');
        console.log('1. 제품 페이지로 이동');
        console.log('2. 제품 클릭하여 상세페이지 이동');
        console.log('3. "장바구니에 담기" 버튼 클릭');
        console.log('4. 헤더 오른쪽 장바구니 아이콘의 숫자 변화 확인');
        console.log('5. 장바구니 아이콘 클릭하여 드로어 열기');
        
        console.log('\n💡 성공 기준:');
        console.log('- 헤더의 장바구니 아이콘 옆에 숫자 "1" 표시');
        console.log('- 장바구니 드로어에 추가한 상품 표시');
        console.log('- 브라우저 콘솔에 Context 업데이트 로그');
        
        // 60초 대기
        await new Promise(resolve => setTimeout(resolve, 60000));
        
    } catch (error) {
        console.error('❌ 오류:', error.message);
    } finally {
        await browser.close();
    }
}

quickTest();