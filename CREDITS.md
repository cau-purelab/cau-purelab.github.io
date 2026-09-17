# 이미지 출처와 라이선스

이 저장소가 배포하는 이미지 중 **외부에서 가져온 것**의 출처와 라이선스를 기록한다.
새 이미지를 추가할 때는 반드시 이 표를 함께 갱신할 것.

| 파일 | 출처 | 저작자 | 라이선스 | 가한 편집 |
|------|------|--------|----------|-----------|
| `public/assets/hero.webp` | [Cybersecurity.png — Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Cybersecurity.png) | (CC0 기증, 저작자 표시 불요) | [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/) | 자물쇠가 헤드라인 뒤에 가리지 않도록 오른쪽 78% 지점에 오게 크롭, 1400×933으로 리사이즈, **신경망 노드·엣지 레이어를 직접 그려 합성**(왼쪽에서 자물쇠로 수렴 — 인공지능과 보안을 함께 표현), WebP 변환. 원본은 8000×4500 PNG. |

> CC0는 퍼블릭 도메인 기증이라 **저작자 표시 의무가 없다.** 그래서 사이트 푸터에는 표기하지 않고
> 출처 추적을 위해 이 문서에만 남긴다. 만약 앞으로 CC BY 계열 이미지를 쓰면 **푸터에 표시를 넣어야 한다.**

## 저장소가 직접 만든 이미지 (외부 출처 없음)

| 파일 | 설명 |
|------|------|
| `public/assets/privacy-preserving-ai.svg` 외 2종 | 연구 분야 일러스트. 직접 그린 SVG. |
| `public/assets/favicon*.png`, `og-image.png` | 브랜드 마크에서 생성. `src/components/Logo.tsx`와 같은 좌표를 쓴다. |
| `public/assets/*.jpg` | 구성원 사진. 본인 제공. |
| `hero.webp`의 신경망 레이어 | 직접 그려 CC0 배경 위에 합성. |

## 주의

- CC BY / CC BY-SA 계열은 **저작자 표시가 의무**다. 그런 이미지를 쓸 경우 푸터 표기를 반드시 추가할 것.
- 생성형 이미지 도구의 출력물을 쓸 경우 워터마크 유무를 반드시 확인할 것
  (2026-09-17에 워터마크가 남은 일러스트 3장이 배포된 적이 있다).
