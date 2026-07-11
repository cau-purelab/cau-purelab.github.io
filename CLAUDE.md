# CLAUDE.md — PURE Homepage 작업 가이드

**PURE(Privacy, Unlearning, and Robust Engineering Lab)** 공식 홈페이지. 중앙대학교 노승민 교수 연구실.

- **Live**: https://cau-purelab.github.io/ · **Repo**: https://github.com/cau-purelab/cau-purelab.github.io
- **Deployment**: GitHub Pages organization user site — main push 시 `.github/workflows/deploy.yml`이 자동 배포 (push = 즉시 라이브 반영)
- **Stack**: React 19 + TypeScript, Vite 6, Tailwind CSS 3, React Router 7, React Helmet Async, Lucide React

---

## 명령어

```bash
npm install --legacy-peer-deps           # React 19 peer-deps 이슈로 --legacy-peer-deps 필수 (.npmrc에 설정됨)
npm run dev                              # http://localhost:5173
npm run build                            # 일반 빌드 (dist/)
npm run build:pages                      # 배포용 빌드 (dist/404.html SPA 폴백 포함, CI가 사용)
python scripts/fetch_scholar.py          # 논문 수집 + 진행 중 논문 병합 (pip install scholarly tqdm 필요)
python scripts/patch_publications.py     # publications.json 일회성 패치
node scripts/update_scholar_metrics.cjs  # citation/JCR 라벨 갱신
```

테스트 스위트 없음 — 변경 후 `npm run build` 성공 + `npm run dev`로 해당 페이지 육안 확인이 기본 검증.

---

## 아키텍처

| 경로 | 컴포넌트 | 데이터 소스 |
|------|----------|------------|
| `/` | `Home.tsx` | constants.tsx (통계는 PUBLICATIONS/MEMBERS 길이에서 자동 계산) |
| `/research` | `Research.tsx` | constants.tsx `RESEARCH_AREAS` |
| `/people` | `People.tsx` | constants.tsx `MEMBERS` + publications.json (PI/Co-PI 논문 모달) |
| `/publications` | `Publications.tsx` | constants.tsx `PUBLICATIONS` (수동 선별 하이라이트) |
| `/scholar` | `ScholarPublications.tsx` | publications.json (전체 아카이브, 탭/검색/정렬/펀딩 필터) |
| `/news` | `News.tsx` | constants.tsx `NEWS` |

- Home 외 라우트는 `React.lazy`로 분리 — publications.json(~340KB)은 People/Scholar 방문 시에만 로드됨. 이 구조를 깨지 말 것.

### 데이터 파일

**`src/constants.tsx`** (수동 관리): `MEMBERS`, `PUBLICATIONS`(주요 논문, `status` 필드로 "Submitted" 배지), `NEWS`, `RESEARCH_AREAS`, 랩 상수(`LAB_*`), `PI_NAME_VARIANTS`(저자 강조용 이름 변형), `PUBLICATIONS_UPDATED_AT`(Scholar 페이지 배지용 수동 날짜).

**`src/data/publications.json`** (스크립트+수동 혼합): 키는 교수 이름(`"Seungmin Rho"`, `"Mi Young Lee"`). 항목 형태 2종 —
- 출판: `{ title, url, bibtex, funding_tags, citations?, jcr?, jcr_source? }`
- 진행 중: `{ title, author, journal, status, funding_tags, year, is_progress: true }`

**`scripts/`**: `fetch_scholar.py`(scholarly 수집 + `IN_PROGRESS_PAPERS` 하드코딩 병합, 정규화 제목으로 중복 방지), `patch_publications.py`(패치 배열 4종에 항목 추가 후 실행), `update_scholar_metrics.cjs`(Scholar citation + Google Sites의 `[SCIE-Q1 Top N%]` 라벨 수집 — Clarivate 원자료 아님).

---

## 작업 규칙

