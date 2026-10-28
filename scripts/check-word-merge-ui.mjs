import {chromium} from 'playwright';import fs from 'node:fs/promises';import assert from 'node:assert/strict';
const base=process.env.CHECK_BASE||'http://127.0.0.1:8787',dir='.local/word-merge-release';await fs.mkdir(dir,{recursive:true});const browser=await chromium.launch({channel:'chrome',headless:true}),context=await browser.newContext({acceptDownloads:true}),page=await context.newPage(),errors=[],requests=[];
page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push({url:r.url(),method:r.method(),body:r.postData()}));
const ready=()=>page.waitForFunction(()=>document.documentElement.dataset.mergeReady==='true');
async function generate(){await page.locator('#wmGenerate').click();await page.waitForFunction(()=>!document.getElementById('wmCsv').disabled);}
async function download(id){const [d]=await Promise.all([page.waitForEvent('download'),page.locator(id).click()]);return fs.readFile(await d.path(),'utf8');}
try{
 for(const lang of ['zh','en']){
  await page.goto(base+'/'+lang+'/word-merge/');await ready();assert.ok(await page.locator('#wmGenerate').isDisabled());
  await page.locator('#wmA').fill('red\nblue\nred');await page.locator('#wmB').fill('bag\nshoe');assert.equal(await page.locator('#wmEstimate').innerText(),'4');await generate();assert.equal(await page.locator('#wmOutput').inputValue(),'red bag\nred shoe\nblue bag\nblue shoe');
  assert.equal((await download('#wmTxt')).split('\n').length,4);assert.equal((await download('#wmCsv')).split('\r\n').length,5);
  await page.locator('#wmDedupe').uncheck();assert.ok(await page.locator('#wmCsv').isDisabled());assert.equal(await page.locator('#wmOutput').inputValue(),'');assert.equal(await page.locator('#wmEstimate').innerText(),'6');
  await page.locator('#wmOrder').selectOption('reverse');await page.locator('#wmSeparator').selectOption('custom');await page.locator('#wmCustom').fill('_');await page.locator('#wmPrefix').fill('buy ');await page.locator('#wmSuffix').fill(' now');await generate();assert.ok((await page.locator('#wmOutput').inputValue()).startsWith('buy bag_red now'));
  await page.locator('#wmThird').check();assert.ok(await page.locator('#wmGenerate').isDisabled());await page.locator('#wmC').fill('travel');await generate();assert.ok((await page.locator('#wmOutput').inputValue()).startsWith('buy travel_bag_red now'));
  await page.locator('#wmSample').click();assert.equal(await page.locator('#wmEstimate').innerText(),'8');await generate();assert.equal((await page.locator('#wmOutput').inputValue()).split('\n')[0],'waterproof backpack for hiking');
  for(const width of [390,1440]){await page.setViewportSize({width,height:1000});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:dir+'/merge-'+lang+'-'+width+(base.startsWith('https')?'-live':'')+'.png',fullPage:true});}
  for(const a of await page.locator('header nav a').all())assert.ok(await page.locator(await a.getAttribute('href')).count());
  await page.locator('#wmClear').click();assert.equal(await page.locator('#wmOutput').inputValue(),'');assert.ok(await page.locator('#wmCsv').isDisabled());
 }
 await page.locator('#wmThird').uncheck();await page.locator('#wmA').fill('<script>alert(1)</script>');await page.locator('#wmB').fill('bag');await generate();assert.equal(await page.locator('#wmOutput').inputValue(),'<script>alert(1)</script> bag');
 const list=Array.from({length:225},(_,i)=>'word'+i).join('\n');await page.locator('#wmA').fill(list);await page.locator('#wmB').fill(list);assert.ok(await page.locator('#wmError').isVisible());assert.ok(await page.locator('#wmGenerate').isDisabled());assert.ok(await page.locator('#wmCsv').isDisabled());
 await page.locator('#wmA').fill('a'.repeat(50001));assert.ok(await page.locator('#wmError').isVisible());
 assert.deepEqual(errors,[]);assert.equal(requests.some(r=>r.method!=='GET'||r.body||r.url.includes('/api/')),false);
 const report={time:new Date().toISOString(),base,pass:true,checks:'zh/en 2/3-list products, estimate, dedupe, reverse/custom/affixes, stale exports, full downloads, seller sample, desktop/mobile, literal HTML, limits, no input transmission',errors};await fs.writeFile(dir+'/ui-'+(base.startsWith('https')?'live':'local')+'.json',JSON.stringify(report,null,2));console.log(report);
}finally{await browser.close();}
