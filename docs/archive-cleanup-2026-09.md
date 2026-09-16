# 논문 아카이브 1회성 정리 내역 (2026-09-17)

대상 파일: `src/data/publications.json` (이 파일만 변경)

Google Scholar 프로필에서 자동 수집된 아카이브에 **논문이 아닌 항목**(학회 위원회 명단·환영사·프로시딩 권 표제)과
**타인·동명이인의 논문**이 섞여 들어와 논문 수·인용 수 지표에 그대로 합산되고 있었다. 이를 1회성으로 정리한 기록이다.

작업 원칙: **판단이 서지 않으면 남긴다.** 과잉 삭제가 미삭제보다 나쁘므로, 애매한 항목은 제거하지 않고 아래 **보류** 절에 기록했다.
아래 "보류" 표의 항목들은 연구실이 직접 확인해 결정해 주기 바란다.

## 요약

| 항목 | 정리 전 | 정리 후 | 변화 |
|------|---------|---------|------|
| Seungmin Rho 항목 수 | 470 | 426 | -44 |
| Mi Young Lee 항목 수 | 43 | 42 | -1 |
| **전체 항목 수** | **513** | **468** | **-45** |
| Rho 인용 합계 | 14,647 | 14,622 | -25 |
| Lee 인용 합계 | 3,925 | 3,852 | -73 |
| **전체 인용 합계** | **18,572** | **18,474** | **-98** |
| 파일 크기 | 349,521 B | 314,371 B | -35,150 B |

- 제거 45건 · 철회 표시 4건(제거 아님) · 중복 13편 정합 + 1편 보류 · 레거시 `funding` 키 433건 제거
- 인용 감소 98 = 동명이인 벤젠 논문 73 + 타인 논문 25 (front matter 33건은 전부 인용 0)
- **철회 논문 4건은 제거하지 않았다.** 연구 실적이므로 목록에 남기되 `"retracted": true`로 표시했다(UI 배지는 별도 작업).

---

## 1. 제거 — bibtex 저자에 PI(노승민) 이름이 전혀 없는 타인 논문 (31건)

Google Scholar가 프로필에 잘못 병합한 항목들이다. bibtex `author` 필드에 `Rho, Seungmin` / `노승민` 계열 표기가 하나도 없고,
주제·발표 매체로 보아도 본 연구실 연구가 아닌 것만 골랐다. 저자 목록이 `and others`로 잘려 판단이 불가능한 항목은 제거하지 않고 보류했다.

