// src/types.ts

export interface NewsItem {
  id: string;
  date: string;
  title: string;
}

export interface Member {
  id: string;
  name: string;
  role: string; // 'PI' | 'PostDoc' | 'PhD' | 'Master' | 'Undergraduate' | 'Alumni'
  image: string;
  email?: string;
  specialization?: string;
  isAlumni?: boolean;
  currentAffiliation?: string; // 졸업생의 현재 직장
  website?: string;
  googleScholar?: string;
  github?: string;
  linkedin?: string;
}

export interface Publication {
  id: string;
  title: string;
  authors: string[];
  venue: string;
  year: number;
  tags?: string[];
  link?: string;      // 대표 링크
  pdf?: string;       // PDF 다운로드 링크
  bibtex?: string;    // BibTeX 인용구
  isSelected?: boolean; // 주요 논문 여부
}

export interface ResearchArea {
  id: string;
  title: string;
  description: string;
  image: string;
  tags?: string[];
  github?: string;
  dataset?: string;
}