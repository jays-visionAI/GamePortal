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

---

# GitHub Actions + Cloudflare Pages 자동 배포

GitHub 저장소에 push 하면 Cloudflare Pages로 자동 배포되도록 설정할 수 있습니다.

## 1. GitHub 리포 연결

1. GitHub에서 새 리포지터리를 생성합니다. (예: `GamePortal`)
2. 로컬에서 원격을 등록하고 푸시합니다.
   ```bash
   git remote add origin git@github.com:<your-account>/GamePortal.git
   git push -u origin main
   ```

## 2. GitHub Secrets 설정

리포지터리 **Settings > Secrets and variables > Actions**에서 다음 3개를 추가합니다.

- `CLOUDFLARE_API_TOKEN`: Pages에 Deploy 권한이 포함된 토큰
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare Account ID
- `CLOUDFLARE_PAGES_PROJECT_NAME`: Cloudflare Pages 프로젝트 이름 (예: `retro-game-portal`)

토큰 생성: Cloudflare Dashboard → **My Profile** → **API Tokens** → **Create Token** → **Pages** 템플릿 선택 → Account 범위 지정 → 생성 후 위 값 사용.

## 3. Actions 워크플로 확인

`.github/workflows/cloudflare-pages.yml`가 포함되어 있습니다. `main` 브랜치에 push 되면:

1. `npm ci` 후 `npm run build` 실행
2. `dist` 디렉터리를 Cloudflare Pages에 배포

수동 배포가 필요하면 **Actions > Deploy to Cloudflare Pages > Run workflow**로 실행할 수 있습니다.

## 4. Cloudflare 도메인 Firebase에 추가

위 자동 배포로 생성된 Pages 도메인도 Firebase Authentication의 **Authorized domains**에 추가해야 구글 로그인이 동작합니다. (섹션 3 참고)
