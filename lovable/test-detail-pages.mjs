import { chromium } from 'playwright';

async function testDetailPages() {
  console.log('🔍 상세페이지 및 카테고리 페이지 테스트 시작...\n');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // 네트워크 요청 모니터링
  page.on('response', response => {
    const status = response.status();
    const url = response.url();
    
    if (status >= 400) {
      console.log(`❌ [${status}] ${url}`);
    } else if (url.includes('product') || url.includes('category')) {
      console.log(`✅ [${status}] ${url}`);
    }
  });
  
  // 콘솔 에러 모니터링
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`🚨 Console Error: ${msg.text()}`);
    }
  });
  
  try {
    console.log('📍 메인 페이지 접속...');
    await page.goto('https://studio-sb.com', { waitUntil: 'networkidle' });
    
    // 1. 카테고리 링크 찾기
    console.log('\n🏷️ 카테고리 링크 테스트...');
    
    const categoryLinks = await page.$$eval('a[href*="category"], a[href*="products"]', links =>
      links.map(link => ({
        text: link.textContent.trim(),
        href: link.href
      })).slice(0, 3) // 첫 3개만 테스트
    );
    
    console.log(`발견된 카테고리 링크: ${categoryLinks.length}개`);
    
    for (const link of categoryLinks) {
      console.log(`\n📂 카테고리 테스트: ${link.text}`);
      console.log(`🔗 URL: ${link.href}`);
      
      try {
        await page.goto(link.href, { waitUntil: 'networkidle', timeout: 10000 });
        
        const bodyText = await page.textContent('body');
        const isBlank = bodyText.trim().length < 50;
        
        console.log(`📄 페이지 상태: ${isBlank ? '❌ 빈 페이지' : '✅ 내용 있음'}`);
        
        if (!isBlank) {
          const productCount = await page.$$eval('[class*="product"], [class*="card"]', cards => cards.length);
          console.log(`🛍️ 제품 수: ${productCount}개`);
        }
        
        await page.screenshot({ path: `category-${link.text.replace(/[^a-zA-Z0-9]/g, '_')}.png` });
        
      } catch (error) {
        console.log(`❌ 카테고리 로딩 실패: ${error.message}`);
      }
    }
    
    // 2. 제품 상세 페이지 테스트
    console.log('\n🛍️ 제품 상세페이지 테스트...');
    
    await page.goto('https://studio-sb.com', { waitUntil: 'networkidle' });
    
    const productLinks = await page.$$eval('a[href*="product"], a[href*="detail"]', links =>
      links.map(link => ({
        text: link.textContent.trim(),
        href: link.href
      })).slice(0, 2) // 첫 2개만 테스트
    );
    
    console.log(`발견된 제품 링크: ${productLinks.length}개`);
    
    for (const link of productLinks) {
      console.log(`\n📦 제품 상세 테스트: ${link.text}`);
      console.log(`🔗 URL: ${link.href}`);
      
      try {
        await page.goto(link.href, { waitUntil: 'networkidle', timeout: 10000 });
        
        const bodyText = await page.textContent('body');
        const isBlank = bodyText.trim().length < 50;
        
        console.log(`📄 페이지 상태: ${isBlank ? '❌ 빈 페이지' : '✅ 내용 있음'}`);
        
        if (!isBlank) {
          // 이미지 확인
          const images = await page.$$eval('img', imgs => 
            imgs.map(img => ({
              src: img.src,
              loaded: img.complete && img.naturalHeight > 0
            }))
          );
          
          const loadedImages = images.filter(img => img.loaded).length;
          console.log(`🖼️ 이미지: ${loadedImages}/${images.length} 로드됨`);
          
          // Supabase 이미지 확인
          const supabaseImages = images.filter(img => img.src.includes('supabase')).length;
          console.log(`☁️ Supabase 이미지: ${supabaseImages}개`);
        }
        
        await page.screenshot({ path: `product-detail-${Date.now()}.png` });
        
      } catch (error) {
        console.log(`❌ 제품 상세 로딩 실패: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
  }
  
  await browser.close();
  console.log('\n✅ 상세페이지 테스트 완료');
}

testDetailPages().catch(console.error);