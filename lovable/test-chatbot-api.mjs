// 채팅봇 API 직접 테스트
const GEMINI_API_KEY = 'AIzaSyD8AQziB3NYBRGP62PLrrZv4UFYhNv72OM';

async function testGeminiAPI() {
    console.log('🤖 Gemini API 직접 테스트 시작...');
    console.log('🔑 사용할 API 키:', GEMINI_API_KEY.substring(0, 10) + '...');
    
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: '안녕하세요? 간단한 테스트 질문입니다.'
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                }
            })
        });

        console.log('📡 응답 상태:', response.status, response.statusText);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API 호출 실패:', errorText);
            return false;
        }

        const data = await response.json();
        console.log('✅ API 호출 성공!');
        console.log('📝 응답 데이터:', JSON.stringify(data, null, 2));
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const responseText = data.candidates[0].content.parts[0].text;
            console.log('🎯 AI 응답:', responseText);
            return true;
        } else {
            console.error('❌ 예상하지 못한 응답 형식:', data);
            return false;
        }
        
    } catch (error) {
        console.error('❌ 네트워크 오류:', error.message);
        console.error('📊 에러 상세:', error);
        return false;
    }
}

// 환경변수 접근 테스트
console.log('🔍 환경변수 접근 테스트:');
console.log('- process.env.VITE_GEMINI_API_KEY:', process.env.VITE_GEMINI_API_KEY || '없음');
console.log('- process.env.GEMINI_API_KEY:', process.env.GEMINI_API_KEY || '없음');

testGeminiAPI().then(success => {
    console.log('\n🏁 최종 결과:', success ? 'API 테스트 성공' : 'API 테스트 실패');
    process.exit(success ? 0 : 1);
});