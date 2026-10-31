import {handleSubtitles} from './subtitles.js';
import {seoHashes} from './seo-hashes.js';
import {MAX_BYTES,validatePdf,makeObjectKey,sha256,readLimited} from './core.js';
import {createSession,validSession,sessionCookie,cookie,samePassword} from './auth.js';
import {identifyVisitor,visitorCookie,reserveUpload,releaseUpload,remainingUploads} from './visitors.js';
import {publish,checkPublic} from './storage.js';
import {deleteDocument,recheckDocument} from './documents.js';
const LIMIT=1_000_000_000;
const json=(data,status=200,headers={})=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
const text=(f,k)=>String(f.get(k)||'').trim().slice(0,120);
async function serve(req,env,visitor){
 const url=new URL(req.url),path=url.pathname;
 if(path.startsWith('/api/subtitles/'))return handleSubtitles(req,env,visitor);
 const unlocked=await validSession(sessionCookie(req),env.SESSION_SECRET+visitor.id);
 if(path==='/api/session'&&req.method==='GET')return json({unlocked,freeRemaining:await remainingUploads(env,visitor.id)});
 if(path==='/api/unlock'&&req.method==='POST'){
  if(!env.UPLOAD_CODE)return json({error:'NOT_CONFIGURED'},503);
  let body;try{body=JSON.parse(new TextDecoder().decode(await readLimited(req,1024)));}catch{return json({error:'REQUEST'},400);}
  const hour=Math.floor(Date.now()/3600000),ip=req.headers.get('cf-connecting-ip')||'local';
  const id=await sha256(new TextEncoder().encode(ip+':'+hour));
  const row=await env.DB.prepare('INSERT INTO login_attempts(id,count) VALUES(?,1) ON CONFLICT(id) DO UPDATE SET count=count+1 RETURNING count').bind(id).first();
  if(row.count>10)return json({error:'RATE'},429);
  if(!await samePassword(body.password,env.UPLOAD_CODE))return json({error:'PASSWORD'},401);
  return json({ok:true,unlocked:true},200,{'Set-Cookie':cookie(await createSession(env.SESSION_SECRET+visitor.id,Math.floor(Date.now()/1000),3600),3600)});
 }
 if(path==='/api/documents'&&req.method==='GET'){
  const {results}=await env.DB.prepare('SELECT * FROM documents WHERE owner_id=? ORDER BY created_at DESC LIMIT 1000').bind(visitor.id).all();
  return json({documents:results,unlocked,freeRemaining:await remainingUploads(env,visitor.id)});
 }
 if(path==='/api/upload'&&req.method==='POST'){
  let slot=null;
  if(!unlocked){slot=await reserveUpload(env,visitor.id);if(!slot)return json({error:'LIMIT',freeRemaining:0},429);}
  let published=false;
  try{
   const bytes=await readLimited(req,MAX_BYTES+20000);
   const form=await new Response(bytes,{headers:{'content-type':req.headers.get('content-type')||''}}).formData();
   const file=form.get('file');if(!file||typeof file.arrayBuffer!=='function')return json({error:'PDF'},400);
   const data=new Uint8Array(await file.arrayBuffer());await validatePdf(data);
   const hash=await sha256(data),id=crypto.randomUUID(),key=makeObjectKey(file.name),now=new Date().toISOString();
   const reserve=await env.DB.prepare('UPDATE usage SET bytes=bytes+? WHERE id=1 AND paused=0 AND bytes+?<=?').bind(data.length,data.length,LIMIT).run();
   if(!reserve.meta.changes)return json({error:'QUOTA_OR_PAUSED'},409);
   let inserted=false;
   try{
    await env.DB.prepare('INSERT INTO documents(id,name,object_key,size,sha256,sku,marketplace,language,document_type,created_at,owner_id) VALUES(?,?,?,?,?,?,?,?,?,?,?)').bind(id,file.name.slice(0,200),key,data.length,hash,text(form,'sku'),text(form,'marketplace'),text(form,'language'),text(form,'documentType'),now,visitor.id).run();inserted=true;
    const publicUrl=await publish(env,key,data,hash);published=true;
    await env.DB.prepare('UPDATE documents SET url=?,status=? WHERE id=?').bind(publicUrl,'checking',id).run();
    const result=await checkPublic(env,key,hash);
    await env.DB.prepare('UPDATE documents SET status=?,checked_at=? WHERE id=?').bind('ready',result.checkedAt,id).run();
    return json({id,url:publicUrl,status:'ready',checkedAt:result.checkedAt,freeRemaining:await remainingUploads(env,visitor.id)},201);
   }catch{
    if(inserted)await env.DB.prepare('UPDATE documents SET status=? WHERE id=?').bind('needs_check',id).run();
    else await env.DB.prepare('UPDATE usage SET bytes=MAX(0,bytes-?) WHERE id=1').bind(data.length).run();
    return json({error:'PUBLISH',id},502);
   }
  }finally{if(slot&&!published)await releaseUpload(env,visitor.id,slot.start);}
 }
 const match=path.match(/^\/api\/documents\/([a-f0-9-]+)(\/check)?$/);
 if(match){
  const doc=await env.DB.prepare('SELECT * FROM documents WHERE id=? AND owner_id=?').bind(match[1],visitor.id).first();if(!doc)return json({error:'NOT_FOUND'},404);
  if(match[2]&&req.method==='POST'){
   const result=await recheckDocument(env,doc);return result?json({ok:true,...result}):json({error:'BUSY'},409);
  }
  if(!match[2]&&req.method==='DELETE'){
   const deleted=await deleteDocument(env,doc);return deleted?json({ok:true}):json({error:'BUSY'},409);
  }
 }
 return json({error:'NOT_FOUND'},404);
}
export default {async fetch(req,env){
 const url=new URL(req.url),path=url.pathname;
 try{
  if(!path.startsWith('/api/')){
   const oldDedupe=path.match(/^\/(zh|en)\/text-dedupe(?:\/|\/index\.html)?$/);
   if(oldDedupe&&['GET','HEAD'].includes(req.method))return Response.redirect('https://kjamz.com/'+oldDedupe[1]+'/remove-duplicates/'+url.search,301);
   if(['GET','HEAD'].includes(req.method)&&['www.kjamz.com','seller-pdf-links.zheciyaojizhuwqw.workers.dev'].includes(url.hostname))return Response.redirect('https://kjamz.com'+path+url.search,301);
   if(path==='/')return Response.redirect(url.origin+'/zh/',302);
   const r=await env.ASSETS.fetch(req);const h=new Headers(r.headers);
   h.set('X-Content-Type-Options','nosniff');h.set('Referrer-Policy','strict-origin-when-cross-origin');
   const videoPolicy=path.includes('/auto-subtitles/')||path.startsWith('/assets/video-engine-v1/');
   const formAction=path.includes('/contact/')?"'self' https://formsubmit.co":"'self'";
   h.set('Content-Security-Policy',"default-src 'self'; script-src 'self' https://www.googletagmanager.com "+(videoPolicy?"'wasm-unsafe-eval' ":'')+seoHashes+"; style-src 'self'; media-src 'self' blob:; img-src 'self' data: https://*.google-analytics.com https://www.googletagmanager.com; connect-src 'self' blob: https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com; worker-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action "+formAction);
   return new Response(r.body,{status:r.status,headers:h});
  }
  if(!['GET','HEAD'].includes(req.method)&&req.headers.get('origin')&&req.headers.get('origin')!==url.origin)return json({error:'ORIGIN'},403);
  if(!env.DB||!env.SESSION_SECRET)return json({error:'NOT_CONFIGURED'},503);
  const visitor=await identifyVisitor(req,env);let response;
  try{response=await serve(req,env,visitor);}catch(e){const known=['SIZE','PDF','FETCH_CHECK'];response=json({error:known.includes(e.message)?e.message:'REQUEST_FAILED'},known.includes(e.message)?400:500);}
  if(visitor.fresh){const h=new Headers(response.headers);h.append('Set-Cookie',visitorCookie(visitor.token));response=new Response(response.body,{status:response.status,headers:h});}
  return response;
 }catch{return json({error:'REQUEST_FAILED'},500);}
}};
