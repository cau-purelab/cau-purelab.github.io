// data/*.json + template.html -> public/<slug>/index.html (숨김 페이지, 링크 공유 전용)
const fs=require('fs'),path=require('path');
const D=JSON.parse(fs.readFileSync(path.join(__dirname,'data','base.json'),'utf8'));
const CHECKED='2026-11-23',CHECKED2='2026-11-24';
const E=D.editions,row=(eid,cy)=>D.rows.filter(r=>r.eid===eid&&(!cy||r.cycle===cy));
const conf=eid=>D.confs.find(c=>c.eid===eid);
const setMonth=(r,dl)=>{r.dl=dl;r.dlText=dl;r.key=dl;r.month=dl.slice(0,7);};

// --- 공식 페이지로 정정 (직접 재확인한 것만)
// CODASPY 2027: 11/16 공지로 마감 연장 (codaspy.org/2027/, AoE, "firm")
{const e=E['codaspy-2027'];e.cycles[0].abstract_deadline='2026-11-30';e.cycles[0].paper_deadline='2026-12-07';e.tz='AoE';e.verified=CHECKED;e.notes=(e.notes||'')+' [11/23] 11/16 공지로 마감 연장: 초록 11/30, 본문 12/07 (AoE, firm).';
 const r=row('codaspy-2027')[0];r.abs='2026-11-30';r.tz='AoE';setMonth(r,'2026-12-07');}
// ICML 2027: icml.cc Dates 페이지 (CFP는 아직 미게시)
{const e=E['icml-2027'];Object.assign(e,{label:'ICML 2027',start:'2027-07-31',end:'2027-08-06',expConf:null,city:'Rio de Janeiro',country:'Brazil',tz:'AoE',status:'cfp',conf:'Medium',srcType:'official',url:'https://icml.cc/Conferences/2027',cfp:null,src:['https://icml.cc/Conferences/2027/Dates'],verified:CHECKED,basis:null,
  cycles:[{name:'Main',abstract_deadline:'2027-01-14',paper_deadline:'2027-01-22',notification:null}],
  notes:'공식 Dates 페이지: 초록 1/14, 본문 1/22 (AoE). 개최 Riocentro 7/31~8/6 (본행사 8/2~4). 공식 CFP는 아직 미게시라 변경될 수 있음.'});
 Object.assign(row('icml-2027')[0],{label:'ICML 2027',abs:'2027-01-14',exact:true,tz:'AoE',status:'cfp',confidence:'Medium',src:'official'});setMonth(row('icml-2027')[0],'2027-01-22');
 Object.assign(conf('icml-2027'),{label:'ICML 2027',start:'2027-07-31',end:'2027-08-06',exact:true,key:'2027-07-31',text:null,city:'Rio de Janeiro',country:'Brazil',status:'cfp'});}
