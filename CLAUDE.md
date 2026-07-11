# CLAUDE.md — PURE Homepage 작업 가이드

## 프로젝트 개요

**PURE(Privacy, Unlearning, and Robust Engineering Lab)** 공식 홈페이지.
중앙대학교 노승민 교수 연구실 (Privacy-Preserving AI, Machine Unlearning, Robust AI Engineering).

- **Live**: https://cau-purelab.github.io/
- **Repo**: https://github.com/cau-purelab/cau-purelab.github.io
- **Deployment**: GitHub Pages, organization user site (main 브랜치 push → `.github/workflows/deploy.yml`이 빌드 후 자동 배포)

---

## 기술 스택

| 항목 | 내용 |
|------|------|
| Framework | React 19 + TypeScript |
| Build | Vite 6 |
| Styling | Tailwind CSS 3 |
| Routing | React Router v7 |
| SEO | React Helmet Async |
| Icons | Lucide React |

---

## 라우트 구조

| 경로 | 컴포넌트 | 설명 |
|------|----------|------|
| `/` | `Home.tsx` | Hero, 통계(Publications/Researchers), 연구 소개, Join Us, 최신 뉴스 4건 |
| `/research` | `Research.tsx` | 연구 분야 3개 상세 (이미지 + 설명) |
| `/people` | `People.tsx` | 구성원 카드 + 멤버 클릭 시 논문 모달 |
| `/publications` | `Publications.tsx` | **하이라이트 논문** (constants.tsx 기반) |
| `/scholar` | `ScholarPublications.tsx` | **전체 논문 아카이브** (publications.json 기반) |
| `/news` | `News.tsx` | 연도별 뉴스 아카이브 |

---

## 핵심 데이터 파일

### 1. `src/constants.tsx` — 수동 관리 데이터
- `MEMBERS[]` : 구성원 정보 (이름, 역할, 이메일, 사진 경로, specialization 해시태그)
- `PUBLICATIONS[]` : Publications 페이지에 표시되는 **주요 논문** (수동 선별)
- `NEWS[]` : 뉴스 항목
- `RESEARCH_AREAS[]` : 연구 분야 3개 (Privacy-Preserving AI / Machine Unlearning / Robust AI Engineering)
- `LAB_SHORT_NAME`, `LAB_FULL_NAME`, `LAB_NAME`, `LAB_DESCRIPTION`, `LAB_URL`, `LAB_EMAIL`, `LAB_AFFILIATION` : 전역 상수

### 2. `src/data/publications.json` — 자동+수동 혼합 관리
- 키: 교수 이름 (`"Seungmin Rho"`, `"Mi Young Lee"`)
- 값: 논문 배열. 두 가지 형태가 공존함:
  - **출판된 논문** : `{ title, url, bibtex, funding_tags }` — Google Scholar에서 자동 수집
  - **진행 중 논문** : `{ title, author, journal, status, funding_tags, year, is_progress: true }` — 수동 입력
  - **성과 지표** : `{ citations, jcr, jcr_source }` — Google Scholar citation 수와 공개 Google Sites JCR 라벨

### 3. `scripts/fetch_scholar.py` — 데이터 수집 스크립트
- `scholarly` 라이브러리로 Google Scholar에서 논문 수집
- Selenium(Chrome)으로 보조 스크래핑
- `IN_PROGRESS_PAPERS` 배열: 진행 중 논문 **하드코딩**
- 출력: `src/data/publications.json` 덮어쓰기

### 4. `scripts/update_scholar_metrics.cjs` — 성과 지표 갱신 스크립트
- Google Scholar 교수 프로필에서 논문별 citation 수를 수집해 `citations` 필드 갱신
- 공개 Google Sites에 표시된 `[SCIE/SSCI ... Top ...%]` 라벨을 `jcr` 필드로 반영
- JCR 라벨 원천 URL을 `jcr_source` 필드로 저장
- Clarivate JCR 원자료를 직접 조회하지 않음. 공개 페이지에 표시된 라벨만 반영함.

---

## 구성원 사진 경로

`public/assets/` 폴더에 저장. 파일명 형식: `{이름}.jpg` (예: `Byeongcheon Lee.jpg`)  
사진 없는 멤버: `https://ui-avatars.com/api/?name={이름}&background=random` 사용

---

## People 페이지 — 논문 모달 동작 방식

```
멤버 카드 "Publications" 버튼 클릭
→ handleOpenPublications(member)
→ loadedPublications[member.name] (publications.json에서 이름으로 조회)
→ PublicationsModal 팝업 (BibTeX 파싱해서 연도/저자/학술지 추출 + citation/JCR 배지 표시)
```

**주의**: 멤버 이름이 `publications.json`의 키와 정확히 일치해야 함.  
현재 매핑: `"Seungmin Rho"`, `"Mi Young Lee"` (다른 멤버는 모달에 논문 없음)

---

## Scholar 페이지 — 주요 기능

- **탭**: 교수별 전환 (Seungmin Rho / Mi Young Lee)
- **펀딩 대시보드**: funding_tags 기반 필터링 (연도순 정렬)
- **검색**: 제목/펀딩 태그 텍스트 검색
- **성과 지표**: Google Scholar citation 수와 공개 JCR 라벨 표시
- **정렬**: 연도순 / 제목순 / 펀딩순
- **BibTeX**: 펼치기/복사 기능
- **is_progress: true** 항목: 점선 테두리 + "Working" 배지로 구분

---

## 데이터 최신화 워크플로우 (현재 방식)

