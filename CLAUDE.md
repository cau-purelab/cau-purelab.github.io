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
node scripts/sync_scholar.cjs            # 논문 데이터 변경 감지 보고서 (Google Sites + Scholar 대조, 변경 없음)
node scripts/sync_scholar.cjs --apply    # 감지된 변경을 publications.json에 반영 + 날짜 상수 자동 갱신
node scripts/update_scholar_metrics.cjs  # citation/JCR 라벨 갱신
python scripts/patch_publications.py     # publications.json 일회성 수동 패치 (Python 환경 필요)
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

**`scripts/`**: `sync_scholar.cjs`(통합 동기화 — Google Sites in-review 섹션과 Scholar 프로필을 json과 대조해 상태 변경/신규 논문/출판 전환을 감지·반영하고 constants.tsx 정합성도 검사), `update_scholar_metrics.cjs`(Scholar citation + Google Sites의 `[SCIE-Q1 Top N%]` 라벨 수집 — Clarivate 원자료 아님), `patch_publications.py`(수동 일회성 패치용), `lib.cjs`(공용 유틸: fetchText/normalize/titlesMatch 등).

---

## 작업 규칙

1. **이미지**: `public/assets/`는 Vite가 최적화하지 않고 그대로 배포됨. 추가 전 반드시 압축 — 일러스트는 WebP ≤1600px, 인물 사진은 JPEG ≤800px, 파일당 200KB 이하 목표. MB급 원본 커밋 금지.
2. **멤버 사진**: 파일명은 `MEMBERS.name`과 동일한 `{이름}.jpg`. 사진 없으면 `https://ui-avatars.com/api/?name={이름}&background=random`.
3. **People 논문 모달**: `member.name`이 publications.json의 키와 정확히 일치해야 논문이 표시됨 (현재 `"Seungmin Rho"`, `"Mi Young Lee"`만 해당).
4. **publications.json 수정**: node 스크립트로 수행하고, 저장 후 ①`JSON.parse` 유효성 ②제목·bibtex 중복 여부 ③항목 수 변화를 검증할 것. UTF-8, 2-space indent 유지.
5. **patch_publications.py**: 패치 적용이 끝나면 4개 배열을 다시 비워둘 것 (재실행 시 오염 방지).
6. **논문 데이터 기준 소스**: Rho 교수 Google Sites(https://sites.google.com/view/seungminrho)가 진행 중 논문의 단일 기준 — `sync_scholar.cjs`가 자동 대조함. 단, **저자 표기는 자동 반영하지 않음**(Sites 쪽 오타가 잦음, 보고서 확인 후 수동 판단).
7. **Mi Young Lee 논문은 자동 추가 금지**: Scholar 프로필에 동명이인 의심 논문(1993~2016 직업의학·화학 분야)이 섞여 있어 sync는 보고만 함. 필요한 논문만 `patch_publications.py`로 수동 추가.
8. **날짜 배지**: `sync_scholar.cjs --apply`가 `PUBLICATIONS_UPDATED_AT`을 자동 갱신함. json을 수동 수정한 경우에만 직접 갱신. Footer의 "Site last updated"는 빌드 시 자동 주입(`__BUILD_DATE__`).
9. **커밋**: 주제별로 분리 커밋. main push는 곧바로 라이브 배포이므로 push 전 `npm run build` 필수.

---

## 데이터 최신화 워크플로우

```
1. node scripts/sync_scholar.cjs          # 변경 감지 보고서 확인 (Sites 상태 변경·신규 논문·출판 전환·constants 불일치)
2. node scripts/sync_scholar.cjs --apply  # 반영 (진행 중 상태/신규 출판/출판 전환 + 날짜 상수 자동 갱신)
3. node scripts/update_scholar_metrics.cjs  # citation/JCR 갱신
4. 보고서의 "constants.tsx 불일치"·"저자 표기 차이" 항목이 있으면 수동 반영
5. npm run build 확인 → git commit & push (자동 재배포)
```

---

## 알려진 한계

1. **스크레이핑 구조 의존** — `sync_scholar.cjs`·`update_scholar_metrics.cjs`는 Google Sites 텍스트 구조(제목/저자/`학술지 (상태, 날짜)` 3줄 패턴)와 Scholar HTML 클래스명에 의존. 페이지 구조가 바뀌면 파서 수정 필요.
2. **Mi Young Lee 아카이브는 부분 수집** — Scholar 프로필 214편 중 43편만 게재(작업 규칙 7 참조). 나머지는 sync 보고서에만 나타남.

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
| 2026-07-12 | 남은 과제 3건 해결 — `sync_scholar.cjs` 신규(Sites/Scholar 자동 대조·출판 전환·constants 정합성 검사·날짜 상수 자동 갱신), `lib.cjs` 공용 유틸 추출, stub이던 `fetch_scholar.py` 삭제. 첫 --apply로 funding_tags 2건 교정(TRUST-SDT→ITRC-26 등), citation 501건 갱신 |
