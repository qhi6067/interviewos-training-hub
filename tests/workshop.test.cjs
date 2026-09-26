const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const data = require('../dist/workshop-data.js');
const core = require('../dist/workshop-core.js');

// Run the actual worker harness, not a duplicate grading implementation.
const source = fs.readFileSync(path.join(__dirname, '../dist/workshop/sandbox.js'), 'utf8');
const workerSource = source.slice(source.indexOf('  function workerMain(){'), source.indexOf("  window.addEventListener('message'"));
async function execute(q, code) {
  let result;
  const self = { postMessage: value => { if (value.type === 'result') result = value; } };
  const context = vm.createContext({ self, structuredClone });
  vm.runInContext(`${workerSource}\nworkerMain();`, context);
  await self.onmessage({ data: { ...q, code } });
  return JSON.parse(JSON.stringify(result));
}

test('workshop pass requires a complete successful run of unchanged code', () => {
  const q = data.exercises[0], state = core.parse(null, data.exercises), e = state.entries[q.id];
  const good = { tests: q.tests.map(t => ({ passed: true })) };
  assert.equal(core.grade(e, e.code, { tests: [] }, q), false);
  assert.equal(core.grade(e, e.code, { ...good, error: 'Timed out' }, q), false);
  assert.equal(core.grade(e, e.code, good, q), true);
  const snapshot = e.code; core.edit(e, 'edited');
  assert.equal(core.grade(e, snapshot, good, q), false);
  assert.equal(core.passed(e), false);
});

test('drafts round trip, malformed data recovers, and self-review requires evidence', () => {
  const q = data.exercises.find(q => q.review), state = core.parse('{broken', data.exercises), e = state.entries[q.id];
  assert.equal(core.canReview(e), false);
  e.notes = 'The empty input divides zero by zero, so return null before dividing.';
  e.checks = q.review.map(() => true);
  assert.equal(core.canReview(e), false);
  e.passedCode = e.code; e.reviewed = core.canReview(e);
  const restored = core.parse(JSON.stringify(state), data.exercises);
  assert.equal(restored.entries[q.id].reviewed, true);
  core.edit(e, 'changed'); assert.equal(e.reviewed, false);
  assert.equal(core.summary(state, data.exercises).reviewed, 0);
});

test('all JavaScript solutions pass actual worker tests; incomplete starters do not', async () => {
  for (const q of data.exercises.filter(q => q.lang === 'javascript')) {
    const result = await execute(q, q.solution);
    assert.equal(result.error, undefined, q.id);
    assert.ok(result.tests.every(t => t.passed), `${q.id}: ${JSON.stringify(result.tests)}`);
    const starter = await execute(q, q.starter);
    assert.ok(starter.error || starter.tests.some(t => !t.passed), q.id + ' must have work to do');
  }
});

test('JavaScript runner catches syntax errors and never treats NaN as null', async () => {
  const q = data.exercises.find(q => q.id === 'review-average');
  const invalid = await execute(q, 'function averageLatency(');
  assert.ok(invalid.error);
  const nan = await execute(q, 'function averageLatency() { return NaN; }');
  assert.ok(nan.tests.every(t => !t.passed));
  assert.equal(nan.tests[0].actual, '"NaN"');
});

test('solutions that modify their input fail the preservation contract', async () => {
  const q = data.exercises.find(q => q.id === 'review-logs');
  const result = await execute(q, 'function safeLog(event) { const result = {}; for (const key of ["operation","requestId","status"]) if (Object.hasOwn(event,key)) result[key]=event[key]; event.changed=true; return result; }');
  assert.ok(result.tests.every(t => !t.passed && t.actual.includes('Input was modified')));
});

test('Python solutions and flawed starters match their documented cases', () => {
  const script = `import json, sys\nfor q in json.load(sys.stdin):\n    for field in ['solution', 'starter']:\n        scope = {}\n        exec(q[field], scope)\n        outcomes = []\n        for case in q['tests']:\n            try: outcomes.append(scope[q['fn']](*case['args']) == case['expected'])\n            except Exception: outcomes.append(False)\n        assert all(outcomes) if field == 'solution' else not all(outcomes), q['id'] + field\nprint('Python cases passed')`;
  const result = spawnSync('python', ['-c', script], { input: JSON.stringify(data.exercises.filter(q => q.lang === 'python')), encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
});

test('all SQL solutions query the real seeded SQLite database', async () => {
  const SQL = await require('sql.js/dist/sql-asm.js')();
  for (const q of data.exercises.filter(q => q.lang === 'sql')) {
    const db = new SQL.Database();
    try { db.run(data.schema); assert.deepEqual(db.exec(q.solution), q.expected, q.id); }
    finally { db.close(); }
  }
});

test('six practice areas and 38 unique exercises stay reachable', () => {
  assert.equal(data.areas.length, 6); assert.equal(data.exercises.length, 38);
  assert.equal(new Set(data.exercises.map(q => q.id)).size, 38);
  for (const q of data.exercises) {
    assert.ok(data.areas.some(a => a.id === q.area));
    assert.ok(q.starter && q.solution && q.prompt && q.lesson);
    assert.equal(q.hints.length, 2);
  }
});
