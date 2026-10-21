import {PDFDocument} from 'pdf-lib';
export const MAX_BYTES=10_000_000;
export async function validatePdf(bytes){
 if(bytes.length>MAX_BYTES)throw new Error('SIZE');
 if(!bytes.length||new TextDecoder().decode(bytes.subarray(0,8)).indexOf('%PDF-')!==0)throw new Error('PDF');
 try{const doc=await PDFDocument.load(bytes,{updateMetadata:false,throwOnInvalidObject:true});
  if(doc.isEncrypted||doc.getPageCount()<1)throw new Error('PDF');
  return {pages:doc.getPageCount()};
 }catch{throw new Error('PDF');}
}
export function makeObjectKey(name){
 const clean=name.replace(/\.pdf$/i,'').replace(/[^a-zA-Z0-9_-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,70)||'document';
 return `seller-pdf-v2/${crypto.randomUUID()}/${clean}.pdf`;
}
export function directUrl(bucket,region,key){return `https://s3.${region}.amazonaws.com/${encodeURIComponent(bucket)}/${key.split('/').map(encodeURIComponent).join('/')}`;}
export async function sha256(bytes){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),x=>x.toString(16).padStart(2,'0')).join('');}
export async function readLimited(request,max){
 if(Number(request.headers.get('content-length')||0)>max)throw new Error('SIZE');
 const reader=request.body?.getReader();if(!reader)throw new Error('PDF');
 let size=0;const chunks=[];
 while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>max){await reader.cancel();throw new Error('SIZE');}chunks.push(value);}
 const data=new Uint8Array(size);let offset=0;for(const x of chunks){data.set(x,offset);offset+=x.length;}return data;
}
