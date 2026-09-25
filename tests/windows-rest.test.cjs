const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const { createApp } = require('../dist/downloads/windows-rest/server.cjs');

test('the downloadable REST server supports the documented workflow and errors', async t => {
  const server = createApp().listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  const json = (method, body) => ({ method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  t.after(() => new Promise(resolve => server.close(resolve)));

  await t.test('health and complete create/read/update/delete flow', async () => {
    assert.deepEqual(await (await fetch(`${base}/health`)).json(), { status: 'ok' });
    const created = await fetch(`${base}/api/tasks`, json('POST', { title: '  Practice API integrations  ' }));
    assert.equal(created.status, 201);
    const task = await created.json();
    assert.equal(task.title, 'Practice API integrations');
    assert.equal(task.done, false);
    assert.equal(created.headers.get('location'), `/api/tasks/${task.id}`);
    const path = `${base}/api/tasks/${task.id}`;
    assert.deepEqual(await (await fetch(path)).json(), task);
    const updated = await fetch(path, json('PATCH', { done: true }));
    assert.equal(updated.status, 200);
    assert.equal((await updated.json()).done, true);
    const deleted = await fetch(path, { method: 'DELETE' });
    assert.equal(deleted.status, 204);
    assert.equal(await deleted.text(), '');
    assert.equal((await fetch(path)).status, 404);
    assert.equal((await (await fetch(`${base}/api/tasks`)).json()).length, 1);
  });

  await t.test('validation, JSON parsing, content type, and route failures', async () => {
    for (const title of ['', '  ', 42, 'a'.repeat(121)]) {
      assert.equal((await fetch(`${base}/api/tasks`, json('POST', { title }))).status, 400);
    }
    assert.equal((await fetch(`${base}/api/tasks/1`, json('PATCH', { done: 'true' }))).status, 400);
    assert.equal((await fetch(`${base}/api/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{invalid' })).status, 400);
    assert.equal((await fetch(`${base}/api/tasks`, { method: 'POST', body: 'title=wrong-format' })).status, 415);
    assert.equal((await fetch(`${base}/api/tasks`, json('POST', { title: 'a'.repeat(17000) }))).status, 413);
    assert.equal((await fetch(`${base}/`)).status, 404);
    assert.equal((await fetch(`${base}/api/tasks/999999`)).status, 404);
    assert.equal((await fetch(`${base}/api/tasks/999999`, json('PATCH', { done: true }))).status, 404);
    assert.equal((await fetch(`${base}/api/tasks/999999`, { method: 'DELETE' })).status, 404);
  });

  await t.test('the PowerShell client commands work on Windows', { skip: process.platform !== 'win32' }, async () => {
    const script = `$ErrorActionPreference = 'Stop'
$baseUri = '${base}'
$body = @{ title = 'Practice API integrations' } | ConvertTo-Json
$newTask = Invoke-RestMethod -Uri "$baseUri/api/tasks" -Method Post -ContentType 'application/json' -Body $body
if ($newTask.title -ne 'Practice API integrations') { throw 'POST failed' }
$read = Invoke-RestMethod -Uri "$baseUri/api/tasks/$($newTask.id)"
if ($read.id -ne $newTask.id) { throw 'GET failed' }
$update = @{ done = $true } | ConvertTo-Json
$changed = Invoke-RestMethod -Uri "$baseUri/api/tasks/$($newTask.id)" -Method Patch -ContentType 'application/json' -Body $update
if ($changed.done -ne $true) { throw 'PATCH failed' }
Invoke-RestMethod -Uri "$baseUri/api/tasks/$($newTask.id)" -Method Delete | Out-Null
$remaining = Invoke-RestMethod -Uri "$baseUri/api/tasks"
if (@($remaining | Where-Object { $_.id -eq $newTask.id }).Count -ne 0) { throw 'DELETE failed' }
Write-Output 'PowerShell CRUD passed'`;
    const { stdout } = await promisify(execFile)('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], { timeout: 20000 });
    assert.equal(stdout.trim(), 'PowerShell CRUD passed');
  });
});
