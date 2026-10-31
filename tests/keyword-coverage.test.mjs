import test from 'node:test';import assert from 'node:assert/strict';
import {analyzeCoverage,highlightRanges,exportCoverage,filterRows} from '../public/assets/keyword-coverage-core.js';
test('literal phrase, Unicode whole boundaries and case matching',()=>{
 const r=analyzeCoverage('red shoes\ncat\nC++\ncafé',{title:'RED  shoes for cats, C++ and cafe\u0301'});
 assert.deepEqual(r.rows.map(x=>x.covered),[true,false,true,true]);assert.equal(r.covered,3);assert.equal(r.rate,75);
 assert.equal(analyzeCoverage('red',{title:'RED'},{ignoreCase:false}).covered,0);
 assert.equal(analyzeCoverage('cat',{title:'cats'},{whole:false}).covered,1);
});
test('phrase does not span fields; all-word mode requires a single field',()=>{
 assert.equal(analyzeCoverage('red shoes',{title:'red',bullet1:'shoes'}).covered,0);
 assert.equal(analyzeCoverage('red shoes',{title:'red',bullet1:'shoes'},{mode:'words'}).covered,0);
 assert.equal(analyzeCoverage('red shoes',{title:'Shoes in red'},{mode:'words'}).covered,1);
 assert.equal(analyzeCoverage('red red shoes',{title:'red shoes'},{mode:'words'}).covered,1);
 assert.equal(analyzeCoverage('red shoes',{title:'red-shoes'}).covered,0);
});
test('scope and matched field reporting are accurate',()=>{
 const f={title:'red',bullet1:'shoes',searchTerms:'red shoes'};
 assert.deepEqual(analyzeCoverage('red shoes',f).rows[0].fields,['searchTerms']);
 assert.equal(analyzeCoverage('red shoes',f,{scope:'front'}).covered,0);
 assert.equal(analyzeCoverage('shoes',f,{scope:'title'}).covered,0);
 assert.deepEqual(analyzeCoverage('red',f,{scope:'backend'}).rows[0].fields,['searchTerms']);
});
test('deduplicate normalized terms and preserve first spelling/order',()=>{
 const r=analyzeCoverage(' Red  shoes \nred shoes\n\ncafe\u0301\ncafé',{title:'red shoes café'});
 assert.equal(r.total,2);assert.equal(r.duplicates,2);assert.deepEqual(r.rows.map(x=>x.keyword),['Red shoes','café']);
 assert.equal(analyzeCoverage('Red\nred',{}, {ignoreCase:false}).total,2);
});
test('highlight offsets refer to original Unicode text and full fields only',()=>{
 const text='x cafe\u0301\n\t shoes!';const ranges=highlightRanges(text,'café shoes');
 assert.deepEqual(ranges,[[2,15]]);assert.equal(text.slice(...ranges[0]),'cafe\u0301\n\t shoes');
 assert.deepEqual(highlightRanges('red jacket','red shoes',{mode:'words'}),[]);
 assert.deepEqual(highlightRanges('<b>red</b> shoes','red shoes',{mode:'words'}),[[3,6],[11,16]]);
});
test('filters and CSV exports handle literal HTML and formula cells safely',()=>{
 const r=analyzeCoverage('red\n=SUM(A1)\n<img>\na,"b"',{title:'red'});
 assert.equal(filterRows(r.rows,'missing','<img>').length,1);assert.equal(filterRows(r.rows,'covered','').length,1);
 const csv=exportCoverage(r.rows,'csv');assert.match(csv,/"'=SUM\(A1\)"/);assert.match(csv,/"a,""b"""/);assert.match(exportCoverage(r.rows,'txt'),/<img>/);
});
test('bounds and empty input states',()=>{
 assert.equal(analyzeCoverage('',{}).rate,0);assert.equal(analyzeCoverage('red',{}).missing,1);
 assert.throws(()=>analyzeCoverage('x'.repeat(20001),{}),/LIMIT/);
 assert.throws(()=>analyzeCoverage(Array.from({length:501},(_,i)=>'k'+i).join('\n'),{}),/LIMIT/);
 assert.throws(()=>analyzeCoverage('x',{title:'x'.repeat(100001)}),/LIMIT/);
 assert.throws(()=>analyzeCoverage('a'.repeat(201),{}),/LIMIT/);
 assert.throws(()=>analyzeCoverage('red',{}, {scope:'bad'}),/OPTIONS/);
});
