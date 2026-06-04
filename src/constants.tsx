import { Member, Publication, ResearchArea, NewsItem } from './types';

export const LAB_NAME = "Security Visual Intelligence Lab";
export const LAB_DESCRIPTION = "Pioneering Trustworthy AI, Machine Unlearning, and Secure Computer Vision.";

// 1. 뉴스 데이터
export const NEWS: NewsItem[] =[
  { id: 'n9', date: '2026.02.24', title: 'Attended ICAIIC 2026 in Tokyo, Japan.' },
  { id: 'n8', date: '2025.11.29', title: 'Attended the Society for e-Business Studies 2025 Fall Academic Conference at AICT.' },
  { id: 'n7', date: '2025.10.25', title: 'Attended ECAI 2025 in Bologna, Italy (Workshop paper: TRUST-AI).' },
  { id: 'n6', date: '2025.09.14', title: 'Attended FedCSIS 2025 in Kraków, Poland.' },
  { id: 'n5', date: '2025.08.25', title: 'Attended PlatCon-25 in Jeju, Korea.' },
  { id: 'n4', date: '2025.05.01', title: 'Hosted the Society for e-Business Studies Spring Conference at CAU Bldg 310.' },
  { id: 'n3', date: '2025.01.15', title: 'Attended ICOIN 2025 in Chiang Mai, Thailand.' },
  { id: 'n2', date: '2024.08.26', title: 'Attended PlatCon-24 in Jeju, Korea.' },
  { id: 'n1', date: '2024.03.04', title: 'Security Visual Intelligence Lab (SVIL) founded by Prof. Seungmin Rho at CAU.' },
];

// 2. 연구 분야 데이터
export const RESEARCH_AREAS: ResearchArea[] =[
  {
    id: "machine-unlearning",
    title: "Machine Unlearning",
    description: "Developing algorithms that allow AI models to 'forget' specific data points without full retraining. We focus on removing privacy-sensitive data from LLMs and copyrighted content from Diffusion models while maintaining model performance.",
    image: "/assets/machine-unlearning.png",
    tags:['Generative Models', 'LLM Privacy', 'Copyright Removal'],
    github: 'https://github.com/svil-lab/unlearning-lib'
  },
  {
    id: "secure-cv",
    title: "Secure Computer Vision",
    description: "Ensuring the reliability of computer vision systems against adversarial attacks and data poisoning. Our research bridges the gap between high-performance visual recognition and real-world security requirements.",
    image: "/assets/secure-cv.png",
    tags:['Model Robustness', 'AI Safety', 'Adversarial Defense'],
    github: 'https://github.com/svil-lab/secure-cv'
  },
  {
    id: "trustworthy-ai",
    title: "Trustworthy AI",
    description: "Investigating the security vulnerabilities of large-scale generative models. We develop watermarking techniques for AI-generated content and defense mechanisms against prompt injection in multi-modal models.",
    image: "/assets/trustworthy-ai.png",
    tags:['Diffusion Security', 'Watermarking', 'Prompt Security']
  }
];

// 3. 멤버 데이터 (PostDoc 삭제 완료)
export const MEMBERS: Member[] =[
  {
    id: 'pi',
    name: "Seungmin Rho",
    role: "Principal Investigator",
    image: "/assets/Seungmin Rho.jpg",
    email: "smrho@cau.ac.kr",
    specialization: '#AI Security & Privacy',
    website: "https://sites.google.com/view/seungminrho"
  },
  {
    id: 'co-pi',
    name: "Mi Young Lee",
    role: "Co-Principal Investigator",
    image: "/assets/Mi young Lee.jpg",
    email: "miylee@cau.ac.kr",
    specialization: '#AI Security & Data Privacy #Machine Unlearning #Synthetic Data #Computer Vision',
    website: "https://sites.google.com/view/ntblue/home"
  },
  {
    id: 'm2',
    name: "Byeongcheon Lee",
    role: "Ph.D. Student",
    image: "/assets/Byeongcheon Lee.jpg",
    email: "qudcjs0208@cau.ac.kr",
    website: "https://cheonbung.github.io/",
    specialization: '#Machine Unlearning #Trustworthy AI #Time Series Anomaly Detection #Generative Model Security',
    github: "https://github.com/cheonbung"
  },
  {
    id: 'm3',
    name: "Sangmin Kim",
    role: "Ph.D. Student",
    image: "/assets/Sangmin Kim.jpg",
    email: "kimddol98@cau.ac.kr",
    specialization: '#Machine Unlearning #Trustworthy AI #Natural Language Processing #LLM',
    github: "https://github.com/Sang-T"
  },
  {
    id: 'm4',
    name: "Hyungjun Park",
    role: "Master Student",
    image: "https://ui-avatars.com/api/?name=Hyungjun+Park&background=random",
    email: "",
    specialization: ""
  },
  {
    id: 'm5',
    name: "Hyunok Kim",
    role: "Undergraduate Intern",
    image: "https://ui-avatars.com/api/?name=Hyunok+Kim&background=random",
    email: "",
    specialization: ""
  }
];

