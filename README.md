# PURE(Privacy, Unlearning, and Robust Engineering Lab) Website

중앙대학교 **PURE(Privacy, Unlearning, and Robust Engineering Lab)**의 공식 홈페이지 프로젝트입니다.
노승민 교수님 지도하에 **Privacy-Preserving AI, Machine Unlearning, Robust AI Engineering** 분야를 연구하는 연구실의 정보를 제공합니다.

🔗 **Live Site:** https://pure.cau.ac.kr/ (GitHub Pages 커스텀 도메인)

> **도메인 현황 (2026-09-17 전환 완료)**
> - 커스텀 도메인 `pure.cau.ac.kr`의 Let's Encrypt 인증서가 발급되었고(2026-09-16, 만료 2026-12-16),
>   **Enforce HTTPS가 켜져 있어 `http://`는 `https://`로 301 이동한다.**
> - 코드의 정본 URL 4곳(`scripts/site.cjs`의 `SITE_URL`, `src/constants.tsx`의 `LAB_URL`,
>   `package.json`의 `homepage`, `index.html`의 canonical/og/JSON-LD)은 모두 `https://pure.cau.ac.kr`로 전환했다.
> - `https://cau-purelab.github.io/`는 커스텀 도메인으로 301 이동한다(GitHub Pages 기본 동작).
> - 커스텀 도메인은 `public/CNAME`에도 기록해 둔다 — 설정이 유실되면 이 파일이 복구 근거다.
> - 장애 점검: `curl -sIv https://pure.cau.ac.kr/` (인증서 subject가 `CN=pure.cau.ac.kr`이면 정상)

---

## 🛠 Tech Stack (기술 스택)

- **Framework**: React 19 (TypeScript)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v7
- **SEO**: React Helmet Async
- **Icons**: Lucide React
- **Deployment**: GitHub Pages

---

## 📂 Project Structure (폴더 구조)

