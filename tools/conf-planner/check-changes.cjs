#!/usr/bin/env node
// 변경 감지: 앞으로 N일 안 확정 마감의 공식 페이지를 다시 읽고,
// 기록된 마감 날짜가 페이지에 아직 적혀 있는지 확인해 "의심 항목"만 보고한다.
// 자동 반영은 하지 않는다. 보고서를 보고 사람이 공식 페이지를 확인한 뒤 data/overrides.json에 반영한다.
//
// 사용: node check-changes.cjs [--days 60] [--out check-report.md]
// 한계: 날짜를 JS로 그리는 페이지는 "날짜 없음"으로 잘못 나올 수 있다(오탐). 반대로 연장 공지가
//       옛 날짜를 그대로 남겨 두면 "있음"으로 나와도 놓친다(미탐). 보고서는 확인 대상 목록일 뿐이다.
const fs = require('fs'), path = require('path');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const DAYS = +opt('--days', 60), OUT = opt('--out', path.join(__dirname, 'check-report.md') /* 커밋하지 않음(.gitignore) */);
const TIMEOUT_MS = 15000, CONCURRENCY = 4;

const html = fs.readFileSync(path.join(__dirname, '..', '..', 'public', 'conf-planner-b8feafcb', 'index.html'), 'utf8');
const D = JSON.parse(html.match(/const DATA = (\{[\s\S]*?\});\n\(function/)[1]);
const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date());
const utc = d => { const [y, m, dd] = d.split('-').map(Number); return Date.UTC(y, m - 1, dd); };
const diff = d => Math.round((utc(d) - utc(today)) / 864e5);

const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function forms(iso) { // 같은 날짜의 흔한 표기들
  const [y, m, d] = iso.split('-').map(Number), M = MON[m - 1], S = M.slice(0, 3);
  const dd = String(d).padStart(2, '0'), mm = String(m).padStart(2, '0');
  return [`${M} ${d}`, `${M} ${dd}`, `${d} ${M}`, `${dd} ${M}`, `${S} ${d}`, `${S}. ${d}`, `${d} ${S}`, `${dd} ${S}`,
    `${y}-${mm}-${dd}`, `${mm}/${dd}/${y}`, `${d}/${m}/${y}`, `${y}/${mm}/${dd}`, `${y}.${mm}.${dd}`]
    .map(s => s.toLowerCase());
}
const strip = t => t.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ').replace(/&#8211;|&ndash;/g, '-').replace(/\s+/g, ' ').toLowerCase();

async function get(url) {
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(url, { signal: ctl.signal, redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 (compatible; lab-deadline-check)' } });
    return r.ok ? { ok: true, text: strip(await r.text()) } : { ok: false, why: 'HTTP ' + r.status };
  } catch (e) { return { ok: false, why: e.name === 'AbortError' ? 'timeout' : String(e.cause?.code || e.message) }; }
  finally { clearTimeout(t); }
}

const rows = D.rows.filter(r => r.exact && r.dl && diff(r.dl) >= 0 && diff(r.dl) <= DAYS);
const cache = new Map();
const page = u => cache.has(u) ? cache.get(u) : (cache.set(u, get(u)), cache.get(u));

async function check(r) {
  const e = D.editions[r.eid] || {};
  const urls = [...new Set([r.chk && r.chk.url, e.cfp, e.url, ...(e.src || [])].filter(u => u && /^https?:/.test(u)))].slice(0, 4); // 공식 대조 때 날짜를 읽은 페이지를 먼저
  if (/규칙에서 계산/.test(e.notes || '')) return { r, status: 'RULE_BASED', urls }; // 날짜표가 아니라 규칙으로 계산한 값은 페이지 대조 불가
  if (!urls.length) return { r, status: 'NO_URL' };
  const want = [['paper', r.dl], ...(r.abs ? [['abstract', r.abs]] : [])];
  const found = Object.fromEntries(want.map(([k]) => [k, false]));
  const fails = [];
  for (const u of urls) {
    const p = await page(u);
    if (!p.ok) { fails.push(`${u} (${p.why})`); continue; }
    for (const [k, iso] of want) if (forms(iso).some(f => p.text.includes(f))) found[k] = true;
  }
  const allFound = Object.values(found).every(Boolean);
  if (allFound) return { r, status: 'OK', urls };
  if (fails.length === urls.length) return { r, status: 'FETCH_FAIL', urls, fails };
  return { r, status: 'DATE_NOT_FOUND', urls, found, fails };
}

(async () => {
  const results = [];
  const queue = [...rows.sort((a, b) => a.dl.localeCompare(b.dl))];
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => { while (queue.length) results.push(await check(queue.shift())); }));
  results.sort((a, b) => a.r.dl.localeCompare(b.r.dl));
  const by = s => results.filter(x => x.status === s);
  const line = x => `- **${x.r.acr} ${x.r.ed} ${x.r.cycle}**: 기록 ${x.r.abs ? `초록 ${x.r.abs}, ` : ''}본문 ${x.r.dl} (D-${diff(x.r.dl)})` +
    (x.found ? ` / 페이지에서 ${Object.entries(x.found).map(([k, v]) => `${k} ${v ? '있음' : '없음'}`).join(', ')}` : '') +
    `\n  - 확인할 페이지: ${(x.urls || []).join(', ') || '링크 없음'}${x.fails?.length ? `\n  - 읽기 실패: ${x.fails.join('; ')}` : ''}`;
  const md = [`# 마감 변경 감지 보고서`, '', `기준일 ${today} (KST), 앞으로 ${DAYS}일 안 확정 마감 ${rows.length}건 점검. 자동 반영 없음.`, '',
    `| 결과 | 건수 |`, `|---|---|`, ...['OK', 'DATE_NOT_FOUND', 'FETCH_FAIL', 'NO_URL', 'RULE_BASED'].map(s => `| ${s} | ${by(s).length} |`), '',
    `## 사람이 공식 페이지를 확인해야 하는 항목 (기록한 날짜가 페이지에 없음)`, '', ...(by('DATE_NOT_FOUND').map(line).concat(by('DATE_NOT_FOUND').length ? [] : ['없음'])), '',
    `## 페이지를 읽지 못한 항목`, '', ...(by('FETCH_FAIL').map(line).concat(by('FETCH_FAIL').length ? [] : ['없음'])), '',
    `## 규칙으로 계산한 항목 (페이지에 날짜표 없음, 규칙 문구가 바뀌었는지만 확인)`, '', ...(by('RULE_BASED').map(x => `- ${x.r.acr} ${x.r.ed} ${x.r.cycle}: ${x.r.dl} (${(x.urls || [])[0] || ''})`).concat(by('RULE_BASED').length ? [] : ['없음'])), '',
    `## 링크가 없는 항목`, '', ...(by('NO_URL').map(x => `- ${x.r.acr} ${x.r.ed} ${x.r.cycle} (${x.r.dl})`).concat(by('NO_URL').length ? [] : ['없음'])), '',
    `## 날짜가 페이지에서 확인된 항목`, '', ...by('OK').map(x => `- ${x.r.acr} ${x.r.ed} ${x.r.cycle}: ${x.r.dl}`), ''].join('\n');
  fs.writeFileSync(OUT, md);
  console.log(`점검 ${rows.length}건: OK ${by('OK').length}, 확인 필요 ${by('DATE_NOT_FOUND').length}, 규칙 기반 ${by('RULE_BASED').length}, 읽기 실패 ${by('FETCH_FAIL').length}, 링크 없음 ${by('NO_URL').length} -> ${OUT}`);
})();