| # | 제목 | 인용 | 제거 사유 |
|---|------|------|-----------|
| 1 | Industrial analytics pipelines | 11 | bibtex 저자 전원이 ABB 연구진(Harper·Zheng·Jacobs 등), PI 없음 |
| 2 | 로지스틱 회귀분석을 이용한 중소기업 기술보호 요인 분석 | 7 | bibtex 저자 홍준석·박원형·김양훈·국광호, PI(노승민) 없음 · 연구 분야 무관 |
| 3 | 트위터와 신문의 이슈 속성 비교 연구: MBC 파업을 중심으로 | 3 | bibtex 저자 이미나·박천일·문지영, PI 없음 · 언론학 논문 |
| 4 | Big Data Technologies and Applications | 2 | Furht·Villanustre 저서(Springer), PI 없음 |
| 5 | Variational AutoEncoder-based anomaly | 1 | An Jinwon·Cho Sungzoon(SNU) 기술보고서, PI 없음 |
| 6 | Well-being Technology for Healthcare | 1 | bibtex 저자 Gianchandani 단독, PI 없음 |
| 7 | t-SNE-Based K-NN: A New Approach for MNIST | 0 | Meyer·Pozo·Zola, PI 없음 |
| 8 | Wireless multimedia surveillance networks. | 0 | Yazici·Koyuncu·Sert·Yilmaz, PI 없음 |
| 9 | Detection Approach Using Hybrid Image | 0 | Venkatraman·Alazab·Vinayakumar, PI 없음 |
| 10 | Preface of the 2017 IAENG International Conference on Electrical Engineering Special Session: Design, Analysis and Tools for Integrated Circuits and Systems | 0 | 학회 preface · PI 없음 |
| 11 | Corrigendum to “Power-aware fuzzy based joint base station and relay station deployment scheme for green radio communication”[J. Sustain. Comput.: Inform. Syst. 13 (2017) 1–14] | 0 | 타 논문 정오표(Arthi·Arulmozhivarman), PI 없음 |
| 12 | Preface of the 2016 IAENG international conference on electrical engineering special session: Design, analysis and tools for integrated circuits and systems | 0 | 학회 preface · PI 없음 |
| 13 | Divide-and-conquer | 0 | Nature Chemistry, Mallouk 단독 기고, PI 없음 |
| 14 | NBiS 2016 | 0 | 프로시딩 권 표제 · bibtex 저자는 재료물리 연구진, PI 없음 |
| 15 | Preface of the 2015 IAENG international conference on electrical engineering special session: Design, analysis and tools for integrated circuits and systems | 0 | 학회 preface · PI 없음 |
| 16 | Message from the workshop chairs | 0 | 학회 front matter · PI 없음 |
| 17 | Message from the WCC 2011 Program Chairs | 0 | 학회 front matter · PI 없음 |
| 18 | SH 2010: Welcome message from workshop organizers: FutureTech 2010 | 0 | 학회 front matter · PI 없음 |
| 19 | BWCCA 2015 | 0 | 프로시딩 권 표제 · PI 없음 |
| 20 | SOSE 2016 | 0 | 프로시딩 권 표제 · PI 없음 |
| 21 | GOCICT 2015 | 0 | 프로시딩 권 표제 · PI 없음 |
| 22 | PlatCon 2015 | 0 | 프로시딩 권 표제 · PI 없음 |
| 23 | Future Information Technology (24 Papers) | 0 | 프로시딩 권 표제 · bibtex 저자는 보건정보학 연구진, PI 없음 |
| 24 | EMC 2010 Organization | 0 | 학회 front matter · bibtex 저자는 핵물리 연구진, PI 없음 |
| 25 | MCC 2011 Organization | 0 | 학회 front matter · bibtex 저자는 개발경제 연구진, PI 없음 |
| 26 | IDCS 2009 Organizing Committee | 0 | 학회 front matter · PI 없음 |
| 27 | SPECIAL ISSUE ON MULTIMEDIA COMMUNICATIONS SYSTEMS | 0 | 특집호 표제(Rao·Bojkovic·Milovanovic), PI 없음 |
| 28 | MCCTA 2011 | 0 | 프로시딩 권 표제 · PI 없음 |
| 29 | CUTE 2010 Organization | 0 | 학회 front matter · PI 없음 |
| 30 | PDCAT 2011 Program Committee | 0 | 학회 front matter · PI 없음 |
| 31 | FutureTech 2010 | 0 | 프로시딩 권 표제 · PI 없음 |
## 2. 제거 — 학회 front matter (13건, PI가 의장·위원으로 등재된 항목)

프로그램 위원회 명단, 리뷰어 명단, 환영사, 의장 인사말 등 **논문이 아닌 학회 간행물 앞부분**이다.
PI가 의장·위원으로 이름을 올린 것은 사실이지만 연구 업적(논문)이 아니므로 아카이브에서 제외했다.
(위 1절에도 PI 이름이 없는 front matter 20건이 함께 포함되어 있어, front matter 제거는 총 33건이다.)

| # | 제목 | 인용 | 제거 사유 |
|---|------|------|-----------|
| 1 | UIC-ATC-ScalCom-CBDCom-IoP 2015 Keynotes | 0 | 학회 키노트 안내 front matter (PI는 의장으로 등재) |
| 2 | Message from general chairs: PlatCon 2015 | 0 | 학회 의장 인사말 front matter |
| 3 | Welcome message from MCC 2011 organizers | 0 | 학회 환영사 front matter |
| 4 | Message from the ISPA 2011 program chairs | 0 | 학회 프로그램 의장 인사말 front matter |
| 5 | FiCloud 2016 Program Committee | 0 | 프로그램 위원회 명단 front matter |
| 6 | Welcome message from the Semantics, Services and Applications Workshop Chairs (SSA 2011) | 0 | 워크숍 환영사 front matter |
| 7 | NetCoM-2009 Program Committee Members | 0 | 프로그램 위원회 명단 front matter |
| 8 | Welcome Message from SMPE-2012 Symposium Chairs | 0 | 심포지엄 환영사 front matter |
| 9 | SMPE2011 Reviewers | 0 | 리뷰어 명단 front matter |
| 10 | WiMoA 2009 Organizing and Program Committees | 0 | 조직/프로그램 위원회 명단 front matter |
| 11 | Organizing Committee of SMPE-2012 Workshop | 0 | 조직위원회 명단 front matter |
| 12 | Semantics, Services and Applications Workshop Committee (SSA 2011) | 0 | 워크숍 위원회 명단 front matter |
| 13 | Welcome message from NBiS 2012 Program Committee Co-Chairs | 0 | 학회 환영사 front matter |
## 3. 제거 — Mi Young Lee 동명이인 논문 (1건)

