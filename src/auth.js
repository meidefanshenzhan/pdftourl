const enc=new TextEncoder();
async function key(secret){return crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);}
function hex(b){return Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('');}
export async function createSession(secret,now=Math.floor(Date.now()/1000),ttl=43200){
 const body=`${now+ttl}.${crypto.randomUUID()}`;
 return body+'.'+hex(await crypto.subtle.sign('HMAC',await key(secret),enc.encode(body)));
}
export async function validSession(token,secret,now=Math.floor(Date.now()/1000)){
 if(!token||!secret)return false;const p=token.split('.');if(p.length!==3||!/^\d+$/.test(p[0])||!/^\w[\w-]+$/.test(p[1])||!/^[a-f0-9]{64}$/.test(p[2]))return false;
 const expiry=Number(p[0]);if(expiry<=now||expiry>now+43200)return false;
 return crypto.subtle.verify('HMAC',await key(secret),Uint8Array.from(p[2].match(/../g),x=>parseInt(x,16)),enc.encode(p[0]+'.'+p[1]));
}
export function sessionCookie(req){return req.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith('__Host-owner='))?.slice(13)||'';}
export function cookie(token,max=43200){return `__Host-owner=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${max}`;}
export async function samePassword(given,want){
 if(typeof given!=='string'||!want||given.length>256)return false;
 const k=await key(want);const signature=await crypto.subtle.sign('HMAC',k,enc.encode(want));
 return crypto.subtle.verify('HMAC',k,signature,enc.encode(given));
}
