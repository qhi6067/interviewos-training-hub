(function(root){
  'use strict';
  function parse(raw,exercises){
    let saved={};try{const value=JSON.parse(raw||'{}');if(value&&typeof value==='object'&&!Array.isArray(value))saved=value;}catch{}
    const entries=Object.fromEntries(exercises.map(q=>{
      const old=saved.entries?.[q.id], code=typeof old?.code==='string'?old.code.slice(0,20000):q.starter;
      const passedCode=typeof old?.passedCode==='string'&&old.passedCode===code?code:null;
      const notes=typeof old?.notes==='string'?old.notes.slice(0,6000):'';
      const checks=(q.review||[]).map((_,i)=>old?.checks?.[i]===true);
      return [q.id,{code,passedCode,notes,checks,solutionUsed:old?.solutionUsed===true,reviewed:old?.reviewed===true&&passedCode===code&&notes.trim().length>=30&&checks.length>0&&checks.every(Boolean)}];
    }));
    return {selected:exercises.some(q=>q.id===saved.selected)?saved.selected:exercises[0].id,entries};
  }
  const passed=e=>e.passedCode!==null&&e.passedCode===e.code;
  function edit(e,code){e.code=code;e.passedCode=null;e.reviewed=false;}
  function grade(e,snapshot,result,q){
    if(e.code!==snapshot)return false;
    const count=q.lang==='sql'?1:q.tests.length;
    const ok=!result.error&&Array.isArray(result.tests)&&result.tests.length===count&&result.tests.every(t=>t.passed===true);
    e.passedCode=ok?snapshot:null;if(!ok)e.reviewed=false;return ok;
  }
  const canReview=e=>passed(e)&&e.notes.trim().length>=30&&e.checks.length>0&&e.checks.every(Boolean);
  function summary(state,exercises){return {total:exercises.length,passed:exercises.filter(q=>passed(state.entries[q.id])).length,reviewed:exercises.filter(q=>q.area==='review'&&state.entries[q.id].reviewed).length};}
  const api={parse,passed,edit,grade,canReview,summary};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.InterviewWorkshopCore=api;
})(typeof window==='object'?window:globalThis);