`CLAUDE.md` 작업 규칙 7이 이미 경고한 사안이다(Scholar 프로필에 1993~2016 직업의학·화학 분야 동명이인 논문이 섞여 있음).

| # | 제목 | 인용 | 제거 사유 |
|---|------|------|-----------|
| 1 | Occupational exposure to benzene in South Korea | 73 | 동명이인(직업의학 분야 Mi-Young Lee) — CLAUDE.md 작업 규칙 7이 경고한 사안 |
---

## 4. 철회(Retracted) 논문 — 제거하지 않고 표시만 추가 (4건)

`"retracted": true` 필드를 추가했다. 표시 제목에서 잘려 있던 `RETRACTED` / `[Retracted]` 접두는 bibtex의 원 제목대로 복원했다.
목록·지표에서 제외할지는 UI 쪽 별도 판단 사항이며, 데이터에서는 제거하지 않았다.

| 교수 | 변경 전 제목 | 변경 후 제목 | 인용 |
|------|--------------|--------------|------|
| Seungmin Rho | RETRACTED ARTICLE: Intrusion detection based on machine learning in the internet of things, attacks and counter measures | (동일 — 접두 이미 정상) | 49 |
| Seungmin Rho | Smart health monitoring and management system | Retracted: Smart health monitoring and management system: toward autonomous wearable sensing for internet of things using big data analytics | 1 |
| Seungmin Rho | Research Article A Rapid Artificial Intelligence-Based Computer-Aided Diagnosis System for COVID-19 Classification from CT Images | [Retracted] A Rapid Artificial Intelligence-Based Computer-Aided Diagnosis System for COVID-19 Classification from CT Images | 0 |
| Mi Young Lee | [Retracted] Vision Sensor‐Based Real‐Time Fire Detection in Resource‐Constrained IoT Environments | (동일 — 접두 이미 정상) | 88 |

> **확인 요청**: 2번째 항목(`Smart health monitoring...`)은 bibtex 저자가 `Din, Sadia and Paul, Anand` 뿐으로 PI가 없다.
> 1절의 제거 기준에는 해당하지만, 철회 표시 대상과 겹쳐 **제거하지 않고 표시만** 했다. 실제 공저 여부를 확인해 제거할지 결정해 주기 바란다.

---

## 5. 양 교수 목록에 중복 등재된 14편 — 정합 (제거 아님)

두 교수 모두의 업적이므로 양쪽 목록에 남기되, 탭마다 다르게 보이던 `funding_tags`와 `bibtex`를 일치시켰다.

- `funding_tags`: 양쪽의 **합집합**으로 통일 (한쪽에만 달려 있던 펀딩 정보가 사라지지 않도록)
- `bibtex`: 정보가 더 완전한 쪽을 기준으로 통일. 어느 쪽도 상대의 정보를 포함하지 못하는 1건은 **보류**
- `url`은 각 교수의 Scholar 인용 페이지를 가리키므로 **통일하지 않았다**

