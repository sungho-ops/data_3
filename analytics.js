'use strict';
(()=>{
const D=window.IO_DATA,$=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=(v,d=2)=>v==null?'자료 없음':Number(v).toLocaleString('ko-KR',{maximumFractionDigits:d});
let tab='overview',selected='',lastTable={headers:[],rows:[]},amount=10,group='소비',direction='input',comparison=[];
const B=()=>D.years[$('year').value][$('level').value],S=()=>B().sectors.find(s=>s.code===selected)||B().sectors[0];
function table(headers,rows){lastTable={headers,rows};return '<div class="scroll"><table><thead><tr>'+headers.map(h=>'<th scope="col">'+esc(h)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map(v=>'<td>'+esc(typeof v==='number'?fmt(v):v)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';}
function metric(label,value,unit){return '<article class="metric"><span>'+esc(label)+'</span><strong>'+fmt(value)+'</strong><small>'+esc(unit)+'</small></article>';}
function selectOptions(ss){return ss.map(s=>'<option value="'+esc(s.code)+'">'+esc(s.code+' '+s.name)+'</option>').join('');}
function pick(code){selected=code;$('industry').value=selected;render();}
function populate(oldLevel){const ss=B().sectors;let target=selected;if(oldLevel){const h=D.hierarchy.find(h=>h[oldLevel]===selected);target=h?.[$('level').value];}if(!ss.some(s=>s.code===target))target=ss[0].code;selected=target;$('search').value='';$('industry').innerHTML=selectOptions(ss);$('industry').value=selected;comparison=[];render();}
function ranked(key){return [...B().sectors].filter(s=>s[key]!=null).sort((a,b)=>b[key]-a[key]);}
function jobs(){const b=B(),s=S(),n=amount/10;const j=b.sectors.indexOf(s);let html='<h2>① 동일 금액 수요의 일자리 파급효과</h2><p>국내 생산물의 최종수요 증가액을 입력하세요. 10억원당 계수에 비례한 정태적 효과입니다.</p><div class="tools"><label>최종수요 증가액 (억원)<input id="amount" type="number" min="0.01" step="any" value="'+amount+'"></label><button id="calculate">다시 계산</button></div>';
html+='<div class="overview-grid">'+metric('취업유발',s.jobs*n,'명 · FTE')+metric('고용유발',s.employees*n,'명 · FTE')+metric('직접 취업',s.jobDirect*n,'명 · FTE')+metric('간접 취업',(s.jobs-s.jobDirect)*n,'명 · FTE')+'</div>';
html+='<h3>동일 금액 기준 산업 비교</h3><p class="note">비교 산업을 선택하세요. 선택 산업 외 최대 2개를 추가합니다.</p><div class="tools"><label>비교 산업 1<select id="compare1"><option value="">선택 안 함</option>'+selectOptions(b.sectors)+'</select></label><label>비교 산업 2<select id="compare2"><option value="">선택 안 함</option>'+selectOptions(b.sectors)+'</select></label></div><div id="comparison"></div>';
html+='<h3>노동유발 산업별 상세</h3>'+table(['유발되는 산업','취업유발(FTE명)','고용유발(FTE명)'],b.sectors.map((x,i)=>[x.name,b.J[i][j]*n,b.E[i][j]*n]).sort((a,b)=>b[1]-a[1]));return html;}
function render(){const b=B(),s=S(),i=b.sectors.indexOf(s),root=$('content');$('title').textContent=document.querySelector('[data-tab="'+tab+'"]').textContent;document.querySelectorAll('[data-tab]').forEach(e=>{e.classList.toggle('active',e.dataset.tab===tab);e.setAttribute('aria-pressed',String(e.dataset.tab===tab));});$('status').textContent=$('year').value+'년 · '+$('level').selectedOptions[0].textContent+' · '+s.name+' · '+b.sectors.length+'개 상품부문';let html='';
if(tab==='overview'){
 html='<h2>'+esc(s.name)+' <span class="pill">'+esc(s.code)+'</span></h2><div class="overview-grid">'+metric('총산출',s.output/1e6,'조원 · 명목')+metric('부가가치율',s.vaRate,'%')+metric('수입의존도',s.importRate,'%')+metric('취업유발계수',s.jobs,'FTE명 / 10억원')+'</div><p class="notice">생산유발계수는 총산출, 부가가치유발계수는 부가가치에 대한 효과입니다. 서로 더하지 않습니다. 왼쪽 메뉴에서 노동·무역·수요·산업 연결을 자세히 탐색하세요.</p>';
 html+=table(['지표','값','단위'],[['총산출',s.output,'백만원'],['부가가치',s.va,'백만원'],['국산화율',s.localRate,'%'],['수출률',s.exportRate,'%'],['생산유발계수',s.production,'배'],['수입유발계수',s.imports,'배'],['부가가치유발계수',s.valueAdded,'배'],['고용유발계수',s.employees,'FTE명/10억원']]);
}else if(tab==='jobs'){html=jobs();
}else if(tab==='imports'){
 html='<h2>② 수입의존도와 국내 투입 기반</h2><div class="overview-grid">'+metric('수입의존도',s.importRate,'% · 수입중간재 / 총투입')+metric('국산화율',s.localRate,'% · 국산중간재 / 전체중간재')+metric('부가가치율',s.vaRate,'% · 부가가치 / 총투입')+metric('수입유발계수',s.imports,'최종수요 1단위당')+'</div><p class="notice">국산화율과 수입의존도는 분모가 달라 합계가 100%가 아닙니다. 국가별 수입 집중도와 대체 가능성은 이 자료만으로 알 수 없습니다.</p>';
 html+=table(['산업','수입의존도(%)','국산화율(%)','부가가치율(%)'],ranked('importRate').map(x=>[x.name,x.importRate,x.localRate,x.vaRate]));
}else if(tab==='trends'){
 html='<h2>③ 산업구조 변화 · '+esc(s.name)+'</h2><p>같은 코드의 2022~2024년 지표를 비교합니다. 금액은 당해년 가격이며 물량 증가율이 아닙니다.</p>';
 html+=table(['연도','총산출(조원)','산출 구성비(%)','부가가치(조원)','부가가치율(%)','수입의존도(%)','수출률(%)','취업유발(FTE명/10억원)'],['2022','2023','2024'].map(y=>{let block=D.years[y][$('level').value],x=block.sectors.find(x=>x.code===s.code);return x?[y,x.output/1e6,x.output/block.sectors.reduce((a,b)=>a+b.output,0)*100,x.va/1e6,x.vaRate,x.importRate,x.exportRate,x.jobs]:[y,'해당 코드 없음'];}));
}else if(tab==='demand'){
 html='<h2>④ 소비·투자·수출의 실제 유발구조</h2><p>임의의 충격이 아닌 해당 연도 실제 최종수요의 유발액입니다. 투자는 고정자본형성·재고증감·귀중품 순취득을 포함합니다.</p><div class="tools"><label>최종수요 항목<select id="group">'+['소비','투자','수출'].map(g=>'<option '+(group===g?'selected':'')+'>'+g+'</option>').join('')+'</select></label></div>';
 const f=b.final;html+='<div class="overview-grid">'+metric('생산유발 합계',f.production[group].reduce((a,b)=>a+b,0)/1e6,'조원')+metric('수입유발 합계',f.imports[group].reduce((a,b)=>a+b,0)/1e6,'조원')+metric('부가가치유발 합계',f.valueAdded[group].reduce((a,b)=>a+b,0)/1e6,'조원')+metric('선택 산업 생산 의존 비중',s.output?f.production[group][i]/s.output*100:null,'% · 해당 항목 / 산업 총산출')+'</div>';
 html+=table(['산업','생산유발(백만원)','수입유발(백만원)','부가가치유발(백만원)'],b.sectors.map((x,j)=>[x.name,f.production[group][j],f.imports[group][j],f.valueAdded[group][j]]).sort((a,b)=>b[1]-a[1]));
}else if(tab==='network'){
 const ins=b.sectors.map((x,j)=>({x,v:b.dom[j][i]})).filter(x=>x.v>0).sort((a,b)=>b.v-a.v),outs=b.sectors.map((x,j)=>({x,v:b.dom[i][j]})).filter(x=>x.v>0).sort((a,b)=>b.v-a.v);
 function links(list){const total=list.reduce((a,b)=>a+b.v,0);return list.slice(0,5).map(t=>'<a href="#network" data-sector="'+esc(t.x.code)+'">'+esc(t.x.name)+'<small>'+fmt(t.v/100)+'억원 · '+fmt(t.v/total*100)+'%</small></a>').join('')||'거래 없음';}
 html='<h2>⑤ 선택 산업 중심 연결 지도</h2><p>국산 중간거래 기준 상위 5개 연결. 비중은 해당 산업의 전체 국산 중간거래 대비이며 자기 산업 거래를 포함합니다.</p><div class="flow"><div class="flow-list"><h3>공급 산업 →</h3>'+links(ins)+'</div><div class="flow-center"><strong>'+esc(s.name)+'</strong><br><small>국산 중간거래</small></div><div class="flow-list"><h3>→ 수요 산업</h3>'+links(outs)+'</div></div><div class="tools"><label>상세표 방향<select id="direction"><option value="input">공급 산업</option><option value="output">수요 산업</option></select></label></div>';
 const list=direction==='input'?ins:outs,total=list.reduce((a,b)=>a+b.v,0);html+=table(['연결 산업','거래액(백만원)','전체 거래 대비(%)'],list.map(t=>[t.x.name,t.v,t.v/total*100]));
}else if(tab==='hierarchy'){
 const hs=D.hierarchy.filter(h=>h[$('level').value]===s.code);const codes=Object.fromEntries(['대','중','소'].map(l=>[l,[...new Set(hs.map(h=>h[l]))]]));
 html='<h2>⑥ 분류 수준별 결과 비교</h2><p class="notice">선택 산업이 포함되거나 포함하는 분류들을 연결합니다. 유발계수는 각 집계 거래표의 제공값입니다. 세부 산업 계수의 평균이나 합계로 계산하지 않습니다.</p>';
 const rr=[];for(const l of ['대','중','소'])for(const c of codes[l]){const x=D.years[$('year').value][l].sectors.find(x=>x.code===c);if(x)rr.push([l+'분류',c,x.name,x.production,x.jobs,x.importRate]);}
 html+=table(['분류','코드','산업','생산유발계수','취업유발(FTE명/10억원)','수입의존도(%)'],rr);html+='<h3>연결된 기본부문 품목</h3><p>'+hs.map(h=>'<span class="pill">'+esc(h.기본+' '+h.name)+'</span>').join(' ')+'</p><p class="note">기본부문별 생산 분석은 기존 시뮬레이터에서 이용할 수 있습니다. 기본부문 노동계수는 제공되지 않아 세부 품목에 임의 배분하지 않습니다.</p>';
}
root.innerHTML=html;
if(tab==='jobs'){
 $('calculate').onclick=()=>{const v=Number($('amount').value);if(!Number.isFinite(v)||v<=0){$('amount').reportValidity();return;}amount=v;render();};
 const update=()=>{comparison=[$('compare1').value,$('compare2').value];const list=[s,...comparison.map(c=>b.sectors.find(x=>x.code===c)).filter(Boolean)].filter((x,i,a)=>a.indexOf(x)===i);$('comparison').innerHTML='<div class="scroll"><table><thead><tr><th>산업</th><th>취업(FTE명)</th><th>고용(FTE명)</th></tr></thead><tbody>'+list.map(x=>'<tr><td>'+esc(x.name)+'</td><td>'+fmt(x.jobs*amount/10)+'</td><td>'+fmt(x.employees*amount/10)+'</td></tr>').join('')+'</tbody></table></div>';};
 ['compare1','compare2'].forEach((id,i)=>{$(id).value=comparison[i]||'';$(id).onchange=update;});update();
}
if(tab==='demand')$('group').onchange=()=>{group=$('group').value;render();};
if(tab==='network'){$('direction').value=direction;$('direction').onchange=()=>{direction=$('direction').value;render();};root.querySelectorAll('[data-sector]').forEach(a=>a.onclick=e=>{e.preventDefault();pick(a.dataset.sector);});}
try{localStorage.setItem('io-analytics-selection',JSON.stringify({year:$('year').value,level:$('level').value,selected,tab}));}catch(e){}
}
$('tabs').onclick=e=>{const btn=e.target.closest('[data-tab]');if(btn){tab=btn.dataset.tab;render();window.scrollTo({top:0,behavior:'smooth'});}};
$('year').onchange=()=>populate();let previousLevel=$('level').value;$('level').onchange=()=>{populate(previousLevel);previousLevel=$('level').value;};
$('industry').onchange=()=>pick($('industry').value);
$('search').oninput=()=>{const q=$('search').value.trim();const ss=B().sectors.filter(s=>{const hs=D.hierarchy.filter(h=>h[$('level').value]===s.code);return(s.code+' '+s.name).includes(q)||hs.some(h=>h.name.includes(q));});$('industry').innerHTML=selectOptions(ss);if(ss.length){selected=ss.some(s=>s.code===selected)?selected:ss[0].code;$('industry').value=selected;render();}else $('status').textContent='검색 결과가 없습니다. 다른 산업명이나 코드를 입력하세요.';};
$('export').onclick=()=>{const cell=v=>'"'+String(v??'자료 없음').replace(/^[=+@-]/,"'").replaceAll('"','""')+'"';const rows=[['연도',$('year').value,'분류',$('level').value,'선택산업',S().name],lastTable.headers,...lastTable.rows];const u=URL.createObjectURL(new Blob(['\ufeff'+rows.map(r=>r.map(cell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=u;a.download='IO-'+$('year').value+'-'+tab+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);};
try{const saved=JSON.parse(localStorage.getItem('io-analytics-selection'));if(saved&&D.years[saved.year]?.[saved.level]){$('year').value=saved.year;$('level').value=saved.level;previousLevel=saved.level;selected=saved.selected;if(document.querySelector('[data-tab="'+saved.tab+'"]'))tab=saved.tab;}}catch(e){}
populate();
})();
