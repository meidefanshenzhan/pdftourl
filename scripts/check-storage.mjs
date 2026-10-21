import fs from 'node:fs/promises';
import {S3Client, HeadBucketCommand, GetBucketPolicyCommand, GetPublicAccessBlockCommand, GetBucketLifecycleConfigurationCommand} from '@aws-sdk/client-s3';
const a=JSON.parse(await fs.readFile(new URL('../.local/aws-config.json',import.meta.url),'utf8'));
const s3=new S3Client({region:a.AWS_REGION,credentials:{accessKeyId:a.AWS_ACCESS_KEY_ID,secretAccessKey:a.AWS_SECRET_ACCESS_KEY}});
for(const [name,command] of [
 ['bucket',new HeadBucketCommand({Bucket:a.S3_BUCKET})],
 ['policy',new GetBucketPolicyCommand({Bucket:a.S3_BUCKET})],
 ['public-access-block',new GetPublicAccessBlockCommand({Bucket:a.S3_BUCKET})],
 ['lifecycle',new GetBucketLifecycleConfigurationCommand({Bucket:a.S3_BUCKET})]
]){
 try {const r=await s3.send(command);if(name==='policy'){
 const p=JSON.parse(r.Policy);await fs.writeFile(new URL('../.local/bucket-policy.json',import.meta.url),JSON.stringify(p));
 console.log(JSON.stringify({check:name,status:'ok',statements:p.Statement?.map(s=>({effect:s.Effect,action:s.Action,resource:s.Resource,public:s.Principal==='*',hasCondition:!!s.Condition}))}));
 }else console.log(JSON.stringify({check:name,status:'ok',http:r.$metadata.httpStatusCode,configuration:r.PublicAccessBlockConfiguration,rules:r.Rules?.map(x=>({status:x.Status,expiration:x.Expiration,filter:x.Filter}))}));
 }catch(e){console.log(JSON.stringify({check:name,status:'failed',code:e.name,http:e.$metadata?.httpStatusCode}));}
}
