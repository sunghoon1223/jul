import { chromium } from 'playwright';

async function finalTest() {
  console.log('🎯 Studio-sb.com 최종 테스트 시작...\n');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  let successCount = 0;
  let errorCount = 0;
  
  // 네트워크 요청 모니터링
  page.on('response', response => {
    const status = response.status();
    if (status >= 400) {
      errorCount++;
    } else {
      successCount++;
    }
  });
  
  try {
    console.log('📍 사이트 접속 중...');
    await page.goto('https://studio-sb.com', { waitUntil: 'networkidle' });
    
    // 페이지 기본 요소 확인
    const title = await page.title();
    console.log(`📄 페이지 타이틀: ${title}`);
    
    // Hero 섹션 확인
    const heroVisible = await page.isVisible('.hero, [class*="hero"], .bg-gradient');
    console.log(`🦸 Hero 섹션: ${heroVisible ? '✅ 표시됨' : '❌ 없음'}`);
    
    // 네비게이션 확인
    const navVisible = await page.isVisible('nav, .navbar, header');
    console.log(`🧭 네비게이션: ${navVisible ? '✅ 표시됨' : '❌ 없음'}`);
    
    // 제품 카드 확인
    const productCards = await page.$$eval('[class*="product"], [class*="card"]', cards => cards.length);
    console.log(`🛍️ 제품 카드 수: ${productCards}개`);
    
    // 이미지 로딩 확인
    const images = await page.$$eval('img', imgs => 
      imgs.map(img => ({
        src: img.src,
        loaded: img.complete && img.naturalHeight > 0
      }))
    );
    
    const loadedImages = images.filter(img => img.loaded).length;
    const totalImages = images.length;
    
    console.log(`🖼️ 이미지 로딩: ${loadedImages}/${totalImages} (${Math.round(loadedImages/totalImages*100)}%)`);
    
    // 주요 Supabase 이미지 확인
    const supabaseImages = images.filter(img => img.src.includes('supabase')).length;
    console.log(`☁️ Supabase 이미지: ${supabaseImages}개`);
    
    // 스크린샷 저장
    await page.screenshot({ path: 'final-test.png', fullPage: true });
    console.log(`📸 스크린샷 저장: final-test.png`);
    
    console.log(`\n🎯 최종 결과:`);
    console.log(`✅ 성공 요청: ${successCount}`);
    console.log(`❌ 실패 요청: ${errorCount}`);
    console.log(`📊 성공률: ${Math.round(successCount/(successCount+errorCount)*100)}%`);
    
    const isWorking = heroVisible && navVisible && productCards > 0 && loadedImages > totalImages * 0.7;
    console.log(`\n🏆 사이트 상태: ${isWorking ? '✅ 정상 작동' : '⚠️ 부분 작동'}`);
    
    if (isWorking) {
      console.log('🎉 배포 성공! 이미지 문제가 해결되었습니다.');
    }
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
  }
  
  await browser.close();
  console.log('\n✅ 최종 테스트 완료');
}

finalTest().catch(console.error);