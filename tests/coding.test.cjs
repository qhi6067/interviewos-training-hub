const test = require('node:test');
const assert = require('node:assert/strict');
const { tracks, questions } = require('../dist/coding-data.js');
const core = require('../dist/coding-core.js');

test('all six tracks have five complete, uniquely identified exercises', () => {
  assert.equal(tracks.length, 6);
  assert.equal(questions.length, 30);
  assert.equal(new Set(questions.map(q => q.id)).size, 30);
  for (const track of tracks) assert.equal(questions.filter(q => q.track === track.id).length, 5);
  for (const q of questions) {
    assert.ok(tracks.some(t => t.id === q.track));
    for (const field of ['title', 'level', 'lesson', 'task', 'code', 'check', 'why', 'hint', 'solution', 'follow']) assert.ok(q[field].trim(), `${q.id}: ${field}`);
    assert.equal(new Set(q.options).size, 3);
    assert.ok(q.correct >= 0 && q.correct < q.options.length);
    assert.equal(q.review.length, 3);
    assert.ok(q.source[0] && q.source[1].startsWith('https://'));
  }
});

test('wrong answers recommend review; a retry can pass without claiming completion', () => {
  const state = core.parse(null, questions), q = questions[0], e = state.entries[q.id];
  assert.equal(core.grade(e, q), null);
  core.select(e, (q.correct + 1) % 3);
  assert.equal(core.grade(e, q), false);
  assert.equal(core.summary(state, questions).review, 1);
  assert.equal(core.summary(state, questions).next.id, q.id);
  core.select(e, q.correct);
  assert.equal(core.grade(e, q), true);
  assert.equal(core.summary(state, questions).review, 0);
  assert.equal(core.summary(state, questions).passed, 1);
  assert.equal(e.completed, false);
  assert.equal(e.attempts, 2);
});

test('practice requires a passed check, a nonempty draft, and all self-review criteria', () => {
  const state = core.parse(null, questions), q = questions[0], e = state.entries[q.id];
  e.draft = 'My original answer'; e.reviewed = [true, true, true];
  assert.equal(core.complete(e), false);
  core.select(e, q.correct); core.grade(e, q);
  e.draft = '  ';
  assert.equal(core.complete(e), false);
  e.draft = 'return [...new Set(ids)];'; e.reviewed[1] = false;
  assert.equal(core.complete(e), false);
  e.reviewed[1] = true;
  assert.equal(core.complete(e), true);
  assert.equal(core.summary(state, questions).completed, 1);
  core.select(e, (q.correct + 1) % 3);
  assert.equal(e.completed, false);
  assert.equal(e.passed, false);
});

test('reload preserves independent drafts, selection, and valid completed practice', () => {
  const state = core.parse(null, questions), q = questions[0];
  state.entries[q.id].draft = '<script>literal draft</script>\nconst x = 0;';
  state.entries[questions[5].id].draft = 'A different answer';
  state.selected = questions[5].id;
  const e = state.entries[q.id]; core.select(e, q.correct); core.grade(e, q);
  e.reviewed = [true, true, true]; core.complete(e);
  const restored = core.parse(JSON.stringify(state), questions);
  assert.deepEqual(restored, state);
});

test('malformed saved data cannot fabricate completion or break question navigation', () => {
  assert.throws(() => core.parse('{broken', questions));
  assert.throws(() => core.parse('[]', questions));
  const q = questions[0];
  const restored = core.parse(JSON.stringify({ selected: 'missing', entries: { [q.id]: { choice: 999, draft: {}, passed: true, completed: true, reviewed: true, attempts: -2 } } }), questions);
  assert.equal(restored.selected, q.id);
  assert.equal(restored.entries[q.id].choice, null);
  assert.equal(restored.entries[q.id].draft, '');
  assert.equal(restored.entries[q.id].passed, false);
  assert.equal(restored.entries[q.id].completed, false);
  assert.equal(core.summary(restored, questions).completed, 0);
});

test('review recommendation takes priority over untouched exercises', () => {
  const state = core.parse(null, questions), q = questions.at(-1), e = state.entries[q.id];
  core.select(e, (q.correct + 1) % 3); core.grade(e, q);
  assert.equal(core.summary(state, questions).next.id, q.id);
});
