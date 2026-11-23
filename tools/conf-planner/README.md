# 투고 플래너 갱신 절차

구성: `data/base.json`(2026-11-05 원본) + `data/overrides.json`(공식 페이지로 정정한 마감·개최일) + `data/checks.json`(공식 대조 이력) + `build.cjs`(합치기) + `template.html`(화면) → `public/conf-planner-b8feafcb/index.html`(배포 경로, 링크 공유 전용).

## 일정 값을 고칠 때
1. 공식 페이지를 직접 읽고 원문을 확인한다. 검색 요약이나 에이전트 보고만으로 바꾸지 않는다(PODS 개최일이 그렇게 틀렸다).
2. `data/overrides.json`에 항목을 추가한다. `deadline`(abs, dl, tz, ref=근거 URL, checked=확인일), `conf`(start, end, city), `edition`(set) 세 종류.
3. 시간대가 페이지에 없으면 `tz`를 비운다. 날짜표가 아니라 규칙으로 계산한 값은 edition 메모에 "규칙에서 계산"을 적는다(변경 감지에서 제외됨).
4. `node build.cjs` 로 `index.html`을 다시 만든다.

## 주간 변경 감지 (자동, 월요일 09:41 KST)
`.github/workflows/conf-planner-check.yml`이 `check-changes.cjs`를 돌려 ①기록한 마감 날짜가 사라졌는지 ②공식 페이지에 새 날짜가 나타났는지(`data/page-baseline.json` 대비)를 찾고, 있으면 `conf-planner` 라벨 이슈로 알린다.
- 자동 반영·배포는 없다. 알림을 받으면 공식 페이지를 직접 읽고 `overrides.json`을 고친 뒤 `node build.cjs` 결과와 함께 커밋한다.
- 수동: `node check-changes.cjs --no-update`(기준선 갱신 안 함, 보고서는 `check-report.md`, 커밋하지 않음).
- 한계: 날짜를 JS로 그리는 페이지는 못 읽고, 소식 날짜가 늘면 오탐이 난다. 연장 공지가 옛 날짜를 남기면 ①은 놓치고 ②가 잡는다.

## 상태 표기
- 공식 페이지 확인: 해당 회차의 공식 페이지에서 값을 읽어 일치 확인
- 공식 미게시 확인: 공식 사이트를 읽었고 아직 마감이 없음(예상 유지)
- 공식 근거 못 찾음: 공식 페이지에 접근하지 못했거나 근거가 없음
- 자료 기준: 아직 대조하지 않은 값(2026-11-05 자료). 2026-11-24 전수 대조 이후에는 새 회차·새 사이클이 생길 때만 나온다
