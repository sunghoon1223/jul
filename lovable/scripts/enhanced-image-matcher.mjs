#!/usr/bin/env node

/**
 * Enhanced Image Matcher - JPCaster UI Image Import Fix
 * 향상된 이미지 매칭으로 UI 표시 문제 해결
 * Author: Claude Desktop
 * Date: 2025-07-15
 */

import fs from 'fs/promises';
import path from 'path';

// Sentry Mock (임시 - @sentry/node 설치 후 제거)
const Sentry = {
  addBreadcrumb: () => {},
  captureException: (error) => console.error('Error:', error),
  captureMessage: (msg, opts) => console.log('Sentry Message:', msg),
  setContext: () => {},
  startTransaction: () => ({ finish: () => {} }),
  getCurrentScope: () => ({ setSpan: () => {} })
};

const CONFIG = {
  PRODUCTS_FILE: './src/data/products.json',
  IMAGES_DIR: './public/images',
  BACKUP_DIR: './backups',
  MIN_SIMILARITY: 0.7,
  LOG_LEVEL: 'info'
};

class EnhancedImageMatcher {
  constructor() {
    this.stats = {
      total: 0,
      matched: 0,
      failed: 0,
      improved: 0
    };
  }

  /**
   * 🔥 고급 문자열 유사도 계산 (Levenshtein + Jaro-Winkler)
   */
  calculateSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;
    
    // ABUI 패턴 정확 매칭 우선
    const abui1 = this.extractABUIPattern(str1);
    const abui2 = this.extractABUIPattern(str2);
    
    if (abui1 && abui2) {
      return abui1 === abui2 ? 1.0 : this.jaroWinklerSimilarity(abui1, abui2);
    }
    
