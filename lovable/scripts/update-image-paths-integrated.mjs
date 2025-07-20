#!/usr/bin/env node

// 🚀 JPCaster 통합 이미지 경로 업데이트 실행 스크립트
// Sentry 통합 + 실시간 매칭 실행
// 사용법: node scripts/update-image-paths-integrated.mjs

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { IntelligentImageMatcher, CONFIG } from './intelligent-image-matcher.mjs';

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

// 📊 통합 실행 엔진
class IntegratedImagePathUpdater {
  constructor() {
    this.matcher = new IntelligentImageMatcher();
    this.backupPath = null;
    this.stats = {
      original_external_urls: 0,
      matched_to_local: 0,
      set_to_placeholder: 0,
      already_local: 0,
      processing_time: 0
    };
  }

  // 🔄 백업 생성
  async createBackup(products) {
    try {
      console.log('💾 원본 데이터 백업 중...');
      
      await fs.mkdir(path.join(ROOT_DIR, 'backups'), { recursive: true });
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      this.backupPath = path.join(ROOT_DIR, 'backups', `products-backup-${timestamp}.json`);
      
      await fs.writeFile(this.backupPath, JSON.stringify(products, null, 2));
      console.log(`✅ 백업 완료: ${this.backupPath}`);
      
      Sentry.addBreadcrumb({
        message: 'Backup created',
        data: { backup_path: this.backupPath },
        level: 'info'
      });
      
    } catch (error) {
      console.error('❌ 백업 실패:', error);
      Sentry.captureException(error);
      throw error;
    }
  }

  // 🎯 제품별 이미지 경로 분석 및 업데이트
  async processProductImages(products, localImages) {
    console.log('🔍 제품별 이미지 경로 분석 시작...');
    
    const updatedProducts = [];
    
    for (const product of products) {
      try {
        const updatedProduct = await this.processProductImage(product, localImages);
        updatedProducts.push(updatedProduct);
      } catch (error) {
        console.error(`❌ 제품 ${product.id} 처리 실패:`, error);
        Sentry.captureException(error, {
          tags: { product_id: product.id }
        });
        updatedProducts.push(product); // 원본 데이터 유지
      }
    }
    
    return updatedProducts;
  }

  // 🔧 개별 제품 이미지 처리
  async processProductImage(product, localImages) {
    const { id, main_image_url, image_urls } = product;
    
    // 이미 로컬 경로인 경우
    if (!main_image_url || main_image_url.startsWith('/images/')) {
      this.stats.already_local++;
      console.log(`⏭️  ${id}: 이미 로컬 경로`);
      return product;
    }
    
    // 외부 URL인 경우 매칭 시도
    if (main_image_url.includes('jpcaster.cn') || main_image_url.startsWith('http')) {
      this.stats.original_external_urls++;
      
      // 파일명 추출
      const extractedName = this.matcher.extractCleanFilename(main_image_url);
      if (!extractedName) {
        return this.setPlaceholderImage(product, 'filename_extraction_failed');
      }
      
      // 매칭 시도
      const match = this.matcher.findBestMatch(extractedName, localImages);
      if (match && match.confidence > 0.8) {
        return this.setLocalImage(product, match.file, main_image_url, match);
      } else {
        return this.setPlaceholderImage(product, 'no_suitable_match');
      }
    }
    
    // 기타 경우 placeholder 설정
    return this.setPlaceholderImage(product, 'unsupported_url_format');
  }

  // ✅ 로컬 이미지로 설정
  setLocalImage(product, localFile, originalUrl, matchInfo) {
    this.stats.matched_to_local++;
    
    const localPath = `/images/${localFile}`;
    const updatedProduct = {
      ...product,
      main_image_url: localPath,
      image_urls: [localPath],
      original_url: originalUrl, // 원본 URL 보존
      updated_at: new Date().toISOString()
    };
    
    console.log(`✅ ${product.id}: ${localFile} (${Math.round(matchInfo.confidence * 100)}%)`);
    
    Sentry.addBreadcrumb({
      message: 'Image matched to local file',
      data: {
        product_id: product.id,
        local_file: localFile,
        confidence: matchInfo.confidence,
        method: matchInfo.method
      },
      level: 'info'
    });
    
    return updatedProduct;
  }

