(function () {
  'use strict';
  const { contract, stacks, compare } = window.InterviewStacksData, code = window.InterviewStackCode;
  const app = document.getElementById('stacks-app');
  if (!app) return;
  const key = 'interviewos-stacks-tab';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const langOf = path => ({ cjs: 'JavaScript', jsx: 'JavaScript (JSX)', ts: 'TypeScript', py: 'Python', java: 'Java', css: 'CSS', ps1: 'PowerShell', sh: 'Bash' }[path.split('.').pop()]);
  const tabs = [{ id: 'compare', label: 'Compare', lang: 'All stacks' }, ...stacks];
  const snippets = {};
  let selected = 'compare';
  try { const saved = localStorage.getItem(key); if (tabs.some(t => t.id === saved)) selected = saved; } catch {}

  function box(label, lang, text) {
    const id = `snippet-${Object.keys(snippets).length}`;
    snippets[id] = text;
    return `<div class="rest-code-box"><div class="rest-code-bar"><span><span class="lang-chip">${esc(lang)}</span>${esc(label)}</span><button class="quiet-button" type="button" data-copy="${id}" aria-label="Copy ${esc(label)}">Copy</button></div><pre tabindex="0" aria-label="${esc(lang)}: ${esc(label)}"><code>${esc(text)}</code></pre></div>`;
  }
  const plainRows = new Set(['Language', 'Invalid body', '4xx or 5xx']);
  const table = (caption, columns, rows, codeCells) => `<div class="stacks-table-scroll" tabindex="0"><table><caption>${esc(caption)}</caption><thead><tr>${columns.map(c => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr><th scope="row">${esc(row[0])}</th>${row.slice(1).map(cell => `<td>${codeCells && !plainRows.has(row[0]) ? `<code>${esc(cell)}</code>` : esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;

  function comparePanel() {
    return `<div class="section-kicker">SIDE BY SIDE</div><h3>The same job in every stack</h3>
      <p>Each row is one task from the contract. Open a stack’s tab for the full, runnable code.</p>
      ${table('Serving the API', ['Task', ...compare.servers.columns], compare.servers.rows, true)}
      ${table('Calling the API', ['Task', ...compare.clients.columns], compare.clients.rows, true)}
      <p class="stacks-hint">Notice the differences an interviewer may ask about: FastAPI validates for you and answers 422; fetch and requests do not throw on a 404, while PowerShell does.</p>`;
  }

  function stackPanel(s) {
    return `<div class="stacks-head"><div><div class="section-kicker">${esc(s.role)} · ${esc(s.runsOn)}</div><h3>${esc(s.label)}</h3></div><div class="stacks-badges"><span class="lang-chip is-large">${esc(s.lang)}</span><span>${esc(s.stack)}</span></div></div>
      <p>${esc(s.summary)}</p>
      <h4>Set up and run</h4>${box(s.id === 'css' ? 'import the stylesheet' : 'setup commands', s.setup.lang, s.setup.code)}
      <h4>Code · ${s.files.length === 1 ? 'one file' : `${s.files.length} files`}</h4>${s.files.map(path => box(path.replace(/^[a-z]+\//, ''), langOf(path), code[path])).join('')}
      <h4>Common ${esc(s.lang)} syntax</h4>
      <div class="stacks-table-scroll" tabindex="0"><table class="stacks-syntax"><thead><tr><th scope="col">Syntax</th><th scope="col">What it means</th></tr></thead><tbody>${s.syntax.map(([syntax, meaning]) => `<tr><td><code>${esc(syntax)}</code></td><td>${esc(meaning)}</td></tr>`).join('')}</tbody></table></div>
      <h4>Differences to notice</h4><ul>${s.notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul>`;
  }

  function render(focus = false) {
    Object.keys(snippets).forEach(k => delete snippets[k]);
    app.querySelectorAll('[role="tab"]').forEach(tab => {
      const on = tab.dataset.stack === selected;
      tab.setAttribute('aria-selected', String(on)); tab.tabIndex = on ? 0 : -1;
    });
    const panel = document.getElementById('stacks-panel');
    panel.setAttribute('aria-labelledby', `stack-tab-${selected}`);
    panel.innerHTML = (selected === 'compare' ? comparePanel() : stackPanel(stacks.find(s => s.id === selected))) + '<p class="rest-copy-status" id="stacks-copy-status" role="status" aria-live="polite"></p>';
    if (focus) document.getElementById(`stack-tab-${selected}`).focus();
  }
  function select(id, focus) {
    if (!tabs.some(t => t.id === id)) return;
    selected = id;
    try { localStorage.setItem(key, id); } catch {}
    render(focus);
  }

  const tabButton = t => `<button type="button" role="tab" id="stack-tab-${t.id}" data-stack="${t.id}" aria-controls="stacks-panel"><strong>${esc(t.label)}</strong><small>${esc(t.lang)}</small></button>`;
  app.innerHTML = `
    <article class="panel-card stacks-contract" aria-labelledby="stacks-contract-title">
      <div class="section-kicker">THE SHARED CONTRACT</div>
      <h3 id="stacks-contract-title">Five routes every sample implements</h3>
      ${table('Task API contract', ['Method', 'Path', 'Body', 'Success', 'Errors'], contract, false)}
      <p class="stacks-hint">Every server sample below was run against these checks, and the clients were run against a live server. <a href="downloads/rest-stacks.zip" download>Download all samples (.zip) ↓</a></p>
    </article>
    <div class="stacks-tabs" role="tablist" aria-label="Stacks">
      ${tabButton(tabs[0])}
      <span class="stacks-group" aria-hidden="true">Serve it</span><div class="stacks-row" role="presentation">${stacks.filter(s => s.group === 'server').map(tabButton).join('')}</div>
      <span class="stacks-group" aria-hidden="true">Call it</span><div class="stacks-row" role="presentation">${stacks.filter(s => s.group === 'client').map(tabButton).join('')}</div>
    </div>
    <article class="panel-card stacks-panel" id="stacks-panel" role="tabpanel" tabindex="0"></article>`;

  app.addEventListener('click', async event => {
    const tab = event.target.closest('[data-stack]');
    if (tab) select(tab.dataset.stack);
    const copy = event.target.closest('[data-copy]');
    if (copy) {
      const status = document.getElementById('stacks-copy-status');
      try { await navigator.clipboard.writeText(snippets[copy.dataset.copy]); status.textContent = 'Copied.'; }
      catch { status.textContent = 'Clipboard access is unavailable. Select the code and press Ctrl+C.'; }
    }
  });
  app.addEventListener('keydown', event => {
    if (!event.target.matches('[role="tab"]') || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const i = tabs.findIndex(t => t.id === event.target.dataset.stack);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (i + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    select(tabs[next].id, true);
  });
  // Links elsewhere in the hub can open a specific stack: <a href="#rest-stacks" data-stack-link="powershell">.
  document.addEventListener('click', event => {
    const link = event.target.closest('[data-stack-link]');
    if (link) select(link.dataset.stackLink);
  });

  render();
})();
