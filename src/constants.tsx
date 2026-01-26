import { Member, Publication, ResearchArea } from './types';

export const LAB_NAME = "Security Visual Intelligence Lab";
export const LAB_DESCRIPTION = "Pioneering Trustworthy AI and Secure Computer Vision";

// 연구 분야 데이터
export const RESEARCH_AREAS: ResearchArea[] = [
  {
    id: "machine-unlearning",
    title: "Machine Unlearning",
    description: "Developing algorithms to remove specific data influence from trained models while maintaining performance.",
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800",
    icon: "eraser"
  },
  {
    id: "secure-cv",
    title: "Secure Computer Vision",
    description: "Robustness against adversarial attacks and ensuring privacy in visual data processing.",
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&q=80&w=800",
    icon: "shield"
  },
  {
    id: "trustworthy-ai",
    title: "Trustworthy AI",
    description: "Explainability, fairness, and accountability in artificial intelligence systems.",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
    icon: "brain"
  }
];

// 멤버 데이터 (업데이트됨)
export const MEMBERS: Member[] = [
  {
    name: "Seungmin Rho",
    role: "Principal Investigator",
    image: "/assets/Seungmin Rho.jpg", // 수정됨
    email: "smrho@cau.ac.kr",
    website: "https://sites.google.com/view/seungminrho"
  },
  {
    name: "Byeongcheon Lee",
    role: "Ph.D. Student",
    image: "/assets/Byeongcheon Lee.jpg", // 수정됨
    email: "qudcjs159@cau.ac.kr"
  },
  {
    name: "Sangmin Kim",
    role: "Ph.D. Student",
    image: "/assets/Sangmin Kim.jpg", // 수정됨
    email: "sangmin0826@cau.ac.kr"
  },
  // 필요한 경우 추가 멤버...
];

// 논문 데이터
export const PUBLICATIONS: Publication[] = [
  {
    id: "pub1",
    title: "Example Paper Title on Machine Unlearning",
    authors: ["Byeongcheon Lee", "Seungmin Rho"],
    venue: "CVPR 2024",
    year: 2024,
    tags: ["Machine Unlearning", "Privacy"]
  },
  {
    id: "pub2",
    title: "Robustness in Vision Transformers",
    authors: ["Sangmin Kim", "Seungmin Rho"],
    venue: "ICCV 2023",
    year: 2023,
    tags: ["Adversarial Robustness"]
  }
];