| # | 제목 | funding_tags 결과 | bibtex 기준 | 비고 |
|---|------|-------------------|-------------|------|
| 1 | Adversarial AI Through Frequency-Domain Imperceptible Attack on Person Re-Identification | NRF-SM-25, Prof. MYLee | — | 이미 동일 |
| 2 | Neuro-Symbolic Graph Learning for Causal Inference and Continual Learning in Mental-Health Risk Assessment | Prof. MYLee, NRF-SM-25 | — | 이미 동일 |
| 3 | Towards efficient electricity forecasting in residential and commercial buildings | (없음) | — | 이미 동일 |
| 4 | Cover the violence: A novel Deep-Learning-Based approach towards violence-detection in movies | (없음) | — | 이미 동일 |
| 5 | DB-Net: A novel dilated CNN based multi-step forecasting model | (없음) | — | 이미 동일 |
| 6 | Electrical energy prediction in residential buildings for short-term horizons | (없음) | — | 이미 동일 |
| 7 | Deep learning assisted buildings energy consumption profiling using smart meter data | (없음) | — | 이미 동일 |
| 8 | Sequential learning-based energy consumption prediction model | (없음) | — | 이미 동일 |
| 9 | An Image Generation Framework Integrating Invisible Watermarking and Selective Class Unlearning | NRF-SM-25, Prof. MYLee | Rho | Lee 쪽에 `Prof. MYLee` 태그 추가, bibtex 키 `Park2025ImageGenLee` → `Park2025ImageGen` |
| 10 | Discriminator-Guided Unlearning: A Framework for Selective Forgetting in Conditional GANs | NRF-SM-25 | Lee | Lee 쪽이 `@inproceedings` + `booktitle={ECAI 2025 Workshop (TRUST-AI)}`로 더 정확. Rho 쪽에 태그 추가 |
| 11 | A Framework for Machine Unlearning Using Selective Knowledge Distillation into Soft Decision Tree | NRF-SM-25 | Lee | 저자 표기가 `Lee, Mi Young`(MEMBERS 표기와 일치). Rho 쪽에 태그 추가 |
| 12 | Predictive modeling for ubiquitin proteins through advanced machine learning technique | (없음) | **보류** | 아래 보류 표 참조 |
| 13 | Machine learning based missing data imputation in categorical datasets | (없음) | Rho | Rho 쪽에 volume/pages/publisher + 저자 성명 전체 |
| 14 | BiGTA-Net: A hybrid deep learning-based electrical energy forecasting model | (없음) | Rho | Rho 쪽에 pages/publisher + 저자 성명 전체 |

> 12번을 제외한 13편은 양 교수 탭에서 동일한 bibtex·펀딩 태그로 표시된다.
> 단, `title` 필드 자체의 대소문자 차이(예: `Machine learning based...` vs `Machine Learning Based...`)는 이번 범위가 아니어서 손대지 않았다.

---

## 6. 레거시 `funding` 키 제거 (433건)

코드 어디에서도 읽지 않는 죽은 필드였다(값은 `"ITRC"` 또는 빈 문자열뿐). 실제 펀딩 정보는 `funding_tags`가 담고 있다.
`grep`으로 `src/`·`scripts/` 전체를 확인해 참조가 없음을 검증한 뒤 제거했다. 파일 크기 감소분의 상당 부분이 여기서 나왔다.

---

## 보류 — 연구실 확인 필요 (제거하지 않음)

### A. bibtex 저자에 PI가 없지만 제거하지 않은 7건

| # | 제목 | 인용 | 보류 사유 |
|---|------|------|-----------|
| 1 | A threshold adaptation based voice query transcription scheme for music retrieval | 3 | **PI 논문이 맞다.** bibtex 저자가 한글 표기(`한병준 and 노승민 and 황인준`)라 영문 이름 검사에 걸렸을 뿐이다. 자동 필터를 만들 때 한글 표기를 반드시 포함할 것 |
| 2 | A Smart Heart Disease Diagnostic System Using Deep Vanilla LSTM. | 19 | 저자 목록이 `and others`로 잘림. Bukhari·Yasmin·Durrani는 본 연구실 공동연구자이고 매체(CMC)도 일치 — PI가 잘린 뒤쪽에 있을 가능성 |
| 3 | Finding Temporal Influential Users in Social Media Using Association Rule Learning. | 16 | 저자 목록이 `and others`로 잘림 |
| 4 | Smart Transportation Decision Making through Big Graphs and IoT. | 0 | 저자 목록이 `and others`로 잘림. Rathore·Paul은 본 연구실 공동연구자 |
| 5 | Automatic voice query transformation for query-by-humming systems | 0 | 저자에 PI의 지도교수(황인준)가 있고 주제(query-by-humming)가 PI 초기 연구와 일치 — bibtex 저자 목록이 부정확할 가능성 |
| 6 | Crumbling Walls Log Quorum System-based Name Resolution Routing for CCN based IoT | 2 | bibtex 저자가 `Shah, Peer` 하나뿐인 손상된 형태라 판단 불가 |
| 7 | Smart health monitoring and management system (→ 철회 표시함) | 1 | 위 4절 참조 |