  // 🔄 플레이스홀더로 설정
  setPlaceholderImage(product, reason) {
    this.stats.set_to_placeholder++;
    
    const updatedProduct = {
      ...product,
      main_image_url: '/images/placeholder.svg',
      image_urls: ['/images/placeholder.svg'],
      original_url: product.main_image_url, // 원본 URL 보존
      placeholder_reason: reason,
      updated_at: new Date().toISOString()
    };
    
    console.log(`🔄 ${product.id}: placeholder.svg (${reason})`);
    
    Sentry.addBreadcrumb({
      message: 'Image set to placeholder',
      data: {
        product_id: product.id,
        reason: reason
      },
      level: 'warning'
    });
    
    return updatedProduct;
  }

  // 📈 최종 리포트 생성
  generateReport() {
    const report = {
      summary: {
        total_products: this.stats.original_external_urls + this.stats.already_local,
        original_external_urls: this.stats.original_external_urls,
        matched_to_local: this.stats.matched_to_local,
        set_to_placeholder: this.stats.set_to_placeholder,
        already_local: this.stats.already_local,
        success_rate: Math.round((this.stats.matched_to_local / this.stats.original_external_urls) * 100) || 0
      },
      backup_info: {
        backup_created: !!this.backupPath,
        backup_path: this.backupPath
      },
      timestamp: new Date().toISOString()
    };
    
    // Sentry에 최종 결과 전송
    Sentry.setContext('update_results', report.summary);
    Sentry.captureMessage(`Image path update completed: ${report.summary.success_rate}% success rate`, {
      level: report.summary.success_rate > 70 ? 'info' : 'warning'
    });
    
    return report;
  }
}

// 🚀 메인 실행 함수
async function main() {
  console.log('🚀 JPCaster 통합 이미지 경로 업데이트 시작...');
  
  try {
    // Sentry 트랜잭션 시작
    const transaction = Sentry.startTransaction({
      name: "integrated_image_path_update",
      op: "update"
    });
    
    Sentry.getCurrentScope().setSpan(transaction);
    
    const updater = new IntegratedImagePathUpdater();
    
    // 1. 데이터 로드
    console.log('📂 데이터 로딩 중...');
    const [products, localImages] = await Promise.all([
      fs.readFile(CONFIG.PRODUCTS_FILE, 'utf8').then(JSON.parse),
      updater.matcher.scanLocalImages()
    ]);
    
    console.log(`📊 분석 대상: ${products.length}개 제품, ${localImages.length}개 로컬 이미지`);
    
    // 2. 백업 생성
    await updater.createBackup(products);
    
    // 3. 이미지 경로 업데이트 실행
    console.log('🔄 이미지 경로 업데이트 실행 중...');
    const startTime = Date.now();
    
    const updatedProducts = await updater.processProductImages(products, localImages);
    
    updater.stats.processing_time = (Date.now() - startTime) / 1000;
    
    // 4. 결과 저장
    console.log('💾 업데이트된 데이터 저장 중...');
    await fs.writeFile(CONFIG.PRODUCTS_FILE, JSON.stringify(updatedProducts, null, 2));
    
    // 5. 리포트 생성 및 출력
    const report = updater.generateReport();
    
    console.log('\\n📊 === 통합 업데이트 리포트 ===');
    console.log(`📦 전체 제품: ${report.summary.total_products}개`);
    console.log(`🌐 외부 URL: ${report.summary.original_external_urls}개`);
    console.log(`✅ 로컬 매칭: ${report.summary.matched_to_local}개`);
    console.log(`🔄 플레이스홀더: ${report.summary.set_to_placeholder}개`);
    console.log(`📍 이미 로컬: ${report.summary.already_local}개`);
    console.log(`📈 매칭 성공률: ${report.summary.success_rate}%`);
    console.log(`⏱️  처리 시간: ${Math.round(report.stats.processing_time)}초`);
    console.log(`💾 백업 파일: ${report.backup_info.backup_path}`);
    
    // 6. 리포트 파일 저장
    const reportPath = path.join(ROOT_DIR, 'logs', `integrated-update-${Date.now()}.json`);
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 상세 리포트: ${reportPath}`);
    
    transaction.finish();
    console.log('🎉 통합 업데이트 완료!');
    
    // 성공률이 낮은 경우 경고
    if (report.summary.success_rate < 70) {
      console.log('\\n⚠️  매칭 성공률이 낮습니다. 다음을 확인해주세요:');
      console.log('   - 로컬 이미지 파일명이 올바른지 확인');
      console.log('   - public/images/ 디렉토리에 이미지가 있는지 확인');
      console.log('   - URL 패턴이 예상과 일치하는지 확인');
    }
    
    return report;
    
  } catch (error) {
    console.error('💥 통합 업데이트 실패:', error);
    Sentry.captureException(error);
    process.exit(1);
  }
}

// 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { IntegratedImagePathUpdater };
