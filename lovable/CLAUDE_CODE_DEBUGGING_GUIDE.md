# 🐛 JPCaster 이미지 매칭 디버깅 가이드 (Claude Code 전용)

## 📊 **현재 상황 요약**

### ✅ 완료된 작업 (확인됨)
- **5/5 작업** 완전 완료 
- **85개 ABUI 이미지** 파일 존재 (`public/images/`)
- **products.json** 10개 로컬 이미지 설정 완료
- **서버** 포트 8080 정상 운영
- **Sentry 의존성** 완전 제거 (404 오류 해결)

### ❌ 핵심 문제
- **실제 웹사이트**: 여전히 0개 로컬 이미지 표시
- **설정 vs 실제**: 완전한 불일치 상태

---

## 🔍 **우선순위별 디버깅 체크리스트**

### **Priority 1: React 컴포넌트 분석** (가장 중요)
```bash
# 확인할 파일들
src/components/ProductImageGallery.tsx
src/components/ui/ProductCard.tsx
src/pages/Products.tsx
src/data/products.json (이미 확인됨)
```

**체크포인트:**
1. 이미지 URL 처리 로직 확인
2. `main_image_url` 속성 읽기 확인  
3. `/images/` 경로 처리 확인
4. placeholder.svg 폴백 로직 확인

### **Priority 2: 정적 파일 서빙 확인**
```bash
# 테스트할 경로들
http://localhost:8080/images/ABUIABACGAAg0rLUswYotNOjtgYwoAY4oAY.jpg
http://localhost:8080/images/placeholder.svg

# 확인할 설정 파일
vite.config.ts
public/ 폴더 구조
```

### **Priority 3: 브라우저 캐싱 & 네트워크**
```bash
# F12 개발자 도구에서 확인
1. Network 탭 → Disable cache 체크
2. 이미지 요청 상태 확인 (200? 404? 차단?)
3. Console 에러 메시지 확인
4. Application 탭 → Storage 클리어
```

### **Priority 4: 데이터 플로우 추적**
```javascript
// 브라우저 Console에서 실행할 디버깅 코드
console.log("=== 이미지 데이터 플로우 디버깅 ===");

// 1. products.json 데이터 확인
fetch('/src/data/products.json')
  .then(r => r.json())
  .then(products => {
    const localImages = products.filter(p => 
      p.main_image_url && p.main_image_url.startsWith('/images/')
    );
    console.log(`products.json 로컬 이미지: ${localImages.length}개`);
    console.log('첫 3개:', localImages.slice(0,3).map(p => p.main_image_url));
  });

// 2. 실제 DOM 이미지 확인
const images = document.querySelectorAll('img');
const srcList = Array.from(images).map(img => img.src);
console.log('실제 이미지 src 목록:', srcList);

// 3. 이미지 로딩 상태 확인
images.forEach((img, i) => {
  console.log(`이미지 ${i+1}: ${img.src} - ${img.complete ? '로딩됨' : '로딩중'}`);
});
```

---

## 🚀 **즉시 실행 명령어 세트**

```bash
# 1단계: 환경 초기화
cd C:\MYCLAUDE_PROJECT\jul\lovable
rm -rf node_modules/.vite  # Vite 캐시 클리어
npm install

# 2단계: 강제 재매칭 실행
npm run integrate-local-images

# 3단계: 개발 서버 시작
npm run dev

# 4단계: 직접 이미지 접근 테스트
curl -I http://localhost:8080/images/ABUIABACGAAg0rLUswYotNOjtgYwoAY4oAY.jpg
curl -I http://localhost:8080/images/placeholder.svg
```

---

## 🔧 **가능한 원인 및 해결책**

### **원인 1: React 컴포넌트 로직 문제**
```typescript
// 확인할 패턴 (잘못된 예시)
const imageUrl = product.image || '/images/placeholder.svg';  // ❌
// 올바른 패턴
const imageUrl = product.main_image_url || '/images/placeholder.svg';  // ✅
```

### **원인 2: Vite 정적 파일 서빙 설정**
```typescript
// vite.config.ts 확인 필요
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  // public 폴더 설정이 올바른지 확인
});
```

### **원인 3: 데이터 동기화 문제**
```bash
# products.json이 실제로 업데이트 되었는지 확인
cat src/data/products.json | grep -c "main_image_url.*\/images\/"
# 예상 결과: 10 (10개 로컬 이미지)
```

### **원인 4: 브라우저 캐싱**
```bash
# 해결법
1. Ctrl+Shift+R (하드 리프레시)
2. F12 → Application → Storage → Clear storage
3. 시크릿 모드에서 테스트
```

---

## 📝 **디버깅 결과 보고 템플릿**

```markdown
## 디버깅 결과 보고

### 확인 완료 항목:
- [ ] React 컴포넌트 이미지 로직 확인
- [ ] 정적 파일 접근 가능 확인  
- [ ] products.json 실제 업데이트 확인
- [ ] 브라우저 캐시 클리어 완료

### 발견된 문제:
1. **문제 설명**: 
2. **파일 위치**: 
3. **오류 메시지**: 

### 해결 방법:
1. **수정 내용**: 
2. **테스트 결과**: 
3. **최종 상태**: 

### 최종 이미지 로딩 상태:
- 로컬 이미지: __개 표시
- placeholder: __개 표시  
- 총 최적화율: __%
```

---

## 🎯 **성공 기준**

### **즉시 달성 목표**
- ✅ 10개 로컬 이미지 브라우저에서 표시
- ✅ Network 탭에서 200 OK 응답
- ✅ Console 에러 0개

### **추가 최적화 목표** 
- ✅ 추가 15개 이미지 매칭 (총 25개)
- ✅ 50% 이미지 최적화 달성
- ✅ 평균 로딩 시간 0.1초 달성

---

*🕒 예상 디버깅 시간: 10-20분*  
*🎯 목표: 실제 20% 이미지 최적화 달성*  
*🔄 상태: Claude Code 디버깅 준비 완료*