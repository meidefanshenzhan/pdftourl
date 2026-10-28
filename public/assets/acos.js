import {calculate,exportCalculation} from './acos-core.js';import {copy} from './acos-copy.js';
const zh=document.documentElement.lang.startsWith('zh'),c=copy[zh?'zh':'en'],$=id=>document.getElementById(id);let result=null,input=null;
const keys=['price','product','freight','fulfillment','commission','other','cvr','cpc','target'],optional=['cpc','target'];
const pct=new Set(['breakEvenAcos','contributionMargin','targetAcos','acos','profitMargin']),ratio=new Set(['breakEvenRoas','roas']);
function money(n){const fmt=x=>new Intl.NumberFormat(zh?'zh-CN':'en-US',{style:'currency',currency:$('ac-currency').value,minimumFractionDigits:2,maximumFractionDigits:4}).format(x);return n>0&&n<.0001?'< '+fmt(.0001):n<0&&n>-.0001?'> '+fmt(-.0001):fmt(n);}
function format(key,value){if(value===null)return '—';if(pct.has(key))return new Intl.NumberFormat(zh?'zh-CN':'en-US',{maximumFractionDigits:4}).format(value)+'%';if(ratio.has(key))return new Intl.NumberFormat('en-US',{maximumFractionDigits:4}).format(value)+'×';return money(value);}
function refresh(){
 result=null;['acCopy','acCsv','acTxt'].forEach(id=>$(id).disabled=true);document.querySelectorAll('[data-result]').forEach(el=>el.textContent='—');keys.forEach(k=>$('ac-'+k).removeAttribute('aria-invalid'));$('acError').hidden=true;$('acTargetError').hidden=true;$('acStatus').textContent=c.empty;$('acResults').dataset.state='empty';
 input={currency:$('ac-currency').value,commissionMode:$('ac-commissionMode').value};for(const k of keys){const raw=$('ac-'+k).value.trim();input[k]=raw===''?(optional.includes(k)?null:['price','product','cvr'].includes(k)?null:0):Number(raw);}
 try{result=calculate(input);document.querySelectorAll('[data-result]').forEach(el=>el.textContent=format(el.dataset.result,result[el.dataset.result]));$('acStatus').textContent=c.statuses[result.status];$('acResults').dataset.state=result.status;$('acTargetError').hidden=result.targetFeasible!==false;['acCopy','acCsv','acTxt'].forEach(id=>$(id).disabled=false);}
 catch(e){if(e.field&&(e.message!=='EMPTY'||keys.some(k=>$('ac-'+k).value!=='')))$('ac-'+e.field)?.setAttribute('aria-invalid','true');if(e.message!=='EMPTY'){$('acError').textContent=c.errors[e.message]||c.errors.RANGE;$('acError').hidden=false;}}
 document.documentElement.dataset.acosReady='true';
}
keys.forEach(k=>$('ac-'+k).addEventListener('input',refresh));['currency','commissionMode'].forEach(k=>$('ac-'+k).addEventListener('change',refresh));
$('acSample').addEventListener('click',()=>{const sample={price:30,product:10,freight:1,fulfillment:2,commission:15,other:.5,cvr:10,cpc:.6,target:6};keys.forEach(k=>$('ac-'+k).value=sample[k]);$('ac-currency').value='USD';$('ac-commissionMode').value='percent';refresh();});
$('acClear').addEventListener('click',()=>{keys.forEach(k=>$('ac-'+k).value='');refresh();$('ac-price').focus();});
const labels={...c.fields,...c.metrics};
$('acCopy').addEventListener('click',async()=>{if(!result)return;try{await navigator.clipboard.writeText(exportCalculation(input,result,'txt',labels));$('acStatus').textContent=c.copied;}catch{$('acStatus').textContent=c.copyError;}});
for(const type of ['csv','txt'])$('ac'+(type==='csv'?'Csv':'Txt')).addEventListener('click',()=>{if(!result)return;const url=URL.createObjectURL(new Blob([exportCalculation(input,result,type,labels)],{type:type==='csv'?'text/csv;charset=utf-8':'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='kjamz-advertising-calculation.'+type;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
refresh();
