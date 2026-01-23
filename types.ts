
export interface NewsItem {
  id: string;
  date: string;
  title: string;
}

export interface ResearchArea {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  links?: {
    github?: string;
    dataset?: string;
    demo?: string;
  };
}

export interface Member {
  id: string;
  name: string;
  role: 'PI' | 'PostDoc' | 'PhD' | 'Master' | 'Undergraduate' | 'Staff';
  image: string;
  specialization?: string;
  isAlumni?: boolean;
  destination?: string; // e.g., "Software Engineer at Google"
  links: {
    web?: string;
    scholar?: string;
    github?: string;
    linkedin?: string;
  };
}

export interface Publication {
  id: string;
  year: number;
  title: string;
  authors: string[];
  venue: string;
  bibtex?: string;
  links: {
    pdf?: string;
    project?: string;
    code?: string;
  };
  isSelected?: boolean;
}
