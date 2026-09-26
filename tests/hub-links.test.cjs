const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const dist = path.join(__dirname, '../dist');
const read = name => fs.readFileSync(path.join(dist, name), 'utf8');

test('every download link in the hub points to a published file', () => {
  const sources = ['index.html', 'windows-rest.js', 'workshop.js', 'stacks.js'].map(read).join('\n');
  const links = new Set([...sources.matchAll(/(?:\.\/)?(downloads\/[\w./-]+)/g)].map(match => match[1]));
  assert.ok(links.has('downloads/windows-rest/server.cjs'));
  assert.ok(links.has('downloads/react-task-manager.zip'));
  assert.ok(links.has('downloads/rest-stacks.zip'));
  for (const link of links) assert.ok(fs.existsSync(path.join(dist, link)), `${link} is missing from dist`);
});

test('the Coding Workshop shows REST server setup before its practice areas', () => {
  const html = read('index.html');
  const workshop = html.slice(html.indexOf('id="view-workshop"'));
  const setup = workshop.indexOf('id="workshop-rest-setup"');
  assert.ok(setup > 0, 'REST setup panel is missing from the workshop view');
  assert.ok(setup < workshop.indexOf('id="workshop-areas"'), 'REST setup should appear above the practice areas');
  assert.ok(workshop.includes('id="workshop-rest-quickstart"'));
});
