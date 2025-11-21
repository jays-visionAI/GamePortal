# 🎯 OAuth 동의 화면 설정 - 초보자용 완벽 가이드

이 가이드는 Google Cloud Console을 처음 사용하는 분들을 위한 **스크린샷 없이도 따라할 수 있는** 상세한 설명입니다.

---

## 🚀 시작하기 전에

### 필요한 것
- ✅ Google 계정 (Gmail)
- ✅ Firebase 프로젝트 생성 완료 (`gameportal-bd7a6`)
- ✅ 인터넷 브라우저 (Chrome 권장)

### 예상 소요 시간
⏱️ 약 10-15분

---

## 📍 STEP 1: Google Cloud Console 접속

### 1-1. 웹사이트 열기
```
https://console.cloud.google.com/
```
위 주소를 브라우저 주소창에 입력하고 Enter

### 1-2. 로그인
- Firebase 프로젝트를 만들 때 사용한 Google 계정으로 로그인
- 2단계 인증이 있다면 완료

### 1-3. 프로젝트 선택
화면 상단을 보면:
```
Google Cloud    [프로젝트 이름 ▼]    검색창    ...
```

1. **[프로젝트 이름 ▼]** 부분 클릭
2. 팝업 창이 열리면 **gameportal-bd7a6** 찾아서 클릭
3. 화면 상단에 "gameportal-bd7a6"가 표시되면 성공

> 💡 **찾을 수 없다면?**
> - 검색창에 "gameportal" 입력
> - 여러 프로젝트가 있다면 ID로 확인: `gameportal-bd7a6`

---

## 📍 STEP 2: OAuth 동의 화면 메뉴 찾기

### 2-1. 왼쪽 메뉴 열기
화면 왼쪽 상단에 **☰** (햄버거 메뉴) 아이콘 클릭

### 2-2. APIs & Services 찾기
스크롤을 내려서 다음을 찾습니다:
```
📊 APIs & Services
```
클릭하면 하위 메뉴가 펼쳐집니다.

> 💡 **안 보인다면?**
> - 메뉴가 너무 많아서 스크롤이 필요할 수 있습니다
> - Ctrl+F (또는 Cmd+F)로 "APIs" 검색

### 2-3. OAuth consent screen 클릭
펼쳐진 하위 메뉴에서:
```
   Dashboard
   Library
   Credentials
   OAuth consent screen  ← 이것 클릭!
   Domain verification
```

**"OAuth consent screen"** 클릭

---

## 📍 STEP 3: User Type 선택 (처음 설정하는 경우)

### 화면에 표시되는 내용
```
┌─────────────────────────────────────┐
│  OAuth consent screen               │
│                                     │
│  Select user type                   │
│                                     │
│  ○ Internal                         │
│     Only for users in your org      │
│                                     │
│  ● External                         │
│     Available to any Google user    │
│                                     │
│         [CREATE]                    │
└─────────────────────────────────────┘
```

### 선택하기
1. **External** 옆의 동그라미(○) 클릭
   - 동그라미가 채워짐(●)
2. 하단의 **[CREATE]** 버튼 클릭

> ⚠️ **Internal은 선택할 수 없습니다**
> - Google Workspace 조직이 없으면 비활성화됨
> - 개인 Gmail 계정은 External만 가능

---

## 📍 STEP 4: 앱 정보 입력 (1/4 단계)

### 화면 구성
상단에 진행 단계가 표시됩니다:
```
① OAuth consent screen  →  ② Scopes  →  ③ Test users  →  ④ Summary
```

### 4-1. App information 섹션

#### App name (필수) ⭐
```
┌─────────────────────────────────┐
│ App name *                      │
│ [Retro Game Portal            ] │
└─────────────────────────────────┘
```
입력: `Retro Game Portal`

#### User support email (필수) ⭐
```
┌─────────────────────────────────┐
│ User support email *            │
│ [your-email@gmail.com ▼       ] │
└─────────────────────────────────┘
```
- 드롭다운(▼) 클릭
- 본인 이메일 선택

#### App logo (선택사항)
```
┌─────────────────────────────────┐
│ App logo                        │
│ [Choose File] No file chosen    │
└─────────────────────────────────┘
```
- 건너뛰어도 됩니다
- 업로드하려면: 120x120 픽셀 이미지 준비

### 4-2. App domain 섹션 (모두 선택사항)

```
Application home page
[https://                        ]

Application privacy policy link
[https://                        ]

Application terms of service link
[https://                        ]
```

**지금은 비워두어도 됩니다!**
- 나중에 배포 후 추가 가능

### 4-3. Authorized domains 섹션

```
Authorized domains
[                                ]
[+ ADD DOMAIN]
```

