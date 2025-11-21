# Cloudflare Pages 배포 가이드

Retro Game Portal을 Cloudflare Pages에 배포하는 방법입니다.

## 1. Cloudflare Pages 프로젝트 생성

1. [Cloudflare Dashboard](https://dash.cloudflare.com)에 로그인합니다.
2. 왼쪽 메뉴에서 **Workers & Pages**를 클릭합니다.
3. **Create application** 버튼을 클릭합니다.
4. **Pages** 탭을 선택하고 **Connect to Git**을 클릭합니다.
5. GitHub 계정을 연결하고, 방금 업로드한 `GamePortal` 저장소를 선택합니다.
6. **Begin setup**을 클릭합니다.

## 2. 빌드 설정 (Build Settings)

설정 화면에서 다음 항목을 확인하고 선택하세요:

- **Project name**: 원하는 이름 (예: `retro-game-portal`)
- **Production branch**: `main`
- **Framework preset**: `Vite` 선택 (중요!)
- **Build command**: `npm run build` (자동 설정됨)
- **Build output directory**: `dist` (자동 설정됨)

설정이 맞다면 **Save and Deploy**를 클릭합니다.
잠시 후 배포가 완료되면 `https://retro-game-portal.pages.dev`와 같은 주소가 생성됩니다.

## 3. Firebase 인증 도메인 추가 (필수!)

배포된 사이트에서 구글 로그인이 작동하려면, Firebase에 배포된 도메인을 허용해줘야 합니다.

1. [Firebase Console](https://console.firebase.google.com)에 접속합니다.
2. 프로젝트(`gameportal`)를 선택합니다.
3. 왼쪽 메뉴에서 **Authentication** > **Settings** 탭으로 이동합니다.
4. **Authorized domains** 섹션에서 **Add domain**을 클릭합니다.
5. Cloudflare에서 생성된 도메인 주소(예: `retro-game-portal.pages.dev`)를 입력하고 추가합니다.

## 4. 완료

이제 배포된 주소로 접속하여 게임을 즐길 수 있습니다! 🚀
