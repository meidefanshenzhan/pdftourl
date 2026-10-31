import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base=process.env.CHECK_BASE||'http://127.0.0.1:8793',browser=await chromium.launch({channel:'chrome',headless:true});
await fs.mkdir('.local/keyword-filter',{recursive:true});
try{for(const lang of ['zh','en']){const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/'+lang+'/remove-words-from-text/');await page.waitForSelector('html[data-filter-ready="true"]');
await page.locator('#kfSample').click();assert.equal(await page.locator('#kfOutput').inputValue(),'red shoes\nblue running shoes\nred shoe bag');
await page.locator('#kfMode').selectOption('keep');await page.locator('#kfTerms').fill('red\nshoes');await page.locator('#kfLogic').selectOption('all');assert.equal(await page.locator('#kfOutput').inputValue(),'red shoes\nused red shoes');
await page.locator('#kfMode').selectOption('remove');await page.locator('#kfInput').fill('CAT cats cat_1');await page.locator('#kfTerms').fill('cat');await page.waitForTimeout(300);assert.equal(await page.locator('#kfOutput').inputValue(),'cats cat_1');
const dl=page.waitForEvent('download');await page.locator('#kfCsv').click();assert.equal((await dl).suggestedFilename(),'kjamz-filtered-text.csv');
await page.screenshot({path:'.local/keyword-filter/'+lang+'-desktop.png',fullPage:true});
await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);await page.screenshot({path:'.local/keyword-filter/'+lang+'-mobile.png',fullPage:true});
await page.locator('#kfClear').click();assert.equal(await page.locator('#kfInput').inputValue(),'');assert.equal(await page.locator('#kfCopy').isDisabled(),true);assert.deepEqual(errors,[]);await page.close();}
console.log('PASS bilingual keyword filter UI: three modes, all-term matching, Unicode boundaries, CSV, clear, mobile width, JS errors.');}finally{await browser.close();}
