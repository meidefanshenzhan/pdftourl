import test from 'node:test';import assert from 'node:assert/strict';import worker from '../src/worker.js';
test('old duplicate tool paths redirect once to new canonical URLs with query retained',async()=>{
 for(const lang of ['zh','en'])for(const host of ['kjamz.com','www.kjamz.com','seller-pdf-links.zheciyaojizhuwqw.workers.dev'])for(const suffix of ['','/','/index.html'])for(const method of ['GET','HEAD']){
  const r=await worker.fetch(new Request('https://'+host+'/'+lang+'/text-dedupe'+suffix+'?source=bookmark',{method}),{});
  assert.equal(r.status,301);assert.equal(r.headers.get('location'),'https://kjamz.com/'+lang+'/remove-duplicates/?source=bookmark');
 }
});
test('new duplicate tool path serves assets without redirect',async()=>{
 const r=await worker.fetch(new Request('https://kjamz.com/en/remove-duplicates/'),{ASSETS:{fetch:async()=>new Response('tool',{status:200})}});assert.equal(r.status,200);assert.equal(await r.text(),'tool');
});
