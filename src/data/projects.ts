// 연구실 연구를 지원하는 정부·기관 과제 (수동 관리). 화면: Home 하이라이트, Research의 Funded Projects(/research#projects).
// 출처: 노승민 교수 개인 홈페이지 Projects 페이지 https://seungminrho.vercel.app/projects (2026-11-06 확인).
//  과제명·국문명·수행기간·지원기관을 그대로 옮겼다. 연구비 금액·과제번호·연구실의 역할(주관/참여)은 출처에 없어 적지 않는다.
//  같은 페이지의 종료 과제 3건(2019~2023, NRF·KIAT)은 연구실 설립(2024.03) 전 교수 개인 과제라 싣지 않았다.
// 진행 중 여부는 빌드 날짜와 end를 비교해 정한다 — 종료일이 지나면 다음 빌드부터 화면에서 저절로 빠진다.
import type { FundedProject } from '../types';

const MSIT = 'Ministry of Science and ICT (MSIT)';

export const FUNDED_PROJECTS: FundedProject[] = [
  {
    id: 'itrc-data-security',
    title: 'The Development of Advanced Data Security Technology and Human Resources',
    titleKo: '데이터 안전 활용을 위한 차세대 보안 핵심기술 개발',
    start: '2024.07.01',
    end: '2031.12.31',
    program: 'ITRC',
    funders: [MSIT],
    partners: 'Chung-Ang University (Host) · Hanyang University · Sangmyung University · Daejin University · Halla University',
    fundingTags: ['ITRC-25', 'ITRC-26'],
  },
  {
    id: 'convergence-security-graduate-school',
    title: 'Convergence Security Graduate School (Chung-Ang University)',
    titleKo: '융합보안대학원 (중앙대학교)',
    start: '2023.07.01',
    end: '2028.12.31',
    program: 'IITP',
    funders: [MSIT],
    partners: 'Host: Chung-Ang University, Department of Industrial Security',
    fundingTags: ['Convg_Security-25', 'Convg_Security-26'],
  },
  {
    id: 'industrial-tech-protection',
    title: 'Training Specialists for Advanced Industrial Technology Protection',
    titleKo: '첨단산업기술보호 전문인력 양성',
    start: '2023.04.01',
    end: '2029.02.28',
    program: 'KIAT',
    funders: ['Ministry of Trade, Industry and Energy (MOTIE)', 'Korea Institute for Advancement of Technology (KIAT)'],
    partners: 'Host: Chung-Ang University, Department of Industrial Security',
  },
  {
    id: 'sw-copyright-blockchain',
    title: 'Blockchain-based Distribution and Management Platform for SW Copyright Protection and Talent Development',
    titleKo: '블록체인 기술기반 SW 저작권 보호를 위한 유통·관리 플랫폼 기술 개발 및 인재양성',
    start: '2023.04.01',
    end: '2026.12.31',
    program: 'KOCCA',
    funders: ['Ministry of Culture, Sports and Tourism (MCST)', 'Korea Creative Content Agency (KOCCA)'],
    partners: 'Host: Chung-Ang University, Department of Industrial Security',
    fundingTags: ['SW_Copyright-24'],
  },
];

const toIso = (date: string) => date.replace(/\./g, '-');

/**
 * 빌드 날짜 기준 진행 중 과제(종료일이 늦은 순).
 * 빌드 시 프리렌더와 브라우저 hydrate가 같은 값을 써야 하므로 '오늘'이 아니라 __BUILD_DATE__를 기준으로 한다.
 */
export const ACTIVE_PROJECTS: FundedProject[] = FUNDED_PROJECTS
  .filter(p => toIso(p.end) >= __BUILD_DATE__)
  .sort((a, b) => b.end.localeCompare(a.end));

/** 수행기간 중 빌드 날짜까지 지난 비율(0~1) */
export function elapsedRatio(project: FundedProject): number {
  const start = Date.parse(toIso(project.start));
  const end = Date.parse(toIso(project.end));
  const now = Date.parse(__BUILD_DATE__);
  return Math.min(1, Math.max(0, (now - start) / (end - start)));
}

/** '2024.07.01' → '2024.07' */
export const monthOf = (date: string) => date.slice(0, 7);
