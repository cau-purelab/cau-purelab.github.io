#!/usr/bin/env node
// 주간 변경 감지 — 공식 페이지에서 "사람이 다시 확인해야 할 변화"만 골라 보고한다. 값을 자동으로 고치지 않는다.
//
// 1) 기록한 마감이 사라졌는가: 앞으로 N일 안 확정 마감의 공식 페이지에 그 날짜가 아직 적혀 있는지.
// 2) 새 날짜가 나타났는가: 공식 페이지마다 지난 실행의 날짜 목록(기준선)과 비교해 새로 생긴 날짜를 찾는다.
//    예상이던 회차에 CFP가 올라오거나, 연장 공지가 붙으면 여기서 잡힌다.
//
// 사용: node check-changes.cjs [--days 60] [--out check-report.md] [--baseline data/page-baseline.json] [--no-update]
// 출력: 마지막 줄 `FINDINGS=<건수>`. 기준선이 없으면 새로 만들고 보고는 하지 않는다(첫 실행).
//
// 한계(보고서도 같은 말을 한다): 날짜를 JS로 그리는 페이지는 날짜가 안 보여 오탐/미탐이 난다.
//   연장 공지가 옛 날짜를 그대로 남겨 두면 1)은 놓친다 — 그 경우 2)의 "새 날짜"로 잡힌다.
//   페이지에 소식·행사 날짜가 많으면 2)가 시끄러울 수 있다. 보고서는 확인 대상 목록일 뿐 정답이 아니다.
const fs = require('fs'), path = require('path');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const DAYS = +opt('--days', 60);
const OUT = opt('--out', path.join(__dirname, 'check-report.md'));
const BASELINE = opt('--baseline', path.join(__dirname, 'data', 'page-baseline.json'));
const UPDATE = !args.includes('--no-update');
const TIMEOUT_MS = 15000, CONCURRENCY = 6, MAX_NEW = 10, RESTRUCTURED = 40;

const pubDir = path.join(__dirname, '..', '..', 'public');
const slug = fs.readdirSync(pubDir).find(d => /^conf-planner-/.test(d) && fs.existsSync(path.join(pubDir, d, 'index.html')));
if (!slug) { console.error('public/conf-planner-*/index.html 이 없다. 먼저 node build.cjs'); process.exit(1); }
const html = fs.readFileSync(path.join(pubDir, slug, 'index.html'), 'utf8');
const D = JSON.parse(html.match(/const DATA = (\{[\s\S]*?\});\n\(function/)[1]);
const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date());
const thisYear = +today.slice(0, 4);
const utc = d => { const [y, m, dd] = d.split('-').map(Number); return Date.UTC(y, m - 1, dd); };
const diff = d => Math.round((utc(d) - utc(today)) / 864e5);

