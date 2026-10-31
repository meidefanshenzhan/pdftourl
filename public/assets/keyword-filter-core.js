const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
// Map normalized matching offsets back to original graphemes so unrelated text is retained.
const segmenter=new Intl.Segmenter(undefined,{granularity:'grapheme'});
function shadow(text){let value='',starts=[],ends=[];for(const {segment,index} of segmenter.segment(text)){const n=segment.normalize('NFC');value+=n;for(let i=0;i<n.length;i++){starts.push(index);ends.push(index+segment.length);}}return {value,starts,ends};}
export function filterText(text,termsText,{mode='remove',ignoreCase=true,whole=true,match='any',cleanup=true}={}){
 if(text.length>200000||termsText.length>10000)throw Error('LIMIT');
 if(!['remove','keep','exclude'].includes(mode)||!['any','all'].includes(match))throw Error('OPTIONS');
 const terms=[...new Set(termsText.split(/\r\n|\r|\n/).map(s=>s.trim().normalize('NFC')).filter(Boolean).map(s=>ignoreCase?s.toLowerCase():s))];
 if(terms.length>200)throw Error('LIMIT');
 const source=terms.sort((a,b)=>b.length-a.length).map(escape),flags=ignoreCase?'giu':'gu';
 const pattern=s=>whole?'(?<![\\p{L}\\p{N}_])(?:'+s+')(?![\\p{L}\\p{N}_])':s;
 const combined=terms.length?new RegExp(pattern(source.join('|')),flags):null;
 const each=mode==='remove'?[]:source.map(s=>new RegExp(pattern(s),ignoreCase?'iu':'u'));
 const lines=text===''?[]:text.split(/\r\n|\r|\n/);let matches=0,removedLines=0;const rows=[];
 for(const line of lines){
  if(!combined){rows.push(line);continue;}
  const value=line.normalize('NFC');combined.lastIndex=0;const hits=[...value.matchAll(combined)];matches+=hits.length;
  if(mode==='remove'){
   if(!hits.length){rows.push(line);continue;}
   const s=value===line?null:shadow(line);
   let out='',cursor=0;for(const hit of hits){const start=s?s.starts[hit.index]:hit.index,end=s?s.ends[hit.index+hit[0].length-1]:hit.index+hit[0].length;out+=line.slice(cursor,start);cursor=end;}out+=line.slice(cursor);
   rows.push(cleanup?out.replace(/[\t ]+/g,' ').trim():out);
  }else{const found=match==='all'?each.every(re=>re.test(value)):hits.length>0;
   if((mode==='keep'&&found)||(mode==='exclude'&&!found))rows.push(line);else removedLines++;
  }
 }
 return {text:terms.length?rows.join('\n'):text,rows,totalLines:lines.length,keptLines:rows.length,removedLines,matches,termCount:terms.length,mode};
}
export function exportFilter(result,format){if(format==='txt')return result.text;const cell=s=>'"'+(/^[\s]*[=+\-@]/u.test(s)?"'"+s:s).replaceAll('"','""')+'"';return '\ufeff'+['"Text"',...result.rows.map(cell)].join('\r\n');}
