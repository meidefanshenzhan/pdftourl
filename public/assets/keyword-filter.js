import {filterText,exportFilter} from './keyword-filter-core.js';
import {copy} from './keyword-filter-copy.js';
const c=copy[document.documentElement.lang.startsWith('zh')?'zh':'en'],$=id=>document.getElementById(id),buttons=['kfCopy','kfTxt','kfCsv'];let result=null,timer;
function update(){clearTimeout(timer);result=null;buttons.forEach(id=>$(id).disabled=true);const remove=$('kfMode').value==='remove';$('kfCleanupLabel').hidden=!remove;$('kfLogicLabel').hidden=remove;
try{result=filterText($('kfInput').value,$('kfTerms').value,{mode:$('kfMode').value,ignoreCase:$('kfIgnore').checked,whole:$('kfWhole').checked,match:$('kfLogic').value,cleanup:$('kfCleanup').checked});$('kfOutput').value=result.text;['totalLines','keptLines','removedLines','matches'].forEach(k=>$('kf-'+k).textContent=result[k].toLocaleString());buttons.forEach(id=>$(id).disabled=!result.text);$('kfError').hidden=true;$('kfStatus').textContent=$('kfInput').value?c.updated:c.empty;}catch{$('kfOutput').value='';['totalLines','keptLines','removedLines','matches'].forEach(k=>$('kf-'+k).textContent='—');$('kfError').textContent=c.limit;$('kfError').hidden=false;$('kfStatus').textContent='';}document.documentElement.dataset.filterReady='true';}
function schedule(){clearTimeout(timer);result=null;buttons.forEach(id=>$(id).disabled=true);document.documentElement.dataset.filterReady='false';timer=setTimeout(update,180);}
for(const id of ['kfInput','kfTerms'])$(id).addEventListener('input',schedule);
for(const id of ['kfMode','kfIgnore','kfWhole','kfLogic','kfCleanup'])$(id).addEventListener('change',update);
$('kfSample').addEventListener('click',()=>{$('kfInput').value='red shoes\nblue running shoes\nfree running shoes\nused red shoes\nred shoe bag';$('kfTerms').value='free\nused';$('kfMode').value='exclude';update();});
$('kfClear').addEventListener('click',()=>{$('kfInput').value='';$('kfTerms').value='';update();$('kfInput').focus();});
$('kfCopy').addEventListener('click',async()=>{if(!result)return;try{await navigator.clipboard.writeText(result.text);$('kfStatus').textContent=c.copied;}catch{$('kfStatus').textContent=c.copyError;}});
for(const format of ['txt','csv'])$('kf'+(format==='txt'?'Txt':'Csv')).addEventListener('click',()=>{if(!result)return;const url=URL.createObjectURL(new Blob([exportFilter(result,format)],{type:format==='csv'?'text/csv;charset=utf-8':'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='kjamz-filtered-text.'+format;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
update();
