// src/types.ts

export interface NewsItem {
  id: string;
  date: string;
  title: string;
  /**
   * 소식의 원문 주소(학회 프로그램, 공지, 논문 페이지 등). 있을 때만 제목이 링크가 된다.
   * 목적지가 없는 항목에 링크처럼 보이는 장식을 붙이지 않기 위한 선택 필드다.
   * scripts/site.cjs의 NEWS 파서는 키 순서·추가 키에 영향받지 않으므로 그대로 추가해도 된다.
   */
  link?: string;
}

export interface Member {
  id: string;
  name: string;
  role: string;
  image: string;
  email?: string;
  specialization?: string;
  isAlumni?: boolean;
  website?: string;
  github?: string;
  linkedin?: string;
}

export interface Publication {
  id: string;
  title: string;
  authors: string[];   // 주요 논문용 (배열)
  venue: string;       // 학술지/컨퍼런스 명
  year: number;
  tags?: string[];
  link?: string;       // DOI 또는 Scholar 링크 (publications.json과 대응)
  bibtex?: string;
  isSelected?: boolean;
  status?: string;     // 미게재 논문 상태 표기 (예: "Under Review")
}

export interface ResearchArea {
  id: string;
  title: string;
  description: string;
  image: string;
  tags?: string[];
}
/** 수상 등급 — 화면의 배지 색과 라벨을 정한다(src/components/AwardItem.tsx). */
export type AwardTier = 'grand' | 'best-paper' | 'excellence' | 'encouragement';

export interface Award {
  /** 앵커·key용. 한 번 정하면 바꾸지 말 것 */
  id: string;
  /** 'YYYY.MM' — 정렬 기준. 날짜를 모르면 지어내지 말고 사용자에게 받을 것 */
  date: string;
  tier: AwardTier;
  /** 상 이름(영문) */
  award: string;
  /** 상 이름 원문(국내 상은 한국어 그대로) */
  awardKo?: string;
  /** 대회·학술대회 이름(영문) */
  event: string;
  /** 대회·행사 원문 주소(기사·공지). 있을 때만 대회 이름이 링크가 된다 — 없는 주소를 지어내지 말 것 */
  link?: string;
  organizer: string;
  /** 수상 논문·출품작 제목. 공식 영문 제목이 있을 때만 title을 채우고, 없으면 원문(titleKo)만 둔다 */
  work?: { title?: string; titleKo?: string };
  /** 'authors'는 논문 저자, 'team'은 공모전 팀원 — 화면 라벨이 달라진다 */
  peopleKind: 'authors' | 'team' | 'recipient';
  /** 이름 표기는 MEMBERS[].name과 글자 단위로 같아야 연구실 멤버로 강조된다 */
  people: string[];
}

export interface FundedProject {
  id: string;
  title: string;
  titleKo?: string;
  /** 'YYYY.MM.DD' — 진행 중/종료 판정은 빌드 날짜(__BUILD_DATE__)와 end를 비교해 정한다 */
  start: string;
  end: string;
  /** 짧은 배지 라벨(예: 'ITRC', 'IITP', 'KIAT', 'KOCCA') */
  program: string;
  /** 지원 부처·전문기관 */
  funders: string[];
  /** 컨소시엄(참여 기관) 또는 주관 학과 */
  partners?: string;
  /** publications.json의 funding_tags 중 이 과제에 해당하는 것(최신 연도가 마지막). Scholar 필터 링크에 쓴다 */
  fundingTags?: string[];
}
