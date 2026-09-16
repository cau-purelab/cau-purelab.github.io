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