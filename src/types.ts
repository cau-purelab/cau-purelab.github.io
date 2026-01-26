export interface Member {
  name: string;
  role: string;
  image: string;
  email: string;
  website?: string;
  googleScholar?: string;
}

export interface Publication {
  id: string;
  title: string;
  authors: string[];
  venue: string;
  year: number;
  tags?: string[];
  link?: string;
  pdf?: string;
}

export interface ResearchArea {
  id: string;
  title: string;
  description: string;
  image: string;
  icon: string;
}