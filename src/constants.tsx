import { Member, Publication, ResearchArea, NewsItem } from './types';

export const LAB_SHORT_NAME = "PURE";
export const LAB_FULL_NAME = "Privacy, Unlearning, and Robust Engineering Lab";
export const LAB_NAME = `${LAB_SHORT_NAME}(${LAB_FULL_NAME})`;
// 히어로 부제는 넓은 화면에서 한 줄로 두되, 폭이 모자라면 "and" 앞에서 접히게 한다.
// 그래서 문장을 접합점 기준 두 절로 보관한다. 메타 설명에 쓰는 한 문장은 여기서 합쳐 만들어
// 화면과 <meta description>이 갈라지지 않게 한다.
export const LAB_DESCRIPTION_CLAUSES = [
  "Advancing privacy-preserving AI, machine unlearning,",
  "and robust engineering for trustworthy systems.",
] as const;
export const LAB_DESCRIPTION = LAB_DESCRIPTION_CLAUSES.join(" ");
export const LAB_URL = "https://pure.cau.ac.kr";
export const LAB_EMAIL = "purelab.cau@gmail.com";
export const LAB_AFFILIATION = "Chung-Ang University";
// Footer의 지도 링크 검색어. index.html JSON-LD의 PostalAddress와 같은 주소를 쓴다.
export const LAB_ADDRESS_QUERY = "Chung-Ang University, 84 Heukseok-ro, Dongjak-gu, Seoul 06974, Republic of Korea";
export const LAB_ESTABLISHED_YEAR = 2024;
// 화면·메타 태그에 쓰는 짧은 브랜드명. LAB_NAME(공식 전체 명칭)은 JSON-LD·저작권 표기에만 쓴다.
// index.html의 og:site_name과 같은 값이어야 한다.
export const LAB_BRAND_NAME = "PURE Lab";
// 페이지 <title> 접미사. scripts/site.cjs의 TITLE_SUFFIX와 항상 같은 값이어야
// 정적 HTML(크롤러가 보는 값)과 Helmet(브라우저가 보는 값)이 어긋나지 않는다.
export const SITE_TITLE_SUFFIX = `${LAB_BRAND_NAME}, ${LAB_AFFILIATION}`;
// publications.json 갱신 시(scripts/sync_scholar.cjs --apply / scripts/update_scholar_metrics.cjs 실행 후) 함께 수정할 것
export const PUBLICATIONS_UPDATED_AT = "2026-09-18";

// Google Scholar 프로필 ID — scripts/lib.cjs의 PROFILES와 항상 같은 값을 유지할 것.
// (지표·배지의 출처를 화면에서 바로 열어볼 수 있도록 프런트엔드에도 공유한다)
export const SCHOLAR_PROFILES: Record<string, string> = {
  "Seungmin Rho": "k5aAQxUAAAAJ",
  "Mi Young Lee": "bxWgGnoAAAAJ",
};

/** 구성원 이름 → Google Scholar 프로필 URL. 프로필이 없는 구성원은 null. */
export const scholarProfileUrl = (name: string): string | null => {
  const id = SCHOLAR_PROFILES[name.trim()];
  return id ? `https://scholar.google.com/citations?user=${id}` : null;
};

// 지표 출처 고지 — 인용수는 Google Scholar에서 수집한 값이고, JCR 라벨은 연구실 공개 Google Sites에
// 표시된 문구를 옮긴 것이다. Clarivate JCR 원자료를 직접 조회한 값이 아니다.
// (scripts/update_scholar_metrics.cjs 주석과 같은 기준)
export const METRICS_DISCLAIMER =
  "Citation counts come from Google Scholar. JCR labels are transcribed from the lab's public Google Sites page and are not retrieved from Clarivate.";