1. **이미지**: `public/assets/`는 Vite가 최적화하지 않고 그대로 배포됨. 추가 전 반드시 압축 — 일러스트는 WebP ≤1600px, 인물 사진은 JPEG ≤800px, 파일당 200KB 이하 목표. MB급 원본 커밋 금지.
2. **멤버 사진**: 파일명은 `MEMBERS.name`과 동일한 `{이름}.jpg`. 사진 없으면 `https://ui-avatars.com/api/?name={이름}&background=random`.
3. **People 논문 모달**: `member.name`이 publications.json의 키와 정확히 일치해야 논문이 표시됨 (현재 `"Seungmin Rho"`, `"Mi Young Lee"`만 해당).
4. **publications.json 수정**: node 스크립트로 수행하고, 저장 후 ①`JSON.parse` 유효성 ②제목·bibtex 중복 여부 ③항목 수 변화를 검증할 것. UTF-8, 2-space indent 유지.
5. **patch_publications.py**: 패치 적용이 끝나면 4개 배열을 다시 비워둘 것 (재실행 시 오염 방지).
6. **논문 데이터 기준 소스**: Rho 교수 Google Sites(https://sites.google.com/view/seungminrho)가 진행 중 논문의 단일 기준. json과 `fetch_scholar.py`의 `IN_PROGRESS_PAPERS`를 항상 여기에 맞출 것.
7. **날짜 배지**: publications.json을 갱신하면 `constants.tsx`의 `PUBLICATIONS_UPDATED_AT`도 오늘 날짜로 갱신. Footer의 "Site last updated"는 빌드 시 자동 주입(`__BUILD_DATE__`)이라 손댈 필요 없음.
8. **커밋**: 주제별로 분리 커밋. main push는 곧바로 라이브 배포이므로 push 전 `npm run build` 필수.

---

## 데이터 최신화 워크플로우

```
1. Rho 교수 Google Sites에서 신규/변경 논문 확인
2. 변경 사항을 fetch_scholar.py의 IN_PROGRESS_PAPERS에 반영
   - 신규 투고 → 추가 / 학술지·상태 변경 → 수정 / 게재 확정 → 제거(scholarly가 수집)
3. python scripts/patch_publications.py   # 소규모 수정
   또는 python scripts/fetch_scholar.py   # 전체 재수집
4. 주요 논문이면 constants.tsx의 PUBLICATIONS에도 수동 추가
5. node scripts/update_scholar_metrics.cjs
6. constants.tsx의 PUBLICATIONS_UPDATED_AT 갱신
7. npm run build 확인 → git commit & push (자동 재배포)
```

---

## 남은 과제

1. **fetch_scholar.py의 scholarly 수집 로직이 stub** — 현재는 IN_PROGRESS_PAPERS 병합만 동작하고 Scholar 신규 논문 자동 수집은 미구현.
2. **진행 중 논문 상태 변경 자동 감지 없음** — Google Sites 수동 대조에 의존.
3. **이중 관리 부담** — constants.tsx(주요 논문)와 publications.json(전체)을 따로 갱신해야 함.

---

## 작업 이력

세부 내용은 `git log` 참조. 날짜별 요약:

| 날짜 | 요약 |
|------|------|
| 2026-05-07 | 프로젝트 구조 파악, Google Sites 대조로 데이터 불일치 6건 수정, `patch_publications.py`·`fetch_scholar.py` 작성 |
| 2026-06-04 | 2026년 논문 반영, `update_scholar_metrics.cjs` 추가 (citation/JCR 표시) |
| 2026-07-07 | SVIL → PURE 리브랜딩, Vercel → GitHub Pages 이전(조직 저장소 `cau-purelab.github.io`, base path `/`), ISIT 2026 뉴스 추가 |
| 2026-07-11 | Cross-Sector 논문 재투고 반영(→ Alexandria Eng. J.), 업데이트 날짜 배지 추가(Footer 빌드일 + Scholar 데이터일) |
| 2026-07-11 | 전면 감사 6커밋: 데이터 정합성(SHAP Submitted 배지, 스크립트 동기화)·UI 버그(Footer nav, 이미지 매핑)·성능(이미지 23MB→228KB, 번들 633→270KB)·SEO(robots/sitemap/canonical/JSON-LD)·접근성(aria-label, 모달 Escape)·데드코드 삭제 |
| 2026-07-11 | Scholar 아카이브 정밀 점검: bibtex 동일 중복 14건 제거(Rho 485→470), 제목-bibtex 불일치 2건 교정, MYL 논문 bibtex 보강, 연도 미상 "N/A" 표시 |
