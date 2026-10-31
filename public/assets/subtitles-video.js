import {makeAss,displaySize,renderArgs} from './subtitles-video-core.js';
export function createVideoRenderer(onProgress=()=>{}){
 let engine=null,controller=null,cancelled=false;
 const progress=(phase,value)=>onProgress({phase,value});
 async function pieces(spec,signal){const result=[];let loaded=0;for(const part of spec.parts){const r=await fetch(part.url,{cache:'force-cache',signal});if(!r.ok)throw Error('ENGINE');const b=new Uint8Array(await r.arrayBuffer());if(b.length!==part.bytes)throw Error('ENGINE');const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',b)),x=>x.toString(16).padStart(2,'0')).join('');if(hash!==part.sha256)throw Error('ENGINE');result.push(b);loaded+=b.length;progress('loading',Math.round(loaded/spec.bytes*100));}return new Blob(result);}
 return{cancel(){cancelled=true;controller?.abort();engine?.terminate();},async render(file,cues,mode,size){
  cancelled=false;controller=new AbortController();let wasmURL=null;
  try{
   progress('loading',0);const [{FFmpeg},response]=await Promise.all([import('/assets/video-engine-v1/index.js'),fetch('/assets/video-engine-v1/manifest.json',{signal:controller.signal})]);if(!response.ok)throw Error('ENGINE');const manifest=await response.json();const [wasm,font]=await Promise.all([pieces(manifest.wasm,controller.signal),pieces(manifest.font,controller.signal)]);if(cancelled)throw Error('CANCELLED');
   wasmURL=URL.createObjectURL(new Blob([wasm],{type:'application/wasm'}));engine=new FFmpeg();await engine.load({coreURL:new URL('/assets/video-engine-v1/ffmpeg-core.js',location.origin).href,wasmURL});if(cancelled)throw Error('CANCELLED');
   await engine.createDir('/fonts');await engine.writeFile('/fonts/NotoSansCJKsc-Regular.otf',new Uint8Array(await font.arrayBuffer()));await engine.writeFile('input.media',new Uint8Array(await file.arrayBuffer()));
   const code=await engine.ffprobe(['-v','error','-show_entries','format=duration:stream=codec_type,width,height,sample_aspect_ratio:stream_side_data=rotation','-of','json','input.media','-o','probe.json']);// Some core builds return -1 after writing valid ffprobe JSON; validate the output itself.
   const meta=JSON.parse(new TextDecoder().decode(await engine.readFile('probe.json'))),v=meta.streams?.find(s=>s.codec_type==='video'),audio=meta.streams?.some(s=>s.codec_type==='audio'),duration=Number(meta.format?.duration);if(!audio||!Number.isFinite(duration)||duration<.1||duration>300)throw Error('DURATION');let w=v?.width,h=v?.height;const rotation=Number(v?.side_data_list?.[0]?.rotation)||0;const dims=displaySize(w,h,v?.sample_aspect_ratio,rotation);
   await engine.writeFile('captions.ass',new TextEncoder().encode(makeAss(cues,mode,dims.width,dims.height,size)));
   engine.on('progress',({time})=>{if(Number.isFinite(time))progress('rendering',Math.max(0,Math.min(99,Math.round(time/1e6/duration*100))));});progress('rendering',0);
   const exit=await engine.exec(renderArgs({hasVideo:!!v,duration,...dims}),600000);if(exit!==0)throw Error('VIDEO_RENDER');if(cancelled)throw Error('CANCELLED');const data=await engine.readFile('output.mp4');if(data.length<100)throw Error('VIDEO_RENDER');progress('complete',100);return{blob:new Blob([data],{type:'video/mp4'}),...dims,duration,audioOnly:!v};
  }catch(e){if(cancelled||e.name==='AbortError')throw Error('CANCELLED');if(['DURATION','CUES','ENGINE'].includes(e.message))throw e;throw Error('VIDEO_RENDER',{cause:e});}
  finally{engine?.terminate();engine=null;controller=null;if(wasmURL)URL.revokeObjectURL(wasmURL);}
 }};
}
