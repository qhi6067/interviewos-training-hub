(function(){
  'use strict';
  let frame,ready=false,waiting=null,current=null,counter=0;
  function ensure(){
    if(ready)return Promise.resolve();
    if(waiting)return waiting;
    waiting=new Promise((resolve,reject)=>{
      frame=document.createElement('iframe');frame.hidden=true;frame.title='Isolated code execution';frame.sandbox='allow-scripts';frame.src='./workshop/sandbox.html';
      const timer=setTimeout(()=>{reject(new Error('The code runner did not load. Reload the page to try again.'));},15000);
      frame._ready=()=>{clearTimeout(timer);ready=true;resolve();};document.body.append(frame);
    });return waiting;
  }
  window.addEventListener('message',event=>{
    if(!frame||event.source!==frame.contentWindow||event.data?.channel!=='interviewos-workshop')return;
    const message=event.data;
    if(message.type==='ready'){frame._ready();return;}
    if(!current||message.id!==current.id)return;
    if(message.type==='executing')current.onPhase('Running your code…');
    if(message.type==='result'){const done=current;current=null;clearTimeout(done.timer);done.resolve(message);}
  });
  function cancel(){if(!current)return;frame?.contentWindow?.postMessage({channel:'interviewos-workshop',type:'cancel',id:current.id},'*');const done=current;current=null;clearTimeout(done.timer);done.resolve({cancelled:true,tests:[],logs:[]});}
  async function run(payload,onPhase){
    cancel();const id=++counter;
    const promise=new Promise(resolve=>{current={id,resolve,onPhase,timer:setTimeout(()=>{cancel();},105000)};});
    try{onPhase(payload.lang==='javascript'?'Starting JavaScript…':`Loading ${payload.lang==='python'?'Python':'SQLite'}… first use needs an internet connection.`);await ensure();if(current?.id===id)frame.contentWindow.postMessage({channel:'interviewos-workshop',type:'run',id,payload},'*');}
    catch(error){if(current?.id===id){const done=current;current=null;clearTimeout(done.timer);done.resolve({error:error.message,tests:[],logs:[]});}}
    return promise;
  }
  window.InterviewWorkshopRunner={run,cancel};
})();
