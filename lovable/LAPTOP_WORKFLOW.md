# 랩탑 Claude Code 작업 워크플로우 가이드

## 📋 즉시 시작 체크리스트

### 1️⃣ 환경 구성 (5분)
```bash
# 프로젝트 클론
git clone https://github.com/sunghoon1223/jul.git
cd jul/lovable

# 의존성 설치
npm install

# 개발 서버 시작
npm run dev
```

### 2️⃣ 프로젝트 이해 (5분)
1. **CLAUDE.md** 파일 읽기 - 전체 프로젝트 컨텍스트 파악
2. **MASTER_BUILD_GUIDE.md** 참조 - 핵심 아키텍처 이해
3. **AI_EXECUTION_GUIDE.md** 확인 - AI 개발 패턴 학습

### 3️⃣ 브라우저 확인 (2분)
- http://localhost:5173 접속
- 홈페이지, 제품 페이지, 장바구니 기능 확인
- 관리자 페이지 (/admin) 테스트

---

## 🎯 현재 프로젝트 상태

### ✅ 완료된 기능
- **인증 시스템**: Supabase Auth 연동 완료
- **제품 카탈로그**: 카테고리별 제품 관리
- **장바구니**: 실시간 장바구니 기능
- **주문 관리**: 인벤토리 추적 포함
- **관리자 패널**: 제품/주문/공지사항 관리
- **반응형 디자인**: 모바일/데스크톱 대응

### 🔧 핵심 기술 스택
- **Frontend**: React 18.3.1 + TypeScript 5.5.3
- **Build Tool**: Vite 5.4.1
- **Styling**: Tailwind CSS 3.4.11 + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State Management**: Context API + Custom Hooks

### 📁 핵심 디렉토리 구조
```
src/
├── components/        # 재사용 가능한 컴포넌트
├── pages/            # 페이지 컴포넌트
├── hooks/            # 커스텀 훅
├── services/         # API 서비스 레이어
├── contexts/         # React Context
├── types/            # TypeScript 타입 정의
└── utils/            # 유틸리티 함수

E-Commerce_MVP_Framework/  # 재사용 가능한 템플릿
├── src-template/     # React 소스 템플릿
├── api-template/     # PHP API 템플릿
├── docs/             # 구현 가이드
└── tools/            # 자동화 스크립트
```

---

## 🚀 일반적인 작업 시나리오

### UI/UX 개선 작업
1. `src/components/` 또는 `src/pages/` 수정
2. Tailwind CSS 클래스로 스타일링
3. `npm run dev`로 실시간 확인

### 새 기능 추가
1. `src/types/` 타입 정의 추가
2. `src/services/` API 서비스 구현
3. `src/hooks/` 커스텀 훅 작성
4. `src/components/` UI 컴포넌트 개발
5. `src/pages/` 페이지 통합

### 데이터베이스 스키마 변경
1. `supabase/migrations/` SQL 파일 추가
2. `src/types/supabase.ts` 타입 업데이트
3. 관련 서비스 로직 수정

---

## 🛠️ 유용한 명령어

### 개발 명령어
```bash
npm run dev          # 개발 서버 시작 (포트 5173)
npm run build        # 프로덕션 빌드
npm run preview      # 빌드 결과 미리보기
npm run lint         # 코드 린팅
```

### Git 워크플로우
```bash
git status           # 변경사항 확인
git add .            # 모든 변경사항 스테이징
git commit -m "feat: 새 기능 설명"
git push origin main # GitHub에 푸시
```

---

## 💡 개발 팁

### 1. 성능 최적화
- `src/utils/performance.ts` 활용
- 이미지 최적화는 `public/images/` 관리
- 컴포넌트 lazy loading 패턴 참조

### 2. 디버깅
- `src/utils/debug.ts` 디버그 유틸리티 활용
- React DevTools 사용 권장
- Chrome DevTools Network 탭으로 API 호출 확인

### 3. 타입 안전성
- 모든 새 기능에 TypeScript 타입 정의
- `src/types/` 디렉토리 구조 유지
- Supabase 타입은 `src/types/supabase.ts` 참조

---

## 📚 추가 참고 자료

### 필수 문서
- **CLAUDE.md**: 프로젝트 전체 메모리
- **MASTER_BUILD_GUIDE.md**: 빌드 가이드
- **AI_EXECUTION_GUIDE.md**: AI 개발 패턴
- **BUILD_EXPERIENCES.md**: 성공/실패 경험 모음

### 프레임워크 활용
- **E-Commerce_MVP_Framework/**: 새 프로젝트 템플릿
- **COMPLETE_IMPLEMENTATION_GUIDE.md**: 완전 구현 가이드
- **docs/**: 상세 기술 문서 모음

---

## 🎯 Claude Code 작업 시작 명령어

랩탑의 Claude Code에서 이 프로젝트를 이어받아 작업할 때:

```
이 프로젝트는 완전한 E-Commerce MVP Framework와 JP Caster 플랫폼입니다. 
CLAUDE.md 파일을 먼저 읽어 전체 프로젝트 상황을 파악하고, 
LAPTOP_WORKFLOW.md(이 파일)을 참조하여 환경을 구성해주세요.
현재 모든 기능이 작동하는 상태이며, 추가 개발이나 커스터마이징이 가능합니다.

주요 작업 가능 영역:
1. UI/UX 개선 및 브랜딩 변경
2. 새로운 이커머스 기능 추가
3. 성능 최적화
4. 다국어 지원 확장
5. 모바일 앱 개발
6. 새 고객사 프로젝트 개발

프로젝트 상태: 프로덕션 준비 완료 ✅
기술 스택: React + TypeScript + Vite + Supabase ✅
문서화: 완전 ✅
```

---

**💻 Happy Coding on Laptop! 🚀**