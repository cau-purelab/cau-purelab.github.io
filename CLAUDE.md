# CLAUDE.md — PURE Homepage 작업 가이드

**PURE(Privacy, Unlearning, and Robust Engineering Lab)** 공식 홈페이지. 중앙대학교 노승민 교수 연구실.

- **Live**: https://pure.cau.ac.kr/ (커스텀 도메인) · **Repo**: https://github.com/cau-purelab/cau-purelab.github.io
  - 인증서 발급 완료(2026-09-16) + Enforce HTTPS 켜짐 → `http://`와 `https://cau-purelab.github.io/`가 모두 `https://pure.cau.ac.kr/`로 301.
  - 코드의 정본 URL은 `scripts/site.cjs`의 `SITE_URL`이 단일 출처이고 `src/constants.tsx`의 `LAB_URL`과 일치해야 한다(빌드가 검사하고, 불일치 시 실패).
  - 커스텀 도메인은 `public/CNAME`에도 기록해 둔다(워크플로 배포에서는 무시되지만 설정 유실 시 복구 근거).
- **Deployment**: GitHub Pages organization user site — main push 시 `.github/workflows/deploy.yml`이 자동 배포 (push = 즉시 라이브 반영)
  - 파이프라인: 설정 검증 → 데이터 검증 → `npm ci` → 타입체크 → `build:pages` → 배포 → 스모크 테스트(딥링크 200 확인)
- **Stack**: React 19 + TypeScript, Vite 6, Tailwind CSS 3, React Router 7, React Helmet Async, Lucide React

---

## 명령어

```bash
npm install --legacy-peer-deps           # React 19 peer-deps 이슈로 --legacy-peer-deps 필수 (.npmrc에 설정됨)
npm run dev                              # http://localhost:5173
npm run build                            # 일반 빌드 (dist/) — 배포 산출물 검증에는 쓰지 말 것
npm run build:pages                      # 배포용 빌드 (라우트별 HTML + 404.html + sitemap.xml + robots.txt + feed.xml, CI가 사용)
npm run typecheck                        # tsc --noEmit (CI 게이트)
npm run validate                         # site.cjs 설정 정합성 + validate_data.cjs
node scripts/sync_scholar.cjs            # 논문 데이터 변경 감지 보고서 (Google Sites + Scholar 대조, 변경 없음)
node scripts/sync_scholar.cjs --apply    # 감지된 변경을 publications.json에 반영 + 날짜 상수 자동 갱신
node scripts/update_scholar_metrics.cjs  # citation/JCR 라벨 갱신
node scripts/validate_data.cjs           # publications.json 무결성 검증 (CI가 배포 전 실행)
python scripts/patch_publications.py     # publications.json 일회성 수동 패치 (Python 환경 필요)
```

- 매주 월요일 `.github/workflows/sync-scholar.yml`이 sync를 자동 실행해 변경 시 PR(`auto/scholar-sync` 브랜치)을 생성함 — 검토 후 머지하면 배포됨.
- ⚠ PR 생성은 저장소 설정에 달려 있다: **Settings → Actions → General → Workflow permissions → "Allow GitHub Actions to create and approve pull requests"**. 꺼져 있으면 데이터가 `auto/scholar-sync` 브랜치에만 쌓이고 PR이 열리지 않는다(실패 시 워크플로가 이슈를 자동 생성함).

테스트 스위트 없음 — 변경 후 `npm run typecheck` + `npm run build:pages` 성공 + `npm run dev`로 해당 페이지 육안 확인이 기본 검증.

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

**`scripts/`**: `site.cjs`(정본 URL `SITE_URL` + 라우트 목록 `ROUTES`의 단일 출처. `constants.tsx`의 `LAB_URL`과 어긋나면 throw — CI가 배포 전에 잡는다), `create-pages-404.cjs`(라우트별 정적 HTML·404.html·sitemap.xml·robots.txt 생성), `create-rss.cjs`(NEWS → feed.xml), `validate_data.cjs`(publications.json 무결성), `sync_scholar.cjs`(통합 동기화 — Google Sites in-review 섹션과 Scholar 프로필을 json과 대조해 상태 변경/신규 논문/출판 전환을 감지·반영하고 constants.tsx 정합성도 검사), `update_scholar_metrics.cjs`(Scholar citation + Google Sites의 `[SCIE-Q1 Top N%]` 라벨 수집 — Clarivate 원자료 아님), `patch_publications.py`(수동 일회성 패치용), `lib.cjs`(공용 유틸: fetchText/normalize/titlesMatch 등).

