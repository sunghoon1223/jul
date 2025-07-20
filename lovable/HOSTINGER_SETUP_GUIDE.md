# 호스팅거 배포 가이드

이 가이드는 JP Caster 전자상거래 사이트를 호스팅거(Hostinger)에 배포하는 방법을 설명합니다.

## 📋 사전 준비사항

### 1. 호스팅거 계정 필수 사항
- **웹 호스팅 계정** (Premium 이상 권장)
- **MySQL 데이터베이스** 생성 권한
- **cPanel 접근** 권한
- **PHP 7.4 이상** 지원

### 2. 개발 환경
- Node.js 18 이상
- Git
- 텍스트 에디터

## 🚀 1단계: 데이터베이스 설정

### 1.1 MySQL 데이터베이스 생성

1. **cPanel 로그인**
   - 호스팅거 계정으로 cPanel에 접속

2. **MySQL 데이터베이스 생성**
   ```
   데이터베이스명: your_account_jpcaster
   사용자명: your_account_jpcaster_user
   비밀번호: [강력한 비밀번호 생성]
   ```

3. **권한 부여**
   - 생성한 사용자에게 데이터베이스 전체 권한 부여

### 1.2 데이터베이스 스키마 설치

1. **phpMyAdmin 접속**
   - cPanel > phpMyAdmin

2. **스키마 실행**
   ```sql
   -- database/mysql_schema.sql 파일의 내용을 복사하여 실행
   -- 또는 파일을 직접 업로드하여 실행
   ```

## 🔧 2단계: API 서버 설정

### 2.1 데이터베이스 연결 설정

1. **데이터베이스 설정 파일 수정**
   ```php
   // api/config/database.php 파일 수정
   private $host = "localhost";
   private $db_name = "your_account_jpcaster";
   private $username = "your_account_jpcaster_user";
   private $password = "your_database_password";
   ```

### 2.2 API 파일 업로드

1. **파일 업로드**
   ```
   호스팅거 파일 매니저 또는 FTP를 통해 업로드:
   
   public_html/
   ├── api/
   │   ├── config/
   │   │   ├── database.php
   │   │   └── jwt.php
   │   ├── auth/
   │   │   ├── login.php
   │   │   ├── register.php
   │   │   └── me.php
   │   ├── products/
   │   │   ├── list.php
   │   │   └── detail.php
   │   ├── categories/
   │   │   └── list.php
   │   ├── cart/
   │   │   ├── list.php
   │   │   └── add.php
   │   └── orders/
   │       └── create.php
   ```

### 2.3 PHP 설정 확인

1. **PHP 버전 확인**
   - cPanel > PHP 선택기에서 PHP 7.4 이상 설정

2. **필요한 확장 모듈 확인**
   ```
   ✅ PDO
   ✅ PDO_MySQL
   ✅ JSON
   ✅ OpenSSL
   ✅ cURL
   ```

## 🎨 3단계: 프론트엔드 빌드 및 배포

### 3.1 API URL 설정

1. **API 클라이언트 설정 수정**
   ```typescript
   // src/lib/apiClient.ts
   const API_BASE_URL = process.env.NODE_ENV === 'production' 
     ? 'https://your-domain.com/api'  // 실제 도메인으로 변경
     : 'http://localhost/api';
   ```

### 3.2 프로덕션 빌드

1. **빌드 명령 실행**
   ```bash
   npm run build
   ```

2. **빌드 결과 확인**
   ```bash
   ls -la dist/
   # 빌드된 파일들이 dist/ 폴더에 생성됨
   ```

### 3.3 파일 업로드

1. **정적 파일 업로드**
   ```
   dist/ 폴더의 모든 내용을 public_html/에 업로드:
   
   public_html/
   ├── api/ (이미 업로드됨)
   ├── assets/
   ├── index.html
   └── .htaccess (이미 있음)
   ```

## ⚙️ 4단계: 도메인 및 SSL 설정

### 4.1 도메인 연결
- 호스팅거에서 제공하는 도메인 또는 사용자 도메인 연결

### 4.2 SSL 인증서
- cPanel > SSL/TLS에서 Let's Encrypt SSL 활성화

## 🧪 5단계: 테스트

### 5.1 API 테스트

1. **카테고리 API 테스트**
   ```
   GET https://your-domain.com/api/categories/list.php
   ```

2. **제품 API 테스트**
   ```
   GET https://your-domain.com/api/products/list.php
   ```

### 5.2 전체 사이트 테스트

1. **홈페이지 접속**
   - https://your-domain.com

2. **주요 기능 테스트**
   - 제품 목록 조회
   - 제품 상세 보기
   - 장바구니 추가
   - 회원가입/로그인

## 🔒 6단계: 보안 설정

### 6.1 파일 권한 설정
```bash
# API 폴더 권한 (cPanel 파일 매니저에서 설정)
api/ - 755
api/config/ - 755
api/**/*.php - 644
```

### 6.2 환경 변수 설정
```php
// .env 파일 생성 (public_html 외부에)
DB_HOST=localhost
DB_NAME=your_account_jpcaster
DB_USER=your_account_jpcaster_user
DB_PASS=your_database_password
JWT_SECRET=your_random_jwt_secret_key
```

## 📊 7단계: 모니터링 설정

### 7.1 에러 로그 확인
- cPanel > 에러 로그에서 PHP 에러 모니터링

### 7.2 성능 모니터링
- 호스팅거 제공 웹사이트 분석 도구 활용

## 🆘 트러블슈팅

### 자주 발생하는 문제들

1. **데이터베이스 연결 오류**
   ```
   해결: database.php의 연결 정보 재확인
   ```

2. **CORS 오류**
   ```
   해결: jwt.php의 CORS 설정에 도메인 추가
   ```

3. **404 오류 (API 호출 시)**
   ```
   해결: .htaccess 파일 확인 및 URL 경로 점검
   ```

4. **빈 페이지 (화이트스크린)**
   ```
   해결: 브라우저 개발자 도구에서 콘솔 에러 확인
   ```

## 📞 지원

문제가 발생한 경우:
1. 브라우저 개발자 도구 콘솔 확인
2. cPanel 에러 로그 확인
3. 네트워크 탭에서 API 호출 상태 확인

---

## 🎉 배포 완료!

모든 단계를 완료하면 JP Caster 전자상거래 사이트가 호스팅거에서 정상 작동합니다.

**추가 비용:** 호스팅거 비용 외 추가 비용 없음
**유지보수:** 기본 호스팅거 관리 도구로 충분