// VLDB: 초록은 마감 전월 25일 필수(규칙). 날짜표가 아니라 규칙에서 계산
for(const r of row('vldb-2027')){const[y,m]=r.dl.split('-').map(Number);const pm=m===1?12:m-1,py=m===1?y-1:y;r.abs=`${py}-${String(pm).padStart(2,'0')}-25`;}
{const e=E['vldb-2027'];e.cfp='https://vldb.org/2027/call-for-research-track.html';e.sub='https://www.vldb.org/pvldb/volumes/20/submission';e.verified=CHECKED;e.notes=(e.notes||'')+' [11/23] PVLDB Vol.20 투고 페이지: 매월 1일 17:00 PT(연장 없음), 초록은 전월 25일까지 필수. 월별 날짜표는 없고 규칙에서 계산한 날짜임.';}
// SIGMETRICS 2027: 공식 6/7~10 (우리 6/11 까지는 오류)
{E['sigmetrics-2027'].end='2027-06-10';const c=conf('sigmetrics-2027');if(c)c.end='2027-06-10';E['sigmetrics-2027'].verified=CHECKED;}
// 시간대: 공식에 명시된 것만 채우고, 근거 없는 값은 비움
for(const id of ['sigir-2027','ijcb-2027']){E[id].tz='AoE';row(id).forEach(r=>r.tz='AoE');}
for(const id of ['interspeech-2027','iros-2027','ijcnn-2027','safecomp-2027','ecai-2027']){E[id].tz=null;row(id).forEach(r=>r.tz=null);}
// 공식 근거가 없는 값은 확정에서 내림
{const e=E['colm-2027'];Object.assign(e,{start:null,end:null,expConf:'2027-10 (예상, 공식 미게시)',city:null,country:null,url:null,cfp:null,src:[],srcType:'estimate',conf:'Low',status:'early',verified:CHECKED,notes:'공식 사이트(colm.cc)에 2027 회차 정보 없음. 기존 3/31 마감과 개최일은 공식 근거가 없어 예상으로 되돌림.'});e.cycles=[{name:'Main',abstract_deadline:null,paper_deadline:null,expected_month:'2027-03',expected_text:'2027-03 말 (예상, 공식 미게시)'}];
 const r=row('colm-2027')[0];Object.assign(r,{exact:false,dl:null,abs:null,tz:null,dlText:'2027-03 말 (예상, 공식 미게시)',confidence:'Low',src:'estimate',status:'early'});
 const c=conf('colm-2027');if(c)Object.assign(c,{exact:false,start:null,end:null,text:'2027-10 (예상)',city:null,country:null,status:'early',confidence:'Low'});}
{const e=E['acisp-2027'];Object.assign(e,{start:null,end:null,expConf:'미정 (공식: to be announced)'});const c=conf('acisp-2027');if(c)Object.assign(c,{exact:false,start:null,end:null,text:'미정'});}
E['iros-2027'].notes=(E['iros-2027'].notes||'')+' [11/23] 개최일은 출처마다 다름(9/26~10/1 vs 9/27~10/1), 공식 IROS 2027 사이트를 찾지 못해 미확인. 마감은 IEEE RAS 캘린더(3/1) 기준, 시간대 미확인.';
// 미게시 회차에 이전 회차 링크가 남은 경우 제거
for(const [id,e] of Object.entries(E)){const ey=+id.slice(-4);const old=u=>u&&(u.match(/(?<!\d)(?:20)?\d\d(?!\d)/g)||[]).some(y=>(y.length===2?2000+ +y:+y)<ey&&(y.length===4||+y>=20));
  if(!e.start&&(old(e.url)||old(e.cfp))){e.staleLinkRemoved=true;if(old(e.url))e.url=null;if(old(e.cfp))e.cfp=null;if((e.src||[]).some(old))e.src=e.src.filter(u=>!old(u));}}


// ===== 2026-11-23/24 2차 대조: 연구실 동료 Gemini 세션 보고 + 공식 페이지 직접 재확인 (읽어서 일치한 값만) =====
const V2=[];
const sid=id=>id.replace(/-\d{4}$/,'');
const mkConf=(eid)=>{let c=conf(eid);if(c)return c;const s=D.series.find(x=>x.id===sid(eid)),e=E[eid];c={eid,sid:s.id,acr:s.acr,ed:+eid.slice(-4),label:e.label,tags:s.tags,tier:s.ev.tier,exact:false,key:'9999',month:'9999',text:null,city:null,country:null,status:e.status,confidence:'Medium',interest:s.interest};D.confs.push(c);return c;};
const setConf=(eid,start,end,city,country,url)=>{const e=E[eid];Object.assign(e,{start,end,expConf:null});if(city){e.city=city;e.country=country||e.country||null}if(url)e.url=url;
  const c=mkConf(eid);Object.assign(c,{exact:true,start,end,key:start,month:start.slice(0,7),text:null,city:e.city,country:e.country});};
const setDl=(eid,cycle,o,ref,checked)=>{const r=row(eid,cycle)[0];if(!r)throw new Error('row 없음 '+eid+' '+cycle);const e=E[eid];
  Object.assign(r,{exact:true,abs:o.abs||null,tz:o.tz===undefined?r.tz:o.tz,status:o.status||'cfp',confidence:o.conf||'High',src:'official',prepNote:null,...(o.name?{cycle:o.name}:{})});setMonth(r,o.dl);
  const cy=(e.cycles=e.cycles||[]);let c=cy.find(x=>x.name===cycle);if(!c){c={name:o.name||cycle};cy.push(c)}
  Object.assign(c,{name:o.name||c.name,abstract_deadline:o.abs||null,paper_deadline:o.dl,expected_text:undefined,expected_month:undefined});
  if(o.tz!==undefined)e.tz=o.tz;if(o.url)e.url=o.url;e.srcType='official';e.verified=CHECKED;e.status=o.status||'cfp';e.conf='High';
  if(o.note)e.notes=(e.notes?e.notes+' ':'')+'[11/24] '+o.note;
  V2.push({eid,cycle:o.name||cycle,status:'VERIFIED',url:ref,d:checked||CHECKED2});};
