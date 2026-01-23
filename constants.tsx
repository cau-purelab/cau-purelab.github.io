
import { NewsItem, ResearchArea, Member, Publication } from './types';

export const LAB_NAME = "SVIL";

interface LabContent {
  fullName: string;
  keywords: string[];
  news: NewsItem[];
  research: ResearchArea[];
  members: Member[];
}

export const CONTENT: LabContent = {
  fullName: "Security Visual Intelligence Lab",
  keywords: ["AI Security", "Trustworthy AI", "Data Privacy"],
  news: [
    { id: 'n8', date: '2025.11.29', title: 'Society for e-Business Studies 2025 Fall Academic Conference at AICT.' },
    { id: 'n7', date: '2025.10.25', title: 'Attending ECAI 2025 in Bologna, Italy (Workshop paper: TRUST-AI).' },
    { id: 'n6', date: '2025.09.14', title: 'Participating in FedCSIS 2025 in Kraków, Poland.' },
    { id: 'n5', date: '2025.08.25', title: 'PlatCon-25 in Jeju: Int. Conf. on Platform Technology and Service.' },
    { id: 'n4', date: '2025.05.01', title: 'Hosting Society for e-Business Studies Spring Conference at CAU Bldg 310.' },
    { id: 'n3', date: '2025.01.15', title: 'Participated in ICOIN 2025 in Chiang Mai, Thailand.' },
    { id: 'n2', date: '2024.08.26', title: 'Attended PlatCon-24 (Platform Technology and Service) in Jeju, Korea.' },
    { id: 'n1', date: '2024.03.04', title: 'Security Visual Intelligence Lab (SVIL) founded by Prof. Seungmin Rho.' },
  ],
  research: [
    {
      id: '1',
      title: 'Machine Unlearning',
      description: 'Developing data forgetting techniques for Generative Models (Diffusion models) and removing privacy-sensitive or copyrighted data from Large Language Models (LLMs).',
      image: 'https://images.unsplash.com/photo-1620712943543-bcc4628c9757?auto=format&fit=crop&q=80&w=800',
      tags: ['Generative Models', 'LLM Privacy', 'Copyright'],
      links: { github: 'https://github.com/svil-lab/unlearning-lib', dataset: '#' }
    },
    {
      id: '2',
      title: 'Secure Computer Vision',
      description: 'Enhancing the reliability and safety of AI models while designing secure architectures for visual intelligence systems to prevent adversarial threats.',
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800',
      tags: ['Trustworthy AI', 'Model Safety', 'Robustness'],
      links: { github: 'https://github.com/svil-lab/secure-cv' }
    }
  ],
  members: [
    {
      id: 'pi',
      name: 'Seungmin Rho',
      role: 'PI',
      image: '/assets/input_file_2.png',
      specialization: 'Principal Investigator',
      links: { web: 'smrho@cau.ac.kr', scholar: '#' }
    },
    {
      id: 'm1',
      name: 'Sungwoo Park',
      role: 'PostDoc',
      image: 'https://picsum.photos/seed/sungwoo/400/400',
      specialization: 'Machine Unlearning, Generative Model Robustness',
      links: { github: '#', linkedin: '#', scholar: '#' }
    },
    {
      id: 'm2',
      name: 'Sangmin Kim',
      role: 'PhD',
      image: '/assets/input_file_1.png', // Suit, Grey background
      specialization: 'Machine Unlearning, LLM Privacy',
      links: { github: '#', linkedin: '#' }
    },
    {
      id: 'm3',
      name: 'Byeongcheon Lee',
      role: 'PhD',
      image: '/assets/input_file_0.png', // Suit, Blue background
      specialization: 'Machine Unlearning (Discriminator-Guided), AI Watermarking',
      links: { github: '#', linkedin: '#' }
    },
    {
      id: 'm4',
      name: 'Hyungjun Park',
      role: 'Master',
      image: 'https://picsum.photos/seed/hj-park/400/400',
      specialization: 'Machine Unlearning',
      links: { github: '#' }
    },
    {
      id: 'm5',
      name: 'Hyunok Kim',
      role: 'Undergraduate',
      image: 'https://picsum.photos/seed/ho-kim/400/400',
      specialization: 'Machine Unlearning (Intern)',
      links: { github: '#' }
    },
    {
      id: 'a1',
      name: 'Donghwi Lee',
      role: 'Master',
      isAlumni: true,
      destination: 'AI Research @ Samsung Electronics',
      image: 'https://picsum.photos/seed/donghwi/400/400',
      links: { linkedin: '#' }
    }
  ]
};

