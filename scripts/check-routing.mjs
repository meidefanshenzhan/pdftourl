import fs from 'node:fs/promises';
const toml=await fs.readFile('C:/Users/Mei/AppData/Roaming/xdg.config/.wrangler/config/default.toml','utf8');
const token=toml.match(/^oauth_token\s*=\s*"([^"]+)"/m)[1];
for(const path of ['zones?name=pdftourl.online','accounts/63fbec92216620eb453d0def6257e0b8/workers/scripts/seller-pdf-links/subdomain']){
 const r=await fetch('https://api.cloudflare.com/client/v4/'+path,{headers:{Authorization:'Bearer '+token}});const j=await r.json();
 console.log(JSON.stringify({check:path,success:j.success,result:Array.isArray(j.result)?j.result.map(x=>({name:x.name,status:x.status,id:x.id})):j.result}));
}
