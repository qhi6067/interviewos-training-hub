(function (root) {
  'use strict';
  const blank = () => ({ draft: '', choice: null, attempts: 0, passed: false, needsReview: false, reviewed: [false, false, false], completed: false });
  function parse(raw, questions) {
    const saved = raw ? JSON.parse(raw) : {};
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) throw new Error('Invalid saved practice');
    const entries = {};
    for (const question of questions) {
      const old = saved.entries?.[question.id];
      const entry = blank();
      if (old && typeof old === 'object') {
        entry.draft = typeof old.draft === 'string' ? old.draft.slice(0, 20000) : '';
        entry.choice = Number.isInteger(old.choice) && old.choice >= 0 && old.choice < question.options.length ? old.choice : null;
        entry.attempts = Number.isSafeInteger(old.attempts) && old.attempts > 0 ? old.attempts : 0;
        entry.passed = old.passed === true && entry.choice === question.correct && entry.attempts > 0;
        entry.needsReview = old.needsReview === true && !entry.passed;
        entry.reviewed = entry.reviewed.map((_, i) => old.reviewed?.[i] === true);
        entry.completed = old.completed === true && ready(entry);
      }
      entries[question.id] = entry;
    }
    return { version: 1, selected: questions.some(q => q.id === saved.selected) ? saved.selected : questions[0].id, entries };
  }
  function ready(entry) { return entry.passed && entry.draft.trim().length > 0 && entry.reviewed.every(Boolean); }
  function select(entry, choice) {
    if (entry.choice !== choice) { entry.choice = choice; entry.passed = false; entry.completed = false; }
  }
  function grade(entry, question) {
    if (!Number.isInteger(entry.choice) || entry.choice < 0 || entry.choice >= question.options.length) return null;
    entry.attempts++;
    entry.passed = entry.choice === question.correct;
    entry.needsReview = !entry.passed;
    if (!entry.passed) entry.completed = false;
    return entry.passed;
  }
  function complete(entry) { entry.completed = ready(entry); return entry.completed; }
  function summary(state, questions) {
    const completed = questions.filter(q => state.entries[q.id].completed).length;
    const passed = questions.filter(q => state.entries[q.id].passed).length;
    const review = questions.filter(q => state.entries[q.id].needsReview).length;
    const next = questions.find(q => state.entries[q.id].needsReview) || questions.find(q => !state.entries[q.id].completed) || null;
    return { completed, passed, review, total: questions.length, next };
  }
  const api = { blank, parse, ready, select, grade, complete, summary };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.InterviewCodingCore = api;
})(typeof window === 'object' ? window : globalThis);
