import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {DatabaseSync} from 'node:sqlite';
import {identifyVisitor,reserveUpload,releaseUpload,remainingUploads} from '../src/visitors.js';
function setup(){const db=new DatabaseSync(':memory:');for(const name of ['0001.sql','0002_visitors.sql'])db.exec(fs.readFileSync(new URL('../migrations/'+name,import.meta.url),'utf8'));return{db,env:{SESSION_SECRET:'private-secret',DB:{prepare(sql){let args=[];return{bind(...a){args=a;return this;},async first(){return db.prepare(sql).get(...args)||null;},async run(){return{meta:db.prepare(sql).run(...args)};}};}}}};}
test('first three generation reservations succeed, fourth requires a code, failed generation releases slot',async()=>{
 const {db,env}=setup();for(let i=0;i<3;i++)assert.ok(await reserveUpload(env,'visitor',1000));
 assert.equal(await remainingUploads(env,'visitor',1000),0);assert.equal(await reserveUpload(env,'visitor',1000),null);
 await releaseUpload(env,'visitor',1000);assert.equal(await remainingUploads(env,'visitor',1000),1);assert.ok(await reserveUpload(env,'visitor',1000));
 assert.ok(await reserveUpload(env,'visitor',3601000));assert.equal(await remainingUploads(env,'visitor',3601000),2);db.close();
});
test('signed visitor cookie persists identity and rejects a forged identifier',async()=>{
 const env={SESSION_SECRET:'private-secret'};const first=await identifyVisitor(new Request('https://test.local/api/session'),env);
 assert.equal(first.fresh,true);const second=await identifyVisitor(new Request('https://test.local/api/session',{headers:{Cookie:'__Host-visitor='+first.token}}),env);
 assert.equal(second.id,first.id);assert.equal(second.fresh,false);
 const forged=await identifyVisitor(new Request('https://test.local/api/session',{headers:{Cookie:'__Host-visitor='+first.token+'x'}}),env);assert.notEqual(forged.id,first.id);
});
