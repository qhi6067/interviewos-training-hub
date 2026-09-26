/* This document runs in an opaque-origin iframe, with no same-origin grant. */
(function(){
  'use strict';
  let active=null;
  const send=(id,type,data={})=>parent.postMessage({channel:'interviewos-workshop',id,type,...data},'*');
  function stop(){if(!active)return;clearTimeout(active.timer);active.worker.terminate();URL.revokeObjectURL(active.url);active=null;}
  function workerMain(){
    'use strict';
    self.onmessage=async({data})=>{
      const logs=[];
      const display=value=>{try{return (JSON.stringify(value,(_,v)=>typeof v==='number'&&!Number.isFinite(v)?String(v):v)??String(value)).slice(0,3000);}catch{return String(value).slice(0,3000);}};
      const log=(...items)=>{if(logs.length<40)logs.push(items.map(display).join(' ').slice(0,1000));};
      const normalize=v=>typeof v==='number'&&!Number.isFinite(v)?{__nonfinite:String(v)}:v===undefined?{__undefined:true}:Array.isArray(v)?v.map(normalize):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,normalize(v[k])])):v;
      const same=(a,b)=>JSON.stringify(normalize(a))===JSON.stringify(normalize(b));
      const phase=()=>self.postMessage({type:'executing'});
      try{
        let tests=[],tables;
        if(data.lang==='javascript'){
          phase();
          const fixtureFetch=async url=>{
            if(url==='/api/offline')throw new Error('Simulated network failure');
            const fixtures={
              '/api/tasks':{status:200,body:[{id:1,title:'Learn REST',done:false},{id:2,title:'Write tests',done:true}]},
              '/api/empty':{status:200,body:[]},'/api/fail':{status:503,body:{error:'Unavailable'}},'/api/invalid':{status:200,body:{message:'Not an array'}}
            };
            const f=fixtures[url]||{status:404,body:{error:'Unknown exercise URL'}};
            return {ok:f.status>=200&&f.status<300,status:f.status,json:async()=>structuredClone(f.body)};
          };
          if(!/^[A-Za-z_][A-Za-z0-9_]*$/.test(data.fn))throw new Error('Invalid function name');
          const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
          const fn=await new AsyncFunction('console','fetch',`"use strict";\n${data.code}\n;return typeof ${data.fn} === "function" ? ${data.fn} : null;`)({log,warn:log,error:log},fixtureFetch);
          if(typeof fn!=='function')throw new Error(`Define a function named ${data.fn}.`);
          for(const test of data.tests){
            try{const args=structuredClone(test.args),actual=await fn(...args),mutated=test.preserveArgs&&!same(args,test.args);tests.push({name:test.name,passed:same(actual,test.expected)&&!mutated,expected:display(test.expected),actual:display(actual)+(mutated?' · Input was modified; preserve the original data.':'')});}
            catch(error){tests.push({name:test.name,passed:false,expected:display(test.expected),actual:`Error: ${error.message}`.slice(0,3000)});}
          }
        }else if(data.lang==='python'){
          // Pin a classic-worker runtime for opaque-origin iframe compatibility.
          const base='https://cdn.jsdelivr.net/pyodide/v0.27.7/full/';
          importScripts(base+'pyodide.js');
          const py=await loadPyodide({indexURL:base,stdout:line=>log(line),stderr:line=>log(line)});
          const scope=py.globals.get('dict')();
          scope.set('_user_code',data.code);scope.set('_function_name',data.fn);scope.set('_test_json',JSON.stringify(data.tests));
          phase();
          try{
            const text=await py.runPythonAsync(`import json, inspect
_namespace = {}
exec(_user_code, _namespace)
_function = _namespace.get(_function_name)
if not callable(_function):
    raise ValueError("Define a function named " + _function_name)
_results = []
for _case in json.loads(_test_json):
    try:
        _actual = _function(*_case["args"])
        if inspect.isawaitable(_actual):
            _actual = await _actual
        _json_value = json.loads(json.dumps(_actual, allow_nan=False))
        _results.append({"name": _case["name"], "passed": _json_value == _case["expected"], "expected": json.dumps(_case["expected"])[:3000], "actual": json.dumps(_json_value)[:3000]})
    except Exception as _error:
        _results.append({"name": _case["name"], "passed": False, "expected": json.dumps(_case["expected"])[:3000], "actual": ("Error: " + str(_error))[:3000]})
json.dumps(_results)`,{globals:scope});
            tests=JSON.parse(text);
          }finally{scope.destroy();}
        }else if(data.lang==='sql'){
          const base='https://cdn.jsdelivr.net/npm/sql.js@1.14.2/dist/';
          // SQLite's asm.js build also works in embedded browser WebViews.
          importScripts(base+'sql-asm.js');
          const SQL=await initSqlJs();
          phase();
          const db=new SQL.Database();
          try{
            db.run(data.schema);
            const actual=db.exec(data.code);
            tests=[{name:'Query result matches the requested columns and rows',passed:same(actual,data.expected),expected:display(data.expected),actual:display(actual)}];
            tables=actual.slice(0,3).map(t=>({columns:t.columns.slice(0,20),values:t.values.slice(0,100).map(row=>row.slice(0,20))}));
          }finally{db.close();}
        }else throw new Error('Unsupported exercise language');
        self.postMessage({type:'result',tests,tables,logs});
      }catch(error){self.postMessage({type:'result',error:String(error.message||error).slice(0,3000),tests:[],logs});}
    };
  }
  window.addEventListener('message',event=>{
    if(event.source!==parent||event.data?.channel!=='interviewos-workshop')return;
    const {type,id,payload}=event.data;
    if(type==='cancel'){if(active?.id===id)stop();return;}
    if(type!=='run'||!payload||typeof payload.code!=='string'||payload.code.length>20000)return;
    stop();
    const url=URL.createObjectURL(new Blob([`(${workerMain.toString()})();`],{type:'text/javascript'}));
    const worker=new Worker(url);
    const timeout=(message)=>{if(active?.id!==id)return;stop();send(id,'result',{error:message,tests:[],logs:[]});};
    active={id,worker,url,timer:setTimeout(()=>timeout('The language runtime could not load in 90 seconds. Check your connection and try again.'),90000),executing:false};
    worker.onmessage=({data})=>{
      if(active?.id!==id)return;
      if(data.type==='executing'&&!active.executing){active.executing=true;clearTimeout(active.timer);active.timer=setTimeout(()=>timeout('Stopped after 5 seconds. Check for an endless loop or a promise that never finishes.'),5000);send(id,'executing');}
      if(data.type==='result'){stop();send(id,'result',{tests:data.tests,error:data.error,logs:data.logs,tables:data.tables});}
    };
    worker.onerror=event=>{event.preventDefault();timeout(event.message||'The code runner could not start. Check your connection and retry.');};
    worker.postMessage(payload);
  });
  send(null,'ready');
})();
