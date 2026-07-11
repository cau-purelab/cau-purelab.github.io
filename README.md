# PURE(Privacy, Unlearning, and Robust Engineering Lab) Website

중앙대학교 **PURE(Privacy, Unlearning, and Robust Engineering Lab)**의 공식 홈페이지 프로젝트입니다.
노승민 교수님 지도하에 **Privacy-Preserving AI, Machine Unlearning, Robust AI Engineering** 분야를 연구하는 연구실의 정보를 제공합니다.

🔗 **Live Site:** [https://cau-purelab.github.io/](https://cau-purelab.github.io/)

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
│   └── assets/          # 연구원 프로필 이미지 및 Open Graph 대표 이미지
├── src/
│   ├── components/      # 재사용 가능한 UI 컴포넌트
│   │   ├── Navbar.tsx       # 상단 네비게이션
│   │   ├── Footer.tsx       # 하단 정보
│   │   └── SEO.tsx          # 메타태그 및 Open Graph 설정
│   ├── pages/           # 각 라우트별 페이지
│   │   ├── Home.tsx         # 메인 (통계, 최신 뉴스 4건, 채용 공고)
│   │   ├── Research.tsx     # 연구 분야 소개 및 저장소 링크
│   │   ├── People.tsx       # 구성원 소개 (직급별 분류)
│   │   ├── Publications.tsx # 주요 논문 하이라이트
│   │   ├── ScholarPublications.tsx # 전체 논문 아카이브, citation/JCR 표시
│   │   └── News.tsx         # 전체 뉴스 아카이브 (연도별 그룹화)
│   ├── data/
│   │   └── publications.json # 교수별 전체 논문, 진행 중 논문, citation/JCR 지표
│   ├── constants.tsx    # ⚡ 핵심 데이터 파일 (멤버, 논문, 뉴스 등 데이터 관리)
│   ├── types.ts         # TypeScript 인터페이스 정의
│   ├── App.tsx          # 라우팅 설정
│   └── main.tsx         # 진입점 (HelmetProvider 설정)
├── scripts/
│   ├── fetch_scholar.py           # Google Scholar 논문 수집 + 진행 중 논문 병합
│   ├── patch_publications.py      # 논문 데이터 일회성 수정/보강
│   ├── update_scholar_metrics.cjs # Google Scholar citation 및 공개 JCR 라벨 갱신
│   └── create-pages-404.cjs       # GitHub Pages SPA 폴백(404.html) 생성
└── tailwind.config.js   # 스타일링 설정
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
*   **뉴스 업데이트**: `NEWS` 배열에 소식 추가 (자동으로 최신순 정렬됨).
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
    npm run build
    ```

5.  **Scholar 성과 지표 갱신**
    ```bash
    node scripts/update_scholar_metrics.cjs
    ```
    Google Scholar citation 수와 공개 Google Sites JCR 라벨을 `src/data/publications.json`에 반영합니다.

---

## ☁️ Deployment (배포)

이 프로젝트는 **GitHub Pages** user/organization site로 배포됩니다. 기본 공개 URL은 `https://cau-purelab.github.io/`입니다.

1.  GitHub의 `main` 브랜치에 코드를 푸시(Push)합니다.
2.  GitHub 저장소의 **Settings > Pages**로 이동합니다.
3.  **Build and deployment > Source**를 `GitHub Actions`로 설정합니다.
4.  `.github/workflows/deploy.yml` 워크플로우가 자동으로 빌드하고 Pages에 배포합니다.
5.  이후 `git push`를 할 때마다 자동으로 재배포됩니다.

---

## 📞 Contact

*   **Principal Investigator**: Prof. Seungmin Rho
*   **Email**: purelab.cau@gmail.com
*   **Location**: Room B105-1, Bldg. 310, Chung-Ang University, Seoul, Korea