---

## 작업 규칙

1. **이미지**: `public/assets/`는 Vite가 최적화하지 않고 그대로 배포됨. 추가 전 반드시 압축 — 인물 사진은 JPEG ≤800px, 래스터는 WebP ≤1600px, 파일당 200KB 이하 목표. MB급 원본 커밋 금지.
   - **연구 분야 일러스트는 직접 그린 SVG**(`privacy-preserving-ai.svg` 등, 파일명 = `RESEARCH_AREAS`의 `id`). 생성기는 `scripts/`가 아니라 작업 시점의 일회성 스크립트였고, 결과물인 SVG가 원본이다. 수정은 SVG를 직접 편집한다. 팔레트는 네이비 램프(#1E3A8A / #2563EB / #60A5FA)만 쓰고, 크림슨(#B91C1C)은 "제거·공격" 의미에만 절제해 쓴다.
   - **생성형 이미지 금지**: 예전 일러스트 3장에 이미지 생성기 워터마크(우하단 4각 sparkle)가 남아 배포돼 있었다. 스톡·생성 이미지를 쓸 경우 반드시 워터마크 유무를 확인할 것.
   - **표시 크기 기준으로 그릴 것**: 연구 분야 이미지는 Research 페이지에서 **568×320px**로 렌더된다(1600px 캔버스의 0.355배). 텍스트 56px↑, 선 8px↑, 의미를 가진 도형 90px↑, 핵심 요소 7개↓를 지키고, **반드시 568×320으로 렌더해 눈으로 확인**한 뒤 커밋한다. 1600px 원본만 보고 판단하면 화면에서 아무것도 안 보인다(2026-09-17에 한 번 그렇게 실패했다).
   - **로고는 이미지가 아니라 컴포넌트**: `src/components/Logo.tsx`의 `LogoMark`·`LogoLockup`을 쓴다. 내비와 푸터가 같은 마크를 공유하고 페이지 폰트(Inter)를 상속한다. 마크는 글자가 없는 도형 3개(방패=경계, 노치=제거, 코어=보존된 모델)이고 16px에서도 같은 실루엣이다. `favicon-16/32/512.png`와 `og-image.png`만 래스터로 유지하며, 이들은 마크와 같은 좌표를 쓰므로 한쪽만 고치면 어긋난다.
2. **멤버 사진**: 파일명은 `MEMBERS.name`과 동일한 `{이름}.jpg`. 사진 없으면 `https://ui-avatars.com/api/?name={이름}&background=random`.
3. **People 논문 모달**: `member.name`이 publications.json의 키와 정확히 일치해야 논문이 표시됨 (현재 `"Seungmin Rho"`, `"Mi Young Lee"`만 해당).
4. **publications.json 수정**: node 스크립트로 수행하고, 저장 후 ①`JSON.parse` 유효성 ②제목·bibtex 중복 여부 ③항목 수 변화를 검증할 것. UTF-8, 2-space indent 유지.
5. **patch_publications.py**: 패치 적용이 끝나면 4개 배열을 다시 비워둘 것 (재실행 시 오염 방지).
6. **논문 데이터 기준 소스**: Rho 교수 Google Sites(https://sites.google.com/view/seungminrho)가 진행 중 논문의 단일 기준 — `sync_scholar.cjs`가 자동 대조함. 단, **저자 표기는 자동 반영하지 않음**(Sites 쪽 오타가 잦음, 보고서 확인 후 수동 판단).
7. **Mi Young Lee 논문은 자동 추가 금지**: Scholar 프로필에 동명이인 의심 논문(1993~2016 직업의학·화학 분야)이 섞여 있어 sync는 보고만 함. 필요한 논문만 `patch_publications.py`로 수동 추가.
8. **날짜 배지**: `sync_scholar.cjs --apply`가 `PUBLICATIONS_UPDATED_AT`을 자동 갱신함. json을 수동 수정한 경우에만 직접 갱신. Footer의 "Site last updated"는 빌드 시 자동 주입(`__BUILD_DATE__`).
9. **커밋**: 주제별로 분리 커밋. main push는 곧바로 라이브 배포이므로 push 전 `npm run typecheck && npm run build:pages` 필수.
10. **라우트 추가/삭제 시**: `src/App.tsx`의 `<Route>`와 `scripts/site.cjs`의 `ROUTES`를 함께 고칠 것. 빠뜨리면 해당 딥링크가 다시 404가 된다.
11. **index.html의 SEO 태그**: `data-rh="true"`가 붙은 태그는 Helmet이 런타임에 교체하고, 빌드 시에는 `create-pages-404.cjs`가 라우트별 값으로 치환한다. 태그 구조를 바꾸면 그 스크립트의 치환 패턴도 함께 고칠 것(치환 실패 시 빌드가 멈춘다).

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

1. **스크레이핑 구조 의존** — `sync_scholar.cjs`·`update_scholar_metrics.cjs`는 Google Sites 텍스트 구조(제목/저자/`학술지 (상태, 날짜)` 3줄 패턴)와 Scholar HTML 클래스명에 의존. 페이지 구조가 바뀌면 파서 수정 필요. Google Scholar가 GitHub Actions IP를 차단하면 주간 자동 sync가 실패할 수 있음(로컬 실행으로 대체).
2. **Mi Young Lee 아카이브는 부분 수집** — Scholar 프로필 214편 중 43편만 게재(작업 규칙 7 참조). 나머지는 sync 보고서에만 나타남.
3. **HTTPS 미지원** — 커스텀 도메인 TLS 인증서가 발급되지 않아 평문 HTTP로만 서비스된다. 비보안 오리진에서는 `navigator.clipboard`가 없으므로 클립보드 기능은 폴백이 필요하다.
4. **프리렌더는 메타 태그까지만** — 라우트별 HTML은 본문 없이 title/description/og/canonical만 주입한다. 본문 텍스트가 필요한 크롤러(예: Naver Yeti)에는 여전히 빈 페이지로 보인다. SSR/SSG 도입은 별도 과제.

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
| 2026-07-12 | 2차 개선 — 404 NotFound 라우트 신설, 이미지 lazy loading, Major Publications에 DOI/Scholar 링크 5건, Scholar 페이지 연구 지표 카드(논문 수·인용수·h-index), sync에 빈 URL 보강 기능(MYL 15건 적용), 주간 자동 sync PR 워크플로우(`sync-scholar.yml`)와 배포 전 데이터 검증 게이트(`validate_data.cjs`) 추가 |
| 2026-07-12 | 3차 개선 — Scholar 페이지 연도 필터·Load More 페이지네이션(50건 단위), 뉴스 RSS 피드(`create-rss.cjs`, 빌드 시 feed.xml 생성), Home 히어로 Unsplash 외부 이미지 → 로컬 `hero.webp`(185KB) 교체, MIT LICENSE 추가 |
| 2026-09-17 | 감사 27개 문제군 + UI/UX 검토 반영(커밋 13건), 커스텀 도메인 HTTPS 전환, 라우트별 프리렌더, 아카이브 정리(470→427건), PR CI 신설, 의존성·데이터 PR 3건 머지 |
| 2026-09-17 | 브랜드 자산 재제작 — 연구 분야 일러스트 3장을 직접 그린 SVG로 교체(생성기 워터마크 제거), 내비·푸터로 갈라져 있던 두 마크를 `Logo.tsx` 하나로 통합, 파비콘 크기별 3종과 OG 카드 재생성 |
| 2026-09-17 | 빌드·배포 정비 — 라우트별 정적 HTML 생성(딥링크 404 해소)과 라우트별 SEO 메타 주입, `site.cjs`로 정본 URL·라우트 단일화(sitemap/robots/feed 빌드 생성), `public/CNAME` 추가, CI에 타입체크 게이트·설정 검증·배포 후 스모크 테스트 추가, 주간 sync 워크플로 pipefail + 실패 시 이슈 생성, Dependabot·.gitattributes·.gitignore 정비, 폰트 웨이트 범위 교정(Inter 300~900 / Playfair 400~800), 문서 최신화 |