```bash
├── public/
│   ├── assets/          # 배포되는 정적 이미지 (Vite가 최적화하지 않고 그대로 복사)
│   │   ├── *.jpg            # 구성원 프로필 사진 (파일명 = MEMBERS의 name)
│   │   ├── hero.webp        # Home 히어로 배경 (1400×933)
│   │   ├── privacy-preserving-ai.webp    # 연구 분야 일러스트 3장 (각 1600×900,
│   │   ├── machine-unlearning.webp       #   파일명 = RESEARCH_AREAS의 id)
│   │   ├── robust-ai-engineering.webp    #
│   │   ├── favicon-16.png / favicon-32.png / favicon.png  # 파비콘 3종 (16·32·512px)
│   │   └── og-image.png     # Open Graph 대표 이미지 (1200×630)
│   ├── CNAME            # 커스텀 도메인 (설정 유실 시 복구 근거)
│   └── .nojekyll        # GitHub Pages의 Jekyll 처리 비활성화
├── src/
│   ├── components/      # 재사용 가능한 UI 컴포넌트
│   │   ├── Navbar.tsx       # 상단 네비게이션
│   │   ├── Footer.tsx       # 하단 정보 (빌드일 표시)
│   │   ├── Logo.tsx         # 브랜드 마크/락업 (LogoMark·LogoLockup — 내비와 푸터가 공유)
│   │   ├── PageHeader.tsx   # 페이지 공용 헤더 (eyebrow/h1/설명/액션)
│   │   └── SEO.tsx          # 메타태그 및 Open Graph 설정
│   ├── pages/           # 각 라우트별 페이지
│   │   ├── Home.tsx         # 메인 (통계, 최신 뉴스 4건, 채용 공고)
│   │   ├── Research.tsx     # 연구 분야 소개 및 저장소 링크
│   │   ├── People.tsx       # 구성원 소개 (직급별 분류)
│   │   ├── Publications.tsx # 주요 논문 하이라이트
│   │   ├── ScholarPublications.tsx # 전체 논문 아카이브, citation/JCR 표시
│   │   ├── News.tsx         # 전체 뉴스 아카이브 (연도별 그룹화)
│   │   └── NotFound.tsx     # 404 페이지 (noindex로 내보내 soft-404 색인 방지)
│   ├── lib/
│   │   ├── bibtex.ts        # BibTeX 파싱·저자 표기 유틸 (논문을 그리는 세 페이지가 공유)
│   │   └── clipboard.ts     # 클립보드 복사 (비보안 오리진·구형 브라우저용 폴백 포함)
│   ├── data/
│   │   └── publications.json # 교수별 전체 논문, 진행 중 논문, citation/JCR 지표
│   ├── constants.tsx    # ⚡ 핵심 데이터 파일 (멤버, 논문, 뉴스 등 데이터 관리)
│   ├── types.ts         # TypeScript 인터페이스 정의
│   ├── App.tsx          # 라우팅 설정
│   ├── main.tsx         # 진입점 (HelmetProvider 설정)
│   ├── index.css        # Tailwind 지시문 + 전역 스타일 (내비 높이, 히어로 애니메이션, 동작 줄이기)
│   └── vite-env.d.ts    # Vite 클라이언트 타입 + __BUILD_DATE__ 선언
├── scripts/
│   ├── site.cjs                   # 정본 URL(SITE_URL) + 라우트 목록의 단일 출처, 설정 정합성 검사
│   ├── create-pages-404.cjs       # 라우트별 정적 HTML + 404.html + sitemap.xml + robots.txt 생성
│   ├── create-rss.cjs             # NEWS 배열 → dist/feed.xml (RSS 2.0)
│   ├── validate_data.cjs          # publications.json 무결성 검증 (배포 전 CI 게이트)
│   ├── sync_scholar.cjs           # Google Sites/Scholar 대조 → 논문 데이터 동기화 (주간 워크플로가 실행)
│   ├── update_scholar_metrics.cjs # Google Scholar citation 및 공개 JCR 라벨 갱신
│   ├── lib.cjs                    # 스크립트 공용 유틸 (fetchText/normalize/titlesMatch 등)
│   └── patch_publications.py      # 논문 데이터 일회성 수정/보강 (Python)
├── .github/
│   ├── workflows/
│   │   ├── deploy.yml             # main push → 검증·타입체크·빌드·배포·스모크 테스트
│   │   ├── ci.yml                 # PR 검증 (배포 없이 같은 게이트 + 산출물·번들 예산 점검)
│   │   └── sync-scholar.yml       # 매주 월요일 논문 데이터 동기화 PR
│   └── dependabot.yml             # 의존성·액션 버전 자동 갱신 PR 설정 (npm major는 제외)
├── docs/
│   └── archive-cleanup-2026-09.md # 논문 아카이브 1회성 정리 기록 (제거·보류 판단 근거)
├── CLAUDE.md            # 작업 가이드 (규칙, 아키텍처, 알려진 한계, 작업 이력)
├── CREDITS.md           # 배포 이미지의 출처·라이선스 기록 — 이미지 추가 시 함께 갱신
├── LICENSE              # MIT
├── index.html           # SPA 진입 HTML. SEO 메타·JSON-LD의 원본이며 빌드가 라우트별 값으로 치환한다
├── package.json         # 스크립트 6개 (dev / build / build:pages / preview / typecheck / validate)
├── vite.config.ts       # base path, 코드 분할, __BUILD_DATE__ 주입
├── tsconfig.json        # TypeScript 설정 (tsconfig.node.json은 빌드 도구용)
├── postcss.config.js    # Tailwind·autoprefixer 파이프라인
├── tailwind.config.js   # 스타일링 설정
├── .npmrc               # legacy-peer-deps=true — React 19 peer-deps 충돌 회피
└── .gitattributes       # 저장소에는 LF로만 저장, 바이너리 자산은 변환 금지
```

---

## 📝 Features (주요 기능)

1.  **Home (`/`)**
    *   연구실 소개 및 Hero 섹션
    *   실시간 연구 실적 통계 (Publications, Researchers 수 자동 계산)
    *   최신 뉴스 (최근 4건) 및 채용 공고(Join Us) 섹션

2.  **Research (`/research`)**
    *   주요 연구 분야 소개 (Privacy-Preserving AI, Machine Unlearning, Robust AI Engineering)
    *   연구 분야별 설명 및 관련 리소스 링크 제공

3.  **People (`/people`)**
    *   직급별 멤버 분류 (PI, Co-PI, PhD, Master, Undergraduate)
    *   이메일, 웹사이트, GitHub 링크를 텍스트 형태로 깔끔하게 제공
    *   PI/Co-PI 카드의 Publications 모달에서 논문, BibTeX, citation, JCR 라벨 표시

4.  **Publications (`/publications`)**
    *   `src/constants.tsx`의 `PUBLICATIONS` 배열 기반 주요 논문 하이라이트
    *   연구실 멤버 저자 강조 표시
    *   전체 아카이브(`/scholar`)로 이동하는 링크 제공