```
1. 교수 Google Sites 페이지에서 신규 논문 확인
   → https://sites.google.com/view/seungminrho
2. 진행 중 논문 → fetch_scholar.py의 IN_PROGRESS_PAPERS 배열에 수동 추가
3. python scripts/fetch_scholar.py 실행
   → Google Scholar에서 출판된 논문 자동 수집
   → IN_PROGRESS_PAPERS 병합
   → src/data/publications.json 갱신
4. 주요 논문이면 constants.tsx의 PUBLICATIONS 배열에도 수동 추가
5. node scripts/update_scholar_metrics.cjs
   → Google Scholar citation 수 갱신
   → 공개 Google Sites JCR 라벨 갱신
6. git commit & push → GitHub Pages 자동 재배포
```

---

## 주요 보완 과제 (2026-05-07 파악)

1. **데이터 불일치** : Google Sites의 논문 정보(학술지명, 저자)와 json 내용이 다수 불일치
2. **진행 중 논문 하드코딩** : 상태 변경(Submitted → Accepted)을 자동 감지 못함
3. **script 미완성** : fetch_scholar.py의 scholarly 수집 로직이 stub 상태
4. **출판 전환 미흡** : is_progress 논문이 출판되면 bibtex 항목으로 전환하는 절차 없음
5. **이중 관리 부담** : constants.tsx(주요 논문) + publications.json(전체) 분리 관리
6. **신규 논문 누락** : Google Sites에 있는 2026년 논문 여러 편이 json에 없음
7. **파일 크기** : publications.json이 326KB로 전체 로드됨 (2010년대 논문 다수 포함)

---

## 데이터 최신화 워크플로우 (개선 후)

```
1. 교수 Google Sites 페이지에서 신규/변경 논문 확인
   → https://sites.google.com/view/seungminrho
2. 변경 사항을 fetch_scholar.py의 IN_PROGRESS_PAPERS에 반영
   - 신규 투고 → 목록에 추가
   - 학술지명 변경 → 해당 항목 수정
   - 게재 확정/출판 → 목록에서 제거 (scholarly가 자동 수집)
3. python scripts/patch_publications.py  # 빠른 일회성 수정용
   또는
   python scripts/fetch_scholar.py        # 전체 재수집 (scholarly 필요)
4. 주요 논문이면 src/constants.tsx의 PUBLICATIONS 배열에도 수동 추가
5. node scripts/update_scholar_metrics.cjs  # citation/JCR 라벨 갱신
6. git commit & push → GitHub Pages 자동 재배포
```

**주의**: fetch_scholar.py 실행 시 scholarly 패키지 필요
```bash
pip install scholarly tqdm
```

---

## 작업 이력

| 날짜 | 작업 내용 |
|------|-----------|
| 2026-05-07 | 프로젝트 전체 구조 파악, Google Sites 논문 데이터 vs json 불일치 분석 |
| 2026-05-07 | `scripts/patch_publications.py` 작성 및 실행 — 6건 수정/추가 완료 |
| 2026-05-07 | `scripts/fetch_scholar.py` 전면 재작성 — scholarly 수집 + is_progress 자동 전환 로직 추가 |
| 2026-05-07 | `src/constants.tsx` SHAP 논문 학술지명 수정 (CNNM → FGCS) |
| 2026-06-04 | Scholar 최신 논문 반영 — 2026년 진행 중/게재 논문 및 DOI/BibTeX 보강 |
| 2026-06-04 | `scripts/update_scholar_metrics.cjs` 추가 — Google Scholar citation 및 공개 JCR 라벨 표시 |
| 2026-07-07 | 랩 리브랜딩: SVIL(Security Visual Intelligence Lab) → PURE(Privacy, Unlearning, and Robust Engineering Lab), 연구 분야 재정의(Privacy-Preserving AI / Machine Unlearning / Robust AI Engineering), 연락처 이메일을 `purelab.cau@gmail.com`으로 통합 |
| 2026-07-07 | 배포 플랫폼을 Vercel → GitHub Pages로 전환 — `.github/workflows/deploy.yml`·`scripts/create-pages-404.cjs`(SPA 404 폴백) 추가, `vercel.json`·`api/check-ip.ts` 제거, `App.tsx`에 `basename` 라우팅 적용 |
| 2026-07-07 | GitHub Pages를 개인 저장소(`cheonbung/pure-homepage`)에서 랩 공식 조직 저장소(`cau-purelab/cau-purelab.github.io`)로 이전 — base path `/pure-homepage/` → `/` 변경 |
| 2026-07-07 | News에 IEEE ISIT 2026 (Guangzhou, China) 참석 항목 추가 |
| 2026-07-11 | Rho 교수 Google Sites 대조 후 `publications.json` 갱신 — "Stock Price Forecasting ... Cross-Sector..." 논문이 재투고되어 학술지(Computational Economics → Alexandria Engineering Journal), 제목("Using Graph Neural Networks" 추가), JCR(SSCI-Q2 Top 30.4% → SCIE-Q1 Top 7%), 상태(Submitted March → July 2026) 갱신 |

---

## 로컬 실행

```bash
npm install --legacy-peer-deps   # React 19 호환성 이슈로 --legacy-peer-deps 필수
npm run dev                       # http://localhost:5173
npm run build                     # 일반 빌드 (dist/)
npm run build:pages               # GitHub Pages 배포용 빌드 (dist/404.html SPA 폴백 포함, CI가 사용)
python scripts/fetch_scholar.py  # 논문 데이터 갱신
node scripts/update_scholar_metrics.cjs  # citation/JCR 라벨 갱신
```
