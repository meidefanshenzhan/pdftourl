export const MAX_CHARACTERS=500_000;
const STOP=new Set('a an the and or but as at by for from in into of on onto to with without is are was were be been being am it its this that these those i me my we our you your he his she her they them their have has had do does did not no so than then too very can could will would should may might also if up out about over under each some any all both more most such only own same just other which who what when where how'.split(' '));
const segmenter=typeof Intl.Segmenter==='function'?new Intl.Segmenter(undefined,{granularity:'word'}):null;
const collator=new Intl.Collator('en',{numeric:true});
const tokenPattern=/[\p{L}\p{M}\p{N}]+(?:['’\-][\p{L}\p{M}\p{N}]+|[.,](?=\d)\d+)*/gu;
const boundary=/(?<!\d)\.|\.(?!\d)|[!?。！？;；\r\n]+/u;
function tokens(text){const matches=text.match(tokenPattern)||[];return matches.flatMap(word=>{if(!/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Thai}]/u.test(word))return [word];if(segmenter)return [...segmenter.segment(word)].filter(x=>x.isWordLike).map(x=>x.segment);return [...word].filter(c=>/[\p{L}\p{N}]/u.test(c));});}
function syllables(word){let w=word.toLowerCase().replace(/[^a-z]/g,'');if(w.length<=3)return 1;w=w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/,'').replace(/^y/,'');return Math.max(1,(w.match(/[aeiouy]{1,2}/g)||[]).length);}
function readability(words,sentences){const english=words.filter(w=>/^[a-z]+(?:['’\-][a-z]+)*$/i.test(w));if(english.length<3||english.length/Math.max(1,words.length)<.8)return null;const wc=english.length,sc=Math.max(1,sentences),sy=english.reduce((a,w)=>a+syllables(w),0),letters=english.reduce((a,w)=>a+(w.match(/[a-z]/gi)||[]).length,0);return {ease:206.835-1.015*wc/sc-84.6*sy/wc,grade:.39*wc/sc+11.8*sy/wc-15.59,ari:4.71*letters/wc+.5*wc/sc-21.43};}
export function analyzeText(input,options={}){
 const text=String(input),characters=Array.from(text).length;
 if(characters>MAX_CHARACTERS)return {error:'TOO_LONG',rows:[],denominator:0,stats:{characters}};
 const gram=[1,2,3].includes(Number(options.gram))?Number(options.gram):1;
 const normalize=w=>options.caseSensitive?w:w.toLocaleLowerCase('en');
 const groups=text.split(boundary).map(tokens).filter(g=>g.length);const words=groups.flat();
 const sentences=groups.length,paragraphs=text.trim()?text.trim().split(/\r?\n\s*\r?\n/u).filter(s=>s.trim()).length:0;
 const stats={words:words.length,characters,charactersNoSpaces:Array.from(text.replace(/\s/gu,'')).length,bytes:new TextEncoder().encode(text).length,sentences,paragraphs,lines:text?text.split(/\r\n|\n|\r/).length:0,unique:new Set(words.map(normalize)).size,readingSeconds:Math.ceil(words.length/200*60),speakingSeconds:Math.ceil(words.length/130*60),readability:readability(words,sentences)};
 const excluded=new Set(String(options.excluded||'').split(/[,，;；\r\n]+/).map(x=>normalize(x.trim())).filter(Boolean));
 const counts=new Map();let denominator=0;
 for(const group of groups)for(let i=0;i<=group.length-gram;i++){denominator++;const parts=group.slice(i,i+gram).map(normalize),term=parts.join(' ');if(options.excludeStopwords!==false&&parts.every(w=>STOP.has(w.toLowerCase())))continue;if(excluded.has(term))continue;counts.set(term,(counts.get(term)||0)+1);}
 const rows=[...counts].map(([term,count])=>({term,count,density:count/Math.max(1,denominator)*100})).sort((a,b)=>b.count-a.count||collator.compare(a.term,b.term)||(a.term<b.term?-1:a.term>b.term?1:0));
 return {stats,rows,denominator,gram,error:null,segmentation:segmenter?'intl':'fallback'};
}
export function selectRows(rows,filters={}){const search=String(filters.search||'').toLocaleLowerCase('en').trim(),min=Math.max(1,Number(filters.minCount)||1);const found=rows.filter(r=>r.count>=min&&r.term.toLocaleLowerCase('en').includes(search));const top=Math.floor(Number(filters.top));return top>0?found.slice(0,top):found;}
function safeCell(value){const s=String(value);return /^[\s]*[=+\-@]/.test(s)?"'"+s:s;}
export function exportRows(rows,format,metadata={}){const body=rows.map((r,i)=>[i+1,safeCell(r.term),r.count,r.density.toFixed(2)+'%']);if(format==='txt')return ['KJAMZ · Word Counter','Denominator: '+(metadata.denominator||0)+' | Phrase length: '+(metadata.gram||1),...(metadata.filters?['Filters: '+String(metadata.filters).replace(/[\r\n\t]/g,' ')]:[]),'Rank\tKeyword\tOccurrences\tDensity',...body.map(r=>r.map(v=>String(v).replace(/[\r\n\t]/g,' ')).join('\t'))].join('\r\n')+'\r\n';const quote=v=>'"'+String(v).replaceAll('"','""')+'"';return '\uFEFF'+[['Rank','Keyword','Occurrences','Density'],...body].map(r=>r.map(quote).join(',')).join('\r\n')+'\r\n';}