// 펀딩 태그 → 사람이 읽는 설명. 태그 말미의 '-NN'은 연도(20NN)를 뜻한다.
// 여기에 없는 태그는 소비 측에서 태그 문자열을 그대로 보여준다(FUNDING_LEGEND[tag] ?? tag).
// TODO(lab): 정식 과제명·과제번호·수행기간 확인 필요. 아래 설명은 태그에 드러난 기관/사업 약어를 풀어 쓴 수준이고,
//            'Convg_Security-25/26', 'Rise-25', 'SW_Copyright-24'는 근거가 없어 일부러 비워 두었다.
// 주의: 'Prof. *' 항목은 연구비가 아니라 협력 교수 라벨이다(감사 12번). 펀딩 집계·필터에서는 제외할 것.
export const FUNDING_LEGEND: Record<string, string> = {
  "NRF-19": "National Research Foundation of Korea (NRF) — 2019",
  "NRF-22": "National Research Foundation of Korea (NRF) — 2022",
  "NRF-SM-25": "National Research Foundation of Korea (NRF) — 2025",
  "IITP-21": "Institute of Information & Communications Technology Planning & Evaluation (IITP) — 2021",
  "ITRC-21": "Information Technology Research Center (ITRC) program — 2021",
  "ITRC-22": "Information Technology Research Center (ITRC) program — 2022",
  "ITRC-23": "Information Technology Research Center (ITRC) program — 2023",
  "ITRC-25": "Information Technology Research Center (ITRC) program — 2025",
  "ITRC-26": "Information Technology Research Center (ITRC) program — 2026",
  "KIAT-21": "Korea Institute for Advancement of Technology (KIAT) — 2021",
  "CAU-22": "Chung-Ang University — 2022",
  "Prof. MYLee": "Collaborator label (Prof. Mi Young Lee) — not a funding source",
  "Prof. HJKim": "Collaborator label — not a funding source",
  "Prof. HWKim": "Collaborator label — not a funding source",
};

// 논문 저자 강조에 쓰이는 PI 이름 표기 변형 (Publications/Scholar 페이지 공용)
// 'M. Lee'처럼 과도하게 일반적인 표기는 동명이인 오탐이 많아 제외한다 (scripts/lib.cjs와 같은 기준).
export const PI_NAME_VARIANTS = [
  "Seungmin Rho", "Mi Young Lee",
  "S. Rho", "S Rho",
  "M. Y. Lee", "M.Y. Lee", "MY Lee",
];

// 이니셜 아바타 — 사진이 없는 구성원용.
// 외부 아바타 서비스(ui-avatars.com)에 구성원 실명을 쿼리로 보내지 않기 위해 인라인 SVG data URI로 만든다.
// 색은 이름 해시로 결정되므로 매 로드마다 바뀌지 않는다. (외부 요청 0건)
const AVATAR_COLORS = ["#1e3a8a", "#0f766e", "#7c2d12", "#4c1d95", "#155e75", "#9f1239"];

