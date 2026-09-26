const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const net = require('node:net');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const data = require('../dist/stacks-data.js');
const code = require('../dist/stacks-code.js');

const examples = path.join(__dirname, '../examples/rest-stacks');

test('nine stacks name their language, files, setup, syntax, and differences', () => {
  assert.equal(data.stacks.length, 9);
  assert.equal(new Set(data.stacks.map(s => s.id)).size, 9);
  for (const s of data.stacks) {
    assert.ok(s.label && s.lang && s.stack && s.role && s.summary && s.setup.lang && s.setup.code, s.id);
    assert.ok(['server', 'client'].includes(s.group), s.id);
    assert.ok(s.files.length >= 1 && s.files.every(file => typeof code[file] === 'string' && code[file].length > 50), s.id);
    assert.ok(s.syntax.length >= 6 && s.syntax.every(row => row.length === 2 && row[0] && row[1]), s.id);
    assert.ok(s.notes.length >= 2, s.id);
  }
  assert.ok(data.stacks.find(s => s.id === 'powershell').syntax.length >= 15, 'PowerShell keeps a full syntax reference');
});

test('comparison tables have one cell per column', () => {
  for (const table of [data.compare.servers, data.compare.clients]) {
    for (const row of table.rows) assert.equal(row.length, table.columns.length + 1, row[0]);
  }
  assert.equal(data.contract.length, 5);
});

test('embedded code matches the tested example files exactly', () => {
  for (const [file, text] of Object.entries(code)) {
    assert.equal(text, fs.readFileSync(path.join(examples, file), 'utf8'), `${file}: run python scripts/build-stacks.py`);
  }
  const shown = new Set(data.stacks.flatMap(s => s.files));
  assert.deepEqual([...shown].sort(), Object.keys(code).sort());
});

test('the Express sample serves the shared contract', async t => {
  const port = await new Promise(resolve => { const s = net.createServer().listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => resolve(p)); }); });
  const child = spawn(process.execPath, [path.join(examples, 'express/server.cjs')], { env: { ...process.env, PORT: String(port) } });
  t.after(() => child.kill());
  await once(child.stdout, 'data');
  const base = `http://127.0.0.1:${port}/api/tasks`;
  const json = (method, body) => ({ method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  assert.equal((await (await fetch(base)).json())[0].title, 'Practice REST requests');
  const created = await fetch(base, json('POST', { title: '  Learn stacks  ' }));
  assert.equal(created.status, 201);
  const task = await created.json();
  assert.equal(task.title, 'Learn stacks');
  assert.equal(created.headers.get('location'), `/api/tasks/${task.id}`);
  for (const title of ['', '   ', 'x'.repeat(121)]) assert.equal((await fetch(base, json('POST', { title }))).status, 400);
  assert.equal((await fetch(`${base}/${task.id}`, json('PATCH', { done: 'true' }))).status, 400);
  assert.equal((await (await fetch(`${base}/${task.id}`, json('PATCH', { done: true }))).json()).done, true);
  const deleted = await fetch(`${base}/${task.id}`, { method: 'DELETE' });
  assert.equal(deleted.status, 204);
  assert.equal(await deleted.text(), '');
  assert.equal((await fetch(`${base}/${task.id}`)).status, 404);
  assert.equal((await fetch(`${base}/999999`, { method: 'DELETE' })).status, 404);
});
