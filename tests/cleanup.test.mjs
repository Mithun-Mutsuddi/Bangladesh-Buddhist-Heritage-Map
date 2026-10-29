import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const load = file => JSON.parse(fs.readFileSync(new URL('../data/' + file, import.meta.url)));
test('gazetteer contains no repeated union in the same upazila', () => {
  for (const division of load('bd-geo.json')) for (const district of division.d) for (const upazila of district.u) {
    const unions = upazila.un || [];
    assert.equal(new Set(unions).size, unions.length, `${district.n}/${upazila.n}`);
  }
});
test('king sources contain no placeholder URLs and history sources have no exact duplicates', () => {
  for (const king of load('heritage-kings.json').kings) for (const source of king.sources || []) {
    assert.notEqual(source.url, 'url', king.name);
  }
  for (const dynasty of load('heritage-history.json').dynasties) {
    const sources = (dynasty.sources || []).map(source => JSON.stringify(source));
    assert.equal(new Set(sources).size, sources.length, dynasty.name);
  }
});

function worker() {
  const handlers = {}, deleted = [], added = [], stored = new Map();
  let calls = 0;
  const cache = {
    add: async req => { added.push(req.url); if (req.url.endsWith('/index.html')) throw Error('offline'); },
    match: async req => stored.get(typeof req === 'string' ? req : req.url),
    put: async (req, res) => { stored.set(req.url, res); }
  };
  const context = {
    URL, Request: class { constructor(u) { this.url = new URL(u, 'https://example.com/site/').href; } }, Response,
    self: { location: {origin:'https://example.com'}, registration:{scope:'https://example.com/site/'}, clients:{claim:async()=>{}}, skipWaiting:async()=>{}, addEventListener:(name, cb)=>handlers[name]=cb },
    caches: {open:async()=>cache, keys:async()=>['unrelated-app','charyabhumi-old','charyabhumi-v20261029-cleanup1'], delete:async key=>deleted.push(key)},
    fetch:async()=>{ calls++; return new Response('missing',{status:404}); },
    Promise
  };
  vm.runInNewContext(fs.readFileSync(new URL('../sw.js',import.meta.url),'utf8'),context);
  return {handlers, deleted, added, stored, getCalls:()=>calls};
}
test('service worker installs remaining files and only deletes its own old caches', async()=>{
  const w=worker(); let promise;
  w.handlers.install({waitUntil:p=>promise=p}); await promise;
  assert.ok(w.added.length>1);
  w.handlers.activate({waitUntil:p=>promise=p}); await promise;
  assert.deepEqual(w.deleted,['charyabhumi-old']);
});
test('service worker does not cache API or failed HTML and uses cache-first assets', async()=>{
  const w=worker(); const waiting=[];
  const request=(url,mode='cors')=>({url,mode,method:'GET'});
  let response;
  const dispatch=req=>w.handlers.fetch({request:req,respondWith:p=>response=p,waitUntil:p=>waiting.push(p)});
  dispatch(request('https://example.com/site/api/foo')); assert.equal(response,undefined);
  const doc=request('https://example.com/site/missing.html','navigate'); dispatch(doc);
  assert.equal((await response).status,404); await Promise.all(waiting); assert.equal(w.stored.size,0);
  const asset=request('https://example.com/site/a.css'); w.stored.set(asset.url,new Response('cached'));
  dispatch(asset); assert.equal(await (await response).text(),'cached'); assert.equal(w.getCalls(),1);
});
