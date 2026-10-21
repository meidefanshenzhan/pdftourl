import fs from 'node:fs/promises';import assert from 'node:assert/strict';import {PDFDocument} from 'pdf-lib';
const base=process.env.TEST_BASE||'https://seller-pdf-links.zheciyaojizhuwqw.workers.dev';
const secrets=JSON.parse(await fs.readFile('.local/deploy-secrets.json','utf8')),jar=new Map(),results=[];
async function request(path,options={}){const r=await fetch(base+path,{...options,headers:{Origin:base,Cookie:[...jar].map(([k,v])=>k+'='+v).join('; '),...options.headers}});for(const c of r.headers.getSetCookie()){const [name,...value]=c.split(';')[0].split('=');jar.set(name,value.join('='));}return r;}
async function check(name,fn){try{await fn();results.push({name,ok:true});console.log(name+': PASS');}catch(e){results.push({name,ok:false,error:e.message});console.log(name+': FAIL '+e.message);}}
await check('Chinese and English pages',async()=>{for(const p of ['/zh/','/en/'])assert.equal((await fetch(base+p)).status,200);});
await check('Contact Us email',async()=>{assert.match(await (await fetch(base+'/en/contact/')).text(),/mailto:153655601@qq.com/);});
await check('Anonymous visitor starts with three free uploads',async()=>{const r=await request('/api/session');const j=await r.json();assert.equal(j.freeRemaining,3);assert.equal(j.unlocked,false);});
await check('Invalid PDF rejected without consuming quota',async()=>{const f=new FormData();f.append('file',new Blob(['not a PDF']),'fake.pdf');assert.equal((await request('/api/upload',{method:'POST',body:f})).status,400);assert.equal((await (await request('/api/session')).json()).freeRemaining,3);});
const p=await PDFDocument.create();p.addPage();const bytes=await p.save();let fileUrl='';
async function upload(){const f=new FormData();f.append('file',new Blob([bytes],{type:'application/pdf'}),'anonymous-smoke-test.pdf');return request('/api/upload',{method:'POST',body:f});}
await check('First three PDFs upload without login',async()=>{for(let i=0;i<3;i++){const r=await upload();const j=await r.json();assert.equal(r.status,201,JSON.stringify(j));fileUrl=j.url;}});
await check('Fourth upload requires code',async()=>{const r=await upload();assert.equal(r.status,429);assert.equal((await r.json()).error,'LIMIT');});
await check('Correct code unlocks one hour and allows another upload',async()=>{const r=await request('/api/unlock',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:secrets.UPLOAD_CODE})});assert.equal(r.status,200);assert.match(r.headers.get('set-cookie'),/Max-Age=3600/);assert.equal((await upload()).status,201);});
await check('Anonymous download returns original PDF bytes',async()=>{const r=await fetch(fileUrl,{redirect:'manual'});assert.equal(r.status,200);assert.match(r.headers.get('content-type'),/application\/pdf/);assert.deepEqual(new Uint8Array(await r.arrayBuffer()),bytes);});
await check('History has only this browser files',async()=>{const data=await (await request('/api/documents')).json();assert.equal(data.documents.length,4);const other=await fetch(base+'/api/documents');assert.equal((await other.json()).documents.length,0);});
await fs.writeFile('.local/smoke-results.json',JSON.stringify(results,null,2));console.log(JSON.stringify({passed:results.filter(x=>x.ok).length,total:results.length}));if(results.some(x=>!x.ok))process.exitCode=1;