5.  **Scholar (`/scholar`)**
    *   `src/data/publications.json` 기반 전체 논문 아카이브
    *   교수별 탭(Seungmin Rho / Mi Young Lee)
    *   펀딩 태그 필터, 검색, 연도/제목/펀딩 정렬
    *   Google Scholar citation 수와 공개 Google Sites JCR 라벨 표시
    *   BibTeX 인용구 보기 및 원클릭 복사 기능
    *   진행 중 논문은 `is_progress: true`로 구분

6.  **News (`/news`)**
    *   연구실의 모든 소식을 연도별로 정리하여 제공

7.  **SEO & Sharing**
    *   Open Graph 적용: 카카오톡, 슬랙 등 링크 공유 시 연구실 미리보기 카드(이미지/설명) 표시
    *   빌드 시 `scripts/create-pages-404.cjs`가 라우트별 정적 HTML(`research.html`, `people.html` …)을 만든다.
        GitHub Pages가 확장자 없는 경로를 이 파일로 200 서빙하므로 딥링크가 404가 되지 않고,
        JS를 실행하지 않는 크롤러·링크 미리보기 스크래퍼도 페이지별 title/description/og 태그를 본다.
    *   `sitemap.xml`·`robots.txt`·`feed.xml`도 같은 빌드 단계에서 `scripts/site.cjs`의 `SITE_URL` 기준으로 생성된다
        (public/ 에 정적 파일로 두지 않는다 — 도메인이 코드 여러 곳에 흩어지는 것을 막기 위함).

---

## ⚙️ Data Management (데이터 수정 방법)

이 프로젝트는 별도의 백엔드 없이 정적 데이터 파일을 직접 관리합니다.

*   **멤버 추가/수정**: `MEMBERS` 배열 수정. (이미지는 `public/assets`에 넣고 경로 지정)
*   **주요 논문 업데이트**: `src/constants.tsx`의 `PUBLICATIONS` 배열에 객체 추가.
*   **전체 Scholar 아카이브 업데이트**: `src/data/publications.json`의 교수별 배열 수정.
*   **진행 중 논문**: `{ title, author, journal, status, funding_tags, year, is_progress: true }` 형태로 추가.
*   **성과 지표 업데이트**: `node scripts/update_scholar_metrics.cjs` 실행.
    *   `citations`: Google Scholar 프로필의 citation 수
    *   `jcr`: 공개 Google Sites에 표시된 `SCIE/SSCI ... Top ...%` 라벨
    *   `jcr_source`: JCR 라벨을 가져온 공개 페이지 URL
*   **뉴스 업데이트**: `NEWS` 배열에 소식 추가. **화면은 배열 순서를 그대로 쓰므로 최신 항목을 배열 맨 위에 넣을 것**
    (정렬해 주는 코드는 RSS 생성 스크립트뿐이다).
*   **연구 분야 수정**: `RESEARCH_AREAS` 배열 수정.

---

## 🚀 Getting Started (설치 및 실행)

로컬 환경에서 프로젝트를 실행하려면 다음 순서를 따르세요.

1.  **저장소 클론**
    ```bash
    git clone https://github.com/cau-purelab/cau-purelab.github.io.git
    cd cau-purelab.github.io
    ```

2.  **패키지 설치**
    (React 19 호환성을 위해 `--legacy-peer-deps` 옵션 사용 권장)
    ```bash
    npm install --legacy-peer-deps
    ```

3.  **개발 서버 실행**
    ```bash
    npm run dev
    ```
    브라우저에서 `http://localhost:5173` 접속

4.  **빌드 (배포용)**
    ```bash
    npm run build:pages   # vite build + 라우트별 HTML/404/sitemap/robots/feed 생성 (CI와 동일)
    ```
    `npm run build`는 vite 빌드만 하므로 배포 산출물 검증에는 `build:pages`를 쓸 것.

5.  **커밋 전 검증**
    ```bash
    npm run typecheck   # tsc --noEmit (CI 게이트와 동일)
    npm run validate    # 정본 URL 정합성 + publications.json 무결성
    ```

    > Windows와 WSL은 `node_modules`를 공유할 수 없다(네이티브 rollup 바이너리가 다름).
    > 환경을 바꿔 작업할 때는 `rm -rf node_modules && npm ci --legacy-peer-deps`.

