const overLimit=s=>s.length>200000||(s.length>100000&&[...s].length>100000);
const segmenter=new Intl.Segmenter('en',{granularity:'word'}),newline=s=>s.replace(/\r\n|\r/g,'\n');
function tokenize(text,o){const key=s=>{let value=s.normalize('NFC');if(o.ignoreCase)value=value.toLowerCase();if(o.ignoreWhitespace&&o.mode==='lines'){const end=value.endsWith('\n');value=(end?value.slice(0,-1):value).trim().replace(/\s+/gu,' ')+(end?'\n':'');}return value;};
 if(o.mode==='lines'){const units=(text.match(/[^\n]*\n|[^\n]+$/g)||[]).map(text=>({text,key:key(text)}));let padding='';if(o.ignoreWhitespace&&units.at(-1)?.key===''){const last=units.pop();if(units.length)units.at(-1).text+=last.text;else padding=last.text;}return {units,padding};}
 const units=[];let padding='';for(const {segment} of segmenter.segment(text)){if(o.ignoreWhitespace&&/^\s+$/u.test(segment)){padding+=segment;continue;}units.push({text:padding+segment,key:key(segment)});padding='';}if(units.length){units.at(-1).text+=padding;padding='';}return {units,padding};
}
function myers(a,b){if(a.length+b.length>20000)return null;const trace=[];let steps=0;
 for(let d=0;d<=Math.min(a.length+b.length,1024);d++){const cur=new Int32Array(2*d+3),prev=trace[d-1],at=k=>prev?.[k+d]??-1;
  for(let k=-d;k<=d;k+=2){if(++steps>1500000)return null;let x=d===0?0:k===-d||k!==d&&at(k-1)<at(k+1)?at(k+1):at(k-1)+1,y=x-k;
   while(x<a.length&&y<b.length&&a[x].key===b[y].key){x++;y++;if(++steps>1500000)return null;}cur[k+d+1]=x;
   if(x>=a.length&&y>=b.length){trace.push(cur);const out=[];let bx=a.length,by=b.length;for(let depth=d;depth>0;depth--){const p=trace[depth-1],get=k=>p[k+depth]??-1,k=bx-by,pk=k===-depth||k!==depth&&get(k-1)<get(k+1)?k+1:k-1,px=get(pk),py=px-pk;while(bx>px&&by>py){out.push({type:'equal',before:a[--bx].text,after:b[--by].text});}if(bx===px)out.push({type:'insert',before:'',after:b[--by].text});else out.push({type:'delete',before:a[--bx].text,after:''});}while(bx>0&&by>0)out.push({type:'equal',before:a[--bx].text,after:b[--by].text});return out.reverse();}
  }trace.push(cur);
 }return null;
}
function group(ops){const grouped=[];for(const op of ops){if(!op.before&&!op.after)continue;const last=grouped.at(-1);if(last?.type===op.type){last.before+=op.before;last.after+=op.after;}else grouped.push({...op});}return grouped;}
export function compareText(before,after,options={}){const o={mode:'lines',ignoreCase:false,ignoreWhitespace:false,...options};if(!['lines','words'].includes(o.mode))throw Error('OPTIONS');if(overLimit(before)||overLimit(after))throw Error('LIMIT');before=newline(before);after=newline(after);
 if(before===after)return {before,after,options:o,ops:before?[{type:'equal',before,after}]:[],added:0,deleted:0,coarse:false};
 const a=tokenize(before,o),b=tokenize(after,o),aa=a.units,bb=b.units;let head=0,tail=0;while(head<aa.length&&head<bb.length&&aa[head].key===bb[head].key)head++;while(tail<aa.length-head&&tail<bb.length-head&&aa[aa.length-1-tail].key===bb[bb.length-1-tail].key)tail++;
 const x=aa.slice(head,aa.length-tail),y=bb.slice(head,bb.length-tail),coarseOps=()=>[{type:'delete',before:x.map(t=>t.text).join(''),after:''},{type:'insert',before:'',after:y.map(t=>t.text).join('')}];let middle,coarse=false;
 if(!x.length||!y.length)middle=coarseOps();else{middle=myers(x,y);if(!middle||middle.length>4096){middle=coarseOps();coarse=true;}}
 const prefix={type:'equal',before:a.padding+aa.slice(0,head).map(t=>t.text).join(''),after:b.padding+bb.slice(0,head).map(t=>t.text).join('')},suffix={type:'equal',before:aa.slice(aa.length-tail).map(t=>t.text).join(''),after:bb.slice(bb.length-tail).map(t=>t.text).join('')};
 const ops=group([prefix,...middle,suffix]);return {before,after,options:o,ops,added:ops.filter(x=>x.type==='insert').length,deleted:ops.filter(x=>x.type==='delete').length,coarse};
}
export function exportComparison(result,{before='Before',after='After',changes='Changes',rules='Rules',ruleText=JSON.stringify(result.options),coarse='Large differences displayed as merged blocks'}={}){const chunks=result.ops.filter(o=>o.type!=='equal').map(o=>(o.type==='delete'?'- ':'+ ')+(o.before||o.after));return rules+': '+ruleText+'\n'+(result.coarse?coarse+'\n':'')+'\n=== '+before+' ===\n'+result.before+'\n\n=== '+after+' ===\n'+result.after+'\n\n=== '+changes+' ===\n'+chunks.join('\n');}
