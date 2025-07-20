#!/usr/bin/env node

// 🚀 JPCaster 지능적 이미지 파일명 매칭 스크립트 v2.0
// Sentry 디버깅 통합 버전
// 사용법: 
//   npm run match-images        # 매칭 실행
//   npm run verify-images       # 검증 모드

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Sentry 설정 (Node.js 환경) - 임시로 비활성화
// import * as Sentry from '@sentry/node';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

// Sentry 초기화 (임시로 비활성화)
// Sentry.init({
//   dsn: process.env.SENTRY_DSN || "https://your-dsn@sentry.io/project-id",
//   environment: process.env.NODE_ENV || "development",
//   debug: process.env.NODE_ENV !== "production",
//   tracesSampleRate: 1.0,
// });

// Mock Sentry functions for temporary use
const Sentry = {
  addBreadcrumb: () => {},
  captureException: (error) => console.error('Error:', error),
  captureMessage: (msg, opts) => console.log('Sentry Message:', msg),
  setContext: () => {},
  startTransaction: () => ({ finish: () => {} }),
  getCurrentScope: () => ({ setSpan: () => {} })
};

// 📊 설정 상수
const CONFIG = {
  PRODUCTS_FILE: path.join(ROOT_DIR, 'src/data/products.json'),
  IMAGES_DIR: path.join(ROOT_DIR, 'public/images'),
  BACKUP_DIR: path.join(ROOT_DIR, 'backups'),
  LOG_FILE: path.join(ROOT_DIR, 'logs/image-matching.log'),
  
  // 매칭 옵션
  SUPPORTED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
  BATCH_SIZE: 50,
  SIMILARITY_THRESHOLD: 0.8
};

// 🎯 핵심 매칭 엔진
class IntelligentImageMatcher {
  constructor() {
    this.stats = {
      total: 0,
      matched: 0,
      failed: 0,
      skipped: 0,
      start_time: Date.now()
    };
    this.results = [];
    this.errors = [];
  }

  // 🔍 URL에서 정확한 파일명 추출
  extractCleanFilename(url) {
    try {
      // JPCaster URL 패턴 분석
      // 예: http://www.jpcaster.cn//25412776.s21i.faiusr.com/2/ABUIABACGAAg8t_yogYo9ufU4wIwxgM41AI.png
      
      // 1. ABUI로 시작하는 패턴 추출
      const abuiMatch = url.match(/ABUI[A-Za-z0-9_-]+/);
      if (!abuiMatch) return null;
      
      // 2. 확장자 추출 (우선순위: 원본 확장자)
      const extMatch = url.match(/\.(jpg|jpeg|png|gif|webp)(!\\d+x\\d+)?$/i);
      const ext = extMatch ? `.${extMatch[1].toLowerCase()}` : '.jpg';
      
      // 3. 크기 수정자 제거 (!300x300 등)
      const cleanName = abuiMatch[0];
      
      return `${cleanName}${ext}`;
    } catch (error) {
      Sentry.captureException(error, {
        tags: { function: 'extractCleanFilename' },
        extra: { url }
      });
      return null;
    }
  }

  // 📁 로컬 이미지 파일 스캔
  async scanLocalImages() {
    try {
      console.log('📁 로컬 이미지 스캔 중...');
      
      const files = await fs.readdir(CONFIG.IMAGES_DIR);
      const imageFiles = files.filter(file => 
        CONFIG.SUPPORTED_EXTENSIONS.some(ext => 
          file.toLowerCase().endsWith(ext)
        )
      );
      
      console.log(`✅ ${imageFiles.length}개 로컬 이미지 발견`);
      
      Sentry.addBreadcrumb({
        message: 'Local images scanned',
        data: { count: imageFiles.length },
        level: 'info'
      });
      
      return imageFiles;
    } catch (error) {
      console.error('❌ 로컬 이미지 스캔 실패:', error);
      Sentry.captureException(error);
      throw error;
    }
  }

