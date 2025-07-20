import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 프로젝트 루트 경로
const projectRoot = path.join(__dirname, '..');
const outputDir = path.join(projectRoot, 'crawled_data', 'blog_contents');

// README에서 언급된 추가 수집 필요한 categoryNo들
const additionalCategories = {
  "제2부_투자여정": [54, 55, 58, 59, 61, 62, 68, 69, 70, 71, 73, 74, 77, 78],
  "제3부_번외편": [56, 60, 64, 65, 72, 75, 76]
};

// 현재까지 수집된 글 목록 로드
function loadExistingPosts() {
  try {
    const existingData = fs.readFileSync(
      path.join(projectRoot, 'crawled_data', 'blog_posts_list.json'), 
      'utf8'
    );
    return JSON.parse(existingData);
  } catch (error) {
    console.log('기존 글 목록을 로드할 수 없습니다:', error.message);
    return { posts: [] };
  }
}

// 특정 categoryNo의 글 URL 생성
function generatePostUrl(categoryNo, page = 1) {
  return `https://blog.naver.com/highk27?categoryNo=${categoryNo}&page=${page}`;
}

// 개별 글 URL 생성 (logNo 기반)
function generateIndividualPostUrl(logNo) {
  return `https://blog.naver.com/PostView.naver?blogId=highk27&logNo=${logNo}`;
}

// 지연 함수 (차단 방지)
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 글 내용 추출 함수
async function extractPostContent(url, playwright) {
  try {
    console.log(`글 내용 수집 중: ${url}`);
    
    await playwright.playwright_navigate({ url });
    await delay(2000); // 페이지 로딩 대기
    
    // 제목 추출
    const titleScript = `
      const titleElement = document.querySelector('.se-title-text, .pcol1 .itemSubjectBoldfont, h3.itemSubjectBoldfont');
      titleElement ? titleElement.textContent.trim() : '';
    `;
    const titleResult = await playwright.playwright_evaluate({ script: titleScript });
    const title = titleResult?.result || '';
    
    // 본문 내용 추출 (HTML 포함)
    const contentHtml = await playwright.playwright_get_visible_html({
      selector: '.se-main-container, .se-component, .pcol1, .blog-content',
      removeScripts: true,
      removeComments: true,
      maxLength: 50000
    });
    
    // 텍스트 내용 추출
    const contentText = await playwright.playwright_get_visible_text();
    
    // 작성일 추출
    const dateScript = `
      const dateElement = document.querySelector('.se-publishDate, .date, .blog_date');
      dateElement ? dateElement.textContent.trim() : '';
    `;
    const dateResult = await playwright.playwright_evaluate({ script: dateScript });
    const publishDate = dateResult?.result || '';
    
    return {
      title,
      url,
      contentHtml: contentHtml?.content || '',
      contentText: contentText?.content || '',
      publishDate,
      extractedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`글 내용 수집 실패 (${url}):`, error.message);
    return null;
  }
}

// 카테고리별 글 목록 수집
async function collectCategoryPosts(categoryNo, playwright) {
  try {
    const categoryUrl = generatePostUrl(categoryNo);
    console.log(`카테고리 ${categoryNo} 글 목록 수집 중...`);
    
    await playwright.playwright_navigate({ url: categoryUrl });
    await delay(3000);
    
    // 글 목록 추출
    const postsScript = `
      const posts = [];
      const postElements = document.querySelectorAll('a[href*="logNo="]');
      
      postElements.forEach((link, index) => {
        const href = link.href;
        const logNoMatch = href.match(/logNo=(\d+)/);
        const titleElement = link.querySelector('.itemSubjectBoldfont, .title');
        
        if (logNoMatch && titleElement) {
          posts.push({
            title: titleElement.textContent.trim(),
            logNo: logNoMatch[1],
            url: href,
            categoryNo: "${categoryNo}",
            index: index + 1
          });
        }
      });
      
      posts;
    `;
    
    const postsResult = await playwright.playwright_evaluate({ script: postsScript });
    return postsResult?.result || [];
    
  } catch (error) {
    console.error(`카테고리 ${categoryNo} 수집 실패:`, error.message);
    return [];
  }
}

// 메인 수집 함수
async function collectBlogContent(playwright) {
  console.log('🚀 블로그 내용 수집 시작...');
  
  // 출력 디렉토리 확인
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const allCollectedPosts = [];
  const existingPosts = loadExistingPosts();
  
  // 기존 글들 먼저 처리
  console.log('\n=== 기존 수집된 글들의 내용 수집 ===');
  for (const post of existingPosts.posts) {
    console.log(`처리 중: ${post.title}`);
    
    const content = await extractPostContent(post.url, playwright);
    if (content) {
      allCollectedPosts.push({
        ...post,
        ...content
      });
      
      // 개별 파일로 저장
      const filename = `${post.logNo}_${post.title.replace(/[^\w가-힣]/g, '_')}.json`;
      const filepath = path.join(outputDir, filename);
      fs.writeFileSync(filepath, JSON.stringify(content, null, 2), 'utf8');
      console.log(`✅ 저장됨: ${filename}`);
    }
    
    await delay(3000); // 요청 간 지연
  }
  
  // 추가 카테고리들 수집
  console.log('\n=== 추가 카테고리 글들 수집 ===');
  for (const [section, categoryNos] of Object.entries(additionalCategories)) {
    console.log(`\n--- ${section} 수집 시작 ---`);
    
    for (const categoryNo of categoryNos) {
      const categoryPosts = await collectCategoryPosts(categoryNo, playwright);
      
      for (const post of categoryPosts) {
        console.log(`처리 중: ${post.title} (categoryNo: ${categoryNo})`);
        
        const content = await extractPostContent(post.url, playwright);
        if (content) {
          allCollectedPosts.push({
            ...post,
            ...content,
            section
          });
          
          // 개별 파일로 저장
          const filename = `${post.logNo}_${post.title.replace(/[^\w가-힣]/g, '_')}.json`;
          const filepath = path.join(outputDir, filename);
          fs.writeFileSync(filepath, JSON.stringify(content, null, 2), 'utf8');
          console.log(`✅ 저장됨: ${filename}`);
        }
        
        await delay(3000); // 요청 간 지연
      }
      
      await delay(5000); // 카테고리 간 더 긴 지연
    }
  }
  
  // 전체 결과 저장
  const finalResult = {
    collectionDate: new Date().toISOString(),
    totalCollected: allCollectedPosts.length,
    posts: allCollectedPosts
  };
  
  const finalPath = path.join(projectRoot, 'crawled_data', 'blog_contents_complete.json');
  fs.writeFileSync(finalPath, JSON.stringify(finalResult, null, 2), 'utf8');
  
  console.log(`\n🎉 수집 완료! 총 ${allCollectedPosts.length}개 글 수집됨`);
  console.log(`📁 개별 파일: ${outputDir}`);
  console.log(`📄 통합 파일: ${finalPath}`);
  
  return finalResult;
}

// 스크립트가 직접 실행될 때
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('독립 실행 모드: Playwright 인스턴스가 필요합니다.');
  console.log('다른 스크립트에서 collectBlogContent(playwright) 함수를 import하여 사용하세요.');
}

export { collectBlogContent };
