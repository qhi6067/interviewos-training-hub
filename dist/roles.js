(function () {
  'use strict';
  const data = window.InterviewRolesData, core = window.InterviewRolesCore;
  const app = document.getElementById('roles-app');
  if (!app) return;
  const key = 'interviewos-roles-v1';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = id => document.getElementById(id);
  let raw = null; try { raw = localStorage.getItem(key); } catch {}
  const state = core.parse(raw, data);
  const timer = { remaining: 0, handle: null };
  const pitchFields = [
    ['present', 'Present', 'I’m a … who …'],
    ['proof', 'Proof', 'Recently I … which cut / grew / saved … by …'],
    ['bridge', 'Bridge', 'I’m looking for a role where I can …'],
    ['value', 'Value', 'In the first 90 days I would …']
  ];
  const track = () => data.tracks.find(t => t.id === state.track);
  const prompt = () => track().prompts.find(p => p.id === state.selected[state.track]);
  const answer = p => state.answers[p.id] || (state.answers[p.id] = { text: '', checks: p.include.map(() => false), savedAt: null });
  const clock = s => `${s < 0 ? '+' : ''}${Math.floor(Math.abs(s) / 60)}:${String(Math.abs(s) % 60).padStart(2, '0')}`;
  const when = time => new Date(time).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

  function save(message) {
    try { localStorage.setItem(key, JSON.stringify(state)); $('roles-storage').textContent = message || 'Saved in this browser only. Nothing here is uploaded.'; }
    catch { $('roles-storage').textContent = 'Browser storage is unavailable or full. Copy anything you want to keep.'; }
    dashboard();
  }
  function dashboard() {
    const s = core.summary(state, data), next = core.schedule(state.interviews, Date.now()).find(i => i.time >= Date.now());
    const stats = $('roles-dashboard-stats'), copy = $('roles-dashboard-next');
    if (stats) stats.textContent = `${s.practiced} of ${s.total} prompts practiced`;
    if (copy) copy.textContent = next ? `Next interview: ${next.company} (${data.tracks.find(t => t.id === next.track).title}) ${core.countdown(next.time, Date.now())}.` : 'Add your interviews in Role Prep to see what to practice next.';
  }

  function renderPlan() {
    const now = Date.now(), list = core.schedule(state.interviews, now), next = list.find(i => i.time >= now);
    $('roles-next').innerHTML = next
      ? `<strong>Next up: ${esc(next.company)}</strong> · ${esc(data.tracks.find(t => t.id === next.track).title)} · ${esc(core.countdown(next.time, now))}. <button type="button" class="workshop-inline-link" data-practice-track="${next.track}">Practice this track →</button>`
      : 'Add each interview below. The soonest one appears here with the track to practice.';
    $('roles-interviews').innerHTML = list.length ? list.map(i => `<li data-past="${i.time < now}"><div><strong>${esc(i.company)}</strong><small>${esc(data.tracks.find(t => t.id === i.track).title)} · ${esc(when(i.time))}</small></div><span class="roles-when">${esc(core.countdown(i.time, now))}</span><button type="button" class="quiet-button" data-practice-track="${i.track}">Practice</button><button type="button" class="quiet-button" data-remove-interview="${esc(i.id)}" aria-label="Remove ${esc(i.company)}">Remove</button></li>`).join('') : '<li class="roles-empty">No interviews added yet.</li>';
  }

  function renderTracks() {
    $('roles-tracks').innerHTML = data.tracks.map(t => `<button type="button" data-track="${t.id}" aria-pressed="${t.id === state.track}">${esc(t.title)}</button>`).join('');
    const t = track();
    $('roles-track-intro').textContent = t.tagline;
    $('roles-brief').innerHTML = `<div class="section-kicker">WHAT THIS ROUND TESTS</div><ul>${t.testing.map(x => `<li>${esc(x)}</li>`).join('')}</ul><div class="section-kicker">ANSWER FRAMEWORK</div><h4>${esc(t.framework.name)}</h4><ol>${t.framework.steps.map(x => `<li>${esc(x)}</li>`).join('')}</ol><div class="section-kicker">QUESTIONS TO ASK THEM</div><ul>${t.ask.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
  }

  function renderBench() {
    const t = track(), p = prompt(), a = answer(p), index = t.prompts.indexOf(p);
    $('roles-bench').innerHTML = `<div class="section-kicker">${esc(t.title)} · PROMPT ${index + 1} OF ${t.prompts.length}</div>
      <div class="roles-prompts" role="group" aria-label="Prompts in this track">${t.prompts.map((x, i) => `<button type="button" data-prompt="${x.id}" aria-pressed="${x.id === p.id}">${i + 1} · ${esc(x.short)}${core.practiced(state.answers[x.id]) ? ' ✓' : ''}</button>`).join('')}</div>
      <h3>${esc(p.question)}</h3>
      <div class="roles-timer"><output id="roles-clock" aria-live="off">${clock(t.seconds)}</output><button type="button" class="primary-button" id="roles-timer-toggle">Start timer</button><button type="button" class="quiet-button" id="roles-timer-reset">Reset</button><small>Aim for ${clock(t.seconds)}. Say it out loud; typing is optional.</small></div>
      <p class="roles-timer-status" id="roles-timer-status" role="status"></p>
      <button type="button" class="secondary-button" id="roles-follow-toggle" aria-expanded="false" aria-controls="roles-follow">Reveal the follow-up question</button>
      <p class="roles-follow" id="roles-follow" hidden><strong>Follow-up:</strong> ${esc(p.follow)}</p>
      <label for="roles-answer">Your answer · notes or a full draft</label>
      <textarea id="roles-answer" maxlength="6000" rows="6" placeholder="Lead with the answer, then support it. Name one tradeoff and one failure case.">${esc(a.text)}</textarea>
      <fieldset class="roles-checks"><legend>A strong answer covers</legend>${p.include.map((x, i) => `<label><input type="checkbox" data-check="${i}" ${a.checks[i] ? 'checked' : ''} /> ${esc(x)}</label>`).join('')}</fieldset>
      <div class="roles-actions"><button type="button" class="primary-button" id="roles-save">Save practice</button><button type="button" class="secondary-button" id="roles-next-prompt">Next prompt →</button></div>
      <p class="roles-status" id="roles-status" role="status">${core.practiced(a) ? `Practiced ${esc(new Date(a.savedAt).toLocaleDateString())} · ${a.checks.filter(Boolean).length} of ${p.include.length} points covered.` : 'Answer aloud against the timer, then check each point you covered.'}</p>`;
    resetTimer();
  }

  function renderPitch() {
    const stats = core.pitchStats(state.pitch);
    const verdict = !stats.words ? 'Fill in the four parts. Aim for 60–90 seconds (about 150–225 words).' : stats.seconds < 45 ? 'A little short: add a number to your proof or a detail to your value.' : stats.seconds > 100 ? 'Too long for a first answer: cut to one win and one reason.' : 'Good length for a first answer.';
    $('roles-pitch-preview').textContent = stats.text || 'Your pitch preview appears here.';
    $('roles-pitch-stats').textContent = `${stats.words} words · about ${stats.seconds} seconds. ${verdict}`;
  }

  function resetTimer() { stopTimer(); timer.remaining = track().seconds; paintTimer(); }
  function stopTimer() { clearInterval(timer.handle); timer.handle = null; const b = $('roles-timer-toggle'); if (b) b.textContent = 'Start timer'; }
  function paintTimer() {
    const out = $('roles-clock'); if (!out) return;
    out.textContent = clock(timer.remaining); out.dataset.over = String(timer.remaining < 0);
    if (timer.remaining === 0) $('roles-timer-status').textContent = 'Time. Wrap up in one sentence.';
  }
  function toggleTimer() {
    if (timer.handle) { stopTimer(); return; }
    $('roles-timer-status').textContent = '';
    timer.handle = setInterval(() => { timer.remaining -= 1; paintTimer(); }, 1000);
    $('roles-timer-toggle').textContent = 'Pause';
  }
  function openTrack(id) { state.track = id; save(); renderTracks(); renderBench(); }

  app.innerHTML = `
    <article class="panel-card roles-plan" aria-labelledby="roles-plan-title">
      <div class="section-kicker">MY INTERVIEWS · SAVED ONLY IN THIS BROWSER</div>
      <h3 id="roles-plan-title">Your interview schedule</h3>
      <p class="roles-next" id="roles-next"></p>
      <ul class="roles-interviews" id="roles-interviews"></ul>
      <form class="roles-add" id="roles-add">
        <label>Company<input name="company" maxlength="80" required autocomplete="off" /></label>
        <label>Role track<select name="track">${data.tracks.map(t => `<option value="${t.id}">${esc(t.title)}</option>`).join('')}</select></label>
        <label>Date and local time<input name="when" type="datetime-local" required /></label>
        <button type="submit" class="primary-button">Add interview</button>
      </form>
      <p class="roles-note">Company names and times stay on this device. They are never added to the website’s code.</p>
    </article>
    <div class="workshop-areas roles-tracks" id="roles-tracks" role="group" aria-label="Role tracks"></div>
    <p class="workshop-description" id="roles-track-intro"></p>
    <div class="roles-layout"><aside class="panel-card roles-brief" id="roles-brief"></aside><article class="panel-card roles-bench" id="roles-bench" aria-label="Practice prompt"></article></div>
    <article class="panel-card roles-pitch" aria-labelledby="roles-pitch-title">
      <div class="section-kicker">USE IT IN EVERY FIRST CALL</div>
      <h3 id="roles-pitch-title">Your 60–90 second pitch</h3>
      <div class="roles-pitch-grid">${pitchFields.map(([k, label, hint]) => `<label>${label}<textarea data-pitch="${k}" maxlength="600" rows="3" placeholder="${esc(hint)}">${esc(state.pitch[k])}</textarea></label>`).join('')}</div>
      <blockquote id="roles-pitch-preview"></blockquote>
      <p class="roles-pitch-stats" id="roles-pitch-stats" role="status"></p>
      <button type="button" class="secondary-button" id="roles-pitch-copy">Copy pitch</button>
    </article>
    <p class="coding-storage-note" id="roles-storage" role="status"></p>`;

  app.addEventListener('click', async event => {
    const target = event.target.closest('button');
    if (!target) return;
    if (target.dataset.track) openTrack(target.dataset.track);
    if (target.dataset.practiceTrack) { openTrack(target.dataset.practiceTrack); $('roles-tracks').scrollIntoView({ block: 'start', behavior: 'smooth' }); }
    if (target.dataset.prompt) { state.selected[state.track] = target.dataset.prompt; save(); renderBench(); }
    if (target.dataset.removeInterview) { state.interviews = state.interviews.filter(i => i.id !== target.dataset.removeInterview); save('Interview removed.'); renderPlan(); }
    if (target.id === 'roles-timer-toggle') toggleTimer();
    if (target.id === 'roles-timer-reset') { resetTimer(); $('roles-timer-status').textContent = ''; }
    if (target.id === 'roles-follow-toggle') { const f = $('roles-follow'); f.hidden = !f.hidden; target.setAttribute('aria-expanded', String(!f.hidden)); target.textContent = f.hidden ? 'Reveal the follow-up question' : 'Hide the follow-up question'; }
    if (target.id === 'roles-save') {
      const p = prompt(), a = answer(p);
      if (!core.canSave(a)) { $('roles-status').textContent = 'Write at least a short outline (40 characters) or check the points you covered aloud.'; return; }
      a.savedAt = Date.now(); stopTimer(); save(); renderBench();
      $('roles-status').textContent = `Saved. ${a.checks.filter(Boolean).length} of ${p.include.length} points covered. Try the follow-up next.`;
    }
    if (target.id === 'roles-next-prompt') { const t = track(), i = t.prompts.indexOf(prompt()); state.selected[t.id] = t.prompts[(i + 1) % t.prompts.length].id; save(); renderBench(); }
    if (target.id === 'roles-pitch-copy') {
      const { text } = core.pitchStats(state.pitch);
      try { await navigator.clipboard.writeText(text); $('roles-pitch-stats').textContent = 'Pitch copied.'; }
      catch { $('roles-pitch-stats').textContent = 'Clipboard access is unavailable. Select the preview and copy it with Ctrl+C.'; }
    }
  });
  app.addEventListener('input', event => {
    const p = prompt();
    if (event.target.id === 'roles-answer') { answer(p).text = event.target.value.slice(0, 6000); save('Draft saved in this browser.'); }
    if (event.target.dataset.pitch) { state.pitch[event.target.dataset.pitch] = event.target.value.slice(0, 600); save('Pitch saved in this browser.'); renderPitch(); }
  });
  app.addEventListener('change', event => {
    if (event.target.dataset.check === undefined) return;
    answer(prompt()).checks[Number(event.target.dataset.check)] = event.target.checked; save();
  });
  $('roles-add').addEventListener('submit', event => {
    event.preventDefault();
    const form = new FormData(event.target), company = String(form.get('company')).trim().slice(0, 80), when = String(form.get('when')), trackId = String(form.get('track'));
    if (!company || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(when) || !data.tracks.some(t => t.id === trackId)) return;
    if (state.interviews.length >= 30) { $('roles-storage').textContent = 'You can keep up to 30 interviews. Remove a past one first.'; return; }
    state.interviews.push({ id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`, company, track: trackId, when });
    event.target.reset(); save('Interview added. It is stored only in this browser.'); renderPlan();
  });
  window.addEventListener('hashchange', () => { if (location.hash !== '#roles') stopTimer(); });
  setInterval(() => { renderPlan(); dashboard(); }, 60000);

  renderPlan(); renderTracks(); renderBench(); renderPitch(); dashboard();
})();