  // 🎯 지능적 파일 매칭 알고리즘
  findBestMatch(extractedName, localFiles) {
    if (!extractedName) return null;
    
    // 1. 정확 매칭 (확장자 포함)
    let exactMatch = localFiles.find(file => file === extractedName);
    if (exactMatch) {
      return { file: exactMatch, confidence: 1.0, method: 'exact' };
    }
    
    // 2. 파일명 매칭 (확장자 제외)
    const nameWithoutExt = extractedName.replace(/\.[^.]+$/, '');
    const nameMatch = localFiles.find(file => {
      const localNameWithoutExt = file.replace(/\.[^.]+$/, '');
      return localNameWithoutExt === nameWithoutExt;
    });
    
    if (nameMatch) {
      return { file: nameMatch, confidence: 0.9, method: 'name_match' };
    }
    
    // 3. 부분 문자열 매칭 (고급)
    const partialMatches = localFiles
      .map(file => {
        const similarity = this.calculateSimilarity(nameWithoutExt, file.replace(/\.[^.]+$/, ''));
        return { file, similarity };
      })
      .filter(match => match.similarity > CONFIG.SIMILARITY_THRESHOLD)
      .sort((a, b) => b.similarity - a.similarity);
    
    if (partialMatches.length > 0) {
      const best = partialMatches[0];
      return { 
        file: best.file, 
        confidence: best.similarity, 
        method: 'partial_match' 
      };
    }
    
    return null;
  }

  // 📐 문자열 유사도 계산 (Levenshtein 거리 기반)
  calculateSimilarity(str1, str2) {
    const matrix = [];
    const len1 = str1.length;
    const len2 = str2.length;
    
    if (len1 === 0) return len2 === 0 ? 1 : 0;
    if (len2 === 0) return 0;
    
    // 동적 프로그래밍 매트릭스 초기화
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }
    
