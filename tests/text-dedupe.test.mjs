import test from 'node:test';
import assert from 'node:assert/strict';
import {dedupe,exportDedupe} from '../public/assets/text-dedupe-core.js';
test('lines preserve phrases, order and first spelling',()=>{
 const r=dedupe('Hiking backpack\r\nwaterproof backpack\r\nhiking backpack ');
 assert.equal(r.text,'Hiking backpack\nwaterproof backpack');assert.equal(r.removed,1);assert.equal(r.total,3);
 assert.equal(dedupe(' A\na\nA',{ignoreCase:false}).text,'A\na');
 assert.equal(dedupe(' A\nA',{trim:false}).kept,2);
});
test('words keep first surface form, punctuation boundary and inflections',()=>{
 const r=dedupe('Bag, bags bag BAG hiking-backpack hiking-backpack',{mode:'words'});
 assert.equal(r.text,'Bag, bags hiking-backpack');assert.equal(r.removed,3);
 assert.equal(dedupe("seller’s seller’s seller's",{mode:'words'}).kept,2);
});
test('blank lines and empty input have explicit behavior',()=>{
 assert.equal(dedupe('').total,0);assert.equal(dedupe(' \n\n').kept,0);
 assert.equal(dedupe('a\n\na\n\n',{removeBlank:false}).text,'a\n');
 assert.equal(dedupe(' \na').blankRemoved,1);
});
test('Unicode normalization compares canonical forms without stripping accents',()=>{
 assert.equal(dedupe('café\ncafe\u0301\ncafe\n背包\n背包').kept,3);
 assert.equal(dedupe('<script>\n<script>').text,'<script>');
});
test('limits fail clearly, never silently truncate',()=>{
 assert.throws(()=>dedupe('a'.repeat(500001)),/LIMIT/);
 assert.equal(dedupe('a'.repeat(500000)).kept,1);
});
test('CSV escapes cells and neutralizes spreadsheet formula prefixes',()=>{
 const r=dedupe('=1+1\n"bag, red"\n@SUM(A1)');
 const csv=exportDedupe(r,'csv');assert.ok(csv.startsWith('\ufeff'));
 assert.ok(csv.includes('"\'=1+1"'));assert.ok(csv.includes('""bag, red""'));assert.ok(csv.includes('"\'@SUM(A1)"'));
 assert.equal(exportDedupe(r,'txt'),r.text);
});
