# Supabase 소셜 로그인 설정 가이드

이 가이드는 JP Caster 프로젝트에서 Google과 Kakao 소셜 로그인을 설정하는 방법을 안내합니다.

## 🚨 현재 상황
- **네이버 로그인**: Supabase에서 공식적으로 지원하지 않아 제거됨
- **Google 로그인**: 설정 필요 (공급자 활성화되지 않음)
- **Kakao 로그인**: 설정 필요 (공급자 활성화되지 않음)

## 🔧 필요한 작업

### 1. Google OAuth 설정

#### 1.1 Google Cloud Console 설정
1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 프로젝트 선택 또는 새 프로젝트 생성
3. **APIs & Services** → **Credentials** 메뉴로 이동
4. **+ CREATE CREDENTIALS** → **OAuth 2.0 Client IDs** 선택
5. **Application type**: Web application
6. **Name**: JP Caster (또는 원하는 이름)
7. **Authorized redirect URIs**에 다음 URL 추가:
   ```
   https://bjqadhzkoxdwyfsglrvq.supabase.co/auth/v1/callback
   ```
8. **CREATE** 버튼 클릭
9. **Client ID**와 **Client secret**를 복사해 두기

#### 1.2 Supabase Dashboard 설정
1. [Supabase Dashboard](https://supabase.com/dashboard)에 접속
2. 프로젝트 선택 (`bjqadhzkoxdwyfsglrvq`)
3. **Authentication** → **Providers** 메뉴로 이동
4. **Google** 제공자를 찾아서 **Enable** 스위치 켜기
5. Google Cloud Console에서 복사한 정보 입력:
   - **Client ID**: Google에서 받은 Client ID
   - **Client Secret**: Google에서 받은 Client Secret
6. **Save** 버튼 클릭

### 2. Kakao OAuth 설정

#### 2.1 Kakao Developers 설정
1. [Kakao Developers](https://developers.kakao.com/)에 접속
2. 로그인 후 **내 애플리케이션** → **애플리케이션 추가하기**
3. **앱 이름**: JP Caster (또는 원하는 이름)
4. **사업자명**: 회사명 입력
5. 애플리케이션 생성 후 **앱 키** 탭에서 **REST API 키** 복사
6. **플랫폼** → **Web** → **사이트 도메인** 추가:
   ```
   https://bjqadhzkoxdwyfsglrvq.supabase.co
   ```
7. **카카오 로그인** → **활성화 설정** → **ON**
8. **Redirect URI** 설정:
   ```
   https://bjqadhzkoxdwyfsglrvq.supabase.co/auth/v1/callback
   ```
9. **동의항목** 설정:
   - **닉네임**: 필수 동의
   - **이메일**: 필수 동의
   - **프로필 사진**: 선택 동의

#### 2.2 Supabase Dashboard 설정
1. Supabase Dashboard에서 **Authentication** → **Providers**
2. **Kakao** 제공자를 찾아서 **Enable** 스위치 켜기
3. Kakao Developers에서 복사한 정보 입력:
   - **Client ID**: Kakao REST API 키
   - **Client Secret**: (Kakao의 경우 비워두거나 REST API 키와 동일하게 입력)
4. **Save** 버튼 클릭

### 3. 환경 변수 확인

현재 `.env` 파일에 다음 설정이 올바른지 확인:

```env
VITE_SUPABASE_URL=https://bjqadhzkoxdwyfsglrvq.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_NRzhcehsa_tDtdXOOt4q9w_7mwWmgTB
```

## 🧪 테스트 방법

### 1. 개발 서버 실행
```bash
npm run dev
```

### 2. 로그인 테스트
1. 브라우저에서 `http://localhost:8080` 접속
2. **로그인** 버튼 클릭
3. **카카오 로그인** 또는 **구글 로그인** 버튼 클릭
4. 각 플랫폼의 로그인 화면으로 리다이렉트되는지 확인
5. 로그인 완료 후 사이트로 돌아오는지 확인

### 3. 회원가입 테스트
1. **회원가입** 탭 클릭
2. **카카오로 가입** 또는 **구글로 가입** 버튼 클릭
3. 동일한 과정 반복

## 🔍 문제 해결

### Google 로그인 오류
- **403 에러**: Google Cloud Console에서 Redirect URI가 정확히 설정되었는지 확인
- **invalid_client 에러**: Client ID와 Client Secret이 올바른지 확인

### Kakao 로그인 오류
- **KOE320 에러**: Kakao Developers에서 Redirect URI가 정확히 설정되었는지 확인
- **동의항목 오류**: 필수 동의항목(닉네임, 이메일)이 설정되었는지 확인

### 공통 문제
- **Provider not enabled**: Supabase Dashboard에서 해당 제공자가 활성화되었는지 확인
- **CORS 오류**: 도메인 설정이 올바른지 확인

## 📞 추가 지원

설정 과정에서 문제가 발생하면 다음 정보를 제공해 주세요:
1. 어떤 단계에서 오류가 발생했는지
2. 정확한 오류 메시지
3. 브라우저 개발자 도구의 콘솔 로그
4. 설정한 Redirect URI와 도메인

## ✅ 완료 후 확인사항

모든 설정이 완료되면:
- [ ] Google 로그인 정상 작동
- [ ] Kakao 로그인 정상 작동
- [ ] 회원가입 프로세스 정상 작동
- [ ] 로그인 후 사용자 정보 정상 표시

---

**참고**: 이 가이드는 2025년 7월 기준으로 작성되었으며, 각 플랫폼의 정책 변경에 따라 일부 내용이 달라질 수 있습니다.