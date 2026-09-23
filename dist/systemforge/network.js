(function () {
  'use strict';
  const lessons = window.SystemForgeLessons;
  const key = 'systemforge-network-v1';
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let stored = {}, storageError = '';
  try { const value = JSON.parse(localStorage.getItem(key) || '{}'); if (value && typeof value === 'object' && !Array.isArray(value)) stored = value; }
  catch (_) { storageError = 'Saved practice could not be read. You can still explore the lessons.'; }
  const entries = Object.fromEntries(lessons.map(l => {
    const old = stored.entries?.[l.id];
    return [l.id, { notes: typeof old?.notes === 'string' ? old.notes.slice(0,12000) : '', choice: Number.isInteger(old?.choice) && old.choice >= 0 && old.choice < l.options.length ? old.choice : null, checked: old?.checked === true }];
  }));
  let selected = lessons.some(l => l.id === stored.selected) ? stored.selected : lessons[0].id;
  let step = 0;
  const current = () => lessons.find(l => l.id === selected);
  const passed = l => entries[l.id].checked && entries[l.id].choice === l.correct;
  function save() {
    try { localStorage.setItem(key, JSON.stringify({ selected, entries })); storageError = ''; }
    catch (_) { storageError = 'This browser could not save your notes. Copy them before leaving this page.'; }
    const status = document.getElementById('network-save');
    if (status) status.textContent = storageError || 'Saved in this browser. Progress does not sync between websites or devices.';
  }
  function edgePath(edge, nodes) {
    if (edge.path) return { path: edge.path, x: edge.labelX, y: edge.labelY };
    const a = nodes.find(n => n.id === edge.from), b = nodes.find(n => n.id === edge.to);
    const ax = a.x + 90, ay = a.y + 40, bx = b.x + 90, by = b.y + 40;
    if (Math.abs(bx-ax) > Math.abs(by-ay)) {
      const sign = bx > ax ? 1 : -1, sx = ax + sign*90, ex = bx - sign*90, mid = (sx+ex)/2;
      return {path:`M${sx} ${ay} H${mid} V${by} H${ex}`, x:mid, y:(ay+by)/2-10};
    }
    const sign = by > ay ? 1 : -1, sy = ay + sign*40, ey = by - sign*40, mid = (sy+ey)/2;
    return {path:`M${ax} ${sy} V${mid} H${bx} V${ey}`, x:(ax+bx)/2, y:mid-10};
  }
  function diagram(lesson) {
    const active = lesson.nodes[step].id;
    return `<div class="network-diagram-scroll" tabindex="0" role="region" aria-label="${esc(lesson.diagram)}; scroll horizontally on small screens"><svg class="network-diagram" viewBox="0 0 820 420" role="group" aria-labelledby="network-diagram-title network-diagram-desc"><title id="network-diagram-title">${esc(lesson.diagram)}</title><desc id="network-diagram-desc">Select a numbered component for an explanation. The same components appear as buttons below. ${esc(lesson.edges.map(edge => `${lesson.nodes.find(n=>n.id===edge.from).title} ${edge.both?'connects with':'to'} ${lesson.nodes.find(n=>n.id===edge.to).title}: ${edge.label}`).join('. '))}</desc><defs><marker id="network-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#b1bdce"/></marker></defs>${lesson.edges.map(edge => { const d = edgePath(edge, lesson.nodes); return `<g class="network-edge ${edge.from===active||edge.to===active?'is-emphasized':''}"><path d="${d.path}" marker-end="url(#network-arrow)" ${edge.both?'marker-start="url(#network-arrow)"':''}/><text x="${d.x}" y="${d.y}" text-anchor="middle">${esc(edge.label)}</text></g>`; }).join('')}${lesson.nodes.map((node,i)=>`<g class="network-node ${i===step?'is-selected':''}" transform="translate(${node.x} ${node.y})" role="button" tabindex="0" aria-pressed="${i===step}" aria-label="Step ${i+1}: ${esc(node.title)}" data-network-step="${i}"><rect width="180" height="80" rx="10"/><text x="14" y="21" class="network-node-number">${String(i+1).padStart(2,'0')}</text><text x="90" y="42" text-anchor="middle">${esc(node.title)}</text><text x="90" y="63" text-anchor="middle" class="network-node-sub">${esc(node.sub)}</text></g>`).join('')}</svg></div>`;
  }
  function render() {
    const l = current(), entry = entries[l.id], i = lessons.indexOf(l), completed = lessons.filter(passed).length;
    return `<section id="network-room" class="network-room" aria-label="Network and cloud interview lessons">
      <header class="network-heading"><div><span class="network-kicker">NETWORK & CLOUD ESSENTIALS</span><h1>Follow the request. Explain the system.</h1><p>Ten guided lessons with diagrams, practical tradeoffs, and interview drills. Choose a topic, then step through its components.</p></div><div class="network-progress"><strong>${completed} / ${lessons.length}</strong><span>knowledge checks passed</span></div></header>
      <label for="network-lesson" class="network-label">Choose a lesson</label><select id="network-lesson">${lessons.map((item,index)=>`<option value="${item.id}" ${item.id===selected?'selected':''}>${String(index+1).padStart(2,'0')} · ${esc(item.title)}${passed(item)?' ✓':''}</option>`).join('')}</select>
      <article class="network-lesson panel"><div class="network-lesson-intro"><span class="network-kicker">${esc(l.category)} · ${l.time} · LESSON ${i+1} OF ${lessons.length}</span><h2 id="network-title" tabindex="-1">${esc(l.title)}</h2><p>${esc(l.intro)}</p></div>
      <div class="network-diagram-heading"><h3>${esc(l.diagram)}</h3><span>Illustrative model · select a component</span></div>
      <div id="network-figure">${diagram(l)}</div>
      <div class="network-walkthrough"><div class="network-step-buttons" role="group" aria-label="Diagram components">${l.nodes.map((node,index)=>`<button type="button" data-network-step="${index}" aria-pressed="${index===step}" class="${index===step?'active':''}">${index+1}. ${esc(node.title)}</button>`).join('')}</div><div class="network-step-detail" aria-live="polite"><span id="network-step-count">STEP ${step+1} / ${l.nodes.length}</span><h3 id="network-step-title">${esc(l.nodes[step].title)}</h3><p id="network-step-copy">${esc(l.nodes[step].detail)}</p></div><div class="network-step-controls"><button type="button" data-network-action="previous-step" ${step===0?'disabled':''}>← Previous component</button><button type="button" data-network-action="next-step" ${step===l.nodes.length-1?'disabled':''}>Next component →</button></div></div>
      <div class="network-takeaways">${l.takeaways.map(([title,copy])=>`<section><h3>${esc(title)}</h3><p>${esc(copy)}</p></section>`).join('')}</div>
      <aside class="network-trap"><strong>Common interview trap</strong><p>${esc(l.trap)}</p></aside>
      <section class="network-practice"><span class="network-kicker">SAY IT OUT LOUD · 60–90 SECONDS</span><h3>${esc(l.prompt)}</h3><label for="network-notes" class="network-label">Your answer notes</label><textarea id="network-notes" rows="5" maxlength="12000" placeholder="State the flow, a failure case, and the tradeoff you would defend.">${esc(entry.notes)}</textarea><details><summary>Compare with a sample answer</summary><p>${esc(l.answer)}</p></details>
      <fieldset class="network-check"><legend>Quick knowledge check</legend><p>${esc(l.question)}</p>${l.options.map((option,index)=>`<label><input type="radio" name="network-choice" value="${index}" ${entry.choice===index?'checked':''}><span>${esc(option)}</span></label>`).join('')}<button type="button" class="primary" data-network-action="check" ${entry.choice===null?'disabled':''}>Check understanding</button></fieldset><p id="network-feedback" class="network-feedback ${passed(l)?'is-correct':''}" role="status">${entry.checked?esc((passed(l)?'Correct. ':'Not quite. ')+l.explanation):'Choose an answer to check your reasoning. Written notes are self-reviewed.'}</p>
      <a href="${l.source[1]}" target="_blank" rel="noopener noreferrer">Reference: ${esc(l.source[0])} ↗</a></section></article>
      <div class="network-lesson-controls"><button type="button" data-network-action="previous-lesson" ${i===0?'disabled':''}>← Previous lesson</button><span>${i+1} of ${lessons.length}</span><button type="button" class="primary" data-network-action="next-lesson" ${i===lessons.length-1?'disabled':''}>Next lesson →</button></div><p id="network-save" class="network-save" role="status">${esc(storageError || 'Saved in this browser. Progress does not sync between websites or devices.')}</p></section>`;
  }
  function redraw(focusTitle = false) {
    const room = document.getElementById('network-room');
    if (room) room.outerHTML = render();
    if (focusTitle) { document.getElementById('network-title').focus({preventScroll:true}); document.getElementById('network-room').scrollIntoView({block:'start',behavior:'smooth'}); }
  }
  function setStep(next, source) {
    const l = current();
    step = Math.max(0,Math.min(l.nodes.length-1,next));
    document.getElementById('network-figure').innerHTML = diagram(l);
    document.querySelectorAll('.network-step-buttons button').forEach((button,i)=>{button.classList.toggle('active',i===step);button.setAttribute('aria-pressed',String(i===step));});
    document.getElementById('network-step-count').textContent = `STEP ${step+1} / ${l.nodes.length}`;
    document.getElementById('network-step-title').textContent = l.nodes[step].title;
    document.getElementById('network-step-copy').textContent = l.nodes[step].detail;
    document.querySelector('[data-network-action="previous-step"]').disabled = step===0;
    document.querySelector('[data-network-action="next-step"]').disabled = step===l.nodes.length-1;
    if (source?.tagName.toLowerCase()==='g') document.querySelector(`.network-node[data-network-step="${step}"]`).focus();
  }
  document.addEventListener('click', event => {
    const room = event.target.closest('#network-room'); if (!room) return;
    const component = event.target.closest('[data-network-step]');
    if (component) { setStep(Number(component.dataset.networkStep),component); return; }
    const action = event.target.closest('[data-network-action]')?.dataset.networkAction;
    if (action==='next-step') setStep(step+1);
    if (action==='previous-step') setStep(step-1);
    if (action==='next-lesson'||action==='previous-lesson') {
      const next = lessons[lessons.indexOf(current()) + (action==='next-lesson'?1:-1)];
      if (next) { selected=next.id; step=0; save(); redraw(true); }
    }
    if (action==='check') {
      const entry=entries[selected]; if(entry.choice===null)return;
      entry.checked=true; save();
      const feedback=document.getElementById('network-feedback');
      feedback.textContent=(passed(current())?'Correct. ':'Not quite. ')+current().explanation;
      feedback.classList.toggle('is-correct',passed(current()));
      document.querySelector('.network-progress strong').textContent=`${lessons.filter(passed).length} / ${lessons.length}`;
      const option=document.querySelector(`#network-lesson option[value="${selected}"]`);
      option.textContent=`${String(lessons.indexOf(current())+1).padStart(2,'0')} · ${current().title}${passed(current())?' ✓':''}`;
    }
  });
  document.addEventListener('keydown',event=>{const component=event.target.closest('g[data-network-step]');if(component&&['Enter',' '].includes(event.key)){event.preventDefault();setStep(Number(component.dataset.networkStep),component);}});
  document.addEventListener('change',event=>{
    if(event.target.id==='network-lesson'){selected=event.target.value;step=0;save();redraw();document.getElementById('network-lesson').focus({preventScroll:true});}
    if(event.target.name==='network-choice'){
      const entry=entries[selected];entry.choice=Number(event.target.value);entry.checked=false;save();
      document.querySelector('[data-network-action="check"]').disabled=false;
      document.getElementById('network-feedback').textContent='Answer selected. Check it to see feedback.';
      document.getElementById('network-feedback').classList.remove('is-correct');
      document.querySelector('.network-progress strong').textContent=`${lessons.filter(passed).length} / ${lessons.length}`;
      document.querySelector(`#network-lesson option[value="${selected}"]`).textContent=`${String(lessons.indexOf(current())+1).padStart(2,'0')} · ${current().title}`;
    }
  });
  document.addEventListener('input',event=>{if(event.target.id==='network-notes'){entries[selected].notes=event.target.value;save();}});
  window.SystemForgeNetwork = { render };
})();