export function initialsAvatar(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join("");
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  const background = AVATAR_COLORS[hash % AVATAR_COLORS.length];
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">' +
    `<rect width="256" height="256" fill="${background}"/>` +
    '<text x="128" y="132" fill="#ffffff" font-family="Inter, Helvetica, Arial, sans-serif" ' +
    `font-size="104" font-weight="600" text-anchor="middle" dominant-baseline="middle">${initials}</text>` +
    "</svg>";
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// 1. 뉴스 데이터
// ⚠ 이 배열 리터럴은 scripts/site.cjs가 정규식으로 파싱해 dist/feed.xml(RSS)과 sitemap lastmod를 만든다.
//    `export const NEWS ... = [ { id: 'nN', date: 'YYYY.MM.DD', title: '...' }, ... ];` 형태(작은따옴표 포함)를 유지할 것.
//    화면(Home·News)은 삽입 순서를 신뢰하지 않고 날짜 내림차순으로 다시 정렬한다.
//    RSS 항목 링크가 `/news#<id>`이므로 id는 한 번 정하면 바꾸지 말 것(News 페이지가 같은 id를 앵커로 쓴다).
//    학회 항목 문형: `<동사> <학회명 + 연도> in <도시>, <국가>.` — 개최지는 건물명이 아니라 도시로 적는다
//    (AICT는 수원 광교의 차세대융합기술연구원, CAU 310관은 서울이다). 발표 논문 등 덧붙일 말은 문장 끝 괄호에 둔다.
export const NEWS: NewsItem[] =[
  { id: 'n12', date: '2026.08.24', title: 'Attended PlatCon-26 in Jeju, Korea.' },
  { id: 'n10', date: '2026.06.28', title: 'Attended IEEE ISIT 2026 in Guangzhou, China.' },
  { id: 'n11', date: '2026.05.07', title: 'Attended CISC-S 2026 (KIISC Summer Conference) in Busan, Korea.' },
  { id: 'n9', date: '2026.02.24', title: 'Attended ICAIIC 2026 in Tokyo, Japan.' },
  { id: 'n8', date: '2025.11.29', title: 'Attended the Society for e-Business Studies 2025 Fall Conference in Suwon, Korea.' },
  { id: 'n7', date: '2025.10.25', title: 'Attended ECAI 2025 in Bologna, Italy (Workshop paper: TRUST-AI).' },
  { id: 'n6', date: '2025.09.14', title: 'Attended FedCSIS 2025 in Kraków, Poland.' },
  { id: 'n5', date: '2025.08.25', title: 'Attended PlatCon-25 in Jeju, Korea.' },
  { id: 'n4', date: '2025.05.01', title: 'Hosted the Society for e-Business Studies 2025 Spring Conference in Seoul, Korea.' },
  { id: 'n3', date: '2025.01.15', title: 'Attended ICOIN 2025 in Chiang Mai, Thailand.' },
  { id: 'n2', date: '2024.08.26', title: 'Attended PlatCon-24 in Jeju, Korea.' },
  { id: 'n1', date: '2024.03.04', title: 'PURE(Privacy, Unlearning, and Robust Engineering Lab) founded by Prof. Seungmin Rho at CAU.' },
];

// 2. 연구 분야 데이터
export const RESEARCH_AREAS: ResearchArea[] =[
  {
    id: "privacy-preserving-ai",
    title: "Privacy-Preserving AI",
    description: "Designing learning pipelines that reduce sensitive-data exposure while preserving model utility. We study privacy-aware training, evaluation, and deployment practices for modern AI systems.",
    image: "/assets/privacy-preserving-ai.webp",
    tags:['Data Privacy', 'LLM Privacy', 'Responsible AI']
  },
  {
    id: "machine-unlearning",
    title: "Machine Unlearning",
    description: "Developing algorithms that allow AI models to forget specific data points without full retraining. We focus on removing privacy-sensitive data from LLMs and copyrighted content from generative models while maintaining performance.",
    image: "/assets/machine-unlearning.webp",
    tags:['Generative Models', 'Selective Forgetting', 'Copyright Removal']
  },
  {
    id: "robust-ai-engineering",
    title: "Robust AI Engineering",
    description: "Engineering reliable AI systems against distribution shift, adversarial behavior, and data poisoning. Our work connects model robustness with practical deployment requirements for trustworthy applications.",
    image: "/assets/robust-ai-engineering.webp",
    tags:['Model Robustness', 'AI Safety', 'Adversarial Defense']
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
    specialization: '#AI Privacy #Robust AI #Trustworthy Systems',
    website: "https://sites.google.com/view/seungminrho"
  },
  {
    id: 'co-pi',
    name: "Mi Young Lee",
    role: "Co-Principal Investigator",
    image: "/assets/Mi young Lee.jpg",
    email: "miylee@cau.ac.kr",
    specialization: '#Data Privacy #Machine Unlearning #Synthetic Data #Computer Vision',
    website: "https://sites.google.com/view/ntblue/home"
  },
  {
    id: 'm2',
    name: "Byeongcheon Lee",
    role: "Ph.D. Student",
    image: "/assets/Byeongcheon Lee.jpg",
    email: "qudcjs0208@cau.ac.kr",
    website: "https://cheonbung.github.io/",
    specialization: '#Machine Unlearning #Robust AI #Generative Model Security #Trustworthy AI',
    github: "https://github.com/cheonbung"
  },
  {
    id: 'm3',
    name: "Sangmin Kim",
    role: "Ph.D. Student",
    image: "/assets/Sangmin Kim.jpg",
    email: "kimddol98@cau.ac.kr",
    website: "https://sang-t.github.io/",
    specialization: '#Machine Unlearning #Robust AI #Natural Language Processing #LLM',
    github: "https://github.com/Sang-T"
  },
  {
    id: 'm4',
    name: "Hyungjun Park",
    role: "Master Student",
    // TODO(lab): 프로필 사진·관심 분야(specialization)·이메일 공개 여부 확인 필요. 그때까지 이니셜 아바타 사용.
    image: initialsAvatar("Hyungjun Park"),
    email: "",
    specialization: ""
  },
  {
    id: 'm5',
    name: "Hyunok Kim",
    role: "Master Student",
    // TODO(lab): 프로필 사진·관심 분야(specialization)·이메일 공개 여부 확인 필요. 그때까지 이니셜 아바타 사용.
    image: initialsAvatar("Hyunok Kim"),
    email: "",
    specialization: ""
  },
  {
    id: 'm6',
    name: "Junyoung Lee",
    role: "Master Student",
    // TODO(lab): 프로필 사진·관심 분야(specialization)·이메일 공개 여부 확인 필요. 그때까지 이니셜 아바타 사용.
    image: initialsAvatar("Junyoung Lee"),
    email: "",
    specialization: "",
    linkedin: "https://www.linkedin.com/in/%EC%A4%80%EC%98%81-%EC%9D%B4-93117424b"
  }
];

// 4. 주요 논문 데이터 (수동 선별 — 전체 아카이브는 src/data/publications.json)
// ⚠ scripts/sync_scholar.cjs의 정합성 검사가 `id: 'pN'` → `title: "..."` → `venue: "..."` 순서와
//    큰따옴표 표기에 의존한다. 항목 형식을 바꾸면 그 스크립트도 함께 고칠 것.
export const PUBLICATIONS: Publication[] =[
  {
    id: 'p1',
    year: 2026,
    title: "SHAP-Guided Leaf-Value Adjustment for Efficient Unlearning in LightGBM",
    authors:["Sungwoo Park", "Sangmin Kim", "Byeongcheon Lee", "Muazzam Maqsood", "Mi Young Lee", "Seungmin Rho"],
    venue: "Future Generation Computer Systems",
    tags: ["Machine Unlearning", "LightGBM"],
    isSelected: true,
    status: "Submitted",
    bibtex: "@article{Park2026SHAP,\n title={SHAP-Guided Leaf-Value Adjustment for Efficient Unlearning in LightGBM},\n author={Park, Sungwoo and Kim, Sangmin and Lee, Byeongcheon and Maqsood, Muazzam and Lee, Mi Young and Rho, Seungmin},\n journal={Future Generation Computer Systems},\n year={2026}\n}"
  },
  {
    id: 'p2',
    year: 2026,
    title: "A Data Analytics-Driven Approach to Backorder Prediction Using Federated Machine Learning in Industrial Supply Chains",
    authors:["Asma Sattar", "Maryam Bukhari", "Zahoor ur Rehman", "Saman Khalid", "Yangsun Lee", "Seungmin Rho"],
    venue: "Scientific Reports, 16, 4560",
    tags:["Federated Learning", "Supply Chain"],
    isSelected: true,
    link: "https://doi.org/10.1038/s41598-025-34578-z"
  },
  {
    id: 'p3',
    // 연도는 2024가 맞다 (publications.json의 bibtex `year={2024}`, Google Scholar 표기 모두 2024).
    year: 2024,
    title: "Advancing Autoencoder Architectures for Enhanced Anomaly Detection in Multivariate Industrial Time Series",
    authors:["Byeongcheon Lee", "Sangmin Kim", "Muazzam Maqsood", "Jihoon Moon", "Seungmin Rho"],
    venue: "CMC-Computers, Materials & Continua, 81(1)",
    tags:["Anomaly Detection", "Time Series"],
    isSelected: true,
    link: "https://scholar.google.com/citations?view_op=view_citation&citation_for_view=k5aAQxUAAAAJ:27LrP4qxOz0C"
  },
  {
    id: 'p4',
    year: 2025,
    title: "Deep Learning-Based Natural Language Processing Model and Optical Character Recognition for Detection of Online Grooming on Social Networking Services",
    authors:["Sangmin Kim", "Byeongcheon Lee", "Jihoon Moon", "Seungmin Rho"],
    venue: "Computer Modeling in Engineering & Sciences (CMES), 143(2)",
    tags:["NLP", "Social Security"],
    isSelected: true,
    link: "https://scholar.google.com/citations?view_op=view_citation&citation_for_view=k5aAQxUAAAAJ:Wq2b2clWBLsC"
  },
  {
    id: 'p5',
    year: 2025,
    title: "A Framework for Machine Unlearning Using Selective Knowledge Distillation into Soft Decision Tree",
    authors:["Sangmin Kim", "Byeongcheon Lee", "Sungwoo Park", "Mi Young Lee", "Seungmin Rho"],
    venue: "Annals of Computer Science and Information Systems, 45, 95-101",
    tags:["Machine Unlearning", "Knowledge Distillation"],
    isSelected: true,
    link: "https://scholar.google.com/citations?view_op=view_citation&citation_for_view=k5aAQxUAAAAJ:-6RzNnnwWf8C"
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
    isSelected: true,
    link: "https://scholar.google.com/citations?view_op=view_citation&citation_for_view=k5aAQxUAAAAJ:__bU50VfleQC"
  },
  {
    // TODO(lab): 이 항목은 publications.json과 Google Scholar 어디에도 없어 대조할 원천이 없다.
    //            JSEBS 게재 정보(DOI 또는 논문 페이지 URL)를 받아 link를 채우고 아카이브에도 등록할 것.
    id: 'p8',
    year: 2024,
    title: "Voice Phishing Detection Using Deep Learning-based NLP and Knowledge Distillation Techniques",
    authors:["Sangmin Kim", "Byeongcheon Lee", "Hyeonwoo Kim", "Seungmin Rho"],
    venue: "The Journal of Society for e-Business Studies, 29(4), 139-148",
    tags:["Voice Phishing", "NLP"]
  }
];
