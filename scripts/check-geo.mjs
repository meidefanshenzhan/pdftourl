import {sitePages} from './site-pages.mjs';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import worker from '../src/worker.js';
import {seoHashes} from '../src/seo-hashes.js';
const live=process.argv.includes('--live');const paths=sitePages.map(p=>p.path);
for(const p of paths){let html;if(live){const r=await fetch('https://kjamz.com'+p);assert.equal(r.status,200);html=await r.text();}else html=await fs.readFile('public'+p+'index.html','utf8');assert.equal((html.match(/rel="canonical"/g)||[]).length,1);assert.ok(html.includes('href="https://kjamz.com'+p+'"'));for(const lang of ['zh-CN','en','x-default'])assert.ok(html.includes('hreflang="'+lang+'"'));const data=html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1];assert.ok(JSON.parse(data)['@graph'].length>=3);assert.ok(seoHashes.includes(createHash('sha256').update(data).digest('base64')));if(p.includes('pdf-to-link')){assert.ok(html.includes(p.startsWith('/en')?'PDF to Link:':'PDF 转链接'));assert.equal(/id="(?:marketplace|language|documentType)"/.test(html),false);}if(p.includes('contact'))assert.equal(html.includes('mailto:'),false);}
let robots,sitemap;if(live){robots=await (await fetch('https://kjamz.com/robots.txt')).text();sitemap=await(await fetch('https://kjamz.com/sitemap.xml')).text();}else{robots=await fs.readFile('public/robots.txt','utf8');sitemap=await fs.readFile('public/sitemap.xml','utf8');}assert.match(robots,/User-agent: \*/);assert.match(robots,/Disallow: \/api\//);assert.equal((sitemap.match(/<loc>/g)||[]).length,sitePages.length);assert.equal(sitemap.includes('/api/'),false);
for(const host of ['www.kjamz.com','seller-pdf-links.zheciyaojizhuwqw.workers.dev']){const r=live?await fetch('https://'+host+'/en/pdf-to-link/',{redirect:'manual'}):await worker.fetch(new Request('https://'+host+'/en/pdf-to-link/'),{});assert.equal(r.status,301);assert.equal(r.headers.get('location'),'https://kjamz.com/en/pdf-to-link/');}
console.log('PASS GEO '+(live?'live':'local')+': '+sitePages.length+' pages, canonical, languages, JSON-LD/CSP, title, form privacy, sitemap, robots, host redirects');