export const PUBLICATIONS: Publication[] = [
  {
    id: 'p1',
    year: 2024,
    title: "Advancing Autoencoder Architectures for Enhanced Anomaly Detection in Multivariate Industrial Time Series",
    authors: ["Byeongcheon Lee", "Sangmin Kim", "Jongseo Moon", "Seungmin Rho"],
    venue: "Computers, Materials & Continua, 81(1)",
    bibtex: `@article{lee2024advancing,\n  title={Advancing Autoencoder Architectures for Enhanced Anomaly Detection in Multivariate Industrial Time Series},\n  author={Lee, Byeongcheon and Kim, Sangmin and Moon, Jongseo and Rho, Seungmin},\n  journal={Computers, Materials \\& Continua},\n  volume={81},\n  number={1},\n  year={2024}\n}`,
    links: { pdf: "#" },
    isSelected: true
  },
  {
    id: 'p2',
    year: 2025,
    title: "Deep Learning-Based Natural Language Processing Model and Optical Character Recognition for Detection of Online Grooming on Social Networking Services",
    authors: ["Sangmin Kim", "Byeongcheon Lee", "M. Maqsood", "Jongseo Moon", "Seungmin Rho"],
    venue: "Computer Modeling in Engineering & Sciences (CMES), 143(2)",
    bibtex: `@article{kim2025deep,\n  title={Deep Learning-Based Natural Language Processing Model and Optical Character Recognition for Detection of Online Grooming on Social Networking Services},\n  author={Kim, Sangmin writing,\n  author={Kim, Sangmin and Lee, Byeongcheon and Maqsood, M and Moon, Jongseo and Rho, Seungmin},\n  journal={Computer Modeling in Engineering \\& Sciences},\n  volume={143},\n  number={2},\n  year={2025}\n}`,
    links: { pdf: "#" },
    isSelected: true
  },
  {
    id: 'p3',
    year: 2025,
    title: "A Framework for Machine Unlearning Using Selective Knowledge Distillation into Soft Decision Tree",
    authors: ["Sangmin Kim", "Byeongcheon Lee", "Sungwoo Park", "Mi Young Lee", "Seungmin Rho"],
    venue: "Annals of Computer Science and Information Systems, 45, 95-101",
    bibtex: `@article{kim2025framework,\n  title={A Framework for Machine Unlearning Using Selective Knowledge Distillation into Soft Decision Tree},\n  author={Kim, Sangmin and Lee, Byeongcheon and Park, Sungwoo and Lee, Mi Young and Rho, Seungmin},\n  journal={Annals of Computer Science and Information Systems},\n  volume={45},\n  pages={95--101},\n  year={2025}\n}`,
    links: { pdf: "#" },
    isSelected: true
  },
  {
    id: 'p4',
    year: 2025,
    title: "An Image Generation Framework Integrating Invisible Watermarking and Selective Class Unlearning",
    authors: ["Sungwoo Park", "Byeongcheon Lee", "Sangmin Kim", "Seungyeob Chae", "Mi Young Lee", "Seungmin Rho"],
    venue: "Journal of Platform Technology, 13(6), 21-32",
    bibtex: `@article{park2025image,\n  title={An Image Generation Framework Integrating Invisible Watermarking and Selective Class Unlearning},\n  author={Park, Sungwoo and Lee, Byeongcheon and Kim, Sangmin and Chae, Seungyeob and Lee, Mi Young and Rho, Seungmin},\n  journal={Journal of Platform Technology},\n  volume={13},\n  number={6},\n  pages={21--32},\n  year={2025}\n}`,
    links: { pdf: "#" },
    isSelected: true
  },
  {
    id: 'p5',
    year: 2024,
    title: "A Multifaceted Approach to Stock Market Trading Using Reinforcement Learning",
    authors: ["Y. Ansari", "S. Gillani", "M. Bukhari", "Byeongcheon Lee", "M. Maqsood", "Seungmin Rho"],
    venue: "IEEE Access, 12, 90041-90060",
    bibtex: `@article{ansari2024multifaceted,\n  title={A multifaceted approach to stock market trading using reinforcement learning},\n  author={Ansari, Y and Gillani, S and Bukhari, M and Lee, Byeongcheon and Maqsood, M and Rho, Seungmin},\n  journal={IEEE Access},\n  volume={12},\n  pages={90041--90060},\n  year={2024}\n}`,
    links: { pdf: "#" },
    isSelected: true
  },
  {
    id: 'p6',
    year: 2025,
    title: "Discriminator-Guided Unlearning: A Framework for Selective Forgetting in Conditional GANs",
    authors: ["Byeongcheon Lee", "Sangmin Kim", "Sungwoo Park", "Seungmin Rho", "Mi Young Lee"],
    venue: "Preprint",
    bibtex: `@article{lee2025discriminator,\n  title={Discriminator-Guided Unlearning: A Framework for Selective Forgetting in Conditional GANs},\n  author={Lee, Byeongcheon and Kim, Sangmin and Park, Sungwoo and Rho, Seungmin and Lee, Mi Young},\n  journal={Preprint},\n  year={2025}\n}`,
    links: { pdf: "#" },
    isSelected: true
  },
  {
    id: 'p7',
    year: 2024,
    title: "Voice Phishing Detection Using Deep Learning-based NLP and Knowledge Distillation Techniques",
    authors: ["Sangmin Kim", "Seungmin Rho"],
    venue: "The Journal of Society for e-Business Studies, 29(4), 139-148",
    bibtex: `@article{kim2024voice,\n  title={Voice Phishing Detection Using Deep Learning-based NLP and Knowledge Distillation Techniques},\n  author={Kim, Sangmin and Rho, Seungmin},\n  journal={The Journal of Society for e-Business Studies},\n  volume={29},\n  number={4},\n  pages={139--148},\n  year={2024}\n}`,
    links: { pdf: "#" },
    isSelected: false
  },
  {
    id: 'p8',
    year: 2025,
    title: "Time-Series Traffic Volume Prediction Modeling of Gyeongbu Expressway Combined with Meteorological Data",
    authors: ["Byeongcheon Lee", "Seungmin Rho"],
    venue: "The Journal of Society for e-Business Studies, 30(3), 117-131",
    bibtex: `@article{lee2025traffic,\n  title={Time-Series Traffic Volume Prediction Modeling of Gyeongbu Expressway Combined with Meteorological Data},\n  author={Lee, Byeongcheon and Rho, Seungmin},\n  journal={The Journal of Society for e-Business Studies},\n  volume={30},\n  number={3},\n  pages={117--131},\n  year={2025}\n}`,
    links: { pdf: "#" },
    isSelected: false
  }
];
