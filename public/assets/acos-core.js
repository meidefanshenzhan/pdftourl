const fields=['price','product','freight','fulfillment','commission','other','cvr','cpc','target'];
const fail=(code,field)=>{throw Object.assign(Error(code),{field});};
export function calculate(input){
 const v={freight:0,fulfillment:0,commission:0,other:0,cpc:null,target:null,commissionMode:'percent',currency:'USD',...input};
 if(!['USD','EUR','GBP','CNY','JPY'].includes(v.currency))fail('RANGE','currency');
 if(!['percent','amount'].includes(v.commissionMode))fail('RANGE','commissionMode');
 for(const key of fields){const n=v[key];if((key==='cpc'||key==='target')&&n===null)continue;if(n===null||n===undefined||n==='')fail('EMPTY',key);if(typeof n!=='number'||!Number.isFinite(n)||n<0||n>1e9)fail('RANGE',key);}
 if(v.price<=0)fail('RANGE','price');if(v.cvr>100||(v.cvr>0&&v.cvr<.0001))fail('RANGE','cvr');if(v.commissionMode==='percent'&&v.commission>100)fail('RANGE','commission');
 const fee=v.commissionMode==='percent'?v.price*v.commission/100:v.commission,totalCost=v.product+v.freight+v.fulfillment+fee+v.other,rawContribution=v.price-totalCost,epsilon=Number.EPSILON*Math.max(v.price,totalCost)*16,contribution=Math.abs(rawContribution)<=epsilon?0:rawContribution,rate=v.cvr/100;
 const targetFeasible=v.target===null?null:v.target<=contribution+epsilon,remaining=targetFeasible?Math.max(0,contribution-v.target):null;
 const cpa=v.cpc!==null&&rate>0?v.cpc/rate:null,rawProfit=cpa===null?null:contribution-cpa,profit=rawProfit===null?null:Math.abs(rawProfit)<=Number.EPSILON*Math.max(Math.abs(contribution),Math.abs(cpa))*16?0:rawProfit;
 const status=contribution<0?'preAdLoss':contribution===0?'noBudget':v.cpc===null?'ready':rate===0?'noConversions':profit===0?'breakEven':profit>0?'profit':'loss';
 const result={fee,totalCost,contribution,contributionMargin:contribution/v.price*100,breakEvenAcos:contribution>=0?contribution/v.price*100:null,breakEvenCpc:contribution>=0?contribution*rate:null,breakEvenRoas:contribution>0?v.price/contribution:null,targetFeasible,targetAcos:remaining===null?null:remaining/v.price*100,targetCpc:remaining===null?null:remaining*rate,cpa,profit,profitMargin:profit===null?null:profit/v.price*100,acos:cpa===null?null:cpa/v.price*100,roas:v.cpc!==null&&v.cpc>0?v.price*rate/v.cpc:null,status};
 for(const [key,value] of Object.entries(result))if(typeof value==='number'&&!Number.isFinite(value))fail('RANGE',key==='roas'?'cpc':'price');
 return result;
}
export function exportCalculation(input,result,format,labels={}){
 const rows=[['Model','currency',input.currency],['Model','assumption','one item per order; same currency; CVR = attributed orders / ad clicks; included per-order costs only'],...['price','product','freight','fulfillment','commissionMode','commission','other','cvr','cpc','target'].map(k=>['Input',labels[k]||k,input[k]??'not supplied']),...Object.entries(result).map(([k,v])=>['Result',labels[k]||k,v??'not defined'])];
 if(format==='txt')return rows.map(([section,k,v])=>section+' / '+k+': '+v).join('\n');
 const cell=x=>'"'+String(x).replaceAll('"','""')+'"';return '\ufeff'+[['Section','Metric','Value'],...rows].map(row=>row.map(cell).join(',')).join('\r\n');
}
