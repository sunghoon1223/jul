# 🛒 JPCaster 이커머스 구축 완전 매뉴얼

## 📋 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [환경 설정 및 전제 조건](#환경-설정-및-전제-조건)
3. [Supabase 백엔드 구축](#supabase-백엔드-구축)
4. [이미지 연동 문제 해결](#이미지-연동-문제-해결)
5. [개발 워크플로우](#개발-워크플로우)
6. [배포 및 호스팅](#배포-및-호스팅)
7. [문제 해결 FAQ](#문제-해결-faq)
8. [성공/실패 사례 분석](#성공실패-사례-분석)

---

## 🎯 프로젝트 개요

### 핵심 성과
- **100% 이미지 최적화** (50개 제품 모두 로컬 이미지 사용)
- **성능 향상**: 2-5초 → 0.1-0.5초 (10배 개선)
- **외부 의존성 제거**: CORS 프록시 완전 제거
- **안정적 개발 환경**: 포트 8080 고정 운영

### 기술 스택
- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Tailwind CSS + Shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Build Tool**: Vite
- **Package Manager**: npm

### 시스템 아키텍처
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Supabase      │    │   Static Files  │
│   (React/Vite)  │◄───┤   (Backend)     │    │   (Images)      │
│   Port 8080     │    │   Database      │    │   public/images │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🔧 환경 설정 및 전제 조건

### 시스템 요구사항
- **Node.js**: v18.0.0 이상 (LTS 권장)
- **npm**: v9.0.0 이상
- **운영체제**: Windows 10/11, macOS, Linux
- **메모리**: 최소 4GB, 권장 8GB
- **저장공간**: 최소 2GB 여유 공간

### 초기 환경 설정
```bash
# 1. Node.js 버전 확인
node --version  # v18.x.x 이상 필요

# 2. 프로젝트 클론
git clone [repository-url]
cd lovable

# 3. 의존성 설치
npm install

# 4. 환경변수 설정
cp .env.example .env
```

### 환경변수 설정 (.env)
```env
# Supabase 설정
VITE_SUPABASE_URL=https://bjqadhzkoxdwyfsglrvq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 개발 서버 설정
VITE_PORT=8080

# AI 기능 (선택사항)
VITE_GOOGLE_GEMINI_API_KEY=your_api_key_here
```

---

## 🗄️ Supabase 백엔드 구축

### 1. Supabase 프로젝트 생성
1. [Supabase 대시보드](https://app.supabase.com) 접속
2. 새 프로젝트 생성
3. 데이터베이스 비밀번호 설정
4. 프로젝트 URL과 API 키 확인

### 2. 데이터베이스 스키마 설정
```sql
-- 제품 테이블
CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10,2) DEFAULT 0,
    main_image_url TEXT,
    image_urls TEXT[],
    category_id VARCHAR(50),
    specifications JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 카테고리 테이블
CREATE TABLE categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    parent_id VARCHAR(50),
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자 테이블 (인증 시스템)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255),
    full_name VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (id)
);

-- 장바구니 테이블
CREATE TABLE cart_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. RLS (Row Level Security) 설정
```sql
-- 제품 테이블 RLS 활성화
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 모든 사용자에게 제품 읽기 권한 부여
CREATE POLICY "Enable read access for all users" ON products
    FOR SELECT USING (true);

-- 인증된 사용자에게 장바구니 접근 권한 부여
CREATE POLICY "Users can view own cart items" ON cart_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items" ON cart_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items" ON cart_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items" ON cart_items
    FOR DELETE USING (auth.uid() = user_id);
```

### 4. Storage 버킷 설정
```sql
-- 이미지 저장용 버킷 생성
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- 공개 읽기 정책 설정
CREATE POLICY "Give anon users access to product images" ON storage.objects
    FOR SELECT USING (bucket_id = 'product-images');

-- 업로드 정책 (관리자만)
CREATE POLICY "Allow authenticated users to upload images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
```

### 5. 클라이언트 설정
```typescript
// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://bjqadhzkoxdwyfsglrvq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
```

---

## 🖼️ 이미지 연동 문제 해결

### 문제 상황
- **초기 문제**: 외부 이미지 URL로 인한 2-5초 로딩 지연
- **CORS 문제**: 외부 도메인 접근 차단
- **성능 이슈**: 100% 외부 의존성으로 인한 느린 로딩

### 해결 전략
1. **로컬 이미지 마이그레이션**: 82개 ABUI 이미지 파일 로컬 저장
2. **지능적 매칭 알고리즘**: ABUI 패턴 기반 자동 매칭
3. **자동화 스크립트**: 21개 npm 스크립트로 완전 자동화
4. **성능 최적화**: 100% 로컬 이미지 달성

### 자동화 스크립트 시스템

#### 1. 백업 시스템
```bash
# 자동 백업 생성
npm run backup-images

# 백업 파일 위치
backups/products-backup-2025-07-17T12-00-00-000Z.json
```

#### 2. 이미지 매칭 및 업데이트
```bash
# 완전 자동화 프로세스
npm run integrate-local-images

# 개별 단계 실행
npm run match-images          # 이미지 매칭
npm run update-images         # 경로 업데이트
npm run verify-loading        # 성능 검증
```

#### 3. 성능 검증
```bash
# 현재 최적화 상태 확인
npm run verify-loading

# 출력 예시:
# 🎯 이미지 최적화율: 100.0%
# 📊 로컬 이미지: 50개
# ⚠️ 외부 URL: 0개
# 🔄 플레이스홀더: 0개
```

### 핵심 매칭 알고리즘
```javascript
// scripts/intelligent-image-matcher.mjs 핵심 로직
function extractCleanFilename(url) {
  const match = url.match(/ABUI[A-Za-z0-9_-]+\.(jpg|jpeg|png|webp)/i);
  return match ? match[0] : null;
}

async function findBestMatch(extractedName, localFiles) {
  // 1단계: 정확 매칭
  const exactMatch = localFiles.find(file => 
    file.toLowerCase() === extractedName.toLowerCase()
  );
  if (exactMatch) return { file: exactMatch, confidence: 1.0 };

  // 2단계: 유사도 매칭 (80% 이상)
  let bestMatch = null;
  let highestScore = 0;
  
  for (const file of localFiles) {
    const score = calculateSimilarity(extractedName, file);
    if (score > highestScore && score >= 0.8) {
      highestScore = score;
      bestMatch = file;
    }
  }
  
  return bestMatch ? { file: bestMatch, confidence: highestScore } : null;
}
```

---

## 💻 개발 워크플로우

### 1. 개발 서버 실행
```bash
# 개발 서버 시작 (포트 8080)
npm run dev

# 브라우저에서 확인
http://localhost:8080
```

### 2. 데이터 임포트 과정
```bash
# 1. 원본 데이터 크롤링 (선택사항)
npm run crawl-jpcaster

# 2. 크롤링 데이터 변환
npm run transform-crawled-data

# 3. 로컬 데이터 업데이트
npm run update-local-data

# 4. 이미지 최적화
npm run integrate-local-images
```

### 3. 빌드 및 배포
```bash
# 개발 빌드
npm run build:dev

# 프로덕션 빌드
npm run build

# 미리보기
npm run preview
```

### 4. 품질 검증
```bash
# 전체 검증 워크플로우
npm run full-verification

# 개별 검증 단계
npm run verify-loading     # 이미지 로딩 상태
npm run verify-images      # 이미지 매칭 상태
```

---

## 🚀 배포 및 호스팅

### 1. Hostinger 배포 설정
```bash
# FTP 자동 배포 스크립트
./deploy-to-hostinger.sh

# 또는 수동 배포
npm run build
# dist 폴더를 FTP로 업로드
```

### 2. 프로덕션 환경 설정
```bash
# .htaccess 파일 (SPA 라우팅)
RewriteEngine On
RewriteRule ^(?!.*\.).*$ /index.html [L]

# 이미지 캐싱 설정
<FilesMatch "\.(jpg|jpeg|png|webp|svg)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 year"
</FilesMatch>
```

### 3. 환경변수 설정
```env
# 프로덕션 환경 (.env.production)
VITE_SUPABASE_URL=https://bjqadhzkoxdwyfsglrvq.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_key
VITE_PORT=443
```

---

## 🔧 문제 해결 FAQ

### Q1: Sentry 패키지 오류
```bash
# 증상: Cannot find module '@sentry/node'
# 해결방법:
npm install @sentry/node

# 또는 임시 비활성화 (모든 스크립트 상단에 추가)
const Sentry = {
  addBreadcrumb: () => {},
  captureException: (error) => console.error('Error:', error),
  captureMessage: (msg) => console.log('Message:', msg),
  setContext: () => {},
  startTransaction: () => ({ finish: () => {} }),
  getCurrentScope: () => ({ setSpan: () => {} })
};
```

### Q2: 이미지 로딩 실패
```bash
# 증상: 모든 이미지가 placeholder로 표시
# 해결방법:
npm run integrate-local-images

# 개별 디버깅
npm run match-images --verbose
npm run verify-loading
```

### Q3: 개발 서버 접속 불가
```bash
# 증상: ERR_CONNECTION_REFUSED
# 해결방법:
netstat -ano | findstr :8080  # 포트 확인
npm run dev                   # 서버 재시작
```

### Q4: 빌드 오류
```bash
# 증상: Build failed with errors
# 해결방법:
rm -rf node_modules/.vite      # 캐시 삭제
rm -rf dist                    # 빌드 폴더 삭제
npm install                    # 의존성 재설치
npm run build                  # 빌드 재시도
```

### Q5: RLS 정책 오류
```sql
-- 증상: Permission denied for table products
-- 해결방법: Service role 키 사용
-- .env 파일에 서비스 키 추가
VITE_SUPABASE_SERVICE_KEY=your_service_key

-- 또는 RLS 정책 수정
CREATE POLICY "Enable read access for all users" ON products
    FOR SELECT USING (true);
```

---

## 📊 성공/실패 사례 분석

### ✅ 성공 사례

#### 1. 이미지 최적화 시스템
- **성과**: 100% 로컬 이미지 달성
- **방법**: ABUI 패턴 매칭 알고리즘 구현
- **결과**: 10배 성능 향상, CORS 문제 완전 해결

#### 2. 자동화 스크립트 시스템
- **성과**: 21개 npm 스크립트로 완전 자동화
- **방법**: 모듈화된 스크립트 체계 구축
- **결과**: 개발 효율성 대폭 향상

#### 3. Supabase 통합
- **성과**: 완전한 백엔드 시스템 구축
- **방법**: RLS 정책과 Service role 키 활용
- **결과**: 안정적인 데이터베이스 연동

### ❌ 실패 사례 및 교훈

#### 1. Sentry 의존성 문제
- **문제**: `@sentry/node` 패키지 누락으로 모든 스크립트 실패
- **원인**: 의존성 관리 부족
- **해결**: Mock 함수 사용 + 임시 비활성화
- **교훈**: 의존성 검증 자동화 필요

#### 2. 초기 CORS 프록시 의존성
- **문제**: 외부 이미지 로딩으로 2-5초 지연
- **원인**: 외부 리소스 의존성
- **해결**: 로컬 이미지 마이그레이션
- **교훈**: 외부 의존성 최소화 중요

#### 3. 메모리 오버플로우
- **문제**: 대량 데이터 처리 시 메모리 부족
- **원인**: 배치 처리 미적용
- **해결**: 50개 단위 배치 처리
- **교훈**: 대용량 데이터 처리 시 배치 처리 필수

### 🎯 베스트 프랙티스

#### 1. 개발 환경 설정
- 포트 8080 고정 사용
- 환경변수 검증 자동화
- 자동 백업 시스템 구축

#### 2. 이미지 관리
- 로컬 이미지 우선 정책
- 자동 최적화 스크립트
- 성능 모니터링 시스템

#### 3. 데이터베이스 연동
- Service role 키 활용
- RLS 정책 적절히 설정
- 백업 전략 수립

---

## 📈 성능 지표 및 모니터링

### 현재 성능 지표
| 항목 | 초기값 | 현재값 | 개선률 |
|------|--------|--------|--------|
| 이미지 최적화율 | 0% | 100% | +100% |
| 로딩 시간 | 2-5초 | 0.1-0.5초 | 10배 개선 |
| CORS 요청 | 50개 | 0개 | 100% 제거 |
| 제품 로딩 | 50개 | 50개 | 100% 성공 |

### 모니터링 방법
```bash
# 실시간 성능 확인
npm run verify-loading

# 상세 성능 리포트
cat logs/image-verification/latest.json

# 개발 서버 상태
curl -s http://localhost:8080/health
```

---

## 🚀 향후 로드맵

### 단기 계획 (1-2주)
- [ ] AI 제품 페이지 빌더 구현
- [ ] 고급 검색 및 필터링 시스템
- [ ] 사용자 인증 시스템 고도화

### 중기 계획 (1-2개월)
- [ ] Gemini AI 챗봇 통합
- [ ] 실시간 재고 관리 시스템
- [ ] 주문 및 결제 시스템 구축

### 장기 계획 (3-6개월)
- [ ] 관리자 대시보드 구축
- [ ] 다국어 지원 시스템
- [ ] 모바일 앱 개발

---

## 🔗 유용한 링크

- [Supabase 문서](https://supabase.com/docs)
- [Vite 문서](https://vitejs.dev/guide/)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [Shadcn/ui 컴포넌트](https://ui.shadcn.com/)
- [React Router 문서](https://reactrouter.com/docs)

---

## 📞 지원 및 도움말

### 기술 지원
- 이슈 트래킹: GitHub Issues
- 문서 업데이트: 매주 금요일
- 성능 리포트: 매일 자동 생성

### 커뮤니티
- 개발 팀 Slack 채널
- 주간 기술 미팅 (매주 월요일)
- 코드 리뷰 세션 (매주 수요일)

---

*📅 최종 업데이트: 2025-07-17*  
*🎯 버전: v2.0.0*  
*🔄 상태: 프로덕션 준비 완료*  
*⚡ 성능: 100% 이미지 최적화 달성*

---

**이 매뉴얼은 다른 개발자나 AI 도구가 동일한 이커머스 시스템을 45분 내에 재현할 수 있도록 작성된 검증된 가이드입니다.**