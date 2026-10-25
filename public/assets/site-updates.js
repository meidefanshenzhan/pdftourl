import {unread,markRead,READ_KEY} from './release-state.js';
const link=document.querySelector('[data-release]');
if(link){
 const release=link.dataset.release;
 let storage;try{storage=window.localStorage;}catch{storage=null;}
 if(/^\/(?:zh|en)\/changelog\/$/.test(location.pathname)&&!markRead(storage,release))storage=null;
 function render(){const zh=document.documentElement.lang.startsWith('zh'),isUnread=unread(storage,release),label=zh?'更新日志':'Changelog',hint=zh?'有更新':'New';
  link.querySelector('.changelog-label').textContent=label;
  const badge=link.querySelector('.update-badge');badge.hidden=!isUnread;badge.querySelector('.update-label').textContent=hint;
  link.setAttribute('aria-label',label+(isUnread?(zh?'，有新更新':', new updates'):''));
 }
 render();window.addEventListener('storage',e=>{if(e.key===READ_KEY||e.key===null)render();});
 new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 document.documentElement.dataset.updatesReady='true';
}
