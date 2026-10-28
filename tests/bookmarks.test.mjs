import test from 'node:test';import assert from 'node:assert/strict';import {renderSiteFooter} from '../scripts/site-shell.mjs';
test('bookmarks have a localized secondary footer entrance',()=>{
 for(const lang of ['zh','en']){const html=renderSiteFooter(lang);assert.ok(html.includes('href="/'+lang+'/bookmarks/"'));assert.ok(html.includes(lang==='zh'?'>工具收藏<':'>Bookmarks<'));}
});