const U={pakdd:'https://pakdd2027.org/pages/calls/research',mobi:'https://www.sigmobile.org/mobisys/2027/call_for_papers/',icme:'https://2027.ieeeicme.org/about/important-dates',wisec:'https://ntu-dtc.github.io/wisec2027/',ifip:'https://ifipsec.org/dates.html',isca:'https://iscaconf.org/isca2027/',icdcs:'https://icdcs2027.icdcs.org/calls/call-for-research-papers/',colt:'https://learningtheory.org/colt2027/',sigcomm:'https://conferences.sigcomm.org/sigcomm/2027/submission/',sac:'https://sacworkshop.org/SAC27/',hpdc:'https://hpdc.sci.utah.edu/2027/',ase:'https://conf.researchr.org/dates/ase-2027',uist:'https://uist.acm.org/2027/',imc:'https://conferences.sigcomm.org/imc/2027/',icdm:'https://icdm2027-website.onrender.com/',icse:'https://conf.researchr.org/track/icse-2028/icse-2028-papers'};
// --- 마감·개최 정정은 data/overrides.json (항목별 근거 URL·확인일 포함)
for(const o of JSON.parse(fs.readFileSync(path.join(__dirname,'data','overrides.json'),'utf8'))){
  if(o.type==='deadline'){const{type,eid,cycle,ref,checked,...rest}=o;setDl(eid,cycle,rest,ref,checked)}
  else if(o.type==='conf')setConf(o.eid,o.start,o.end,o.city,o.country,o.url);
  else if(o.type==='edition'){if(!E[o.eid])throw new Error('edition 없음 '+o.eid);Object.assign(E[o.eid],o.set);if(o.append_note)E[o.eid].notes=(E[o.eid].notes?E[o.eid].notes+' ':'')+o.append_note}
  else if(o.type==='row'){ // 같은 회차의 다른 제출 단계(2단계 심사 등)를 별도 행으로 추가
    const base=row(o.from.eid,o.from.cycle)[0];if(!base)throw new Error('row 없음 '+o.from.eid);
    const nr={...base,cycle:o.cycle,abs:o.abs||null,tz:o.tz===undefined?base.tz:o.tz,chk:undefined};setMonth(nr,o.dl);D.rows.push(nr);
    const e=E[o.from.eid];e.cycles=e.cycles||[];e.cycles.push({name:o.cycle,abstract_deadline:o.abs||null,paper_deadline:o.dl,notification:o.notification||null});
    if(o.note)e.notes=(e.notes?e.notes+' ':'')+'[11/24] '+o.note;V2.push({eid:o.from.eid,cycle:o.cycle,status:'VERIFIED',url:o.ref,d:o.checked||CHECKED2})}
  else throw new Error('알 수 없는 오버라이드: '+o.type)}
