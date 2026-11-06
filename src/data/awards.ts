// 학생·연구실 수상 내역 (수동 관리). 화면: Home 하이라이트, News의 Honors & Awards(/news#awards).
// 출처: 수상 안내 메일·학술대회 프로그램·수상 목록 캡처(2026-11-06 사용자 제공). 확인 안 된 값은 비워 둔다 —
//  · CISC-W'26 수상 논문은 공식 영문 제목을 받지 못해 원제만 둔다(저자는 학술대회 프로그램 캡처 기준).
//  · DID 공모전은 사용자가 준 기사(2024 블록체인 진흥주간 × 웹3 콘퍼런스, 과기정통부 주최)를 근거로 행사명을 붙였다.
//    기사에는 공모전 자체가 아니라 한국전자거래학회 세션만 나온다 — 행사와의 연결은 사용자 확인에 기댄다. 기사 링크는 사용자 요청으로 뺐다(2026-11-06).
//  · 국내 상은 원래 이름(awardKo)을 함께 둔다. 영문 상 이름은 등급을 옮긴 것이다(우수논문상 → Best Paper Award).
// 화면은 date 내림차순으로 다시 정렬하므로 삽입 순서는 상관없다.
import type { Award } from '../types';

const KIISC = 'Korea Institute of Information Security and Cryptology (KIISC, 한국정보보호학회)';
const SEB = 'Society for e-Business Studies (한국전자거래학회)';

export const AWARDS: Award[] = [
  {
    id: 'cisc-w-2026-best-paper',
    date: '2026.10',
    tier: 'best-paper',
    award: 'Best Paper Award',
    awardKo: '우수논문상 (한국정보보호학회장상)',
    event: 'CISC-W 2026 (KIISC Winter Conference), Yeosu',
    organizer: KIISC,
    work: { titleKo: '머신 언러닝 모델의 탐지 가능성 완화를 위한 내부 표현 정렬 프레임워크' },
    peopleKind: 'authors',
    // 박성우는 덕성여자대학교 소속(외부 공저자), 나머지는 중앙대학교
    people: ['Hyunok Kim', 'Sangmin Kim', 'Byeongcheon Lee', 'Hyungjun Park', 'Sungwoo Park', 'Mi Young Lee', 'Seungmin Rho'],
  },
  {
    id: 'cau-junior-2025',
    date: '2026.03',
    tier: 'excellence',
    award: 'Excellence Award',
    awardKo: '우수상',
    event: '2025 CAU-Junior Convergence Research Group',
    organizer: 'Chung-Ang University',
    peopleKind: 'team',
    people: ['Byeongcheon Lee', 'Sangmin Kim'],
  },
  {
    id: 'seb-2025-fall-idea-contest',
    date: '2025.11',
    tier: 'grand',
    award: 'Grand Prize',
    awardKo: '최우수상',
    event: 'Student Idea Competition, Society for e-Business Studies 2025 Fall Conference',
    organizer: SEB,
    work: { titleKo: '머신 언러닝 기반 네트워크 침입 탐지 시스템(NIDS)' },
    peopleKind: 'team',
    people: ['Taein Lim', 'Sangmin Kim', 'Byeongcheon Lee'],
  },
  {
    id: 'seb-2025-fall-best-paper',
    date: '2025.11',
    tier: 'best-paper',
    award: 'Best Paper Award',
    awardKo: '우수논문상',
    event: 'Society for e-Business Studies 2025 Fall Conference',
    organizer: SEB,
    work: {
      title: 'A Class-Selective Unlearning Framework for Pattern-Preserving Generative Models',
      titleKo: '패턴 보존 기반 생성 모델의 클래스 선택적 언러닝 프레임워크',
    },
    peopleKind: 'authors',
    people: ['Sangmin Kim', 'Byeongcheon Lee', 'Sungwoo Park', 'Mi Young Lee', 'Seungmin Rho'],
  },
  {
    id: 'seb-2024-did-idea-contest',
    date: '2024.11',
    tier: 'encouragement',
    award: 'Encouragement Award',
    awardKo: '장려상',
    event: 'DID (Decentralized Identity) Business Model Patent Idea Competition, 2024 Blockchain Promotion Week × Web3 Conference, Seoul',
    organizer: SEB,
    peopleKind: 'team',
    people: ['Byeongcheon Lee', 'Sangmin Kim'],
  },
];

/** 최신순 정렬본 (같은 달이면 등급이 높은 쪽이 먼저) */
const TIER_ORDER: Record<Award['tier'], number> = { grand: 0, 'best-paper': 1, excellence: 2, encouragement: 3 };
export const AWARDS_SORTED: Award[] = [...AWARDS].sort(
  (a, b) => b.date.localeCompare(a.date) || TIER_ORDER[a.tier] - TIER_ORDER[b.tier]
);
