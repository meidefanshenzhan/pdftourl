export const MAX_COMBINATIONS=50000,MAX_OUTPUT=5000000,MAX_LIST=50000;
function prepare(lists,options){
 const o={third:false,reverse:false,separator:' ',prefix:'',suffix:'',deduplicate:true,...options};
 if(o.separator.length>20||o.prefix.length>120||o.suffix.length>120||/[\r\n]/.test(o.separator+o.prefix+o.suffix))throw Error('OPTION_LIMIT');
 const groups=Array.from({length:o.third?3:2},(_,i)=>{
  const text=lists[i]||'';if(text.length>MAX_LIST)throw Error('INPUT_LIMIT');
  let lines=text.split(/\r\n|\n|\r/u).map(x=>x.trim()).filter(Boolean);
  if(o.deduplicate){const seen=new Set();lines=lines.filter(x=>{const key=x.normalize('NFC').toLowerCase();if(seen.has(key))return false;seen.add(key);return true;});}return lines;
 });return {o,groups};
}
export function estimate(lists,options={}){
 const {o,groups}=prepare(lists,options),counts=groups.map(x=>x.length),candidateCount=counts.reduce((a,b)=>a*b,1);
 const charCount=candidateCount===0?0:groups.reduce((sum,g,i)=>sum+g.reduce((n,s)=>n+s.length,0)*counts.reduce((a,b,j)=>i===j?a:a*b,1),0)+candidateCount*(o.prefix.length+o.suffix.length+(groups.length-1)*o.separator.length)+candidateCount-1;
 return {candidateCount,charCount,counts,valid:counts.every(Boolean)};
}
export function combine(lists,options={}){
 const stats=estimate(lists,options);if(!stats.valid)throw Error('EMPTY');if(stats.candidateCount>MAX_COMBINATIONS)throw Error('COUNT_LIMIT');if(stats.charCount>MAX_OUTPUT)throw Error('OUTPUT_LIMIT');
 const {o,groups}=prepare(lists,options),rows=[],seen=new Set();let duplicatesRemoved=0;
 for(const a of groups[0])for(const b of groups[1])for(const c of (o.third?groups[2]:[null])){
  const parts=c===null?[a,b]:[a,b,c];if(o.reverse)parts.reverse();const value=o.prefix+parts.join(o.separator)+o.suffix;
  if(o.deduplicate){const key=value.normalize('NFC').toLowerCase();if(seen.has(key)){duplicatesRemoved++;continue;}seen.add(key);}rows.push(value);
 }
 return {...stats,rows,text:rows.join('\n'),duplicatesRemoved};
}
export function exportMerge(result,format){
 if(format==='txt')return result.text;
 const cell=v=>'"'+(/^[\s]*[=+\-@]/u.test(v)?"'"+v:v).replaceAll('"','""')+'"';
 return '\ufeff'+['"Keyword"',...result.rows.map(cell)].join('\r\n');
}
