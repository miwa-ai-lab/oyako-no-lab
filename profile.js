(() => {
const tabs=[...document.querySelectorAll('[role=tab]')];
function show(id){if(!tabs.some(t=>t.dataset.panel===id))id='home';tabs.forEach(t=>{const active=t.dataset.panel===id;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;const panel=document.getElementById(t.dataset.panel);panel.hidden=!active;panel.classList.toggle('active',active);});}
tabs.forEach((t,i)=>{t.addEventListener('click',()=>{history.pushState(null,'','#'+t.dataset.panel);show(t.dataset.panel);window.scrollTo({top:0,behavior:'instant'});});t.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%tabs.length;else if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=tabs.length-1;else return;e.preventDefault();tabs[n].focus();tabs[n].click();tabs[n].scrollIntoView({block:'nearest',inline:'nearest'});});});
window.addEventListener('hashchange',()=>show(location.hash.slice(1)));show(location.hash.slice(1));
})();
