// App-local cost circuit breaker. It is not an account-wide billing API.
export const budgetDay=(now=Date.now())=>new Date(now).toISOString().slice(0,10);
const fail=()=>{throw Error('AI_BUDGET');};
function limit(env){const x=Number(env.AI_DAILY_BUDGET_NEURONS??8000);return Number.isFinite(x)&&x>=0?Math.min(8000,x):0;}
const manualPause=env=>env.AI_PAUSED===true||env.AI_PAUSED==='true';
export async function initBudget(env,now=Date.now()){
 const day=budgetDay(now),cap=Math.floor(limit(env)*1000),start=Date.parse(day+'T00:00:00Z');
 await env.DB.prepare("UPDATE ai_budget_calls SET state='unknown',finished=? WHERE state='reserved' AND created<?").bind(now,now-600000).run();
 // Never bootstrap unknown earlier usage as zero. Existing unmetered jobs pause this window.
 await env.DB.prepare("INSERT OR IGNORE INTO ai_budget_days(day,limit_milli,spent_milli,paused,reason) SELECT ?,?,CASE WHEN EXISTS(SELECT 1 FROM subtitle_jobs j WHERE budget_managed=0 AND created>=? AND created<? AND NOT EXISTS(SELECT 1 FROM ai_budget_calls c WHERE c.job=j.id)) THEN ? ELSE 0 END,CASE WHEN EXISTS(SELECT 1 FROM subtitle_jobs j WHERE budget_managed=0 AND created>=? AND created<? AND NOT EXISTS(SELECT 1 FROM ai_budget_calls c WHERE c.job=j.id)) THEN 1 ELSE 0 END,CASE WHEN EXISTS(SELECT 1 FROM subtitle_jobs j WHERE budget_managed=0 AND created>=? AND created<? AND NOT EXISTS(SELECT 1 FROM ai_budget_calls c WHERE c.job=j.id)) THEN 'LEGACY_USAGE_UNKNOWN' ELSE NULL END").bind(day,cap,start,now,cap,start,now,start,now).run();
 await env.DB.prepare("UPDATE ai_budget_days SET paused=1,reason='LEGACY_USAGE_UNKNOWN' WHERE day=? AND EXISTS(SELECT 1 FROM subtitle_jobs WHERE budget_managed=0 AND created>=? AND created<?)").bind(day,start,now).run();
 await env.DB.prepare('UPDATE ai_budget_days SET limit_milli=MIN(limit_milli,?) WHERE day=?').bind(cap,day).run();
 return day;
}
export async function budgetStatus(env,now=Date.now()){
 const day=await initBudget(env,now),r=await env.DB.prepare('SELECT * FROM ai_budget_days WHERE day=?').bind(day).first();
 const other=await env.DB.prepare("SELECT (SELECT COALESCE(SUM(reserve_milli),0) FROM ai_budget_calls WHERE day<>? AND state='reserved')+(SELECT COALESCE(SUM(reserve_milli),0) FROM ai_budget_calls WHERE day<>? AND state='unknown' AND (date(finished/1000,'unixepoch')=? OR date(created/1000,'unixepoch')>=date(?,'-1 day')))+(SELECT COALESCE(SUM(actual_milli),0) FROM ai_budget_calls WHERE day<>? AND state='settled' AND date(finished/1000,'unixepoch')=?) AS held").bind(day,day,day,day,day,day).first();
 return{available:!manualPause(env)&&r.paused===0&&r.spent_milli+r.held_milli+other.held<r.limit_milli,resetAt:Date.parse(day+'T00:00:00Z')+86400000};
}
export function transcriptionReservation(seconds){if(!Number.isFinite(seconds)||seconds<.1||seconds>300)throw Error('AUDIO');return Math.ceil((seconds/60*46.63*1.5+10)*1000)/1000;}
export function translationReservation(text){if(typeof text!=='string'||!text.trim()||text.length>1500)throw Error('CUES');const bytes=new TextEncoder().encode(text).length;return Math.ceil(((bytes+64+4096)*.03105*2+10)*1000)/1000;}
export async function reserveAi(env,job,model,reserve,now=Date.now()){
 if(manualPause(env)||!Number.isFinite(reserve)||reserve<=0||reserve>8000)fail();const day=await initBudget(env,now),id=crypto.randomUUID();
 try{await env.DB.prepare('INSERT INTO ai_budget_calls(id,day,job,model,reserve_milli,created) VALUES(?,?,?,?,?,?)').bind(id,day,job,model,Math.ceil(reserve*1000),now).run();}catch(e){if(String(e.message).includes('AI_BUDGET'))fail();throw e;}
 return id;
}
export async function settleAi(env,id,result,now=Date.now()){
 const n=result?.usage?.neurons,known=typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<1e9;
 await env.DB.prepare("UPDATE ai_budget_calls SET state=?,actual_milli=?,finished=? WHERE id=? AND state='reserved'").bind(known?'settled':'unknown',known?Math.ceil(n*1000):null,now,id).run();
}
export async function runBudgetedAi(env,{job,model,input,reserve,timeoutMs=85000,now=Date.now()}){
 const id=await reserveAi(env,job,model,reserve,now);let out,timer;
 try{out=await Promise.race([env.AI.run(model,input),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('PROVIDER_TIMEOUT')),Math.max(1,timeoutMs));})]);}
 catch(e){await settleAi(env,id,null);throw e;}
 finally{clearTimeout(timer);}
 await settleAi(env,id,out);return out;
}
