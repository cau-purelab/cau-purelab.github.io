# CLAUDE.md — PURE Homepage 작업 가이드

**PURE(Privacy, Unlearning, and Robust Engineering Lab)** 공식 홈페이지. 중앙대학교 노승민 교수 연구실.

- **Live**: https://pure.cau.ac.kr/ (커스텀 도메인) · **Repo**: https://github.com/cau-purelab/cau-purelab.github.io
  - 인증서 발급 완료(2026-09-16) + Enforce HTTPS 켜짐 → `http://`와 `https://cau-purelab.github.io/`가 모두 `https://pure.cau.ac.kr/`로 301.
  - 코드의 정본 URL은 `scripts/site.cjs`의 `SITE_URL`이 단일 출처이고 `src/constants.tsx`의 `LAB_URL`과 일치해야 한다(빌드가 검사하고, 불일치 시 실패).
  - 커스텀 도메인은 `public/CNAME`에도 기록해 둔다(워크플로 배포에서는 무시되지만 설정 유실 시 복구 근거).
- **Deployment**: GitHub Pages organization user site — main push 시 `.github/workflows/deploy.yml`이 자동 배포 (push = 즉시 라이브 반영)
  - 파이프라인: 설정 검증 → 데이터 검증 → `npm ci` → 타입체크 → `build:pages` → 배포 → 스모크 테스트(딥링크 200 확인)
  - PR에는 `.github/workflows/ci.yml`이 배포 없이 같은 게이트를 돌린다(+ 빌드 산출물 점검과 초기 번들 예산 130KB 검사). deploy.yml은 main push에만 반응하므로 PR 검증은 이쪽이 담당한다.
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
- ⚠ **PR 생성 권한 문제는 해결됐다** — 2026-09-16 실행(run 35143140435)에서 기본 GITHUB_TOKEN으로 PR #4가 실제로 생성·머지됐다. 실패를 보면 `Allow GitHub Actions to create and approve pull requests` 토글부터 의심하지 말 것(단, 이 토글을 다시 끄면 같은 오류가 돌아온다).
- 남은 미해결 원인은 **Google Scholar 403** 하나다. 예약 실행 10회 중 수집이 성공한 것은 4회(40%)뿐이고, 나머지 6회는 Scholar가 러너 IP를 차단해 수집 단계에서 멈췄다. 차단되면 로컬에서 `--apply`를 돌려 직접 PR을 올린다.
- 실패하면 워크플로가 이슈를 자동 생성한다. 제목에 원인 구분이 붙으므로(`Weekly Scholar Sync failed: 수집 차단 (Scholar 403/429)` 등) 원인이 바뀌면 새 이슈로 드러나고, 다시 성공하면 열린 실패 이슈를 닫는다 — **열린 실패 이슈 = 지금 실패 중**.
- 실행 로그를 볼 때 `gh run view <id> --log`는 이 워크플로에서 **빈 출력**을 준다. `gh api repos/cau-purelab/cau-purelab.github.io/actions/runs/<id>/logs > logs.zip`으로 받아 풀어 볼 것.

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

**`docs/archive-cleanup-2026-09.md`**: 2026-09-17 아카이브 1회성 정리 기록 — 무엇을 지웠고 무엇을 판단 보류했는지. `validate_data.cjs`가 경고 끝에 붙이는 "확인 대기" 항목의 근거가 여기 있다.

**`scripts/`**: `site.cjs`(정본 URL `SITE_URL` + 라우트 목록 `ROUTES`의 단일 출처. `constants.tsx`의 `LAB_URL`과 어긋나면 throw — CI가 배포 전에 잡는다), `create-pages-404.cjs`(라우트별 정적 HTML·404.html·sitemap.xml·robots.txt 생성), `create-rss.cjs`(NEWS → feed.xml), `validate_data.cjs`(publications.json 무결성), `sync_scholar.cjs`(통합 동기화 — Google Sites in-review 섹션과 Scholar 프로필을 json과 대조해 상태 변경/신규 논문/출판 전환을 감지·반영하고 constants.tsx 정합성도 검사), `update_scholar_metrics.cjs`(Scholar citation + Google Sites의 `[SCIE-Q1 Top N%]` 라벨 수집 — Clarivate 원자료 아님), `patch_publications.py`(수동 일회성 패치용), `lib.cjs`(공용 유틸: fetchText/normalize/titlesMatch 등).

---

## 작업 규칙

