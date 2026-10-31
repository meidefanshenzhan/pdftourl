import {imageInfo,dimensions,outputSettings,limits} from './image-compressor-core.js';
const encode=(canvas,mime,quality)=>new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('ENCODE')),mime,quality));
async function thumbnail(bitmap){const d=dimensions(bitmap.width,bitmap.height,360),c=document.createElement('canvas');c.width=d.width;c.height=d.height;try{c.getContext('2d').drawImage(bitmap,0,0,c.width,c.height);return await encode(c,'image/png');}finally{c.width=c.height=1;}}
export async function compressImage(file,{format='auto',quality=82,maxEdge=2000}={},cancelled=()=>false){
 if(file.size<=0||file.size>limits.file)throw Error('FILE_SIZE');
 const bytes=new Uint8Array(await file.arrayBuffer()),info=imageInfo(bytes);if(cancelled())throw Error('CANCELLED');
 const bitmap=await createImageBitmap(new Blob([bytes],{type:info.mime}),{imageOrientation:'from-image'});let canvas;
 try{
  if(bitmap.width*bitmap.height>limits.pixels||bitmap.width>limits.edge||bitmap.height>limits.edge)throw Error('PIXELS');
  if(cancelled())throw Error('CANCELLED');
  const size=dimensions(bitmap.width,bitmap.height,Number(maxEdge)),settings=outputSettings(info.mime,format,Number(quality));
  canvas=document.createElement('canvas');canvas.width=size.width;canvas.height=size.height;const context=canvas.getContext('2d');if(!context)throw Error('ENCODE');
  if(settings.mime==='image/jpeg'){context.fillStyle='#ffffff';context.fillRect(0,0,size.width,size.height);}
  context.imageSmoothingEnabled=true;context.imageSmoothingQuality='high';context.drawImage(bitmap,0,0,size.width,size.height);
  const blob=await encode(canvas,settings.mime,settings.quality);if(blob.type!==settings.mime)throw Error('ENCODE_FORMAT');if(blob.size>limits.file)throw Error('OUTPUT_SIZE');if(cancelled())throw Error('CANCELLED');
  const originalThumb=await thumbnail(bitmap),encoded=await createImageBitmap(blob);let outputThumb;try{outputThumb=await thumbnail(encoded);}finally{encoded.close();}
  return {blob,mime:blob.type,...size,inputWidth:bitmap.width,inputHeight:bitmap.height,originalThumb,outputThumb};
 }finally{bitmap.close();if(canvas)canvas.width=canvas.height=1;}
}
