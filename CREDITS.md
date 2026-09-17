# 이미지 출처와 라이선스

이 저장소가 배포하는 이미지 중 **외부에서 가져온 것**의 출처와 라이선스를 기록한다.
새 이미지를 추가할 때는 반드시 이 표를 함께 갱신할 것.

| 파일 | 출처 | 저작자 | 라이선스 | 비고 |
|------|------|--------|----------|------|
| `public/assets/hero.webp` | [T-SNE Embedding of MNIST — Wikimedia Commons](https://commons.wikimedia.org/wiki/File:T-SNE_Embedding_of_MNIST.png) | Kyle McDonald | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) | 축·눈금·여백을 잘라내고 1100×734로 리사이즈, 채도 0.82배 조정 후 WebP로 변환. 원본은 1417×1369 PNG. 저작자 표시는 사이트 푸터에 표기함. |

## 저장소가 직접 만든 이미지 (외부 출처 없음)

| 파일 | 설명 |
|------|------|
| `public/assets/privacy-preserving-ai.svg` 외 2종 | 연구 분야 일러스트. 직접 그린 SVG. |
| `public/assets/favicon*.png`, `og-image.png` | 브랜드 마크에서 생성. `src/components/Logo.tsx`와 같은 좌표를 쓴다. |
| `public/assets/*.jpg` | 구성원 사진. 본인 제공. |

## 주의

- **CC BY 계열은 저작자 표시가 의무다.** 푸터의 표기를 지우면 라이선스 위반이 된다.
- 생성형 이미지 도구의 출력물을 쓸 경우 워터마크 유무를 반드시 확인할 것
  (2026-09-17에 워터마크가 남은 일러스트 3장이 배포된 적이 있다).