**여기도 비워두세요!**
- Firebase가 자동으로 관리합니다

### 4-4. Developer contact information (필수) ⭐

```
┌─────────────────────────────────┐
│ Email addresses *               │
│ [your-email@gmail.com         ] │
│ [+ Add email]                   │
└─────────────────────────────────┘
```
입력: 본인 이메일 주소

### 4-5. 저장
하단의 **[SAVE AND CONTINUE]** 버튼 클릭

---

## 📍 STEP 5: Scopes 설정 (2/4 단계)

### 화면 설명
```
Scopes for Google APIs

Your app is requesting access to sensitive info.
Add or remove scopes to limit access.

[ADD OR REMOVE SCOPES]
```

### 5-1. Scopes 추가 버튼 클릭
**[ADD OR REMOVE SCOPES]** 버튼 클릭

### 5-2. 팝업 창에서 스코프 찾기

팝업 창이 열리면 다음과 같은 테이블이 보입니다:
```
┌──────────────────────────────────────────────────┐
│ Filter                                           │
│ [검색창                                        ] │
│                                                  │
│ ☐ API          Scope                Description │
│ ☐ Google...    .../auth/userinfo.email   ...    │
│ ☐ Google...    .../auth/userinfo.profile ...    │
│ ☐ OpenID       openid                    ...    │
└──────────────────────────────────────────────────┘
```

### 5-3. 필요한 스코프 3개 선택

#### 방법 1: 검색해서 찾기
1. 검색창에 `userinfo.email` 입력
2. 나타나는 항목의 체크박스(☐) 클릭 → ☑
3. 검색창 지우고 `userinfo.profile` 입력
4. 나타나는 항목의 체크박스 클릭
5. 검색창 지우고 `openid` 입력
6. 나타나는 항목의 체크박스 클릭

#### 방법 2: 스크롤해서 찾기
스크롤을 내리면서 다음 3개를 찾아서 체크:
- ☑ `.../auth/userinfo.email`
- ☑ `.../auth/userinfo.profile`
- ☑ `openid`

### 5-4. 선택 완료
1. 3개 모두 체크했는지 확인
2. 팝업 하단의 **[UPDATE]** 버튼 클릭
3. 메인 화면으로 돌아옴
4. **[SAVE AND CONTINUE]** 버튼 클릭

---

## 📍 STEP 6: Test users 추가 (3/4 단계)

### 화면 설명
```
Test users

Add test users to allow them to access your app
while it's in testing.

[+ ADD USERS]

Email addresses
(No test users added)
```

### 6-1. 테스트 사용자 추가 (개발 중 필수!)

**[+ ADD USERS]** 버튼 클릭

### 6-2. 이메일 입력

팝업 창:
```
┌─────────────────────────────────┐
│ Add users                       │
│                                 │
│ Enter email addresses           │
│ ┌─────────────────────────────┐ │
│ │ your-email@gmail.com        │ │
│ │                             │ │
│ └─────────────────────────────┘ │
│                                 │
│        [CANCEL]  [ADD]          │
└─────────────────────────────────┘
```

1. 본인의 Gmail 주소 입력
2. 여러 명 추가하려면 Enter 후 다음 이메일 입력
3. **[ADD]** 버튼 클릭

### 6-3. 저장
**[SAVE AND CONTINUE]** 버튼 클릭

> 💡 **왜 필요한가요?**
> - 앱을 퍼블리시하기 전까지는 여기 추가된 사용자만 로그인 가능
> - 본인을 꼭 추가해야 테스트할 수 있습니다!

---

## 📍 STEP 7: Summary 확인 (4/4 단계)

### 화면 내용
입력한 모든 정보가 요약되어 표시됩니다:

```
OAuth consent screen
✓ App information
  App name: Retro Game Portal
  User support email: your-email@gmail.com
  ...

✓ Scopes
  .../auth/userinfo.email
  .../auth/userinfo.profile
  openid

✓ Test users
  your-email@gmail.com
```

### 확인 및 완료
1. 정보가 맞는지 확인
2. **[BACK TO DASHBOARD]** 버튼 클릭

---

## 📍 STEP 8: 앱 상태 확인

### Dashboard 화면
```
┌─────────────────────────────────────────┐
│ OAuth consent screen                    │
│                                         │
│ Publishing status: Testing              │
│ [PUBLISH APP]                           │
│                                         │
│ App information                         │
│ App name: Retro Game Portal             │
│ ...                                     │
└─────────────────────────────────────────┘
```

### 현재 상태: Testing
- ✅ Test users에 추가된 사용자만 로그인 가능
- ✅ 개발 및 테스트 가능
- ⏸️ 일반 사용자는 로그인 불가