1. **이미지**: `public/assets/`는 Vite가 최적화하지 않고 그대로 배포됨. 추가 전 반드시 압축 — 인물 사진은 JPEG ≤800px, 래스터는 WebP ≤1600px, 파일당 200KB 이하 목표. MB급 원본 커밋 금지.
   - **연구 분야 일러스트는 사용자가 준 그림이다**(`privacy-preserving-ai.webp` 등, 파일명 = `RESEARCH_AREAS`의 `id`). 원본 PNG는 `design/illustration-source/`에 있고 커밋하지 않는다(장당 1MB+). 배포본은 원본을 16:9로 가운데 자른 뒤 1600×900 WebP(q90)로 변환한 것이고, 이 치수는 `Research.tsx`의 `<img width height>`와 같아야 한다.
   - **임의로 다시 그리지 말 것**: 직접 그린 SVG 3장은 네 번 연속 거절당한 끝에 사용자가 직접 그림을 제공해 교체됐다(2026-09-18). 그림을 바꿔야 하면 새로 그리지 말고 사용자에게 받는다. 예전에 거절당한 이유는 ①산업 설비처럼 보임 ②작품이 아니라 도해 ③표시 크기에서 안 읽힘이었다 — 언젠가 다시 만들 일이 있으면 이 셋을 먼저 본다.
   - **워터마크를 확인할 것**: 더 예전 일러스트 3장에는 이미지 생성기 워터마크(우하단 4각 sparkle)가 남은 채 배포돼 있었다. 지금 3장은 네 귀퉁이를 확대해 확인했고 워터마크가 없다. 이미지를 갈아끼울 때마다 같은 확인을 한다.
   - **표시 크기에서 눈으로 확인할 것**: Research 페이지에서 **568×320px**로 렌더된다(1600px의 0.355배). 원본만 보고 판단하면 화면에서 아무것도 안 보인다(2026-09-17에 그렇게 실패했다). 현재 `robust-ai-engineering.webp`의 파이프라인 라벨은 이 크기에서 8px 남짓이라 글자로는 읽히지 않는다 — 구도는 읽히지만 **글자에 의미를 싣지 말 것**.
   - **로고는 이미지가 아니라 컴포넌트**: `src/components/Logo.tsx`의 `LogoMark`·`LogoLockup`을 쓴다. 내비와 푸터가 같은 마크를 공유하고 페이지 폰트(Inter)를 상속한다. 마크는 글자가 없는 도형 3개(방패=경계, 노치=제거, 코어=보존된 모델)이고 16px에서도 같은 실루엣이다. `favicon-16.png`·`favicon-32.png`·`favicon.png`(512×512)와 `og-image.png`만 래스터로 유지하며, 이들은 마크와 같은 좌표를 쓰므로 한쪽만 고치면 어긋난다.
   - **출처 기록**: 배포하는 이미지의 출처·라이선스·가한 편집은 `CREDITS.md`에 적는다. 외부 이미지를 추가·교체하면 그 표를 반드시 함께 갱신할 것(CC BY 계열을 쓰면 푸터 표기도 필요하다).
2. **멤버 사진**: `public/assets/{이름}.jpg`. GitHub Pages는 경로 대소문자를 구분하므로 파일명과 `MEMBERS[].image` 경로가 글자 단위로 같아야 한다 — 실제로 `Mi young Lee.jpg`는 이름(`Mi Young Lee`)과 대소문자가 다르고 constants.tsx가 경로를 그대로 적어 맞추고 있다. 사진이 없으면 `initialsAvatar(name)`가 인라인 SVG 이니셜 아바타를 만든다(외부 요청 0건 — 예전의 ui-avatars.com 호출은 실명이 외부로 나가서 걷어냈다).
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

