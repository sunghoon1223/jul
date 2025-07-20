// 채팅봇 API 최신 모델로 테스트
const GEMINI_API_KEY = 'AIzaSyD8AQziB3NYBRGP62PLrrZv4UFYhNv72OM';

async function testGeminiAPIWithNewModel() {
    console.log('🤖 Gemini API 최신 모델 테스트...');
    
    // 1. 사용 가능한 모델 리스트 확인
    try {
        console.log('📋 사용 가능한 모델 조회 중...');
        const modelsResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`);
        
        if (modelsResponse.ok) {
            const modelsData = await modelsResponse.json();
            console.log('📝 사용 가능한 모델들:');
            modelsData.models?.forEach(model => {
                if (model.supportedGenerationMethods?.includes('generateContent')) {
                    console.log(`  - ${model.name}`);
                }
            });
        }
    } catch (error) {
        console.log('⚠️ 모델 리스트 조회 실패, 직접 테스트 진행');
    }
    
    // 2. 최신 모델들로 테스트
    const modelsToTest = [
        'gemini-1.5-flash',
        'gemini-1.5-pro', 
        'gemini-pro',
        'gemini-1.0-pro'
    ];
    
    for (const modelName of modelsToTest) {
        console.log(`\n🔄 ${modelName} 모델 테스트 중...`);
        
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: '안녕하세요? 간단한 테스트입니다. "테스트 성공"이라고 답해주세요.'
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 100,
                    }
                })
            });

            console.log(`📡 ${modelName} 응답:`, response.status, response.statusText);
            
            if (response.ok) {
                const data = await response.json();
                if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                    const responseText = data.candidates[0].content.parts[0].text;
                    console.log(`✅ ${modelName} 성공! 응답:`, responseText);
                    return { success: true, model: modelName, response: responseText };
                }
            } else {
                const errorText = await response.text();
                console.log(`❌ ${modelName} 실패:`, errorText);
            }
            
        } catch (error) {
            console.log(`❌ ${modelName} 네트워크 오류:`, error.message);
        }
    }
    
    return { success: false };
}

testGeminiAPIWithNewModel().then(result => {
    console.log('\n🏁 최종 결과:', result);
    if (result.success) {
        console.log(`🎯 사용할 모델: ${result.model}`);
    }
    process.exit(result.success ? 0 : 1);
});