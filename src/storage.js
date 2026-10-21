import {S3Client,PutObjectCommand,DeleteObjectCommand} from '@aws-sdk/client-s3';
import {directUrl,sha256} from './core.js';
function client(env){return new S3Client({region:env.AWS_REGION,credentials:{accessKeyId:env.AWS_ACCESS_KEY_ID,secretAccessKey:env.AWS_SECRET_ACCESS_KEY},requestChecksumCalculation:'WHEN_REQUIRED'});}
export async function publish(env,key,bytes,hash){
 await client(env).send(new PutObjectCommand({Bucket:env.S3_BUCKET,Key:key,Body:bytes,ContentType:'application/pdf',ContentDisposition:'attachment; filename="document.pdf"',CacheControl:'no-store',Metadata:{sha256:hash}}));
 return directUrl(env.S3_BUCKET,env.AWS_REGION,key);
}
export async function checkPublic(env,key,expectedHash){
 const url=directUrl(env.S3_BUCKET,env.AWS_REGION,key);
 const r=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(20000),cache:'no-store'});
 if(r.status!==200||!r.headers.get('content-type')?.startsWith('application/pdf'))throw new Error('FETCH_CHECK');
 const content=await r.arrayBuffer();if(await sha256(content)!==expectedHash)throw new Error('FETCH_CHECK');
 return {status:r.status,checkedAt:new Date().toISOString()};
}
export async function remove(env,key){
 if(!/^seller-pdf-v2\/[a-f0-9-]+\/[a-zA-Z0-9_-]+\.pdf$/.test(key))throw new Error('KEY');
 await client(env).send(new DeleteObjectCommand({Bucket:env.S3_BUCKET,Key:key}));
}
