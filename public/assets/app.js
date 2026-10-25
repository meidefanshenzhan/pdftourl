import {strings} from './strings.js';
let lang=location.pathname.startsWith('/en')?'en':'zh',unlocked=false,freeRemaining=3,visitorReady=false,files=[],records=[],usage=null,busy=false;
const $=id=>document.getElementById(id),t=k=>strings[lang][k]||k;
let toastTimer;
function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,5500);}
function errorMessage(e){return t('err'+e.message)===('err'+e.message)?t('error'):t('err'+e.message);}
async function api(path,options={}){
 const r=await fetch(path,{credentials:'same-origin',...options});let data;try{data=await r.json();}catch{throw new Error('REQUEST_FAILED');}
 if(!r.ok)throw new Error(data.error||'REQUEST_FAILED');return data;
}
function setAuth(){
 $('choose').textContent=t('choose');$('choose').disabled=!visitorReady||busy;$('start').disabled=!visitorReady||!files.length||busy;
 $('pause').hidden=true;$('historyToolbar').hidden=false;
}

function localize(){
 document.documentElement.lang=lang==='zh'?'zh-CN':'en';document.title=t('title');
 document.querySelector('meta[name="description"]').content=t('intro');
 document.querySelectorAll('[data-key]').forEach(e=>e.textContent=t(e.dataset.key));
 document.querySelectorAll('[data-placeholder]').forEach(e=>e.placeholder=t(e.dataset.placeholder));
 document.querySelectorAll('a[href^="/zh/"],a[href^="/en/"]').forEach(a=>a.setAttribute('href',a.getAttribute('href').replace(/^\/(zh|en)\//,'/'+lang+'/')));
 const zh=lang==='zh';
 document.querySelectorAll('.contact-nav').forEach(a=>a.textContent=(zh?'联系我们':'Contact Us')+' ↗');
 document.querySelectorAll('footer a[href$="/contact/"]').forEach(a=>a.textContent=zh?'联系我们':'Contact Us');
 document.querySelectorAll('footer .changelog-label').forEach(a=>a.textContent=zh?'更新日志':'Changelog');
 const foot=document.querySelector('footer>div');if(foot)foot.textContent=zh?'独立开发的跨境卖家工具，与 Amazon 无隶属或背书关系。':'Independent seller tools. Not affiliated with or endorsed by Amazon.';
 const footNav=document.querySelector('.footer-links');if(footNav)footNav.setAttribute('aria-label',zh?'站点信息':'Site information');
 $('locale').textContent=lang==='zh'?'EN':'中文';setAuth();renderQueue();renderRecords();
}
$('locale').onclick=()=>{lang=lang==='zh'?'en':'zh';history.replaceState(null,'','/'+lang+'/pdf-to-link/'+location.hash);localize();};
const openLogin=()=>{$('loginError').textContent='';$('loginDialog').showModal();$('password').focus();};
$('closeLogin').onclick=()=>$('loginDialog').close();
$('loginForm').onsubmit=async e=>{e.preventDefault();const button=e.submitter;button.disabled=true;try{
 await api('/api/unlock',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:$('password').value})});
 $('password').value='';unlocked=true;setAuth();$('loginDialog').close();await loadRecords();if(files.some(x=>x.status==='pending'||x.status==='failed'))await runQueue();
 }catch(err){$('loginError').textContent=errorMessage(err);}finally{button.disabled=false;}};
$('choose').onclick=()=>{if(busy){toast(t('queueBusy'));return;}$('fileInput').click();};
function selectFiles(input){
 if(!visitorReady){toast(t('initializing'));return;}
 if(busy){toast(t('queueBusy'));return;}
 const list=Array.from(input);if(list.length>10){toast(t('tooMany'));return;}
 files=list.map(file=>({file,status:'pending',progress:0,error:null,url:null}));renderQueue();setAuth();
}
$('fileInput').onchange=e=>{selectFiles(e.target.files);e.target.value='';};
for(const event of ['dragenter','dragover'])$('dropZone').addEventListener(event,e=>{e.preventDefault();$('dropZone').classList.add('dragging');});
for(const event of ['dragleave','drop'])$('dropZone').addEventListener(event,e=>{e.preventDefault();$('dropZone').classList.remove('dragging');});
$('dropZone').addEventListener('drop',e=>selectFiles(e.dataTransfer.files));
function button(label,action,cls=''){const b=document.createElement('button');b.textContent=label;b.className=cls;b.onclick=action;return b;}
function formatSize(bytes){return bytes>=1000000?(bytes/1000000).toFixed(1)+' MB':Math.ceil(bytes/1000)+' KB';}
async function copy(url){try{await navigator.clipboard.writeText(url);toast(t('copied'));}catch{toast(url);}}
function renderQueue(){
 const q=$('queue');q.replaceChildren();if(!files.length){q.textContent=t('queueEmpty');return;}
 for(const item of files){const row=document.createElement('div');row.className='queue-item';const title=document.createElement('strong');title.textContent=item.file.name;row.append(title);
 const status=document.createElement('div');const txt=document.createElement('span');
 txt.textContent=formatSize(item.file.size)+' · '+(item.error?errorMessage(new Error(item.error)):t({pending:'pending',uploading:'uploading',checking:'validating',ready:'ready',failed:'failed'}[item.status]));status.append(txt);
 if(item.url)status.append(button(t('copy'),()=>copy(item.url)));
 if(item.status==='failed'&&!busy)status.append(button(t('retry'),()=>runQueue([item])));
 row.append(status);if(['uploading','checking'].includes(item.status)){const p=document.createElement('progress');p.max=100;p.value=item.progress;row.append(p);}q.append(row);}
}
function sendFile(item,metadata){return new Promise((resolve,reject)=>{
 const form=new FormData();form.append('file',item.file);for(const [key,value]of Object.entries(metadata))form.append(key,value);
 const x=new XMLHttpRequest();x.open('POST','/api/upload');x.timeout=180000;
 x.upload.onprogress=e=>{if(e.lengthComputable){item.progress=Math.round(e.loaded/e.total*100);if(item.progress===100)item.status='checking';renderQueue();}};
 x.onload=()=>{let r;try{r=JSON.parse(x.responseText);}catch{reject(new Error('REQUEST_FAILED'));return;}if(x.status>=200&&x.status<300)resolve(r);else reject(new Error(r.error||'REQUEST_FAILED'));};
 x.onerror=x.ontimeout=()=>reject(new Error('REQUEST_FAILED'));x.send(form);
 });}
