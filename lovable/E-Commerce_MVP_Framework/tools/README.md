# 🛠️ Development Tools & Scripts

이 디렉토리는 E-Commerce MVP 개발을 위한 자동화 도구와 스크립트들을 포함합니다.

## 📁 구조

```
tools/
├── scripts/                    # 자동화 스크립트들
│   ├── setup-project.sh        # 프로젝트 초기 설정 스크립트
│   ├── deploy-to-vercel.sh     # Vercel 배포 스크립트
│   └── optimize-images.js      # 이미지 최적화 스크립트
└── README.md                   # 이 파일
```

## 🚀 스크립트 사용법

### 1. 프로젝트 설정 스크립트

새로운 E-Commerce MVP 프로젝트를 자동으로 설정합니다.

```bash
# 실행 권한 부여
chmod +x tools/scripts/setup-project.sh

# 프로젝트 생성
./tools/scripts/setup-project.sh my-ecommerce-project
```

**기능:**
- Vite React TypeScript 프로젝트 생성
- 소스 템플릿 복사
- 설정 파일 적용
- 의존성 설치
- Git 저장소 초기화

### 2. Vercel 배포 스크립트

프로덕션 배포를 자동화합니다.

```bash
# 실행 권한 부여
chmod +x tools/scripts/deploy-to-vercel.sh

# 배포 실행
./tools/scripts/deploy-to-vercel.sh
```

**기능:**
- 프로젝트 빌드
- 빌드 결과 확인
- Vercel에 자동 배포
- 배포 상태 확인

### 3. 이미지 최적화 스크립트

제품 이미지들을 웹 최적화합니다.

```bash
# Node.js 스크립트 실행
node tools/scripts/optimize-images.js

# 커스텀 디렉토리 지정
node tools/scripts/optimize-images.js public/products public/optimized
```

**기능:**
- 여러 크기의 썸네일 생성 (200px, 400px, 800px)
- 이미지 메타데이터 생성
- 최적화 결과 리포트

## 💡 사용 팁

### 개발 워크플로우

1. **프로젝트 시작:**
   ```bash
   ./tools/scripts/setup-project.sh my-store
   cd my-store/frontend
   ```

2. **개발 중:**
   ```bash
   npm run dev                    # 개발 서버 시작
   node ../tools/scripts/optimize-images.js  # 이미지 최적화
   ```

3. **배포:**
   ```bash
   npm run build                  # 빌드 테스트
   ../tools/scripts/deploy-to-vercel.sh      # 배포
   ```

### 커스터마이징

각 스크립트는 필요에 따라 수정할 수 있습니다:

- **setup-project.sh**: 추가 설정이나 도구 설치
- **deploy-to-vercel.sh**: 다른 플랫폼 배포 지원
- **optimize-images.js**: 다른 이미지 크기나 포맷 지원

## 🔧 추가 도구

### package.json 스크립트 추가

```json
{
  "scripts": {
    "setup": "../tools/scripts/setup-project.sh",
    "deploy": "../tools/scripts/deploy-to-vercel.sh",
    "optimize:images": "node ../tools/scripts/optimize-images.js"
  }
}
```

### 이미지 최적화 자동화

```bash
# watch 모드로 이미지 폴더 모니터링
npm install -g nodemon
nodemon --watch public/images --exec "node tools/scripts/optimize-images.js"
```

## 🚨 주의사항

1. **실행 권한**: 스크립트 실행 전 권한 설정 필요
   ```bash
   chmod +x tools/scripts/*.sh
   ```

2. **의존성**: 일부 스크립트는 추가 도구 설치 필요
   - Vercel CLI (자동 설치됨)
   - Node.js 18+
   - Git

3. **환경 변수**: 배포 전 .env.local 설정 확인

## 📚 참고 자료

- [Vite 문서](https://vitejs.dev/)
- [Vercel 배포 가이드](https://vercel.com/docs)
- [이미지 최적화 베스트 프랙티스](https://web.dev/fast/#optimize-your-images)

이 도구들을 활용하여 효율적인 E-Commerce MVP 개발을 진행하세요!