import { Member, Publication, ResearchArea, NewsItem } from './types';

export const LAB_NAME = "Security Visual Intelligence Lab";
export const LAB_DESCRIPTION = "Pioneering Trustworthy AI, Machine Unlearning, and Secure Computer Vision.";

// 1. 뉴스 데이터
export const NEWS: NewsItem[] = [
  { id: 'n8', date: '2025.11.29', title: 'Society for e-Business Studies 2025 Fall Academic Conference at AICT.' },
  { id: 'n7', date: '2025.10.25', title: 'Attending ECAI 2025 in Bologna, Italy (Workshop paper: TRUST-AI).' },
  { id: 'n6', date: '2025.09.14', title: 'Participating in FedCSIS 2025 in Kraków, Poland.' },
  { id: 'n5', date: '2025.08.25', title: 'PlatCon-25 in Jeju: Int. Conf. on Platform Technology and Service.' },
  { id: 'n4', date: '2025.05.01', title: 'Hosting Society for e-Business Studies Spring Conference at CAU Bldg 310.' },
  { id: 'n3', date: '2025.01.15', title: 'Participated in ICOIN 2025 in Chiang Mai, Thailand.' },
  { id: 'n2', date: '2024.08.26', title: 'Attended PlatCon-24 in Jeju, Korea.' },
  { id: 'n1', date: '2024.03.04', title: 'Security Visual Intelligence Lab (SVIL) founded by Prof. Seungmin Rho at CAU.' },
];

// 2. 연구 분야 데이터
export const RESEARCH_AREAS: ResearchArea[] = [
  {
    id: "machine-unlearning",
    title: "Machine Unlearning",
    description: "Developing algorithms that allow AI models to 'forget' specific data points without full retraining. We focus on removing privacy-sensitive data from LLMs and copyrighted content from Diffusion models while maintaining model performance.",
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800",
    tags: ['Generative Models', 'LLM Privacy', 'Copyright Removal'],
    github: 'https://github.com/svil-lab/unlearning-lib'
  },
  {
    id: "secure-cv",
    title: "Secure Computer Vision",
    description: "Ensuring the reliability of computer vision systems against adversarial attacks and data poisoning. Our research bridges the gap between high-performance visual recognition and real-world security requirements.",
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&q=80&w=800",
    tags: ['Model Robustness', 'AI Safety', 'Adversarial Defense'],
    github: 'https://github.com/svil-lab/secure-cv'
  },
  {
    id: "trustworthy-ai",
    title: "Trustworthy AI",
    description: "Investigating the security vulnerabilities of large-scale generative models. We develop watermarking techniques for AI-generated content and defense mechanisms against prompt injection in multi-modal models.",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
    tags: ['Diffusion Security', 'Watermarking', 'Prompt Security']
  }
];

// 3. 멤버 데이터
export const MEMBERS: Member[] = [
  // PI
  {
    id: 'pi',
    name: "Seungmin Rho",
    role: "Principal Investigator",
    image: "/assets/Seungmin Rho.jpg",
    email: "smrho@cau.ac.kr",
    specialization: 'AI Security & Privacy',
    website: "https://sites.google.com/view/seungminrho"
  },
  // PostDoc
  {
    id: 'm1',
    name: "Sungwoo Park",
    role: "PostDoc",
    image: "https://ui-avatars.com/api/?name=Sungwoo+Park&background=random",
    email: "", // 정보 없음
    specialization: "" // 정보 없음
  },
  // PhD Students
  {
    id: 'm2',
    name: "Byeongcheon Lee",
    role: "Ph.D. Student",
    image: "/assets/Byeongcheon Lee.jpg",
    email: "qudcjs0208@cau.ac.kr",
    specialization: 'Discriminator-Guided Unlearning',
    github: "https://github.com/cheonbung"
  },
  {
    id: 'm3',
    name: "Sangmin Kim",
    role: "Ph.D. Student",
    image: "/assets/Sangmin Kim.jpg",
    email: "kimddol98@cau.ac.kr",
    specialization: 'Machine Unlearning for LLMs'
  },
  // Masters
  {
    id: 'm4',
    name: "Hyungjun Park",
    role: "Master Student",
    image: "https://ui-avatars.com/api/?name=Hyungjun+Park&background=random",
    email: "", // 정보 없음
    specialization: "" // 정보 없음
  },
  // Undergraduates
  {
    id: 'm5',
    name: "Hyunok Kim",
    role: "Undergraduate Intern",
    image: "https://ui-avatars.com/api/?name=Hyunok+Kim&background=random",
    email: "", // 정보 없음
    specialization: "" // 정보 없음
  },
  // Alumni (임시 데이터 N/A)
  {
    id: 'a1',
    name: "N/A", // 이름 N/A로 변경
    role: "Master",
    isAlumni: true,
    currentAffiliation: "N/A", // 소속 N/A로 변경
    image: "", // 이미지 없음
    specialization: ""
  }
];

