import {chromium} from 'playwright';import fs from 'node:fs/promises';import assert from 'node:assert/strict';
const base=process.env.CHECK_BASE||'http://127.0.0.1:8787',dir='.local/text-dedupe-release';
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({acceptDownloads:true});const page=await context.newPage(),errors=[],requests=[];
page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push({url:r.url(),method:r.method(),body:r.postData()}));
const ready=()=>page.waitForFunction(()=>document.documentElement.dataset.dedupeReady==='true');
async function download(id){const [d]=await Promise.all([page.waitForEvent('download'),page.locator(id).click()]);return fs.readFile(await d.path(),'utf8');}
try{
 for(const lang of ['zh','en']){
  await page.goto(base+'/'+lang+'/remove-duplicates/');await ready();
  await page.locator('#ddInput').fill('Hiking backpack\nwaterproof backpack\nhiking backpack ');await ready();
  assert.equal(await page.locator('#ddOutput').inputValue(),'Hiking backpack\nwaterproof backpack');
  assert.equal(await page.locator('#dd-removed').innerText(),'1');
  assert.equal(await download('#ddTxt'),'Hiking backpack\nwaterproof backpack');
  assert.equal((await download('#ddCsv')).split('\r\n').length,3);
  await page.locator('#ddIgnore').uncheck();assert.equal(await page.locator('#dd-kept').innerText(),'3');
  await page.locator('#ddIgnore').check();await page.locator('#ddMode').selectOption('words');
  assert.equal(await page.locator('#ddOutput').inputValue(),'Hiking backpack waterproof');
  await page.locator('#ddInput').fill('<script>alert(1)</script> <script>alert(1)</script>');await ready();
  assert.equal(await page.locator('#ddOutput').inputValue(),'<script>alert(1)</script>');
  await page.locator('#ddMode').selectOption('lines');await page.locator('#ddSample').click();
  for(const width of [390,1440]){await page.setViewportSize({width,height:1000});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:dir+'/dedupe-'+lang+'-'+width+(base.startsWith('https')?'-live':'')+'.png',fullPage:true});}
  for(const a of await page.locator('header nav a').all()){assert.ok(await page.locator(await a.getAttribute('href')).count());}
  await page.locator('#ddClear').click();assert.equal(await page.locator('#ddOutput').inputValue(),'');assert.ok(await page.locator('#ddCsv').isDisabled());
 }
 await page.locator('#ddInput').fill('a '.repeat(250001));await ready();assert.ok(await page.locator('#ddError').isVisible());assert.ok(await page.locator('#ddTxt').isDisabled());
 assert.deepEqual(errors,[]);assert.equal(requests.some(r=>r.method!=='GET'||r.body||r.url.includes('/api/')),false);
 const report={time:new Date().toISOString(),base,pass:true,checks:'zh/en modes, options, counts, TXT/CSV download, literal HTML, 390/1440 layout, nav, clear, input limit, no API/text transmission',errors};
 await fs.writeFile(dir+'/ui-'+(base.startsWith('https')?'live':'local')+'.json',JSON.stringify(report,null,2));console.log(report);
}finally{await browser.close();}
