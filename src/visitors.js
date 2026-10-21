const encoder=new TextEncoder();
async function signingKey(secret){return crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);}
export async function identifyVisitor(req,env){
 const existing=req.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith('__Host-visitor='))?.slice(15);
 const key=await signingKey(env.SESSION_SECRET);
 if(existing){const [id,signature]=existing.split('.');
  if(/^[a-f0-9-]{36}$/.test(id)&&/^[a-f0-9]{64}$/.test(signature||'')&&existing.split('.').length===2){
   const ok=await crypto.subtle.verify('HMAC',key,Uint8Array.from(signature.match(/../g),x=>parseInt(x,16)),encoder.encode(id));
   if(ok)return{id,token:existing,fresh:false};
  }
 }
 const id=crypto.randomUUID(),signature=Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',key,encoder.encode(id))),x=>x.toString(16).padStart(2,'0')).join('');
 return{id,token:id+'.'+signature,fresh:true};
}
export function visitorCookie(token){return `__Host-visitor=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=31536000`;}
export async function reserveUpload(env,id,now=Date.now()){
 const row=await env.DB.prepare('INSERT INTO upload_windows(id,window_start,used) VALUES(?,?,1) ON CONFLICT(id) DO UPDATE SET used=CASE WHEN window_start<=? THEN 1 ELSE used+1 END, window_start=CASE WHEN window_start<=? THEN excluded.window_start ELSE window_start END WHERE used<3 OR window_start<=? RETURNING window_start').bind(id,now,now-3600000,now-3600000,now-3600000).first();
 return row?{start:row.window_start}:null;
}
export async function releaseUpload(env,id,start){await env.DB.prepare('UPDATE upload_windows SET used=MAX(0,used-1) WHERE id=? AND window_start=?').bind(id,start).run();}
export async function remainingUploads(env,id,now=Date.now()){
 const row=await env.DB.prepare('SELECT window_start,used FROM upload_windows WHERE id=?').bind(id).first();
 return !row||row.window_start<=now-3600000?3:Math.max(0,3-row.used);
}