    return this.jaroWinklerSimilarity(str1.toLowerCase(), str2.toLowerCase());
  }

  /**
   * 🎯 ABUI 패턴 추출 (정밀도 향상)
   */
  extractABUIPattern(url) {
    if (!url) return null;
    
    // 다양한 ABUI 패턴 매칭
    const patterns = [
      /ABUI[A-Z0-9]{30,}/gi,
      /ABUI[A-Za-z0-9_-]{20,}/gi,
      /ABUI[A-Za-z0-9]+/gi
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[0];
    }
    
    return null;
  }

  /**
   * 🧮 Jaro-Winkler 유사도 계산
   */
  jaroWinklerSimilarity(s1, s2) {
    if (s1 === s2) return 1.0;
    
    const len1 = s1.length;
    const len2 = s2.length;
    
    if (len1 === 0 || len2 === 0) return 0.0;
    
    const matchWindow = Math.floor(Math.max(len1, len2) / 2) - 1;
    if (matchWindow < 0) return 0.0;
    
    const s1Matches = new Array(len1).fill(false);
    const s2Matches = new Array(len2).fill(false);
    
    let matches = 0;
    let transpositions = 0;
    
    // Find matches
    for (let i = 0; i < len1; i++) {
      const start = Math.max(0, i - matchWindow);
      const end = Math.min(i + matchWindow + 1, len2);
      
      for (let j = start; j < end; j++) {
        if (s2Matches[j] || s1[i] !== s2[j]) continue;
        s1Matches[i] = s2Matches[j] = true;
        matches++;
        break;
      }
    }
    
    if (matches === 0) return 0.0;
    
    // Count transpositions
    let k = 0;
    for (let i = 0; i < len1; i++) {
      if (!s1Matches[i]) continue;
      while (!s2Matches[k]) k++;
      if (s1[i] !== s2[k]) transpositions++;
      k++;
    }
    
    const jaro = (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3;
    
    // Winkler modification
    let prefix = 0;
    for (let i = 0; i < Math.min(len1, len2, 4); i++) {
      if (s1[i] === s2[i]) prefix++;
      else break;
    }
    
    return jaro + (0.1 * prefix * (1 - jaro));
  }

  /**
   * 🔍 이미지 파일 목록 스캔
   */
  async scanImageFiles() {
    try {
      const files = await fs.readdir(CONFIG.IMAGES_DIR);
      return files.filter(file => 
        /\.(jpg|jpeg|png|webp|gif)$/i.test(file) && 
        file.startsWith('ABUI')
      );
    } catch (error) {
      Sentry.captureException(error);
      console.error('❌ 이미지 디렉토리 스캔 실패:', error.message);
      return [];
    }
  }

  /**
   * 🎯 제품과 이미지 매칭 (향상된 알고리즘)
   */
  findBestMatch(product, imageFiles) {
    if (!product.original_url) return null;
    
    const originalPattern = this.extractABUIPattern(product.original_url);
    if (!originalPattern) return null;
    
    let bestMatch = null;
    let bestScore = 0;
    
    for (const imageFile of imageFiles) {
      const filePattern = this.extractABUIPattern(imageFile);
      if (!filePattern) continue;
      
      // 1. 정확 매칭 (최우선)
      if (originalPattern === filePattern) {
        return {
          file: imageFile,
          confidence: 1.0,
          method: 'exact_match',
          pattern: originalPattern
        };
      }
      
      // 2. 유사도 매칭
      const similarity = this.calculateSimilarity(originalPattern, filePattern);
      if (similarity > bestScore && similarity >= CONFIG.MIN_SIMILARITY) {
        bestScore = similarity;
        bestMatch = {
          file: imageFile,
          confidence: similarity,
          method: 'similarity_match',
          pattern: filePattern
        };
      }
    }
    
    return bestMatch;
  }

  /**
   * 💾 백업 생성
   */
  async createBackup(products) {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const backupPath = path.join(CONFIG.BACKUP_DIR, `products-enhanced-${timestamp}.json`);
    
    await fs.mkdir(CONFIG.BACKUP_DIR, { recursive: true });
    await fs.writeFile(backupPath, JSON.stringify(products, null, 2));
    
    console.log(`📦 백업 생성: ${backupPath}`);
    return backupPath;
  }

  /**
   * 🚀 메인 매칭 프로세스
   */
  async runEnhancedMatching() {
    console.log('🔥 Enhanced Image Matcher 시작...\n');
    
    try {
      // 1. 데이터 로드
      console.log('📁 데이터 로딩...');
      const [productsData, imageFiles] = await Promise.all([
        fs.readFile(CONFIG.PRODUCTS_FILE, 'utf-8').then(JSON.parse),
        this.scanImageFiles()
      ]);
      
      console.log(`✅ 제품: ${productsData.length}개, 이미지: ${imageFiles.length}개 발견\n`);
      
      // 2. 백업 생성
      await this.createBackup(productsData);
      
      // 3. 매칭 실행
      console.log('🎯 향상된 매칭 시작...');
      this.stats.total = productsData.length;
      
      for (const product of productsData) {
        const currentImage = product.main_image_url;
        
        // 이미 로컬 이미지가 매칭된 경우 스킵
        if (currentImage && currentImage.startsWith('/images/ABUI')) {
          continue;
        }
        
        const match = this.findBestMatch(product, imageFiles);
        
        if (match) {
          const newImagePath = `/images/${match.file}`;
          
          // 제품 정보 업데이트
          product.main_image_url = newImagePath;
          product.image_urls = [newImagePath];
          product.updated_at = new Date().toISOString();
          product.match_info = {
            confidence: match.confidence,
            method: match.method,
            matched_file: match.file,
            original_extracted: this.extractABUIPattern(product.original_url),
            reason: 'enhanced_matching',
            timestamp: new Date().toISOString()
          };
          
          this.stats.matched++;
          this.stats.improved++;
          
          console.log(`✅ ${product.name} → ${match.file} (${(match.confidence * 100).toFixed(1)}%)`);
        } else {
          this.stats.failed++;
          console.log(`❌ ${product.name} - 매칭 실패`);
        }
      }
      
      // 4. 결과 저장
      console.log('\n💾 결과 저장 중...');
      await fs.writeFile(CONFIG.PRODUCTS_FILE, JSON.stringify(productsData, null, 2));
      
      // 5. 통계 출력
      this.printResults();
      
      return {
        success: true,
        stats: this.stats,
        productsFile: CONFIG.PRODUCTS_FILE
      };
      
    } catch (error) {
      Sentry.captureException(error);
      console.error('💥 Enhanced Matching 실패:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 📊 결과 출력
   */
  printResults() {
    const successRate = ((this.stats.matched / this.stats.total) * 100).toFixed(1);
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 Enhanced Image Matching 완료!');
    console.log('='.repeat(50));
    console.log(`📊 총 제품: ${this.stats.total}개`);
    console.log(`✅ 매칭 성공: ${this.stats.matched}개`);
    console.log(`🔄 새로 개선: ${this.stats.improved}개`);
    console.log(`❌ 매칭 실패: ${this.stats.failed}개`);
    console.log(`📈 성공률: ${successRate}%`);
    console.log('='.repeat(50));
    
    if (this.stats.improved > 0) {
      console.log('🚀 UI에서 즉시 확인 가능합니다!');
      console.log('💻 개발 서버: npm run dev');
    }
  }
}

// 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  const matcher = new EnhancedImageMatcher();
  matcher.runEnhancedMatching()
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 실행 실패:', error);
      process.exit(1);
    });
}

export default EnhancedImageMatcher;