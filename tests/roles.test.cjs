const test = require('node:test');
const assert = require('node:assert/strict');
const data = require('../dist/roles-data.js');
const core = require('../dist/roles-core.js');

test('six role tracks with five complete prompts each and unique ids', () => {
  assert.equal(data.tracks.length, 6);
  const prompts = data.tracks.flatMap(t => t.prompts);
  assert.equal(prompts.length, 30);
  assert.equal(new Set(prompts.map(p => p.id)).size, 30);
  for (const t of data.tracks) {
    assert.ok(t.testing.length && t.framework.steps.length && t.ask.length && t.seconds > 0, t.id);
    for (const p of t.prompts) assert.ok(p.question && p.follow && p.short && p.include.length >= 4, p.id);
  }
});

test('saved state round trips and malformed or unknown data is dropped', () => {
  const state = core.parse('{broken', data);
  assert.equal(state.track, 'screen');
  assert.deepEqual(state.interviews, []);
  const p = data.tracks[1].prompts[0];
  const saved = {
    track: 'sa', selected: { sa: p.id, deploy: 'missing' },
    answers: { [p.id]: { text: 'x'.repeat(7000), checks: [true, 'yes'], savedAt: 5 }, unknown: { text: 'drop me' } },
    pitch: { present: 'I build integrations.', proof: 42 },
    interviews: [
      { id: 'a', company: 'Acme', track: 'sa', when: '2026-10-01T09:30' },
      { id: 'b', company: 'Bad date', track: 'sa', when: 'tomorrow' },
      { id: 'c', company: 'Bad track', track: 'chef', when: '2026-10-01T09:30' },
      { id: 'd', company: '   ', track: 'sa', when: '2026-10-01T09:30' }
    ]
  };
  const restored = core.parse(JSON.stringify(saved), data);
  assert.equal(restored.track, 'sa');
  assert.equal(restored.selected.sa, p.id);
  assert.equal(restored.selected.deploy, data.tracks[2].prompts[0].id);
  assert.equal(restored.answers[p.id].text.length, 6000);
  assert.deepEqual(restored.answers[p.id].checks, p.include.map((_, i) => i === 0));
  assert.equal(restored.answers.unknown, undefined);
  assert.deepEqual(restored.pitch, { present: 'I build integrations.', proof: '', bridge: '', value: '' });
  assert.deepEqual(restored.interviews.map(i => i.id), ['a']);
});

test('practice needs an outline or a covered point before it can be saved', () => {
  assert.equal(core.canSave({ text: 'too short', checks: [false, false] }), false);
  assert.equal(core.canSave({ text: 'Lead with the answer, then support it with one example.', checks: [false] }), true);
  assert.equal(core.canSave({ text: '', checks: [false, true] }), true);
  const state = core.parse(null, data), p = data.tracks[0].prompts[0];
  state.answers[p.id] = { text: 'draft', checks: [], savedAt: null };
  assert.equal(core.summary(state, data).practiced, 0);
  state.answers[p.id].savedAt = Date.now();
  assert.deepEqual(core.summary(state, data), { total: 30, practiced: 1 });
});

test('schedule lists upcoming interviews soonest first, then past ones', () => {
  const now = new Date('2026-09-28T12:00').getTime();
  const list = core.schedule([
    { id: 'late', when: '2026-10-06T12:00' }, { id: 'past', when: '2026-09-20T09:00' },
    { id: 'soon', when: '2026-09-29T12:00' }, { id: 'older', when: '2026-09-10T09:00' }
  ], now);
  assert.deepEqual(list.map(i => i.id), ['soon', 'late', 'past', 'older']);
  assert.equal(core.countdown(now + 25 * 60000, now), 'in 25 min');
  assert.equal(core.countdown(now + 5 * 3600000, now), 'in 5 h');
  assert.equal(core.countdown(now + 30 * 3600000, now), 'in 1 day');
  assert.equal(core.countdown(now + 8 * 86400000, now), 'in 8 days');
  assert.equal(core.countdown(now - 60000, now), 'Done');
});

test('pitch length is estimated at a speaking pace of 150 words per minute', () => {
  assert.deepEqual(core.pitchStats({ present: '', proof: ' ', bridge: '', value: '' }), { text: '', words: 0, seconds: 0 });
  const stats = core.pitchStats({ present: 'word '.repeat(100), proof: 'word '.repeat(50), bridge: '', value: '' });
  assert.equal(stats.words, 150);
  assert.equal(stats.seconds, 60);
});

test('role content stays generic: no company names in the public file', () => {
  const text = JSON.stringify(data).toLowerCase();
  for (const name of ['alloy', 'axon', 'fusus', 'samsara', 'kontakt', 'retell', 'visa', 'hackerrank']) assert.ok(!text.includes(name), name);
});
