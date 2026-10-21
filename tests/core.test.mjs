import test from 'node:test';
import assert from 'node:assert/strict';
import {PDFDocument} from 'pdf-lib';
import {validatePdf,makeObjectKey,directUrl,MAX_BYTES} from '../src/core.js';
import {createSession,validSession} from '../src/auth.js';
import worker from '../src/worker.js';

test('rejects disguised and empty PDFs before publishing',async()=>{
 await assert.rejects(()=>validatePdf(new Uint8Array()),/PDF/);
 await assert.rejects(()=>validatePdf(new TextEncoder().encode('<html>error</html>')),/PDF/);
 await assert.rejects(()=>validatePdf(new TextEncoder().encode('%PDF-1.7\nnot a real PDF')),/PDF/);
});
test('accepts a parseable PDF and rejects bytes beyond the size cap',async()=>{
 const doc=await PDFDocument.create();doc.addPage();
 const bytes=await doc.save();assert.equal((await validatePdf(bytes)).pages,1);
 await assert.rejects(()=>validatePdf(new Uint8Array(MAX_BYTES+1)),/SIZE/);
});
test('same filenames produce distinct paths and cannot escape the managed prefix',()=>{
 const a=makeObjectKey('../../中文.pdf'),b=makeObjectKey('../../中文.pdf');
 assert.notEqual(a,b);assert.match(a,/^seller-pdf-v2\/[a-f0-9-]+\/[a-zA-Z0-9_-]+\.pdf$/);
 assert.ok(!a.includes('..'));
 assert.equal(directUrl('pdftourl.online','us-east-2','seller-pdf-v2/id/manual.pdf'),'https://s3.us-east-2.amazonaws.com/pdftourl.online/seller-pdf-v2/id/manual.pdf');
});
test('session rejects tampering, wrong secret, and expiry',async()=>{
 const s=await createSession('test-secret',1000);
 assert.equal(await validSession(s,'test-secret',1001),true);
 assert.equal(await validSession(s+'x','test-secret',1001),false);
 assert.equal(await validSession(s,'other',1001),false);
 assert.equal(await validSession(s,'test-secret',1000+43201),false);
});
test('cross-origin mutation is forbidden before any file or database operation',async()=>{
 const r=await worker.fetch(new Request('https://example.test/api/unlock',{method:'POST',headers:{Origin:'https://evil.test'}}),{},{});assert.equal(r.status,403);
});