// 4. 논문 데이터
export const PUBLICATIONS: Publication[] = [
  {
    id: 'p1',
    year: 2024,
    title: "Advancing Autoencoder Architectures for Enhanced Anomaly Detection in Multivariate Industrial Time Series",
    authors: ["Byeongcheon Lee", "Sangmin Kim", "Jongseo Moon", "Seungmin Rho"],
    venue: "Computers, Materials & Continua, 81(1)",
    tags: ["Anomaly Detection", "Time Series"],
    isSelected: true
  },
  {
    id: 'p2',
    year: 2025,
    title: "Deep Learning-Based Natural Language Processing Model and Optical Character Recognition for Detection of Online Grooming on Social Networking Services",
    authors: ["Sangmin Kim", "Byeongcheon Lee", "M. Maqsood", "Jongseo Moon", "Seungmin Rho"],
    venue: "Computer Modeling in Engineering & Sciences (CMES), 143(2)",
    tags: ["NLP", "Social Security"],
    isSelected: true
  },
  {
    id: 'p3',
    year: 2025,
    title: "A Framework for Machine Unlearning Using Selective Knowledge Distillation into Soft Decision Tree",
    authors: ["Sangmin Kim", "Byeongcheon Lee", "Sungwoo Park", "Mi Young Lee", "Seungmin Rho"],
    venue: "Annals of Computer Science and Information Systems, 45, 95-101",
    tags: ["Machine Unlearning", "Knowledge Distillation"],
    isSelected: true
  },
  {
    id: 'p4',
    year: 2025,
    title: "An Image Generation Framework Integrating Invisible Watermarking and Selective Class Unlearning",
    authors: ["Sungwoo Park", "Byeongcheon Lee", "Sangmin Kim", "Seungyeob Chae", "Mi Young Lee", "Seungmin Rho"],
    venue: "Journal of Platform Technology, 13(6), 21-32",
    tags: ["Watermarking", "Unlearning"],
    isSelected: true
  },
  {
    id: 'p6',
    year: 2025,
    title: "Discriminator-Guided Unlearning: A Framework for Selective Forgetting in Conditional GANs",
    authors: ["Byeongcheon Lee", "Sangmin Kim", "Sungwoo Park", "Seungmin Rho", "Mi Young Lee"],
    venue: "Preprint",
    tags: ["GANs", "Unlearning"],
    isSelected: true
  },
  {
    id: 'p7',
    year: 2024,
    title: "Voice Phishing Detection Using Deep Learning-based NLP and Knowledge Distillation Techniques",
    authors: ["Sangmin Kim", "Seungmin Rho"],
    venue: "The Journal of Society for e-Business Studies, 29(4), 139-148",
    tags: ["Voice Phishing", "NLP"]
  },
  {
    id: 'p8',
    year: 2025,
    title: "Time-Series Traffic Volume Prediction Modeling of Gyeongbu Expressway Combined with Meteorological Data",
    authors: ["Byeongcheon Lee", "Seungmin Rho"],
    venue: "The Journal of Society for e-Business Studies, 30(3), 117-131",
    tags: ["Time-Series", "Prediction"]
  }
];