# Firebase 구글 로그인 설정 가이드

## 문제 해결

프로덕션 환경에서 구글 로그인이 작동하지 않는 경우, Firebase Console에서 다음 설정을 확인하세요.

## 1. Firebase Console 설정

### 승인된 도메인 추가
1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 프로젝트 선택: `gameportal-bd7a6`
3. **Authentication** > **Settings** > **Authorized domains** 이동
4. 다음 도메인 추가:
   - `localhost` (로컬 개발용)
   - 배포된 도메인 (예: `your-app.pages.dev`)

### OAuth 동의 화면 설정
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 선택: `gameportal-bd7a6`
3. **APIs & Services** > **OAuth consent screen** 이동
4. 다음 정보 입력:
   - App name: `Retro Game Portal`
   - User support email: 본인 이메일
   - Developer contact information: 본인 이메일
5. **Scopes** 추가:
   - `email`
   - `profile`
   - `openid`

### OAuth 클라이언트 ID 설정
1. **APIs & Services** > **Credentials** 이동
2. 기존 Web client 클릭 또는 새로 생성
3. **Authorized JavaScript origins** 추가:
   ```
   http://localhost:5173
   https://your-app.pages.dev
   ```
4. **Authorized redirect URIs** 추가:
   ```
   http://localhost:5173
   https://your-app.pages.dev
   https://gameportal-bd7a6.firebaseapp.com/__/auth/handler
   ```

## 2. 코드 개선 사항

### 구현된 기능
- ✅ **Popup + Redirect 이중 방식**: 팝업이 차단되면 자동으로 리다이렉트 방식으로 전환
- ✅ **에러 처리**: 사용자에게 친화적인 에러 메시지 표시
- ✅ **리다이렉트 결과 처리**: 페이지 로드 시 리다이렉트 로그인 결과 확인
- ✅ **계정 선택 프롬프트**: 매번 계정 선택 화면 표시

### 변경된 파일
- `src/contexts/AuthContext.tsx`: 리다이렉트 지원 및 에러 처리 추가
- `src/firebase/firebase.ts`: GoogleAuthProvider 설정 추가
- `src/components/Header.tsx`: 에러 메시지 UI 추가

## 3. 테스트 방법

### 로컬 테스트
```bash
npm run dev
```
- http://localhost:5173 접속
- LOGIN 버튼 클릭
- 구글 계정으로 로그인

### 프로덕션 테스트
1. Cloudflare Pages에 배포
2. 배포된 URL 접속
3. LOGIN 버튼 클릭
4. 에러 발생 시 콘솔 확인

## 4. 일반적인 에러 및 해결 방법

### `auth/unauthorized-domain`
**원인**: Firebase Console에 도메인이 승인되지 않음  
**해결**: Firebase Console > Authentication > Settings > Authorized domains에 도메인 추가

### `auth/popup-blocked`
**원인**: 브라우저가 팝업을 차단  
**해결**: 자동으로 리다이렉트 방식으로 전환됨 (코드에 이미 구현됨)

### `auth/operation-not-allowed`
**원인**: Firebase Console에서 Google 로그인이 비활성화됨  
**해결**: Firebase Console > Authentication > Sign-in method에서 Google 활성화

### `auth/invalid-api-key`
**원인**: Firebase 설정의 API 키가 잘못됨  
**해결**: Firebase Console에서 올바른 설정 복사

## 5. 보안 권장사항

### 환경 변수 사용 (선택사항)
프로덕션 환경에서는 Firebase 설정을 환경 변수로 관리하는 것이 좋습니다:

1. `.env` 파일 생성:
```env
VITE_FIREBASE_API_KEY=AIzaSyB-qCFcC0LK_Om7afo-MxH8o2UO0GgzJPY
VITE_FIREBASE_AUTH_DOMAIN=gameportal-bd7a6.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=gameportal-bd7a6
VITE_FIREBASE_STORAGE_BUCKET=gameportal-bd7a6.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=569866628750
VITE_FIREBASE_APP_ID=1:569866628750:web:c4c4043a6eee16e8e263df
VITE_FIREBASE_MEASUREMENT_ID=G-N0ZLB30H7F
```

2. `firebase.ts` 수정:
```typescript
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    // ... 나머지 설정
};
```

3. Cloudflare Pages 환경 변수 설정:
   - Settings > Environment variables에서 각 변수 추가

## 6. 디버깅

브라우저 콘솔에서 다음 로그 확인:
- `Popup error:` - 팝업 로그인 실패
- `Redirect error:` - 리다이렉트 로그인 실패
- `Redirect login successful` - 리다이렉트 로그인 성공
- `Error saving user data:` - Firestore 저장 실패
