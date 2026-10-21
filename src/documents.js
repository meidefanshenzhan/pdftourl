import {remove,checkPublic} from './storage.js';
import {directUrl} from './core.js';
export async function deleteDocument(env,doc,removeFile=remove){
 const claim=await env.DB.prepare("UPDATE documents SET status='deleting' WHERE id=? AND status IN ('ready','needs_check')").bind(doc.id).run();
 if(!claim.meta.changes)return false;
 try{
  await removeFile(env,doc.object_key);
  await env.DB.batch([
   env.DB.prepare("UPDATE usage SET bytes=MAX(0,bytes-(SELECT size FROM documents WHERE id=? AND status='deleting')) WHERE id=1 AND EXISTS(SELECT 1 FROM documents WHERE id=? AND status='deleting')").bind(doc.id,doc.id),
   env.DB.prepare("DELETE FROM documents WHERE id=? AND status='deleting'").bind(doc.id)
  ]);return true;
 }catch(e){await env.DB.prepare("UPDATE documents SET status='needs_check' WHERE id=? AND status='deleting'").bind(doc.id).run();throw e;}
}
export async function recheckDocument(env,doc,checkFile=checkPublic){
 const claim=await env.DB.prepare("UPDATE documents SET status='rechecking' WHERE id=? AND status IN ('ready','needs_check')").bind(doc.id).run();
 if(!claim.meta.changes)return null;
 try{const result=await checkFile(env,doc.object_key,doc.sha256);const url=directUrl(env.S3_BUCKET,env.AWS_REGION,doc.object_key);
 await env.DB.prepare("UPDATE documents SET url=?,status='ready',checked_at=? WHERE id=? AND status='rechecking'").bind(url,result.checkedAt,doc.id).run();return {...result,url};
 }catch(e){await env.DB.prepare("UPDATE documents SET status='needs_check' WHERE id=? AND status='rechecking'").bind(doc.id).run();throw e;}
}
