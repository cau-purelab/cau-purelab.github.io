# Security Visual Intelligence Lab (SVIL) Website

중앙대학교 **Security Visual Intelligence Lab (SVIL)**의 공식 홈페이지 프로젝트입니다.
노승민 교수님 지도하에 **AI Security, Machine Unlearning, Trustworthy AI** 분야를 연구하는 연구실의 정보를 제공합니다.

🔗 **Live Demo:** [https://security-visual-intelligence-lab-ho.vercel.app/](https://security-visual-intelligence-lab-ho.vercel.app/)

---

## 🛠 Tech Stack (기술 스택)

- **Framework**: React 19 (TypeScript)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **SEO**: React Helmet Async
- **Icons**: Lucide React
- **Deployment**: Vercel

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
│   │   ├── People.tsx       # 구성원 소개 (직급별 분류, 졸업생 분리)
│   │   ├── Publications.tsx # 논문 실적 (연도별 탭 필터링)
│   │   └── News.tsx         # 전체 뉴스 아카이브 (연도별 그룹화)
│   ├── constants.tsx    # ⚡ 핵심 데이터 파일 (멤버, 논문, 뉴스 등 데이터 관리)
│   ├── types.ts         # TypeScript 인터페이스 정의
│   ├── App.tsx          # 라우팅 설정
│   └── main.tsx         # 진입점 (HelmetProvider 설정)
└── tailwind.config.js   # 스타일링 설정
```

---

## 📝 Features (주요 기능)

1.  **Home (`/`)**
    *   연구실 소개 및 Hero 섹션
    *   실시간 연구 실적 통계 (Publications, Researchers 수 자동 계산)
    *   최신 뉴스 (최근 4건) 및 채용 공고(Join Us) 섹션

2.  **Research (`/research`)**
    *   주요 연구 분야 소개 (Machine Unlearning, Secure CV, Trustworthy AI)
    *   GitHub 코드 저장소 및 데이터셋 미러 링크 제공

3.  **People (`/people`)**
    *   직급별 멤버 분류 (PI, PostDoc, PhD, Master, Undergraduate)
    *   졸업생(Alumni) 섹션 별도 분리
    *   이메일, 웹사이트, GitHub 링크를 텍스트 형태로 깔끔하게 제공

4.  **Publications (`/publications`)**
    *   **연도별 탭(Tabs)**을 통한 논문 필터링 (All Papers / 2025 / 2024 ...)
    *   BibTeX 인용구 보기 및 원클릭 복사 기능
    *   Top-tier 학회 및 저널 구분 태그

5.  **News (`/news`)**
    *   연구실의 모든 소식을 연도별로 정리하여 제공

6.  **SEO & Sharing**
    *   Open Graph 적용: 카카오톡, 슬랙 등 링크 공유 시 연구실 미리보기 카드(이미지/설명) 표시

---

## ⚙️ Data Management (데이터 수정 방법)

이 프로젝트는 별도의 백엔드 없이 **`src/constants.tsx`** 파일에서 모든 데이터를 관리합니다.

*   **멤버 추가/수정**: `MEMBERS` 배열 수정. (이미지는 `public/assets`에 넣고 경로 지정)
*   **논문 업데이트**: `PUBLICATIONS` 배열에 객체 추가.
*   **뉴스 업데이트**: `NEWS` 배열에 소식 추가 (자동으로 최신순 정렬됨).
*   **연구 분야 수정**: `RESEARCH_AREAS` 배열 수정.

---

## 🚀 Getting Started (설치 및 실행)

로컬 환경에서 프로젝트를 실행하려면 다음 순서를 따르세요.

1.  **저장소 클론**
    ```bash
    git clone https://github.com/cheonbung/security-visual-intelligence-lab-home.git
    cd security-visual-intelligence-lab-home
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

---

## ☁️ Deployment (배포)

이 프로젝트는 **Vercel**에 최적화되어 있습니다.

1.  GitHub의 `main` 브랜치에 코드를 푸시(Push)합니다.
2.  Vercel 대시보드에서 해당 리포지토리를 연결합니다.
3.  **Settings > Build & Development**에서 Install Command를 아래와 같이 설정합니다 (React 19 호환성 이슈 해결):
    *   Override: `On`
    *   Command: `npm install --legacy-peer-deps`
4.  이후 `git push`를 할 때마다 자동으로 재배포됩니다.

---

## 📞 Contact

*   **Principal Investigator**: Prof. Seungmin Rho
*   **Email**: smrho@cau.ac.kr
*   **Location**: Room B105-1, Bldg. 310, Chung-Ang University, Seoul, Korea