async function runQueue(items=files.filter(x=>x.status==='pending'||x.status==='failed')){
 if(busy||!visitorReady)return;if(!unlocked&&freeRemaining===0){openLogin();return;}busy=true;setAuth();
 const metadata={sku:$('sku').value};
 for(const item of items){
 item.error=null;item.status='uploading';item.progress=0;renderQueue();
 try{if(item.file.size>10000000)throw new Error('SIZE');if(!/\.pdf$/i.test(item.file.name))throw new Error('PDF');const result=await sendFile(item,metadata);item.status='ready';item.url=result.url;freeRemaining=result.freeRemaining??freeRemaining;}
 catch(e){item.status='failed';item.error=e.message;if(e.message==='LIMIT'){freeRemaining=0;break;}}renderQueue();
 }
 busy=false;setAuth();renderQueue();await loadRecords();if(!unlocked&&files.some(x=>x.error==='LIMIT'))openLogin();
}
$('start').onclick=()=>runQueue();
async function loadRecords(){try{const r=await api('/api/documents');records=r.documents;unlocked=r.unlocked;freeRemaining=r.freeRemaining;renderRecords();}catch(e){toast(errorMessage(e));}}
function renderRecords(){
 $('usage').textContent=unlocked?t('unlockedNotice'):t('remaining')+' '+freeRemaining+' / 3';
 const query=$('search').value.toLowerCase();const filtered=records.filter(r=>(r.name+' '+r.sku).toLowerCase().includes(query));const container=$('history');container.replaceChildren();
 if(!filtered.length){container.textContent=t('empty');return;}
 for(const r of filtered){
 const row=document.createElement('div');row.className='document-row';const name=document.createElement('div');const title=document.createElement('strong');title.textContent=r.name;name.append(title);
 const meta=document.createElement('small');meta.textContent=[r.sku,formatSize(r.size)].filter(Boolean).join(' · ');name.append(meta);row.append(name);
 const status=document.createElement('div');status.className='status'+(r.status==='ready'?' ready':'');status.textContent=t(r.status==='ready'?'ready':'checking');
 const time=document.createElement('small');time.textContent=r.checked_at?t('checkAt')+' '+new Date(r.checked_at).toLocaleString(lang==='zh'?'zh-CN':'en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}):t('noExpiry');status.append(time);row.append(status);
 const actions=document.createElement('div');actions.className='row-actions';
 if(r.status==='ready'&&r.url){actions.append(button(t('copy'),()=>copy(r.url)));const a=document.createElement('a');a.href=r.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=t('download');actions.append(a);}
 actions.append(button(t('check'),async e=>{try{await api('/api/documents/'+r.id+'/check',{method:'POST'});toast(t('checked'));await loadRecords();}catch(err){toast(errorMessage(err));}}));
 actions.append(button(t('remove'),async()=>{if(!confirm(t('deleteConfirm')))return;try{await api('/api/documents/'+r.id,{method:'DELETE'});await loadRecords();}catch(e){toast(errorMessage(e));}},'delete'));
 row.append(actions);container.append(row);
 }
}
$('search').oninput=renderRecords;$('refresh').onclick=loadRecords;
localize();
async function initialize(){
 const establish=async()=>{const r=await api('/api/session');unlocked=r.unlocked;freeRemaining=r.freeRemaining;visitorReady=true;setAuth();await loadRecords();};
 try{if(navigator.locks)await navigator.locks.request('pdf-link-visitor-init',establish);else await establish();}
 catch{toast(t('initializingFailed'));}
}
initialize();
