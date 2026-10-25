import {dedupe,exportDedupe} from './text-dedupe-core.js';
import {copy} from './text-dedupe-copy.js';
const c=copy[document.documentElement.lang.startsWith('zh')?'zh':'en'];
const $=id=>document.getElementById(id);let result=null,timer;
const buttons=['ddCopy','ddTxt','ddCsv'];
function update(){
 buttons.forEach(id=>$(id).disabled=true);result=null;
 try{const words=$('ddMode').value==='words';
  $('ddLineOptions').hidden=words;$('ddHint').textContent=words?c.wordHint:c.lineHint;
  result=dedupe($('ddInput').value,{mode:words?'words':'lines',ignoreCase:$('ddIgnore').checked,trim:words||$('ddTrim').checked,removeBlank:$('ddBlank').checked});
  $('ddOutput').value=result.text;
  ['total','kept','removed','blankRemoved'].forEach(k=>$('dd-'+k).textContent=result[k].toLocaleString());
  buttons.forEach(id=>$(id).disabled=result.kept===0);
  $('ddStatus').textContent=result.total?c.updated:c.empty;$('ddError').hidden=true;
 }catch{ $('ddOutput').value='';['total','kept','removed','blankRemoved'].forEach(k=>$('dd-'+k).textContent='—');$('ddError').textContent=c.limit;$('ddError').hidden=false;$('ddStatus').textContent=''; }
 document.documentElement.dataset.dedupeReady='true';
}
function schedule(){clearTimeout(timer);document.documentElement.dataset.dedupeReady='false';buttons.forEach(id=>$(id).disabled=true);timer=setTimeout(update,120);}
$('ddInput').addEventListener('input',schedule);
['ddMode','ddIgnore','ddTrim','ddBlank'].forEach(id=>$(id).addEventListener('change',()=>{clearTimeout(timer);update();}));
$('ddSample').addEventListener('click',()=>{$('ddInput').value='Hiking backpack\nwaterproof backpack\nhiking backpack\n\nlightweight hiking backpack';clearTimeout(timer);update();});
$('ddClear').addEventListener('click',()=>{$('ddInput').value='';clearTimeout(timer);update();$('ddInput').focus();});
$('ddCopy').addEventListener('click',async()=>{if(!result)return;try{await navigator.clipboard.writeText(result.text);$('ddStatus').textContent=c.copied;}catch{$('ddStatus').textContent=c.copyError;}});
for(const format of ['txt','csv'])$('dd'+(format==='txt'?'Txt':'Csv')).addEventListener('click',()=>{
 if(!result)return;const blob=new Blob([exportDedupe(result,format)],{type:format==='csv'?'text/csv;charset=utf-8':'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='kjamz-deduplicated-'+result.mode+'.'+format;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
update();
