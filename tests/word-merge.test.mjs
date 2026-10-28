import test from 'node:test';import assert from 'node:assert/strict';
import {estimate,combine,exportMerge} from '../public/assets/word-merge-core.js';
test('cartesian product of two phrase lists preserves order and whole phrases',()=>{
 const r=combine(['hiking\ncamping','backpack\ntravel bag']);assert.deepEqual(r.rows,['hiking backpack','hiking travel bag','camping backpack','camping travel bag']);assert.equal(r.candidateCount,4);
});
test('optional third group, reverse order, separator and literal affixes',()=>{
 const r=combine(['red','shoe','men\nwomen'],{third:true,reverse:true,separator:'-',prefix:'buy ',suffix:' now'});assert.deepEqual(r.rows,['buy men-shoe-red now','buy women-shoe-red now']);
 assert.throws(()=>combine(['red','shoe',''],{third:true}),/EMPTY/);
 assert.equal(combine(['red','shoe','ignored']).text,'red shoe');
});
test('trimming blanks, Unicode and optional case-insensitive dedupe',()=>{
 const r=combine([' Red\nred\n\n蓝色 ','bag\nbag']);assert.deepEqual(r.rows,['Red bag','蓝色 bag']);assert.equal(r.candidateCount,2);
 assert.equal(combine(['a\na','b'],{deduplicate:false}).rows.length,2);
 assert.equal(combine(['café\ncafe\u0301','包']).rows.length,1);
});
test('final joined duplicates removed without changing count estimate',()=>{
 const r=combine(['a\nab','bc\nc'],{separator:''});assert.equal(r.candidateCount,4);assert.deepEqual(r.rows,['abc','ac','abbc']);assert.equal(r.duplicatesRemoved,1);
});
test('limits preflight and never return silently truncated results',()=>{
 assert.equal(estimate(['','']).candidateCount,0);assert.throws(()=>combine(['a','']),/EMPTY/);
 const list=Array.from({length:225},(_,i)=>'word'+i).join('\n');assert.throws(()=>combine([list,list]),/COUNT_LIMIT/);
 assert.throws(()=>combine(['a'.repeat(50001),'b']),/INPUT_LIMIT/);
 const a=Array.from({length:200},(_,i)=>'x'.repeat(200)+i).join('\n'),b=Array.from({length:200},(_,i)=>'b'+i).join('\n');assert.throws(()=>combine([a,b]),/OUTPUT_LIMIT/);
 assert.throws(()=>combine(['a','b'],{separator:'x'.repeat(21)}),/OPTION_LIMIT/);
});
test('exports include all results, escape CSV and neutralize formulas',()=>{
 const r=combine(['=1+1\n"bag,red"','x']);const csv=exportMerge(r,'csv');assert.ok(csv.startsWith('\ufeff'));assert.ok(csv.includes("'=1+1 x"));assert.ok(csv.includes('""bag,red""'));assert.equal(exportMerge(r,'txt'),r.text);
});