### 프로덕션 배포 시 (나중에)
**[PUBLISH APP]** 버튼 클릭하면:
- ✅ 모든 Google 계정 사용자가 로그인 가능
- ✅ 앱이 공개됨

> ⚠️ **지금은 퍼블리시하지 마세요!**
> - 개발이 완료되고 테스트가 끝난 후에 퍼블리시하세요

---

## 📍 STEP 9: OAuth Client ID 설정

### 9-1. Credentials 메뉴로 이동
왼쪽 메뉴에서:
```
APIs & Services
  ├─ Dashboard
  ├─ Library
  ├─ Credentials        ← 이것 클릭!
  ├─ OAuth consent screen
  └─ ...
```

### 9-2. 기존 클라이언트 찾기

화면에 다음과 같은 섹션이 있습니다:
```
OAuth 2.0 Client IDs
┌────────────────────────────────────────┐
│ Name                          Type     │
│ Web client (auto created...)  Web app │
└────────────────────────────────────────┘
```

**"Web client (auto created by Google Service)"** 클릭

### 9-3. 설정 화면

```
┌─────────────────────────────────────────┐
│ Edit OAuth client                       │
│                                         │
│ Name                                    │
│ [Web client (auto created by Google...] │
│                                         │
│ Authorized JavaScript origins           │
│ [URI 1                                ] │
│ [+ ADD URI]                             │
│                                         │
│ Authorized redirect URIs                │
│ [URI 1                                ] │
│ [+ ADD URI]                             │
│                                         │
│         [CANCEL]  [SAVE]                │
└─────────────────────────────────────────┘
```

### 9-4. Authorized JavaScript origins 추가

1. **[+ ADD URI]** 클릭
2. 입력창에 `http://localhost:5173` 입력
3. 다시 **[+ ADD URI]** 클릭
4. 입력창에 배포 URL 입력 (예: `https://your-app.pages.dev`)

결과:
```
Authorized JavaScript origins
[http://localhost:5173                    ]
[https://your-app.pages.dev               ]
[+ ADD URI]
```

### 9-5. Authorized redirect URIs 추가

1. **[+ ADD URI]** 클릭
2. `http://localhost:5173` 입력
3. **[+ ADD URI]** 클릭
4. 배포 URL 입력 (예: `https://your-app.pages.dev`)
5. **[+ ADD URI]** 클릭
6. **중요!** Firebase 리다이렉트 URI 입력:
   ```
   https://gameportal-bd7a6.firebaseapp.com/__/auth/handler
   ```

결과:
```
Authorized redirect URIs
[http://localhost:5173                                        ]
[https://your-app.pages.dev                                   ]
[https://gameportal-bd7a6.firebaseapp.com/__/auth/handler    ]
[+ ADD URI]
```

### 9-6. 저장
하단의 **[SAVE]** 버튼 클릭

> ✅ **성공 메시지**
> "OAuth client updated" 또는 유사한 메시지가 표시됩니다

---

## 📍 STEP 10: Firebase 승인된 도메인 추가

### 10-1. Firebase Console 열기
새 탭에서:
```
https://console.firebase.google.com/
```

### 10-2. 프로젝트 선택
**gameportal-bd7a6** 프로젝트 클릭

### 10-3. Authentication 메뉴
왼쪽 메뉴에서:
```
⚡ Build
  ├─ Authentication    ← 이것 클릭!
  ├─ Firestore Database
  └─ ...
```

### 10-4. Settings 탭
상단 탭에서:
```
Users | Sign-in method | Templates | Usage | Settings
                                              ^^^^^^^^
```
**Settings** 클릭

### 10-5. Authorized domains 섹션

스크롤을 내려서 찾습니다:
```
Authorized domains

Domains that are allowed to use Firebase Auth

localhost                              [DELETE]
gameportal-bd7a6.firebaseapp.com      [DELETE]
[+ Add domain]
```

### 10-6. 도메인 추가
1. **[+ Add domain]** 클릭
2. 팝업에 배포 URL 입력 (예: `your-app.pages.dev`)
3. **[Add]** 버튼 클릭

> 💡 **주의사항**
> - `https://` 제외하고 도메인만 입력
> - 예: `your-app.pages.dev` (O)
> - 예: `https://your-app.pages.dev` (X)

---

## ✅ 완료! 이제 테스트하세요

### 로컬 테스트
1. 터미널 열기
2. 프로젝트 폴더로 이동
3. 실행:
   ```bash
   npm run dev
   ```
4. 브라우저에서 `http://localhost:5173` 접속
5. **LOGIN** 버튼 클릭
6. Google 계정 선택
7. 권한 동의 (처음 한 번만)
8. 로그인 성공!

### 예상되는 화면 흐름

