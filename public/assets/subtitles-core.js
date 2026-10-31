export function normalizeCues(rows,duration=300){
 if(!Array.isArray(rows)||!rows.length||rows.length>200)throw Error('CUES');let last=0,total=0;
 return rows.map(r=>{const start=Number(r.start),end=Number(r.end),text=String(r.text??'').replace(/\r/g,'').trim(),translation=String(r.translation??'').replace(/\r/g,'').trim();
 if(!Number.isFinite(start)||!Number.isFinite(end)||start<0||end<=start||start<last||end>duration+.1||!text||text.length>1500||translation.length>3000)throw Error('CUES');last=start;total+=text.length+translation.length;if(total>30000)throw Error('CUES');return{start,end,text,translation};});
}
export function stamp(seconds,vtt=false){const n=Math.round(seconds*1000);return [Math.floor(n/3600000),Math.floor(n/60000)%60,Math.floor(n/1000)%60].map(x=>String(x).padStart(2,'0')).join(':')+(vtt?'.':',')+String(n%1000).padStart(3,'0');}
export function exportSubtitles(rows,format='srt',mode='original'){
 const cues=normalizeCues(rows),vtt=format==='vtt';if(!['srt','vtt'].includes(format)||!['original','translation','bilingual'].includes(mode))throw Error('FORMAT');
 return(vtt?'WEBVTT\n\n':'')+cues.map((c,i)=>{let s=mode==='translation'?c.translation:mode==='bilingual'?[c.text,c.translation].filter(Boolean).join('\n'):c.text;if(!s)throw Error('TRANSLATION');s=s.replace(/\n\s*\n/g,'\n').replace(/-->/g,'→');if(vtt)s=s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');return(i+1)+'\n'+stamp(c.start,vtt)+' --> '+stamp(c.end,vtt)+'\n'+s+'\n';}).join('\n');
}
export function validateWav(bytes){
 if(bytes.length<44||bytes.length>9600044)throw Error('AUDIO');const v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),s=(i,n)=>String.fromCharCode(...bytes.slice(i,i+n));
 if(s(0,4)!=='RIFF'||s(8,4)!=='WAVE'||v.getUint32(4,true)!==bytes.length-8)throw Error('AUDIO');let fmt=false,data=0;
 for(let i=12;i+8<=bytes.length;){const n=v.getUint32(i+4,true);if(i+8+n>bytes.length)throw Error('AUDIO');if(s(i,4)==='fmt '){if(n<16||v.getUint16(i+8,true)!==1||v.getUint16(i+10,true)!==1||v.getUint32(i+12,true)!==16000||v.getUint32(i+16,true)!==32000||v.getUint16(i+20,true)!==2||v.getUint16(i+22,true)!==16)throw Error('AUDIO');fmt=true;}if(s(i,4)==='data')data+=n;i+=8+n+(n%2);}
 const sec=data/32000;if(!fmt||data%2||sec<.1||sec>300)throw Error('AUDIO');return sec;
}
export function encodeWav(buffer){const count=Math.ceil(buffer.duration*16000),bytes=new Uint8Array(44+count*2),v=new DataView(bytes.buffer);for(const[i,s]of[[0,'RIFF'],[8,'WAVE'],[12,'fmt '],[36,'data']])for(let j=0;j<s.length;j++)bytes[i+j]=s.charCodeAt(j);v.setUint32(4,bytes.length-8,true);v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,16000,true);v.setUint32(28,32000,true);v.setUint16(32,2,true);v.setUint16(34,16,true);v.setUint32(40,count*2,true);const channels=Array.from({length:buffer.numberOfChannels},(_,i)=>buffer.getChannelData(i));for(let i=0;i<count;i++){const x=Math.min(buffer.length-1,Math.floor(i*buffer.sampleRate/16000));let n=0;for(const c of channels)n+=c[x]/channels.length;n=Math.max(-1,Math.min(1,n));v.setInt16(44+i*2,n<0?n*32768:n*32767,true);}return bytes;}