1. **스크레이핑 구조 의존** — `sync_scholar.cjs`·`update_scholar_metrics.cjs`는 Google Sites 텍스트 구조(제목/저자/`학술지 (상태, 날짜)` 3줄 패턴)와 Scholar HTML 클래스명에 의존. 페이지 구조가 바뀌면 파서 수정 필요.
2. **Google Scholar 차단이 주간 sync의 최대 실패 원인** — 예약 실행 10회를 로그로 전수 확인한 결과 6회가 `Failed to fetch https://scholar.google.com/citations?...: 403`으로 수집 단계에서 멈췄다(2026-07-20, 07-27, 08-10, 08-17, 08-24, 08-31). 통과율 40%. 6회 모두 수집 단계에서 멈춰 PR이 열리지 않았고, 그 주의 Google Sites 변경도 함께 유실된 채 실패 이슈만 남았다. 복구는 로컬 실행(로컬 IP는 차단되지 않음) 후 수동 PR.
3. **Mi Young Lee 아카이브는 부분 수집** — Scholar 프로필 논문 중 일부만 게재한다(현재 publications.json 기준 42편, 작업 규칙 7 참조). 나머지는 sync 보고서에만 나타남. Scholar 쪽 전체 편수는 프로필이 계속 바뀌므로 숫자를 문서에 박아 두지 말고 `node scripts/sync_scholar.cjs` 보고서에서 확인할 것.
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
| 2026-09-17 | 감사 27개 문제군 + UI/UX 검토 반영(커밋 13건), 커스텀 도메인 HTTPS 전환, 라우트별 프리렌더, 아카이브 정리(470→426건), PR CI 신설, 의존성·데이터 PR 3건 머지 |
| 2026-09-17 | 브랜드 자산 재제작 — 연구 분야 일러스트 3장을 직접 그린 SVG로 교체(생성기 워터마크 제거), 내비·푸터로 갈라져 있던 두 마크를 `Logo.tsx` 하나로 통합, 파비콘 크기별 3종과 OG 카드 재생성 |
| 2026-09-17 | 빌드·배포 정비 — 라우트별 정적 HTML 생성(딥링크 404 해소)과 라우트별 SEO 메타 주입, `site.cjs`로 정본 URL·라우트 단일화(sitemap/robots/feed 빌드 생성), `public/CNAME` 추가, CI에 타입체크 게이트·설정 검증·배포 후 스모크 테스트 추가, 주간 sync 워크플로 pipefail + 실패 시 이슈 생성, Dependabot·.gitattributes·.gitignore 정비, 폰트 웨이트 범위 교정(Inter 300~900 / Playfair 400~800), 문서 최신화 |
| 2026-09-18 | 히어로 부제 한 줄 + "and" 앞 줄바꿈, PlatCon-26 뉴스 추가(뉴스 파서가 항목을 조용히 버리던 버그 수정), 연구 분야 일러스트 3장을 사용자 제공 그림으로 교체(SVG → WebP) |
| 2026-09-18 | 문서 모순 정리(HTTPS 한계 서술·site.cjs 주석·README 구조·아카이브 건수·사진 규칙), 데이터 정리(Glow 논문 투고/출판 중복 제거 427→426, 교차 탭 제목 표기 2건 통일, 학술지명 폴백 확장으로 빈칸 9→5건), 검증 경고 43→27건(설계상 다른 url 비교 제거 + 투고/출판 중복 검사 신설), 뉴스 문형 통일 |
| 2026-09-20 | Rho 실적 파이프라인 감사·수리 — 주간 sync 예약 실행 10회 실패를 로그로 전수 분류(Scholar 403 6회 / PR 권한 4회)하고, 이미 해결된 PR 권한을 1순위 원인으로 지목하던 문서·워크플로 주석을 사실에 맞게 교정. 실패 이슈 제목에 원인 구분을 넣어 원인 변화가 묻히지 않게 하고 성공 시 자동 종료, 단계 이름을 수집/검증/PR로 구분, cron 주기를 올리면 안 되는 이유를 주석으로 고정 |
| 2026-09-20 | 수집 복원력 — `fetchText`에 지수 백오프 재시도(403/429/5xx, 지터·Retry-After·대기 예산 60s) 추가. Scholar가 막혀도 Google Sites 수집분은 저장하고 종료 코드 2(부분 성공)로 구분해 PR이 계속 나가게 함. 제목이 바뀐 출판 전환을 토큰 유사도로 탐지(MSTCA 건 78% 겹침·저자 100%로 검출). 보고 모드와 `--apply`가 같은 게이트를 거치게 해 결과 불일치 해소. 연도 미상 보류 항목을 별도 버킷으로 분리. `workflow_dispatch`에 `dry_run`(기본 켬) 추가 |
| 2026-09-20 | Scholar 화면 — 펀딩 집계를 범위 적용 집합에서 세어 "태그에 3건인데 눌러도 빈 화면"을 없앰(칩 수 = 카드 수). 지표 카드에 `419 listed · 3 retracted excluded` 주석을 달아 415/418 혼란 해소. 게재처 미상 5건을 빈칸 대신 `Venue unknown`으로 표기. 진행 중 배지를 원본 표기(`Under Review`)로 되돌리고 검사 순서를 진행 단계 역순으로 정리 |
| 2026-09-20 | 데이터 교정 — 의료 딥페이크 논문이 Sites에서 제목·학술지·상태가 모두 바뀌어 게재 확정(CMC-Computers, Materials & Continua, Accepted Sept. 2026)된 것을 반영(7개월간 `Scientific Reports / Submitted, Feb. 2026`로 노출됐음). Scholar에 연도가 없어 영구히 걸러지던 ECCV-26 워크숍 논문 1건 추가(426→427). 인용수 갱신은 Scholar 429로 보류 |
