import test from 'node:test';import assert from 'node:assert/strict';
import {compareText,exportComparison} from '../public/assets/text-compare-core.js';
const left=r=>r.ops.map(o=>o.before).join(''),right=r=>r.ops.map(o=>o.after).join('');
test('line substitutions preserve both sides and count contiguous changes',()=>{const r=compareText('alpha\nbeta\nlast','alpha\ngamma\nlast');assert.equal(left(r),'alpha\nbeta\nlast');assert.equal(right(r),'alpha\ngamma\nlast');assert.equal(r.added,1);assert.equal(r.deleted,1);assert.ok(r.ops.some(o=>o.type==='equal'&&o.before==='alpha\n'));});
test('word diff retains spaces, punctuation and Chinese text',()=>{const r=compareText('Red shoes, 好看的鞋。','Blue shoes, 舒适的鞋。',{mode:'words'});assert.equal(left(r),'Red shoes, 好看的鞋。');assert.equal(right(r),'Blue shoes, 舒适的鞋。');assert.ok(r.ops.some(o=>o.type==='equal'&&o.before.includes('shoes')));});
test('ignore case and whitespace keep original forms in equal operations',()=>{let r=compareText(' RED  shoes \r\nnext','red shoes\nnext',{ignoreCase:true,ignoreWhitespace:true});assert.equal(r.added+r.deleted,0);assert.equal(left(r),' RED  shoes \nnext');assert.equal(right(r),'red shoes\nnext');r=compareText(' red\n shoes  ','RED shoes',{mode:'words',ignoreCase:true,ignoreWhitespace:true});assert.equal(r.added+r.deleted,0);assert.equal(left(r),' red\n shoes  ');assert.equal(right(r),'RED shoes');assert.ok(compareText('red\nshoes','red shoes',{ignoreWhitespace:true}).added>0);});
test('NFC equivalence does not rewrite display text',()=>{const r=compareText('cafe\u0301','café',{mode:'words'});assert.equal(r.added+r.deleted,0);assert.equal(left(r),'cafe\u0301');assert.equal(right(r),'café');});
test('empty, insertion, deletion and newline normalization',()=>{assert.deepEqual(compareText('','').ops,[]);let r=compareText('','a\nb');assert.equal(r.added,1);assert.equal(right(r),'a\nb');r=compareText('old','');assert.equal(r.deleted,1);assert.equal(left(r),'old');assert.equal(compareText('a\rb\r\n','a\nb\n').added,0);});
test('bounded coarse fallback is truthful and input limits reject',()=>{const a=Array.from({length:1800},(_,i)=>'old'+i).join('\n'),b=Array.from({length:1800},(_,i)=>'new'+i).join('\n'),r=compareText(a,b);assert.equal(r.coarse,true);assert.equal(left(r),a);assert.equal(right(r),b);assert.throws(()=>compareText('x'.repeat(100001),''),/LIMIT/);assert.throws(()=>compareText('a','b',{mode:'bad'}),/OPTIONS/);});
test('plain TXT report includes literal user text, rules and both originals',()=>{const r=compareText('<script>x</script>','=SUM(A1)',{mode:'words'}),report=exportComparison(r);assert.ok(report.includes('<script>x</script>'));assert.ok(report.includes('=SUM(A1)'));assert.ok(report.includes('Before'));assert.ok(report.includes('After'));assert.ok(report.includes('words'));});
test('deterministic randomized comparisons always reconstruct both versions',()=>{let seed=17;const rand=n=>(seed=(seed*1664525+1013904223)>>>0)%n,units=['red','blue',' ', '\n','中文','cafe\u0301','!'];for(let i=0;i<80;i++){const a=Array.from({length:rand(18)},()=>units[rand(units.length)]).join(''),b=Array.from({length:rand(18)},()=>units[rand(units.length)]).join('');for(const mode of ['lines','words']){const r=compareText(a,b,{mode,ignoreCase:i%2===0,ignoreWhitespace:i%3===0});assert.equal(left(r),a);assert.equal(right(r),b);}}});
test('small line comparisons match an independent minimal-edit oracle',()=>{
 let seed=29;const rand=n=>(seed=(seed*1103515245+12345)>>>0)%n;
 for(let run=0;run<100;run++){
  const a=Array.from({length:rand(7)},()=>String(rand(4))+'\n'),b=Array.from({length:rand(7)},()=>String(rand(4))+'\n');
  const dp=Array.from({length:a.length+1},()=>Array(b.length+1).fill(0));for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)dp[i][j]=a[i-1]===b[j-1]?dp[i-1][j-1]+1:Math.max(dp[i-1][j],dp[i][j-1]);
  const r=compareText(a.join(''),b.join(''));const actual=r.ops.filter(o=>o.type!=='equal').reduce((n,o)=>n+((o.before||o.after).match(/\n/g)||[]).length,0);assert.equal(actual,a.length+b.length-2*dp[a.length][b.length]);
 }
});
test('line whitespace-ignore disregards a whitespace-only final fragment but keeps newlines',()=>{
 for(const [a,b] of [['','   '],['a\n','a\n\t  ']]){const r=compareText(a,b,{ignoreWhitespace:true});assert.equal(r.added+r.deleted,0);assert.equal(left(r),a);assert.equal(right(r),b);}
 assert.ok(compareText('','\n',{ignoreWhitespace:true}).added>0);
});
test('character limit agrees with visible Unicode code-point counts',()=>{
 const text='😀'.repeat(50001),r=compareText(text,'');assert.equal(r.before,text);assert.equal(r.deleted,1);
 assert.throws(()=>compareText('😀'.repeat(100001),''),/LIMIT/);
});