6.  **Scholar 성과 지표 갱신**
    ```bash
    node scripts/update_scholar_metrics.cjs
    ```
    Google Scholar citation 수와 공개 Google Sites JCR 라벨을 `src/data/publications.json`에 반영합니다.

---

## ☁️ Deployment (배포)

이 프로젝트는 **GitHub Pages** organization site로 배포됩니다.

1.  GitHub의 `main` 브랜치에 코드를 푸시(Push)합니다. **main push = 즉시 라이브 반영**입니다.
2.  **Settings > Pages > Build and deployment > Source**가 `GitHub Actions`여야 합니다.
3.  `.github/workflows/deploy.yml`이 다음 순서로 실행됩니다.
    `site.cjs 설정 검증` → `validate_data.cjs` → `npm ci` → `npm run typecheck` → `npm run build:pages`
    → Pages 배포 → **스모크 테스트**(홈·딥링크 5개·feed.xml·sitemap.xml·robots.txt가 200인지 확인)
4.  스모크 테스트가 실패하면 워크플로가 빨간불이 됩니다 — 딥링크 404 회귀를 여기서 잡습니다.
5.  `deploy.yml`은 main push에만 반응하므로, **PR 검증은 `.github/workflows/ci.yml`**이 맡습니다.
    배포 없이 같은 게이트(설정·데이터 검증 → 타입체크 → `build:pages`)를 돌리고,
    추가로 빌드 산출물(라우트별 HTML·canonical 구분·404 noindex)과 초기 번들 예산(gzip 130KB)을 확인합니다.

### 필요한 저장소 설정 (코드로 못 고치는 것)

*   **Settings → Actions → General → Workflow permissions**
    → `Allow GitHub Actions to create and approve pull requests` **켜기**.
    꺼져 있으면 주간 Scholar 동기화(`sync-scholar.yml`)가 PR 생성 단계에서 매번 실패하고,
    데이터는 `auto/scholar-sync` 브랜치에만 쌓입니다. 실패 시 워크플로가 이슈를 자동 생성합니다.
*   **Settings → Pages → Custom domain**: `pure.cau.ac.kr` (인증서 발급 후 `Enforce HTTPS` 체크)

### 도메인 전환 이력 (2026-09-17 완료)

1.  인증서 발급 확인 — `curl -sIv https://pure.cau.ac.kr/` 의 subject가 `CN=pure.cau.ac.kr`. ✅
2.  Settings → Pages → **Enforce HTTPS** 켬. ✅
3.  도메인 문자열 4곳을 `https://pure.cau.ac.kr`로 교체. ✅
    (`scripts/site.cjs`의 `SITE_URL`, `src/constants.tsx`의 `LAB_URL`, `package.json`의 `homepage`,
    `index.html`의 canonical / og:url / og:image / twitter:image / JSON-LD `url`·`logo`)
    **한 곳만 바꾸면 빌드가 실패한다** — `scripts/site.cjs`가 `LAB_URL`과 대조하고,
    `create-pages-404.cjs`가 index.html의 잔여 도메인을 검사한다.
4.  `npm run build:pages`로 `dist/sitemap.xml`·`feed.xml`·라우트 HTML의 URL이 모두 바뀐 것을 확인. ✅
5.  배포 후 Google Search Console에 sitemap 재제출 — **미완료** (아래 "검색엔진 등록" 참고).

### 검색엔진 등록 (아직 미등록)

색인 상태와 딥링크 오류를 확인할 창구가 없으므로 다음 두 곳에 등록할 것.

*   **Google Search Console**: 도메인 속성으로 등록하고 대학 DNS 담당에 검증용 TXT 레코드를 신청한다.
    커스텀 도메인 인증서 신청과 같은 티켓으로 묶는 편이 좋다
    (조직 도메인 검증용 `_github-pages-challenge-cau-purelab` TXT도 함께 신청하면 서브도메인 탈취를 막는다).
*   **Naver Search Advisor**: 루트 경로만으로 검증되므로 지금도 등록 가능하다.
    발급받은 토큰을 `index.html`의 `TODO(lab): 검색엔진 등록` 주석에 있는 메타 태그에 넣고 주석을 해제한다.

---

## 📞 Contact

*   **Principal Investigator**: Prof. Seungmin Rho
*   **Email**: purelab.cau@gmail.com
*   **Location**: Room B105-1, Bldg. 310, Chung-Ang University, Seoul, Korea
