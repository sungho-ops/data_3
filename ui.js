// Presentation-only bindings. All calculation routines remain in app.js / model.py.
(()=>{
 const byId=id=>document.getElementById(id);
 const links=[...document.querySelectorAll('.sidebar nav a')];
 function activate(){const hash=location.hash||'#overview';links.forEach(a=>{const active=a.getAttribute('href')===hash;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}
 window.addEventListener('hashchange',activate);activate();
 const status=byId('status');
 function sync(){
   const ready=typeof sectors!=='undefined' && sectors.length>0 && !byId('sheet').disabled;
   byId('metric-sectors').textContent=ready?sectors.length.toLocaleString('ko-KR'):'—';
   byId('metric-sheets').textContent=ready?byId('sheet').options.length:'—';
   byId('metric-year').textContent=ready&&typeof loadedYear!=='undefined'&&loadedYear?loadedYear+'년':'—';
   const msg=status.textContent;
   byId('metric-state').textContent=msg.includes('실패')?'오류 확인':/중[.…]|처리 중|계산 중/.test(msg)?'처리 중':ready?'분석 준비 완료':'불러오기 전';
   byId('btn-linkage').disabled=!ready;
 }
 new MutationObserver(sync).observe(status,{childList:true,characterData:true,subtree:true});
 byId('year-select').addEventListener('change',()=>{byId('load-basic').disabled=false;byId('load-basic').textContent='선택 연도 불러오기';});
 byId('reset-app').addEventListener('click',()=>{
   byId('metric-year').textContent='—';byId('metric-sectors').textContent='—';byId('metric-sheets').textContent='—';
   byId('metric-state').textContent='불러오기 전';byId('btn-linkage').disabled=true;
   byId('linkage-results').innerHTML='<tr><td colspan="5" class="empty-state">자료를 불러온 뒤 핵심 산업 분석을 실행하세요.</td></tr>';
   byId('trend-results').innerHTML='<tr><td colspan="4" class="empty-state">산업을 선택하고 분석 버튼을 눌러주세요.</td></tr>';
   ['trend-search','trend-sector','run-trend'].forEach(id=>byId(id).disabled=true);
   byId('trend-sector').innerHTML='<option>기본부문 데이터를 먼저 불러와주세요.</option>';
   byId('cells').innerHTML='<tr><td colspan="3" class="empty-state">자료를 불러오면 선택한 산업의 원자료가 표시됩니다.</td></tr>';
 });
 sync();
})();