#### 1단계: 계정 선택
```
┌─────────────────────────────────┐
│ Choose an account               │
│                                 │
│ ○ your-email@gmail.com          │
│   Your Name                     │
│                                 │
│ ○ Use another account           │
└─────────────────────────────────┘
```

#### 2단계: 권한 동의 (처음만)
```
┌─────────────────────────────────┐
│ Retro Game Portal wants to      │
│ access your Google Account      │
│                                 │
│ This will allow Retro Game      │
│ Portal to:                      │
│                                 │
│ ✓ See your email address        │
│ ✓ See your personal info        │
│                                 │
│      [Cancel]  [Allow]          │
└─────────────────────────────────┘
```

#### 3단계: 로그인 완료
헤더에 사용자 정보 표시:
```
[프로필 사진] Your Name  [LOGOUT]
```

---

## 🆘 문제 해결

### "앱이 확인되지 않음" 경고

**화면:**
```
┌─────────────────────────────────┐
│ ⚠️ This app isn't verified      │
│                                 │
│ This app hasn't been verified   │
│ by Google yet.                  │
│                                 │
│ [Back to safety]                │
│                                 │
│ Advanced ▼                      │
└─────────────────────────────────┘
```

**해결:**
1. **Advanced** 클릭
2. **Go to Retro Game Portal (unsafe)** 링크 클릭
3. 계속 진행

> 💡 **왜 이런 경고가?**
> - 앱이 Testing 상태이기 때문
> - Test users에 추가된 사용자는 이 경고를 무시하고 진행 가능
> - 앱을 퍼블리시하면 경고가 사라집니다

### "redirect_uri_mismatch" 에러

**에러 메시지:**
```
Error 400: redirect_uri_mismatch
```

**원인:**
- Authorized redirect URIs에 현재 URL이 없음

**해결:**
1. Google Cloud Console > Credentials 재확인
2. Authorized redirect URIs에 다음이 모두 있는지 확인:
   - `http://localhost:5173`
   - `https://gameportal-bd7a6.firebaseapp.com/__/auth/handler`
3. 없으면 추가하고 저장

### 팝업이 열리지 않음

**증상:**
- LOGIN 버튼 클릭해도 아무 일도 안 일어남

**원인:**
- 브라우저가 팝업을 차단

**해결:**
1. 주소창 오른쪽에 팝업 차단 아이콘 확인
2. "항상 허용" 선택
3. 또는 잠시 기다리면 자동으로 리다이렉트 방식으로 전환됨

### "auth/unauthorized-domain" 에러

**에러 메시지:**
```
auth/unauthorized-domain
```

**원인:**
- Firebase Authorized domains에 현재 도메인이 없음

**해결:**
1. Firebase Console > Authentication > Settings
2. Authorized domains 확인
3. 현재 도메인 추가

---

## 📋 최종 체크리스트

설정이 완료되었는지 확인하세요:

### Google Cloud Console
- [ ] OAuth consent screen 설정 완료
  - [ ] User type: External 선택
  - [ ] App name: Retro Game Portal
  - [ ] User support email 입력
  - [ ] Developer contact email 입력
  - [ ] Scopes 3개 추가 (email, profile, openid)
  - [ ] Test users에 본인 추가

- [ ] OAuth Client ID 설정 완료
  - [ ] Authorized JavaScript origins 추가
    - [ ] `http://localhost:5173`
    - [ ] 배포 도메인
  - [ ] Authorized redirect URIs 추가
    - [ ] `http://localhost:5173`
    - [ ] 배포 도메인
    - [ ] Firebase 리다이렉트 URI

### Firebase Console
- [ ] Authentication 활성화
  - [ ] Google 로그인 활성화
  - [ ] Authorized domains에 배포 도메인 추가

### 테스트
- [ ] 로컬에서 로그인 성공
- [ ] 사용자 정보 표시 확인
- [ ] 로그아웃 동작 확인

---

## 🎉 축하합니다!

OAuth 동의 화면 설정이 완료되었습니다!

이제 다음을 할 수 있습니다:
- ✅ 로컬 개발 환경에서 Google 로그인 사용
- ✅ Test users로 추가된 사용자 로그인 가능
- ✅ 게임 점수 저장 및 리더보드 사용

### 다음 단계
1. 게임 개발 계속하기
2. 충분히 테스트하기
3. Cloudflare Pages에 배포하기
4. 배포 후 OAuth consent screen에서 **PUBLISH APP** 클릭
5. 모든 사용자에게 공개!

---

**도움이 더 필요하신가요?**
- Firebase 문서: https://firebase.google.com/docs/auth
- Google Cloud 문서: https://cloud.google.com/docs
- 또는 저에게 질문하세요! 😊
