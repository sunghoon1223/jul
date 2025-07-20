import { collectBlogContent } from './collect-blog-content.mjs';

// Playwright Mock 객체 (실제 환경에서는 real playwright가 필요)
class PlaywrightMock {
  async playwright_navigate({ url }) {
    console.log(`[MOCK] 네비게이팅: ${url}`);
    return { success: true };
  }
  
  async playwright_get_visible_html({ selector, removeScripts, removeComments, maxLength }) {
    console.log(`[MOCK] HTML 추출: ${selector}`);
    return { 
      content: `<div>모의 HTML 내용 (${selector})</div>` 
    };
  }
  
  async playwright_get_visible_text() {
    console.log(`[MOCK] 텍스트 추출`);
    return { 
      content: '모의 텍스트 내용입니다.' 
    };
  }
  
  async playwright_evaluate({ script }) {
    console.log(`[MOCK] 스크립트 실행: ${script.substring(0, 50)}...`);
    
    // 제목 추출 시뮬레이션
    if (script.includes('itemSubjectBoldfont')) {
      return { result: '모의 글 제목' };
    }
    
    // 날짜 추출 시뮬레이션
    if (script.includes('publishDate')) {
      return { result: '2025.07.18.' };
    }
    
    // 글 목록 추출 시뮬레이션
    if (script.includes('logNo=')) {
      return { 
        result: [
          {
            title: '모의 글 1',
            logNo: '123456789',
            url: 'https://blog.naver.com/PostView.naver?blogId=highk27&logNo=123456789',
            categoryNo: '54',
            index: 1
          }
        ]
      };
    }
    
    return { result: null };
  }
}

// 실제 수집 시작
async function startCollection() {
  console.log('🚀 포즈랑의 투자이야기 블로그 내용 수집 시작');
  console.log('⚠️  현재는 MOCK 모드로 실행됩니다.');
  console.log('📝 실제 수집을 위해서는 Playwright를 활성화해야 합니다.\n');
  
  const playwright = new PlaywrightMock();
  
  try {
    const result = await collectBlogContent(playwright);
    console.log('\n✅ 수집 작업 완료!');
    return result;
  } catch (error) {
    console.error('\n❌ 수집 중 오류 발생:', error);
    throw error;
  }
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  startCollection()
    .then(() => {
      console.log('\n🎉 모든 작업이 완료되었습니다!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

export { startCollection };
