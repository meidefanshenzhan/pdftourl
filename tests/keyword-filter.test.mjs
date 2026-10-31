import test from 'node:test';
import assert from 'node:assert/strict';
import {filterText,exportFilter} from '../public/assets/keyword-filter-core.js';
test('remove literal whole terms and clean resulting horizontal spacing',()=>{
 assert.equal(filterText('Red shoes and red bags','red',{mode:'remove'}).text,'shoes and bags');
 assert.equal(filterText('C++ and a.b and axb','C++\na.b',{whole:false}).text,'and and axb');
});
test('Unicode boundaries and case settings preserve unmatched words',()=>{
 assert.equal(filterText('cat cats bobcat CAT cat_1','cat').text,'cats bobcat cat_1');
 assert.equal(filterText('Red red','red',{ignoreCase:false}).text,'Red');
 assert.equal(filterText('café cafés','café').text,'cafés');
 assert.equal(filterText('你好 你好世界','你好').text,'你好世界');
});
test('line filters any/all preserve original lines and normalize line endings',()=>{
 const t='red shoes\r\nblue shoes\r\nred bag';
 assert.equal(filterText(t,'red\nshoes',{mode:'keep',match:'all'}).text,'red shoes');
 assert.equal(filterText(t,'red\nshoes',{mode:'exclude'}).text,'');
 assert.equal(filterText(t,'red',{mode:'exclude'}).text,'blue shoes');
});
test('empty filters leave text intact and line removal is counted',()=>{
 assert.equal(filterText(' x \n\n y ','').text,' x \n\n y ');
 const r=filterText('a\nb\na','a',{mode:'exclude'});assert.equal(r.removedLines,2);assert.equal(r.matches,2);
 assert.equal(filterText('a','a',{mode:'keep'}).text,'a');
});
test('phrases and overlapping terms are literal and longest first',()=>{
 assert.equal(filterText('red shoes red','red\nred shoes').text,'');
 assert.equal(filterText('red\nshoes','red shoes').text,'red\nshoes');
});
test('NFC terms match canonically equivalent text without changing unrelated content',()=>{
 assert.equal(filterText('cafe\u0301 tea','café').text,'tea');
 assert.equal(filterText('cafe\u0301 tea','zzz').text,'cafe\u0301 tea');
});
test('bounded input rejects before processing and CSV escapes formula payloads',()=>{
 assert.throws(()=>filterText('x'.repeat(200001),'x'),/LIMIT/);
 assert.throws(()=>filterText('x',Array.from({length:201},(_,i)=>'w'+i).join('\n')),/LIMIT/);
 assert.throws(()=>filterText('x','x'.repeat(10001)),/LIMIT/);
 const r=filterText('=SUM(A1)\na,"b"','');
 assert.match(exportFilter(r,'csv'),/"'=SUM\(A1\)"/);assert.match(exportFilter(r,'csv'),/"a,""b"""/);
 assert.equal(exportFilter(r,'txt'),r.text);
});
test('empty filter preserves CRLF exactly and large line lists remain valid',()=>{
 assert.equal(filterText(' a\r\n b\r','').text,' a\r\n b\r');
 const text='a\n'.repeat(99999);assert.equal(filterText(text,'x',{mode:'exclude'}).text,text);
});
