(function () {
  'use strict';
  const { tracks, questions } = window.InterviewCodingData;
  const core = window.InterviewCodingCore;
  const key = 'interviewos-coding-v1';
  const el = id => document.getElementById(id);
  const escape = text => String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  let state;
  let storageWarning = '';
  try { state = core.parse(localStorage.getItem(key), questions); }
  catch (_) { state = core.parse(null, questions); storageWarning = 'Saved coding practice could not be read. You can practice here, but previous coding progress may be unavailable.'; }
  let track = questions.find(q => q.id === state.selected).track;
  let filter = 'all';
  let feedback = '';
  let saveFailed = false;
  function save() {
    try { localStorage.setItem(key, JSON.stringify(state)); saveFailed = false; }
    catch (_) { saveFailed = true; }
    el('coding-storage-note').textContent = saveFailed ? 'This browser could not save your changes. Keep this tab open and copy your draft before leaving.' : storageWarning || 'Drafts and progress save in this browser. No account or API key needed.';
    if (el('coding-save-state')) el('coding-save-state').textContent = saveFailed ? 'Not saved · copy your draft' : 'Saved in this browser';
    renderSummary();
  }
  function status(entry) { return entry.completed ? 'Practiced' : entry.needsReview ? 'Review next' : entry.passed ? 'Check passed' : entry.draft ? 'Draft saved' : 'Not started'; }
  function visible() { return questions.filter(q => q.track === track && (filter === 'all' || (filter === 'review' ? state.entries[q.id].needsReview : filter === 'done' ? state.entries[q.id].completed : !state.entries[q.id].completed))); }
  function renderTracks() {
    el('coding-tracks').innerHTML = tracks.map(t => {
      const done = questions.filter(q => q.track === t.id && state.entries[q.id].completed).length;
      return `<button type="button" class="coding-track ${t.id === track ? 'is-selected' : ''}" aria-pressed="${t.id === track}" data-track="${t.id}" style="--track-color:${t.color}"><span>${escape(t.tag)}</span><strong>${escape(t.name)}</strong><small>${done} / 5 practiced</small></button>`;
    }).join('');
  }
  function renderList() {
    const items = visible();
    el('coding-question-count').textContent = `${items.length} question${items.length === 1 ? '' : 's'}`;
    el('coding-question-list').innerHTML = items.length ? items.map((q) => `<button type="button" class="coding-question-link ${q.id === state.selected ? 'is-current' : ''}" ${q.id === state.selected ? 'aria-current="true"' : ''} data-question="${q.id}"><strong>${escape(q.title)}</strong><span>${escape(q.level)} · ${status(state.entries[q.id])}</span></button>`).join('') : '<p class="coding-empty">No questions in this filter. Try “All questions” or another track.</p>';
  }
  function renderSummary() {
    const s = core.summary(state, questions);
    el('coding-completed').textContent = `${s.completed} / ${s.total}`;
    el('coding-passed').textContent = String(s.passed);
    el('coding-review').textContent = String(s.review);
    el('coding-dashboard-stats').textContent = `${s.completed} of ${s.total} practiced · ${s.passed} knowledge check${s.passed === 1 ? '' : 's'} passed · ${s.review} to review`;
    el('coding-dashboard-next').textContent = s.next ? `Next: ${tracks.find(t => t.id === s.next.track).name} — ${s.next.title}` : 'All questions practiced. Revisit a track and explain the tradeoffs aloud.';
    el('coding-dashboard-topics').textContent = s.review ? `Review topics: ${tracks.filter(t => questions.some(q => q.track === t.id && state.entries[q.id].needsReview)).map(t => t.name).join(', ')}` : 'Missed knowledge checks will appear here as review topics.';
  }
  function updateCompletion() {
    const entry = state.entries[state.selected];
    const button = el('coding-complete');
    if (!button) return;
    button.disabled = !core.ready(entry) || entry.completed;
    button.textContent = entry.completed ? '✓ Practice recorded' : 'Mark practiced';
    el('coding-completion-note').textContent = entry.completed ? 'Recorded as self-reviewed practice. This is not a certification of correctness.' : 'Pass the check, write a draft, and review all three criteria to record practice.';
  }
  function renderQuestion() {
    const q = questions.find(q => q.id === state.selected);
    const entry = state.entries[q.id];
    const list = visible();
    if (!list.length) { el('coding-question').innerHTML = '<div class="coding-empty"><h3>You’re caught up with this filter.</h3><p>Choose another filter or track to keep practicing.</p></div>'; return; }
    const index = questions.filter(item => item.track === q.track).findIndex(item => item.id === q.id) + 1;
    el('coding-question').innerHTML = `
      <div class="coding-lesson-top"><span class="section-kicker">QUESTION ${index} OF 5 · ${escape(q.level)}</span><span class="coding-status">${status(entry)}</span></div>
      <h3 id="coding-question-title" tabindex="-1">${escape(q.title)}</h3>
      <p class="coding-lesson">${escape(q.lesson)}</p>
      <div class="coding-step-label">01 / READ & REASON</div><p>${escape(q.task)}</p>
      <pre class="coding-code"><code>${escape(q.code)}</code></pre>
      <fieldset class="coding-check"><legend>02 / CHECK YOUR UNDERSTANDING</legend><p>${escape(q.check)}</p>${q.options.map((option, i) => `<label class="coding-option"><input type="radio" name="coding-choice" value="${i}" ${entry.choice === i ? 'checked' : ''} /><span>${escape(option)}</span></label>`).join('')}
      <button type="button" class="secondary-button" id="coding-check-answer">Check answer</button></fieldset>
      <p id="coding-feedback" class="coding-feedback" role="status"></p>
      <details class="coding-detail"><summary>Need a hint?</summary><p>${escape(q.hint)}</p></details>
      <label class="coding-step-label" for="coding-draft">03 / WRITE YOUR ANSWER</label>
      <p class="coding-editor-note">Draft code or explain your approach. This scratchpad does not run code or automatically grade written answers.</p>
      <textarea id="coding-draft" rows="8" maxlength="20000" spellcheck="false" placeholder="Start with your approach, then code or pseudocode. Include an edge case and a tradeoff."></textarea>
      <div class="coding-save-row"><span id="coding-save-state">Saved in this browser</span><span id="coding-draft-count"></span></div>
      <details class="coding-detail" id="coding-solution"><summary>Compare with a worked answer</summary><pre class="coding-code"><code>${escape(q.solution)}</code></pre></details>
      <div class="coding-followup"><span class="coding-step-label">INTERVIEWER FOLLOW-UP</span><p>${escape(q.follow)}</p></div>
      <fieldset class="coding-review-list"><legend>04 / SELF-REVIEW YOUR EXPLANATION</legend>${q.review.map((item, i) => `<label><input type="checkbox" data-review="${i}" ${entry.reviewed[i] ? 'checked' : ''} /><span>${escape(item)}</span></label>`).join('')}</fieldset>
      <div class="coding-finish"><button type="button" class="primary-button" id="coding-complete">Mark practiced</button><button type="button" class="quiet-button" id="coding-next">Next question →</button></div>
      <p class="coding-editor-note" id="coding-completion-note"></p>
      <a class="coding-source" href="${escape(q.source[1])}" target="_blank" rel="noopener noreferrer">Read the reference: ${escape(q.source[0])} ↗</a>`;
    el('coding-draft').value = entry.draft;
    el('coding-draft-count').textContent = `${entry.draft.length.toLocaleString()} / 20,000`;
    el('coding-feedback').textContent = feedback || (entry.passed ? `Check passed. ${q.why}` : entry.needsReview ? 'This question needs another look. Read the hint and try the knowledge check again.' : 'Choose an answer, then check your reasoning.');
    el('coding-feedback').classList.toggle('is-correct', entry.passed);
    el('coding-check-answer').disabled = entry.choice === null;
    el('coding-save-state').textContent = saveFailed ? 'Not saved · copy your draft' : 'Saved in this browser';
    updateCompletion();
  }
  function render() {
    const items = visible();
    if (items.length && !items.some(q => q.id === state.selected)) state.selected = items[0].id;
    el('coding-track-intro').textContent = tracks.find(t => t.id === track).intro;
    renderTracks(); renderList(); renderQuestion(); renderSummary();
  }
  function choose(id, focus = true) {
    const question = questions.find(q => q.id === id);
    if (!question) return;
    state.selected = id; track = question.track; feedback = '';
    render(); save();
    if (focus) el('coding-question-title')?.focus({ preventScroll: true });
  }
  el('coding-tracks').addEventListener('click', event => {
    const button = event.target.closest('[data-track]'); if (!button) return;
    track = button.dataset.track; filter = 'all'; el('coding-filter').value = filter; feedback = '';
    render(); save();
    el('coding-tracks').querySelector(`[data-track="${track}"]`).focus({ preventScroll: true });
  });
  el('coding-filter').addEventListener('change', event => { filter = event.target.value; feedback = ''; render(); save(); });
  el('coding-question-list').addEventListener('click', event => { const button = event.target.closest('[data-question]'); if (button) choose(button.dataset.question); });
  el('coding-question').addEventListener('input', event => {
    if (event.target.id !== 'coding-draft') return;
    const entry = state.entries[state.selected]; entry.draft = event.target.value;
    if (!core.ready(entry)) entry.completed = false;
    el('coding-draft-count').textContent = `${entry.draft.length.toLocaleString()} / 20,000`;
    save(); updateCompletion(); renderList(); renderTracks();
    el('coding-question').querySelector('.coding-status').textContent = status(entry);
  });
  el('coding-question').addEventListener('change', event => {
    const entry = state.entries[state.selected];
    if (event.target.name === 'coding-choice') {
      core.select(entry, Number(event.target.value));
      el('coding-check-answer').disabled = false;
      el('coding-feedback').textContent = 'Answer selected. Check it to see feedback.';
      el('coding-feedback').classList.remove('is-correct');
    } else if (event.target.matches('[data-review]')) {
      entry.reviewed[Number(event.target.dataset.review)] = event.target.checked;
      if (!core.ready(entry)) entry.completed = false;
    } else return;
    save(); updateCompletion(); renderList(); renderTracks();
    el('coding-question').querySelector('.coding-status').textContent = status(entry);
  });
  el('coding-question').addEventListener('click', event => {
    const entry = state.entries[state.selected];
    const q = questions.find(q => q.id === state.selected);
    if (event.target.id === 'coding-check-answer') {
      const result = core.grade(entry, q);
      feedback = result ? `Correct. ${q.why}` : 'Not quite. Read the hint, trace the example, and try again. Your progress dashboard will flag this topic for review.';
      el('coding-feedback').textContent = feedback;
      el('coding-feedback').classList.toggle('is-correct', result === true);
      el('coding-question').querySelector('.coding-status').textContent = status(entry);
      save(); updateCompletion(); renderList(); renderTracks();
    }
    if (event.target.id === 'coding-complete') {
      core.complete(entry); save(); updateCompletion(); renderList(); renderTracks();
      el('coding-question').querySelector('.coding-status').textContent = status(entry);
    }
    if (event.target.id === 'coding-next') {
      const items = visible();
      if (!items.length) { render(); return; }
      const index = items.findIndex(item => item.id === state.selected);
      choose(items[(index + 1) % items.length].id);
      el('coding-question').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
  el('coding-dashboard-open').addEventListener('click', () => {
    const next = core.summary(state, questions).next;
    filter = 'all'; el('coding-filter').value = filter;
    if (next) choose(next.id, false);
    window.dispatchEvent(new CustomEvent('interviewos:open-mode', { detail: 'coding' }));
  });
  window.addEventListener('storage', event => {
    if (event.key !== key) return;
    try { state = core.parse(event.newValue, questions); track = questions.find(q => q.id === state.selected).track; feedback = ''; render(); }
    catch (_) { el('coding-storage-note').textContent = 'A saved update could not be read. Your current draft remains open.'; }
  });
  render();
  el('coding-storage-note').textContent = storageWarning || 'Drafts and progress save in this browser. No account or API key needed.';
})();
