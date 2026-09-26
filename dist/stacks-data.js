(function (root) {
  'use strict';
  // Code lives in examples/rest-stacks and is embedded by scripts/build-stacks.py (dist/stacks-code.js).
  const contract = [
    ['GET', '/api/tasks', 'none', '200 · array of tasks', 'none'],
    ['GET', '/api/tasks/:id', 'none', '200 · one task', '404'],
    ['POST', '/api/tasks', '{"title": "1-120 characters"}', '201 · task + Location header', '400 (422 in FastAPI)'],
    ['PATCH', '/api/tasks/:id', '{"done": true}', '200 · updated task', '400 (422 in FastAPI), 404'],
    ['DELETE', '/api/tasks/:id', 'none', '204 · empty body', '404']
  ];

  const stacks = [
    {
      id: 'express', label: 'Express', group: 'server', lang: 'JavaScript', stack: 'Node.js + Express 5', role: 'Server', runsOn: 'Node.js on your PC · port 3001',
      summary: 'The same server as the Windows REST lesson, condensed to the five routes. Express maps an HTTP method and path to a JavaScript function.',
      setup: { lang: 'PowerShell', code: "npm.cmd init -y\nnpm.cmd install express@5\nnpm.cmd pkg set 'scripts.dev=node --watch server.cjs'\nnpm.cmd run dev" },
      files: ['express/server.cjs'],
      syntax: [
        ["const express = require('express')", 'CommonJS import, used by .cjs files'],
        ['app.use(express.json())', 'Middleware runs before every route; this one parses JSON bodies into req.body'],
        ["app.get('/api/tasks/:id', (req, res) => { … })", 'A route: HTTP method + path + handler function. :id is a path parameter'],
        ['req.params.id · req.body', 'Path values (always strings) and the parsed JSON body'],
        ['res.status(201).json(task)', 'Set the status code, then send JSON; calls chain'],
        ['`/api/tasks/${task.id}`', 'Template literal: backticks insert values with ${ }'],
        ['req.body?.title', 'Optional chaining: gives undefined instead of an error when req.body is missing'],
        ['(req, res) => …  ·  ===', 'Arrow function; strict equality with no type conversion']
      ],
      notes: ['Path parameters arrive as strings, so Number(id) converts before comparing.', 'Express does not validate input: every 400 comes from your own checks.', 'The full lesson server also returns 415 for a wrong Content-Type and 413 for oversized bodies, and adds /health.']
    },
    {
      id: 'nextjs', label: 'Next.js', group: 'server', lang: 'TypeScript', stack: 'Next.js App Router (React framework)', role: 'Server and UI', runsOn: 'Node.js on your PC · port 3000',
      summary: 'Route handlers are files. The folder path is the URL, and each file exports one function per HTTP method using the web-standard Request and Response.',
      setup: { lang: 'PowerShell', code: 'npx.cmd create-next-app@latest tasks-next --ts --app --no-src-dir --import-alias "@/*" --use-npm --yes\nSet-Location tasks-next\n# Add the three files below, then:\nnpm.cmd run dev' },
      files: ['nextjs/lib/tasks.ts', 'nextjs/app/api/tasks/route.ts', 'nextjs/app/api/tasks/[id]/route.ts'],
      syntax: [
        ['export async function GET() { … }', 'One named export per HTTP method in a route.ts file'],
        ['app/api/tasks/[id]/route.ts', 'The folder path becomes the URL; [id] is a dynamic segment'],
        ['{ params }: { params: Promise<{ id: string }> }', 'TypeScript type annotation. Since Next.js 15, params is a Promise, so await it'],
        ['await request.json()', 'Read the JSON body from the web-standard Request'],
        ['Response.json(data, { status: 201, headers })', 'Send JSON with a status and headers'],
        ['new Response(null, { status: 204 })', 'A response with no body'],
        ["import { tasks } from '@/lib/tasks'", 'ES module import; @/ is the project-root alias'],
        ['type Task = { id: number; title: string }', 'A TypeScript type: checked at build time, removed from the running code']
      ],
      notes: ['The in-memory array resets on restart and is not shared between serverless instances after deployment; use a database there.', 'A Next.js app serves its React pages and its API from one origin, so its own pages need no proxy or CORS.', 'Checked with Next.js 16.3 in both next dev and next build + next start.']
    },
    {
      id: 'fastapi', label: 'FastAPI', group: 'server', lang: 'Python', stack: 'Python 3 + FastAPI + Pydantic', role: 'Server', runsOn: 'Python on your PC · port 8000',
      summary: 'Decorators register routes, and type hints plus Pydantic models validate input before your function runs. FastAPI also generates interactive docs at /docs.',
      setup: { lang: 'PowerShell', code: 'py -m pip install fastapi uvicorn\npy -m uvicorn main:app --reload --port 8000\n# Use python instead of py if the py launcher is not installed.' },
      files: ['fastapi/main.py'],
      syntax: [
        ['@app.get("/api/tasks/{task_id}")', 'Decorator: registers the function below as a route; {task_id} is a path parameter'],
        ['def get_task(task_id: int):', 'Type hint: FastAPI converts the path value to int, or returns 422'],
        ['class NewTask(BaseModel): title: str = Field(max_length=120)', 'Pydantic model: validates the JSON body'],
        ['raise HTTPException(status_code=404, detail="…")', 'Stop and return an error response'],
        ['return task', 'Dictionaries and lists become JSON automatically'],
        ['f"/api/tasks/{task[\'id\']}"', 'f-string: inserts values into text'],
        ['Indentation', 'Blocks are defined by indentation (4 spaces), not braces'],
        ['global next_id', 'Needed to reassign a module-level variable inside a function']
      ],
      notes: ['Bodies that fail the Pydantic model get 422 Unprocessable Entity automatically. A whitespace-only title passes the model and reaches your own check, which returns 400.', 'Errors look like {"detail": …}, not {"error": …}. Clients should not assume one error shape across APIs.', 'StrictBool rejects "true" sent as a string; a plain bool would accept it.', 'Open http://127.0.0.1:8000/docs to try every route from the browser.']
    },
    {
      id: 'spring', label: 'Spring Boot', group: 'server', lang: 'Java', stack: 'Java 21 + Spring Boot 4 (Spring Web)', role: 'Server', runsOn: 'The JVM on your PC · port 8080',
      summary: 'Annotations turn a class into a controller. Jackson converts JSON to Java objects and back, and ResponseEntity sets the status and headers.',
      setup: { lang: 'PowerShell', code: '# 1. At start.spring.io choose Maven, Java 21, dependency Spring Web, package com.example.tasks\n# 2. Put TaskController.java next to the generated application class, then:\n.\\mvnw.cmd spring-boot:run' },
      files: ['spring/TaskController.java'],
      syntax: [
        ['@RestController  @RequestMapping("/api/tasks")', 'Annotations: this class answers HTTP requests under a base path'],
        ['@GetMapping("/{id}") … @PathVariable int id', 'A route plus a path value converted to int'],
        ['@RequestBody NewTask body', 'Jackson converts the JSON body into a Java object'],
        ['public record NewTask(String title) {}', 'Record: a compact, immutable data class'],
        ['ResponseEntity.created(uri).body(task)', 'Status 201 with a Location header and a body'],
        ['throw new ResponseStatusException(HttpStatus.NOT_FOUND, "…")', 'Stop and return an error status'],
        ['task -> task.id == id', 'Lambda expression; == compares primitive ints'],
        ['Task task = new Task(…);', 'Types come before names; statements end with semicolons']
      ],
      notes: ['By default Jackson converts the string "true" into true. Add spring.jackson.mapper.allow-coercion-of-scalars=false to application.properties to return 400 instead (tested).', 'The default error body is {timestamp, status, error, path}. In Spring Boot 4, spring.web.error.include-message=always adds your message (tested).', 'CopyOnWriteArrayList and AtomicInteger keep the list safe when requests arrive at the same time.', 'Checked with Spring Boot 4.1.1 on Java 21.']
    },
    {
      id: 'react', label: 'React', group: 'client', lang: 'JavaScript (JSX)', stack: 'React in the browser', role: 'Client · user interface', runsOn: 'The browser · served by Vite or Next.js',
      summary: 'A component loads tasks when it first renders, keeps them in state, and calls POST, PATCH, and DELETE from user actions. It shows loading and error states instead of failing silently.',
      setup: { lang: 'PowerShell', code: '# In the React task manager starter (Coding Workshop → Guided projects):\nnpm.cmd install\nnpm.cmd run dev\n# Its Vite proxy forwards /api to your server on port 3001.' },
      files: ['clients/TaskList.jsx'],
      syntax: [
        ['const [tasks, setTasks] = useState([])', 'State: changing it re-renders the component'],
        ['useEffect(() => { … }, [])', 'Runs after the first render; the empty array means once'],
        ['fetch(url, { method, headers, body })', 'The browser’s HTTP client; resolves even for 404 and 500'],
        ['if (!response.ok) { … }', 'Check the status yourself; ok is true only for 200-299'],
        ['JSON.stringify({ title })', 'Turn an object into JSON text for the request body'],
        ['{error && <p role="alert">{error}</p>}', 'JSX: render the element only when error has a value'],
        ['tasks.map(task => <li key={task.id}>…</li>)', 'Render a list; key identifies each item'],
        ['setTasks(current => [...current, task])', 'Update from the latest state without changing the old array']
      ],
      notes: ['fetch throws only on network failure, not on 4xx or 5xx.', 'A 204 response has no body, so do not call response.json() on it.', 'In a Next.js app, put \'use client\'; on the first line, because hooks run in the browser.', 'Checked in Chromium against the Next.js API: load, add, toggle, delete, and a 400 error banner.']
    },
    {
      id: 'css', label: 'CSS', group: 'client', lang: 'CSS', stack: 'Stylesheet for API-driven UI', role: 'Client · styling', runsOn: 'The browser',
      summary: 'CSS never calls an API. It styles the states an API call creates: loading, errors, unavailable buttons, and values that come from the data.',
      setup: { lang: 'JavaScript', code: "// In TaskList.jsx or your app entry file:\nimport './styles.css';" },
      files: ['clients/styles.css'],
      syntax: [
        ['[aria-busy="true"]', 'Attribute selector: matches the loading element'],
        ['.task[data-done="true"] label', 'Class + data attribute + descendant: style from API data'],
        ['button:disabled', 'Pseudo-class: matches an element in a particular state'],
        ['--danger: #b42318;  color: var(--danger);', 'Custom property (CSS variable), defined once and reused'],
        ['@keyframes pulse { 50% { opacity: 0.45; } }', 'Defines an animation used by the animation property'],
        ['@media (prefers-reduced-motion: reduce) { … }', 'Media query: applies rules only for matching user settings']
      ],
      notes: ['React writes data-done={task.done} as "true" or "false", so CSS can match the API value.', 'Pair each visual state with ARIA (aria-busy, role="alert") so screen readers announce it too.']
    },
    {
      id: 'python', label: 'Python requests', group: 'client', lang: 'Python', stack: 'Python 3 + requests', role: 'Client · script', runsOn: 'Python on your PC',
      summary: 'A script that walks the full create, read, update, and delete flow. Integration work often starts with a script like this before any UI exists.',
      setup: { lang: 'PowerShell', code: 'py -m pip install requests\npy client.py' },
      files: ['clients/client.py'],
      syntax: [
        ['requests.get(url, timeout=5)', 'Send a GET request; always set a timeout'],
        ['requests.post(url, json=data)', 'json= converts to JSON and sets Content-Type for you'],
        ['response.status_code · response.headers["Location"]', 'Read the status and a header'],
        ['response.json()', 'Parse the JSON body into dicts and lists'],
        ['response.raise_for_status()', 'Raise an error for 4xx and 5xx responses'],
        ['True · False · None', 'Python booleans and null are capitalized']
      ],
      notes: ['requests does not raise on 4xx or 5xx unless you call raise_for_status().', 'Without timeout=, a server that never answers can block the script forever.']
    },
    {
      id: 'powershell', label: 'PowerShell', group: 'client', lang: 'PowerShell', stack: 'Windows PowerShell 5.1 or PowerShell 7', role: 'Client · terminal', runsOn: 'Windows terminal',
      summary: 'The language you type in the Windows REST lesson. PowerShell passes objects (not text) between commands, so JSON responses become objects you can read with dot notation.',
      setup: { lang: 'PowerShell', code: '# Paste the lines into PowerShell window B while the server runs in window A,\n# or save them as client.ps1 and run this once without changing your policy:\npowershell -ExecutionPolicy Bypass -File .\\client.ps1' },
      files: ['clients/client.ps1'],
      syntax: [
        ["$baseUri = 'http://127.0.0.1:3001'", 'Variables start with $'],
        ["'single'  vs  \"double $name\"", 'Single quotes are literal; double quotes expand variables'],
        ['"Task $($task.id)"', 'Subexpression: runs an expression inside a double-quoted string'],
        ["@{ title = 'Learn REST' }", 'Hashtable of key = value pairs; @( ) makes an array'],
        ['$body | ConvertTo-Json', 'The pipe | passes objects to the next command'],
        ['Verb-Noun -Name value', 'Cmdlets are named Verb-Noun and take named -Parameters'],
        ['Invoke-RestMethod -Uri $url', 'Send a request and get the JSON as objects'],
        ['Invoke-WebRequest … | Select-Object StatusCode', 'Get the full response: StatusCode, Headers, Content'],
        ["-Method Post -ContentType 'application/json' -Body $json", 'Send a JSON body'],
        ['-Headers @{ Authorization = "Bearer $token" }', 'Add request headers'],
        ['$true · $false · $null', 'Booleans and null'],
        ['-eq -ne -gt -lt -like', 'Comparison operators (not == or >)'],
        ['try { … } catch { $_ }', '$_ is the current error inside catch (and the current item in a pipeline)'],
        ["$env:PORT = '3002'", 'Environment variable for this window only'],
        ['# comment  ·  ` (backtick)', 'Comment; the backtick continues a line or escapes a character'],
        ['.\\server.cjs', '.\\ means “in the current folder”'],
        ['curl.exe · npm.cmd', 'The extension skips the curl alias and the npm.ps1 script-policy block']
      ],
      notes: ['Invoke-RestMethod and Invoke-WebRequest throw on 4xx and 5xx, so catch expected failures. PowerShell 7 also offers -SkipHttpErrorCheck and -StatusCodeVariable.', 'In Windows PowerShell 5.1, -UseBasicParsing avoids an Internet Explorer dependency in Invoke-WebRequest; PowerShell 7 ignores it.', 'Checked with PowerShell 7.6 against the Express server. Windows PowerShell 5.1 was not available to test.']
    },
    {
      id: 'curl', label: 'curl', group: 'client', lang: 'Bash + curl', stack: 'curl in Git Bash, macOS, or Linux', role: 'Client · terminal', runsOn: 'Any terminal with curl',
      summary: 'The format most API documentation uses. Each flag adds one part of the HTTP request, which makes curl a good way to read an unfamiliar API’s docs.',
      setup: { lang: 'PowerShell', code: "# In PowerShell, type curl.exe, use a backtick instead of \\ for line breaks,\n# and put JSON bodies in a file so quotes survive:\ncurl.exe -i -X POST http://127.0.0.1:3001/api/tasks -H 'Content-Type: application/json' --data-binary '@task.json'" },
      files: ['clients/curl.sh'],
      syntax: [
        ['-X PATCH', 'HTTP method (GET by default; -d switches to POST)'],
        ['-H "Content-Type: application/json"', 'Add a header'],
        ["-d '{\"done\":true}'", 'Request body'],
        ['-i', 'Include the status line and headers in the output'],
        ['-s -o /dev/null -w "%{http_code}"', 'Print only the status code'],
        ['\\ at the end of a line', 'Continue the command on the next line (Bash)'],
        ['BASE=… then "$BASE"', 'Shell variable: no spaces around =, quote when using it']
      ],
      notes: ['curl does not fail on 4xx or 5xx by default; add --fail in scripts.', 'Windows PowerShell 5.1 strips double quotes inside arguments passed to curl.exe, which breaks inline JSON; PowerShell 7.3 and later pass them correctly.']
    }
  ];

  // Side-by-side comparison rows: [task, ...one cell per column].
  const compare = {
    servers: { columns: ['Express', 'Next.js', 'FastAPI', 'Spring Boot'], rows: [
      ['Language', 'JavaScript', 'TypeScript', 'Python', 'Java'],
      ['Define GET /api/tasks', "app.get('/api/tasks', handler)", 'export async function GET() in app/api/tasks/route.ts', '@app.get("/api/tasks")', '@GetMapping in a @RestController'],
      ['Read the :id path value', 'req.params.id', '(await params).id', 'task_id: int parameter', '@PathVariable int id'],
      ['Read the JSON body', 'req.body (after express.json())', 'await request.json()', 'Pydantic model parameter', '@RequestBody NewTask body'],
      ['Reply 201 with JSON', 'res.status(201).json(task)', 'Response.json(task, { status: 201 })', 'status_code=201 and return task', 'ResponseEntity.created(uri).body(task)'],
      ['Reply 404', "res.status(404).json({ error })", 'Response.json({ error }, { status: 404 })', 'raise HTTPException(404)', 'throw new ResponseStatusException(NOT_FOUND)'],
      ['Invalid body', '400 from your check', '400 from your check', '422 automatic', '400 from your check'],
      ['Start it', 'npm.cmd run dev · :3001', 'npm.cmd run dev · :3000', 'py -m uvicorn main:app --reload · :8000', '.\\mvnw.cmd spring-boot:run · :8080']
    ] },
    clients: { columns: ['React (fetch)', 'Python requests', 'PowerShell', 'curl'], rows: [
      ['Language', 'JavaScript (JSX)', 'Python', 'PowerShell', 'Bash + curl'],
      ['GET the list', 'await fetch(url)', 'requests.get(url, timeout=5)', 'Invoke-RestMethod -Uri $url', 'curl -i "$url"'],
      ['POST JSON', "fetch(url, { method: 'POST', headers, body: JSON.stringify(data) })", 'requests.post(url, json=data)', "Invoke-RestMethod -Method Post -ContentType 'application/json' -Body ($data | ConvertTo-Json)", "curl -X POST -H \"Content-Type: application/json\" -d '{…}'"],
      ['Read the status', 'response.status', 'response.status_code', '(Invoke-WebRequest …).StatusCode', '-i or -w "%{http_code}"'],
      ['4xx or 5xx', 'No exception: check response.ok', 'No exception until raise_for_status()', 'Throws: use try/catch', 'Exit code 0 unless --fail']
    ] }
  };

  const api = { contract, stacks, compare };
  if (typeof module === 'object' && module.exports) module.exports = api; else root.InterviewStacksData = api;
})(typeof window === 'object' ? window : globalThis);