    // Levenshtein 거리 계산
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,     // 삭제
          matrix[i][j - 1] + 1,     // 삽입
          matrix[i - 1][j - 1] + cost // 치환
        );
      }
    }
    
    const distance = matrix[len1][len2];
    const maxLen = Math.max(len1, len2);
    return 1 - (distance / maxLen);
  }

  // 🔄 배치 처리로 제품 매칭
  async processProducts(products, localImages) {
    console.log(`🔄 ${products.length}개 제품 배치 처리 시작...`);
    
    for (let i = 0; i < products.length; i += CONFIG.BATCH_SIZE) {
      const batch = products.slice(i, i + CONFIG.BATCH_SIZE);
      console.log(`📦 배치 ${Math.floor(i / CONFIG.BATCH_SIZE) + 1}: ${batch.length}개 제품 처리 중...`);
      
      for (const product of batch) {
        await this.processProduct(product, localImages);
      }
      
      // 배치 간 잠시 대기 (메모리 최적화)
      if (i + CONFIG.BATCH_SIZE < products.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  // 🎯 개별 제품 처리
  async processProduct(product, localImages) {
    this.stats.total++;
    
    try {
      const { id, main_image_url } = product;
      
      // 이미 로컬 경로인 경우 스킵
      if (!main_image_url || main_image_url.startsWith('/images/') || main_image_url.startsWith('./')) {
        this.stats.skipped++;
        return;
      }
      
      // 파일명 추출
      const extractedName = this.extractCleanFilename(main_image_url);
      if (!extractedName) {
        this.logFailure(id, main_image_url, 'filename_extraction_failed');
        return;
      }
      
      // 매칭 시도
      const match = this.findBestMatch(extractedName, localImages);
      if (match) {
        const localPath = `/images/${match.file}`;
        
        // 제품 데이터 업데이트
        product.main_image_url = localPath;
        if (product.image_urls && product.image_urls[0] === main_image_url) {
          product.image_urls[0] = localPath;
        }
        
        this.logSuccess(id, main_image_url, match.file, match.confidence, match.method);
        this.stats.matched++;
      } else {
        this.logFailure(id, main_image_url, 'no_local_match_found');
      }
      
    } catch (error) {
      this.logError(product.id, error);
    }
  }

  // 📊 성공 로깅
  logSuccess(productId, originalUrl, matchedFile, confidence, method) {
    const result = {
      product_id: productId,
      original_url: originalUrl,
      matched_file: matchedFile,
      confidence,
      method,
      timestamp: new Date().toISOString()
    };
    
    this.results.push(result);
    
    console.log(`✅ ${productId}: ${matchedFile} (${Math.round(confidence * 100)}%, ${method})`);
    
    Sentry.addBreadcrumb({
      message: 'Image matched successfully',
      category: 'image_matching',
      data: result,
      level: 'info'
    });
  }

  // ❌ 실패 로깅
  logFailure(productId, originalUrl, reason) {
    this.stats.failed++;
    
    const error = {
      product_id: productId,
      original_url: originalUrl,
      reason,
      timestamp: new Date().toISOString()
    };
    
    this.errors.push(error);
    
    console.log(`❌ ${productId}: ${reason}`);
    
    Sentry.captureMessage(`Image matching failed: ${reason}`, {
      level: 'warning',
      tags: { product_id: productId },
      extra: { original_url: originalUrl }
    });
  }

  // 🚨 에러 로깅
  logError(productId, error) {
    this.stats.failed++;
    console.error(`🚨 ${productId}:`, error.message);
    
    Sentry.captureException(error, {
      tags: { product_id: productId }
    });
  }

  // 📈 최종 리포트 생성
  generateReport() {
    const duration = (Date.now() - this.stats.start_time) / 1000;
    const successRate = Math.round((this.stats.matched / this.stats.total) * 100) || 0;
    
    const report = {
      summary: {
        total_products: this.stats.total,
        matched: this.stats.matched,
        failed: this.stats.failed,
        skipped: this.stats.skipped,
        success_rate: successRate,
        duration_seconds: Math.round(duration)
      },
      performance: {
        products_per_second: Math.round(this.stats.total / duration),
        avg_processing_time: Math.round(duration / this.stats.total * 1000) + 'ms'
      },
      results: this.results,
      errors: this.errors
    };
    
    // Sentry에 최종 결과 전송
    Sentry.setContext('matching_results', report.summary);
    Sentry.captureMessage(`Image matching completed: ${successRate}% success rate`, {
      level: successRate > 80 ? 'info' : 'warning'
    });
    
    return report;
  }
}

// 🚀 메인 실행 함수
async function main() {
  const isVerifyMode = process.argv.includes('--verify');
  
  console.log('🚀 JPCaster 지능적 이미지 매칭 시작...');
  console.log(`📋 모드: ${isVerifyMode ? '검증' : '매칭'}`);
  
  try {
    // Sentry 트랜잭션 시작
    const transaction = Sentry.startTransaction({
      name: "image_matching_process",
      op: isVerifyMode ? "verify" : "match"
    });
    
    Sentry.getCurrentScope().setSpan(transaction);
    
    const matcher = new IntelligentImageMatcher();
    
    // 데이터 로드
    console.log('📂 데이터 로딩 중...');
    const [products, localImages] = await Promise.all([
      fs.readFile(CONFIG.PRODUCTS_FILE, 'utf8').then(JSON.parse),
      matcher.scanLocalImages()
    ]);
    
    if (isVerifyMode) {
      // 검증 모드: 매칭 결과 분석
      console.log('🔍 매칭 결과 검증 중...');
      const matchedCount = products.filter(p => 
        p.main_image_url && p.main_image_url.startsWith('/images/')
      ).length;
      
      console.log(`📊 검증 결과:`);
      console.log(`   - 전체 제품: ${products.length}개`);
      console.log(`   - 로컬 매칭: ${matchedCount}개`);
      console.log(`   - 매칭률: ${Math.round(matchedCount / products.length * 100)}%`);
      
    } else {
      // 매칭 모드: 실제 매칭 실행
      await matcher.processProducts(products, localImages);
      
      // 결과 저장
      await fs.writeFile(
        CONFIG.PRODUCTS_FILE, 
        JSON.stringify(products, null, 2)
      );
      
      // 리포트 생성
      const report = matcher.generateReport();
      
      // 리포트 출력
      console.log('\\n📊 === 최종 리포트 ===');
      console.log(`✅ 처리 완료: ${report.summary.total_products}개`);
      console.log(`🎯 매칭 성공: ${report.summary.matched}개`);
      console.log(`❌ 매칭 실패: ${report.summary.failed}개`);
      console.log(`⏭️  건너뛰기: ${report.summary.skipped}개`);
      console.log(`📈 성공률: ${report.summary.success_rate}%`);
      console.log(`⏱️  소요시간: ${report.summary.duration_seconds}초`);
      console.log(`⚡ 처리속도: ${report.performance.products_per_second}/초`);
      
      // 리포트 파일 저장
      const reportPath = path.join(ROOT_DIR, 'logs', `image-matching-${Date.now()}.json`);
      await fs.mkdir(path.dirname(reportPath), { recursive: true });
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
      console.log(`💾 상세 리포트 저장: ${reportPath}`);
    }
    
    transaction.finish();
    console.log('🎉 작업 완료!');
    
  } catch (error) {
    console.error('💥 실행 실패:', error);
    Sentry.captureException(error);
    process.exit(1);
  }
}

// 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { IntelligentImageMatcher, CONFIG };
