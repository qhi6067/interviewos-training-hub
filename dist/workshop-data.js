(function(root){
  'use strict';
  const c=(name,args,expected)=>({name,args,expected});
  const areas=[
    {id:'run',title:'Run & Test',description:'Build a function, run it, and compare real results. Start with JavaScript or Python.'},
    {id:'debug',title:'Debugging',description:'Run the broken starter first. Find a failing case, fix the cause, and explain the change.'},
    {id:'projects',title:'Guided projects',description:'Complete three milestones for a React task manager, then connect the downloaded app to your Windows REST server. Set up that server with the REST quick-start above.'},
    {id:'sql',title:'SQL playground',description:'Query a fresh SQLite database of devices and API events. Inspect its tables, then solve each query.'},
    {id:'assess',title:'Timed assessment',description:'Online-assessment style problems: arrays, hash maps, sliding windows, graphs, and two practical data and tool-call tasks. Start a timed round to practice under pressure; hints and worked solutions stay hidden until it ends.'},
    {id:'review',title:'AI code review',description:'Review deliberately flawed, AI-style sample code. Test your correction and self-review your explanation. No live AI grader is used.'}
  ];
  const schema=`CREATE TABLE devices (id INTEGER PRIMARY KEY, name TEXT, region TEXT);
CREATE TABLE events (id INTEGER PRIMARY KEY, device_id INTEGER, event_key TEXT, status INTEGER, latency_ms INTEGER);
INSERT INTO devices VALUES (1,'Scout','Austin'),(2,'Relay','Austin'),(3,'Beacon','Dallas'),(4,'Spare','Austin');
INSERT INTO events VALUES (1,1,'a',200,80),(2,1,'b',500,350),(3,2,'c',200,120),(4,2,'c',200,150),(5,3,'d',429,250),(6,3,'e',200,100);`;
  const exercises=[
    {id:'js-total',area:'run',lang:'javascript',title:'01 · Variables: calculate a total',fn:'totalCost',level:'Start here',
      lesson:'A function receives inputs and returns a result. Keep arithmetic numeric; a string such as "4" is different from the number 4.',
      prompt:'Return price × quantity. Inputs are nonnegative numbers. A quantity of zero must cost zero.',
      starter:'function totalCost(price, quantity) {\n  // Return the total.\n  return 0;\n}',solution:'function totalCost(price, quantity) {\n  return price * quantity;\n}',
      hints:['Use the multiplication operator: *.','Return the expression, not a string describing it.'],explain:'Multiplying the two inputs also handles zero without a special case. This takes constant time and space.',
      tests:[c('Three items',[4,3],12),c('Zero quantity',[7,0],0),c('Decimal price',[2.5,4],10)]},
    {id:'js-condition',area:'run',lang:'javascript',title:'02 · Conditions: label an HTTP status',fn:'statusGroup',level:'Start here',
      lesson:'Conditions select a path. Check boundaries deliberately: 299 is successful, but 300 is not in the success range.',
      prompt:'For an integer status from 100 to 599, return "success" for 200–299, "client error" for 400–499, "server error" for 500–599, and "other" otherwise.',
      starter:'function statusGroup(status) {\n  return "other";\n}',solution:'function statusGroup(status) {\n  if (status >= 200 && status < 300) return "success";\n  if (status >= 400 && status < 500) return "client error";\n  if (status >= 500) return "server error";\n  return "other";\n}',
      hints:['Use && when both boundaries must hold.','Test 299 and 300 to catch an off-by-one boundary.'],explain:'The ranges are explicit and non-overlapping. Naming the category is different from deciding whether retrying is safe.',tests:[c('OK',[200],'success'),c('Upper success boundary',[299],'success'),c('Redirect',[300],'other'),c('Not found',[404],'client error'),c('Gateway error',[502],'server error')]},
    {id:'js-loop',area:'run',lang:'javascript',title:'03 · Loops: sum response times',fn:'sumLatencies',level:'Start here',
      lesson:'An accumulator stores a running total. A loop visits each input once; an empty list should leave the total at zero.',prompt:'Return the sum of an array of nonnegative latency numbers.',
      starter:'function sumLatencies(values) {\n  let total = 0;\n  // Visit each value.\n  return total;\n}',solution:'function sumLatencies(values) {\n  let total = 0;\n  for (const value of values) total += value;\n  return total;\n}',hints:['for...of gives you each value in the array.','Add each value to total; return after the loop.'],explain:'One pass gives O(n) time and O(1) extra space. The empty input returns the additive identity, zero.',tests:[c('Several requests',[[80,120,50]],250),c('Empty', [[]],0),c('Zero is valid',[[0,4]],4)]},
    {id:'js-array',area:'run',lang:'javascript',title:'04 · Arrays: deduplicate event IDs',fn:'uniqueIds',level:'Build confidence',
      lesson:'A Set keeps unique values in insertion order. Primitive event IDs can be deduplicated without changing their first-seen order.',prompt:'Return unique string IDs in first-seen order. Return an array.',
      starter:'function uniqueIds(ids) {\n  return ids;\n}',solution:'function uniqueIds(ids) {\n  return [...new Set(ids)];\n}',hints:['A Set removes repeated primitive values.','Spread the Set back into an array.'],explain:'This uses extra memory for the seen IDs. For objects, choose an identity field instead of relying on object equality.',tests:[c('Duplicates',[['a','b','a','c']],['a','b','c']),c('Empty',[[]],[]),c('Do not sort',[['z','a','z']],['z','a'])]},
    {id:'js-object',area:'run',lang:'javascript',title:'05 · Objects: count event types',fn:'countTypes',level:'Build confidence',
      lesson:'Objects map keys to values. Increment one counter per type and initialize missing counters to zero.',prompt:'Count the strings "track", "heartbeat", and "alert" in an array. Return an object containing only types present in the input.',
      starter:'function countTypes(types) {\n  const counts = {};\n  return counts;\n}',solution:'function countTypes(types) {\n  const counts = {};\n  for (const type of types) counts[type] = (counts[type] ?? 0) + 1;\n  return counts;\n}',hints:['Look up counts[type] for the current total.','?? 0 supplies a starting value when a key is missing.'],explain:'The input contract limits the possible keys. For arbitrary untrusted strings, consider a Map or a null-prototype object.',tests:[c('Mixed types',[['track','alert','track']],{track:2,alert:1}),c('Empty',[[]],{}),c('One type',[['heartbeat','heartbeat']],{heartbeat:2})]},
    {id:'js-api',area:'run',lang:'javascript',title:'06 · Async: read an API response',fn:'readTaskCount',level:'Build confidence',
      lesson:'fetch resolves to a response, and response.json() is asynchronous too. Check response.ok before treating a body as successful data.',prompt:'Use the supplied fetch fixture. Return the task-array length on success, or -1 for a non-2xx response. Fixture URLs are /api/tasks (two tasks), /api/empty, and /api/fail (503).',
      starter:'async function readTaskCount(url) {\n  // Await the response and JSON.\n  return 0;\n}',solution:'async function readTaskCount(url) {\n  const response = await fetch(url);\n  if (!response.ok) return -1;\n  const tasks = await response.json();\n  return tasks.length;\n}',hints:['await fetch(url), then check response.ok.','await response.json() returns the actual array.'],explain:'HTTP failure is a response, not automatically a rejected fetch promise. These fixture requests stay inside the exercise.',tests:[c('Two tasks',['/api/tasks'],2),c('Empty list',['/api/empty'],0),c('Service error',['/api/fail'],-1)]},
    {id:'py-condition',area:'run',lang:'python',title:'Python 01 · Conditions: choose a label',fn:'battery_label',level:'Start here',
      lesson:'Python uses indentation to group code. A return statement gives the caller the function result.',prompt:'Return "low" when battery is below 20, otherwise "ready". Input is a number from 0 to 100.',starter:'def battery_label(battery):\n    return "ready"',solution:'def battery_label(battery):\n    if battery < 20:\n        return "low"\n    return "ready"',hints:['Use if battery < 20: with a colon.','Indent the low-battery return under the condition.'],explain:'Testing 19 and 20 establishes the boundary clearly.',tests:[c('Empty battery',[0],'low'),c('Just below boundary',[19],'low'),c('At boundary',[20],'ready'),c('Full battery',[100],'ready')]},
    {id:'py-loop',area:'run',lang:'python',title:'Python 02 · Loops: total events',fn:'total_events',level:'Start here',
      lesson:'A for loop visits each item. Start the accumulator before the loop and return after all items are processed.',prompt:'Return the sum of a list of nonnegative integer event counts.',starter:'def total_events(counts):\n    total = 0\n    return total',solution:'def total_events(counts):\n    total = 0\n    for count in counts:\n        total += count\n    return total',hints:['Use for count in counts:.','total += count adds to the running total.'],explain:'The loop is O(n); sum(counts) is a shorter built-in alternative.',tests:[c('Several batches',[[2,5,3]],10),c('Empty',[[]],0),c('Zeros',[[0,0,4]],4)]},
    {id:'py-list',area:'run',lang:'python',title:'Python 03 · Lists: find slow requests',fn:'slow_requests',level:'Build confidence',
      lesson:'A list comprehension combines iteration and filtering. The comparison defines which boundary values count.',prompt:'Return values strictly greater than the supplied threshold, preserving order.',starter:'def slow_requests(values, threshold):\n    return values',solution:'def slow_requests(values, threshold):\n    return [value for value in values if value > threshold]',hints:['Keep a value only if value > threshold.','A value equal to the threshold must be excluded.'],explain:'The filter takes O(n) time and stores the matching values in a new list.',tests:[c('Mixed latencies',[[10,200,100,250],100],[200,250]),c('Boundary',[[100],100],[]),c('Empty',[[],5],[])]},
    {id:'py-dict',area:'run',lang:'python',title:'Python 04 · Dictionaries: count statuses',fn:'count_statuses',level:'Build confidence',
      lesson:'dict.get(key, default) returns a fallback when the key is absent. JSON object keys are strings, so use string status labels in the result.',prompt:'Count each numeric status in a list. Return a dictionary with string keys, for example {"200": 2}.',starter:'def count_statuses(statuses):\n    return {}',solution:'def count_statuses(statuses):\n    counts = {}\n    for status in statuses:\n        key = str(status)\n        counts[key] = counts.get(key, 0) + 1\n    return counts',hints:['str(status) creates the required key.','Use counts.get(key, 0) + 1.'],explain:'This preserves zero counts correctly and returns an empty dictionary for no events.',tests:[c('Mixed results',[[200,500,200]],{'200':2,'500':1}),c('Empty',[[]],{}),c('Throttled',[[429,429]],{'429':2})]},
    {id:'bug-loop',area:'debug',lang:'javascript',title:'The last array item breaks the total',fn:'sum',level:'Start here',lesson:'Array indices run from zero through length minus one. Reading the element at length produces undefined.',prompt:'Fix the total without changing the function name. First run the starter to see the failure.',starter:'function sum(values) {\n  let total = 0;\n  for (let i = 0; i <= values.length; i++) {\n    total += values[i];\n  }\n  return total;\n}',solution:'function sum(values) {\n  let total = 0;\n  for (let i = 0; i < values.length; i++) total += values[i];\n  return total;\n}',hints:['Which index is one beyond the last item?','Change the loop boundary from <= to <.'],explain:'Adding undefined produces NaN. The empty array exposes the same boundary mistake.',tests:[c('Normal array',[[2,3]],5),c('Empty',[[]],0),c('One element',[[9]],9)]},
    {id:'bug-await',area:'debug',lang:'javascript',title:'The API returns an undefined count',fn:'taskCount',level:'Build confidence',lesson:'A promise represents a future value. Accessing .length on a promise does not read the future array.',prompt:'Fix both asynchronous steps. Return -1 for a failed HTTP response. Use the same /api/tasks, /api/empty, and /api/fail fixtures.',starter:'async function taskCount(url) {\n  const response = fetch(url);\n  if (!response.ok) return -1;\n  const tasks = response.json();\n  return tasks.length;\n}',solution:'async function taskCount(url) {\n  const response = await fetch(url);\n  if (!response.ok) return -1;\n  const tasks = await response.json();\n  return tasks.length;\n}',hints:['fetch returns a promise; await it before checking ok.','json() also returns a promise.'],explain:'The first missing await makes response.ok undefined. Fixing only the second await will not repair the earlier branch.',tests:[c('Tasks',['/api/tasks'],2),c('Empty',['/api/empty'],0),c('HTTP failure',['/api/fail'],-1)]},
    {id:'bug-default',area:'debug',lang:'javascript',title:'A valid zero gets replaced',fn:'retryDelay',level:'Start here',lesson:'|| falls back for every falsy value, including zero. ?? falls back only for null or undefined.',prompt:'Return delayMs from the options, using 1000 only when it is null or missing. A zero delay must stay zero.',starter:'function retryDelay(options) {\n  return options.delayMs || 1000;\n}',solution:'function retryDelay(options) {\n  return options.delayMs ?? 1000;\n}',hints:['Zero is falsy, but it is a valid value here.','Nullish coalescing is written ??.'],explain:'Choose defaults according to the input contract, not truthiness alone.',tests:[c('Zero delay',[{delayMs:0}],0),c('Custom delay',[{delayMs:250}],250),c('Missing',[{}],1000),c('Null',[{delayMs:null}],1000)]},
    {id:'bug-state',area:'debug',lang:'javascript',title:'A React update mutates the old state',fn:'toggleTask',level:'Build confidence',lesson:'React state updates should create new values instead of modifying the previous objects. Preserving the old data makes updates and debugging predictable.',prompt:'Return {updated, originalDone}. updated is a new array with the matching task toggled; originalDone reports the original array’s done values after your update. Do not mutate the input.',starter:'function toggleTask(tasks, id) {\n  const updated = tasks;\n  const task = updated.find(t => t.id === id);\n  if (task) task.done = !task.done;\n  return { updated, originalDone: tasks.map(t => t.done) };\n}',solution:'function toggleTask(tasks, id) {\n  const updated = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);\n  return { updated, originalDone: tasks.map(t => t.done) };\n}',hints:['Assigning an array to another variable does not clone it.','Use map and spread the changed task into a new object.'],explain:'The previous state stays intact. In a component, use a functional state update when the next state depends on the previous one.',tests:[c('Toggle without mutation',[[{id:1,done:false}],1],{updated:[{id:1,done:true}],originalDone:[false]}),c('Missing ID',[[{id:1,done:false}],9],{updated:[{id:1,done:false}],originalDone:[false]})]},
    {id:'bug-python',area:'debug',lang:'python',title:'The Python filter keeps the wrong values',fn:'valid_names',level:'Start here',lesson:'A string containing spaces is truthy. Normalize strings before deciding whether they are empty.',prompt:'Given a list of strings, trim each one, remove blank names, and keep the remaining names in order.',starter:'def valid_names(names):\n    return [name for name in names if name]',solution:'def valid_names(names):\n    return [name.strip() for name in names if name.strip()]',hints:['"   " is not an empty string until it is stripped.','Use .strip() in both the result and the condition.'],explain:'A truthiness check alone does not validate the contents of a string.',tests:[c('Whitespace',[['  Scout ',' ','Relay','']],['Scout','Relay']),c('Empty',[[]],[]),c('All blank',[['  ','']],[])]},
    {id:'project-title',area:'projects',lang:'javascript',title:'Task manager · 1. Validate input',fn:'normalizeTitle',level:'Milestone 1 of 3',lesson:'A UI should normalize input before sending it. The server still validates independently because clients are not a trusted boundary.',prompt:'Return a trimmed title with internal whitespace collapsed to a single space. Return an empty string for non-string values, blank strings, or normalized titles longer than 120 characters. After passing, put this function into the downloaded project’s src/helpers.js.',starter:'function normalizeTitle(value) {\n  // TODO: trim, collapse whitespace, and validate length.\n  return typeof value === "string" ? value.trim() : "";\n}',solution:'function normalizeTitle(value) {\n  if (typeof value !== "string") return "";\n  const title = value.trim().replace(/\\s+/g, " ");\n  return title.length > 0 && title.length <= 120 ? title : "";\n}',hints:['Normalize before checking length.','/\\s+/g matches runs of whitespace.'],explain:'The frontend can show immediate feedback, while server-side validation protects the API contract.',tests:[c('Normalize spaces',['  learn   REST  '],'learn REST'),c('Blank',['   '],''),c('Wrong type',[null],''),c('Too long',['x'.repeat(121)],'')]},
    {id:'project-filter',area:'projects',lang:'javascript',title:'Task manager · 2. Filter React state',fn:'visibleTasks',level:'Milestone 2 of 3',lesson:'Derived display data can be computed from state. Filtering a list should not overwrite the full list returned by the API.',prompt:'Return all tasks for "all", unfinished tasks for "open", and finished tasks for "done". Keep order. Put the passing function into src/helpers.js, leaving its export keyword in the project.',starter:'function visibleTasks(tasks, filter) {\n  // TODO: filter by done without changing tasks.\n  return tasks;\n}',solution:'function visibleTasks(tasks, filter) {\n  if (filter === "all") return tasks;\n  return tasks.filter(task => filter === "done" ? task.done : !task.done);\n}',hints:['Array.filter returns a new list of matches.','The "open" case requires !task.done.'],explain:'The React component holds the filter selection and renders this derived list, so changing filters never loses underlying tasks.',tests:[c('Open only',[[{id:1,done:false},{id:2,done:true}],'open'],[{id:1,done:false}]),c('Done only',[[{id:1,done:false},{id:2,done:true}],'done'],[{id:2,done:true}]),c('All',[[{id:1,done:false}],'all'],[{id:1,done:false}]),c('Empty',[[],'done'],[])]},
    {id:'project-load',area:'projects',lang:'javascript',title:'Task manager · 3. Handle API failures',fn:'loadTasks',level:'Milestone 3 of 3',lesson:'Loading, success, empty results, and errors are different UI states. A failed request should not look like an empty successful list.',prompt:'Return {tasks, error}. For a successful response containing an array, return that array and an empty error string. Return {tasks: [], error: "Could not load tasks"} for HTTP errors, network failure, or a non-array body. Fixtures: /api/tasks, /api/empty, /api/fail, /api/offline, /api/invalid.',starter:'async function loadTasks(url) {\n  const response = await fetch(url);\n  return { tasks: await response.json(), error: "" };\n}',solution:'async function loadTasks(url) {\n  try {\n    const response = await fetch(url);\n    if (!response.ok) throw new Error("HTTP failure");\n    const tasks = await response.json();\n    if (!Array.isArray(tasks)) throw new Error("Invalid body");\n    return { tasks, error: "" };\n  } catch {\n    return { tasks: [], error: "Could not load tasks" };\n  }\n}',hints:['Use try/catch for network and parsing failures.','Check response.ok and Array.isArray before returning success.'],explain:'The downloaded React component owns loading state and displays the returned error. Its Vite proxy forwards /api requests to your REST server.',tests:[c('Successful request',['/api/tasks'],{tasks:[{id:1,title:'Learn REST',done:false},{id:2,title:'Write tests',done:true}],error:''}),c('HTTP error',['/api/fail'],{tasks:[],error:'Could not load tasks'}),c('Offline',['/api/offline'],{tasks:[],error:'Could not load tasks'}),c('Unexpected shape',['/api/invalid'],{tasks:[],error:'Could not load tasks'}),c('Empty success',['/api/empty'],{tasks:[],error:''})]},
    {id:'sql-filter',area:'sql',lang:'sql',title:'01 · Filter failed requests',level:'Start here',lesson:'SELECT chooses columns; WHERE filters rows; ORDER BY makes result order predictable.',prompt:'Return id and status for events with status >= 400, ordered by id.',starter:'SELECT id, status\nFROM events\nORDER BY id;',solution:'SELECT id, status\nFROM events\nWHERE status >= 400\nORDER BY id;',hints:['Add a WHERE condition before ORDER BY.','The condition is status >= 400.'],explain:'Filtering happens before final ordering. Specify only the columns requested.',expected:[{columns:['id','status'],values:[[2,500],[5,429]]}]},
    {id:'sql-join',area:'sql',lang:'sql',title:'02 · Join requests to devices',level:'Build confidence',lesson:'A join combines rows through a relationship. Here events.device_id references devices.id.',prompt:'Return event id, device name, and status for failed events (status >= 400), ordered by event id. Name the result columns id, name, status.',starter:'SELECT e.id, d.name, e.status\nFROM events AS e\nJOIN devices AS d ON e.device_id = d.id\nORDER BY e.id;',solution:'SELECT e.id, d.name, e.status\nFROM events AS e\nJOIN devices AS d ON e.device_id = d.id\nWHERE e.status >= 400\nORDER BY e.id;',hints:['Join on the ID relationship, not the names.','Filter using e.status >= 400.'],explain:'The alias distinguishes the event ID from the device ID and avoids ambiguous column references.',expected:[{columns:['id','name','status'],values:[[2,'Scout',500],[5,'Beacon',429]]}]},
    {id:'sql-group',area:'sql',lang:'sql',title:'03 · Aggregate latency by device',level:'Build confidence',lesson:'GROUP BY creates one group per key. AVG computes an aggregate within each group.',prompt:'Return device_id and average latency as avg_ms for each device that has events. Order by device_id.',starter:'SELECT device_id, latency_ms AS avg_ms\nFROM events\nORDER BY device_id;',solution:'SELECT device_id, AVG(latency_ms) AS avg_ms\nFROM events\nGROUP BY device_id\nORDER BY device_id;',hints:['Wrap latency_ms in AVG(...).','Group by device_id.'],explain:'Device 4 has no events, so it does not appear in an aggregation over the events table alone.',expected:[{columns:['device_id','avg_ms'],values:[[1,215],[2,135],[3,175]]}]},
    {id:'sql-duplicates',area:'sql',lang:'sql',title:'04 · Find duplicate event keys',level:'Build confidence',lesson:'WHERE filters individual rows; HAVING filters groups after aggregation.',prompt:'Return event_key and its count as copies only when that key occurs more than once. Order by event_key.',starter:'SELECT event_key, COUNT(*) AS copies\nFROM events\nGROUP BY event_key\nORDER BY event_key;',solution:'SELECT event_key, COUNT(*) AS copies\nFROM events\nGROUP BY event_key\nHAVING COUNT(*) > 1\nORDER BY event_key;',hints:['Use HAVING for an aggregate condition.','Keep groups where COUNT(*) > 1.'],explain:'Detecting duplicates is only a first step. A production integration needs a defined event identity and an idempotent write strategy.',expected:[{columns:['event_key','copies'],values:[['c',2]]}]},
    {id:'sql-left',area:'sql',lang:'sql',title:'05 · Find devices with no events',level:'Build confidence',lesson:'A LEFT JOIN preserves rows from the left table even when the right side has no matching row.',prompt:'Return id and name of devices with no events, ordered by device id.',starter:'SELECT d.id, d.name\nFROM devices AS d\nLEFT JOIN events AS e ON e.device_id = d.id\nORDER BY d.id;',solution:'SELECT d.id, d.name\nFROM devices AS d\nLEFT JOIN events AS e ON e.device_id = d.id\nWHERE e.id IS NULL\nORDER BY d.id;',hints:['Unmatched right-side columns are NULL.','Use IS NULL, not = NULL.'],explain:'Checking the non-null event primary key identifies an unmatched row without confusing it with a nullable business field.',expected:[{columns:['id','name'],values:[[4,'Spare']]}]},
    {id:'review-average',area:'review',lang:'javascript',title:'Review: the plausible but wrong average',fn:'averageLatency',level:'Review drill',lesson:'Treat generated code as a proposal. Check its assumptions against the contract and supply counterexamples before trusting it.',prompt:'This AI-style sample claims to handle telemetry averages. Return the average of finite, nonnegative numeric latencies only. Ignore invalid values; return null when no valid values remain. Fix it and explain the missed edge cases.',starter:'function averageLatency(values) {\n  // Generated sample: "Works for every telemetry batch."\n  return values.reduce((sum, value) => sum + value, 0) / values.length;\n}',solution:'function averageLatency(values) {\n  const valid = values.filter(v => typeof v === "number" && Number.isFinite(v) && v >= 0);\n  if (valid.length === 0) return null;\n  return valid.reduce((sum, value) => sum + value, 0) / valid.length;\n}',hints:['Empty input cannot be divided by its length.','Filter by numeric type, finiteness, and nonnegative value before averaging.'],explain:'A confident comment does not establish correctness. Define missing data separately from a valid zero latency.',review:['Name the empty-input and invalid-type bugs.','Explain a test that failed before your change.','Explain why null and zero mean different things.'],tests:[c('Normal values',[[10,20]],15),c('Zero included',[[0,10]],5),c('Ignore invalid values',[[null,'20',-2,10]],10),c('No valid values',[[null,-1]],null),c('Empty',[[]],null)]},
    {id:'review-model',area:'review',lang:'javascript',title:'Review: validate a model response',fn:'parseModelReply',level:'Review drill',lesson:'A model response is external input. Valid JSON may still violate your application’s schema.',prompt:'Parse a JSON string. Accept only an object with label "normal" or "alert" and a nonempty string reason. Return {ok:true,value:{label,reason}} with extra fields omitted. For malformed JSON or invalid shape, return {ok:false,error:"Invalid response"}.',starter:'function parseModelReply(text) {\n  return { ok: true, value: JSON.parse(text) };\n}',solution:'function parseModelReply(text) {\n  try {\n    const value = JSON.parse(text);\n    if (!value || Array.isArray(value) || !["normal", "alert"].includes(value.label) || typeof value.reason !== "string" || !value.reason.trim()) throw new Error("Invalid");\n    return { ok: true, value: { label: value.label, reason: value.reason } };\n  } catch {\n    return { ok: false, error: "Invalid response" };\n  }\n}',hints:['Catch JSON parsing errors and validate the parsed value separately.','Build the accepted output from allowed fields instead of spreading the object.'],explain:'Schema validation protects the next application step. It does not establish that the model’s factual claim is correct.',review:['Distinguish JSON syntax from schema validity.','Give a valid-JSON counterexample the starter accepted.','Name a separate check needed for factual correctness.'],tests:[c('Valid reply',['{"label":"alert","reason":"High latency","extra":"ignore"}'],{ok:true,value:{label:'alert',reason:'High latency'}}),c('Unknown label',['{"label":"maybe","reason":"x"}'],{ok:false,error:'Invalid response'}),c('Blank reason',['{"label":"normal","reason":" "}'],{ok:false,error:'Invalid response'}),c('Malformed',['not json'],{ok:false,error:'Invalid response'}),c('Null',['null'],{ok:false,error:'Invalid response'})]},
    {id:'review-logs',area:'review',lang:'javascript',title:'Review: stop secrets leaking into logs',fn:'safeLog',level:'Review drill',lesson:'An allowlist is easier to reason about than attempting to remove every possible sensitive field.',prompt:'Input is an event object. Return only operation, requestId, and status, omitting any of those keys that were absent. Do not modify the input or copy other fields.',starter:'function safeLog(event) {\n  // Generated sample: "Remove the password and logging is safe."\n  const { password, ...log } = event;\n  return log;\n}',solution:'function safeLog(event) {\n  const log = {};\n  for (const key of ["operation", "requestId", "status"]) {\n    if (Object.hasOwn(event, key)) log[key] = event[key];\n  }\n  return log;\n}',hints:['A token or authorization field would survive the starter’s password removal.','Copy only the three allowed keys using Object.hasOwn.'],explain:'This small exercise assumes the allowed values are safe. In a real system, validate and redact those values too; an operation string itself could contain sensitive text.',review:['Identify at least two fields the starter could leak.','Explain why an allowlist is stronger here.','Name a limitation of checking field names alone.'],tests:[c('Token and password',[{operation:'sync',requestId:'r1',status:200,password:'demo-password',token:'demo-token'}],{operation:'sync',requestId:'r1',status:200}),c('Nested extra data',[{operation:'read',payload:{secret:'example'}}],{operation:'read'}),c('Missing fields',[{}],{})]},
    // Timed assessment: online-assessment style problems. Each appears in JavaScript and Python.
    ...[
      {key:'merge',title:'A1 · Merge maintenance windows',level:'Medium · arrays + sorting',fn:['mergeWindows','merge_windows'],
        lesson:'Interval problems usually start by sorting on the start time. After sorting, a window can only overlap the most recently merged one.',
        prompt:'Given unsorted [start, end] pairs, return the merged windows sorted by start. Windows that overlap or touch (end equals the next start) merge. Return a new list. Target: O(n log n).',
        starter:[`function mergeWindows(intervals) {
  // Sort by start, then merge overlaps.
  return intervals;
}`,`def merge_windows(intervals):
    # Sort by start, then merge overlaps.
    return intervals`],
        solution:[`function mergeWindows(intervals) {
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const [start, end] of sorted) {
    const last = merged[merged.length - 1];
    if (last && start <= last[1]) last[1] = Math.max(last[1], end);
    else merged.push([start, end]);
  }
  return merged;
}`,`def merge_windows(intervals):
    merged = []
    for start, end in sorted(intervals):
        if merged and start <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])
    return merged`],
        hints:['Sort a copy by start time first.','Compare each start with the end of the last merged window; extend it with max, or start a new window.'],
        explain:'Sorting costs O(n log n); the single merge pass is O(n). Using max handles a window fully contained in the previous one.',
        tests:[c('Overlaps',[[[1,3],[2,6],[8,10],[15,18]]],[[1,6],[8,10],[15,18]]),c('Touching windows merge',[[[1,4],[4,5]]],[[1,5]]),c('Unsorted input',[[[5,7],[1,2],[2,3]]],[[1,3],[5,7]]),c('Contained window',[[[1,10],[2,3]]],[[1,10]]),c('Empty',[[]],[])]},
      {key:'top',title:'A2 · Most frequent error codes',level:'Medium · hash map + sorting',fn:['topErrors','top_errors'],
        lesson:'Count with a hash map in one pass, then sort the distinct keys. State tie-breaking rules explicitly; hidden tests usually check them.',
        prompt:'Given a list of integer status codes and k, return the k most frequent codes. Break ties by the smaller code first. If there are fewer than k distinct codes, return them all.',
        starter:[`function topErrors(codes, k) {
  // Count each code, then sort by count (desc) and code (asc).
  return [];
}`,`def top_errors(codes, k):
    # Count each code, then sort by count (desc) and code (asc).
    return []`],
        solution:[`function topErrors(codes, k) {
  const counts = new Map();
  for (const code of codes) counts.set(code, (counts.get(code) || 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0] - b[0])
    .slice(0, k)
    .map(([code]) => code);
}`,`from collections import Counter

def top_errors(codes, k):
    ranked = sorted(Counter(codes).items(), key=lambda item: (-item[1], item[0]))
    return [code for code, _ in ranked[:k]]`],
        hints:['Build a code → count map first.','Sort by count descending, then code ascending, and take the first k.'],
        explain:'Counting is O(n); sorting d distinct codes is O(d log d). With very large d and small k, a size-k heap is an alternative.',
        tests:[c('Clear winners',[[500,404,500,429,404,500],2],[500,404]),c('Tie uses smaller code',[[503,429,503,429,400],2],[429,503]),c('k larger than distinct',[[200],3],[200]),c('Empty',[[],1],[])]},
      {key:'window',title:'A3 · Busiest rate-limit window',level:'Medium · sliding window',fn:['maxInWindow','max_in_window'],
        lesson:'A sliding window keeps two pointers. Move the right pointer forward and advance the left pointer until the window is valid again.',
        prompt:'timestamps is sorted ascending (seconds; duplicates allowed). Return the largest number of requests inside any window where last − first < windowSeconds. Target: O(n).',
        starter:[`function maxInWindow(timestamps, windowSeconds) {
  // Two pointers: grow right, shrink left while the window is too wide.
  return timestamps.length;
}`,`def max_in_window(timestamps, window_seconds):
    # Two pointers: grow right, shrink left while the window is too wide.
    return len(timestamps)`],
        solution:[`function maxInWindow(timestamps, windowSeconds) {
  let best = 0, left = 0;
  for (let right = 0; right < timestamps.length; right++) {
    while (timestamps[right] - timestamps[left] >= windowSeconds) left++;
    best = Math.max(best, right - left + 1);
  }
  return best;
}`,`def max_in_window(timestamps, window_seconds):
    best = left = 0
    for right, time in enumerate(timestamps):
        while time - timestamps[left] >= window_seconds:
            left += 1
        best = max(best, right - left + 1)
    return best`],
        hints:['Keep a left index; for each right index, advance left while the span is too wide.','The window size is right − left + 1. Watch the boundary: a span equal to windowSeconds is too wide.'],
        explain:'Each pointer only moves forward, so the loop is O(n) overall with O(1) extra space. This is how a sliding-log rate limiter finds bursts.',
        tests:[c('Burst then gap',[[1,2,3,10,11],5],3),c('Same second',[[1,1,1],1],3),c('Boundary is exclusive',[[0,10,20],10],1),c('Duplicates at the end',[[5,5,6,9,9,9,9],2],4),c('Empty',[[],5],0)]},
      {key:'grid',title:'A4 · Shortest path through a floor plan',level:'Medium · BFS',fn:['shortestPath','shortest_path'],
        lesson:'Breadth-first search explores a grid in rings of equal distance, so the first time it reaches the target is the shortest path. Mark cells as visited when you enqueue them.',
        prompt:'grid is a list of equal-length strings: S start, E end, # wall, . open. Move up, down, left, or right. Return the fewest steps from S to E, or -1 if E is unreachable.',
        starter:[`function shortestPath(grid) {
  // Find S, then breadth-first search to E.
  return -1;
}`,`def shortest_path(grid):
    # Find S, then breadth-first search to E.
    return -1`],
        solution:[`function shortestPath(grid) {
  const rows = grid.length, cols = grid[0].length;
  let start;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (grid[r][c] === "S") start = [r, c];
  const seen = new Set([start.join(",")]);
  let frontier = [start], steps = 0;
  while (frontier.length) {
    const next = [];
    for (const [r, c] of frontier) {
      if (grid[r][c] === "E") return steps;
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nr = r + dr, nc = c + dc, key = nr + "," + nc;
        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || grid[nr][nc] === "#" || seen.has(key)) continue;
        seen.add(key);
        next.push([nr, nc]);
      }
    }
    frontier = next;
    steps++;
  }
  return -1;
}`,`from collections import deque

def shortest_path(grid):
    rows, cols = len(grid), len(grid[0])
    start = next((r, c) for r in range(rows) for c in range(cols) if grid[r][c] == "S")
    queue = deque([(start, 0)])
    seen = {start}
    while queue:
        (r, c), steps = queue.popleft()
        if grid[r][c] == "E":
            return steps
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] != "#" and (nr, nc) not in seen:
                seen.add((nr, nc))
                queue.append(((nr, nc), steps + 1))
    return -1`],
        hints:['Use a queue (or a frontier list per step) and a visited set.','Check bounds and walls before enqueueing a neighbor, and mark it visited immediately.'],
        explain:'Every cell is visited at most once: O(rows × cols) time and space. Depth-first search would find a path, not necessarily the shortest one.',
        tests:[c('Around a wall',[['S.#','..#','#.E']],4),c('Blocked',[['S#E']],-1),c('Adjacent',[['SE']],1),c('Open corridor',[['S...','.##.','...E']],5),c('Detour',[['S.#.','#.#E','#...']],6)]},
      {key:'calls',title:'A5 · Summarize voice-agent calls',level:'Practical · data processing',fn:['summarizeCalls','summarize_calls'],
        lesson:'Practical rounds reward careful handling of messy records. Decide how invalid values are treated, and keep counts and averages consistent with that rule.',
        prompt:'Each call has id, outcome, and usually durationSec. Return {total, byOutcome, avgDurationSec, transferRate}. byOutcome counts every outcome. avgDurationSec averages only numeric, nonnegative durations, rounded to 1 decimal (0 if none). transferRate is transferred calls ÷ total, rounded to 2 decimals (0 if no calls).',
        starter:[`function summarizeCalls(calls) {
  // Count outcomes, average valid durations, and compute the transfer rate.
  return { total: calls.length, byOutcome: {}, avgDurationSec: 0, transferRate: 0 };
}`,`def summarize_calls(calls):
    # Count outcomes, average valid durations, and compute the transfer rate.
    return {"total": len(calls), "byOutcome": {}, "avgDurationSec": 0, "transferRate": 0}`],
        solution:[`function summarizeCalls(calls) {
  const byOutcome = {};
  let durationTotal = 0, timed = 0;
  for (const call of calls) {
    byOutcome[call.outcome] = (byOutcome[call.outcome] || 0) + 1;
    if (typeof call.durationSec === "number" && call.durationSec >= 0) {
      durationTotal += call.durationSec;
      timed++;
    }
  }
  const transferred = byOutcome.transferred || 0;
  return {
    total: calls.length,
    byOutcome,
    avgDurationSec: timed ? Math.round(durationTotal / timed * 10) / 10 : 0,
    transferRate: calls.length ? Math.round(transferred / calls.length * 100) / 100 : 0
  };
}`,`def summarize_calls(calls):
    by_outcome = {}
    durations = []
    for call in calls:
        by_outcome[call["outcome"]] = by_outcome.get(call["outcome"], 0) + 1
        duration = call.get("durationSec")
        if isinstance(duration, (int, float)) and duration >= 0:
            durations.append(duration)
    transferred = by_outcome.get("transferred", 0)
    return {
        "total": len(calls),
        "byOutcome": by_outcome,
        "avgDurationSec": round(sum(durations) / len(durations), 1) if durations else 0,
        "transferRate": round(transferred / len(calls), 2) if calls else 0,
    }`],
        hints:['Keep a separate count of calls with a valid duration; do not divide by the total call count.','Guard both divisions against zero before rounding.'],
        explain:'One pass, O(n). Stating the invalid-data rule out loud (excluded from the average, still counted in totals) is exactly what practical interviewers listen for.',
        tests:[c('Basic mix',[[{id:'a',durationSec:60,outcome:'booked'},{id:'b',durationSec:30,outcome:'transferred'},{id:'c',durationSec:90,outcome:'booked'}]],{total:3,byOutcome:{booked:2,transferred:1},avgDurationSec:60,transferRate:0.33}),c('No calls',[[]],{total:0,byOutcome:{},avgDurationSec:0,transferRate:0}),c('Invalid durations',[[{id:'a',durationSec:-5,outcome:'abandoned'},{id:'b',durationSec:41,outcome:'booked'},{id:'c',outcome:'booked'}]],{total:3,byOutcome:{abandoned:1,booked:2},avgDurationSec:41,transferRate:0}),c('Rounding',[[{id:'a',durationSec:10,outcome:'transferred'},{id:'b',durationSec:20,outcome:'transferred'},{id:'c',durationSec:25,outcome:'booked'}]],{total:3,byOutcome:{transferred:2,booked:1},avgDurationSec:18.3,transferRate:0.67})]},
      {key:'tool',title:'A6 · Handle an agent tool call',level:'Practical · JSON + validation',fn:['handleToolCall','handle_tool_call'],
        lesson:'Language models return tool arguments as a JSON string. Treat it like untrusted input: parse safely, validate required fields, and return structured errors the agent can recover from.',
        prompt:'call is {name, arguments} where arguments is a JSON string. Support check_availability {date} and book_appointment {date, time, name} using the AVAILABLE table. Return {ok: true, result} or {ok: false, error}. Errors, checked in this order: "Invalid arguments" (unparseable or not an object), "Unknown tool", "Missing field: <field>" (first missing or blank string field), "Slot unavailable". Results: {date, slots} for availability; {confirmation: date + "T" + time, name} for a booking.',
        starter:[`const AVAILABLE = { "2026-10-06": ["09:00", "13:30"], "2026-10-07": [] };

function handleToolCall(call) {
  // Parse call.arguments (a JSON string), validate fields,
  // then answer check_availability or book_appointment.
  return { ok: false, error: "Unknown tool" };
}`,`import json

AVAILABLE = {"2026-10-06": ["09:00", "13:30"], "2026-10-07": []}

def handle_tool_call(call):
    # Parse call["arguments"] (a JSON string), validate fields,
    # then answer check_availability or book_appointment.
    return {"ok": False, "error": "Unknown tool"}`],
        solution:[`const AVAILABLE = { "2026-10-06": ["09:00", "13:30"], "2026-10-07": [] };
const REQUIRED = { check_availability: ["date"], book_appointment: ["date", "time", "name"] };

function handleToolCall(call) {
  let args;
  try { args = JSON.parse(call.arguments); } catch { return { ok: false, error: "Invalid arguments" }; }
  if (!args || typeof args !== "object" || Array.isArray(args)) return { ok: false, error: "Invalid arguments" };
  if (!Object.hasOwn(REQUIRED, call.name)) return { ok: false, error: "Unknown tool" };
  for (const field of REQUIRED[call.name]) {
    if (typeof args[field] !== "string" || !args[field].trim()) return { ok: false, error: "Missing field: " + field };
  }
  const slots = Object.hasOwn(AVAILABLE, args.date) ? [...AVAILABLE[args.date]] : [];
  if (call.name === "check_availability") return { ok: true, result: { date: args.date, slots } };
  if (!slots.includes(args.time)) return { ok: false, error: "Slot unavailable" };
  return { ok: true, result: { confirmation: args.date + "T" + args.time, name: args.name } };
}`,`import json

AVAILABLE = {"2026-10-06": ["09:00", "13:30"], "2026-10-07": []}
REQUIRED = {"check_availability": ["date"], "book_appointment": ["date", "time", "name"]}

def handle_tool_call(call):
    try:
        args = json.loads(call["arguments"])
    except (TypeError, ValueError):
        return {"ok": False, "error": "Invalid arguments"}
    if not isinstance(args, dict):
        return {"ok": False, "error": "Invalid arguments"}
    if call["name"] not in REQUIRED:
        return {"ok": False, "error": "Unknown tool"}
    for field in REQUIRED[call["name"]]:
        value = args.get(field)
        if not isinstance(value, str) or not value.strip():
            return {"ok": False, "error": "Missing field: " + field}
    slots = list(AVAILABLE.get(args["date"], []))
    if call["name"] == "check_availability":
        return {"ok": True, "result": {"date": args["date"], "slots": slots}}
    if args["time"] not in slots:
        return {"ok": False, "error": "Slot unavailable"}
    return {"ok": True, "result": {"confirmation": args["date"] + "T" + args["time"], "name": args["name"]}}`],
        hints:['Wrap the JSON parse in try/catch (try/except), then confirm the result is a plain object.','Keep a table of required fields per tool; loop over it in order and stop at the first missing or blank value.'],
        explain:'Structured errors let the agent ask the caller for the missing detail instead of failing silently. A real handler would book through the scheduling API, handle double-booking races, and log each call.',
        tests:[c('Check availability',[{name:'check_availability',arguments:'{"date":"2026-10-06"}'}],{ok:true,result:{date:'2026-10-06',slots:['09:00','13:30']}}),c('Unknown date has no slots',[{name:'check_availability',arguments:'{"date":"2026-12-25"}'}],{ok:true,result:{date:'2026-12-25',slots:[]}}),c('Book an open slot',[{name:'book_appointment',arguments:'{"date":"2026-10-06","time":"13:30","name":"Sam"}'}],{ok:true,result:{confirmation:'2026-10-06T13:30',name:'Sam'}}),c('Slot taken',[{name:'book_appointment',arguments:'{"date":"2026-10-06","time":"10:00","name":"Sam"}'}],{ok:false,error:'Slot unavailable'}),c('Missing name',[{name:'book_appointment',arguments:'{"date":"2026-10-06","time":"09:00"}'}],{ok:false,error:'Missing field: name'}),c('Broken JSON',[{name:'book_appointment',arguments:'{"date": '}],{ok:false,error:'Invalid arguments'}),c('Not an object',[{name:'check_availability',arguments:'"2026-10-06"'}],{ok:false,error:'Invalid arguments'}),c('Unknown tool',[{name:'cancel_everything',arguments:'{}'}],{ok:false,error:'Unknown tool'})]}
    ].flatMap(p=>['javascript','python'].map((lang,i)=>({id:`assess-${p.key}-${lang==='python'?'py':'js'}`,area:'assess',lang,title:(i?'Python ':'')+p.title,fn:p.fn[i],level:p.level,lesson:p.lesson,prompt:p.prompt+(i?' Use the Python function name shown in the starter.':''),starter:p.starter[i],solution:p.solution[i],hints:p.hints,explain:p.explain,tests:p.tests})))
  ];
  for(const q of exercises.filter(q=>['project-filter','review-logs'].includes(q.id))){for(const test of q.tests)test.preserveArgs=true;}
  const api={areas,exercises,schema};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.InterviewWorkshopData=api;
})(typeof window==='object'?window:globalThis);
