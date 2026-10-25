import {chromium} from 'playwright';import fs from 'node:fs/promises';import assert from 'node:assert/strict';import {READ_KEY} from '../public/assets/release-state.js';
const base=process.env.CHECK_BASE||'http://127.0.0.1:8787',dir='.local/unread-updates-release';await fs.mkdir(dir,{recursive:true});const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext(),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
const ready=p=>p.waitForFunction(()=>document.documentElement.dataset.updatesReady==='true');
try{
 await page.goto(base+'/zh/');await ready(page);assert.ok(await page.locator('.update-badge').isVisible());assert.match(await page.locator('.changelog-link').getAttribute('aria-label'),/有新更新/);
 await page.locator('footer').scrollIntoViewIfNeeded();await page.screenshot({path:dir+'/marker-desktop.png'});
 const release=await page.locator('[data-release]').getAttribute('data-release');
 const second=await context.newPage();await second.goto(base+'/en/');await ready(second);assert.equal(await second.locator('.update-label').innerText(),'New');
 await page.locator('.changelog-link').click();await ready(page);assert.ok(await page.locator('.update-badge').isHidden());assert.equal(await page.evaluate(k=>localStorage.getItem(k),READ_KEY),release);
 await second.waitForFunction(()=>document.querySelector('.update-badge').hidden);await second.close();
 await page.goto(base+'/zh/text-dedupe/');await ready(page);assert.ok(await page.locator('.update-badge').isHidden());
 await page.evaluate(k=>localStorage.setItem(k,'previous-release'),READ_KEY);await page.reload();await ready(page);assert.ok(await page.locator('.update-badge').isVisible());
 await page.setViewportSize({width:390,height:844});await page.locator('footer').scrollIntoViewIfNeeded();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:dir+'/marker-mobile.png'});
 await page.goto(base+'/zh/pdf-to-link/');await ready(page);await page.waitForFunction(()=>typeof document.getElementById('locale').onclick==='function');await page.locator('#locale').click();await page.waitForFunction(()=>document.querySelector('.update-label').textContent==='New');assert.ok(await page.locator('.update-badge').isVisible());assert.equal(await page.locator('.changelog-label').innerText(),'Changelog');
 const blocked=await browser.newContext();await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('blocked','SecurityError');}}));const b=await blocked.newPage();b.on('pageerror',e=>errors.push(e.message));await b.goto(base+'/en/text-dedupe/');await ready(b);assert.ok(await b.locator('.update-badge').isHidden());await b.waitForFunction(()=>document.documentElement.dataset.dedupeReady==='true');await b.locator('#ddInput').fill('bag\nbag');await b.waitForFunction(()=>document.getElementById('ddOutput').value==='bag');await blocked.close();
 const readOnly=await browser.newContext();await readOnly.addInitScript(()=>{Storage.prototype.setItem=function(){throw new DOMException('quota','QuotaExceededError');};});const ro=await readOnly.newPage();await ro.goto(base+'/en/changelog/');await ready(ro);assert.ok(await ro.locator('.update-badge').isHidden());await readOnly.close();
 assert.deepEqual(errors,[]);const report={time:new Date().toISOString(),base,pass:true,release,checks:'new browser, open-to-read, navigation persistence, new release, cross-tab sync, English/Chinese PDF switch, mobile layout, blocked and read-only storage',errors};await fs.writeFile(dir+'/ui-'+(base.startsWith('https')?'live':'local')+'.json',JSON.stringify(report,null,2));console.log(report);
}finally{await browser.close();}
