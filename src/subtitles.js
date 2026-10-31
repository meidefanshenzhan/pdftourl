import {normalizeCues,validateWav} from '../public/assets/subtitles-core.js';
import {readLimited,sha256} from './core.js';
const languages=new Set(['en','zh','ja','ko','de','fr','es','it','pt']);
const json=(x,s=200)=>Response.json(x,{status:s,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export const subtitleDay=(now=Date.now())=>new Date(now+8*3600000).toISOString().slice(0,10);
export async function subtitleRemaining(env,visitor,day=subtitleDay()){await env.DB.prepare("UPDATE subtitle_jobs SET status='failed' WHERE status='pending' AND created<?").bind(Date.now()-600000).run();const r=await env.DB.prepare("SELECT COUNT(*) AS used FROM subtitle_jobs WHERE day=? AND visitor=? AND status IN ('pending','success')").bind(day,visitor).first();return Math.max(0,3-r.used);}
async function timeout(p,ms=85000){let t;try{return await Promise.race([p,new Promise((_,reject)=>{t=setTimeout(()=>reject(Error('PROVIDER_TIMEOUT')),ms);})]);}finally{clearTimeout(t);}}
function base64(bytes){let s='';for(let i=0;i<bytes.length;i+=16384)s+=String.fromCharCode(...bytes.subarray(i,i+16384));return btoa(s);}
export async function handleSubtitles(req,env,visitor){
 const path=new URL(req.url).pathname,day=subtitleDay();if(!env.AI)return json({error:'SUBTITLES_UNAVAILABLE'},503);
 if(req.method==='GET'&&path==='/api/subtitles/session')return json({remaining:await subtitleRemaining(env,visitor.id,day),maxSeconds:300,maxBytes:25000000,reset:'Asia/Shanghai'});
 if(req.method!=='POST'||path!=='/api/subtitles/generate')return json({error:'NOT_FOUND'},404);
 let job=null,dispatched=false;
 try{
  const bytes=await readLimited(req,9700000),form=await new Response(bytes,{headers:{'content-type':req.headers.get('content-type')||''}}).formData(),file=form.get('audio');if(!file||typeof file.arrayBuffer!=='function')return json({error:'AUDIO'},400);
  const audio=new Uint8Array(await file.arrayBuffer()),seconds=validateWav(audio),source=String(form.get('source')||'auto'),target=String(form.get('target')||'');if((source!=='auto'&&!languages.has(source))||(target&&!languages.has(target)))return json({error:'LANGUAGE'},400);
  const now=Date.now(),deadline=now+95000,network=await sha256(new TextEncoder().encode(day+':'+env.SESSION_SECRET+':'+(req.headers.get('cf-connecting-ip')||'local')));
  await env.DB.prepare("UPDATE subtitle_jobs SET status='failed' WHERE status='pending' AND created<?").bind(now-600000).run();
  job=crypto.randomUUID();await env.DB.prepare('INSERT INTO subtitle_jobs(id,day,visitor,network,seconds,created) VALUES(?,?,?,?,?,?)').bind(job,day,visitor.id,network,seconds,now).run();
  dispatched=true;const out=await timeout(env.AI.run('@cf/openai/whisper-large-v3-turbo',{audio:base64(audio),...(source==='auto'?{}:{language:source}),vad_filter:true,condition_on_previous_text:false}));
  let cues;try{cues=normalizeCues(out.segments,seconds);}catch{throw Error(out.text?.trim()?'TIMESTAMPS':'NO_SPEECH');}
  const detected=out.transcription_info?.language||source;let translationError=false;
  if(target&&target!==detected){
   if(!languages.has(detected)||cues.reduce((n,c)=>n+c.text.length,0)>6000)translationError=true;
   else{try{
    const translated=[];for(let i=0;i<cues.length;i+=4){if(Date.now()>=deadline)throw Error('PROVIDER_TIMEOUT');const batch=await Promise.all(cues.slice(i,i+4).map(async c=>{const r=await timeout(env.AI.run('@cf/meta/m2m100-1.2b',{text:c.text,source_lang:detected,target_lang:target}),Math.max(1,deadline-Date.now()));if(typeof r.translated_text!=='string'||!r.translated_text.trim()||r.translated_text.length>3000)throw Error('TRANSLATION');return r.translated_text.trim();}));translated.push(...batch);}
    cues=normalizeCues(cues.map((c,i)=>({...c,translation:translated[i]})),seconds);
   }catch{translationError=true;}}
  }else if(target===detected)cues=cues.map(c=>({...c,translation:c.text}));
  await env.DB.prepare("UPDATE subtitle_jobs SET status='success' WHERE id=?").bind(job).run();
  return json({cues,language:detected,translationError,remaining:await subtitleRemaining(env,visitor.id,day)});
 }catch(e){
  if(job)await env.DB.prepare("UPDATE subtitle_jobs SET status='failed' WHERE id=? AND status='pending'").bind(job).run();
  const message=String(e.message||''),limit=['VISITOR_LIMIT','GLOBAL_LIMIT','NETWORK_LIMIT','BUSY'].find(s=>message.includes(s));if(limit)return json({error:limit},429);
  const known=['AUDIO','SIZE','LANGUAGE','NO_SPEECH','TIMESTAMPS','PROVIDER_TIMEOUT'].find(s=>message===s);return json({error:known||'PROVIDER',remaining:await subtitleRemaining(env,visitor.id,day)},dispatched?502:400);
 }
}
