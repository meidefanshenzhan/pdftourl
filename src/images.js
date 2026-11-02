import {S3Client,PutObjectCommand,GetObjectCommand,DeleteObjectCommand} from '@aws-sdk/client-s3';
import {imageInfo} from '../public/assets/image-compressor-core.js';
import {readLimited,sha256} from './core.js';
import {validSession,sessionCookie} from './auth.js';
export const IMAGE_MAX=5*1024**2,IMAGE_CAP=1_000_000_000;
export function imageDay(now=Date.now()){return new Date(now+8*3600000).toISOString().slice(0,10);}
export function imageRoute(path){return /^\/([a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}\.(?:jpg|png|webp))$/.exec(path)?.[1]||null;}
export function validateImage(bytes){if(!bytes.length||bytes.length>IMAGE_MAX)throw Error('SIZE');return imageInfo(bytes);}
const client=e=>new S3Client({region:e.IMAGE_AWS_REGION,credentials:{accessKeyId:e.IMAGE_AWS_ACCESS_KEY_ID,secretAccessKey:e.IMAGE_AWS_SECRET_ACCESS_KEY},requestChecksumCalculation:'WHEN_REQUIRED',maxAttempts:2});
const json=(d,s=200)=>Response.json(d,{status:s,headers:{'Cache-Control':'no-store'}});
async function bump(e,id,limit){return !!await e.DB.prepare('INSERT INTO image_limits(id,used) VALUES(?,1) ON CONFLICT(id) DO UPDATE SET used=used+1 WHERE used<? RETURNING used').bind(id,limit).first();}
async function release(e,id){await e.DB.prepare('UPDATE image_limits SET used=MAX(0,used-1) WHERE id=?').bind(id).run();}
export async function serveImage(req,e,id){if(!['GET','HEAD'].includes(req.method))return new Response(null,{status:405});const d=await e.DB.prepare("SELECT * FROM hosted_images WHERE id=? AND status='ready'").bind(id).first();if(!d)return new Response('Not found',{status:404,headers:{'Cache-Control':'no-store'}});if(req.method==='HEAD')return new Response(null,{headers:{'Content-Type':d.mime,'Content-Length':String(d.size),'Cache-Control':'no-store','X-Robots-Tag':'noindex','X-Content-Type-Options':'nosniff'}});try{const r=await client(e).send(new GetObjectCommand({Bucket:e.IMAGE_S3_BUCKET,Key:d.object_key}));return new Response(req.method==='HEAD'?null:r.Body.transformToWebStream(),{headers:{'Content-Type':d.mime,'Content-Length':String(d.size),'Content-Disposition':'inline','X-Content-Type-Options':'nosniff','Cache-Control':'no-store','X-Robots-Tag':'noindex','Content-Security-Policy':"default-src 'none'; sandbox"}});}catch{return new Response('Unavailable',{status:502,headers:{'Cache-Control':'no-store'}});}}
export async function handleImages(req,e,v){
 const path=new URL(req.url).pathname,unlocked=await validSession(sessionCookie(req),e.SESSION_SECRET+v.id),day=imageDay(),daily='day:'+day+':'+v.id;
 if(!e.IMAGE_S3_BUCKET||!e.IMAGE_AWS_ACCESS_KEY_ID||!e.IMAGE_AWS_SECRET_ACCESS_KEY)return json({error:'NOT_CONFIGURED'},503);
 if(path==='/api/images'&&req.method==='GET'){const {results}=await e.DB.prepare("SELECT id,name,size,width,height,created_at FROM hosted_images WHERE owner_id=? AND status='ready' ORDER BY created_at DESC LIMIT 100").bind(v.id).all();const r=await e.DB.prepare('SELECT used FROM image_limits WHERE id=?').bind(daily).first();return json({images:results.map(d=>({...d,url:'https://kjamz.com/'+d.id})),unlocked,remaining:Math.max(0,10-(r?.used||0))});}
 if(path==='/api/images'&&req.method==='POST'){
 let slot=false,reserved=false,written=false,row=false,success=false,id,key,data;try{
 const minute=Math.floor(Date.now()/60000);await e.DB.prepare("DELETE FROM image_limits WHERE id LIKE 'net:%' AND CAST(substr(id,5,instr(substr(id,5),':')-1) AS INTEGER)<?").bind(minute-60).run();await e.DB.prepare("DELETE FROM image_limits WHERE id LIKE 'day:%' AND substr(id,5,10)<?").bind(imageDay(Date.now()-7*86400000)).run();const ip=await sha256(new TextEncoder().encode(req.headers.get('cf-connecting-ip')||'local'));
 if(!await bump(e,'net:'+minute+':'+ip,30))return json({error:'RATE'},429);
 data=await readLimited(req,IMAGE_MAX);const info=validateImage(data),ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[info.mime];
 if(!unlocked){slot=await bump(e,daily,10);if(!slot)return json({error:'LIMIT'},429);}
 const capacity=await e.DB.prepare('UPDATE image_usage SET bytes=bytes+? WHERE id=1 AND paused=0 AND bytes+?<=?').bind(data.length,data.length,IMAGE_CAP).run();if(!capacity.meta.changes)return json({error:'CAPACITY'},409);reserved=true;
 id=crypto.randomUUID()+'.'+ext;key=id;
 const name=(req.headers.get('X-Image-Name')||'image').slice(0,600);let decoded;try{decoded=decodeURIComponent(name).slice(0,200);}catch{decoded='image.'+ext;}
 await e.DB.prepare('INSERT INTO hosted_images(id,owner_id,object_key,name,size,mime,width,height,created_at) VALUES(?,?,?,?,?,?,?,?,?)').bind(id,v.id,key,decoded,data.length,info.mime,info.width,info.height,new Date().toISOString()).run();row=true;
 // Set before awaiting: a failed response may still have stored the object.
 written=true;await client(e).send(new PutObjectCommand({Bucket:e.IMAGE_S3_BUCKET,Key:key,Body:data,ContentType:info.mime,CacheControl:'no-store'}));
 await e.DB.prepare("UPDATE hosted_images SET status='ready' WHERE id=?").bind(id).run();success=true;return json({id,url:'https://kjamz.com/'+id},201);
 }catch(err){return json({error:['SIZE','FORMAT','PIXELS','ANIMATED'].includes(err.message)?err.message:'UPLOAD'},['SIZE','FORMAT','PIXELS','ANIMATED'].includes(err.message)?400:502);}
 finally{if(!success){let clean=!written;if(written){try{await client(e).send(new DeleteObjectCommand({Bucket:e.IMAGE_S3_BUCKET,Key:key}));clean=true;}catch{}}if(clean){if(row)await e.DB.prepare('DELETE FROM hosted_images WHERE id=?').bind(id).run();if(reserved)await e.DB.prepare('UPDATE image_usage SET bytes=MAX(0,bytes-?) WHERE id=1').bind(data.length).run();}if(slot)await release(e,daily);}}
 }
 const id=path.slice('/api/images/'.length);if(path.startsWith('/api/images/')&&req.method==='DELETE'&&imageRoute('/'+id)){
 const d=await e.DB.prepare('SELECT * FROM hosted_images WHERE id=? AND owner_id=?').bind(id,v.id).first();if(!d)return json({error:'NOT_FOUND'},404);
 const lock=await e.DB.prepare("UPDATE hosted_images SET status='deleting' WHERE id=? AND owner_id=? AND status IN ('ready','pending') RETURNING id").bind(id,v.id).first();if(!lock)return json({error:'BUSY'},409);
 try{await client(e).send(new DeleteObjectCommand({Bucket:e.IMAGE_S3_BUCKET,Key:d.object_key}));await e.DB.batch([e.DB.prepare('DELETE FROM hosted_images WHERE id=? AND owner_id=?').bind(id,v.id),e.DB.prepare('UPDATE image_usage SET bytes=MAX(0,bytes-?) WHERE id=1').bind(d.size)]);return json({ok:true});}catch{await e.DB.prepare("UPDATE hosted_images SET status='ready' WHERE id=?").bind(id).run();return json({error:'DELETE'},502);}
 }return json({error:'NOT_FOUND'},404);
}
