export const MAX_INPUT=500000;
export function dedupe(text,{mode='lines',ignoreCase=true,trim=true,removeBlank=true}={}){
 if(text.length>MAX_INPUT)throw new Error('LIMIT');
 const items=text===''?[]:mode==='words'?(text.match(/\S+/gu)||[]):text.split(/\r\n|\n|\r/u);
 const seen=new Set(),rows=[];let removed=0,blankRemoved=0;
 for(const raw of items){const value=trim?raw.trim():raw;
  if(mode==='lines'&&removeBlank&&!value.trim()){blankRemoved++;continue;}
  let key=value.normalize('NFC');
  if(mode==='words')key=key.replace(/^[\p{P}\p{S}]+|[\p{P}\p{S}]+$/gu,'')||key;
  if(ignoreCase)key=key.toLowerCase();
  if(seen.has(key)){removed++;continue;}seen.add(key);rows.push(value);
 }
 return {text:rows.join(mode==='words'?' ':'\n'),rows,total:items.length,kept:rows.length,removed,blankRemoved,mode};
}
export function exportDedupe(result,format){
 if(format==='txt')return result.text;
 const cell=v=>'"'+(/^[\s]*[=+\-@]/u.test(v)?"'"+v:v).replaceAll('"','""')+'"';
 return '\ufeff'+['"Item"',...result.rows.map(cell)].join('\r\n');
}
