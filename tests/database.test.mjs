import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {DatabaseSync} from 'node:sqlite';
import worker from '../src/worker.js';
function database(){const db=new DatabaseSync(':memory:');for(const file of ['0001.sql','0002_visitors.sql'])db.exec(fs.readFileSync(new URL('../migrations/'+file,import.meta.url),'utf8'));return {db,prepare(sql){let args=[];return {bind(...a){args=a;return this;},async first(){return db.prepare(sql).get(...args)||null;},async all(){return {results:db.prepare(sql).all(...args)};},async run(){return {meta:db.prepare(sql).run(...args)};}};}};}
async function session(env){const r=await worker.fetch(new Request('https://test.local/api/session'),env);return {cookie:r.headers.get('set-cookie').split(';')[0],data:await r.json()};}
test('no login required; unlock uses a one-hour cookie and throttles wrong codes',async()=>{
 const DB=database(),env={DB,UPLOAD_CODE:'MZDH',SESSION_SECRET:'session-secret'};
 const first=await session(env);assert.equal(first.data.freeRemaining,3);assert.equal(first.data.unlocked,false);
 const request=(password)=>new Request('https://test.local/api/unlock',{method:'POST',headers:{Cookie:first.cookie,'Content-Type':'application/json',Origin:'https://test.local','cf-connecting-ip':'192.0.2.1'},body:JSON.stringify({password})});
 const ok=await worker.fetch(request('MZDH'),env);assert.equal(ok.status,200);assert.match(ok.headers.get('set-cookie'),/HttpOnly; Secure; SameSite=Strict/);assert.match(ok.headers.get('set-cookie'),/Max-Age=3600/);
 for(let i=0;i<9;i++)assert.equal((await worker.fetch(request('wrong'),env)).status,401);
 assert.equal((await worker.fetch(request('wrong'),env)).status,429);DB.db.close();
});
test('anonymous visitors can see only their own files and cannot delete another visitor file',async()=>{
 const DB=database(),env={DB,SESSION_SECRET:'secret'};
 DB.db.exec("INSERT INTO documents(id,name,object_key,size,sha256,created_at,owner_id) VALUES('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','private-manual.pdf','seller-pdf-v2/test/manual.pdf',10,'hash','now','another-visitor')");
 const own=await session(env);const headers={Cookie:own.cookie};
 const list=await worker.fetch(new Request('https://test.local/api/documents',{headers}),env);assert.equal(list.status,200);assert.deepEqual((await list.json()).documents,[]);
 const deletion=await worker.fetch(new Request('https://test.local/api/documents/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',{method:'DELETE',headers}),env);assert.equal(deletion.status,404);
 const settings=await worker.fetch(new Request('https://test.local/api/settings',{method:'POST',headers,body:'{}'}),env);assert.equal(settings.status,404);DB.db.close();
});
