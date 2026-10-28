import {estimate,combine,exportMerge,MAX_COMBINATIONS,MAX_OUTPUT} from './word-merge-core.js';import {copy} from './word-merge-copy.js';
const c=copy[document.documentElement.lang.startsWith('zh')?'zh':'en'],$=id=>document.getElementById(id);let result=null,revision=0;
const exports=['wmCopy','wmTxt','wmCsv'];
function inputs(){return ['wmA','wmB','wmC'].map(id=>$(id).value);}
function options(){return {third:$('wmThird').checked,reverse:$('wmOrder').value==='reverse',separator:$('wmSeparator').value==='custom'?$('wmCustom').value:$('wmSeparator').value,prefix:$('wmPrefix').value,suffix:$('wmSuffix').value,deduplicate:$('wmDedupe').checked};}
function error(code){$('wmError').textContent=c.errors[code]||c.errors.OUTPUT_LIMIT;$('wmError').hidden=false;}
function refresh(){revision++;result=null;exports.forEach(id=>$(id).disabled=true);$('wmOutput').value='';$('wmCount').textContent='0 '+c.resultCount;$('wmStatus').textContent=c.stale;$('wmError').hidden=true;
 $('wmThirdWrap').hidden=!$('wmThird').checked;$('wmLists').classList.toggle('wm-three',$('wmThird').checked);$('wmCustomWrap').hidden=$('wmSeparator').value!=='custom';
 try{const s=estimate(inputs(),options());$('wmEstimate').textContent=s.candidateCount.toLocaleString();['wmCountA','wmCountB','wmCountC'].forEach((id,i)=>$(id).textContent=(s.counts[i]||0).toLocaleString());const over=s.candidateCount>MAX_COMBINATIONS?'COUNT_LIMIT':s.charCount>MAX_OUTPUT?'OUTPUT_LIMIT':null;$('wmGenerate').disabled=!s.valid||!!over;if(over)error(over);}catch(e){$('wmGenerate').disabled=true;$('wmEstimate').textContent='—';error(e.message);}
 document.documentElement.dataset.mergeReady='true';
}
for(const id of ['wmA','wmB','wmC','wmCustom','wmPrefix','wmSuffix'])$(id).addEventListener('input',refresh);
for(const id of ['wmThird','wmOrder','wmSeparator','wmDedupe'])$(id).addEventListener('change',refresh);
$('wmGenerate').addEventListener('click',()=>{const current=revision;$('wmGenerate').disabled=true;$('wmStatus').textContent=c.generating;setTimeout(()=>{if(current!==revision)return;try{result=combine(inputs(),options());$('wmOutput').value=result.text;$('wmCount').textContent=result.rows.length.toLocaleString()+' '+c.resultCount;exports.forEach(id=>$(id).disabled=false);$('wmStatus').textContent=c.done;}catch(e){error(e.message);}finally{$('wmGenerate').disabled=false;}},0);});
$('wmSample').addEventListener('click',()=>{$('wmA').value='waterproof\nlightweight';$('wmB').value='backpack\ntravel bag';$('wmC').value='for hiking\nfor travel';$('wmThird').checked=true;$('wmOrder').value='forward';$('wmSeparator').value=' ';$('wmPrefix').value='';$('wmSuffix').value='';$('wmDedupe').checked=true;refresh();});
$('wmClear').addEventListener('click',()=>{['wmA','wmB','wmC','wmPrefix','wmSuffix','wmCustom'].forEach(id=>$(id).value='');refresh();$('wmA').focus();});
$('wmCopy').addEventListener('click',async()=>{if(!result)return;try{await navigator.clipboard.writeText(result.text);$('wmStatus').textContent=c.copied;}catch{$('wmStatus').textContent=c.copyError;}});
for(const format of ['txt','csv'])$('wm'+(format==='txt'?'Txt':'Csv')).addEventListener('click',()=>{if(!result)return;const url=URL.createObjectURL(new Blob([exportMerge(result,format)],{type:format==='csv'?'text/csv;charset=utf-8':'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='kjamz-word-merge.'+format;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
refresh();$('wmStatus').textContent=c.empty;
