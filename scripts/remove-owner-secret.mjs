import fs from 'node:fs/promises';
const toml=await fs.readFile('C:/Users/Mei/AppData/Roaming/xdg.config/.wrangler/config/default.toml','utf8');
const token=toml.match(/^oauth_token\s*=\s*"([^"]+)"/m)?.[1];
const r=await fetch('https://api.cloudflare.com/client/v4/accounts/63fbec92216620eb453d0def6257e0b8/workers/scripts/seller-pdf-links/secrets/ADMIN_PASSWORD',{method:'DELETE',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'}});
const data=await r.json();console.log(JSON.stringify({removedLegacyOwnerPassword:data.success,status:r.status}));if(!data.success)process.exitCode=1;
