import test from 'node:test';import assert from 'node:assert/strict';
import {unread,markRead,READ_KEY} from '../public/assets/release-state.js';
test('new browser and new releases are unread, opening marks current release',()=>{
 const map=new Map(),storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};
 assert.equal(unread(storage,'v1'),true);assert.equal(markRead(storage,'v1'),true);assert.equal(unread(storage,'v1'),false);assert.equal(unread(storage,'v2'),true);assert.equal(map.size,1);assert.equal(map.get(READ_KEY),'v1');
});
test('unavailable storage degrades to no badge and never throws',()=>{
 const storage={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};
 assert.equal(unread(storage,'v1'),false);assert.equal(markRead(storage,'v1'),false);assert.equal(unread(storage,''),false);
});
test('readable but read-only storage reports unsuccessful marking',()=>{
 const storage={getItem(){return null;},setItem(){throw Error('quota');}};
 assert.equal(unread(storage,'v1'),true);assert.equal(markRead(storage,'v1'),false);
});