// ISCA 산업 트랙은 본 트랙 행을 복제해 추가
{const base=row('isca-2027','Main')[0];const nr={...base,cycle:'Industry Track',abs:'2026-12-06'};setMonth(nr,'2026-12-13');D.rows.push(nr);E['isca-2027'].cycles.push({name:'Industry Track',abstract_deadline:'2026-12-06',paper_deadline:'2026-12-13'});V2.push({eid:'isca-2027',cycle:'Industry Track',status:'VERIFIED',url:U.isca,d:CHECKED2});}
// ICSE 2028: 단일 사이클 (Cycle 1 행 삭제)
D.rows=D.rows.filter(r=>!(r.eid==='icse-2028'&&r.cycle==='Cycle 1'));E['icse-2028'].cycles=E['icse-2028'].cycles.filter(c=>c.name!=='Cycle 1');
// USENIX Security: Cycle 2 필수 등록(제목·저자·초록 고정) 1/19
{const r=row('usenixsec-2027','Cycle 2')[0];r.abs='2027-01-19';V2.push({eid:'usenixsec-2027',cycle:'Cycle 2',status:'VERIFIED',url:'https://www.usenix.org/conference/usenixsecurity27/call-for-papers',d:CHECKED2});E['usenixsec-2027'].notes=(E['usenixsec-2027'].notes||'')+' [11/24] Cycle 2 필수 등록(제목·저자·초록 고정) 2027-01-19.';}
// --- 개최일/장소 정정 (공식 페이지 직접 확인)
E['iccv-2027'].notes=(E['iccv-2027'].notes||'')+' [11/24] 공식 헤더·Dates 페이지는 10/3~7, 같은 사이트 Venue 문구는 10/2~8(대관 기간).';
{const e=E['icwsm-2027'];e.city='Edinburgh';e.country='Scotland';const c=conf('icwsm-2027');if(c){c.city='Edinburgh';c.country='Scotland'}}
{const e=E['acisp-2027'];e.city='Melbourne';e.country='Australia';const c=conf('acisp-2027');if(c){c.city='Melbourne';c.country='Australia'}e.notes=(e.notes||'')+' [11/24] 공식 사이트: 개최지 Melbourne, 개최일 "To be announced". Gemini 보고는 config.csv에 2027-07-07~10이 있다고 했으나 직접 확인하지 못해 미정으로 둠.';}
E['rtss-2026'].url='https://2026.rtss.org/';
// rows와 edition의 시간대 불일치 정리
for(const r of D.rows){const e=E[r.eid];if(e&&e.tz&&!r.tz&&r.exact)r.tz=e.tz;}
for(const v of V2)D._v2=(D._v2||[]).concat(v);

// --- 검증 결과 부착 (행 단위)
const Vm=new Map();for(const v of [...JSON.parse(fs.readFileSync(path.join(__dirname,'data','checks.json'),'utf8')),...(D._v2||[])])Vm.set(v.eid+'|'+v.cycle,v);delete D._v2;
const V=[...Vm.values()];
const MAP={STILL_UNPUBLISHED:'unpub',VERIFIED:'ok',CORRECTED:'ok',NEWLY_PUBLISHED:'ok',ESTIMATE_CONFIRMED_STILL_UNPUBLISHED:'unpub',TRACKER_ONLY:'none',UNVERIFIED:'none'};
const override={'codaspy-2027':'ok','icml-2027':'ok','vldb-2027':'ok','colm-2027':'none'};
let n={ok:0,unpub:0,none:0};
for(const v of V){const rs=row(v.eid,v.cycle);const k=override[v.eid]||MAP[v.status];rs.forEach(r=>{r.chk={s:k,url:v.url||null,d:v.d||CHECKED}});if(rs.length)n[k]++;
  const e=E[v.eid];if(e){(e.checks=e.checks||[]).push({cycle:v.cycle,s:k,url:v.url||null,d:v.d||CHECKED});}}
D.meta.updated=CHECKED2;D.meta.check_counts={total:V.length,...n};
D.meta.checked_note='11/23 72건 + 11/24 추가 대조를 공식 페이지와 맞춰 봄.';
delete D.meta.seed_workbook;delete D.meta.sourcePolicy;
// --- 공개용 정리: 내부 워크북 표식·파일명 제거
for(const s of D.series){if(s.ev){delete s.ev.workbook_user_list;if('workbook_cs' in s.ev){s.ev.cs_rank=s.ev.workbook_cs;delete s.ev.workbook_cs}}
  if(s.strategy)s.strategy=s.strategy.replace(/(사용자 )?워크북 (미)?포함(\([^)]*\))?\.?\s*/g,'').replace(/\s+/g,' ').replace(/^[→\-–·,.\s]+/,'').trim();}
D.history=(D.history||[]).filter(h=>!/xlsx/.test(JSON.stringify(h)));
D.meta.title='Top-tier 학회 투고 플래너';delete D.meta.seed_workbook;
const SCAN=JSON.stringify(D);if(/xlsx|워크북|workbook/i.test(SCAN))throw new Error('내부 표식이 남아 있음: '+(SCAN.match(/.{30}(xlsx|워크북|workbook).{30}/i)||[])[0]);
const out=fs.readFileSync(path.join(__dirname,'template.html'),'utf8').replace('/*DATA*/null',()=>JSON.stringify(D));
const OUT_FILE=path.join(__dirname,'..','..','public','conf-planner-b8feafcb','index.html');
fs.mkdirSync(path.dirname(OUT_FILE),{recursive:true});fs.writeFileSync(OUT_FILE,out);
console.log('ok',(out.length/1024|0)+'KB',n);