### B. front matter 성격이지만 제거하지 않은 특집호 편집 논설 9건

PI가 **저자로 등재된 실제 게재물**이고 인용도 집계된다(최대 16회). 학회 위원회 명단과는 성격이 다르다고 판단해 남겼다.
아카이브에서 빼고 싶다면 아래 목록대로 제거하면 된다.

| # | 제목 | 인용 |
|---|------|------|
| 1 | Enabling wireless communication and networking technologies for the internet of things [Guest editorial] | 16 |
| 2 | Guest editorial: cybertwin-driven 6g for internet of everything | 11 |
| 3 | Introduction to the special issue on advances in multimedia and educational technology | 9 |
| 4 | IEEE access special section editorial: Information security solutions for telemedicine applications | 7 |
| 5 | Special Issue on Artificial Intelligence Empowered Big Data Analytical Patterns for Medical Applications | 1 |
| 6 | Guest Editorial: Challenges of Embedded Systems as They Evolve into M2M, Internet of Things | 1 |
| 7 | Special Issue on Software-Defined Wireless Networks | 0 |
| 8 | GUEST EDITORIAL special issue on real-time perceptual-inspired imaging systems | 0 |
| 9 | Introduction to the special issue on advances in the convergence of multimedia, communications, and social web | 0 |

### C. 제목이 손상된 항목 1건

| 제목 | 인용 | 보류 사유 |
|------|------|-----------|
| `and Anand Paul 5` | 0 | 제목이 저자 문자열 조각으로 깨져 있다. bibtex 저자에 PI가 있어 실제 논문일 가능성이 높지만, 원 제목을 지어낼 수 없어 그대로 두었다. 연구실이 원 제목을 확인해 주면 교정 가능 |

### D. 중복 정합 보류 1건

| 제목 | 보류 사유 |
|------|-----------|
| Predictive modeling for ubiquitin proteins through advanced machine learning technique | Rho 쪽 bibtex에는 `volume`/`number`/`publisher`가 있고, Lee 쪽 bibtex에는 제1저자 `Shazia`가 있다. 어느 한쪽을 택하면 반대쪽 정보가 사라지고, 둘을 합치는 것은 임의 편집이라 그대로 두었다. 올바른 서지 정보를 알려주면 한 번에 정리 가능 |

---

## 재발 방지 (이번 범위 밖 — 별도 작업)

이 정리는 **1회성**이다. `scripts/sync_scholar.cjs`의 `JUNK_TITLE` 정규식이 실제 오염의 일부만 걸러내고 신규 추가에만 적용되므로,
다음 sync가 재개되면 같은 유형이 다시 유입된다. 아래는 상류 차단 방안이다.

1. **가장 확실한 방법** — 교수 Google Scholar 프로필에서 위원회·환영사·타인 논문 항목을 직접 삭제하면 다음 sync에 자동 반영되고 영구적이다.
2. `JUNK_TITLE`을 `scripts/lib.cjs`로 옮기고 `^\[?retracted|^preface|^foreword|reviewers|organization$|^(welcome|message)`까지 확장.
3. `sync_scholar.cjs`의 신규 추가 필터에 **bibtex/Scholar 저자 필드가 PI 이름 변형(한글 `노승민` 포함)을 담고 있는지** 검사하는 게이트 추가.
4. `scripts/validate_data.cjs`에 같은 규칙을 오류로 추가해 배포 전 게이트에서 걸리게 함.

## 검증

```
node scripts/validate_data.cjs   # [Seungmin Rho] 426건 / [Mi Young Lee] 42건 — 검증 통과
npx vite build                   # 성공
```

- `JSON.parse` 유효성, 제목·bibtex 중복 없음, UTF-8·2칸 들여쓰기·기존 키 순서 유지 확인
- 저장은 임시 파일 작성 후 `rename`하는 원자적 방식으로 수행
