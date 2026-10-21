import fs from 'node:fs/promises';
const config = await fs.readFile('C:/Users/Mei/AppData/Roaming/xdg.config/.wrangler/config/default.toml', 'utf8');
const token = config.match(/^oauth_token\s*=\s*"([^"]+)"/m)?.[1];
if (!token) throw new Error('Cloudflare login missing');
const base = 'https://api.cloudflare.com/client/v4/accounts/63fbec92216620eb453d0def6257e0b8';
const headers = { Authorization: `Bearer ${token}` };
const response = await fetch(`${base}/workers/scripts/pdf-to-url-backend/settings`, { headers });
const result = await response.json();
if (!result.success) { console.log(JSON.stringify({stage:'settings', status:response.status, errors:result.errors?.map(x=>({code:x.code,message:x.message}))})); process.exit(1); }
const bindings = result.result.bindings || [];
const allowed = ['AWS_ACCESS_KEY_ID','AWS_SECRET_ACCESS_KEY','AWS_REGION','S3_BUCKET'];
const aws = Object.fromEntries(bindings.filter(x=>allowed.includes(x.name)&&x.type==='plain_text').map(x=>[x.name,x.text]));
await fs.mkdir('.local', { recursive: true });
await fs.writeFile('.local/aws-config.json', JSON.stringify(aws), {mode:0o600});
console.log(JSON.stringify({stage:'settings',bindings:bindings.map(x=>({name:x.name,type:x.type})),awsConfigComplete:allowed.every(k=>Boolean(aws[k])),region:aws.AWS_REGION,bucket:aws.S3_BUCKET}));
const source = await fetch(`${base}/workers/scripts/pdf-to-url-backend`, {headers});
if(source.ok) {
 const text = await source.text();
 await fs.writeFile('.local/old-worker-source.txt',text,{mode:0o600});
 console.log(JSON.stringify({stage:'old-source',savedPrivately:true,bytes:Buffer.byteLength(text),usesS3:/amazonaws|S3Client|aws4fetch|aws-sdk/.test(text)}));
}
