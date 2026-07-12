// src/types.ts

export interface NewsItem {
  id: string;
  date: string;
  title: string;
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
  dataset?: string;
}