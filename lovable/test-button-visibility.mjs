import puppeteer from 'puppeteer';

async function testButtonVisibility() {
    console.log('🔍 버튼 가시성 문제 테스트 중...');
    
    const browser = await puppeteer.launch({ 
        headless: false, 
        devtools: true,
        defaultViewport: { width: 1280, height: 720 }
    });
    
    try {
        const page = await browser.newPage();
        
        console.log('📱 사이트 접속 중...');
        await page.goto('https://studio-sb.com', { waitUntil: 'networkidle2' });
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 1. 상세페이지의 리뷰 작성하기 버튼 테스트
        console.log('🔍 상세페이지로 이동 중...');
        await page.goto('https://studio-sb.com/products/mecanum-multi-directional-125mm', { waitUntil: 'networkidle2' });
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 리뷰 탭 클릭
        console.log('📋 리뷰 탭 클릭 중...');
        const reviewTab = await page.$('[data-value="reviews"]');
        if (reviewTab) {
            await reviewTab.click();
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // 리뷰 작성하기 버튼 찾기 및 스타일 확인
            const reviewButton = await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button'));
                const reviewBtn = buttons.find(btn => btn.textContent?.includes('리뷰 작성하기'));
                if (reviewBtn) {
                    const styles = window.getComputedStyle(reviewBtn);
                    return {
                        found: true,
                        backgroundColor: styles.backgroundColor,
                        color: styles.color,
                        border: styles.border,
                        text: reviewBtn.textContent
                    };
                }
                return { found: false };
            });
            
            console.log('🎯 리뷰 작성하기 버튼 상태:', reviewButton);
            
            // 버튼에 마우스 호버하여 스타일 변화 확인
            if (reviewButton.found) {
                await page.hover('button:has-text("리뷰 작성하기")');
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                const hoverStyles = await page.evaluate(() => {
                    const buttons = Array.from(document.querySelectorAll('button'));
                    const reviewBtn = buttons.find(btn => btn.textContent?.includes('리뷰 작성하기'));
                    if (reviewBtn) {
                        const styles = window.getComputedStyle(reviewBtn);
                        return {
                            backgroundColor: styles.backgroundColor,
                            color: styles.color,
                            border: styles.border
                        };
                    }
                    return null;
                });
                
                console.log('🎯 리뷰 버튼 호버 시 스타일:', hoverStyles);
            }
        }
        
        // 2. FAQ 페이지 버튼들 테스트
        console.log('❓ FAQ 페이지로 이동 중...');
        await page.goto('https://studio-sb.com/faq', { waitUntil: 'networkidle2' });
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // FAQ 페이지의 outline 버튼들 찾기
        const faqButtons = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const outlineButtons = buttons.filter(btn => 
                btn.className.includes('outline') || 
                btn.textContent?.includes('제품 보기') ||
                btn.textContent?.includes('전화하기') ||
                btn.textContent?.includes('문의하기') ||
                btn.textContent?.includes('대리점 찾기')
            );
            
            return outlineButtons.map(btn => {
                const styles = window.getComputedStyle(btn);
                return {
                    text: btn.textContent?.trim(),
                    backgroundColor: styles.backgroundColor,
                    color: styles.color,
                    border: styles.border,
                    className: btn.className
                };
            });
        });
        
        console.log('❓ FAQ 페이지 버튼들 상태:', faqButtons);
        
        // 대리점 찾기 버튼 호버 테스트
        const dealerButton = await page.$('button:has-text("대리점 찾기")');
        if (dealerButton) {
            console.log('🏪 대리점 찾기 버튼에 호버 중...');
            await page.hover('button:has-text("대리점 찾기")');
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const dealerHoverStyles = await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button'));
                const dealerBtn = buttons.find(btn => btn.textContent?.includes('대리점 찾기'));
                if (dealerBtn) {
                    const styles = window.getComputedStyle(dealerBtn);
                    return {
                        backgroundColor: styles.backgroundColor,
                        color: styles.color,
                        border: styles.border
                    };
                }
                return null;
            });
            
            console.log('🏪 대리점 찾기 버튼 호버 시 스타일:', dealerHoverStyles);
        }
        
        console.log('🔍 브라우저를 60초간 열어둡니다. 수동으로 테스트해보세요.');
        await new Promise(resolve => setTimeout(resolve, 60000));
        
    } catch (error) {
        console.error('❌ 테스트 중 오류:', error.message);
    } finally {
        await browser.close();
    }
}

testButtonVisibility().then(() => {
    console.log('\\n🏁 버튼 가시성 테스트 완료');
    process.exit(0);
});