// ---- 날짜 표기 다루기
const MON = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const MN = 'january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sept|sep|oct|nov|dec';
const monthNo = s => { s = s.toLowerCase(); const i = MON.findIndex(m => m === s || m.startsWith(s.slice(0, 3))); return i + 1; };
const pad = n => String(n).padStart(2, '0');
function forms(iso) { // 같은 날짜의 흔한 표기들 (기록 날짜가 페이지에 있는지 볼 때)
  const [y, m, d] = iso.split('-').map(Number), M = MON[m - 1], S = M.slice(0, 3);
  return [`${M} ${d}`, `${M} ${pad(d)}`, `${d} ${M}`, `${pad(d)} ${M}`, `${S} ${d}`, `${S}. ${d}`, `${d} ${S}`, `${pad(d)} ${S}`,
    `${y}-${pad(m)}-${pad(d)}`, `${pad(m)}/${pad(d)}/${y}`, `${d}/${m}/${y}`, `${y}/${pad(m)}/${pad(d)}`, `${y}.${pad(m)}.${pad(d)}`];
}
const strip = t => t.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ').replace(/&#8211;|&ndash;/g, '-').replace(/\s+/g, ' ').toLowerCase();
// 페이지 텍스트에서 날짜 토큰을 뽑는다. 연도가 있으면 YYYY-MM-DD, 없으면 MM-DD.
function dateTokens(text) {
  const out = new Set();
  const add = (y, m, d) => {
    if (!(m >= 1 && m <= 12 && d >= 1 && d <= 31)) return;
    if (y && (y < thisYear || y > thisYear + 2)) return; // 지난 해/먼 미래는 무시
    out.add(y ? `${y}-${pad(m)}-${pad(d)}` : `${pad(m)}-${pad(d)}`);
  };
  for (const m of text.matchAll(new RegExp(`\\b(${MN})\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:\\s*,?\\s*(20\\d\\d))?\\b`, 'g'))) add(+m[3] || 0, monthNo(m[1]), +m[2]);
  for (const m of text.matchAll(new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(${MN})\\.?(?:\\s*,?\\s*(20\\d\\d))?\\b`, 'g'))) add(+m[3] || 0, monthNo(m[2]), +m[1]);
  for (const m of text.matchAll(/\b(20\d\d)-(\d\d)-(\d\d)\b/g)) add(+m[1], +m[2], +m[3]);
  return out;
}

async function get(url) {
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(url, { signal: ctl.signal, redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 (compatible; lab-deadline-check)' } });
    return r.ok ? { ok: true, text: strip(await r.text()) } : { ok: false, why: 'HTTP ' + r.status };
  } catch (e) { return { ok: false, why: e.name === 'AbortError' ? 'timeout' : String(e.cause?.code || e.message) }; }
  finally { clearTimeout(t); }
}

// ---- 점검 대상: 진행 중인 행과 그 공식 페이지
const live = D.rows.filter(r => r.exact ? diff(r.dl) >= 0 : r.month >= today.slice(0, 7));
const urlRows = new Map();
for (const r of live) {
  const e = D.editions[r.eid] || {};
  for (const u of [r.chk && r.chk.url, e.cfp, e.url, ...(e.src || [])]) {
    if (!u || !/^https?:/.test(u)) continue;
    if (!urlRows.has(u)) urlRows.set(u, []);
    urlRows.get(u).push(r);
  }
}
const cache = new Map();
const page = u => cache.has(u) ? cache.get(u) : (cache.set(u, get(u)), cache.get(u));
const label = r => `${r.acr} ${r.ed} ${r.cycle}`;

(async () => {
  // 모든 URL을 한 번씩만 읽는다
  const urls = [...urlRows.keys()], queue = [...urls];
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => { while (queue.length) await page(queue.shift()); }));

  // 1) 기록한 날짜가 페이지에서 사라졌는가
  const missing = [], rule = [];
  for (const r of live.filter(r => r.exact && diff(r.dl) <= DAYS)) {
    const e = D.editions[r.eid] || {};
    if (/규칙에서 계산/.test(e.notes || '')) { rule.push(r); continue; }
    const us = [...new Set([r.chk && r.chk.url, e.cfp, e.url, ...(e.src || [])].filter(u => u && /^https?:/.test(u)))].slice(0, 4);
    const want = [['본문', r.dl], ...(r.abs ? [['초록', r.abs]] : [])], found = Object.fromEntries(want.map(([k]) => [k, false]));
    let okPages = 0;
    for (const u of us) { const p = await page(u); if (!p.ok) continue; okPages++; for (const [k, iso] of want) if (forms(iso).some(f => p.text.includes(f))) found[k] = true; }
    if (!us.length) missing.push({ r, why: '링크 없음', us });
    else if (!okPages) missing.push({ r, why: '페이지를 읽지 못함', us });
    else if (!Object.values(found).every(Boolean)) missing.push({ r, why: `페이지에서 ${Object.entries(found).map(([k, v]) => `${k} ${v ? '있음' : '없음'}`).join(', ')}`, us });
  }

  // 2) 새 날짜가 나타났는가 (기준선 대비)
  const first = !fs.existsSync(BASELINE);
  const base = first ? { pages: {} } : JSON.parse(fs.readFileSync(BASELINE, 'utf8'));
  const next = { version: 1, updated: today, pages: { ...base.pages } };
  const appeared = [], restructured = [], failed = [];
  for (const u of urls) {
    const p = await page(u);
    if (!p.ok) { failed.push({ u, why: p.why }); continue; } // 읽지 못하면 기준선은 그대로 둔다
    const tokens = dateTokens(p.text), prev = base.pages[u];
    next.pages[u] = { tokens: [...tokens].sort() };
    if (!prev) continue;
    const added = [...tokens].filter(t => !prev.tokens.includes(t));
    if (!added.length) continue;
    const rs = [...new Set(urlRows.get(u).map(label))];
    if (added.length > RESTRUCTURED) restructured.push({ u, n: added.length, rs });
    else appeared.push({ u, added, rs, unpub: urlRows.get(u).some(r => !r.exact) });
  }
  if (UPDATE) { fs.mkdirSync(path.dirname(BASELINE), { recursive: true }); fs.writeFileSync(BASELINE, JSON.stringify(next)); }

  // ---- 보고서
  const findings = missing.length + (first ? 0 : appeared.length);
  const L = [];
  L.push('# 투고 플래너 주간 변경 감지', '', `기준일 ${today} (KST). 점검한 공식 페이지 ${urls.length}곳, 앞으로 ${DAYS}일 안 확정 마감 ${live.filter(r => r.exact && diff(r.dl) <= DAYS).length}건.`,
    '자동 반영은 하지 않습니다. 아래 항목의 공식 페이지를 직접 확인하고 `tools/conf-planner/data/overrides.json`을 고치세요.', '');
  if (first) L.push('> 첫 실행이라 기준선을 새로 만들었습니다. "새 날짜" 비교는 다음 실행부터 시작합니다.', '');
  L.push(`## 1. 기록한 마감 날짜가 공식 페이지에서 확인되지 않음 (${missing.length}건)`, '');
  L.push(...(missing.length ? missing.map(x => `- **${label(x.r)}**: 기록 ${x.r.abs ? `초록 ${x.r.abs}, ` : ''}본문 ${x.r.dl} (D-${diff(x.r.dl)}), ${x.why}\n  - 확인할 페이지: ${x.us.join(', ') || '없음'}`) : ['없음']), '');
  L.push(`## 2. 공식 페이지에 새 날짜가 나타남 (${first ? '비교 전' : appeared.length + '건'})`, '',
    '예상이던 회차에 CFP가 올라왔거나, 연장·정정 공지가 붙었을 수 있습니다. 소식·행사 날짜가 늘어난 오탐도 있습니다.', '');
  if (!first) L.push(...(appeared.length ? appeared.sort((a, b) => b.unpub - a.unpub).map(x => `- ${x.unpub ? '**[예상이던 회차]** ' : ''}${x.rs.slice(0, 4).join(', ')}${x.rs.length > 4 ? ` 외 ${x.rs.length - 4}건` : ''}\n  - 새 날짜: ${x.added.slice(0, MAX_NEW).join(', ')}${x.added.length > MAX_NEW ? ` 외 ${x.added.length - MAX_NEW}개` : ''}\n  - ${x.u}`) : ['없음']), '');
  if (restructured.length) L.push('### 페이지가 크게 바뀐 곳 (날짜가 많이 늘어 개별 보고 생략)', '', ...restructured.map(x => `- ${x.rs.slice(0, 3).join(', ')}: ${x.n}개 증가, ${x.u}`), '');
  L.push(`## 3. 읽지 못한 페이지 (${failed.length}곳)`, '', ...(failed.length ? failed.map(x => `- ${x.u} (${x.why})`) : ['없음']), '');
  L.push(`## 4. 규칙으로 계산한 항목 (${rule.length}건)`, '', ...(rule.length ? rule.map(r => `- ${label(r)}: ${r.dl}`) : ['없음']), '');
  fs.writeFileSync(OUT, L.join('\n'));
  console.log(`페이지 ${urls.length}곳 점검. 기록 날짜 확인 불가 ${missing.length}, 새 날짜 ${first ? '(첫 실행)' : appeared.length}, 큰 변경 ${restructured.length}, 읽기 실패 ${failed.length} -> ${OUT}`);
  console.log(`FINDINGS=${findings}`);
})();
