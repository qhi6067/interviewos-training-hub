(function (root) {
  'use strict';
  const text = (value, max) => typeof value === 'string' ? value.slice(0, max) : '';
  const pitchKeys = ['present', 'proof', 'bridge', 'value'];
  const whenPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

  // Rebuild saved state from known tracks and prompts only; anything else is dropped.
  function parse(raw, data) {
    let saved = {};
    try { const value = JSON.parse(raw || '{}'); if (value && typeof value === 'object' && !Array.isArray(value)) saved = value; } catch {}
    const prompts = new Map(data.tracks.flatMap(t => t.prompts.map(p => [p.id, p])));
    const track = data.tracks.some(t => t.id === saved.track) ? saved.track : data.tracks[0].id;
    const selected = Object.fromEntries(data.tracks.map(t => [t.id, t.prompts.some(p => p.id === saved.selected?.[t.id]) ? saved.selected[t.id] : t.prompts[0].id]));
    const answers = {};
    const savedAnswers = saved.answers && typeof saved.answers === 'object' ? saved.answers : {};
    for (const [id, prompt] of prompts) {
      const old = savedAnswers[id];
      if (!old || typeof old !== 'object') continue;
      answers[id] = { text: text(old.text, 6000), checks: prompt.include.map((_, i) => old.checks?.[i] === true), savedAt: Number.isFinite(old.savedAt) ? old.savedAt : null };
    }
    const pitch = Object.fromEntries(pitchKeys.map(k => [k, text(saved.pitch?.[k], 600)]));
    const interviews = (Array.isArray(saved.interviews) ? saved.interviews : [])
      .filter(i => i && typeof i === 'object' && whenPattern.test(i.when) && data.tracks.some(t => t.id === i.track) && text(i.company, 80).trim())
      .slice(0, 30)
      .map((i, n) => ({ id: text(i.id, 40) || `saved-${n}`, company: text(i.company, 80).trim(), track: i.track, when: i.when }));
    return { track, selected, answers, pitch, interviews };
  }

  const canSave = answer => answer.text.trim().length >= 40 || answer.checks.some(Boolean);
  const practiced = answer => Boolean(answer && answer.savedAt !== null);
  function summary(state, data) {
    const all = data.tracks.flatMap(t => t.prompts);
    return { total: all.length, practiced: all.filter(p => practiced(state.answers[p.id])).length };
  }

  // Upcoming interviews first (soonest first), then past ones.
  function schedule(interviews, now) {
    return interviews.map(i => ({ ...i, time: new Date(i.when).getTime() }))
      .filter(i => Number.isFinite(i.time))
      .sort((a, b) => (a.time < now) - (b.time < now) || (a.time < now ? b.time - a.time : a.time - b.time));
  }
  function countdown(time, now) {
    const minutes = Math.floor((time - now) / 60000);
    if (minutes < 0) return 'Done';
    if (minutes < 60) return `in ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `in ${hours} h`;
    const days = Math.floor(hours / 24);
    return days === 1 ? 'in 1 day' : `in ${days} days`;
  }

  // Spoken pace of about 150 words per minute.
  function pitchStats(pitch) {
    const spoken = pitchKeys.map(k => pitch[k].trim()).filter(Boolean).join(' ');
    const words = spoken ? spoken.split(/\s+/).length : 0;
    return { text: spoken, words, seconds: Math.round(words / 150 * 60) };
  }

  const api = { parse, canSave, practiced, summary, schedule, countdown, pitchStats, pitchKeys };
  if (typeof module === 'object' && module.exports) module.exports = api; else root.InterviewRolesCore = api;
})(typeof window === 'object' ? window : globalThis);
