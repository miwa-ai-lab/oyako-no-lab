(() => {
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels={baby:'0〜1歳なら',toddler:'1〜3歳なら',preschool:'3〜6歳なら',school:'小学生なら',parent:'親向けのヒント'};
const key='oyako-lab-quest-records-v1';
let records=[];
try{const stored=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(stored))records=stored.filter(r=>r&&r.schemaVersion===1&&typeof r.themeId==='string').slice(-100);}catch{}
window.LAB_QUEST_UI={
 render(t){const q=window.LAB_QUESTS[t.id];return `
 <section class="quest-card" aria-labelledby="quest-heading" data-quest-id="${q.id}">
 <div class="quest-top"><h3 id="quest-heading">🌱 親子で1〜5分QUEST</h3><span class="quest-time">${q.durationMinutes}分めやす</span></div>
 <p class="quest-title">${esc(q.title)}</p><p class="quest-invitation">${esc(q.invitation).replace(/\n/g,'<br>')}</p>
 <p class="quest-materials">用意するもの：${esc(q.materials)}</p>
 <ol class="quest-steps">${q.steps.map(s=>`<li>${esc(s.text)}</li>`).join('')}</ol>
 <div class="quest-cycle" aria-label="GROW QUESTの4つの流れ"><span>試す</span><b aria-hidden="true">→</b><span>観察する</span><b aria-hidden="true">→</b><span>変える</span><b aria-hidden="true">→</b><span>発見する</span></div>
 <p class="quest-next"><strong>次に変えるなら</strong><br>${esc(q.next)}。</p>
 ${Object.keys(q.adaptations).length?`<details class="age-adaptations"><summary>年齢に合わせた小さなアレンジ</summary>${Object.entries(q.adaptations).map(([k,v])=>`<p><strong>${labels[k]}</strong><br>${esc(v)}</p>`).join('')}</details>`:''}
 </section>
 <section><h3>💬 親子で話してみよう</h3><blockquote>${esc(q.talk)}</blockquote><p class="response-note">言葉にならなくても、目線・身ぶり・「今はやらない」も大切なお返事。</p></section>
 <section><h3>👀 見てみよう・観察ポイント</h3><ul class="observation-list">${q.observations.map(o=>`<li>${esc(o.label)}</li>`).join('')}</ul><p class="muted">${esc(q.discoveryPrompt)} できた・できないの採点は不要です。</p>
 <details class="discovery-note"><summary>今日の発見をひとこと残す <span>任意</span></summary>
 <p class="record-privacy">保存ボタンを押した内容だけ、このブラウザに最新100件まで残ります。外部には送信しません。共有端末では他の利用者も見られるため、名前や身体の詳しい情報は書かないでください。</p>
 <form id="quest-record-form" data-theme-id="${t.id}">
 <label for="record-tried">試した方法</label><input id="record-tried" name="tried" maxlength="160" placeholder="例：今日は、あと1曲を選んだ">
 <fieldset><legend>気づいたこと（選ばなくてもOK）</legend>${q.observations.map(o=>`<label class="observation-check"><input type="checkbox" name="noticed" value="${o.id}">${esc(o.label)}</label>`).join('')}</fieldset>
 <label for="record-discovery">今日は、私たちにどうだった？</label><textarea id="record-discovery" name="discovery" rows="2" maxlength="400" placeholder="例：今日は、このやり方が楽だったみたい"></textarea>
 <label for="record-next">次に変えてみたいこと</label><input id="record-next" name="nextExperiment" maxlength="160" placeholder="次は変えない・お休みでもOK">
 <div class="record-actions"><button type="submit" class="primary">この端末に保存</button><button type="button" data-record-export class="text-button">記録を書き出す</button><button type="button" data-record-delete class="text-button">このテーマの記録を消す</button></div>
 <p id="record-status" role="status" aria-live="polite"></p><div id="saved-records"></div></form></details></section>`;},
 bind(t){
  const form=document.getElementById('quest-record-form');const status=document.getElementById('record-status');
  const refresh=()=>{const mine=records.filter(r=>r.themeId===t.id);document.getElementById('saved-records').innerHTML=mine.length?`<p class="saved-count">このテーマの発見：${mine.length}件</p><ul>${mine.slice(-3).reverse().map(r=>`<li><small>${esc(new Date(r.createdAt).toLocaleDateString('ja-JP'))}</small> ${esc(r.discovery||r.tried||'気づきを記録しました')}</li>`).join('')}</ul>`:'';form.querySelector('[data-record-delete]').disabled=!mine.length;form.querySelector('[data-record-export]').disabled=!records.length;};refresh();
  form.addEventListener('submit',e=>{e.preventDefault();const data=new FormData(form);const fields={tried:String(data.get('tried')||'').trim(),noticed:data.getAll('noticed'),discovery:String(data.get('discovery')||'').trim(),nextExperiment:String(data.get('nextExperiment')||'').trim()};if(!fields.tried&&!fields.noticed.length&&!fields.discovery&&!fields.nextExperiment){status.textContent='気づいたことをひとつ選ぶか、ひとこと書いてみてください。';return;}
   const record={schemaVersion:1,recordId:crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`,themeId:t.id,questId:window.LAB_QUESTS[t.id].id,questVersion:window.LAB_QUESTS[t.id].version,createdAt:new Date().toISOString(),...fields};const next=[...records,record].slice(-100);
   try{localStorage.setItem(key,JSON.stringify(next));records=next;form.reset();refresh();status.textContent='今日の発見を、このブラウザに保存しました。';}catch{status.textContent='このブラウザには保存できませんでした。入力は残しています。';}
  });
  form.querySelector('[data-record-export]').addEventListener('click',()=>{const blob=new Blob([JSON.stringify({schemaVersion:1,exportedAt:new Date().toISOString(),records},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='oyako-quest-records.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='全テーマの保存済み記録を書き出しました。';});
  form.querySelector('[data-record-delete]').addEventListener('click',()=>{const next=records.filter(r=>r.themeId!==t.id);try{localStorage.setItem(key,JSON.stringify(next));records=next;refresh();status.textContent='このテーマの記録を削除しました。';}catch{status.textContent='削除できませんでした。ブラウザの保存設定を確認してください。';}});
 }
};
})();
