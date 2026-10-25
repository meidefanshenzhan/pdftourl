import {analyzeText} from './word-counter-core.js';
self.onmessage=({data})=>{try{self.postMessage({revision:data.revision,result:analyzeText(data.text,data.options)});}catch{self.postMessage({revision:data.revision,error:'ANALYSIS_FAILED'});}};
