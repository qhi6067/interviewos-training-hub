(function () {
  'use strict';

  const localHost = location.hostname === '127.0.0.1' || location.hostname === 'localhost';
  const labs = {
    flightlab: { label: 'Flightlab', subtitle: 'Drone integrations', local: 'http://127.0.0.1:4317/?mode=browser', hosted: 'https://flightlab-nine-mothers-jp.jaime123perez43.chatgpt.site/' },
    restcraft: { label: 'RESTcraft', subtitle: 'API integrations', local: 'http://127.0.0.1:4321/', hosted: 'https://restcraft-api-lab-jp.jaime123perez43.chatgpt.site/' },
    systemforge: { label: 'SystemForge', subtitle: 'System design', local: 'http://127.0.0.1:4322/', hosted: 'https://systemforge-interview-lab-jp.jaime123perez43.chatgpt.site/' }
  };
  const missionCatalog = [
    { lab: 'flightlab', label: 'Flightlab', items: [['Start telemetry', 'Produce the first synthetic track.'], ['Trace a C2 message', 'Follow a track from sensor to subscriber.'], ['Explain WebSocket recovery', 'Describe reconnect and resubscribe behavior.']] },
    { lab: 'restcraft', label: 'RESTcraft', items: [['Read the HTTP conversation', 'Name method, headers, status, and body.'], ['Make retries safe', 'Use idempotency and backoff together.'], ['Translate a vendor contract', 'Validate a messy external payload at the boundary.']] },
    { lab: 'systemforge', label: 'SystemForge', items: [['Clarify before drawing', 'Ask about users, freshness, and availability.'], ['Estimate the shape', 'Turn rates into bandwidth and storage.'], ['Defend a tradeoff', 'Explain failure, scale, and what you give up.']] }
  ];
  const interviewPrompts = [
    { short: 'C2 flow', question: 'Design an integration that sends drone telemetry to a C2 dashboard. Where do WebSockets, REST, and retries fit?', follow: 'What happens when the operator reconnects after missing ten seconds of telemetry?' },
    { short: 'Vendor API', question: 'An external vendor API intermittently returns 401, 429, and duplicate responses. Walk through the client behavior you would ship.', follow: 'Which failures should be retried, and which should stop immediately?' },
    { short: 'Webhook scale', question: 'Design a reliable webhook pipeline at scale. Explain authentication, queueing, idempotency, observability, and replay.', follow: 'How would you prove that a customer received each business event exactly once?' }
  ];
  const defaultState = { missions: { flightlab: [false, false, false], restcraft: [false, false, false], systemforge: [false, false, false] }, practiceSeconds: 0, capstone: false, latestScore: null, answers: {} };
  const state = loadState();

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem('interviewos-hub-state') || 'null');
      return { ...defaultState, ...saved, missions: { ...defaultState.missions, ...(saved && saved.missions) }, answers: { ...(saved && saved.answers) } };
    } catch (_) { return JSON.parse(JSON.stringify(defaultState)); }
  }
  function saveState() { try { localStorage.setItem('interviewos-hub-state', JSON.stringify(state)); } catch (_) {} }
  function el(id) { return document.getElementById(id); }

  const tabs = Array.from(document.querySelectorAll('.lab-tab'));
  const modeTabs = Array.from(document.querySelectorAll('.mode-tab'));
  const views = Array.from(document.querySelectorAll('.practice-view'));
  const frame = el('lab-frame');
  const loading = el('frame-loading');
  const stageName = el('stage-name');
  const stageSubtitle = el('stage-subtitle');
  const stageStatus = el('stage-status');
  const openSeparately = el('open-separately');
  const fallback = el('frame-fallback');
  const fallbackLink = el('fallback-link');
  const progressCopy = el('progress-copy');
  const envChip = el('environment-chip');
  const footerMode = el('footer-mode');
  const healthSummaryText = el('health-summary-text');
  let currentMode = 'deck';

  function setEnvironment() {
    envChip.innerHTML = localHost ? '<i></i> Local workspace' : '<i></i> Published workspace';
    footerMode.textContent = localHost ? 'LOCAL READY' : 'PUBLISHED';
  }
  function setMode(mode) {
    currentMode = mode;
    modeTabs.forEach((tab) => { const active = tab.dataset.mode === mode; tab.classList.toggle('is-active', active); tab.setAttribute('aria-selected', String(active)); });
    views.forEach((view) => { view.hidden = view.dataset.view !== mode; });
    if (mode === 'progress') { renderDashboard(); checkHealth(); }
    if (mode === 'capstone') updateCapstonePhrase();
    if (mode === 'interview') { renderPromptPicker(); loadInterviewAnswer(); }
    window.scrollTo({ top: document.querySelector('.mode-switcher').offsetTop - 18, behavior: 'smooth' });
  }
  function setLab(id, writeHistory) {
    const lab = labs[id] || labs.flightlab;
    document.querySelectorAll('.lab-tab').forEach((tab) => { const active = tab.dataset.lab === id; tab.classList.toggle('is-active', active); tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; });
    loading.classList.remove('is-hidden');
    stageStatus.textContent = localHost ? 'Connecting to lab…' : 'Private lab · may need sign-in';
    stageName.textContent = lab.label;
    stageSubtitle.textContent = lab.subtitle;
    openSeparately.href = localHost ? lab.local : lab.hosted;
    fallbackLink.href = localHost ? lab.local : lab.hosted;
    frame.title = lab.label + ' training lab';
    frame.src = localHost ? lab.local : lab.hosted;
    progressCopy.textContent = 'Practicing in ' + lab.label;
    if (localHost) fallback.hidden = true; else { fallback.hidden = false; loading.classList.add('is-hidden'); }
    if (writeHistory) history.replaceState(null, '', '#' + id);
    try { localStorage.setItem('interviewos-active-lab', id); } catch (_) {}
  }
  frame.addEventListener('load', () => { loading.classList.add('is-hidden'); stageStatus.textContent = localHost ? 'Lab ready' : 'Panel loaded'; });
  document.querySelectorAll('.lab-tab').forEach((tab) => tab.addEventListener('click', () => { setMode('deck'); setLab(tab.dataset.lab, true); }));
  modeTabs.forEach((tab) => tab.addEventListener('click', () => setMode(tab.dataset.mode)));
  document.addEventListener('keydown', (event) => {
    if (event.target && /input|textarea|select/i.test(event.target.tagName)) return;
    const key = String(event.key);
    if (key >= '1' && key <= '3') { const tab = tabs[Number(key) - 1]; if (tab) { setMode('deck'); setLab(tab.dataset.lab, true); tab.focus(); } }
    if (event.altKey && key >= '1' && key <= '4') { const tab = modeTabs[Number(key) - 1]; if (tab) { setMode(tab.dataset.mode); tab.focus(); } }
  });

  /* Unified progress dashboard */
  function completedCount() { return Object.values(state.missions).flat().filter(Boolean).length; }
  function renderMissionList() {
    const list = el('mission-list');
    list.innerHTML = missionCatalog.flatMap((group) => group.items.map((item, index) => {
      const checked = Boolean(state.missions[group.lab][index]);
      return `<label class="mission-row"><input type="checkbox" data-mission="${group.lab}:${index}" ${checked ? 'checked' : ''} /><span><strong>${group.label} · ${item[0]}</strong><small>${item[1]}</small></span><em>${checked ? 'done' : 'next'}</em></label>`;
    })).join('');
    list.querySelectorAll('[data-mission]').forEach((input) => input.addEventListener('change', () => { const [lab, index] = input.dataset.mission.split(':'); state.missions[lab][Number(index)] = input.checked; saveState(); renderDashboard(); }));
  }
  function renderDashboard() {
    const complete = completedCount();
    el('metric-missions').textContent = `${complete} / 9`;
    el('mission-count').textContent = `${complete} / 9`;
    el('metric-time').textContent = state.practiceSeconds < 60 ? `${state.practiceSeconds}s` : `${Math.floor(state.practiceSeconds / 60)}m`;
    el('metric-capstone').textContent = state.capstone ? 'Complete' : 'Not started';
    el('metric-score').textContent = state.latestScore ? `${state.latestScore.toFixed(1)} / 5` : '—';
    renderMissionList();
    const next = missionCatalog.flatMap((group) => group.items.map((item, index) => ({ group, item, index }))).find((entry) => !state.missions[entry.group.lab][entry.index]);
    const title = el('next-lesson-title'); const copy = el('next-lesson-copy'); const button = el('next-lesson-button');
    if (next) { title.textContent = `${next.group.label} · ${next.item[0]}`; copy.textContent = next.item[1]; button.textContent = `Open ${next.group.label} →`; button.onclick = () => { setMode('deck'); setLab(next.group.lab, true); }; }
    else if (!state.capstone) { title.textContent = 'Run the capstone'; copy.textContent = 'Trace telemetry through WebSocket, REST, webhook, and system-design decisions.'; button.textContent = 'Open capstone →'; button.onclick = () => setMode('capstone'); }
    else { title.textContent = 'Rehearse an answer'; copy.textContent = 'Use the interview room to explain one of your decisions under a timer.'; button.textContent = 'Open interview room →'; button.onclick = () => setMode('interview'); }
    const weak = missionCatalog.flatMap((group) => group.items.map((item, index) => state.missions[group.lab][index] ? null : item[0])).filter(Boolean).slice(0, 5);
    el('weak-topics-list').innerHTML = (weak.length ? weak : ['Keep stretching']).map((topic) => `<span class="topic-pill">${topic}</span>`).join('');
  }
  el('reset-progress').addEventListener('click', () => { state.missions = JSON.parse(JSON.stringify(defaultState.missions)); state.practiceSeconds = 0; state.capstone = false; state.latestScore = null; saveState(); renderDashboard(); resetCapstone(); });
  window.setInterval(() => { if (!document.hidden) { state.practiceSeconds += 1; if (currentMode === 'progress') renderDashboard(); if (state.practiceSeconds % 10 === 0) saveState(); } }, 1000);

  /* Local health checks */
  const healthTargets = [{ id: 'flightlab', label: 'Flightlab', port: '4317', url: 'http://127.0.0.1:4317/api/health' }, { id: 'restcraft', label: 'RESTcraft', port: '4321', url: 'http://127.0.0.1:4321/' }, { id: 'systemforge', label: 'SystemForge', port: '4322', url: 'http://127.0.0.1:4322/' }];
  function renderHealth(items) { el('health-grid').innerHTML = items.map((item) => `<div class="health-item ${item.status === 'online' ? 'is-online' : item.status === 'offline' ? 'is-offline' : ''}"><i></i><span><strong>${item.label}</strong><small>${item.detail}</small></span></div>`).join(''); const online = items.filter((item) => item.status === 'online').length; healthSummaryText.textContent = localHost ? `${online} / 3 labs online` : 'published links ready'; }
  async function checkHealth() {
    if (!localHost) { renderHealth(healthTargets.map((item) => ({ ...item, status: 'published', detail: 'private published lab' }))); el('health-note').textContent = 'Live port checks run from the localhost hub. Published labs are private links.'; return; }
    el('health-note').textContent = 'Checking 127.0.0.1 ports…';
    renderHealth(healthTargets.map((item) => ({ ...item, status: 'checking', detail: `port ${item.port}` })));
    const results = await Promise.all(healthTargets.map(async (target) => {
      const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 1600);
      try { await fetch(target.url, { mode: 'no-cors', cache: 'no-store', signal: controller.signal }); return { ...target, status: 'online', detail: `port ${target.port} · reachable` }; }
      catch (_) { return { ...target, status: 'offline', detail: `port ${target.port} · start server` }; }
      finally { clearTimeout(timeout); }
    }));
    renderHealth(results); el('health-note').textContent = 'Last checked just now. Refresh after starting or stopping a lab.';
  }
  el('refresh-health').addEventListener('click', checkHealth);

  /* End-to-end capstone + failure injection */
  const capstoneSteps = [['Sensor emitted track', 'Synthetic drone position is normalized into the shared track schema.'], ['C2 WebSocket published', 'The operator receives a live event after authenticate → subscribe.'], ['REST adapter accepted', 'The boundary validates the payload, token, and idempotency key.'], ['Webhook queued delivery', 'A downstream subscriber receives a durable business event.'], ['System design defended', 'You can name scale, freshness, retry, and observability choices.']];
  let capstoneIndex = 0; const capstoneFaults = {};
  function capstoneLog(title, detail, kind) { const log = el('capstone-log'); const empty = log.querySelector('.empty-log'); if (empty) empty.remove(); const row = document.createElement('div'); row.className = `event-row ${kind ? `is-${kind}` : ''}`; row.innerHTML = `<time>${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</time><i></i><span><strong>${title}</strong><small>${detail}</small></span>`; log.prepend(row); }
  function updateCapstonePhrase() { const active = Object.keys(capstoneFaults).filter((key) => capstoneFaults[key]); const phrases = { token: '“I retry a refreshed credential once, then stop on repeated 401s.”', disconnect: '“Reconnect is a state machine: authenticate, resubscribe, then reconcile the gap.”', duplicate: '“The idempotency key turns a replay into a safe no-op.”', rate: '“429 is a pacing signal: honor Retry-After and use bounded backoff.”', queue: '“I give the event a freshness budget and make staleness visible.”', outage: '“The durable queue and dead-letter path preserve the event for replay.”' }; el('capstone-phrase').textContent = active.length ? phrases[active[active.length - 1]] : '“I separate transport success from application success.”'; }
  function updateCapstoneScore() { el('capstone-score').textContent = `${Math.min(capstoneIndex, 5)} / 5 stages${Object.values(capstoneFaults).filter(Boolean).length ? ` · ${Object.values(capstoneFaults).filter(Boolean).length} faults armed` : ''}`; }
  function runCapstoneStep() {
    if (capstoneIndex >= capstoneSteps.length) return;
    const index = capstoneIndex; const node = document.querySelector(`[data-node="${index}"]`); node.classList.add('is-active'); const step = capstoneSteps[index]; capstoneLog(step[0], step[1]);
    const fault = index === 0 && capstoneFaults.duplicate ? ['Duplicate detected', 'The receiver sees the same sequence twice; idempotency keeps one business effect.', 'recovery'] : index === 1 && capstoneFaults.disconnect ? ['WebSocket dropped', 'Heartbeat failed; reconnect, authenticate, resubscribe, and reconcile the gap.', 'recovery'] : index === 2 && capstoneFaults.token ? ['401 from adapter', 'The bearer token expired at the boundary.', 'fault'] : index === 3 && capstoneFaults.rate ? ['429 from subscriber', 'The downstream API asked the client to slow down.', 'fault'] : index === 3 && capstoneFaults.outage ? ['Downstream outage', 'The subscriber is unavailable; persist the event in a dead-letter queue.', 'fault'] : index === 4 && capstoneFaults.queue ? ['Queue delay', 'Freshness is outside the target budget; observability exposes the tradeoff.', 'fault'] : null;
    if (fault) { capstoneLog(fault[0], fault[1], fault[2]); if (fault[2] === 'fault') capstoneLog('Recovery recorded', fault[0] === '429 from subscriber' ? 'Wait, back off, and retry without duplicating the business effect.' : fault[0] === 'Downstream outage' ? 'Keep the event durable and replay after the dependency recovers.' : 'Make the failure visible, bounded, and testable.', 'recovery'); }
    node.classList.remove('is-active'); node.classList.add(fault && fault[2] === 'fault' ? 'is-fault' : 'is-done'); capstoneIndex += 1; updateCapstoneScore();
    if (capstoneIndex >= capstoneSteps.length) { state.capstone = true; saveState(); capstoneLog('Capstone complete', 'You traced the message and named the recovery behavior. Move to the interview room and explain one tradeoff.', 'recovery'); }
  }
  function resetCapstone() { capstoneIndex = 0; Object.keys(capstoneFaults).forEach((key) => { capstoneFaults[key] = false; }); document.querySelectorAll('[data-fault]').forEach((input) => { input.checked = false; }); document.querySelectorAll('[data-node]').forEach((node) => node.classList.remove('is-active', 'is-done', 'is-fault')); el('capstone-log').innerHTML = '<div class="empty-log">Run the first event to start the trace.</div>'; updateCapstoneScore(); updateCapstonePhrase(); }
  document.querySelectorAll('[data-fault]').forEach((input) => input.addEventListener('change', () => { capstoneFaults[input.dataset.fault] = input.checked; updateCapstonePhrase(); updateCapstoneScore(); }));
  el('capstone-next').addEventListener('click', runCapstoneStep);
  el('capstone-run-all').addEventListener('click', () => { while (capstoneIndex < capstoneSteps.length) runCapstoneStep(); });
  el('capstone-reset').addEventListener('click', resetCapstone);

  /* Mock interview room */
  let promptIndex = 0; let timerSeconds = 900; let timerId = null; let recognition = null;
  function formatTime(seconds) { return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`; }
  function renderPromptPicker() { el('prompt-picker').innerHTML = interviewPrompts.map((prompt, index) => `<button class="prompt-chip ${index === promptIndex ? 'is-active' : ''}" data-prompt="${index}" type="button">0${index + 1} · ${prompt.short}</button>`).join(''); el('prompt-picker').querySelectorAll('[data-prompt]').forEach((button) => button.addEventListener('click', () => { promptIndex = Number(button.dataset.prompt); resetInterviewTimer(); renderPromptPicker(); loadInterviewAnswer(); })); }
  function loadInterviewAnswer() { const prompt = interviewPrompts[promptIndex]; el('interview-question').textContent = prompt.question; el('interview-followup').textContent = `Follow-up: ${prompt.follow}`; const saved = state.answers[promptIndex]; el('interview-answer').value = saved ? saved.answer : ''; const scores = saved && saved.rubric ? saved.rubric : { clarity: 3, accuracy: 3, tradeoffs: 3, failure: 3 }; Object.entries(scores).forEach(([key, value]) => { const input = document.querySelector(`[data-rubric="${key}"]`); if (input) { input.value = value; el(`rubric-${key}-value`).textContent = `${value} / 5`; } }); updateRubric(); renderAnswerHistory(); }
  function resetInterviewTimer() { window.clearInterval(timerId); timerId = null; timerSeconds = 900; el('interview-timer').textContent = '15:00'; el('interview-start').textContent = 'Start timer'; }
  function toggleInterviewTimer() { if (timerId) { window.clearInterval(timerId); timerId = null; el('interview-start').textContent = 'Resume timer'; return; } el('interview-start').textContent = 'Pause timer'; timerId = window.setInterval(() => { timerSeconds -= 1; el('interview-timer').textContent = formatTime(Math.max(timerSeconds, 0)); if (timerSeconds <= 0) { resetInterviewTimer(); el('voice-status').textContent = 'Time. Save the answer, then score the explanation.'; } }, 1000); }
  function updateRubric() { const values = ['clarity', 'accuracy', 'tradeoffs', 'failure'].map((key) => Number(document.querySelector(`[data-rubric="${key}"]`).value)); const average = values.reduce((sum, value) => sum + value, 0) / values.length; el('rubric-average').textContent = `${average.toFixed(1)} / 5`; return average; }
  document.querySelectorAll('[data-rubric]').forEach((input) => input.addEventListener('input', () => { el(`rubric-${input.dataset.rubric}-value`).textContent = `${input.value} / 5`; updateRubric(); }));
  function renderAnswerHistory() { const entries = Object.entries(state.answers); el('answer-history').innerHTML = '<span class="section-kicker">SAVED ANSWERS</span>' + (entries.length ? entries.map(([index, answer]) => `<p><strong>${interviewPrompts[index].short}</strong><small>${answer.score.toFixed(1)} / 5 · ${new Date(answer.savedAt).toLocaleDateString()}</small></p>`).join('') : '<p>No answer saved yet.</p>'); }
  el('interview-start').addEventListener('click', toggleInterviewTimer);
  el('interview-next').addEventListener('click', () => { promptIndex = (promptIndex + 1) % interviewPrompts.length; resetInterviewTimer(); renderPromptPicker(); loadInterviewAnswer(); });
  el('interview-reset').addEventListener('click', () => { el('interview-answer').value = ''; resetInterviewTimer(); });
  el('save-answer').addEventListener('click', () => { const answer = el('interview-answer').value.trim(); if (!answer) { el('voice-status').textContent = 'Write or dictate an answer before saving it.'; return; } const rubric = Object.fromEntries(['clarity', 'accuracy', 'tradeoffs', 'failure'].map((key) => [key, Number(document.querySelector(`[data-rubric="${key}"]`).value)])); const score = updateRubric(); state.answers[promptIndex] = { answer, rubric, score, savedAt: Date.now() }; state.latestScore = score; saveState(); renderAnswerHistory(); el('voice-status').textContent = `Saved ${interviewPrompts[promptIndex].short} at ${score.toFixed(1)} / 5.`; });
  el('voice-answer').addEventListener('click', () => { const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition; if (!Recognition) { el('voice-status').textContent = 'Speech recognition is not available in this browser. Use the text answer box.'; return; } if (recognition) { recognition.stop(); return; } recognition = new Recognition(); recognition.continuous = true; recognition.interimResults = true; recognition.lang = 'en-US'; el('voice-answer').classList.add('is-listening'); el('voice-answer').textContent = '● Listening…'; el('voice-status').textContent = 'Speak naturally. Your words will be added to the answer box.'; recognition.onresult = (event) => { let finalText = ''; for (let index = event.resultIndex; index < event.results.length; index += 1) if (event.results[index].isFinal) finalText += event.results[index][0].transcript + ' '; if (finalText) el('interview-answer').value = `${el('interview-answer').value} ${finalText}`.trim(); }; recognition.onerror = () => { el('voice-status').textContent = 'Voice input stopped. You can continue with text.'; }; recognition.onend = () => { recognition = null; el('voice-answer').classList.remove('is-listening'); el('voice-answer').textContent = '● Use voice'; }; recognition.start(); });

  setEnvironment();
  const fromHash = location.hash.replace('#', ''); let initialLab = fromHash && labs[fromHash] ? fromHash : null;
  if (!initialLab) { try { initialLab = localStorage.getItem('interviewos-active-lab'); } catch (_) {} }
  renderDashboard(); renderPromptPicker(); loadInterviewAnswer(); updateCapstoneScore(); updateCapstonePhrase(); checkHealth(); setLab(initialLab && labs[initialLab] ? initialLab : 'flightlab', false); saveState();
  window.addEventListener('beforeunload', saveState);
})();
