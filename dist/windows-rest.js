(function () {
  'use strict';
  const root = document.getElementById('windows-rest-guide');
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const commands = {
    versions: 'node --version\nnpm.cmd --version',
    project: `$restLab = Join-Path ([Environment]::GetFolderPath('MyDocuments')) 'InterviewOS\\windows-rest-lab'
New-Item -ItemType Directory -Path $restLab -Force | Out-Null
Set-Location $restLab
npm.cmd init -y
npm.cmd install express@5
npm.cmd pkg set 'scripts.dev=node --watch server.cjs' 'scripts.start=node server.cjs'`,
    install: `npm.cmd init -y
npm.cmd install express@5
npm.cmd pkg set 'scripts.dev=node --watch server.cjs' 'scripts.start=node server.cjs'`,
    scripts: `npm.cmd pkg set 'scripts.dev=node --watch server.cjs' 'scripts.start=node server.cjs'`,
    editor: 'notepad .\\server.cjs',
    start: 'npm.cmd run dev',
    health: 'Invoke-RestMethod -Uri http://127.0.0.1:3001/health',
    tasks: 'Invoke-RestMethod -Uri http://127.0.0.1:3001/api/tasks',
    move: `Move-Item -Path (Join-Path $HOME 'Downloads\\server.cjs') -Destination .
Get-ChildItem`,
    requests: `$baseUri = 'http://127.0.0.1:3001'

# READ: list tasks (200 OK)
Invoke-RestMethod -Uri "$baseUri/api/tasks"

# CREATE: save the returned task so we can use its actual ID (201 Created)
$body = @{ title = 'Practice API integrations' } | ConvertTo-Json
$newTask = Invoke-RestMethod -Uri "$baseUri/api/tasks" -Method Post -ContentType 'application/json' -Body $body
$newTask

# READ: fetch that task (200 OK)
Invoke-RestMethod -Uri "$baseUri/api/tasks/$($newTask.id)"

# UPDATE: mark it done (200 OK)
$update = @{ done = $true } | ConvertTo-Json
Invoke-RestMethod -Uri "$baseUri/api/tasks/$($newTask.id)" -Method Patch -ContentType 'application/json' -Body $update

# DELETE: remove that task (204 No Content; no output is expected)
Invoke-RestMethod -Uri "$baseUri/api/tasks/$($newTask.id)" -Method Delete

# READ: the new task is gone; the original task remains
Invoke-RestMethod -Uri "$baseUri/api/tasks"`,
    status: 'curl.exe -i http://127.0.0.1:3001/api/tasks',
    bad: `$badBody = @{ title = '' } | ConvertTo-Json
Invoke-RestMethod -Uri http://127.0.0.1:3001/api/tasks -Method Post -ContentType 'application/json' -Body $badBody`,
    missing: 'curl.exe -i http://127.0.0.1:3001/api/tasks/999999',
    port: '$env:PORT = "3002"\nnpm.cmd run dev',
    folder: `Get-ChildItem
npm.cmd install express@5`,
    restart: `Set-Location (Join-Path ([Environment]::GetFolderPath('MyDocuments')) 'InterviewOS\\windows-rest-lab')
npm.cmd run dev`
  };
  let selected = 0, serverLoaded = false, serverError = false;
  const sourcePath = './downloads/windows-rest/server.cjs';
  const code = (id, label) => `<div class="rest-code-box"><div class="rest-code-bar"><span>${escape(label)}</span><button class="quiet-button" type="button" data-rest-copy="${id}" aria-label="Copy ${escape(label)}">Copy</button></div><pre tabindex="0" aria-label="${escape(label)}"><code>${escape(commands[id])}</code></pre></div>`;
  const folderOptions = () => `<div class="rest-options">
      <div class="rest-option"><h4>Option A · File Explorer: you choose where it lives</h4><ol>
        <li>Open <strong>File Explorer</strong> and go to where you want the project, for example Documents or <code>C:\\Users\\<em>you</em>\\Projects</code>. If OneDrive syncs Documents, a folder outside it avoids syncing thousands of library files.</li>
        <li>Right-click an empty area, choose <strong>New → Folder</strong>, name it <code>windows-rest-lab</code>, and open it.</li>
        <li>Click the address bar, type <code>powershell</code>, and press Enter. PowerShell opens inside this folder; this is <strong>window A</strong>. On Windows 11 you can also right-click inside the folder and choose <strong>Open in Terminal</strong>.</li>
        <li>Install Express and add the <code>npm run dev</code> shortcut:</li></ol>${code('install','PowerShell A · install Express and add the dev script')}</div>
      <div class="rest-option"><h4>Option B · PowerShell only: Documents\\InterviewOS\\windows-rest-lab</h4><p>Open PowerShell (window A) and paste this block. It creates the folder, moves into it, installs Express 5, and adds the <code>npm run dev</code> shortcut.</p>${code('project','PowerShell A · create the folder and install Express')}</div>
    </div>
    <p>Either way, the PowerShell prompt now ends with your folder name, for example <code>PS C:\\Users\\you\\Projects\\windows-rest-lab&gt;</code>. Run the later commands from this folder.</p>`;
  const checkpoint = text => `<div class="rest-checkpoint"><p><strong>Checkpoint:</strong> ${text}</p></div>`;
  const reference = (title, url) => `<p><a href="${url}" target="_blank" rel="noopener noreferrer">Reference: ${title} ↗</a></p>`;
  const steps = [
    { name: 'Install Node.js', title: 'Give JavaScript a place to run.', body: () => `
      <p><strong>Node.js</strong> runs your JavaScript server. <strong>npm</strong> installs libraries. <strong>Express</strong> maps HTTP requests to your code. A REST API exposes resources, such as tasks, using URLs and HTTP methods.</p>
      <div class="rest-flow" role="img" aria-label="On your Windows computer, PowerShell sends an HTTP request to Express on port 3001. Express reads or changes tasks in memory and sends a JSON response."><div><strong>PowerShell</strong><small>client · sends a request</small></div><span aria-hidden="true">⇄</span><div><strong>Node + Express</strong><small>server · port 3001</small></div><span aria-hidden="true">⇄</span><div><strong>Tasks array</strong><small>temporary in-memory data</small></div></div>
      <ol><li>Visit the <a href="https://nodejs.org/en/download" target="_blank" rel="noopener noreferrer">official Node.js download page</a>. Choose the <strong>LTS</strong> release and the Windows installer matching your PC (usually x64; use ARM64 on an ARM PC).</li><li>Run the installer with its normal Node.js, npm, and PATH options. This lesson does not require the optional native build tools.</li><li>Close and reopen <strong>PowerShell</strong> or a Windows Terminal PowerShell tab. Use a normal terminal for the lesson; administrator mode is not needed for the project commands.</li><li>Run these two commands. Each should print a version number.</li></ol>
      ${code('versions','PowerShell · check your tools')}
      <p>Already have a supported Node.js LTS installation? Use it. On a managed work computer, use your approved software installation process.</p>
      ${checkpoint('Both version commands work. Run the remaining commands on your Windows PC. Vercel hosts this guide; the practice server will run on your computer.')}
      ${reference('Node.js downloads','https://nodejs.org/en/download')}` },
    { name: 'Create the project', title: 'Make a folder and install Express.', body: () => `
      <p>Create a project folder, open PowerShell inside it, and install Express 5 there. Choose <strong>one</strong> option. Installation needs an internet connection.</p>
      ${folderOptions()}
      <p><code>npm.cmd init -y</code> creates <code>package.json</code> with defaults. <code>npm.cmd install express@5</code> installs the Express 5 library and records its dependency. <code>npm.cmd pkg set</code> adds two shortcuts to <code>package.json</code>: <code>npm run dev</code> starts the server and restarts it whenever you save <code>server.cjs</code>, and <code>npm start</code> runs it once. In Option B, <code>Set-Location</code> moves PowerShell into the new folder.</p>
      <p>You should see <code>package.json</code>, <code>package-lock.json</code>, and a <code>node_modules</code> folder. Leave them together. If you already use this folder for another project, choose a new folder name and use it consistently.</p>
      <div class="rest-note"><p>Use <strong>npm.cmd</strong> in these PowerShell commands. It runs the Windows command launcher and avoids the common “npm.ps1 cannot be loaded” issue without changing your execution policy.</p></div>
      ${checkpoint('The install finished and the PowerShell prompt ends with your project folder.')}
      ${reference('Express installation','https://expressjs.com/en/starter/installing/')}` },
    { name: 'Add server code', title: 'Turn routes into a working API.', body: () => `
      <p>In the same PowerShell window, open a new file in Notepad. Accept the create-file prompt if it appears.</p>${code('editor','PowerShell · open the server file')}
      <p>Copy the JavaScript below into Notepad and save it as <strong>server.cjs</strong> in your <strong>windows-rest-lab</strong> project folder. In Save As, choose <strong>All files</strong> and UTF-8 if offered. Check that the name is not <code>server.cjs.txt</code>. The <code>.cjs</code> extension tells Node to use CommonJS modules.</p>
      <p>Or <a href="${sourcePath}" download="server.cjs">download server.cjs</a> and move it from Downloads into that same project folder.</p>
      <div id="rest-server-code">${serverLoaded ? code('server','JavaScript · server.cjs') : serverError ? '<p>The code preview could not load. Use the download link above or reload the page.</p>' : '<p>Loading the complete server example…</p>'}</div>
      <ul><li><code>express.json()</code> parses JSON request bodies.</li><li><code>app.get()</code>, <code>app.post()</code>, <code>app.patch()</code>, and <code>app.delete()</code> define routes.</li><li><code>req</code> is the incoming request. <code>res</code> builds the response.</li><li><code>app.listen()</code> starts listening for connections. The numeric ID identifies a task.</li></ul>
      <div class="rest-note"><p>This practice server keeps tasks in memory, so they reset when it restarts. It listens only on <strong>127.0.0.1</strong>, your own computer. Keep that address for this exercise; it has no authentication or durable database.</p></div>
      ${checkpoint('server.cjs is saved next to package.json. You can explain which route reads tasks and which one creates them.')}
      ${reference('Express API reference','https://expressjs.com/en/5x/api/')}` },
    { name: 'Start the server', title: 'Keep one window for the server.', body: () => `
      <p>Back in <strong>PowerShell window A</strong>, run:</p>${code('start','PowerShell A · start the server')}
      <p>npm first prints the script it runs, <code>node --watch server.cjs</code>, then <code>REST practice server: http://127.0.0.1:3001</code>. Leave this window running. It is normal for the prompt to stay busy while the server listens. <code>npm run dev</code> is a shortcut: running <code>node .\\server.cjs</code> directly starts the same server, without the automatic restart.</p>
      <p>Open a <strong>second PowerShell window or tab (B)</strong> and run:</p>${code('health','PowerShell B · check the server')}
      <p>You should see <code>status</code> with the value <code>ok</code>. PowerShell turns JSON into an object for display. In a browser on this same computer, <a href="http://127.0.0.1:3001/health" target="_blank" rel="noopener noreferrer">open /health</a> to see <code>{"status":"ok"}</code>.</p>
      <p><strong>127.0.0.1</strong> means this computer, <strong>3001</strong> selects the listening port, and <strong>/health</strong> selects the route. There is no DNS lookup in this numeric-IP example. Typing a URL in the browser address bar sends a GET request.</p>
      ${checkpoint('Window A is running the server, and window B gets an ok response.')}
      <p>To stop: press <strong>Ctrl+C in window A</strong>. If Windows asks <code>Terminate batch job (Y/N)?</code>, type <strong>Y</strong> and press Enter. You do not need to restart after editing: watch mode restarts the server each time you save <code>server.cjs</code>, which also resets the tasks. To return another day, open your project folder in File Explorer, type <code>powershell</code> in the address bar, and run <code>npm.cmd run dev</code> again. If you used Option B, this works from any PowerShell window:</p>${code('restart','PowerShell · return to the lab (Option B folder)')}` },
    { name: 'Send REST requests', title: 'Create, read, update, and delete.', body: () => `
      <p>Run the following block in <strong>PowerShell window B</strong>, with window A still running. The <code>$newTask</code> variable keeps the real ID from the creation response, so you never have to guess it.</p>
      ${code('requests','PowerShell B · the complete CRUD exercise')}
      <div class="rest-table-scroll"><table><caption>What each request should do</caption><thead><tr><th>Request</th><th>Result</th><th>Status</th></tr></thead><tbody><tr><td>GET /api/tasks</td><td>Read the task list</td><td>200</td></tr><tr><td>POST /api/tasks</td><td>Create a task; response includes its ID and a Location header</td><td>201</td></tr><tr><td>GET /api/tasks/:id</td><td>Read one task</td><td>200</td></tr><tr><td>PATCH /api/tasks/:id</td><td>Change its done field</td><td>200</td></tr><tr><td>DELETE /api/tasks/:id</td><td>Delete it; empty response body</td><td>204</td></tr></tbody></table></div>
      <p><code>Content-Type: application/json</code> describes the request body. <code>ConvertTo-Json</code> creates valid JSON from a PowerShell object. <code>Invoke-RestMethod</code> shows parsed data; use <code>curl.exe -i</code> to inspect the status line and headers too. The <code>.exe</code> selects curl itself instead of a PowerShell alias.</p>${code('status','PowerShell B · inspect HTTP headers')}
      <h4>Try two expected failures</h4><p>An empty title should return <strong>400</strong>. PowerShell will show an error for this non-success response; that is the intended result.</p>${code('bad','PowerShell B · invalid input')}
      <p>A task ID that does not exist should return <strong>404</strong> with a JSON error.</p>${code('missing','PowerShell B · missing task')}
      ${checkpoint('You created a task, read it, changed done to true, deleted it, and recognized an expected validation failure.')}
      ${reference('PowerShell Invoke-RestMethod','https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/invoke-restmethod?view=powershell-5.1')}` },
    { name: 'Fix common errors', title: 'Find the failing layer first.', body: () => `
      <p>Start with the exact error and the window where it appeared. Change one thing, then repeat the same request.</p>
      <details><summary>“node is not recognized” or “npm.cmd is not recognized”</summary><p>Close and reopen PowerShell after installing Node.js. If it still fails, confirm Node.js was installed with its PATH option. On a managed PC, ask your IT team to check the approved installation.</p></details>
      <details><summary>“npm.ps1 cannot be loaded”</summary><p>Use <code>npm.cmd</code> as shown in the lesson. You do not need to lower PowerShell’s execution policy for these commands.</p></details>
      <details><summary>“Cannot find module express” or “Cannot find module server.cjs”</summary><p>Make sure PowerShell is in the project folder: the prompt should end with its name. If it does not, open the folder in File Explorer and type <code>powershell</code> in the address bar. <code>Get-ChildItem</code> lists its files; look for <code>server.cjs</code> and <code>package.json</code>. If the file ends in <code>.txt</code>, rename it in File Explorer with file-name extensions visible. Install Express in this folder:</p>${code('folder','PowerShell · verify the project folder')}</details>
      <details><summary>npm error Missing script: “dev”</summary><p>The <code>dev</code> shortcut is not in this folder’s <code>package.json</code>, for example if you set up the folder with an older version of this guide. From the project folder, add it:</p>${code('scripts','PowerShell A · add the dev and start scripts')}<p>Then run <code>npm.cmd run dev</code> again.</p></details>
      <details><summary>“Port 3001 is busy” / EADDRINUSE</summary><p>A server may already be running in another window. In watch mode the message is followed by “Waiting for file changes before restarting”; press Ctrl+C in this window first. Then stop your earlier server with Ctrl+C, or choose another port:</p>${code('port','PowerShell A · use another port')}<p>Then change <code>3001</code> to <code>3002</code> in every test URL and in <code>$baseUri</code>. The environment variable applies to this terminal session.</p></details>
      <details><summary>Connection refused / unable to connect</summary><p>Check that window A still shows the running server, use the printed port, and test <code>/health</code> from window B on the same PC. Closing window A stops the server. A loopback-only server will not be reachable from another computer or phone; no inbound firewall rule is needed for this local lesson.</p></details>
      <details><summary>400, 404, 413, or 415</summary><p><strong>400:</strong> inspect the JSON and validation message. <strong>404:</strong> check the route, method, and task ID; the bare <code>/</code> path is not defined. <strong>413:</strong> keep the JSON body under 16 KB. <strong>415:</strong> send <code>-ContentType 'application/json'</code> for POST and PATCH.</p></details>
      <details><summary>The API works in PowerShell but my React page reports CORS</summary><p>A browser enforces origin rules; PowerShell does not. A page on port 3000 and an API on port 3001 have different origins. When adding a frontend, use a development proxy or explicitly allow its intended origin and required methods/headers. This lesson’s PowerShell flow needs no CORS setup. CORS is not authentication.</p></details>
      <details><summary>My tasks disappeared after restarting</summary><p>Expected: the tasks array lives only in server memory. A database supplies persistence. The starter task and ID sequence are recreated each time the process starts.</p></details>
      ${checkpoint('You can distinguish a connection failure from an HTTP error response.')}` },
    { name: 'Explain it aloud', title: 'Turn the exercise into an interview answer.', body: () => `
      <p>Spend 60–90 seconds explaining the path from client to response. Name the resource, request, validation, state change, and failure behavior.</p>
      <div class="rest-checkpoint"><p>“I built a local task API with Node.js and Express. The client sends HTTP requests to resource URLs. Express parses the JSON and routes by method and path. I validate input, update an in-memory collection, and return JSON with a meaningful status code. I tested CRUD, invalid input, and missing IDs from PowerShell.”</p></div>
      <h4>Questions to rehearse</h4><ol><li>Why does POST return 201 while DELETE returns 204?</li><li>How does PATCH differ from PUT? Our PATCH changes one field; PUT generally replaces the resource representation.</li><li>What happens if the server restarts? How would a database change that?</li><li>If a POST response is lost, could a retry create a duplicate task? How would an idempotency key help?</li><li>Why can a REST API keep database state even though REST requests are stateless? Each request should carry the context needed to process it; resource data can still persist.</li></ol>
      <h4>Where the frameworks fit</h4><p><strong>JavaScript</strong> is the language, <strong>Node.js</strong> runs it on the server, and <strong>Express</strong> provides routing and middleware. <strong>React</strong> would build the interface. <strong>Next.js</strong> can combine a React interface with server routes. A <strong>Java / Spring Boot</strong> service could expose the same HTTP contract using a different implementation.</p>
      <p>For a shared production service, plan durable storage, authentication and authorization, HTTPS, configuration, logging, and a deployment process. The learning server’s local address and in-memory state are deliberate shortcuts for this exercise.</p>
      ${checkpoint('You can demonstrate the API and explain one limitation, one failure case, and one next improvement.')}
      <p><a href="#workshop">Connect a React app in the Coding Workshop →</a> &nbsp; <a href="#coding">Continue with coding questions →</a> &nbsp; <a href="#systemforge">Explore the system-design diagrams →</a></p>` }
  ];
  root.innerHTML = `<div class="rest-setup-layout"><aside class="panel-card rest-setup-nav"><div class="section-kicker">YOUR SETUP PATH</div><p>Seven small steps. Copy commands into PowerShell; copy JavaScript into the server file.</p><nav class="rest-step-links" aria-label="Windows REST setup steps">${steps.map((s,i)=>`<button type="button" data-rest-step="${i}" ${i===0?'aria-current="step"':''}><span>${String(i+1).padStart(2,'0')}</span>${s.name}</button>`).join('')}</nav></aside><article class="panel-card rest-setup-card" id="rest-step-content" aria-labelledby="rest-step-title"></article></div>`;
  function render(focus = false) {
    const step = steps[selected];
    root.querySelectorAll('[data-rest-step]').forEach((button,i)=>{ if(i===selected) button.setAttribute('aria-current','step'); else button.removeAttribute('aria-current'); });
    document.getElementById('rest-step-content').innerHTML = `<div class="section-kicker">STEP ${selected+1} OF ${steps.length}</div><h3 id="rest-step-title" tabindex="-1">${step.title}</h3>${step.body()}<p class="rest-copy-status" id="rest-copy-status" role="status" aria-live="polite"></p><div class="rest-setup-actions"><button class="secondary-button" type="button" data-rest-move="-1" ${selected===0?'disabled':''}>← Previous step</button><button class="primary-button" type="button" data-rest-move="1" ${selected===steps.length-1?'disabled':''}>Next step →</button></div>`;
    if(focus) { document.getElementById('rest-step-title').focus({preventScroll:true}); document.getElementById('rest-step-content').scrollIntoView({block:'start',behavior:'smooth'}); }
  }
  async function copyCommand(id, status) {
    try { await navigator.clipboard.writeText(commands[id]); status.textContent='Copied. Paste into '+(id==='server'?'Notepad, then save server.cjs.':'PowerShell on your Windows computer.'); }
    catch (_) { status.textContent='Clipboard access is unavailable. Select the code in the box and copy it manually with Ctrl+C.'; }
  }
  root.addEventListener('click', async event => {
    const step = event.target.closest('[data-rest-step]');
    const move = event.target.closest('[data-rest-move]');
    if(step || move) { selected = step ? Number(step.dataset.restStep) : Math.max(0,Math.min(steps.length-1,selected+Number(move.dataset.restMove))); render(true); }
    const copy = event.target.closest('[data-rest-copy]');
    if(copy) await copyCommand(copy.dataset.restCopy, document.getElementById('rest-copy-status'));
  });
  render();

  // Coding Workshop quick-start: the same commands, condensed to reach a running server quickly.
  const setup = document.getElementById('workshop-rest-setup'), quick = document.getElementById('workshop-rest-quickstart');
  if (setup && quick) {
    const setupKey = 'interviewos-rest-setup';
    try { if (localStorage.getItem(setupKey) === 'closed') setup.open = false; } catch (_) {}
    setup.addEventListener('toggle', () => { try { localStorage.setItem(setupKey, setup.open ? 'open' : 'closed'); } catch (_) {} });
    quick.innerHTML = `
      <p>The Guided projects React app sends real HTTP requests to a small Express API on your PC. Set it up once in PowerShell. The server listens only on <strong>127.0.0.1:3001</strong> (this computer), has no login, and keeps tasks in memory, so they reset when it restarts.</p>
      <div class="rest-quick-downloads"><a class="primary-button" href="${sourcePath}" download="server.cjs">Download server.cjs starter ↓</a><a class="secondary-button" href="downloads/react-task-manager.zip" download>Download React task manager (.zip) ↓</a></div>
      <ol class="rest-quick-steps">
        <li><h4>Install Node.js LTS</h4><p>Get the <strong>LTS</strong> Windows installer from the <a href="https://nodejs.org/en/download" target="_blank" rel="noopener noreferrer">official Node.js download page ↗</a> and keep its default options. Close and reopen PowerShell, then check that both commands print a version:</p>${code('versions','PowerShell · check your tools')}</li>
        <li><h4>Create the project folder and install Express</h4><p>Pick one option. Both leave <strong>PowerShell window A</strong> open inside the project folder. Installation needs internet access.</p>${folderOptions()}<p>Type <code>npm.cmd</code>, not <code>npm</code>. It avoids the “npm.ps1 cannot be loaded” error without changing your execution policy. The last line adds an <code>npm run dev</code> shortcut that starts the server.</p></li>
        <li><h4>Add the starter server</h4><p><a href="${sourcePath}" download="server.cjs">Download server.cjs</a>, then, still in window A, move it from Downloads into the project folder:</p>${code('move','PowerShell A · move the starter into the project')}<p>The list should show <code>server.cjs</code>, <code>package.json</code>, and <code>node_modules</code>. If your browser saved the file elsewhere or named it <code>server (1).cjs</code>, drag it into the folder in File Explorer and rename it to <code>server.cjs</code>.</p></li>
        <li><h4>Start the server</h4>${code('start','PowerShell A · start the server')}<p>npm prints the script it runs, then <code>REST practice server: http://127.0.0.1:3001</code>. Leave window A open while you practice; saving <code>server.cjs</code> restarts the server automatically. Press <strong>Ctrl+C</strong> there to stop it, and type <strong>Y</strong> if asked “Terminate batch job?”.</p></li>
        <li><h4>Test it from a second window</h4><p>Open <strong>PowerShell window B</strong> and run each command:</p>${code('health','PowerShell B · health check')}${code('tasks','PowerShell B · list tasks')}<p>You should see <code>ok</code> under <code>status</code>, then one starter task, <em>Practice REST requests</em>. Your REST server is ready.</p></li>
      </ol>
      <p class="rest-copy-status" id="workshop-rest-copy-status" role="status" aria-live="polite"></p>
      <div class="rest-quick-actions"><button class="primary-button" type="button" data-rest-continue>Server running · open Guided projects →</button><a href="#windows-rest" data-rest-open-step="4">Practice full CRUD requests →</a><a href="#windows-rest" data-rest-open-step="5">Fix a Windows error →</a></div>
      <details class="rest-quick-return"><summary>Coming back another day? Restart the server</summary><p>Open your project folder in File Explorer, type <code>powershell</code> in the address bar, and run <code>npm.cmd run dev</code>. If you used Option B, this works from any PowerShell window:</p>${code('restart','PowerShell A · return to the lab (Option B folder)')}</details>`;
    quick.addEventListener('click', async event => {
      const guideLink = event.target.closest('[data-rest-open-step]');
      if (guideLink) { selected = Number(guideLink.dataset.restOpenStep); render(); }
      if (event.target.closest('[data-rest-continue]')) {
        setup.open = false;
        document.querySelector('#workshop-areas [data-area="projects"]')?.click();
        document.getElementById('workshop-areas').scrollIntoView({block:'start',behavior:'smooth'});
      }
      const copy = event.target.closest('[data-rest-copy]');
      if (copy) await copyCommand(copy.dataset.restCopy, document.getElementById('workshop-rest-copy-status'));
    });
  }
  fetch(sourcePath).then(response=>{if(!response.ok)throw new Error('Server example unavailable');return response.text();}).then(text=>{
    if(!text.includes('function createApp()'))throw new Error('Invalid server example');
    commands.server=text;serverLoaded=true;
    if(selected===2) document.getElementById('rest-server-code').innerHTML=code('server','JavaScript · server.cjs');
  }).catch(()=>{serverError=true;if(selected===2)document.getElementById('rest-server-code').innerHTML='<p>The code preview could not load. Use the download link above or reload the page.</p>';});
})();