// 4. 주요 논문 데이터
export const PUBLICATIONS: Publication[] =[
  {
    id: 'p1',
    year: 2026,
    title: "SHAP-Guided Leaf-Value Adjustment for Efficient Unlearning in LightGBM",
    authors:["Sungwoo Park", "Sangmin Kim", "Byeongcheon Lee", "Muazzam Maqsood", "Mi Young Lee", "Seungmin Rho"],
    venue: "Future Generation Computer Systems",
    tags: ["Machine Unlearning", "LightGBM"],
    isSelected: true,
    bibtex: "@article{Park2026SHAP,\n title={SHAP-Guided Leaf-Value Adjustment for Efficient Unlearning in LightGBM},\n author={Park, Sungwoo and Kim, Sangmin and Lee, Byeongcheon and Maqsood, Muazzam and Lee, Mi Young and Rho, Seungmin},\n journal={Future Generation Computer Systems},\n year={2026}\n}"
  },
  {
    id: 'p2',
    year: 2026,
    title: "A Data Analytics-Driven Approach to Backorder Prediction Using Federated Machine Learning in Industrial Supply Chains",
    authors:["Asma Sattar", "Maryam Bukhari", "Zahoor ur Rehman", "Saman Khalid", "Yangsun Lee", "Seungmin Rho"],
    venue: "Scientific Reports, Vol. 16, 1-23",
    tags:["Federated Learning", "Supply Chain"],
    isSelected: true
  },
  {
    id: 'p3',
    year: 2025,
    title: "Advancing Autoencoder Architectures for Enhanced Anomaly Detection in Multivariate Industrial Time Series",
    authors:["Byeongcheon Lee", "Sangmin Kim", "Muazzam Maqsood", "Jihoon Moon", "Seungmin Rho"],
    venue: "CMC-Computers, Materials & Continua, 81(1)",
    tags:["Anomaly Detection", "Time Series"],
    isSelected: true
  },
  {
    id: 'p4',
    year: 2025,
    title: "Deep Learning-Based Natural Language Processing Model and Optical Character Recognition for Detection of Online Grooming on Social Networking Services",
    authors:["Sangmin Kim", "Byeongcheon Lee", "Jihoon Moon", "Seungmin Rho"],
    venue: "Computer Modeling in Engineering & Sciences (CMES), 143(2)",
    tags:["NLP", "Social Security"],
    isSelected: true
  },
  {
    id: 'p5',
    year: 2025,
    title: "A Framework for Machine Unlearning Using Selective Knowledge Distillation into Soft Decision Tree",
    authors:["Sangmin Kim", "Byeongcheon Lee", "Sungwoo Park", "Mi Young Lee", "Seungmin Rho"],
    venue: "Annals of Computer Science and Information Systems, 45, 95-101",
    tags:["Machine Unlearning", "Knowledge Distillation"],
    isSelected: true
  },
  {
    id: 'p6',
    year: 2025,
    title: "An Image Generation Framework Integrating Invisible Watermarking and Selective Class Unlearning",
    authors:["Sungwoo Park", "Byeongcheon Lee", "Sangmin Kim", "Seungyeob Chae", "Mi Young Lee", "Seungmin Rho"],
    venue: "Journal of Platform Technology, 13(6), 21-32",
    tags:["Watermarking", "Unlearning"],
    isSelected: true
  },
  {
    id: 'p7',
    year: 2025,
    title: "Discriminator-Guided Unlearning: A Framework for Selective Forgetting in Conditional GANs",
    authors:["Byeongcheon Lee", "Sangmin Kim", "Sungwoo Park", "Seungmin Rho", "Mi Young Lee"],
    venue: "ECAI 2025 Workshop (TRUST-AI)",
    tags:["GANs", "Unlearning"],
    isSelected: true
  },
  {
    id: 'p8',
    year: 2024,
    title: "Voice Phishing Detection Using Deep Learning-based NLP and Knowledge Distillation Techniques",
    authors:["Sangmin Kim", "Byeongcheon Lee", "Hyeonwoo Kim", "Seungmin Rho"],
    venue: "The Journal of Society for e-Business Studies, 29(4), 139-148",
    tags:["Voice Phishing", "NLP"]
  }
];
