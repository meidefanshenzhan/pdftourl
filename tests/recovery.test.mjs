import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {DatabaseSync} from 'node:sqlite';
import {deleteDocument,recheckDocument} from '../src/documents.js';
function setup(status='ready'){
 const db=new DatabaseSync(':memory:');db.exec(fs.readFileSync(new URL('../migrations/0001.sql',import.meta.url),'utf8'));
 db.prepare("INSERT INTO documents(id,name,object_key,size,sha256,status,created_at) VALUES('id','manual.pdf','seller-pdf-v2/id/manual.pdf',500,'hash',?,'now')").run(status);db.exec('UPDATE usage SET bytes=500');
 const env={AWS_REGION:'us-east-2',S3_BUCKET:'pdftourl.online',DB:{prepare(sql){let args=[];return{bind(...a){args=a;return this;},async run(){return{meta:db.prepare(sql).run(...args)};},async first(){return db.prepare(sql).get(...args)||null;},execute(){return db.prepare(sql).run(...args);}};},async batch(stmts){db.exec('BEGIN');try{const r=stmts.map(x=>x.execute());db.exec('COMMIT');return r;}catch(e){db.exec('ROLLBACK');throw e;}}}};
 return{db,env,doc:db.prepare('SELECT * FROM documents').get()};
}
test('concurrent deletes release quota once and reject deletion while publishing',async()=>{
 const {db,env,doc}=setup();let release;const wait=new Promise(r=>release=r);let calls=0;
 const first=deleteDocument(env,doc,async()=>{calls++;await wait;});await new Promise(r=>setImmediate(r));
 assert.equal(await deleteDocument(env,doc,async()=>calls++),false);release();assert.equal(await first,true);assert.equal(calls,1);assert.equal(db.prepare('SELECT bytes FROM usage').get().bytes,0);db.close();
 const active=setup('publishing');assert.equal(await deleteDocument(active.env,active.doc,async()=>assert.fail('must not remove uploading object')),false);assert.equal(active.db.prepare('SELECT bytes FROM usage').get().bytes,500);active.db.close();
});
test('successful recovery restores a missing URL without changing quota',async()=>{
 const {db,env,doc}=setup('needs_check');await recheckDocument(env,doc,async()=>({checkedAt:'2026-10-21T00:00:00Z'}));
 const row=db.prepare('SELECT * FROM documents').get();assert.equal(row.status,'ready');assert.equal(row.url,'https://s3.us-east-2.amazonaws.com/pdftourl.online/seller-pdf-v2/id/manual.pdf');assert.equal(db.prepare('SELECT bytes FROM usage').get().bytes,500);db.close();
});
