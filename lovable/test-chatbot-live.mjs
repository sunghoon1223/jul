import puppeteer from 'puppeteer';

async function testChatbotLive() {
    console.log('🤖 실제 사이트 채팅봇 기능 테스트...');
    
    const browser = await puppeteer.launch({ 
        headless: false, 
        devtools: true,
        defaultViewport: { width: 1280, height: 720 }
    });
    
    try {
        const page = await browser.newPage();
        
        // Console logs 캡처
        page.on('console', msg => {
            const text = msg.text();
            if (text.includes('🤖') || text.includes('🔑') || text.includes('API') || text.includes('Gemini')) {
                console.log('브라우저:', text);
            }
        });
        
        console.log('📱 사이트 접속 중...');
        await page.goto('https://studio-sb.com', { waitUntil: 'networkidle2' });
        
        // 페이지 로드 대기
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('🔍 채팅봇 버튼 찾기...');
        
        // 채팅봇 버튼 클릭
        const chatbotButton = await page.evaluateHandle(() => {
            // 채팅 아이콘이 있는 버튼 찾기
            const buttons = Array.from(document.querySelectorAll('button'));
            return buttons.find(btn => 
                btn.querySelector('[data-lucide="message-circle"]') ||
                btn.className.includes('bg-amber') ||
                btn.textContent.includes('AI')
            );
        });
        
        if (chatbotButton) {
            console.log('✅ 채팅봇 버튼 발견! 클릭 중...');
            await chatbotButton.click();
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // 채팅 입력창에 테스트 메시지 입력
            console.log('📝 테스트 메시지 입력 중...');
            const inputField = await page.$('input[placeholder*="메시지"]') || 
                              await page.$('input[type="text"]');
            
            if (inputField) {
                await inputField.type('안녕하세요! 테스트 메시지입니다.');
                
                // 전송 버튼 클릭
                const sendButton = await page.evaluateHandle(() => {
                    const buttons = Array.from(document.querySelectorAll('button'));
                    return buttons.find(btn => 
                        btn.querySelector('[data-lucide="send"]') ||
                        btn.className.includes('bg-amber')
                    );
                });
                
                if (sendButton) {
                    console.log('📤 메시지 전송 중...');
                    await sendButton.click();
                    
                    // AI 응답 대기
                    console.log('⏳ AI 응답 대기 중...');
                    await new Promise(resolve => setTimeout(resolve, 10000));
                    
                    // 채팅 내역 확인
                    const messages = await page.evaluate(() => {
                        const messageElements = document.querySelectorAll('[class*="rounded-lg"]');
                        return Array.from(messageElements).map(el => el.textContent);
                    });
                    
                    console.log('💬 채팅 내역:', messages);
                    
                    if (messages.length > 1) {
                        console.log('✅ 채팅봇이 정상적으로 응답했습니다!');
                        return true;
                    } else {
                        console.log('❌ AI 응답을 받지 못했습니다.');
                        return false;
                    }
                } else {
                    console.log('❌ 전송 버튼을 찾을 수 없습니다.');
                    return false;
                }
            } else {
                console.log('❌ 입력창을 찾을 수 없습니다.');
                return false;
            }
        } else {
            console.log('❌ 채팅봇 버튼을 찾을 수 없습니다.');
            return false;
        }
        
    } catch (error) {
        console.error('❌ 테스트 중 오류:', error.message);
        return false;
    } finally {
        console.log('🔍 브라우저를 60초간 열어둡니다. 수동으로 테스트해보세요.');
        await new Promise(resolve => setTimeout(resolve, 60000));
        await browser.close();
    }
}

testChatbotLive().then(success => {
    console.log('\n🏁 최종 결과:', success ? '채팅봇 테스트 성공' : '채팅봇 테스트 실패');
    process.exit(success ? 0 : 1);
});