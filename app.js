(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const themes = window.LAB_THEMES;
  const categories = ['感情','行動','生活','友達','学び','親子関係'];
  const descriptions = {感情:'気持ちがコントロールできない時に',行動:'「なんでそんなことするの？」を読み解く',生活:'毎日のリズムと環境を整える',友達:'友だち・きょうだい・社会性のこと',学び:'遊び・学び・やる気を育む',親子関係:'親も子も、少し楽になる関わり方'};
  let state = {category:'',age:'すべて',q:'',browse:false};
  let returnHash = '#home', returnFocus = null;
  const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalize = s => s.normalize('NFKC').toLowerCase().replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-0x60)).replace(/[〜～]/g,'~');
  function ageMatches(t,token) {
    const match = token.match(/^(\d+)歳$/);
    if(!match) return null;
    const n = +match[1];
    return t.ages.some(age=>age==='0〜1歳'?n<=1:age==='1〜3歳'?n>=1&&n<=3:age==='3〜6歳'?n>=3&&n<=6:age==='小学生'?n>=6&&n<=12:false);
  }
  function filtered() {
    const terms=normalize(state.q.trim()).split(/\s+/).filter(Boolean);
    return themes.filter(t=>(!state.category||t.category===state.category)&&(state.age==='すべて'||t.ages.includes(state.age))&&terms.every(term=>{
      const age=ageMatches(t,term);
      return age===null ? normalize([t.title,t.category,...t.tags,...t.ages,t.concern].join(' ')).includes(term) : age;
    }));
  }
  function tagHTML(t) {return t.ages.map(a=>`<span class="tag">${esc(a)}</span>`).join('');}
  function listHash(){const p=new URLSearchParams();if(state.category)p.set('category',state.category);if(state.age!=='すべて')p.set('age',state.age);if(state.q)p.set('q',state.q);return '#'+(p.toString()||'all');}
  function render(){
    $('query').value=state.q;
    $('ages').innerHTML=window.LAB_AGES.map(a=>`<button type="button" data-age="${a}" aria-pressed="${state.age===a}">${a}</button>`).join('');
    document.querySelectorAll('[data-category]').forEach(a=>{const active=state.browse?a.dataset.category===state.category:a.dataset.category==='home';if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    $('home-content').hidden=state.browse;$('results').hidden=!state.browse;
    if(!state.browse)return;
    const result=filtered();
    const edition=({感情:['01','FEELINGS'],行動:['02','LITTLE ACTIONS'],生活:['03','EVERYDAY'],友達:['04','TOGETHER'],学び:['05','DISCOVERY'],親子関係:['06','YOU & ME']})[state.category]||['30','OUR LITTLE QUESTS'];
    const categoryArtwork=({感情:'feelings',行動:'actions',生活:'everyday',友達:'friends',学び:'learning',親子関係:'relationship'})[state.category];
    $('category-editorial').innerHTML=`<span class="edition-number">${edition[0]}</span><span class="edition-english">${edition[1]}</span><img src="assets/${categoryArtwork ? `category-${categoryArtwork}` : 'parent-child-watercolor'}.png" alt="" width="1536" height="1024">`;
    $('results-title').textContent=state.q?`「${state.q}」の検索結果`:(state.category||'すべてのテーマ');
    $('result-description').textContent=state.category?descriptions[state.category]:'親子の「今」に合うヒントを探す';
    $('result-count').textContent=`${result.length}件のテーマ${state.age!=='すべて'?' ／ '+state.age:''}${state.category?' ／ '+state.category:''}`;
    $('empty').hidden=!!result.length;
    $('cards').innerHTML=result.map(t=>`<a class="theme-card" href="#theme=${t.id}"><span class="card-number" aria-hidden="true">${String(themes.indexOf(t)+1).padStart(2,'0')}</span><span class="card-category">${esc(t.category)}</span><h3>${esc(t.title)}</h3><p>${esc(t.concern)}</p><div class="tag-list">${tagHTML(t)}</div><p class="card-quest">🌱 ${esc(window.LAB_QUESTS[t.id].title)}</p><span class="card-action">親子で試してみる →</span></a>`).join('');
  }
  function openDetail(id){
    const t=themes.find(t=>t.id===id);if(!t){$('detail').close();state.browse=true;render();$('result-description').textContent='このテーマは見つかりませんでした。一覧からお選びください。';return;}
    if(!$('detail').open){returnFocus=document.activeElement;returnHash=state.browse?listHash():'#home';}
    const diagram=t.diagram?`<figure><img class="diagram-image" src="${esc(t.diagram.src)}" alt="${esc(t.diagram.alt)}" loading="lazy"><figcaption>${esc(t.diagram.caption||'')}</figcaption></figure>`:'';
    $('detail-body').innerHTML=`<span class="card-category">${esc(t.category)}</span><h2 id="detail-title" tabindex="-1">${esc(t.title)}</h2><div class="tag-list">${tagHTML(t)}${t.tags.map(tag=>`<span class="tag">#${esc(tag)}</span>`).join('')}</div><section><h3>困りごと</h3><p>${esc(t.concern)}</p></section><section><h3>脳・発達の見方</h3><p>${esc(t.perspective)}</p></section>${diagram}<section class="first-action"><h3>まず試す1つ</h3><p>${esc(t.action)}</p></section>${window.LAB_QUEST_UI.render(t)}${t.safety?`<section class="safety-note"><h3>相談の目安</h3><p>${esc(t.safety)}</p></section>`:''}<section><h3>関連テーマ</h3><div class="related">${t.related.map(id=>themes.find(x=>x.id===id)).filter(Boolean).map(r=>`<a href="#theme=${r.id}">${esc(r.title)} <span aria-hidden="true">→</span></a>`).join('')}</div></section>${t.sources.length?`<section class="sources"><details><summary>背景を知る参考資料（英語）</summary><p>一般的な発達・関わりの考え方の参考資料です。</p><ul>${t.sources.map(key=>window.LAB_SOURCES[key]).map(s=>`<li><a target="_blank" rel="noopener noreferrer" href="${esc(s.url)}">${esc(s.title)} ↗<span class="sr-only">（新しいタブ）</span></a></li>`).join('')}</ul></details></section>`:''}`;
    window.LAB_QUEST_UI.bind(t);
    if(!$('detail').open)$('detail').showModal();
    $('detail').scrollTop=0;$('detail-title').focus({preventScroll:true});
  }
  function route(){
    const raw=location.hash.slice(1),p=new URLSearchParams(raw);
    if(p.has('theme')){openDetail(p.get('theme'));return;}
    if($('detail').open)$('detail').close();
    if(['home','how','profile',''].includes(raw)){state={category:'',age:'すべて',q:'',browse:false};render();if(raw==='how'||raw==='profile')requestAnimationFrame(()=>$(raw).scrollIntoView());return;}
    state={category:categories.includes(p.get('category'))?p.get('category'):'',age:window.LAB_AGES.includes(p.get('age'))?p.get('age'):'すべて',q:p.get('q')||'',browse:true};render();
  }
  function navigate(hash){if(location.hash===hash)route();else location.hash=hash;}
  function closeDetail(){if(!$('detail').open)return;$('detail').close();history.replaceState(null,'',returnHash);if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});}
  $('search-form').addEventListener('submit',e=>{e.preventDefault();state.q=$('query').value.trim();state.browse=true;navigate(listHash());requestAnimationFrame(()=>{$('results').scrollIntoView();$('results-title').focus({preventScroll:true});});});
  $('ages').addEventListener('click',e=>{const b=e.target.closest('[data-age]');if(!b)return;state.age=b.dataset.age;state.q=$('query').value.trim();state.browse=true;navigate(listHash());requestAnimationFrame(()=>document.querySelector(`[data-age="${state.age}"]`)?.focus({preventScroll:true}));});
  document.querySelectorAll('[data-search]').forEach(b=>b.addEventListener('click',()=>{state.q=b.dataset.search;state.category='';state.browse=true;navigate(listHash());requestAnimationFrame(()=>$('results').scrollIntoView());}));
  document.querySelectorAll('[data-category]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();if(a.dataset.category==='home'){navigate('#home');window.scrollTo({top:0});return;}state.category=a.dataset.category;state.q='';state.browse=true;navigate(listHash());}));
  [$('reset'),$('empty-reset')].forEach(b=>b.addEventListener('click',()=>{navigate('#all');requestAnimationFrame(()=>$('results-title').focus());}));
  $('close-detail').addEventListener('click',closeDetail);
  $('detail').addEventListener('cancel',e=>{e.preventDefault();closeDetail();});
  $('detail').addEventListener('keydown',e=>{
    if(e.key!=='Tab')return;
    const focusable=[...$('detail').querySelectorAll('button,a[href],summary,input,textarea,select,[tabindex="0"]')].filter(el=>el.getClientRects().length&&!el.disabled&&!(el.closest('details:not([open])')&&el.tagName!=='SUMMARY'));
    const first=focusable[0],last=focusable.at(-1),active=document.activeElement;
    if(e.shiftKey&&(active===first||!focusable.includes(active))){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&active===last){e.preventDefault();first.focus();}
  });
  $('detail').addEventListener('click',e=>{if(e.target!==$('detail'))return;const r=$('detail').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDetail();});
  window.addEventListener('hashchange',route);
  render();route();
})();
