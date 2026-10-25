import test from 'node:test';import assert from 'node:assert/strict';
import {renderSiteFooter} from '../scripts/site-shell.mjs';
test('shared footer localizes contact and links to a secondary changelog',()=>{
 for(const lang of ['zh','en']){const html=renderSiteFooter(lang);assert.ok(html.includes('href="/'+lang+'/changelog/"'));assert.ok(html.includes(lang==='zh'?'>联系我们<':'>Contact Us<'));assert.ok(html.includes(lang==='zh'?'>更新日志<':'>Changelog<'));assert.ok(html.includes('KJAMZ'));}
});
